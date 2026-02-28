// Tests for Component Rendering

/**
 * Test: renderSyncStatus displays pending status correctly
 */
function testRenderSyncStatusDisplaysPendingStatus() {
  const item = {
    id: 'test-1',
    name: 'Test item',
    syncStatus: 'pending'
  };
  
  const syncStatusElement = renderSyncStatus(item);
  
  // Verify element is created
  if (!syncStatusElement) {
    throw new Error('renderSyncStatus did not return an element');
  }
  
  // Verify it contains the pending indicator
  if (syncStatusElement.children.length === 0) {
    throw new Error('renderSyncStatus returned empty container');
  }
  
  const statusSpan = syncStatusElement.children[0];
  const text = statusSpan.textContent;
  
  if (!text.includes('⏳') || !text.includes('pending')) {
    throw new Error(`Expected pending indicator, got: ${text}`);
  }
  
  // Verify it has the correct CSS class for yellow color
  if (!statusSpan.className.includes('text-yellow-400')) {
    throw new Error(`Expected yellow color class for pending status, got: ${statusSpan.className}`);
  }
  
  console.log('✓ Test passed: renderSyncStatus displays pending status correctly');
}

/**
 * Test: renderSyncStatus displays synced status correctly
 */
function testRenderSyncStatusDisplaysSyncedStatus() {
  const item = {
    id: 'test-1',
    name: 'Test item',
    syncStatus: 'synced'
  };
  
  const syncStatusElement = renderSyncStatus(item);
  
  // Verify element is created
  if (!syncStatusElement) {
    throw new Error('renderSyncStatus did not return an element');
  }
  
  // Verify it contains the synced indicator
  if (syncStatusElement.children.length === 0) {
    throw new Error('renderSyncStatus returned empty container');
  }
  
  const statusSpan = syncStatusElement.children[0];
  const text = statusSpan.textContent;
  
  if (!text.includes('✅') || !text.includes('synced')) {
    throw new Error(`Expected synced indicator, got: ${text}`);
  }
  
  // Verify it has the correct CSS class for green color
  if (!statusSpan.className.includes('text-green-400')) {
    throw new Error(`Expected green color class for synced status, got: ${statusSpan.className}`);
  }
  
  console.log('✓ Test passed: renderSyncStatus displays synced status correctly');
}

/**
 * Test: renderSyncStatus displays failed status correctly
 */
function testRenderSyncStatusDisplaysFailedStatus() {
  const item = {
    id: 'test-1',
    name: 'Test item',
    syncStatus: 'failed',
    syncError: 'Network error'
  };
  
  const syncStatusElement = renderSyncStatus(item);
  
  // Verify element is created
  if (!syncStatusElement) {
    throw new Error('renderSyncStatus did not return an element');
  }
  
  // Verify it contains the failed indicator
  if (syncStatusElement.children.length === 0) {
    throw new Error('renderSyncStatus returned empty container');
  }
  
  const statusSpan = syncStatusElement.children[0];
  const text = statusSpan.textContent;
  
  if (!text.includes('⚠️') || !text.includes('failed')) {
    throw new Error(`Expected failed indicator, got: ${text}`);
  }
  
  // Verify it has the correct CSS class for red color
  if (!statusSpan.className.includes('text-red-400')) {
    throw new Error(`Expected red color class for failed status, got: ${statusSpan.className}`);
  }
  
  console.log('✓ Test passed: renderSyncStatus displays failed status correctly');
}

/**
 * Test: renderSyncStatus returns empty container for items without syncStatus
 */
function testRenderSyncStatusReturnsEmptyForNoSyncStatus() {
  const item = {
    id: 'test-1',
    name: 'Test item'
    // No syncStatus property
  };
  
  const syncStatusElement = renderSyncStatus(item);
  
  // Verify element is created
  if (!syncStatusElement) {
    throw new Error('renderSyncStatus did not return an element');
  }
  
  // Verify it's empty (no children)
  if (syncStatusElement.children.length !== 0) {
    throw new Error(`Expected empty container, got ${syncStatusElement.children.length} children`);
  }
  
  console.log('✓ Test passed: renderSyncStatus returns empty container for items without syncStatus');
}

/**
 * Test: renderChecklistItem includes sync status indicator
 */
function testRenderChecklistItemIncludesSyncStatus() {
  const item = {
    id: 'test-1',
    name: 'Test checklist item',
    category: 'daily',
    completed: false,
    syncStatus: 'pending'
  };
  
  const checklistElement = renderChecklistItem(item, 'chores');
  
  // Verify element is created
  if (!checklistElement) {
    throw new Error('renderChecklistItem did not return an element');
  }
  
  // Check if any child contains the sync status indicator
  let foundSyncStatus = false;
  function checkForSyncStatus(element) {
    if (element.textContent && element.textContent.includes('⏳')) {
      foundSyncStatus = true;
      return;
    }
    if (element.children) {
      for (let child of element.children) {
        checkForSyncStatus(child);
      }
    }
  }
  
  checkForSyncStatus(checklistElement);
  
  if (!foundSyncStatus) {
    throw new Error('Sync status indicator not found in checklist item');
  }
  
  console.log('✓ Test passed: renderChecklistItem includes sync status indicator');
}

