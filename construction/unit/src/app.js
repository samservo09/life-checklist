// Main App Logic

// Home/Dashboard View
function renderHome() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-2xl mx-auto p-4');
  
  container.appendChild(renderHeader('home'));
  
  // Welcome section
  const welcome = createElement('div', 'glassmorphic p-6 mb-4 text-center');
  const greeting = createElement('h2', 'text-3xl font-bold mb-2 text-primary-pink');
  greeting.textContent = '👋 Welcome to Life OS';
  welcome.appendChild(greeting);
  
  const subtitle = createElement('p', 'text-gray-300');
  subtitle.textContent = 'Your personal life management system';
  welcome.appendChild(subtitle);
  
  container.appendChild(welcome);
  
  // Quick stats
  const state = stateManager.getState();
  const stats = createElement('div', 'glassmorphic p-4 mb-4');
  const statsTitle = createElement('h3', 'font-bold mb-3 text-primary-pink');
  statsTitle.textContent = '📊 Quick Stats';
  stats.appendChild(statsTitle);
  
  const statsGrid = createElement('div', 'grid grid-cols-2 gap-2');
  
  let totalCompletion = 0;
  let boardCount = 0;
  for (const [boardType, board] of Object.entries(state.boards)) {
    totalCompletion += board.completionPercentage;
    boardCount++;
  }
  const avgCompletion = Math.round(totalCompletion / boardCount);
  
  const stat1 = createElement('div', 'p-2 bg-white/5 rounded');
  stat1.innerHTML = `<div class="text-2xl font-bold text-primary-pink">${avgCompletion}%</div><div class="text-xs text-gray-400">Avg Completion</div>`;
  statsGrid.appendChild(stat1);
  
  const stat2 = createElement('div', 'p-2 bg-white/5 rounded');
  stat2.innerHTML = `<div class="text-2xl font-bold text-primary-pink">${state.consistencyLog.length}</div><div class="text-xs text-gray-400">Total Actions</div>`;
  statsGrid.appendChild(stat2);
  
  stats.appendChild(statsGrid);
  container.appendChild(stats);
  
  // Navigation
  container.appendChild(renderNavigation());
  
  // Settings
  container.appendChild(renderSettingsPanel());
  
  // Recent activity
  container.appendChild(renderConsistencyLog());
  
  app.appendChild(container);
}

// Chores Board
function renderChoresBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-2xl mx-auto p-4');
  container.appendChild(renderHeader('chores'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.CHORES);
  
  // Low energy toggle
  container.appendChild(renderLowEnergyToggle(board.lowEnergyMode, () => renderChoresBoard()));
  
  // Completion percentage
  container.appendChild(renderCompletionPercentage(board.completionPercentage));
  
  // Add item form
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.CHORES, CONFIG.ITEM_TYPES.CHECKLIST, () => renderChoresBoard()));
  
  // Items list
  const itemsContainer = createElement('div');
  
  let items = board.items;
  if (board.lowEnergyMode) {
    items = stateManager.getLowEnergyItems();
  }
  
  // Group by frequency
  const frequencyOrder = ['daily', 'weekly', 'biweekly', 'monthly'];
  const grouped = {};
  
  frequencyOrder.forEach(freq => {
    grouped[freq] = [];
  });
  
  items.forEach(item => {
    const freq = item.frequency || 'daily';
    if (!grouped[freq]) grouped[freq] = [];
    grouped[freq].push(item);
  });
  
  // Render grouped items with frequency headers
  const frequencyEmojis = {
    'daily': '📅',
    'weekly': '📆',
    'biweekly': '📊',
    'monthly': '📈'
  };
  
  const frequencyLabels = {
    'daily': 'Daily',
    'weekly': 'Weekly',
    'biweekly': 'Bi-weekly',
    'monthly': 'Monthly'
  };
  
  frequencyOrder.forEach(frequency => {
    const frequencyItems = grouped[frequency];
    
    const frequencyTitle = createElement('h3', 'font-bold text-primary-pink mt-4 mb-2 text-sm uppercase');
    frequencyTitle.textContent = `${frequencyEmojis[frequency]} ${frequencyLabels[frequency]}`;
    itemsContainer.appendChild(frequencyTitle);
    
    if (frequencyItems.length === 0) {
      const empty = createElement('div', 'text-gray-400 text-sm italic');
      empty.textContent = 'No items';
      itemsContainer.appendChild(empty);
    } else {
      frequencyItems.forEach(item => {
        itemsContainer.appendChild(renderChecklistItem(item, CONFIG.BOARDS.CHORES, () => renderChoresBoard()));
      });
    }
  });
  
  container.appendChild(itemsContainer);
  app.appendChild(container);
}

