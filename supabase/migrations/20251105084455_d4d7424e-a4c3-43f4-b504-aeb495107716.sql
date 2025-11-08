-- Create storage bucket for class notes PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'class-notes',
  'class-notes',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']::text[]
);

-- RLS policies for class-notes bucket
CREATE POLICY "Teachers and admins can upload notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'class-notes' 
  AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Teachers and admins can update notes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'class-notes' 
  AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Teachers and admins can delete notes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'class-notes' 
  AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Students can view notes for their batch classes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'class-notes'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'teacher'::app_role)
    OR EXISTS (
      SELECT 1 
      FROM students s
      JOIN classes c ON c.batch_id = s.batch_id
      JOIN class_notes cn ON cn.class_id = c.id
      WHERE s.id = auth.uid()
      AND storage.objects.name LIKE '%' || cn.id || '%'
    )
  )
);