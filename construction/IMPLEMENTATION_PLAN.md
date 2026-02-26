# Life OS MVP - Local-First Implementation Plan

## Executive Summary

Build a functional, local-first MVP of Life OS that runs on localhost:3000 with no build tools required. Uses vanilla JavaScript, HTML, Tailwind CSS, and localStorage for a fully functional system before Google Sheets integration.

**Tech Stack:**
- Frontend: Vanilla JavaScript + HTML5
- Styling: Tailwind CSS (CDN)
- Storage: localStorage + JSON objects
- Server: Simple Node.js HTTP server or Python SimpleHTTPServer
- Deployment: Vercel (later)

**Key Features:**
- 10 URL-based views (query parameter routing)
- Glassmorphism UI with pink accents (#FF85A2)
- Mobile-responsive design
- Bath ritual day-of-week logic
- Low energy mode override
- localStorage persistence
- No build tools required

---

## Phase 1: Project Structure & Setup

### Step 1.1: Create Directory Structure
- [ ] Create `/construction/unit/src` directory
- [ ] Create `/construction/unit/src/index.html`
- [ ] Create `/construction/unit/src/styles.css`
- [ ] Create `/construction/unit/src/app.js`
- [ ] Create `/construction/unit/src/data.js`
- [ ] Create `/construction/unit/src/components.js`
- [ ] Create `/construction/unit/src/utils.js`

**Directory Structure:**
```
/construction/unit/src/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS + Tailwind
├── app.js              # Main app logic & routing
├── data.js             # Data models & localStorage
├── components.js       # Reusable components
├── utils.js            # Utility functions
└── assets/
    └── favicon.ico
```

### Step 1.2: Create index.html
- [ ] Set up HTML5 boilerplate
- [ ] Link Tailwind CSS CDN
- [ ] Link custom CSS file
- [ ] Create main app container
- [ ] Add script tags for app.js, data.js, components.js, utils.js

**HTML Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Life OS - Local MVP</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-slate-950 text-white">
  <div id="app"></div>
  <script src="data.js"></script>
  <script src="utils.js"></script>
  <script src="components.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

### Step 1.3: Set Up Local Server
- [ ] Create simple HTTP server (Node.js or Python)
- [ ] Configure to serve on localhost:3000
- [ ] Enable hot reload (optional)
- [ ] Test server startup

**Option A: Python (if available)**
```bash
cd /construction/unit/src
python -m http.server 3000
```

**Option B: Node.js (if available)**
```bash
cd /construction/unit/src
npx http-server -p 3000
```

[Question] Which server option do you prefer - Python or Node.js?
[Answer]

### Step 1.4: Initialize localStorage Data Structure
- [ ] Create data.js with initial data
- [ ] Define data models for each board type
- [ ] Initialize localStorage on first load
- [ ] Create data access functions

**Data Structure:**
```javascript
{
  boards: {
    chores: { items: [], lowEnergyMode: false, completionPercentage: 0 },
    selfCare: { items: [], completionPercentage: 0 },
    bathRitual: { items: [], currentVariant: 'mwfsat', completionPercentage: 0 },
    fridge: { items: [], completionPercentage: 0 },
    nonFood: { items: [], completionPercentage: 0 },
    bathroomClean: { items: [], completionPercentage: 0 },
    pantry: { items: [], completionPercentage: 0 },
    gym: { items: [], completionPercentage: 0 },
    rto: { items: [], completionPercentage: 0 },
    firstAid: { items: [], completionPercentage: 0 }
  },
  lastSync: null,
  consistencyLog: []
}
```

---

## Phase 2: URL Routing & Navigation

### Step 2.1: Implement Query Parameter Routing
- [ ] Read URL query parameter (?area=gym)
- [ ] Map area to board component
- [ ] Handle invalid areas (show home)
- [ ] Support direct URL navigation

**Routing Logic:**
```javascript
const area = new URLSearchParams(window.location.search).get('area') || 'home';
const boardMap = {
  'chores': renderChoresBoard,
  'self-care': renderSelfCareBoard,
  'bath-ritual': renderBathRitualBoard,
  'fridge': renderFridgeBoard,
  'non-food': renderNonFoodBoard,
  'bathroom-clean': renderBathroomCleanBoard,
  'pantry': renderPantryBoard,
  'gym': renderGymBoard,
  'rto': renderRTOBoard,
  'first-aid': renderFirstAidBoard,
  'home': renderHome
};
```

### Step 2.2: Create Navigation Component
- [ ] Create header with title
- [ ] Create home button
- [ ] Create area selector (optional)
- [ ] Add breadcrumb navigation

### Step 2.3: Implement URL Change Handling
- [ ] Listen for URL changes
- [ ] Re-render on navigation
- [ ] Maintain scroll position
- [ ] Handle browser back/forward

### Step 2.4: Create Home/Dashboard View
- [ ] Display all 10 board links
- [ ] Show quick stats
- [ ] Display last sync time
- [ ] Add settings link

---

## Phase 3: Glassmorphism UI & Styling

### Step 3.1: Create Custom CSS
- [ ] Define glassmorphism utilities
- [ ] Define color variables
- [ ] Define animation keyframes
- [ ] Create responsive utilities

**Custom CSS:**
```css
:root {
  --primary-pink: #FF85A2;
  --dark-bg: #0F172A;
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
}

.glassmorphic {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-card {
  @apply glassmorphic p-4 mb-3;
}

.glass-button {
  @apply glassmorphic px-4 py-2 rounded-lg transition-all duration-200;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.glass-button.active {
  background: var(--primary-pink);
  color: white;
}

@keyframes pulse-pink {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 133, 162, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(255, 133, 162, 0); }
}

@keyframes bounce-in {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-bounce-in {
  animation: bounce-in 0.3s ease-out;
}
```

### Step 3.2: Configure Tailwind Theme
- [ ] Extend Tailwind config via CDN script
- [ ] Add custom colors
- [ ] Add custom spacing
- [ ] Add custom animations

**Tailwind Configuration:**
```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'primary-pink': '#FF85A2',
          'dark-slate': '#0F172A',
        },
        animation: {
          'bounce-in': 'bounce-in 0.3s ease-out',
          'pulse-pink': 'pulse-pink 2s infinite',
        }
      }
    }
  }
</script>
```

### Step 3.3: Create Reusable Components
- [ ] GlassmorphicCard component
- [ ] ChecklistItem component
- [ ] InventoryItem component
- [ ] Button component
- [ ] Header component

### Step 3.4: Implement Mobile-First Design
- [ ] Use Tailwind responsive classes
- [ ] Optimize for phone screens
- [ ] Test on various screen sizes
- [ ] Ensure one-handed usability

---

## Phase 4: Data Models & localStorage

### Step 4.1: Create Data Models
- [ ] Define ChecklistItem model
- [ ] Define InventoryItem model
- [ ] Define RitualStep model
- [ ] Define Board model

**Models:**
```javascript
class ChecklistItem {
  constructor(id, name, category = 'daily', completed = false) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.completed = completed;
    this.completedAt = null;
    this.notes = '';
    this.order = 0;
  }
}

class InventoryItem {
  constructor(id, name, category = '', status = 'half') {
    this.id = id;
    this.name = name;
    this.category = category;
    this.status = status; // 'low', 'half', 'full'
    this.quantity = 0;
    this.expiryDate = null;
    this.notes = '';
  }
}
```

### Step 4.2: Implement localStorage Functions
- [ ] Create saveData function
- [ ] Create loadData function
- [ ] Create updateItem function
- [ ] Create deleteItem function
- [ ] Create resetBoard function

**localStorage Functions:**
```javascript
function saveData(data) {
  localStorage.setItem('lifeOS_data', JSON.stringify(data));
}

function loadData() {
  const data = localStorage.getItem('lifeOS_data');
  return data ? JSON.parse(data) : getInitialData();
}

function updateItem(boardType, itemId, updates) {
  const data = loadData();
  const item = data.boards[boardType].items.find(i => i.id === itemId);
  if (item) {
    Object.assign(item, updates);
    saveData(data);
  }
}
```

### Step 4.3: Initialize Sample Data
- [ ] Create initial data for each board
- [ ] Populate with realistic items
- [ ] Set default values
- [ ] Create helper to reset data

**Sample Data:**
```javascript
function getInitialData() {
  return {
    boards: {
      chores: {
        items: [
          { id: '1', name: 'Cooking food/meal prep baon', category: 'daily', completed: false },
          { id: '2', name: 'Dishes (every night)', category: 'daily', completed: false },
          // ... more items
        ],
        lowEnergyMode: false,
        completionPercentage: 0
      },
      // ... other boards
    },
    lastSync: null,
    consistencyLog: []
  };
}
```

### Step 4.4: Create Data Persistence Layer
- [ ] Auto-save on changes
- [ ] Handle data versioning
- [ ] Create backup/restore functions
- [ ] Implement data validation

---

## Phase 5: Board Components - Checklist Boards

### Step 5.1: Implement ChoresBoard
- [ ] Display all chore items
- [ ] Implement toggle functionality
- [ ] Show completion percentage
- [ ] Add low energy mode toggle
- [ ] Filter items when low energy mode active

**Features:**
- List of chore items with checkboxes
- Low Energy Mode toggle (prominent)
- Completion percentage display
- Category grouping (optional)

### Step 5.2: Implement SelfCareBoard
- [ ] Display morning routine items
- [ ] Display evening routine items
- [ ] Implement toggle functionality
- [ ] Show completion percentage
- [ ] Separate by time of day

**Features:**
- Morning routine section
- Evening routine section
- Checkboxes for each item
- Completion percentage

### Step 5.3: Implement GymBoard
- [ ] Display gym checklist items
- [ ] Implement toggle functionality
- [ ] Show completion percentage
- [ ] Pre-gym preparation items

**Features:**
- Gym preparation checklist
- Checkboxes for each item
- Completion percentage

### Step 5.4: Implement RTOBoard
- [ ] Display RTO checklist items
- [ ] Implement toggle functionality
- [ ] Show completion percentage
- [ ] Pre-office preparation items

**Features:**
- RTO preparation checklist
- Checkboxes for each item
- Completion percentage

### Step 5.5: Implement BathroomCleanBoard
- [ ] Display cleaning tasks
- [ ] Implement toggle functionality
- [ ] Show completion percentage
- [ ] Task grouping by area

**Features:**
- Bathroom cleaning tasks
- Checkboxes for each task
- Completion percentage

---

## Phase 6: Bath Ritual Smart Logic

### Step 6.1: Create Day Variant Detector
- [ ] Detect current day of week
- [ ] Use Singapore Time (UTC+8)
- [ ] Determine MWFSat or TTHSun
- [ ] Handle timezone conversion

**Logic:**
```javascript
function getDayVariant() {
  // Singapore Time (UTC+8)
  const sgtTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  const day = sgtTime.getDay();
  
  // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // MWFSat: 1, 3, 5, 6 (Monday, Wednesday, Friday, Saturday)
  // TTHSun: 2, 4, 0 (Tuesday, Thursday, Sunday)
  
  const mwfsatDays = [1, 3, 5, 6];
  return mwfsatDays.includes(day) ? 'mwfsat' : 'tthsun';
}
```

### Step 6.2: Implement BathRitualBoard
- [ ] Detect current day variant
- [ ] Display variant-specific steps
- [ ] Show universal steps (always present)
- [ ] Implement toggle functionality
- [ ] Show completion percentage

**Features:**
- Day variant indicator (MWFSat or TTHSun)
- Variant-specific product list
- Universal steps (Body oil, Lotion, Powder, Perfume)
- Checkboxes for each step
- Completion percentage

**Data Structure:**
```javascript
bathRitual: {
  items: [
    // MWFSat items
    { id: '1', name: 'Shampoo + Selsun blue', daySchedule: 'mwfsat', completed: false },
    { id: '2', name: 'Soap', daySchedule: 'mwfsat', completed: false },
    { id: '3', name: 'Conditioner', daySchedule: 'mwfsat', completed: false },
    // TTHSun items
    { id: '4', name: 'Clarifying shampoo', daySchedule: 'tthsun', completed: false },
    { id: '5', name: 'Soap', daySchedule: 'tthsun', completed: false },
    { id: '6', name: 'Conditioner', daySchedule: 'tthsun', completed: false },
    { id: '7', name: 'Scrub with body wash', daySchedule: 'tthsun', completed: false },
    // Universal items
    { id: '8', name: 'Body oil', daySchedule: 'universal', completed: false },
    { id: '9', name: 'Lotion', daySchedule: 'universal', completed: false },
    { id: '10', name: 'Powder', daySchedule: 'universal', completed: false },
    { id: '11', name: 'Perfume', daySchedule: 'universal', completed: false },
  ],
  currentVariant: 'mwfsat',
  completionPercentage: 0
}
```

---

## Phase 7: Board Components - Inventory Boards

### Step 7.1: Implement FridgeBoard
- [ ] Display fridge ingredients
- [ ] Display frozen & cooked food
- [ ] Implement status dropdown (Low, Half, Full)
- [ ] Add expiry date tracking
- [ ] Add notes field

**Features:**
- Ingredients list with status dropdown
- Frozen food list with expiry dates
- Recipe suggestions (optional)
- Add/edit/delete items (optional for MVP)

### Step 7.2: Implement NonFoodBoard
- [ ] Display restock items
- [ ] Implement status dropdown (Low, Half, Full)
- [ ] Category grouping
- [ ] Check every 2 weeks indicator

**Items:**
- Paper towel, Napkin, Hand soap, Trash bag
- Laundry detergent, Laundry fab con, Dish soap
- Floor cleaner, Bathroom cleaner, Daz cleaner, Dish sponge

### Step 7.3: Implement PantryBoard
- [ ] Display dry goods inventory
- [ ] Implement status dropdown (Low, Half, Full)
- [ ] Category grouping
- [ ] Add notes field

**Items:**
- Rice, Salt, Sugar, Soy sauce, Vinegar, Cooking oil
- Pasta, Canned tuna, Oats, Daily fix nuts
- Milk, Ketchup, Sandwich spread, Bread

### Step 7.4: Implement FirstAidBoard
- [ ] Display first-aid items
- [ ] Implement expiry date tracking
- [ ] Implement quantity tracking
- [ ] Status indicator (expired, low, ok)

**Features:**
- First-aid items list
- Expiry date display
- Quantity tracking
- Status indicator

---

## Phase 8: Low Energy Mode Override

### Step 8.1: Create Low Energy Mode Toggle
- [ ] Add prominent toggle on ChoresBoard
- [ ] Store preference in localStorage
- [ ] Apply filter to items list
- [ ] Show visual indicator

**Fallback Tasks (4 items):**
1. Wipe one surface (counter or desk)
2. Take out trash bag
3. Do dishes for 5 mins
4. Put 10 things away to their places

### Step 8.2: Implement Filtering Logic
- [ ] Filter items when low energy mode active
- [ ] Show only fallback tasks
- [ ] Maintain completion state
- [ ] Update completion percentage

**Filtering Logic:**
```javascript
function getChoresItems(lowEnergyMode) {
  const data = loadData();
  const items = data.boards.chores.items;
  
  if (lowEnergyMode) {
    const fallbackIds = ['fallback-1', 'fallback-2', 'fallback-3', 'fallback-4'];
    return items.filter(item => fallbackIds.includes(item.id));
  }
  
  return items;
}
```

### Step 8.3: Create Visual Indicator
- [ ] Show toggle state clearly
- [ ] Change UI when active
- [ ] Add icon or label
- [ ] Highlight fallback tasks

---

## Phase 9: Micro-Interactions & Animations

### Step 9.1: Implement Checkbox Animations
- [ ] Animate on toggle
- [ ] Show checkmark animation
- [ ] Change color to pink
- [ ] Add bounce effect

**Animation:**
```css
.checkbox-item.completed {
  animation: bounce-in 0.3s ease-out;
}

.checkbox-item.completed input:checked {
  background-color: #FF85A2;
  box-shadow: 0 0 0 3px rgba(255, 133, 162, 0.2);
}
```

### Step 9.2: Implement Completion Feedback
- [ ] Show completion message
- [ ] Add confetti effect (optional)
- [ ] Update completion percentage
- [ ] Play sound (optional)

### Step 9.3: Implement Smooth Transitions
- [ ] Page transitions
- [ ] Component transitions
- [ ] State change animations
- [ ] Loading states

---

## Phase 10: Consistency Logging

### Step 10.1: Create Consistency Logger
- [ ] Log every action with timestamp
- [ ] Store in localStorage
- [ ] Prepare for Google Sheets sync
- [ ] Create log viewer (optional)

**Log Structure:**
```javascript
{
  timestamp: '2024-02-25T12:34:56Z',
  boardType: 'chores',
  itemId: '1',
  action: 'toggle',
  itemName: 'Cooking food/meal prep baon',
  previousState: false,
  newState: true
}
```

### Step 10.2: Implement Logging Functions
- [ ] Create logAction function
- [ ] Auto-log on item changes
- [ ] Store in consistencyLog array
- [ ] Implement log rotation

---

## Phase 11: Testing & Validation

### Step 11.1: Manual Testing Checklist
- [ ] Test all 10 URL routes
- [ ] Test checkbox toggles
- [ ] Test inventory dropdowns
- [ ] Test low energy mode
- [ ] Test bath ritual day logic
- [ ] Test localStorage persistence
- [ ] Test mobile responsiveness
- [ ] Test animations

### Step 11.2: Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile browsers

### Step 11.3: Device Testing
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Test on iPad
- [ ] Test on desktop

### Step 11.4: Functionality Testing
- [ ] Verify all data persists
- [ ] Verify calculations correct
- [ ] Verify animations smooth
- [ ] Verify UI responsive

---

## Phase 12: Deployment Preparation

### Step 12.1: Prepare for Vercel
- [ ] Create vercel.json config
- [ ] Set up environment variables
- [ ] Create API routes directory
- [ ] Prepare for Google Sheets integration

### Step 12.2: Create API Routes
- [ ] Create /api/reset endpoint
- [ ] Create /api/sync endpoint
- [ ] Create /api/log endpoint
- [ ] Prepare for Sheets integration

### Step 12.3: Documentation
- [ ] Create README.md
- [ ] Document data structure
- [ ] Document API endpoints
- [ ] Create deployment guide

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Create directory structure
- [ ] Create index.html
- [ ] Set up local server
- [ ] Initialize localStorage

### Phase 2: Routing
- [ ] Implement query parameter routing
- [ ] Create navigation component
- [ ] Handle URL changes
- [ ] Create home view

### Phase 3: Styling
- [ ] Create custom CSS
- [ ] Configure Tailwind
- [ ] Create reusable components
- [ ] Implement mobile design

### Phase 4: Data
- [ ] Create data models
- [ ] Implement localStorage functions
- [ ] Initialize sample data
- [ ] Create persistence layer

### Phase 5: Checklist Boards
- [ ] Implement ChoresBoard
- [ ] Implement SelfCareBoard
- [ ] Implement GymBoard
- [ ] Implement RTOBoard
- [ ] Implement BathroomCleanBoard

### Phase 6: Bath Ritual
- [ ] Create day variant detector
- [ ] Implement BathRitualBoard
- [ ] Test day logic
- [ ] Verify filtering

### Phase 7: Inventory Boards
- [ ] Implement FridgeBoard
- [ ] Implement NonFoodBoard
- [ ] Implement PantryBoard
- [ ] Implement FirstAidBoard

### Phase 8: Low Energy Mode
- [ ] Create toggle component
- [ ] Implement filtering logic
- [ ] Create visual indicator
- [ ] Test functionality

### Phase 9: Animations
- [ ] Implement checkbox animations
- [ ] Implement completion feedback
- [ ] Implement smooth transitions
- [ ] Test on devices

### Phase 10: Logging
- [ ] Create consistency logger
- [ ] Implement logging functions
- [ ] Test log storage
- [ ] Prepare for sync

### Phase 11: Testing
- [ ] Manual testing
- [ ] Browser testing
- [ ] Device testing
- [ ] Functionality testing

### Phase 12: Deployment
- [ ] Prepare for Vercel
- [ ] Create API routes
- [ ] Create documentation
- [ ] Deploy to production

---

## Questions for Clarification

[Question] Which server option do you prefer - Python or Node.js?
[Answer]

[Question] Should we implement add/edit/delete functionality for items in MVP?
[Answer]

[Question] Should we include sound effects for completion feedback?
[Answer]

[Question] Should we implement a settings page for preferences?
[Answer]

[Question] Should we implement data export/import functionality?
[Answer]

---

## Success Criteria

- [ ] All 10 routes render correctly with proper styling
- [ ] Glassmorphism UI looks polished on all devices
- [ ] Mobile responsive on phones, tablets, and desktop
- [ ] Day-of-week logic works correctly for bath ritual
- [ ] Low energy mode filters correctly on chores board
- [ ] Animations are smooth and dopamine-inducing
- [ ] Data persists in localStorage
- [ ] Consistency logging works
- [ ] Can manually navigate to all 10 URLs and see correct content
- [ ] Ready for Google Sheets integration

---

**Plan Created:** February 25, 2026
**Status:** Awaiting User Approval
**Next Step:** Review plan and provide answers to clarification questions, then execute Phase 1
