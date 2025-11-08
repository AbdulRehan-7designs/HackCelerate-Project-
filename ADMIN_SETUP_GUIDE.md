# Admin Setup Guide - Troubleshooting "User not allowed" Error

## Problem
When trying to create an admin account, you see the error: **"User not allowed"** or **"AuthApiError: User not allowed"**

## Root Cause
This error typically occurs when:
1. **Email confirmation is required** in Supabase settings
2. **Signups are disabled** in Supabase Authentication settings
3. **Email domain restrictions** are in place

## Solutions

### Solution 1: Disable Email Confirmation (Recommended for Development)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, find **"Enable email confirmations"**
4. **Disable** this option (toggle it off)
5. Save changes
6. Try creating the admin account again

### Solution 2: Enable Signups

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, ensure **"Enable email signup"** is enabled
4. Save changes
5. Try again

### Solution 3: Manual Admin Creation via Supabase Dashboard

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** or **"Invite user"**
4. Enter the admin email and password
5. Set user metadata:
   1
   ```
6. After user is created, go to **Table Editor** → **profiles**
7. Find the user's profile and set `is_admin = true`

### Solution 4: Register as Regular User, Then Promote

1. Go to `/register` and create a regular account
2. Log in with that account
3. Go to Supabase Dashboard → **Table Editor** → **profiles**
4. Find your user profile
5. Edit the row and set `is_admin = true`
6. Log out and log back in - you should now have admin access

### Solution 5: Use SQL to Create Admin

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query (replace with your details):

```sql
-- First, create the auth user (you'll need to do this via Supabase Dashboard Authentication)
-- Then update the profile:

UPDATE public.profiles
SET is_admin = true,
    username = 'your_username',
    full_name = 'Your Full Name'
WHERE id = 'YOUR_USER_ID_HERE';
```

## Quick Fix for Development

For local development, the easiest solution is:

1. **Disable email confirmation** in Supabase settings
2. **Enable email signup** if disabled
3. Try the setup again at `/setup-admin`

## Verification

After creating the admin account:
1. Log in at `/login`
2. You should be redirected to `/admin`
3. If not, check the browser console for errors
4. Verify in Supabase that `profiles.is_admin = true` for your user

## Still Having Issues?

If none of these solutions work:
1. Check the browser console for the exact error message
2. Verify your Supabase project is properly configured
3. Check that your Supabase URL and anon key are correct in `.env`
4. Ensure you have the correct Supabase project selected



