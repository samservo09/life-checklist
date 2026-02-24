# Unit 1: Checklist Management System - Domain Driven Design Model

## Executive Summary

This document defines the complete Domain Driven Design (DDD) domain model for the Checklist Management Service. The model encompasses all tactical components including aggregates, entities, value objects, domain events, policies, repositories, and domain services.

**Key Design Decisions:**
- Checklist as aggregate root with ChecklistItem as child entity
- Unified ChecklistRepository for data access
- Anti-Corruption Layer for Google Sheets API integration
- Asynchronous domain event publishing
- Application layer handles timezone conversion (Singapore Time UTC+8)
- Domain works with UTC internally

---

## 1. Ubiquitous Language

### Core Domain Terms

**Checklist:** A collection of tasks organized by type (chores, self-care, bathroom, gym, rto) with reset cycles (daily, weekly, bi-weekly, monthly).

**ChecklistItem:** An individual task within a checklist with completion status, category, and metadata.

**ChecklistType:** The classification of a checklist (chores, self-care, bathroom, gym, rto).

**Category:** The frequency/cycle of a task (daily, weekly, bi-weekly, monthly, morning, evening).

**ResetCycle:** The frequency at which a checklist or category resets (daily, weekly, bi-weekly, monthly).

**LowEnergyMode:** A simplified view showing only 4 fallback essential tasks for users with limited capacity.

**CompletionStatus:** The state of a task (completed, uncompleted).

**CompletionPercentage:** The ratio of completed items to total items in a checklist.

**Fallback Tasks:** Essential tasks shown in low energy mode: [Wipe one surface, Take out trash bag, Do dishes for 5 mins, Put 10 things away].

**Reset:** The process of clearing completed items and archiving completion data at scheduled times.

**Archive:** Historical record of completion data before reset.

**Timezone:** Singapore Time (SGT, UTC+8) - used for reset scheduling and user display.

---

## 2. Bounded Context

### Context Name
**Checklist Management Bounded Context**

### Context Responsibility
Manages the creation, modification, completion tracking, and lifecycle of checklists across multiple types and reset cycles. Handles low energy mode for neurodivergent users and coordinates with consistency tracking for data archival.

### Context Boundaries
- **Inbound:** Receives reset triggers from Consistency Tracking context
- **Outbound:** Sends completion events to Consistency Tracking context
- **Internal:** Manages all checklist operations, item management, and state transitions

### Ubiquitous Language Scope
All terms defined in Section 1 apply within this context.

---

## 3. Aggregate Design

### 3.1 Checklist Aggregate Root

**Aggregate Root:** Checklist

**Responsibility:** Manages all checklist operations, maintains consistency of checklist state, and coordinates with child entities.

**Aggregate Boundary:**
```
Checklist (Aggregate Root)
├── ChecklistId (Value Object)
├── ChecklistType (Value Object)
├── ChecklistItems (Collection of Child Entities)
├── LowEnergyMode (Value Object)
├── CompletionPercentage (Value Object)
├── LastResetAt (Value Object)
└── CreatedAt (Value Object)
```

**Aggregate Invariants:**
1. A checklist must have a valid ChecklistType
2. A checklist must have at least one ChecklistItem
3. CompletionPercentage must be between 0-100
4. All ChecklistItems must belong to the same Checklist
5. ChecklistItems must maintain order
6. LowEnergyMode can only show fallback tasks
7. LastResetAt must be a valid timestamp

**Aggregate Lifecycle:**
1. **Created:** Checklist initialized with type and default items
2. **Active:** Checklist in use, items can be added/edited/completed
3. **Archived:** Checklist data archived before reset
4. **Deleted:** Soft delete, data preserved for recovery

**Key Operations:**
- Create checklist with type
- Add item to checklist
- Edit item in checklist
- Complete/uncomplete item
- Delete item (soft delete)
- Toggle low energy mode
- Calculate completion percentage
- Reset checklist
- Archive checklist data

---

## 4. Entities

### 4.1 ChecklistItem Entity

**Entity Identity:** ChecklistItemId (unique within Checklist)

