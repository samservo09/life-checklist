# Unit 3: Inventory Management System - Domain Driven Design Model

## Executive Summary

This document defines the complete Domain Driven Design (DDD) domain model for the Inventory Management Service. The model encompasses all tactical components including aggregates, entities, value objects, domain events, policies, repositories, and domain services.

**Key Design Decisions:**
- Inventory as aggregate root with InventoryItem as child entity
- Unified InventoryRepository for data access
- Anti-Corruption Layer for Google Sheets API integration
- Asynchronous domain event publishing
- Application layer handles timezone conversion (Singapore Time UTC+8)
- Domain works with UTC internally
- Single Inventory aggregate with type discrimination (fridge, pantry, first-aid)
- Recipe generation as domain service
- Bulk operations as part of Inventory aggregate

---

## 1. Ubiquitous Language

### Core Domain Terms

**Inventory:** A collection of items organized by type (fridge, pantry, first-aid) with status-based tracking and expiry management.

**InventoryItem:** An individual item within an inventory with status, quantity, expiry date, and metadata.

**InventoryType:** The classification of an inventory (fridge, pantry, first-aid).

**StockStatus:** The stock level of an item (Low, Half, Full) with visual color coding (Red, Yellow, Green).

**ExpiryDate:** The date when an item expires with timezone awareness (Singapore Time UTC+8).

**Quantity:** The amount of an item available with unit of measurement.

**Recipe:** A suggested dish based on available ingredients with difficulty level and prep time.

**RecipeIngredient:** An ingredient required for a recipe linked to inventory items.

**ItemCategory:** The classification of an item (ingredient, cooked-food, supply, medicine, etc.).

**CompletionPercentage:** The ratio of available ingredients to recipe requirements.

**BulkOperation:** A batch operation affecting multiple inventory items simultaneously.

**Archive:** Historical record of inventory data before reset or deletion.

**Timezone:** Singapore Time (SGT, UTC+8) - used for expiry calculations and user display.

---

## 2. Bounded Context

### Context Name
**Inventory Management Bounded Context**

### Context Responsibility
Manages the creation, modification, tracking, and lifecycle of inventory items across multiple types (fridge, pantry, first-aid). Handles status-based tracking, expiry date management, quantity tracking, recipe generation, and bulk operations.

### Context Boundaries
- **Inbound:** Receives archival triggers from Consistency Tracking context
- **Outbound:** Sends inventory events to Consistency Tracking context
- **Internal:** Manages all inventory operations, item management, and state transitions

### Ubiquitous Language Scope
All terms defined in Section 1 apply within this context.

---

## 3. Aggregate Design

### 3.1 Inventory Aggregate Root

**Aggregate Root:** Inventory

**Responsibility:** Manages all inventory operations, maintains consistency of inventory state, and coordinates with child entities.

**Aggregate Boundary:**
```
Inventory (Aggregate Root)
├── InventoryId (Value Object)
├── InventoryType (Value Object)
├── InventoryItems (Collection of Child Entities)
├── CreatedAt (Value Object)
└── UpdatedAt (Value Object)
```

**Aggregate Invariants:**
1. An inventory must have a valid InventoryType
2. An inventory must have at least one InventoryItem
3. All InventoryItems must belong to the same Inventory
4. InventoryItems must maintain order
5. InventoryType cannot change after creation
6. CreatedAt and UpdatedAt must be valid timestamps

**Aggregate Lifecycle:**
1. **Created:** Inventory initialized with type and default items
2. **Active:** Inventory in use, items can be added/edited/deleted
3. **Archived:** Inventory data archived before reset
4. **Deleted:** Soft delete, data preserved for recovery



**Key Operations:**
- Create inventory with type
- Add item to inventory
- Edit item in inventory
- Update item status (Low/Half/Full)
- Update item quantity
- Update item expiry date
- Delete item (soft delete)
- Generate recipes based on available items
- Save favorite recipe
- Perform bulk status updates
- Perform bulk deletes
- Perform bulk edits
- Archive inventory data
- Calculate recipe completion percentage

---

## 4. Entities

### 4.1 InventoryItem Entity

**Entity Identity:** InventoryItemId (unique within Inventory)

**Responsibility:** Represents a single item within an inventory with status, quantity, and expiry tracking.

**Properties:**
- InventoryItemId: Unique identifier
- Name: Item name (string, 1-255 characters)
- ItemCategory: Item classification (ingredient, cooked-food, supply, medicine)
- StockStatus: Current stock level (Low, Half, Full)
- Quantity: Amount available (number, >= 0)
- Unit: Unit of measurement (string, e.g., "kg", "pieces", "ml")
- ExpiryDate: Date when item expires (nullable, for items with expiry)
- DateOpened: Date item was opened/purchased (nullable)
- Notes: Optional item notes (string, 0-500 characters)
- Order: Position in inventory (integer)
- CreatedAt: Creation timestamp (UTC)
- UpdatedAt: Last modification timestamp (UTC)
- IsDeleted: Soft delete flag

