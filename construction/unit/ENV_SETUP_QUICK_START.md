# Environment Variables - Quick Start

Get your app running with Google Sheets in 5 minutes.

## TL;DR

1. Copy `.env.example` to `.env.local`
2. Fill in your Google Sheet ID and Client ID
3. Run `npm run dev`
4. Done! Your app now syncs to Google Sheets

## Step-by-Step

### 1. Get Your Credentials

**Google Sheet ID:**
- Open your Google Sheet
- Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/{COPY_THIS}/edit`

**Google Client ID:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project
- Go to "APIs & Services" > "Credentials"
- Copy your OAuth 2.0 Client ID (ends with `.apps.googleusercontent.com`)

### 2. Create `.env.local`

In `construction/unit/` directory:

```bash
cp .env.example .env.local
```

### 3. Edit `.env.local`

```
VITE_GOOGLE_SHEET_ID=your-sheet-id-here
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### 4. Start Dev Server

```bash
npm run dev
```

### 5. Check Console

Open browser console (F12) and look for:
- ✅ `✓ Google Sheets integration enabled` - You're good!
- ⚠️ `ℹ️ Google Sheets credentials not found - using Local Mode` - Check your `.env.local`

## For Vercel Deployment

1. Go to Vercel Dashboard
2. Select your project
3. Click "Settings" > "Environment Variables"
4. Add two variables:
   - `VITE_GOOGLE_SHEET_ID` = Your sheet ID
   - `VITE_GOOGLE_CLIENT_ID` = Your client ID
5. Redeploy

## Troubleshooting

**"credentials not found"?**
- Check `.env.local` exists in `construction/unit/`
- Verify variable names are exact (case-sensitive)
- Restart dev server after creating `.env.local`

**OAuth sign-in fails?**
- Add your domain to Google Cloud Console authorized redirect URIs
- Format: `https://your-domain.vercel.app`

**Items not syncing?**
- Check browser console for errors
- Verify Google Sheet has correct column headers
- Ensure sheet names match board types

## What Happens Without Credentials?

The app automatically falls back to **Local Mode**:
- ✅ All data stored in localStorage
- ✅ App works normally
- ✅ No errors or crashes
- ✅ When you add credentials later, it syncs to Google Sheets

## Security Notes

- ✅ Never commit `.env.local` (it's in `.gitignore`)
- ✅ Use Vercel environment variables for production
- ✅ Don't share your Client ID or Sheet ID publicly

## Need More Help?

- Full setup: See `GOOGLE_SHEETS_SETUP.md`
- Vercel setup: See `VERCEL_ENV_SETUP.md`
- Security details: See `SECURITY_REFACTOR_SUMMARY.md`
