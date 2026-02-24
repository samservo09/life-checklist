# Unit 2: Ritual Management System - Domain Driven Design Model

## Executive Summary

This document defines the complete Domain Driven Design (DDD) domain model for the Ritual Management Service. The model encompasses all tactical components including aggregates, entities, value objects, domain events, policies, repositories, and domain services.

**Key Design Decisions:**
- Ritual as aggregate root with RitualStep as child entity
- Unified RitualRepository for data access
- Anti-Corruption Layer for Google Sheets API integration
- Asynchronous domain event publishing
- Application layer handles timezone conversion (Singapore Time UTC+8)
- Domain works with UTC internally
- Manual override capability for day variants
- Product customization support

---

## 1. Ubiquitous Language

### Core Domain Terms

**Ritual:** A sequence of steps organized by day-of-week variant with product rotations and universal post-ritual steps.

**RitualStep:** An individual step within a ritual with completion status, day schedule, and metadata.

**RitualType:** The classification of a ritual (currently only "bath").

**DaySchedule:** The day-of-week grouping for a step (MWFSat, TTHSun, Universal).

**DayVariant:** The current day-of-week variant determining which product set to use (MWFSat or TTHSun).

**ProductRotation:** The set of products used for a specific day variant (MWFSat vs TTHSun).

**UniversalSteps:** Steps that apply to all days regardless of variant (Body oil, Lotion, Powder, Perfume).

**CompletionStatus:** The state of a step (completed, uncompleted).

**CompletionPercentage:** The ratio of completed steps to total steps for current day variant.

**ManualOverride:** User's ability to manually override the automatic day variant determination.

**Timezone:** Singapore Time (SGT, UTC+8) - used for day variant determination.

---

## 2. Bounded Context

### Context Name
**Ritual Management Bounded Context**

### Context Responsibility
Manages the creation, modification, completion tracking, and lifecycle of rituals with day-of-week conditional logic. Handles product rotations, universal steps, and coordinates with consistency tracking for data archival.

### Context Boundaries
- **Inbound:** Receives reset triggers from Consistency Tracking context
- **Outbound:** Sends completion events to Consistency Tracking context
- **Internal:** Manages all ritual operations, step management, and state transitions

---

## 3. Aggregate Design

### 3.1 Ritual Aggregate Root

**Aggregate Root:** Ritual

**Responsibility:** Manages all ritual operations, maintains consistency of ritual state, and coordinates with child entities.

**Aggregate Boundary:**
```
Ritual (Aggregate Root)
├── RitualId (Value Object)
├── RitualType (Value Object)
├── RitualSteps (Collection of Child Entities)
├── CurrentDayVariant (Value Object)
├── CompletionPercentage (Value Object)
├── ManualOverride (Value Object)
├── ProductRotations (Value Object)
└── CreatedAt (Value Object)
```

**Aggregate Invariants:**
1. A ritual must have a valid RitualType
2. A ritual must have at least one RitualStep
3. CompletionPercentage must be between 0-100
4. All RitualSteps must belong to the same Ritual
5. RitualSteps must maintain order
6. CurrentDayVariant must be valid (MWFSat or TTHSun)
7. ProductRotations must match day variant
8. UniversalSteps must always be present

**Aggregate Lifecycle:**
1. **Created:** Ritual initialized with type and default steps
2. **Active:** Ritual in use, steps can be added/edited/completed
3. **Archived:** Ritual data archived after completion
4. **Deleted:** Soft delete, data preserved for recovery

---

## 4. Entities

### 4.1 RitualStep Entity

**Entity Identity:** RitualStepId (unique within Ritual)

**Responsibility:** Represents a single step within a ritual with completion tracking and day schedule assignment.

**Properties:**
- RitualStepId: Unique identifier
- Name: Step name (string, 1-255 characters)
- DaySchedule: Day grouping (MWFSat, TTHSun, Universal)
- CompletionStatus: Current completion state
- CompletedAt: Timestamp of completion (nullable)
- Order: Position in ritual (integer)
- Notes: Optional step notes (string, 0-500 characters)
- CreatedAt: Creation timestamp
- UpdatedAt: Last modification timestamp
- IsDeleted: Soft delete flag