**Entity Invariants:**
1. Name must not be empty
2. Name must not exceed 255 characters
3. ItemCategory must be valid
4. StockStatus must be valid (Low, Half, Full)
5. Quantity must be non-negative
6. Order must be non-negative
7. ExpiryDate can be null (for non-perishable items)
8. UpdatedAt must be >= CreatedAt
9. If ExpiryDate is set, it must be a valid future or past date

**Entity Lifecycle:**
1. **Created:** Item added to inventory
2. **Active:** Item available for use
3. **Expired:** Item past expiry date (if applicable)
4. **Edited:** Item properties modified
5. **Deleted:** Soft delete, data preserved

**Key Operations:**
- Create item with properties
- Update status (Low/Half/Full)
- Update quantity (increment/decrement)
- Update expiry date
- Edit item properties
- Delete item (soft delete)
- Check if expired
- Get days remaining until expiry

---

## 5. Value Objects

### 5.1 InventoryId

**Purpose:** Unique identifier for Inventory aggregate

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Uniquely identifies an Inventory
- Generated on creation

---

### 5.2 InventoryItemId

**Purpose:** Unique identifier for InventoryItem entity

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Unique within Inventory
- Generated on creation

---

### 5.3 InventoryType

**Purpose:** Encapsulates inventory type classification

**Valid Values:**
- FRIDGE: Fridge/Freezer ingredients and cooked food
- PANTRY: Dry goods and pantry stock
- FIRST_AID: First-aid items and medicines

**Characteristics:**
- Immutable
- Enumerated type
- Determines item categories and expiry policies
- Validates type-specific rules

**Type-Specific Behavior:**
- FRIDGE: Supports ingredients and cooked-food items, expiry tracking mandatory
- PANTRY: Supports supply items, expiry tracking optional
- FIRST_AID: Supports medicine items, expiry tracking with longer thresholds

---

### 5.4 StockStatus

**Purpose:** Encapsulates stock level classification

**Valid Values:**
- LOW: Stock level is low, reorder needed
- HALF: Stock level is half, monitor usage
- FULL: Stock level is full, adequate supply

**Characteristics:**
- Immutable
- Enumerated type
- Determines visual color coding
- Validates status transitions

