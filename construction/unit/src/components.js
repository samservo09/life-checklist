// Reusable Components

// Header Component
function renderHeader(area) {
  const header = createElement('div', 'sticky top-0 z-50 glassmorphic mb-4 p-4 flex items-center justify-between');
  
  const titleContainer = createElement('div', 'flex items-center gap-3 flex-1');
  const title = createElement('h1', 'text-xl font-bold text-white');
  title.textContent = getAreaTitle(area);
  titleContainer.appendChild(title);
  
  const homeBtn = createElement('button', 'glass-button');
  homeBtn.textContent = '🏠 Home';
  homeBtn.onclick = () => navigateToArea('home');
  
  header.appendChild(titleContainer);
  header.appendChild(homeBtn);
  
  return header;
}

// Navigation Component
function renderNavigation() {
  const nav = createElement('div', 'glassmorphic p-4 mb-4');
  const title = createElement('h2', 'text-lg font-bold mb-3 text-primary-pink');
  title.textContent = 'Quick Navigation';
  nav.appendChild(title);
  
  const grid = createElement('div', 'grid grid-cols-2 gap-2');
  
  const areas = [
    { id: 'chores', label: '🧹 Chores', emoji: '🧹' },
    { id: 'self-care', label: '💆 Self-Care', emoji: '💆' },
    { id: 'bath-ritual', label: '🛁 Bath', emoji: '🛁' },
    { id: 'fridge', label: '🧊 Fridge', emoji: '🧊' },
    { id: 'non-food', label: '📦 Non-Food', emoji: '📦' },
    { id: 'bathroom-clean', label: '🚿 Bathroom', emoji: '🚿' },
    { id: 'pantry', label: '🥫 Pantry', emoji: '🥫' },
    { id: 'gym', label: '💪 Gym', emoji: '💪' },
    { id: 'rto', label: '🏢 RTO', emoji: '🏢' },
    { id: 'first-aid', label: '🏥 First-Aid', emoji: '🏥' }
  ];
  
  areas.forEach(area => {
    const btn = createElement('button', 'glass-button text-sm py-2');
    btn.textContent = area.label;
    btn.onclick = () => navigateToArea(area.id);
    grid.appendChild(btn);
  });
  
  nav.appendChild(grid);
  return nav;
}

// Checklist Item Component
function renderChecklistItem(item, boardType, onToggle, onEdit, onDelete) {
  const container = createElement('div', 'glass-card flex items-start gap-3 animate-slide-in');
  
  const checkbox = createElement('input', 'mt-1 flex-shrink-0');
  checkbox.type = 'checkbox';
  checkbox.checked = item.completed;
  checkbox.onchange = () => {
    stateManager.toggleItem(boardType, item.id);
    onToggle && onToggle();
  };
  
  const content = createElement('div', 'flex-1 min-w-0');
  
  const name = createElement('div', item.completed ? 'font-medium line-through text-gray-400' : 'font-medium text-white');
  name.textContent = item.name;
  content.appendChild(name);
  
  if (item.notes) {
    const notes = createElement('div', 'text-sm text-gray-400 mt-1');
    notes.textContent = `📝 ${item.notes}`;
    content.appendChild(notes);
  }
  
  if (item.completedAt) {
    const time = createElement('div', 'text-xs text-gray-500 mt-1');
    time.textContent = `✓ ${formatTime(item.completedAt)}`;
    content.appendChild(time);
  }
  
  const actions = createElement('div', 'flex gap-2 flex-shrink-0');
  
  const editBtn = createElement('button', 'text-sm px-2 py-1 rounded hover:bg-white/10 transition');
  editBtn.textContent = '✏️';
  editBtn.onclick = () => onEdit && onEdit(item);
  actions.appendChild(editBtn);
  
  const deleteBtn = createElement('button', 'text-sm px-2 py-1 rounded hover:bg-red-500/20 transition');
  deleteBtn.textContent = '🗑️';
  deleteBtn.onclick = () => {
    if (confirm('Delete this item?')) {
      stateManager.deleteItem(boardType, item.id);
      onDelete && onDelete();
    }
  };
  actions.appendChild(deleteBtn);
  
  container.appendChild(checkbox);
  container.appendChild(content);
  container.appendChild(actions);
  
  return container;
}

