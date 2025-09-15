
function JourneyMap(canvas, ctx, config) {
    // Canvas setup
    let canvasScale = 1;

    function resizeCanvas() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        canvasScale = Math.min(rect.width / 800, rect.height / 600);
        if (isMobileDevice()) {
            canvasScale = Math.max(canvasScale, 0.6);
        }
    }

    function isMobileDevice() {
        return window.innerWidth < 768;
    }
    JourneyMap.isMobileDevice = isMobileDevice;

    function scaleCoord(coord) {
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        let x = coord.isPercent ? coord.x * width : coord.x * canvasScale;
        let y = coord.isPercent ? coord.y * height : coord.y * canvasScale;
        let offsetX = isMobileDevice()
            ? Math.max(width - 800 * canvasScale, 0)
            : Math.max((width - 800 * canvasScale) / 2, 0);
        x += offsetX;
        return { x, y };
    }

    let gameLoopId;
    window.addEventListener('resize', () => {
        pathPoints = config.getPathPoints();
        updatePersistentState();
        if (isMobileDevice()) {
            gameState.player.pos = {x: 0.5, y: 0.1, isPercent: true};
        } else {
            gameState.player.pos = {x: 200, y: 500};
        }
        resizeCanvas();
        if (gameLoopId) {
            drawEverything();
        }
    });

    setTimeout(() => {
        resizeCanvas();
    }, 100);

    // Load images
    const checkpointImg = new Image();
    const flagImg = new Image();
    checkpointImg.src = '../images/checkpoint.png';
    flagImg.src = '../images/flag.png';

    let imagesLoaded = 0;
    const totalImages = 2;
    function onImageLoad() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            updateNextButton();
            gameLoop();
        }
    }
    checkpointImg.onload = onImageLoad;
    flagImg.onload = onImageLoad;

    // Persistent state for journey map
    let persistentCheckpoints = [];
    let persistentExercises = [];

    function getResponsiveCheckpoints() {
        return config.getCheckpoints();
    }
    function getResponsiveExercises() {
        return config.getExercises();
    }
    function updatePersistentState() {
        const oldCheckpoints = persistentCheckpoints;
        const oldExercises = persistentExercises;
        const newCheckpoints = getResponsiveCheckpoints();
        const newExercises = getResponsiveExercises();
        persistentCheckpoints = newCheckpoints.map((cp, i) => ({
            ...cp,
            completed: oldCheckpoints[i] ? oldCheckpoints[i].completed : false
        }));
        persistentExercises = newExercises.map((ex, i) => ({
            ...ex,
            completed: oldExercises[i] ? oldExercises[i].completed : false
        }));
    }
    updatePersistentState();

    let pathPoints = config.getPathPoints();

    const gameState = {
        get checkpoints() { return persistentCheckpoints; },
        get exercises() { return persistentExercises; },
        player: {
            pos: config.getInitialPlayerPos(),
            currentStep: 0,
            size: 12
        },
        isAnimating: false,
        sequence: config.sequence
    };

    function drawEverything() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPath();
        drawCheckpoints();
        drawExercises();
        drawPlayer();
    }

    canvas.addEventListener('click', (event) => {
        if (gameState.isAnimating) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (event.clientX - rect.left) * scaleX / canvasScale;
        const clickY = (event.clientY - rect.top) * scaleY / canvasScale;
        [...gameState.checkpoints, ...gameState.exercises].forEach((item) => {
            const distance = Math.sqrt((clickX - item.pos.x) * (clickX - item.pos.x) + (clickY - item.pos.y) * (clickY - item.pos.y));
            const clickTolerance = isMobileDevice() ? 60 : 40;
            if (distance < clickTolerance) {
                gameState.player.pos = {...item.pos};
                drawEverything();
                updateNextButton();
            }
        });
    });

    function drawPath() {
        const gradient = ctx.createLinearGradient(0, 0, 800 * canvasScale, 600 * canvasScale);
        gradient.addColorStop(0, '#4facfe');
        gradient.addColorStop(1, '#00f2fe');
        ctx.strokeStyle = gradient;
        const baseLineWidth = isMobileDevice() ? 10 : 6;
        ctx.lineWidth = baseLineWidth * canvasScale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const scaledStartPoint = scaleCoord(pathPoints[0]);
        ctx.moveTo(scaledStartPoint.x, scaledStartPoint.y);
        for (let i = 1; i < pathPoints.length - 2; i++) {
            const scaledCurrent = scaleCoord(pathPoints[i]);
            const scaledNext = scaleCoord(pathPoints[i + 1]);
            const xc = (scaledCurrent.x + scaledNext.x) / 2;
            const yc = (scaledCurrent.y + scaledNext.y) / 2;
            ctx.quadraticCurveTo(scaledCurrent.x, scaledCurrent.y, xc, yc);
        }
        const scaledSecondLast = scaleCoord(pathPoints[pathPoints.length - 2]);
        const scaledLast = scaleCoord(pathPoints[pathPoints.length - 1]);
        ctx.quadraticCurveTo(
            scaledSecondLast.x,
            scaledSecondLast.y,
            scaledLast.x,
            scaledLast.y
        );
        ctx.stroke();
        pathPoints.forEach((point, index) => {
            if (index % 2 === 0) {
                const scaledPoint = scaleCoord(point);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(scaledPoint.x, scaledPoint.y, 3 * canvasScale, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    }

    function drawCheckpoints() {
        gameState.checkpoints.forEach((checkpoint, index) => {
            const scaledPos = scaleCoord(checkpoint.pos);
            const {x, y} = scaledPos;
            const currentStepInfo = gameState.player.currentStep < gameState.sequence.length ? 
                gameState.sequence[gameState.player.currentStep] : null;
            const isCurrentCheckpoint = currentStepInfo && 
                currentStepInfo.type === 'checkpoint' && 
                currentStepInfo.index === index;
            let imgToUse;
            if (index === 2) {
                imgToUse = flagImg;
            } else {
                imgToUse = checkpointImg;
            }
            const baseImgSize = 56;
            const imgSize = baseImgSize * canvasScale;
            ctx.drawImage(imgToUse, x - imgSize/2, y - imgSize/2, imgSize, imgSize);
            if (isCurrentCheckpoint) {
                ctx.strokeStyle = '#FFE082';
                ctx.lineWidth = 3 * canvasScale;
                ctx.beginPath();
                ctx.arc(x, y, imgSize/2 + 7 * canvasScale, 0, 2 * Math.PI);
                ctx.stroke();
            }
            const scaledPlayerPos = scaleCoord(gameState.player.pos);
            const playerX = scaledPlayerPos.x;
            const playerY = scaledPlayerPos.y;
            const distanceToCheckpoint = Math.sqrt((playerX - x) * (playerX - x) + (playerY - y) * (playerY - y));
            if (distanceToCheckpoint < 15 * canvasScale && !gameState.isAnimating) {
                const baseFontSize = 14;
                ctx.fillStyle = '#FF9800';
                ctx.font = `bold ${baseFontSize * canvasScale}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const textWidth = ctx.measureText("you are here").width;
                const textHeight = 16 * canvasScale;
                const textX = x;
                const textY = y + imgSize/2 + 40 * canvasScale;
                ctx.fillStyle = 'rgba(255, 152, 0, 0.9)';
                ctx.beginPath();
                ctx.roundRect(textX - textWidth/2 - 8 * canvasScale, textY - textHeight/2, textWidth + 16 * canvasScale, textHeight, 8 * canvasScale);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2 * canvasScale;
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.fillText("you are here", textX, textY);
            }
            if (checkpoint.completed && !(distanceToCheckpoint < 15 * canvasScale && !gameState.isAnimating)) {
                ctx.save();
                ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
                ctx.beginPath();
                ctx.arc(x + imgSize/3, y - imgSize/3, 12 * canvasScale, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2 * canvasScale;
                ctx.beginPath();
                ctx.moveTo(x + imgSize/3 - 5 * canvasScale, y - imgSize/3 + 1 * canvasScale);
                ctx.lineTo(x + imgSize/3 - 1 * canvasScale, y - imgSize/3 + 6 * canvasScale);
                ctx.lineTo(x + imgSize/3 + 7 * canvasScale, y - imgSize/3 - 4 * canvasScale);
                ctx.stroke();
                ctx.restore();
            }
            const baseNameFontSize = 14;
            ctx.fillStyle = '#333';
            ctx.font = `bold ${baseNameFontSize * canvasScale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            let nameX = x;
            let nameY = y + imgSize/2 + 6 * canvasScale;
            const textWidth = ctx.measureText(checkpoint.name).width;
            if (nameX - textWidth/2 < 0) nameX = textWidth/2;
            if (nameX + textWidth/2 > canvas.width) nameX = canvas.width - textWidth/2;
            if (nameY + baseNameFontSize * canvasScale > canvas.height) nameY = canvas.height - baseNameFontSize * canvasScale;
            ctx.fillText(checkpoint.name, nameX, nameY);
        });
    }

    function drawExercises() {
        gameState.exercises.forEach((exercise, index) => {
            const scaledPos = scaleCoord(exercise.pos);
            const {x, y} = scaledPos;
            const currentStepInfo = gameState.player.currentStep < gameState.sequence.length ? 
                gameState.sequence[gameState.player.currentStep] : null;
            const isCurrentExercise = currentStepInfo && 
                currentStepInfo.type === 'exercise' && 
                currentStepInfo.index === index;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 35 * canvasScale);
            if (isCurrentExercise) {
                gradient.addColorStop(0, '#FF9800');
                gradient.addColorStop(1, '#F57C00');
            } else {
                gradient.addColorStop(0, '#2196F3');
                gradient.addColorStop(1, '#1976D2');
            }
            const baseWidth = 80;
            const baseHeight = 50;
            const width = baseWidth * canvasScale;
            const height = baseHeight * canvasScale;
            const cornerRadius = 12 * canvasScale;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x - width/2, y - height/2, width, height, cornerRadius);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3 * canvasScale;
            ctx.stroke();
            if (isCurrentExercise) {
                ctx.strokeStyle = '#FFE082';
                ctx.lineWidth = 2 * canvasScale;
                ctx.beginPath();
                ctx.roundRect(x - width/2 - 5 * canvasScale, y - height/2 - 5 * canvasScale, width + 10 * canvasScale, height + 10 * canvasScale, cornerRadius + 2 * canvasScale);
                ctx.stroke();
            }
            ctx.fillStyle = '#fff';
            const baseExerciseFontSize = 12;
            ctx.font = `bold ${baseExerciseFontSize * canvasScale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Exercise ${index + 1}`, x, y);
            const scaledPlayerPos = scaleCoord(gameState.player.pos);
            const playerX = scaledPlayerPos.x;
            const playerY = scaledPlayerPos.y;
            const distanceToExercise = Math.sqrt((playerX - x) * (playerX - x) + (playerY - y) * (playerY - y));
            if (distanceToExercise < 15 * canvasScale && !gameState.isAnimating) {
                const baseExerciseTextFontSize = 14;
                ctx.fillStyle = '#FF9800';
                ctx.font = `bold ${baseExerciseTextFontSize * canvasScale}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const textWidth = ctx.measureText("you are here").width;
                const textHeight = 16 * canvasScale;
                const textX = x;
                const textY = y + height/2 + 20 * canvasScale;
                ctx.fillStyle = 'rgba(255, 152, 0, 0.9)';
                ctx.beginPath();
                ctx.roundRect(textX - textWidth/2 - 8 * canvasScale, textY - textHeight/2, textWidth + 16 * canvasScale, textHeight, 8 * canvasScale);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2 * canvasScale;
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.fillText("you are here", textX, textY);
            }
            if (exercise.completed && !(distanceToExercise < 15 * canvasScale && !gameState.isAnimating)) {
                ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
                ctx.beginPath();
                ctx.arc(x + width/3, y - height/3, 12 * canvasScale, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2 * canvasScale;
                ctx.beginPath();
                ctx.moveTo(x + width/3 - 6 * canvasScale, y - height/3);
                ctx.lineTo(x + width/3 - 2 * canvasScale, y - height/3 + 4 * canvasScale);
                ctx.lineTo(x + width/3 + 6 * canvasScale, y - height/3 - 4 * canvasScale);
                ctx.stroke();
            }
        });
    }

    function drawPlayer() {
        const scaledPos = scaleCoord(gameState.player.pos);
        const x = scaledPos.x;
        const y = scaledPos.y;
        const baseSize = 12;
        const size = baseSize * canvasScale;
        if (gameState.isAnimating) {
            ctx.fillStyle = 'rgba(255, 107, 107, 0.1)';
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.arc(x, y, size + i * 3 * canvasScale, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.7, '#FF5252');
        gradient.addColorStop(1, '#D32F2F');
        ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, size + 4 * canvasScale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x - 3 * canvasScale, y - 3 * canvasScale, size * 0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.stroke();
        if (gameState.isAnimating) {
            const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
            ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size + 6, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    function animateToNextStep() {
        if (gameState.player.currentStep >= gameState.sequence.length) {
            return;
        }
        const currentStepInfo = gameState.sequence[gameState.player.currentStep];
        let target;
        if (currentStepInfo.type === 'checkpoint') {
            target = gameState.checkpoints[currentStepInfo.index].pos;
        } else {
            target = gameState.exercises[currentStepInfo.index].pos;
        }
        const player = gameState.player.pos;
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        function toPixel(coord) {
            if (coord.isPercent) {
                return {
                    x: coord.x * rect.width,
                    y: coord.y * rect.height
                };
            } else {
                return {
                    x: coord.x * canvasScale + ((rect.width - 800 * canvasScale) / 2 > 0 ? (rect.width - 800 * canvasScale) / 2 : 0),
                    y: coord.y * canvasScale
                };
            }
        }
        const playerPx = toPixel(player);
        const targetPx = toPixel(target);
        const dx = targetPx.x - playerPx.x;
        const dy = targetPx.y - playerPx.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 10) {
            gameState.player.pos = {...target};
            gameState.isAnimating = false;
            if (currentStepInfo.type === 'checkpoint') {
                persistentCheckpoints[currentStepInfo.index].completed = true;
            } else {
                persistentExercises[currentStepInfo.index].completed = true;
            }
            gameState.player.currentStep++;
            updateNextButton();
            return;
        }
        const speed = 6;
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;
        const newPx = { x: playerPx.x + moveX, y: playerPx.y + moveY };
        if (player.isPercent) {
            gameState.player.pos.x = newPx.x / rect.width;
            gameState.player.pos.y = newPx.y / rect.height;
        } else {
            gameState.player.pos.x += moveX / canvasScale;
            gameState.player.pos.y += moveY / canvasScale;
        }
    }

    function nextStep() {
        if (gameState.isAnimating || gameState.player.currentStep >= gameState.sequence.length) {
            return;
        }
        gameState.isAnimating = true;
        updateNextButton();
    }

    function updateNextButton() {
        const nextBtn = document.getElementById('nextBtn');
        if (gameState.player.currentStep >= gameState.sequence.length) {
            nextBtn.textContent = 'Continue';
            nextBtn.disabled = false;
            nextBtn.onclick = function() {
                const nextPage = nextBtn.getAttribute('data-next-page') || '24.html';
                window.location.href = nextPage;
            };
        } else if (gameState.isAnimating) {
            nextBtn.textContent = 'Moving...';
            nextBtn.disabled = true;
        } else {
            const nextStepInfo = gameState.sequence[gameState.player.currentStep];
            let target;
            if (nextStepInfo.type === 'checkpoint') {
                target = gameState.checkpoints[nextStepInfo.index].pos;
            } else {
                target = gameState.exercises[nextStepInfo.index].pos;
            }
            const playerX = gameState.player.pos.x;
            const playerY = gameState.player.pos.y;
            const distanceToTarget = Math.sqrt((playerX - target.x) * (playerX - target.x) + (playerY - target.y) * (playerY - target.y));
            if (distanceToTarget < 15) {
                nextBtn.textContent = 'Next';
            } else {
                nextBtn.textContent = `Go to ${nextStepInfo.name}`;
            }
            nextBtn.disabled = false;
            nextBtn.onclick = function() {
                nextStep();
            };
        }
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (gameState.isAnimating) {
            animateToNextStep();
        }
        drawEverything();
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    // For debugging/testing
    return {
        gameState,
        resizeCanvas,
        isMobileDevice,
        scaleCoord,
        drawEverything,
        nextStep,
        updateNextButton
    };
}

// Export for browser global usage
if (typeof window !== 'undefined') {
    window.JourneyMap = JourneyMap;
}


