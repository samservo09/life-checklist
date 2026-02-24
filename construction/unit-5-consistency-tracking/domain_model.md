# Unit 5: Data Persistence & Consistency Tracking System - Domain Driven Design Model

## Executive Summary

This document defines the complete Domain Driven Design (DDD) domain model for the Data Persistence & Consistency Tracking Service. The model encompasses all tactical components including aggregates, entities, value objects, domain events, policies, repositories, and domain services.

**Key Design Decisions:**
- CompletionLog as aggregate root with CompletionRecord as child entity
- Unified CompletionLogRepository for data access
- Anti-Corruption Layer for Google Sheets API integration
- Asynchronous domain event publishing
- Automatic archival at 12:00 AM SGT with separate storage
- IndexedDB-based offline queue with automatic sync
- Per-module-type streaks with 50% completion threshold
- Application layer handles timezone conversion (Singapore Time UTC+8)
- Domain works with UTC internally

---

## 1. Ubiquitous Language

### Core Domain Terms

**CompletionLog:** A collection of completion records for a specific date with archival and reset tracking.

**CompletionRecord:** An individual completion record for a module with completion percentage and items completed.

**Streak:** A consecutive sequence of days meeting the completion threshold for a specific module type.

**ArchivedData:** Historical completion data archived before daily reset with metadata.

**Dashboard:** Aggregated data for display including streaks, completion rates, and charts.

**Milestone:** An achievement threshold (e.g., 7-day streak) with celebration trigger.

**SyncQueue:** A queue of operations to be synced to Google Sheets when online.

**OfflineQueue:** A queue of operations performed offline to be synced when connection restored.

**CompletionPercentage:** The ratio of completed items to total items in a module.

**CompletionThreshold:** The minimum completion percentage required to maintain a streak (e.g., 50%).

**ModuleType:** The classification of a module (checklist, ritual, inventory).

**ModuleName:** The specific name of a module (chores, self-care, bathroom, gym, rto, bath-ritual, fridge, pantry, first-aid).

**Timezone:** Singapore Time (SGT, UTC+8) - used for reset scheduling and user display.

---

## 2. Bounded Context

### Context Name
**Data Persistence & Consistency Tracking Bounded Context**

### Context Responsibility
Manages data persistence to Google Sheets, auto-reset functionality, consistency log archival, streak calculation, and dopamine-driven feedback through the Consistency Dashboard. Coordinates with other services to receive completion data and trigger resets.

### Context Boundaries
- **Inbound:** Receives completion data from Checklist, Ritual, and Inventory contexts
- **Outbound:** Sends reset triggers to all contexts; sends dashboard data to UI
- **Internal:** Manages all persistence operations, archival, streak calculation, and dashboard aggregation

### Ubiquitous Language Scope
All terms defined in Section 1 apply within this context.

---

## 3. Aggregate Design

### 3.1 CompletionLog Aggregate Root

**Aggregate Root:** CompletionLog

**Responsibility:** Manages all completion logging operations, maintains consistency of completion state, and coordinates with child entities.

**Aggregate Boundary:**
```
CompletionLog (Aggregate Root)
├── CompletionLogId (Value Object)
├── Date (Value Object)
├── CompletionRecords (Collection of Child Entities)
├── DailyCompletionPercentage (Value Object)
├── SyncStatus (Value Object)
├── IsArchived (Value Object)
├── CreatedAt (Value Object)
└── UpdatedAt (Value Object)
```

**Aggregate Invariants:**
1. A completion log must have a valid CompletionLogId
2. A completion log must have a valid date
3. A completion log must have at least one CompletionRecord
4. DailyCompletionPercentage must be between 0-100
5. All CompletionRecords must belong to the same CompletionLog
6. CompletionRecords must maintain order
7. SyncStatus must be valid (pending, syncing, synced, failed)
8. CreatedAt and UpdatedAt must be valid timestamps

**Aggregate Lifecycle:**
1. **Created:** Completion log initialized for a date
2. **Active:** Completion log in use, records can be added/updated
3. **Archived:** Completion log data archived before reset
4. **Deleted:** Soft delete, data preserved for recovery

**Key Operations:**
- Create completion log for date
- Add completion record
- Update completion record
- Calculate daily completion percentage
- Archive completion log
- Sync to Google Sheets
- Delete completion log (soft delete)
- Calculate streaks
- Detect milestones



