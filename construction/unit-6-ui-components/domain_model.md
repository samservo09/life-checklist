# Unit 6: Shared UI Component Library - Domain Driven Design Model

## Executive Summary

This document defines the complete Domain Driven Design (DDD) domain model for the Shared UI Component Library. The model encompasses all tactical components including aggregates, entities, value objects, domain events, policies, repositories, and domain services.

**Key Design Decisions:**
- Theme as aggregate root with Component as child entity
- Unified ThemeRepository for data access
- Anti-Corruption Layer for external UI framework changes
- Asynchronous domain event publishing
- WCAG AA as minimum accessibility standard
- User preferences persisted locally and to backend
- Component state managed within component with domain events
- Application layer handles timezone conversion (Singapore Time UTC+8)
- Domain works with UTC internally

---

## 1. Ubiquitous Language

### Core Domain Terms

**Theme:** A collection of design tokens (colors, typography, spacing) applied consistently across all components.

**Component:** A reusable UI element with defined state, behavior, and accessibility requirements.

**ComponentType:** The classification of a component (checkbox, button, badge, progress, modal, input, navigation, card, alert).

**ComponentState:** The current state of a component (default, hover, active, disabled, error, success).

**AccessibilitySettings:** User preferences for accessibility features (high contrast, reduce motion, large text, color blind mode).

**ColorPalette:** A set of colors used in the theme (primary, secondary, success, warning, error, info, neutral).

**Typography:** Font settings including family, size, line height, and weight.

**Spacing:** Consistent spacing scale (XS, S, M, L, XL) for padding and margins.

**ContrastRatio:** The ratio of luminance between two colors for accessibility compliance.

**ThemePreference:** User's preferred theme mode (light or dark).

**ColorBlindMode:** Color blind simulation mode (protanopia, deuteranopia, tritanopia).

**MotionPreference:** User's preference for animations (reduce motion or normal).

**VisualHierarchy:** The organization of visual elements to guide user attention.

---

## 2. Bounded Context

### Context Name
**Shared UI Component Library Bounded Context**

### Context Responsibility
Provides reusable, neurodivergent-friendly UI components with high-contrast design, clear visual hierarchy, and WCAG AA accessibility compliance. Manages themes, accessibility settings, and component rendering for all other services.

### Context Boundaries
- **Inbound:** Receives component rendering requests from all services
- **Outbound:** Sends rendered components to all services
- **Internal:** Manages all component operations, theming, and accessibility

### Ubiquitous Language Scope
All terms defined in Section 1 apply within this context.

---

## 3. Aggregate Design

### 3.1 Theme Aggregate Root

**Aggregate Root:** Theme

**Responsibility:** Manages all theme operations, maintains consistency of design tokens, and coordinates with child entities.

**Aggregate Boundary:**
```
Theme (Aggregate Root)
├── ThemeId (Value Object)
├── ThemeMode (Value Object)
├── ColorPalette (Value Object)
├── Typography (Value Object)
├── Spacing (Value Object)
├── BorderRadius (Value Object)
├── Components (Collection of Child Entities)
├── AccessibilitySettings (Value Object)
├── CreatedAt (Value Object)
└── UpdatedAt (Value Object)
```

**Aggregate Invariants:**
1. A theme must have a valid ThemeId
2. A theme must have a valid ThemeMode (light or dark)
3. A theme must have a valid ColorPalette
4. A theme must have valid Typography settings
5. A theme must have valid Spacing values
6. All colors must meet WCAG AA contrast ratio (4.5:1 minimum)
7. All components must use theme tokens
8. CreatedAt and UpdatedAt must be valid timestamps

**Aggregate Lifecycle:**
1. **Created:** Theme initialized with design tokens
2. **Active:** Theme in use, components rendered with theme
3. **Archived:** Theme archived, no longer used
4. **Deleted:** Soft delete, data preserved for recovery

**Key Operations:**
- Create theme with design tokens
- Add component to theme
- Update component state
- Apply theme to components
- Validate accessibility compliance
- Update accessibility settings
- Delete theme (soft delete)
- Get theme tokens
- Render components with theme

---

## 4. Entities

### 4.1 Component Entity

**Entity Identity:** ComponentId (unique within Theme)

**Responsibility:** Represents a single UI component with state and rendering logic.

**Properties:**
- ComponentId: Unique identifier
- ComponentType: Type of component (checkbox, button, badge, progress, modal, input, navigation, card, alert)
- ComponentState: Current state (default, hover, active, disabled, error, success)
- Label: Component label (string, 1-255 characters)
- Value: Component value (varies by type)
- IsDisabled: Flag indicating if component is disabled
- IsRequired: Flag indicating if component is required
- ErrorMessage: Error message if in error state (nullable)
- SuccessMessage: Success message if in success state (nullable)
- CreatedAt: Creation timestamp
- UpdatedAt: Last modification timestamp
- IsDeleted: Soft delete flag

