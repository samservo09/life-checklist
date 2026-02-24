# Unit 1: Checklist Management Service

## Overview
Handles all checklist-based modules including Chore Board, Self-Care Board, Logistics Checklists, and Bathroom Cleaning. Manages daily/weekly/bi-weekly/monthly task cycles with Low Energy toggle mode.

## QR Code Routes
- `/area/chores` - Chore Board
- `/area/self-care` - Self-Care Board
- `/area/bathroom` - Bathroom Cleaning
- `/area/desk` - Gym Checklist (Logistics)
- `/area/door` - RTO Checklist (Logistics)

## User Stories

### US-2.1: User views daily chores with Low Energy toggle
**As a** neurodivergent user with variable energy levels,
**I want to** toggle between full chore list and a simplified "Low Energy" mode,
**So that** I can adapt my task list to my current capacity.

**Acceptance Criteria:**
- Full view displays all daily, weekly, bi-weekly, and monthly tasks
- Low Energy toggle shows only 4 fallback essential tasks
- Toggle state persists during session
- Visual indicator shows which mode is active
- Fallback tasks are: [Wipe one surface (counter or desk), Take out trash bag, Do dishes for 5 mins, Put 10 things away to their places]

**Daily Tasks (Every day before bed):**
- Cooking food/meal prep baon
- Dishes (every night)
- Wipe kitchen counter
- Wipe/tidy up desk
- Floor sweep
- Laundry ur underwears

**Edge Cases:**
- Toggle state resets on page refresh (unless persisted to backend)
- Low Energy mode still allows manual task completion from full list
- User can add custom daily tasks

---

### US-2.2: User completes daily chores and sees visual feedback
**As a** user tracking my daily progress,
**I want to** check off completed tasks and see immediate visual feedback,
**So that** I get dopamine-driven motivation to continue.

**Acceptance Criteria:**
- Checkbox toggles on/off with smooth animation
- Completed tasks show strikethrough or color change
- Completion count updates in real-time
- Visual progress indicator (e.g., "3/8 tasks complete")
- High-contrast colors for accessibility

**Edge Cases:**
- Rapid clicking doesn't cause duplicate submissions
- Offline completion syncs when connection restored

---

### US-2.3: System resets daily chores at 12:00 AM
**As a** user wanting consistent daily tracking,
**I want to** have my daily chores automatically reset at midnight,
**So that** I start each day fresh without manual intervention.

**Acceptance Criteria:**
- Daily tasks reset at 12:00 AM UTC (or user timezone if configurable)
- Previous day's completion data is archived to consistency log
- Weekly tasks reset on Sunday at 12:00 AM
- Bi-weekly tasks reset every other Sunday
- Monthly tasks reset on the 1st of each month
- User receives notification of reset (optional toast/banner)

**Edge Cases:**
- Timezone handling for users in different regions
- Daylight saving time transitions handled correctly
- Reset occurs even if app is closed

---

### US-2.4: User views weekly chores with Sunday reset
**As a** user managing weekly tasks,
**I want to** see weekly chores that reset every Sunday,
**So that** I can track recurring weekly responsibilities.

**Acceptance Criteria:**
- Weekly tasks display separately from daily tasks
- Reset occurs every Sunday at 12:00 AM
- Previous week's data archived before reset
- Visual indicator shows "Week of [date]"

**Weekly Tasks (Every Sunday - tick off once done):**
- Clean toilet
- Mop/sweep floor
- Fridge toss check
- Deep clean sink
- Take out all trash

**Edge Cases:**
- User can add custom weekly tasks
- Partial completion tracked separately

---

### US-2.5: User manages bi-weekly and monthly tasks
**As a** user with longer-cycle responsibilities,
**I want to** track bi-weekly and monthly tasks with appropriate reset cycles,
**So that** I can manage all my responsibilities in one place.

**Acceptance Criteria:**
- Bi-weekly tasks reset every other Sunday
- Monthly tasks reset on the 1st of each month
- Clear labeling of reset frequency
- Historical data preserved for consistency tracking

**Bi-weekly Tasks:**
- Laundry (bring clothes to laundry)
- Check non-food stock
- Check food stock
- Check first-aid kit stock

**Monthly Tasks:**
- Fridge full clean
- Declutter stuff (throw, give, or sell)

**Edge Cases:**
- User can add custom bi-weekly and monthly tasks
- Partial completion tracked separately

---

### US-3.1: User views morning routine checklist
**As a** user establishing consistent morning habits,
**I want to** see a step-by-step morning routine checklist,
**So that** I can build a sustainable morning ritual.

**Acceptance Criteria:**
- Morning routine displays as ordered list of steps
- Each step can be checked off independently
- Visual progress indicator shows completion percentage
- Estimated time to complete displayed

**Morning Routine Tasks:**
- Face wash
- Brush teeth
- Moisturizer
- Sunscreen

