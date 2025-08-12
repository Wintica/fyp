let holdTimer = null;
let progressTimer = null;
let holdDuration = 3000; 
let startTime = 0;

function startHold() {
  // Prevent multiple holds
  if (holdTimer) return;
  
  startTime = Date.now();
  
  // Show progress bar
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const button = document.getElementById('holdButton');
  
  progressContainer.classList.remove('hidden');
  button.textContent = 'HOLDING...';
  button.classList.add('bg-purple-800');
  
  // Start progress animation
  progressTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / holdDuration) * 100, 100);
    progressBar.style.width = progress + '%';
    
    if (progress >= 100) {
      completeHold();
    }
  }, 50);
  
  // Set timeout for completion
  holdTimer = setTimeout(() => {
    completeHold();
  }, holdDuration);
}

function endHold() {
  // Clear timers if hold is released early
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  
  // Reset UI
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const button = document.getElementById('holdButton');
  
  progressContainer.classList.add('hidden');
  progressBar.style.width = '0%';
  button.textContent = 'HOLD';
  button.classList.remove('bg-purple-800');
}

function completeHold() {
  // Clear timers
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  
  // Success feedback
  const button = document.getElementById('holdButton');
  const progressBar = document.getElementById('progressBar');
  
  button.textContent = 'SUCCESS!';
  button.classList.add('bg-green-600');
  progressBar.classList.remove('bg-green-500');
  progressBar.classList.add('bg-green-600');
  
  // Navigate to next page after brief delay
  setTimeout(() => {
    window.location.href = '15.html';
  }, 1000);
}
