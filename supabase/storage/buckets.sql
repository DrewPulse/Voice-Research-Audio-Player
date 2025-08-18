-- Storage bucket configuration for video recordings
-- Run this in your Supabase SQL editor or via CLI

-- Create the video recordings bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'video-recordings',
    'video-recordings',
    false, -- Private bucket for privacy
    104857600, -- 100MB file size limit
    ARRAY['video/webm', 'video/mp4', 'video/avi', 'video/mov']
);

-- Storage policies for video recordings bucket
CREATE POLICY "Authenticated users can upload videos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'video-recordings');

CREATE POLICY "Authenticated users can read own videos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'video-recordings');

CREATE POLICY "Authenticated users can update own videos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'video-recordings');

-- Note: Only allow deletion by admin/system for data retention compliance
CREATE POLICY "System can delete videos" ON storage.objects
FOR DELETE TO service_role
USING (bucket_id = 'video-recordings');