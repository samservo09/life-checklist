# Unit 3: Inventory Management Service

## Overview
Handles all inventory trackers including Fridge/Freezer, Dry Goods & Pantry, and First-Aid. Manages status-based tracking (Low/Half/Full), expiry dates, quantities, and recipe generation.

## QR Code Routes
- `/area/fridge` - Fridge/Freezer Tracker
- `/area/pantry` - Dry Goods & Pantry Stock
- `/area/first-aid` - First-Aid Tracker
- `/area/recipes` - Recipe Generator

## User Stories

### US-7.1: User tracks fridge ingredients with status levels
**As a** user managing kitchen inventory,
**I want to** track fridge ingredients with Low/Half/Full status levels,
**So that** I know what's available for cooking.

**Acceptance Criteria:**
- Ingredient list displays with status dropdown (Low/Half/Full)
- Status changes update immediately
- Visual color coding: Red (Low), Yellow (Half), Green (Full)
- Add/remove ingredients functionality
- Search/filter by ingredient name
- User can add custom ingredients

**Fridge Ingredients Table Structure:**
| Ingredient | Type | Date Opened/Bought | Used By | Status |

**Edge Cases:**
- Duplicate ingredients handled gracefully
- Status changes persist to backend
- Offline changes sync when connection restored
- User can edit ingredient details

---

### US-7.2: User tracks cooked food with expiry dates
**As a** user managing food safety,
**I want to** track cooked food with "good until" dates,
**So that** I don't consume expired food.

**Acceptance Criteria:**
- Cooked food list displays with date picker for expiry
- Items show days remaining until expiry
- Color coding: Green (>3 days), Yellow (1-3 days), Red (<1 day)
- Expired items show warning badge
- Option to mark as consumed or discard
- Automatic archival of expired items
- User can add custom cooked food items

**Frozen & Cooked Food Table Structure:**
| Item | Cooked On | Good Until | Notes |

**Edge Cases:**
- Timezone handling for date calculations
- User can manually extend expiry dates
- Expired items don't delete automatically (user confirmation required)
- User can edit food details

---

### US-7.3: User accesses recipe generator based on available ingredients
**As a** user wanting meal inspiration,
**I want to** see recipe suggestions based on my available ingredients,
**So that** I can reduce decision fatigue and use what I have.

**Acceptance Criteria:**
- Recipe generator analyzes current fridge inventory
- Suggests recipes using available ingredients
- Recipes display with difficulty level and prep time
- Link to external recipe source (optional)
- User can save favorite recipes
- Recipes update when inventory changes

**"We Can Make" Dish Table Structure:**
| Dish Name | Main Ingredients | Ready Now? | Missing? |

**Edge Cases:**
- Limited ingredients may result in no suggestions
- User can manually add ingredients to search
- Recipes can be filtered by dietary restrictions
- User can add custom recipes

---

### US-8.1: User tracks pantry items with Low/Half/Full status
**As a** user managing pantry inventory,
**I want to** track dry goods with Low/Half/Full status levels,
**So that** I know when to restock.

**Acceptance Criteria:**
- Pantry item list displays with status dropdown (Low/Half/Full)
- Status changes update immediately
- Visual color coding: Red (Low), Yellow (Half), Green (Full)
- Add/remove items functionality
- Search/filter by item name
- Bulk status update option
- User can add custom pantry items

**Dry Goods & Pantry Stock Table Structure:**
| Item | Category | Stock Level (Low/Half/Full) | Notes |

**Dry Goods & Pantry Items:**
- Rice
- Salt
- Sugar
- Soy sauce
- Vinegar
- Cooking oil
- Pasta
- Canned tuna
- Oats
- Daily fix nuts
- Milk
- Ketchup
- Sandwich spread
- Bread

**Edge Cases:**
- Duplicate items handled gracefully
- Status changes persist to backend
- Offline changes sync when connection restored
- User can edit item details

---

### US-8.2: User tracks cleaning supplies with Low/Half/Full status
**As a** user managing cleaning supplies,
**I want to** track non-food stock with Low/Half/Full status levels,
**So that** I'm prepared for cleaning tasks.

**Acceptance Criteria:**
- Cleaning supplies list displays with status dropdown (Low/Half/Full)
- Status changes update immediately
- Visual color coding: Red (Low), Yellow (Half), Green (Full)
- Add/remove items functionality
- Search/filter by item name
- Reorder reminders for Low items (optional)
- User can add custom cleaning supply items

**Non-Food Restock Table Structure:**
| Item | Category | Stock Level (Low/Half/Full) |

**Non-Food Stock Items (Check every 2 weeks):**
- Paper towel
- Napkin
- Hand soap
- Trash bag
- Laundry detergent
- Laundry fab con
- Dish soap
- Floor cleaner
- Bathroom cleaner
- Daz cleaner
- Dish sponge

**Edge Cases:**
- Duplicate items handled gracefully
- Status changes persist to backend
- Offline changes sync when connection restored
- User can edit item details