**Responsibility:** Represents a single task within a checklist with completion tracking.

**Properties:**
- ChecklistItemId: Unique identifier
- Name: Task name (string, 1-255 characters)
- Category: Task frequency (daily, weekly, bi-weekly, monthly, morning, evening)
- CompletionStatus: Current completion state
- CompletedAt: Timestamp of completion (nullable)
- Order: Position in checklist (integer)
- Notes: Optional task notes (string, 0-500 characters)
- CreatedAt: Creation timestamp
- UpdatedAt: Last modification timestamp
- IsDeleted: Soft delete flag

**Entity Invariants:**
1. Name must not be empty
2. Name must not exceed 255 characters
3. Category must be valid
4. Order must be non-negative
5. CompletedAt must be null if not completed
6. UpdatedAt must be >= CreatedAt

**Entity Lifecycle:**
1. **Created:** Item added to checklist
2. **Pending:** Item awaiting completion
3. **Completed:** Item marked complete
4. **Edited:** Item properties modified
5. **Deleted:** Soft delete, data preserved

**Key Operations:**
- Create item with properties
- Mark complete/incomplete
- Edit item properties
- Delete item (soft delete)
- Get completion status
- Get item metadata

---

## 5. Value Objects

### 5.1 ChecklistId

**Purpose:** Unique identifier for Checklist aggregate

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Uniquely identifies a Checklist
- Generated on creation

---

### 5.2 ChecklistItemId

**Purpose:** Unique identifier for ChecklistItem entity

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Unique within Checklist
- Generated on creation

---

### 5.3 ChecklistType

**Purpose:** Encapsulates checklist type classification

**Valid Values:**
- CHORES: Daily chore board
- SELF_CARE: Morning/evening routines
- BATHROOM: Bathroom cleaning tasks
- GYM: Gym bag checklist
- RTO: Return to office checklist

**Characteristics:**
- Immutable
- Enumerated type
- Determines default items and reset behavior
- Validates type-specific rules

**Type-Specific Behavior:**
- CHORES: Supports daily, weekly, bi-weekly, monthly categories
- SELF_CARE: Supports morning, evening categories
- BATHROOM: Supports daily category
- GYM: Supports single-use category (no reset cycle)
- RTO: Supports single-use category (no reset cycle)

---

### 5.4 Category

**Purpose:** Encapsulates task frequency/cycle

**Valid Values:**
- DAILY: Resets daily at 12:00 AM SGT
- WEEKLY: Resets Sunday at 12:00 AM SGT
- BI_WEEKLY: Resets every other Sunday at 12:00 AM SGT
- MONTHLY: Resets 1st of month at 12:00 AM SGT
- MORNING: Daily morning routine
- EVENING: Daily evening routine
- SINGLE_USE: No automatic reset (gym, rto)

**Characteristics:**
- Immutable
- Enumerated type
- Determines reset timing
- Validates category-type compatibility

**Reset Timing (Singapore Time UTC+8):**
- DAILY: Every day at 00:00 SGT
- WEEKLY: Every Sunday at 00:00 SGT
- BI_WEEKLY: Every other Sunday at 00:00 SGT
- MONTHLY: 1st of month at 00:00 SGT
- MORNING: Daily at 00:00 SGT (same as daily)
- EVENING: Daily at 00:00 SGT (same as daily)
- SINGLE_USE: No automatic reset

---

### 5.5 CompletionStatus

**Purpose:** Encapsulates task completion state

**Properties:**
- IsCompleted: Boolean flag
- CompletedAt: Timestamp (nullable)

**Characteristics:**
- Immutable (creates new instance on change)
- Tracks completion timestamp
- Validates state transitions

**Valid Transitions:**
- Uncompleted → Completed (sets CompletedAt)
- Completed → Uncompleted (clears CompletedAt)

---

### 5.6 LowEnergyMode

**Purpose:** Encapsulates low energy mode state and fallback tasks

**Properties:**
- IsEnabled: Boolean flag
- FallbackTasks: Fixed list of 4 essential tasks

