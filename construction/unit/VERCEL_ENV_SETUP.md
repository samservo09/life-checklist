# Vercel Environment Variables Setup

Quick reference for adding Google Sheets credentials to your Vercel deployment.

## Steps

1. **Go to Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard
   - Select your "unit" project

2. **Open Settings**
   - Click "Settings" in the top navigation
   - Click "Environment Variables" in the left sidebar

3. **Add Environment Variables**
   
   Click "Add New" and create two variables:

   **Variable 1: Google Sheet ID**
   - Name: `VITE_GOOGLE_SHEET_ID`
   - Value: Your spreadsheet ID (from Google Sheets URL)
   - Environments: Production, Preview, Development
   - Click "Save"

   **Variable 2: Google Client ID**
   - Name: `VITE_GOOGLE_CLIENT_ID`
   - Value: Your OAuth 2.0 Client ID (from Google Cloud Console)
   - Environments: Production, Preview, Development
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments"
   - Click the three dots on the latest deployment
   - Select "Redeploy"
   - Wait for deployment to complete

5. **Verify**
   - Visit your Vercel URL
   - Open browser console (F12)
   - Look for: `✓ Google Sheets integration enabled`
   - If you see: `ℹ️ Google Sheets credentials not found - using Local Mode`
   - Then the environment variables weren't set correctly

## Getting Your Values

### Google Sheet ID
1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. Copy the part between `/d/` and `/edit`

### Google Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID
5. Copy the full Client ID (ends with `.apps.googleusercontent.com`)

## Troubleshooting

**Variables not showing up in app?**
- Wait 5 minutes after adding variables
- Redeploy your project
- Clear browser cache (Ctrl+Shift+Delete)

**Still showing "Local Mode"?**
- Check variable names are exactly: `VITE_GOOGLE_SHEET_ID` and `VITE_GOOGLE_CLIENT_ID`
- Verify values don't have extra spaces
- Check all three environments are selected (Production, Preview, Development)

**OAuth sign-in fails?**
- Verify your Vercel domain is in Google Cloud Console authorized redirect URIs
- Format: `https://your-domain.vercel.app`
- Also add: `https://your-domain.vercel.app/`

## Security Reminders

✅ **DO:**
- Use Vercel's environment variables for secrets
- Rotate credentials if exposed
- Keep `.env.local` in `.gitignore`

❌ **DON'T:**
- Commit `.env.local` to git
- Share your Client ID or Sheet ID publicly
- Store credentials in code

## Next Steps

After setting up environment variables:
1. Test adding an item in the app
2. Check your Google Sheet for the new item
3. Monitor Google Sheets API quota usage
4. Set up error alerts if needed
