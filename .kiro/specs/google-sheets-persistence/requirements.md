# Google Sheets Persistence - Requirements

## Overview
Enable permanent cloud persistence for checklist items using Google Sheets API, with optimistic UI updates and cross-device synchronization.

## User Stories

### Story 1: Add Item with Cloud Sync
**As a** user adding a checklist item  
**I want** the item to be saved to Google Sheets immediately  
**So that** it persists across all my devices and browsers

**Acceptance Criteria:**
- When I add an item to any checklist (Chores, Bath Ritual, Self-Care), it appears in the UI instantly (optimistic update)
- The item is sent to Google Sheets API in the background
- If the API call fails, the item remains in local state and retries automatically
- The item includes: Name, Category/Frequency, Status, and Timestamp

### Story 2: Cross-Device Synchronization
**As a** user with multiple devices  
**I want** items added on one device to appear on another device when I open the app  
**So that** my data is always up-to-date across all devices

**Acceptance Criteria:**
- When the app loads, it fetches all items from Google Sheets
- Items from Google Sheets are merged with local items
- Duplicate items are detected and removed
- The UI displays all items from both sources

### Story 3: Reset-Proof Item Persistence
**As a** user with daily reset logic  
**I want** items to persist even after the 12 AM reset  
**So that** I don't lose my checklist items

**Acceptance Criteria:**
- The 12 AM reset only clears the `completed` status of items
- Items themselves are never deleted from the list
- Items remain in Google Sheets after reset
- The reset logic preserves item metadata (name, category, frequency)

### Story 4: Offline Resilience
**As a** user with intermittent internet  
**I want** the app to work offline and sync when connection returns  
**So that** I can continue using the app without interruption

**Acceptance Criteria:**
- Items added offline are stored in localStorage
- When connection is restored, offline items are synced to Google Sheets
- No data loss occurs during offline periods
- User is notified of sync status

## Technical Requirements

### Google Sheets Structure
- **Spreadsheet ID**: Configured in config.js
- **Sheets**: One sheet per board (Chores, Self-Care, Bath Ritual, etc.)
- **Columns**: ID, Name, Category/Frequency, Status, Completed, Timestamp, Notes

### API Integration
- **Authentication**: OAuth 2.0 with Google Sheets API
- **Operations**: Append (add), Update (edit), Delete (remove)
- **Error Handling**: Retry logic with exponential backoff
- **Rate Limiting**: Respect Google Sheets API quotas

### Data Sync Strategy
- **Optimistic Updates**: Update UI immediately, sync in background
- **Conflict Resolution**: Last-write-wins strategy
- **Deduplication**: Check for duplicate items before appending
- **Batch Operations**: Group multiple updates into single API call

### Reset Logic
- **Trigger**: 12 AM Singapore Time
- **Action**: Set `completed = false` for all items
- **Preservation**: Keep item names, categories, frequencies intact
- **Cloud Sync**: Update Google Sheets with reset status

## Non-Functional Requirements

- **Performance**: API calls should not block UI (async/await)
- **Reliability**: 99% uptime for sync operations
- **Security**: OAuth tokens stored securely, no credentials in code
- **Scalability**: Support up to 1000 items per board
- **Maintainability**: Clear separation between local and cloud logic
