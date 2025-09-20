/**
 * Unified Session Management
  */

// Global unified session manager
window.UnifiedSession = {
  
  /**
   * Get or create unified user ID
   * @returns {string} The unified user ID
   */
  getUserId: function() {
    let unifiedUserId = localStorage.getItem('unified_user_id');
    
    if (!unifiedUserId) {
      // Create new unified ID
      unifiedUserId = 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('unified_user_id', unifiedUserId);
      console.log(' Created new unified User ID:', unifiedUserId);
    }
    
    return unifiedUserId;
  },
  
  /**
   * Get user display name for UI
   * @returns {string} Clean user display name
   */
  getDisplayName: function() {
    const userId = this.getUserId();
    
    if (!userId) return 'Guest User';
    
    // Extract just the numeric part if session ID starts with "USER_"
    let cleanUserId = userId;
    if (userId.startsWith('USER_')) {
      cleanUserId = userId.substring(5); 
    } else if (userId.startsWith('session_')) {
      cleanUserId = userId.substring(8);
    }
    
    // Use only the last 8 characters for a cleaner display
    const shortId = cleanUserId.slice(-8);
    return `User ${shortId}`;
  },
  
  /**
   * Initialize unified session (call this on page load)
   */
  initialize: function() {
    const userId = this.getUserId();
    console.log('Unified Session initialized for:', this.getDisplayName());
    return userId;
  },
  
  /**
   * Create a completely fresh session
   * This clears all existing data and creates a new session
   * @returns {string} New session ID
   */
  createFreshSession: function() {
    console.log(' Creating fresh session - clearing all data...');
    
    // Clear ALL session-related data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('session') || 
        key.includes('emotion_') || 
        key.includes('randomUserId') ||
        key.includes('unified_user_id') ||
        key.includes('exercise')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('Removed:', key);
    });
    
    // Create completely new session ID
    const newId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('unified_user_id', newId);
    
    console.log('Fresh session created:', newId);
    console.log(' Display name:', this.getDisplayName());
    
    return newId;
  }
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', function() {
  window.UnifiedSession.initialize();
});

console.log(' Simplified Unified Session Manager loaded');