# Unit 4: QR Routing & Module Loader System - Domain Driven Design Model

## Executive Summary

This document defines the complete Domain Driven Design (DDD) domain model for the QR Routing & Module Loader Service. The model encompasses all tactical components including aggregates, entities, value objects, domain events, policies, repositories, and domain services.

**Key Design Decisions:**
- QRCode as aggregate root with Route as child entity
- Unified QRCodeRepository for data access
- Anti-Corruption Layer for external service APIs
- Asynchronous domain event publishing
- Cached module configuration with periodic refresh
- Client-side routing with server-side validation
- QR code validation (format + existence check)
- Application layer handles timezone conversion (Singapore Time UTC+8)
- Domain works with UTC internally

---

## 1. Ubiquitous Language

### Core Domain Terms

**QRCode:** A scannable code that encodes a URL route to a specific module or area within the application.

**Route:** A URL path that maps to a specific module or area (e.g., /area/chores, /area/fridge).

**Area:** A location or context within the application (chores, self-care, bathroom, desk, door, bath-ritual, fridge, pantry, first-aid, recipes).

**Module:** A functional component loaded based on the route (checklist, ritual, inventory, logistics).

**ModuleType:** The classification of a module (checklist, ritual, inventory, logistics).

**ServiceType:** The backend service that handles the module (checklist, ritual, inventory).

**ModuleConfiguration:** The configuration details for a module including area, route, service, type, title, description, icon, loading time, and dependencies.

**QRCodeConfiguration:** The configuration details for a QR code including code, area, location, and active status.

**RouteParameter:** A parameter extracted from a URL route and passed to a module.

**RouteResolution:** The process of mapping a QR code to a route and extracting parameters.

**ModuleLoading:** The process of loading a module based on a resolved route.

**Timezone:** Singapore Time (SGT, UTC+8) - used for QR code creation/update timestamps and user display.

---

## 2. Bounded Context

### Context Name
**QR Routing & Module Loader Bounded Context**

### Context Responsibility
Manages QR code routing, dynamic module loading, and context-aware module configuration. Routes users to the correct module based on QR code scans with URL parameters. Handles route resolution, parameter extraction, and module loading coordination.

### Context Boundaries
- **Inbound:** Receives QR code scans from UI layer
- **Outbound:** Routes to Checklist, Ritual, and Inventory contexts
- **Internal:** Manages all routing operations, module loading, and configuration

### Ubiquitous Language Scope
All terms defined in Section 1 apply within this context.

---

## 3. Aggregate Design

### 3.1 QRCode Aggregate Root

**Aggregate Root:** QRCode

**Responsibility:** Manages all QR code operations, maintains consistency of QR code state, and coordinates with child entities.

**Aggregate Boundary:**
```
QRCode (Aggregate Root)
├── QRCodeId (Value Object)
├── QRCodeConfiguration (Value Object)
├── Route (Child Entity)
├── ModuleConfiguration (Value Object)
├── CreatedAt (Value Object)
└── UpdatedAt (Value Object)
```

**Aggregate Invariants:**
1. A QR code must have a valid QRCodeId
2. A QR code must have a valid QRCodeConfiguration
3. A QR code must have a valid Route
4. A QR code must have a valid ModuleConfiguration
5. QRCodeConfiguration must be active to be scanned
6. Route must map to a valid area
7. ModuleConfiguration must match the area
8. CreatedAt and UpdatedAt must be valid timestamps

**Aggregate Lifecycle:**
1. **Created:** QR code initialized with configuration
2. **Active:** QR code ready for scanning
3. **Scanned:** QR code has been scanned
4. **Resolved:** Route has been resolved
5. **Deleted:** Soft delete, data preserved for recovery

**Key Operations:**
- Create QR code with configuration
- Scan QR code
- Resolve route from QR code
- Extract route parameters
- Load module based on route
- Update QR code configuration
- Delete QR code (soft delete)
- Validate QR code format
- Check QR code active status



---

## 4. Entities

### 4.1 Route Entity

**Entity Identity:** RouteId (unique within QRCode)