// Inventory Item Component (Table Row Format)
function renderInventoryItem(item, boardType, onUpdate) {
  const row = createElement('tr', 'border-b border-white/10 hover:bg-white/5 transition');
  
  // Item Name
  const nameCell = createElement('td', 'p-3 font-medium text-white');
  nameCell.textContent = item.name;
  row.appendChild(nameCell);
  
  // Status Dropdown
  const statusCell = createElement('td', 'p-3');
  const statusSelect = createElement('select', 'px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs');
  statusSelect.value = item.status || 'half';
  statusSelect.onchange = (e) => {
    stateManager.updateItem(boardType, item.id, { status: e.target.value });
    onUpdate && onUpdate();
  };
  
  CONFIG.INVENTORY_STATUS.forEach(status => {
    const option = createElement('option');
    option.value = status;
    option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    statusSelect.appendChild(option);
  });
  
  statusCell.appendChild(statusSelect);
  row.appendChild(statusCell);
  
  // Quantity
  const qtyCell = createElement('td', 'p-3');
  const qtyInput = createElement('input', 'w-16 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs');
  qtyInput.type = 'number';
  qtyInput.value = item.quantity || 0;
  qtyInput.onchange = (e) => {
    stateManager.updateItem(boardType, item.id, { quantity: parseInt(e.target.value) || 0 });
    onUpdate && onUpdate();
  };
  qtyCell.appendChild(qtyInput);
  row.appendChild(qtyCell);
  
  // Expiry Date
  const expiryCell = createElement('td', 'p-3');
  const expiryInput = createElement('input', 'px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs');
  expiryInput.type = 'date';
  expiryInput.value = item.expiryDate || '';
  expiryInput.onchange = (e) => {
    stateManager.updateItem(boardType, item.id, { expiryDate: e.target.value });
    onUpdate && onUpdate();
  };
  expiryCell.appendChild(expiryInput);
  row.appendChild(expiryCell);
  
  // Notes
  const notesCell = createElement('td', 'p-3');
  const notesInput = createElement('input', 'w-32 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs');
  notesInput.type = 'text';
  notesInput.placeholder = 'Notes...';
  notesInput.value = item.notes || '';
  notesInput.onchange = (e) => {
    stateManager.updateItem(boardType, item.id, { notes: e.target.value });
    onUpdate && onUpdate();
  };
  notesCell.appendChild(notesInput);
  row.appendChild(notesCell);
  
  // Actions
  const actionsCell = createElement('td', 'p-3 text-right');
  const deleteBtn = createElement('button', 'text-sm px-2 py-1 rounded hover:bg-red-500/20 transition');
  deleteBtn.textContent = '🗑️';
  deleteBtn.onclick = () => {
    if (confirm('Delete this item?')) {
      stateManager.deleteItem(boardType, item.id);
      onUpdate && onUpdate();
    }
  };
  actionsCell.appendChild(deleteBtn);
  row.appendChild(actionsCell);
  
  return row;
}