---

### US-9.1: User tracks first-aid items with quantities and expiry dates
**As a** user maintaining first-aid readiness,
**I want to** track first-aid items with quantities and expiry dates,
**So that** I'm prepared for emergencies.

**Acceptance Criteria:**
- First-aid item list displays with quantity and expiry date fields
- Quantity can be incremented/decremented
- Date picker for expiry dates
- Items show days remaining until expiry
- Color coding: Green (>3 months), Yellow (1-3 months), Red (<1 month)
- Expired items show warning badge
- Add/remove items functionality
- User can add custom first-aid items

**First-Aid Items Tracker Table Structure:**
| Item | Expiry (if applicable) | Quantity |

**Edge Cases:**
- Timezone handling for date calculations
- User can manually extend expiry dates
- Expired items don't delete automatically (user confirmation required)
- Quantity can be 0 (item depleted)
- User can edit item details

---

### US-14.1: User can add custom items to any checklist
**As a** user with unique needs,
**I want to** add custom items to any checklist (chores, self-care, logistics, bathroom),
**So that** I can personalize the app to my specific routine.

**Acceptance Criteria:**
- Add button available on all checklist modules
- Modal/form to enter new item details
- New items persist to backend
- New items appear immediately in checklist
- User can set item properties (name, category, notes)
- Undo option for accidental additions

**Edge Cases:**
- Duplicate item prevention or warning
- Character limit for item names
- Special characters handled gracefully

---

### US-14.2: User can edit existing items in any module
**As a** user wanting to update my items,
**I want to** edit existing items in checklists and inventory trackers,
**So that** I can keep my data accurate and relevant.

**Acceptance Criteria:**
- Edit button/icon available on all items
- Modal/form to update item details
- Changes persist to backend
- Changes appear immediately
- User can modify name, category, notes, and other properties
- Undo option for accidental edits

**Edge Cases:**
- Editing doesn't affect completion history
- Concurrent edits handled gracefully
- Validation prevents invalid data

---

### US-14.3: User can remove items from any module
**As a** user wanting to clean up my lists,
**I want to** remove items from checklists and inventory trackers,
**So that** I can keep only relevant items.

**Acceptance Criteria:**
- Delete button/icon available on all items
- Confirmation dialog before deletion
- Deleted items removed from backend
- Deleted items disappear immediately
- Option to archive instead of delete (optional)
- Undo option for accidental deletions

**Edge Cases:**
- Deleting doesn't affect historical data
- Bulk delete option (optional)
- Soft delete for data recovery

---

### US-14.4: User can bulk manage items in inventory trackers
**As a** user managing large inventories,
**I want to** perform bulk operations on inventory items,
**So that** I can update multiple items efficiently.

**Acceptance Criteria:**
- Select multiple items with checkboxes
- Bulk status update (Low/Half/Full)
- Bulk delete with confirmation
- Bulk edit properties
- Clear selection option
- Bulk operations persist to backend

**Edge Cases:**
- Large bulk operations don't block UI
- Partial selection handled correctly
- Undo bulk operations (optional)

---

## API Endpoints

### Inventory Operations
- `GET /api/inventory/:type` - Fetch inventory by type (fridge, pantry, first-aid)
- `POST /api/inventory/:type/items` - Add item
- `PUT /api/inventory/:type/items/:id` - Update item
- `DELETE /api/inventory/:type/items/:id` - Remove item
- `PATCH /api/inventory/:type/items/:id/status` - Update status (Low/Half/Full)
- `POST /api/inventory/bulk-update` - Bulk update items
- `GET /api/recipes` - Get recipe suggestions based on fridge inventory
- `POST /api/recipes/save` - Save favorite recipe
- `GET /api/recipes/favorites` - Get saved recipes

### Data Models

**Inventory Item:**
```json
{
  "id": "string",
  "inventoryType": "fridge|pantry|first-aid",
  "name": "string",
  "category": "string",
  "status": "low|half|full",
  "quantity": "number",
  "unit": "string",
  "expiryDate": "date",
  "dateOpened": "date",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Fridge Item (extends Inventory Item):**
```json
{
  "type": "ingredient|cooked-food",
  "dateOpened": "date",
  "usedBy": "date",
  "goodUntil": "date"
}
```

**Recipe:**
```json
{
  "id": "string",
  "name": "string",
  "mainIngredients": ["string[]"],
  "difficulty": "easy|medium|hard",
  "prepTime": "number",
  "readyNow": "boolean",
  "missing": ["string[]"],
  "source": "string",
  "saved": "boolean"
}
```

## Dependencies
- **Consistency Tracking Service** - For archival of inventory changes (optional)
- **Shared UI Component Library** - For high-contrast components and accessibility

## Integration Points
- Sends inventory data to Consistency Tracking Service (optional)
- Uses shared UI components for rendering
- Generates recipes based on fridge inventory status
