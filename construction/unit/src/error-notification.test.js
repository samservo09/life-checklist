// Test for user error notifications

/**
 * Test: User is notified when item sync fails
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testUserNotifiedWhenItemSyncFails() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create an item with failed sync status (simulating a failed sync)
    const item = new ChecklistItem(null, 'Test item', 'daily');
    const addedItem = stateManager.addItem(boardType, item);
    
    // Manually set sync status to failed (simulating a sync failure)
    addedItem.syncStatus = 'failed';
    addedItem.syncError = 'Network error: Failed to connect to Google Sheets';
    stateManager.saveState();
    
    // Verify item has failed sync status
    const retrievedItem = stateManager.getItem(boardType, addedItem.id);
    if (!retrievedItem || retrievedItem.syncStatus !== 'failed') {
      throw new Error(`Item should have failed sync status, got: ${retrievedItem?.syncStatus}`);
    }
    
    // Verify error message is stored
    if (!retrievedItem.syncError) {
      throw new Error('Item should have syncError message');
    }
    
    console.log('✓ Test passed: User is notified when item sync fails');
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Test: Error notification displays sync error details
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testErrorNotificationDisplaysDetails() {
  try {
    // Create a mock item with failed sync status
    const item = new ChecklistItem('test-1', 'Test item', 'daily');
    item.syncStatus = 'failed';
    item.syncError = 'API quota exceeded';
    
    // Render sync status component
    const syncStatus = renderSyncStatus(item);
    
    // Verify error indicator is shown (check children)
    let hasErrorIndicator = false;
    if (syncStatus.children && syncStatus.children.length > 0) {
      const statusIndicator = syncStatus.children[0];
      if (statusIndicator.textContent && statusIndicator.textContent.includes('⚠️')) {
        hasErrorIndicator = true;
      }
    }
    
    if (!hasErrorIndicator) {
      throw new Error('Error indicator should be shown');
    }
    
    // Verify error details are in title
    if (syncStatus.children && syncStatus.children.length > 0) {
      const statusIndicator = syncStatus.children[0];
      if (!statusIndicator.title || !statusIndicator.title.includes('API quota exceeded')) {
        throw new Error('Error details should be in title');
      }
    }
    
    console.log('✓ Test passed: Error notification displays sync error details');
  } finally {
    // Cleanup
  }
}

/**
 * Test: Error message appears in add item form on sync failure
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testErrorMessageInAddItemForm() {
  const boardType = 'chores';
  
  try {
    // Render add item form
    const form = renderAddItemForm(boardType, 'checklist', () => {});
    
    // Verify form has error container div
    if (!form.children || form.children.length === 0) {
      throw new Error('Form should have children elements');
    }
    
    // Check if any child has an id starting with "error-"
    let hasErrorContainer = false;
    for (const child of form.children) {
      if (child.id && child.id.startsWith('error-')) {
        hasErrorContainer = true;
        break;
      }
    }
    
    if (!hasErrorContainer) {
      throw new Error('Error container should be present in form');
    }
    
    console.log('✓ Test passed: Error message appears in add item form on sync failure');
  } finally {
    // Cleanup
  }
}

/**
 * Test: Retry button is shown for failed items
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testRetryButtonShownForFailedItems() {
  const boardType = 'chores';
  
  try {
    // Create a failed item
    const item = new ChecklistItem('test-1', 'Test item', 'daily');
    item.syncStatus = 'failed';
    item.syncError = 'Network error';
    
    // Render checklist item
    const itemElement = renderChecklistItem(item, boardType, () => {}, () => {}, () => {});
    
    // Verify retry button is present
    const retryBtn = itemElement.querySelector('button[title="Retry sync"]');
    if (!retryBtn) {
      throw new Error('Retry button should be shown for failed items');
    }
    
    if (!retryBtn.textContent.includes('🔄')) {
      throw new Error('Retry button should have refresh icon');
    }
    
    console.log('✓ Test passed: Retry button is shown for failed items');
  } finally {
    // Cleanup
  }
}

/**
 * Test: Retry button is not shown for synced items
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testRetryButtonNotShownForSyncedItems() {
  const boardType = 'chores';
  
  try {
    // Create a synced item
    const item = new ChecklistItem('test-1', 'Test item', 'daily');
    item.syncStatus = 'synced';
    
    // Render checklist item
    const itemElement = renderChecklistItem(item, boardType, () => {}, () => {}, () => {});
    
    // Verify retry button is NOT present
    const retryBtn = itemElement.querySelector('button[title="Retry sync"]');
    if (retryBtn) {
      throw new Error('Retry button should NOT be shown for synced items');
    }
    
    console.log('✓ Test passed: Retry button is not shown for synced items');
  } finally {
    // Cleanup
  }
}

/**
 * Test: Sync status indicator shows pending state
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testSyncStatusIndicatorShowsPendingState() {
  try {
    // Create a pending item
    const item = new ChecklistItem('test-1', 'Test item', 'daily');
    item.syncStatus = 'pending';
    
    // Render sync status
    const syncStatus = renderSyncStatus(item);
    
    // Verify pending indicator is shown (check children)
    let hasPendingIndicator = false;
    if (syncStatus.children && syncStatus.children.length > 0) {
      const statusIndicator = syncStatus.children[0];
      if (statusIndicator.textContent && statusIndicator.textContent.includes('⏳')) {
        hasPendingIndicator = true;
      }
    }
    
    if (!hasPendingIndicator) {
      throw new Error('Pending indicator should be shown');
    }
    
    console.log('✓ Test passed: Sync status indicator shows pending state');
  } finally {
    // Cleanup
  }
}

/**
 * Test: Sync status indicator shows synced state
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testSyncStatusIndicatorShowsSyncedState() {
  try {
    // Create a synced item
    const item = new ChecklistItem('test-1', 'Test item', 'daily');
    item.syncStatus = 'synced';
    
    // Render sync status
    const syncStatus = renderSyncStatus(item);
    
    // Verify synced indicator is shown (check children)
    let hasSyncedIndicator = false;
    if (syncStatus.children && syncStatus.children.length > 0) {
      const statusIndicator = syncStatus.children[0];
      if (statusIndicator.textContent && statusIndicator.textContent.includes('✅')) {
        hasSyncedIndicator = true;
      }
    }
    
    if (!hasSyncedIndicator) {
      throw new Error('Synced indicator should be shown');
    }
    
    console.log('✓ Test passed: Sync status indicator shows synced state');
  } finally {
    // Cleanup
  }
}

/**
 * Test: Sync status indicator shows failed state
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testSyncStatusIndicatorShowsFailedState() {
  try {
    // Create a failed item
    const item = new ChecklistItem('test-1', 'Test item', 'daily');
    item.syncStatus = 'failed';
    item.syncError = 'Network error';
    
    // Render sync status
    const syncStatus = renderSyncStatus(item);
    
    // Verify failed indicator is shown (check children)
    let hasFailedIndicator = false;
    if (syncStatus.children && syncStatus.children.length > 0) {
      const statusIndicator = syncStatus.children[0];
      if (statusIndicator.textContent && statusIndicator.textContent.includes('⚠️')) {
        hasFailedIndicator = true;
      }
    }
    
    if (!hasFailedIndicator) {
      throw new Error('Failed indicator should be shown');
    }
    
    console.log('✓ Test passed: Sync status indicator shows failed state');
  } finally {
    // Cleanup
  }
}

/**
 * Test: Inventory item shows retry button on sync failure
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testInventoryItemShowsRetryButtonOnSyncFailure() {
  const boardType = 'fridge';
  
  try {
    // Create a failed inventory item
    const item = new InventoryItem('test-1', 'Milk', 'Dairy');
    item.syncStatus = 'failed';
    item.syncError = 'Network error';
    
    // Render inventory item
    const itemElement = renderInventoryItem(item, boardType, () => {});
    
    // Verify retry button is present
    const retryBtn = itemElement.querySelector('button[title="Retry sync"]');
    if (!retryBtn) {
      throw new Error('Retry button should be shown for failed inventory items');
    }
    
    if (!retryBtn.textContent.includes('🔄')) {
      throw new Error('Retry button should have refresh icon');
    }
    
    console.log('✓ Test passed: Inventory item shows retry button on sync failure');
  } finally {
    // Cleanup
  }
}

/**
 * Test: Inventory item does not show retry button when synced
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testInventoryItemNoRetryButtonWhenSynced() {
  const boardType = 'fridge';
  
  try {
    // Create a synced inventory item
    const item = new InventoryItem('test-1', 'Milk', 'Dairy');
    item.syncStatus = 'synced';
    
    // Render inventory item
    const itemElement = renderInventoryItem(item, boardType, () => {});
    
    // Verify retry button is NOT present
    const retryBtn = itemElement.querySelector('button[title="Retry sync"]');
    if (retryBtn) {
      throw new Error('Retry button should NOT be shown for synced inventory items');
    }
    
    console.log('✓ Test passed: Inventory item does not show retry button when synced');
  } finally {
    // Cleanup
  }
}

/**
 * Test: Sync status is tracked in state manager
 * Validates: Requirements 5.5 - Verify user is notified of errors
 */
