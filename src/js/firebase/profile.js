
// Personal session management
let currentUserSession = null;
let personalData = {
  exercise1: null,
  exercise2: null,
  stats: null
};

// Wait for Firebase to load completely
document.addEventListener('DOMContentLoaded', function() {
  initializeFirebaseAndLoadProfile();
});

function initializeFirebaseAndLoadProfile() {
  try {
    // Suppress Firebase regional URL warnings
    const originalWarn = console.warn;
    console.warn = function(message) {
      if (typeof message === 'string' && message.includes('database URL')) {
        return;
      }
      originalWarn.apply(console, arguments);
    };

    // Firebase configuration
    const firebaseConfig = {
      apiKey: "dummy-key-for-database-only",
      databaseURL: "https://database-c8ff8-default-rtdb.asia-southeast1.firebasedatabase.app"
    };

    // Initialize Firebase
    window.app = firebase.initializeApp(firebaseConfig, 'personal-profile');
    window.database = firebase.database(window.app);
    
    // Load personal data after Firebase is initialized
    loadMyData();
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    showErrorMessage();
  }
}

// Get or create unified user session ID
function getCurrentUserSession() {
  // Use the unified session manager
  const sessionId = window.UnifiedSession.getUserId();
  console.log(' Current session ID retrieved:', sessionId);
  return sessionId;
}

// Generate personalized User ID
function generatePersonalUserId() {
  // Use the unified session manager for display name
  const displayName = window.UnifiedSession.getDisplayName();
  console.log('Display name generated:', displayName);
  return displayName;
}

// Display personalized welcome message
function displayPersonalWelcome() {
  const sessionId = getCurrentUserSession();
  const userIdElement = document.getElementById('user-id-display');
  const welcomeElement = document.getElementById('welcome-message');
  
  if (sessionId) {
    const userId = generatePersonalUserId();
    currentUserSession = sessionId;
    userIdElement.textContent = `ID: ${userId}`;
    welcomeElement.textContent = `Welcome Back, ${userId}!`;
  } else {
    userIdElement.textContent = 'No Session Found';
    welcomeElement.textContent = 'Please Start Your Journey';
    showNoSessionMessage();
  }
}

// Show message when no session is found
function showNoSessionMessage() {
  document.getElementById('my-exercise1-data').innerHTML = 
    `<div class="text-center py-12">
      <p class="text-gray-500 text-lg">No data available</p>
    </div>`;
  
  document.getElementById('my-exercise2-data').innerHTML = 
    `<div class="text-center py-12">
      <p class="text-gray-500 text-lg">No data available</p>
    </div>`;
}