// Self-Care Board
function renderSelfCareBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-2xl mx-auto p-4');
  container.appendChild(renderHeader('self-care'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.SELF_CARE);
  
  container.appendChild(renderCompletionPercentage(board.completionPercentage));
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.SELF_CARE, CONFIG.ITEM_TYPES.CHECKLIST, () => renderSelfCareBoard()));
  
  const itemsContainer = createElement('div');
  
  // Morning routine
  const morningTitle = createElement('h3', 'font-bold text-primary-pink mt-4 mb-2 text-sm uppercase');
  morningTitle.textContent = '🌅 Morning Routine';
  itemsContainer.appendChild(morningTitle);
  
  board.items.filter(i => i.category === CONFIG.SELF_CARE_CATEGORIES.MORNING).forEach(item => {
    itemsContainer.appendChild(renderChecklistItem(item, CONFIG.BOARDS.SELF_CARE, () => renderSelfCareBoard()));
  });
  
  // Evening routine
  const eveningTitle = createElement('h3', 'font-bold text-primary-pink mt-4 mb-2 text-sm uppercase');
  eveningTitle.textContent = '🌙 Evening Routine';
  itemsContainer.appendChild(eveningTitle);
  
  board.items.filter(i => i.category === CONFIG.SELF_CARE_CATEGORIES.EVENING).forEach(item => {
    itemsContainer.appendChild(renderChecklistItem(item, CONFIG.BOARDS.SELF_CARE, () => renderSelfCareBoard()));
  });
  
  container.appendChild(itemsContainer);
  app.appendChild(container);
}

// Bath Ritual Board
function renderBathRitualBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-2xl mx-auto p-4');
  container.appendChild(renderHeader('bath-ritual'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.BATH_RITUAL);
  const variant = getDayVariant();
  
  // Update variant in data if it changed
  if (board.currentVariant !== variant) {
    board.currentVariant = variant;
    board.items.forEach(item => item.completed = false);
    stateManager.updateCompletionPercentage(CONFIG.BOARDS.BATH_RITUAL);
    stateManager.saveState();
  }
  
  container.appendChild(renderBathRitualIndicator(variant));
  container.appendChild(renderCompletionPercentage(board.completionPercentage));
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.BATH_RITUAL, CONFIG.ITEM_TYPES.RITUAL, () => renderBathRitualBoard()));
  
  const itemsContainer = createElement('div');
  
  // Variant-specific steps
  const variantTitle = createElement('h3', 'font-bold text-primary-pink mt-4 mb-2 text-sm uppercase');
  variantTitle.textContent = `${variant === CONFIG.BATH_VARIANTS.MWFSAT ? '🧴 Shampoo Days' : '🧼 Clarifying Days'}`;
  itemsContainer.appendChild(variantTitle);
  
  board.items.filter(i => i.daySchedule === variant).forEach(item => {
    itemsContainer.appendChild(renderChecklistItem(item, CONFIG.BOARDS.BATH_RITUAL, () => renderBathRitualBoard()));
  });
  
  // Universal steps
  const universalTitle = createElement('h3', 'font-bold text-primary-pink mt-4 mb-2 text-sm uppercase');
  universalTitle.textContent = '✨ Universal Steps';
  itemsContainer.appendChild(universalTitle);
  
  board.items.filter(i => i.daySchedule === CONFIG.BATH_VARIANTS.UNIVERSAL).forEach(item => {
    itemsContainer.appendChild(renderChecklistItem(item, CONFIG.BOARDS.BATH_RITUAL, () => renderBathRitualBoard()));
  });
  
  container.appendChild(itemsContainer);
  app.appendChild(container);
}

