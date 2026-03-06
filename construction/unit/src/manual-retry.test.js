// Test for manual retry functionality

/**
 * Test: Manual retry successfully syncs a failed item
 * Validates: Requirements 5.5 - Verify manual retry option works
 */
async function testManualRetrySuccessfullySyncsFailedItem() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create an item
    const item = new ChecklistItem(null, 'Test item', 'daily');
    const addedItem = stateManager.addItem(boardType, item);
    
    // Manually set sync status to failed (simulating a failed sync)
    addedItem.syncStatus = 'failed';
    addedItem.syncError = 'Network error: Failed to connect to Google Sheets';
    stateManager.saveState();
    
    // Verify item is in failed state
    let retrievedItem = stateManager.getItem(boardType, addedItem.id);
    if (retrievedItem.syncStatus !== 'failed') {
      throw new Error(`Item should be in failed state, got: ${retrievedItem.syncStatus}`);
    }
    
    // Mock the API to succeed on retry
    const originalAppendItem = apiService.appendItem;
    let appendItemCalled = false;
    apiService.appendItem = async (board, item) => {
      appendItemCalled = true;
      return { success: true };
    };
    
    try {
      // Call manual retry
      const retrySuccess = await stateManager.retryFailedSync(boardType, addedItem.id);
      
      // Verify retry was attempted
      if (!appendItemCalled) {
        throw new Error('API appendItem should have been called during retry');
      }
      
      // Verify retry returned success
      if (!retrySuccess) {
        throw new Error('retryFailedSync should return true on success');
      }
      
      // Verify item sync status changed to synced
      retrievedItem = stateManager.getItem(boardType, addedItem.id);
      if (retrievedItem.syncStatus !== 'synced') {
        throw new Error(`Item should be synced after retry, got: ${retrievedItem.syncStatus}`);
      }
      
      // Verify syncedAt timestamp was set
      if (!retrievedItem.syncedAt) {
        throw new Error('Item should have syncedAt timestamp after successful retry');
      }
      
      console.log('✓ Test passed: Manual retry successfully syncs a failed item');
    } finally {
      // Restore original API method
      apiService.appendItem = originalAppendItem;
    }
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Test: Manual retry updates sync status to pending before attempting sync
 * Validates: Requirements 5.5 - Verify manual retry option works
 */
async function testManualRetryUpdatesSyncStatusToPending() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create a failed item
    const item = new ChecklistItem(null, 'Test item', 'daily');
    const addedItem = stateManager.addItem(boardType, item);
    addedItem.syncStatus = 'failed';
    addedItem.syncError = 'Network error';
    stateManager.saveState();
    
    // Mock the API to delay so we can check status during retry
    const originalAppendItem = apiService.appendItem;
    let statusDuringRetry = null;
    apiService.appendItem = async (board, item) => {
      // Capture the sync status during the API call
      const currentItem = stateManager.getItem(boardType, item.id);
      statusDuringRetry = currentItem.syncStatus;
      return { success: true };
    };
    
    try {
      // Call manual retry
      await stateManager.retryFailedSync(boardType, addedItem.id);
      
      // Verify sync status was set to pending during retry
      if (statusDuringRetry !== 'pending') {
        throw new Error(`Sync status should be pending during retry, got: ${statusDuringRetry}`);
      }
      
      console.log('✓ Test passed: Manual retry updates sync status to pending before attempting sync');
    } finally {
      apiService.appendItem = originalAppendItem;
    }
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Test: Manual retry handles API failure gracefully
 * Validates: Requirements 5.5 - Verify manual retry option works
 */
async function testManualRetryHandlesAPIFailureGracefully() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create a failed item
    const item = new ChecklistItem(null, 'Test item', 'daily');
    const addedItem = stateManager.addItem(boardType, item);
    addedItem.syncStatus = 'failed';
    addedItem.syncError = 'Previous error';
    stateManager.saveState();
    
    // Mock the API to fail again
    const originalAppendItem = apiService.appendItem;
    const newErrorMessage = 'API quota exceeded';
    apiService.appendItem = async (board, item) => {
      throw new Error(newErrorMessage);
    };
    
    try {
      // Call manual retry
      const retrySuccess = await stateManager.retryFailedSync(boardType, addedItem.id);
      
      // Verify retry returned false (failure)
      if (retrySuccess) {
        throw new Error('retryFailedSync should return false on API failure');
      }
      
      // Verify item is still in failed state
      const retrievedItem = stateManager.getItem(boardType, addedItem.id);
      if (retrievedItem.syncStatus !== 'failed') {
        throw new Error(`Item should still be in failed state, got: ${retrievedItem.syncStatus}`);
      }
      
      // Verify error message was updated
      if (retrievedItem.syncError !== newErrorMessage) {
        throw new Error(`Error message should be updated to "${newErrorMessage}", got: "${retrievedItem.syncError}"`);
      }
      
      console.log('✓ Test passed: Manual retry handles API failure gracefully');
    } finally {
      apiService.appendItem = originalAppendItem;
    }
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Test: Manual retry button click triggers retry
 * Validates: Requirements 5.5 - Verify manual retry option works
 */
