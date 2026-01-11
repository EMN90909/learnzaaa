-- Create lesson_views table for tracking
CREATE TABLE IF NOT EXISTS lesson_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lesson_views_learner ON lesson_views(learner_id);
CREATE INDEX IF NOT EXISTS idx_lesson_views_lesson ON lesson_views(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_views_viewed_at ON lesson_views(viewed_at);

-- Grant permissions
ALTER TABLE lesson_views ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert lesson views
CREATE POLICY "Allow authenticated users to insert lesson views"
ON lesson_views FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to read their own lesson views
CREATE POLICY "Allow authenticated users to read their own lesson views"
ON lesson_views FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) OR
  (learner_id IN (SELECT id FROM learners WHERE org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())))
);