---

## 4. Entities

### 4.1 CompletionRecord Entity

**Entity Identity:** CompletionRecordId (unique within CompletionLog)

**Responsibility:** Represents a single completion record for a module with completion tracking.

**Properties:**
- CompletionRecordId: Unique identifier
- ModuleType: Type of module (checklist, ritual, inventory)
- ModuleName: Name of module (chores, self-care, bathroom, gym, rto, bath-ritual, fridge, pantry, first-aid)
- ItemsCompleted: Number of items completed (integer)
- ItemsTotal: Total number of items (integer)
- CompletionPercentage: Calculated completion percentage (0-100)
- CompletedItems: List of completed item names (optional)
- CreatedAt: Creation timestamp
- UpdatedAt: Last modification timestamp
- IsDeleted: Soft delete flag

**Entity Invariants:**
1. ModuleType must be valid
2. ModuleName must be valid
3. ItemsCompleted must be non-negative
4. ItemsTotal must be positive
5. ItemsCompleted must be <= ItemsTotal
6. CompletionPercentage must be between 0-100
7. UpdatedAt must be >= CreatedAt

**Entity Lifecycle:**
1. **Created:** Record created for module
2. **Active:** Record in use, can be updated
3. **Archived:** Record archived before reset
4. **Deleted:** Soft delete, data preserved

**Key Operations:**
- Create record with completion data
- Update completion data
- Calculate completion percentage
- Archive record
- Delete record (soft delete)
- Get module information

---

## 5. Value Objects

### 5.1 CompletionLogId

**Purpose:** Unique identifier for CompletionLog aggregate

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Uniquely identifies a CompletionLog
- Generated on creation

---

### 5.2 CompletionRecordId

**Purpose:** Unique identifier for CompletionRecord entity

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Unique within CompletionLog
- Generated on creation

---

### 5.3 ModuleType

**Purpose:** Encapsulates module type classification

**Valid Values:**
- CHECKLIST: Checklist module
- RITUAL: Ritual module
- INVENTORY: Inventory module

**Characteristics:**
- Immutable
- Enumerated type
- Determines streak tracking
- Validates type-specific rules

---

### 5.4 ModuleName

**Purpose:** Encapsulates module name classification

**Valid Values:**
- CHORES: Chore board
- SELF_CARE: Self-care routine
- BATHROOM: Bathroom cleaning
- GYM: Gym checklist
- RTO: RTO checklist
- BATH_RITUAL: Bath ritual
- FRIDGE: Fridge inventory
- PANTRY: Pantry inventory
- FIRST_AID: First-aid inventory

**Characteristics:**
- Immutable
- Enumerated type
- Maps to module type
- Validates name-type compatibility

---

### 5.5 CompletionPercentage

**Purpose:** Encapsulates completion percentage

**Properties:**
- Value: Integer 0-100
- CompletedCount: Number of completed items
- TotalCount: Total number of items

**Characteristics:**
- Immutable (recalculated on change)
- Always valid (0-100)
- Calculated from item counts

**Calculation:**
- If TotalCount = 0: Return 0
- Otherwise: (CompletedCount / TotalCount) * 100, rounded to nearest integer

---

### 5.6 CompletionThreshold

**Purpose:** Encapsulates completion threshold for streak

**Properties:**
- Value: Percentage threshold (default 50%)
- MinValue: Minimum threshold (0%)
- MaxValue: Maximum threshold (100%)

**Characteristics:**
- Immutable
- Validates threshold constraints
- Supports customization

---

### 5.7 Streak

**Purpose:** Encapsulates streak information

**Properties:**
- CurrentStreak: Current consecutive days (integer)
- LongestStreak: Longest streak achieved (integer)
- StreakStartDate: Date streak started (date)
- LastCompletedDate: Last date with completion >= threshold (date)
- IsBroken: Flag indicating if streak is broken (boolean)

**Characteristics:**
- Immutable (recalculated on change)
- Tracks streak history
- Supports streak analysis

---

### 5.8 Milestone

**Purpose:** Encapsulates milestone information

