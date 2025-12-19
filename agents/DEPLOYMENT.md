# Render Deployment Guide

## Prerequisites
- GitHub repository with this code pushed
- Render account (free tier works)
- Production Supabase database URL (connection pooler)

## Step 1: Push to GitHub
```bash
cd /Users/albertojacini/Projects/pint
git add .
git commit -m "Add Render deployment configuration"
git push
```

## Step 2: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select the repository containing this code
5. Render will auto-detect `render.yaml` (at repository root) and create the service
   - The config tells Render to build from the `agents/` subdirectory

## Step 3: Set Environment Variables

In Render dashboard, go to your service → **Environment** and add:

### Required Variables

```
DATABASE_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```
**Get this from Supabase:**
- Go to Supabase Project Settings → Database
- Click "Connection Pooling" tab
- Copy the "Transaction" mode connection string
- Use port **6543** (not 5432)

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
**Get this from Supabase:**
- Go to Project Settings → API
- Copy "service_role" key (not anon key)

```
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
BRIGHTDATA_API_KEY=...
```

```
FRONTEND_URL=https://your-app.vercel.app
```
**Your Vercel production URL** (get after deploying Next.js app)

### Optional (LangSmith Tracing)

```
LANGSMITH_API_KEY=lsv2_pt_...
```

## Step 4: Deploy

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for build to complete (3-5 minutes)
3. Check logs for any errors

## Step 5: Test the API

Once deployed, Render will give you a URL like: `https://pint-agents.onrender.com`

Test the health endpoint:
```bash
curl https://pint-agents.onrender.com/health
```

Should return:
```json
{"status":"healthy"}
```

## Step 6: Update Next.js App

In your Next.js app (Vercel), add environment variable:

```
NEXT_PUBLIC_AGENTS_API_URL=https://pint-agents.onrender.com
```

Then update your API calls to use this URL.

## Notes

- **Free tier**: Service will spin down after 15 minutes of inactivity
- **Cold starts**: First request after spin-down takes ~30 seconds
- **Logs**: Available in Render dashboard under "Logs" tab
- **Auto-deploy**: Render auto-deploys on push to main branch

## Troubleshooting

### Database connection fails
- Ensure you're using the **connection pooler** URL (port 6543)
- Verify the password is correct
- Check Supabase allows connections from Render IPs

### CORS errors
- Verify `FRONTEND_URL` matches your Vercel domain exactly
- Include protocol: `https://` not just `your-app.vercel.app`

### Service won't start
- Check logs in Render dashboard
- Verify all required environment variables are set
- Test Docker build locally: `docker build -t agents .`
