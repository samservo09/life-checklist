// config.js - Environment-based configuration with graceful degradation
// Helper to safely read environment variables
function getEnvVar(key, defaultValue = null) {
  // Try process.env (Node.js/bundlers)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value) return value;
  }
  
  // Try window (browser globals)
  if (typeof window !== 'undefined' && window[key]) {
    return window[key];
  }
  
  // Try import.meta.env (Vite) - only in browser context
  try {
    if (typeof globalThis !== 'undefined' && globalThis.import && globalThis.import.meta && globalThis.import.meta.env) {
      const value = globalThis.import.meta.env[key];
      if (value) return value;
    }
  } catch (e) {
    // Silently ignore if import.meta is not available
  }
  
  return defaultValue;
}

// Determine if Google Sheets credentials are available
const SHEET_ID = getEnvVar('VITE_GOOGLE_SHEET_ID') || getEnvVar('GOOGLE_SHEET_ID');
const CLIENT_ID = getEnvVar('VITE_GOOGLE_CLIENT_ID') || getEnvVar('GOOGLE_CLIENT_ID');
const USE_GOOGLE_SHEETS = !!(SHEET_ID && CLIENT_ID && SHEET_ID !== 'LOCAL_DEV_MODE' && CLIENT_ID !== 'LOCAL_DEV_MODE');

// Log configuration status for debugging
if (typeof console !== 'undefined') {
  if (USE_GOOGLE_SHEETS) {
    console.log('✓ Google Sheets integration enabled');
  } else {
    console.log('ℹ️ Google Sheets credentials not found - using Local Mode (localStorage)');
  }
}

const CONFIG = {
  SHEET_ID: SHEET_ID || 'LOCAL_DEV_MODE',
  CLIENT_ID: CLIENT_ID || 'LOCAL_DEV_MODE', // OAuth 2.0 Client ID for Google Sheets API
  GOOGLE_SHEETS_API_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
  OAUTH_REDIRECT_URI: (typeof window !== 'undefined' && window.location) ? window.location.origin : 'http://localhost:3000', // OAuth 2.0 redirect URI
  OAUTH_SCOPES: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly'
  ],
  APP_NAME: 'Life OS Unit',
  IS_DEV: true,
  LOCAL_STORAGE_KEY: 'lifeOS_data',
  API_BASE_URL: (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 'http://localhost:8001/api' : '/api',
  USE_GOOGLE_SHEETS: USE_GOOGLE_SHEETS,
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
  TOKEN_REFRESH_BUFFER_MS: 5 * 60 * 1000 // Refresh token 5 minutes before expiry
};

// Helper functions
function isUsingGoogleSheets() {
  return CONFIG.USE_GOOGLE_SHEETS;
}

function hasValidGoogleSheetsCredentials() {
  return CONFIG.USE_GOOGLE_SHEETS && 
         CONFIG.SHEET_ID !== 'LOCAL_DEV_MODE' && 
         CONFIG.CLIENT_ID !== 'LOCAL_DEV_MODE';
}

// Export for browser and Node.js
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.isUsingGoogleSheets = isUsingGoogleSheets;
  window.hasValidGoogleSheetsCredentials = hasValidGoogleSheetsCredentials;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, isUsingGoogleSheets, hasValidGoogleSheetsCredentials };
}