**Properties:**
- MilestoneId: Unique identifier
- Type: Milestone type (streak, completion)
- Name: Milestone name (e.g., "7-Day Streak")
- Threshold: Threshold value (e.g., 7)
- IsAchieved: Flag indicating achievement (boolean)
- AchievedAt: Achievement timestamp (nullable)
- CelebrationTriggered: Flag indicating celebration (boolean)

**Characteristics:**
- Immutable
- Represents achievement
- Tracks celebration status

---

### 5.9 SyncStatus

**Purpose:** Encapsulates sync status

**Valid Values:**
- PENDING: Waiting to sync
- SYNCING: Currently syncing
- SYNCED: Successfully synced
- FAILED: Sync failed

**Properties:**
- Status: Current sync status
- LastSyncAt: Last successful sync timestamp (nullable)
- ErrorMessage: Error details if failed (nullable)
- RetryCount: Number of retry attempts

**Characteristics:**
- Immutable (creates new instance on change)
- Tracks sync state
- Supports retry logic

---

### 5.10 OfflineQueueItem

**Purpose:** Encapsulates offline queue item

**Properties:**
- ItemId: Unique identifier
- OperationType: Type of operation (create, update, delete)
- Data: Operation data
- Timestamp: Operation timestamp
- RetryCount: Number of retry attempts

**Characteristics:**
- Immutable
- Supports queue ordering
- Tracks retry attempts

---

### 5.11 Timestamp

**Purpose:** Encapsulates timestamp with timezone awareness

**Properties:**
- UtcValue: Timestamp in UTC
- SgtValue: Timestamp in Singapore Time (for display)

**Characteristics:**
- Immutable
- Stores UTC internally
- Converts to SGT for display
- Comparable



---

## 6. Domain Events

### 6.1 CompletionRecordedEvent

**Trigger:** When a completion record is created or updated

**Properties:**
- CompletionLogId: Parent completion log identifier
- CompletionRecordId: Identifier of recorded completion
- ModuleType: Type of module
- ModuleName: Name of module
- CompletionPercentage: Completion percentage
- RecordedAt: Recording timestamp (UTC)

**Subscribers:**
- Streak Calculation Service
- Dashboard Service
- Audit Service

---

### 6.2 DataSyncedEvent

**Trigger:** When data is successfully synced to Google Sheets

**Properties:**
- CompletionLogId: Identifier of synced completion log
- RecordsSynced: Number of records synced
- SyncedAt: Sync timestamp (UTC)
- SyncDuration: Time taken to sync (milliseconds)

**Subscribers:**
- Audit Service
- Performance Monitoring Service

---

### 6.3 SyncFailedEvent

**Trigger:** When data sync fails

**Properties:**
- CompletionLogId: Identifier of completion log
- ErrorMessage: Error details
- RetryCount: Number of retry attempts
- FailedAt: Failure timestamp (UTC)

**Subscribers:**
- Error Handling Service
- Audit Service

---

### 6.4 DataArchivedEvent

**Trigger:** When completion data is archived

**Properties:**
- CompletionLogId: Identifier of archived completion log
- ArchivedRecords: Number of records archived
- DailyCompletionPercentage: Daily completion percentage
- ArchivedAt: Archive timestamp (UTC)

**Subscribers:**
- Audit Service
- Historical Data Service

---

### 6.5 DailyResetTriggeredEvent

**Trigger:** When daily reset is triggered at 12:00 AM SGT

**Properties:**
- ResetDate: Date of reset
- ArchivedData: Archived completion data
- ResetAt: Reset timestamp (UTC)
- AffectedModules: List of affected modules

**Subscribers:**
- Checklist Management Service
- Ritual Management Service
- Inventory Management Service
- Audit Service

---

### 6.6 StreakCalculatedEvent

**Trigger:** When streak is calculated

**Properties:**
- CompletionLogId: Parent completion log identifier
- ModuleType: Type of module
- ModuleName: Name of module
- CurrentStreak: Current streak value
- LongestStreak: Longest streak value
- StreakStartDate: Streak start date
- CalculatedAt: Calculation timestamp (UTC)

**Subscribers:**
- Dashboard Service
- Audit Service

---

### 6.7 StreakBrokenEvent

**Trigger:** When a streak is broken

**Properties:**
- CompletionLogId: Parent completion log identifier
- ModuleType: Type of module
- ModuleName: Name of module
- PreviousStreak: Previous streak value
- BreakReason: Reason for break (low completion)
- BrokenAt: Break timestamp (UTC)

