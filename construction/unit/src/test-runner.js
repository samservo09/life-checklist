// Test runner for StateManager tests
// Loads modules in the correct order for testing

// Mock localStorage for Node.js environment
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    data: {},
    getItem(key) {
      return this.data[key] || null;
    },
    setItem(key, value) {
      this.data[key] = value;
    },
    removeItem(key) {
      delete this.data[key];
    },
    clear() {
      this.data = {};
    }
  };
}

// Mock window object
if (typeof window === 'undefined') {
  global.window = {
    CONFIG: null,
    isUsingGoogleSheets: null
  };
}

// Load modules in order
const configModule = require('./config.js');
global.CONFIG = configModule.CONFIG;
global.isUsingGoogleSheets = configModule.isUsingGoogleSheets;

require('./data.js');
require('./utils.js');

const apiModule = require('./api.js');
global.apiService = apiModule.apiService;

const stateModule = require('./state.js');
global.StateManager = stateModule.StateManager;
global.stateManager = stateModule.stateManager;

// Now run the tests
const testModule = require('./state.test.js');

// Call the test runner function
testModule.runAllStateTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