**Fallback Tasks:**
1. Wipe one surface (counter or desk)
2. Take out trash bag
3. Do dishes for 5 mins
4. Put 10 things away to their places

**Characteristics:**
- Immutable
- Toggleable
- Always shows same 4 fallback tasks
- Doesn't restrict access to full list

**Behavior:**
- When enabled: Display only fallback tasks
- When disabled: Display all tasks
- User can still complete items from full list even in low energy mode

---

### 5.7 CompletionPercentage

**Purpose:** Encapsulates completion percentage calculation

**Properties:**
- Value: Integer 0-100
- CompletedCount: Number of completed items
- TotalCount: Total number of items

**Characteristics:**
- Immutable (recalculated on change)
- Always valid (0-100)
- Calculated from item states

**Calculation:**
- If TotalCount = 0: Return 0
- Otherwise: (CompletedCount / TotalCount) * 100, rounded to nearest integer

---

### 5.8 ResetCycle

**Purpose:** Encapsulates reset frequency and timing rules

**Properties:**
- Frequency: DAILY, WEEKLY, BI_WEEKLY, MONTHLY, SINGLE_USE
- NextResetTime: Calculated next reset timestamp (UTC)
- LastResetTime: Last reset timestamp (UTC)

**Characteristics:**
- Immutable (recalculated on reset)
- Timezone-aware (converts SGT to UTC)
- Determines reset eligibility

**Reset Timing Logic (Singapore Time UTC+8):**
- DAILY: Next reset = Tomorrow at 00:00 SGT
- WEEKLY: Next reset = Next Sunday at 00:00 SGT
- BI_WEEKLY: Next reset = Next Sunday (every other week) at 00:00 SGT
- MONTHLY: Next reset = 1st of next month at 00:00 SGT
- SINGLE_USE: No automatic reset

---

### 5.9 ItemOrder

**Purpose:** Encapsulates item ordering within checklist

**Properties:**
- Value: Integer (0-based index)

**Characteristics:**
- Immutable
- Non-negative
- Supports reordering

---

### 5.10 Timestamp

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

### 6.1 ChecklistCreatedEvent

**Trigger:** When a new checklist is created

**Properties:**
- ChecklistId: Identifier of created checklist
- ChecklistType: Type of checklist
- CreatedAt: Creation timestamp (UTC)
- InitialItems: List of default items

**Subscribers:**
- Consistency Tracking Service (for tracking)
- Audit Service (for logging)

---

### 6.2 ChecklistItemAddedEvent

**Trigger:** When an item is added to checklist

**Properties:**
- ChecklistId: Parent checklist identifier
- ChecklistItemId: Identifier of added item
- ItemName: Name of added item
- Category: Category of item
- AddedAt: Addition timestamp (UTC)
- Order: Position in checklist

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.3 ChecklistItemCompletedEvent

**Trigger:** When an item is marked complete

**Properties:**
- ChecklistId: Parent checklist identifier
- ChecklistItemId: Identifier of completed item
- ItemName: Name of item
- CompletedAt: Completion timestamp (UTC)
- CompletionPercentage: Updated completion percentage

**Subscribers:**
- Consistency Tracking Service (for streak calculation)
- Audit Service

---

### 6.4 ChecklistItemUncompletedEvent

**Trigger:** When a completed item is marked incomplete

**Properties:**
- ChecklistId: Parent checklist identifier
- ChecklistItemId: Identifier of uncompleted item
- ItemName: Name of item
- UncompletedAt: Timestamp of uncompleting (UTC)
- CompletionPercentage: Updated completion percentage

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.5 ChecklistItemEditedEvent

**Trigger:** When an item is edited

**Properties:**
- ChecklistId: Parent checklist identifier
- ChecklistItemId: Identifier of edited item
- OldValues: Previous item properties
- NewValues: Updated item properties
- EditedAt: Edit timestamp (UTC)

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.6 ChecklistItemDeletedEvent

**Trigger:** When an item is deleted (soft delete)

**Properties:**
- ChecklistId: Parent checklist identifier
- ChecklistItemId: Identifier of deleted item
- ItemName: Name of deleted item
- DeletedAt: Deletion timestamp (UTC)
- IsRecoverable: Flag indicating if item can be recovered

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.7 ChecklistResetEvent

