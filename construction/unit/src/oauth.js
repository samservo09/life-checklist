// OAuth 2.0 Authentication Module for Google Sheets API
// Handles token management, authentication flow, and session management

class OAuth2Manager {
  constructor() {
    this.clientId = null;
    this.scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly'
    ];
    this.tokenKey = 'oauth2_token';
    this.expiryKey = 'oauth2_expiry';
    this.isInitialized = false;
    this.authInstance = null;
  }

  /**
   * Initialize OAuth 2.0 with Google API client
   * @param {string} clientId - OAuth 2.0 Client ID from Google Cloud Console
   * @returns {Promise<boolean>} - True if initialization successful
   */
  async initialize(clientId) {
    if (!clientId || clientId === 'LOCAL_DEV_MODE') {
      console.log('OAuth 2.0 initialization skipped - using local dev mode');
      this.isInitialized = false;
      return false;
    }

    try {
      // Wait for Google API client library to load
      await this.waitForGapi();

      this.clientId = clientId;

      // Initialize gapi.auth2
      this.authInstance = await gapi.auth2.init({
        client_id: clientId,
        scope: this.scopes.join(' ')
      });

      console.log('OAuth 2.0 initialized successfully');
      this.isInitialized = true;

      // Check if user is already signed in
      if (this.authInstance.isSignedIn.get()) {
        console.log('User already signed in');
        this.storeToken(this.authInstance.currentUser.get().getAuthResponse());
      }

      // Listen for sign-in state changes
      this.authInstance.isSignedIn.listen(isSignedIn => {
        if (isSignedIn) {
          console.log('User signed in');
          const authResponse = this.authInstance.currentUser.get().getAuthResponse();
          this.storeToken(authResponse);
          // Emit event for app to handle
          window.dispatchEvent(new CustomEvent('oauth-signin', { detail: { isSignedIn: true } }));
        } else {
          console.log('User signed out');
          this.clearToken();
          window.dispatchEvent(new CustomEvent('oauth-signout', { detail: { isSignedIn: false } }));
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize OAuth 2.0:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Wait for Google API client library to load
   * @returns {Promise<void>}
   */
  async waitForGapi() {
    return new Promise((resolve, reject) => {
      if (window.gapi && window.gapi.auth2) {
        resolve();
        return;
      }

      const checkGapi = setInterval(() => {
        if (window.gapi && window.gapi.auth2) {
          clearInterval(checkGapi);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkGapi);
        reject(new Error('Google API client library failed to load'));
      }, 10000);
    });
  }

  /**
   * Sign in user with Google
   * @returns {Promise<boolean>} - True if sign-in successful
   */
  async signIn() {
    if (!this.isInitialized || !this.authInstance) {
      console.error('OAuth 2.0 not initialized');
      return false;
    }

    try {
      const user = await this.authInstance.signIn();
      const authResponse = user.getAuthResponse();
      this.storeToken(authResponse);
      console.log('User signed in successfully');
      return true;
    } catch (error) {
      console.error('Sign-in failed:', error);
      return false;
    }
  }

  /**
   * Sign out user
   * @returns {Promise<void>}
   */
  async signOut() {
    if (!this.isInitialized || !this.authInstance) {
      console.error('OAuth 2.0 not initialized');
      return;
    }

    try {
      await this.authInstance.signOut();
      this.clearToken();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  }

  /**
   * Get current access token
   * @returns {string|null} - Access token or null if not available
   */
  getAccessToken() {
    const token = this.getStoredToken();
    
    if (!token) {
      return null;
    }

    // Check if token is expired
    if (this.isTokenExpired()) {
      console.log('Token expired, attempting refresh...');
      this.refreshToken();
      return this.getStoredToken()?.access_token || null;
    }

    return token.access_token;
  }

  /**
   * Get stored token from sessionStorage
   * @returns {Object|null} - Token object or null
   */
  getStoredToken() {
    try {
      const token = sessionStorage.getItem(this.tokenKey);
      return token ? JSON.parse(token) : null;
    } catch (error) {
      console.error('Failed to retrieve stored token:', error);
      return null;
    }
  }

  /**
   * Store token in sessionStorage
   * @param {Object} authResponse - Authentication response from Google
   */
  storeToken(authResponse) {
    try {
      const token = {
        access_token: authResponse.access_token,
        id_token: authResponse.id_token,
        scope: authResponse.scope,
        expires_in: authResponse.expires_in,
        token_type: authResponse.token_type
      };

      sessionStorage.setItem(this.tokenKey, JSON.stringify(token));

      // Store expiry time
      const expiryTime = Date.now() + (authResponse.expires_in * 1000);
      sessionStorage.setItem(this.expiryKey, expiryTime.toString());

      console.log('Token stored successfully');
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  /**
   * Clear stored token
   */
  clearToken() {
    try {
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.expiryKey);
      console.log('Token cleared');
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  /**
   * Check if token is expired
   * @returns {boolean} - True if token is expired
   */
  isTokenExpired() {
    try {
      const expiryTime = sessionStorage.getItem(this.expiryKey);
      if (!expiryTime) {
        return true;
      }

      const now = Date.now();
      const expiry = parseInt(expiryTime, 10);
      
      // Consider token expired if less than 5 minutes remaining
      return now > (expiry - 5 * 60 * 1000);
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return true;
    }
  }

  /**
   * Refresh access token
   * @returns {Promise<boolean>} - True if refresh successful
   */
  async refreshToken() {
    if (!this.isInitialized || !this.authInstance) {
      console.error('OAuth 2.0 not initialized');
      return false;
    }

    try {
      const user = this.authInstance.currentUser.get();
      if (!user.isSignedIn()) {
        console.warn('User not signed in, cannot refresh token');
        return false;
      }

      const authResponse = await user.reloadAuthorizationResult();
      if (authResponse.error) {
        console.error('Token refresh failed:', authResponse.error);
        return false;
      }

      this.storeToken(authResponse);
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  /**
   * Check if user is signed in
   * @returns {boolean} - True if user is signed in
   */
  isSignedIn() {
    if (!this.isInitialized || !this.authInstance) {
      return false;
    }

    return this.authInstance.isSignedIn.get();
  }

  /**
   * Get user profile information
   * @returns {Object|null} - User profile or null
   */
  getUserProfile() {
    if (!this.isSignedIn()) {
      return null;
    }

    try {
      const user = this.authInstance.currentUser.get();
      const profile = user.getBasicProfile();
      
      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Get authentication status
   * @returns {Object} - Status object with authentication details
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isSignedIn: this.isSignedIn(),
      hasValidToken: this.getAccessToken() !== null,
      isTokenExpired: this.isTokenExpired(),
      userProfile: this.getUserProfile()
    };
  }
}

// Create global OAuth 2.0 manager instance
const oauth2Manager = new OAuth2Manager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OAuth2Manager, oauth2Manager };
}