**Responsibility:** Represents a specific route within a QR code with parameter extraction and module loading.

**Properties:**
- RouteId: Unique identifier
- URLPath: The URL path (e.g., /area/chores)
- Area: The area classification (chores, self-care, bathroom, desk, door, bath-ritual, fridge, pantry, first-aid, recipes)
- ModuleType: The module type (checklist, ritual, inventory, logistics)
- ServiceType: The backend service (checklist, ritual, inventory)
- RouteParameters: Extracted parameters from URL
- IsResolved: Flag indicating if route has been resolved
- ResolvedAt: Timestamp of route resolution (nullable)
- CreatedAt: Creation timestamp
- UpdatedAt: Last modification timestamp
- IsDeleted: Soft delete flag

**Entity Invariants:**
1. URLPath must not be empty
2. Area must be valid
3. ModuleType must be valid
4. ServiceType must be valid
5. RouteParameters must be valid
6. ResolvedAt must be null if not resolved
7. UpdatedAt must be >= CreatedAt

**Entity Lifecycle:**
1. **Created:** Route initialized
2. **Active:** Route ready for resolution
3. **Resolved:** Route parameters extracted
4. **Failed:** Route resolution failed
5. **Deleted:** Soft delete, data preserved

**Key Operations:**
- Create route with parameters
- Resolve route
- Extract parameters
- Validate route
- Delete route (soft delete)
- Get module configuration
- Get service type

---

## 5. Value Objects

### 5.1 QRCodeId

**Purpose:** Unique identifier for QRCode aggregate

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Uniquely identifies a QRCode
- Generated on creation

---

### 5.2 RouteId

**Purpose:** Unique identifier for Route entity

**Properties:**
- Value: UUID or similar unique identifier

**Characteristics:**
- Immutable
- Comparable
- Unique within QRCode
- Generated on creation

---

### 5.3 Area

**Purpose:** Encapsulates area classification

**Valid Values:**
- CHORES: Chore board checklist
- SELF_CARE: Self-care routine checklist
- BATHROOM: Bathroom cleaning checklist
- DESK: Gym checklist (by desk)
- DOOR: RTO checklist (by door)
- BATH_RITUAL: Bath ritual routine
- FRIDGE: Fridge/Freezer inventory
- PANTRY: Dry goods & pantry inventory
- FIRST_AID: First-aid tracker
- RECIPES: Recipe generator

**Characteristics:**
- Immutable
- Enumerated type
- Determines module type and service
- Validates area-specific rules

---

### 5.4 ModuleType

**Purpose:** Encapsulates module type classification

**Valid Values:**
- CHECKLIST: Checklist module
- RITUAL: Ritual module
- INVENTORY: Inventory module
- LOGISTICS: Logistics module (gym, rto)

**Characteristics:**
- Immutable
- Enumerated type
- Determines module behavior
- Validates type-specific rules

---

### 5.5 ServiceType

**Purpose:** Encapsulates backend service type

**Valid Values:**
- CHECKLIST: Checklist Management Service
- RITUAL: Ritual Management Service
- INVENTORY: Inventory Management Service

**Characteristics:**
- Immutable
- Enumerated type
- Determines service routing
- Validates service compatibility

---

### 5.6 URLPath

**Purpose:** Encapsulates URL path for routing

**Properties:**
- Value: URL path string (e.g., /area/chores)
- Area: Extracted area from path

**Characteristics:**
- Immutable
- Validates URL format
- Supports dynamic route generation
- Extracts area from path

---

### 5.7 RouteParameter

**Purpose:** Encapsulates route parameters

**Properties:**
- Key: Parameter name
- Value: Parameter value
- Type: Parameter type (string, number, boolean)

**Characteristics:**
- Immutable
- Supports multiple parameters
- Validates parameter constraints
- Tracks parameter metadata

---

### 5.8 ModuleConfiguration

**Purpose:** Encapsulates module configuration

**Properties:**
- Area: Area classification
- Route: URL route
- Service: Backend service
- ModuleType: Module type
- Title: Module title
- Description: Module description
- Icon: Module icon
- LoadingTime: Expected loading time (milliseconds)
- Dependencies: List of module dependencies

