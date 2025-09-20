
// Suppress Firebase warnings
console.warn = (function(originalWarn) {
  return function(...args) {
    const message = args.join(' ');
    if (message.includes('FIREBASE WARNING: Database lives in a different region')) {
      return;
    }
    originalWarn.apply(console, args);
  };
})(console.warn);

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDo02EbpwpLA9If1bTNAbbGZm6dAU7EKK8",
  authDomain: "database-c8ff8.firebaseapp.com",
  projectId: "database-c8ff8",
  storageBucket: "database-c8ff8.firebasestorage.app",
  messagingSenderId: "422975069935",
  appId: "1:422975069935:web:2622077cfb949d1dfc451a",
  measurementId: "G-58S4WVJ7MQ",
  databaseURL: "https://database-c8ff8-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase with unique app name to avoid conflicts
const uniqueAppName = 'exercise1-page1-' + Date.now();
const app = firebase.initializeApp(firebaseConfig, uniqueAppName);
const database = app.database();

console.log('Firebase initialized for Page 1 with correct regional URL:', firebaseConfig.databaseURL);

// Exercise 1 functionality
function getSessionId() {
  // Get or create unified user ID
  let sessionId = localStorage.getItem('unified_user_id');
  if (!sessionId) {
    // Check for existing exercise1_session and migrate it
    const oldSession = localStorage.getItem('exercise1_session');
    if (oldSession) {
      sessionId = oldSession;
      localStorage.setItem('unified_user_id', sessionId);
    } else {
      // Create new unified ID
      sessionId = 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('unified_user_id', sessionId);
    }
    // Remove old exercise1_session key
    localStorage.removeItem('exercise1_session');
  }
  return sessionId;
}

const sessionId = getSessionId();
const pageNumber = 1;

document.addEventListener('DOMContentLoaded', async function() {
  const textarea = document.querySelector('textarea');
  const nextButton = document.querySelector('a[href="27(1).html"]');

  // Load any existing input for this page
  try {
    const snapshot = await database.ref(`exercise1/${sessionId}/page${pageNumber}`).once('value');
    const data = snapshot.val();
    if (data && data.input) {
      textarea.value = data.input;
    }
  } catch (error) {
    console.error('Error loading existing input:', error);
  }

  // Save input when Next button is clicked
  nextButton.addEventListener('click', async function(e) {
    const userInput = textarea.value.trim();

    if (userInput) {
      // Show saving indicator
      nextButton.textContent = 'Saving...';
      nextButton.style.pointerEvents = 'none';

      try {
        // Save to Firebase
        const pageData = {
          page: "26(1)",
          question: "Why do you think I am Angry?",
          input: userInput,
          timestamp: Date.now(),
          completed: true
        };

        await database.ref(`exercise1/${sessionId}/page${pageNumber}`).set(pageData);
        await database.ref(`exercise1/${sessionId}/lastUpdated`).set(Date.now());

        console.log('Exercise 1 Page 1 input saved');
        // Allow navigation to continue
        return true;
      } catch (error) {
        console.error('Error saving input:', error);
        alert('Failed to save your input. Please try again.');
        e.preventDefault();
        nextButton.textContent = 'Next';
        nextButton.style.pointerEvents = 'auto';
        return false;
      }
    } else {
      // Warn user about empty input
      const confirmEmpty = confirm('You haven\'t entered any text. Continue anyway?');
      if (!confirmEmpty) {
        e.preventDefault();
        return false;
      } else {
        // Save empty input
        try {
          await database.ref(`exercise1/${sessionId}/page${pageNumber}`).set({
            page: "26(1)",
            question: "Why do you think I am Angry?",
            input: '',
            timestamp: Date.now(),
            completed: true
          });
        } catch (error) {
          console.error('Error saving empty input:', error);
        }
      }
    }
  });

  // Auto-save on input change 
  textarea.addEventListener('input', function() {
    // Debounce auto-save
    clearTimeout(window.autoSaveTimer);
    window.autoSaveTimer = setTimeout(async () => {
      const userInput = textarea.value.trim();
      if (userInput) {
        try {
          await database.ref(`exercise1/${sessionId}/page${pageNumber}`).set({
            page: "26(1)",
            question: "Why do you think I am Angry?",
            input: userInput,
            timestamp: Date.now(),
            completed: false
          });
          console.log('Auto-saved input for Page 1');
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }
    }, 2000); 
  });
});
