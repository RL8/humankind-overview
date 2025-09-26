-- Course Tracker Database Schema
-- This file contains the complete database schema as specified in the architecture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('composer', 'principal', 'client', 'admin')),
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Training programmes table
CREATE TABLE IF NOT EXISTS training_programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published')),
  client_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID REFERENCES training_programmes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Units table
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('module', 'unit')),
  author_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_programmes_client_id ON training_programmes(client_id);
CREATE INDEX IF NOT EXISTS idx_training_programmes_created_by ON training_programmes(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_programme_id ON courses(programme_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_units_module_id ON units(module_id);
CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- Row Level Security (RLS) policies will be added here when implementing authentication
-- For now, we'll enable RLS but add policies later
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with updated_at columns
CREATE TRIGGER update_training_programmes_updated_at 
    BEFORE UPDATE ON training_programmes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at 
    BEFORE UPDATE ON modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