// Migration function to move data to unified structure
async function migrateToUnifiedStructure() {
  if (!currentUserSession) return;
  
  try {
    // Check if data already exists in unified structure
    const unifiedSnapshot = await window.database.ref(`users/${currentUserSession}`).once('value');
    if (unifiedSnapshot.exists()) {
      console.log('Data already in unified structure');
      return;
    }
    
    const exercise1Session = localStorage.getItem('exercise1_session');
    const exercise2Session = localStorage.getItem('exercise2_session');
    
    const migrationData = {
      profile: {
        userId: currentUserSession,
        createdAt: Date.now(),
        migratedAt: Date.now(),
        originalSessions: {
          exercise1: exercise1Session,
          exercise2: exercise2Session
        }
      }
    };
    
    // Get exercise data from legacy structure
    if (exercise1Session) {
      const ex1Snapshot = await window.database.ref(`exercise1/${exercise1Session}`).once('value');
      if (ex1Snapshot.exists()) {
        migrationData.exercise1 = ex1Snapshot.val();
      }
    }
    
    if (exercise2Session) {
      const ex2Snapshot = await window.database.ref(`exercise2/${exercise2Session}`).once('value');
      if (ex2Snapshot.exists()) {
        migrationData.exercise2 = ex2Snapshot.val();
      }
    }
    
    // Save to unified structure if we have any data to migrate
    if (migrationData.exercise1 || migrationData.exercise2) {
      await window.database.ref(`users/${currentUserSession}`).set(migrationData);
      console.log('Data migrated to unified structure');
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Load personal data from Firebase
async function loadPersonalData() {
  console.log(' Loading personal data...');
  console.log('Current session ID:', currentUserSession);
  
  if (!currentUserSession) {
    console.log(' No session found for personal data loading');
    return;
  }

  // First, attempt migration
  await migrateToUnifiedStructure();

  try {
    console.log('Fetching data from Firebase...');
    // Try to load from unified structure first
    const [unifiedSnapshot, exercise1Snapshot, exercise2Snapshot] = await Promise.all([
      window.database.ref(`users/${currentUserSession}`).once('value'),
      window.database.ref(`exercise1/${currentUserSession}`).once('value'),
      window.database.ref(`exercise2/${currentUserSession}`).once('value')
    ]);

    const unifiedData = unifiedSnapshot.val();
    console.log('Unified data:', unifiedData);
    console.log('Exercise1 data:', exercise1Snapshot.val());
    console.log('Exercise2 data:', exercise2Snapshot.val());
    
    if (unifiedData) {
      // Use new unified structure
      console.log('Using unified structure');
      personalData.exercise1 = unifiedData.exercise1;
      personalData.exercise2 = unifiedData.exercise2;
      personalData.userInfo = unifiedData.profile || {};
    } else {
      // Fall back to legacy structure
      console.log(' Using legacy structure');
      personalData.exercise1 = exercise1Snapshot.val();
      personalData.exercise2 = exercise2Snapshot.val();
      personalData.userInfo = {};
    }
    
    // Also check for exercise1_session and exercise2_session data if unified is empty
    if (!personalData.exercise1 || !personalData.exercise2) {
      const exercise1Session = localStorage.getItem('exercise1_session');
      const exercise2Session = localStorage.getItem('exercise2_session');
      
      if (exercise1Session && !personalData.exercise1) {
        const ex1Snapshot = await window.database.ref(`exercise1/${exercise1Session}`).once('value');
        personalData.exercise1 = ex1Snapshot.val();
      }
      
      if (exercise2Session && !personalData.exercise2) {
        const ex2Snapshot = await window.database.ref(`exercise2/${exercise2Session}`).once('value');
        personalData.exercise2 = ex2Snapshot.val();
      }
    }
    
    // Calculate personal statistics
    personalData.stats = calculatePersonalStats(personalData.exercise1, personalData.exercise2);
    
    // Update displays
    updatePersonalStatistics();
    displayPersonalExercise1();
    displayPersonalExercise2();
    generatePersonalInsights();
    
  } catch (error) {
    console.error('Error loading personal data:', error);
    showErrorMessage();
  }
}

// Calculate personal statistics
function calculatePersonalStats(exercise1Data, exercise2Data) {
  const stats = {
    exercise1: {
      completed: 0,
      total: 4,
      responses: 0,
      lastActivity: null
    },
    exercise2: {
      inputsCompleted: 0,
      totalInputs: 14,
      pagesCompleted: 0,
      totalPages: 5,
      lastActivity: null
    },
    overall: {
      totalResponses: 0,
      activeDays: 0,
      journeyScore: 0
    }
  };

  const activityDates = new Set();

  // Process Exercise 1
  if (exercise1Data) {
    const pages = ['page1', 'page2', 'page3', 'page4'];
    pages.forEach(pageKey => {
      if (exercise1Data[pageKey]) {
        const pageData = exercise1Data[pageKey];
        if (pageData.completed) stats.exercise1.completed++;
        if (pageData.input && pageData.input.trim()) stats.exercise1.responses++;
        
        if (pageData.timestamp) {
          const date = new Date(pageData.timestamp);
          if (!stats.exercise1.lastActivity || date > stats.exercise1.lastActivity) {
            stats.exercise1.lastActivity = date;
          }
          activityDates.add(date.toDateString());
        }
      }
    });
  }

  // Process Exercise 2
  if (exercise2Data) {
    const pages = ['page58', 'page59', 'page60', 'page61', 'page62'];
    pages.forEach(pageKey => {
      if (exercise2Data[pageKey]) {
        const pageData = exercise2Data[pageKey];
        if (pageData.completed) stats.exercise2.pagesCompleted++;
        
        const fields = ['triggerWords', 'patternsDefensive', 'ameliasView', 'connectionInsight', 
                      'empatheticPhrase', 'supportSelfcare', 'warningSigns', 'technique', 'meaning',
                      'situation', 'response', 'impact', 'alternative', 'support'];
        
        fields.forEach(field => {
          if (pageData[field] && pageData[field].trim()) {
            stats.exercise2.inputsCompleted++;
          }
        });
        
        if (pageData.timestamp) {
          const date = new Date(pageData.timestamp);
          if (!stats.exercise2.lastActivity || date > stats.exercise2.lastActivity) {
            stats.exercise2.lastActivity = date;
          }
          activityDates.add(date.toDateString());
        }
      }
    });
  }

  // Calculate overall stats
  stats.overall.totalResponses = stats.exercise1.responses + stats.exercise2.inputsCompleted;
  stats.overall.activeDays = activityDates.size;
  
  // Calculate journey score (0-100)
  const exercise1Score = (stats.exercise1.completed / stats.exercise1.total) * 50;
  const exercise2Score = (stats.exercise2.inputsCompleted / stats.exercise2.totalInputs) * 50;
  stats.overall.journeyScore = Math.round(exercise1Score + exercise2Score);

  return stats;
}

// Update personal statistics display
function updatePersonalStatistics() {
  if (!personalData.stats) return;
  
  // Show statistics section
  document.getElementById('personal-stats-section').style.display = 'block';
  
  const stats = personalData.stats;

  // Exercise 1 stats
  const ex1Progress = (stats.exercise1.completed / stats.exercise1.total) * 100;
  document.getElementById('my-ex1-completed').textContent = `${stats.exercise1.completed}/${stats.exercise1.total}`;
  document.getElementById('my-ex1-responses').textContent = stats.exercise1.responses;
  document.getElementById('my-ex1-last-activity').textContent = 
    stats.exercise1.lastActivity ? formatTimestamp(stats.exercise1.lastActivity) : 'Not started yet';
  
  const ex1ProgressBar = document.getElementById('my-ex1-progress');
  ex1ProgressBar.style.width = `${ex1Progress}%`;
  ex1ProgressBar.textContent = `${Math.round(ex1Progress)}%`;

  // Exercise 2 stats  
  const ex2Progress = (stats.exercise2.inputsCompleted / stats.exercise2.totalInputs) * 100;
  document.getElementById('my-ex2-inputs').textContent = `${stats.exercise2.inputsCompleted}/${stats.exercise2.totalInputs}`;
  document.getElementById('my-ex2-completed').textContent = `${stats.exercise2.pagesCompleted}/${stats.exercise2.totalPages}`;
  document.getElementById('my-ex2-last-activity').textContent = 
    stats.exercise2.lastActivity ? formatTimestamp(stats.exercise2.lastActivity) : 'Not started yet';
  
  const ex2ProgressBar = document.getElementById('my-ex2-progress');
  ex2ProgressBar.style.width = `${ex2Progress}%`;
  ex2ProgressBar.textContent = `${Math.round(ex2Progress)}%`;

  // Overall stats
  document.getElementById('my-total-responses').textContent = stats.overall.totalResponses;
  document.getElementById('my-completion-rate').textContent = `${Math.round(((stats.exercise1.completed + stats.exercise2.inputsCompleted) / (stats.exercise1.total + stats.exercise2.totalInputs)) * 100)}%`;
  document.getElementById('my-active-days').textContent = stats.overall.activeDays;
  document.getElementById('my-journey-score').textContent = stats.overall.journeyScore;

  // Show achievement banner based on progress
  showAchievementBanner(stats);
}

// Show achievement banner
function showAchievementBanner(stats) {
  const banner = document.getElementById('achievement-banner');
  const text = document.getElementById('achievement-text');
  const description = document.getElementById('achievement-description');
  
  if (stats.overall.journeyScore >= 80) {
    banner.style.display = 'block';
    text.textContent = 'Empathy Master!';
    description.textContent = 'You\'ve shown exceptional commitment to developing your empathy skills!';
  } else if (stats.overall.journeyScore >= 50) {
    banner.style.display = 'block';
    text.textContent = 'Great Progress!';
    description.textContent = 'You\'re making excellent progress in your empathy journey!';
  } else if (stats.overall.totalResponses > 0) {
    banner.style.display = 'block';
    text.textContent = 'Journey Started!';
    description.textContent = 'Welcome to your empathy development journey!';
  }
}

// Display personal Exercise 1 data
function displayPersonalExercise1() {
  if (!personalData.exercise1) {
    document.getElementById('my-exercise1-data').innerHTML = 
      `<div class="text-center py-12">
        <p class="text-gray-500 text-lg">No data available</p>
      </div>`;
    return;
  }

  let html = `<div class="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-6 mb-6">
                <h3 class="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <span class="text-2xl">Progress</span>
                  Your Emotion Recognition Progress
                </h3>`;
  
  if (personalData.exercise1.lastUpdated) {
    html += `<div class="text-sm text-blue-700 mb-4 flex items-center gap-2">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>
               Last updated: ${formatTimestamp(personalData.exercise1.lastUpdated)}
             </div>`;
  }
  html += '</div>';
  
  const pages = ['page1', 'page2', 'page3', 'page4'];
  pages.forEach(pageKey => {
    if (personalData.exercise1[pageKey]) {
      const pageData = personalData.exercise1[pageKey];
      const hasResponse = pageData.input && pageData.input.trim();
      const question = pageData.question || 'Question not available';
      
      html += `
        <div class="bg-white rounded-xl shadow-lg p-6 mb-4 border-l-4 ${hasResponse ? 'border-blue-400' : 'border-gray-300'} hover:shadow-xl transition-shadow duration-200">
          <div class="flex items-start gap-3 mb-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full ${hasResponse ? 'bg-blue-100' : 'bg-gray-100'} flex items-center justify-center">
              ${hasResponse ? 
                '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' :
                '<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
              }
            </div>
            <div class="flex-1">
              <h5 class="font-semibold text-gray-800 mb-2 text-lg leading-relaxed">${question}</h5>
            </div>
          </div>
          <div class="ml-11">
            <div class="bg-gradient-to-r ${hasResponse ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-gray-50 to-gray-100 border-gray-200'} border rounded-lg p-4">
              <p class="text-gray-700 ${hasResponse ? '' : 'italic text-gray-500'} leading-relaxed">
                ${hasResponse ? pageData.input : 'Complete this question to see your response here'}
              </p>
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-3 flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            ${hasResponse ? `Completed: ${formatTimestamp(pageData.timestamp)}` : 'Not completed yet'}
          </div>
        </div>
      `;
    }
  });
  
  document.getElementById('my-exercise1-data').innerHTML = html;
}

// Display personal Exercise 2 data 
function displayPersonalExercise2() {
  if (!personalData.exercise2) {
    document.getElementById('my-exercise2-data').innerHTML = 
      `<div class="text-center py-12">
        <p class="text-gray-500 text-lg">No data available</p>
      </div>`;
    return;
  }

  let html = `<div class="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-6 mb-6">
                <h3 class="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <span class="text-2xl">Progress</span>
                  Your Empathy Development Progress
                </h3>`;
  
  if (personalData.exercise2.lastUpdated) {
    html += `<div class="text-sm text-purple-700 mb-4 flex items-center gap-2">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>
               Last updated: ${formatTimestamp(personalData.exercise2.lastUpdated)}
             </div>`;
  }
  html += '</div>';
  
  const pages = ['page58', 'page59', 'page60', 'page61', 'page62'];
  pages.forEach(pageKey => {
    if (personalData.exercise2[pageKey]) {
      const pageData = personalData.exercise2[pageKey];
      const pageNumber = pageKey.replace('page', '');
      
      html += `
        <div class="mb-6">
          <h4 class="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-lg">
            <span class="text-2xl">Page</span>
            ${getPageTitle(pageNumber)}
          </h4>
      `;
      
      // Handle different field structures for different pages
      if (pageData.questions) {
        Object.keys(pageData.questions).forEach(fieldKey => {
          const question = pageData.questions[fieldKey];
          const response = pageData[fieldKey];
          const hasResponse = response && response.trim();
          
          html += createResponseCard(question, response, hasResponse, 'purple');
        });
      } else {
        Object.keys(pageData).forEach(key => {
          if (key !== 'page' && key !== 'timestamp' && key !== 'completed' && key !== 'questions') {
            const descriptiveTitle = getDescriptiveFieldTitle(key);
            const response = pageData[key];
            const hasResponse = response && response.trim();
            
            html += createResponseCard(descriptiveTitle, response, hasResponse, 'purple');
          }
        });
      }
      
      html += `
          <div class="text-xs text-gray-500 mt-3 flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Last updated: ${formatTimestamp(pageData.timestamp)}
          </div>
        </div>
      `;
    }
  });
  
  document.getElementById('my-exercise2-data').innerHTML = html;
}

// Create response card helper function
function createResponseCard(question, response, hasResponse, colorScheme) {
  const colors = {
    blue: {
      border: 'border-blue-400',
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100 border-blue-200'
    },
    purple: {
      border: 'border-purple-400', 
      bg: 'bg-purple-100',
      icon: 'text-purple-600',
      gradient: 'from-purple-50 to-purple-100 border-purple-200'
    },
    green: {
      border: 'border-green-400',
      bg: 'bg-green-100', 
      icon: 'text-green-600',
      gradient: 'from-green-50 to-green-100 border-green-200'
    }
  };
  
  const color = colors[colorScheme] || colors.green;
  
  return `
    <div class="bg-white rounded-xl shadow-lg p-6 mb-4 border-l-4 ${hasResponse ? color.border : 'border-gray-300'} hover:shadow-xl transition-shadow duration-200">
      <div class="flex items-start gap-3 mb-3">
        <div class="flex-shrink-0 w-8 h-8 rounded-full ${hasResponse ? color.bg : 'bg-gray-100'} flex items-center justify-center">
          ${hasResponse ? 
            `<svg class="w-5 h-5 ${color.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` :
            '<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
          }
        </div>
        <div class="flex-1">
          <h5 class="font-semibold text-gray-800 mb-2 text-lg leading-relaxed">${question}</h5>
        </div>
      </div>
      <div class="ml-11">
        <div class="bg-gradient-to-r ${hasResponse ? color.gradient : 'from-gray-50 to-gray-100 border-gray-200'} border rounded-lg p-4">
          <p class="text-gray-700 ${hasResponse ? '' : 'italic text-gray-500'} leading-relaxed">
            ${hasResponse ? response : 'Complete this section to see your response here'}
          </p>
        </div>
      </div>
    </div>
  `;
}

// Generate personal insights based on responses
function generatePersonalInsights() {
  if (!personalData.stats || personalData.stats.overall.totalResponses === 0) {
    return;
  }

  document.getElementById('insights-section').style.display = 'block';
  
  let insights = [];
  
  // Completion-based insights
  if (personalData.stats.overall.journeyScore >= 80) {
    insights.push({
      title: "Exceptional Commitment",
      description: "You've demonstrated outstanding dedication to developing your empathy skills. Your comprehensive responses show deep self-reflection and growth.",
      type: "achievement"
    });
  }
  
  if (personalData.stats.exercise1.completed === personalData.stats.exercise1.total) {
    insights.push({
      title: "Emotion Recognition Mastered",
      description: "You've completed all emotion recognition exercises. This foundation will serve you well in understanding both your own and others' emotional states.",
      type: "milestone"
    });
  }
  
  if (personalData.stats.exercise2.inputsCompleted > 10) {
    insights.push({
      title: "Empathy Development Excellence", 
      description: "Your detailed responses in Exercise 2 show strong commitment to developing your empathy skills. You're building a solid foundation for understanding others.",
      type: "progress"
    });
  }
  
  if (personalData.stats.overall.activeDays > 1) {
    insights.push({
      title: "Consistent Engagement",
      description: `You've been active for ${personalData.stats.overall.activeDays} days, showing consistent commitment to your empathy development journey.`,
      type: "habit"
    });
  }
  
  // Add some general insights if specific ones don't apply
  if (insights.length === 0 && personalData.stats.overall.totalResponses > 0) {
    insights.push({
      title: "Journey Begun",
      description: "You've taken the important first step in your empathy development journey. Every response brings you closer to better understanding yourself and others.",
      type: "encouragement"
    });
  }
  
  let insightsHtml = '';
  insights.forEach(insight => {
    const colorClass = {
      achievement: 'border-yellow-400 bg-yellow-50',
      milestone: 'border-blue-400 bg-blue-50',
      progress: 'border-purple-400 bg-purple-50',
      habit: 'border-green-400 bg-green-50',
      encouragement: 'border-indigo-400 bg-indigo-50'
    }[insight.type] || 'border-gray-400 bg-gray-50';
    
    insightsHtml += `
      <div class="border-l-4 ${colorClass} rounded-lg p-6 animate-slide-in">
        <h4 class="text-lg font-bold text-gray-800 mb-2">${insight.title}</h4>
        <p class="text-gray-700 leading-relaxed">${insight.description}</p>
      </div>
    `;
  });
  
  document.getElementById('personal-insights').innerHTML = insightsHtml;
}