**Entity Invariants:**
1. Name must not be empty
2. Name must not exceed 255 characters
3. DaySchedule must be valid
4. Order must be non-negative
5. CompletedAt must be null if not completed
6. UpdatedAt must be >= CreatedAt

---

## 5. Value Objects

### 5.1 RitualId

**Purpose:** Unique identifier for Ritual aggregate

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Uniquely identifies a Ritual
- Generated on creation

### 5.2 RitualStepId

**Purpose:** Unique identifier for RitualStep entity

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Unique within Ritual
- Generated on creation

### 5.3 RitualType

**Purpose:** Encapsulates ritual type classification

**Valid Values:**
- BATH: Bath ritual with product rotations

**Characteristics:**
- Immutable
- Enumerated type
- Determines default steps and behavior
- Validates type-specific rules

### 5.4 DaySchedule

**Purpose:** Encapsulates day-of-week grouping for steps

**Valid Values:**
- MWFSAT: Monday, Wednesday, Friday, Saturday
- TTHSUN: Tuesday, Thursday, Sunday
- UNIVERSAL: All days

**Characteristics:**
- Immutable
- Enumerated type
- Determines step visibility based on day variant
- Validates schedule compatibility

### 5.5 CurrentDayVariant

**Purpose:** Encapsulates current day-of-week variant determination

**Valid Values:**
- MWFSAT: Monday, Wednesday, Friday, Saturday variant
- TTHSUN: Tuesday, Thursday, Sunday variant

**Properties:**
- Variant: Current variant (MWFSAT or TTHSUN)
- DeterminedAt: Timestamp of determination (UTC)
- IsManualOverride: Flag indicating manual override

**Characteristics:**
- Immutable (recalculated daily)
- Timezone-aware (Singapore Time UTC+8)
- Supports manual override
- Determines which product set to use

### 5.6 CompletionStatus

**Purpose:** Encapsulates step completion state

**Properties:**
- IsCompleted: Boolean flag
- CompletedAt: Timestamp (nullable)

**Characteristics:**
- Immutable (creates new instance on change)
- Tracks completion timestamp
- Validates state transitions

### 5.7 ProductRotation

**Purpose:** Encapsulates product set for each day variant

**Properties:**
- MWFSatProducts: Product list for MWFSat days
- TTHSunProducts: Product list for TTHSun days
- UniversalProducts: Products for all days

**MWFSat Products:**
1. Shampoo + Selsun blue
2. Soap
3. Conditioner

**TTHSun Products:**
1. Clarifying shampoo
2. Soap
3. Conditioner
4. Scrub with body wash

**Universal Products:**
1. Body oil
2. Lotion
3. Powder
4. Perfume

**Characteristics:**
- Immutable (creates new instance on change)
- Customizable by user
- Maintains product order
- Supports product override

### 5.8 CompletionPercentage

**Purpose:** Encapsulates completion percentage calculation

**Properties:**
- Value: Integer 0-100
- CompletedCount: Number of completed steps
- TotalCount: Total number of steps for current variant

**Characteristics:**
- Immutable (recalculated on change)
- Always valid (0-100)
- Calculated from step states
- Variant-specific calculation

### 5.9 ManualOverride

**Purpose:** Encapsulates manual day variant override

**Properties:**
- IsOverridden: Boolean flag
- OverriddenVariant: Manually selected variant (nullable)
- OverriddenAt: Timestamp of override (nullable)

**Characteristics:**
- Immutable (creates new instance on change)
- Allows user to override automatic determination
- Tracks override timestamp
- Can be cleared to return to automatic

### 5.10 StepOrder

**Purpose:** Encapsulates step ordering within ritual

**Properties:**
- Value: Integer (0-based index)

**Characteristics:**
- Immutable
- Non-negative
- Supports reordering

---

## 6. Domain Events

### 6.1 RitualCreatedEvent

**Trigger:** When a new ritual is created

**Properties:**
- RitualId: Identifier of created ritual
- RitualType: Type of ritual
- CreatedAt: Creation timestamp (UTC)
- InitialSteps: List of default steps

