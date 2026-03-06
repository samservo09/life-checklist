// Integration Tests for Optimistic Update Pattern
// Tests the complete flow: Add item → Appears immediately → Saved to localStorage → Synced to cloud → Status updates

/**
 * Test: Complete optimistic update flow - item appears immediately
 * Validates: Requirements 1.1 - Item appears in UI instantly after addition
 */
async function testOptimisticUpdateItemAppearsImmediately() {
  // Setup: Clear localStorage and create fresh state manager
  localStorage.clear();
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test optimistic update',
    category: 'daily',
    completed: false
  };
  
  // Get initial item count
  const board = testStateManager.getBoard(boardType);
  const initialCount = board.items.length;
  
  // Action: Add item with cloud sync
  const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
  
  // Verify 1: Item is returned immediately
  if (!addedItem) {
    throw new Error('addItemWithCloudSync did not return an item');
  }
  
  if (!addedItem.id) {
    throw new Error('Returned item does not have an ID');
  }
  
  // Verify 2: Item appears in local state immediately
  const updatedBoard = testStateManager.getBoard(boardType);
  const foundItem = updatedBoard.items.find(i => i.id === addedItem.id);
  
  if (!foundItem) {
    throw new Error('Item does not appear in board immediately after addItemWithCloudSync');
  }
  
  // Verify 3: Item count increased
  if (updatedBoard.items.length !== initialCount + 1) {
    throw new Error(`Expected ${initialCount + 1} items, got ${updatedBoard.items.length}`);
  }
  
  // Verify 4: Item has correct properties
  if (foundItem.name !== newItem.name) {
    throw new Error(`Expected name '${newItem.name}', got '${foundItem.name}'`);
  }
  
  if (foundItem.category !== newItem.category) {
    throw new Error(`Expected category '${newItem.category}', got '${foundItem.category}'`);
  }
  
  // Verify 5: Sync status is pending (not yet synced)
  if (foundItem.syncStatus !== 'pending') {
    throw new Error(`Expected syncStatus 'pending', got '${foundItem.syncStatus}'`);
  }
  
  console.log('✓ Test passed: Item appears immediately with pending sync status');
}

/**
 * Test: Complete optimistic update flow - item is saved to localStorage
 * Validates: Requirements 1.1 - Item is persisted to localStorage
 */
async function testOptimisticUpdateItemSavedToLocalStorage() {
  // Setup: Clear localStorage and create fresh state manager
  localStorage.clear();
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test localStorage persistence',
    category: 'weekly',
    completed: false
  };
  
  // Action: Add item with cloud sync
  const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
  
  // Verify 1: Item is in localStorage immediately
  const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
  if (!stored) {
    throw new Error('State was not saved to localStorage');
  }
  
  const parsedState = JSON.parse(stored);
  const foundItem = parsedState.boards[boardType].items.find(i => i.id === addedItem.id);
  
  if (!foundItem) {
    throw new Error('Item not found in localStorage after addItemWithCloudSync');
  }
  
  // Verify 2: Item properties are correct in localStorage
  if (foundItem.name !== newItem.name) {
    throw new Error(`Expected name '${newItem.name}' in localStorage, got '${foundItem.name}'`);
  }
  
  // Verify 3: Sync status is in localStorage
  if (foundItem.syncStatus !== 'pending') {
    throw new Error(`Expected syncStatus 'pending' in localStorage, got '${foundItem.syncStatus}'`);
  }
  
  // Verify 4: Item persists after creating new state manager (simulating page reload)
  const newStateManager = new StateManager();
  const reloadedBoard = newStateManager.getBoard(boardType);
  const reloadedItem = reloadedBoard.items.find(i => i.id === addedItem.id);
  
  if (!reloadedItem) {
    throw new Error('Item not found after simulating page reload');
  }
  
  if (reloadedItem.name !== newItem.name) {
    throw new Error(`Item name changed after reload: expected '${newItem.name}', got '${reloadedItem.name}'`);
  }
  
  console.log('✓ Test passed: Item is saved to localStorage and persists after reload');
}

/**
 * Test: Complete optimistic update flow - sync status updates correctly
 * Validates: Requirements 1.1 - Sync status updates from pending to synced
 */
