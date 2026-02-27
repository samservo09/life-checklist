// Test for retryWithBackoff utility function

/**
 * Test: retryWithBackoff succeeds on first attempt
 */
async function testRetryWithBackoffSucceedsOnFirstAttempt() {
  let callCount = 0;
  const fn = async () => {
    callCount++;
    return 'success';
  };

  const result = await retryWithBackoff(fn, 3, 100);
  
  if (result !== 'success' || callCount !== 1) {
    throw new Error(`Expected 1 call and 'success', got ${callCount} calls and '${result}'`);
  }
  console.log('✓ Test passed: retryWithBackoff succeeds on first attempt');
}

/**
 * Test: retryWithBackoff retries on failure and eventually succeeds
 */
async function testRetryWithBackoffRetriesAndSucceeds() {
  let callCount = 0;
  const fn = async () => {
    callCount++;
    if (callCount < 3) {
      const error = new Error('Temporary failure');
      error.statusCode = 500; // Server error, should retry
      throw error;
    }
    return 'success';
  };

  const result = await retryWithBackoff(fn, 3, 50);
  
  if (result !== 'success' || callCount !== 3) {
    throw new Error(`Expected 3 calls and 'success', got ${callCount} calls and '${result}'`);
  }
  console.log('✓ Test passed: retryWithBackoff retries and succeeds');
}

/**
 * Test: retryWithBackoff throws after max attempts
 */
async function testRetryWithBackoffThrowsAfterMaxAttempts() {
  let callCount = 0;
  const fn = async () => {
    callCount++;
    const error = new Error('Persistent failure');
    error.statusCode = 500;
    throw error;
  };

  try {
    await retryWithBackoff(fn, 3, 50);
    throw new Error('Expected error to be thrown');
  } catch (error) {
    if (error.message === 'Expected error to be thrown') {
      throw error;
    }
    if (callCount !== 3) {
      throw new Error(`Expected 3 calls, got ${callCount}`);
    }
    console.log('✓ Test passed: retryWithBackoff throws after max attempts');
  }
}

/**
 * Test: retryWithBackoff does not retry on 4xx errors (except 429)
 */
async function testRetryWithBackoffDoesNotRetryOn4xxErrors() {
  let callCount = 0;
  const fn = async () => {
    callCount++;
    const error = new Error('Bad request');
    error.statusCode = 400;
    throw error;
  };

  try {
    await retryWithBackoff(fn, 3, 50);
    throw new Error('Expected error to be thrown');
  } catch (error) {
    if (error.message === 'Expected error to be thrown') {
      throw error;
    }
    if (callCount !== 1) {
      throw new Error(`Expected 1 call (no retry on 4xx), got ${callCount}`);
    }
    console.log('✓ Test passed: retryWithBackoff does not retry on 4xx errors');
  }
}

/**
 * Test: retryWithBackoff retries on 429 (rate limit)
 */
async function testRetryWithBackoffRetriesOn429() {
  let callCount = 0;
  const fn = async () => {
    callCount++;
    if (callCount < 2) {
      const error = new Error('Rate limited');
      error.statusCode = 429;
      throw error;
    }
    return 'success';
  };

  const result = await retryWithBackoff(fn, 3, 50);
  
  if (result !== 'success' || callCount !== 2) {
    throw new Error(`Expected 2 calls and 'success', got ${callCount} calls and '${result}'`);
  }
  console.log('✓ Test passed: retryWithBackoff retries on 429 (rate limit)');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Running retryWithBackoff tests...\n');
  
  try {
    await testRetryWithBackoffSucceedsOnFirstAttempt();
    await testRetryWithBackoffRetriesAndSucceeds();
    await testRetryWithBackoffThrowsAfterMaxAttempts();
    await testRetryWithBackoffDoesNotRetryOn4xxErrors();
    await testRetryWithBackoffRetriesOn429();
    
    console.log('\n✓ All tests passed!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && require.main === module) {
  runAllTests();
}