**Subscribers:**
- Consistency Tracking Service
- Audit Service

### 6.2 RitualStepAddedEvent

**Trigger:** When a step is added to ritual

**Properties:**
- RitualId: Parent ritual identifier
- RitualStepId: Identifier of added step
- StepName: Name of added step
- DaySchedule: Day schedule of step
- AddedAt: Addition timestamp (UTC)
- Order: Position in ritual

**Subscribers:**
- Consistency Tracking Service
- Audit Service

### 6.3 RitualStepCompletedEvent

**Trigger:** When a step is marked complete

**Properties:**
- RitualId: Parent ritual identifier
- RitualStepId: Identifier of completed step
- StepName: Name of step
- CompletedAt: Completion timestamp (UTC)
- CurrentDayVariant: Day variant at completion
- CompletionPercentage: Updated completion percentage

**Subscribers:**
- Consistency Tracking Service
- Audit Service

### 6.4 RitualStepUncompletedEvent

**Trigger:** When a completed step is marked incomplete

**Properties:**
- RitualId: Parent ritual identifier
- RitualStepId: Identifier of uncompleted step
- StepName: Name of step
- UncompletedAt: Timestamp of uncompleting (UTC)
- CompletionPercentage: Updated completion percentage

**Subscribers:**
- Consistency Tracking Service
- Audit Service

### 6.5 RitualStepEditedEvent

**Trigger:** When a step is edited

**Properties:**
- RitualId: Parent ritual identifier
- RitualStepId: Identifier of edited step
- OldValues: Previous step properties
- NewValues: Updated step properties
- EditedAt: Edit timestamp (UTC)

**Subscribers:**
- Consistency Tracking Service
- Audit Service

### 6.6 RitualStepDeletedEvent

**Trigger:** When a step is deleted (soft delete)

**Properties:**
- RitualId: Parent ritual identifier
- RitualStepId: Identifier of deleted step
- StepName: Name of deleted step
- DeletedAt: Deletion timestamp (UTC)
- IsRecoverable: Flag indicating if step can be recovered

**Subscribers:**
- Consistency Tracking Service
- Audit Service

### 6.7 RitualCompletedEvent

**Trigger:** When all steps in ritual are completed

**Properties:**
- RitualId: Identifier of completed ritual
- CompletedAt: Completion timestamp (UTC)
- CurrentDayVariant: Day variant at completion
- CompletionPercentage: Final completion percentage

**Subscribers:**
- Consistency Tracking Service
- Audit Service

### 6.8 DayVariantChangedEvent

**Trigger:** When day variant changes (daily or manual override)

**Properties:**
- RitualId: Identifier of ritual
- OldVariant: Previous day variant
- NewVariant: New day variant
- ChangedAt: Change timestamp (UTC)
- IsManualOverride: Flag indicating if manual override

**Subscribers:**
- Consistency Tracking Service
- Audit Service

### 6.9 RitualArchivedEvent

**Trigger:** When ritual data is archived

**Properties:**
- RitualId: Identifier of archived ritual
- ArchivedAt: Archive timestamp (UTC)
- CompletionData: Archived completion information
- StepsArchived: Number of steps archived

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

## 7. Repositories

### 7.1 RitualRepository Interface

**Purpose:** Abstract data access for Ritual aggregate

**Responsibility:** Persist and retrieve Ritual aggregates with all child entities

**Methods:**

**save(ritual: Ritual): void**
- Persists ritual and all steps to storage
- Creates new or updates existing
- Maintains transactional consistency
- Publishes domain events

**findById(ritualId: RitualId): Ritual | null**
- Retrieves ritual by ID
- Loads all child steps
- Returns null if not found

**findByType(ritualType: RitualType): Ritual[]**
- Retrieves all rituals of given type
- Returns empty array if none found

**findAll(): Ritual[]**
- Retrieves all rituals
- Returns empty array if none found

**delete(ritualId: RitualId): void**
- Soft deletes ritual
- Preserves data for recovery
- Publishes deletion event