**Color Coding:**
- LOW: Red (#FF0000)
- HALF: Yellow (#FFFF00)
- FULL: Green (#00FF00)

---

### 5.5 ExpiryDate

**Purpose:** Encapsulates expiry date with timezone awareness

**Properties:**
- UtcValue: Timestamp in UTC
- SgtValue: Timestamp in Singapore Time (for display)
- DaysRemaining: Calculated days until expiry
- ExpiryStatus: Green/Yellow/Red based on days remaining

**Characteristics:**
- Immutable (recalculated on access)
- Timezone-aware (converts UTC to SGT)
- Calculates days remaining
- Determines expiry status

**Expiry Status Calculation (Singapore Time UTC+8):**
- For Food Items:
  - Green: >3 days remaining
  - Yellow: 1-3 days remaining
  - Red: <1 day remaining or expired
- For First-Aid Items:
  - Green: >3 months remaining
  - Yellow: 1-3 months remaining
  - Red: <1 month remaining or expired

---

### 5.6 Quantity

**Purpose:** Encapsulates quantity with unit of measurement

**Properties:**
- Value: Numeric quantity (>= 0)
- Unit: Unit of measurement (kg, pieces, ml, etc.)

**Characteristics:**
- Immutable (creates new instance on change)
- Supports increment/decrement operations
- Validates quantity constraints
- Tracks quantity changes

**Valid Operations:**
- Increment: Increase quantity by amount
- Decrement: Decrease quantity by amount (cannot go below 0)
- Set: Set quantity to specific value

---

### 5.7 ItemCategory

**Purpose:** Encapsulates item category classification

**Valid Values:**
- INGREDIENT: Fresh or packaged ingredient
- COOKED_FOOD: Prepared/cooked food
- SUPPLY: Non-food supply item
- MEDICINE: First-aid or medicine item

**Characteristics:**
- Immutable
- Enumerated type
- Defines category-specific behavior
- Validates category-type compatibility

**Category-Type Compatibility:**
- FRIDGE: INGREDIENT, COOKED_FOOD
- PANTRY: INGREDIENT, SUPPLY
- FIRST_AID: MEDICINE

---

### 5.8 Recipe

**Purpose:** Encapsulates recipe information

**Properties:**
- RecipeId: Unique identifier
- Name: Recipe name (string)
- MainIngredients: List of required ingredients
- Difficulty: Difficulty level (easy, medium, hard)
- PrepTime: Preparation time in minutes
- Source: Recipe source URL or reference
- IsSaved: Flag indicating if recipe is saved as favorite
- CompletionPercentage: Percentage of available ingredients

**Characteristics:**
- Immutable
- Represents a suggested dish
- Tracks ingredient availability
- Supports favoriting

---

### 5.9 RecipeIngredient

**Purpose:** Encapsulates recipe ingredient with availability tracking

**Properties:**
- IngredientName: Name of ingredient
- IsAvailable: Flag indicating if ingredient is in inventory
- InventoryItemId: Link to inventory item (nullable)
- Quantity: Required quantity

**Characteristics:**
- Immutable
- Links to inventory items
- Tracks ingredient availability
- Supports recipe filtering

---

### 5.10 ItemOrder

**Purpose:** Encapsulates item ordering within inventory

**Properties:**
- Value: Integer (0-based index)

**Characteristics:**
- Immutable
- Non-negative
- Supports reordering operations
- Maintains order consistency

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

### 6.1 InventoryCreatedEvent

**Trigger:** When a new inventory is created

**Properties:**
- InventoryId: Identifier of created inventory
- InventoryType: Type of inventory (fridge, pantry, first-aid)
- CreatedAt: Creation timestamp (UTC)
- InitialItems: List of default items

**Subscribers:**
- Consistency Tracking Service (for tracking)
- Audit Service (for logging)

---

### 6.2 InventoryItemAddedEvent

**Trigger:** When an item is added to inventory

**Properties:**
- InventoryId: Parent inventory identifier
- InventoryItemId: Identifier of added item
- ItemName: Name of added item
- ItemCategory: Category of item
- StockStatus: Initial stock status
- AddedAt: Addition timestamp (UTC)
- Order: Position in inventory

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.3 InventoryItemStatusChangedEvent

**Trigger:** When an item's stock status changes

**Properties:**
- InventoryId: Parent inventory identifier
- InventoryItemId: Identifier of item
- ItemName: Name of item
- OldStatus: Previous stock status
- NewStatus: New stock status
- ChangedAt: Change timestamp (UTC)

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.4 InventoryItemQuantityChangedEvent

**Trigger:** When an item's quantity changes

**Properties:**
- InventoryId: Parent inventory identifier
- InventoryItemId: Identifier of item
- ItemName: Name of item
- OldQuantity: Previous quantity
- NewQuantity: New quantity
- Unit: Unit of measurement
- ChangedAt: Change timestamp (UTC)

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.5 InventoryItemExpiryDateChangedEvent

**Trigger:** When an item's expiry date changes

**Properties:**
- InventoryId: Parent inventory identifier
- InventoryItemId: Identifier of item
- ItemName: Name of item
- OldExpiryDate: Previous expiry date (UTC)
- NewExpiryDate: New expiry date (UTC)
- ChangedAt: Change timestamp (UTC)

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.6 InventoryItemEditedEvent

**Trigger:** When an item is edited

**Properties:**
- InventoryId: Parent inventory identifier
- InventoryItemId: Identifier of edited item
- OldValues: Previous item properties
- NewValues: Updated item properties
- EditedAt: Edit timestamp (UTC)

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.7 InventoryItemDeletedEvent

**Trigger:** When an item is deleted (soft delete)

**Properties:**
- InventoryId: Parent inventory identifier
- InventoryItemId: Identifier of deleted item
- ItemName: Name of deleted item
- DeletedAt: Deletion timestamp (UTC)
- IsRecoverable: Flag indicating if item can be recovered

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.8 InventoryItemExpiredEvent

**Trigger:** When an item reaches or passes expiry date

**Properties:**
- InventoryId: Parent inventory identifier
- InventoryItemId: Identifier of expired item
- ItemName: Name of expired item
- ExpiryDate: Expiry date (UTC)
- ExpiredAt: Timestamp when expiry detected (UTC)

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.9 RecipeGeneratedEvent

**Trigger:** When recipes are generated based on available ingredients

**Properties:**
- InventoryId: Parent inventory identifier
- GeneratedRecipes: List of suggested recipes
- GeneratedAt: Generation timestamp (UTC)
- RecipeCount: Number of recipes generated

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.10 RecipeSavedEvent

**Trigger:** When a recipe is saved as favorite

**Properties:**
- InventoryId: Parent inventory identifier
- RecipeId: Identifier of saved recipe
- RecipeName: Name of recipe
- SavedAt: Save timestamp (UTC)

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.11 BulkInventoryUpdatedEvent

**Trigger:** When bulk operations are performed

**Properties:**
- InventoryId: Parent inventory identifier
- OperationType: Type of bulk operation (status-update, delete, edit)
- ItemsAffected: Number of items affected
- Changes: Summary of changes made
- UpdatedAt: Update timestamp (UTC)

**Subscribers:**
- Consistency Tracking Service
- Audit Service

---

### 6.12 InventoryArchivedEvent

**Trigger:** When inventory data is archived

**Properties:**
- InventoryId: Identifier of archived inventory
- InventoryType: Type of archived inventory
- ArchivedAt: Archive timestamp (UTC)
- ItemsArchived: Number of items archived
- ArchiveData: Archived inventory information

**Subscribers:**
- Consistency Tracking Service
- Audit Service



---

## 7. Repositories

### 7.1 InventoryRepository Interface

**Purpose:** Abstract data access for Inventory aggregate

**Responsibility:** Persist and retrieve Inventory aggregates with all child entities

**Methods:**

**save(inventory: Inventory): void**
- Persists inventory and all items to storage
- Creates new or updates existing
- Maintains transactional consistency
- Publishes domain events

**findById(inventoryId: InventoryId): Inventory | null**
- Retrieves inventory by ID
- Loads all child items
- Returns null if not found

**findByType(inventoryType: InventoryType): Inventory[]**
- Retrieves all inventories of given type
- Returns empty array if none found

**findAll(): Inventory[]**
- Retrieves all inventories
- Returns empty array if none found

**delete(inventoryId: InventoryId): void**
- Soft deletes inventory
- Preserves data for recovery
- Publishes deletion event

**findDeleted(): Inventory[]**
- Retrieves soft-deleted inventories
- Used for recovery operations

**Query Methods:**
- findByTypeAndCategory(type, category): Inventory[]
- findExpiredItems(inventoryType): InventoryItem[]
- findLowStockItems(inventoryType): InventoryItem[]
- findItemsByStatus(inventoryType, status): InventoryItem[]

---

### 7.2 RecipeRepository Interface

**Purpose:** Abstract data access for Recipe entities

**Responsibility:** Persist and retrieve recipes with favorite tracking

**Methods:**

**save(recipe: Recipe): void**
- Persists recipe to storage
- Creates new or updates existing
- Maintains recipe data

**findById(recipeId: RecipeId): Recipe | null**
- Retrieves recipe by ID
- Returns null if not found

**findByIngredients(ingredients: string[]): Recipe[]**
- Retrieves recipes matching ingredients
- Returns empty array if none found

**findFavorites(): Recipe[]**
- Retrieves all saved favorite recipes
- Returns empty array if none found

**delete(recipeId: RecipeId): void**
- Deletes recipe
- Removes from favorites if applicable

**Query Methods:**
- findByDifficulty(difficulty): Recipe[]
- findByPrepTime(maxTime): Recipe[]
- findBySource(source): Recipe[]

---

### 7.3 InventoryArchiveRepository Interface

**Purpose:** Abstract data access for archived inventory data

**Responsibility:** Persist and retrieve archived inventory records

**Methods:**

**save(archive: InventoryArchive): void**
- Persists archived inventory data
- Records archive timestamp

**findByDate(date: Date): InventoryArchive[]**
- Retrieves archives for specific date
- Returns empty array if none found

**findByInventoryType(type: InventoryType): InventoryArchive[]**
- Retrieves archives for inventory type
- Returns empty array if none found

**findAll(): InventoryArchive[]**
- Retrieves all archived records
- Returns empty array if none found

**Query Methods:**
- findByDateRange(startDate, endDate): InventoryArchive[]
- findLatestArchive(inventoryType): InventoryArchive | null

---

## 8. Domain Services

### 8.1 InventoryStatusService

**Purpose:** Encapsulate status management logic

**Responsibility:** Handle status transitions, manage status-specific behavior, emit status change events

**Operations:**

**updateStatus(inventory: Inventory, itemId: InventoryItemId, newStatus: StockStatus): Inventory**
- Updates item status
- Validates status transition
- Publishes InventoryItemStatusChangedEvent
- Returns updated inventory

**getStatusColor(status: StockStatus): string**
- Returns color code for status
- LOW: Red (#FF0000)
- HALF: Yellow (#FFFF00)
- FULL: Green (#00FF00)

**isLowStock(inventory: Inventory, itemId: InventoryItemId): boolean**
- Determines if item is low stock
- Returns true if status is LOW

**getStatusSummary(inventory: Inventory): StatusSummary**
- Returns status distribution
- Includes count of items per status
- Used for dashboard display

---

### 8.2 ExpiryDateService

**Purpose:** Encapsulate expiry date logic

**Responsibility:** Calculate days remaining, determine expiry status, detect expired items, handle Singapore Time

**Operations:**

**calculateDaysRemaining(expiryDate: ExpiryDate): number**
- Calculates days until expiry
- Uses Singapore Time (UTC+8)
- Returns negative number if expired
- Returns 0 if expires today

**getExpiryStatus(expiryDate: ExpiryDate, itemType: ItemCategory): ExpiryStatus**
- Determines expiry status (Green, Yellow, Red)
- For Food Items:
  - Green: >3 days remaining
  - Yellow: 1-3 days remaining
  - Red: <1 day remaining or expired
- For First-Aid Items:
  - Green: >3 months remaining
  - Yellow: 1-3 months remaining
  - Red: <1 month remaining or expired

**isExpired(expiryDate: ExpiryDate): boolean**
- Determines if item is expired
- Uses Singapore Time (UTC+8)
- Returns true if past expiry date

**detectExpiredItems(inventory: Inventory): InventoryItem[]**
- Finds all expired items in inventory
- Returns list of expired items
- Publishes InventoryItemExpiredEvent for each

**getExpiryWarning(expiryDate: ExpiryDate, itemType: ItemCategory): string**
- Returns human-readable expiry warning
- Examples: "Expires in 2 days", "Expired 1 day ago"

---

### 8.3 QuantityManagementService

**Purpose:** Encapsulate quantity operations

**Responsibility:** Handle increment/decrement, validate constraints, emit quantity change events

**Operations:**

**incrementQuantity(inventory: Inventory, itemId: InventoryItemId, amount: number): Inventory**
- Increases item quantity
- Validates amount > 0
- Publishes InventoryItemQuantityChangedEvent
- Returns updated inventory

**decrementQuantity(inventory: Inventory, itemId: InventoryItemId, amount: number): Inventory**
- Decreases item quantity
- Validates amount > 0 and result >= 0
- Publishes InventoryItemQuantityChangedEvent
- Returns updated inventory

**setQuantity(inventory: Inventory, itemId: InventoryItemId, newQuantity: number): Inventory**
- Sets quantity to specific value
- Validates newQuantity >= 0
- Publishes InventoryItemQuantityChangedEvent
- Returns updated inventory

**isDepleted(inventory: Inventory, itemId: InventoryItemId): boolean**
- Determines if item quantity is 0
- Returns true if depleted

**getQuantitySummary(inventory: Inventory): QuantitySummary**
- Returns quantity distribution
- Includes total items and depleted count
- Used for dashboard display

---

### 8.4 RecipeGeneratorService

**Purpose:** Encapsulate recipe generation logic

**Responsibility:** Analyze available ingredients, generate suggestions, filter by dietary restrictions, emit recipe events

**Operations:**

**generateRecipes(inventory: Inventory): Recipe[]**
- Analyzes fridge inventory
- Generates recipe suggestions
- Calculates completion percentage for each
- Publishes RecipeGeneratedEvent
- Returns list of suggested recipes

**filterByDifficulty(recipes: Recipe[], difficulty: string): Recipe[]**
- Filters recipes by difficulty level
- Supports: easy, medium, hard
- Returns filtered list

**filterByPrepTime(recipes: Recipe[], maxTime: number): Recipe[]**
- Filters recipes by maximum prep time
- Returns recipes with prep time <= maxTime

**calculateCompletionPercentage(recipe: Recipe, inventory: Inventory): number**
- Calculates percentage of available ingredients
- Returns 0-100
- Used to sort recipes by availability

**saveRecipe(recipe: Recipe): void**
- Saves recipe as favorite
- Publishes RecipeSavedEvent
- Persists to RecipeRepository

**getAvailableIngredients(inventory: Inventory): string[]**
- Returns list of available ingredients
- Filters by stock status (not LOW)
- Used for recipe generation

---

### 8.5 InventoryItemManagementService

**Purpose:** Encapsulate item CRUD operations

**Responsibility:** Add, edit, delete items with validation, handle duplicate prevention, emit item lifecycle events

**Operations:**

**addItem(inventory: Inventory, itemData: ItemData): Inventory**
- Adds new item to inventory
- Validates item properties
- Checks for duplicates
- Publishes InventoryItemAddedEvent
- Returns updated inventory

**editItem(inventory: Inventory, itemId: InventoryItemId, updates: ItemUpdates): Inventory**
- Edits existing item
- Validates changes
- Publishes InventoryItemEditedEvent
- Returns updated inventory

**deleteItem(inventory: Inventory, itemId: InventoryItemId): Inventory**
- Soft deletes item
- Publishes InventoryItemDeletedEvent
- Returns updated inventory

**recoverItem(inventory: Inventory, itemId: InventoryItemId): Inventory**
- Recovers soft-deleted item
- Restores item to active state
- Returns updated inventory

**reorderItems(inventory: Inventory, itemOrders: ItemOrder[]): Inventory**
- Reorders items in inventory
- Validates order consistency
- Returns updated inventory

---

### 8.6 BulkOperationService

**Purpose:** Encapsulate bulk operations

**Responsibility:** Handle bulk status updates, bulk deletes, bulk edits, emit bulk update events

**Operations:**

**bulkUpdateStatus(inventory: Inventory, itemIds: InventoryItemId[], newStatus: StockStatus): Inventory**
- Updates status for multiple items
- Validates all items exist
- Publishes BulkInventoryUpdatedEvent
- Returns updated inventory

**bulkDelete(inventory: Inventory, itemIds: InventoryItemId[]): Inventory**
- Soft deletes multiple items
- Validates all items exist
- Publishes BulkInventoryUpdatedEvent
- Returns updated inventory

**bulkEdit(inventory: Inventory, itemIds: InventoryItemId[], updates: ItemUpdates): Inventory**
- Edits multiple items with same updates
- Validates all items exist
- Publishes BulkInventoryUpdatedEvent
- Returns updated inventory

**bulkUpdateQuantity(inventory: Inventory, itemIds: InventoryItemId[], quantityChange: number): Inventory**
- Updates quantity for multiple items
- Validates all items exist
- Publishes BulkInventoryUpdatedEvent
- Returns updated inventory

---

### 8.7 InventoryValidationService

**Purpose:** Encapsulate validation rules

**Responsibility:** Validate item properties, enforce business constraints, provide validation error details

**Operations:**

**validateItemName(name: string): ValidationResult**
- Validates item name
- Checks length (1-255 characters)
- Checks for special characters
- Returns validation result

**validateItemCategory(category: ItemCategory, inventoryType: InventoryType): ValidationResult**
- Validates category for inventory type
- Ensures compatibility
- Returns validation result

**validateDuplicate(inventory: Inventory, itemName: string): ValidationResult**
- Checks for duplicate items
- Returns warning if duplicate found
- Returns validation result

**validateExpiryDate(expiryDate: Date): ValidationResult**
- Validates expiry date format
- Checks if date is valid
- Returns validation result

**validateQuantity(quantity: number): ValidationResult**
- Validates quantity value
- Checks if >= 0
- Returns validation result

**validateItemProperties(itemData: ItemData, inventoryType: InventoryType): ValidationResult**
- Validates all item properties
- Runs all validation rules
- Returns comprehensive result



---

## 9. Business Rules & Policies

### 9.1 StockStatusPolicy

**Rule 1: Status Levels**
- LOW: Stock level is low, reorder needed
- HALF: Stock level is half, monitor usage
- FULL: Stock level is full, adequate supply

**Rule 2: Color Coding**
- LOW: Red (#FF0000) - Visual indicator for low stock
- HALF: Yellow (#FFFF00) - Visual indicator for half stock
- FULL: Green (#00FF00) - Visual indicator for full stock

**Rule 3: Status Transitions**
- Any status can transition to any other status
- Status changes are immediate
- Status changes persist to backend
- Status changes emit InventoryItemStatusChangedEvent

**Rule 4: Bulk Status Updates**
- Multiple items can be updated simultaneously
- Bulk updates don't block UI
- Bulk updates emit single BulkInventoryUpdatedEvent

---

### 9.2 ExpiryDatePolicy

**Rule 1: Expiry Status Calculation (Singapore Time UTC+8)**
- For Food Items:
  - Green: >3 days remaining
  - Yellow: 1-3 days remaining
  - Red: <1 day remaining or expired
- For First-Aid Items:
  - Green: >3 months remaining
  - Yellow: 1-3 months remaining
  - Red: <1 month remaining or expired

**Rule 2: Expired Item Handling**
- Expired items show warning badge
- Expired items can be manually extended
- Expired items don't delete automatically
- User confirmation required before deletion
- Expired items emit InventoryItemExpiredEvent

**Rule 3: Automatic Archival**
- Expired items can be archived
- Archive preserves historical data
- Archive doesn't interfere with active data
- Archive triggered by Consistency Tracking Service (optional)

**Rule 4: Timezone Handling**
- All expiry calculations use Singapore Time (UTC+8)
- Application layer converts SGT to UTC
- Domain works with UTC internally
- No daylight saving time in Singapore

---

### 9.3 QuantityPolicy

**Rule 1: Quantity Operations**
- Quantity can be incremented by any positive amount
- Quantity can be decremented by any positive amount (result must be >= 0)
- Quantity can be set to any non-negative value
- Quantity can be 0 (item depleted)

**Rule 2: Quantity Tracking**
- Quantity changes are tracked
- Quantity changes persist to backend
- Quantity changes emit InventoryItemQuantityChangedEvent
- Quantity changes are idempotent

**Rule 3: Depleted Items**
- Items with quantity 0 are considered depleted
- Depleted items still appear in inventory
- Depleted items can be restocked
- Depleted items can be deleted

---

### 9.4 RecipeGenerationPolicy

**Rule 1: Recipe Generation**
- Recipes generated based on available ingredients
- Only ingredients with status != LOW are considered available
- Recipes include difficulty level (easy, medium, hard)
- Recipes include prep time in minutes
- Recipes can be filtered by dietary restrictions

**Rule 2: Recipe Suggestions**
- Limited ingredients may result in no suggestions
- User can manually add ingredients to search
- Recipes update when inventory changes
- Recipes sorted by completion percentage (highest first)

**Rule 3: Recipe Favoriting**
- User can save favorite recipes
- Saved recipes persist to backend
- Saved recipes emit RecipeSavedEvent
- User can view all saved recipes

**Rule 4: Recipe Completion Percentage**
- Calculated as (available ingredients / required ingredients) * 100
- Rounded to nearest integer
- Used to sort recipes by availability
- Recipes with 100% completion are "ready now"

---

### 9.5 ItemManagementPolicy

**Rule 1: Duplicate Prevention**
- System warns if duplicate item name detected
- Allows user to proceed or cancel
- Doesn't prevent duplicates (user choice)
- Warning is non-blocking

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
- Edits don't affect quantity history
- Before/after values logged for audit
- Concurrent edits handled gracefully
- Last-write-wins strategy

**Rule 5: Item Ordering**
- Items maintain order within inventory
- Order can be changed via reordering
- Order persists to backend
- Order affects UI display

---

### 9.6 BulkOperationPolicy

**Rule 1: Bulk Operations**
- Select multiple items with checkboxes
- Bulk status update (Low/Half/Full)
- Bulk delete with confirmation
- Bulk edit properties
- Clear selection option

**Rule 2: Bulk Operation Constraints**
- Large bulk operations don't block UI
- Partial selection handled correctly
- Undo bulk operations (optional)
- Bulk operations emit single event

**Rule 3: Bulk Operation Confirmation**
- Bulk delete requires user confirmation
- Confirmation shows number of items to delete
- User can cancel before confirmation

---

### 9.7 ArchivalPolicy

**Rule 1: Archive Timing**
- Inventory data archived periodically
- Archive includes date, items, quantities
- Archive timestamp recorded (UTC)

**Rule 2: Data Preservation**
- Archive doesn't interfere with active data
- Active data remains accessible
- Historical data accessible for analytics
- Archive queryable by date range

**Rule 3: Archive Integrity**
- Large archives don't impact performance
- Archive stored separately from active data
- Archive immutable after creation
- Archive can be exported for backup

---

## 10. Anti-Corruption Layer

### 10.1 Purpose
Isolate domain model from Google Sheets API changes, providing translation between domain concepts and external API.

### 10.2 Responsibilities
- Translate domain Inventory to Google Sheets format
- Translate Google Sheets data to domain Inventory
- Handle API errors and exceptions
- Manage API authentication and rate limiting
- Handle offline queue integration

### 10.3 Key Interfaces

**InventoryToSheetTranslator**
- Converts Inventory aggregate to Google Sheets row format
- Handles nested InventoryItems
- Manages timestamp conversion (UTC to SGT for display)
- Handles type-specific formatting

**SheetToInventoryTranslator**
- Converts Google Sheets row to Inventory aggregate
- Reconstructs InventoryItems
- Validates data integrity
- Handles missing or malformed data

**GoogleSheetsInventoryRepository**
- Implements InventoryRepository interface
- Uses Google Sheets API for persistence
- Handles API errors gracefully
- Implements retry logic
- Manages offline queue

**RecipeToSheetTranslator**
- Converts Recipe to Google Sheets format
- Handles ingredient lists
- Manages recipe metadata

**SheetToRecipeTranslator**
- Converts Google Sheets row to Recipe
- Reconstructs ingredient lists
- Validates recipe data

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

### 11.2 Event Publishing Guarantees

**At-Least-Once Delivery:**
- Events published at least once
- Handlers must be idempotent
- Duplicate events possible

**Event Ordering:**
- Events for same aggregate published in order
- Events for different aggregates may be out of order
- Handlers must handle out-of-order events

---

## 12. Aggregate Lifecycle & State Transitions

### 12.1 Inventory Aggregate States

**State 1: Created**
- Inventory initialized with type
- Default items added
- Ready for use

**State 2: Active**
- Inventory in use
- Items can be added/edited/deleted
- Normal operations

**State 3: Archived**
- Inventory data archived
- Items preserved
- Preparation for next cycle

**State 4: Deleted**
- Soft delete
- Data preserved
- Can be recovered

### 12.2 InventoryItem Entity States

**State 1: Created**
- Item added to inventory
- Active and available

**State 2: Active**
- Item in use
- Can be edited or deleted
- Status and quantity can change

**State 3: Expired**
- Item past expiry date (if applicable)
- Shows warning badge
- Can be extended or deleted

**State 4: Edited**
- Item properties modified
- Edit history maintained
- Quantity history preserved

**State 5: Deleted**
- Soft delete
- Data preserved
- Can be recovered

### 12.3 State Transition Rules

**Valid Transitions:**
- Created → Active (immediate)
- Active → Expired (automatic if expiry date passed)
- Active → Edited (on property change)
- Active → Deleted (on user delete)
- Expired → Active (on expiry date extension)
- Expired → Deleted (on user delete)
- Deleted → Active (on recovery)

**Invariants That Must Be Maintained:**
- Item must belong to valid inventory
- Item must have valid category
- Item must have valid status
- Quantity must be non-negative
- Expiry date must be valid (if set)

**Guard Conditions:**
- Cannot delete already deleted item
- Cannot edit deleted item
- Cannot change inventory type
- Cannot set negative quantity

---

## 13. Integration Points

### 13.1 Consistency Tracking Service Integration

**Inbound:**
- Receives InventoryItemExpiredEvent
- Receives InventoryArchivedEvent
- Receives BulkInventoryUpdatedEvent

**Outbound:**
- Sends archival trigger to InventoryArchiveService
- Receives completion data for consistency tracking
- Receives archived data for historical tracking

**Data Flow:**
1. Item expires or bulk operation completes
2. Domain event published
3. Consistency Tracking Service receives event
4. Service updates consistency metrics
5. Service publishes milestone events

### 13.2 UI Component Integration

**Data Transformation:**
- Domain model transformed to UI format
- Timestamps converted to SGT for display
- Status converted to color codes
- Expiry status converted to visual indicators
- Quantity formatted with units

**Accessibility:**
- High-contrast colors applied
- Clear status indicators
- Keyboard navigation supported
- Screen reader compatible

---

### 13.3 Persistence Integration

**Google Sheets API:**
- Anti-Corruption Layer handles API calls
- Inventory data persisted to Google Sheets
- Offline queue managed by Hosting Service
- Sync triggered when online

**Offline Queue:**
- Local changes queued when offline
- Queue synced when connection restored
- Queue prevents data loss
- Queue maintains operation order

---

## 14. Error Handling & Exceptions

### 14.1 Domain Exceptions

**InventoryNotFoundException**
- Thrown when inventory not found
- Includes inventory ID
- Handled by application layer

**InventoryItemNotFoundException**
- Thrown when item not found
- Includes item ID and inventory ID
- Handled by application layer

**InvalidInventoryTypeException**
- Thrown when invalid inventory type provided
- Includes invalid type value
- Handled by validation service

**InvalidStockStatusException**
- Thrown when invalid stock status provided
- Includes invalid status value
- Handled by validation service

**InvalidExpiryDateException**
- Thrown when invalid expiry date provided
- Includes invalid date value
- Handled by validation service

**InvalidQuantityException**
- Thrown when invalid quantity provided
- Includes invalid quantity value
- Handled by validation service

**DuplicateItemException**
- Thrown when duplicate item detected
- Includes item name
- User can choose to proceed or cancel

**RecipeGenerationFailedException**
- Thrown when recipe generation fails
- Includes error details
- Triggers retry logic

**ArchivalFailedException**
- Thrown when archival fails
- Includes error details
- Triggers retry logic

**BulkOperationFailedException**
- Thrown when bulk operation fails
- Includes error details and affected items
- Triggers rollback logic

---

## 15. Design Decisions & Rationale

### 15.1 Inventory as Aggregate Root

**Decision:** Inventory is aggregate root, InventoryItem is child entity

**Rationale:**
- Inventories are small (10-50 items)
- Operations often affect multiple items
- Strong consistency required
- Simpler to implement and maintain
- Aligns with user mental model

---

### 15.2 Unified Repository

**Decision:** Single InventoryRepository, items accessed through Inventory

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

### 15.6 Single Inventory Aggregate with Type Discrimination

**Decision:** Single Inventory aggregate with InventoryType value object

**Rationale:**
- Simpler domain model
- Easier to manage relationships
- Type-specific behavior encapsulated in value objects
- Reduces aggregate complexity

---

### 15.7 Soft Delete for Data Recovery

**Decision:** Soft delete instead of hard delete

**Rationale:**
- Preserves data for recovery
- Maintains audit trail
- Supports undo operations
- Follows data preservation best practices

---

## 16. Summary

This domain model provides a comprehensive DDD specification for the Inventory Management Service with:

- Clear aggregate boundaries (Inventory as root)
- Rich value objects (InventoryType, StockStatus, ExpiryDate, Quantity, etc.)
- Comprehensive domain events (12 event types)
- Well-defined repositories (3 repository interfaces)
- Powerful domain services (7 services)
- Clear business rules and policies (7 policies)
- Anti-Corruption Layer for external API isolation
- Asynchronous event publishing for decoupling
- Singapore Time (UTC+8) integration throughout
- Soft delete for data recovery
- Bulk operations support
- Recipe generation capability
- Status-based tracking with visual indicators
- Expiry date management with color coding
- Quantity tracking with increment/decrement
- Full lifecycle management for items and inventories

**Key Characteristics:**
- Type-safe with value objects
- Consistent with Singapore Time (UTC+8)
- Supports multiple inventory types (fridge, pantry, first-aid)
- Handles expiry dates with timezone awareness
- Supports bulk operations for efficiency
- Generates recipes based on available ingredients
- Maintains audit trail through domain events
- Preserves data through soft deletes
- Decoupled from external APIs through ACL
- Resilient through asynchronous event publishing

This model is ready for implementation with clear contracts for repositories, services, and event handlers.

