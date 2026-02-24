# Unit 5: Data Persistence & Consistency Tracking System - DDD Domain Model Design Plan

## Overview
Design a comprehensive Domain Driven Design domain model for the Data Persistence & Consistency Tracking Service (Unit 5) with all tactical components including aggregates, entities, value objects, domain events, policies, repositories, and domain services.

**Focus:** Data persistence via Google Sheets API, auto-reset functionality, consistency log archival, streak calculation, and dopamine-driven feedback through the Consistency Dashboard.

---

## Phase 1: Domain Analysis & Ubiquitous Language

- [x] **1.1** Analyze user stories to identify core domain concepts
  - Extract key business rules from US-10.1 through US-10.3, US-11.1, US-11.2
  - Identify domain boundaries and responsibilities
  - Map user interactions to domain operations
  - Understand data persistence, archival, and streak tracking

- [x] **1.2** Define Ubiquitous Language
  - Establish consistent terminology across domain
  - Define key terms: CompletionRecord, ArchivedData, Streak, Dashboard, Milestone, SyncQueue, OfflineQueue, ConsistencyLog
  - Document domain-specific vocabulary
  - Define streak calculation and completion rate metrics

- [x] **1.3** Identify domain events
  - CompletionRecorded
  - DataSynced
  - SyncFailed
  - DataArchived
  - DailyResetTriggered
  - StreakCalculated
  - StreakBroken
  - MilestoneAchieved
  - CelebrationTriggered
  - OfflineQueueUpdated

---

## Phase 2: Aggregate Design

- [x] **2.1** Identify aggregate roots
  - *Note: Need confirmation on whether CompletionLog or Streak should be the aggregate root*
  - Determine aggregate boundaries
  - Define consistency rules within aggregates
  - Consider multiple module types and historical data

- [x] **2.2** Design CompletionLog Aggregate
  - Define CompletionLog as aggregate root (recommended)
  - Identify child entities (CompletionRecord, ArchivedData)
  - Define aggregate invariants and business rules
  - Document aggregate lifecycle
  - Handle data persistence and archival

- [x] **2.3** Design CompletionRecord Entity
  - Define as child entity within CompletionLog aggregate
  - Identify value objects within CompletionRecord
  - Define entity identity and lifecycle
  - Handle completion tracking and metrics

- [x] **2.4** Design Streak Value Object
  - Encapsulate streak information (current, longest, start date)
  - Define streak-specific behavior
  - Validate streak calculation rules

- [x] **2.5** Design Dashboard Value Object
  - Encapsulate dashboard data (streaks, rates, charts)
  - Define dashboard-specific behavior
  - Validate dashboard data rules

---

## Phase 3: Value Objects Design

- [x] **3.1** Design CompletionLogId Value Object
  - Unique identifier for CompletionLog aggregate
  - Immutable and comparable

- [x] **3.2** Design CompletionRecordId Value Object
  - Unique identifier for CompletionRecord entity
  - Immutable and comparable

- [x] **3.3** Design ModuleType Value Object
  - Encapsulate module type (checklist, ritual, inventory)
  - Define type-specific behavior
  - Validate type compatibility

- [x] **3.4** Design ModuleName Value Object
  - Encapsulate module name (chores, self-care, bathroom, gym, rto, bath-ritual, fridge, pantry, first-aid)
  - Define name-specific behavior
  - Validate name compatibility

- [x] **3.5** Design CompletionPercentage Value Object
  - Encapsulate completion percentage (0-100)
  - Calculate from items completed/total
  - Validate percentage constraints

- [x] **3.6** Design Streak Value Object
  - Encapsulate streak information
  - Include current streak, longest streak, start date
  - Track streak status (active, broken)

- [x] **3.7** Design CompletionThreshold Value Object
  - Encapsulate completion threshold for streak (e.g., 50%)
  - Validate threshold constraints
  - Support threshold customization

- [x] **3.8** Design Milestone Value Object
  - Encapsulate milestone information
  - Include type, name, threshold, achievement status
  - Track milestone metadata

- [x] **3.9** Design SyncStatus Value Object
  - Encapsulate sync status (pending, syncing, synced, failed)
  - Track sync timestamp and error details
  - Support retry logic