**findDeleted(): Ritual[]**
- Retrieves soft-deleted rituals
- Used for recovery operations

**Query Methods:**
- findByTypeAndDaySchedule(type, schedule): Ritual[]
- findNeedingReset(): Ritual[]

---

## 8. Domain Services

### 8.1 DayVariantService

**Purpose:** Encapsulate day-of-week variant determination logic

**Responsibility:** Determine current day variant, handle manual overrides, manage variant changes

**Operations:**

**determineDayVariant(currentTime: Timestamp, manualOverride: ManualOverride): CurrentDayVariant**
- Determines current day variant based on Singapore Time
- Checks for manual override
- Returns current variant
- Handles timezone conversion

**getDayVariantForDate(date: Date): DayVariant**
- Gets day variant for specific date
- Handles Singapore Time (UTC+8)
- Returns MWFSAT or TTHSUN

**setManualOverride(ritual: Ritual, variant: DayVariant): Ritual**
- Sets manual override for day variant
- Publishes DayVariantChangedEvent
- Returns updated ritual

**clearManualOverride(ritual: Ritual): Ritual**
- Clears manual override
- Returns to automatic determination
- Publishes DayVariantChangedEvent
- Returns updated ritual

**isMWFSatDay(date: Date): boolean**
- Checks if date is MWFSat day
- Returns true if Monday, Wednesday, Friday, or Saturday

**isTTHSunDay(date: Date): boolean**
- Checks if date is TTHSun day
- Returns true if Tuesday, Thursday, or Sunday

---

### 8.2 RitualCompletionService

**Purpose:** Encapsulate completion calculation and tracking

**Responsibility:** Calculate completion percentage, determine streak eligibility, track progress

**Operations:**

**calculateCompletion(ritual: Ritual): CompletionPercentage**
- Calculates completion percentage for current day variant
- Counts completed steps for variant
- Divides by total steps for variant
- Returns percentage (0-100)

**isEligibleForStreak(ritual: Ritual): boolean**
- Determines if completion qualifies for streak
- Checks if completion >= 50%
- Returns boolean

**getCompletionSummary(ritual: Ritual): CompletionSummary**
- Returns completion details
- Includes percentage, count, steps
- Used for dashboard display

**getVariantSteps(ritual: Ritual, variant: DayVariant): RitualStep[]**
- Returns steps for specific day variant
- Includes universal steps
- Filters by day schedule

---

### 8.3 ProductRotationService

**Purpose:** Encapsulate product rotation logic

**Responsibility:** Manage product sets, handle customization, determine current products

**Operations:**

**getProductsForVariant(ritual: Ritual, variant: DayVariant): Product[]**
- Returns products for specific day variant
- Includes universal products
- Returns customized products if available

**customizeProducts(ritual: Ritual, variant: DayVariant, products: Product[]): Ritual**
- Customizes product set for day variant
- Validates product list
- Publishes customization event
- Returns updated ritual

**resetProductsToDefault(ritual: Ritual, variant: DayVariant): Ritual**
- Resets products to default for variant
- Clears customization
- Returns updated ritual

**getCurrentProducts(ritual: Ritual): Product[]**
- Returns products for current day variant
- Considers manual override
- Returns customized or default products

---

### 8.4 RitualStepManagementService

**Purpose:** Encapsulate step CRUD operations

**Responsibility:** Add, edit, delete steps with validation

**Operations:**

**addStep(ritual: Ritual, stepData: StepData): Ritual**
- Adds new step to ritual
- Validates step properties
- Checks for duplicates
- Publishes RitualStepAddedEvent
- Returns updated ritual

**editStep(ritual: Ritual, stepId: RitualStepId, updates: StepUpdates): Ritual**
- Edits existing step
- Validates changes
- Publishes RitualStepEditedEvent
- Returns updated ritual

**deleteStep(ritual: Ritual, stepId: RitualStepId): Ritual**
- Soft deletes step
- Publishes RitualStepDeletedEvent
- Returns updated ritual

**completeStep(ritual: Ritual, stepId: RitualStepId): Ritual**
- Marks step complete
- Sets completion timestamp
- Publishes RitualStepCompletedEvent
- Returns updated ritual

