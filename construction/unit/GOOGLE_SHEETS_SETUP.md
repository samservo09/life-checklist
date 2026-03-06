# Google Sheets Integration Setup Guide

This guide walks you through setting up Google Sheets as a backend for the Life OS Unit app with secure environment variables.

## Overview

The app now supports two modes:
- **Local Mode**: Uses localStorage (default when credentials are missing)
- **Cloud Mode**: Uses Google Sheets API (when valid credentials are provided)

This graceful degradation ensures the app works in both development and production without crashing.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Your Vercel project deployed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: "Life OS Unit"
5. Click "CREATE"
6. Wait for the project to be created

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "ENABLE"
4. Wait for it to enable

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields (app name, user support email, etc.)
   - Add scopes: `https://www.googleapis.com/auth/spreadsheets` and `https://www.googleapis.com/auth/drive.readonly`
   - Add test users (your email)
   - Save and continue
4. Back to credentials, click "CREATE CREDENTIALS" > "OAuth client ID"
5. Select "Web application"
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000` (for local development)
   - `https://your-vercel-domain.vercel.app` (your production URL)
   - `https://your-vercel-domain.vercel.app/` (with trailing slash)
7. Click "CREATE"
8. Copy the **Client ID** (you'll need this)

## Step 4: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Life OS Unit"
3. Create sheets for each board:
   - Chores
   - SelfCare
   - BathRitual
   - Fridge
   - NonFood
   - Pantry
   - Gym
   - RTO
   - FirstAid
   - BathroomClean
4. In each sheet, add column headers:
   - A: ID
   - B: Name
   - C: Category/Frequency
   - D: Status
   - E: Completed
   - F: Timestamp
   - G: Notes
5. Copy the **Spreadsheet ID** from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## Step 5: Local Development Setup

1. In your project root (`construction/unit/`), create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your values:
   ```
   VITE_GOOGLE_SHEET_ID=your-spreadsheet-id
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

3. Start your development server:
   ```bash
   npm run dev
   ```

4. The app will now use Google Sheets for persistence

## Step 6: Vercel Deployment Setup

1. Go to your Vercel project dashboard
2. Click "Settings" > "Environment Variables"
3. Add the following environment variables:
   - **Name**: `VITE_GOOGLE_SHEET_ID`
     **Value**: Your spreadsheet ID
   - **Name**: `VITE_GOOGLE_CLIENT_ID`
     **Value**: Your OAuth 2.0 Client ID

4. Make sure both are set for:
   - Production
   - Preview
   - Development

5. Redeploy your project:
   ```bash
   git push
   ```

## Step 7: Test the Integration

### Local Testing
1. Start the dev server: `npm run dev`
2. Open the app in your browser
3. You should see: `✓ Google Sheets integration enabled`
4. Try adding an item to a board
5. Check your Google Sheet - the item should appear

### Production Testing
1. Visit your Vercel deployment URL
2. Sign in with your Google account
3. Add an item
4. Verify it appears in your Google Sheet

## Troubleshooting

### "Google Sheets credentials not found - using Local Mode"
- Check that `.env.local` exists and has the correct values
- Verify `VITE_GOOGLE_SHEET_ID` and `VITE_GOOGLE_CLIENT_ID` are set
- Restart your dev server after updating `.env.local`

### OAuth Sign-In Fails
- Verify your redirect URIs are correct in Google Cloud Console
- Check that your domain is added to the authorized redirect URIs
- Clear browser cookies and try again

### Items Not Syncing to Google Sheets
- Check browser console for errors
- Verify the OAuth token is valid
- Check that your Google Sheet has the correct column headers
- Ensure the sheet names match the board types

### "Invalid Spreadsheet ID"
- Copy the ID directly from the URL
- Make sure you're using the ID, not the full URL
- Verify the sheet is shared with your Google account

## Security Notes

- **Never commit `.env.local`** - it's in `.gitignore`
- **Never share your Client ID or Spreadsheet ID** in public repositories
- Use Vercel's environment variables for production secrets
- Rotate credentials if they're ever exposed
- Use OAuth 2.0 (never store user passwords)

## Graceful Degradation

If credentials are missing or invalid:
- The app automatically falls back to **Local Mode**
- All data is stored in localStorage
- No errors are thrown
- Users can still use the app normally
- When credentials are added, the app will sync to Google Sheets

This ensures the app is always usable, whether in development or production.

## Next Steps

- Monitor your Google Sheets API quota usage
- Set up alerts for sync failures
- Consider implementing backup strategies
- Plan for scaling if you add more users
