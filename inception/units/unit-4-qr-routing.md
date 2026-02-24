# Unit 4: QR Routing & Module Loader Service

## Overview
Handles QR code routing and dynamic module loading. Routes users to the correct module based on QR code scans with URL parameters. Manages context-aware module loading and QR code configuration.

## QR Code Routes (10 Total)

| QR Code | Route | Module | Service | Type |
|---------|-------|--------|---------|------|
| 1 | /area/chores | Chore Board | Checklist Management | Checklist |
| 2 | /area/self-care | Self-Care Board | Checklist Management | Checklist |
| 3 | /area/bathroom | Bathroom Cleaning | Checklist Management | Checklist |
| 4 | /area/desk | Gym Checklist | Checklist Management | Logistics |
| 5 | /area/door | RTO Checklist | Checklist Management | Logistics |
| 6 | /area/bath-ritual | Bath Ritual | Ritual Management | Ritual |
| 7 | /area/fridge | Fridge/Freezer Tracker | Inventory Management | Inventory |
| 8 | /area/pantry | Dry Goods & Pantry | Inventory Management | Inventory |
| 9 | /area/first-aid | First-Aid Tracker | Inventory Management | Inventory |
| 10 | /area/recipes | Recipe Generator | Inventory Management | Inventory |

## User Stories

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

## API Endpoints

### QR Routing Operations
- `GET /api/modules/:area` - Get module configuration for area
- `GET /api/qr-config/:code` - Get QR code configuration (optional, for QR code management)
- `POST /api/qr-config` - Create new QR code configuration (admin)
- `PUT /api/qr-config/:code` - Update QR code configuration (admin)
- `DELETE /api/qr-config/:code` - Delete QR code configuration (admin)

### Data Models

**Module Configuration:**
```json
{
  "area": "chores|self-care|bathroom|desk|door|bath-ritual|fridge|pantry|first-aid|recipes",
  "route": "/area/:area",
  "service": "checklist|ritual|inventory",
  "moduleType": "checklist|ritual|inventory|logistics",
  "title": "string",
  "description": "string",
  "icon": "string",
  "loadingTime": "number",
  "dependencies": ["string[]"]
}
```

**QR Code Configuration:**
```json
{
  "code": "string",
  "area": "string",
  "location": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "active": "boolean"
}
```

**Route Parameters:**
```json
{
  "area": "string",
  "moduleType": "string",
  "service": "string",
  "timestamp": "number"
}
```

## Dependencies
- **Checklist Management Service** - For loading checklist modules
- **Ritual Management Service** - For loading ritual modules
- **Inventory Management Service** - For loading inventory modules
- **Shared UI Component Library** - For high-contrast components and accessibility

## Integration Points
- Routes to Checklist Management Service for /area/chores, /area/self-care, /area/bathroom, /area/desk, /area/door
- Routes to Ritual Management Service for /area/bath-ritual
- Routes to Inventory Management Service for /area/fridge, /area/pantry, /area/first-aid, /area/recipes
- Uses shared UI components for rendering
- Handles module loading and context passing

## Implementation Notes

### QR Code Generation
QR codes should encode URLs in the following format:
```
https://life-os.vercel.app/area/chores
https://life-os.vercel.app/area/self-care
https://life-os.vercel.app/area/bathroom
https://life-os.vercel.app/area/desk
https://life-os.vercel.app/area/door
https://life-os.vercel.app/area/bath-ritual
https://life-os.vercel.app/area/fridge
https://life-os.vercel.app/area/pantry
https://life-os.vercel.app/area/first-aid
https://life-os.vercel.app/area/recipes
```

### Route Handling
- Routes are handled client-side using Next.js dynamic routing
- Each route loads the appropriate module from the corresponding service
- Module loading is lazy-loaded for performance
- Error handling redirects to home page on invalid routes

### Performance Optimization
- Module configurations cached in memory
- QR code scanning optimized for mobile devices
- Fast page load (<2 seconds) achieved through code splitting
