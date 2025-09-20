
if (window.location.pathname.endsWith('25.html')) {
  // If coming from 24.html, reset all emotion removal flags
  if (document.referrer && document.referrer.endsWith('24.html')) {
    localStorage.removeItem('emotion_angry_removed');
    localStorage.removeItem('emotion_hurt_removed');
    localStorage.removeItem('emotion_lonely_removed');
    localStorage.removeItem('emotion_frustrated_removed');
  }

  // If all negative emotions are removed, go to 28.html
  function checkAllRemovedAndRedirect() {
    if (
      localStorage.getItem('emotion_angry_removed') === 'true' &&
      localStorage.getItem('emotion_hurt_removed') === 'true' &&
      localStorage.getItem('emotion_lonely_removed') === 'true' &&
      localStorage.getItem('emotion_frustrated_removed') === 'true'
    ) {
      window.location.href = '28.html';
    }
  }
  checkAllRemovedAndRedirect();

  // List of emotions and their properties
  const emotions = [
    { label: 'Angry', img: '../images/angry.png', href: '26(1).html', removeKey: 'emotion_angry_removed' },
    { label: 'Hurt', img: '../images/hurt.png', href: '26(2).html', removeKey: 'emotion_hurt_removed' },
    { label: 'Lonely', img: '../images/lonely.png', href: '26(3).html', removeKey: 'emotion_lonely_removed' },
    { label: 'Frustrated', img: '../images/frustrated.png', href: '26(4).html', removeKey: 'emotion_frustrated_removed' },
  ];

  const container = document.getElementById('emotion-buttons');
  if (container) {
    emotions.forEach(({ label, img, href, removeKey }) => {
      if (localStorage.getItem(removeKey) === 'true') return;
      const btn = document.createElement('a');
      btn.href = href;
      btn.className = 'bg-white rounded-2xl px-8 py-4 flex items-center gap-4 shadow hover:scale-105 transition min-w-[200px] sm:min-w-[220px] lg:min-w-[240px]';
      btn.innerHTML = `<img src="${img}" alt="${label}" class="h-12 w-12 object-contain" />\n<span class="text-2xl font-extrabold">${label}</span>`;
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        btn.remove();
        setTimeout(() => { window.location.href = href; }, 150);
      });
      container.appendChild(btn);
    });
  }
}

// --- 27(1-4).html logic ---
if (window.location.pathname.endsWith('27(1).html')) {
  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      localStorage.setItem('emotion_angry_removed', 'true');
      window.location.href = '25.html';
    });
  }
}
if (window.location.pathname.endsWith('27(2).html')) {
  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      localStorage.setItem('emotion_hurt_removed', 'true');
      window.location.href = '25.html';
    });
  }
}
if (window.location.pathname.endsWith('27(3).html')) {
  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      localStorage.setItem('emotion_lonely_removed', 'true');
      window.location.href = '25.html';
    });
  }
}
if (window.location.pathname.endsWith('27(4).html')) {
  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      localStorage.setItem('emotion_frustrated_removed', 'true');
      window.location.href = '25.html';
    });
  }
}