**Characteristics:**
- Immutable
- Represents module metadata
- Supports caching
- Validates configuration rules

---

### 5.9 QRCodeConfiguration

**Purpose:** Encapsulates QR code configuration

**Properties:**
- Code: QR code value/identifier
- Area: Associated area
- Location: Physical location of QR code
- IsActive: Flag indicating if QR code is active
- CreatedAt: Creation timestamp (UTC)
- UpdatedAt: Last update timestamp (UTC)

**Characteristics:**
- Immutable (creates new instance on change)
- Tracks configuration metadata
- Validates configuration rules
- Supports activation/deactivation

---

### 5.10 LoadingTime

**Purpose:** Encapsulates module loading time

**Properties:**
- Value: Loading time in milliseconds
- MaxThreshold: Maximum acceptable loading time (2000ms)

**Characteristics:**
- Immutable
- Validates loading time constraints
- Tracks performance metrics
- Supports performance monitoring

---

### 5.11 Timestamp

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

### 6.1 QRCodeScannedEvent

**Trigger:** When a QR code is scanned

**Properties:**
- QRCodeId: Identifier of scanned QR code
- Area: Area associated with QR code
- ScannedAt: Scan timestamp (UTC)
- DeviceInfo: Device information (optional)

**Subscribers:**
- Route Resolution Service
- Audit Service (for logging)

---

### 6.2 RouteResolvedEvent

**Trigger:** When a route is successfully resolved

**Properties:**
- QRCodeId: Parent QR code identifier
- RouteId: Identifier of resolved route
- URLPath: Resolved URL path
- Area: Area classification
- ModuleType: Module type
- ServiceType: Service type
- ResolvedAt: Resolution timestamp (UTC)

**Subscribers:**
- Module Loading Service
- Audit Service

---

### 6.3 ModuleLoadedEvent

**Trigger:** When a module is successfully loaded

**Properties:**
- QRCodeId: Parent QR code identifier
- RouteId: Associated route identifier
- ModuleType: Type of loaded module
- LoadingTime: Time taken to load (milliseconds)
- LoadedAt: Load timestamp (UTC)

**Subscribers:**
- Audit Service
- Performance Monitoring Service

---

### 6.4 ModuleLoadFailedEvent

**Trigger:** When module loading fails

**Properties:**
- QRCodeId: Parent QR code identifier
- RouteId: Associated route identifier
- ModuleType: Type of module that failed
- ErrorMessage: Error details
- FailedAt: Failure timestamp (UTC)

**Subscribers:**
- Error Handling Service
- Audit Service

---

### 6.5 QRCodeConfigurationCreatedEvent

**Trigger:** When a QR code configuration is created

**Properties:**
- QRCodeId: Identifier of created QR code
- Code: QR code value
- Area: Associated area
- Location: Physical location
- CreatedAt: Creation timestamp (UTC)

**Subscribers:**
- Audit Service
- Configuration Cache Service

---

### 6.6 QRCodeConfigurationUpdatedEvent

**Trigger:** When a QR code configuration is updated

**Properties:**
- QRCodeId: Identifier of updated QR code
- OldValues: Previous configuration values
- NewValues: Updated configuration values
- UpdatedAt: Update timestamp (UTC)

**Subscribers:**
- Audit Service
- Configuration Cache Service

---

### 6.7 QRCodeConfigurationDeletedEvent

**Trigger:** When a QR code configuration is deleted

**Properties:**
- QRCodeId: Identifier of deleted QR code
- Code: QR code value
- Area: Associated area
- DeletedAt: Deletion timestamp (UTC)

**Subscribers:**
- Audit Service
- Configuration Cache Service

---

### 6.8 InvalidQRCodeDetectedEvent

**Trigger:** When an invalid QR code is detected

**Properties:**
- QRCodeValue: The invalid QR code value
- ErrorReason: Reason for invalidity (format, not found, inactive)
- DetectedAt: Detection timestamp (UTC)

**Subscribers:**
- Error Handling Service
- Audit Service

---