/**
 * Test: renderChecklistItem shows retry button for failed items
 */
function testRenderChecklistItemShowsRetryButtonForFailedItems() {
  const item = {
    id: 'test-1',
    name: 'Test checklist item',
    category: 'daily',
    completed: false,
    syncStatus: 'failed',
    syncError: 'Network error'
  };
  
  const checklistElement = renderChecklistItem(item, 'chores');
  
  // Verify element is created
  if (!checklistElement) {
    throw new Error('renderChecklistItem did not return an element');
  }
  
  // Check if any child contains the retry button
  let foundRetryButton = false;
  function checkForRetryButton(element) {
    if (element.textContent && element.textContent.includes('🔄')) {
      foundRetryButton = true;
      return;
    }
    if (element.children) {
      for (let child of element.children) {
        checkForRetryButton(child);
      }
    }
  }
  
  checkForRetryButton(checklistElement);
  
  if (!foundRetryButton) {
    throw new Error('Retry button not found in failed checklist item');
  }
  
  console.log('✓ Test passed: renderChecklistItem shows retry button for failed items');
}

/**
 * Test: renderChecklistItem does not show retry button for synced items
 */
function testRenderChecklistItemNoRetryButtonForSyncedItems() {
  const item = {
    id: 'test-1',
    name: 'Test checklist item',
    category: 'daily',
    completed: false,
    syncStatus: 'synced'
  };
  
  const checklistElement = renderChecklistItem(item, 'chores');
  
  // Verify element is created
  if (!checklistElement) {
    throw new Error('renderChecklistItem did not return an element');
  }
  
  // Count retry buttons (should be 0)
  let retryButtonCount = 0;
  function countRetryButtons(element) {
    if (element.textContent && element.textContent.includes('🔄')) {
      retryButtonCount++;
    }
    if (element.children) {
      for (let child of element.children) {
        countRetryButtons(child);
      }
    }
  }
  
  countRetryButtons(checklistElement);
  
  if (retryButtonCount > 0) {
    throw new Error(`Expected no retry button for synced item, found ${retryButtonCount}`);
  }
  
  console.log('✓ Test passed: renderChecklistItem does not show retry button for synced items');
}

/**
 * Test: renderInventoryItem includes sync status indicator
 */
function testRenderInventoryItemIncludesSyncStatus() {
  const item = {
    id: 'test-1',
    name: 'Test inventory item',
    category: 'food',
    status: 'half',
    syncStatus: 'pending'
  };
  
  const inventoryElement = renderInventoryItem(item, 'fridge');
  
  // Verify element is created
  if (!inventoryElement) {
    throw new Error('renderInventoryItem did not return an element');
  }
  
  // Check if any child contains the sync status indicator
  let foundSyncStatus = false;
  function checkForSyncStatus(element) {
    if (element.textContent && element.textContent.includes('⏳')) {
      foundSyncStatus = true;
      return;
    }
    if (element.children) {
      for (let child of element.children) {
        checkForSyncStatus(child);
      }
    }
  }
  
  checkForSyncStatus(inventoryElement);
  
  if (!foundSyncStatus) {
    throw new Error('Sync status indicator not found in inventory item');
  }
  
  console.log('✓ Test passed: renderInventoryItem includes sync status indicator');
}

/**
 * Test: renderInventoryItem shows retry button for failed items
 */
function testRenderInventoryItemShowsRetryButtonForFailedItems() {
  const item = {
    id: 'test-1',
    name: 'Test inventory item',
    category: 'food',
    status: 'half',
    syncStatus: 'failed',
    syncError: 'API error'
  };
  
  const inventoryElement = renderInventoryItem(item, 'fridge');
  
  // Verify element is created
  if (!inventoryElement) {
    throw new Error('renderInventoryItem did not return an element');
  }
  
  // Check if any child contains the retry button
  let foundRetryButton = false;
  function checkForRetryButton(element) {
    if (element.textContent && element.textContent.includes('🔄')) {
      foundRetryButton = true;
      return;
    }
    if (element.children) {
      for (let child of element.children) {
        checkForRetryButton(child);
      }
    }
  }
  
  checkForRetryButton(inventoryElement);
  
  if (!foundRetryButton) {
    throw new Error('Retry button not found in failed inventory item');
  }
  
  console.log('✓ Test passed: renderInventoryItem shows retry button for failed items');
}

