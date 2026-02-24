# Unit 2: Ritual Management System - DDD Domain Model Design Plan

## Overview
Design a comprehensive Domain Driven Design domain model for the Ritual Management Service (Unit 2) with all tactical components including aggregates, entities, value objects, domain events, policies, repositories, and domain services.

**Focus:** Bath Ritual with day-of-week conditional logic (MWFSat vs TTHSun product rotations)

---

## Phase 1: Domain Analysis & Ubiquitous Language

- [ ] **1.1** Analyze user stories to identify core domain concepts
  - Extract key business rules from US-6.1, US-6.2, US-14.1 through US-14.3
  - Identify domain boundaries and responsibilities
  - Map user interactions to domain operations
  - Understand day-of-week conditional logic

- [ ] **1.2** Define Ubiquitous Language
  - Establish consistent terminology across domain
  - Define key terms: Ritual, RitualStep, DaySchedule, DayVariant, ProductRotation, UniversalSteps
  - Document domain-specific vocabulary
  - Define day-of-week groupings (MWFSat, TTHSun)

- [ ] **1.3** Identify domain events
  - RitualCreated
  - RitualStepAdded
  - RitualStepCompleted
  - RitualStepUncompleted
  - RitualStepEdited
  - RitualStepDeleted
  - RitualCompleted
  - DayVariantChanged
  - RitualArchived

---

## Phase 2: Aggregate Design

- [ ] **2.1** Identify aggregate roots
  - *Note: Need confirmation on whether Ritual or RitualStep should be the aggregate root*
  - Determine aggregate boundaries
  - Define consistency rules within aggregates
  - Consider day-of-week variant management

- [ ] **2.2** Design Ritual Aggregate
  - Define Ritual as aggregate root (recommended)
  - Identify child entities (RitualStep)
  - Define aggregate invariants and business rules
  - Document aggregate lifecycle
  - Handle day-of-week variant logic

- [ ] **2.3** Design RitualStep Entity
  - Define as child entity within Ritual aggregate
  - Identify value objects within RitualStep
  - Define entity identity and lifecycle
  - Handle day-schedule assignment (MWFSat, TTHSun, Universal)

- [ ] **2.4** Design RitualType Value Object
  - Encapsulate ritual type (currently only "bath")
  - Define type-specific behavior
  - Allow for future ritual types

- [ ] **2.5** Design DayVariant Value Object
  - Encapsulate day-of-week grouping (MWFSat, TTHSun)
  - Define variant-specific step sets
  - Handle day-of-week determination

---

## Phase 3: Value Objects Design

- [ ] **3.1** Design RitualId Value Object
  - Unique identifier for Ritual aggregate
  - Immutable and comparable

- [ ] **3.2** Design RitualStepId Value Object
  - Unique identifier for RitualStep entity
  - Immutable and comparable

- [ ] **3.3** Design DaySchedule Value Object
  - Encapsulate day-of-week schedule (MWFSat, TTHSun, Universal)
  - Define which days belong to each schedule
  - Validate schedule compatibility

- [ ] **3.4** Design CompletionStatus Value Object
  - Encapsulate step completion state (completed, uncompleted)
  - Include completedAt timestamp
  - Track completion history

- [ ] **3.5** Design StepOrder Value Object
  - Encapsulate step ordering within ritual
  - Support reordering operations
  - Maintain order consistency

- [ ] **3.6** Design CompletionPercentage Value Object
  - Encapsulate completion percentage calculation
  - Ensure valid percentage range (0-100)
  - Calculate based on current day variant

- [ ] **3.7** Design CurrentDayVariant Value Object
  - Encapsulate current day-of-week variant determination
  - Handle Singapore Time (UTC+8) timezone
  - Determine MWFSat vs TTHSun based on current day

- [ ] **3.8** Design ProductRotation Value Object
  - Encapsulate product set for each day variant
  - Define MWFSat products vs TTHSun products
  - Allow customization

