#!/usr/bin/env node

// Simple test runner for optimistic update tests
// This avoids the optional chaining syntax issue in config.js

// Mock CONFIG object for testing
global.CONFIG = {
  LOCAL_STORAGE_KEY: 'lifeOS_data',
  BOARDS: {
    CHORES: 'chores',
    SELF_CARE: 'selfCare',
    BATH_RITUAL: 'bathRitual',
    FRIDGE: 'fridge',
    NON_FOOD: 'nonFood',
    BATHROOM_CLEAN: 'bathroomClean',
    PANTRY: 'pantry',
    GYM: 'gym',
    RTO: 'rto',
    FIRST_AID: 'firstAid'
  },
  ITEM_TYPES: {
    CHECKLIST: 'checklist',
    INVENTORY: 'inventory',
    RITUAL: 'ritual'
  },
  INVENTORY_STATUS: ['low', 'half', 'full'],
  SELF_CARE_CATEGORIES: {
    MORNING: 'morning',
    EVENING: 'evening'
  },
  BATH_VARIANTS: {
    MWFSAT: 'mwfsat',
    TTHSUN: 'tthsun',
    UNIVERSAL: 'universal'
  },
  LOW_ENERGY_FALLBACK_IDS: ['chores-7', 'chores-8', 'chores-9', 'chores-10'],
  RETRY_MAX_ATTEMPTS: 3,
  RETRY_BACKOFF_MS: 1000,
  AUTO_SYNC_INTERVAL: 60000,
  USE_GOOGLE_SHEETS: false
};

// Mock helper functions
global.isUsingGoogleSheets = () => false;
global.hasValidGoogleSheetsCredentials = () => false;

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      if (value === null || value === undefined) {
        delete store[key];
      } else {
        store[key] = String(value);
      }
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;

// Mock createElement for components
global.createElement = (tag, className = '') => {
  const element = {
    tagName: tag.toUpperCase(),
    className: className,
    textContent: '',
    innerHTML: '',
    children: [],
    appendChild: function(child) {
      this.children.push(child);
    },
    querySelectorAll: function(selector) {
      // Simple mock - just return empty array for now
      return [];
    }
  };
  return element;
};

// Mock utility functions
global.formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

global.showNotification = (message) => {
  console.log(`📢 Notification: ${message}`);
};

global.getAreaTitle = (area) => {
  const titles = {
    'chores': 'Chores',
    'selfCare': 'Self-Care',
    'bathRitual': 'Bath Ritual'
  };
  return titles[area] || area;
};

global.navigateToArea = (area) => {
  console.log(`Navigating to ${area}`);
};

global.getCompletionColor = (percentage) => {
  if (percentage >= 80) return 'text-green-400';
  if (percentage >= 50) return 'text-yellow-400';
  return 'text-red-400';
};

global.getCompletionEmoji = (percentage) => {
  if (percentage >= 80) return '🎉';
  if (percentage >= 50) return '⚡';
  return '🔥';
};

global.getDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

global.getVariantLabel = (variant) => {
  const labels = {
    'mwfsat': 'Mon/Wed/Fri/Sat',
    'tthsun': 'Tue/Thu/Sun',
    'universal': 'Universal'
  };
  return labels[variant] || variant;
};

global.getLocalStorageSize = () => {
  let size = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      size += localStorage[key].length + key.length;
    }
  }
  return `${(size / 1024).toFixed(2)} KB`;
};

// Mock ChecklistItem, InventoryItem, RitualStep classes
global.ChecklistItem = class {
  constructor(id, name, category) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.completed = false;
  }
};

global.InventoryItem = class {
  constructor(id, name, category) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.status = 'half';
  }
};

global.RitualStep = class {
  constructor(id, name, daySchedule) {
    this.id = id;
    this.name = name;
    this.daySchedule = daySchedule;
    this.completed = false;
  }
};

// Load the actual modules
require('./src/utils.js');
const stateModule = require('./src/state.js');
global.StateManager = stateModule.StateManager;
global.stateManager = stateModule.stateManager;

const apiModule = require('./src/api.js');
global.apiService = apiModule.apiService;

require('./src/components.js');
const testModule = require('./src/optimistic-update.test.js');

// Run the tests
console.log('Starting Optimistic Update Integration Tests...\n');
testModule.runAllOptimisticUpdateTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
