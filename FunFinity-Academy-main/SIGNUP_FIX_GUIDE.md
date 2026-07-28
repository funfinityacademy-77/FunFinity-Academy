# Sign-Up Issue Fix Guide

## Current Status
- ✅ Source code restored from GitHub
- ✅ Database setup scripts copied to project root
- ✅ Verification SQL script created
- ❌ `.env` file has placeholder values (needs real Supabase credentials)

## Steps to Fix Sign-Up

### Step 1: Get Supabase Credentials
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Settings → API**
3. Copy these values:
   - **Project URL** (e.g., `https://abcxyz.supabase.co`)
   - **anon/public API Key** (long string starting with `eyJ...`)

### Step 2: Update .env File
Edit `frontend/.env` and replace the placeholders:

```bash
# Replace these with your actual values
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 3: Verify Database Setup
1. Go to your Supabase project → **SQL Editor**
2. Run the verification script: `SUPABASE_VERIFICATION.sql`
3. Check the results for any ✗ marks

### Step 4: Run Database Setup (if needed)
If verification shows missing tables or RLS issues:

1. Run `database-setup.sql` in Supabase SQL Editor
2. Run `rls-policies.sql` in Supabase SQL Editor

### Step 5: Enable Email Authentication
1. Go to **Authentication → Providers** in Supabase
2. Ensure **Email** provider is **enabled**
3. For testing, you can disable "Confirm email"
4. Check email templates are configured (optional)

### Step 6: Restart Development Server
```bash
cd frontend
npm run dev
```

### Step 7: Test Sign-Up
1. Open http://localhost:5173
2. Navigate to sign-up page
3. Enter test credentials:
   - Email: test@example.com
   - Password: Test123! (must have uppercase, lowercase, number, special char)
   - Name: Test User
4. Check browser console for errors

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Invalid login credentials" | Enable Email provider in Supabase Authentication settings |
| "User already registered" | Email already exists - try sign-in instead |
| "Profile not found" | Run database-setup.sql to create profiles table |
| RLS policy errors | Run rls-policies.sql to configure security policies |
| Connection timeout | Check VITE_SUPABASE_URL is correct in .env |

## Files Created for Reference
- `database-setup.sql` - Complete database schema
- `rls-policies.sql` - Row Level Security policies
- `SUPABASE_VERIFICATION.sql` - Database verification script

## Next Steps After Fix
Once sign-up works:
1. Test sign-in flow
2. Verify role-based routing (admin vs student)
3. Test onboarding flow
4. Verify profile creation in Supabase dashboard
