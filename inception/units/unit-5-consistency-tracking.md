# Unit 5: Data Persistence & Consistency Tracking Service

## Overview
Handles backend data persistence using Google Sheets API, auto-reset functionality, consistency log archival, streak calculation, and dopamine-driven feedback through the Consistency Dashboard.

## QR Code Routes
- No direct QR routes (accessed via dashboard)

## User Stories

### US-10.1: User data persists to backend (Google Sheets API)
**As a** user wanting data continuity,
**I want to** have my checklist and inventory data saved to a backend service,
**So that** my data persists across sessions and devices.

**Acceptance Criteria:**
- All checklist completions logged to backend
- All inventory status changes logged to backend
- Data syncs automatically when connection available
- Offline changes queue and sync when online
- User can manually trigger sync
- Sync status indicator shows in UI

**Edge Cases:**
- Sync conflicts handled gracefully (last-write-wins or user prompt)
- Large data transfers don't block UI
- Failed syncs retry automatically

---

### US-10.2: System archives completion data at daily reset
**As a** user tracking consistency,
**I want to** have my daily completion data archived before reset,
**So that** I can review historical performance.

**Acceptance Criteria:**
- Daily completion data archived at 12:00 AM
- Archived data includes: date, tasks completed, completion percentage
- Archived data stored separately from active data
- User can access historical data via dashboard
- Archive includes timestamp of reset

**Edge Cases:**
- Timezone handling for reset timing
- Archive doesn't interfere with active data
- Large archives don't impact performance

---

### US-10.3: System calculates and displays consistency streaks
**As a** user motivated by progress,
**I want to** see my consistency streaks and completion rates,
**So that** I get dopamine-driven feedback on my progress.

**Acceptance Criteria:**
- Streak calculation based on consecutive days of task completion
- Completion rate calculated as percentage of tasks completed per day
- Streaks display on dashboard with visual indicators
- Streak broken if daily completion rate falls below threshold (e.g., 50%)
- Historical streak data preserved
- Streak notifications on milestone achievements (e.g., 7-day streak)

**Edge Cases:**
- Timezone handling for streak calculations
- Partial completion days handled (e.g., 75% completion)
- Streak reset logic clear to user

---

### US-11.1: User views consistency dashboard with streaks and completion rates
**As a** user tracking my progress,
**I want to** see a dashboard displaying my streaks and completion rates,
**So that** I can visualize my consistency and stay motivated.

**Acceptance Criteria:**
- Dashboard displays current streak with visual indicator
- Dashboard displays completion rate for current week/month
- Historical data visualized in chart (e.g., line graph, bar chart)
- High-contrast colors for accessibility
- Mobile-responsive design
- Data updates in real-time as tasks are completed

**Edge Cases:**
- New users with no historical data show placeholder
- Chart handles large datasets without performance issues
- Timezone handling for date ranges

---

### US-11.2: User views dopamine-driven feedback elements
**As a** user needing motivation,
**I want to** see celebratory feedback when reaching milestones,
**So that** I feel rewarded for my consistency.

**Acceptance Criteria:**
- Milestone notifications for streak achievements (e.g., 7, 14, 30 days)
- Visual celebration animation on milestone achievement
- Confetti or similar celebratory effect (optional)
- Sound notification (optional, user-configurable)
- Milestone history displayed on dashboard

**Edge Cases:**
- Animations don't cause accessibility issues
- Sound notifications can be disabled
- Celebrations don't interfere with task completion

---

## API Endpoints

### Data Persistence Operations
- `POST /api/consistency/sync` - Sync data to Google Sheets backend
- `GET /api/consistency/sync-status` - Get current sync status
- `POST /api/consistency/archive` - Archive completion data (internal, called at 12:00 AM)
- `POST /api/consistency/reset` - Trigger daily reset (internal, called at 12:00 AM)

