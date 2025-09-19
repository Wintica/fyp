class BalanceGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.balance = 0; // Balance state (-100 to 100)
        this.timeLeft = 20; // Game duration in seconds
        this.speedMultiplier = 1; // Difficulty multiplier
        this.lastTime = 0;
        this.isCountingDown = false; // Property for countdown state

        // Character dimensions
        this.characterWidth = 50;
        this.characterHeight = 100;

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

        this.ctx.fillStyle = '#F0D458'; 
        this.ctx.fillRect(-25, -60, 50, 60); 
        
        // Head 
        this.ctx.fillStyle = '#FFE4C4'; 
        this.ctx.beginPath();
        this.ctx.arc(0, -70, 20, 0, Math.PI * 2); 
        this.ctx.fill();
        
        // Hair 
        this.ctx.fillStyle = '#A4B8C4'; 
        this.ctx.beginPath();
        this.ctx.arc(0, -70, 22, Math.PI, 0); 
        this.ctx.fill();
        
     
        // Eyes
        this.ctx.fillStyle = '#333333';
        this.ctx.beginPath();
        this.ctx.arc(-7, -70, 2, 0, Math.PI * 2);
        this.ctx.arc(7, -70, 2, 0, Math.PI * 2);
        this.ctx.fill();
        

        this.ctx.restore();
    }

    drawSpeedAndTimer() {
        // Draw timer and speed indicator in the bottom right corner
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'bottom';
        
        // Draw timer
        this.ctx.fillText(`Time: ${Math.max(0, Math.ceil(this.timeLeft))}s`, this.canvas.width - 20, this.canvas.height - 40);
        
        // Draw speed indicator
        this.ctx.fillText(`Speed: ${this.speedMultiplier.toFixed(1)}x`, this.canvas.width - 20, this.canvas.height - 15);
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.timeLeft -= deltaTime;
        this.lastTime = currentTime;

        // Speed multiplier
        const randomFactor = Math.random() * 3; 
        if (this.timeLeft > 15) {
            this.speedMultiplier = 0.2 + randomFactor;
        } else if (this.timeLeft > 5) {
            this.speedMultiplier = 0.5 + randomFactor;
        } else {
            this.speedMultiplier = 1 + randomFactor;
        }

        // Wobble effect
        const wobble = Math.sin(currentTime * 0.005) * 2 * this.speedMultiplier; 
        this.balance += wobble;
        this.balance = Math.max(-100, Math.min(100, this.balance));

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBalanceMeter();
        this.drawCharacter();
        this.drawSpeedAndTimer(); 

        if (this.timeLeft <= 0) {
            this.isRunning = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw win message
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('You win!', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            // Draw "Next" button directly on canvas
            const buttonX = this.canvas.width / 2;
            const buttonY = this.canvas.height / 2 + 40;
            const buttonWidth = 100;
            const buttonHeight = 40;
            
            // Draw button background
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.beginPath();
            this.ctx.roundRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 5);
            this.ctx.fill();
            
            // Draw button text
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText('Next', buttonX, buttonY);
            
            // Handle button click
            const handleClick = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Check if click is within button bounds
                if (x > buttonX - buttonWidth / 2 && 
                    x < buttonX + buttonWidth / 2 && 
                    y > buttonY - buttonHeight / 2 && 
                    y < buttonY + buttonHeight / 2) {
                    window.location.href = '46.html';
                    this.canvas.removeEventListener('click', handleClick);
                }
            };
            
            this.canvas.addEventListener('click', handleClick);
            return;
        }

        if (Math.abs(this.balance) >= 100) {
            this.isRunning = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw lose message
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('You lose!', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            // Draw "Try Again" button 
            const buttonX = this.canvas.width / 2;
            const buttonY = this.canvas.height / 2 + 40;
            const buttonWidth = 120;
            const buttonHeight = 40;
            
            // Draw button background
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.beginPath();
            this.ctx.roundRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 5);
            this.ctx.fill();
            
            // Draw button text
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText('Try Again', buttonX, buttonY);
            
            // Handle button click
            const handleClick = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Check if click is within button bounds
                if (x > buttonX - buttonWidth / 2 && 
                    x < buttonX + buttonWidth / 2 && 
                    y > buttonY - buttonHeight / 2 && 
                    y < buttonY + buttonHeight / 2) {
                    window.location.reload();
                    this.canvas.removeEventListener('click', handleClick);
                }
            };
            
            this.canvas.addEventListener('click', handleClick);
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
