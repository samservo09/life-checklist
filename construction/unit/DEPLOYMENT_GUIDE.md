# Life OS - Deployment Guide

## Overview

This guide covers deploying Life OS to Vercel with optional Google Sheets API integration.

## Local Development

### Prerequisites
- Python 3.7+
- Modern web browser

### Setup

1. **Start the development server:**
   ```bash
   cd construction/unit
   python server.py
   ```

2. **Open in browser:**
   ```
   http://localhost:8000
   ```

3. **Test all features:**
   - Navigate through all 10 boards
   - Add, edit, delete items
   - Toggle completion status
   - Test low energy mode
   - Export/import data

## Vercel Deployment

### Prerequisites
- Vercel account (free tier available)
- Git repository with this code
- (Optional) Google Sheets API credentials

### Step 1: Prepare Repository

1. **Ensure vercel.json exists** in `construction/unit/`
2. **Create .env.local** (for local testing):
   ```bash
   cp .env.example .env.local
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd construction/unit

# Deploy
vercel
```

#### Option B: Using GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Configure settings (see below)
6. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
REACT_APP_API_URL = https://your-api-domain.com/api
REACT_APP_GOOGLE_SHEETS_API_KEY = your_key_here
REACT_APP_GOOGLE_SHEETS_ID = your_id_here
REACT_APP_USE_GOOGLE_SHEETS = false (or true if using Google Sheets)
REACT_APP_DEBUG = false
```

### Step 4: Verify Deployment

1. **Check deployment status** in Vercel Dashboard
2. **Test the live URL:**
   - Navigate to all routes
   - Test page refresh on sub-routes (should not 404)
   - Verify localStorage persistence

## Google Sheets Integration

### Prerequisites
- Google Cloud Project
- Google Sheets API enabled
- Service account with Sheets API access

### Setup Steps

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Enable Google Sheets API

2. **Create Service Account:**
   - Go to **Service Accounts**
   - Create new service account
   - Generate JSON key
   - Save the key securely

3. **Create Google Sheet:**
   - Create new Google Sheet
   - Share with service account email
   - Note the Sheet ID (from URL)

4. **Set Environment Variables:**
   ```
   REACT_APP_GOOGLE_SHEETS_API_KEY = (from JSON key)
   REACT_APP_GOOGLE_SHEETS_ID = (from Sheet URL)
   REACT_APP_USE_GOOGLE_SHEETS = true
   ```

5. **Deploy API Backend:**
   - Create API endpoints for:
     - POST /api/items (add item)
     - PATCH /api/items/:id (update item)
     - DELETE /api/items/:id (delete item)
     - GET /api/boards/:boardType (get board)
     - POST /api/sync (sync all data)

### API Endpoints

The app expects these endpoints when using Google Sheets:

```
POST /api/items
  Body: { boardType, item }
  Response: { id, ...item }

PATCH /api/items/:id
  Body: { boardType, updates }
  Response: { ...updatedItem }

DELETE /api/items/:id
  Body: { boardType }
  Response: { success: true }

GET /api/boards/:boardType
  Response: { items: [...] }

POST /api/sync
  Body: { boards, consistencyLog }
  Response: { success: true }

POST /api/items/:id/toggle
  Body: { boardType }
  Response: { completed: boolean }
```

## Troubleshooting

### 404 on Page Refresh

**Problem:** Refreshing on `/area/chores` returns 404

**Solution:** Ensure `vercel.json` has the rewrite rule:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

### Data Not Persisting

**Problem:** Data disappears after page refresh

**Solution:** 
- Check browser localStorage is enabled
- Verify no errors in browser console
- Check if using Google Sheets API (requires backend)

### API Errors

**Problem:** "Failed to sync with Google Sheets"

**Solution:**
- Verify API credentials in environment variables
- Check Google Sheets API is enabled
- Verify service account has access to Sheet
- Check API endpoint is responding

### Environment Variables Not Loading

**Problem:** Config shows default values

**Solution:**
- Redeploy after adding environment variables
- Check variable names match exactly
- Verify variables are set for correct environment (Production)

## Rollback

If deployment has issues:

```bash
# Using Vercel CLI
vercel rollback

# Or in Vercel Dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "Promote to Production"
```

## Performance Optimization

### Caching Strategy

- **HTML files:** No cache (must always be fresh)
- **Static assets:** 1 hour cache
- **API responses:** Depends on backend

### Monitoring

1. **Vercel Analytics:**
   - Go to Dashboard → Analytics
   - Monitor Core Web Vitals
   - Check error rates

2. **Browser DevTools:**
   - Check Network tab for slow requests
   - Monitor Console for errors
   - Check Application tab for localStorage

## Security Considerations

1. **Never commit .env files** to Git
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** (automatic with Vercel)
4. **Validate all user input** on backend
5. **Use CORS headers** appropriately
6. **Rotate API keys** regularly

## Maintenance

### Regular Tasks

- Monitor error logs
- Update dependencies
- Test all features monthly
- Backup Google Sheets data
- Review performance metrics

### Updating Code

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys on push
# Monitor deployment in Vercel Dashboard
```

## Support

For issues:
1. Check browser console for errors
2. Review Vercel deployment logs
3. Check Google Sheets API quota
4. Verify environment variables
5. Test locally first before deploying

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [SPA Routing Guide](https://vercel.com/docs/concepts/projects/overview#routing)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
