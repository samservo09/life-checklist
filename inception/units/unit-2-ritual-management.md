# Unit 2: Ritual Management Service

## Overview
Handles ritual modules with conditional logic based on day of week. Currently manages Bath Ritual with MWFSat vs TTHSun product rotations and universal post-bath steps.

## QR Code Routes
- `/area/bath-ritual` - Bath Ritual

## User Stories

### US-6.1: User follows conditional Bath Ritual based on day of week
**As a** user with specific product rotations,
**I want to** follow a bath ritual that changes based on the day of the week,
**So that** I can maintain consistent skincare with product rotation.

**Acceptance Criteria:**
- MWFSat (Monday, Wednesday, Friday, Saturday) shows one product set
- TTHSun (Tuesday, Thursday, Sunday) shows different product set
- Ritual displays as ordered steps
- Each step can be checked off independently
- Visual indicator shows current day's product set
- Estimated time to complete displayed

**Bath Ritual - MWFSat Days:**
1. Shampoo + Selsun blue
2. Soap
3. Conditioner

**Bath Ritual - TTHSun Days:**
1. Clarifying shampoo
2. Soap
3. Conditioner
4. Scrub with body wash

**Universal Post-Bath Steps (All Days):**
5. Body oil
6. Lotion
7. Powder
8. Perfume

**Edge Cases:**
- Timezone handling for day-of-week determination
- User can manually override product set if needed
- Ritual persists across sessions until reset
- User can customize products and steps

---

### US-6.2: User completes universal post-bath steps
**As a** user with consistent post-bath routine,
**I want to** follow universal post-bath steps after the ritual,
**So that** I maintain consistent self-care.

**Acceptance Criteria:**
- Universal steps display after product rotation: [Oil, Lotion, Powder, Perfume]
- Steps are the same regardless of day of week
- Each step can be checked off independently
- Visual confirmation when all steps complete

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

### Ritual Operations
- `GET /api/rituals/:type` - Fetch ritual by type (bath)
- `GET /api/rituals/:type/today` - Fetch today's ritual variant based on day of week
- `POST /api/rituals/:type/steps` - Add step to ritual
- `PUT /api/rituals/:type/steps/:id` - Update step
- `DELETE /api/rituals/:type/steps/:id` - Remove step
- `PATCH /api/rituals/:type/steps/:id/complete` - Mark step complete/incomplete
- `GET /api/rituals/:type/schedule` - Get day-of-week schedule

### Data Models

**Ritual Step:**
```json
{
  "id": "string",
  "ritualType": "bath",
  "name": "string",
  "order": "number",
  "daySchedule": "mwfsat|tthsun|all",
  "completed": "boolean",
  "completedAt": "timestamp",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Ritual:**
```json
{
  "type": "bath",
  "steps": ["RitualStep[]"],
  "currentDayVariant": "mwfsat|tthsun",
  "completionPercentage": "number",
  "lastCompletedAt": "timestamp"
}
```

**Day Schedule:**
```json
{
  "mwfsat": {
    "days": ["Monday", "Wednesday", "Friday", "Saturday"],
    "steps": ["RitualStep[]"]
  },
  "tthsun": {
    "days": ["Tuesday", "Thursday", "Sunday"],
    "steps": ["RitualStep[]"]
  },
  "universal": {
    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "steps": ["RitualStep[]"]
  }
}
```

## Dependencies
- **Consistency Tracking Service** - For archival of completion data
- **Shared UI Component Library** - For high-contrast components and accessibility

## Integration Points
- Receives reset trigger from Consistency Tracking Service
- Sends completion data to Consistency Tracking Service for archival
- Uses shared UI components for rendering
- Determines day-of-week variant based on system timezone