**Subscribers:**
- Dashboard Service
- Audit Service

---

### 6.8 MilestoneAchievedEvent

**Trigger:** When a milestone is achieved

**Properties:**
- CompletionLogId: Parent completion log identifier
- MilestoneId: Identifier of achieved milestone
- MilestoneName: Name of milestone
- MilestoneType: Type of milestone (streak, completion)
- Threshold: Threshold value
- AchievedAt: Achievement timestamp (UTC)

**Subscribers:**
- Celebration Service
- Dashboard Service
- Audit Service

---

### 6.9 CelebrationTriggeredEvent

**Trigger:** When celebration is triggered for milestone

**Properties:**
- MilestoneId: Identifier of milestone
- CelebrationType: Type of celebration (animation, sound, notification)
- TriggeredAt: Trigger timestamp (UTC)

**Subscribers:**
- UI Service
- Audit Service

---

### 6.10 OfflineQueueUpdatedEvent

**Trigger:** When offline queue is updated

**Properties:**
- QueueSize: Current queue size
- OperationType: Type of operation (enqueue, dequeue, sync)
- UpdatedAt: Update timestamp (UTC)

**Subscribers:**
- Audit Service
- Sync Service



---

## 7. Repositories

### 7.1 CompletionLogRepository Interface

**Purpose:** Abstract data access for CompletionLog aggregate

**Responsibility:** Persist and retrieve CompletionLog aggregates with all child entities

**Methods:**

**save(completionLog: CompletionLog): void**
- Persists completion log and all records to storage
- Creates new or updates existing
- Maintains transactional consistency
- Publishes domain events

**findById(completionLogId: CompletionLogId): CompletionLog | null**
- Retrieves completion log by ID
- Loads all child records
- Returns null if not found

**findByDate(date: Date): CompletionLog | null**
- Retrieves completion log for specific date
- Returns null if not found

**findByModuleType(moduleType: ModuleType): CompletionLog[]**
- Retrieves completion logs for module type
- Returns empty array if none found

**findAll(): CompletionLog[]**
- Retrieves all completion logs
- Returns empty array if none found

**delete(completionLogId: CompletionLogId): void**
- Soft deletes completion log
- Preserves data for recovery
- Publishes deletion event

**Query Methods:**
- findByDateRange(startDate, endDate): CompletionLog[]
- findArchived(): CompletionLog[]
- findPending(): CompletionLog[]

---

### 7.2 CompletionRecordRepository Interface

**Purpose:** Abstract data access for CompletionRecord entities

**Responsibility:** Persist and retrieve completion records

**Methods:**

**save(record: CompletionRecord): void**
- Persists completion record
- Creates new or updates existing

**findByDate(date: Date): CompletionRecord[]**
- Retrieves records for specific date
- Returns empty array if none found

**findByModuleType(moduleType: ModuleType): CompletionRecord[]**
- Retrieves records for module type
- Returns empty array if none found

**findAll(): CompletionRecord[]**
- Retrieves all records
- Returns empty array if none found

---

### 7.3 StreakRepository Interface

**Purpose:** Abstract data access for Streak entities

**Responsibility:** Persist and retrieve streaks

**Methods:**

**save(streak: Streak): void**
- Persists streak
- Creates new or updates existing

**findByModuleType(moduleType: ModuleType): Streak[]**
- Retrieves streaks for module type
- Returns empty array if none found

**findAll(): Streak[]**
- Retrieves all streaks
- Returns empty array if none found

---

### 7.4 ArchivedDataRepository Interface

**Purpose:** Abstract data access for archived data

**Responsibility:** Persist and retrieve archived completion data

**Methods:**

**save(archivedData: ArchivedData): void**
- Persists archived data
- Records archive timestamp

**findByDate(date: Date): ArchivedData | null**
- Retrieves archived data for date
- Returns null if not found

**findByDateRange(startDate, endDate): ArchivedData[]**
- Retrieves archived data for date range
- Returns empty array if none found

**findAll(): ArchivedData[]**
- Retrieves all archived data
- Returns empty array if none found

---

### 7.5 OfflineQueueRepository Interface

**Purpose:** Abstract data access for offline queue

**Responsibility:** Manage offline queue operations

**Methods:**

