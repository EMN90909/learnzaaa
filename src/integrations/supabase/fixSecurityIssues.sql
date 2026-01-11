-- Add image_url and parts columns to lessons table if they don't exist
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS parts INTEGER DEFAULT 1;

-- Create lesson_parts table for managing multi-part lessons
CREATE TABLE IF NOT EXISTS lesson_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  part_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lesson_id, part_number)
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_lesson_parts_updated_at
BEFORE UPDATE ON lesson_parts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add CSS for the lesson cards
COMMENT ON TABLE lessons IS 'Contains all lessons with support for images and multi-part lessons';
COMMENT ON TABLE lesson_parts IS 'Contains individual parts of multi-part lessons';