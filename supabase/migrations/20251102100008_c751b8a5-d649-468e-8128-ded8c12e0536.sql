-- Add grade column to task_submissions table
ALTER TABLE public.task_submissions 
ADD COLUMN grade numeric;

COMMENT ON COLUMN public.task_submissions.grade IS 'Grade given by teacher for the submission';