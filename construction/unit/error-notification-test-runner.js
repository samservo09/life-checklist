// Test runner for error notification tests

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// Mock localStorage
const localStorageMock = {
  getItem(key) {
    return this[key] || null;
  },
  setItem(key, value) {
    this[key] = value;
  },
  removeItem(key) {
    delete this[key];
  },
  clear() {
    for (const key in this) {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete this[key];
      }
    }
  }
};

global.localStorage = localStorageMock;

// Mock DOM
global.document = {
  body: {
    appendChild() {},
    querySelectorAll() { return []; }
  },
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      className: '',
      textContent: '',
      innerHTML: '',
      appendChild() {},
      querySelector() { return null; },
      querySelectorAll() { return []; },
      addEventListener() {},
      removeEventListener() {},
      click() {},
      focus() {},
      remove() {},
      style: {}
    };
  }
};

// Mock window
global.window = {
  location: { reload() {} }
};

// Mock confirm
global.confirm = () => true;

// Mock fetch
global.fetch = async () => {
  return { ok: true, json: async () => ({ success: true }) };
};

// Mock createElement helper
global.createElement = (tag, className = '') => {
  const element = {
    tagName: tag.toUpperCase(),
    className: className,
    textContent: '',
    innerHTML: '',
    id: '',
    type: '',
    value: '',
    checked: false,
    title: '',
    placeholder: '',
    children: [],
    appendChild(child) {
      this.children.push(child);
    },
    querySelector(selector) {
      // Recursive search for elements
      const search = (el) => {
        // Check current element
        if (selector.includes('button[title')) {
          const titleMatch = selector.match(/title="([^"]+)"/);
          if (titleMatch && el.title === titleMatch[1]) {
            return el;
          }
        }
        // Search children
        if (el.children) {
          for (const child of el.children) {
            const result = search(child);
            if (result) return result;
          }
        }
        return null;
      };
      return search(this);
    },
    querySelectorAll(selector) {
      const results = [];
      const search = (el) => {
        if (selector.includes('[')) {
          const attrMatch = selector.match(/\[([^\]]+)\]/);
          if (attrMatch) {
            const [attrName, attrValue] = attrMatch[1].split('=');
            if (el[attrName.trim()] === attrValue?.replace(/"/g, '')) {
              results.push(el);
            }
          }
        }
        if (el.children) {
          for (const child of el.children) {
            search(child);
          }
        }
      };
      search(this);
      return results;
    },
    addEventListener() {},
    removeEventListener() {},
    click() {},
    focus() {},
    remove() {},
    style: {},
    onchange: null,
    onclick: null,
    onkeydown: null
  };
  return element;
};

// Mock formatTime
global.formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// Mock getCompletionColor
global.getCompletionColor = (percentage) => {
  if (percentage === 100) return 'text-green-400';
  if (percentage >= 50) return 'text-yellow-400';
  return 'text-red-400';
};

// Mock getCompletionEmoji
global.getCompletionEmoji = (percentage) => {
  if (percentage === 100) return '🎉';
  if (percentage >= 50) return '📈';
  return '📉';
};

// Mock getAreaTitle
global.getAreaTitle = (area) => {
  const titles = {
    'chores': 'Chores',
    'self-care': 'Self-Care',
    'bath-ritual': 'Bath Ritual',
    'fridge': 'Fridge',
    'non-food': 'Non-Food',
    'pantry': 'Pantry',
    'gym': 'Gym',
    'rto': 'RTO',
    'bathroom-clean': 'Bathroom',
    'first-aid': 'First-Aid'
  };
  return titles[area] || area;
};

// Mock getDayName
global.getDayName = () => 'Monday';

// Mock getVariantLabel
global.getVariantLabel = (variant) => {
  const labels = {
    'mwfsat': 'Mon/Wed/Fri/Sat',
    'tthsun': 'Tue/Thu/Sun',
    'universal': 'Universal'
  };
  return labels[variant] || variant;
};

// Mock navigateToArea
global.navigateToArea = () => {};

// Mock router
global.router = () => {};

// Mock showNotification
global.showNotification = (message) => {
  console.log(`📢 Notification: ${message}`);
};

// Mock getLocalStorageSize
global.getLocalStorageSize = () => '0 KB';

// Load required modules - CONFIG must be loaded first
const configModule = require('./src/config.js');
global.CONFIG = configModule.CONFIG;

const dataModule = require('./src/data.js');
const utilsModule = require('./src/utils.js');
const stateModule = require('./src/state.js');
const apiModule = require('./src/api.js');
const componentsModule = require('./src/components.js');
const testModule = require('./src/error-notification.test.js');

// Set up globals
global.ChecklistItem = dataModule.ChecklistItem;
global.InventoryItem = dataModule.InventoryItem;
global.RitualStep = dataModule.RitualStep;
global.StateManager = stateModule.StateManager;
global.ApiService = apiModule.ApiService;
global.renderSyncStatus = componentsModule.renderSyncStatus;
global.renderChecklistItem = componentsModule.renderChecklistItem;
global.renderInventoryItem = componentsModule.renderInventoryItem;
global.renderAddItemForm = componentsModule.renderAddItemForm;

// Create global instances
global.stateManager = new StateManager();
global.apiService = new ApiService();

// Run tests
testModule.runAllTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
