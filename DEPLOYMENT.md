# Vercel Deployment Guide for FunFinity Academy

## Prerequisites

- Vercel account (free tier works)
- GitHub repository with your code
- Supabase project with database setup

## Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository containing FunFinity Academy

## Step 2: Configure Build Settings

Vercel will automatically detect the `vercel.json` configuration. Verify these settings:

**Build Command:** `cd frontend && npm run build`
**Output Directory:** `frontend/dist`
**Install Command:** `cd frontend && npm install`
**Framework:** Vite

## Step 3: Set Environment Variables

In Vercel project settings → Environment Variables, add the following:

### Required Variables

```
VITE_SUPABASE_URL=https://rwknajizufhqbcypjomj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3a25haml6dWZocWJjeXBqb21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzkwOTAsImV4cCI6MjA5NjUxNTA5MH0.fWacb7SOaxz6j-EeR0rjbNBkbIKPkyHXby8orbf7Wek
```

### Optional Variables (if needed)

```
VITE_ADMIN_PASSWORD=your_secure_password
VITE_OPENAI_API_KEY=your_openai_key
VITE_VERCEL_ANALYTICS_ID=your_analytics_id
```

## Step 4: Configure Custom Domain

1. Go to project settings → Domains
2. Add domain: `funfinityacademy.vercel.app`
3. Vercel will automatically configure DNS

## Step 5: Deploy

1. Click "Deploy" button
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://funfinityacademy.vercel.app`

## Step 6: Database Setup

Before the app works properly, you need to set up your Supabase database:

1. Go to your Supabase project SQL Editor
2. Run `ffamaster.sql` to set up the base schema
3. Run `rls-policies.sql` to set up Row-Level Security
4. (Optional) Run `coppa-schema.sql` if you need COPPA compliance

## Step 7: Test the Deployment

1. Visit `https://funfinityacademy.vercel.app`
2. Test sign up functionality
3. Test sign in functionality
4. Verify all pages load correctly

## Troubleshooting

### Build Fails

- Check that Node.js version is 18+ in Vercel settings
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Environment Variables Not Working

- Ensure variables are set in the correct environment (Production)
- Variables must start with `VITE_` to be available in the frontend
- Redeploy after adding environment variables

### Database Connection Issues

- Verify Supabase URL and anon key are correct
- Check Supabase project is active
- Ensure RLS policies allow anonymous access for public pages

### Images Not Loading

- Ensure `logo.png` is in the `frontend/public` folder
- Check that the file name matches exactly (case-sensitive)
- Verify the image is being referenced as `/logo.png` in components

## Continuous Deployment

Vercel will automatically redeploy when you push to your main branch. To enable:

1. Go to project settings → Git
2. Ensure "Production Branch" is set to `main` or `master`
3. Enable auto-deploy

## Production Checklist

- [ ] Environment variables configured
- [ ] Database schema installed
- [ ] RLS policies applied
- [ ] Custom domain configured
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Analytics enabled (optional)
- [ ] Error monitoring set up (optional)

## Monitoring

Vercel provides built-in monitoring:
- Analytics: View in Vercel dashboard
- Logs: View in Deployments tab
- Performance: Check Speed Insights
- Error tracking: Consider integrating Sentry

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify Supabase connection
4. Check environment variables are set correctly
