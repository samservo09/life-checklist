// Test runner for manual retry tests
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
    body: {
      appendChild(child) {
        // Mock implementation
      }
    },
    createElement(tag) {
      const element = {
        tagName: tag.toUpperCase(),
        className: '',
        textContent: '',
        innerHTML: '',
        title: '',
        id: '',
        children: [],
        appendChild(child) {
          this.children.push(child);
          return child;
        },
        querySelector(selector) {
          // Simple querySelector implementation for testing
          if (selector === 'button[title="Retry sync"]') {
            // Return the retry button if it exists in children
            for (const child of this.children) {
              if (child.title === 'Retry sync') {
                return child;
              }
            }
          }
          return null;
        },
        onclick: null,
        onchange: null,
        onkeydown: null,
        addEventListener(event, handler) {
          if (event === 'change') this.onchange = handler;
          if (event === 'click') this.onclick = handler;
          if (event === 'keydown') this.onkeydown = handler;
        },
        click() {
          if (this.onclick) {
            this.onclick();
          }
        }
      };
      return element;
    }
  };
}

// Mock confirm function
if (typeof confirm === 'undefined') {
  global.confirm = (message) => true;
}

// Load modules in order
const configModule = require('./src/config.js');
global.CONFIG = configModule.CONFIG;
global.isUsingGoogleSheets = configModule.isUsingGoogleSheets;

const dataModule = require('./src/data.js');
global.ChecklistItem = dataModule.ChecklistItem;
global.InventoryItem = dataModule.InventoryItem;
global.RitualStep = dataModule.RitualStep;

const utilsModule = require('./src/utils.js');
global.createElement = utilsModule.createElement;
global.formatTime = utilsModule.formatTime;
global.getCompletionColor = utilsModule.getCompletionColor;
global.getCompletionEmoji = utilsModule.getCompletionEmoji;
global.getAreaTitle = utilsModule.getAreaTitle;
global.getDayName = utilsModule.getDayName;
global.getVariantLabel = utilsModule.getVariantLabel;
global.showNotification = utilsModule.showNotification;

const apiModule = require('./src/api.js');
global.apiService = apiModule.apiService;

const stateModule = require('./src/state.js');
global.StateManager = stateModule.StateManager;
global.stateManager = stateModule.stateManager;

// Load components for component tests
const componentsModule = require('./src/components.js');
global.renderSyncStatus = componentsModule.renderSyncStatus;
global.renderChecklistItem = componentsModule.renderChecklistItem;
global.renderInventoryItem = componentsModule.renderInventoryItem;
global.renderAddItemForm = componentsModule.renderAddItemForm;

// Now run the tests
const testModule = require('./src/manual-retry.test.js');

// Call the test runner function
testModule.runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
