# Life OS - User Stories & Acceptance Criteria

## Overview
This document defines the user stories for the Life OS web application, a personal operating system designed to help neurodivergent users manage executive function through location-based triggers (QR codes) and data-driven consistency tracking.

---

## 1. QR-Triggered Module Access

### US-1.1: User scans QR code to access location-specific checklist
**As a** user managing my daily tasks,
**I want to** scan a QR code that takes me to a location-specific checklist,
**So that** I can quickly access the right tasks for my current location without navigating menus.

**Acceptance Criteria:**
- QR code links to dynamic routes (e.g., /area/kitchen, /area/bathroom, /area/desk)
- App loads the correct module based on URL parameter
- Page displays within 2 seconds of QR scan
- Mobile-responsive design for easy scanning and interaction
- High-contrast UI elements for visibility

**Edge Cases:**
- Invalid or expired QR codes redirect to home page
- Multiple QR codes in same location work independently
- Offline mode gracefully handles missing data

---

## 2. Checklist Modules - Chore Board

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

## 3. Checklist Modules - Self-Care Board

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

## 4. Checklist Modules - Logistics

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

## 5. Checklist Modules - Bathroom Cleaning

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

## 6. Ritual Modules - Bath Ritual

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

### US-6.2: User completes universal post-bath steps
**As a** user with consistent post-bath routine,
**I want to** follow universal post-bath steps after the ritual,
**So that** I maintain consistent self-care.

**Acceptance Criteria:**
- Universal steps display after product rotation: [Oil, Lotion, Perfume]
- Steps are the same regardless of day of week
- Each step can be checked off independently
- Visual confirmation when all steps complete

---

## 7. Inventory Trackers - Fridge/Freezer

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

## 8. Inventory Trackers - Dry Goods & Non-Food Stock

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

## 9. Inventory Trackers - First-Aid

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

## 10. Data Persistence & Auto-Reset

### US-10.1: User data persists to backend (Google Sheets or Supabase)
**As a** user wanting data continuity,
**I want to** have my checklist and inventory data saved to a backend service,
**So that** my data persists across sessions and devices.

**Acceptance Criteria:**
- All checklist completions logged to backend
- All inventory status changes logged to backend
- Data syncs automatically when connection available
- Offline changes queue and sync when online
- User can manually trigger sync
- Sync status indicator shows in UI

**Edge Cases:**
- Sync conflicts handled gracefully (last-write-wins or user prompt)
- Large data transfers don't block UI
- Failed syncs retry automatically

### US-10.2: System archives completion data at daily reset
**As a** user tracking consistency,
**I want to** have my daily completion data archived before reset,
**So that** I can review historical performance.

**Acceptance Criteria:**
- Daily completion data archived at 12:00 AM
- Archived data includes: date, tasks completed, completion percentage
- Archived data stored separately from active data
- User can access historical data via dashboard
- Archive includes timestamp of reset

**Edge Cases:**
- Timezone handling for reset timing
- Archive doesn't interfere with active data
- Large archives don't impact performance

### US-10.3: System calculates and displays consistency streaks
**As a** user motivated by progress,
**I want to** see my consistency streaks and completion rates,
**So that** I get dopamine-driven feedback on my progress.

**Acceptance Criteria:**
- Streak calculation based on consecutive days of task completion
- Completion rate calculated as percentage of tasks completed per day
- Streaks display on dashboard with visual indicators
- Streak broken if daily completion rate falls below threshold (e.g., 50%)
- Historical streak data preserved
- Streak notifications on milestone achievements (e.g., 7-day streak)

**Edge Cases:**
- Timezone handling for streak calculations
- Partial completion days handled (e.g., 75% completion)
- Streak reset logic clear to user

---

## 11. Consistency Dashboard

### US-11.1: User views consistency dashboard with streaks and completion rates
**As a** user tracking my progress,
**I want to** see a dashboard displaying my streaks and completion rates,
**So that** I can visualize my consistency and stay motivated.

**Acceptance Criteria:**
- Dashboard displays current streak with visual indicator
- Dashboard displays completion rate for current week/month
- Historical data visualized in chart (e.g., line graph, bar chart)
- High-contrast colors for accessibility
- Mobile-responsive design
- Data updates in real-time as tasks are completed

**Edge Cases:**
- New users with no historical data show placeholder
- Chart handles large datasets without performance issues
- Timezone handling for date ranges

