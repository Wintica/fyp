class BalanceGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.balance = 0; // Balance state (-100 to 100)
        this.timeLeft = 20; // Game duration in seconds
        this.speedMultiplier = 1; // Difficulty multiplier
        this.lastTime = 0;
        this.isCountingDown = false; // New property for countdown state

        // Character dimensions
        this.characterWidth = 40;
        this.characterHeight = 80;

        // Initialize canvas size
        this.resizeCanvas();
        this.setupControls();
        this.animate = this.animate.bind(this);
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height - 100;
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            if (e.key === 'ArrowLeft') this.balance -= 8;
            if (e.key === 'ArrowRight') this.balance += 8;
            this.balance = Math.max(-100, Math.min(100, this.balance));
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.isRunning) return;
            const x = e.touches[0].clientX;
            if (x < this.canvas.width / 2) this.balance -= 8;
            else this.balance += 8;
            this.balance = Math.max(-100, Math.min(100, this.balance));
        });

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    startGame() {
        if (this.isCountingDown) return;
        this.isCountingDown = true;

        // Remove the Start Game button
        const startButton = document.getElementById('startGame');
        if (startButton) {
            startButton.style.display = 'none';
        }

        let countdown = 3;
        const drawCountdown = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 120px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(countdown, this.canvas.width / 2, this.canvas.height / 2);
        };

        drawCountdown();

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                drawCountdown();
            } else {
                clearInterval(countdownInterval);
                this.isCountingDown = false;
                this.isRunning = true;
                this.balance = 0;
                this.timeLeft = 20;
                this.speedMultiplier = 1;
                this.lastTime = performance.now();

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                requestAnimationFrame(this.animate);
            }
        }, 1000);
    }

    drawBalanceMeter() {
        this.ctx.fillStyle = '#E2E8F0';
        this.ctx.fillRect(20, 20, 200, 20);

        const indicatorX = 120 + this.balance;
        const fallRisk = Math.abs(this.balance) / 100;
        const red = Math.floor(245 + fallRisk * 10);
        const green = Math.floor(85 - fallRisk * 85);
        const blue = Math.floor(25 - fallRisk * 25);

        this.ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        this.ctx.beginPath();
        this.ctx.arc(indicatorX, 30, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCharacter() {
        const rotation = (this.balance / 100) * Math.PI / 6;
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(rotation);

        this.ctx.fillStyle = '#6B46C1';
        this.ctx.fillRect(-this.characterWidth / 2, -this.characterHeight, this.characterWidth, this.characterHeight);

        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.beginPath();
        this.ctx.arc(0, -this.characterHeight, 15, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawSpeedAndTimer() {
        // Draw timer above the speed indicator
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Time: ${Math.max(0, Math.ceil(this.timeLeft))}s`, this.canvas.width - 20, this.canvas.height / 2 - 30);

        // Draw speed indicator
        this.ctx.fillText(`Speed: ${this.speedMultiplier.toFixed(1)}x`, this.canvas.width - 20, this.canvas.height / 2);
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.timeLeft -= deltaTime;
        this.lastTime = currentTime;

        // Adjust speed multiplier to be more challenging
        const randomFactor = Math.random() * 3; // Random value between 0 and 3
        if (this.timeLeft > 15) {
            this.speedMultiplier = 0.2 + randomFactor;
        } else if (this.timeLeft > 5) {
            this.speedMultiplier = 0.5 + randomFactor;
        } else {
            this.speedMultiplier = 1 + randomFactor;
        }

        const wobble = Math.sin(currentTime * 0.005) * 2 * this.speedMultiplier; // Increased wobble strength
        this.balance += wobble;
        this.balance = Math.max(-100, Math.min(100, this.balance));

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBalanceMeter();
        this.drawCharacter();
        this.drawSpeedAndTimer(); 

        if (this.timeLeft <= 0) {
            this.isRunning = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('You win!', this.canvas.width / 2, this.canvas.height / 2);

            // Add 'Next' button for 'You win!'
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.style.position = 'fixed';
            nextButton.style.top = '60%';
            nextButton.style.left = '50%';
            nextButton.style.transform = 'translate(-50%, -50%)';
            nextButton.style.padding = '10px 20px';
            nextButton.style.backgroundColor = '#4CAF50';
            nextButton.style.color = 'white';
            nextButton.style.border = 'none';
            nextButton.style.borderRadius = '5px';
            nextButton.style.cursor = 'pointer';
            nextButton.style.zIndex = '1000';
            nextButton.addEventListener('click', () => {
                window.location.href = '47.html';
            });
            document.body.appendChild(nextButton);

            return;
        }

        if (Math.abs(this.balance) >= 100) {
            this.isRunning = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('You lose!', this.canvas.width / 2, this.canvas.height / 2);

            // Add 'Try Again' button for 'You lose!'
            const retryButton = document.createElement('button');
            retryButton.textContent = 'Try Again';
            retryButton.style.position = 'fixed';
            retryButton.style.top = '60%';
            retryButton.style.left = '50%';
            retryButton.style.transform = 'translate(-50%, -50%)';
            retryButton.style.padding = '10px 20px';
            retryButton.style.backgroundColor = '#4CAF50';
            retryButton.style.color = 'white';
            retryButton.style.border = 'none';
            retryButton.style.borderRadius = '5px';
            retryButton.style.cursor = 'pointer';
            retryButton.style.zIndex = '1000';
            retryButton.addEventListener('click', () => {
                window.location.reload();
            });
            document.body.appendChild(retryButton);
            return;
        }

        requestAnimationFrame(this.animate);
    }
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new BalanceGame(canvas);

    document.getElementById('startGame').addEventListener('click', () => {
        game.startGame();
    });
});