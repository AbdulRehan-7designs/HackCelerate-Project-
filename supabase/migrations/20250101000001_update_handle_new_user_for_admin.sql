-- Update the handle_new_user function to support admin and official roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, is_admin, is_official)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'is_official')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    is_admin = COALESCE(EXCLUDED.is_admin, profiles.is_admin),
    is_official = COALESCE(EXCLUDED.is_official, profiles.is_official);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