// Fridge Board
function renderFridgeBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-4xl mx-auto p-4');
  container.appendChild(renderHeader('fridge'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.FRIDGE);
  
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.FRIDGE, CONFIG.ITEM_TYPES.INVENTORY, () => renderFridgeBoard()));
  
  if (board.items.length > 0) {
    container.appendChild(renderInventoryTable(CONFIG.BOARDS.FRIDGE, board.items, () => renderFridgeBoard()));
  } else {
    const empty = createElement('div', 'glassmorphic p-4 text-center text-gray-400');
    empty.textContent = 'No items yet. Add one to get started!';
    container.appendChild(empty);
  }
  
  app.appendChild(container);
}

// Non-Food Board
function renderNonFoodBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-4xl mx-auto p-4');
  container.appendChild(renderHeader('non-food'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.NON_FOOD);
  
  const note = createElement('div', 'glassmorphic p-3 mb-4 text-sm text-gray-300');
  note.textContent = '📋 Check every 2 weeks';
  container.appendChild(note);
  
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.NON_FOOD, CONFIG.ITEM_TYPES.INVENTORY, () => renderNonFoodBoard()));
  
  if (board.items.length > 0) {
    container.appendChild(renderInventoryTable(CONFIG.BOARDS.NON_FOOD, board.items, () => renderNonFoodBoard()));
  } else {
    const empty = createElement('div', 'glassmorphic p-4 text-center text-gray-400');
    empty.textContent = 'No items yet. Add one to get started!';
    container.appendChild(empty);
  }
  
  app.appendChild(container);
}

// Pantry Board
function renderPantryBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-4xl mx-auto p-4');
  container.appendChild(renderHeader('pantry'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.PANTRY);
  
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.PANTRY, CONFIG.ITEM_TYPES.INVENTORY, () => renderPantryBoard()));
  
  if (board.items.length > 0) {
    container.appendChild(renderInventoryTable(CONFIG.BOARDS.PANTRY, board.items, () => renderPantryBoard()));
  } else {
    const empty = createElement('div', 'glassmorphic p-4 text-center text-gray-400');
    empty.textContent = 'No items yet. Add one to get started!';
    container.appendChild(empty);
  }
  
  app.appendChild(container);
}

// First-Aid Board
function renderFirstAidBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-4xl mx-auto p-4');
  container.appendChild(renderHeader('first-aid'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.FIRST_AID);
  
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.FIRST_AID, CONFIG.ITEM_TYPES.INVENTORY, () => renderFirstAidBoard()));
  
  if (board.items.length > 0) {
    container.appendChild(renderInventoryTable(CONFIG.BOARDS.FIRST_AID, board.items, () => renderFirstAidBoard()));
  } else {
    const empty = createElement('div', 'glassmorphic p-4 text-center text-gray-400');
    empty.textContent = 'No items yet. Add one to get started!';
    container.appendChild(empty);
  }
  
  app.appendChild(container);
}

// Gym Board
function renderGymBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-2xl mx-auto p-4');
  container.appendChild(renderHeader('gym'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.GYM);
  
  container.appendChild(renderCompletionPercentage(board.completionPercentage));
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.GYM, CONFIG.ITEM_TYPES.CHECKLIST, () => renderGymBoard()));
  
  const itemsContainer = createElement('div');
  
  board.items.forEach(item => {
    itemsContainer.appendChild(renderChecklistItem(item, CONFIG.BOARDS.GYM, () => renderGymBoard()));
  });
  
  container.appendChild(itemsContainer);
  app.appendChild(container);
}

// RTO (Return to Office) Board
function renderRTOBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-2xl mx-auto p-4');
  container.appendChild(renderHeader('rto'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.RTO);
  
  container.appendChild(renderCompletionPercentage(board.completionPercentage));
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.RTO, CONFIG.ITEM_TYPES.CHECKLIST, () => renderRTOBoard()));
  
  const itemsContainer = createElement('div');
  
  board.items.forEach(item => {
    itemsContainer.appendChild(renderChecklistItem(item, CONFIG.BOARDS.RTO, () => renderRTOBoard()));
  });
  
  container.appendChild(itemsContainer);
  app.appendChild(container);
}

