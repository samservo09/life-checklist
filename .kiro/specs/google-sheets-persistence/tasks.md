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
- [x] Create `resetBoardItems(boardType)` method
- [x] Set `completed = false` for all items
- [x] Preserve item names, categories, frequencies
- [x] Sync reset status to Google Sheets
- [ ] Trigger at 12 AM Singapore Time

## Phase 3: Component Updates

### 3.1 Update renderAddItemForm
- [x] Change to call `stateManager.addItemWithCloudSync()` instead of `stateManager.addItem()`
- [x] Add sync status indicator (⏳ pending, ✅ synced, ⚠️ failed)
- [x] Show error message if sync fails
- [x] Add retry button for failed items

### 3.2 Add Sync Status Indicators
- [x] Create `renderSyncStatus(item)` component
- [x] Display sync status next to each item
- [x] Update status in real-time as sync progresses
- [x] Show error details on hover

### 3.3 Update renderChecklistItem and renderInventoryItem
- [x] Add sync status indicator to each item
- [x] Show pending state while syncing
- [x] Show error state if sync failed
- [x] Add manual retry option

## Phase 4: Configuration & Initialization

### 4.1 Update config.js (Security Refactor)
- [x] Add `USE_GOOGLE_SHEETS` flag
- [x] Add `SHEET_ID` configuration
- [x] Add `CLIENT_ID` configuration (renamed from API_KEY)
- [x] Add `GOOGLE_SHEETS_API_URL` configuration
- [x] Add `AUTO_SYNC_INTERVAL` configuration (default: 60000ms)
- [x] Add `RETRY_MAX_ATTEMPTS` configuration (default: 3)
- [x] Add `RETRY_BACKOFF_MS` configuration (default: 1000ms)
- [x] Refactor to read from environment variables (VITE_GOOGLE_SHEET_ID, VITE_GOOGLE_CLIENT_ID)
- [x] Implement graceful degradation to Local Mode if credentials missing
- [x] Add `hasValidGoogleSheetsCredentials()` helper function
- [x] Create `.env.example` template with instructions
- [x] Add credential validation logging

### 4.2 Update index.html
- [x] Add Google API client library script
- [x] Ensure correct script loading order

### 4.3 Initialize Google Sheets on App Load
- [x] Load Google API client
- [x] Initialize OAuth 2.0 authentication
- [x] Fetch initial data from Google Sheets
- [x] Merge with local data
- [x] Start auto-sync timer

### 4.4 API Security Validation (NEW)
- [x] Add credential validation to ApiService constructor
- [x] Implement fallback to Local Mode if credentials invalid
- [x] Add warning logs for missing credentials
- [x] Ensure all API methods check `hasValidCredentials` before attempting sync
- [x] Create GOOGLE_SHEETS_SETUP.md with complete setup instructions
- [x] Document Vercel environment variable configuration
- [x] Add security best practices documentation

## Phase 5: Integration & Testing

### 5.1 Test Optimistic Updates
- [x] Add item and verify it appears immediately
- [x] Verify item is saved to localStorage
- [x] Verify item is synced to Google Sheets
- [x] Verify sync status updates correctly

### 5.2 Test Cross-Device Sync
- [x] Add item on Device A
- [x] Open app on Device B
- [x] Verify item from Device A appears on Device B
- [x] Verify no duplicate items are created

### 5.3 Test Offline Resilience
- [x] Add item while offline
- [x] Verify item is stored in localStorage
- [x] Restore connection
- [x] Verify item is synced to Google Sheets
- [x] Verify no data loss

### 5.4 Test Reset Logic
- [x] Add items to a board
- [x] Complete some items
- [x] Trigger 12 AM reset
- [x] Verify completed status is reset to false
- [x] Verify item names and categories are preserved
- [x] Verify items are synced to Google Sheets

### 5.5 Test Error Handling
- [x] Simulate API failure
- [x] Verify retry logic works
- [x] Verify offline queue persists
- [x] Verify user is notified of errors
- [x] Verify manual retry option works

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
