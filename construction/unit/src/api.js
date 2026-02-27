// API Service for Life OS
// Handles communication with Google Sheets API and local mock server

// Offline Queue for storing failed operations
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.loadQueue();
  }

  // Add operation to queue
  add(operation) {
    this.queue.push({
      ...operation,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });
    this.saveQueue();
    console.log(`Operation queued for retry: ${operation.type} on ${operation.boardType}`);
  }

  // Get all queued operations
  getAll() {
    return [...this.queue];
  }

  // Remove operation from queue
  remove(index) {
    if (index >= 0 && index < this.queue.length) {
      this.queue.splice(index, 1);
      this.saveQueue();
    }
  }

  // Clear entire queue
  clear() {
    this.queue = [];
    this.saveQueue();
    console.log('Offline queue cleared');
  }

  // Save queue to localStorage
  saveQueue() {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue to localStorage:', error);
    }
  }

  // Load queue from localStorage
  loadQueue() {
    try {
      const stored = localStorage.getItem('offlineQueue');
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`Loaded ${this.queue.length} operations from offline queue`);
      }
    } catch (error) {
      console.error('Failed to load offline queue from localStorage:', error);
      this.queue = [];
    }
  }

  // Process queued operations
  async processQueue(apiService) {
    if (this.queue.length === 0) {
      return { processed: 0, failed: 0 };
    }

    console.log(`Processing ${this.queue.length} queued operations...`);
    let processed = 0;
    let failed = 0;

    // Process operations in order
    for (let i = 0; i < this.queue.length; i++) {
      const operation = this.queue[i];
      
      try {
        await this.executeOperation(operation, apiService);
        this.remove(i);
        i--; // Adjust index after removal
        processed++;
      } catch (error) {
        console.error(`Failed to process queued operation: ${operation.type}`, error);
        operation.retryCount = (operation.retryCount || 0) + 1;
        
        // Remove after 5 failed retries
        if (operation.retryCount >= 5) {
          console.warn(`Removing operation after 5 failed retries: ${operation.type}`);
          this.remove(i);
          i--;
        }
        
        failed++;
      }
    }

    this.saveQueue();
    console.log(`Queue processing complete: ${processed} processed, ${failed} failed`);
    return { processed, failed };
  }

  // Execute a single queued operation
  async executeOperation(operation, apiService) {
    switch (operation.type) {
      case 'append':
        return await apiService.appendItem(operation.boardType, operation.item);
      case 'update':
        return await apiService.updateItemInSheet(operation.boardType, operation.itemId, operation.updates);
      case 'delete':
        return await apiService.deleteItemFromSheet(operation.boardType, operation.itemId);
      case 'batch-append':
        return await apiService.batchAppendItems(operation.boardType, operation.items);
      case 'toggle':
        return await apiService.toggleItem(operation.boardType, operation.itemId);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }
}

class ApiService {
  constructor() {
    this.baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'http://localhost:8000/api';
    this.useGoogleSheets = (typeof isUsingGoogleSheets === 'function') ? isUsingGoogleSheets() : false;
    this.offlineQueue = new OfflineQueue();
    this.maxRetries = (typeof CONFIG !== 'undefined' && CONFIG.RETRY_MAX_ATTEMPTS) ? CONFIG.RETRY_MAX_ATTEMPTS : 3;
    this.retryBackoffMs = (typeof CONFIG !== 'undefined' && CONFIG.RETRY_BACKOFF_MS) ? CONFIG.RETRY_BACKOFF_MS : 1000;
  }