// Utility functions 
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown time';
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function getDescriptiveFieldTitle(fieldName) {
  const fieldTitles = {
    'triggerWords': 'Trigger Words & Emotional Response',
    'effectsThoughts': 'Effects on Thoughts & Mental State',
    'selfCare': 'Self-Care & Coping Strategies',
    'feelingsBefore': 'Feelings Before the Situation',
    'feelingsAfter': 'Feelings After the Situation', 
    'noticeEmotions': 'How You Notice Emotional Changes',
    'physicalSensations': 'Physical Sensations & Body Awareness',
    'managingFeelings': 'Techniques for Managing Feelings',
    'emotionalSupport': 'Sources of Emotional Support',
    'challengingSituations': 'Challenging Situations & Responses',
    'copingStrategies': 'Personal Coping Strategies',
    'emotionalWellbeing': 'Overall Emotional Wellbeing',
    'socialConnections': 'Social Connections & Relationships',
    'mindfulnessPractices': 'Mindfulness & Awareness Practices'
  };
  
  return fieldTitles[fieldName] || fieldName;
}

function getPageTitle(pageNumber) {
  const pageTitles = {
    '58': 'Self-Awareness & Personal Growth',
    '59': 'Empathy Development & Understanding', 
    '60': 'Practical Application & Skills',
    '61': 'Emotional Regulation & Well-Being',
    '62': 'Action Plan & Reflection'
  };
  
  return pageTitles[pageNumber] || `Page ${pageNumber}`;
}

