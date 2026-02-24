# Unit 3: Inventory Management System - DDD Domain Model Design Plan

## Overview
Design a comprehensive Domain Driven Design domain model for the Inventory Management Service (Unit 3) with all tactical components including aggregates, entities, value objects, domain events, policies, repositories, and domain services.

**Focus:** Fridge/Freezer, Dry Goods & Pantry, First-Aid tracking with status-based management, expiry dates, quantities, and recipe generation.

---

## Phase 1: Domain Analysis & Ubiquitous Language

- [x] **1.1** Analyze user stories to identify core domain concepts
  - Extract key business rules from US-7.1 through US-7.3, US-8.1, US-8.2, US-9.1, US-14.1 through US-14.4
  - Identify domain boundaries and responsibilities
  - Map user interactions to domain operations
  - Understand inventory types and status tracking

- [x] **1.2** Define Ubiquitous Language
  - Establish consistent terminology across domain
  - Define key terms: Inventory, InventoryItem, InventoryType, StockStatus, ExpiryDate, Quantity, Recipe, RecipeGenerator
  - Document domain-specific vocabulary
  - Define inventory categories and status levels

- [x] **1.3** Identify domain events
  - InventoryCreated
  - InventoryItemAdded
  - InventoryItemStatusChanged
  - InventoryItemQuantityChanged
  - InventoryItemExpiryDateChanged
  - InventoryItemEdited
  - InventoryItemDeleted
  - InventoryItemExpired
  - RecipeGenerated
  - RecipeSaved
  - BulkInventoryUpdated
  - InventoryArchived

---

## Phase 2: Aggregate Design

- [x] **2.1** Identify aggregate roots
  - *Note: Need confirmation on whether Inventory or InventoryItem should be the aggregate root*
  - Determine aggregate boundaries
  - Define consistency rules within aggregates
  - Consider multiple inventory types (fridge, pantry, first-aid)

- [x] **2.2** Design Inventory Aggregate
  - Define Inventory as aggregate root (recommended)
  - Identify child entities (InventoryItem)
  - Define aggregate invariants and business rules
  - Document aggregate lifecycle
  - Handle multiple inventory types

- [x] **2.3** Design InventoryItem Entity
  - Define as child entity within Inventory aggregate
  - Identify value objects within InventoryItem
  - Define entity identity and lifecycle
  - Handle status tracking and expiry dates

- [x] **2.4** Design InventoryType Value Object
  - Encapsulate inventory type (fridge, pantry, first-aid)
  - Define type-specific behavior
  - Validate type-specific rules

- [x] **2.5** Design StockStatus Value Object
  - Encapsulate stock status (Low, Half, Full)
  - Define status-specific behavior
  - Handle color coding and visual indicators

---

## Phase 3: Value Objects Design

- [x] **3.1** Design InventoryId Value Object
  - Unique identifier for Inventory aggregate
  - Immutable and comparable

- [x] **3.2** Design InventoryItemId Value Object
  - Unique identifier for InventoryItem entity
  - Immutable and comparable

- [x] **3.3** Design StockStatus Value Object
  - Encapsulate stock level (Low, Half, Full)
  - Define status-specific behavior
  - Validate status transitions

- [x] **3.4** Design ExpiryDate Value Object
  - Encapsulate expiry date with timezone awareness
  - Calculate days remaining
  - Determine expiry status (Green, Yellow, Red)
  - Handle Singapore Time (UTC+8)

- [x] **3.5** Design Quantity Value Object
  - Encapsulate quantity with unit
  - Support increment/decrement operations
  - Validate quantity constraints

- [x] **3.6** Design ItemCategory Value Object
  - Encapsulate item category
  - Define category-specific behavior
  - Validate category compatibility

- [x] **3.7** Design Recipe Value Object
  - Encapsulate recipe information
  - Include ingredients, difficulty, prep time
  - Track recipe source and saved status

- [x] **3.8** Design RecipeIngredient Value Object
  - Encapsulate recipe ingredient
  - Link to inventory items
  - Track ingredient availability

- [x] **3.9** Design CompletionPercentage Value Object
  - Encapsulate completion percentage calculation
  - Ensure valid percentage range (0-100)
  - Calculate based on available ingredients

- [x] **3.10** Design ItemOrder Value Object
  - Encapsulate item ordering within inventory
  - Support reordering operations
  - Maintain order consistency

---

## Phase 4: Domain Events Design

- [x] **4.1** Design InventoryCreatedEvent
  - Capture inventory creation details
  - Include inventory type and initial items

- [x] **4.2** Design InventoryItemAddedEvent
  - Capture item addition details
  - Include item properties and timestamp

- [x] **4.3** Design InventoryItemStatusChangedEvent
  - Capture status change details
  - Include old and new status

