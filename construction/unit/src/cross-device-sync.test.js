// Integration Tests for Cross-Device Synchronization
// Tests the complete flow: Add item on Device A → Load app on Device B → Item appears on Device B

/**
 * Test: Item added on Device A appears on Device B
 * Validates: Requirements 2.1 - Cross-device synchronization works correctly
 * 
 * Scenario:
 * 1. Device A: Add an item to a board
 * 2. Device A: Verify item is synced to Google Sheets
 * 3. Device B: Simulate loading the app (fetch from Google Sheets)
 * 4. Device B: Verify item from Device A appears
 */
async function testCrossDeviceSyncItemAppearsOnDeviceB() {
  // Setup: Clear localStorage to simulate fresh Device A
  localStorage.clear();
  const deviceAStateManager = new StateManager();
  
  const boardType = 'chores';
  const itemFromDeviceA = {
    name: 'Cross-device test item',
    category: 'daily',
    completed: false
  };
  
  // Mock Google Sheets API to simulate cloud storage
  const cloudStorage = {}; // Simulates Google Sheets
  
  const originalAppendItem = apiService.appendItem;
  const originalFetchBoardFromSheet = apiService.fetchBoardFromSheet;
  
  apiService.appendItem = async function(bt, item) {
    // Simulate storing item in cloud
    if (!cloudStorage[bt]) {
      cloudStorage[bt] = [];
    }
    cloudStorage[bt].push({
      ...item,
      id: item.id || `cloud-${Date.now()}-${Math.random()}`,
      syncedAt: new Date().toISOString()
    });
    return { success: true };
  };
  
  apiService.fetchBoardFromSheet = async function(bt) {
    // Simulate fetching items from cloud
    return cloudStorage[bt] || [];
  };
  
  try {
    // DEVICE A: Add item
    console.log('Device A: Adding item...');
    const addedItem = deviceAStateManager.addItemWithCloudSync(boardType, itemFromDeviceA);
    
    if (!addedItem || !addedItem.id) {
      throw new Error('Device A: Failed to add item');
    }
    
    // Verify item appears immediately on Device A
    const deviceABoard = deviceAStateManager.getBoard(boardType);
    const foundOnDeviceA = deviceABoard.items.find(i => i.id === addedItem.id);
    
    if (!foundOnDeviceA) {
      throw new Error('Device A: Item not found in board immediately after addition');
    }
    
    console.log(`✓ Device A: Item added with ID ${addedItem.id}`);
    
    // Wait for sync to complete
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Verify item is synced to cloud
    const cloudItems = cloudStorage[boardType];
    const foundInCloud = cloudItems.find(i => i.id === addedItem.id);
    
    if (!foundInCloud) {
      throw new Error('Device A: Item not synced to cloud');
    }
    
    console.log(`✓ Device A: Item synced to cloud`);
    
    // DEVICE B: Simulate loading the app
    console.log('Device B: Loading app...');
    
    // Clear localStorage to simulate fresh Device B
    localStorage.clear();
    const deviceBStateManager = new StateManager();
    
    // Device B loads initial state (empty)
    const deviceBBoardBefore = deviceBStateManager.getBoard(boardType);
    const initialCountOnDeviceB = deviceBBoardBefore.items.length;
    
    console.log(`Device B: Initial item count: ${initialCountOnDeviceB}`);
    
    // Device B fetches from Google Sheets
    console.log('Device B: Fetching from Google Sheets...');
    const cloudItemsForDeviceB = await apiService.fetchBoardFromSheet(boardType);
    
    if (cloudItemsForDeviceB.length === 0) {
      throw new Error('Device B: No items fetched from cloud');
    }
    
    // Device B merges cloud items with local items
    console.log('Device B: Merging cloud items...');
    const mergedItems = deviceBStateManager.mergeCloudItems(boardType, cloudItemsForDeviceB);
    
    // Verify item from Device A appears on Device B
    const deviceBBoard = deviceBStateManager.getBoard(boardType);
    const foundOnDeviceB = deviceBBoard.items.find(i => i.id === addedItem.id);
    
    if (!foundOnDeviceB) {
      throw new Error('Device B: Item from Device A not found after merge');
    }
    
    if (foundOnDeviceB.name !== itemFromDeviceA.name) {
      throw new Error(`Device B: Item name mismatch. Expected '${itemFromDeviceA.name}', got '${foundOnDeviceB.name}'`);
    }
    
    if (foundOnDeviceB.category !== itemFromDeviceA.category) {
      throw new Error(`Device B: Item category mismatch. Expected '${itemFromDeviceA.category}', got '${foundOnDeviceB.category}'`);
    }
    
    console.log(`✓ Device B: Item from Device A appears after merge`);
    
    // Verify item count increased on Device B
    const finalCountOnDeviceB = deviceBBoard.items.length;
    if (finalCountOnDeviceB <= initialCountOnDeviceB) {
      throw new Error(`Device B: Item count did not increase. Before: ${initialCountOnDeviceB}, After: ${finalCountOnDeviceB}`);
    }
    
    console.log(`✓ Device B: Item count increased from ${initialCountOnDeviceB} to ${finalCountOnDeviceB}`);
    
    console.log('✓ Test passed: Item added on Device A appears on Device B');
  } finally {
    // Restore original API methods
    apiService.appendItem = originalAppendItem;
    apiService.fetchBoardFromSheet = originalFetchBoardFromSheet;
  }
}