**Entity Invariants:**
1. ComponentType must be valid
2. ComponentState must be valid
3. Label must not be empty
4. Label must not exceed 255 characters
5. State transitions must be valid
6. UpdatedAt must be >= CreatedAt

**Entity Lifecycle:**
1. **Created:** Component initialized
2. **Rendered:** Component rendered with theme
3. **StateChanged:** Component state changed
4. **Deleted:** Soft delete, data preserved

**Key Operations:**
- Create component with properties
- Update component state
- Set error message
- Set success message
- Render component
- Delete component (soft delete)
- Get component properties

---

## 5. Value Objects

### 5.1 ThemeId

**Purpose:** Unique identifier for Theme aggregate

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Uniquely identifies a Theme
- Generated on creation

---

### 5.2 ComponentId

**Purpose:** Unique identifier for Component entity

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Unique within Theme
- Generated on creation

---

### 5.3 ComponentType

**Purpose:** Encapsulates component type classification

**Valid Values:**
- CHECKBOX: Checkbox component
- BUTTON: Button component
- BADGE: Status badge component
- PROGRESS: Progress indicator component
- MODAL: Modal/dialog component
- INPUT: Input field component
- NAVIGATION: Navigation component
- CARD: Card component
- ALERT: Alert/toast component

**Characteristics:**
- Immutable
- Enumerated type
- Determines component behavior
- Validates type-specific rules

---

### 5.4 ComponentState

**Purpose:** Encapsulates component state

**Valid Values:**
- DEFAULT: Default state
- HOVER: Hover state
- ACTIVE: Active/pressed state
- DISABLED: Disabled state
- ERROR: Error state
- SUCCESS: Success state

**Characteristics:**
- Immutable (creates new instance on change)
- Enumerated type
- Determines visual appearance
- Validates state transitions

---

### 5.5 ColorValue

**Purpose:** Encapsulates color value