- [x] **4.4** Design InventoryItemQuantityChangedEvent
  - Capture quantity change details
  - Include old and new quantity

- [x] **4.5** Design InventoryItemExpiryDateChangedEvent
  - Capture expiry date change details
  - Include old and new expiry date

- [x] **4.6** Design InventoryItemEditedEvent
  - Capture item edit details
  - Include before/after values for audit trail

- [x] **4.7** Design InventoryItemDeletedEvent
  - Capture item deletion details
  - Include soft delete flag for recovery

- [x] **4.8** Design InventoryItemExpiredEvent
  - Capture item expiration details
  - Include expiry timestamp

- [x] **4.9** Design RecipeGeneratedEvent
  - Capture recipe generation details
  - Include generated recipes and timestamp

- [x] **4.10** Design RecipeSavedEvent
  - Capture recipe save details
  - Include recipe ID and timestamp

- [x] **4.11** Design BulkInventoryUpdatedEvent
  - Capture bulk update details
  - Include items updated and changes

- [x] **4.12** Design InventoryArchivedEvent
  - Capture archival details
  - Include inventory data and timestamp

---

## Phase 5: Repository Design

- [x] **5.1** Design InventoryRepository Interface
  - Define repository contract for Inventory aggregate
  - Methods: save, findById, findByType, findAll, delete
  - *Note: Need confirmation on query methods needed*

- [x] **5.2** Design InventoryItemRepository Interface
  - Define repository contract for InventoryItem entities
  - *Note: Consider if this should be accessed through InventoryRepository*

- [x] **5.3** Design RecipeRepository Interface
  - Define repository for recipes
  - Methods: save, findById, findByIngredients, findFavorites

- [x] **5.4** Design InventoryArchiveRepository Interface
  - Define repository for archived inventory data
  - Methods: save, findByDate, findByInventoryType, findAll

---

## Phase 6: Domain Services Design

- [x] **6.1** Design InventoryStatusService
  - Encapsulate status management logic
  - Handle status transitions
  - Manage status-specific behavior
  - Emit status change events

- [x] **6.2** Design ExpiryDateService
  - Encapsulate expiry date logic
  - Calculate days remaining
  - Determine expiry status (Green, Yellow, Red)
  - Handle Singapore Time (UTC+8)
  - Detect expired items

- [x] **6.3** Design QuantityManagementService
  - Encapsulate quantity operations
  - Handle increment/decrement
  - Validate quantity constraints
  - Emit quantity change events

- [x] **6.4** Design RecipeGeneratorService
  - Encapsulate recipe generation logic
  - Analyze available ingredients
  - Generate recipe suggestions
  - Filter by dietary restrictions
  - Emit recipe generated events

- [x] **6.5** Design InventoryItemManagementService
  - Encapsulate item CRUD operations
  - Validate item properties
  - Handle duplicate prevention
  - Emit item lifecycle events

- [x] **6.6** Design BulkOperationService
  - Encapsulate bulk operations
  - Handle bulk status updates
  - Handle bulk deletes
  - Handle bulk edits
  - Emit bulk update events

- [x] **6.7** Design InventoryValidationService
  - Encapsulate validation rules
  - Validate item names, categories, properties
  - Enforce business constraints
  - Provide validation error details

---

## Phase 7: Policies & Business Rules

- [x] **7.1** Define StockStatusPolicy
  - Low: Stock level is low, reorder needed
  - Half: Stock level is half, monitor usage
  - Full: Stock level is full, adequate supply
  - Color coding: Red (Low), Yellow (Half), Green (Full)

- [x] **7.2** Define ExpiryDatePolicy
  - Green: >3 days remaining (for food), >3 months (for first-aid)
  - Yellow: 1-3 days remaining (for food), 1-3 months (for first-aid)
  - Red: <1 day remaining (for food), <1 month (for first-aid)
  - Expired items show warning badge
  - Automatic archival of expired items
  - User confirmation required before deletion

- [x] **7.3** Define QuantityPolicy
  - Quantity can be incremented/decremented
  - Quantity can be 0 (item depleted)
  - Quantity changes tracked
  - Quantity changes persist to backend

- [x] **7.4** Define RecipeGenerationPolicy
  - Recipes generated based on available ingredients
  - Recipes include difficulty level and prep time
  - Recipes can be filtered by dietary restrictions
  - User can save favorite recipes
  - Recipes update when inventory changes
  - Limited ingredients may result in no suggestions

- [x] **7.5** Define ItemManagementPolicy
  - Duplicate item prevention/warning
  - Character limit for item names (1-255)
  - Special character handling
  - Soft delete for recovery
  - Edit history maintained
  - Concurrent edits handled gracefully