### US-11.2: User views dopamine-driven feedback elements
**As a** user needing motivation,
**I want to** see celebratory feedback when reaching milestones,
**So that** I feel rewarded for my consistency.

**Acceptance Criteria:**
- Milestone notifications for streak achievements (e.g., 7, 14, 30 days)
- Visual celebration animation on milestone achievement
- Confetti or similar celebratory effect (optional)
- Sound notification (optional, user-configurable)
- Milestone history displayed on dashboard

**Edge Cases:**
- Animations don't cause accessibility issues
- Sound notifications can be disabled
- Celebrations don't interfere with task completion

---

## 12. Neurodivergent-Friendly UX

### US-12.1: User experiences high-contrast UI with clear visual hierarchy
**As a** neurodivergent user with sensory sensitivities,
**I want to** use an app with high-contrast colors and clear visual hierarchy,
**So that** I can navigate without cognitive overload.

**Acceptance Criteria:**
- All text meets WCAG AA contrast ratio (4.5:1 minimum)
- Color-blind friendly palette (no red/green only indicators)
- Clear visual hierarchy with consistent spacing
- Large, easy-to-tap buttons (minimum 44x44px)
- Minimal animations (no flashing or rapid movement)
- Dark mode option available

**Edge Cases:**
- Custom color schemes for user preferences
- Font size adjustable
- Animations can be disabled

### US-12.2: User navigates app with minimal cognitive load
**As a** neurodivergent user with executive function challenges,
**I want to** navigate the app with minimal steps and clear labels,
**So that** I can focus on tasks without getting lost.

**Acceptance Criteria:**
- Maximum 2-3 clicks to reach any feature
- Clear, descriptive labels for all buttons and sections
- Breadcrumb navigation for context
- Consistent navigation structure across all pages
- Search functionality for quick access
- Keyboard navigation fully supported

**Edge Cases:**
- Mobile navigation simplified compared to desktop
- Back button always available
- No surprise redirects or modal popups

### US-12.3: User receives clear status indicators and feedback
**As a** neurodivergent user needing clear feedback,
**I want to** see immediate, unambiguous status indicators,
**So that** I know the result of my actions.

**Acceptance Criteria:**
- Checkbox state clearly visible (checked/unchecked)
- Status changes show immediate visual feedback
- Error messages clear and actionable
- Success messages confirm action completion
- Loading states clearly indicated
- Disabled buttons visually distinct

**Edge Cases:**
- Rapid interactions don't cause confusing state
- Error messages don't disappear too quickly
- Status indicators work in all color modes

---

## 13. Technical Requirements

### US-13.1: App is hosted on Vercel with fast load times
**As a** user wanting responsive performance,
**I want to** access the app quickly with minimal load time,
**So that** I can start using it immediately.

**Acceptance Criteria:**
- App loads in under 2 seconds on 4G connection
- Hosted on Vercel with automatic deployments
- CDN caching for static assets
- Optimized images and code splitting
- Performance monitoring and alerts

**Edge Cases:**
- Slow connections handled gracefully
- Offline mode available for cached data
- Large data transfers don't block UI

### US-13.2: App works offline with data sync when online
**As a** user with unreliable connectivity,
**I want to** use the app offline and sync when connection returns,
**So that** I can track tasks regardless of connectivity.

**Acceptance Criteria:**
- Offline mode allows task completion
- Completed tasks queue for sync
- Sync occurs automatically when online
- User notified of sync status
- Conflict resolution handled gracefully
- Service worker caches essential data

**Edge Cases:**
- Large offline queues handled efficiently
- Sync doesn't block user interactions
- Offline data persists across app restarts

---

## 14. Add/Edit/Remove Items Across All Modules

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

All user stories must meet these criteria:
- ✅ Functional requirements clearly defined
- ✅ Edge cases identified and handled
- ✅ Accessibility requirements met (WCAG AA minimum)
- ✅ Performance targets defined
- ✅ Data persistence strategy clear
- ✅ Error handling specified
- ✅ Mobile-responsive design
- ✅ Neurodivergent-friendly UX principles applied

---

## Next Steps

1. Review and approve user stories
2. Identify any missing requirements or clarifications needed
3. Prioritize user stories for implementation phases
4. Create detailed technical specifications for each feature
5. Begin implementation with Phase 1 features
