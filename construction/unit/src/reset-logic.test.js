/**
 * Reset Logic Tests
 * Tests for the reset functionality that clears completed status at 12 AM
 * 
 * Validates: Requirements 3.1 (Reset-Proof Item Persistence)
 */

/**
 * Test: Add items to a board
 */
async function testAddItemsToBoard() {
  // Create a fresh state manager
  const testStateManager = new StateManager();
  
  const boardType = 'chores';
  
  // Add multiple items to the board
  const item1 = testStateManager.addItem(boardType, {
    name: 'Meal prep baon',
    category: 'daily',
    completed: false
  });
  
  const item2 = testStateManager.addItem(boardType, {
    name: 'Dishes',
    category: 'daily',
    completed: false
  });
  
  const item3 = testStateManager.addItem(boardType, {
    name: 'Laundry',
    category: 'weekly',
    completed: false
  });
  
  // Verify items were added
  const board = testStateManager.getBoard(boardType);
  if (board.items.length < 3) {
    throw new Error(`Expected at least 3 items, got ${board.items.length}`);
  }
  
  // Verify items have correct properties
  const foundItem1 = board.items.find(i => i.id === item1.id);
  if (!foundItem1 || foundItem1.name !== 'Meal prep baon') {
    throw new Error('Item 1 not found or has incorrect name');
  }
  
  const foundItem2 = board.items.find(i => i.id === item2.id);
  if (!foundItem2 || foundItem2.name !== 'Dishes') {
    throw new Error('Item 2 not found or has incorrect name');
  }
  
  const foundItem3 = board.items.find(i => i.id === item3.id);
  if (!foundItem3 || foundItem3.name !== 'Laundry') {
    throw new Error('Item 3 not found or has incorrect name');
  }
  
  console.log('✓ Test passed: Add items to a board');
  return { testStateManager, boardType, item1, item2, item3 };
}

/**
 * Test: Complete some items
 */
async function testCompleteSomeItems() {
  // First add items to the board
  const { testStateManager, boardType, item1, item2, item3 } = await testAddItemsToBoard();
  
  // Complete some items
  testStateManager.toggleItem(boardType, item1.id);
  testStateManager.toggleItem(boardType, item2.id);
  
  // Verify items are marked as completed
  const board = testStateManager.getBoard(boardType);
  
  const completedItem1 = board.items.find(i => i.id === item1.id);
  if (!completedItem1 || !completedItem1.completed) {
    throw new Error('Item 1 was not marked as completed');
  }
  
  const completedItem2 = board.items.find(i => i.id === item2.id);
  if (!completedItem2 || !completedItem2.completed) {
    throw new Error('Item 2 was not marked as completed');
  }
  
  // Verify item 3 is still not completed
  const uncompletedItem3 = board.items.find(i => i.id === item3.id);
  if (!uncompletedItem3 || uncompletedItem3.completed) {
    throw new Error('Item 3 should not be completed');
  }
  
  // Verify completion percentage is updated
  if (board.completionPercentage === undefined || board.completionPercentage === null) {
    throw new Error('Completion percentage was not updated');
  }
  
  console.log('✓ Test passed: Complete some items');
  return { testStateManager, boardType, item1, item2, item3 };
}

/**
 * Test: Verify completed status is reset to false
 */
async function testVerifyCompletedStatusIsReset() {
  // First complete some items
  const { testStateManager, boardType, item1, item2, item3 } = await testCompleteSomeItems();
  
  // Reset the board
  await testStateManager.resetBoardItems(boardType);
  
  // Verify all items have completed = false
  const board = testStateManager.getBoard(boardType);
  
  const resetItem1 = board.items.find(i => i.id === item1.id);
  if (!resetItem1 || resetItem1.completed !== false) {
    throw new Error(`Item 1 completed status was not reset. Expected false, got ${resetItem1.completed}`);
  }
  
  const resetItem2 = board.items.find(i => i.id === item2.id);
  if (!resetItem2 || resetItem2.completed !== false) {
    throw new Error(`Item 2 completed status was not reset. Expected false, got ${resetItem2.completed}`);
  }
  
  const resetItem3 = board.items.find(i => i.id === item3.id);
  if (!resetItem3 || resetItem3.completed !== false) {
    throw new Error(`Item 3 completed status was not reset. Expected false, got ${resetItem3.completed}`);
  }
  
  console.log('✓ Test passed: Verify completed status is reset to false');
}

/**
 * Test: Verify item names and categories are preserved
 */
