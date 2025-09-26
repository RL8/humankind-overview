-- Fix users table to remove default UUID generation
-- This allows us to insert specific UUIDs from Supabase Auth

-- First, check if the table exists and has the wrong default
DO $$
BEGIN
    -- Check if the id column has a default value
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'id' 
        AND column_default IS NOT NULL
    ) THEN
        -- Remove the default value
        ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
        RAISE NOTICE 'Removed default value from users.id column';
    ELSE
        RAISE NOTICE 'users.id column already has no default value';
    END IF;
END $$;

-- Verify the change
SELECT 
    column_name, 
    column_default, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'id';