---

## Phase 4: Domain Events Design

- [ ] **4.1** Design RitualCreatedEvent
  - Capture ritual creation details
  - Include ritual type and initial steps

- [ ] **4.2** Design RitualStepAddedEvent
  - Capture step addition details
  - Include step properties and day schedule

- [ ] **4.3** Design RitualStepCompletedEvent
  - Capture step completion details
  - Include completion timestamp and day variant

- [ ] **4.4** Design RitualStepUncompletedEvent
  - Capture step uncompleted details
  - Include timestamp

- [ ] **4.5** Design RitualStepEditedEvent
  - Capture step edit details
  - Include before/after values for audit trail

- [ ] **4.6** Design RitualStepDeletedEvent
  - Capture step deletion details
  - Include soft delete flag for recovery

- [ ] **4.7** Design RitualCompletedEvent
  - Capture ritual completion details
  - Include completion timestamp and day variant

- [ ] **4.8** Design DayVariantChangedEvent
  - Capture day variant change details
  - Include old and new variant

- [ ] **4.9** Design RitualArchivedEvent
  - Capture archival details
  - Include completion data and timestamp

---

## Phase 5: Repository Design

- [ ] **5.1** Design RitualRepository Interface
  - Define repository contract for Ritual aggregate
  - Methods: save, findById, findByType, findAll, delete
  - *Note: Need confirmation on query methods needed*

- [ ] **5.2** Design RitualStepRepository Interface
  - Define repository contract for RitualStep entities
  - *Note: Consider if this should be accessed through RitualRepository*

- [ ] **5.3** Design RitualArchiveRepository Interface
  - Define repository for archived ritual data
  - Methods: save, findByDate, findByRitualType, findAll

---

## Phase 6: Domain Services Design

- [ ] **6.1** Design DayVariantService
  - Encapsulate day-of-week variant determination logic
  - Handle Singapore Time (UTC+8) timezone
  - Determine current day variant (MWFSat vs TTHSun)
  - Support manual override

- [ ] **6.2** Design RitualCompletionService
  - Encapsulate completion calculation logic
  - Calculate completion percentage for current day variant
  - Determine streak eligibility
  - Emit completion events

- [ ] **6.3** Design RitualStepManagementService
  - Encapsulate step CRUD operations
  - Validate step properties
  - Handle duplicate prevention
  - Emit step lifecycle events

- [ ] **6.4** Design RitualValidationService
  - Encapsulate validation rules
  - Validate step names, day schedules, properties
  - Enforce business constraints
  - Provide validation error details

- [ ] **6.5** Design ProductRotationService
  - Encapsulate product rotation logic
  - Manage MWFSat vs TTHSun product sets
  - Handle product customization
  - Support product override

---

## Phase 7: Policies & Business Rules

- [ ] **7.1** Define DayVariantPolicy
  - MWFSat: Monday, Wednesday, Friday, Saturday
  - TTHSun: Tuesday, Thursday, Sunday
  - Timezone handling (Singapore Time UTC+8)
  - Manual override capability

- [ ] **7.2** Define ProductRotationPolicy
  - MWFSat products: [Shampoo + Selsun blue, Soap, Conditioner]
  - TTHSun products: [Clarifying shampoo, Soap, Conditioner, Scrub with body wash]
  - Universal steps: [Body oil, Lotion, Powder, Perfume]
  - User can customize products

- [ ] **7.3** Define CompletionPolicy
  - Completion percentage calculation
  - Rapid clicking prevention (idempotency)
  - Offline completion handling
  - Day variant-specific completion

- [ ] **7.4** Define StepManagementPolicy
  - Duplicate step prevention/warning
  - Character limit for step names
  - Special character handling
  - Soft delete for recovery

- [ ] **7.5** Define ArchivalPolicy
  - Archive completion data after ritual completion
  - Preserve historical data
  - Archive doesn't interfere with active data

---

## Phase 8: Bounded Context Definition

