// Tests for StateManager.addItemWithCloudSync method

/**
 * Test: addItemWithCloudSync adds item to local state immediately (optimistic update)
 */
async function testAddItemWithCloudSyncAddsItemImmediately() {
  // Create a fresh state manager for testing
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test item',
    category: 'daily',
    completed: false
  };
  
  // Add item with cloud sync
  const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
  
  // Verify item was added to local state immediately
  if (!addedItem || !addedItem.id) {
    throw new Error('Item was not added to local state');
  }
  
  // Verify sync status is 'pending'
  if (addedItem.syncStatus !== 'pending') {
    throw new Error(`Expected syncStatus 'pending', got '${addedItem.syncStatus}'`);
  }
  
  // Verify item is in the board
  const board = testStateManager.getBoard(boardType);
  const foundItem = board.items.find(i => i.id === addedItem.id);
  if (!foundItem) {
    throw new Error('Item not found in board after addItemWithCloudSync');
  }
  
  console.log('✓ Test passed: addItemWithCloudSync adds item to local state immediately');
}

/**
 * Test: addItemWithCloudSync persists item to localStorage
 */
async function testAddItemWithCloudSyncPersistsToLocalStorage() {
  // Clear localStorage first
  localStorage.clear();
  
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test item for storage',
    category: 'daily',
    completed: false
  };
  
  // Add item with cloud sync
  const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
  
  // Verify item is saved to localStorage
  const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
  if (!stored) {
    throw new Error('State was not saved to localStorage');
  }
  
  const parsedState = JSON.parse(stored);
  const foundItem = parsedState.boards[boardType].items.find(i => i.id === addedItem.id);
  if (!foundItem) {
    throw new Error('Item not found in localStorage after addItemWithCloudSync');
  }
  
  // Verify sync status is in localStorage
  if (foundItem.syncStatus !== 'pending') {
    throw new Error(`Expected syncStatus 'pending' in localStorage, got '${foundItem.syncStatus}'`);
  }
  
  console.log('✓ Test passed: addItemWithCloudSync persists item to localStorage');
}

/**
 * Test: addItemWithCloudSync triggers cloud sync in background
 */
async function testAddItemWithCloudSyncTriggersCloudSync() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test item for cloud sync',
    category: 'daily',
    completed: false
  };
  
  // Mock the apiService.appendItem to track calls
  let appendItemCalled = false;
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    appendItemCalled = true;
    return { success: true };
  };
  
  try {
    // Add item with cloud sync
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    
    // Wait a bit for the background sync to start
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify appendItem was called
    if (!appendItemCalled) {
      throw new Error('apiService.appendItem was not called for cloud sync');
    }
    
    console.log('✓ Test passed: addItemWithCloudSync triggers cloud sync in background');
  } finally {
    // Restore original appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Test: addItemWithCloudSync updates sync status to 'synced' on success
 */
async function testAddItemWithCloudSyncUpdatesSyncStatusOnSuccess() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test item for sync success',
    category: 'daily',
    completed: false
  };
  
  // Mock the apiService.appendItem to succeed
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    return { success: true };
  };
  
  try {
    // Add item with cloud sync
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    const itemId = addedItem.id;
    
    // Wait for the background sync to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify sync status was updated to 'synced'
    const syncedItem = testStateManager.getItem(boardType, itemId);
    if (syncedItem.syncStatus !== 'synced') {
      throw new Error(`Expected syncStatus 'synced', got '${syncedItem.syncStatus}'`);
    }
    
    // Verify syncedAt timestamp was set
    if (!syncedItem.syncedAt) {
      throw new Error('syncedAt timestamp was not set');
    }
    
    console.log('✓ Test passed: addItemWithCloudSync updates sync status to synced on success');
  } finally {
    // Restore original appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Test: addItemWithCloudSync updates sync status to 'failed' on error
 */
async function testAddItemWithCloudSyncUpdatesSyncStatusOnError() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test item for sync failure',
    category: 'daily',
    completed: false
  };
  
  // Mock the apiService.appendItem to fail
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    throw new Error('API error: Network failure');
  };
  
  try {
    // Add item with cloud sync
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    const itemId = addedItem.id;
    
    // Wait for the background sync to fail
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify sync status was updated to 'failed'
    const failedItem = testStateManager.getItem(boardType, itemId);
    if (failedItem.syncStatus !== 'failed') {
      throw new Error(`Expected syncStatus 'failed', got '${failedItem.syncStatus}'`);
    }
    
    // Verify syncError was set
    if (!failedItem.syncError) {
      throw new Error('syncError was not set');
    }
    
    console.log('✓ Test passed: addItemWithCloudSync updates sync status to failed on error');
  } finally {
    // Restore original appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Test: addItemWithCloudSync generates unique ID if not provided
 */
async function testAddItemWithCloudSyncGeneratesUniqueId() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const newItem = {
    name: 'Test item without ID',
    category: 'daily',
    completed: false
    // Note: no id provided
  };
  
  // Mock the apiService.appendItem
  const originalAppendItem = apiService.appendItem;
  apiService.appendItem = async function(bt, item) {
    return { success: true };
  };
  
  try {
    // Add item with cloud sync
    const addedItem = testStateManager.addItemWithCloudSync(boardType, newItem);
    
    // Verify ID was generated
    if (!addedItem.id) {
      throw new Error('ID was not generated for item');
    }
    
    // Verify ID format includes boardType
    if (!addedItem.id.includes(boardType)) {
      throw new Error(`Expected ID to include boardType '${boardType}', got '${addedItem.id}'`);
    }
    
    console.log('✓ Test passed: addItemWithCloudSync generates unique ID if not provided');
  } finally {
    // Restore original appendItem
    apiService.appendItem = originalAppendItem;
  }
}