- [x] **3.10** Design OfflineQueueItem Value Object
  - Encapsulate offline queue item
  - Include operation type, data, timestamp
  - Support queue ordering

---

## Phase 4: Domain Events Design

- [x] **4.1** Design CompletionRecordedEvent
  - Capture completion record details
  - Include module type, completion percentage, timestamp

- [x] **4.2** Design DataSyncedEvent
  - Capture data sync details
  - Include sync timestamp and records synced

- [x] **4.3** Design SyncFailedEvent
  - Capture sync failure details
  - Include error information and retry count

- [x] **4.4** Design DataArchivedEvent
  - Capture data archival details
  - Include archived data and timestamp

- [x] **4.5** Design DailyResetTriggeredEvent
  - Capture daily reset details
  - Include reset timestamp and affected modules

- [x] **4.6** Design StreakCalculatedEvent
  - Capture streak calculation details
  - Include module type and streak value

- [x] **4.7** Design StreakBrokenEvent
  - Capture streak break details
  - Include module type and break reason

- [x] **4.8** Design MilestoneAchievedEvent
  - Capture milestone achievement details
  - Include milestone type and achievement timestamp

- [x] **4.9** Design CelebrationTriggeredEvent
  - Capture celebration trigger details
  - Include celebration type and animation

- [x] **4.10** Design OfflineQueueUpdatedEvent
  - Capture offline queue update details
  - Include queue size and operation

---

## Phase 5: Repository Design

- [x] **5.1** Design CompletionLogRepository Interface
  - Define repository contract for CompletionLog aggregate
  - Methods: save, findById, findByDate, findByModuleType, findAll, delete
  - *Note: Need confirmation on query methods needed*

- [x] **5.2** Design CompletionRecordRepository Interface
  - Define repository contract for CompletionRecord entities
  - Methods: save, findByDate, findByModuleType, findAll

- [x] **5.3** Design StreakRepository Interface
  - Define repository for streaks
  - Methods: save, findById, findByModuleType, findAll

- [x] **5.4** Design ArchivedDataRepository Interface
  - Define repository for archived data
  - Methods: save, findByDate, findByDateRange, findAll

- [x] **5.5** Design OfflineQueueRepository Interface
  - Define repository for offline queue
  - Methods: enqueue, dequeue, findAll, clear

---

## Phase 6: Domain Services Design

- [x] **6.1** Design CompletionTrackingService
  - Encapsulate completion tracking logic
  - Record completions
  - Calculate completion percentages
  - Emit completion events

- [x] **6.2** Design StreakCalculationService
  - Encapsulate streak calculation logic
  - Calculate streaks based on completion rates
  - Detect streak breaks
  - Emit streak events

- [x] **6.3** Design DataArchivalService
  - Encapsulate data archival logic
  - Archive completion data
  - Preserve historical data
  - Emit archival events

- [x] **6.4** Design DailyResetService
  - Encapsulate daily reset logic
  - Trigger resets at scheduled times
  - Archive data before reset
  - Emit reset events

- [x] **6.5** Design DataSyncService
  - Encapsulate data sync logic
  - Sync data to Google Sheets
  - Handle sync failures and retries
  - Emit sync events

- [x] **6.6** Design OfflineQueueService
  - Encapsulate offline queue management
  - Queue operations when offline
  - Sync queue when online
  - Handle queue conflicts

- [x] **6.7** Design DashboardService
  - Encapsulate dashboard data aggregation
  - Compile streaks and completion rates
  - Generate chart data
  - Emit dashboard updates

- [x] **6.8** Design MilestoneService
  - Encapsulate milestone tracking
  - Detect milestone achievements
  - Trigger celebrations
  - Emit milestone events

---

## Phase 7: Policies & Business Rules

- [x] **7.1** Define CompletionRecordingPolicy
  - Completion records created for each module
  - Completion percentage calculated from items
  - Completion records timestamped
  - Completion records immutable after creation

- [x] **7.2** Define StreakCalculationPolicy
  - Streak increases if completion >= 50%
  - Streak breaks if completion < 50%
  - Streaks calculated per module type
  - Historical streak data preserved

