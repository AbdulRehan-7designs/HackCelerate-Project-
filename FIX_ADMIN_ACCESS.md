# Quick Fix: Access Admin Account

Since you already have an admin user in your `users` table, you don't need to create a new one. Here's how to access it:

## Option 1: Update Profiles Table (Recommended - 2 minutes)

1. **Go to Supabase Dashboard** → **Table Editor** → **profiles**
2. **Find your user** (search by email: `mohdrehan.07890@gmail.com`)
   - If the profile doesn't exist, click **"Insert"** to create one
3. **Set the following:**
   - `id`: Copy the ID from your `users` table (the UUID)
   - `username`: "Rehan" (or any username)
   - `full_name`: "Abdul Rehan"
   - `is_admin`: **true** (toggle it ON)
   - `is_official`: false
4. **Save**
5. **Log in** at `/login` with your email and password
6. You should now be redirected to `/admin`

## Option 2: Fix CORS and Use Setup Page

### Step 1: Fix CORS in Supabase

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Scroll to **"CORS Configuration"** or **"Allowed Origins"**
3. Add these origins:
   - `http://localhost:8080`
   - `http://localhost:5173` (if using Vite default port)
   - `http://localhost:3000` (if using other ports)
4. **Save changes**

### Step 2: Verify Authentication Settings

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**:
   - ✅ Enable **"Enable email signup"**
   - ⚠️ Disable **"Enable email confirmations"** (for development)
3. **Save changes**

### Step 3: Try Setup Again

1. Go to `/setup-admin`
2. Fill in the form
3. Click "Create Admin Account"

## Option 3: Use SQL to Create Profile (Fastest)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query (replace with your actual user ID from the `users` table):

```sql
-- First, get your user ID from the users table
-- Then run this:

INSERT INTO public.profiles (id, username, full_name, is_admin, is_official)
VALUES (
  'YOUR_USER_ID_FROM_USERS_TABLE',  -- Replace with actual UUID from users table
  'Rehan',
  'Abdul Rehan',
  true,
  false
)
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  username = 'Rehan',
  full_name = 'Abdul Rehan';
```

## Option 4: Just Log In (If Profile Exists)

If you already have a profile record:
1. Go to `/login`
2. Log in with `mohdrehan.07890@gmail.com`
3. The app will now check the `users` table for your role
4. You should be redirected to `/admin`

## Verify It Works

After any of the above:
1. Log out completely
2. Log in again at `/login`
3. Check browser console for any errors
4. You should be redirected to `/admin` dashboard

## Still Having Issues?

If you're still not recognized as admin:
1. Check browser console (F12) for errors
2. Verify in Supabase:
   - `users` table has `role = 'admin'` for your email
   - `profiles` table has `is_admin = true` for your user ID
3. Clear browser cache and cookies
4. Try logging in again