### 6.9 RouteParametersPassedEvent

**Trigger:** When route parameters are extracted and passed to module

**Properties:**
- QRCodeId: Parent QR code identifier
- RouteId: Associated route identifier
- Parameters: Extracted parameters
- PassedAt: Timestamp when parameters passed (UTC)

**Subscribers:**
- Audit Service
- Module Loading Service



---

## 7. Repositories

### 7.1 QRCodeRepository Interface

**Purpose:** Abstract data access for QRCode aggregate

**Responsibility:** Persist and retrieve QRCode aggregates with all child entities

**Methods:**

**save(qrCode: QRCode): void**
- Persists QR code and route to storage
- Creates new or updates existing
- Maintains transactional consistency
- Publishes domain events

**findById(qrCodeId: QRCodeId): QRCode | null**
- Retrieves QR code by ID
- Loads route and configuration
- Returns null if not found

**findByArea(area: Area): QRCode[]**
- Retrieves all QR codes for given area
- Returns empty array if none found

**findByCode(code: string): QRCode | null**
- Retrieves QR code by code value
- Returns null if not found

**findAll(): QRCode[]**
- Retrieves all QR codes
- Returns empty array if none found

**delete(qrCodeId: QRCodeId): void**
- Soft deletes QR code
- Preserves data for recovery
- Publishes deletion event

**Query Methods:**
- findActive(): QRCode[]
- findByService(service: ServiceType): QRCode[]
- findByModuleType(moduleType: ModuleType): QRCode[]

---

### 7.2 ModuleConfigurationRepository Interface

**Purpose:** Abstract data access for ModuleConfiguration

**Responsibility:** Persist and retrieve module configurations

**Methods:**

**save(config: ModuleConfiguration): void**
- Persists module configuration
- Creates new or updates existing

**findById(configId: string): ModuleConfiguration | null**
- Retrieves configuration by ID
- Returns null if not found

**findByArea(area: Area): ModuleConfiguration | null**
- Retrieves configuration for area
- Returns null if not found

**findByService(service: ServiceType): ModuleConfiguration[]**
- Retrieves configurations for service
- Returns empty array if none found

**findAll(): ModuleConfiguration[]**
- Retrieves all configurations
- Returns empty array if none found

**Query Methods:**
- findByModuleType(moduleType: ModuleType): ModuleConfiguration[]

---

### 7.3 QRCodeConfigurationRepository Interface

**Purpose:** Abstract data access for QR code configurations

**Responsibility:** Persist and retrieve QR code configurations

**Methods:**

**save(config: QRCodeConfiguration): void**
- Persists QR code configuration
- Creates new or updates existing

**findById(configId: string): QRCodeConfiguration | null**
- Retrieves configuration by ID
- Returns null if not found

**findByCode(code: string): QRCodeConfiguration | null**
- Retrieves configuration by code
- Returns null if not found

**findByArea(area: Area): QRCodeConfiguration[]**
- Retrieves configurations for area
- Returns empty array if none found

**findAll(): QRCodeConfiguration[]**
- Retrieves all configurations
- Returns empty array if none found

**delete(configId: string): void**
- Deletes configuration

---

### 7.4 RouteRepository Interface

**Purpose:** Abstract data access for Route entities

**Responsibility:** Persist and retrieve routes

**Methods:**

**findByArea(area: Area): Route[]**
- Retrieves routes for area
- Returns empty array if none found

**findByService(service: ServiceType): Route[]**
- Retrieves routes for service
- Returns empty array if none found

**findAll(): Route[]**
- Retrieves all routes
- Returns empty array if none found

---

## 8. Domain Services

### 8.1 QRCodeScanningService

**Purpose:** Encapsulate QR code scanning logic

**Responsibility:** Handle QR code validation, scanning, and event publishing

**Operations:**

**scanQRCode(qrCodeValue: string): QRCode**
- Validates QR code format
- Checks if QR code exists
- Checks if QR code is active
- Publishes QRCodeScannedEvent
- Returns QR code

**validateQRCodeFormat(qrCodeValue: string): ValidationResult**
- Validates QR code format
- Checks for required format
- Returns validation result

