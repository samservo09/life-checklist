// Test runner for Component tests
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
        id: '',
        children: [],
        querySelectorAll(selector) {
          // Simple selector support for [id^="error-"]
          if (selector === '[id^="error-"]') {
            return this.children.filter(child => child.id && child.id.startsWith('error-'));
          }
          return [];
        },
        querySelector(selector) {
          if (selector === 'button') {
            return this.children.find(child => child.tagName === 'BUTTON');
          }
          return null;
        },
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
const configModule = require('./config.js');
global.CONFIG = configModule.CONFIG;
global.isUsingGoogleSheets = configModule.isUsingGoogleSheets;

require('./data.js');
const utilsModule = require('./utils.js');
global.createElement = utilsModule.createElement;
global.formatTime = utilsModule.formatTime;
global.getCompletionColor = utilsModule.getCompletionColor;
global.getCompletionEmoji = utilsModule.getCompletionEmoji;
global.getAreaTitle = utilsModule.getAreaTitle;
global.getDayName = utilsModule.getDayName;
global.getVariantLabel = utilsModule.getVariantLabel;
global.showNotification = utilsModule.showNotification;
global.clearElement = utilsModule.clearElement;
global.getLocalStorageSize = utilsModule.getLocalStorageSize;

const apiModule = require('./api.js');
global.apiService = apiModule.apiService;

const stateModule = require('./state.js');
global.StateManager = stateModule.StateManager;
global.stateManager = stateModule.stateManager;

// Load components for component tests
const componentsModule = require('./components.js');
global.renderSyncStatus = componentsModule.renderSyncStatus;
global.renderChecklistItem = componentsModule.renderChecklistItem;
global.renderInventoryItem = componentsModule.renderInventoryItem;
global.renderAddItemForm = componentsModule.renderAddItemForm;

// Now run the tests
const testModule = require('./components.test.js');

// Call the test runner function
testModule.runAllComponentTests();