**Trigger:** When checklist is reset at scheduled time

**Properties:**
- ChecklistId: Identifier of reset checklist
- ResetType: Type of reset (DAILY, WEEKLY, BI_WEEKLY, MONTHLY)
- ResetAt: Reset timestamp (UTC)
- ArchivedData: Completion data before reset
- ItemsReset: Number of items reset

**Subscribers:**
- Consistency Tracking Service (for archival)
- Audit Service

---

### 6.8 LowEnergyModeToggledEvent

**Trigger:** When low energy mode is toggled

**Properties:**
- ChecklistId: Identifier of checklist
- IsEnabled: New mode state
- ToggledAt: Toggle timestamp (UTC)

**Subscribers:**
- Audit Service

---

### 6.9 ChecklistArchivedEvent

**Trigger:** When checklist data is archived

**Properties:**
- ChecklistId: Identifier of archived checklist
- ArchivedAt: Archive timestamp (UTC)
- CompletionData: Archived completion information
- ItemsArchived: Number of items archived

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

## 7. Repositories

### 7.1 ChecklistRepository Interface

**Purpose:** Abstract data access for Checklist aggregate

**Responsibility:** Persist and retrieve Checklist aggregates with all child entities

**Methods:**

**save(checklist: Checklist): void**
- Persists checklist and all items to storage
- Creates new or updates existing
- Maintains transactional consistency
- Publishes domain events

**findById(checklistId: ChecklistId): Checklist | null**
- Retrieves checklist by ID
- Loads all child items
- Returns null if not found

**findByType(checklistType: ChecklistType): Checklist[]**
- Retrieves all checklists of given type
- Returns empty array if none found

**findAll(): Checklist[]**
- Retrieves all checklists
- Returns empty array if none found

**delete(checklistId: ChecklistId): void**
- Soft deletes checklist
- Preserves data for recovery
- Publishes deletion event

**findDeleted(): Checklist[]**
- Retrieves soft-deleted checklists
- Used for recovery operations

**Query Methods:**
- findByTypeAndCategory(type, category): Checklist[]
- findByLastResetBefore(timestamp): Checklist[]
- findNeedingReset(): Checklist[]

---

## 8. Domain Services

### 8.1 ChecklistResetService

**Purpose:** Encapsulate reset logic for different reset cycles

**Responsibility:** Determine reset eligibility, execute resets, coordinate archival

**Operations:**

**shouldReset(checklist: Checklist): boolean**
- Determines if checklist needs reset
- Checks current time against next reset time
- Considers Singapore Time (UTC+8)
- Returns true if reset needed

**reset(checklist: Checklist, resetType: ResetCycle): Checklist**
- Executes reset operation
- Archives completion data
- Clears completed items
- Updates reset timestamps
- Publishes ChecklistResetEvent
- Returns updated checklist

**calculateNextResetTime(category: Category): Timestamp**
- Calculates next reset time based on category
- Handles Singapore Time (UTC+8)
- Accounts for daylight saving (none in Singapore)
- Returns UTC timestamp

**resetDaily(checklist: Checklist): Checklist**
- Resets daily items
- Executes at 12:00 AM SGT

**resetWeekly(checklist: Checklist): Checklist**
- Resets weekly items
- Executes Sunday at 12:00 AM SGT

**resetBiWeekly(checklist: Checklist): Checklist**
- Resets bi-weekly items
- Executes every other Sunday at 12:00 AM SGT

**resetMonthly(checklist: Checklist): Checklist**
- Resets monthly items
- Executes 1st of month at 12:00 AM SGT

---

### 8.2 ChecklistCompletionService

**Purpose:** Encapsulate completion calculation and tracking

**Responsibility:** Calculate completion percentage, determine streak eligibility, track progress

**Operations:**

**calculateCompletion(checklist: Checklist): CompletionPercentage**
- Calculates completion percentage
- Counts completed items
- Divides by total items
- Returns percentage (0-100)

