# Google Sheets Persistence - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (UI)                       │
│  (renderAddItemForm, renderChecklistItem, etc.)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              State Manager (Optimistic Updates)              │
│  - addItem() → Update local state immediately               │
│  - Trigger cloud sync in background                         │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│  Local Storage   │    │  Google Sheets API   │
│  (Fallback)      │    │  (Cloud Persistence) │
└──────────────────┘    └──────────────────────┘
```

## Component Design

### 1. Enhanced API Service (api.js)

**New Methods:**
- `appendItem(boardType, item)` - Append new row to Google Sheet
- `updateItemInSheet(boardType, itemId, updates)` - Update existing row
- `deleteItemFromSheet(boardType, itemId)` - Delete row from sheet
- `fetchBoardFromSheet(boardType)` - Fetch all items from sheet
- `syncOfflineItems()` - Sync items added while offline
- `batchAppendItems(boardType, items)` - Append multiple items

**Error Handling:**
- Retry logic with exponential backoff (1s, 2s, 4s, 8s)
- Fallback to localStorage if API fails
- Queue failed requests for retry

### 2. Enhanced State Manager (state.js)

**New Methods:**
- `addItemWithCloudSync(boardType, item)` - Add item and sync to cloud
- `loadFromGoogleSheets(boardType)` - Fetch items from cloud
- `mergeCloudItems(boardType, cloudItems)` - Merge cloud items with local
- `deduplicateItems(items)` - Remove duplicate items
- `startAutoSync()` - Periodic sync with cloud

**Optimistic Update Pattern:**
```javascript
// 1. Update local state immediately
stateManager.addItem(boardType, item);
router(); // Re-render UI

// 2. Sync to cloud in background
apiService.appendItem(boardType, item)
  .catch(error => {
    // Handle error, item already in local state
    console.error('Cloud sync failed:', error);
  });
```

### 3. Enhanced Components (components.js)

**Modified renderAddItemForm:**
- Call `stateManager.addItemWithCloudSync()` instead of `stateManager.addItem()`
- Show sync status indicator (pending/synced/failed)
- Disable form during submission (optional)

**New Sync Status Indicator:**
- ⏳ Pending (syncing to cloud)
- ✅ Synced (successfully saved to cloud)
- ⚠️ Failed (will retry)

### 4. Configuration (config.js)

**New Config Properties:**
```javascript
const CONFIG = {
  // ... existing config ...
  USE_GOOGLE_SHEETS: true,
  SHEET_ID: 'YOUR_SPREADSHEET_ID',
  API_KEY: 'YOUR_CLIENT_ID',
  GOOGLE_SHEETS_API_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
  AUTO_SYNC_INTERVAL: 60000, // 1 minute
  RETRY_MAX_ATTEMPTS: 3,
  RETRY_BACKOFF_MS: 1000
};
```

## Data Flow

### Adding an Item (Optimistic Update)

```
1. User clicks "Add Item"
   ↓
2. renderAddItemForm calls stateManager.addItemWithCloudSync(boardType, item)
   ↓
3. StateManager:
   a. Generate unique ID for item
   b. Add item to local state immediately
   c. Save to localStorage
   d. Call router() to re-render UI
   e. Return item with sync status = 'pending'
   ↓
4. UI shows item immediately (optimistic)
   ↓
5. In background, apiService.appendItem(boardType, item) is called
   ↓
6. If successful:
   a. Update item sync status to 'synced'
   b. Update localStorage
   c. Emit 'sync-complete' event
   ↓
7. If failed:
   a. Update item sync status to 'failed'
   b. Queue for retry
   c. Show error notification
   d. Retry automatically after delay
```

### Loading Items (Cross-Device Sync)

```
1. App initializes
   ↓
2. StateManager.loadState() checks localStorage
   ↓
3. If USE_GOOGLE_SHEETS is true:
   a. Fetch items from Google Sheets for each board
   b. Merge with local items
   c. Deduplicate items
   d. Update localStorage
   e. Emit 'sync-complete' event
   ↓
4. Router renders UI with merged items
```

### Reset Logic (12 AM)

```
1. 12 AM trigger detected
   ↓
2. For each board:
   a. Set completed = false for all items
   b. Keep item names, categories, frequencies
   c. Update localStorage
   d. Sync to Google Sheets (update rows)
   ↓
3. Router re-renders UI with reset state
```

## Google Sheets Structure

### Sheet Format (per board)

| Column | Name | Type | Example |
|--------|------|------|---------|
| A | ID | String | chores-1234567890-abc123 |
| B | Name | String | Meal prep baon |
| C | Category/Frequency | String | daily |
| D | Status | String | half/full/low (inventory) or empty (checklist) |
| E | Completed | Boolean | true/false |
| F | Timestamp | ISO String | 2024-02-27T10:30:00Z |
| G | Notes | String | Optional notes |

### Sheet Names
- Chores
- SelfCare
- BathRitual
- Fridge
- NonFood
- Pantry
- Gym
- RTO
- BathroomClean
- FirstAid

## Error Handling Strategy

### Retry Logic
```javascript
async function retryWithBackoff(fn, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Offline Queue
```javascript
class OfflineQueue {
  constructor() {
    this.queue = [];
  }
  
  add(operation) {
    this.queue.push(operation);
    this.saveQueue();
  }
  
  async processQueue() {
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      try {
        await operation.execute();
      } catch (error) {
        this.queue.unshift(operation); // Re-add to front
        throw error;
      }
    }
  }
}
```

## Correctness Properties

### Property 1: Optimistic Consistency
**Validates: Requirements 1.1**

For any item added to a checklist:
- The item appears in the UI immediately after addition
- The item is persisted to localStorage
- The item is eventually synced to Google Sheets
- No data loss occurs during sync

### Property 2: Cross-Device Synchronization
**Validates: Requirements 2.1**

For items added on Device A:
- When Device B opens the app, it fetches items from Google Sheets
- Items from Device A appear on Device B
- No duplicate items are created
- Merge conflicts are resolved consistently

### Property 3: Reset Preservation
**Validates: Requirements 3.1**

For items after 12 AM reset:
- Item names remain unchanged
- Item categories/frequencies remain unchanged
- Only `completed` status is reset to false
- Items are not deleted from Google Sheets

### Property 4: Offline Resilience
**Validates: Requirements 4.1**

For items added while offline:
- Items are stored in localStorage
- When connection is restored, items are synced to Google Sheets
- No data loss occurs
- Sync status is tracked and reported

## Implementation Phases

### Phase 1: API Service Enhancement
- Add Google Sheets API methods to api.js
- Implement retry logic with exponential backoff
- Add offline queue for failed requests

### Phase 2: State Manager Enhancement
- Add cloud sync methods to state.js
- Implement optimistic update pattern
- Add item deduplication logic

### Phase 3: Component Updates
- Update renderAddItemForm to use cloud sync
- Add sync status indicators
- Update UI to show sync state

### Phase 4: Integration & Testing
- Test cross-device sync
- Test offline resilience
- Test reset logic
- Verify no data loss

## Security Considerations

- OAuth 2.0 tokens stored in sessionStorage (not localStorage)
- API keys never exposed in client code
- Use environment variables for sensitive config
- Validate all data before sending to Google Sheets
- Implement rate limiting to prevent abuse