- [ ] **8.1** Define Ritual Management Bounded Context
  - Context boundaries and responsibilities
  - Ubiquitous language within context
  - Integration points with other contexts

- [ ] **8.2** Define Context Relationships
  - Relationship with Consistency Tracking context
  - Relationship with UI Component context
  - Data flow between contexts

- [ ] **8.3** Define Anti-Corruption Layer (if needed)
  - *Note: Need confirmation if anti-corruption layer needed for external integrations*

---

## Phase 9: Aggregate Lifecycle & State Transitions

- [ ] **9.1** Design Ritual Aggregate Lifecycle
  - Creation state
  - Active state
  - Completed state
  - Archived state
  - Deleted state (soft delete)

- [ ] **9.2** Design RitualStep Entity Lifecycle
  - Created state
  - Pending state
  - Completed state
  - Edited state
  - Deleted state (soft delete)

- [ ] **9.3** Define State Transition Rules
  - Valid transitions between states
  - Invariants that must be maintained
  - Guard conditions for transitions

---

## Phase 10: Integration & External Dependencies

- [ ] **10.1** Define Consistency Tracking Integration
  - How Ritual sends completion data
  - How Ritual receives reset triggers
  - Event publishing mechanism

- [ ] **10.2** Define UI Component Integration
  - How domain model interacts with UI layer
  - Data transformation requirements
  - Accessibility constraints

- [ ] **10.3** Define Persistence Integration
  - How aggregates are persisted
  - Google Sheets API integration points
  - Offline queue integration

---

## Phase 11: Error Handling & Exceptions

- [ ] **11.1** Define Domain Exceptions
  - RitualNotFoundException
  - RitualStepNotFoundException
  - InvalidRitualTypeException
  - InvalidDayScheduleException
  - DuplicateStepException
  - InvalidCompletionStateException
  - ArchivalFailedException

- [ ] **11.2** Define Exception Handling Policies
  - When to throw exceptions
  - Exception recovery strategies
  - Error propagation rules

---

## Phase 12: Documentation & Specification

- [ ] **12.1** Create comprehensive domain_model.md document
  - Aggregate design with diagrams
  - Entity and value object specifications
  - Domain event catalog
  - Repository interfaces
  - Domain service specifications
  - Business rules and policies
  - Bounded context definition
  - Integration points

- [ ] **12.2** Document design decisions
  - Rationale for aggregate boundaries
  - Rationale for value objects
  - Rationale for domain services
  - Trade-offs and alternatives considered

- [ ] **12.3** Create visual diagrams
  - Aggregate structure diagram
  - Entity relationship diagram
  - Domain event flow diagram
  - State transition diagrams
  - Day variant determination flow

---

## Critical Decisions - APPROVED ✅

1. **Aggregate Root:** Ritual as aggregate root with RitualStep as child entity ✅
2. **Repository Pattern:** Unified RitualRepository (steps accessed through Ritual) ✅
3. **Anti-Corruption Layer:** Yes, to isolate domain from Google Sheets API changes ✅
4. **Event Publishing:** Asynchronous for better performance and decoupling ✅
5. **Timezone Handling:** Application layer handles conversion, domain works with UTC internally ✅
6. **Day Variant Override:** Yes, allow manual override for flexibility ✅
7. **Product Customization:** Yes, allow customization of product sets ✅
8. **Timezone Specification:** Singapore Time (SGT, UTC+8) - same as Philippines ✅

---

## Timezone Implementation Notes

**Singapore Time (SGT) Specifications:**
- UTC Offset: UTC+8
- No Daylight Saving Time (DST)
- Day variant determination based on SGT current day
- All timestamps stored in UTC internally
- Application layer converts SGT to UTC before domain operations

---

## Status: ✅ APPROVED - Ready to Execute

Proceeding with Phase 1 execution to create comprehensive domain_model.md document in /construction/unit-2-ritual-management/domain_model.md