/**
 * Run all tests
 */
async function runAllStateTests() {
  console.log('Running StateManager.addItemWithCloudSync tests...\n');
  
  try {
    await testAddItemWithCloudSyncAddsItemImmediately();
    await testAddItemWithCloudSyncPersistsToLocalStorage();
    await testAddItemWithCloudSyncTriggersCloudSync();
    await testAddItemWithCloudSyncUpdatesSyncStatusOnSuccess();
    await testAddItemWithCloudSyncUpdatesSyncStatusOnError();
    await testAddItemWithCloudSyncGeneratesUniqueId();
    
    console.log('\n✓ All StateManager tests passed!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && require.main === module) {
  runAllStateTests();
}


/**
 * Test: loadFromGoogleSheets fetches items from Google Sheets API
 */
async function testLoadFromGoogleSheetsFetchesItems() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  const mockCloudItems = [
    { id: 'cloud-1', name: 'Cloud item 1', category: 'daily', completed: false },
    { id: 'cloud-2', name: 'Cloud item 2', category: 'weekly', completed: false }
  ];
  
  // Mock the apiService.fetchBoardFromSheet to return mock items
  const originalFetchBoardFromSheet = apiService.fetchBoardFromSheet;
  apiService.fetchBoardFromSheet = async function(bt) {
    if (bt === boardType) {
      return mockCloudItems;
    }
    return [];
  };
  
  try {
    // Load items from Google Sheets
    const loadedItems = await testStateManager.loadFromGoogleSheets(boardType);
    
    // Verify items were loaded
    if (!Array.isArray(loadedItems)) {
      throw new Error('loadFromGoogleSheets did not return an array');
    }
    
    if (loadedItems.length !== mockCloudItems.length) {
      throw new Error(`Expected ${mockCloudItems.length} items, got ${loadedItems.length}`);
    }
    
    // Verify items match
    for (let i = 0; i < loadedItems.length; i++) {
      if (loadedItems[i].id !== mockCloudItems[i].id) {
        throw new Error(`Item ${i} ID mismatch: expected ${mockCloudItems[i].id}, got ${loadedItems[i].id}`);
      }
    }
    
    console.log('✓ Test passed: loadFromGoogleSheets fetches items from Google Sheets API');
  } finally {
    // Restore original fetchBoardFromSheet
    apiService.fetchBoardFromSheet = originalFetchBoardFromSheet;
  }
}

/**
 * Test: loadFromGoogleSheets returns empty array on API failure
 */
async function testLoadFromGoogleSheetsReturnsEmptyArrayOnFailure() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  
  // Mock the apiService.fetchBoardFromSheet to throw an error
  const originalFetchBoardFromSheet = apiService.fetchBoardFromSheet;
  apiService.fetchBoardFromSheet = async function() {
    throw new Error('API error: Network failure');
  };
  
  try {
    // Load items from Google Sheets
    const loadedItems = await testStateManager.loadFromGoogleSheets(boardType);
    
    // Verify empty array is returned on failure
    if (!Array.isArray(loadedItems)) {
      throw new Error('loadFromGoogleSheets did not return an array on failure');
    }
    
    if (loadedItems.length !== 0) {
      throw new Error(`Expected empty array on failure, got ${loadedItems.length} items`);
    }
    
    console.log('✓ Test passed: loadFromGoogleSheets returns empty array on API failure');
  } finally {
    // Restore original fetchBoardFromSheet
    apiService.fetchBoardFromSheet = originalFetchBoardFromSheet;
  }
}

