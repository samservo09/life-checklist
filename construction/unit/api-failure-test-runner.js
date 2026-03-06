// Test runner for API failure simulation tests
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

// Mock document object for DOM operations
if (typeof document === 'undefined') {
  global.document = {
    createElement(tag) {
      const element = {
        tagName: tag.toUpperCase(),
        className: '',
        textContent: '',
        innerHTML: '',
        title: '',
        children: [],
        appendChild(child) {
          this.children.push(child);
          return child;
        },
        onclick: null,
        onchange: null,
        onkeydown: null,
        addEventListener(event, handler) {
          if (event === 'change') this.onchange = handler;
          if (event === 'click') this.onclick = handler;
          if (event === 'keydown') this.onkeydown = handler;
        }
      };
      return element;
    }
  };
}

// Load modules in order
const configModule = require('./src/config.js');
global.CONFIG = configModule.CONFIG;
global.isUsingGoogleSheets = configModule.isUsingGoogleSheets;
global.hasValidGoogleSheetsCredentials = configModule.hasValidGoogleSheetsCredentials;

require('./src/data.js');
const utilsModule = require('./src/utils.js');
global.retryWithBackoff = utilsModule.retryWithBackoff;

const apiModule = require('./src/api.js');
global.ApiService = apiModule.ApiService;
global.apiService = apiModule.apiService;

// Now run the tests
const testModule = require('./src/api-failure.test.js');

// Call the test runner function
testModule.runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