**isQRCodeActive(qrCode: QRCode): boolean**
- Determines if QR code is active
- Checks configuration status
- Returns boolean

**getQRCodeInfo(qrCode: QRCode): QRCodeInfo**
- Returns QR code information
- Includes area, module type, service
- Used for display

---

### 8.2 RouteResolutionService

**Purpose:** Encapsulate route resolution logic

**Responsibility:** Resolve QR code to route, extract parameters, emit events

**Operations:**

**resolveRoute(qrCode: QRCode): Route**
- Resolves QR code to route
- Extracts route parameters
- Validates route
- Publishes RouteResolvedEvent
- Returns resolved route

**extractRouteParameters(urlPath: URLPath): RouteParameter[]**
- Extracts parameters from URL path
- Validates parameters
- Returns parameter list

**validateRoute(route: Route): ValidationResult**
- Validates route configuration
- Checks area compatibility
- Checks module type compatibility
- Returns validation result

**getRouteInfo(route: Route): RouteInfo**
- Returns route information
- Includes area, module type, service
- Used for display

---

### 8.3 ModuleLoadingService

**Purpose:** Encapsulate module loading logic

**Responsibility:** Load modules, handle dependencies, emit events

**Operations:**

**loadModule(route: Route): Module**
- Loads module based on route
- Resolves module dependencies
- Validates module availability
- Publishes ModuleLoadedEvent
- Returns loaded module

**resolveDependencies(module: Module): Module[]**
- Resolves module dependencies
- Loads dependent modules
- Validates dependency availability
- Returns dependency list

**validateModuleAvailability(moduleType: ModuleType): boolean**
- Checks if module is available
- Checks service availability
- Returns boolean

**getModuleLoadingTime(module: Module): number**
- Returns module loading time
- Tracks performance metrics
- Used for monitoring

---

### 8.4 RouteParameterService

**Purpose:** Encapsulate route parameter handling

**Responsibility:** Extract, validate, and pass parameters to modules

**Operations:**

**extractParameters(urlPath: URLPath): RouteParameter[]**
- Extracts parameters from URL
- Validates parameter format
- Returns parameter list

**validateParameters(parameters: RouteParameter[]): ValidationResult**
- Validates all parameters
- Checks parameter types
- Checks parameter values
- Returns validation result

**passParametersToModule(module: Module, parameters: RouteParameter[]): void**
- Passes parameters to module
- Publishes RouteParametersPassedEvent
- Handles parameter transformation

**getParameterValue(parameters: RouteParameter[], key: string): any**
- Retrieves parameter value by key
- Returns parameter value or null

---

### 8.5 QRCodeConfigurationService

**Purpose:** Encapsulate QR code configuration management

**Responsibility:** Create, update, delete configurations, emit events

**Operations:**

**createConfiguration(configData: ConfigurationData): QRCode**
- Creates new QR code configuration
- Validates configuration data
- Publishes QRCodeConfigurationCreatedEvent
- Returns created QR code

**updateConfiguration(qrCodeId: QRCodeId, updates: ConfigurationUpdates): QRCode**
- Updates QR code configuration
- Validates updates
- Publishes QRCodeConfigurationUpdatedEvent
- Returns updated QR code

**deleteConfiguration(qrCodeId: QRCodeId): void**
- Deletes QR code configuration
- Publishes QRCodeConfigurationDeletedEvent

**activateConfiguration(qrCodeId: QRCodeId): QRCode**
- Activates QR code configuration
- Publishes configuration event
- Returns updated QR code

**deactivateConfiguration(qrCodeId: QRCodeId): QRCode**
- Deactivates QR code configuration
- Publishes configuration event
- Returns updated QR code

---

### 8.6 ModuleConfigurationService

**Purpose:** Encapsulate module configuration management

**Responsibility:** Load, cache, and manage module configurations

**Operations:**

**loadModuleConfiguration(area: Area): ModuleConfiguration**
- Loads module configuration for area
- Caches configuration
- Returns configuration