**uncompleteStep(ritual: Ritual, stepId: RitualStepId): Ritual**
- Marks step incomplete
- Clears completion timestamp
- Publishes RitualStepUncompletedEvent
- Returns updated ritual

---

### 8.5 RitualValidationService

**Purpose:** Encapsulate validation rules

**Responsibility:** Validate step properties, enforce business constraints

**Operations:**

**validateStepName(name: string): ValidationResult**
- Validates step name
- Checks length (1-255 characters)
- Checks for special characters
- Returns validation result

**validateDaySchedule(schedule: DaySchedule): ValidationResult**
- Validates day schedule
- Ensures valid value
- Returns validation result

**validateDuplicate(ritual: Ritual, stepName: string): ValidationResult**
- Checks for duplicate steps
- Returns warning if duplicate found
- Returns validation result

**validateStepProperties(stepData: StepData): ValidationResult**
- Validates all step properties
- Runs all validation rules
- Returns comprehensive result

---

## 9. Business Rules & Policies

### 9.1 DayVariantPolicy

**Rule 1: MWFSat Variant**
- Days: Monday, Wednesday, Friday, Saturday
- Products: [Shampoo + Selsun blue, Soap, Conditioner]
- Followed by universal steps

**Rule 2: TTHSun Variant**
- Days: Tuesday, Thursday, Sunday
- Products: [Clarifying shampoo, Soap, Conditioner, Scrub with body wash]
- Followed by universal steps

**Rule 3: Timezone Handling**
- Day variant determined based on Singapore Time (UTC+8)
- Application layer converts SGT to UTC for domain
- Domain works with UTC internally
- No daylight saving time in Singapore

**Rule 4: Manual Override**
- Users can manually override automatic day variant
- Override persists until cleared
- Publishes DayVariantChangedEvent
- Can be cleared to return to automatic

---

### 9.2 ProductRotationPolicy

**Rule 1: MWFSat Products**
- Shampoo + Selsun blue
- Soap
- Conditioner

**Rule 2: TTHSun Products**
- Clarifying shampoo
- Soap
- Conditioner
- Scrub with body wash

**Rule 3: Universal Products**
- Body oil (all days)
- Lotion (all days)
- Powder (all days)
- Perfume (all days)

**Rule 4: Product Customization**
- Users can customize product sets
- Customization per day variant
- Can reset to default
- Customization persists across sessions

---

### 9.3 CompletionPolicy

**Rule 1: Completion Calculation**
- Completion percentage = (CompletedCount / TotalCount) * 100
- Calculated for current day variant only
- Rounded to nearest integer
- If no steps: 0%
- If all steps completed: 100%

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

### 9.4 StepManagementPolicy

**Rule 1: Duplicate Prevention**
- System warns if duplicate step name detected
- Allows user to proceed or cancel
- Doesn't prevent duplicates (user choice)

**Rule 2: Step Name Validation**
- Minimum length: 1 character
- Maximum length: 255 characters
- Special characters allowed
- Trimmed of leading/trailing whitespace

**Rule 3: Soft Delete**
- Deleted steps marked as deleted, not removed
- Data preserved for recovery
- Soft deleted steps don't appear in normal view
- Can be recovered within grace period

**Rule 4: Edit History**
- Edits don't affect completion history
- Before/after values logged for audit
- Concurrent edits handled gracefully
- Last-write-wins strategy

---

### 9.5 ArchivalPolicy

**Rule 1: Archive Timing**
- Completion data archived after ritual completion
- Archive includes date, completion %, steps
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
- Translate domain Ritual to Google Sheets format
- Translate Google Sheets data to domain Ritual
- Handle API errors and exceptions
- Manage API authentication and rate limiting

### 10.3 Key Interfaces

**RitualToSheetTranslator**
- Converts Ritual aggregate to Google Sheets row format
- Handles nested RitualSteps
- Manages timestamp conversion (UTC to SGT for display)

**SheetToRitualTranslator**
- Converts Google Sheets row to Ritual aggregate
- Reconstructs RitualSteps
- Validates data integrity