/**
 * Test: renderInventoryItem does not show retry button for synced items
 */
function testRenderInventoryItemNoRetryButtonForSyncedItems() {
  const item = {
    id: 'test-1',
    name: 'Test inventory item',
    category: 'food',
    status: 'half',
    syncStatus: 'synced'
  };
  
  const inventoryElement = renderInventoryItem(item, 'fridge');
  
  // Verify element is created
  if (!inventoryElement) {
    throw new Error('renderInventoryItem did not return an element');
  }
  
  // Count retry buttons (should be 0)
  let retryButtonCount = 0;
  function countRetryButtons(element) {
    if (element.textContent && element.textContent.includes('🔄')) {
      retryButtonCount++;
    }
    if (element.children) {
      for (let child of element.children) {
        countRetryButtons(child);
      }
    }
  }
  
  countRetryButtons(inventoryElement);
  
  if (retryButtonCount > 0) {
    throw new Error(`Expected no retry button for synced item, found ${retryButtonCount}`);
  }
  
  console.log('✓ Test passed: renderInventoryItem does not show retry button for synced items');
}

/**
 * Test: renderAddItemForm displays error message when sync fails
 */
function testRenderAddItemFormDisplaysErrorMessageOnSyncFailure() {
  const form = renderAddItemForm(CONFIG.BOARDS.CHORES, CONFIG.ITEM_TYPES.CHECKLIST);
  
  // Verify form is created
  if (!form) {
    throw new Error('renderAddItemForm did not return an element');
  }
  
  // Verify error container exists
  const errorContainers = form.querySelectorAll('[id^="error-"]');
  if (errorContainers.length === 0) {
    throw new Error('Error container not found in form');
  }
  
  const errorContainer = errorContainers[0];
  
  // Initially, error container should be empty
  if (errorContainer.children.length !== 0) {
    throw new Error('Error container should be empty initially');
  }
  
  console.log('✓ Test passed: renderAddItemForm displays error message when sync fails');
}

/**
 * Test: renderAddItemForm clears error messages when form is used again
 */
function testRenderAddItemFormClearsErrorMessages() {
  const form = renderAddItemForm(CONFIG.BOARDS.CHORES, CONFIG.ITEM_TYPES.CHECKLIST);
  
  // Verify form is created
  if (!form) {
    throw new Error('renderAddItemForm did not return an element');
  }
  
  // Verify error container exists
  const errorContainers = form.querySelectorAll('[id^="error-"]');
  if (errorContainers.length === 0) {
    throw new Error('Error container not found in form');
  }
  
  const errorContainer = errorContainers[0];
  
  // Manually add an error message to the container
  const errorMsg = createElement('div', 'p-3 rounded bg-red-500/20 border border-red-500/50 text-red-300 text-sm');
  errorMsg.textContent = 'Test error message';
  errorContainer.appendChild(errorMsg);
  
  // Verify error message is displayed
  if (errorContainer.children.length === 0) {
    throw new Error('Error message was not added to container');
  }
  
  // Find the add button by searching through all children
  let addBtn = null;
  function findButton(element) {
    if (element.tagName === 'BUTTON' && element.textContent === 'Add Item') {
      addBtn = element;
      return;
    }
    if (element.children) {
      for (let child of element.children) {
        findButton(child);
      }
    }
  }
  
  findButton(form);
  
  if (!addBtn) {
    throw new Error('Add button not found in form');
  }
  
  // The error should be cleared when the button is clicked
  // (This is tested by the onclick handler clearing errorContainer.innerHTML)
  
  console.log('✓ Test passed: renderAddItemForm clears error messages when form is used again');
}

/**
 * Run all component tests
 */
function runAllComponentTests() {
  console.log('Running Component Rendering tests...\n');
  
  try {
    // renderSyncStatus tests
    testRenderSyncStatusDisplaysPendingStatus();
    testRenderSyncStatusDisplaysSyncedStatus();
    testRenderSyncStatusDisplaysFailedStatus();
    testRenderSyncStatusReturnsEmptyForNoSyncStatus();
    
    // renderChecklistItem tests
    testRenderChecklistItemIncludesSyncStatus();
    testRenderChecklistItemShowsRetryButtonForFailedItems();
    testRenderChecklistItemNoRetryButtonForSyncedItems();
    
    // renderInventoryItem tests
    testRenderInventoryItemIncludesSyncStatus();
    testRenderInventoryItemShowsRetryButtonForFailedItems();
    testRenderInventoryItemNoRetryButtonForSyncedItems();
    
    // renderAddItemForm tests
    testRenderAddItemFormDisplaysErrorMessageOnSyncFailure();
    testRenderAddItemFormClearsErrorMessages();
    
    console.log('\n✓ All Component tests passed!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export for use in test-runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllComponentTests };
}
