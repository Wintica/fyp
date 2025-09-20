// Initialize unified user ID when user visits character selection
  function initializeUserId() {
    let unifiedUserId = localStorage.getItem('unified_user_id');
    
    if (!unifiedUserId) {
      // Check for existing exercise sessions and migrate them
      const exercise1Session = localStorage.getItem('exercise1_session');
      const exercise2Session = localStorage.getItem('exercise2_session');
      
      if (exercise1Session) {
        // Use Exercise 1 session as the unified ID
        unifiedUserId = exercise1Session;
        localStorage.setItem('unified_user_id', unifiedUserId);
      } else if (exercise2Session) {
        // Use Exercise 2 session as the unified ID
        unifiedUserId = exercise2Session;
        localStorage.setItem('unified_user_id', unifiedUserId);
      } else {
        // Create new unified ID
        unifiedUserId = 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('unified_user_id', unifiedUserId);
      }
      
      console.log(' Unified User ID initialized:', unifiedUserId);
    } else {
      console.log(' Existing Unified User ID found:', unifiedUserId);
    }
    
    return unifiedUserId;
  }
  
  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', function() {
    initializeUserId();
    
    // Add click event to the start button to ensure ID is set
    const startButton = document.querySelector('a[href="story1.html"]');
    if (startButton) {
      startButton.addEventListener('click', function() {
        const userId = initializeUserId();
        console.log(' Starting journey with User ID:', userId);
      });
    }
  });