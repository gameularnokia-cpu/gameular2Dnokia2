// Make everything GLOBAL for onclick
window.onload = function() {
    // DOM Elements
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const gameOverElement = document.getElementById('gameOver');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');

    // Game variables
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let snake = [{x: 10, y: 10}];
    let food = {x: 0, y: 0};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameRunning = false;
    let gamePaused = false;
    let gameInterval;

    // Random food position
    function randomFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        
        // Avoid spawning on snake
        for (let segment of snake) {
            if (food.x === segment.x && food.y === segment.y) {
                randomFood();
                return;
            }
        }
    }

    // Draw apple pixel art
    function drawApple(x, y) {
        const size = gridSize;
        const cx = x * size + size / 2;
        const cy = y * size + size / 2;
        
        // Apple body
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(cx, cy + 2, size / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = '#ff6666';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Stem
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(cx - 1, cy - size / 2 + 1, 2, 6);
        
        // Leaf
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(cx + 2, cy - size / 2 + 2);
        ctx.lineTo(cx + 6, cy - size / 2 - 1);
        ctx.lineTo(cx + 4, cy - size / 2 + 4);
        ctx.closePath();
        ctx.fill();
    }

    // Main draw function
    function draw() {
        // Clear screen
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake body
        ctx.fillStyle = '#00ff00';
        for (let i = 1; i < snake.length; i++) {
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
        }

        // Draw snake head
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#00cc00';
        ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;

        // Draw apple
        drawApple(food.x, food.y);

        // Draw grid
        ctx.strokeStyle = '#003300';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }

    // Move snake
    function moveSnake() {
        const head = {
            x: snake[0].x + dx,
            y: snake[0].y + dy
        };

        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        // Self collision
        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        // Check food
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = `SKOR: ${score}`;
            randomFood();
        } else {
            snake.pop();
        }
    }

    // Game loop
    function gameLoop() {
        if (gameRunning && !gamePaused) {
            moveSnake();
        }
        draw();
    }

    // GLOBAL FUNCTIONS FOR onclick
    window.startGame = function() {
        snake = [{x: 10, y: 10}];
        dx = 1;
        dy = 0;
        score = 0;
        gameRunning = true;
        gamePaused = false;
        gameOverElement.style.display = 'none';
        startBtn.textContent = 'MULAI ULANG';
        pauseBtn.disabled = false;
        pauseBtn.textContent = 'PAUSE';
        scoreElement.textContent = 'SKOR: 0';
        
        randomFood();
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 150);
    };

    window.pauseGame = function() {
        if (!gameRunning) return;
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? 'RESUME' : 'PAUSE';
    };

    window.gameOver = function() {
        gameRunning = false;
        gameOverElement.style.display = 'block';
        pauseBtn.disabled = true;
        pauseBtn.textContent = 'PAUSE';
        clearInterval(gameInterval);
    };

    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        if (!gameRunning) return;
        
        switch(e.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                if (dx !== 1) { dx = -1; dy = 0; }
                break;
            case 'w':
            case 'arrowup':
                if (dy !== 1) { dx = 0; dy = -1; }
                break;
            case 'd':
            case 'arrowright':
                if (dx !== -1) { dx = 1; dy = 0; }
                break;
            case 's':
            case 'arrowdown':
                if (dy !== -1) { dx = 0; dy = 1; }
                break;
            case ' ':
                e.preventDefault();
                pauseGame();
                break;
        }
    });

    // Touch controls
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    });
    
    canvas.addEventListener('touchend', function(e) {
        if (!gameRunning) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
            if (deltaX > 0 && dx !== -1) { dx = 1; dy = 0; }
            else if (deltaX < 0 && dx !== 1) { dx = -1; dy = 0; }
        } else if (Math.abs(deltaY) > 30) {
            if (deltaY > 0 && dy !== -1) { dx = 0; dy = 1; }
            else if (deltaY < 0 && dy !== 1) { dx = 0; dy = -1; }
        }
    });

    // Button event listeners (backup)
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);

    // Initial draw
    randomFood();
    draw();
};