### Consistency Tracking Operations
- `GET /api/consistency/streaks` - Get current streaks for all modules
- `GET /api/consistency/streaks/:type` - Get streak for specific module type
- `GET /api/consistency/history` - Get historical completion data
- `GET /api/consistency/history/:date` - Get completion data for specific date
- `GET /api/consistency/dashboard` - Get dashboard data (streaks, rates, charts)
- `GET /api/consistency/milestones` - Get milestone achievements
- `POST /api/consistency/milestones/:id/celebrate` - Trigger celebration animation

### Data Models

**Completion Record:**
```json
{
  "id": "string",
  "date": "date",
  "moduleType": "checklist|ritual|inventory",
  "moduleName": "chores|self-care|bathroom|gym|rto|bath-ritual|fridge|pantry|first-aid",
  "itemsCompleted": "number",
  "itemsTotal": "number",
  "completionPercentage": "number",
  "completedItems": ["string[]"],
  "timestamp": "timestamp"
}
```

**Archived Data:**
```json
{
  "id": "string",
  "date": "date",
  "completionRecords": ["CompletionRecord[]"],
  "dailyCompletionPercentage": "number",
  "archivedAt": "timestamp",
  "resetAt": "timestamp"
}
```

**Streak:**
```json
{
  "id": "string",
  "moduleType": "checklist|ritual|inventory",
  "moduleName": "string",
  "currentStreak": "number",
  "longestStreak": "number",
  "streakStartDate": "date",
  "completionThreshold": "number",
  "lastCompletedDate": "date",
  "broken": "boolean"
}
```

**Dashboard Data:**
```json
{
  "currentStreaks": ["Streak[]"],
  "completionRates": {
    "today": "number",
    "thisWeek": "number",
    "thisMonth": "number"
  },
  "historicalData": ["ArchivedData[]"],
  "milestones": ["Milestone[]"],
  "chartData": {
    "labels": ["string[]"],
    "datasets": ["object[]"]
  }
}
```

**Milestone:**
```json
{
  "id": "string",
  "type": "streak|completion",
  "name": "string",
  "description": "string",
  "threshold": "number",
  "achieved": "boolean",
  "achievedAt": "timestamp",
  "celebrationTriggered": "boolean"
}
```

## Google Sheets Integration

### Sheet Structure
The app will use Google Sheets API to persist data with the following sheet structure:

**Sheet 1: Active Data**
- Columns: Date, Module Type, Module Name, Items Completed, Items Total, Completion %

**Sheet 2: Archived Data**
- Columns: Date, Daily Completion %, Archived At, Reset At

**Sheet 3: Streaks**
- Columns: Module Type, Module Name, Current Streak, Longest Streak, Streak Start Date, Last Completed Date

**Sheet 4: Milestones**
- Columns: Milestone Type, Name, Threshold, Achieved, Achieved At

## Dependencies
- **Checklist Management Service** - Receives completion data
- **Ritual Management Service** - Receives completion data
- **Inventory Management Service** - Receives completion data (optional)
- **Shared UI Component Library** - For high-contrast components and accessibility

## Integration Points
- Receives completion data from all other services
- Triggers reset at 12:00 AM for all services
- Sends streak and dashboard data to UI
- Syncs data to Google Sheets backend
- Handles offline queue management

## Implementation Notes

### Auto-Reset Logic
- Runs at 12:00 AM UTC (or user timezone if configurable)
- Archives current day's completion data before reset
- Resets all daily checklists
- Resets weekly checklists on Sunday
- Resets bi-weekly checklists every other Sunday
- Resets monthly checklists on 1st of month
- Sends reset trigger to all services

### Streak Calculation
- Streak increases if daily completion rate >= 50%
- Streak breaks if daily completion rate < 50%
- Streaks are calculated per module type
- Historical streak data preserved for analytics

### Offline Queue Management
- Completion data queued locally when offline
- Queue synced to Google Sheets when connection restored
- Conflict resolution: last-write-wins
- Queue persisted in IndexedDB for reliability

### Performance Optimization
- Data synced asynchronously to avoid blocking UI
- Large data transfers chunked for efficiency
- Caching strategy for frequently accessed data
- Lazy loading of historical data
