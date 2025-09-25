-- Content Storage Schema Extensions for Story 1.3
-- Extends the existing database schema with content management tables

-- Content Files table - stores metadata about uploaded files
CREATE TABLE IF NOT EXISTS content_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64), -- SHA-256 hash for deduplication
    storage_bucket VARCHAR(100) DEFAULT 'content',
    
    -- Content association
    programme_id UUID REFERENCES training_programmes(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    
    -- Metadata
    title VARCHAR(255),
    description TEXT,
    language VARCHAR(10) DEFAULT 'en',
    content_type VARCHAR(50), -- 'document', 'image', 'video', 'audio'
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'review', 'approved', 'published'
    
    -- Ownership and timestamps
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_content_type CHECK (content_type IN ('document', 'image', 'video', 'audio', 'other')),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
    CONSTRAINT valid_language CHECK (language IN ('en', 'nl', 'fr', 'zh-cn')),
    CONSTRAINT file_size_limit CHECK (file_size <= 104857600) -- 100MB limit
);

-- Content Versions table - tracks version history
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_file_id UUID REFERENCES content_files(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_hash VARCHAR(64),
    
    -- Change tracking
    change_summary TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_version CHECK (version_number > 0),
    UNIQUE(content_file_id, version_number)
);

-- Content Metadata table - additional properties and tags
CREATE TABLE IF NOT EXISTS content_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_file_id UUID REFERENCES content_files(id) ON DELETE CASCADE,
    
    -- Metadata properties
    tags TEXT[], -- Array of tags
    keywords TEXT[], -- Array of keywords for search
    duration_minutes INTEGER, -- For video/audio content
    page_count INTEGER, -- For document content
    resolution VARCHAR(20), -- For image/video content
    
    -- Learning metadata
    difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    learning_objectives TEXT[],
    prerequisites TEXT[],
    
    -- Custom properties (JSON for flexibility)
    custom_properties JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

-- Content Search View - optimized for search operations
CREATE OR REPLACE VIEW content_search AS
SELECT 
    cf.id,
    cf.filename,
    cf.original_filename,
    cf.title,
    cf.description,
    cf.content_type,
    cf.language,
    cf.status,
    cf.file_size,
    cf.mime_type,
    cf.created_at,
    cf.updated_at,
    
    -- Associated content info
    tp.title as programme_title,
    tp.client_id,
    c.title as course_title,
    m.title as module_title,
    u.title as unit_title,
    
    -- User info
    users.name as uploaded_by_name,
    
    -- Metadata
    cm.tags,
    cm.keywords,
    cm.difficulty_level,
    cm.learning_objectives,
    
    -- Search text (for full-text search)
    to_tsvector('english', 
        COALESCE(cf.title, '') || ' ' ||
        COALESCE(cf.description, '') || ' ' ||
        COALESCE(tp.title, '') || ' ' ||
        COALESCE(array_to_string(cm.tags, ' '), '') || ' ' ||
        COALESCE(array_to_string(cm.keywords, ' '), '')
    ) as search_vector
    
