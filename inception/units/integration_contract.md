# Integration Contract - Life OS Services

## Overview
This document defines the API contracts and integration points between all Life OS services. Each service exposes specific endpoints and follows a consistent REST API pattern.

---

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    QR Routing Service (Unit 4)              │
│              Routes to appropriate modules                  │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
       ┌───────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
       │  Checklist   │ │  Ritual    │ │ Inventory │
       │  Management  │ │ Management │ │Management │
       │  (Unit 1)    │ │  (Unit 2)  │ │  (Unit 3) │
       └───────┬──────┘ └────┬──────┘ └────┬──────┘
               │             │             │
               └─────────────┼─────────────┘
                             │
                    ┌────────▼────────┐
                    │  Consistency    │
                    │  Tracking       │
                    │  (Unit 5)       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Google Sheets  │
                    │  Backend        │
                    └─────────────────┘

All services use:
├─ Shared UI Components (Unit 6)
└─ Vercel Hosting & Performance (Unit 7)
```

---

## Unit 1: Checklist Management Service

### Base URL
```
/api/checklists
```

### Endpoints

#### Get Checklist
```
GET /api/checklists/:type
```
**Parameters:**
- `type` (string): checklist type (chores, self-care, bathroom, gym, rto)

**Response:**
```json
{
  "type": "string",
  "items": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "completed": "boolean",
      "completedAt": "timestamp",
      "order": "number",
      "notes": "string"
    }
  ],
  "lowEnergyMode": "boolean",
  "completionPercentage": "number",
  "lastResetAt": "timestamp"
}
```

#### Add Item
```
POST /api/checklists/:type/items
```
**Body:**
```json
{
  "name": "string",
  "category": "string",
  "notes": "string"
}
```

**Response:** Created item object

#### Update Item
```
PUT /api/checklists/:type/items/:id
```
**Body:**
```json
{
  "name": "string",
  "category": "string",
  "notes": "string"
}
```

**Response:** Updated item object

#### Delete Item
```
DELETE /api/checklists/:type/items/:id
```

**Response:** `{ "success": true }`

#### Mark Item Complete
```
PATCH /api/checklists/:type/items/:id/complete
```
**Body:**
```json
{
  "completed": "boolean"
}
```

**Response:** Updated item object

#### Get Low Energy Checklist
```
GET /api/checklists/:type/low-energy
```

**Response:** Checklist with only 4 fallback items

#### Trigger Reset (Internal)
```
POST /api/checklists/reset
```
**Body:**
```json
{
  "resetType": "daily|weekly|bi-weekly|monthly"
}
```

**Response:** `{ "success": true, "itemsReset": "number" }`

---

## Unit 2: Ritual Management Service

### Base URL
```
/api/rituals
```

### Endpoints

#### Get Ritual
```
GET /api/rituals/:type
```
**Parameters:**
- `type` (string): ritual type (bath)

**Response:**
```json
{
  "type": "string",
  "steps": [
    {
      "id": "string",
      "name": "string",
      "order": "number",
      "daySchedule": "mwfsat|tthsun|all",
      "completed": "boolean",
      "completedAt": "timestamp"
    }
  ],
  "currentDayVariant": "mwfsat|tthsun",
  "completionPercentage": "number"
}
```

#### Get Today's Ritual Variant
```
GET /api/rituals/:type/today
```

**Response:** Ritual object with today's variant

#### Add Step
```
POST /api/rituals/:type/steps
```
**Body:**
```json
{
  "name": "string",
  "daySchedule": "mwfsat|tthsun|all"
}
```

**Response:** Created step object

#### Update Step
```
PUT /api/rituals/:type/steps/:id
```
**Body:**
```json
{
  "name": "string",
  "daySchedule": "mwfsat|tthsun|all"
}
```

**Response:** Updated step object

#### Delete Step
```
DELETE /api/rituals/:type/steps/:id
```

**Response:** `{ "success": true }`

#### Mark Step Complete
```
PATCH /api/rituals/:type/steps/:id/complete
```
**Body:**
```json
{
  "completed": "boolean"
}
```

**Response:** Updated step object

#### Get Day Schedule
```
GET /api/rituals/:type/schedule
```

**Response:**
```json
{
  "mwfsat": { "days": ["string[]"], "steps": ["object[]"] },
  "tthsun": { "days": ["string[]"], "steps": ["object[]"] },
  "universal": { "days": ["string[]"], "steps": ["object[]"] }
}
```

---

## Unit 3: Inventory Management Service

### Base URL
```
/api/inventory
```

### Endpoints

#### Get Inventory
```
GET /api/inventory/:type
```
**Parameters:**
- `type` (string): inventory type (fridge, pantry, first-aid)

**Response:**
```json
{
  "type": "string",
  "items": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "status": "low|half|full",
      "quantity": "number",
      "expiryDate": "date",
      "notes": "string"
    }
  ]
}
```

#### Add Item
```
POST /api/inventory/:type/items
```
**Body:**
```json
{
  "name": "string",
  "category": "string",
  "status": "low|half|full",
  "quantity": "number",
  "expiryDate": "date",
  "notes": "string"
}
```

**Response:** Created item object

#### Update Item
```
PUT /api/inventory/:type/items/:id
```
**Body:**
```json
{
  "name": "string",
  "category": "string",
  "status": "low|half|full",
  "quantity": "number",
  "expiryDate": "date",
  "notes": "string"
}
```

**Response:** Updated item object

#### Delete Item
```
DELETE /api/inventory/:type/items/:id
```

**Response:** `{ "success": true }`

#### Update Status
```
PATCH /api/inventory/:type/items/:id/status
```
**Body:**
```json
{
  "status": "low|half|full"
}
```

**Response:** Updated item object

#### Bulk Update
```
POST /api/inventory/bulk-update
```
**Body:**
```json
{
  "itemIds": ["string[]"],
  "updates": {
    "status": "low|half|full"
  }
}
```

**Response:** `{ "success": true, "itemsUpdated": "number" }`

#### Get Recipes
```
GET /api/recipes
```

**Response:**
```json
{
  "recipes": [
    {
      "id": "string",
      "name": "string",
      "mainIngredients": ["string[]"],
      "difficulty": "easy|medium|hard",
      "prepTime": "number",
      "readyNow": "boolean",
      "missing": ["string[]"]
    }
  ]
}
```

#### Save Recipe
```
POST /api/recipes/save
```
**Body:**
```json
{
  "recipeId": "string"
}
```

**Response:** `{ "success": true }`

#### Get Favorite Recipes
```
GET /api/recipes/favorites
```

**Response:** Array of saved recipe objects

---

## Unit 4: QR Routing & Module Loader Service

### Base URL
```
/api/modules
```

### Endpoints

#### Get Module Configuration
```
GET /api/modules/:area
```
**Parameters:**
- `area` (string): area identifier (chores, self-care, bathroom, desk, door, bath-ritual, fridge, pantry, first-aid, recipes)

**Response:**
```json
{
  "area": "string",
  "route": "string",
  "service": "checklist|ritual|inventory",
  "moduleType": "string",
  "title": "string",
  "description": "string",
  "icon": "string"
}
```

#### Get QR Code Configuration (Admin)
```
GET /api/qr-config/:code
```

**Response:**
```json
{
  "code": "string",
  "area": "string",
  "location": "string",
  "active": "boolean"
}
```

#### Create QR Code (Admin)
```
POST /api/qr-config
```
**Body:**
```json
{
  "area": "string",
  "location": "string"
}
```

**Response:** Created QR config object

#### Update QR Code (Admin)
```
PUT /api/qr-config/:code
```
**Body:**
```json
{
  "area": "string",
  "location": "string",
  "active": "boolean"
}
```

**Response:** Updated QR config object

#### Delete QR Code (Admin)
```
DELETE /api/qr-config/:code
```

**Response:** `{ "success": true }`

---

## Unit 5: Data Persistence & Consistency Tracking Service

### Base URL
```
/api/consistency
```

### Endpoints

#### Sync Data
```
POST /api/consistency/sync
```
**Body:**
```json
{
  "completionRecords": ["object[]"]
}
```

**Response:**
```json
{
  "success": true,
  "syncedAt": "timestamp",
  "recordsCount": "number"
}
```

#### Get Sync Status
```
GET /api/consistency/sync-status
```

**Response:**
```json
{
  "isOnline": "boolean",
  "lastSyncAt": "timestamp",
  "pendingChanges": "number",
  "syncInProgress": "boolean"
}
```

#### Archive Completion Data (Internal)
```
POST /api/consistency/archive
```
**Body:**
```json
{
  "date": "date",
  "completionRecords": ["object[]"]
}
```

**Response:** `{ "success": true, "archivedAt": "timestamp" }`

#### Trigger Daily Reset (Internal)
```
POST /api/consistency/reset
```
**Body:**
```json
{
  "resetType": "daily|weekly|bi-weekly|monthly"
}
```

**Response:** `{ "success": true, "resetAt": "timestamp" }`

#### Get Streaks
```
GET /api/consistency/streaks
```

**Response:**
```json
{
  "streaks": [
    {
      "moduleType": "string",
      "moduleName": "string",
      "currentStreak": "number",
      "longestStreak": "number",
      "streakStartDate": "date"
    }
  ]
}
```

#### Get Streak for Module
```
GET /api/consistency/streaks/:type
```

**Response:** Single streak object

#### Get Historical Data
```
GET /api/consistency/history
```

**Response:**
```json
{
  "archivedData": [
    {
      "date": "date",
      "dailyCompletionPercentage": "number",
      "archivedAt": "timestamp"
    }
  ]
}
```

#### Get Data for Specific Date
```
GET /api/consistency/history/:date
```

**Response:** Archived data object for date

#### Get Dashboard Data
```
GET /api/consistency/dashboard
```

**Response:**
```json
{
  "currentStreaks": ["object[]"],
  "completionRates": {
    "today": "number",
    "thisWeek": "number",
    "thisMonth": "number"
  },
  "historicalData": ["object[]"],
  "milestones": ["object[]"],
  "chartData": {
    "labels": ["string[]"],
    "datasets": ["object[]"]
  }
}
```

#### Get Milestones
```
GET /api/consistency/milestones
```

**Response:**
```json
{
  "milestones": [
    {
      "id": "string",
      "type": "streak|completion",
      "name": "string",
      "threshold": "number",
      "achieved": "boolean",
      "achievedAt": "timestamp"
    }
  ]
}
```

#### Trigger Celebration
```
POST /api/consistency/milestones/:id/celebrate
```

**Response:** `{ "success": true, "celebrationTriggered": true }`

---

## Unit 6: Shared UI Component Library

### Base URL
```
/api/ui
```

### Endpoints

#### Get Theme
```
GET /api/ui/theme
```

**Response:**
```json
{
  "mode": "light|dark",
  "colors": {
    "primary": "string",
    "secondary": "string",
    "success": "string",
    "warning": "string",
    "error": "string",
    "info": "string",
    "neutral": "string"
  }
}
```

#### Update Theme
```
POST /api/ui/theme
```
**Body:**
```json
{
  "mode": "light|dark"
}
```

**Response:** Updated theme object

#### Get Accessibility Settings
```
GET /api/ui/accessibility
```

**Response:**
```json
{
  "highContrast": "boolean",
  "reduceMotion": "boolean",
  "largeText": "boolean",
  "fontSize": "number",
  "colorBlindMode": "none|protanopia|deuteranopia|tritanopia"
}
```

#### Update Accessibility Settings
```
POST /api/ui/accessibility
```
**Body:**
```json
{
  "highContrast": "boolean",
  "reduceMotion": "boolean",
  "largeText": "boolean",
  "fontSize": "number",
  "colorBlindMode": "string"
}
```

**Response:** Updated accessibility settings object

---

## Unit 7: Hosting & Performance Service

### Base URL
```
/api/sync
```

### Endpoints

#### Get Sync Status
```
GET /api/sync-status
```

**Response:**
```json
{
  "isOnline": "boolean",
  "lastSyncAt": "timestamp",
  "pendingChanges": "number",
  "syncInProgress": "boolean",
  "lastSyncError": "string"
}
```

#### Queue Offline Change
```
POST /api/offline-queue
```
**Body:**
```json
{
  "action": "create|update|delete",
  "resource": "checklist|ritual|inventory",
  "resourceId": "string",
  "data": "object"
}
```

**Response:** Queued item object

#### Get Pending Changes
```
GET /api/offline-queue
```

**Response:**
```json
{
  "pendingChanges": [
    {
      "id": "string",
      "action": "string",
      "resource": "string",
      "resourceId": "string",
      "timestamp": "timestamp"
    }
  ]
}
```

#### Manually Trigger Sync
```
POST /api/offline-queue/sync
```

**Response:** `{ "success": true, "itemsSynced": "number" }`

#### Remove from Queue
```
DELETE /api/offline-queue/:id
```

**Response:** `{ "success": true }`

#### Get Performance Metrics
```
GET /api/performance-metrics
```

**Response:**
```json
{
  "pageLoadTime": "number",
  "firstContentfulPaint": "number",
  "largestContentfulPaint": "number",
  "cumulativeLayoutShift": "number",
  "timeToInteractive": "number",
  "cacheHitRate": "number"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Authentication & Authorization

### Authentication
- JWT tokens for API authentication
- Tokens stored in secure HTTP-only cookies
- Token refresh on expiration

### Authorization
- Role-based access control (RBAC)
- Admin endpoints require admin role
- User endpoints require authenticated user

---

## Rate Limiting

### Limits
- 100 requests per minute per user
- 1000 requests per minute per IP
- Burst limit: 10 requests per second

### Headers
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time until limit resets

---

## Versioning

### API Versioning
- Current version: v1
- Base URL: `/api/v1/...`
- Backward compatibility maintained for 2 versions

---

## Data Synchronization

### Sync Flow
1. Client detects online status
2. Offline queue retrieved from IndexedDB
3. Queue items sent to Consistency Tracking Service
4. Service syncs to Google Sheets
5. Confirmation sent back to client
6. Queue cleared on success

### Conflict Resolution
- Last-write-wins strategy
- Timestamp-based conflict detection
- User notification on conflicts (optional)

---

## Performance Targets

### API Response Times
- GET requests: < 200ms
- POST requests: < 500ms
- Bulk operations: < 2s

### Frontend Performance
- Page load: < 2s
- First Contentful Paint: < 1s
- Time to Interactive: < 3s

---

## Monitoring & Logging

### Metrics Tracked
- API response times
- Error rates
- Sync success rates
- Cache hit rates
- User engagement

### Logging
- All API calls logged
- Errors logged with stack traces
- Sync operations logged
- Performance metrics logged

---

## Deployment & Versioning

### Deployment Strategy
- Continuous deployment on main branch
- Staging environment for testing
- Rollback capability for failed deployments

### Version Management
- Semantic versioning (MAJOR.MINOR.PATCH)
- Breaking changes in major versions
- Deprecation warnings for 2 versions before removal
