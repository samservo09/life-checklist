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
  LOW_ENERGY_FALLBACK_IDS: ['chores-7', 'chores-8', 'chores-9', 'chores-10']
};

// Helper functions
function isUsingGoogleSheets() {
  return CONFIG.USE_GOOGLE_SHEETS;
}

// Export for browser
window.CONFIG = CONFIG;
window.isUsingGoogleSheets = isUsingGoogleSheets;
