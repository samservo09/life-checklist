# Cache Clear Instructions

The browser is likely caching old versions of the JavaScript files. Follow these steps to clear the cache and test the fixes:

## Option 1: Hard Refresh (Quickest)
1. Open the browser DevTools (F12 or Ctrl+Shift+I)
2. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac) to do a hard refresh
3. This clears the cache for the current page

## Option 2: Clear Browser Cache
1. Open browser settings
2. Go to Privacy/History
3. Clear browsing data (select "All time" and check "Cached images and files")
4. Refresh the page

## Option 3: Disable Cache in DevTools
1. Open DevTools (F12)
2. Go to Settings (gear icon)
3. Check "Disable cache (while DevTools is open)"
4. Refresh the page

## What Was Fixed

### 1. config.js
- Removed all `process.env` references
- Added hardcoded CONFIG object with all required properties
- Added BOARDS configuration
- Added LOW_ENERGY_FALLBACK_IDS
- Added helper function `isUsingGoogleSheets()`

### 2. state.js
- Updated to use `getDefaultState()` instead of `getInitialData()`
- Added 10 default checklists with sample items
- Fixed deprecated `substr()` to use `substring()`
- Updated all references to use `this.getDefaultState()`

### 3. api.js
- Added null checks for CONFIG and isUsingGoogleSheets
- Will gracefully fall back to defaults if not defined

### 4. index.html
- Script loading order is correct with `defer` attribute
- Scripts load in proper sequence: config → data → state → api → utils → components → app

## Testing Steps

1. Clear cache using one of the methods above
2. Refresh the page
3. Check browser console (F12) for any errors
4. You should see:
   - ✅ StateManager initialized with 10 boards
   - 📊 Total items: [number]
5. The app should display with all 10 checklists visible

## If Still Getting Errors

1. Check the Network tab in DevTools to see if files are being served
2. Look at the Console tab for specific error messages
3. Verify the server is running: `python server.py`
4. Try accessing http://localhost:8000 directly
