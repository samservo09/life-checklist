# Life OS - Quick Start Guide

## What's New

This refactored version includes:
- ✅ **Reactive State Management** - No page refresh needed for updates
- ✅ **Tabular Inventory** - Better view for Fridge, Pantry, Non-Food, First-Aid
- ✅ **Enhanced Forms** - Category selection for Self-Care and Bath Ritual
- ✅ **Vercel Ready** - Deploy to production with one click
- ✅ **Google Sheets Ready** - Optional backend integration

## Local Development

### Start the Server

```bash
cd construction/unit
python server.py
```

Then open: **http://localhost:8000**

### Test Features

1. **Add Items** - Click "➕ Add New Item" on any board
2. **Edit Items** - Change status, quantity, expiry date, notes
3. **Delete Items** - Click 🗑️ button
4. **Toggle Completion** - Click checkbox on checklist items
5. **Low Energy Mode** - Toggle on Chores board
6. **Export Data** - Settings → Export Data
7. **Import Data** - Settings → Import Data

## Key Improvements

### No-Refresh Updates

**Before:** Had to refresh page to see changes
**Now:** Changes appear instantly

```javascript
// Example: Add item
stateManager.addItem('chores', newItem);
// UI updates automatically!
```

### Tabular Inventory

**Before:** Card layout for inventory items
**Now:** Table format with inline editing

| Item | Status | Qty | Expiry | Notes | Actions |
|------|--------|-----|--------|-------|---------|
| Milk | Half | 1 | 2026-03-05 | - | 🗑️ |

### Smart Forms

**Self-Care:**
- Select "🌅 Morning Routine" or "🌙 Evening Routine"
- Items automatically categorized

**Bath Ritual:**
- Select "🧴 Mon/Wed/Fri/Sat"
- Select "🧼 Tue/Thu/Sun"
- Select "✨ Universal"
- Items appear on correct days

## Configuration

### Local Testing

No configuration needed - works out of the box!

### Production (Vercel)

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update values:**
   ```
   REACT_APP_API_URL=https://your-api.com/api
   REACT_APP_USE_GOOGLE_SHEETS=false
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

## File Structure

```
src/
├── config.js       ← Configuration (API URLs, feature flags)
├── state.js        ← State management (reactive updates)
├── api.js          ← API service (backend communication)
├── data.js         ← Data models (ChecklistItem, etc.)
├── utils.js        ← Helper functions
├── components.js   ← UI components
├── app.js          ← Application logic
├── index.html      ← HTML entry point
└── styles.css      ← Tailwind CSS
```

## Common Tasks

### Add Item to Chores

1. Go to Chores board
2. Click "➕ Add New Item"
3. Enter item name
4. Click "Add Item"
5. ✅ Item appears instantly!

### Edit Inventory Item

1. Go to Fridge/Pantry/Non-Food/First-Aid
2. Click on any field (Status, Qty, Expiry, Notes)
3. Make changes
4. Changes save automatically

### Toggle Low Energy Mode

1. Go to Chores board
2. Click "⚡ Low Energy Mode" toggle
3. Shows only 4 essential tasks
4. Toggle again to see all tasks

### Export Data

1. Go to Home
2. Click "Settings" → "📥 Export Data"
3. JSON file downloads
4. Save for backup

### Import Data

1. Go to Home
2. Click "Settings" → "📤 Import Data"
3. Select JSON file
4. Data restores

## Troubleshooting

### Changes Not Appearing

**Problem:** I added an item but don't see it

**Solution:** 
- Check browser console (F12) for errors
- Refresh page (Ctrl+R)
- Check localStorage is enabled

### Page Shows Blank

**Problem:** App doesn't load

**Solution:**
- Check browser console for errors
- Verify server is running (`python server.py`)
- Try different browser
- Clear browser cache

### Data Lost After Refresh

**Problem:** Data disappears when I refresh

**Solution:**
- Check localStorage is enabled
- Check browser privacy settings
- Try incognito/private mode
- Export data regularly as backup

## Next Steps

### For Local Development

1. ✅ Test all features locally
2. ✅ Verify data persistence
3. ✅ Check all 10 boards work
4. ✅ Test export/import

### For Deployment

1. Read `DEPLOYMENT_GUIDE.md`
2. Set up Vercel account
3. Connect GitHub repository
4. Configure environment variables
5. Deploy!

### For Google Sheets Integration

1. Read `DEPLOYMENT_GUIDE.md` → Google Sheets Integration
2. Set up Google Cloud Project
3. Create service account
4. Create Google Sheet
5. Deploy backend API
6. Update environment variables

## Architecture Overview

```
┌─────────────────────────────────────┐
│         Browser (SPA)               │
│  ┌──────────────────────────────┐   │
│  │   UI Components              │   │
│  │  (renderChoresBoard, etc.)   │   │
│  └──────────────────────────────┘   │
│              ↓                       │
│  ┌──────────────────────────────┐   │
│  │   State Manager              │   │
│  │  (stateManager)              │   │
│  │  - addItem()                 │   │
│  │  - updateItem()              │   │
│  │  - deleteItem()              │   │
│  └──────────────────────────────┘   │
│              ↓                       │
│  ┌──────────────────────────────┐   │
│  │   localStorage               │   │
│  │  (persistent data)           │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
         ↓ (optional)
┌─────────────────────────────────────┐
│   API Service (apiService)          │
│  - addItem()                        │
│  - updateItem()                     │
│  - deleteItem()                     │
└─────────────────────────────────────┘
         ↓ (optional)
┌─────────────────────────────────────┐
│   Backend API                       │
│  - Google Sheets API                │
│  - Custom REST API                  │
└─────────────────────────────────────┘
```

## Performance Tips

1. **Use Low Energy Mode** on Chores for faster loading
2. **Export data regularly** as backup
3. **Clear browser cache** if app feels slow
4. **Use modern browser** (Chrome, Firefox, Safari, Edge)

## Security Notes

1. **Data stored locally** in browser localStorage
2. **No data sent to server** unless you enable Google Sheets
3. **Export files** contain all your data - keep safe
4. **Never share** export files with sensitive data

## Support

- 📖 Read `README.md` for feature documentation
- 🚀 Read `DEPLOYMENT_GUIDE.md` for deployment help
- 📝 Read `REFACTORING_SUMMARY.md` for technical details
- 🐛 Check browser console (F12) for error messages

## What's Next?

- ✅ Test locally
- ✅ Deploy to Vercel
- ✅ (Optional) Set up Google Sheets backend
- ✅ Share with team
- ✅ Collect feedback
- ✅ Iterate and improve

Happy organizing! 🎉
