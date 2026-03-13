// config.js - Environment-based configuration with graceful degradation
// Last updated: 2025-03-13 - Production domain detection

// Detect if running on production (Vercel) or localhost
// The backend uses a service account, so we only need to check the domain
const IS_PRODUCTION = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const USE_GOOGLE_SHEETS = IS_PRODUCTION;

// Log configuration status for debugging
if (typeof console !== 'undefined') {
  if (USE_GOOGLE_SHEETS) {
    console.log('✓ Google Sheets integration enabled (production domain detected)');
  } else {
    console.log('ℹ️ Using Local Mode (localStorage) - localhost or non-production domain');
  }
}

const CONFIG = {
  // Note: SHEET_ID and CLIENT_ID are not needed in the frontend.
  // The backend uses a service account (GOOGLE_SERVICE_ACCOUNT_KEY) for all Google Sheets operations.
  // The frontend only calls /api/sheets endpoints, which handle authentication server-side.
  SHEET_ID: '',
  CLIENT_ID: '',
  GOOGLE_SHEETS_API_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
  OAUTH_REDIRECT_URI: (typeof window !== 'undefined' && window.location) ? window.location.origin : 'http://localhost:3000',
  OAUTH_SCOPES: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly'
  ],
  APP_NAME: 'Life OS Unit',
  IS_DEV: true,
  LOCAL_STORAGE_KEY: 'lifeOS_data',
  API_BASE_URL: IS_PRODUCTION ? '/api/sheets' : 'http://localhost:8001/api',
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
  // On production, we always have valid credentials (service account on backend)
  // On localhost, we use local mode
  return CONFIG.USE_GOOGLE_SHEETS;
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