**isEligibleForStreak(checklist: Checklist): boolean**
- Determines if completion qualifies for streak
- Checks if completion >= 50%
- Returns boolean

**getCompletionSummary(checklist: Checklist): CompletionSummary**
- Returns completion details
- Includes percentage, count, items
- Used for dashboard display

---

### 8.3 LowEnergyModeService

**Purpose:** Encapsulate low energy mode logic

**Responsibility:** Filter items for low energy mode, manage fallback tasks

**Operations:**

**toggleLowEnergyMode(checklist: Checklist): Checklist**
- Toggles low energy mode state
- Publishes LowEnergyModeToggledEvent
- Returns updated checklist

**getFallbackItems(checklist: Checklist): ChecklistItem[]**
- Returns 4 fallback essential tasks
- Maintains order
- Includes completion status

**getFilteredItems(checklist: Checklist): ChecklistItem[]**
- Returns items based on mode
- If low energy: returns fallback items
- If normal: returns all items

---

### 8.4 ChecklistItemManagementService

**Purpose:** Encapsulate item CRUD operations

**Responsibility:** Add, edit, delete items with validation

**Operations:**

**addItem(checklist: Checklist, itemData: ItemData): Checklist**
- Adds new item to checklist
- Validates item properties
- Checks for duplicates
- Publishes ChecklistItemAddedEvent
- Returns updated checklist

**editItem(checklist: Checklist, itemId: ChecklistItemId, updates: ItemUpdates): Checklist**
- Edits existing item
- Validates changes
- Publishes ChecklistItemEditedEvent
- Returns updated checklist

**deleteItem(checklist: Checklist, itemId: ChecklistItemId): Checklist**
- Soft deletes item
- Publishes ChecklistItemDeletedEvent
- Returns updated checklist

**completeItem(checklist: Checklist, itemId: ChecklistItemId): Checklist**
- Marks item complete
- Sets completion timestamp
- Publishes ChecklistItemCompletedEvent
- Returns updated checklist

**uncompleteItem(checklist: Checklist, itemId: ChecklistItemId): Checklist**
- Marks item incomplete
- Clears completion timestamp
- Publishes ChecklistItemUncompletedEvent
- Returns updated checklist

---

### 8.5 ChecklistValidationService

**Purpose:** Encapsulate validation rules

**Responsibility:** Validate item properties, enforce business constraints

**Operations:**

**validateItemName(name: string): ValidationResult**
- Validates item name
- Checks length (1-255 characters)
- Checks for special characters
- Returns validation result

**validateCategory(category: Category, checklistType: ChecklistType): ValidationResult**
- Validates category for checklist type
- Ensures compatibility
- Returns validation result

**validateDuplicate(checklist: Checklist, itemName: string): ValidationResult**
- Checks for duplicate items
- Returns warning if duplicate found
- Returns validation result

**validateItemProperties(itemData: ItemData): ValidationResult**
- Validates all item properties
- Runs all validation rules
- Returns comprehensive result

---

## 9. Business Rules & Policies

### 9.1 ChecklistResetPolicy

**Rule 1: Daily Reset**
- Executes every day at 12:00 AM Singapore Time (UTC+8)
- Resets all items with DAILY category
- Archives completion data before reset
- Publishes ChecklistResetEvent

**Rule 2: Weekly Reset**
- Executes every Sunday at 12:00 AM Singapore Time
- Resets all items with WEEKLY category
- Archives completion data before reset
- Publishes ChecklistResetEvent

**Rule 3: Bi-Weekly Reset**
- Executes every other Sunday at 12:00 AM Singapore Time
- Resets all items with BI_WEEKLY category
- Tracks bi-weekly cycle
- Archives completion data before reset

**Rule 4: Monthly Reset**
- Executes on 1st of month at 12:00 AM Singapore Time
- Resets all items with MONTHLY category
- Archives completion data before reset
- Publishes ChecklistResetEvent

**Rule 5: Timezone Handling**
- All reset times calculated in Singapore Time (UTC+8)
- Application layer converts SGT to UTC for domain
- Domain works with UTC internally
- No daylight saving time in Singapore