**enqueue(item: OfflineQueueItem): void**
- Adds item to queue
- Persists to IndexedDB

**dequeue(): OfflineQueueItem | null**
- Removes and returns first item from queue
- Returns null if queue empty

**findAll(): OfflineQueueItem[]**
- Retrieves all queued items
- Returns empty array if queue empty

**clear(): void**
- Clears entire queue
- Used after successful sync

**getSize(): number**
- Returns current queue size

---

## 8. Domain Services

### 8.1 CompletionTrackingService

**Purpose:** Encapsulate completion tracking logic

**Responsibility:** Record completions, calculate percentages, emit events

**Operations:**

**recordCompletion(moduleType: ModuleType, moduleName: ModuleName, itemsCompleted: number, itemsTotal: number): CompletionRecord**
- Records completion for module
- Calculates completion percentage
- Publishes CompletionRecordedEvent
- Returns completion record

**calculateCompletionPercentage(itemsCompleted: number, itemsTotal: number): CompletionPercentage**
- Calculates completion percentage
- Validates inputs
- Returns percentage

**getCompletionSummary(completionLog: CompletionLog): CompletionSummary**
- Returns completion summary
- Includes total percentage, records, modules
- Used for display

---

### 8.2 StreakCalculationService

**Purpose:** Encapsulate streak calculation logic

**Responsibility:** Calculate streaks, detect breaks, emit events

**Operations:**

**calculateStreak(completionLog: CompletionLog, moduleType: ModuleType, threshold: CompletionThreshold): Streak**
- Calculates streak for module type
- Checks if completion >= threshold
- Updates streak or breaks it
- Publishes streak event
- Returns streak

**isStreakActive(streak: Streak, completionPercentage: CompletionPercentage, threshold: CompletionThreshold): boolean**
- Determines if streak should continue
- Checks if completion >= threshold
- Returns boolean

**breakStreak(streak: Streak): Streak**
- Breaks streak
- Publishes StreakBrokenEvent
- Returns updated streak

**getStreakInfo(streak: Streak): StreakInfo**
- Returns streak information
- Includes current, longest, start date
- Used for display

---

### 8.3 DataArchivalService

**Purpose:** Encapsulate data archival logic

**Responsibility:** Archive completion data, preserve history, emit events

**Operations:**

**archiveCompletionData(completionLog: CompletionLog): ArchivedData**
- Archives completion log data
- Preserves all records
- Records archive timestamp
- Publishes DataArchivedEvent
- Returns archived data

**getArchivedData(date: Date): ArchivedData | null**
- Retrieves archived data for date
- Returns null if not found

**getHistoricalData(startDate: Date, endDate: Date): ArchivedData[]**
- Retrieves archived data for date range
- Returns empty array if none found

---

### 8.4 DailyResetService

**Purpose:** Encapsulate daily reset logic

**Responsibility:** Trigger resets, archive data, emit events

**Operations:**

**triggerDailyReset(): void**
- Triggers daily reset at 12:00 AM SGT
- Archives completion data
- Publishes DailyResetTriggeredEvent
- Sends reset trigger to other services

**shouldTriggerReset(currentTime: Timestamp): boolean**
- Determines if reset should trigger
- Checks if current time is 12:00 AM SGT
- Returns boolean

**resetCompletionLog(completionLog: CompletionLog): void**
- Resets completion log
- Clears records
- Resets streaks if needed

---

### 8.5 DataSyncService

**Purpose:** Encapsulate data sync logic

**Responsibility:** Sync data to Google Sheets, handle failures, emit events

**Operations:**

**syncData(completionLog: CompletionLog): void**
- Syncs completion log to Google Sheets
- Handles sync failures and retries
- Publishes sync event
- Updates sync status

**retryFailedSync(completionLog: CompletionLog, maxRetries: number): void**
- Retries failed sync
- Increments retry count
- Publishes retry event

**getSyncStatus(completionLog: CompletionLog): SyncStatus**
- Returns current sync status
- Includes last sync time and errors
- Used for display

---

### 8.6 OfflineQueueService

**Purpose:** Encapsulate offline queue management

**Responsibility:** Queue operations, sync queue, handle conflicts

**Operations:**

**enqueueOperation(operation: Operation): void**
- Queues operation when offline
- Persists to IndexedDB
- Publishes queue update event

