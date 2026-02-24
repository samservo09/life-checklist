# Critical Decisions Explained - Unit 1 DDD Domain Model

## Decision 1: Aggregate Root - Checklist vs ChecklistItem

### What is an Aggregate Root?
An aggregate root is the main entity that controls access to all other entities within an aggregate. It's the entry point for all operations on the aggregate.

### Option A: Checklist as Aggregate Root ✅ RECOMMENDED

**Structure:**
```
Checklist (Aggregate Root)
├── ChecklistItem (Child Entity)
├── ChecklistItem (Child Entity)
└── ChecklistItem (Child Entity)
```

**Pros:**
- **Consistency:** All operations on items go through Checklist, ensuring business rules are enforced
- **Transactional Boundary:** Entire checklist is saved/loaded as one unit
- **Business Logic:** Checklist-level rules (like completion percentage) are naturally enforced
- **Simplicity:** Single entry point for all operations
- **Example:** When marking an item complete, you load the Checklist, mark the item, and save the entire Checklist

**Cons:**
- **Performance:** Loading entire checklist with all items might be slow for large checklists
- **Concurrency:** If two users edit different items simultaneously, last-write-wins

**When to use:**
- Checklists are typically small (5-20 items)
- Operations often affect multiple items (e.g., calculating completion %)
- Strong consistency is important

---

### Option B: ChecklistItem as Aggregate Root

**Structure:**
```
ChecklistItem (Aggregate Root)
ChecklistItem (Aggregate Root)
ChecklistItem (Aggregate Root)
```

**Pros:**
- **Performance:** Load only the item you need
- **Concurrency:** Multiple users can edit different items without conflicts
- **Scalability:** Better for very large checklists

**Cons:**
- **Consistency:** Hard to enforce checklist-level rules
- **Complexity:** Need to coordinate between multiple aggregates
- **Transactions:** Harder to maintain consistency across items
- **Example:** Calculating completion % requires querying all items separately

**When to use:**
- Checklists are very large (100+ items)
- Items are edited independently
- Performance is critical

---

### Recommendation: **Checklist as Aggregate Root**

**Why?**
1. Checklists in this system are small (typically 5-20 items)
2. Operations often need checklist-level consistency (completion %, reset logic)
3. Simpler to implement and maintain
4. Aligns with user mental model (one checklist, multiple items)

---

## Decision 2: Repository Pattern - Separate vs Unified

### What is a Repository?
A repository abstracts data access, making the domain model independent of persistence details.

### Option A: Unified Repository ✅ RECOMMENDED

**Structure:**
```
ChecklistRepository
├── save(checklist)
├── findById(id)
├── findByType(type)
└── delete(id)

// ChecklistItems accessed through Checklist
checklist.getItems()
checklist.addItem(item)
```

**Pros:**
- **Simplicity:** Single entry point for all data access
- **Consistency:** Enforces aggregate boundary
- **Maintainability:** Easier to understand and modify
- **Transactions:** Natural transaction boundary

**Cons:**
- **Flexibility:** Can't query items independently
- **Performance:** Must load entire checklist to access one item

**When to use:**
- Aggregate is small
- Items are always accessed through parent
- Strong consistency needed

---

### Option B: Separate Repositories

**Structure:**
```
ChecklistRepository
├── save(checklist)
├── findById(id)
└── delete(id)

ChecklistItemRepository
├── save(item)
├── findById(id)
├── findByChecklistId(checklistId)
└── delete(id)
```

**Pros:**
- **Flexibility:** Query items independently
- **Performance:** Load only what you need
- **Scalability:** Better for large datasets

**Cons:**
- **Complexity:** Multiple entry points, harder to maintain consistency
- **Transactions:** Harder to ensure atomicity
- **Coupling:** Violates aggregate boundary

**When to use:**
- Aggregate is large
- Items are frequently accessed independently
- Performance is critical

---

### Recommendation: **Unified Repository (ChecklistRepository only)**

**Why?**
1. Checklist is the aggregate root
2. Items should only be accessed through Checklist
3. Simpler to maintain consistency
4. Aligns with DDD principles

---

## Decision 3: Anti-Corruption Layer - Needed or Not?

### What is an Anti-Corruption Layer (ACL)?
An ACL is a boundary layer that translates between your domain model and external systems (like Google Sheets API), protecting your domain from external changes.

### Option A: With Anti-Corruption Layer ✅ RECOMMENDED

**Structure:**
```
Domain Model (Checklist, ChecklistItem)
        ↓
Anti-Corruption Layer
        ↓
Google Sheets API
```

**Pros:**
- **Isolation:** Domain model is independent of Google Sheets API changes
- **Maintainability:** If Google Sheets API changes, only ACL needs updating
- **Testing:** Domain can be tested without external API
- **Flexibility:** Can switch to different backend without changing domain
- **Example:** If Google Sheets API changes response format, only ACL changes

**Cons:**
- **Complexity:** Extra layer to maintain
- **Performance:** Slight overhead from translation
- **Code:** More code to write and maintain

**When to use:**
- External system might change
- Want to protect domain from external changes
- Multiple external systems to integrate with

---

### Option B: Without Anti-Corruption Layer

**Structure:**
```
Domain Model (Checklist, ChecklistItem)
        ↓
Google Sheets API (directly)
```

**Pros:**
- **Simplicity:** Less code, fewer layers
- **Performance:** No translation overhead
- **Directness:** Straightforward mapping

**Cons:**
- **Coupling:** Domain tightly coupled to Google Sheets API
- **Fragility:** Any API change breaks domain
- **Testing:** Hard to test without external API
- **Example:** If Google Sheets API changes, domain code must change

