
-- Check if the documents table exists
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id TEXT NOT NULL,
  movement_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies WHERE policyname = 'Anyone can view documents'
  ) THEN
    CREATE POLICY "Anyone can view documents"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies WHERE policyname = 'Authenticated users can upload documents'
  ) THEN
    CREATE POLICY "Authenticated users can upload documents"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies WHERE policyname = 'Authenticated users can update documents'
  ) THEN
    CREATE POLICY "Authenticated users can update documents"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies WHERE policyname = 'Authenticated users can delete documents'
  ) THEN
    CREATE POLICY "Authenticated users can delete documents"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'documents');
  END IF;
END $$;