**syncQueue(): void**
- Syncs queued operations when online
- Processes queue in order
- Handles conflicts with last-write-wins
- Clears queue on success

**handleQueueConflict(queuedOp: Operation, serverOp: Operation): Operation**
- Handles conflict between queued and server operation
- Uses last-write-wins strategy
- Returns resolved operation

**getQueueSize(): number**
- Returns current queue size
- Used for display

---

### 8.7 DashboardService

**Purpose:** Encapsulate dashboard data aggregation

**Responsibility:** Compile streaks, rates, charts, emit updates

**Operations:**

**getDashboardData(): DashboardData**
- Aggregates all dashboard data
- Includes streaks, completion rates, charts
- Returns dashboard data

**getStreakData(): Streak[]**
- Retrieves all streaks
- Formats for display
- Returns streak list

**getCompletionRates(): CompletionRates**
- Calculates completion rates
- Includes today, week, month
- Returns rates

**getChartData(startDate: Date, endDate: Date): ChartData**
- Generates chart data for date range
- Formats for chart library
- Returns chart data

---

### 8.8 MilestoneService

**Purpose:** Encapsulate milestone tracking

**Responsibility:** Detect achievements, trigger celebrations, emit events

**Operations:**

**checkMilestones(streak: Streak): Milestone[]**
- Checks if milestones achieved
- Detects streak milestones (7, 14, 30 days)
- Publishes milestone events
- Returns achieved milestones

**triggerCelebration(milestone: Milestone): void**
- Triggers celebration for milestone
- Publishes CelebrationTriggeredEvent
- Sends celebration data to UI

**getMilestoneHistory(): Milestone[]**
- Retrieves all achieved milestones
- Returns milestone list



---

## 9. Business Rules & Policies

### 9.1 CompletionRecordingPolicy

**Rule 1: Completion Recording**
- Completion records created for each module completion
- Completion percentage calculated from items completed/total
- Completion records timestamped
- Completion records immutable after creation

**Rule 2: Completion Percentage Calculation**
- Percentage = (ItemsCompleted / ItemsTotal) * 100
- Rounded to nearest integer
- If ItemsTotal = 0: Return 0
- If ItemsCompleted = ItemsTotal: Return 100

**Rule 3: Daily Completion Percentage**
- Daily percentage = average of all module percentages
- Calculated from all completion records for day
- Used for streak calculation

---

### 9.2 StreakCalculationPolicy

**Rule 1: Streak Increase**
- Streak increases if daily completion >= 50%
- Streak continues from previous day
- Streak start date recorded

**Rule 2: Streak Break**
- Streak breaks if daily completion < 50%
- Streak value reset to 0
- Break reason logged

**Rule 3: Per-Module Streaks**
- Streaks calculated per module type
- Each module type has independent streak
- Streaks tracked separately

**Rule 4: Longest Streak**
- Longest streak preserved
- Updated when current streak exceeds longest
- Used for historical tracking

---

### 9.3 DataArchivalPolicy

**Rule 1: Archive Timing**
- Daily completion data archived at 12:00 AM SGT
- Archive includes date, completion %, records
- Archive timestamp recorded (UTC)

**Rule 2: Data Preservation**
- Archive doesn't interfere with active data
- Active data cleared after archival
- Historical data accessible for analytics

**Rule 3: Archive Integrity**
- Large archives don't impact performance
- Archive stored separately from active data
- Archive immutable after creation

---

### 9.4 DailyResetPolicy

**Rule 1: Reset Timing**
- Reset triggered at 12:00 AM Singapore Time (UTC+8)
- Reset includes archival before clearing
- Reset timestamp recorded

**Rule 2: Reset Operations**
- Daily checklists reset
- Weekly checklists reset on Sunday
- Bi-weekly checklists reset every other Sunday
- Monthly checklists reset on 1st of month

**Rule 3: Reset Coordination**
- Reset trigger sent to all services
- Services acknowledge reset
- Reset completion logged

---

### 9.5 DataSyncPolicy

**Rule 1: Sync Triggering**
- Data synced to Google Sheets asynchronously
- Sync triggered on completion or manually
- Sync doesn't block user operations

**Rule 2: Sync Failures**
- Failed syncs retry automatically
- Retry count incremented
- Max retries enforced (e.g., 3)