---

### 9.2 LowEnergyModePolicy

**Rule 1: Fallback Tasks**
- Low energy mode shows exactly 4 fallback tasks
- Fallback tasks are fixed and cannot be customized
- Fallback tasks: [Wipe one surface, Take out trash bag, Do dishes for 5 mins, Put 10 things away]

**Rule 2: Mode Persistence**
- Low energy mode state persists during session
- State resets on page refresh (unless persisted to backend)
- User can toggle mode at any time

**Rule 3: Full List Access**
- Low energy mode doesn't restrict access to full list
- User can still complete items from full list
- Completion of full list items counts toward completion percentage

**Rule 4: Mode Indication**
- Visual indicator shows which mode is active
- Clear distinction between modes
- User always knows current mode

---

### 9.3 CompletionPolicy

**Rule 1: Completion Calculation**
- Completion percentage = (CompletedCount / TotalCount) * 100
- Rounded to nearest integer
- If no items: 0%
- If all items completed: 100%

**Rule 2: Idempotency**
- Rapid clicking doesn't cause duplicate submissions
- Completion state is idempotent
- Multiple identical requests produce same result

**Rule 3: Offline Handling**
- Offline completions are queued locally
- Queue syncs when connection restored
- Offline changes don't block user interaction

**Rule 4: Streak Eligibility**
- Completion >= 50% qualifies for streak
- Completion < 50% breaks streak
- Streaks tracked by Consistency Tracking Service

---

### 9.4 ItemManagementPolicy

**Rule 1: Duplicate Prevention**
- System warns if duplicate item name detected
- Allows user to proceed or cancel
- Doesn't prevent duplicates (user choice)

**Rule 2: Item Name Validation**
- Minimum length: 1 character
- Maximum length: 255 characters
- Special characters allowed
- Trimmed of leading/trailing whitespace

**Rule 3: Soft Delete**
- Deleted items marked as deleted, not removed
- Data preserved for recovery
- Soft deleted items don't appear in normal view
- Can be recovered within grace period

**Rule 4: Edit History**
- Edits don't affect completion history
- Before/after values logged for audit
- Concurrent edits handled gracefully
- Last-write-wins strategy

---

### 9.5 ArchivalPolicy

**Rule 1: Archive Timing**
- Completion data archived before reset
- Archive includes date, completion %, items
- Archive timestamp recorded

**Rule 2: Data Preservation**
- Archive doesn't interfere with active data
- Active data cleared after archival
- Historical data accessible for analytics

**Rule 3: Archive Integrity**
- Large archives don't impact performance
- Archive stored separately from active data
- Archive queryable by date range

---

## 10. Anti-Corruption Layer

### 10.1 Purpose
Isolate domain model from Google Sheets API changes, providing translation between domain concepts and external API.

### 10.2 Responsibilities
- Translate domain Checklist to Google Sheets format
- Translate Google Sheets data to domain Checklist
- Handle API errors and exceptions
- Manage API authentication and rate limiting

### 10.3 Key Interfaces

**ChecklistToSheetTranslator**
- Converts Checklist aggregate to Google Sheets row format
- Handles nested ChecklistItems
- Manages timestamp conversion (UTC to SGT for display)

**SheetToChecklistTranslator**
- Converts Google Sheets row to Checklist aggregate
- Reconstructs ChecklistItems
- Validates data integrity

**GoogleSheetsChecklistRepository**
- Implements ChecklistRepository interface
- Uses Google Sheets API for persistence
- Handles API errors gracefully
- Implements retry logic

---

## 11. Event Publishing

### 11.1 Asynchronous Event Publishing

**Mechanism:**
- Domain events published to message broker (e.g., RabbitMQ, Kafka)
- Event handlers process asynchronously
- Decouples services

**Event Flow:**
1. Domain operation completes
2. Domain event created
3. Event published to message broker
4. Event handler receives event
5. Handler processes event
6. Consistency Tracking Service receives event

**Benefits:**
- Non-blocking user operations
- Better performance
- Service independence
- Resilience through retries

---

## 12. Aggregate Lifecycle & State Transitions