/**
 * Test: loadFromGoogleSheets handles invalid response gracefully
 */
async function testLoadFromGoogleSheetsHandlesInvalidResponse() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  
  // Mock the apiService.fetchBoardFromSheet to return invalid response
  const originalFetchBoardFromSheet = apiService.fetchBoardFromSheet;
  apiService.fetchBoardFromSheet = async function() {
    return { items: [] }; // Invalid: should be array, not object
  };
  
  try {
    // Load items from Google Sheets
    const loadedItems = await testStateManager.loadFromGoogleSheets(boardType);
    
    // Verify empty array is returned for invalid response
    if (!Array.isArray(loadedItems)) {
      throw new Error('loadFromGoogleSheets did not return an array for invalid response');
    }
    
    if (loadedItems.length !== 0) {
      throw new Error(`Expected empty array for invalid response, got ${loadedItems.length} items`);
    }
    
    console.log('✓ Test passed: loadFromGoogleSheets handles invalid response gracefully');
  } finally {
    // Restore original fetchBoardFromSheet
    apiService.fetchBoardFromSheet = originalFetchBoardFromSheet;
  }
}

/**
 * Test: loadFromGoogleSheets returns empty array when no items exist
 */
async function testLoadFromGoogleSheetsReturnsEmptyArrayWhenNoItems() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  
  // Mock the apiService.fetchBoardFromSheet to return empty array
  const originalFetchBoardFromSheet = apiService.fetchBoardFromSheet;
  apiService.fetchBoardFromSheet = async function() {
    return [];
  };
  
  try {
    // Load items from Google Sheets
    const loadedItems = await testStateManager.loadFromGoogleSheets(boardType);
    
    // Verify empty array is returned
    if (!Array.isArray(loadedItems)) {
      throw new Error('loadFromGoogleSheets did not return an array');
    }
    
    if (loadedItems.length !== 0) {
      throw new Error(`Expected empty array, got ${loadedItems.length} items`);
    }
    
    console.log('✓ Test passed: loadFromGoogleSheets returns empty array when no items exist');
  } finally {
    // Restore original fetchBoardFromSheet
    apiService.fetchBoardFromSheet = originalFetchBoardFromSheet;
  }
}

/**
 * Test: mergeCloudItems merges cloud items with local items
 */
async function testMergeCloudItemsMergesItems() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  
  // Add some local items
  testStateManager.addItem(boardType, { name: 'Local item 1', category: 'daily', completed: false });
  testStateManager.addItem(boardType, { name: 'Local item 2', category: 'weekly', completed: false });
  
  // Create cloud items
  const cloudItems = [
    { id: 'cloud-1', name: 'Cloud item 1', category: 'daily', completed: false },
    { id: 'cloud-2', name: 'Cloud item 2', category: 'weekly', completed: false }
  ];
  
  // Merge cloud items
  const mergedItems = testStateManager.mergeCloudItems(boardType, cloudItems);
  
  // Verify merged items include both local and cloud items
  if (mergedItems.length < 4) {
    throw new Error(`Expected at least 4 items after merge, got ${mergedItems.length}`);
  }
  
  // Verify cloud items are in merged list
  const cloudItem1 = mergedItems.find(i => i.id === 'cloud-1');
  const cloudItem2 = mergedItems.find(i => i.id === 'cloud-2');
  
  if (!cloudItem1 || !cloudItem2) {
    throw new Error('Cloud items not found in merged list');
  }
  
  console.log('✓ Test passed: mergeCloudItems merges cloud items with local items');
}