**Rule 3: Sync Conflicts**
- Conflicts resolved by last-write-wins
- Server data takes precedence
- Conflict logged for audit

**Rule 4: Sync Status**
- Sync status tracked (pending, syncing, synced, failed)
- Status displayed to user
- Manual sync trigger available

---

### 9.6 OfflineQueuePolicy

**Rule 1: Queue Operations**
- Operations queued when offline
- Queue persisted in IndexedDB
- Queue ordering maintained

**Rule 2: Queue Sync**
- Queue synced when online
- Operations processed in order
- Conflicts resolved by timestamp

**Rule 3: Queue Conflicts**
- Conflicts detected by timestamp
- Last-write-wins strategy applied
- Conflict logged

**Rule 4: Queue Clearing**
- Queue cleared after successful sync
- Failed items remain in queue
- Retry attempted on next sync

---

### 9.7 MilestonePolicy

**Rule 1: Milestone Thresholds**
- 7-day streak milestone
- 14-day streak milestone
- 30-day streak milestone
- Custom milestones supported

**Rule 2: Milestone Achievement**
- Milestone triggered when threshold reached
- Achievement timestamp recorded
- Milestone marked as achieved

**Rule 3: Celebration Triggering**
- Celebration triggered on achievement
- Celebration type determined by milestone
- Celebration animation/sound played

**Rule 4: Milestone History**
- Milestone history preserved
- All achievements tracked
- Historical data accessible

---

## 10. Anti-Corruption Layer

### 10.1 Purpose
Isolate domain model from Google Sheets API changes, providing translation between domain concepts and external API.

### 10.2 Responsibilities
- Translate domain CompletionLog to Google Sheets format
- Translate Google Sheets data to domain CompletionLog
- Handle API errors and exceptions
- Manage API authentication and rate limiting

### 10.3 Key Interfaces

**CompletionLogToSheetTranslator**
- Converts CompletionLog to Google Sheets row format
- Handles nested CompletionRecords
- Manages timestamp conversion (UTC to SGT for display)

**SheetToCompletionLogTranslator**
- Converts Google Sheets row to CompletionLog
- Reconstructs CompletionRecords
- Validates data integrity

**GoogleSheetsCompletionLogRepository**
- Implements CompletionLogRepository interface
- Uses Google Sheets API for persistence
- Handles API errors gracefully
- Implements retry logic

---

## 11. Event Publishing

### 11.1 Asynchronous Event Publishing

**Mechanism:**
- Domain events published to message broker
- Event handlers process asynchronously
- Decouples services

**Event Flow:**
1. Domain operation completes
2. Domain event created
3. Event published to message broker
4. Event handler receives event
5. Handler processes event

**Benefits:**
- Non-blocking user operations
- Better performance
- Service independence
- Resilience through retries

---

## 12. Aggregate Lifecycle & State Transitions

### 12.1 CompletionLog Aggregate States

**State 1: Created**
- Completion log initialized for date
- Ready for records

**State 2: Active**
- Completion log in use
- Records can be added/updated

**State 3: Archived**
- Completion log data archived
- Records preserved

**State 4: Deleted**
- Soft delete
- Data preserved

### 12.2 CompletionRecord Entity States

**State 1: Created**
- Record created for module
- Active and available

**State 2: Active**
- Record in use
- Can be updated

**State 3: Archived**
- Record archived
- Data preserved

**State 4: Deleted**
- Soft delete
- Data preserved

### 12.3 State Transition Rules

**Valid Transitions:**
- Created → Active (immediate)
- Active → Archived (on archival)
- Active → Deleted (on user delete)
- Archived → Deleted (on user delete)

**Invariants That Must Be Maintained:**
- Record must have valid module type
- Record must have valid module name
- Completion percentage must be valid
- Timestamps must be valid

---

## 13. Integration Points

### 13.1 Checklist Management Service Integration

**Inbound:**
- Receives completion data from Checklist Service
- Receives reset acknowledgment

**Outbound:**
- Sends reset trigger to Checklist Service
- Sends streak data to UI

**Data Flow:**
1. Checklist completion recorded
2. Completion data sent to Consistency Tracking
3. Streak calculated
4. Dashboard updated
5. Reset trigger sent at 12:00 AM SGT

### 13.2 Ritual Management Service Integration

**Inbound:**
- Receives completion data from Ritual Service
- Receives reset acknowledgment

