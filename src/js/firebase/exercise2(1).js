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

    // Initialize Firebase with unique app name
    const uniqueAppName = 'exercise2-page58-' + Date.now();
    const app = firebase.initializeApp(firebaseConfig, uniqueAppName);
    const database = app.database();
    
    console.log(' Firebase initialized for Exercise 2 Page 58');
    
    // Exercise 2 functionality
    function getSessionId() {
      // Get or create unified user ID
      let sessionId = localStorage.getItem('unified_user_id');
      if (!sessionId) {
        // Check for existing exercise2_session and migrate it
        const oldSession = localStorage.getItem('exercise2_session');
        if (oldSession) {
          sessionId = oldSession;
          localStorage.setItem('unified_user_id', sessionId);
        } else {
          // Create new unified ID
          sessionId = 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('unified_user_id', sessionId);
        }
        // Remove old exercise2_session key
        localStorage.removeItem('exercise2_session');
      }
      return sessionId;
    }
    
    const sessionId = getSessionId();
    const pageNumber = 58;
    
    document.addEventListener('DOMContentLoaded', async function() {
      const triggerWordsInput = document.getElementById('trigger-words');
      const patternsDefensiveInput = document.getElementById('patterns-defensive');
      const nextButton = document.querySelector('a[href="59.html"]');
      
      // Load existing inputs for this page
      try {
        const snapshot = await database.ref(`exercise2/${sessionId}/page${pageNumber}`).once('value');
        const data = snapshot.val();
        if (data) {
          if (data.triggerWords) triggerWordsInput.value = data.triggerWords;
          if (data.patternsDefensive) patternsDefensiveInput.value = data.patternsDefensive;
        }
      } catch (error) {
        console.error('Error loading existing inputs:', error);
      }
      
      // Save inputs when Next button is clicked
      nextButton.addEventListener('click', async function(e) {
        const triggerWords = triggerWordsInput.value.trim();
        const patternsDefensive = patternsDefensiveInput.value.trim();
        
        // Show saving indicator
        nextButton.textContent = 'Saving...';
        nextButton.style.pointerEvents = 'none';
        
        try {
          // Save to Firebase
          const pageData = {
            page: "58",
            triggerWords: triggerWords,
            patternsDefensive: patternsDefensive,
            questions: {
              triggerWords: "In the flagstone scene, what specific words or actions from Mrs. Amelia stirred the strongest emotion in me? What was that feeling like?",
              patternsDefensive: "Does my reaction connect to a past belief or story about caregiving (e.g. being unappreciated)?"
            },
            timestamp: Date.now(),
            completed: true
          };
          
          await database.ref(`exercise2/${sessionId}/page${pageNumber}`).set(pageData);
          await database.ref(`exercise2/${sessionId}/lastUpdated`).set(Date.now());
          
          console.log('Exercise 2 Page 58 inputs saved');
          // Allow navigation to continue
          return true;
        } catch (error) {
          console.error('Error saving inputs:', error);
          alert('Failed to save your inputs. Please try again.');
          e.preventDefault();
          nextButton.textContent = 'Next';
          nextButton.style.pointerEvents = 'auto';
          return false;
        }
      });
      
      // Auto-save functionality
      function setupAutoSave(inputElement, fieldName) {
        inputElement.addEventListener('input', function() {
          clearTimeout(window.autoSaveTimer);
          window.autoSaveTimer = setTimeout(async () => {
            try {
              const currentData = {
                page: "58",
                [fieldName]: inputElement.value.trim(),
                questions: {
                  triggerWords: "In the flagstone scene, what specific words or actions from Mrs. Amelia stirred the strongest emotion in me? What was that feeling like?",
                  patternsDefensive: "Does my reaction connect to a past belief or story about caregiving (e.g. being unappreciated)?"
                },
                timestamp: Date.now(),
                completed: false
              };
              
              // Merge with existing data
              const snapshot = await database.ref(`exercise2/${sessionId}/page${pageNumber}`).once('value');
              const existingData = snapshot.val() || {};
              const mergedData = { ...existingData, ...currentData };
              
              await database.ref(`exercise2/${sessionId}/page${pageNumber}`).set(mergedData);
              console.log(`Auto-saved ${fieldName} for Page 58`);
            } catch (error) {
              console.error('Auto-save error:', error);
            }
          }, 2000);
        });
      }
      
      setupAutoSave(triggerWordsInput, 'triggerWords');
      setupAutoSave(patternsDefensiveInput, 'patternsDefensive');
    });