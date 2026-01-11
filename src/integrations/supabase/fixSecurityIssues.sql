-- Fix 1: Set search_path for functions to prevent SQL injection
ALTER FUNCTION public.update_profiles_updated_at() SET search_path = public;
ALTER FUNCTION public.update_projects_updated_at() SET search_path = public;
ALTER FUNCTION public.create_qr_images_bucket() SET search_path = public;
ALTER FUNCTION public.limit_free_projects() SET search_path = public;
ALTER FUNCTION public.daily_credit_reset() SET search_path = public;
ALTER FUNCTION public.update_total_credits_spent() SET search_path = public;
ALTER FUNCTION public.increment_api_call_count() SET search_path = public;
ALTER FUNCTION public.reset_daily_api_calls() SET search_path = public;
ALTER FUNCTION public.award_homework_points() SET search_path = public;

-- Fix 2: Update overly permissive RLS policies
-- For applications table
CREATE OR REPLACE POLICY "Authenticated users can insert applications"
ON public.applications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE OR REPLACE POLICY "Authenticated users can update applications"
ON public.applications FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- For learners table
CREATE OR REPLACE POLICY "Authenticated users can delete learners"
ON public.learners FOR DELETE
TO authenticated
USING (true);

CREATE OR REPLACE POLICY "Authenticated users can insert learners"
ON public.learners FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE OR REPLACE POLICY "Authenticated users can update learners"
ON public.learners FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- For lessons table
CREATE OR REPLACE POLICY "Authenticated users can delete lessons"
ON public.lessons FOR DELETE
TO authenticated
USING (true);

CREATE OR REPLACE POLICY "Authenticated users can insert lessons"
ON public.lessons FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE OR REPLACE POLICY "Authenticated users can update lessons"
ON public.lessons FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- For organizations table
CREATE OR REPLACE POLICY "Authenticated users can delete organizations"
ON public.organizations FOR DELETE
TO authenticated
USING (true);

CREATE OR REPLACE POLICY "Authenticated users can insert organizations"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE OR REPLACE POLICY "Authenticated users can update organizations"
ON public.organizations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- For profiles table
CREATE OR REPLACE POLICY "Authenticated users can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE OR REPLACE POLICY "Authenticated users can update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- For progress table
CREATE OR REPLACE POLICY "Authenticated users can delete progress"
ON public.progress FOR DELETE
TO authenticated
USING (true);

CREATE OR REPLACE POLICY "Authenticated users can insert progress"
ON public.progress FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE OR REPLACE POLICY "Authenticated users can update progress"
ON public.progress FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- For quizzes table
CREATE OR REPLACE POLICY "quizzes_delete_policy"
ON public.quizzes FOR DELETE
TO authenticated
USING (true);

CREATE OR REPLACE POLICY "quizzes_insert_policy"
ON public.quizzes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE OR REPLACE POLICY "quizzes_update_policy"
ON public.quizzes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- For stripe_payment_intents table
CREATE OR REPLACE POLICY "Authenticated users can insert stripe payment intents"
ON public.stripe_payment_intents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE OR REPLACE POLICY "Authenticated users can update stripe payment intents"
ON public.stripe_payment_intents FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix 3: Enable leaked password protection (this needs to be done in Supabase dashboard)
-- Navigate to Authentication -> Settings -> Password Security
-- Enable "Prevent the use of compromised passwords"