**cacheConfiguration(config: ModuleConfiguration): void**
- Caches module configuration
- Sets cache expiration
- Enables fast retrieval

**refreshConfigurationCache(): void**
- Refreshes all cached configurations
- Reloads from repository
- Updates cache

**getConfigurationByArea(area: Area): ModuleConfiguration**
- Retrieves configuration for area
- Returns from cache if available
- Returns configuration

**getConfigurationByService(service: ServiceType): ModuleConfiguration[]**
- Retrieves configurations for service
- Returns from cache if available
- Returns configuration list

---

### 8.7 RoutingValidationService

**Purpose:** Encapsulate routing validation rules

**Responsibility:** Validate QR codes, routes, and parameters

**Operations:**

**validateQRCode(qrCode: QRCode): ValidationResult**
- Validates QR code
- Checks format, existence, active status
- Returns validation result

**validateRoute(route: Route): ValidationResult**
- Validates route
- Checks area, module type, service
- Returns validation result

**validateParameters(parameters: RouteParameter[]): ValidationResult**
- Validates parameters
- Checks types, values, constraints
- Returns validation result

**validateAreaMapping(area: Area): ValidationResult**
- Validates area mapping
- Checks area to module mapping
- Checks area to service mapping
- Returns validation result



---

## 9. Business Rules & Policies

### 9.1 QRCodeValidationPolicy

**Rule 1: QR Code Format**
- QR code must be valid URL format
- QR code must encode a valid route
- QR code must not be empty

**Rule 2: QR Code Existence**
- QR code must exist in configuration
- QR code must be registered in system
- QR code must have valid mapping

**Rule 3: QR Code Activation**
- QR code must be active to be scanned
- Inactive QR codes redirect to home page
- Activation status can be toggled

**Rule 4: QR Code Expiration**
- QR codes don't expire by default
- Optional expiration can be set
- Expired QR codes redirect to home page

---

### 9.2 RouteResolutionPolicy

**Rule 1: Route Resolution**
- QR code maps to exactly one route
- Route must be valid and active
- Route must have valid area mapping

**Rule 2: Parameter Extraction**
- Parameters extracted from URL path
- Parameters validated before passing
- Invalid parameters cause resolution failure

**Rule 3: Route Fallback**
- Invalid routes redirect to home page
- Missing routes redirect to home page
- Fallback behavior is consistent

---

### 9.3 ModuleLoadingPolicy

**Rule 1: Module Loading Sequence**
- Module dependencies loaded first
- Main module loaded after dependencies
- Loading sequence is deterministic

**Rule 2: Module Loading Timeout**
- Module must load within 2 seconds
- Timeout triggers error event
- Timeout redirects to home page

**Rule 3: Module Dependency Resolution**
- Dependencies resolved recursively
- Circular dependencies detected and prevented
- Missing dependencies cause loading failure

**Rule 4: Module Loading Error Handling**
- Loading errors emit ModuleLoadFailedEvent
- Errors redirect to home page
- Error details logged for debugging

---

### 9.4 AreaMappingPolicy

**Rule 1: Area to Module Mapping**
- Each area maps to exactly one module type
- Mapping is immutable
- Mapping is validated on creation

**Rule 2: Area to Service Mapping**
- Each area maps to exactly one service
- Mapping is immutable
- Mapping is validated on creation

**Rule 3: Area to Route Mapping**
- Each area maps to exactly one route
- Route format: /area/{area}
- Route is validated on creation

**Rule 4: Area Validation**
- Area must be one of 10 valid areas
- Area must have valid configuration
- Area must have valid service mapping

---

### 9.5 ModuleTypePolicy

**Rule 1: Module Type Classification**
- CHECKLIST: Checklist modules (chores, self-care, bathroom, desk, door)
- RITUAL: Ritual modules (bath-ritual)
- INVENTORY: Inventory modules (fridge, pantry, first-aid, recipes)
- LOGISTICS: Logistics modules (desk, door)

**Rule 2: Module Type Behavior**
- Each module type has specific behavior
- Module type determines service routing
- Module type determines UI rendering