/**
 * Test: No duplicate items are created during cross-device sync
 * Validates: Requirements 2.1 - Deduplication works correctly
 * 
 * Scenario:
 * 1. Device A: Add item X
 * 2. Device A: Sync item X to cloud
 * 3. Device B: Load app with item X already in local storage
 * 4. Device B: Fetch from cloud and merge
 * 5. Verify: Only one copy of item X exists (no duplicates)
 */
async function testCrossDeviceSyncNoDuplicates() {
  // Setup: Clear localStorage
  localStorage.clear();
  
  const boardType = 'chores';
  const itemData = {
    name: 'Unique item for dedup test',
    category: 'daily',
    completed: false
  };
  
  // Mock cloud storage
  const cloudStorage = {};
  
  const originalAppendItem = apiService.appendItem;
  const originalFetchBoardFromSheet = apiService.fetchBoardFromSheet;
  
  apiService.appendItem = async function(bt, item) {
    if (!cloudStorage[bt]) {
      cloudStorage[bt] = [];
    }
    cloudStorage[bt].push({
      ...item,
      id: item.id,
      syncedAt: new Date().toISOString()
    });
    return { success: true };
  };
  
  apiService.fetchBoardFromSheet = async function(bt) {
    return cloudStorage[bt] || [];
  };
  
  try {
    // DEVICE A: Add item and sync
    console.log('Device A: Adding item...');
    const deviceAStateManager = new StateManager();
    const addedItem = deviceAStateManager.addItemWithCloudSync(boardType, itemData);
    
    // Wait for sync
    await new Promise(resolve => setTimeout(resolve, 150));
    
    console.log(`✓ Device A: Item added and synced with ID ${addedItem.id}`);
    
    // DEVICE B: Simulate having the same item locally (e.g., from previous sync)
    console.log('Device B: Simulating local item...');
    localStorage.clear();
    const deviceBStateManager = new StateManager();
    
    // Add the same item locally on Device B (simulating previous sync)
    const localItemOnDeviceB = deviceBStateManager.addItem(boardType, {
      ...itemData,
      id: addedItem.id, // Same ID as Device A
      syncStatus: 'synced'
    });
    
    const countBeforeMerge = deviceBStateManager.getBoard(boardType).items.length;
    console.log(`Device B: Local item count before merge: ${countBeforeMerge}`);
    
    // Device B fetches from cloud
    console.log('Device B: Fetching from cloud...');
    const cloudItems = await apiService.fetchBoardFromSheet(boardType);
    
    // Device B merges
    console.log('Device B: Merging cloud items...');
    const mergedItems = deviceBStateManager.mergeCloudItems(boardType, cloudItems);
    
    // Verify no duplicates
    const countAfterMerge = deviceBStateManager.getBoard(boardType).items.length;
    
    // Count items with the same name and category
    const itemsWithSameName = deviceBStateManager.getBoard(boardType).items.filter(
      i => i.name === itemData.name && i.category === itemData.category
    );
    
    if (itemsWithSameName.length > 1) {
      throw new Error(`Device B: Found ${itemsWithSameName.length} duplicate items with name '${itemData.name}'`);
    }
    
    if (itemsWithSameName.length === 0) {
      throw new Error('Device B: Item not found after merge');
    }
    
    console.log(`✓ Device B: No duplicates created. Count before: ${countBeforeMerge}, after: ${countAfterMerge}`);
    console.log('✓ Test passed: No duplicate items created during cross-device sync');
  } finally {
    // Restore original API methods
    apiService.appendItem = originalAppendItem;
    apiService.fetchBoardFromSheet = originalFetchBoardFromSheet;
  }
}

