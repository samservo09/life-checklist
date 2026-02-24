# Unit 6: Shared UI Component Library

## Overview
Provides reusable, neurodivergent-friendly UI components with high-contrast design, clear visual hierarchy, and WCAG AA accessibility compliance. Used by all other services for consistent UX.

## QR Code Routes
- No direct QR routes (shared library)

## User Stories

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

---

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

---

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

## Shared Components

### Core Components

**Checkbox Component**
- High-contrast checked/unchecked states
- Smooth animation on toggle
- Keyboard accessible (Space/Enter to toggle)
- Large touch target (44x44px minimum)
- Clear visual feedback

**Button Component**
- High-contrast colors
- Clear hover/active states
- Minimum 44x44px touch target
- Descriptive labels
- Disabled state visually distinct

**Status Badge Component**
- Color-coded status (Low/Half/Full, Low/Yellow/Green)
- High-contrast colors
- Clear text labels
- Icon support for additional clarity

**Progress Indicator Component**
- Visual progress bar
- Percentage text display
- High-contrast colors
- Accessible to screen readers

**Modal/Dialog Component**
- Clear title and description
- High-contrast buttons
- Keyboard navigation (Tab, Escape)
- Focus management
- Clear close button

**Input Component**
- Clear labels
- High-contrast borders
- Large font size
- Clear error messages
- Keyboard accessible

**Navigation Component**
- Clear menu structure
- Breadcrumb navigation
- Consistent styling
- Keyboard navigation
- Mobile-responsive

**Card Component**
- Clear visual separation
- High-contrast borders
- Consistent spacing
- Readable typography

**Alert/Toast Component**
- High-contrast colors
- Clear messaging
- Auto-dismiss with manual close option
- Accessible to screen readers
- Doesn't disappear too quickly

### Theme System

**Color Palette (High-Contrast):**
- Primary: #000000 (Black)
- Secondary: #FFFFFF (White)
- Success: #00AA00 (Green)
- Warning: #FFAA00 (Orange)
- Error: #DD0000 (Red)
- Info: #0066CC (Blue)
- Neutral: #666666 (Gray)

**Typography:**
- Heading 1: 32px, Bold
- Heading 2: 24px, Bold
- Heading 3: 20px, Bold
- Body: 16px, Regular
- Small: 14px, Regular
- Minimum line height: 1.5

**Spacing:**
- XS: 4px
- S: 8px
- M: 16px
- L: 24px
- XL: 32px

**Border Radius:**
- Small: 4px
- Medium: 8px
- Large: 12px

## API Endpoints

### Theme Operations
- `GET /api/ui/theme` - Get current theme preference
- `POST /api/ui/theme` - Update theme preference (light/dark)
- `GET /api/ui/accessibility` - Get accessibility settings
- `POST /api/ui/accessibility` - Update accessibility settings

### Data Models

**Theme:**
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
  },
  "typography": {
    "fontFamily": "string",
    "fontSize": "number",
    "lineHeight": "number"
  }
}
```

**Accessibility Settings:**
```json
{
  "highContrast": "boolean",
  "reduceMotion": "boolean",
  "largeText": "boolean",
  "fontSize": "number",
  "colorBlindMode": "none|protanopia|deuteranopia|tritanopia"
}
```

## Dependencies
- None (shared library used by all services)

## Integration Points
- Used by Checklist Management Service for rendering checklists
- Used by Ritual Management Service for rendering rituals
- Used by Inventory Management Service for rendering inventory
- Used by QR Routing Service for rendering module loader
- Used by Consistency Tracking Service for rendering dashboard

## Implementation Notes

### Accessibility Compliance
- WCAG AA compliance for all components
- Keyboard navigation support
- Screen reader support
- Color contrast ratios verified
- Focus management implemented
- Semantic HTML used throughout

### Performance Optimization
- Components optimized for re-renders
- CSS-in-JS for dynamic theming
- Lazy loading of heavy components
- Memoization of expensive computations

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1440px
- Touch-friendly on mobile
- Desktop optimized for larger screens

### Dark Mode Support
- System preference detection
- Manual toggle option
- Persistent user preference
- Smooth transition between modes

### Animation Guidelines
- Reduced motion support
- No flashing or rapid animations
- Smooth transitions (200-300ms)
- Accessible animations (no seizure-inducing patterns)