**Outbound:**
- Sends reset trigger to Ritual Service
- Sends streak data to UI

### 13.3 Inventory Management Service Integration

**Inbound:**
- Receives completion data from Inventory Service (optional)
- Receives reset acknowledgment

**Outbound:**
- Sends reset trigger to Inventory Service
- Sends streak data to UI

### 13.4 UI Component Integration

**Data Transformation:**
- Domain model transformed to UI format
- Timestamps converted to SGT for display
- Streak data formatted for display
- Chart data formatted for chart library

---

## 14. Error Handling & Exceptions

### 14.1 Domain Exceptions

**CompletionLogNotFoundException**
- Thrown when completion log not found
- Includes completion log ID
- Handled by application layer

**CompletionRecordNotFoundException**
- Thrown when record not found
- Includes record ID
- Handled by application layer

**StreakCalculationFailedException**
- Thrown when streak calculation fails
- Includes error details
- Triggers retry logic

**DataArchivalFailedException**
- Thrown when archival fails
- Includes error details
- Triggers retry logic

**DataSyncFailedException**
- Thrown when sync fails
- Includes error details
- Triggers retry logic

**OfflineQueueException**
- Thrown when queue operation fails
- Includes error details
- Triggers error handling

**MilestoneCalculationFailedException**
- Thrown when milestone calculation fails
- Includes error details
- Triggers retry logic

---

## 15. Design Decisions & Rationale

### 15.1 CompletionLog as Aggregate Root

**Decision:** CompletionLog is aggregate root, CompletionRecord is child entity

**Rationale:**
- Completion logs are primary entities
- Records are derived from logs
- Strong consistency required
- Simpler to implement and maintain

---

### 15.2 Unified Repository

**Decision:** Single CompletionLogRepository, records accessed through CompletionLog

**Rationale:**
- Enforces aggregate boundary
- Simpler to maintain consistency
- Natural transaction boundary
- Aligns with DDD principles

---

### 15.3 Anti-Corruption Layer

**Decision:** ACL between domain and Google Sheets API

**Rationale:**
- Protects domain from API changes
- Easier to test domain independently
- Allows future backend switching
- Follows DDD best practices

---

### 15.4 Asynchronous Events

**Decision:** Domain events published asynchronously

**Rationale:**
- Better performance
- Better decoupling
- Better resilience
- Scales better

---

### 15.5 Automatic Archival

**Decision:** Automatic archival at 12:00 AM SGT with separate storage

**Rationale:**
- Better performance
- Better data organization
- Clearer separation of active/historical data
- Supports analytics

---

### 15.6 Offline Queue

**Decision:** IndexedDB-based queue with automatic sync

**Rationale:**
- Better reliability
- Persistent storage
- Automatic sync on connection
- Supports conflict resolution

---

### 15.7 Per-Module Streaks

**Decision:** Per-module-type streaks with 50% completion threshold

**Rationale:**
- More granular tracking
- User control over threshold
- Better motivation tracking
- Supports different module types

---

## 16. Summary

This domain model provides a comprehensive DDD specification for the Data Persistence & Consistency Tracking Service with:

- Clear aggregate boundaries (CompletionLog as root)
- Rich value objects (ModuleType, ModuleName, CompletionPercentage, Streak, Milestone, etc.)
- Comprehensive domain events (10 event types)
- Well-defined repositories (5 repository interfaces)
- Powerful domain services (8 services)
- Clear business rules and policies (7 policies)
- Anti-Corruption Layer for external API isolation
- Asynchronous event publishing for decoupling
- Singapore Time (UTC+8) integration throughout
- Soft delete for data recovery
- Offline queue management with conflict resolution
- Automatic archival and reset
- Streak calculation and milestone tracking
- Dashboard data aggregation
- Full lifecycle management for logs and records

**Key Characteristics:**
- Type-safe with value objects
- Consistent with Singapore Time (UTC+8)
- Supports multiple module types
- Handles data persistence and archival
- Calculates streaks and milestones
- Manages offline operations
- Maintains audit trail through domain events
- Preserves data through soft deletes
- Decoupled from external APIs through ACL
- Resilient through asynchronous event publishing
- Optimized for performance with caching and async operations

This model is ready for implementation with clear contracts for repositories, services, and event handlers.