**When to use:**
- External system is stable and unlikely to change
- Simple integration
- Performance is critical

---

### Recommendation: **With Anti-Corruption Layer**

**Why?**
1. Google Sheets API might change in future
2. Want to protect domain from external changes
3. Easier to test domain independently
4. Follows DDD best practices
5. Allows future backend switching (e.g., to Supabase)

---

## Decision 4: Event Publishing - Synchronous vs Asynchronous

### What are Domain Events?
Domain events represent significant things that happened in the domain (e.g., ChecklistItemCompleted). Other parts of the system listen to these events.

### Option A: Asynchronous Event Publishing ✅ RECOMMENDED

**Flow:**
```
User completes item
        ↓
ChecklistItemCompletedEvent created
        ↓
Event queued in message broker (e.g., RabbitMQ, Kafka)
        ↓
Event handler processes asynchronously
        ↓
Consistency Tracking Service receives event
```

**Pros:**
- **Performance:** Doesn't block user action
- **Decoupling:** Services don't need to know about each other
- **Resilience:** If one service is down, event is retried
- **Scalability:** Can handle high volume of events
- **Example:** User completes item, gets immediate feedback, event syncs to Google Sheets in background

**Cons:**
- **Complexity:** Need message broker infrastructure
- **Eventual Consistency:** Data might not be immediately consistent
- **Debugging:** Harder to trace event flow
- **Ordering:** Events might be processed out of order

**When to use:**
- High volume of events
- Services are independent
- Eventual consistency acceptable
- Performance is important

---

### Option B: Synchronous Event Publishing

**Flow:**
```
User completes item
        ↓
ChecklistItemCompletedEvent created
        ↓
Event handler processes immediately
        ↓
Consistency Tracking Service receives event
        ↓
Response sent to user
```

**Pros:**
- **Simplicity:** No message broker needed
- **Consistency:** Data immediately consistent
- **Debugging:** Easy to trace event flow
- **Ordering:** Events processed in order

**Cons:**
- **Performance:** Blocks user action until all handlers complete
- **Coupling:** Services tightly coupled
- **Fragility:** If one service fails, entire operation fails
- **Scalability:** Hard to handle high volume
- **Example:** User completes item, waits for sync to complete before getting feedback

**When to use:**
- Low volume of events
- Strong consistency required
- Services are tightly coupled
- Simplicity is priority

---

### Recommendation: **Asynchronous Event Publishing**

**Why?**
1. Better performance (user gets immediate feedback)
2. Better decoupling (services independent)
3. Better resilience (retries on failure)
4. Aligns with microservices architecture
5. Scales better as system grows

---

## Decision 5: Timezone Handling - Domain vs Application Layer

### What's the difference?

**Domain Layer:** Core business logic (Checklist, ChecklistItem, reset rules)
**Application Layer:** Orchestration, coordination, external concerns (HTTP requests, timezone conversion)

### Option A: Timezone in Application Layer ✅ RECOMMENDED

**Structure:**
```
Application Layer
├── Convert user timezone to UTC
├── Pass UTC to domain
└── Convert UTC back to user timezone

Domain Layer
├── Works with UTC internally
└── No timezone awareness
```

**Pros:**
- **Simplicity:** Domain doesn't need timezone logic
- **Consistency:** All times in UTC internally
- **Testing:** Domain tests don't need timezone mocking
- **Clarity:** Clear separation of concerns
- **Example:** Application converts "2024-01-15 12:00 EST" to "2024-01-15 17:00 UTC", passes to domain

**Cons:**
- **Complexity:** Application layer handles conversion
- **Potential Bugs:** Timezone conversion errors in application layer

**When to use:**
- Want simple domain model
- Timezone is user preference, not business rule
- Multiple timezones to support

---

### Option B: Timezone in Domain Layer

**Structure:**
```
Domain Layer
├── Knows about user timezone
├── Calculates reset times in user timezone
└── Handles daylight saving time

Application Layer
├── Passes user timezone to domain
└── Receives timezone-aware results
```

**Pros:**
- **Accuracy:** Domain handles all timezone logic
- **Completeness:** All business logic in one place
- **Flexibility:** Can have timezone-specific rules

**Cons:**
- **Complexity:** Domain becomes more complex
- **Testing:** Need to mock timezones
- **Coupling:** Domain knows about user preferences
- **Maintenance:** Harder to maintain timezone logic

**When to use:**
- Timezone is core business rule
- Complex timezone-specific logic
- Want all logic in domain

---

### Recommendation: **Timezone in Application Layer (with domain awareness)**

**Why?**
1. Keeps domain simple
2. Timezone is user preference, not core business rule
3. Easier to test
4. Clearer separation of concerns
5. But domain should be timezone-aware (work with UTC internally)

**Implementation:**
- Domain works with UTC timestamps internally
- Application layer converts user timezone to UTC before calling domain
- Application layer converts UTC back to user timezone for display

---

## Summary Table

| Decision | Recommendation | Rationale |
|----------|---|---|
| Aggregate Root | Checklist | Small checklists, need consistency |
| Repository | Unified (ChecklistRepository) | Enforce aggregate boundary |
| Anti-Corruption Layer | Yes | Protect domain from API changes |
| Event Publishing | Asynchronous | Better performance & decoupling |
| Timezone Handling | Application Layer | Keep domain simple |

---

## Next Steps

1. Review these explanations
2. Confirm or adjust recommendations
3. I'll proceed with domain model design based on your decisions