- [x] **7.3** Define DataArchivalPolicy
  - Daily completion data archived at 12:00 AM SGT
  - Archive includes date, completion %, records
  - Archive timestamp recorded
  - Archive doesn't interfere with active data

- [x] **7.4** Define DailyResetPolicy
  - Reset triggered at 12:00 AM SGT
  - Data archived before reset
  - Daily checklists reset
  - Weekly/bi-weekly/monthly resets on schedule

- [x] **7.5** Define DataSyncPolicy
  - Data synced to Google Sheets asynchronously
  - Sync triggered on completion or manually
  - Failed syncs retry automatically
  - Sync conflicts use last-write-wins

- [x] **7.6** Define OfflineQueuePolicy
  - Operations queued when offline
  - Queue persisted in IndexedDB
  - Queue synced when online
  - Queue conflicts resolved by timestamp

- [x] **7.7** Define MilestonePolicy
  - Milestones triggered at thresholds (7, 14, 30 days)
  - Milestone achievements celebrated
  - Celebration animations triggered
  - Milestone history preserved

---

## Phase 8: Bounded Context Definition

- [x] **8.1** Define Consistency Tracking Bounded Context
  - Context boundaries and responsibilities
  - Ubiquitous language within context
  - Integration points with other contexts

- [x] **8.2** Define Context Relationships
  - Relationship with Checklist Management context
  - Relationship with Ritual Management context
  - Relationship with Inventory Management context
  - Data flow between contexts

- [x] **8.3** Define Anti-Corruption Layer (if needed)
  - *Note: Need confirmation if anti-corruption layer needed for Google Sheets API*

---

## Phase 9: Aggregate Lifecycle & State Transitions

- [x] **9.1** Design CompletionLog Aggregate Lifecycle
  - Creation state
  - Active state
  - Archived state
  - Deleted state (soft delete)

- [x] **9.2** Design CompletionRecord Entity Lifecycle
  - Created state
  - Active state
  - Archived state
  - Deleted state

- [x] **9.3** Define State Transition Rules
  - Valid transitions between states
  - Invariants that must be maintained
  - Guard conditions for transitions

---

## Phase 10: Integration & External Dependencies

- [x] **10.1** Define Checklist Management Integration
  - How Consistency Tracking receives completion data
  - How reset triggers are sent
  - Error handling

- [x] **10.2** Define Ritual Management Integration
  - How Consistency Tracking receives completion data
  - How reset triggers are sent
  - Error handling

- [x] **10.3** Define Inventory Management Integration
  - How Consistency Tracking receives completion data (optional)
  - How reset triggers are sent
  - Error handling

- [x] **10.4** Define Google Sheets API Integration
  - How data is persisted to Google Sheets
  - Sheet structure and columns
  - Error handling and retries

- [x] **10.5** Define UI Component Integration
  - How domain model interacts with UI layer
  - Data transformation requirements
  - Accessibility constraints

---

## Phase 11: Error Handling & Exceptions

- [x] **11.1** Define Domain Exceptions
  - CompletionLogNotFoundException
  - CompletionRecordNotFoundException
  - StreakCalculationFailedException
  - DataArchivalFailedException
  - DataSyncFailedException
  - OfflineQueueException
  - MilestoneCalculationFailedException

- [x] **11.2** Define Exception Handling Policies
  - When to throw exceptions
  - Exception recovery strategies
  - Error propagation rules
  - Fallback behavior

---

## Phase 12: Documentation & Specification

- [x] **12.1** Create comprehensive domain_model.md document
  - Aggregate design with diagrams
  - Entity and value object specifications
  - Domain event catalog
  - Repository interfaces
  - Domain service specifications
  - Business rules and policies
  - Bounded context definition
  - Integration points

- [x] **12.2** Document design decisions
  - Rationale for aggregate boundaries
  - Rationale for value objects
  - Rationale for domain services
  - Trade-offs and alternatives considered

- [x] **12.3** Create visual diagrams
  - Aggregate structure diagram
  - Entity relationship diagram
  - Domain event flow diagram
  - State transition diagrams
  - Data sync flow diagram

---

## Critical Decisions - PENDING APPROVAL

