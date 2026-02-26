# Deployment Guide - Vercel & Google Sheets Integration

## Phase 1: Deploy to Vercel via GitHub

### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Life OS Unit MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/life-os-unit.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select your `life-os-unit` repository
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `construction/unit`
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: Leave empty
6. Click "Deploy"

### Step 3: Verify Deployment
- Vercel will provide a URL (e.g., `https://life-os-unit.vercel.app`)
- Test all functionality works on deployed version
- Check browser console for any errors

---

## Phase 2: Google Sheets API Integration

### Step 1: Set Up Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create a new project:
   - Click "Select a Project" → "New Project"
   - Name: "Life OS Unit"
   - Click "Create"

3. Enable Google Sheets API:
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "Credentials" in left menu
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add Authorized JavaScript origins:
     - `http://localhost:8000`
     - `https://life-os-unit.vercel.app` (your Vercel URL)
   - Add Authorized redirect URIs:
     - `http://localhost:8000`
     - `https://life-os-unit.vercel.app`
   - Copy your **Client ID** (you'll need this)

### Step 2: Create Google Sheet

1. Go to https://sheets.google.com
2. Create new spreadsheet: "Life OS Unit Data"
3. Set up sheets for each board:
   - Sheet 1: "Chores"
   - Sheet 2: "Self-Care"
   - Sheet 3: "Bath Ritual"
   - Sheet 4: "Fridge"
   - Sheet 5: "Non-Food"
   - Sheet 6: "Pantry"
   - Sheet 7: "Gym"
   - Sheet 8: "RTO"
   - Sheet 9: "Bathroom"
   - Sheet 10: "First-Aid"

4. Add headers to each sheet:
   - Column A: ID
   - Column B: Name
   - Column C: Status/Completed
   - Column D: Category/Frequency
   - Column E: Notes

5. Copy the **Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### Step 3: Update config.js for Production

```javascript
// config.js - PRODUCTION VERSION
const CONFIG = {
  SHEET_ID: 'YOUR_SPREADSHEET_ID', // Paste your Spreadsheet ID
  API_KEY: 'YOUR_CLIENT_ID',        // Paste your OAuth Client ID
  APP_NAME: 'Life OS Unit',
  IS_DEV: false,
  LOCAL_STORAGE_KEY: 'lifeOS_data',
  API_BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
  USE_GOOGLE_SHEETS: true,
  // ... rest of config
};
```

### Step 4: Update api.js for Google Sheets

The api.js file needs to be updated to:
1. Load Google API client library
2. Authenticate with OAuth 2.0
3. Read/write to Google Sheets

Add to index.html (before app.js):
```html
<script src="https://apis.google.com/js/api.js"></script>
```

Update api.js to handle Google Sheets:
```javascript
class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
    this.useGoogleSheets = CONFIG.USE_GOOGLE_SHEETS;
    this.sheetId = CONFIG.SHEET_ID;
    this.apiKey = CONFIG.API_KEY;
    this.initGoogleSheets();
  }

  initGoogleSheets() {
    if (!this.useGoogleSheets) return;
    
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: this.apiKey,
        clientId: this.apiKey,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets'
      });
    });
  }

  async getBoard(boardType) {
    if (!this.useGoogleSheets) return null;
    
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: `${boardType}!A:E`
      });
      
      return this.parseSheetData(response.result.values);
    } catch (error) {
      console.error('Failed to get board from Google Sheets:', error);
      return null;
    }
  }

  async updateBoard(boardType, items) {
    if (!this.useGoogleSheets) return;
    
    try {
      const values = items.map(item => [
        item.id,
        item.name,
        item.completed || item.status || '',
        item.category || item.frequency || '',
        item.notes || ''
      ]);
      
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: `${boardType}!A:E`,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
    } catch (error) {
      console.error('Failed to update Google Sheets:', error);
    }
  }

  parseSheetData(values) {
    if (!values || values.length === 0) return [];
    
    return values.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      completed: row[2] === 'true',
      category: row[3],
      notes: row[4]
    }));
  }
}
```

### Step 5: Update state.js for Sync

Add sync functionality to StateManager:
```javascript
class StateManager {
  // ... existing code ...

  async syncWithGoogleSheets() {
    if (!CONFIG.USE_GOOGLE_SHEETS) return;
    
    const apiService = new ApiService();
    
    for (const [boardType, board] of Object.entries(this.state.boards)) {
      await apiService.updateBoard(boardType, board.items);
    }
    
    console.log('✅ Synced with Google Sheets');
  }

  // Call this periodically or on user action
  startAutoSync(intervalMs = 60000) {
    setInterval(() => {
      this.syncWithGoogleSheets();
    }, intervalMs);
  }
}
```

### Step 6: Deploy Updated Code

```bash
git add .
git commit -m "Add Google Sheets integration"
git push origin main
```

Vercel will automatically redeploy with your changes.

---

## Phase 3: Testing

### Local Testing
1. Update config.js with your Google credentials
2. Run `python server.py`
3. Test adding/editing/deleting items
4. Verify changes appear in Google Sheets

### Production Testing
1. Visit your Vercel URL
2. Sign in with Google (OAuth popup)
3. Test all CRUD operations
4. Verify changes sync to Google Sheets
5. Refresh page and verify data persists

---

## Troubleshooting

### OAuth Issues
- Ensure redirect URIs match exactly in Google Cloud Console
- Check browser console for CORS errors
- Verify Client ID is correct in config.js

### Google Sheets Sync Issues
- Verify Spreadsheet ID is correct
- Check that sheets exist with correct names
- Ensure API is enabled in Google Cloud Console
- Check browser console for API errors

### Vercel Deployment Issues
- Check Vercel build logs for errors
- Verify all files are committed to GitHub
- Ensure config.js has production values
- Check that environment variables are set (if using)

---

## Environment Variables (Optional)

For security, use Vercel environment variables instead of hardcoding credentials:

1. Go to Vercel project settings
2. Add environment variables:
   - `VITE_SHEET_ID`: Your Spreadsheet ID
   - `VITE_API_KEY`: Your OAuth Client ID

3. Update config.js:
```javascript
const CONFIG = {
  SHEET_ID: import.meta.env.VITE_SHEET_ID || 'LOCAL_DEV_MODE',
  API_KEY: import.meta.env.VITE_API_KEY || 'LOCAL_DEV_MODE',
  // ...
};
```

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set up Google Cloud Project
3. ✅ Create Google Sheet
4. ✅ Update config.js with credentials
5. ✅ Update api.js for Google Sheets
6. ✅ Test locally
7. ✅ Deploy to production
8. ✅ Test on Vercel

---

## Support

For issues:
- Check Vercel logs: https://vercel.com/dashboard
- Check Google Cloud Console: https://console.cloud.google.com
- Review browser console (F12) for errors
- Check Google Sheets API documentation: https://developers.google.com/sheets/api

Good luck with your deployment! 🚀
