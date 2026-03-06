// Utility Functions

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Maximum number of attempts (default: 3)
 * @param {number} backoffMs - Initial backoff delay in milliseconds (default: 1000)
 * @returns {Promise} - Result of the function
 * @throws {Error} - Throws the last error if all attempts fail
 */
async function retryWithBackoff(fn, maxAttempts = 3, backoffMs = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
        throw error;
      }

      if (attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, etc.
      const delay = Math.pow(2, attempt - 1) * backoffMs;
      console.warn(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Day variant detection for bath ritual
function getDayVariant() {
  // Singapore Time (UTC+8)
  const sgtTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  const day = sgtTime.getDay();
  
  // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // MWFSat: 1, 3, 5, 6 (Monday, Wednesday, Friday, Saturday)
  // TTHSun: 2, 4, 0 (Tuesday, Thursday, Sunday)
  
  const mwfsatDays = [1, 3, 5, 6];
  return mwfsatDays.includes(day) ? 'mwfsat' : 'tthsun';
}

function getDayName() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sgtTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  return days[sgtTime.getDay()];
}

function getVariantLabel(variant) {
  return variant === 'mwfsat' ? 'Mon/Wed/Fri/Sat' : 'Tue/Thu/Sun';
}

// URL and routing utilities
function getAreaFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('area') || 'home';
}

function navigateToArea(area) {
  window.location.href = `?area=${area}`;
}

function getAreaTitle(area) {
  const titles = {
    'home': 'Life OS Dashboard',
    'chores': '🧹 Chores Board',
    'self-care': '💆 Self-Care Board',
    'bath-ritual': '🛁 Bath Ritual',
    'fridge': '🧊 Fridge & Freezer',
    'non-food': '📦 Non-Food Restock',
    'bathroom-clean': '🚿 Bathroom Cleaning',
    'pantry': '🥫 Pantry Stock',
    'gym': '💪 Gym Checklist',
    'rto': '🏢 RTO Checklist',
    'first-aid': '🏥 First-Aid Tracker'
  };
  return titles[area] || 'Life OS';
}

// Formatting utilities
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

// Completion percentage utilities
function getCompletionColor(percentage) {
  if (percentage === 0) return 'text-gray-400';
  if (percentage < 25) return 'text-red-400';
  if (percentage < 50) return 'text-yellow-400';
  if (percentage < 75) return 'text-blue-400';
  return 'text-green-400';
}

function getCompletionEmoji(percentage) {
  if (percentage === 0) return '⭕';
  if (percentage < 25) return '🔴';
  if (percentage < 50) return '🟡';
  if (percentage < 75) return '🔵';
  return '🟢';
}

// Board mapping
const boardMap = {
  'home': 'renderHome',
  'chores': 'renderChoresBoard',
  'self-care': 'renderSelfCareBoard',
  'bath-ritual': 'renderBathRitualBoard',
  'fridge': 'renderFridgeBoard',
  'non-food': 'renderNonFoodBoard',
  'bathroom-clean': 'renderBathroomCleanBoard',
  'pantry': 'renderPantryBoard',
  'gym': 'renderGymBoard',
  'rto': 'renderRTOBoard',
  'first-aid': 'renderFirstAidBoard'
};

const allAreas = [
  'chores', 'self-care', 'bath-ritual', 'fridge', 'non-food',
  'bathroom-clean', 'pantry', 'gym', 'rto', 'first-aid'
];

// DOM utilities
function createElement(tag, className = '', innerHTML = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Animation utilities
function addBounceAnimation(element) {
  element.classList.add('animate-bounce-in');
  setTimeout(() => element.classList.remove('animate-bounce-in'), 300);
}

function addFadeAnimation(element) {
  element.classList.add('animate-fade-in');
  setTimeout(() => element.classList.remove('animate-fade-in'), 300);
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Local storage utilities
function getLocalStorageSize() {
  let size = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      size += localStorage[key].length + key.length;
    }
  }
  return (size / 1024).toFixed(2) + ' KB';
}

// Notification utility
function showNotification(message, duration = 3000) {
  const notification = createElement('div', 'fixed top-4 right-4 bg-primary-pink text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in');
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, duration);
}