**Properties:**
- Hex: Hex color value (e.g., #000000)
- RGB: RGB color value (e.g., rgb(0, 0, 0))
- HSL: HSL color value (e.g., hsl(0, 0%, 0%))

**Characteristics:**
- Immutable
- Validates color format
- Supports color contrast calculation
- Comparable

---

### 5.6 ColorPalette

**Purpose:** Encapsulates color palette

**Properties:**
- Primary: Primary color
- Secondary: Secondary color
- Success: Success color (green)
- Warning: Warning color (orange)
- Error: Error color (red)
- Info: Info color (blue)
- Neutral: Neutral color (gray)

**Characteristics:**
- Immutable
- Validates WCAG AA contrast ratios
- Supports color blind modes
- Ensures consistency

---

### 5.7 Typography

**Purpose:** Encapsulates typography settings

**Properties:**
- FontFamily: Font family name
- FontSize: Base font size (pixels)
- LineHeight: Line height multiplier (minimum 1.5)
- FontWeight: Font weight (normal, bold)
- HeadingScale: Heading size scale

**Characteristics:**
- Immutable
- Validates typography constraints
- Ensures readability
- Supports accessibility

---

### 5.8 Spacing

**Purpose:** Encapsulates spacing scale

**Properties:**
- XS: Extra small spacing (4px)
- S: Small spacing (8px)
- M: Medium spacing (16px)
- L: Large spacing (24px)
- XL: Extra large spacing (32px)

**Characteristics:**
- Immutable
- Consistent scale
- Ensures visual harmony
- Supports responsive design

---

### 5.9 BorderRadius

**Purpose:** Encapsulates border radius values

**Properties:**
- Small: Small radius (4px)
- Medium: Medium radius (8px)
- Large: Large radius (12px)

**Characteristics:**
- Immutable
- Consistent values
- Supports component styling

---

### 5.10 ContrastRatio

**Purpose:** Encapsulates contrast ratio value

**Properties:**
- Value: Contrast ratio (e.g., 4.5)
- IsCompliant: Flag indicating WCAG AA compliance

**Characteristics:**
- Immutable
- Validates WCAG AA compliance (4.5:1 minimum)
- Supports accessibility validation

---

### 5.11 AccessibilitySettings

**Purpose:** Encapsulates accessibility settings

**Properties:**
- HighContrast: Flag for high contrast mode
- ReduceMotion: Flag for reduced motion
- LargeText: Flag for large text mode
- FontSize: Custom font size multiplier
- ColorBlindMode: Color blind simulation mode (none, protanopia, deuteranopia, tritanopia)

**Characteristics:**
- Immutable (creates new instance on change)
- Tracks accessibility preferences
- Validates accessibility constraints
- Supports user customization

---

### 5.12 Timestamp

**Purpose:** Encapsulates timestamp with timezone awareness

**Properties:**
- UtcValue: Timestamp in UTC
- SgtValue: Timestamp in Singapore Time (for display)

**Characteristics:**
- Immutable
- Stores UTC internally
- Converts to SGT for display
- Comparable



---

## 6. Domain Events

### 6.1 ThemeChangedEvent
**Trigger:** When theme is changed
**Properties:** ThemeId, ThemeMode, ColorPalette, ChangedAt (UTC)
**Subscribers:** All services, Audit Service

### 6.2 AccessibilitySettingsUpdatedEvent
**Trigger:** When accessibility settings are updated
**Properties:** ThemeId, AccessibilitySettings, UpdatedAt (UTC)
**Subscribers:** All services, Audit Service

### 6.3 ComponentRenderedEvent
**Trigger:** When component is rendered
**Properties:** ComponentId, ComponentType, ComponentState, RenderedAt (UTC)
**Subscribers:** Audit Service

### 6.4 ComponentStateChangedEvent
**Trigger:** When component state changes
**Properties:** ComponentId, OldState, NewState, ChangedAt (UTC)
**Subscribers:** Audit Service

### 6.5 ThemePreferenceUpdatedEvent
**Trigger:** When user theme preference is updated
**Properties:** ThemeId, ThemeMode, UpdatedAt (UTC)
**Subscribers:** Audit Service

### 6.6 AccessibilityModeToggledEvent
**Trigger:** When accessibility mode is toggled
**Properties:** ThemeId, Mode, IsEnabled, ToggledAt (UTC)
**Subscribers:** Audit Service

### 6.7 ColorBlindModeChangedEvent
**Trigger:** When color blind mode is changed
**Properties:** ThemeId, OldMode, NewMode, ChangedAt (UTC)
**Subscribers:** Audit Service

### 6.8 MotionPreferenceChangedEvent
**Trigger:** When motion preference is changed
**Properties:** ThemeId, ReduceMotion, ChangedAt (UTC)
**Subscribers:** Audit Service

---

## 7. Repositories

### 7.1 ThemeRepository Interface
**Methods:** save, findById, findByMode, findAll, delete
**Query Methods:** findActive, findByAccessibilityMode

### 7.2 ComponentRepository Interface
**Methods:** save, findById, findByType, findAll, delete
**Query Methods:** findByState, findByTheme

### 7.3 AccessibilitySettingsRepository Interface
**Methods:** save, findById, findAll, delete

### 7.4 ThemePreferenceRepository Interface
**Methods:** save, findById, findAll, delete

---

## 8. Domain Services

### 8.1 ThemeService
**Operations:** loadTheme, applyTheme, updateTheme, validateTheme, getThemeTokens

### 8.2 AccessibilityService
**Operations:** updateAccessibilitySettings, validateAccessibilityCompliance, getAccessibilitySettings, applyAccessibilityMode

### 8.3 ComponentService
**Operations:** renderComponent, updateComponentState, validateComponent, getComponentProperties

### 8.4 ColorContrastService
**Operations:** calculateContrastRatio, validateWCAGAA, suggestAccessibleColors, applyColorBlindMode

### 8.5 TypographyService
**Operations:** applyTypography, validateTypography, getTypographySettings, adjustFontSize

### 8.6 ThemePreferenceService
**Operations:** detectSystemPreference, saveUserPreference, applyPreference, getPreference

### 8.7 ResponsiveDesignService
**Operations:** handleBreakpoint, applyResponsiveStyles, validateResponsiveness, getBreakpoints

---

## 9. Business Rules & Policies

### 9.1 AccessibilityPolicy
- WCAG AA compliance required for all components
- Minimum contrast ratio 4.5:1 for text
- Keyboard navigation required
- Screen reader support required
- Color blind friendly palette mandatory

### 9.2 ComponentStatePolicy
- Valid state transitions: Default → Hover → Active
- Disabled state prevents state changes
- Error state shows error message
- Success state shows success message
- State changes emit events

### 9.3 ThemePolicy
- Light and dark modes supported
- Custom themes allowed
- Theme persistence required
- Theme application to all components
- Theme consistency enforced

### 9.4 ColorPolicy
- High-contrast colors required
- Color blind friendly palette
- Contrast ratio validation (4.5:1 minimum)
- Color consistency across theme
- Color accessibility compliance

### 9.5 TypographyPolicy
- Minimum font size 14px
- Minimum line height 1.5
- Clear visual hierarchy
- Readable font families
- Consistent typography scale

### 9.6 SpacingPolicy
- Consistent spacing scale (XS, S, M, L, XL)
- Minimum touch target 44x44px
- Clear visual separation
- Consistent padding/margin
- Responsive spacing

### 9.7 AnimationPolicy
- Reduced motion support required
- No flashing or rapid animations
- Smooth transitions (200-300ms)
- Accessible animations only
- No seizure-inducing patterns

---

## 10. Anti-Corruption Layer

**Purpose:** Isolate domain from external UI framework changes

**Responsibilities:**
- Translate domain Theme to framework-specific format
- Translate framework data to domain Theme
- Handle framework API errors
- Manage framework compatibility

---

## 11. Event Publishing

**Mechanism:** Asynchronous event publishing to message broker

**Benefits:**
- Non-blocking component rendering
- Better performance
- Service independence
- Resilience through retries

---

## 12. Aggregate Lifecycle & State Transitions

### 12.1 Theme Aggregate States
- Created: Theme initialized
- Active: Theme in use
- Archived: Theme archived
- Deleted: Soft delete

### 12.2 Component Entity States
- Created: Component initialized
- Rendered: Component rendered
- StateChanged: State changed
- Deleted: Soft delete

### 12.3 State Transition Rules
- Valid transitions defined
- Invariants maintained
- Guard conditions enforced

---

## 13. Integration Points

### 13.1 Checklist Management Integration
- UI Components used for rendering checklists
- Theme applied to checklist components
- Accessibility settings respected

### 13.2 Ritual Management Integration
- UI Components used for rendering rituals
- Theme applied to ritual components
- Accessibility settings respected

### 13.3 Inventory Management Integration
- UI Components used for rendering inventory
- Theme applied to inventory components
- Accessibility settings respected

### 13.4 QR Routing Integration
- UI Components used for module loader
- Theme applied to routing components
- Accessibility settings respected

### 13.5 Consistency Tracking Integration
- UI Components used for dashboard
- Theme applied to dashboard components
- Accessibility settings respected

---

## 14. Error Handling & Exceptions

### 14.1 Domain Exceptions
- ThemeNotFoundException
- ComponentNotFoundException
- InvalidComponentStateException
- AccessibilityComplianceException
- ColorContrastException
- InvalidThemeException
- ComponentRenderingFailedException

### 14.2 Exception Handling Policies
- When to throw exceptions
- Exception recovery strategies
- Error propagation rules
- Fallback behavior

---

## 15. Design Decisions & Rationale

### 15.1 Theme as Aggregate Root
**Decision:** Theme is aggregate root, Component is child entity
**Rationale:** Themes are primary entities, components are rendered using themes

### 15.2 Unified Repository
**Decision:** Single ThemeRepository, components accessed through Theme
**Rationale:** Enforces aggregate boundary and consistency

### 15.3 Anti-Corruption Layer
**Decision:** ACL between domain and external UI framework
**Rationale:** Protects domain from framework changes

### 15.4 Asynchronous Events
**Decision:** Domain events published asynchronously
**Rationale:** Better performance and resilience

### 15.5 WCAG AA Standard
**Decision:** WCAG AA as minimum accessibility standard
**Rationale:** Balance between accessibility and implementation complexity

### 15.6 Theme Persistence
**Decision:** User preferences persisted locally and to backend
**Rationale:** Better user experience with offline support

### 15.7 Component State Management
**Decision:** State managed within component with domain events
**Rationale:** Simpler component design and better encapsulation

---

## 16. Summary

This domain model provides a comprehensive DDD specification for the Shared UI Component Library with:

- Clear aggregate boundaries (Theme as root)
- Rich value objects (ComponentType, ComponentState, ColorPalette, Typography, Spacing, etc.)
- Comprehensive domain events (8 event types)
- Well-defined repositories (4 repository interfaces)
- Powerful domain services (7 services)
- Clear business rules and policies (7 policies)
- Anti-Corruption Layer for external framework isolation
- Asynchronous event publishing for decoupling
- Singapore Time (UTC+8) integration throughout
- Soft delete for data recovery
- Full lifecycle management for themes and components
- WCAG AA accessibility compliance
- Support for multiple themes and accessibility modes
- Integration with 5 services

**Key Characteristics:**
- Type-safe with value objects
- Consistent with Singapore Time (UTC+8)
- Supports light and dark modes
- Handles accessibility settings
- Manages component state
- Validates accessibility compliance
- Maintains audit trail through domain events
- Preserves data through soft deletes
- Decoupled from external frameworks through ACL
- Resilient through asynchronous event publishing
- Optimized for performance and accessibility

This model is ready for implementation with clear contracts for repositories, services, and event handlers.