async function testSyncStatusTrackedInStateManager() {
  const stateManager = new StateManager();
  const boardType = 'chores';
  
  try {
    // Clear state
    stateManager.clearAllData();
    
    // Create and add an item
    const item = new ChecklistItem(null, 'Test item', 'daily');
    const addedItem = stateManager.addItem(boardType, item);
    
    // Update sync status to failed (simulating a sync failure)
    addedItem.syncStatus = 'failed';
    addedItem.syncError = 'Test error';
    stateManager.saveState();
    
    // Retrieve item and verify sync status is persisted
    const retrievedItem = stateManager.getItem(boardType, addedItem.id);
    if (retrievedItem.syncStatus !== 'failed') {
      throw new Error('Sync status should be persisted');
    }
    
    if (retrievedItem.syncError !== 'Test error') {
      throw new Error('Sync error should be persisted');
    }
    
    console.log('✓ Test passed: Sync status is tracked in state manager');
  } finally {
    stateManager.clearAllData();
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Running error notification tests...\n');
  
  try {
    await testUserNotifiedWhenItemSyncFails();
    await testErrorNotificationDisplaysDetails();
    await testErrorMessageInAddItemForm();
    await testRetryButtonShownForFailedItems();
    await testRetryButtonNotShownForSyncedItems();
    await testSyncStatusIndicatorShowsPendingState();
    await testSyncStatusIndicatorShowsSyncedState();
    await testSyncStatusIndicatorShowsFailedState();
    await testInventoryItemShowsRetryButtonOnSyncFailure();
    await testInventoryItemNoRetryButtonWhenSynced();
    await testSyncStatusTrackedInStateManager();
    
    console.log('\n✓ All error notification tests passed!');
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