**Edge Cases:**
- User can skip steps without blocking others
- Incomplete morning routine carries over to next day (optional)
- User can add custom morning routine tasks

---

### US-3.2: User views evening routine checklist
**As a** user establishing consistent evening habits,
**I want to** see a step-by-step evening routine checklist,
**So that** I can wind down consistently before bed.

**Acceptance Criteria:**
- Evening routine displays as ordered list of steps
- Each step can be checked off independently
- Visual progress indicator shows completion percentage
- Estimated time to complete displayed

**Evening Routine Tasks:**
- Bath
- Brush teeth
- Micellar water
- Moisturizer
- Take meds

**Edge Cases:**
- Evening routine can be started at any time
- Incomplete evening routine carries over to next day (optional)
- User can add custom evening routine tasks

---

### US-4.1: User accesses Gym Checklist via desk QR code
**As a** user preparing for the gym,
**I want to** scan a desk QR code to access my gym bag checklist,
**So that** I don't forget essential items.

**Acceptance Criteria:**
- Desk QR code routes to /area/desk
- Gym checklist displays with all items
- Checklist persists until manually reset
- Visual confirmation when all items are checked
- Option to print or share checklist
- User can add/remove items from checklist

**Gym Checklist Items:**
- Protein drink
- Water bottle
- Bath towel
- Slippers/crocs
- At least 1 fruit/snack
- Clothes to change into
- Towel
- Gym pouch
- ID for gym
- Keys

**Edge Cases:**
- User can access gym checklist from any location
- Checklist resets after gym session (manual or automatic)
- User can customize items for different gym sessions

---

### US-4.2: User accesses RTO Checklist via door QR code
**As a** user preparing to return to office,
**I want to** scan a door QR code to access my RTO (Return to Office) checklist,
**So that** I'm prepared before leaving home.

**Acceptance Criteria:**
- Door QR code routes to /area/door
- RTO checklist displays with all items
- Checklist persists until manually reset
- Visual confirmation when all items are checked
- Option to print or share checklist
- User can add/remove items from checklist

**RTO Checklist Items:**
- Keys
- Wallet
- Company ID
- Chargers
- Eye glasses
- Hygiene pouch
- Water tumbler
- Lunch
- Fan

**Edge Cases:**
- User can access RTO checklist from any location
- Checklist resets after returning home (manual or automatic)
- User can customize items for different RTO scenarios

---

### US-5.1: User views detailed bathroom cleaning sub-tasks
**As a** user maintaining bathroom hygiene,
**I want to** see detailed sub-tasks for bathroom cleaning,
**So that** I can systematically clean without missing areas.

**Acceptance Criteria:**
- Bathroom cleaning displays as ordered list of sub-tasks
- Each sub-task can be checked off independently
- Visual progress indicator shows completion percentage
- Estimated time to complete displayed
- High-contrast colors for visibility
- User can add/remove sub-tasks

**Bathroom Cleaning Sub-tasks:**
- Toilet bowl scrub
- Toilet seat & lid wipe
- Sink scrub
- Tap and handles wipe
- Mirror wipe
- Counter wipe
- Floor sweep
- Floor mop
- Shower walls wipe
- Refill soap/shampoo

**Edge Cases:**
- User can skip sub-tasks without blocking others
- Incomplete cleaning carries over to next session (optional)
- User can customize cleaning tasks

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

## API Endpoints

### Checklist Operations
- `GET /api/checklists/:type` - Fetch checklist by type (chores, self-care, bathroom, gym, rto)
- `POST /api/checklists/:type/items` - Add item to checklist
- `PUT /api/checklists/:type/items/:id` - Update item
- `DELETE /api/checklists/:type/items/:id` - Remove item
- `PATCH /api/checklists/:type/items/:id/complete` - Mark item complete/incomplete
- `POST /api/checklists/reset` - Trigger reset (internal, called by Consistency Service)
- `GET /api/checklists/:type/low-energy` - Get low energy mode checklist

### Data Models

**Checklist Item:**
```json
{
  "id": "string",
  "checklistType": "chores|self-care|bathroom|gym|rto",
  "name": "string",
  "category": "daily|weekly|bi-weekly|monthly|morning|evening",
  "completed": "boolean",
  "completedAt": "timestamp",
  "order": "number",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Checklist:**
```json
{
  "type": "chores|self-care|bathroom|gym|rto",
  "items": ["ChecklistItem[]"],
  "lowEnergyMode": "boolean",
  "completionPercentage": "number",
  "lastResetAt": "timestamp"
}
```

## Dependencies
- **Consistency Tracking Service** - For archival of completion data before reset
- **Shared UI Component Library** - For high-contrast components and accessibility

## Integration Points
- Receives reset trigger from Consistency Tracking Service
- Sends completion data to Consistency Tracking Service for archival
- Uses shared UI components for rendering
