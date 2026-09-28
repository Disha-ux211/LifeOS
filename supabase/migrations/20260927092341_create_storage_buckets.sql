/*
# LifeOS — Storage Buckets and Policies

Creates three private storage buckets:
1. diary-photos — photos attached to diary entries.
2. user-files — uploaded documents and files.
3. wardrobe-photos — clothing item photos.

Each bucket is private (not public) with RLS policies that allow
authenticated users to manage only files under their own user-id folder.
*/

INSERT INTO storage.buckets (id, name, public) VALUES
  ('diary-photos', 'diary-photos', false),
  ('user-files', 'user-files', false),
  ('wardrobe-photos', 'wardrobe-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Diary photos policies
DROP POLICY IF EXISTS "diary_photos_select_own" ON storage.objects;
CREATE POLICY "diary_photos_select_own" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "diary_photos_insert_own" ON storage.objects;
CREATE POLICY "diary_photos_insert_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "diary_photos_delete_own" ON storage.objects;
CREATE POLICY "diary_photos_delete_own" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- User files policies
DROP POLICY IF EXISTS "user_files_select_own" ON storage.objects;
CREATE POLICY "user_files_select_own" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "user_files_insert_own" ON storage.objects;
CREATE POLICY "user_files_insert_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "user_files_delete_own" ON storage.objects;
CREATE POLICY "user_files_delete_own" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Wardrobe photos policies
DROP POLICY IF EXISTS "wardrobe_photos_select_own" ON storage.objects;
CREATE POLICY "wardrobe_photos_select_own" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'wardrobe-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "wardrobe_photos_insert_own" ON storage.objects;
CREATE POLICY "wardrobe_photos_insert_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'wardrobe-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "wardrobe_photos_delete_own" ON storage.objects;
CREATE POLICY "wardrobe_photos_delete_own" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'wardrobe-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