**Rule 3: Module Type Dependencies**
- Each module type may have dependencies
- Dependencies are resolved before loading
- Dependencies are validated on creation

---

### 9.6 ServiceIntegrationPolicy

**Rule 1: Service Routing**
- Checklist areas route to Checklist Service
- Ritual areas route to Ritual Service
- Inventory areas route to Inventory Service

**Rule 2: Service Error Handling**
- Service errors emit ModuleLoadFailedEvent
- Service errors redirect to home page
- Service errors are logged for debugging

**Rule 3: Service Context Passing**
- Route parameters passed to service
- Service receives area context
- Service receives module type context

---

### 9.7 PerformancePolicy

**Rule 1: Module Loading Time**
- Module must load within 2 seconds
- Loading time tracked and monitored
- Slow loading triggers warning

**Rule 2: QR Code Scanning Optimization**
- QR code scanning optimized for mobile
- Scanning response time < 500ms
- Scanning doesn't block UI

**Rule 3: Route Resolution Optimization**
- Route resolution < 100ms
- Route resolution cached when possible
- Route resolution doesn't block UI

**Rule 4: Configuration Caching**
- Module configurations cached in memory
- Cache refreshed periodically
- Cache invalidation on configuration update

---

## 10. Anti-Corruption Layer

### 10.1 Purpose
Isolate domain model from external service APIs, providing translation between domain concepts and external service interfaces.

### 10.2 Responsibilities
- Translate domain Route to service-specific format
- Translate service responses to domain format
- Handle service API errors and exceptions
- Manage service authentication and rate limiting

### 10.3 Key Interfaces

**RouteToServiceTranslator**
- Converts Route to service-specific format
- Handles parameter transformation
- Manages context passing

**ServiceResponseTranslator**
- Converts service responses to domain format
- Handles error responses
- Validates response data

**ServiceIntegrationAdapter**
- Implements service integration
- Handles API calls
- Manages error handling and retries

---

## 11. Event Publishing

### 11.1 Asynchronous Event Publishing

**Mechanism:**
- Domain events published to message broker
- Event handlers process asynchronously
- Decouples services

**Event Flow:**
1. Domain operation completes
2. Domain event created
3. Event published to message broker
4. Event handler receives event
5. Handler processes event

**Benefits:**
- Non-blocking user operations
- Better performance
- Service independence
- Resilience through retries

---

## 12. Aggregate Lifecycle & State Transitions

### 12.1 QRCode Aggregate States

**State 1: Created**
- QR code initialized with configuration
- Ready for activation

**State 2: Active**
- QR code active and ready for scanning
- Can be scanned

**State 3: Scanned**
- QR code has been scanned
- Route resolution in progress

**State 4: Resolved**
- Route resolved successfully
- Module loading in progress

**State 5: Deleted**
- Soft delete
- Data preserved

### 12.2 Route Entity States

**State 1: Created**
- Route initialized
- Pending resolution

**State 2: Active**
- Route active and ready
- Can be resolved

**State 3: Resolved**
- Route resolved successfully
- Parameters extracted

**State 4: Failed**
- Route resolution failed
- Error details recorded

**State 5: Deleted**
- Soft delete
- Data preserved

### 12.3 State Transition Rules

**Valid Transitions:**
- Created → Active (immediate)
- Active → Scanned (on scan)
- Scanned → Resolved (on resolution)
- Scanned → Failed (on resolution failure)
- Active → Deleted (on user delete)
- Resolved → Deleted (on user delete)

**Invariants That Must Be Maintained:**
- QR code must have valid configuration
- Route must have valid area mapping
- Route must have valid service mapping
- Parameters must be valid

---

## 13. Integration Points

### 13.1 Checklist Management Service Integration

**Inbound:**
- Receives route requests for checklist areas
- Receives route parameters

**Outbound:**
- Routes to Checklist Service
- Passes area context
- Passes module type context

**Data Flow:**
1. QR code scanned for checklist area
2. Route resolved
3. Parameters extracted
4. Checklist Service called with context
5. Checklist module loaded

### 13.2 Ritual Management Service Integration

**Inbound:**
- Receives route requests for ritual areas
- Receives route parameters