FROM content_files cf
LEFT JOIN training_programmes tp ON cf.programme_id = tp.id
LEFT JOIN courses c ON cf.course_id = c.id
LEFT JOIN modules m ON cf.module_id = m.id
LEFT JOIN units u ON cf.unit_id = u.id
LEFT JOIN users ON cf.uploaded_by = users.id
LEFT JOIN content_metadata cm ON cf.id = cm.content_file_id;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_files_programme ON content_files(programme_id);
CREATE INDEX IF NOT EXISTS idx_content_files_course ON content_files(course_id);
CREATE INDEX IF NOT EXISTS idx_content_files_module ON content_files(module_id);
CREATE INDEX IF NOT EXISTS idx_content_files_unit ON content_files(unit_id);
CREATE INDEX IF NOT EXISTS idx_content_files_status ON content_files(status);
CREATE INDEX IF NOT EXISTS idx_content_files_type ON content_files(content_type);
CREATE INDEX IF NOT EXISTS idx_content_files_language ON content_files(language);
CREATE INDEX IF NOT EXISTS idx_content_files_created ON content_files(created_at);
CREATE INDEX IF NOT EXISTS idx_content_files_uploaded_by ON content_files(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_content_versions_file ON content_versions(content_file_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_number ON content_versions(version_number);

CREATE INDEX IF NOT EXISTS idx_content_metadata_file ON content_metadata(content_file_id);
CREATE INDEX IF NOT EXISTS idx_content_metadata_tags ON content_metadata USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_metadata_keywords ON content_metadata USING GIN(keywords);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_content_search_vector ON content_files USING GIN(
    to_tsvector('english', 
        COALESCE(title, '') || ' ' ||
        COALESCE(description, '')
    )
);

-- Row Level Security (RLS) policies
ALTER TABLE content_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_metadata ENABLE ROW LEVEL SECURITY;

-- Content files policies
CREATE POLICY "Users can view content files based on role" ON content_files
    FOR SELECT USING (
        -- Admins can see everything
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        OR
        -- Composers and principals can see content from their organization
        (
            (SELECT role FROM users WHERE id = auth.uid()) IN ('composer', 'principal')
            AND
            programme_id IN (
                SELECT tp.id FROM training_programmes tp 
                JOIN users u ON u.organization = (SELECT organization FROM users WHERE id = auth.uid())
                WHERE tp.client_id = u.id OR tp.created_by = u.id
            )
        )
        OR
        -- Clients can see content assigned to them
        (
            (SELECT role FROM users WHERE id = auth.uid()) = 'client'
            AND
            programme_id IN (
                SELECT id FROM training_programmes WHERE client_id = auth.uid()
            )
        )
        OR
        -- Users can see content they uploaded
        uploaded_by = auth.uid()
    );

CREATE POLICY "Composers can create content files" ON content_files
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('composer', 'admin')
        AND uploaded_by = auth.uid()
    );

CREATE POLICY "Composers can update their content files" ON content_files
    FOR UPDATE USING (
        uploaded_by = auth.uid()
        OR
        (SELECT role FROM users WHERE id = auth.uid()) IN ('principal', 'admin')
    );

CREATE POLICY "Composers and principals can delete content files" ON content_files
    FOR DELETE USING (
        uploaded_by = auth.uid()
        OR
        (SELECT role FROM users WHERE id = auth.uid()) IN ('principal', 'admin')
    );

-- Content versions policies (similar to content files)
CREATE POLICY "Users can view content versions" ON content_versions
    FOR SELECT USING (
        content_file_id IN (SELECT id FROM content_files) -- Inherits from content_files policy
    );

CREATE POLICY "Users can create content versions" ON content_versions
    FOR INSERT WITH CHECK (
        changed_by = auth.uid()
        AND
        content_file_id IN (SELECT id FROM content_files WHERE uploaded_by = auth.uid())
    );

-- Content metadata policies (similar to content files)
CREATE POLICY "Users can view content metadata" ON content_metadata
    FOR SELECT USING (
        content_file_id IN (SELECT id FROM content_files) -- Inherits from content_files policy
    );

CREATE POLICY "Users can manage content metadata" ON content_metadata
    FOR ALL USING (
        content_file_id IN (
            SELECT id FROM content_files 
            WHERE uploaded_by = auth.uid()
            OR (SELECT role FROM users WHERE id = auth.uid()) IN ('principal', 'admin')
        )
    );

-- Functions for content management
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_content_files_updated_at
    BEFORE UPDATE ON content_files
    FOR EACH ROW
    EXECUTE FUNCTION update_content_updated_at();

CREATE TRIGGER update_content_metadata_updated_at
    BEFORE UPDATE ON content_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_content_updated_at();

-- Function to create new content version
CREATE OR REPLACE FUNCTION create_content_version(
    p_content_file_id UUID,
    p_file_path TEXT,
    p_file_size BIGINT,
    p_file_hash VARCHAR(64),
    p_change_summary TEXT,
    p_changed_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_version_number INTEGER;
    v_version_id UUID;
BEGIN
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO v_version_number
    FROM content_versions 
    WHERE content_file_id = p_content_file_id;
    
    -- Create new version
    INSERT INTO content_versions (
        content_file_id, version_number, file_path, file_size, 
        file_hash, change_summary, changed_by
    ) VALUES (
        p_content_file_id, v_version_number, p_file_path, p_file_size,
        p_file_hash, p_change_summary, p_changed_by
    ) RETURNING id INTO v_version_id;
    
    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for content search
CREATE OR REPLACE FUNCTION search_content(
    p_query TEXT DEFAULT '',
    p_content_type VARCHAR(50) DEFAULT NULL,
    p_language VARCHAR(10) DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT NULL,
    p_client_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    filename VARCHAR(255),
    content_type VARCHAR(50),
    language VARCHAR(10),
    status VARCHAR(20),
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    programme_title VARCHAR(255),
    uploaded_by_name VARCHAR(255),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id,
        cs.title,
        cs.description,
        cs.filename,
        cs.content_type,
        cs.language,
        cs.status,
        cs.file_size,
        cs.created_at,
        cs.programme_title,
        cs.uploaded_by_name,
        CASE 
            WHEN p_query = '' THEN 0::REAL
            ELSE ts_rank(cs.search_vector, plainto_tsquery('english', p_query))
        END as rank
    FROM content_search cs
    WHERE 
        (p_query = '' OR cs.search_vector @@ plainto_tsquery('english', p_query))
        AND (p_content_type IS NULL OR cs.content_type = p_content_type)
        AND (p_language IS NULL OR cs.language = p_language)
        AND (p_status IS NULL OR cs.status = p_status)
        AND (p_client_id IS NULL OR cs.client_id = p_client_id)
    ORDER BY 
        CASE WHEN p_query = '' THEN cs.created_at END DESC,
        CASE WHEN p_query != '' THEN rank END DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for development (optional)
-- INSERT INTO content_files (filename, original_filename, file_path, file_size, mime_type, title, description, content_type, uploaded_by)
-- SELECT 
--     'sample-document.pdf',
--     'Sample Training Document.pdf',
--     '/client/sample/programs/intro/sample-document.pdf',
--     1024000,
--     'application/pdf',
--     'Introduction to Course Tracker',
--     'A comprehensive guide to using the Course Tracker platform',
--     'document',
--     (SELECT id FROM users WHERE role = 'composer' LIMIT 1)
-- WHERE EXISTS (SELECT 1 FROM users WHERE role = 'composer');
