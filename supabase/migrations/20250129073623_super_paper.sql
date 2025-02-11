-- Enable storage
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for analyses
INSERT INTO storage.buckets (id, name, public)
VALUES ('analyses', 'analyses', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to analyses bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'analyses' AND name LIKE 'public/%');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'analyses' AND name LIKE 'public/%');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'analyses' AND owner = auth.uid())
WITH CHECK (bucket_id = 'analyses' AND name LIKE 'public/%');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'analyses' AND owner = auth.uid());

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;