/**
 * Test: mergeCloudItems deduplicates items by ID
 */
async function testMergeCloudItemsDeduplicatesById() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  
  // Add a local item with a specific ID
  const localItem = testStateManager.addItem(boardType, { 
    id: 'item-123',
    name: 'Shared item', 
    category: 'daily', 
    completed: false 
  });
  
  const initialCount = testStateManager.getBoard(boardType).items.length;
  
  // Create cloud items with same ID (should replace local version)
  const cloudItems = [
    { id: 'item-123', name: 'Shared item', category: 'daily', completed: true }
  ];
  
  // Merge cloud items
  const mergedItems = testStateManager.mergeCloudItems(boardType, cloudItems);
  
  // Verify no duplicate was created
  const itemsWithId123 = mergedItems.filter(i => i.id === 'item-123');
  if (itemsWithId123.length !== 1) {
    throw new Error(`Expected 1 item with ID 'item-123', got ${itemsWithId123.length}`);
  }
  
  // Verify cloud version was used (completed: true)
  if (itemsWithId123[0].completed !== true) {
    throw new Error('Cloud version was not used for duplicate item');
  }
  
  console.log('✓ Test passed: mergeCloudItems deduplicates items by ID');
}

/**
 * Test: mergeCloudItems deduplicates items by name + category
 */
async function testMergeCloudItemsDeduplicatesByNameAndCategory() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'gym'; // Use gym board which has fewer default items
  
  // Add a local item
  testStateManager.addItem(boardType, { 
    name: 'Unique test item', 
    category: 'daily', 
    completed: false 
  });
  
  const initialCount = testStateManager.getBoard(boardType).items.length;
  
  // Create cloud items with same name and category but different ID
  const cloudItems = [
    { id: 'cloud-unique', name: 'Unique test item', category: 'daily', completed: true }
  ];
  
  // Merge cloud items
  const mergedItems = testStateManager.mergeCloudItems(boardType, cloudItems);
  
  // Verify duplicate was not added
  const uniqueItems = mergedItems.filter(i => i.name === 'Unique test item' && i.category === 'daily');
  if (uniqueItems.length !== 1) {
    throw new Error(`Expected 1 'Unique test item', got ${uniqueItems.length}`);
  }
  
  console.log('✓ Test passed: mergeCloudItems deduplicates items by name + category');
}

/**
 * Test: mergeCloudItems handles empty cloud items
 */
async function testMergeCloudItemsHandlesEmptyCloudItems() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  
  // Add some local items
  testStateManager.addItem(boardType, { name: 'Local item 1', category: 'daily', completed: false });
  testStateManager.addItem(boardType, { name: 'Local item 2', category: 'weekly', completed: false });
  
  const initialCount = testStateManager.getBoard(boardType).items.length;
  
  // Merge with empty cloud items
  const mergedItems = testStateManager.mergeCloudItems(boardType, []);
  
  // Verify local items are preserved
  if (mergedItems.length !== initialCount) {
    throw new Error(`Expected ${initialCount} items after merge with empty cloud items, got ${mergedItems.length}`);
  }
  
  console.log('✓ Test passed: mergeCloudItems handles empty cloud items');
}

/**
 * Test: mergeCloudItems handles invalid cloud items gracefully
 */
async function testMergeCloudItemsHandlesInvalidCloudItems() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  
  // Add some local items
  testStateManager.addItem(boardType, { name: 'Local item 1', category: 'daily', completed: false });
  
  const initialCount = testStateManager.getBoard(boardType).items.length;
  
  // Try to merge with invalid cloud items (not an array)
  const mergedItems = testStateManager.mergeCloudItems(boardType, { items: [] });
  
  // Verify local items are preserved
  if (mergedItems.length !== initialCount) {
    throw new Error(`Expected ${initialCount} items after merge with invalid cloud items, got ${mergedItems.length}`);
  }
  
  console.log('✓ Test passed: mergeCloudItems handles invalid cloud items gracefully');
}

