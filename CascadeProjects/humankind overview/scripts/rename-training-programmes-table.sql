-- Rename training_programmes table to training_programs
-- This fixes the mismatch between database schema and application code

ALTER TABLE public.training_programmes RENAME TO training_programs;

-- Update any foreign key references if they exist
-- (This is just in case there are other tables referencing the old name)
-- You may need to run these if there are foreign key constraints:

-- If there are any views that reference the old table name, they will need to be recreated
-- If there are any stored procedures or functions, they may need to be updated

-- Verify the rename was successful
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('training_programmes', 'training_programs');
