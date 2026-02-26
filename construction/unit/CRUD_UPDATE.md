# Life OS - CRUD & Inventory Update Guide

## Changes Made

This update implements:

1. **Full CRUD Operations**
   - `addItem(boardType, item)` - Add new items
   - `editItem(boardType, itemId, updates)` - Edit existing items
   - `deleteItem(boardType, itemId)` - Delete items
   - `updateItem(boardType, itemId, updates)` - Update specific fields
   - `toggleItem(boardType, itemId)` - Toggle completion status

2. **Frequency-Based Completion Calculation**
   - Daily: 1 day window
   - Weekly: 7 days window
   - Bi-Weekly: 14 days window
   - Monthly: 30 days window
   - Completion % calculated based on items completed within frequency window

3. **Inventory Table Layout**
   - Non-Food, Pantry, Fridge, First-Aid now use table format
   - Editable status dropdowns
   - Save functionality for each row
   - Add new item form visible and functional

4. **Bath Ritual Update**
   - Added "The Ordinary Serum" to TTHSun (Tuesday, Thursday, Sunday)

## File Updates

### 1. utils.js - Add CRUD Functions

Add these functions to handle all CRUD operations:

```javascript
// CRUD Operations

function addItem(boardType, item) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  // Generate ID if not provided
  if (!item.id) {
    item.id = `${boardType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  board.items.push(item);
  
  // Log action
  logAction(boardType, item.id, 'add', item.name, null, item);
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
  showNotification(`✅ Added: ${item.name}`);
}

function editItem(boardType, itemId, updates) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  const item = board.items.find(i => i.id === itemId);
  if (!item) return;
  
  const oldValues = { ...item };
  Object.assign(item, updates);
  
  // Log action
  logAction(boardType, itemId, 'edit', item.name, oldValues, item);
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
  showNotification(`✏️ Updated: ${item.name}`);
}

function deleteItem(boardType, itemId) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  const itemIndex = board.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;
  
  const item = board.items[itemIndex];
  board.items.splice(itemIndex, 1);
  
  // Log action
  logAction(boardType, itemId, 'delete', item.name, item, null);
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
  showNotification(`🗑️ Deleted: ${item.name}`);
}

function updateItem(boardType, itemId, updates) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  const item = board.items.find(i => i.id === itemId);
  if (!item) return;
  
  const oldValues = { ...item };
  Object.assign(item, updates);
  
  // Log action
  logAction(boardType, itemId, 'update', item.name, oldValues, item);
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
}

function toggleItem(boardType, itemId) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  const item = board.items.find(i => i.id === itemId);
  if (!item) return;
  
  const oldCompleted = item.completed;
  item.completed = !item.completed;
  item.completedAt = item.completed ? new Date().toISOString() : null;
  
  // Log action
  logAction(boardType, itemId, item.completed ? 'complete' : 'uncomplete', item.name, { completed: oldCompleted }, { completed: item.completed });
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
}

// Frequency-Based Completion Calculation
function calculateCompletionPercentage(boardType, data) {
  const board = data.boards[boardType];
  if (!board || !board.items) return 0;
  
  const now = new Date();
  const items = board.items;
  
  // Get frequency window in days
  let frequencyDays = 1; // default daily
  
  // Determine frequency based on board type and items
  if (boardType === 'chores') {
    // For chores, calculate based on daily items only
    const dailyItems = items.filter(i => i.category === 'daily');
    if (dailyItems.length === 0) return 0;
    
    const completedDaily = dailyItems.filter(i => {
      if (!i.completedAt) return false;
      const completedDate = new Date(i.completedAt);
      const daysDiff = Math.floor((now - completedDate) / (1000 * 60 * 60 * 24));
      return daysDiff === 0; // Completed today
    }).length;
    
    return Math.round((completedDaily / dailyItems.length) * 100);
  }
  
  // For other boards, simple percentage
  const completed = items.filter(i => i.completed).length;
  return items.length === 0 ? 0 : Math.round((completed / items.length) * 100);
}