/**
 * Test: mergeCloudItems updates board state and saves to localStorage
 */
async function testMergeCloudItemsUpdatesBoardState() {
  // Clear localStorage first
  localStorage.clear();
  
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  
  // Add a local item
  testStateManager.addItem(boardType, { name: 'Local item', category: 'daily', completed: false });
  
  // Create cloud items
  const cloudItems = [
    { id: 'cloud-1', name: 'Cloud item', category: 'daily', completed: false }
  ];
  
  // Merge cloud items
  const mergedItems = testStateManager.mergeCloudItems(boardType, cloudItems);
  
  // Verify board state was updated
  const board = testStateManager.getBoard(boardType);
  if (board.items.length !== mergedItems.length) {
    throw new Error('Board state was not updated with merged items');
  }
  
  // Verify state was saved to localStorage
  const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
  if (!stored) {
    throw new Error('State was not saved to localStorage after merge');
  }
  
  const parsedState = JSON.parse(stored);
  if (parsedState.boards[boardType].items.length !== mergedItems.length) {
    throw new Error('Merged items were not saved to localStorage');
  }
  
  console.log('✓ Test passed: mergeCloudItems updates board state and saves to localStorage');
}

/**
 * Run all tests including mergeCloudItems tests
 */
async function runAllStateTests() {
  console.log('Running StateManager tests...\n');
  
  try {
    // Run existing tests
    await testAddItemWithCloudSyncAddsItemImmediately();
    await testAddItemWithCloudSyncPersistsToLocalStorage();
    await testAddItemWithCloudSyncTriggersCloudSync();
    await testAddItemWithCloudSyncUpdatesSyncStatusOnSuccess();
    await testAddItemWithCloudSyncUpdatesSyncStatusOnError();
    await testAddItemWithCloudSyncGeneratesUniqueId();
    
    // Run loadFromGoogleSheets tests
    await testLoadFromGoogleSheetsFetchesItems();
    await testLoadFromGoogleSheetsReturnsEmptyArrayOnFailure();
    await testLoadFromGoogleSheetsHandlesInvalidResponse();
    await testLoadFromGoogleSheetsReturnsEmptyArrayWhenNoItems();
    
    // Run mergeCloudItems tests
    await testMergeCloudItemsMergesItems();
    await testMergeCloudItemsDeduplicatesById();
    await testMergeCloudItemsDeduplicatesByNameAndCategory();
    await testMergeCloudItemsHandlesEmptyCloudItems();
    await testMergeCloudItemsHandlesInvalidCloudItems();
    await testMergeCloudItemsUpdatesBoardState();
    
    // Run deduplicateItems tests
    await runDeduplicateItemsTests();
    
    console.log('\n✓ All StateManager tests passed!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export for use in test-runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllStateTests };
}


/**
 * Test: deduplicateItems removes duplicate items by ID
 */
async function testDeduplicateItemsRemovesDuplicatesById() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  // Create items with duplicate IDs
  const items = [
    { id: 'item-1', name: 'Item 1', category: 'daily', completed: false },
    { id: 'item-2', name: 'Item 2', category: 'daily', completed: false },
    { id: 'item-1', name: 'Item 1 duplicate', category: 'daily', completed: true } // Duplicate ID
  ];
  
  // Deduplicate items
  const deduplicatedItems = testStateManager.deduplicateItems(items);
  
  // Verify duplicates were removed
  if (deduplicatedItems.length !== 2) {
    throw new Error(`Expected 2 items after deduplication, got ${deduplicatedItems.length}`);
  }
  
  // Verify only one item with ID 'item-1' exists
  const item1Count = deduplicatedItems.filter(i => i.id === 'item-1').length;
  if (item1Count !== 1) {
    throw new Error(`Expected 1 item with ID 'item-1', got ${item1Count}`);
  }
  
  console.log('✓ Test passed: deduplicateItems removes duplicate items by ID');
}

/**
 * Test: deduplicateItems removes duplicate items by name + category
 */
async function testDeduplicateItemsRemovesDuplicatesByNameAndCategory() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  // Create items with duplicate name + category but different IDs
  const items = [
    { id: 'item-1', name: 'Meal prep', category: 'daily', completed: false },
    { id: 'item-2', name: 'Dishes', category: 'daily', completed: false },
    { id: 'item-3', name: 'Meal prep', category: 'daily', completed: true } // Duplicate name + category
  ];
  
  // Deduplicate items
  const deduplicatedItems = testStateManager.deduplicateItems(items);
  
  // Verify duplicates were removed
  if (deduplicatedItems.length !== 2) {
    throw new Error(`Expected 2 items after deduplication, got ${deduplicatedItems.length}`);
  }
  
  // Verify only one 'Meal prep' item exists
  const mealPrepCount = deduplicatedItems.filter(i => i.name === 'Meal prep' && i.category === 'daily').length;
  if (mealPrepCount !== 1) {
    throw new Error(`Expected 1 'Meal prep' item, got ${mealPrepCount}`);
  }
  
  console.log('✓ Test passed: deduplicateItems removes duplicate items by name + category');
}

