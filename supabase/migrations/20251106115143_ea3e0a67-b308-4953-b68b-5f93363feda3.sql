-- Fix data visibility and synchronization across all user roles

-- 1. Add teacher role to app_role enum if not exists
DO $$ BEGIN
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'teacher';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'parent';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Task Submissions - Teachers and Admins should see submissions from their batches
DROP POLICY IF EXISTS "Teachers can view submissions in their batches" ON task_submissions;
CREATE POLICY "Teachers can view submissions in their batches"
ON task_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN batches b ON t.batch_id = b.id
    WHERE t.id = task_submissions.task_id
    AND b.teacher_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Teachers can grade submissions" ON task_submissions;
CREATE POLICY "Teachers can grade submissions"
ON task_submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN batches b ON t.batch_id = b.id
    WHERE t.id = task_submissions.task_id
    AND b.teacher_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Test Marks - Teachers should manage marks for their batches
DROP POLICY IF EXISTS "Teachers can manage test marks for their batches" ON test_marks;
CREATE POLICY "Teachers can manage test marks for their batches"
ON test_marks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tests t
    JOIN batches b ON t.batch_id = b.id
    WHERE t.id = test_marks.test_id
    AND b.teacher_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Tests - Teachers should manage tests for their batches
DROP POLICY IF EXISTS "Teachers can manage tests for their batches" ON tests;
CREATE POLICY "Teachers can manage tests for their batches"
ON tests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM batches
    WHERE batches.id = tests.batch_id
    AND batches.teacher_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 5. Attendance - Teachers should manage attendance for their batches
DROP POLICY IF EXISTS "Teachers can manage attendance for their batches" ON attendance;
CREATE POLICY "Teachers can manage attendance for their batches"
ON attendance
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN batches b ON s.batch_id = b.id
    WHERE s.id = attendance.student_id
    AND b.teacher_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 6. Classes - Teachers should manage classes for their batches
DROP POLICY IF EXISTS "Teachers can manage classes for their batches" ON classes;
CREATE POLICY "Teachers can manage classes for their batches"
ON classes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM batches
    WHERE batches.id = classes.batch_id
    AND batches.teacher_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 7. Class Notes - Teachers can upload notes for their batches
DROP POLICY IF EXISTS "Teachers can manage notes for their batches" ON class_notes;
CREATE POLICY "Teachers can manage notes for their batches"
ON class_notes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes c
    JOIN batches b ON c.batch_id = b.id
    WHERE c.id = class_notes.class_id
    AND b.teacher_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 8. Tasks - Teachers can manage tasks for their batches
DROP POLICY IF EXISTS "Teachers can manage tasks for their batches" ON tasks;
CREATE POLICY "Teachers can manage tasks for their batches"
ON tasks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM batches
    WHERE batches.id = tasks.batch_id
    AND batches.teacher_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 9. Parent Policies - Parents can view their children's data
DROP POLICY IF EXISTS "Parents can view their children's attendance" ON attendance;
CREATE POLICY "Parents can view their children's attendance"
ON attendance
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = attendance.student_id
    AND students.parent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can view their children's test marks" ON test_marks;
CREATE POLICY "Parents can view their children's test marks"
ON test_marks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = test_marks.student_id
    AND students.parent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can view their children's fees" ON fees;
CREATE POLICY "Parents can view their children's fees"
ON fees
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = fees.student_id
    AND students.parent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can view their children's task submissions" ON task_submissions;
CREATE POLICY "Parents can view their children's task submissions"
ON task_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = task_submissions.student_id
    AND students.parent_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can view their children's student data" ON students;
CREATE POLICY "Parents can view their children's student data"
ON students
FOR SELECT
TO authenticated
USING (
  auth.uid() = parent_id
  OR auth.uid() = id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 10. Teachers can view students in their batches
DROP POLICY IF EXISTS "Teachers can view students in their batches" ON students;
CREATE POLICY "Teachers can view students in their batches"
ON students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM batches
    WHERE batches.id = students.batch_id
    AND batches.teacher_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR auth.uid() = id
  OR auth.uid() = parent_id
);