  // Retry logic with exponential backoff
  async retryWithBackoff(fn, maxAttempts = null) {
    maxAttempts = maxAttempts || this.maxRetries;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[RETRY] Attempt ${attempt}/${maxAttempts} - Retrying operation...`);
        }
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          console.error(`[RETRY] Non-retryable error (${error.statusCode}): ${error.message}`);
          throw error;
        }

        if (attempt === maxAttempts) {
          console.error(`[RETRY] Max retries (${maxAttempts}) reached. Final error: ${error.message}`);
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, etc.
        const delay = Math.pow(2, attempt - 1) * this.retryBackoffMs;
        console.warn(`[RETRY] Attempt ${attempt}/${maxAttempts} failed. Error: ${error.message}. Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Generic fetch wrapper with error handling
  async fetch(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const error = new Error(`API Error: ${response.status} ${response.statusText}`);
        error.statusCode = response.status;
        error.response = response;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Add item to Google Sheets
  async addItem(boardType, item) {
    if (!this.useGoogleSheets) {
      // Local mock - just return the item
      return item;
    }

    try {
      return await this.fetch('/items', {
        method: 'POST',
        body: JSON.stringify({
          boardType,
          item
        })
      });
    } catch (error) {
      console.error('Failed to add item to Google Sheets:', error);
      throw error;
    }
  }

  // Append item to Google Sheet (new row)
  async appendItem(boardType, item) {
    if (!this.useGoogleSheets) {
      // Local mock - just return the item with timestamp
      return {
        ...item,
        timestamp: new Date().toISOString()
      };
    }

    // Validate input
    if (!boardType || !item || !item.id || !item.name) {
      throw new Error('Invalid item: boardType, item.id, and item.name are required');
    }

    const operation = {
      type: 'append',
      boardType,
      item: {
        id: item.id,
        name: item.name,
        category: item.category || '',
        status: item.status || '',
        completed: item.completed || false,
        timestamp: new Date().toISOString(),
        notes: item.notes || ''
      }
    };

    try {
      return await this.retryWithBackoff(async () => {
        return await this.fetch('/items/append', {
          method: 'POST',
          body: JSON.stringify({
            boardType,
            item: operation.item
          })
        });
      });
    } catch (error) {
      console.error(`Failed to append item to ${boardType} sheet after retries:`, error);
      // Queue for later retry
      this.offlineQueue.add(operation);
      throw error;
    }
  }

  // Update item in Google Sheets
  async updateItem(boardType, itemId, updates) {
    if (!this.useGoogleSheets) {
      // Local mock - just return the updates
      return updates;
    }

    try {
      return await this.fetch(`/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          boardType,
          updates
        })
      });
    } catch (error) {
      console.error('Failed to update item in Google Sheets:', error);
      throw error;
    }
  }

  // Update item in Google Sheet (explicit method name per design spec)
  async updateItemInSheet(boardType, itemId, updates) {
    if (!this.useGoogleSheets) {
      // Local mock - just return the updates with timestamp
      return {
        ...updates,
        timestamp: new Date().toISOString()
      };
    }

    // Validate input
    if (!boardType || !itemId || !updates) {
      throw new Error('Invalid update: boardType, itemId, and updates are required');
    }

    const operation = {
      type: 'update',
      boardType,
      itemId,
      updates: {
        ...updates,
        timestamp: new Date().toISOString()
      }
    };

    try {
      return await this.retryWithBackoff(async () => {
        return await this.fetch(`/items/${itemId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            boardType,
            updates: operation.updates
          })
        });
      });
    } catch (error) {
      console.error(`Failed to update item in ${boardType} sheet after retries:`, error);
      // Queue for later retry
      this.offlineQueue.add(operation);
      throw error;
    }
  }

  // Delete item from Google Sheets
  async deleteItem(boardType, itemId) {
    if (!this.useGoogleSheets) {
      // Local mock - just return success
      return { success: true };
    }

    try {
      return await this.fetch(`/items/${itemId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          boardType
        })
      });
    } catch (error) {
      console.error('Failed to delete item from Google Sheets:', error);
      throw error;
    }
  }

  // Delete item from Google Sheet (explicit method name per design spec)
  async deleteItemFromSheet(boardType, itemId) {
    if (!this.useGoogleSheets) {
      // Local mock - just return success
      return { success: true };
    }

    // Validate input
    if (!boardType || !itemId) {
      throw new Error('Invalid delete: boardType and itemId are required');
    }

    const operation = {
      type: 'delete',
      boardType,
      itemId
    };

    try {
      return await this.retryWithBackoff(async () => {
        return await this.fetch(`/items/${itemId}`, {
          method: 'DELETE',
          body: JSON.stringify({
            boardType
          })
        });
      });
    } catch (error) {
      console.error(`Failed to delete item from ${boardType} sheet after retries:`, error);
      // Queue for later retry
      this.offlineQueue.add(operation);
      throw error;
    }
  }

  // Get all items for a board from Google Sheets
  async getBoard(boardType) {
    if (!this.useGoogleSheets) {
      // Local mock - return null to use local state
      return null;
    }

    try {
      return await this.fetch(`/boards/${boardType}`);
    } catch (error) {
      console.error('Failed to get board from Google Sheets:', error);
      throw error;
    }
  }

  // Fetch all items from a specific board/sheet in Google Sheets
  async fetchBoardFromSheet(boardType) {
    if (!this.useGoogleSheets) {
      // Local mock - return empty array when not using Google Sheets
      return [];
    }

    // Validate input
    if (!boardType) {
      throw new Error('Invalid fetch: boardType is required');
    }

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.fetch(`/boards/${boardType}`, {
          method: 'GET'
        });
      });

      // Ensure response is an array of items
      if (Array.isArray(response)) {
        return response;
      }

      // If response has an items property, return that
      if (response && Array.isArray(response.items)) {
        return response.items;
      }

      // Otherwise return empty array
      return [];
    } catch (error) {
      console.error(`Failed to fetch board ${boardType} from Google Sheets after retries:`, error);
      // Return empty array on failure to allow app to continue with local data
      return [];
    }
  }

  // Batch append multiple items to Google Sheet (new rows)
  async batchAppendItems(boardType, items) {
    if (!this.useGoogleSheets) {
      // Local mock - return items with timestamps
      return items.map(item => ({
        ...item,
        timestamp: new Date().toISOString()
      }));
    }

    // Validate input
    if (!boardType || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid batch append: boardType and non-empty items array are required');
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.name) {
        throw new Error('Invalid item in batch: each item must have id and name');
      }
    }

    const operation = {
      type: 'batch-append',
      boardType,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || '',
        status: item.status || '',
        completed: item.completed || false,
        timestamp: new Date().toISOString(),
        notes: item.notes || ''
      }))
    };

    try {
      return await this.retryWithBackoff(async () => {
        return await this.fetch('/items/batch-append', {
          method: 'POST',
          body: JSON.stringify({
            boardType,
            items: operation.items
          })
        });
      });
    } catch (error) {
      console.error(`Failed to batch append items to ${boardType} sheet after retries:`, error);
      // Queue for later retry
      this.offlineQueue.add(operation);
      throw error;
    }
  }

  // Batch update items in Google Sheets
  async batchUpdateItems(boardType, items) {
    if (!this.useGoogleSheets) {
      // Local mock - return items with timestamps
      return items.map(item => ({
        ...item,
        timestamp: new Date().toISOString()
      }));
    }

    // Validate input
    if (!boardType || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid batch update: boardType and non-empty items array are required');
    }

    // Validate each item
    for (const item of items) {
      if (!item.id) {
        throw new Error('Invalid item in batch: each item must have id');
      }
    }

    const operation = {
      type: 'batch-update',
      boardType,
      items: items.map(item => ({
        id: item.id,
        completed: item.completed !== undefined ? item.completed : false,
        completedAt: item.completedAt || null,
        timestamp: new Date().toISOString()
      }))
    };

    try {
      return await this.retryWithBackoff(async () => {
        return await this.fetch('/items/batch-update', {
          method: 'PATCH',
          body: JSON.stringify({
            boardType,
            items: operation.items
          })
        });
      });
    } catch (error) {
      console.error(`Failed to batch update items in ${boardType} sheet after retries:`, error);
      // Queue for later retry
      this.offlineQueue.add(operation);
      throw error;
    }
  }

  // Sync all data with Google Sheets
  async syncAll() {
    if (!this.useGoogleSheets) {
      // Local mock - just return success
      return { success: true };
    }

    try {
      const state = stateManager.getState();
      
      if (!state) {
        throw new Error('Unable to get current state for sync');
      }

      return await this.retryWithBackoff(async () => {
        return await this.fetch('/sync', {
          method: 'POST',
          body: JSON.stringify(state)
        });
      });
    } catch (error) {
      console.error('Failed to sync with Google Sheets after retries:', error);
      throw error;
    }
  }

  // Toggle item completion in Google Sheets
  async toggleItem(boardType, itemId) {
    if (!this.useGoogleSheets) {
      // Local mock - just return success
      return { success: true };
    }

    // Validate input
    if (!boardType || !itemId) {
      throw new Error('Invalid toggle: boardType and itemId are required');
    }

    const operation = {
      type: 'toggle',
      boardType,
      itemId
    };

    try {
      return await this.retryWithBackoff(async () => {
        return await this.fetch(`/items/${itemId}/toggle`, {
          method: 'POST',
          body: JSON.stringify({
            boardType
          })
        });
      });
    } catch (error) {
      console.error(`Failed to toggle item in ${boardType} sheet after retries:`, error);
      // Queue for later retry
      this.offlineQueue.add(operation);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.fetch('/health');
      
      // If health check passes and we have queued operations, process them
      if (result && this.offlineQueue.getAll().length > 0) {
        console.log('Connection restored, processing offline queue...');
        this.processOfflineQueue();
      }
      
      return result;
    } catch (error) {
      console.warn('API health check failed:', error);
      return { status: 'offline' };
    }
  }

  // Process offline queue
  async processOfflineQueue() {
    try {
      const result = await this.offlineQueue.processQueue(this);
      console.log(`Offline queue processing result:`, result);
      return result;
    } catch (error) {
      console.error('Error processing offline queue:', error);
      throw error;
    }
  }

  // Get offline queue status
  getOfflineQueueStatus() {
    const queue = this.offlineQueue.getAll();
    return {
      queueLength: queue.length,
      operations: queue
    };
  }
}

// Create global API service instance
const apiService = new ApiService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiService, apiService };
}
