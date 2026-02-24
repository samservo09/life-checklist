# Life OS Web Application - Development Plan

## Phase 1: User Stories Documentation
- [x] **1.1** Create /inception/ directory structure
- [x] **1.2** Write comprehensive user stories in /inception/overview_user_stories.md
  - User stories for Checklist Modules (Chore Board, Self-Care, Logistics, Bathroom)
  - User stories for Ritual Modules (Bath Ritual with conditional logic)
  - User stories for Inventory Trackers (Fridge, Dry Goods, First-Aid)
  - User stories for QR-triggered routing and dynamic module loading
  - User stories for Data Persistence and Auto-Reset functionality
  - User stories for Neurodivergent-friendly UX features
- [x] **1.3** Define acceptance criteria for each user story
- [x] **1.4** Document edge cases and error scenarios

## Phase 2: Unit Architecture & Integration Planning
- [x] **2.1** Analyze user stories and identify cohesive groupings
- [x] **2.2** Define independent units with clear responsibilities
- [x] **2.3** Create unit-specific user story documents in /inception/units/
- [x] **2.4** Define API contracts and integration points
- [x] **2.5** Document data models for each unit
- [x] **2.6** Create integration_contract.md with endpoint definitions

## Phase 3: Technical Architecture & Schema
- [ ] **3.1** Design database schema for each unit
- [ ] **3.2** Plan data persistence strategy (Google Sheets API or Supabase)
- [ ] **3.3** Design QR code routing strategy (/area/kitchen, /area/bathroom, etc.)
- [ ] **3.4** Plan auto-reset and consistency tracking logic

## Phase 4: Implementation Planning
- [ ] **4.1** Create implementation roadmap with sprint breakdown
- [ ] **4.2** Identify inter-unit dependencies
- [ ] **4.3** Plan testing strategy (unit, integration, e2e)
- [ ] **4.4** Define accessibility compliance requirements

---

## Proposed Unit Architecture (Pending Your Approval)

### Unit 1: Checklist Management Service
**Responsibility:** Handle all checklist-based modules (Chore Board, Self-Care, Logistics, Bathroom)
**User Stories:** US-2.1 through US-5.1, US-14.1 through US-14.3
**Key Features:**
- Daily/Weekly/Bi-weekly/Monthly task management
- Low Energy toggle mode
- Task completion tracking
- Add/Edit/Remove items
- Auto-reset at 12:00 AM

**API Endpoints (Proposed):**
- `GET /api/checklists/:type` - Fetch checklist by type
- `POST /api/checklists/:type/items` - Add item to checklist
- `PUT /api/checklists/:type/items/:id` - Update item
- `DELETE /api/checklists/:type/items/:id` - Remove item
- `PATCH /api/checklists/:type/items/:id/complete` - Mark item complete
- `POST /api/checklists/reset` - Trigger reset (internal)

**Dependencies:** Consistency Tracking Service (for archival)

---

### Unit 2: Ritual Management Service
**Responsibility:** Handle ritual modules with conditional logic (Bath Ritual)
**User Stories:** US-6.1, US-6.2, US-14.1 through US-14.3
**Key Features:**
- Day-of-week conditional logic (MWFSat vs TTHSun)
- Sequential step tracking
- Product rotation management
- Add/Edit/Remove ritual steps
- Completion tracking

**API Endpoints (Proposed):**
- `GET /api/rituals/:type` - Fetch ritual by type
- `GET /api/rituals/:type/today` - Fetch today's ritual variant
- `POST /api/rituals/:type/steps` - Add step to ritual
- `PUT /api/rituals/:type/steps/:id` - Update step
- `DELETE /api/rituals/:type/steps/:id` - Remove step
- `PATCH /api/rituals/:type/steps/:id/complete` - Mark step complete

**Dependencies:** Consistency Tracking Service (for archival)

---

### Unit 3: Inventory Management Service
**Responsibility:** Handle all inventory trackers (Fridge, Dry Goods, First-Aid)
**User Stories:** US-7.1 through US-7.3, US-8.1, US-8.2, US-9.1, US-14.1 through US-14.4
**Key Features:**
- Status-based tracking (Low/Half/Full)
- Expiry date management
- Quantity tracking
- Recipe generator
- Add/Edit/Remove items
- Bulk operations

**API Endpoints (Proposed):**
- `GET /api/inventory/:type` - Fetch inventory by type
- `POST /api/inventory/:type/items` - Add item
- `PUT /api/inventory/:type/items/:id` - Update item
- `DELETE /api/inventory/:type/items/:id` - Remove item
- `PATCH /api/inventory/:type/items/:id/status` - Update status
- `POST /api/inventory/bulk-update` - Bulk update items
- `GET /api/recipes` - Get recipe suggestions based on fridge inventory

**Dependencies:** None (standalone)

---

