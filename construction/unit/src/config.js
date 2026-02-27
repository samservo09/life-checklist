// config.js - LOCAL DEV OVERRIDE
const CONFIG = {
  SHEET_ID: 'LOCAL_DEV_MODE',
  API_KEY: 'LOCAL_DEV_MODE',
  APP_NAME: 'Life OS Unit',
  IS_DEV: true,
  LOCAL_STORAGE_KEY: 'lifeOS_data',
  API_BASE_URL: 'http://localhost:8000/api',
  USE_GOOGLE_SHEETS: false,
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
  AUTO_SYNC_INTERVAL: 60000
};

// Helper functions
function isUsingGoogleSheets() {
  return CONFIG.USE_GOOGLE_SHEETS;
}

// Export for browser and Node.js
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.isUsingGoogleSheets = isUsingGoogleSheets;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, isUsingGoogleSheets };
}
