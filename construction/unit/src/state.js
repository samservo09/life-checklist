// Reactive State Management for Life OS
// Handles state updates and triggers re-renders without page refresh

class StateManager {
  constructor() {
    // Initialize with data from getInitialData() - no API calls
    this.state = this.initializeState();
    this.listeners = [];
    this.isUpdating = false;
  }

  // Initialize state with hardcoded data
  initializeState() {
    // Check if data exists in localStorage
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored state:', e);
        return this.getDefaultState();
      }
    }
    
    // Use default state with 10 checklists
    const initialData = this.getDefaultState();
    this.saveState();
    return initialData;
  }

  // Get default state with 10 checklists
  getDefaultState() {
    return {
      boards: {
        chores: {
          items: [
            { id: 1, text: "Meal prep baon", done: false, type: "daily" },
            { id: 2, text: "Dishes", done: false, type: "daily" },
            { id: 3, text: "Wipe desk", done: false, type: "low-energy" }
          ]
        },
        gym: {
          items: [
            { id: 1, text: "Water bottle", done: false },
            { id: 2, text: "Gym ID", done: false }
          ]
        },
        selfCare: {
          items: [
            { id: 1, text: "Morning skincare", done: false },
            { id: 2, text: "Evening routine", done: false }
          ]
        },
        bathRitual: {
          items: [
            { id: 1, text: "Bath prep", done: false }
          ]
        },
        fridge: {
          items: [
            { id: 1, text: "Check expiry dates", done: false }
          ]
        },
        nonFood: {
          items: [
            { id: 1, text: "Organize supplies", done: false }
          ]
        },
        bathroomClean: {
          items: [
            { id: 1, text: "Clean mirror", done: false }
          ]
        },
        pantry: {
          items: [
            { id: 1, text: "Stock check", done: false }
          ]
        },
        rto: {
          items: [
            { id: 1, text: "Prepare for RTO", done: false }
          ]
        },
        firstAid: {
          items: [
            { id: 1, text: "Check first aid kit", done: false }
          ]
        }
      },
      consistencyLog: []
    };
  }

  // Load state from localStorage
  loadState() {
    const data = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Error parsing state:', e);
        return this.getDefaultState();
      }
    }
    return this.getDefaultState();
  }

  // Save state to localStorage
  saveState() {
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(this.state));
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state change
  notifyListeners(boardType, action) {
    this.listeners.forEach(listener => {
      try {
        listener(boardType, action);
      } catch (e) {
        console.error('Error in state listener:', e);
      }
    });
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Get specific board
  getBoard(boardType) {
    return this.state.boards[boardType];
  }

  // Get specific item
  getItem(boardType, itemId) {
    const board = this.getBoard(boardType);
    if (!board) return null;
    return board.items.find(i => i.id === itemId);
  }

  // Add item to board
  addItem(boardType, item) {
    const board = this.getBoard(boardType);
    if (!board) return null;

    // Generate ID if not provided
    if (!item.id) {
      item.id = `${boardType}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }

    board.items.push(item);
    this.updateCompletionPercentage(boardType);
    this.logAction(boardType, item.id, 'add', item.name, null, item);
    this.saveState();
    this.notifyListeners(boardType, 'add');

    return item;
  }

  // Update item in board
  updateItem(boardType, itemId, updates) {
    const item = this.getItem(boardType, itemId);
    if (!item) return null;

    const oldValues = { ...item };
    Object.assign(item, updates);

    this.updateCompletionPercentage(boardType);
    this.logAction(boardType, itemId, 'update', item.name, oldValues, item);
    this.saveState();
    this.notifyListeners(boardType, 'update');

    return item;
  }

  // Delete item from board
  deleteItem(boardType, itemId) {
    const board = this.getBoard(boardType);
    if (!board) return false;

    const itemIndex = board.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = board.items[itemIndex];
    board.items.splice(itemIndex, 1);

    this.updateCompletionPercentage(boardType);
    this.logAction(boardType, itemId, 'delete', item.name, item, null);
    this.saveState();
    this.notifyListeners(boardType, 'delete');

    return true;
  }

  // Toggle item completion
  toggleItem(boardType, itemId) {
    const item = this.getItem(boardType, itemId);
    if (!item) return null;

    const oldCompleted = item.completed;
    item.completed = !item.completed;
    item.completedAt = item.completed ? new Date().toISOString() : null;

    this.updateCompletionPercentage(boardType);
    this.logAction(
      boardType,
      itemId,
      item.completed ? 'complete' : 'uncomplete',
      item.name,
      { completed: oldCompleted },
      { completed: item.completed }
    );
    this.saveState();
    this.notifyListeners(boardType, 'toggle');

    return item;
  }

  // Update completion percentage for board
  updateCompletionPercentage(boardType) {
    const board = this.getBoard(boardType);
    if (!board || !board.items) return;

    const now = new Date();
    const items = board.items;

    // For chores, calculate based on daily items only
    if (boardType === CONFIG.BOARDS.CHORES) {
      const dailyItems = items.filter(i => i.category === 'daily');
      if (dailyItems.length === 0) {
        board.completionPercentage = 0;
        return;
      }

      const completedDaily = dailyItems.filter(i => {
        if (!i.completedAt) return false;
        const completedDate = new Date(i.completedAt);
        const daysDiff = Math.floor((now - completedDate) / (1000 * 60 * 60 * 24));
        return daysDiff === 0; // Completed today
      }).length;

      board.completionPercentage = Math.round((completedDaily / dailyItems.length) * 100);
    } else {
      // For other boards, simple percentage
      const completed = items.filter(i => i.completed).length;
      board.completionPercentage = items.length === 0 ? 0 : Math.round((completed / items.length) * 100);
    }
  }

  // Toggle low energy mode
  toggleLowEnergyMode(enabled) {
    const board = this.getBoard(CONFIG.BOARDS.CHORES);
    if (!board) return;

    board.lowEnergyMode = enabled;
    this.logAction(CONFIG.BOARDS.CHORES, 'low-energy-mode', 'toggle', 'Low Energy Mode', { enabled: !enabled }, { enabled });
    this.saveState();
    this.notifyListeners(CONFIG.BOARDS.CHORES, 'low-energy-toggle');
  }

  // Get low energy items
  getLowEnergyItems() {
    const board = this.getBoard(CONFIG.BOARDS.CHORES);
    if (!board) return [];
    return board.items.filter(item => CONFIG.LOW_ENERGY_FALLBACK_IDS.includes(item.id));
  }

  // Log action to consistency log
  logAction(boardType, itemId, action, itemName, previousState, newState) {
    this.state.consistencyLog.push({
      timestamp: new Date().toISOString(),
      boardType: boardType,
      itemId: itemId,
      action: action,
      itemName: itemName,
      previousState: previousState,
      newState: newState
    });

    // Keep only last 1000 logs
    if (this.state.consistencyLog.length > 1000) {
      this.state.consistencyLog = this.state.consistencyLog.slice(-1000);
    }
  }

  // Export data
  exportData() {
    return JSON.stringify(this.state, null, 2);
  }

  // Import data
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.state = data;
      this.saveState();
      this.notifyListeners(null, 'import');
      return true;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  }

  // Clear all data
  clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY);
      this.state = this.getDefaultState();
      this.notifyListeners(null, 'clear');
      return true;
    }
    return false;
  }

  // Reset board
  resetBoard(boardType) {
    const board = this.getBoard(boardType);
    if (!board) return;

    board.items.forEach(item => {
      item.completed = false;
      item.completedAt = null;
    });

    this.updateCompletionPercentage(boardType);
    this.logAction(boardType, 'board', 'reset', `${boardType} reset`, null, null);
    this.saveState();
    this.notifyListeners(boardType, 'reset');
  }
}

// Create global state manager instance - Initialize immediately with mock data
const stateManager = new StateManager();

// Log initialization
console.log('✅ StateManager initialized with', Object.keys(stateManager.getState().boards).length, 'boards');
console.log('📊 Total items:', Object.values(stateManager.getState().boards).reduce((sum, board) => sum + board.items.length, 0));
