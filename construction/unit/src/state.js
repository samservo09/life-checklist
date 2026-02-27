// Reactive State Management for Life OS
// Handles state updates and triggers re-renders without page refresh

class StateManager {
  constructor() {
    // Initialize with data from getInitialData() - no API calls
    this.state = this.initializeState();
    this.listeners = [];
    this.isUpdating = false;
    this.autoSyncTimer = null;
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
            { id: 1, text: "Meal prep baon", done: false, name: "Meal prep baon", category: "daily", frequency: "daily", completed: false },
            { id: 2, text: "Dishes", done: false, name: "Dishes", category: "daily", frequency: "daily", completed: false },
            { id: 3, text: "Wipe desk", done: false, name: "Wipe desk", category: "daily", frequency: "daily", completed: false },
            { id: 4, text: "Floor sweep", done: false, name: "Floor sweep", category: "daily", frequency: "daily", completed: false },
            { id: 5, text: "Clean toilet", done: false, name: "Clean toilet", category: "weekly", frequency: "weekly", completed: false },
            { id: 6, text: "Mop floor", done: false, name: "Mop floor", category: "weekly", frequency: "weekly", completed: false },
            { id: 7, text: "Laundry", done: false, name: "Laundry", category: "biweekly", frequency: "biweekly", completed: false },
            { id: 8, text: "Check pantry stock", done: false, name: "Check pantry stock", category: "biweekly", frequency: "biweekly", completed: false },
            { id: 9, text: "Deep clean fridge", done: false, name: "Deep clean fridge", category: "monthly", frequency: "monthly", completed: false },
            { id: 10, text: "Declutter", done: false, name: "Declutter", category: "monthly", frequency: "monthly", completed: false }
          ],
          lowEnergyMode: false,
          completionPercentage: 0
        },
        gym: {
          items: [
            { id: 1, text: "Water bottle", done: false, name: "Water bottle", completed: false },
            { id: 2, text: "Gym ID", done: false, name: "Gym ID", completed: false }
          ],
          completionPercentage: 0
        },
        selfCare: {
          items: [
            { id: 1, text: "Morning skincare", done: false, name: "Morning skincare", category: "morning", completed: false },
            { id: 2, text: "Evening routine", done: false, name: "Evening routine", category: "evening", completed: false }
          ],
          completionPercentage: 0
        },
        bathRitual: {
          items: [
            { id: 1, text: "Bath prep", done: false, name: "Bath prep", daySchedule: "universal", completed: false }
          ],
          completionPercentage: 0
        },
        fridge: {
          items: [
            { id: 1, text: "Check expiry dates", done: false, name: "Check expiry dates", status: "half", completed: false }
          ],
          completionPercentage: 0
        },
        nonFood: {
          items: [
            { id: 1, text: "Organize supplies", done: false, name: "Organize supplies", status: "half", completed: false }
          ],
          completionPercentage: 0
        },
        bathroomClean: {
          items: [
            { id: 1, text: "Clean mirror", done: false, name: "Clean mirror", completed: false }
          ],
          completionPercentage: 0
        },
        pantry: {
          items: [
            { id: 1, text: "Stock check", done: false, name: "Stock check", status: "half", completed: false }
          ],
          completionPercentage: 0
        },
        rto: {
          items: [
            { id: 1, text: "Prepare for RTO", done: false, name: "Prepare for RTO", completed: false }
          ],
          completionPercentage: 0
        },
        firstAid: {
          items: [
            { id: 1, text: "Check first aid kit", done: false, name: "Check first aid kit", status: "half", completed: false }
          ],
          completionPercentage: 0
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

  // Add item with cloud sync (optimistic update pattern)
  addItemWithCloudSync(boardType, item) {
    // 1. Add item to local state immediately (optimistic update)
    const addedItem = this.addItem(boardType, item);

    // 2. Add sync status tracking
    addedItem.syncStatus = 'pending';
    this.saveState();
    this.notifyListeners(boardType, 'add');

    // 3. Trigger cloud sync in background (non-blocking)
    this.syncItemToCloud(boardType, addedItem).catch(error => {
      console.error('Background sync failed for item:', addedItem.id, error);
      // Error is already handled in syncItemToCloud
    });

    return addedItem;
  }

  // Update item with cloud sync (optimistic update pattern)
  updateItemWithCloudSync(boardType, itemId, updates) {
    // 1. Update item in local state immediately (optimistic update)
    const updatedItem = this.updateItem(boardType, itemId, updates);
    if (!updatedItem) return null;

    // 2. Add sync status tracking
    updatedItem.syncStatus = 'pending';
    this.saveState();
    this.notifyListeners(boardType, 'update');

    // 3. Trigger cloud sync in background (non-blocking)
    this.syncItemUpdateToCloud(boardType, updatedItem).catch(error => {
      console.error('Background sync failed for item update:', updatedItem.id, error);
      // Error is already handled in syncItemUpdateToCloud
    });

    return updatedItem;
  }

  // Delete item with cloud sync (optimistic update pattern)
  deleteItemWithCloudSync(boardType, itemId) {
    // 1. Delete item from local state immediately (optimistic update)
    const item = this.getItem(boardType, itemId);
    if (!item) return false;

    const deleted = this.deleteItem(boardType, itemId);
    if (!deleted) return false;

    // 2. Trigger cloud sync in background (non-blocking)
    this.syncItemDeleteToCloud(boardType, item).catch(error => {
      console.error('Background sync failed for item delete:', item.id, error);
      // Error is already handled in syncItemDeleteToCloud
    });

    return true;
  }

  // Sync item to cloud in background
  async syncItemToCloud(boardType, item) {
    try {
      // Call API to append item to Google Sheets
      await apiService.appendItem(boardType, item);

      // Update sync status to synced
      const updatedItem = this.getItem(boardType, item.id);
      if (updatedItem) {
        updatedItem.syncStatus = 'synced';
        updatedItem.syncedAt = new Date().toISOString();
        this.saveState();
        this.notifyListeners(boardType, 'sync-complete');
      }
    } catch (error) {
      // Update sync status to failed
      const failedItem = this.getItem(boardType, item.id);
      if (failedItem) {
        failedItem.syncStatus = 'failed';
        failedItem.syncError = error.message;
        this.saveState();
        this.notifyListeners(boardType, 'sync-failed');
      }
      throw error;
    }
  }

  // Sync item update to cloud in background
  async syncItemUpdateToCloud(boardType, item) {
    try {
      // Call API to update item in Google Sheets
      await apiService.updateItemInSheet(boardType, item.id, item);

      // Update sync status to synced
      const updatedItem = this.getItem(boardType, item.id);
      if (updatedItem) {
        updatedItem.syncStatus = 'synced';
        updatedItem.syncedAt = new Date().toISOString();
        this.saveState();
        this.notifyListeners(boardType, 'sync-complete');
      }
    } catch (error) {
      // Update sync status to failed
      const failedItem = this.getItem(boardType, item.id);
      if (failedItem) {
        failedItem.syncStatus = 'failed';
        failedItem.syncError = error.message;
        this.saveState();
        this.notifyListeners(boardType, 'sync-failed');
      }
      throw error;
    }
  }

  // Sync item delete to cloud in background
  async syncItemDeleteToCloud(boardType, item) {
    try {
      // Call API to delete item from Google Sheets
      await apiService.deleteItemFromSheet(boardType, item.id);

      // Sync complete - item is already deleted from local state
      this.notifyListeners(boardType, 'sync-complete');
    } catch (error) {
      // Log error but don't update item since it's already deleted
      console.error('Failed to sync item delete to cloud:', error);
      this.notifyListeners(boardType, 'sync-failed');
      throw error;
    }
  }

  // Load items from Google Sheets for a specific board
  async loadFromGoogleSheets(boardType) {
    try {
      // Fetch items from Google Sheets API
      const cloudItems = await apiService.fetchBoardFromSheet(boardType);

      // Validate response is an array
      if (!Array.isArray(cloudItems)) {
        console.warn(`Invalid response from Google Sheets for ${boardType}: expected array, got ${typeof cloudItems}`);
        return [];
      }

      console.log(`✓ Loaded ${cloudItems.length} items from Google Sheets for ${boardType}`);
      return cloudItems;
    } catch (error) {
      console.error(`Failed to load items from Google Sheets for ${boardType}:`, error);
      // Return empty array on failure to allow app to continue with local data
      return [];
    }
  }

  // Merge cloud items with local items
  mergeCloudItems(boardType, cloudItems) {
    const board = this.getBoard(boardType);
    if (!board) return [];

    // Validate cloudItems is an array
    if (!Array.isArray(cloudItems)) {
      console.warn(`Invalid cloudItems for ${boardType}: expected array, got ${typeof cloudItems}`);
      return board.items;
    }

    // Create a map of local items by ID for quick lookup
    const localItemsById = {};
    board.items.forEach(item => {
      if (item.id) {
        localItemsById[item.id] = item;
      }
    });

    // Create a map of cloud items by ID
    const cloudItemsById = {};
    cloudItems.forEach(item => {
      if (item.id) {
        cloudItemsById[item.id] = item;
      }
    });

    // Merge items: start with local items, add/update with cloud items
    const mergedItems = [];
    const processedIds = new Set();

    // First, add all local items (or update with cloud version if exists)
    board.items.forEach(localItem => {
      if (localItem.id && cloudItemsById[localItem.id]) {
        // Item exists in both local and cloud - use cloud version (last-write-wins)
        const cloudItem = cloudItemsById[localItem.id];
        mergedItems.push(cloudItem);
        processedIds.add(localItem.id);
      } else {
        // Item only in local - keep it
        mergedItems.push(localItem);
        if (localItem.id) {
          processedIds.add(localItem.id);
        }
      }
    });

    // Then, add cloud items that don't exist locally
    cloudItems.forEach(cloudItem => {
      if (cloudItem.id && !processedIds.has(cloudItem.id)) {
        // Check for duplicate by name + category (for items without matching ID)
        const isDuplicate = mergedItems.some(item => 
          item.name === cloudItem.name && 
          item.category === cloudItem.category
        );

        if (!isDuplicate) {
          mergedItems.push(cloudItem);
          processedIds.add(cloudItem.id);
        } else {
          console.log(`Skipped duplicate item: ${cloudItem.name} (${cloudItem.category})`);
        }
      }
    });

    // Update board with merged items
    board.items = mergedItems;
    this.updateCompletionPercentage(boardType);
    this.saveState();
    this.notifyListeners(boardType, 'merge');

    console.log(`✓ Merged ${mergedItems.length} items for ${boardType} (${cloudItems.length} from cloud)`);
    return mergedItems;
  }

  // Deduplicate items by ID and by name + category
  deduplicateItems(items) {
    if (!Array.isArray(items)) {
      console.warn('deduplicateItems: expected array, got', typeof items);
      return [];
    }

    if (items.length === 0) {
      return [];
    }

    const deduplicatedItems = [];
    const seenIds = new Set();
    const seenNameCategories = new Set();

    for (const item of items) {
      // Check for duplicate by ID
      if (item.id) {
        if (seenIds.has(item.id)) {
          console.log(`Skipped duplicate item by ID: ${item.id}`);
          continue;
        }
        seenIds.add(item.id);
      }

      // Check for duplicate by name + category
      const nameCategory = `${item.name}|${item.category || ''}`;
      if (seenNameCategories.has(nameCategory)) {
        console.log(`Skipped duplicate item by name+category: ${item.name} (${item.category})`);
        continue;
      }
      seenNameCategories.add(nameCategory);

      deduplicatedItems.push(item);
    }

    console.log(`✓ Deduplicated ${items.length} items to ${deduplicatedItems.length} items`);
    return deduplicatedItems;
  }

  // Start automatic sync with Google Sheets at specified interval
  startAutoSync(intervalMs = CONFIG.AUTO_SYNC_INTERVAL) {
    // Stop any existing auto-sync timer
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      console.log('⏹️ Stopped existing auto-sync timer');
    }

    // Validate interval
    if (typeof intervalMs !== 'number' || intervalMs <= 0) {
      console.error('Invalid auto-sync interval:', intervalMs);
      return false;
    }

    // Start new auto-sync timer
    this.autoSyncTimer = setInterval(async () => {
      try {
        console.log('🔄 Starting auto-sync with Google Sheets...');

        // Sync all boards
        const boards = Object.keys(this.state.boards);
        for (const boardType of boards) {
          try {
            // Load items from Google Sheets for this board
            const cloudItems = await this.loadFromGoogleSheets(boardType);

            // Merge cloud items with local items
            if (cloudItems.length > 0) {
              this.mergeCloudItems(boardType, cloudItems);
            }
          } catch (error) {
            console.error(`Auto-sync failed for board ${boardType}:`, error);
            // Continue with next board on error
          }
        }

        console.log('✓ Auto-sync completed');
        this.notifyListeners(null, 'auto-sync-complete');
      } catch (error) {
        console.error('Auto-sync error:', error);
        this.notifyListeners(null, 'auto-sync-error');
      }
    }, intervalMs);

    console.log(`✓ Auto-sync started with interval: ${intervalMs}ms`);
    return true;
  }

  // Stop automatic sync with Google Sheets
  stopAutoSync() {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
      console.log('⏹️ Auto-sync stopped');
      return true;
    }
    return false;
  }

  // Retry failed sync for a specific item
  async retryFailedSync(boardType, itemId) {
    const item = this.getItem(boardType, itemId);
    if (!item) {
      console.error('Item not found for retry:', itemId);
      return false;
    }

    if (item.syncStatus !== 'failed') {
      console.warn('Item is not in failed state, skipping retry:', itemId);
      return false;
    }

    try {
      // Reset sync status to pending
      item.syncStatus = 'pending';
      this.saveState();
      this.notifyListeners(boardType, 'sync-retry');

      // Retry the sync based on the last action
      // For now, we'll assume it's an add operation if it has no syncedAt
      if (!item.syncedAt) {
        // Item was never synced, treat as add
        await this.syncItemToCloud(boardType, item);
      } else {
        // Item was previously synced, treat as update
        await this.syncItemUpdateToCloud(boardType, item);
      }

      console.log('✓ Retry successful for item:', itemId);
      return true;
    } catch (error) {
      console.error('Retry failed for item:', itemId, error);
      return false;
    }
  }

  // Retry all failed syncs for a board
  async retryAllFailedSyncs(boardType) {
    const board = this.getBoard(boardType);
    if (!board) {
      console.error('Board not found:', boardType);
      return 0;
    }

    const failedItems = board.items.filter(item => item.syncStatus === 'failed');
    if (failedItems.length === 0) {
      console.log('No failed items to retry for board:', boardType);
      return 0;
    }

    console.log(`🔄 Retrying ${failedItems.length} failed items for ${boardType}...`);

    let successCount = 0;
    for (const item of failedItems) {
      try {
        const success = await this.retryFailedSync(boardType, item.id);
        if (success) {
          successCount++;
        }
      } catch (error) {
        console.error('Error retrying item:', item.id, error);
      }
    }

    console.log(`✓ Retry complete: ${successCount}/${failedItems.length} items synced`);
    return successCount;
  }

  // Get all failed items across all boards
  getFailedItems() {
    const failedItems = [];
    const boards = Object.keys(this.state.boards);

    for (const boardType of boards) {
      const board = this.getBoard(boardType);
      if (board && board.items) {
        const boardFailedItems = board.items
          .filter(item => item.syncStatus === 'failed')
          .map(item => ({
            ...item,
            boardType: boardType
          }));
        failedItems.push(...boardFailedItems);
      }
    }

    return failedItems;
  }

  // Reset board items - set completed = false for all items and sync to Google Sheets
  async resetBoardItems(boardType) {
    const board = this.getBoard(boardType);
    if (!board) {
      console.warn(`Board ${boardType} not found`);
      return false;
    }

    try {
      // 1. Reset completed status for all items locally
      board.items.forEach(item => {
        item.completed = false;
        item.completedAt = null;
        item.syncStatus = 'pending'; // Mark for sync
      });

      // 2. Update completion percentage
      this.updateCompletionPercentage(boardType);

      // 3. Save to localStorage
      this.saveState();

      // 4. Log the reset action
      this.logAction(boardType, 'board', 'reset', `${boardType} reset`, null, null);

      // 5. Notify listeners of the reset
      this.notifyListeners(boardType, 'reset');

      // 6. Sync reset status to Google Sheets in background (non-blocking)
      this.syncBoardResetToCloud(boardType).catch(error => {
        console.error(`Background sync failed for board reset: ${boardType}`, error);
        // Error is already handled in syncBoardResetToCloud
      });

      console.log(`✓ Reset ${board.items.length} items in ${boardType}`);
      return true;
    } catch (error) {
      console.error(`Failed to reset board items for ${boardType}:`, error);
      return false;
    }
  }

  // Sync board reset to cloud in background
  async syncBoardResetToCloud(boardType) {
    const board = this.getBoard(boardType);
    if (!board) return;

    try {
      // Prepare items for batch update - only send completed status
      const itemsToUpdate = board.items.map(item => ({
        id: item.id,
        completed: false,
        completedAt: null,
        timestamp: new Date().toISOString()
      }));

      // Call API to batch update items in Google Sheets
      if (itemsToUpdate.length > 0) {
        await apiService.batchUpdateItems(boardType, itemsToUpdate);
      }

      // Update sync status to synced for all items
      board.items.forEach(item => {
        item.syncStatus = 'synced';
        item.syncedAt = new Date().toISOString();
      });

      this.saveState();
      this.notifyListeners(boardType, 'sync-complete');
      console.log(`✓ Synced reset for ${board.items.length} items in ${boardType} to Google Sheets`);
    } catch (error) {
      // Update sync status to failed for all items
      board.items.forEach(item => {
        item.syncStatus = 'failed';
        item.syncError = error.message;
      });

      this.saveState();
      this.notifyListeners(boardType, 'sync-failed');
      console.error(`Failed to sync board reset for ${boardType} to Google Sheets:`, error);
      throw error;
    }
  }



}

// Create global state manager instance - Initialize immediately with mock data
const stateManager = new StateManager();

// Log initialization
console.log('✅ StateManager initialized with', Object.keys(stateManager.getState().boards).length, 'boards');
console.log('📊 Total items:', Object.values(stateManager.getState().boards).reduce((sum, board) => sum + board.items.length, 0));


// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StateManager, stateManager };
}
