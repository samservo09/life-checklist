# Unit 7: Hosting & Performance Service

## Overview
Handles Vercel hosting, offline support through service workers, data caching strategy, performance monitoring, and offline queue management for seamless user experience.

## QR Code Routes
- No direct QR routes (infrastructure service)

## User Stories

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

---

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

## API Endpoints

### Performance & Sync Operations
- `GET /api/sync-status` - Get current sync status
- `POST /api/offline-queue` - Queue offline changes
- `GET /api/offline-queue` - Get pending offline changes
- `POST /api/offline-queue/sync` - Manually trigger sync
- `DELETE /api/offline-queue/:id` - Remove item from queue
- `GET /api/performance-metrics` - Get performance data

### Data Models

**Sync Status:**
```json
{
  "isOnline": "boolean",
  "lastSyncAt": "timestamp",
  "pendingChanges": "number",
  "syncInProgress": "boolean",
  "lastSyncError": "string"
}
```

**Offline Queue Item:**
```json
{
  "id": "string",
  "action": "create|update|delete",
  "resource": "checklist|ritual|inventory",
  "resourceId": "string",
  "data": "object",
  "timestamp": "timestamp",
  "synced": "boolean"
}
```

**Performance Metrics:**
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

## Vercel Deployment Configuration

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.life-os.vercel.app
GOOGLE_SHEETS_API_KEY=<key>
GOOGLE_SHEETS_SPREADSHEET_ID=<id>
```

### Build Configuration
- Framework: Next.js
- Node version: 18.x
- Build command: `npm run build`
- Start command: `npm start`
- Output directory: `.next`

### Performance Optimization
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- CSS minification
- JavaScript minification
- Gzip compression

## Service Worker Implementation

### Caching Strategy
- **Cache First:** Static assets (CSS, JS, images)
- **Network First:** API calls (with fallback to cache)
- **Stale While Revalidate:** Dynamic content

### Cached Resources
- HTML shell
- CSS and JavaScript bundles
- Images and icons
- Font files
- Module configurations

### Offline Functionality
- View cached checklists
- Complete tasks offline
- Queue changes for sync
- Display offline indicator
- Show sync status

## Offline Queue Management

### Queue Storage
- IndexedDB for reliable offline storage
- Automatic cleanup of synced items
- Conflict resolution on sync

### Sync Strategy
- Automatic sync when connection restored
- Manual sync trigger available
- Exponential backoff for failed syncs
- User notification on sync completion

### Conflict Resolution
- Last-write-wins strategy
- User prompt for conflicting changes (optional)
- Merge strategy for non-conflicting changes

## Performance Monitoring

### Metrics Tracked
- Page load time
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Cache hit rate
- API response times
- Error rates

### Monitoring Tools
- Web Vitals API
- Vercel Analytics
- Custom performance tracking
- Error logging and reporting

## Dependencies
- **Data Persistence & Consistency Tracking Service** - For sync operations
- All other services - For offline support

## Integration Points
- Syncs data from offline queue to Consistency Tracking Service
- Receives sync status updates
- Monitors performance of all services
- Handles offline/online transitions

## Implementation Notes

### Next.js Configuration
```javascript
// next.config.js
module.exports = {
  images: {
    optimization: true,
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
}
```

### Service Worker Registration
- Registered on app initialization
- Updated on new deployments
- Handles offline/online events
- Manages cache updates

### Offline Detection
- Uses `navigator.onLine` API
- Listens to online/offline events
- Displays offline indicator
- Queues changes when offline

### Performance Optimization Checklist
- ✅ Code splitting by route
- ✅ Image optimization
- ✅ CSS minification
- ✅ JavaScript minification
- ✅ Gzip compression
- ✅ CDN caching
- ✅ Service worker caching
- ✅ Lazy loading of modules
- ✅ Memoization of expensive computations
- ✅ Debouncing of frequent events

### Deployment Checklist
- ✅ Environment variables configured
- ✅ Build succeeds without errors
- ✅ Performance metrics within targets
- ✅ Offline functionality tested
- ✅ Sync functionality tested
- ✅ Error handling tested
- ✅ Mobile responsiveness verified
- ✅ Accessibility compliance verified
