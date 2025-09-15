 // Dots alternate left/right, text always below dot, lines connect dots
    document.addEventListener('DOMContentLoaded', function() {
        const isMobile = window.innerWidth < 768;
        const baseDelay = isMobile ? 400 : 300;
        const suffix = isMobile ? 'm' : '';
        // Step 1: Dot 1
        setTimeout(() => {
            document.getElementById('dot1' + suffix).classList.remove('opacity-0');
        }, baseDelay);
        // Step 2: Text 1
        setTimeout(() => {
            document.getElementById('text1' + suffix).classList.remove('opacity-0');
        }, baseDelay + 400);
        // Step 3: Line 1
        setTimeout(() => {
            const line1 = document.getElementById('line1' + suffix);
            line1.classList.remove('opacity-0');
            line1.classList.add('opacity-100');
            line1.style.opacity = 1;
            connectLine(line1, document.getElementById('dot1' + suffix), document.getElementById('dot2' + suffix));
        }, baseDelay + 900);
        // Step 4: Dot 2
        setTimeout(() => {
            document.getElementById('dot2' + suffix).classList.remove('opacity-0');
        }, baseDelay + 1400);
        // Step 5: Text 2
        setTimeout(() => {
            document.getElementById('text2' + suffix).classList.remove('opacity-0');
        }, baseDelay + 1800);
        // Step 6: Line 2
        setTimeout(() => {
            const line2 = document.getElementById('line2' + suffix);
            line2.classList.remove('opacity-0');
            line2.classList.add('opacity-100');
            line2.style.opacity = 1;
            connectLine(line2, document.getElementById('dot2' + suffix), document.getElementById('dot3' + suffix));
        }, baseDelay + 2300);
        // Step 7: Dot 3
        setTimeout(() => {
            document.getElementById('dot3' + suffix).classList.remove('opacity-0');
        }, baseDelay + 2700);
        // Step 8: Text 3
        setTimeout(() => {
            document.getElementById('text3' + suffix).classList.remove('opacity-0');
        }, baseDelay + 3100);
        // Step 9: Line 3
        setTimeout(() => {
            const line3 = document.getElementById('line3' + suffix);
            line3.classList.remove('opacity-0');
            line3.classList.add('opacity-100');
            line3.style.opacity = 1;
            connectLine(line3, document.getElementById('dot3' + suffix), document.getElementById('dot4' + suffix));
        }, baseDelay + 3600);
        // Step 10: Dot 4
        setTimeout(() => {
            document.getElementById('dot4' + suffix).classList.remove('opacity-0');
        }, baseDelay + 4000);
        // Step 11: Next Button
        setTimeout(() => {
            document.getElementById('nextBtn' + suffix).classList.remove('opacity-0');
        }, baseDelay + 4400);
        // Next button action
        const nextBtn = document.getElementById('nextBtn' + suffix);
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                window.location.href = '29.html';
            });
        }
    });


    function getCenter(dot) {
    const rect = dot.getBoundingClientRect();
    const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
    console.log('Dot', dot.id || dot.className, 'center:', center);
    return center;
}

function connectLine(line, dotA, dotB, angleDisplayId = null, label = '') {
    const a = getCenter(dotA);
    const b = getCenter(dotB);
    const parentRect = line.parentElement.getBoundingClientRect();
    const x1 = a.x - parentRect.left;
    const y1 = a.y - parentRect.top;
    const x2 = b.x - parentRect.left;
    const y2 = b.y - parentRect.top;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    line.style.left = x1 + 'px';
    line.style.top = y1 + 'px';
    line.style.opacity = 1;
    line.style.width = length + 'px';
    line.style.transform = `rotate(${angle}deg)`;
    if (angleDisplayId) {
        const angleDisplay = document.getElementById(angleDisplayId);
        angleDisplay.textContent = `${label} ${angle.toFixed(2)}°`;
    }
}