/**
 * Test: deduplicateItems keeps first occurrence when duplicates exist
 */
async function testDeduplicateItemsKeepsFirstOccurrence() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  // Create items with duplicate IDs
  const items = [
    { id: 'item-1', name: 'First version', category: 'daily', completed: false },
    { id: 'item-2', name: 'Item 2', category: 'daily', completed: false },
    { id: 'item-1', name: 'Second version', category: 'daily', completed: true } // Duplicate ID
  ];
  
  // Deduplicate items
  const deduplicatedItems = testStateManager.deduplicateItems(items);
  
  // Verify first occurrence is kept
  const item1 = deduplicatedItems.find(i => i.id === 'item-1');
  if (item1.name !== 'First version') {
    throw new Error(`Expected first version to be kept, got '${item1.name}'`);
  }
  
  if (item1.completed !== false) {
    throw new Error(`Expected first version's completed status to be kept, got ${item1.completed}`);
  }
  
  console.log('✓ Test passed: deduplicateItems keeps first occurrence when duplicates exist');
}

/**
 * Test: deduplicateItems handles empty array
 */
async function testDeduplicateItemsHandlesEmptyArray() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  // Deduplicate empty array
  const deduplicatedItems = testStateManager.deduplicateItems([]);
  
  // Verify empty array is returned
  if (!Array.isArray(deduplicatedItems)) {
    throw new Error('deduplicateItems did not return an array');
  }
  
  if (deduplicatedItems.length !== 0) {
    throw new Error(`Expected empty array, got ${deduplicatedItems.length} items`);
  }
  
  console.log('✓ Test passed: deduplicateItems handles empty array');
}

/**
 * Test: deduplicateItems handles invalid input gracefully
 */
async function testDeduplicateItemsHandlesInvalidInput() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  // Try to deduplicate non-array input
  const deduplicatedItems = testStateManager.deduplicateItems({ items: [] });
  
  // Verify empty array is returned for invalid input
  if (!Array.isArray(deduplicatedItems)) {
    throw new Error('deduplicateItems did not return an array for invalid input');
  }
  
  if (deduplicatedItems.length !== 0) {
    throw new Error(`Expected empty array for invalid input, got ${deduplicatedItems.length} items`);
  }
  
  console.log('✓ Test passed: deduplicateItems handles invalid input gracefully');
}

/**
 * Test: deduplicateItems handles items without ID
 */
async function testDeduplicateItemsHandlesItemsWithoutId() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  // Create items without IDs
  const items = [
    { name: 'Item 1', category: 'daily', completed: false },
    { name: 'Item 2', category: 'daily', completed: false },
    { name: 'Item 1', category: 'daily', completed: true } // Duplicate name + category
  ];
  
  // Deduplicate items
  const deduplicatedItems = testStateManager.deduplicateItems(items);
  
  // Verify duplicates were removed by name + category
  if (deduplicatedItems.length !== 2) {
    throw new Error(`Expected 2 items after deduplication, got ${deduplicatedItems.length}`);
  }
  
  console.log('✓ Test passed: deduplicateItems handles items without ID');
}

