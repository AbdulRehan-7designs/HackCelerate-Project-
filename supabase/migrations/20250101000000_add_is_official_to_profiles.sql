-- Add is_official column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;

-- Add email column if it doesn't exist (for easier querying)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster queries on official users
CREATE INDEX IF NOT EXISTS idx_profiles_is_official ON public.profiles(is_official) WHERE is_official = true;

-- Update RLS policy to allow admins to update any profile
CREATE POLICY IF NOT EXISTS "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Update RLS policy to allow admins to insert profiles
CREATE POLICY IF NOT EXISTS "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);