async function testManualRetryButtonClickTriggersRetry() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create a failed item and add it to state
    const item = new ChecklistItem(null, 'Test item', 'daily');
    const addedItem = stateManager.addItem(boardType, item);
    addedItem.syncStatus = 'failed';
    addedItem.syncError = 'Network error';
    stateManager.saveState();
    
    // Mock the API to succeed
    const originalAppendItem = apiService.appendItem;
    let retryAttempted = false;
    apiService.appendItem = async (board, item) => {
      retryAttempted = true;
      return { success: true };
    };
    
    try {
      // Simulate what the retry button does - call retryFailedSync directly
      const retrySuccess = await stateManager.retryFailedSync(boardType, addedItem.id);
      
      // Verify retry was successful
      if (!retrySuccess) {
        throw new Error('Retry should succeed');
      }
      
      // Verify API was called
      if (!retryAttempted) {
        throw new Error('API should be called during retry');
      }
      
      // Verify item is now synced
      const retrievedItem = stateManager.getItem(boardType, addedItem.id);
      if (retrievedItem.syncStatus !== 'synced') {
        throw new Error(`Item should be synced after retry, got: ${retrievedItem.syncStatus}`);
      }
      
      console.log('✓ Test passed: Manual retry button click triggers retry');
    } finally {
      apiService.appendItem = originalAppendItem;
    }
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Test: Manual retry for inventory items works
 * Validates: Requirements 5.5 - Verify manual retry option works
 */
