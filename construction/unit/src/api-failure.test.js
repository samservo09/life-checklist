// Test for API failure simulation and error handling

/**
 * Test: appendItem queues operation on API failure
 */
async function testAppendItemQueuesOperationOnFailure() {
  const testApiService = new ApiService();
  testApiService.useGoogleSheets = true;
  testApiService.hasValidCredentials = true;
  
  const boardType = 'chores';
  const item = {
    id: 'test-1',
    name: 'Test item',
    category: 'daily',
    completed: false
  };
  
  // Mock fetch to fail
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('Network error');
  };
  
  try {
    // Clear the offline queue first
    testApiService.offlineQueue.clear();
    
    // Try to append item (should fail and queue)
    try {
      await testApiService.appendItem(boardType, item);
    } catch (error) {
      // Expected to fail
      if (!error.message.includes('Network error')) {
        throw new Error(`Expected network error, got: ${error.message}`);
      }
    }
    
    // Verify operation was queued
    const queuedOps = testApiService.offlineQueue.getAll();
    if (queuedOps.length !== 1) {
      throw new Error(`Expected 1 queued operation, got ${queuedOps.length}`);
    }
    
    if (queuedOps[0].type !== 'append') {
      throw new Error(`Expected 'append' operation, got '${queuedOps[0].type}'`);
    }
    
    if (queuedOps[0].item.id !== item.id) {
      throw new Error(`Expected item id '${item.id}', got '${queuedOps[0].item.id}'`);
    }
    
    console.log('✓ Test passed: appendItem queues operation on API failure');
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Test: updateItemInSheet queues operation on API failure
 */
async function testUpdateItemInSheetQueuesOperationOnFailure() {
  const testApiService = new ApiService();
  testApiService.useGoogleSheets = true;
  testApiService.hasValidCredentials = true;
  
  const boardType = 'chores';
  const itemId = 'test-1';
  const updates = { completed: true };
  
  // Mock fetch to fail
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('Network error');
  };
  
  try {
    // Clear the offline queue first
    testApiService.offlineQueue.clear();
    
    // Try to update item (should fail and queue)
    try {
      await testApiService.updateItemInSheet(boardType, itemId, updates);
    } catch (error) {
      // Expected to fail
      if (!error.message.includes('Network error')) {
        throw new Error(`Expected network error, got: ${error.message}`);
      }
    }
    
    // Verify operation was queued
    const queuedOps = testApiService.offlineQueue.getAll();
    if (queuedOps.length !== 1) {
      throw new Error(`Expected 1 queued operation, got ${queuedOps.length}`);
    }
    
    if (queuedOps[0].type !== 'update') {
      throw new Error(`Expected 'update' operation, got '${queuedOps[0].type}'`);
    }
    
    if (queuedOps[0].itemId !== itemId) {
      throw new Error(`Expected item id '${itemId}', got '${queuedOps[0].itemId}'`);
    }
    
    console.log('✓ Test passed: updateItemInSheet queues operation on API failure');
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Test: deleteItemFromSheet queues operation on API failure
 */
async function testDeleteItemFromSheetQueuesOperationOnFailure() {
  const testApiService = new ApiService();
  testApiService.useGoogleSheets = true;
  testApiService.hasValidCredentials = true;
  
  const boardType = 'chores';
  const itemId = 'test-1';
  
  // Mock fetch to fail
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('Network error');
  };
  
  try {
    // Clear the offline queue first
    testApiService.offlineQueue.clear();
    
    // Try to delete item (should fail and queue)
    try {
      await testApiService.deleteItemFromSheet(boardType, itemId);
    } catch (error) {
      // Expected to fail
      if (!error.message.includes('Network error')) {
        throw new Error(`Expected network error, got: ${error.message}`);
      }
    }
    
    // Verify operation was queued
    const queuedOps = testApiService.offlineQueue.getAll();
    if (queuedOps.length !== 1) {
      throw new Error(`Expected 1 queued operation, got ${queuedOps.length}`);
    }
    
    if (queuedOps[0].type !== 'delete') {
      throw new Error(`Expected 'delete' operation, got '${queuedOps[0].type}'`);
    }
    
    if (queuedOps[0].itemId !== itemId) {
      throw new Error(`Expected item id '${itemId}', got '${queuedOps[0].itemId}'`);
    }
    
    console.log('✓ Test passed: deleteItemFromSheet queues operation on API failure');
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Test: batchAppendItems queues operation on API failure
 */
async function testBatchAppendItemsQueuesOperationOnFailure() {
  const testApiService = new ApiService();
  testApiService.useGoogleSheets = true;
  testApiService.hasValidCredentials = true;
  
  const boardType = 'chores';
  const items = [
    { id: 'test-1', name: 'Item 1', category: 'daily', completed: false },
    { id: 'test-2', name: 'Item 2', category: 'daily', completed: false }
  ];
  
  // Mock fetch to fail
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('Network error');
  };
  
  try {
    // Clear the offline queue first
    testApiService.offlineQueue.clear();
    
    // Try to batch append items (should fail and queue)
    try {
      await testApiService.batchAppendItems(boardType, items);
    } catch (error) {
      // Expected to fail
      if (!error.message.includes('Network error')) {
        throw new Error(`Expected network error, got: ${error.message}`);
      }
    }
    
    // Verify operation was queued
    const queuedOps = testApiService.offlineQueue.getAll();
    if (queuedOps.length !== 1) {
      throw new Error(`Expected 1 queued operation, got ${queuedOps.length}`);
    }
    
    if (queuedOps[0].type !== 'batch-append') {
      throw new Error(`Expected 'batch-append' operation, got '${queuedOps[0].type}'`);
    }
    
    if (queuedOps[0].items.length !== 2) {
      throw new Error(`Expected 2 items in batch, got ${queuedOps[0].items.length}`);
    }
    
    console.log('✓ Test passed: batchAppendItems queues operation on API failure');
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Test: Offline queue persists to localStorage on API failure
 */
async function testOfflineQueuePersistsToLocalStorage() {
  const testApiService = new ApiService();
  testApiService.useGoogleSheets = true;
  testApiService.hasValidCredentials = true;
  
  const boardType = 'chores';
  const item = {
    id: 'test-1',
    name: 'Test item',
    category: 'daily',
    completed: false
  };
  
  // Mock fetch to fail
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('Network error');
  };
  
  try {
    // Clear the offline queue and localStorage first
    testApiService.offlineQueue.clear();
    localStorage.removeItem('offlineQueue');
    
    // Try to append item (should fail and queue)
    try {
      await testApiService.appendItem(boardType, item);
    } catch (error) {
      // Expected to fail
    }
    
    // Verify operation was saved to localStorage
    const stored = localStorage.getItem('offlineQueue');
    if (!stored) {
      throw new Error('Offline queue was not persisted to localStorage');
    }
    
    const parsedQueue = JSON.parse(stored);
    if (!Array.isArray(parsedQueue) || parsedQueue.length !== 1) {
      throw new Error(`Expected 1 operation in localStorage, got ${parsedQueue.length}`);
    }
    
    if (parsedQueue[0].type !== 'append') {
      throw new Error(`Expected 'append' operation in localStorage, got '${parsedQueue[0].type}'`);
    }
    
    console.log('✓ Test passed: Offline queue persists to localStorage on API failure');
  } finally {
    global.fetch = originalFetch;
    localStorage.removeItem('offlineQueue');
  }
}

/**
 * Test: Offline queue loads from localStorage on initialization
 */
async function testOfflineQueueLoadsFromLocalStorage() {
  // Create a queue with a test operation
  const testQueue = [
    {
      type: 'append',
      boardType: 'chores',
      item: {
        id: 'test-1',
        name: 'Test item',
        category: 'daily',
        completed: false,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      retryCount: 0
    }
  ];
  
  // Save to localStorage
  localStorage.setItem('offlineQueue', JSON.stringify(testQueue));
  
  try {
    // Create a new API service (should load queue from localStorage)
    const testApiService = new ApiService();
    
    // Verify queue was loaded
    const loadedOps = testApiService.offlineQueue.getAll();
    if (loadedOps.length !== 1) {
      throw new Error(`Expected 1 loaded operation, got ${loadedOps.length}`);
    }
    
    if (loadedOps[0].type !== 'append') {
      throw new Error(`Expected 'append' operation, got '${loadedOps[0].type}'`);
    }
    
    if (loadedOps[0].item.id !== 'test-1') {
      throw new Error(`Expected item id 'test-1', got '${loadedOps[0].item.id}'`);
    }
    
    console.log('✓ Test passed: Offline queue loads from localStorage on initialization');
  } finally {
    localStorage.removeItem('offlineQueue');
  }
}

/**
 * Test: Retry logic respects max attempts
 */
async function testRetryLogicRespectsMaxAttempts() {
  const testApiService = new ApiService();
  testApiService.useGoogleSheets = true;
  testApiService.hasValidCredentials = true;
  testApiService.maxRetries = 3;
  testApiService.retryBackoffMs = 10; // Short delay for testing
  
  let callCount = 0;
  
  // Mock fetch to always fail
  const originalFetch = global.fetch;
  global.fetch = async () => {
    callCount++;
    throw new Error('Network error');
  };
  
  try {
    // Clear the offline queue first
    testApiService.offlineQueue.clear();
    
    const boardType = 'chores';
    const item = {
      id: 'test-1',
      name: 'Test item',
      category: 'daily',
      completed: false
    };
    
    // Try to append item (should retry 3 times then fail)
    try {
      await testApiService.appendItem(boardType, item);
    } catch (error) {
      // Expected to fail
    }
    
    // Verify it retried the correct number of times
    if (callCount !== 3) {
      throw new Error(`Expected 3 retry attempts, got ${callCount}`);
    }
    
    console.log('✓ Test passed: Retry logic respects max attempts');
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Test: API failure with 500 error triggers retry
 */
async function testAPIFailureWith500ErrorTriggersRetry() {
  const testApiService = new ApiService();
  testApiService.useGoogleSheets = true;
  testApiService.hasValidCredentials = true;
  testApiService.maxRetries = 3;
  testApiService.retryBackoffMs = 10; // Short delay for testing
  
  let callCount = 0;
  
  // Mock fetch to fail with 500 error
  const originalFetch = global.fetch;
  global.fetch = async () => {
    callCount++;
    const error = new Error('Internal Server Error');
    error.statusCode = 500;
    throw error;
  };
  
  try {
    // Clear the offline queue first
    testApiService.offlineQueue.clear();
    
    const boardType = 'chores';
    const item = {
      id: 'test-1',
      name: 'Test item',
      category: 'daily',
      completed: false
    };
    
    // Try to append item (should retry on 500 error)
    try {
      await testApiService.appendItem(boardType, item);
    } catch (error) {
      // Expected to fail
    }
    
    // Verify it retried (should attempt 3 times)
    if (callCount !== 3) {
      throw new Error(`Expected 3 attempts on 500 error, got ${callCount}`);
    }
    
    console.log('✓ Test passed: API failure with 500 error triggers retry');
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Test: API failure with 400 error does not retry
 */
async function testAPIFailureWith400ErrorDoesNotRetry() {
  const testApiService = new ApiService();
  testApiService.useGoogleSheets = true;
  testApiService.hasValidCredentials = true;
  testApiService.maxRetries = 3;
  testApiService.retryBackoffMs = 10;
  
  let callCount = 0;
  
  // Mock fetch to fail with 400 error
  const originalFetch = global.fetch;
  global.fetch = async () => {
    callCount++;
    const error = new Error('Bad Request');
    error.statusCode = 400;
    throw error;
  };
  
  try {
    // Clear the offline queue first
    testApiService.offlineQueue.clear();
    
    const boardType = 'chores';
    const item = {
      id: 'test-1',
      name: 'Test item',
      category: 'daily',
      completed: false
    };
    
    // Try to append item (should NOT retry on 400 error)
    try {
      await testApiService.appendItem(boardType, item);
    } catch (error) {
      // Expected to fail
    }
    
    // Verify it did NOT retry (should only attempt once)
    if (callCount !== 1) {
      throw new Error(`Expected 1 attempt on 400 error (no retry), got ${callCount}`);
    }
    
    console.log('✓ Test passed: API failure with 400 error does not retry');
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Test: API failure with 429 error triggers retry
 */
async function testAPIFailureWith429ErrorTriggersRetry() {
  const testApiService = new ApiService();
  testApiService.useGoogleSheets = true;
  testApiService.hasValidCredentials = true;
  testApiService.maxRetries = 3;
  testApiService.retryBackoffMs = 10;
  
  let callCount = 0;
  
  // Mock fetch to fail with 429 error first, then succeed
  const originalFetch = global.fetch;
  global.fetch = async () => {
    callCount++;
    if (callCount < 2) {
      const error = new Error('Too Many Requests');
      error.statusCode = 429;
      throw error;
    }
    return { ok: true, json: async () => ({ success: true }) };
  };
  
  try {
    // Clear the offline queue first
    testApiService.offlineQueue.clear();
    
    const boardType = 'chores';
    const item = {
      id: 'test-1',
      name: 'Test item',
      category: 'daily',
      completed: false
    };
    
    // Try to append item (should retry on 429 error)
    const result = await testApiService.appendItem(boardType, item);
    
    // Verify it retried and eventually succeeded
    if (callCount !== 2) {
      throw new Error(`Expected 2 attempts on 429 error, got ${callCount}`);
    }
    
    console.log('✓ Test passed: API failure with 429 error triggers retry');
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Running API failure simulation tests...\n');
  
  try {
    await testAppendItemQueuesOperationOnFailure();
    await testUpdateItemInSheetQueuesOperationOnFailure();
    await testDeleteItemFromSheetQueuesOperationOnFailure();
    await testBatchAppendItemsQueuesOperationOnFailure();
    await testOfflineQueuePersistsToLocalStorage();
    await testOfflineQueueLoadsFromLocalStorage();
    await testRetryLogicRespectsMaxAttempts();
    await testAPIFailureWith500ErrorTriggersRetry();
    await testAPIFailureWith400ErrorDoesNotRetry();
    await testAPIFailureWith429ErrorTriggersRetry();
    
    console.log('\n✓ All API failure simulation tests passed!');
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