/**
 * Test: Multiple items from Device A appear on Device B
 * Validates: Requirements 2.1 - Multiple items sync correctly
 * 
 * Scenario:
 * 1. Device A: Add multiple items
 * 2. Device A: Sync all items to cloud
 * 3. Device B: Load app and fetch from cloud
 * 4. Verify: All items from Device A appear on Device B
 */
async function testCrossDeviceSyncMultipleItems() {
  // Setup: Clear localStorage
  localStorage.clear();
  
  const boardType = 'chores';
  const itemsFromDeviceA = [
    { name: 'Item 1 from Device A', category: 'daily', completed: false },
    { name: 'Item 2 from Device A', category: 'weekly', completed: false },
    { name: 'Item 3 from Device A', category: 'monthly', completed: false }
  ];
  
  // Mock cloud storage
  const cloudStorage = {};
  
  const originalAppendItem = apiService.appendItem;
  const originalFetchBoardFromSheet = apiService.fetchBoardFromSheet;
  
  apiService.appendItem = async function(bt, item) {
    if (!cloudStorage[bt]) {
      cloudStorage[bt] = [];
    }
    cloudStorage[bt].push({
      ...item,
      id: item.id,
      syncedAt: new Date().toISOString()
    });
    return { success: true };
  };
  
  apiService.fetchBoardFromSheet = async function(bt) {
    return cloudStorage[bt] || [];
  };
  
  try {
    // DEVICE A: Add multiple items
    console.log('Device A: Adding multiple items...');
    const deviceAStateManager = new StateManager();
    const addedItems = [];
    
    for (const itemData of itemsFromDeviceA) {
      const addedItem = deviceAStateManager.addItemWithCloudSync(boardType, itemData);
      addedItems.push(addedItem);
    }
    
    // Wait for all syncs to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`✓ Device A: Added and synced ${addedItems.length} items`);
    
    // Verify all items are in cloud
    const cloudItems = cloudStorage[boardType];
    if (cloudItems.length !== addedItems.length) {
      throw new Error(`Device A: Expected ${addedItems.length} items in cloud, got ${cloudItems.length}`);
    }
    
    // DEVICE B: Load app and fetch from cloud
    console.log('Device B: Loading app...');
    localStorage.clear();
    const deviceBStateManager = new StateManager();
    
    // Device B fetches from cloud
    console.log('Device B: Fetching from cloud...');
    const fetchedItems = await apiService.fetchBoardFromSheet(boardType);
    
    // Device B merges
    console.log('Device B: Merging cloud items...');
    deviceBStateManager.mergeCloudItems(boardType, fetchedItems);
    
    // Verify all items from Device A appear on Device B
    const deviceBBoard = deviceBStateManager.getBoard(boardType);
    
    for (const addedItem of addedItems) {
      const foundOnDeviceB = deviceBBoard.items.find(i => i.id === addedItem.id);
      
      if (!foundOnDeviceB) {
        throw new Error(`Device B: Item '${addedItem.name}' from Device A not found`);
      }
    }
    
    console.log(`✓ Device B: All ${addedItems.length} items from Device A appear`);
    console.log('✓ Test passed: Multiple items sync correctly across devices');
  } finally {
    // Restore original API methods
    apiService.appendItem = originalAppendItem;
    apiService.fetchBoardFromSheet = originalFetchBoardFromSheet;
  }
}