// Confirmation dialog
function showConfirmation(message) {
  return confirm(message);
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}


// ============================================
// CRUD OPERATIONS
// ============================================

function addItem(boardType, item) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  // Generate ID if not provided
  if (!item.id) {
    item.id = `${boardType}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
  
  board.items.push(item);
  
  // Log action
  logAction(boardType, item.id, 'add', item.name, null, item);
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
  showNotification(`✅ Added: ${item.name}`);
  
  // Re-render the current view
  if (typeof router === 'function') {
    router();
  }
}

function editItem(boardType, itemId, updates) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  const item = board.items.find(i => i.id === itemId);
  if (!item) return;
  
  const oldValues = { ...item };
  Object.assign(item, updates);
  
  // Log action
  logAction(boardType, itemId, 'edit', item.name, oldValues, item);
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
  showNotification(`✏️ Updated: ${item.name}`);
  
  // Re-render the current view
  if (typeof router === 'function') {
    router();
  }
}

function deleteItem(boardType, itemId) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  const itemIndex = board.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;
  
  const item = board.items[itemIndex];
  board.items.splice(itemIndex, 1);
  
  // Log action
  logAction(boardType, itemId, 'delete', item.name, item, null);
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
  showNotification(`🗑️ Deleted: ${item.name}`);
  
  // Re-render the current view
  if (typeof router === 'function') {
    router();
  }
}

function updateItem(boardType, itemId, updates) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  const item = board.items.find(i => i.id === itemId);
  if (!item) return;
  
  const oldValues = { ...item };
  Object.assign(item, updates);
  
  // Log action
  logAction(boardType, itemId, 'update', item.name, oldValues, item);
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
  
  // Re-render the current view
  if (typeof router === 'function') {
    router();
  }
}

function toggleItem(boardType, itemId) {
  const data = loadData();
  const board = data.boards[boardType];
  
  if (!board) return;
  
  const item = board.items.find(i => i.id === itemId);
  if (!item) return;
  
  const oldCompleted = item.completed;
  item.completed = !item.completed;
  item.completedAt = item.completed ? new Date().toISOString() : null;
  
  // Log action
  logAction(boardType, itemId, item.completed ? 'complete' : 'uncomplete', item.name, { completed: oldCompleted }, { completed: item.completed });
  
  // Update completion percentage
  updateCompletionPercentage(boardType, data);
  
  saveData(data);
  
  // Re-render the current view
  if (typeof router === 'function') {
    router();
  }
}

// ============================================
// FREQUENCY-BASED COMPLETION CALCULATION
// ============================================

function calculateCompletionPercentage(boardType, data) {
  const board = data.boards[boardType];
  if (!board || !board.items) return 0;
  
  const now = new Date();
  const items = board.items;
  
  // For chores, calculate based on daily items only
  if (boardType === 'chores') {
    const dailyItems = items.filter(i => i.category === 'daily');
    if (dailyItems.length === 0) return 0;
    
    const completedDaily = dailyItems.filter(i => {
      if (!i.completedAt) return false;
      const completedDate = new Date(i.completedAt);
      const daysDiff = Math.floor((now - completedDate) / (1000 * 60 * 60 * 24));
      return daysDiff === 0; // Completed today
    }).length;
    
    return Math.round((completedDaily / dailyItems.length) * 100);
  }
  
  // For other boards, simple percentage
  const completed = items.filter(i => i.completed).length;
  return items.length === 0 ? 0 : Math.round((completed / items.length) * 100);
}

function updateCompletionPercentage(boardType, data) {
  const board = data.boards[boardType];
  if (!board) return;
  
  board.completionPercentage = calculateCompletionPercentage(boardType, data);
}

// ============================================
// LOGGING & STATE MANAGEMENT
// ============================================

function logAction(boardType, itemId, action, itemName, previousState, newState) {
  const data = loadData();
  
  data.consistencyLog.push({
    timestamp: new Date().toISOString(),
    boardType: boardType,
    itemId: itemId,
    action: action,
    itemName: itemName,
    previousState: previousState,
    newState: newState
  });
  
  // Keep only last 1000 logs
  if (data.consistencyLog.length > 1000) {
    data.consistencyLog = data.consistencyLog.slice(-1000);
  }
  
  saveData(data);
}

// ============================================
// LOW ENERGY MODE
// ============================================

function toggleLowEnergyMode(enabled) {
  const data = loadData();
  data.boards.chores.lowEnergyMode = enabled;
  saveData(data);
  
  // Re-render the current view
  if (typeof router === 'function') {
    router();
  }
}

function getLowEnergyItems() {
  const data = loadData();
  const fallbackIds = ['chores-7', 'chores-8', 'chores-9', 'chores-10'];
  return data.boards.chores.items.filter(item => fallbackIds.includes(item.id));
}

/**
 * Get current time in Singapore timezone (UTC+8)
 * @returns {Date} Current time in Singapore
 */
function getSingaporeTime() {
  const now = new Date();
  // Singapore is UTC+8
  const singaporeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  return singaporeTime;
}

/**
 * Check if it's 12 AM (midnight) in Singapore timezone
 * @returns {boolean} True if current time is between 12:00 AM and 12:01 AM Singapore time
 */
function isMidnightSingapore() {
  const singaporeTime = getSingaporeTime();
  const hours = singaporeTime.getHours();
  const minutes = singaporeTime.getMinutes();
  
  // Check if it's 12 AM (00:00 - 00:01)
  return hours === 0 && minutes === 0;
}

/**
 * Calculate milliseconds until next 12 AM Singapore time
 * @returns {number} Milliseconds until next midnight
 */
function getMillisecondsUntilMidnightSingapore() {
  const singaporeTime = getSingaporeTime();
  
  // Create a date for tomorrow at 12 AM Singapore time
  const tomorrow = new Date(singaporeTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // Calculate difference
  const msUntilMidnight = tomorrow.getTime() - singaporeTime.getTime();
  
  return msUntilMidnight;
}

/**
 * Schedule daily reset at 12 AM Singapore time
 * @param {StateManager} stateManager - The state manager instance
 * @returns {number} Timeout ID for the scheduled reset
 */
function scheduleDailyResetAtMidnightSingapore(stateManager) {
  if (!stateManager) {
    console.error('StateManager is required for scheduling reset');
    return null;
  }

  // Calculate time until next midnight
  const msUntilMidnight = getMillisecondsUntilMidnightSingapore();
  
  console.log(`⏰ Daily reset scheduled for 12 AM Singapore time (in ${Math.round(msUntilMidnight / 1000 / 60)} minutes)`);
  
  // Schedule the reset
  const timeoutId = setTimeout(async () => {
    console.log('🔄 Triggering daily reset at 12 AM Singapore time...');
    
    try {
      // Reset all boards
      const boards = Object.values(CONFIG.BOARDS);
      for (const boardType of boards) {
        await stateManager.resetBoardItems(boardType);
      }
      
      console.log('✓ Daily reset completed successfully');
      
      // Re-schedule for next day
      scheduleDailyResetAtMidnightSingapore(stateManager);
    } catch (error) {
      console.error('Failed to execute daily reset:', error);
      
      // Re-schedule for next day even if reset failed
      scheduleDailyResetAtMidnightSingapore(stateManager);
    }
  }, msUntilMidnight);
  
  return timeoutId;
}

/**
 * Stop the scheduled daily reset
 * @param {number} timeoutId - The timeout ID returned by scheduleDailyResetAtMidnightSingapore
 */
function stopScheduledReset(timeoutId) {
  if (timeoutId) {
    clearTimeout(timeoutId);
    console.log('Daily reset scheduling stopped');
  }
}


// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createElement,
    clearElement,
    formatDate,
    formatTime,
    formatDateTime,
    getCompletionColor,
    getCompletionEmoji,
    getAreaTitle,
    getDayName,
    getVariantLabel,
    navigateToArea,
    getAreaFromURL,
    showNotification,
    debounce,
    throttle,
    getLocalStorageSize,
    toggleLowEnergyMode,
    getLowEnergyItems,
    getSingaporeTime,
    isMidnightSingapore,
    getMillisecondsUntilMidnightSingapore,
    scheduleDailyResetAtMidnightSingapore,
    stopScheduledReset
  };
}