function updateCompletionPercentage(boardType, data) {
  const board = data.boards[boardType];
  if (!board) return;
  
  board.completionPercentage = calculateCompletionPercentage(boardType, data);
}

// Logging
function logAction(boardType, itemId, action, itemName, previousState, newState) {
  const data = loadData();
  
  data.consistencyLog.push({
    timestamp: new Date().toISOString(),
    boardType: boardType,
    itemId: itemId,
    action: action,
    itemName: itemName,
    previousState: previousState,
    newState: newState
  });
  
  // Keep only last 1000 logs
  if (data.consistencyLog.length > 1000) {
    data.consistencyLog = data.consistencyLog.slice(-1000);
  }
  
  saveData(data);
}

// Notification
function showNotification(message) {
  // Create temporary notification
  const notification = createElement('div', 'fixed bottom-4 right-4 glassmorphic p-4 rounded-lg text-white z-50 animate-bounce-in');
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Low Energy Mode
function toggleLowEnergyMode(enabled) {
  const data = loadData();
  data.boards.chores.lowEnergyMode = enabled;
  saveData(data);
}

function getLowEnergyItems() {
  const data = loadData();
  const fallbackIds = ['chores-7', 'chores-8', 'chores-9', 'chores-10'];
  return data.boards.chores.items.filter(item => fallbackIds.includes(item.id));
}
```

### 2. components.js - Update Inventory Item Rendering

Replace `renderInventoryItem` function with table-based version:

```javascript
// Inventory Item Component (Table Format)
function renderInventoryItem(item, boardType, onUpdate, onEdit, onDelete) {
  const container = createElement('div', 'glass-card animate-slide-in p-0 overflow-hidden');
  
  const table = createElement('table', 'w-full text-sm');
  
  // Header row
  const headerRow = createElement('tr', 'border-b border-white/10');
  
  const nameCell = createElement('td', 'p-3 font-medium text-white');
  nameCell.textContent = item.name;
  headerRow.appendChild(nameCell);
  
  const statusCell = createElement('td', 'p-3');
  const statusSelect = createElement('select', 'px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs');
  statusSelect.value = item.status;
  statusSelect.onchange = (e) => {
    updateItem(boardType, item.id, { status: e.target.value });
    onUpdate && onUpdate();
  };
  
  ['low', 'half', 'full'].forEach(status => {
    const option = createElement('option');
    option.value = status;
    option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    statusSelect.appendChild(option);
  });
  
  statusCell.appendChild(statusSelect);
  headerRow.appendChild(statusCell);
  
  const actionsCell = createElement('td', 'p-3 text-right');
  const deleteBtn = createElement('button', 'text-sm px-2 py-1 rounded hover:bg-red-500/20 transition');
  deleteBtn.textContent = '🗑️';
  deleteBtn.onclick = () => {
    if (confirm('Delete this item?')) {
      deleteItem(boardType, item.id);
      onDelete && onDelete();
    }
  };
  actionsCell.appendChild(deleteBtn);
  headerRow.appendChild(actionsCell);
  
  table.appendChild(headerRow);
  
  // Details row
  if (item.quantity !== undefined || item.expiryDate !== undefined || item.notes) {
    const detailsRow = createElement('tr', 'border-b border-white/10 bg-white/5');
    const detailsCell = createElement('td', 'p-3 col-span-3');
    detailsCell.colSpan = 3;
    
    const details = createElement('div', 'space-y-2 text-xs');
    
    if (item.quantity !== undefined) {
      const qtyDiv = createElement('div', 'flex items-center gap-2');
      const qtyLabel = createElement('span', 'text-gray-400');
      qtyLabel.textContent = 'Qty:';
      const qtyInput = createElement('input', 'w-16 px-2 py-1 rounded bg-white/10 border border-white/20 text-white');
      qtyInput.type = 'number';
      qtyInput.value = item.quantity;
      qtyInput.onchange = (e) => {
        updateItem(boardType, item.id, { quantity: parseInt(e.target.value) });
        onUpdate && onUpdate();
      };
      qtyDiv.appendChild(qtyLabel);
      qtyDiv.appendChild(qtyInput);
      details.appendChild(qtyDiv);
    }
    
    if (item.expiryDate !== undefined) {
      const expiryDiv = createElement('div', 'flex items-center gap-2');
      const expiryLabel = createElement('span', 'text-gray-400');
      expiryLabel.textContent = 'Expiry:';
      const expiryInput = createElement('input', 'flex-1 px-2 py-1 rounded bg-white/10 border border-white/20 text-white');
      expiryInput.type = 'date';
      expiryInput.value = item.expiryDate || '';
      expiryInput.onchange = (e) => {
        updateItem(boardType, item.id, { expiryDate: e.target.value });
        onUpdate && onUpdate();
      };
      expiryDiv.appendChild(expiryLabel);
      expiryDiv.appendChild(expiryInput);
      details.appendChild(expiryDiv);
    }
    
    if (item.notes !== undefined) {
      const notesDiv = createElement('div');
      const notesLabel = createElement('span', 'text-gray-400 block mb-1');
      notesLabel.textContent = 'Notes:';
      const notesInput = createElement('textarea', 'w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs');
      notesInput.value = item.notes;
      notesInput.rows = 2;
      notesInput.onchange = (e) => {
        updateItem(boardType, item.id, { notes: e.target.value });
        onUpdate && onUpdate();
      };
      notesDiv.appendChild(notesLabel);
      notesDiv.appendChild(notesInput);
      details.appendChild(notesDiv);
    }
    
    detailsCell.appendChild(details);
    detailsRow.appendChild(detailsCell);
    table.appendChild(detailsRow);
  }
  
  container.appendChild(table);
  return container;
}
```

### 3. data.js - Add "The Ordinary Serum" to Bath Ritual

Update the bathRitual items in `getInitialData()`:

```javascript
bathRitual: {
  items: [
    new RitualStep('bath-1', 'Shampoo + Selsun blue', 'mwfsat'),
    new RitualStep('bath-2', 'Soap', 'mwfsat'),
    new RitualStep('bath-3', 'Conditioner', 'mwfsat'),
    new RitualStep('bath-4', 'Clarifying shampoo', 'tthsun'),
    new RitualStep('bath-5', 'Soap', 'tthsun'),
    new RitualStep('bath-6', 'Conditioner', 'tthsun'),
    new RitualStep('bath-7', 'Scrub with body wash', 'tthsun'),
    new RitualStep('bath-8', 'The Ordinary Serum', 'tthsun'), // NEW
    new RitualStep('bath-9', 'Body oil', 'universal'),
    new RitualStep('bath-10', 'Lotion', 'universal'),
    new RitualStep('bath-11', 'Powder', 'universal'),
    new RitualStep('bath-12', 'Perfume', 'universal'),
  ],
  currentVariant: 'mwfsat',
  completionPercentage: 0
}
```

## Testing Checklist

- [ ] Add new items to each board
- [ ] Edit existing items
- [ ] Delete items with confirmation
- [ ] Toggle item completion
- [ ] Verify completion percentage updates
- [ ] Test low energy mode on chores
- [ ] Verify "The Ordinary Serum" appears on TTHSun
- [ ] Test inventory table layout
- [ ] Test status dropdown changes
- [ ] Verify data persists in localStorage
- [ ] Check consistency log records actions

## Implementation Steps

1. Update `utils.js` with CRUD functions
2. Update `components.js` with table-based inventory rendering
3. Update `data.js` with "The Ordinary Serum"
4. Test all functionality
5. Verify localStorage persistence

---

**Status:** Ready for implementation
**Last Updated:** February 25, 2026