- [x] **7.6** Define BulkOperationPolicy
  - Select multiple items with checkboxes
  - Bulk status update (Low/Half/Full)
  - Bulk delete with confirmation
  - Bulk edit properties
  - Clear selection option
  - Large bulk operations don't block UI

- [x] **7.7** Define ArchivalPolicy
  - Archive expired items
  - Archive inventory data periodically
  - Preserve historical data
  - Archive doesn't interfere with active data

---

## Phase 8: Bounded Context Definition

- [x] **8.1** Define Inventory Management Bounded Context
  - Context boundaries and responsibilities
  - Ubiquitous language within context
  - Integration points with other contexts

- [x] **8.2** Define Context Relationships
  - Relationship with Consistency Tracking context
  - Relationship with UI Component context
  - Data flow between contexts

- [x] **8.3** Define Anti-Corruption Layer (if needed)
  - *Note: Need confirmation if anti-corruption layer needed for external integrations*

---

## Phase 9: Aggregate Lifecycle & State Transitions

- [x] **9.1** Design Inventory Aggregate Lifecycle
  - Creation state
  - Active state
  - Archived state
  - Deleted state (soft delete)

- [x] **9.2** Design InventoryItem Entity Lifecycle
  - Created state
  - Active state
  - Expired state
  - Edited state
  - Deleted state (soft delete)

- [x] **9.3** Define State Transition Rules
  - Valid transitions between states
  - Invariants that must be maintained
  - Guard conditions for transitions

---

## Phase 10: Integration & External Dependencies

- [x] **10.1** Define Consistency Tracking Integration
  - How Inventory sends data (optional)
  - How Inventory receives triggers
  - Event publishing mechanism

- [x] **10.2** Define UI Component Integration
  - How domain model interacts with UI layer
  - Data transformation requirements
  - Accessibility constraints

- [x] **10.3** Define Persistence Integration
  - How aggregates are persisted
  - Google Sheets API integration points
  - Offline queue integration

---

## Phase 11: Error Handling & Exceptions

- [x] **11.1** Define Domain Exceptions
  - InventoryNotFoundException
  - InventoryItemNotFoundException
  - InvalidInventoryTypeException
  - InvalidStockStatusException
  - InvalidExpiryDateException
  - InvalidQuantityException
  - DuplicateItemException
  - RecipeGenerationFailedException
  - ArchivalFailedException

- [x] **11.2** Define Exception Handling Policies
  - When to throw exceptions
  - Exception recovery strategies
  - Error propagation rules

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
  - Recipe generation flow diagram

---

## Critical Decisions - APPROVED ✅

1. **Aggregate Root:** Inventory as aggregate root with InventoryItem as child entity ✅
2. **Repository Pattern:** Unified InventoryRepository (items accessed through Inventory) ✅
3. **Anti-Corruption Layer:** Yes, to isolate domain from Google Sheets API changes ✅
4. **Event Publishing:** Asynchronous for better performance and decoupling ✅
5. **Timezone Handling:** Application layer handles conversion, domain works with UTC internally ✅
6. **Recipe Generation:** Domain service for recipe generation logic ✅
7. **Bulk Operations:** Part of Inventory aggregate for consistency ✅
8. **Inventory Types:** Single Inventory aggregate with type discrimination ✅
9. **Timezone Specification:** Singapore Time (SGT, UTC+8) - same as Philippines ✅

---

## Timezone Implementation Notes

**Singapore Time (SGT) Specifications:**
- UTC Offset: UTC+8
- No Daylight Saving Time (DST)
- Expiry date calculations based on SGT current date
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
Comprehensive domain_model.md document created at `/construction/unit-3-inventory-management/domain_model.md` with:
- 16 major sections
- 14 core domain terms (Ubiquitous Language)
- 1 Aggregate Root (Inventory)
- 1 Entity (InventoryItem)
- 11 Value Objects
- 12 Domain Events
- 3 Repository Interfaces
- 7 Domain Services
- 7 Business Rules & Policies
- Anti-Corruption Layer design
- Event Publishing mechanism
- Aggregate Lifecycle & State Transitions
- Integration Points
- 9 Domain Exceptions
- 7 Design Decisions with Rationale
- Comprehensive Summary

**Key Features Implemented:**
- Singapore Time (UTC+8) integration throughout
- Support for 3 inventory types (fridge, pantry, first-aid)
- Status-based tracking with color coding (Red/Yellow/Green)
- Expiry date management with timezone awareness
- Recipe generation based on available ingredients
- Bulk operations support
- Soft delete for data recovery
- Asynchronous event publishing
- Anti-Corruption Layer for Google Sheets API

**Ready for Implementation:**
The domain model is now complete and ready for implementation with clear contracts for repositories, services, and event handlers.
