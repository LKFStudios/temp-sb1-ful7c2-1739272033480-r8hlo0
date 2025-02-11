/*
  # Add storage bucket for analysis images

  1. Storage
    - Create public bucket for analysis images
    - Set up storage policies
    
  2. Security
    - Enable authenticated uploads
    - Allow public access for shared images
*/

-- Enable storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('analyses', 'analyses', true);

-- Storage policies for analyses bucket
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'analyses' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view uploaded images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'analyses');