async function testOptimisticUpdateSyncStatusUpdatesCorrectly() {
  // Setup: Clear localStorage and create fresh state manager
  localStorage.clear();
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test sync status update',
    category: 'daily',
    completed: false
  };
  
  // Mock the apiService.appendItem to simulate successful sync
  let syncCompleted = false;
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    syncCompleted = true;
    return { success: true };
  };
  
  try {
    // Action: Add item with cloud sync
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    
    // Verify 1: Initial sync status is pending
    if (addedItem.syncStatus !== 'pending') {
      throw new Error(`Expected initial syncStatus 'pending', got '${addedItem.syncStatus}'`);
    }
    
    // Wait for background sync to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify 2: Sync status updated to synced
    const syncedItem = testStateManager.getItem(boardType, addedItem.id);
    if (!syncedItem) {
      throw new Error('Item not found after sync');
    }
    
    if (syncedItem.syncStatus !== 'synced') {
      throw new Error(`Expected syncStatus 'synced' after sync, got '${syncedItem.syncStatus}'`);
    }
    
    // Verify 3: syncedAt timestamp is set
    if (!syncedItem.syncedAt) {
      throw new Error('syncedAt timestamp not set after successful sync');
    }
    
    // Verify 4: Sync status is persisted to localStorage
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    const parsedState = JSON.parse(stored);
    const storedItem = parsedState.boards[boardType].items.find(i => i.id === addedItem.id);
    
    if (storedItem.syncStatus !== 'synced') {
      throw new Error(`Expected syncStatus 'synced' in localStorage, got '${storedItem.syncStatus}'`);
    }
    
    // Verify 5: apiService.appendItem was called
    if (!syncCompleted) {
      throw new Error('apiService.appendItem was not called');
    }
    
    console.log('✓ Test passed: Sync status updates correctly from pending to synced');
  } finally {
    // Restore original apiService.appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Test: Optimistic update handles sync failures gracefully
 * Validates: Requirements 1.1 - Item remains in local state if sync fails
 */
async function testOptimisticUpdateHandlesSyncFailures() {
  // Setup: Clear localStorage and create fresh state manager
  localStorage.clear();
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test sync failure handling',
    category: 'daily',
    completed: false
  };
  
  // Mock the apiService.appendItem to simulate failure
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Network error: Failed to sync to Google Sheets');
  };
  
  try {
    // Action: Add item with cloud sync
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    
    // Verify 1: Item appears immediately despite sync failure
    const board = testStateManager.getBoard(boardType);
    const foundItem = board.items.find(i => i.id === addedItem.id);
    
    if (!foundItem) {
      throw new Error('Item not found in board after addItemWithCloudSync');
    }
    
    // Wait for background sync to fail
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify 2: Sync status is set to failed
    const failedItem = testStateManager.getItem(boardType, addedItem.id);
    if (failedItem.syncStatus !== 'failed') {
      throw new Error(`Expected syncStatus 'failed', got '${failedItem.syncStatus}'`);
    }
    
    // Verify 3: Error message is stored
    if (!failedItem.syncError) {
      throw new Error('syncError not set after failed sync');
    }
    
    // Verify 4: Item is still in localStorage
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    const parsedState = JSON.parse(stored);
    const storedItem = parsedState.boards[boardType].items.find(i => i.id === addedItem.id);
    
    if (!storedItem) {
      throw new Error('Item not found in localStorage after sync failure');
    }
    
    if (storedItem.syncStatus !== 'failed') {
      throw new Error(`Expected syncStatus 'failed' in localStorage, got '${storedItem.syncStatus}'`);
    }
    
    console.log('✓ Test passed: Optimistic update handles sync failures gracefully');
  } finally {
    // Restore original apiService.appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Test: Multiple items can be added with optimistic updates
 * Validates: Requirements 1.1 - Multiple items can be added and synced independently
 */
async function testOptimisticUpdateMultipleItems() {
  // Setup: Clear localStorage and create fresh state manager
  localStorage.clear();
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const items = [
    { name: 'Item 1', category: 'daily', completed: false },
    { name: 'Item 2', category: 'weekly', completed: false },
    { name: 'Item 3', category: 'monthly', completed: false }
  ];
  
  // Mock the apiService.appendItem
  let appendCount = 0;
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    appendCount++;
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true };
  };
  
  try {
    // Action: Add multiple items
    const addedItems = [];
    for (const item of items) {
      const addedItem = testStateManager.addItemWithCloudSync(boardType, item);
      addedItems.push(addedItem);
    }
    
    // Verify 1: All items appear immediately
    const board = testStateManager.getBoard(boardType);
    for (const addedItem of addedItems) {
      const foundItem = board.items.find(i => i.id === addedItem.id);
      if (!foundItem) {
        throw new Error(`Item ${addedItem.name} not found in board`);
      }
    }
    
    // Wait for all syncs to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify 2: All items are synced
    for (const addedItem of addedItems) {
      const syncedItem = testStateManager.getItem(boardType, addedItem.id);
      if (syncedItem.syncStatus !== 'synced') {
        throw new Error(`Item ${addedItem.name} not synced: status is ${syncedItem.syncStatus}`);
      }
    }
    
    // Verify 3: All items are in localStorage
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    const parsedState = JSON.parse(stored);
    for (const addedItem of addedItems) {
      const storedItem = parsedState.boards[boardType].items.find(i => i.id === addedItem.id);
      if (!storedItem) {
        throw new Error(`Item ${addedItem.name} not found in localStorage`);
      }
    }
    
    // Verify 4: appendItem was called for each item
    if (appendCount !== items.length) {
      throw new Error(`Expected ${items.length} append calls, got ${appendCount}`);
    }
    
    console.log('✓ Test passed: Multiple items can be added with optimistic updates');
  } finally {
    // Restore original apiService.appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Test: Verify item is synced to Google Sheets
 * Validates: Requirements 1.1 - Item is sent to Google Sheets API
 */
async function testOptimisticUpdateItemSyncedToGoogleSheets() {
  // Setup: Clear localStorage and create fresh state manager
  localStorage.clear();
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test Google Sheets sync',
    category: 'daily',
    completed: false
  };
  
  // Track API calls
  let appendItemCalled = false;
  let appendItemBoardType = null;
  let appendItemData = null;
  
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    appendItemCalled = true;
    appendItemBoardType = bt;
    appendItemData = item;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return success response
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  };
  
  try {
    // Action: Add item with cloud sync
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    
    // Verify 1: Item is returned with ID
    if (!addedItem || !addedItem.id) {
      throw new Error('Item not returned or missing ID');
    }
    
    // Wait for background sync to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify 2: appendItem was called
    if (!appendItemCalled) {
      throw new Error('apiService.appendItem was not called');
    }
    
    // Verify 3: appendItem was called with correct boardType
    if (appendItemBoardType !== boardType) {
      throw new Error(`Expected boardType '${boardType}', got '${appendItemBoardType}'`);
    }
    
    // Verify 4: appendItem was called with correct item data
    if (!appendItemData) {
      throw new Error('Item data not passed to appendItem');
    }
    
    if (appendItemData.id !== addedItem.id) {
      throw new Error(`Expected item ID '${addedItem.id}', got '${appendItemData.id}'`);
    }
    
    if (appendItemData.name !== newItem.name) {
      throw new Error(`Expected item name '${newItem.name}', got '${appendItemData.name}'`);
    }
    
    if (appendItemData.category !== newItem.category) {
      throw new Error(`Expected item category '${newItem.category}', got '${appendItemData.category}'`);
    }
    
    // Verify 5: Item has required fields in API call
    if (appendItemData.completed === undefined) {
      throw new Error('Item completed status not set in API call');
    }
    
    // Verify 6: Sync status is updated to synced
    const syncedItem = testStateManager.getItem(boardType, addedItem.id);
    if (syncedItem.syncStatus !== 'synced') {
      throw new Error(`Expected syncStatus 'synced', got '${syncedItem.syncStatus}'`);
    }
    
    // Verify 7: syncedAt timestamp is set
    if (!syncedItem.syncedAt) {
      throw new Error('syncedAt timestamp not set after successful sync');
    }
    
    console.log('✓ Test passed: Item is synced to Google Sheets with correct data');
  } finally {
    // Restore original apiService.appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Run all optimistic update tests
 */
async function runAllOptimisticUpdateTests() {
  console.log('Running Optimistic Update Integration tests...\n');
  
  try {
    await testOptimisticUpdateItemAppearsImmediately();
    await testOptimisticUpdateItemSavedToLocalStorage();
    await testOptimisticUpdateSyncStatusUpdatesCorrectly();
    await testOptimisticUpdateHandlesSyncFailures();
    await testOptimisticUpdateMultipleItems();
    await testOptimisticUpdateItemSyncedToGoogleSheets();
    
    console.log('\n✓ All Optimistic Update tests passed!');
    return true;
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Export for use in test-runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllOptimisticUpdateTests };
}
