-- Add storage buckets for user profiles and subscription icons
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('user-avatars', 'user-avatars', true),
  ('subscription-icons', 'subscription-icons', true);

-- Create policies for user avatars bucket
CREATE POLICY "Users can view any avatar" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policies for subscription icons bucket  
CREATE POLICY "Users can view any subscription icon" ON storage.objects
FOR SELECT USING (bucket_id = 'subscription-icons');

CREATE POLICY "Users can upload their own subscription icons" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'subscription-icons' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own subscription icons" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'subscription-icons' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own subscription icons" ON storage.objects
FOR DELETE USING (
  bucket_id = 'subscription-icons' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add default_currency to profiles table
ALTER TABLE profiles ADD COLUMN default_currency TEXT DEFAULT 'USD';

-- Add icon_url to subscriptions table (if not already exists)
-- The subscriptions table already has icon_url column based on the types file, so no need to add it