### Unit 4: QR Routing & Module Loader Service
**Responsibility:** Handle QR code routing and dynamic module loading
**User Stories:** US-1.1
**Key Features:**
- Dynamic route handling (/area/kitchen, /area/bathroom, /area/desk, /area/door)
- Module type detection
- Context-aware module loading
- QR code parameter parsing

**API Endpoints (Proposed):**
- `GET /api/modules/:area` - Get module for area
- `GET /api/qr-config/:code` - Get QR code configuration

**Dependencies:** Checklist Service, Ritual Service, Inventory Service

---

### Unit 5: Data Persistence & Consistency Tracking Service
**Responsibility:** Handle backend data persistence, auto-reset, and consistency tracking
**User Stories:** US-10.1, US-10.2, US-10.3, US-11.1, US-11.2
**Key Features:**
- Backend data sync (Google Sheets API or Supabase)
- Daily auto-reset at 12:00 AM
- Consistency log archival
- Streak calculation
- Completion rate tracking
- Dopamine-driven feedback

**API Endpoints (Proposed):**
- `POST /api/consistency/sync` - Sync data to backend
- `GET /api/consistency/streaks` - Get current streaks
- `GET /api/consistency/history` - Get historical data
- `POST /api/consistency/archive` - Archive completion data
- `GET /api/consistency/dashboard` - Get dashboard data
- `POST /api/consistency/reset` - Trigger daily reset

**Dependencies:** All other services (receives data from them)

---

### Unit 6: Neurodivergent-Friendly UX Service
**Responsibility:** Handle UI/UX components and accessibility features
**User Stories:** US-12.1, US-12.2, US-12.3
**Key Features:**
- High-contrast UI components
- Clear visual hierarchy
- Status indicators
- Accessibility compliance (WCAG AA)
- Dark mode support
- Keyboard navigation

**API Endpoints (Proposed):**
- `GET /api/ui/theme` - Get current theme
- `POST /api/ui/theme` - Update theme preference
- `GET /api/ui/accessibility` - Get accessibility settings

**Dependencies:** None (shared library/component service)

---

### Unit 7: Hosting & Performance Service
**Responsibility:** Handle Vercel hosting, offline support, and performance optimization
**User Stories:** US-13.1, US-13.2
**Key Features:**
- Vercel deployment
- Service worker for offline support
- Data caching strategy
- Performance monitoring
- Offline queue management

**API Endpoints (Proposed):**
- `GET /api/sync-status` - Get sync status
- `POST /api/offline-queue` - Queue offline changes
- `GET /api/performance-metrics` - Get performance data

**Dependencies:** Data Persistence Service (for sync)

---

## Critical Decisions Needed

1. **Backend Choice:** Google Sheets API or Supabase?
   - *Note: This affects Unit 5 implementation significantly*

2. **Unit Boundaries:** Are the proposed units appropriate?
   - *Note: Should any units be merged or split?*

3. **API Communication:** Should units communicate via REST APIs or direct function calls?
   - *Note: This affects integration contract design*

4. **Shared Components:** Should UX components be a separate unit or embedded in each service?
   - *Note: Affects modularity and reusability*

---

## Status: ⏳ Awaiting Your Review & Approval

Please review the proposed unit architecture and provide:
1. Confirmation on unit boundaries and responsibilities
2. Answers to critical decisions listed above
3. Any adjustments to the proposed units
4. Approval to proceed with Phase 2

### Checklist Modules:
- **Chore Board**: Daily, Weekly (Sunday reset), Bi-weekly, Monthly tasks + Low Energy mode (4 fallback tasks)
- **Self-Care Board**: Morning and Evening routines
- **Logistics**: Gym Checklist (Desk-triggered), RTO Checklist (Door-triggered)
- **Bathroom Cleaning**: Detailed sanitization sub-tasks

### Ritual Modules:
- **Bath Ritual**: MWFSat vs TTHSun product rotations → universal post-bath steps (oil/lotion/perfume)

### Inventory Trackers:
- **Fridge/Freezer**: Ingredients, cooked food with "good until" dates, recipe generator
- **Dry Goods & Non-Food**: Low/Half/Full status levels
- **First-Aid**: Quantities and expiry dates

### Technical Requirements:
- Routing: Dynamic QR-triggered routes (/area/kitchen, /area/bathroom, etc.)
- Persistence: Google Sheets API or Supabase integration
- Auto-Reset: Daily at 12:00 AM with consistency log archival
- UX: Neurodivergent-friendly with high-contrast status indicators

---

## Status: ⏳ Awaiting Your Review & Approval

This plan will:
1. Group user stories into 7 independent, loosely-coupled units
2. Create unit-specific user story documents
3. Define API contracts and integration points
4. Enable parallel development by multiple teams

**Ready to review the proposed unit architecture?** ✅
