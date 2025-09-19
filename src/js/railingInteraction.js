// Interactive Hand Grip 
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const interactionArea = document.getElementById('interactionArea');
  const elderlyHand = document.getElementById('elderlyHand');
  const successMessage = document.getElementById('successMessage');
  const failureMessage = document.getElementById('failureMessage');
  const stabilityProgress = document.getElementById('stabilityProgress');
  const stabilityMeter = document.getElementById('stabilityMeter');
  const nextButton = document.getElementById('nextButton');
  const tryAgainButton = document.getElementById('tryAgainButton');

  // Variables
  let isDragging = false;
  let stability = 40;
  let isStabilized = false;
  let shakingInterval;
  let stabilityInterval;
  let decreaseStabilityTimer;
  let handX = 0;

  // Initialize
  updateStabilityMeter();
  startShaking();

  // Button listeners
  nextButton.addEventListener('click', e => {
    e.preventDefault();
    nextButton.disabled = true;
    window.location.href = '47.html';
  });

  tryAgainButton.addEventListener('click', () => {
    tryAgainButton.disabled = true;
    resetGame();
    tryAgainButton.disabled = false;
  });

  // Interaction setup
  interactionArea.addEventListener('mousedown', startStabilizing);
  interactionArea.addEventListener('touchstart', startStabilizing);
  document.addEventListener('mouseup', stopStabilizing);
  document.addEventListener('touchend', stopStabilizing);
  interactionArea.addEventListener('mouseleave', stopStabilizing);

  // Hand position update
  function updateHandPosition(dragging, stabilized) {
    if (stabilized) {
      elderlyHand.style.transform = 'translate(0px, 0px)';
    } else if (dragging) {
      elderlyHand.style.transform = 'translate(0, -5px)';
    }
  }

  interactionArea.addEventListener('mousemove', e => {
    if (isDragging && !isStabilized) {
      updateHandPosition(true, false);
      const rect = interactionArea.getBoundingClientRect();
      handX = e.clientX - rect.left;
    }
  });

  interactionArea.addEventListener('touchmove', e => {
    if (isDragging && !isStabilized && e.touches[0]) {
      e.preventDefault();
      updateHandPosition(true, false);
      const rect = interactionArea.getBoundingClientRect();
      handX = e.touches[0].clientX - rect.left;
    }
  }, { passive: false });

  // Shaking effect
  function startShaking() {
    if (shakingInterval) clearInterval(shakingInterval);
    let shakingAmount = 6;

    function updateShakeAmount() {
      return stability < 80 ? 6 : 1;
    }

    shakingInterval = setInterval(() => {
      if (isStabilized) {
        elderlyHand.style.transform = 'translate(0px, 0px)';
        return;
      }
      if (!isDragging && stability < 60) {
        shakingAmount = updateShakeAmount();
        const randomX = (Math.random() * shakingAmount * 1.5) - shakingAmount;
        const randomY = (Math.random() * shakingAmount * 2.5) - shakingAmount;
        elderlyHand.style.transform = `translate(${randomX}px, ${randomY}px)`;
      }
    }, 100);
  }

  // Start stabilizing
  function startStabilizing(e) {
    if (isStabilized) return;
    if (e.type === 'mousedown' || e.type === 'touchstart') e.preventDefault();

    isDragging = true;
    updateHandPosition(true, false);
    stabilityMeter.classList.add('attention-pulse');

    // Temporary notification
    if (!document.getElementById('meterNotification')) {
      const notification = document.createElement('div');
      notification.id = 'meterNotification';
      notification.className = 'absolute top-28 left-1/2 transform -translate-x-1/2 bg-violet-900 text-white px-4 py-2 rounded-lg opacity-0 transition-opacity duration-500 z-40 text-center';
      notification.innerHTML = 'Help her grip strength increase!';
      interactionArea.appendChild(notification);
      setTimeout(() => notification.style.opacity = '1', 10);
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
      }, 3000);
    }

    if (!stabilityInterval) {
      stabilityInterval = setInterval(() => {
        if (isStabilized) return;
        stability = Math.min(100, stability + 4);
        updateStabilityMeter();
        if (stability >= 100) completeStabilization();
      }, 100);
    }
  }

  // Stop stabilizing
  function stopStabilizing() {
    if (isStabilized) return;
    isDragging = false;
    updateHandPosition(false, false);

    if (stabilityInterval) {
      clearInterval(stabilityInterval);
      stabilityInterval = null;
    }

    if (!decreaseStabilityTimer) {
      decreaseStabilityTimer = setInterval(() => {
        if (isDragging || isStabilized) {
          clearInterval(decreaseStabilityTimer);
          decreaseStabilityTimer = null;
          return;
        }
        stability = Math.max(0, stability - 0.8);
        updateStabilityMeter();
        if (stability <= 0) {
          clearInterval(decreaseStabilityTimer);
          decreaseStabilityTimer = null;
          completeStabilization();
        }
      }, 100);
    }
  }

  // Update meter
  function updateStabilityMeter() {
    stabilityProgress.style.width = `${stability}%`;
    if (stability < 30) {
      stabilityProgress.style.background = 'linear-gradient(to right, #ffcc00, #ffcc00)';
    } else if (stability < 70) {
      stabilityProgress.style.background = 'linear-gradient(to right, #ffcc00, #66cc33)';
    } else {
      stabilityProgress.style.background = 'linear-gradient(to right, #66cc33, #66cc33)';
    }
  }

  // Success
  function handleSuccess() {
    isStabilized = true;
    clearTimers();
    failureMessage.style.opacity = '0';
    tryAgainButton.style.opacity = '0';
    tryAgainButton.style.pointerEvents = 'none';

    successMessage.style.opacity = '1';
    elderlyHand.classList.add('success-animation');
    setTimeout(() => {
      nextButton.style.opacity = '1';
      nextButton.style.pointerEvents = 'auto';
    }, 2000);

    const dialogueText = document.querySelector('.text-black.leading-relaxed');
    if (dialogueText) {
      dialogueText.innerHTML = `
        <span class="italic font-light">** I grasp the railing firmly, feeling more secure **</span><br/>
        Oh, thank goodness... there we go. I've got it now.<br/>
        <span class="italic font-light">** breathes with relief **</span><br/>
        These old hands still know how to hold on tight. Just need to catch my breath for a moment... that's better. Now I can take my time getting where I need to go. Step by step, nice and steady.<br/>
      `;
    }
  }

  // Failure
  function handleFailure() {
    isStabilized = true;
    clearTimers();
    successMessage.style.opacity = '0';
    nextButton.style.opacity = '0';
    nextButton.style.pointerEvents = 'none';

    failureMessage.style.opacity = '1';
    elderlyHand.classList.add('failure-animation');
    setTimeout(() => {
      tryAgainButton.style.opacity = '1';
      tryAgainButton.style.pointerEvents = 'auto';
    }, 2000);

    const dialogueText = document.querySelector('.text-black.leading-relaxed');
    if (dialogueText) {
      dialogueText.innerHTML = `
        <span class="italic font-light">** My grip wasn't strong enough and I lost my balance **</span><br/>
        Oh no... I can't quite... <br/>
        <span class="italic font-light">** voice trembling with worry **</span><br/>
        I need to stop right here. These legs just aren't what they used to be. Maybe if I just stand very still for a moment... or call for help?<br/>
      `;
    }
  }

  // Complete stabilization
  function completeStabilization() {
    if (stability >= 100) handleSuccess();
    else if (stability <= 0) handleFailure();
  }

  // Reset game
  function resetGame() {
    stability = 40;
    isStabilized = false;
    isDragging = false;
    updateStabilityMeter();

    successMessage.style.opacity = '0';
    failureMessage.style.opacity = '0';
    nextButton.style.opacity = '0';
    nextButton.style.pointerEvents = 'none';
    tryAgainButton.style.opacity = '0';
    tryAgainButton.style.pointerEvents = 'none';

    elderlyHand.classList.remove('success-animation', 'failure-animation');
    elderlyHand.style.transform = 'translate(0px, 0px)';

    startShaking();

    const dialogueText = document.querySelector('.text-black.leading-relaxed');
    if (dialogueText) {
      dialogueText.innerHTML = `
        <span class="italic font-light">** These flagstones feel so unsteady beneath my feet... **</span><br/>
        Oh my, these old stones are so treacherous. I need to get to that railing somehow. Come on, you can do this. Just take it slow and steady.<br/>
        <span class="italic font-light">** I reach out carefully, telling myself to be brave **</span><br/>
        At my age, I can't afford to fall. Just hold on the railing firmly and I'll be okay...<br/>
      `;
    }
  }

  // Clear all intervals
  function clearTimers() {
    if (stabilityInterval) {
      clearInterval(stabilityInterval);
      stabilityInterval = null;
    }
    if (decreaseStabilityTimer) {
      clearInterval(decreaseStabilityTimer);
      decreaseStabilityTimer = null;
    }
  }
});
