# Life OS Unit - Fix Plan
## Senior Frontend Engineer - Reactive State Management

### Overview
Fix architectural and logic bugs to ensure seamless, real-time user experience with proper state management and UI re-rendering.

---

## Phase 1: Architecture Foundation (Re-Render System)
**Goal:** Implement automatic UI re-rendering on all data mutations

### Step 1.1: Audit Current Architecture
- [ ] Review app.js router() function structure
- [ ] Identify all render functions (renderChoresBoard, renderSelfCareBoard, etc.)
- [ ] Check state mutation points in utils.js and components.js
- [ ] Document current re-render triggers

### Step 1.2: Implement Re-Render Pattern
- [ ] Create a global render() function that re-renders current view
- [ ] Add render() calls to: addItem(), updateItem(), deleteItem()
- [ ] Ensure stateManager.notifyListeners() triggers UI updates
- [ ] Test: Add/Edit/Delete should update UI without refresh

**Files to Modify:**
- `utils.js` - Add render() calls to CRUD functions
- `app.js` - Create global render() function
- `state.js` - Ensure notifyListeners() is called

---

## Phase 2: Missing Module Functions (ReferenceErrors)
**Goal:** Define all missing render functions

### Step 2.1: Audit Missing Functions
- [ ] Identify all missing render functions in app.js
- [ ] Check: renderGymBoard, renderRtoBoard, renderBathroomCleanBoard
- [ ] Verify router() can access all functions

### Step 2.2: Implement Missing Render Functions
- [ ] Create renderGymBoard() function
- [ ] Create renderRtoBoard() function
- [ ] Create renderBathroomCleanBoard() function
- [ ] Ensure all functions follow same pattern as existing boards

**Files to Modify:**
- `app.js` - Add missing render functions

---

## Phase 3: CRUD Operations - Inline Editing
**Goal:** Enable inline editing for all inventory modules

### Step 3.1: Implement Inline Edit UI
- [ ] Create renderEditableItem() component
- [ ] Add input field with Save (💾) and Cancel (✖️) buttons
- [ ] Style to match existing UI
- [ ] Handle click-to-edit transformation

### Step 3.2: Implement Edit Logic
- [ ] Create editItem() function with inline save
- [ ] Update stateManager on save
- [ ] Trigger re-render after save
- [ ] Handle cancel (revert changes)

### Step 3.3: Apply to All Inventory Modules
- [ ] Fridge board - enable inline editing
- [ ] Non-food board - enable inline editing
- [ ] Pantry board - enable inline editing
- [ ] First-aid board - enable inline editing

**Files to Modify:**
- `components.js` - Add renderEditableItem()
- `utils.js` - Add editItem() with inline save
- `app.js` - Update inventory rendering

---

## Phase 4: Chores Logic - Frequency Filtering
**Goal:** Categorize chores by Daily, Weekly, Bi-weekly, Monthly

### Step 4.1: Update Data Model
- [ ] Add frequency attribute to ChecklistItem
- [ ] Update getDefaultState() with frequency values
- [ ] Ensure existing items have frequency set

### Step 4.2: Implement Frequency Filtering
- [ ] Create groupByFrequency() function
- [ ] Update renderChoresBoard() to group items
- [ ] Add frequency headers (Daily, Weekly, etc.)
- [ ] Ensure low-energy mode respects frequency

### Step 4.3: Update Add Item Logic
- [ ] Add frequency selector to chores add form
- [ ] Default to 'daily' for new items
- [ ] Save frequency to stateManager

**Files to Modify:**
- `state.js` - Update getDefaultState() with frequency
- `app.js` - Update renderChoresBoard() with grouping
- `components.js` - Add frequency selector to form
- `utils.js` - Add groupByFrequency() function

---

## Phase 5: Status Toggle & Inventory Persistence
**Goal:** Make status toggles work and persist changes

### Step 5.1: Fix Status Dropdown Events
- [ ] Add onchange event listener to status dropdowns
- [ ] Trigger updateItem() on status change
- [ ] Ensure stateManager updates immediately
- [ ] Trigger re-render after update

### Step 5.2: Verify Persistence
- [ ] Check localStorage is being updated
- [ ] Verify data persists on page reload
- [ ] Test all inventory modules (Fridge, Non-food, Pantry, First-aid)

### Step 5.3: Remove Read-Only Restrictions
- [ ] Audit renderInventoryTable() for any read-only attributes
- [ ] Ensure all inventory items are editable
- [ ] Test add/edit/delete on all inventory boards

**Files to Modify:**
- `components.js` - Fix status dropdown events
- `utils.js` - Ensure updateItem() triggers re-render
- `app.js` - Verify inventory boards are not read-only

---

## Execution Order
1. **Phase 1** - Re-Render Architecture (Foundation)
2. **Phase 2** - Missing Module Functions (Unblock errors)
3. **Phase 3** - CRUD Operations (User interactions)
4. **Phase 4** - Chores Logic (Business logic)
5. **Phase 5** - Status Toggle & Persistence (Polish)

---

## Testing Checklist
- [ ] Add item → UI updates without refresh
- [ ] Edit item → UI updates without refresh
- [ ] Delete item → UI updates without refresh
- [ ] All render functions defined (no ReferenceErrors)
- [ ] Inline editing works on all inventory modules
- [ ] Chores grouped by frequency
- [ ] Status toggles persist on reload
- [ ] Low-energy mode still works
- [ ] All boards accessible via router

---

## Success Criteria
✅ No manual browser refresh needed for any CRUD operation
✅ All render functions defined and accessible
✅ Inline editing works on all modules
✅ Chores properly categorized by frequency
✅ Status changes persist in localStorage
✅ Seamless, real-time user experience