**GoogleSheetsRitualRepository**
- Implements RitualRepository interface
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

### 12.1 Ritual Aggregate States

**State 1: Created**
- Ritual initialized with type
- Default steps added
- Ready for use

**State 2: Active**
- Ritual in use
- Steps can be added/edited/completed
- Normal operations

**State 3: Archived**
- Completion data archived
- Steps reset
- Preparation for next cycle

**State 4: Deleted**
- Soft delete
- Data preserved
- Can be recovered

### 12.2 RitualStep Entity States

**State 1: Created**
- Step added to ritual
- Pending completion

**State 2: Pending**
- Step awaiting completion
- Can be edited or deleted

**State 3: Completed**
- Step marked complete
- Completion timestamp recorded

**State 4: Edited**
- Step properties modified
- Edit history maintained

**State 5: Deleted**
- Soft delete
- Data preserved

---

## 13. Integration Points

### 13.1 Consistency Tracking Service Integration

**Inbound:**
- Receives reset trigger
- Receives RitualCompletedEvent
- Receives RitualArchivedEvent

**Outbound:**
- Sends completion data for streak calculation
- Sends archived data for historical tracking
- Sends day variant changes

**Data Flow:**
1. User completes step
2. RitualStepCompletedEvent published
3. Consistency Tracking Service receives event
4. Service updates streak and completion rate
5. Service publishes milestone events

---

### 13.2 UI Component Integration

**Data Transformation:**
- Domain model transformed to UI format
- Timestamps converted to SGT for display
- Completion percentage formatted for display
- Day variant steps filtered

**Accessibility:**
- High-contrast colors applied
- Clear status indicators
- Keyboard navigation supported
- Screen reader compatible

---

### 13.3 Persistence Integration

**Google Sheets API:**
- Anti-Corruption Layer handles API calls
- Ritual data persisted to Google Sheets
- Offline queue managed by Hosting Service
- Sync triggered when online

---

## 14. Error Handling & Exceptions

### 14.1 Domain Exceptions

**RitualNotFoundException**
- Thrown when ritual not found
- Includes ritual ID
- Handled by application layer

**RitualStepNotFoundException**
- Thrown when step not found
- Includes step ID and ritual ID
- Handled by application layer

**InvalidRitualTypeException**
- Thrown when invalid ritual type provided
- Includes invalid type value
- Handled by validation service

**InvalidDayScheduleException**
- Thrown when invalid day schedule provided
- Includes invalid schedule value
- Handled by validation service

**DuplicateStepException**
- Thrown when duplicate step detected
- Includes step name
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

### 15.1 Ritual as Aggregate Root

**Decision:** Ritual is aggregate root, RitualStep is child entity

**Rationale:**
- Rituals are small (7-12 steps)
- Operations often affect multiple steps
- Strong consistency required
- Simpler to implement and maintain
- Aligns with user mental model

---

### 15.2 Unified Repository

**Decision:** Single RitualRepository, steps accessed through Ritual

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

### 15.6 Day Variant Override

**Decision:** Allow manual override of automatic day variant

**Rationale:**
- Provides user flexibility
- Handles edge cases (travel, schedule changes)
- Maintains audit trail
- Can be cleared to return to automatic

---

### 15.7 Product Customization

**Decision:** Allow customization of product sets

**Rationale:**
- Accommodates user preferences
- Supports product substitutions
- Maintains default for reset
- Persists across sessions

---

## 16. Summary

This domain model provides a comprehensive DDD specification for the Ritual Management Service with:

- Clear aggregate boundaries (Ritual as root)
- Rich value objects (RitualType, DaySchedule, CurrentDayVariant, ProductRotation, etc.)
- Comprehensive domain events (9 event types)
- Domain services for complex logic
- Well-defined business rules and policies
- Anti-Corruption Layer for external integration
- Asynchronous event publishing
- Singapore Time (UTC+8) timezone handling
- Soft delete for data recovery
- Strong consistency guarantees
- Day-of-week conditional logic
- Product rotation management
- Manual override capability
- Product customization support

The model is ready for implementation with clear responsibilities, invariants, and integration points.
