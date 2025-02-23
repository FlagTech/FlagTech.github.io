const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const rows = 20;
const cols = 10;
const colors = ['red', 'blue', 'yellow', 'green'];

// 遊戲區域二維數組
let grid = Array(rows).fill().map(() => Array(cols).fill(null));
let score = 0;
let time = 0;
let dropInterval = 1000; // 初始掉落間隔1秒
let lastTime = 0;

// 俄羅斯方塊形狀
const tetrominoes = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]]  // L
];

// 當前方塊
let currentTetromino = generateTetromino();
let tetrominoX = 4;
let tetrominoY = 0;

// 生成新方塊
function generateTetromino() {
    const shape = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    return shape.map(row => row.map(cell => cell ? colors[Math.floor(Math.random() * 4)] : null));
}

// 繪製遊戲區域
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c]) {
                ctx.fillStyle = grid[r][c];
                ctx.fillRect(c * gridSize, r * gridSize, gridSize - 1, gridSize - 1);
            }
        }
    }
    currentTetromino.forEach((row, ry) => {
        row.forEach((cell, rx) => {
            if (cell) {
                ctx.fillStyle = cell;
                ctx.fillRect((tetrominoX + rx) * gridSize, (tetrominoY + ry) * gridSize, gridSize - 1, gridSize - 1);
            }
        });
    });
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = time;
}

// 碰撞檢測
function collides(dx = 0, dy = 0, rotated = currentTetromino) {
    for (let r = 0; r < rotated.length; r++) {
        for (let c = 0; c < rotated[r].length; c++) {
            if (rotated[r][c]) {
                let newX = tetrominoX + c + dx;
                let newY = tetrominoY + r + dy;
                if (newX < 0 || newX >= cols || newY >= rows || (newY >= 0 && grid[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 方塊旋轉
function rotate() {
    const rotated = currentTetromino[0].map((_, idx) => 
        currentTetromino.map(row => row[idx]).reverse()
    );
    if (!collides(0, 0, rotated)) currentTetromino = rotated;
}

// 方塊移動控制
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && !collides(-1, 0)) tetrominoX--;
    if (e.key === 'ArrowRight' && !collides(1, 0)) tetrominoX++;
    if (e.key === 'ArrowDown' && !collides(0, 1)) tetrominoY++;
    if (e.key === 'ArrowUp') rotate();
    draw();
});

// 方塊固定與消除
function fixTetromino() {
    currentTetromino.forEach((row, ry) => {
        row.forEach((cell, rx) => {
            if (cell) grid[tetrominoY + ry][tetrominoX + rx] = cell;
        });
    });
    checkLines();
    checkMatches();
    currentTetromino = generateTetromino();
    tetrominoX = 4;
    tetrominoY = 0;
    if (collides()) endGame();
}

// 檢查整行消除
function checkLines() {
    for (let r = rows - 1; r >= 0; r--) {
        if (grid[r].every(cell => cell)) {
            score += cols;
            grid.splice(r, 1);
            grid.unshift(Array(cols).fill(null));
            r++;
        }
    }
}

// 檢查同色消除
function checkMatches() {
    let matched = false;
    const toRemove = Array(rows).fill().map(() => Array(cols).fill(false));
    
    // 橫向檢查
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 2; c++) {
            if (grid[r][c] && grid[r][c] === grid[r][c+1] && grid[r][c] === grid[r][c+2]) {
                toRemove[r][c] = toRemove[r][c+1] = toRemove[r][c+2] = true;
                matched = true;
            }
        }
    }
    
    // 縱向檢查
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 2; r++) {
            if (grid[r][c] && grid[r][c] === grid[r+1][c] && grid[r][c] === grid[r+2][c]) {
                toRemove[r][c] = toRemove[r+1][c] = toRemove[r+2][c] = true;
                matched = true;
            }
        }
    }
    
    // 移除並計算分數
    if (matched) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (toRemove[r][c]) {
                    grid[r][c] = null;
                    score++;
                }
            }
        }
        dropBlocks();
        checkMatches(); // 檢查連鎖反應
    }
}

// 上方方塊下落
function dropBlocks() {
    for (let c = 0; c < cols; c++) {
        let bottom = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (grid[r][c]) {
                if (r !== bottom) {
                    grid[bottom][c] = grid[r][c];
                    grid[r][c] = null;
                }
                bottom--;
            }
        }
    }
}

// 遊戲循環
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    if (timestamp - lastTime >= dropInterval) {
        if (!collides(0, 1)) tetrominoY++;
        else fixTetromino();
        lastTime = timestamp;
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// 時間更新與加速
setInterval(() => {
    time++;
    if (time % 30 === 0) dropInterval = Math.max(200, dropInterval - 100); // 最快0.2秒
}, 1000);

// 遊戲結束
function endGame() {
    alert('Game Over! 按任意鍵重新開始');
    document.addEventListener('keydown', restart, { once: true });
}

// 重新開始
function restart() {
    grid = Array(rows).fill().map(() => Array(cols).fill(null));
    score = 0;
    time = 0;
    dropInterval = 1000;
    currentTetromino = generateTetromino();
    tetrominoX = 4;
    tetrominoY = 0;
    draw();
}

requestAnimationFrame(gameLoop);