async function testVerifyItemNamesAndCategoriesPreserved() {
  // First complete some items
  const { testStateManager, boardType, item1, item2, item3 } = await testCompleteSomeItems();
  
  // Store original names and categories
  const originalItem1Name = item1.name;
  const originalItem1Category = item1.category;
  const originalItem2Name = item2.name;
  const originalItem2Category = item2.category;
  const originalItem3Name = item3.name;
  const originalItem3Category = item3.category;
  
  // Reset the board
  await testStateManager.resetBoardItems(boardType);
  
  // Verify names and categories are preserved
  const board = testStateManager.getBoard(boardType);
  
  const resetItem1 = board.items.find(i => i.id === item1.id);
  if (!resetItem1 || resetItem1.name !== originalItem1Name) {
    throw new Error(`Item 1 name was not preserved. Expected '${originalItem1Name}', got '${resetItem1.name}'`);
  }
  if (resetItem1.category !== originalItem1Category) {
    throw new Error(`Item 1 category was not preserved. Expected '${originalItem1Category}', got '${resetItem1.category}'`);
  }
  
  const resetItem2 = board.items.find(i => i.id === item2.id);
  if (!resetItem2 || resetItem2.name !== originalItem2Name) {
    throw new Error(`Item 2 name was not preserved. Expected '${originalItem2Name}', got '${resetItem2.name}'`);
  }
  if (resetItem2.category !== originalItem2Category) {
    throw new Error(`Item 2 category was not preserved. Expected '${originalItem2Category}', got '${resetItem2.category}'`);
  }
  
  const resetItem3 = board.items.find(i => i.id === item3.id);
  if (!resetItem3 || resetItem3.name !== originalItem3Name) {
    throw new Error(`Item 3 name was not preserved. Expected '${originalItem3Name}', got '${resetItem3.name}'`);
  }
  if (resetItem3.category !== originalItem3Category) {
    throw new Error(`Item 3 category was not preserved. Expected '${originalItem3Category}', got '${resetItem3.category}'`);
  }
  
  console.log('✓ Test passed: Verify item names and categories are preserved');
}

/**
 * Test: Verify items are synced to Google Sheets after reset
 */
async function testVerifyItemsSyncedToGoogleSheetsAfterReset() {
  // First complete some items
  const { testStateManager, boardType, item1, item2, item3 } = await testCompleteSomeItems();
  
  // Mock the apiService.batchUpdateItems to track calls
  let batchUpdateCalls = [];
  const originalBatchUpdateItems = apiService.batchUpdateItems;
  apiService.batchUpdateItems = async function(bt, items) {
    batchUpdateCalls.push({ boardType: bt, items });
    return { success: true };
  };
  
  try {
    // Reset the board
    await testStateManager.resetBoardItems(boardType);
    
    // Wait a bit for the sync to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify batchUpdateItems was called
    if (batchUpdateCalls.length === 0) {
      throw new Error('apiService.batchUpdateItems was not called');
    }
    
    // Verify the batch update was for the correct board
    const batchCall = batchUpdateCalls[0];
    if (batchCall.boardType !== boardType) {
      throw new Error(`Expected batch update for board ${boardType}, got ${batchCall.boardType}`);
    }
    
    // Verify all items were synced with completed = false
    if (batchCall.items.length === 0) {
      throw new Error('No items were included in the batch update');
    }
    
    for (const item of batchCall.items) {
      if (item.completed !== false) {
        throw new Error(`Item ${item.id} was not synced with completed = false`);
      }
    }
    
    console.log('✓ Test passed: Verify items are synced to Google Sheets after reset');
  } finally {
    // Restore original batchUpdateItems
    apiService.batchUpdateItems = originalBatchUpdateItems;
  }
}

/**
 * Test: Verify no items are deleted during reset
 */
async function testVerifyNoItemsDeletedDuringReset() {
  // First complete some items
  const { testStateManager, boardType, item1, item2, item3 } = await testCompleteSomeItems();
  
  // Get the count of items before reset
  const boardBefore = testStateManager.getBoard(boardType);
  const countBefore = boardBefore.items.length;
  
  // Reset the board
  await testStateManager.resetBoardItems(boardType);
  
  // Get the count of items after reset
  const boardAfter = testStateManager.getBoard(boardType);
  const countAfter = boardAfter.items.length;
  
  // Verify no items were deleted
  if (countAfter !== countBefore) {
    throw new Error(`Items were deleted during reset. Before: ${countBefore}, After: ${countAfter}`);
  }
  
  console.log('✓ Test passed: Verify no items are deleted during reset');
}

/**
 * Test: Verify reset preserves item IDs
 */
async function testVerifyResetPreservesItemIds() {
  // First complete some items
  const { testStateManager, boardType, item1, item2, item3 } = await testCompleteSomeItems();
  
  // Store original IDs
  const originalIds = [item1.id, item2.id, item3.id];
  
  // Reset the board
  await testStateManager.resetBoardItems(boardType);
  
  // Verify all original IDs still exist
  const board = testStateManager.getBoard(boardType);
  for (const originalId of originalIds) {
    const item = board.items.find(i => i.id === originalId);
    if (!item) {
      throw new Error(`Item with ID ${originalId} was not found after reset`);
    }
  }
  
  console.log('✓ Test passed: Verify reset preserves item IDs');
}

/**
 * Run all reset logic tests
 */
async function runAllResetLogicTests() {
  console.log('Running Reset Logic tests...\n');
  
  try {
    await testAddItemsToBoard();
    await testCompleteSomeItems();
    await testVerifyCompletedStatusIsReset();
    await testVerifyItemNamesAndCategoriesPreserved();
    await testVerifyItemsSyncedToGoogleSheetsAfterReset();
    await testVerifyNoItemsDeletedDuringReset();
    await testVerifyResetPreservesItemIds();
    
    console.log('\n✓ All Reset Logic tests passed!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export for use in test-runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllResetLogicTests };
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && require.main === module) {
  runAllResetLogicTests();
}