async function testManualRetryForInventoryItems() {
  const stateManager = new StateManager();
  const boardType = 'fridge';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create a failed inventory item
    const item = new InventoryItem(null, 'Milk', 'Dairy');
    const addedItem = stateManager.addItem(boardType, item);
    addedItem.syncStatus = 'failed';
    addedItem.syncError = 'Network error';
    stateManager.saveState();
    
    // Mock the API to succeed
    const originalAppendItem = apiService.appendItem;
    let appendItemCalled = false;
    apiService.appendItem = async (board, item) => {
      appendItemCalled = true;
      return { success: true };
    };
    
    try {
      // Call manual retry
      const retrySuccess = await stateManager.retryFailedSync(boardType, addedItem.id);
      
      // Verify retry was successful
      if (!retrySuccess) {
        throw new Error('Manual retry should succeed for inventory items');
      }
      
      // Verify API was called
      if (!appendItemCalled) {
        throw new Error('API should be called during retry');
      }
      
      // Verify item is now synced
      const retrievedItem = stateManager.getItem(boardType, addedItem.id);
      if (retrievedItem.syncStatus !== 'synced') {
        throw new Error(`Inventory item should be synced after retry, got: ${retrievedItem.syncStatus}`);
      }
      
      console.log('✓ Test passed: Manual retry for inventory items works');
    } finally {
      apiService.appendItem = originalAppendItem;
    }
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Test: Manual retry for updated items (not new items)
 * Validates: Requirements 5.5 - Verify manual retry option works
 */
async function testManualRetryForUpdatedItems() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create an item that was previously synced
    const item = new ChecklistItem(null, 'Test item', 'daily');
    const addedItem = stateManager.addItem(boardType, item);
    addedItem.syncedAt = new Date().toISOString(); // Mark as previously synced
    addedItem.syncStatus = 'failed';
    addedItem.syncError = 'Update failed';
    stateManager.saveState();
    
    // Mock the API to succeed on update
    const originalUpdateItemInSheet = apiService.updateItemInSheet;
    let updateItemInSheetCalled = false;
    apiService.updateItemInSheet = async (board, itemId, updates) => {
      updateItemInSheetCalled = true;
      return { success: true };
    };
    
    try {
      // Call manual retry
      const retrySuccess = await stateManager.retryFailedSync(boardType, addedItem.id);
      
      // Verify retry was successful
      if (!retrySuccess) {
        throw new Error('Manual retry should succeed for updated items');
      }
      
      // Verify updateItemInSheet was called (not appendItem)
      if (!updateItemInSheetCalled) {
        throw new Error('updateItemInSheet should be called for previously synced items');
      }
      
      // Verify item is now synced
      const retrievedItem = stateManager.getItem(boardType, addedItem.id);
      if (retrievedItem.syncStatus !== 'synced') {
        throw new Error(`Item should be synced after retry, got: ${retrievedItem.syncStatus}`);
      }
      
      console.log('✓ Test passed: Manual retry for updated items works');
    } finally {
      apiService.updateItemInSheet = originalUpdateItemInSheet;
    }
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Test: Manual retry returns false for non-failed items
 * Validates: Requirements 5.5 - Verify manual retry option works
 */
async function testManualRetryReturnsfalseForNonFailedItems() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create a synced item
    const item = new ChecklistItem(null, 'Test item', 'daily');
    const addedItem = stateManager.addItem(boardType, item);
    addedItem.syncStatus = 'synced';
    stateManager.saveState();
    
    // Call manual retry on a synced item
    const retrySuccess = await stateManager.retryFailedSync(boardType, addedItem.id);
    
    // Verify retry returned false (item is not in failed state)
    if (retrySuccess) {
      throw new Error('retryFailedSync should return false for non-failed items');
    }
    
    // Verify item is still synced
    const retrievedItem = stateManager.getItem(boardType, addedItem.id);
    if (retrievedItem.syncStatus !== 'synced') {
      throw new Error(`Item should still be synced, got: ${retrievedItem.syncStatus}`);
    }
    
    console.log('✓ Test passed: Manual retry returns false for non-failed items');
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Test: Manual retry returns false for non-existent items
 * Validates: Requirements 5.5 - Verify manual retry option works
 */
async function testManualRetryReturnsfalseForNonExistentItems() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Call manual retry on a non-existent item
    const retrySuccess = await stateManager.retryFailedSync(boardType, 'non-existent-id');
    
    // Verify retry returned false
    if (retrySuccess) {
      throw new Error('retryFailedSync should return false for non-existent items');
    }
    
    console.log('✓ Test passed: Manual retry returns false for non-existent items');
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Test: Manual retry notifies listeners of retry attempt
 * Validates: Requirements 5.5 - Verify manual retry option works
 */
async function testManualRetryNotifiesListenersOfRetryAttempt() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create a failed item
    const item = new ChecklistItem(null, 'Test item', 'daily');
    const addedItem = stateManager.addItem(boardType, item);
    addedItem.syncStatus = 'failed';
    addedItem.syncError = 'Network error';
    stateManager.saveState();
    
    // Subscribe to state changes
    let retryNotificationReceived = false;
    const unsubscribe = stateManager.subscribe((board, action) => {
      if (action === 'sync-retry') {
        retryNotificationReceived = true;
      }
    });
    
    // Mock the API to succeed
    const originalAppendItem = apiService.appendItem;
    apiService.appendItem = async (board, item) => {
      return { success: true };
    };
    
    try {
      // Call manual retry
      await stateManager.retryFailedSync(boardType, addedItem.id);
      
      // Verify retry notification was sent
      if (!retryNotificationReceived) {
        throw new Error('Listeners should be notified of retry attempt');
      }
      
      console.log('✓ Test passed: Manual retry notifies listeners of retry attempt');
    } finally {
      apiService.appendItem = originalAppendItem;
      unsubscribe();
    }
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Running manual retry tests...\n');
  
  try {
    await testManualRetrySuccessfullySyncsFailedItem();
    await testManualRetryUpdatesSyncStatusToPending();
    await testManualRetryHandlesAPIFailureGracefully();
    await testManualRetryButtonClickTriggersRetry();
    await testManualRetryForInventoryItems();
    await testManualRetryForUpdatedItems();
    await testManualRetryReturnsfalseForNonFailedItems();
    await testManualRetryReturnsfalseForNonExistentItems();
    await testManualRetryNotifiesListenersOfRetryAttempt();
    
    console.log('\n✓ All manual retry tests passed!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export for use in test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && require.main === module) {
  runAllTests();
}