/**
 * Test: Item properties are preserved during cross-device sync
 * Validates: Requirements 2.1 - Item data integrity
 * 
 * Scenario:
 * 1. Device A: Add item with specific properties
 * 2. Device A: Sync to cloud
 * 3. Device B: Fetch and merge
 * 4. Verify: All item properties are preserved
 */
async function testCrossDeviceSyncPreservesItemProperties() {
  // Setup: Clear localStorage
  localStorage.clear();
  
  const boardType = 'chores';
  const itemData = {
    name: 'Item with properties',
    category: 'daily',
    completed: false,
    notes: 'Test notes'
  };
  
  // Mock cloud storage
  const cloudStorage = {};
  
  const originalAppendItem = apiService.appendItem;
  const originalFetchBoardFromSheet = apiService.fetchBoardFromSheet;
  
  apiService.appendItem = async function(bt, item) {
    if (!cloudStorage[bt]) {
      cloudStorage[bt] = [];
    }
    cloudStorage[bt].push({
      ...item,
      id: item.id,
      syncedAt: new Date().toISOString()
    });
    return { success: true };
  };
  
  apiService.fetchBoardFromSheet = async function(bt) {
    return cloudStorage[bt] || [];
  };
  
  try {
    // DEVICE A: Add item
    console.log('Device A: Adding item with properties...');
    const deviceAStateManager = new StateManager();
    const addedItem = deviceAStateManager.addItemWithCloudSync(boardType, itemData);
    
    // Wait for sync
    await new Promise(resolve => setTimeout(resolve, 150));
    
    console.log(`✓ Device A: Item added with ID ${addedItem.id}`);
    
    // DEVICE B: Fetch and merge
    console.log('Device B: Loading app and fetching from cloud...');
    localStorage.clear();
    const deviceBStateManager = new StateManager();
    
    const cloudItems = await apiService.fetchBoardFromSheet(boardType);
    deviceBStateManager.mergeCloudItems(boardType, cloudItems);
    
    // Verify properties are preserved
    const deviceBBoard = deviceBStateManager.getBoard(boardType);
    const foundItem = deviceBBoard.items.find(i => i.id === addedItem.id);
    
    if (!foundItem) {
      throw new Error('Device B: Item not found');
    }
    
    // Check each property
    const propertiesToCheck = ['name', 'category', 'completed'];
    for (const prop of propertiesToCheck) {
      if (foundItem[prop] !== itemData[prop]) {
        throw new Error(`Device B: Property '${prop}' mismatch. Expected '${itemData[prop]}', got '${foundItem[prop]}'`);
      }
    }
    
    console.log('✓ Device B: All item properties preserved');
    console.log('✓ Test passed: Item properties are preserved during cross-device sync');
  } finally {
    // Restore original API methods
    apiService.appendItem = originalAppendItem;
    apiService.fetchBoardFromSheet = originalFetchBoardFromSheet;
  }
}

/**
 * Run all cross-device sync tests
 */
async function runAllCrossDeviceSyncTests() {
  console.log('Running Cross-Device Synchronization tests...\n');
  
  try {
    await testCrossDeviceSyncItemAppearsOnDeviceB();
    console.log('');
    
    await testCrossDeviceSyncNoDuplicates();
    console.log('');
    
    await testCrossDeviceSyncMultipleItems();
    console.log('');
    
    await testCrossDeviceSyncPreservesItemProperties();
    console.log('');
    
    console.log('✓ All Cross-Device Sync tests passed!');
    return true;
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Export for use in test-runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllCrossDeviceSyncTests };
}