### 12.1 Checklist Aggregate States

**State 1: Created**
- Checklist initialized with type
- Default items added
- Ready for use

**State 2: Active**
- Checklist in use
- Items can be added/edited/completed
- Normal operations

**State 3: Archived**
- Completion data archived
- Items reset
- Preparation for next cycle

**State 4: Deleted**
- Soft delete
- Data preserved
- Can be recovered

### 12.2 ChecklistItem Entity States

**State 1: Created**
- Item added to checklist
- Pending completion

**State 2: Pending**
- Item awaiting completion
- Can be edited or deleted

**State 3: Completed**
- Item marked complete
- Completion timestamp recorded

**State 4: Edited**
- Item properties modified
- Edit history maintained

**State 5: Deleted**
- Soft delete
- Data preserved

---

## 13. Integration Points

### 13.1 Consistency Tracking Service Integration

**Inbound:**
- Receives ChecklistResetEvent
- Receives ChecklistItemCompletedEvent
- Receives ChecklistArchivedEvent

**Outbound:**
- Sends reset trigger to ChecklistResetService
- Receives completion data for streak calculation
- Receives archived data for historical tracking

**Data Flow:**
1. User completes item
2. ChecklistItemCompletedEvent published
3. Consistency Tracking Service receives event
4. Service updates streak and completion rate
5. Service publishes milestone events

---

### 13.2 UI Component Integration

**Data Transformation:**
- Domain model transformed to UI format
- Timestamps converted to SGT for display
- Completion percentage formatted for display
- Low energy mode items filtered

**Accessibility:**
- High-contrast colors applied
- Clear status indicators
- Keyboard navigation supported
- Screen reader compatible

---

### 13.3 Persistence Integration

**Google Sheets API:**
- Anti-Corruption Layer handles API calls
- Checklist data persisted to Google Sheets
- Offline queue managed by Hosting Service
- Sync triggered when online

---

## 14. Error Handling & Exceptions

### 14.1 Domain Exceptions

**ChecklistNotFoundException**
- Thrown when checklist not found
- Includes checklist ID
- Handled by application layer

**ChecklistItemNotFoundException**
- Thrown when item not found
- Includes item ID and checklist ID
- Handled by application layer

**InvalidChecklistTypeException**
- Thrown when invalid checklist type provided
- Includes invalid type value
- Handled by validation service

**InvalidCategoryException**
- Thrown when invalid category provided
- Includes invalid category value
- Handled by validation service

**DuplicateItemException**
- Thrown when duplicate item detected
- Includes item name
- User can choose to proceed or cancel

**InvalidCompletionStateException**
- Thrown when invalid state transition attempted
- Includes current and requested states
- Handled by completion service

**ArchivalFailedException**
- Thrown when archival fails
- Includes error details
- Triggers retry logic

---

## 15. Design Decisions & Rationale

### 15.1 Checklist as Aggregate Root

**Decision:** Checklist is aggregate root, ChecklistItem is child entity

**Rationale:**
- Checklists are small (5-20 items)
- Operations often affect multiple items
- Strong consistency required
- Simpler to implement and maintain
- Aligns with user mental model

---

### 15.2 Unified Repository

**Decision:** Single ChecklistRepository, items accessed through Checklist

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

### 15.5 Application Layer Timezone Handling

**Decision:** Application layer handles SGT to UTC conversion

**Rationale:**
- Keeps domain simple
- Timezone is user preference, not business rule
- Easier to test
- Clearer separation of concerns

---

## 16. Summary

This domain model provides a comprehensive DDD specification for the Checklist Management Service with:

- Clear aggregate boundaries (Checklist as root)
- Rich value objects (ChecklistType, Category, CompletionStatus, etc.)
- Comprehensive domain events (9 event types)
- Domain services for complex logic
- Well-defined business rules and policies
- Anti-Corruption Layer for external integration
- Asynchronous event publishing
- Singapore Time (UTC+8) timezone handling
- Soft delete for data recovery
- Strong consistency guarantees

The model is ready for implementation with clear responsibilities, invariants, and integration points.