// Inventory Table Component
function renderInventoryTable(boardType, items, onUpdate) {
  const container = createElement('div', 'glass-card animate-slide-in overflow-x-auto');
  
  const table = createElement('table', 'w-full text-sm');
  
  // Table Header
  const thead = createElement('thead', 'border-b-2 border-primary-pink');
  const headerRow = createElement('tr', 'bg-white/5');
  
  const headers = ['Item', 'Status', 'Qty', 'Expiry', 'Notes', 'Actions'];
  headers.forEach(header => {
    const th = createElement('th', 'p-3 text-left text-primary-pink font-bold');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Table Body
  const tbody = createElement('tbody');
  items.forEach(item => {
    tbody.appendChild(renderInventoryItem(item, boardType, onUpdate));
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  return container;
}

// Completion Percentage Component
function renderCompletionPercentage(percentage) {
  const container = createElement('div', 'glassmorphic p-4 mb-4');
  
  const label = createElement('div', 'text-sm text-gray-400 mb-2');
  label.textContent = 'Completion';
  container.appendChild(label);
  
  const bar = createElement('div', 'w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden');
  const fill = createElement('div', `h-full bg-primary-pink transition-all duration-300`);
  fill.style.width = `${percentage}%`;
  bar.appendChild(fill);
  container.appendChild(bar);
  
  const text = createElement('div', `text-lg font-bold ${getCompletionColor(percentage)}`);
  text.textContent = `${getCompletionEmoji(percentage)} ${percentage}%`;
  container.appendChild(text);
  
  return container;
}

// Low Energy Mode Toggle
function renderLowEnergyToggle(enabled, onToggle) {
  const container = createElement('div', 'glassmorphic p-4 mb-4 border-2 border-primary-pink');
  
  const label = createElement('label', 'flex items-center gap-3 cursor-pointer');
  
  const checkbox = createElement('input', '');
  checkbox.type = 'checkbox';
  checkbox.checked = enabled;
  checkbox.onchange = (e) => {
    stateManager.toggleLowEnergyMode(e.target.checked);
    onToggle && onToggle();
  };
  label.appendChild(checkbox);
  
  const text = createElement('div');
  const title = createElement('div', 'font-bold text-primary-pink');
  title.textContent = '⚡ Low Energy Mode';
  text.appendChild(title);
  
  const desc = createElement('div', 'text-xs text-gray-400');
  desc.textContent = 'Show only 4 essential tasks';
  text.appendChild(desc);
  
  label.appendChild(text);
  container.appendChild(label);
  
  return container;
}

// Bath Ritual Day Indicator
function renderBathRitualIndicator(variant) {
  const container = createElement('div', 'glassmorphic p-4 mb-4');
  
  const dayName = createElement('div', 'text-sm text-gray-400 mb-1');
  dayName.textContent = `Today: ${getDayName()}`;
  container.appendChild(dayName);
  
  const variantBadge = createElement('div', 'inline-block px-3 py-1 rounded-full bg-primary-pink/20 border border-primary-pink text-primary-pink text-sm font-medium');
  variantBadge.textContent = `${variant === 'mwfsat' ? '🧴' : '🧼'} ${getVariantLabel(variant)}`;
  container.appendChild(variantBadge);
  
  return container;
}

// Add Item Form
function renderAddItemForm(boardType, itemType = 'checklist', onAdd) {
  const container = createElement('div', 'glassmorphic p-4 mb-4');
  
  const title = createElement('h3', 'font-bold mb-3 text-primary-pink');
  title.textContent = '➕ Add New Item';
  container.appendChild(title);
  
  const form = createElement('div', 'space-y-2');
  
  const nameInput = createElement('input', 'w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-500');
  nameInput.type = 'text';
  nameInput.placeholder = 'Item name';
  form.appendChild(nameInput);
  
  let categoryInput = null;
  
  // Category selection for Self-Care
  if (boardType === CONFIG.BOARDS.SELF_CARE) {
    categoryInput = createElement('select', 'w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white');
    const morningOpt = createElement('option');
    morningOpt.value = CONFIG.SELF_CARE_CATEGORIES.MORNING;
    morningOpt.textContent = '🌅 Morning Routine';
    categoryInput.appendChild(morningOpt);
    
    const eveningOpt = createElement('option');
    eveningOpt.value = CONFIG.SELF_CARE_CATEGORIES.EVENING;
    eveningOpt.textContent = '🌙 Evening Routine';
    categoryInput.appendChild(eveningOpt);
    
    form.appendChild(categoryInput);
  }
  
  // Category selection for Bath Ritual
  if (boardType === CONFIG.BOARDS.BATH_RITUAL) {
    categoryInput = createElement('select', 'w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white');
    
    const mwfsatOpt = createElement('option');
    mwfsatOpt.value = CONFIG.BATH_VARIANTS.MWFSAT;
    mwfsatOpt.textContent = '🧴 Mon/Wed/Fri/Sat';
    categoryInput.appendChild(mwfsatOpt);
    
    const tthsunOpt = createElement('option');
    tthsunOpt.value = CONFIG.BATH_VARIANTS.TTHSUN;
    tthsunOpt.textContent = '🧼 Tue/Thu/Sun';
    categoryInput.appendChild(tthsunOpt);
    
    const universalOpt = createElement('option');
    universalOpt.value = CONFIG.BATH_VARIANTS.UNIVERSAL;
    universalOpt.textContent = '✨ Universal';
    categoryInput.appendChild(universalOpt);
    
    form.appendChild(categoryInput);
  }
  
  // Category input for Inventory
  if (itemType === CONFIG.ITEM_TYPES.INVENTORY) {
    const invCategoryInput = createElement('input', 'w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-500');
    invCategoryInput.type = 'text';
    invCategoryInput.placeholder = 'Category (optional)';
    form.appendChild(invCategoryInput);
    categoryInput = invCategoryInput;
  }
  
  const addBtn = createElement('button', 'glass-button w-full');
  addBtn.textContent = 'Add Item';
  addBtn.onclick = () => {
    const name = nameInput.value.trim();
    if (name) {
      let item;
      
      if (itemType === CONFIG.ITEM_TYPES.CHECKLIST) {
        const category = categoryInput ? categoryInput.value : 'daily';
        item = new ChecklistItem(null, name, category);
      } else if (itemType === CONFIG.ITEM_TYPES.INVENTORY) {
        const category = categoryInput ? categoryInput.value : '';
        item = new InventoryItem(null, name, category);
      } else if (itemType === CONFIG.ITEM_TYPES.RITUAL) {
        const daySchedule = categoryInput ? categoryInput.value : CONFIG.BATH_VARIANTS.UNIVERSAL;
        item = new RitualStep(null, name, daySchedule);
      }
      
      if (item) {
        stateManager.addItem(boardType, item);
        showNotification(`✅ Added: ${item.name}`);
        nameInput.value = '';
        if (categoryInput && categoryInput.tagName === 'INPUT') {
          categoryInput.value = '';
        }
        onAdd && onAdd();
      }
    }
  };
  form.appendChild(addBtn);
  
  container.appendChild(form);
  return container;
}

// Settings Panel
function renderSettingsPanel() {
  const container = createElement('div', 'glassmorphic p-4 mb-4');
  
  const title = createElement('h3', 'font-bold mb-3 text-primary-pink');
  title.textContent = '⚙️ Settings';
  container.appendChild(title);
  
  const buttons = createElement('div', 'space-y-2');
  
  // Export button
  const exportBtn = createElement('button', 'glass-button w-full text-left');
  exportBtn.textContent = '📥 Export Data';
  exportBtn.onclick = () => {
    const data = stateManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = createElement('a');
    a.href = url;
    a.download = `lifeOS_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported!');
  };
  buttons.appendChild(exportBtn);
  
  // Import button
  const importBtn = createElement('button', 'glass-button w-full text-left');
  importBtn.textContent = '📤 Import Data';
  importBtn.onclick = () => {
    const input = createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (stateManager.importData(event.target.result)) {
            showNotification('Data imported successfully!');
            location.reload();
          } else {
            showNotification('Failed to import data');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  buttons.appendChild(importBtn);
  
  // Reset button
  const resetBtn = createElement('button', 'glass-button w-full text-left hover:bg-red-500/20');
  resetBtn.textContent = '🔄 Reset All Data';
  resetBtn.onclick = () => {
    if (stateManager.clearAllData()) {
      location.reload();
    }
  };
  buttons.appendChild(resetBtn);
  
  // Storage info
  const storageInfo = createElement('div', 'text-xs text-gray-400 mt-3 p-2 bg-white/5 rounded');
  storageInfo.textContent = `Storage: ${getLocalStorageSize()}`;
  buttons.appendChild(storageInfo);
  
  container.appendChild(buttons);
  return container;
}

// Consistency Log Viewer
function renderConsistencyLog() {
  const data = stateManager.getState();
  const logs = data.consistencyLog.slice(-10).reverse();
  
  const container = createElement('div', 'glassmorphic p-4');
  
  const title = createElement('h3', 'font-bold mb-3 text-primary-pink');
  title.textContent = '📊 Recent Activity';
  container.appendChild(title);
  
  if (logs.length === 0) {
    const empty = createElement('div', 'text-gray-400 text-sm');
    empty.textContent = 'No activity yet';
    container.appendChild(empty);
  } else {
    const list = createElement('div', 'space-y-2');
    logs.forEach(log => {
      const item = createElement('div', 'text-xs text-gray-400 p-2 bg-white/5 rounded');
      item.textContent = `${formatTime(log.timestamp)} - ${log.action}: ${log.itemName}`;
      list.appendChild(item);
    });
    container.appendChild(list);
  }
  
  return container;
}