1. **Aggregate Root:** CompletionLog as aggregate root with CompletionRecord as child entity (recommended)
   - *Note: Alternative: Streak as aggregate root with CompletionRecord as value object*
   - Rationale: Completion logs are primary entities, streaks are derived from logs

2. **Repository Pattern:** Unified CompletionLogRepository (records accessed through CompletionLog)
   - *Note: Alternative: Separate repositories for CompletionLog and CompletionRecord*
   - Rationale: Enforces aggregate boundary and consistency

3. **Anti-Corruption Layer:** Yes, to isolate domain from Google Sheets API changes
   - *Note: Alternative: Direct integration with Google Sheets API*
   - Rationale: Protects domain from API changes

4. **Event Publishing:** Asynchronous for better performance and decoupling
   - *Note: Alternative: Synchronous event publishing*
   - Rationale: Better performance and resilience

5. **Data Archival:** Automatic archival at 12:00 AM SGT with separate storage
   - *Note: Alternative: Manual archival or same storage*
   - Rationale: Better performance and data organization

6. **Offline Queue:** IndexedDB-based queue with automatic sync
   - *Note: Alternative: LocalStorage or in-memory queue*
   - Rationale: Better reliability and persistence

7. **Streak Calculation:** Per-module-type streaks with 50% completion threshold
   - *Note: Alternative: Global streaks or different threshold*
   - Rationale: More granular tracking and user control

---

## Timezone Implementation Notes

**Singapore Time (SGT) Specifications:**
- UTC Offset: UTC+8
- No Daylight Saving Time (DST)
- Daily reset at 12:00 AM SGT (00:00 SGT)
- Weekly reset: Sunday 12:00 AM SGT
- Bi-weekly reset: Every other Sunday 12:00 AM SGT
- Monthly reset: 1st of month 12:00 AM SGT
- All timestamps stored in UTC internally
- Application layer converts SGT to UTC before domain operations

---

## Status: ✅ COMPLETE - All Phases Executed Successfully

**Completion Summary:**
- ✅ Phase 1: Domain Analysis & Ubiquitous Language - COMPLETE
- ✅ Phase 2: Aggregate Design - COMPLETE
- ✅ Phase 3: Value Objects Design - COMPLETE
- ✅ Phase 4: Domain Events Design - COMPLETE
- ✅ Phase 5: Repository Design - COMPLETE
- ✅ Phase 6: Domain Services Design - COMPLETE
- ✅ Phase 7: Policies & Business Rules - COMPLETE
- ✅ Phase 8: Bounded Context Definition - COMPLETE
- ✅ Phase 9: Aggregate Lifecycle & State Transitions - COMPLETE
- ✅ Phase 10: Integration & External Dependencies - COMPLETE
- ✅ Phase 11: Error Handling & Exceptions - COMPLETE
- ✅ Phase 12: Documentation & Specification - COMPLETE

**Deliverable:**
Comprehensive domain_model.md document created at `/construction/unit-5-consistency-tracking/domain_model.md` with:
- 16 major sections
- 13 core domain terms (Ubiquitous Language)
- 1 Aggregate Root (CompletionLog)
- 1 Entity (CompletionRecord)
- 11 Value Objects
- 10 Domain Events
- 5 Repository Interfaces
- 8 Domain Services
- 7 Business Rules & Policies
- Anti-Corruption Layer design
- Event Publishing mechanism
- Aggregate Lifecycle & State Transitions
- Integration Points (3 services + UI)
- 7 Domain Exceptions
- 7 Design Decisions with Rationale
- Comprehensive Summary

**Key Features Implemented:**
- Singapore Time (UTC+8) integration throughout
- Data persistence via Google Sheets API
- Auto-reset functionality at 12:00 AM SGT
- Consistency log archival with historical data preservation
- Streak calculation (current, longest, per module type)
- Dopamine-driven feedback through milestones and celebrations
- Offline queue management with conflict resolution
- Dashboard data aggregation (streaks, completion rates, charts)
- Integration with 3 services (Checklist, Ritual, Inventory)
- Soft delete for data recovery
- Asynchronous event publishing
- Anti-Corruption Layer for Google Sheets API

**Ready for Implementation:**
The domain model is now complete and ready for implementation with clear contracts for repositories, services, and event handlers.