// Bathroom Clean Board
function renderBathroomCleanBoard() {
  const app = document.getElementById('app');
  clearElement(app);
  
  const container = createElement('div', 'max-w-2xl mx-auto p-4');
  container.appendChild(renderHeader('bathroom-clean'));
  
  const board = stateManager.getBoard(CONFIG.BOARDS.BATHROOM_CLEAN);
  
  container.appendChild(renderCompletionPercentage(board.completionPercentage));
  container.appendChild(renderAddItemForm(CONFIG.BOARDS.BATHROOM_CLEAN, CONFIG.ITEM_TYPES.CHECKLIST, () => renderBathroomCleanBoard()));
  
  const itemsContainer = createElement('div');
  
  board.items.forEach(item => {
    itemsContainer.appendChild(renderChecklistItem(item, CONFIG.BOARDS.BATHROOM_CLEAN, () => renderBathroomCleanBoard()));
  });
  
  container.appendChild(itemsContainer);
  app.appendChild(container);
}

// Main Router
function router() {
  const area = getAreaFromURL();
  
  switch(area) {
    case 'chores':
      renderChoresBoard();
      break;
    case 'self-care':
      renderSelfCareBoard();
      break;
    case 'bath-ritual':
      renderBathRitualBoard();
      break;
    case 'fridge':
      renderFridgeBoard();
      break;
    case 'non-food':
      renderNonFoodBoard();
      break;
    case 'bathroom-clean':
      renderBathroomCleanBoard();
      break;
    case 'pantry':
      renderPantryBoard();
      break;
    case 'gym':
      renderGymBoard();
      break;
    case 'rto':
      renderRTOBoard();
      break;
    case 'first-aid':
      renderFirstAidBoard();
      break;
    default:
      renderHome();
  }
}

// Initialize Google Sheets integration with OAuth 2.0
async function initializeGoogleSheets() {
  if (!CONFIG.USE_GOOGLE_SHEETS) {
    console.log('ℹ️ Using Local Mode (localStorage) - Google Sheets integration disabled');
    return;
  }

  try {
    console.log('✓ Google Sheets integration enabled - backend uses service account authentication');
    
    // No OAuth initialization needed - the backend handles all authentication
    // with a service account (GOOGLE_SERVICE_ACCOUNT_KEY).
    // The frontend only calls /api/sheets endpoints.

    // Start auto-sync timer
    stateManager.startAutoSync(CONFIG.AUTO_SYNC_INTERVAL);
    console.log('Auto-sync started with interval:', CONFIG.AUTO_SYNC_INTERVAL, 'ms');

  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error);
  }
}

// Handle connection restoration
function setupConnectionHandlers() {
  // Listen for online event
  window.addEventListener('online', async () => {
    console.log('✓ Connection restored');
    
    // Process offline queue when connection is restored
    if (typeof apiService !== 'undefined' && apiService.offlineQueue) {
      try {
        const result = await apiService.processOfflineQueue(stateManager);
        console.log('Offline queue processed:', result);
        
        // Refresh UI to show synced items
        router();
      } catch (error) {
        console.error('Error processing offline queue:', error);
      }
    }
  });
  
  // Listen for offline event
  window.addEventListener('offline', () => {
    console.log('⚠️ Connection lost - offline mode enabled');
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize state manager first
  stateManager.loadState();
  
  // Setup connection handlers for offline resilience
  setupConnectionHandlers();
  
  // Initialize Google Sheets if enabled
  await initializeGoogleSheets();
  
  // Schedule daily reset at 12 AM Singapore time
  const resetTimeoutId = scheduleDailyResetAtMidnightSingapore(stateManager);
  
  // Store timeout ID globally for cleanup if needed
  if (typeof window !== 'undefined') {
    window.resetTimeoutId = resetTimeoutId;
  }
  
  // Render initial view
  router();
  
  // Listen for URL changes
  window.addEventListener('popstate', router);
  
  // Handle manual URL changes
  const originalPushState = window.history.pushState;
  window.history.pushState = function(...args) {
    originalPushState.apply(window.history, args);
    router();
  };
});
