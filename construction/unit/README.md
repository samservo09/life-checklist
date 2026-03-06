# Life OS MVP - Local-First Personal Management System

A sophisticated, mobile-responsive web application for managing daily checklists, rituals, and inventory with glassmorphism UI and local-first data persistence.

## 🎯 Overview

Life OS is a personal productivity system designed for neurodivergent users with features like:
- **10 Strategic Views** for different life areas (chores, self-care, rituals, inventory)
- **Smart Bath Ritual Engine** that auto-detects day-of-week and shows correct product rotation
- **Low Energy Mode** for simplified task management
- **Glassmorphism UI** with sophisticated pink accents (#FF85A2)
- **Mobile-First Design** optimized for one-handed phone use
- **Local-First Architecture** with localStorage persistence
- **Consistency Logging** for future analytics

## 🚀 Quick Start

### Prerequisites
- Python 3.x (for local server)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools required!

### Installation & Running

1. **Navigate to the project directory:**
```bash
cd construction/unit
```

2. **Start the Python server:**
```bash
python -m http.server 3000
```

3. **Open in browser:**
```
http://localhost:3000
```

4. **Navigate to different views:**
```
http://localhost:3000/?area=chores
http://localhost:3000/?area=self-care
http://localhost:3000/?area=bath-ritual
http://localhost:3000/?area=fridge
http://localhost:3000/?area=non-food
http://localhost:3000/?area=bathroom-clean
http://localhost:3000/?area=pantry
http://localhost:3000/?area=gym
http://localhost:3000/?area=rto
http://localhost:3000/?area=first-aid
```

## 📁 Project Structure

```
construction/unit/
├── README.md                 # This file
├── server.py               # Python HTTP server
├── src/
│   ├── index.html          # Main HTML file
│   ├── app.js              # Main app logic & routing
│   ├── data.js             # Data models & localStorage
│   ├── components.js       # Reusable UI components
│   ├── utils.js            # Utility functions
│   ├── styles.css          # Custom CSS & glassmorphism
│   └── assets/
│       └── favicon.ico
└── docs/
    ├── API.md              # API documentation
    ├── DATA_STRUCTURE.md   # Data model documentation
    └── DEPLOYMENT.md       # Deployment guide
```

## 🎨 Design System

### Color Palette
- **Primary Pink:** `#FF85A2` - Active states, accents
- **Dark Background:** `#0F172A` - Main background
- **Glass Surface:** `rgba(255, 255, 255, 0.1)` - Card backgrounds
- **Glass Border:** `rgba(255, 255, 255, 0.2)` - Card borders
- **Text:** `#FFFFFF` - Primary text

### Glassmorphism Components
- **Backdrop Blur:** 10px
- **Border Radius:** 12px
- **Box Shadow:** `0 8px 32px rgba(0, 0, 0, 0.1)`
- **Transparency:** 10% opacity for surfaces

### Responsive Breakpoints
- **Mobile:** < 640px (primary target)
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 📊 The 10 Views

### 1. **Chores Board** (`?area=chores`)
Daily household management with low energy mode override.

**Features:**
- Daily, weekly, bi-weekly, monthly task categories
- Low Energy Mode toggle (shows only 4 fallback tasks)
- Completion percentage tracking
- Fallback tasks: Wipe surface, Take out trash, Do dishes 5 mins, Put 10 things away

**Data:**
```javascript
{
  type: 'chores',
  items: [
    { id, name, category, completed, completedAt, notes, order }
  ],
  lowEnergyMode: boolean,
  completionPercentage: number
}
```

### 2. **Self-Care Board** (`?area=self-care`)
Morning and evening routine management.

**Features:**
- Morning routine section
- Evening routine section
- Completion tracking
- Completion percentage

**Routines:**
- **Morning:** Face wash, Brush teeth, Moisturizer, Sunscreen
- **Evening:** Bath, Brush teeth, Micellar water, Moisturizer, Take meds

### 3. **Bath Ritual** (`?area=bath-ritual`)
Smart day-of-week product rotation system.

**Features:**
- Auto-detects current day (Singapore Time UTC+8)
- MWFSat variant: Shampoo + Selsun blue, Soap, Conditioner
- TTHSun variant: Clarifying shampoo, Soap, Conditioner, Scrub with body wash
- Universal steps: Body oil, Lotion, Powder, Perfume
- Completion tracking per variant

**Day Logic:**
- **MWFSat:** Monday, Wednesday, Friday, Saturday
- **TTHSun:** Tuesday, Thursday, Sunday

### 4. **Fridge Board** (`?area=fridge`)
Refrigerator and freezer inventory management.

**Features:**
- Current ingredients tracking
- Frozen & cooked food inventory
- Recipe suggestions
- Status: Low, Half, Full
- Expiry date tracking

### 5. **Non-Food Restock** (`?area=non-food`)
Household supplies inventory.

**Items:**
- Paper towel, Napkin, Hand soap, Trash bag
- Laundry detergent, Laundry fab con, Dish soap
- Floor cleaner, Bathroom cleaner, Daz cleaner, Dish sponge

**Features:**
- Status dropdown: Low, Half, Full
- Category grouping
- Check every 2 weeks indicator

### 6. **Bathroom Cleaning** (`?area=bathroom-clean`)
Bathroom cleaning task checklist.

**Tasks:**
- Toilet bowl scrub, Toilet seat & lid wipe, Sink scrub
- Tap and handles wipe, Mirror wipe, Counter wipe
- Floor sweep, Floor mop, Shower walls wipe
- Refill soap/shampoo

### 7. **Pantry Stock** (`?area=pantry`)
Dry goods and pantry inventory.

**Items:**
- Rice, Salt, Sugar, Soy sauce, Vinegar, Cooking oil
- Pasta, Canned tuna, Oats, Daily fix nuts
- Milk, Ketchup, Sandwich spread, Bread

**Features:**
- Status dropdown: Low, Half, Full
- Category grouping
- Notes field

### 8. **Gym Checklist** (`?area=gym`)
Pre-gym preparation checklist.

**Items:**
- Protein drink, Water bottle, Bath towel
- Slippers/crocs, At least 1 fruit/snack
- Clothes to change into, Towel, Gym pouch
- ID for gym, Keys

### 9. **RTO Checklist** (`?area=rto`)
Return to Office preparation checklist.

**Items:**
- Keys, Wallet, Company ID, Chargers
- Eye glasses, Hygiene pouch, Water tumbler
- Lunch, Fan

### 10. **First-Aid Tracker** (`?area=first-aid`)
First-aid kit inventory management.

**Features:**
- Item name tracking
- Expiry date tracking
- Quantity tracking
- Status indicator: Expired, Low, OK

## 🔧 Core Features

### Local Storage Persistence
All data is stored in browser's localStorage with automatic saving on every change.

**Storage Keys:**
- `lifeOS_data` - Main application data
- `lifeOS_preferences` - User preferences
- `lifeOS_consistencyLog` - Action history

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

### Low Energy Mode
Prominent toggle on Chores Board that filters to show only 4 essential fallback tasks:
1. Wipe one surface (counter or desk)
2. Take out trash bag
3. Do dishes for 5 mins
4. Put 10 things away to their places

### Bath Ritual Smart Engine
Automatically detects current day of week (Singapore Time) and displays:
- **MWFSat variant** on Monday, Wednesday, Friday, Saturday
- **TTHSun variant** on Tuesday, Thursday, Sunday
- **Universal steps** always shown (Body oil, Lotion, Powder, Perfume)

### Consistency Logging
Every action is logged with timestamp for future analytics:
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

### Micro-Interactions
- Smooth checkbox animations on toggle
- Bounce-in effect on completion
- Color change to pink on active state
- Smooth page transitions
- Responsive feedback on all interactions

## 🎮 User Interactions

### Checklist Items (Boolean Toggles)
- Click checkbox to toggle completion
- Automatic timestamp on completion
- Completion percentage updates
- Smooth animation feedback

### Inventory Items (Status Dropdowns)
- Click dropdown to change status (Low, Half, Full)
- Optional quantity input
- Optional expiry date tracking
- Optional notes field

### Add/Edit/Delete Items
- Click "Add Item" button to create new item
- Click item to edit details
- Click delete icon to remove item
- Confirmation dialog on delete
- Automatic localStorage save

### Low Energy Mode
- Click toggle on Chores Board
- Filters to show only 4 fallback tasks
- Preference persists in localStorage
- Visual indicator shows active state

### Navigation
- Click area links on home page
- Use URL query parameters directly
- Browser back/forward navigation supported
- Home button on each board

## 📱 Mobile Optimization

### One-Handed Usability
- Narrow, vertical-friendly layout
- Large touch targets (min 44px)
- Bottom-aligned action buttons
- Minimal horizontal scrolling

### Responsive Design
- Mobile-first approach
- Optimized for iPhone 12/13/14
- Tablet support (iPad)
- Desktop support (optional)

### Touch Feedback
- Visual feedback on tap
- Haptic-style animations
- Color change on interaction
- Smooth transitions

## 🔌 API Endpoints (Future)

### Reset Endpoint
```
POST /api/reset
Body: { resetType: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' }
Response: { success: boolean, itemsReset: number, resetAt: timestamp }
```

### Sync Endpoint
```
POST /api/sync
Body: { data: object }
Response: { success: boolean, syncedAt: timestamp }
```

### Log Endpoint
```
GET /api/logs
Response: { logs: array }
```

## 🔄 Data Export/Import

### Export Data
- Click "Export Data" in settings
- Downloads JSON file with all data
- Includes consistency logs
- Timestamped filename

### Import Data
- Click "Import Data" in settings
- Select JSON file
- Confirms before overwriting
- Validates data structure

## 🚀 Deployment

### Local Development
```bash
cd construction/unit
python -m http.server 3000
```

### Vercel Deployment
1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variables
4. Deploy

See `docs/DEPLOYMENT.md` for detailed instructions.

## 📚 Documentation

- **API.md** - API endpoint documentation
- **DATA_STRUCTURE.md** - Complete data model documentation
- **DEPLOYMENT.md** - Deployment guide for Vercel
- **IMPLEMENTATION_PLAN.md** - Development roadmap

## 🔐 Data Privacy

- All data stored locally in browser
- No data sent to servers (until Google Sheets integration)
- No tracking or analytics
- User has full control over data
- Export/import functionality for data portability

## 🐛 Troubleshooting

### Data Not Persisting
- Check browser's localStorage is enabled
- Clear browser cache and reload
- Check browser console for errors
- Try exporting and re-importing data

### Bath Ritual Showing Wrong Variant
- Verify system timezone is set correctly
- Check if manual override is active
- Refresh page to recalculate
- Check browser console for timezone errors

### Animations Not Smooth
- Check browser performance
- Disable browser extensions
- Try different browser
- Check for JavaScript errors in console

### Mobile Layout Issues
- Ensure viewport meta tag is present
- Check device zoom level (should be 100%)
- Try different mobile browser
- Clear browser cache

## 🤝 Contributing

This is a personal project. For improvements or bug reports, please document in issues.

## 📄 License

Personal use only. All rights reserved.

## 🎯 Roadmap

### Phase 1: MVP (Current)
- ✅ 10 local views
- ✅ localStorage persistence
- ✅ Glassmorphism UI
- ✅ Mobile responsive
- ✅ Low energy mode
- ✅ Bath ritual smart logic
- ✅ Consistency logging
- ✅ Add/edit/delete items
- ✅ Data export/import

### Phase 2: Google Sheets Integration
- [ ] Connect to Google Sheets API
- [ ] Sync data to Sheets
- [ ] Read data from Sheets
- [ ] Conflict resolution
- [ ] Offline queue

### Phase 3: Advanced Features
- [ ] Daily reset cron job
- [ ] Streak tracking
- [ ] Analytics dashboard
- [ ] Milestone celebrations
- [ ] Custom themes

### Phase 4: Mobile App
- [ ] React Native app
- [ ] iOS deployment
- [ ] Android deployment
- [ ] Push notifications
- [ ] Offline sync

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review browser console for errors
3. Check localStorage data structure
4. Try clearing cache and reloading

## 🎉 Features Highlight

✨ **Glassmorphism UI** - Modern, sophisticated design
📱 **Mobile-First** - Optimized for one-handed use
🧠 **Neurodivergent-Friendly** - Low energy mode, simple interface
🔄 **Smart Automation** - Bath ritual day detection
💾 **Local-First** - All data stored locally
📊 **Consistency Tracking** - Log every action
🎨 **Customizable** - Easy to modify and extend
⚡ **Fast** - No build tools, instant loading
🔐 **Private** - No data collection or tracking
📤 **Portable** - Export/import data anytime

---

**Version:** 1.0.0 MVP
**Last Updated:** February 25, 2026
**Status:** Ready for local testing
**Next Phase:** Google Sheets integration