/**
 * Test: deduplicateItems handles items with different categories
 */
async function testDeduplicateItemsHandlesItemsWithDifferentCategories() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  // Create items with same name but different categories
  const items = [
    { id: 'item-1', name: 'Clean', category: 'daily', completed: false },
    { id: 'item-2', name: 'Clean', category: 'weekly', completed: false },
    { id: 'item-3', name: 'Clean', category: 'daily', completed: true } // Duplicate name + category
  ];
  
  // Deduplicate items
  const deduplicatedItems = testStateManager.deduplicateItems(items);
  
  // Verify items with different categories are not considered duplicates
  if (deduplicatedItems.length !== 2) {
    throw new Error(`Expected 2 items after deduplication, got ${deduplicatedItems.length}`);
  }
  
  // Verify both 'Clean' items with different categories exist
  const cleanDaily = deduplicatedItems.filter(i => i.name === 'Clean' && i.category === 'daily');
  const cleanWeekly = deduplicatedItems.filter(i => i.name === 'Clean' && i.category === 'weekly');
  
  if (cleanDaily.length !== 1 || cleanWeekly.length !== 1) {
    throw new Error('Items with same name but different categories should not be deduplicated');
  }
  
  console.log('✓ Test passed: deduplicateItems handles items with different categories');
}

/**
 * Test: deduplicateItems handles items with null/undefined category
 */
async function testDeduplicateItemsHandlesNullCategory() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  // Create items with null/undefined categories
  const items = [
    { id: 'item-1', name: 'Item 1', category: null, completed: false },
    { id: 'item-2', name: 'Item 2', category: undefined, completed: false },
    { id: 'item-3', name: 'Item 1', category: null, completed: true } // Duplicate name + null category
  ];
  
  // Deduplicate items
  const deduplicatedItems = testStateManager.deduplicateItems(items);
  
  // Verify duplicates with null categories are removed
  if (deduplicatedItems.length !== 2) {
    throw new Error(`Expected 2 items after deduplication, got ${deduplicatedItems.length}`);
  }
  
  console.log('✓ Test passed: deduplicateItems handles items with null/undefined category');
}

/**
 * Test: deduplicateItems returns array with no duplicates
 */
async function testDeduplicateItemsReturnsNoDuplicates() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  // Create items with multiple duplicates
  const items = [
    { id: 'item-1', name: 'Item 1', category: 'daily', completed: false },
    { id: 'item-1', name: 'Item 1', category: 'daily', completed: true },
    { id: 'item-2', name: 'Item 2', category: 'daily', completed: false },
    { id: 'item-2', name: 'Item 2', category: 'daily', completed: true },
    { id: 'item-3', name: 'Item 3', category: 'daily', completed: false }
  ];
  
  // Deduplicate items
  const deduplicatedItems = testStateManager.deduplicateItems(items);
  
  // Verify all duplicates were removed
  if (deduplicatedItems.length !== 3) {
    throw new Error(`Expected 3 items after deduplication, got ${deduplicatedItems.length}`);
  }
  
  // Verify no duplicate IDs exist
  const ids = deduplicatedItems.map(i => i.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    throw new Error('Duplicate IDs still exist after deduplication');
  }
  
  console.log('✓ Test passed: deduplicateItems returns array with no duplicates');
}

/**
 * Run all deduplicateItems tests
 */
async function runDeduplicateItemsTests() {
  console.log('\nRunning deduplicateItems tests...\n');
  
  try {
    await testDeduplicateItemsRemovesDuplicatesById();
    await testDeduplicateItemsRemovesDuplicatesByNameAndCategory();
    await testDeduplicateItemsKeepsFirstOccurrence();
    await testDeduplicateItemsHandlesEmptyArray();
    await testDeduplicateItemsHandlesInvalidInput();
    await testDeduplicateItemsHandlesItemsWithoutId();
    await testDeduplicateItemsHandlesItemsWithDifferentCategories();
    await testDeduplicateItemsHandlesNullCategory();
    await testDeduplicateItemsReturnsNoDuplicates();
    
    console.log('\n✓ All deduplicateItems tests passed!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
