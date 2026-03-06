// Integration Tests for Offline Resilience
// Tests the complete flow: Add item offline → Item stored in localStorage → Connection restored → Item synced to cloud

/**
 * Test: Add item while offline
 * Validates: Requirements 4.1 - Items added offline are stored in localStorage
 */
async function testAddItemWhileOffline() {
  // Setup: Clear localStorage and create fresh state manager
  localStorage.clear();
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test offline item',
    category: 'daily',
    completed: false
  };
  
  // Mock the apiService.appendItem to simulate offline (network error)
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    // Simulate offline by throwing a network error
    throw new Error('Network error: Unable to reach server');
  };
  
  try {
    // Action: Add item while offline
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    
    // Verify 1: Item is returned immediately
    if (!addedItem) {
      throw new Error('addItemWithCloudSync did not return an item');
    }
    
    if (!addedItem.id) {
      throw new Error('Returned item does not have an ID');
    }
    
    // Verify 2: Item appears in local state immediately
    const board = testStateManager.getBoard(boardType);
    const foundItem = board.items.find(i => i.id === addedItem.id);
    
    if (!foundItem) {
      throw new Error('Item does not appear in board immediately after addItemWithCloudSync');
    }
    
    // Verify 3: Item has correct properties
    if (foundItem.name !== newItem.name) {
      throw new Error(`Expected name '${newItem.name}', got '${foundItem.name}'`);
    }
    
    if (foundItem.category !== newItem.category) {
      throw new Error(`Expected category '${newItem.category}', got '${foundItem.category}'`);
    }
    
    // Wait for background sync to fail
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify 4: Sync status is set to failed (because offline)
    const offlineItem = testStateManager.getItem(boardType, addedItem.id);
    if (offlineItem.syncStatus !== 'failed') {
      throw new Error(`Expected syncStatus 'failed' when offline, got '${offlineItem.syncStatus}'`);
    }
    
    // Verify 5: Error message indicates network issue
    if (!offlineItem.syncError || !offlineItem.syncError.includes('Network')) {
      throw new Error(`Expected network error message, got '${offlineItem.syncError}'`);
    }
    
    console.log('✓ Test passed: Item added while offline with failed sync status');
  } finally {
    // Restore original apiService.appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Test: Item is stored in localStorage when added offline
 * Validates: Requirements 4.1 - Items added offline are stored in localStorage
 */
async function testOfflineItemStoredInLocalStorage() {
  // Setup: Clear localStorage and create fresh state manager
  localStorage.clear();
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test offline persistence',
    category: 'weekly',
    completed: false
  };
  
  // Mock the apiService.appendItem to simulate offline
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    throw new Error('Network error: Unable to reach server');
  };
  
  try {
    // Action: Add item while offline
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    
    // Wait for background sync to fail
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify 1: Item is in localStorage
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    if (!stored) {
      throw new Error('State was not saved to localStorage');
    }
    
    const parsedState = JSON.parse(stored);
    const foundItem = parsedState.boards[boardType].items.find(i => i.id === addedItem.id);
    
    if (!foundItem) {
      throw new Error('Item not found in localStorage after offline add');
    }
    
    // Verify 2: Item properties are correct in localStorage
    if (foundItem.name !== newItem.name) {
      throw new Error(`Expected name '${newItem.name}' in localStorage, got '${foundItem.name}'`);
    }
    
    // Verify 3: Sync status is failed in localStorage
    if (foundItem.syncStatus !== 'failed') {
      throw new Error(`Expected syncStatus 'failed' in localStorage, got '${foundItem.syncStatus}'`);
    }
    
    // Verify 4: Item persists after creating new state manager (simulating page reload)
    const newStateManager = new StateManager();
    const reloadedBoard = newStateManager.getBoard(boardType);
    const reloadedItem = reloadedBoard.items.find(i => i.id === addedItem.id);
    
    if (!reloadedItem) {
      throw new Error('Item not found after simulating page reload while offline');
    }
    
    if (reloadedItem.name !== newItem.name) {
      throw new Error(`Item name changed after reload: expected '${newItem.name}', got '${reloadedItem.name}'`);
    }
    
    if (reloadedItem.syncStatus !== 'failed') {
      throw new Error(`Expected syncStatus 'failed' after reload, got '${reloadedItem.syncStatus}'`);
    }
    
    console.log('✓ Test passed: Offline item is stored in localStorage and persists after reload');
  } finally {
    // Restore original apiService.appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Test: Multiple items can be added while offline
 * Validates: Requirements 4.1 - Multiple items added offline are stored in localStorage
 */
async function testMultipleItemsAddedWhileOffline() {
  // Setup: Clear localStorage and create fresh state manager
  localStorage.clear();
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const items = [
    { name: 'Offline item 1', category: 'daily', completed: false },
    { name: 'Offline item 2', category: 'weekly', completed: false },
    { name: 'Offline item 3', category: 'monthly', completed: false }
  ];
  
  // Mock the apiService.appendItem to simulate offline
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    throw new Error('Network error: Unable to reach server');
  };
  
  try {
    // Action: Add multiple items while offline
    const addedItems = [];
    for (const item of items) {
      const addedItem = testStateManager.addItemWithCloudSync(boardType, item);
      addedItems.push(addedItem);
    }
    
    // Wait for all background syncs to fail
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify 1: All items appear in local state
    const board = testStateManager.getBoard(boardType);
    for (const addedItem of addedItems) {
      const foundItem = board.items.find(i => i.id === addedItem.id);
      if (!foundItem) {
        throw new Error(`Item ${addedItem.name} not found in board`);
      }
    }
    
    // Verify 2: All items are in localStorage
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    const parsedState = JSON.parse(stored);
    for (const addedItem of addedItems) {
      const storedItem = parsedState.boards[boardType].items.find(i => i.id === addedItem.id);
      if (!storedItem) {
        throw new Error(`Item ${addedItem.name} not found in localStorage`);
      }
      
      if (storedItem.syncStatus !== 'failed') {
        throw new Error(`Item ${addedItem.name} has unexpected syncStatus: ${storedItem.syncStatus}`);
      }
    }
    
    // Verify 3: All items persist after page reload
    const newStateManager = new StateManager();
    const reloadedBoard = newStateManager.getBoard(boardType);
    for (const addedItem of addedItems) {
      const reloadedItem = reloadedBoard.items.find(i => i.id === addedItem.id);
      if (!reloadedItem) {
        throw new Error(`Item ${addedItem.name} not found after page reload`);
      }
    }
    
    console.log('✓ Test passed: Multiple items added while offline are stored in localStorage');
  } finally {
    // Restore original apiService.appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Test: Offline queue stores failed operations
 * Validates: Requirements 4.1 - Failed operations are queued for retry
 */
async function testOfflineQueueStoresFailedOperations() {
  // Setup: Clear localStorage and offline queue
  localStorage.clear();
  apiService.offlineQueue.clear();
  
  const testStateManager = new StateManager();
  const boardType = 'chores';
  const newItem = {
    name: 'Test offline queue',
    category: 'daily',
    completed: false
  };
  
  // Mock the apiService.fetch to simulate offline
  const originalFetch = apiService.fetch;
  const originalUseGoogleSheets = apiService.useGoogleSheets;
  
  // Enable Google Sheets mode so the mock is called
  apiService.useGoogleSheets = true;
  
  let fetchCallCount = 0;
  apiService.fetch = async function(endpoint, options) {
    fetchCallCount++;
    console.log(`Mock fetch called (call #${fetchCallCount}) for endpoint:`, endpoint);
    throw new Error('Network error: Unable to reach server');
  };
  
  try {
    // Action: Add item while offline
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    console.log('Added item:', addedItem.id);
    
    // Wait for background sync to fail and queue the operation
    // Need to wait longer for all retries to complete
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Debug: Check queue status
    const queueStatus = apiService.getOfflineQueueStatus();
    console.log('Queue status after sync:', queueStatus);
    console.log('Total fetch calls:', fetchCallCount);
    
    // Verify 1: Item has failed sync status
    const failedItem = testStateManager.getItem(boardType, addedItem.id);
    if (failedItem.syncStatus !== 'failed') {
      throw new Error(`Expected syncStatus 'failed', got '${failedItem.syncStatus}'`);
    }
    
    // Verify 2: Item has error message
    if (!failedItem.syncError) {
      throw new Error('Expected syncError to be set');
    }
    
    // Verify 3: Operation is queued (check offline queue)
    if (queueStatus.queueLength === 0) {
      throw new Error('Expected operation to be queued, but queue is empty');
    }
    
    // Verify 4: Queued operation has correct type
    const queuedOp = queueStatus.operations[0];
    if (queuedOp.type !== 'append') {
      throw new Error(`Expected operation type 'append', got '${queuedOp.type}'`);
    }
    
    // Verify 5: Queued operation has correct item data
    if (queuedOp.item.name !== newItem.name) {
      throw new Error(`Expected item name '${newItem.name}', got '${queuedOp.item.name}'`);
    }
    
    console.log('✓ Test passed: Offline queue stores failed operations');
  } finally {
    // Restore original apiService.fetch and useGoogleSheets
    apiService.fetch = originalFetch;
    apiService.useGoogleSheets = originalUseGoogleSheets;
    apiService.offlineQueue.clear();
  }
}

/**
 * Test: Restore connection and process offline queue
 * Validates: Requirements 4.1 - Items added offline are synced to Google Sheets when connection is restored
 */
async function testRestoreConnectionAndSync() {
  // Setup: Clear localStorage and offline queue
  localStorage.clear();
  apiService.offlineQueue.clear();
  
  const testStateManager = new StateManager();
  const boardType = 'chores';
  const newItem = {
    name: 'Test restore connection',
    category: 'daily',
    completed: false
  };
  
  // Enable Google Sheets mode so retry logic is triggered
  const originalUseGoogleSheets = apiService.useGoogleSheets;
  apiService.useGoogleSheets = true;
  
  // Track API calls
  let appendCallCount = 0;
  const originalFetch = apiService.fetch;
  
  // Phase 1: Simulate offline - API calls fail
  apiService.fetch = async function(endpoint, options) {
    appendCallCount++;
    console.log(`Mock fetch called (call #${appendCallCount}) - simulating offline`);
    throw new Error('Network error: Unable to reach server');
  };
  
  try {
    // Action 1: Add item while offline
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    console.log('Added item while offline:', addedItem.id);
    
    // Wait for background sync to fail and queue the operation
    // Need to wait longer for all retries to complete
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Verify 1: Item has failed sync status
    let failedItem = testStateManager.getItem(boardType, addedItem.id);
    if (failedItem.syncStatus !== 'failed') {
      throw new Error(`Expected syncStatus 'failed' when offline, got '${failedItem.syncStatus}'`);
    }
    
    // Verify 2: Item is queued
    let queueStatus = apiService.getOfflineQueueStatus();
    if (queueStatus.queueLength === 0) {
      throw new Error('Expected operation to be queued, but queue is empty');
    }
    
    console.log(`✓ Item added offline and queued. Queue length: ${queueStatus.queueLength}`);
    
    // Phase 2: Restore connection - API calls succeed
    let successCallCount = 0;
    apiService.fetch = async function(endpoint, options) {
      successCallCount++;
      console.log(`Mock fetch called (success call #${successCallCount}) - connection restored`);
      // Simulate successful API call
      return { id: addedItem.id, ...newItem, synced: true };
    };
    
    // Action 2: Process offline queue (simulating connection restoration)
    const result = await apiService.processOfflineQueue(testStateManager);
    console.log('Queue processing result:', result);
    
    // Verify 3: Queue was processed successfully
    if (result.processed === 0) {
      throw new Error('Expected queue to be processed, but no operations were processed');
    }
    
    // Verify 4: Item sync status is updated to synced
    const syncedItem = testStateManager.getItem(boardType, addedItem.id);
    if (syncedItem.syncStatus !== 'synced') {
      throw new Error(`Expected syncStatus 'synced' after queue processing, got '${syncedItem.syncStatus}'`);
    }
    
    // Verify 5: Queue is now empty
    queueStatus = apiService.getOfflineQueueStatus();
    if (queueStatus.queueLength !== 0) {
      throw new Error(`Expected queue to be empty after processing, but has ${queueStatus.queueLength} items`);
    }
    
    console.log('✓ Test passed: Connection restored and offline queue processed successfully');
  } finally {
    // Restore original apiService.fetch and useGoogleSheets
    apiService.fetch = originalFetch;
    apiService.useGoogleSheets = originalUseGoogleSheets;
    apiService.offlineQueue.clear();
  }
}

/**
 * Test: Verify no data loss during offline → sync cycle
 * Validates: Requirements 4.1 - No data loss occurs during offline periods
 * 
 * This comprehensive test validates:
 * 1. Items added offline are not lost
 * 2. Item properties are preserved exactly
 * 3. Multiple items don't get duplicated
 * 4. Items sync correctly after connection restoration
 * 5. localStorage and cloud state remain consistent
 */
async function testVerifyNoDataLoss() {
  // Setup: Clear localStorage and offline queue
  localStorage.clear();
  apiService.offlineQueue.clear();
  
  const testStateManager = new StateManager();
  const boardType = 'chores';
  
  // Create test items with various properties
  const testItems = [
    { name: 'Item 1', category: 'daily', completed: false },
    { name: 'Item 2', category: 'weekly', completed: true },
    { name: 'Item 3', category: 'monthly', completed: false }
  ];
  
  // Enable Google Sheets mode
  const originalUseGoogleSheets = apiService.useGoogleSheets;
  apiService.useGoogleSheets = true;
  
  // Track all API calls
  let apiCallLog = [];
  const originalFetch = apiService.fetch;
  
  // Phase 1: Simulate offline - API calls fail
  apiService.fetch = async function(endpoint, options) {
    apiCallLog.push({ phase: 'offline', endpoint, timestamp: Date.now() });
    throw new Error('Network error: Unable to reach server');
  };
  
  try {
    // Action 1: Add multiple items while offline
    console.log('Phase 1: Adding items while offline...');
    const addedItemIds = [];
    const addedItemsData = [];
    
    for (const item of testItems) {
      const addedItem = testStateManager.addItemWithCloudSync(boardType, item);
      addedItemIds.push(addedItem.id);
      addedItemsData.push({
        id: addedItem.id,
        ...item,
        syncStatus: 'pending'
      });
    }
    
    // Wait for background syncs to fail
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Verify 1: All items are in local state
    console.log('Verify 1: Checking local state...');
    const board = testStateManager.getBoard(boardType);
    for (const itemId of addedItemIds) {
      const foundItem = board.items.find(i => i.id === itemId);
      if (!foundItem) {
        throw new Error(`Item ${itemId} not found in local state after offline add`);
      }
    }
    
    // Verify 2: All items are in localStorage
    console.log('Verify 2: Checking localStorage...');
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    if (!stored) {
      throw new Error('State not saved to localStorage');
    }
    
    const parsedState = JSON.parse(stored);
    const storedItems = parsedState.boards[boardType].items;
    
    for (const itemId of addedItemIds) {
      const storedItem = storedItems.find(i => i.id === itemId);
      if (!storedItem) {
        throw new Error(`Item ${itemId} not found in localStorage`);
      }
      
      // Verify item properties are preserved
      const originalItem = testItems.find(i => i.name === storedItem.name);
      if (storedItem.name !== originalItem.name) {
        throw new Error(`Item name changed: expected '${originalItem.name}', got '${storedItem.name}'`);
      }
      if (storedItem.category !== originalItem.category) {
        throw new Error(`Item category changed: expected '${originalItem.category}', got '${storedItem.category}'`);
      }
      if (storedItem.completed !== originalItem.completed) {
        throw new Error(`Item completed status changed: expected ${originalItem.completed}, got ${storedItem.completed}`);
      }
    }
    
    // Verify 3: Items are queued for retry
    console.log('Verify 3: Checking offline queue...');
    const queueStatus = apiService.getOfflineQueueStatus();
    if (queueStatus.queueLength !== testItems.length) {
      throw new Error(`Expected ${testItems.length} items in queue, got ${queueStatus.queueLength}`);
    }
    
    // Verify 4: Simulate page reload - items should persist
    console.log('Verify 4: Simulating page reload...');
    const reloadedStateManager = new StateManager();
    const reloadedBoard = reloadedStateManager.getBoard(boardType);
    
    for (const itemId of addedItemIds) {
      const reloadedItem = reloadedBoard.items.find(i => i.id === itemId);
      if (!reloadedItem) {
        throw new Error(`Item ${itemId} lost after page reload`);
      }
      
      // Verify properties are still intact
      const originalItem = testItems.find(i => i.name === reloadedItem.name);
      if (reloadedItem.name !== originalItem.name) {
        throw new Error(`Item name lost after reload: expected '${originalItem.name}', got '${reloadedItem.name}'`);
      }
    }
    
    // Phase 2: Restore connection - API calls succeed
    console.log('\nPhase 2: Restoring connection and syncing...');
    apiCallLog = [];
    
    let syncedCount = 0;
    apiService.fetch = async function(endpoint, options) {
      apiCallLog.push({ phase: 'sync', endpoint, timestamp: Date.now() });
      syncedCount++;
      
      // Parse the request to get the item being synced
      const body = JSON.parse(options.body || '{}');
      return {
        id: body.item?.id || `synced-${syncedCount}`,
        ...body.item,
        synced: true,
        syncedAt: new Date().toISOString()
      };
    };
    
    // Action 2: Process offline queue
    const result = await apiService.processOfflineQueue(testStateManager);
    
    // Verify 5: All items were synced
    console.log('Verify 5: Checking sync results...');
    if (result.processed !== testItems.length) {
      throw new Error(`Expected ${testItems.length} items to be synced, got ${result.processed}`);
    }
    
    if (result.failed !== 0) {
      throw new Error(`Expected 0 failed syncs, got ${result.failed}`);
    }
    
    // Verify 6: All items have synced status
    console.log('Verify 6: Checking sync status...');
    const finalBoard = testStateManager.getBoard(boardType);
    for (const itemId of addedItemIds) {
      const syncedItem = finalBoard.items.find(i => i.id === itemId);
      if (!syncedItem) {
        throw new Error(`Item ${itemId} lost after sync`);
      }
      
      if (syncedItem.syncStatus !== 'synced') {
        throw new Error(`Item ${itemId} has syncStatus '${syncedItem.syncStatus}', expected 'synced'`);
      }
    }
    
    // Verify 7: Queue is empty
    console.log('Verify 7: Checking queue is empty...');
    const finalQueueStatus = apiService.getOfflineQueueStatus();
    if (finalQueueStatus.queueLength !== 0) {
      throw new Error(`Expected queue to be empty, but has ${finalQueueStatus.queueLength} items`);
    }
    
    // Verify 8: No duplicate items were created
    console.log('Verify 8: Checking for duplicates...');
    const finalStoredState = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY));
    const finalStoredItems = finalStoredState.boards[boardType].items;
    
    const itemNames = finalStoredItems.map(i => i.name);
    const uniqueNames = new Set(itemNames);
    
    if (itemNames.length !== uniqueNames.size) {
      throw new Error(`Duplicate items detected: ${itemNames.length} items but only ${uniqueNames.size} unique names`);
    }
    
    // Verify 9: Item count is correct
    console.log('Verify 9: Checking item count...');
    const initialCount = testStateManager.getBoard(boardType).items.length;
    const expectedCount = testItems.length;
    
    // Count should include the test items plus any pre-existing items
    const testItemsInFinal = finalStoredItems.filter(i => addedItemIds.includes(i.id));
    if (testItemsInFinal.length !== testItems.length) {
      throw new Error(`Expected ${testItems.length} test items in final state, got ${testItemsInFinal.length}`);
    }
    
    console.log('✓ Test passed: No data loss during offline → sync cycle');
    console.log(`  - Added ${testItems.length} items while offline`);
    console.log(`  - All items persisted to localStorage`);
    console.log(`  - All items synced after connection restored`);
    console.log(`  - No duplicates created`);
    console.log(`  - All item properties preserved`);
    
  } finally {
    // Restore original apiService.fetch and useGoogleSheets
    apiService.fetch = originalFetch;
    apiService.useGoogleSheets = originalUseGoogleSheets;
    apiService.offlineQueue.clear();
  }
}

/**
 * Run all offline resilience tests
 */
async function runAllOfflineResilienceTests() {
  console.log('Running Offline Resilience Integration tests...\n');
  
  try {
    await testAddItemWhileOffline();
    await testOfflineItemStoredInLocalStorage();
    await testMultipleItemsAddedWhileOffline();
    await testOfflineQueueStoresFailedOperations();
    await testRestoreConnectionAndSync();
    await testVerifyNoDataLoss();
    
    console.log('\n✓ All Offline Resilience tests passed!');
    return true;
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Export for use in test-runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllOfflineResilienceTests };
}
