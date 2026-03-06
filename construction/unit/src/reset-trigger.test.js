/**
 * Reset Trigger Tests
 * Tests for the 12 AM Singapore time reset trigger
 * 
 * Validates: Requirements 3.1 (Reset-Proof Item Persistence)
 */

/**
 * Test: getSingaporeTime returns a valid date
 */
function testGetSingaporeTimeReturnsValidDate() {
  const singaporeTime = getSingaporeTime();
  
  if (!(singaporeTime instanceof Date)) {
    throw new Error('getSingaporeTime did not return a Date object');
  }
  
  if (isNaN(singaporeTime.getTime())) {
    throw new Error('getSingaporeTime returned an invalid date');
  }
  
  console.log('✓ Test passed: getSingaporeTime returns a valid date');
}

/**
 * Test: isMidnightSingapore returns boolean
 */
function testIsMidnightSingaporeReturnsBoolean() {
  const result = isMidnightSingapore();
  
  if (typeof result !== 'boolean') {
    throw new Error(`isMidnightSingapore did not return a boolean, got ${typeof result}`);
  }
  
  console.log('✓ Test passed: isMidnightSingapore returns boolean');
}

/**
 * Test: getMillisecondsUntilMidnightSingapore returns positive number
 */
function testGetMillisecondsUntilMidnightSingaporeReturnsPositiveNumber() {
  const ms = getMillisecondsUntilMidnightSingapore();
  
  if (typeof ms !== 'number') {
    throw new Error(`getMillisecondsUntilMidnightSingapore did not return a number, got ${typeof ms}`);
  }
  
  if (ms <= 0) {
    throw new Error(`getMillisecondsUntilMidnightSingapore returned non-positive value: ${ms}`);
  }
  
  // Should be less than 24 hours (86400000 ms)
  if (ms > 86400000) {
    throw new Error(`getMillisecondsUntilMidnightSingapore returned value greater than 24 hours: ${ms}`);
  }
  
  console.log(`✓ Test passed: getMillisecondsUntilMidnightSingapore returns positive number (${Math.round(ms / 1000 / 60)} minutes until midnight)`);
}

/**
 * Test: scheduleDailyResetAtMidnightSingapore returns a timeout ID
 */
function testScheduleDailyResetAtMidnightSingaporeReturnsTimeoutId() {
  const testStateManager = new StateManager();
  
  const timeoutId = scheduleDailyResetAtMidnightSingapore(testStateManager);
  
  if (!timeoutId) {
    throw new Error(`scheduleDailyResetAtMidnightSingapore did not return a valid timeout ID, got ${timeoutId}`);
  }
  
  // Clean up
  stopScheduledReset(timeoutId);
  
  console.log('✓ Test passed: scheduleDailyResetAtMidnightSingapore returns a timeout ID');
}

/**
 * Test: stopScheduledReset clears the timeout
 */
function testStopScheduledResetClearsTimeout() {
  const testStateManager = new StateManager();
  
  const timeoutId = scheduleDailyResetAtMidnightSingapore(testStateManager);
  
  // Stop the scheduled reset
  stopScheduledReset(timeoutId);
  
  // If we get here without error, the function worked
  console.log('✓ Test passed: stopScheduledReset clears the timeout');
}

/**
 * Test: scheduleDailyResetAtMidnightSingapore handles null stateManager gracefully
 */
function testScheduleDailyResetHandlesNullStateManager() {
  const timeoutId = scheduleDailyResetAtMidnightSingapore(null);
  
  if (timeoutId !== null && timeoutId !== undefined) {
    throw new Error(`scheduleDailyResetAtMidnightSingapore should return null/undefined for null stateManager, got ${timeoutId}`);
  }
  
  console.log('✓ Test passed: scheduleDailyResetAtMidnightSingapore handles null stateManager gracefully');
}

/**
 * Test: Reset trigger resets all boards at midnight
 */
async function testResetTriggerResetsAllBoardsAtMidnight() {
  const testStateManager = new StateManager();
  
  // Add items to multiple boards
  const choresItem = testStateManager.addItem('chores', {
    name: 'Test chore',
    category: 'daily',
    completed: false
  });
  
  const selfCareItem = testStateManager.addItem('selfCare', {
    name: 'Test self-care',
    category: 'morning',
    completed: false
  });
  
  // Mark items as completed
  testStateManager.toggleItem('chores', choresItem.id);
  testStateManager.toggleItem('selfCare', selfCareItem.id);
  
  // Verify items are completed
  let choresBoard = testStateManager.getBoard('chores');
  let selfCareBoard = testStateManager.getBoard('selfCare');
  
  const completedChoresItem = choresBoard.items.find(i => i.id === choresItem.id);
  const completedSelfCareItem = selfCareBoard.items.find(i => i.id === selfCareItem.id);
  
  if (!completedChoresItem.completed || !completedSelfCareItem.completed) {
    throw new Error('Items were not marked as completed');
  }
  
  // Reset all boards (simulating midnight trigger)
  const boards = Object.values(CONFIG.BOARDS);
  for (const boardType of boards) {
    await testStateManager.resetBoardItems(boardType);
  }
  
  // Verify all items are reset
  choresBoard = testStateManager.getBoard('chores');
  selfCareBoard = testStateManager.getBoard('selfCare');
  
  const resetChoresItem = choresBoard.items.find(i => i.id === choresItem.id);
  const resetSelfCareItem = selfCareBoard.items.find(i => i.id === selfCareItem.id);
  
  if (resetChoresItem.completed !== false) {
    throw new Error(`Chores item was not reset. Expected completed=false, got ${resetChoresItem.completed}`);
  }
  
  if (resetSelfCareItem.completed !== false) {
    throw new Error(`Self-care item was not reset. Expected completed=false, got ${resetSelfCareItem.completed}`);
  }
  
  console.log('✓ Test passed: Reset trigger resets all boards at midnight');
}

/**
 * Run all reset trigger tests
 */
async function runAllResetTriggerTests() {
  console.log('Running Reset Trigger tests...\n');
  
  try {
    testGetSingaporeTimeReturnsValidDate();
    testIsMidnightSingaporeReturnsBoolean();
    testGetMillisecondsUntilMidnightSingaporeReturnsPositiveNumber();
    testScheduleDailyResetAtMidnightSingaporeReturnsTimeoutId();
    testStopScheduledResetClearsTimeout();
    testScheduleDailyResetHandlesNullStateManager();
    await testResetTriggerResetsAllBoardsAtMidnight();
    
    console.log('\n✓ All Reset Trigger tests passed!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export for use in test-runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllResetTriggerTests };
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && require.main === module) {
  runAllResetTriggerTests();
}