function showErrorMessage() {
  document.getElementById('my-exercise1-data').innerHTML = 
    '<div class="text-center py-12 text-red-500">Error loading your Exercise 1 data. Please try refreshing the page.</div>';
  document.getElementById('my-exercise2-data').innerHTML = 
    '<div class="text-center py-12 text-red-500">Error loading your Exercise 2 data. Please try refreshing the page.</div>';
}

// Export personal data as PDF
async function exportMyData() {
  if (!currentUserSession) {
    alert('No session found to export');
    return;
  }

  if (!personalData.stats) {
    alert('No data to export yet. Complete some exercises first!');
    return;
  }

  try {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set up PDF styling
    const primaryColor = [0, 124, 186]; 
    const secondaryColor = [124, 58, 237]; 
    const textColor = [51, 51, 51];
    const lightGray = [128, 128, 128];
    
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to add wrapped text
    function addWrappedText(text, x, y, maxWidth, lineHeight = 6) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * lineHeight);
    }
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('My Empathy Journey Profile', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 35);
    
    yPosition = 55;
    
    // User Information
    doc.setTextColor(...textColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Personal Information', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`User ID: ${generatePersonalUserId()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Session ID: ${currentUserSession}`, margin, yPosition);
    yPosition += 15;
    
    // Progress Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Progress Summary', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const stats = personalData.stats;
    doc.text(`Overall Journey Score: ${stats.overall.journeyScore}/100`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Responses Given: ${stats.overall.totalResponses}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Days Active: ${stats.overall.activeDays}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Exercise 1 Progress: ${stats.exercise1.completed}/${stats.exercise1.total} completed`, margin, yPosition);
    yPosition += 6;
    doc.text(`Exercise 2 Progress: ${stats.exercise2.inputsCompleted}/${stats.exercise2.totalInputs} inputs completed`, margin, yPosition);
    yPosition += 15;
    
    // Exercise 1 Details
    if (personalData.exercise1) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Exercise 1: Emotion Recognition', margin, yPosition);
      yPosition += 10;
      
      const pages = ['page1', 'page2', 'page3', 'page4'];
      pages.forEach((pageKey, index) => {
        if (personalData.exercise1[pageKey]) {
          const pageData = personalData.exercise1[pageKey];
          const hasResponse = pageData.input && pageData.input.trim();
          
          if (hasResponse) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Question ${index + 1}:`, margin, yPosition);
            yPosition += 6;
            
            doc.setFont('helvetica', 'normal');
            yPosition = addWrappedText(pageData.question || 'Question not available', margin, yPosition, contentWidth);
            yPosition += 4;
            
            doc.setFont('helvetica', 'bold');
            doc.text('Your Response:', margin, yPosition);
            yPosition += 6;
            
            doc.setFont('helvetica', 'normal');
            yPosition = addWrappedText(pageData.input, margin, yPosition, contentWidth);
            yPosition += 10;
            
            // Check if we need a new page
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
          }
        }
      });
    }
    
    // Exercise 2 Details
    if (personalData.exercise2) {
      // Add new page for Exercise 2
      doc.addPage();
      yPosition = 20;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Exercise 2: Empathy Development', margin, yPosition);
      yPosition += 10;
      
      const pages = ['page58', 'page59', 'page60', 'page61', 'page62'];
      pages.forEach(pageKey => {
        if (personalData.exercise2[pageKey]) {
          const pageData = personalData.exercise2[pageKey];
          const pageNumber = pageKey.replace('page', '');
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`${getPageTitle(pageNumber)}`, margin, yPosition);
          yPosition += 8;
          
          Object.keys(pageData).forEach(key => {
            if (key !== 'page' && key !== 'timestamp' && key !== 'completed' && key !== 'questions') {
              const response = pageData[key];
              if (response && response.trim()) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(`${getDescriptiveFieldTitle(key)}:`, margin, yPosition);
                yPosition += 5;
                
                doc.setFont('helvetica', 'normal');
                yPosition = addWrappedText(response, margin, yPosition, contentWidth, 5);
                yPosition += 5;
                
                // Check if we need a new page
                if (yPosition > 250) {
                  doc.addPage();
                  yPosition = 20;
                }
              }
            }
          });
          yPosition += 5;
        }
      });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...lightGray);
      doc.text(`Through Their Lens - Empathy Journey Profile - Page ${i} of ${pageCount}`, 
              margin, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    const filename = `my-empathy-profile-${generatePersonalUserId()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    console.log(' PDF exported successfully');
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
}

// Share progress functionality
function shareProgress() {
  if (!personalData.stats) {
    alert('No progress data to share yet. Complete some exercises first!');
    return;
  }

  const shareText = `I'm developing my empathy skills!\n\n` +
                   `Progress: ${personalData.stats.overall.journeyScore}/100\n` +
                   `Exercise 1: ${personalData.stats.exercise1.completed}/${personalData.stats.exercise1.total} completed\n` +
                   `Exercise 2: ${personalData.stats.exercise2.inputsCompleted}/${personalData.stats.exercise2.totalInputs} inputs completed\n` +
                   `Active for ${personalData.stats.overall.activeDays} days\n\n` +
                   `Join me in developing empathy skills!`;

  if (navigator.share) {
    navigator.share({
      title: 'My Empathy Journey Progress',
      text: shareText
    });
  } else {
    // Fallback to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Progress copied to clipboard! You can now paste it anywhere to share.');
    });
  }
}

// Function to create fresh session
function createFreshSession() {
  if (confirm('Create a completely fresh session? This will clear all your data and start over.')) {
    console.log('🧹 Creating fresh session...');
    
    // Use UnifiedSession if available
    if (window.UnifiedSession && window.UnifiedSession.createFreshSession) {
      window.UnifiedSession.createFreshSession();
    } else {
      // Fallback manual method
      localStorage.clear();
      const newId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('unified_user_id', newId);
      console.log('Fresh session created (fallback):', newId);
    }
    
    // Refresh page after creating session
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

// Main load function
async function loadMyData() {
  displayPersonalWelcome();
  
  if (currentUserSession) {
    await loadPersonalData();
  }
}