**Outbound:**
- Routes to Ritual Service
- Passes area context
- Passes module type context

### 13.3 Inventory Management Service Integration

**Inbound:**
- Receives route requests for inventory areas
- Receives route parameters

**Outbound:**
- Routes to Inventory Service
- Passes area context
- Passes module type context

### 13.4 UI Component Integration

**Data Transformation:**
- Domain model transformed to UI format
- Route parameters formatted for display
- Module configuration formatted for display

---

## 14. Error Handling & Exceptions

### 14.1 Domain Exceptions

**QRCodeNotFoundException**
- Thrown when QR code not found
- Includes QR code ID
- Handled by application layer

**InvalidQRCodeException**
- Thrown when QR code format invalid
- Includes invalid code value
- Handled by validation service

**RouteNotFoundException**
- Thrown when route not found
- Includes route ID
- Handled by application layer

**ModuleLoadingFailedException**
- Thrown when module loading fails
- Includes error details
- Triggers retry logic

**InvalidRouteParameterException**
- Thrown when route parameter invalid
- Includes parameter details
- Handled by validation service

**ServiceIntegrationException**
- Thrown when service integration fails
- Includes service details
- Triggers error handling

**ConfigurationNotFoundException**
- Thrown when configuration not found
- Includes configuration ID
- Handled by application layer

---

## 15. Design Decisions & Rationale

### 15.1 QRCode as Aggregate Root

**Decision:** QRCode is aggregate root, Route is child entity

**Rationale:**
- QR codes are primary entities
- Routes are derived from QR codes
- Strong consistency required
- Simpler to implement and maintain

---

### 15.2 Unified Repository

**Decision:** Single QRCodeRepository, routes accessed through QRCode

**Rationale:**
- Enforces aggregate boundary
- Simpler to maintain consistency
- Natural transaction boundary
- Aligns with DDD principles

---

### 15.3 Anti-Corruption Layer

**Decision:** ACL between domain and external service APIs

**Rationale:**
- Protects domain from API changes
- Easier to test domain independently
- Allows future service switching
- Follows DDD best practices

---

### 15.4 Asynchronous Events

**Decision:** Domain events published asynchronously

**Rationale:**
- Better performance
- Better decoupling
- Better resilience
- Scales better

---

### 15.5 Configuration Caching

**Decision:** Module configurations cached in memory with periodic refresh

**Rationale:**
- Better performance for frequent route resolution
- Reduces database queries
- Supports offline operation
- Improves user experience

---

### 15.6 Client-Side Routing

**Decision:** Client-side routing with server-side validation

**Rationale:**
- Better performance
- Better offline support
- Faster route resolution
- Reduced server load

---

### 15.7 QR Code Validation

**Decision:** Format validation + existence check

**Rationale:**
- Ensures QR codes are valid
- Ensures QR codes are registered
- Prevents invalid routing
- Improves user experience

---

## 16. Summary

This domain model provides a comprehensive DDD specification for the QR Routing & Module Loader Service with:

- Clear aggregate boundaries (QRCode as root)
- Rich value objects (Area, ModuleType, ServiceType, URLPath, RouteParameter, etc.)
- Comprehensive domain events (9 event types)
- Well-defined repositories (4 repository interfaces)
- Powerful domain services (7 services)
- Clear business rules and policies (7 policies)
- Anti-Corruption Layer for external API isolation
- Asynchronous event publishing for decoupling
- Singapore Time (UTC+8) integration throughout
- Soft delete for data recovery
- Configuration caching for performance
- Client-side routing with server-side validation
- Full lifecycle management for QR codes and routes

**Key Characteristics:**
- Type-safe with value objects
- Consistent with Singapore Time (UTC+8)
- Supports 10 QR code routes
- Handles route parameter extraction
- Supports module loading with dependencies
- Maintains audit trail through domain events
- Preserves data through soft deletes
- Decoupled from external APIs through ACL
- Resilient through asynchronous event publishing
- Optimized for performance (<2 second module loading)

This model is ready for implementation with clear contracts for repositories, services, and event handlers.

