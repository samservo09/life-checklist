// API Service for Life OS
// Handles communication with Google Sheets API and local mock server

class ApiService {
  constructor() {
    this.baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'http://localhost:8000/api';
    this.useGoogleSheets = (typeof isUsingGoogleSheets === 'function') ? isUsingGoogleSheets() : false;
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
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
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

  // Sync all data with Google Sheets
  async syncAll() {
    if (!this.useGoogleSheets) {
      // Local mock - just return success
      return { success: true };
    }

    try {
      const state = stateManager.getState();
      return await this.fetch('/sync', {
        method: 'POST',
        body: JSON.stringify(state)
      });
    } catch (error) {
      console.error('Failed to sync with Google Sheets:', error);
      throw error;
    }
  }

  // Toggle item completion in Google Sheets
  async toggleItem(boardType, itemId) {
    if (!this.useGoogleSheets) {
      // Local mock - just return success
      return { success: true };
    }

    try {
      return await this.fetch(`/items/${itemId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({
          boardType
        })
      });
    } catch (error) {
      console.error('Failed to toggle item in Google Sheets:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      return await this.fetch('/health');
    } catch (error) {
      console.warn('API health check failed:', error);
      return { status: 'offline' };
    }
  }
}

// Create global API service instance
const apiService = new ApiService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiService, apiService };
}
