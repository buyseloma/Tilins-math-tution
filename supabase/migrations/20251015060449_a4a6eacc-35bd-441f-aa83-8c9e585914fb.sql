-- CRITICAL SECURITY FIX: Move roles to separate table to prevent privilege escalation

-- Create app_role enum (different from user_role to avoid conflicts)
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'parent', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Migrate existing role data from profiles to user_roles (string matching)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE role::text
    WHEN 'admin' THEN 'admin'::app_role
    WHEN 'teacher' THEN 'teacher'::app_role
    WHEN 'parent' THEN 'parent'::app_role
    WHEN 'student' THEN 'student'::app_role
  END
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- RLS Policy for user_roles (users can view their own roles)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Update RLS policies for admin-only tables using the has_role function
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events"
ON public.events
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage events"
ON public.events
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Batches policies
DROP POLICY IF EXISTS "Anyone authenticated can view batches" ON public.batches;
CREATE POLICY "Anyone authenticated can view batches"
ON public.batches
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage batches"
ON public.batches
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Classes policies
CREATE POLICY "Admins can manage classes"
ON public.classes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Class notes policies  
CREATE POLICY "Admins can manage class notes"
ON public.class_notes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Tasks policies
CREATE POLICY "Admins can manage tasks"
ON public.tasks
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Testimonials policies
CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Fees policies
CREATE POLICY "Admins can manage fees"
ON public.fees
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Tests policies
CREATE POLICY "Admins can manage tests"
ON public.tests
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Test marks policies
CREATE POLICY "Admins can manage test marks"
ON public.test_marks
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Attendance policies
CREATE POLICY "Admins can manage attendance"
ON public.attendance
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Admins can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students policies
CREATE POLICY "Admins can view all students"
ON public.students
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage students"
ON public.students
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));