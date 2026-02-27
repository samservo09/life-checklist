# Google Sheets Persistence - Implementation Tasks

## Phase 1: API Service Enhancement

### 1.1 Add Google Sheets API Methods to api.js
- [x] Add `appendItem(boardType, item)` method
- [x] Add `updateItemInSheet(boardType, itemId, updates)` method
- [x] Add `deleteItemFromSheet(boardType, itemId)` method
- [x] Add `fetchBoardFromSheet(boardType)` method
- [x] Add `batchAppendItems(boardType, items)` method
- [x] Implement proper error handling for all methods

### 1.2 Implement Retry Logic with Exponential Backoff
- [x] Create `retryWithBackoff(fn, maxAttempts)` utility function
- [x] Implement exponential backoff: 1s, 2s, 4s delays
- [x] Add max retry attempts configuration (default: 3)
- [x] Log retry attempts for debugging

### 1.3 Implement Offline Queue
- [x] Create `OfflineQueue` class to store failed requests
- [x] Add `add(operation)` method to queue operations
- [x] Add `processQueue()` method to retry queued operations
- [x] Persist queue to localStorage for recovery after page reload
- [x] Implement automatic queue processing when connection is restored

## Phase 2: State Manager Enhancement

### 2.1 Add Cloud Sync Methods to state.js
- [x] Add `addItemWithCloudSync(boardType, item)` method
- [x] Add `loadFromGoogleSheets(boardType)` method
- [x] Add `mergeCloudItems(boardType, cloudItems)` method
- [x] Add `deduplicateItems(items)` method
- [x] Add `startAutoSync(intervalMs)` method

### 2.2 Implement Optimistic Update Pattern
- [x] Update local state immediately on add/edit/delete
- [x] Trigger cloud sync in background (non-blocking)
- [x] Track sync status for each item (pending/synced/failed)
- [x] Handle sync failures gracefully

### 2.3 Implement Item Deduplication
- [x] Create logic to detect duplicate items by ID
- [x] Create logic to detect duplicate items by name + category
- [x] Merge duplicate items, keeping most recent version
- [x] Log deduplication events

### 2.4 Implement Reset Logic
- [ ] Create `resetBoardItems(boardType)` method
- [ ] Set `completed = false` for all items
- [ ] Preserve item names, categories, frequencies
- [ ] Sync reset status to Google Sheets
- [ ] Trigger at 12 AM Singapore Time

## Phase 3: Component Updates

### 3.1 Update renderAddItemForm
- [ ] Change to call `stateManager.addItemWithCloudSync()` instead of `stateManager.addItem()`
- [ ] Add sync status indicator (⏳ pending, ✅ synced, ⚠️ failed)
- [ ] Show error message if sync fails
- [ ] Add retry button for failed items

### 3.2 Add Sync Status Indicators
- [ ] Create `renderSyncStatus(item)` component
- [ ] Display sync status next to each item
- [ ] Update status in real-time as sync progresses
- [ ] Show error details on hover

### 3.3 Update renderChecklistItem and renderInventoryItem
- [ ] Add sync status indicator to each item
- [ ] Show pending state while syncing
- [ ] Show error state if sync failed
- [ ] Add manual retry option

## Phase 4: Configuration & Initialization

### 4.1 Update config.js
- [ ] Add `USE_GOOGLE_SHEETS` flag
- [ ] Add `SHEET_ID` configuration
- [ ] Add `API_KEY` configuration
- [ ] Add `GOOGLE_SHEETS_API_URL` configuration
- [ ] Add `AUTO_SYNC_INTERVAL` configuration (default: 60000ms)
- [ ] Add `RETRY_MAX_ATTEMPTS` configuration (default: 3)
- [ ] Add `RETRY_BACKOFF_MS` configuration (default: 1000ms)

### 4.2 Update index.html
- [ ] Add Google API client library script
- [ ] Ensure correct script loading order

### 4.3 Initialize Google Sheets on App Load
- [ ] Load Google API client
- [ ] Initialize OAuth 2.0 authentication
- [ ] Fetch initial data from Google Sheets
- [ ] Merge with local data
- [ ] Start auto-sync timer

## Phase 5: Integration & Testing

### 5.1 Test Optimistic Updates
- [ ] Add item and verify it appears immediately
- [ ] Verify item is saved to localStorage
- [ ] Verify item is synced to Google Sheets
- [ ] Verify sync status updates correctly

### 5.2 Test Cross-Device Sync
- [ ] Add item on Device A
- [ ] Open app on Device B
- [ ] Verify item from Device A appears on Device B
- [ ] Verify no duplicate items are created

### 5.3 Test Offline Resilience
- [ ] Add item while offline
- [ ] Verify item is stored in localStorage
- [ ] Restore connection
- [ ] Verify item is synced to Google Sheets
- [ ] Verify no data loss

### 5.4 Test Reset Logic
- [ ] Add items to a board
- [ ] Complete some items
- [ ] Trigger 12 AM reset
- [ ] Verify completed status is reset to false
- [ ] Verify item names and categories are preserved
- [ ] Verify items are synced to Google Sheets

### 5.5 Test Error Handling
- [ ] Simulate API failure
- [ ] Verify retry logic works
- [ ] Verify offline queue persists
- [ ] Verify user is notified of errors
- [ ] Verify manual retry option works

## Phase 6: Documentation & Deployment

### 6.1 Update Documentation
- [ ] Update README.md with Google Sheets setup instructions
- [ ] Document API configuration steps
- [ ] Document OAuth 2.0 setup
- [ ] Document troubleshooting guide

### 6.2 Deploy to Production
- [ ] Push code to GitHub
- [ ] Verify Vercel deployment
- [ ] Test on production URL
- [ ] Monitor for errors

### 6.3 Monitor & Maintain
- [ ] Monitor API usage and quotas
- [ ] Track sync errors and failures
- [ ] Implement alerting for critical errors
- [ ] Plan for scaling if needed

---

## Notes

- All tasks should maintain backward compatibility with local-only mode
- When `USE_GOOGLE_SHEETS` is false, app should work with localStorage only
- All API calls should be non-blocking (async/await)
- All user actions should provide immediate feedback
- All errors should be logged for debugging
