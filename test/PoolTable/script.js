// 獲取Canvas元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const wrongBallsCanvas = document.getElementById('wrongBallsCanvas');
const wrongBallsCtx = wrongBallsCanvas.getContext('2d');

// 設置Canvas大小
canvas.width = 800;
canvas.height = 400;
wrongBallsCanvas.width = 600;
wrongBallsCanvas.height = 40;  // 調整為一顆球的高度

// 遊戲常量
const BALL_RADIUS = 10;
const CUSHION_WIDTH = 20;
const POCKET_RADIUS = 20;

// 球的顏色
const BALL_COLORS = {
    0: '#FFFFFF',  // 白球
    1: '#FFFF00',  // 黃球
    2: '#0000FF',  // 藍球
    3: '#FF0000',  // 紅球
    4: '#800080',  // 紫球
    5: '#FFA500',  // 橙球
    6: '#008000',  // 綠球
    7: '#800000',  // 褐球
    8: '#000000',  // 黑8
    9: '#FFFF00',  // 黃條紋球
    10: '#0000FF', // 藍條紋球
    11: '#FF0000', // 紅條紋球
    12: '#800080', // 紫條紋球
    13: '#FFA500', // 橙條紋球
    14: '#008000', // 綠條紋球
    15: '#800000'  // 褐條紋球
};

// 遊戲狀態
const gameState = {
    currentPlayer: 1,
    score1: 0,
    score2: 0,
    player1Type: null,
    player2Type: null,
    gameOver: false,
    lastPocketedBall: null,
    switchedPlayer: false,
    pocketedBalls1: [],  // 玩家1進的球
    pocketedBalls2: [],   // 玩家2進的球
    wrongBallType: null,  // 記錄當前不能打的球種
    wrongBallHint: {  // 新增：打錯球的提示
        active: false,
        timer: 0,
        ball: null
    },
    wrongBalls: [],  // 記錄打錯的進球
    firstBall: null,  // 記錄第一顆決定球種的進球
    isNewTurn: false,  // 新添加：標記是否是新回合
    pendingSwitch: false,  // 新添加：標記是否有待處理的換人
    winner: null  // 新增：記錄贏家
};

// 遊戲變量
let balls = [];
let cueBall;
let isAiming = false;
let canShoot = true;
const mouse = { x: 0, y: 0 };
let aimStartX, aimStartY, aimEndX, aimEndY;

// 獲取DOM元素
const messageElement = document.getElementById('message');
const score1Element = document.getElementById('score1');
const score2Element = document.getElementById('score2');
const ballType1Element = document.getElementById('ballType1');
const ballType2Element = document.getElementById('ballType2');
const player1Element = document.getElementById('player1');
const player2Element = document.getElementById('player2');
const pocketedBalls1Element = document.getElementById('pocketedBalls1');
const pocketedBalls2Element = document.getElementById('pocketedBalls2');

// 球袋位置
const pockets = [];

// 球類
class Ball {
    constructor(x, y, number) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.number = number;
        this.inPocket = false;
        this.highlighted = false;  // 高亮狀態
    }

    draw() {
        if (this.inPocket) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, BALL_RADIUS, 0, Math.PI * 2);
        
        // 根據球的類型填充顏色
        if (this.number === 0) {  // 白球
            ctx.fillStyle = '#FFFFFF';
        } else if (this.number <= 7) {  // 實心球
            ctx.fillStyle = '#FFD700';
        } else if (this.number === 8) {  // 8號球
            ctx.fillStyle = '#000000';
        } else {  // 花色球
            ctx.fillStyle = '#FFFFFF';
        }
        ctx.fill();
        
        // 如果是被高亮的球，添加紅色邊框
        if (this.highlighted) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            ctx.stroke();
        } else {
            // 正常邊框
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // 如果是花色球，添加條紋
        if (this.number > 7 && this.number !== 8) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, BALL_RADIUS * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db';
            ctx.fill();
        }
        
        // 繪製球號
        if (this.number !== 0) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.number.toString(), this.x, this.y);
        }
    }

    update() {
        // 更新球的位置
        this.x += this.dx;
        this.y += this.dy;
        
        // 檢查與球台邊緣的碰撞
        const cushionWidth = 20;  // 球台邊緣的寬度
        
        // 左右邊緣碰撞
        if (this.x - BALL_RADIUS < cushionWidth) {
            this.x = cushionWidth + BALL_RADIUS;
            this.dx = -this.dx * 0.8;  // 反彈時損失一些能量
        } else if (this.x + BALL_RADIUS > canvas.width - cushionWidth) {
            this.x = canvas.width - cushionWidth - BALL_RADIUS;
            this.dx = -this.dx * 0.8;
        }
        
        // 上下邊緣碰撞
        if (this.y - BALL_RADIUS < cushionWidth) {
            this.y = cushionWidth + BALL_RADIUS;
            this.dy = -this.dy * 0.8;
        } else if (this.y + BALL_RADIUS > canvas.height - cushionWidth) {
            this.y = canvas.height - cushionWidth - BALL_RADIUS;
            this.dy = -this.dy * 0.8;
        }
        
        // 摩擦力
        this.dx *= 0.99;
        this.dy *= 0.99;
        
        // 如果速度很小，就停止
        if (Math.abs(this.dx) < 0.01) this.dx = 0;
        if (Math.abs(this.dy) < 0.01) this.dy = 0;
    }
}

// 初始化球
function initializeBalls() {
    balls = [];
    
    // 創建白球
    cueBall = new Ball(200, canvas.height/2, 0);
    balls.push(cueBall);

    // 創建其他球
    const startX = canvas.width * 0.7;
    const startY = canvas.height/2;
    const rowSpacing = BALL_RADIUS * 2.5;
    const colSpacing = BALL_RADIUS * 2.2;

    // 球的排列順序（標準8球排列）
    const ballOrder = [1, 9, 10, 11, 8, 12, 13, 14, 15, 2, 3, 4, 5, 6, 7];
    let ballIndex = 0;

    // 創建三角形陣列
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
            if (ballIndex < ballOrder.length) {
                const x = startX + row * colSpacing;
                const y = startY - (row * rowSpacing)/2 + col * rowSpacing;
                const ballNumber = ballOrder[ballIndex];
                const ball = new Ball(x, y, ballNumber);
                balls.push(ball);
                ballIndex++;
            }
        }
    }
}

// 繪製球袋
function drawPockets() {
    ctx.fillStyle = '#000000';
    pockets.forEach(pocket => {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
}

// 繪製球台
function drawTable() {
    // 繪製外框陰影
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // 繪製外框底色
    ctx.fillStyle = '#8B4513';  // 深棕色
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 移除陰影效果
    ctx.restore();
    
    // 繪製木紋效果
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8B4513');    // 深棕色
    gradient.addColorStop(0.3, '#A0522D');  // 赭色
    gradient.addColorStop(0.7, '#8B4513');  // 深棕色
    gradient.addColorStop(1, '#A0522D');    // 赭色
    
    // 繪製外框的木紋
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, CUSHION_WIDTH); // 上框
    ctx.fillRect(0, canvas.height - CUSHION_WIDTH, canvas.width, CUSHION_WIDTH); // 下框
    ctx.fillRect(0, 0, CUSHION_WIDTH, canvas.height); // 左框
    ctx.fillRect(canvas.width - CUSHION_WIDTH, 0, CUSHION_WIDTH, canvas.height); // 右框
    
    // 添加裝飾紋路
    ctx.strokeStyle = '#654321';  // 深褐色
    ctx.lineWidth = 2;
    
    // 上下框的裝飾
    for (let x = CUSHION_WIDTH; x < canvas.width - CUSHION_WIDTH; x += 40) {
        // 上框裝飾
        ctx.beginPath();
        ctx.moveTo(x, 5);
        ctx.lineTo(x + 20, CUSHION_WIDTH - 5);
        ctx.stroke();
        
        // 下框裝飾
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 5);
        ctx.lineTo(x + 20, canvas.height - CUSHION_WIDTH + 5);
        ctx.stroke();
    }
    
    // 左右框的裝飾
    for (let y = CUSHION_WIDTH; y < canvas.height - CUSHION_WIDTH; y += 40) {
        // 左框裝飾
        ctx.beginPath();
        ctx.moveTo(5, y);
        ctx.lineTo(CUSHION_WIDTH - 5, y + 20);
        ctx.stroke();
        
        // 右框裝飾
        ctx.beginPath();
        ctx.moveTo(canvas.width - 5, y);
        ctx.lineTo(canvas.width - CUSHION_WIDTH + 5, y + 20);
        ctx.stroke();
    }
    
    // 添加邊框內側的光澤效果
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 3;
    ctx.strokeRect(CUSHION_WIDTH - 2, CUSHION_WIDTH - 2, 
                  canvas.width - (CUSHION_WIDTH - 2) * 2, 
                  canvas.height - (CUSHION_WIDTH - 2) * 2);
    
    // 添加邊框外側的深色邊緣
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    ctx.restore();
    
    // 繪製球台表面
    ctx.fillStyle = '#076324';  // 綠色
    ctx.fillRect(CUSHION_WIDTH, CUSHION_WIDTH, 
                canvas.width - 2 * CUSHION_WIDTH, 
                canvas.height - 2 * CUSHION_WIDTH);
                
    // 添加球台表面的紋理
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (let x = CUSHION_WIDTH; x < canvas.width - CUSHION_WIDTH; x += 20) {
        for (let y = CUSHION_WIDTH; y < canvas.height - CUSHION_WIDTH; y += 20) {
            if ((x + y) % 40 === 0) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(x, y, 10, 10);
            }
        }
    }
    ctx.restore();
}

// 初始化球袋位置
function initializePockets() {
    const cushionWidth = 20;
    pockets.push({ x: cushionWidth, y: cushionWidth });  // 左上
    pockets.push({ x: canvas.width/2, y: cushionWidth });  // 中上
    pockets.push({ x: canvas.width - cushionWidth, y: cushionWidth });  // 右上
    pockets.push({ x: cushionWidth, y: canvas.height - cushionWidth });  // 左下
    pockets.push({ x: canvas.width/2, y: canvas.height - cushionWidth });  // 中下
    pockets.push({ x: canvas.width - cushionWidth, y: canvas.height - cushionWidth });  // 右下
}

// 檢查球是否進袋
function checkPockets() {
    for (const pocket of pockets) {
        for (const ball of balls) {
            if (ball.inPocket) continue;  // 已經進袋的球跳過
            
            const dx = ball.x - pocket.x;
            const dy = ball.y - pocket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < POCKET_RADIUS) {
                ball.inPocket = true;
                if (ball === cueBall) {
                    // 白球進袋，重置位置
                    setTimeout(() => {
                        ball.x = 200;
                        ball.y = canvas.height/2;
                        ball.dx = 0;
                        ball.dy = 0;
                        ball.inPocket = false;
                    }, 1000);  // 延遲1秒重置白球
                    handlePocketedBall(ball);
                } else {
                    handlePocketedBall(ball);
                }
            }
        }
    }
}

// 處理進球
function handlePocketedBall(ball) {
    if (ball === cueBall) {
        messageElement.textContent = '白球進袋！換對手';
        gameState.pendingSwitch = true;  // 標記需要換人
        return;
    }

    const ballNumber = ball.number;
    
    // 如果還沒決定球種且不是新回合
    if (!gameState.player1Type && !gameState.player2Type && ballNumber !== 8 && !gameState.isNewTurn) {
        const isSolid = ballNumber <= 7;
        if (gameState.currentPlayer === 1) {
            gameState.player1Type = isSolid ? 'solid' : 'stripe';
            gameState.player2Type = isSolid ? 'stripe' : 'solid';
        } else {
            gameState.player2Type = isSolid ? 'solid' : 'stripe';
            gameState.player1Type = isSolid ? 'stripe' : 'solid';
        }

        gameState.firstBall = {
            number: ball.number,
            type: isSolid ? 'solid' : 'stripe',
            player: gameState.currentPlayer
        };

        const ballType = isSolid ? '實色球' : '花色球';
        messageElement.textContent = `玩家${gameState.currentPlayer}選擇${ballType}`;
        
        updatePlayerDisplay();
        gameState.lastPocketedBall = ball;
        return;
    }

    // 如果是新回合的進球，不判定對錯
    if (gameState.isNewTurn) {
        return;
    }

    // 判斷是否得分
    const currentPlayerType = gameState.currentPlayer === 1 ? gameState.player1Type : gameState.player2Type;
    const isCorrectBall = currentPlayerType && (
        (currentPlayerType === 'solid' && ballNumber <= 7) ||
        (currentPlayerType === 'stripe' && ballNumber > 8)
    );

    if (ballNumber === 8) {
        handleEightBall();
    } else if (isCorrectBall) {
        handleCorrectBall(ball);
        gameState.lastPocketedBall = ball;
    } else {
        // 記錄打錯的進球
        gameState.wrongBalls.push({
            number: ball.number,
            type: ball.number <= 7 ? 'solid' : 'stripe'
        });
        messageElement.textContent = '打錯球！換對手';
        gameState.pendingSwitch = true;  // 標記需要換人
    }
}

// 處理8號球
function handleEightBall() {
    const currentPlayerType = gameState.currentPlayer === 1 ? gameState.player1Type : gameState.player2Type;
    const otherPlayerType = gameState.currentPlayer === 1 ? gameState.player2Type : gameState.player1Type;
    
    // 檢查當前玩家是否已經打完所有的球
    const currentPlayerBalls = currentPlayerType === 'solid' ? [1,2,3,4,5,6,7] : [9,10,11,12,13,14,15];
    const remainingBalls = balls.filter(ball => !ball.inPocket && ball !== cueBall && ball.number !== 8);
    const currentPlayerRemainingBalls = remainingBalls.filter(ball => 
        currentPlayerType === 'solid' ? ball.number <= 7 : ball.number > 8
    );
    
    if (currentPlayerRemainingBalls.length > 0) {
        // 還有自己的球沒打完就打進8號球，輸了
        messageElement.textContent = `玩家${gameState.currentPlayer}還有球沒打完就打進8號球，玩家${gameState.currentPlayer === 1 ? 2 : 1}獲勝！`;
        gameState.gameOver = true;
        gameState.winner = gameState.currentPlayer === 1 ? 2 : 1;
    } else {
        // 已經打完所有的球，贏了
        messageElement.textContent = `玩家${gameState.currentPlayer}獲勝！`;
        gameState.gameOver = true;
        gameState.winner = gameState.currentPlayer;
    }
    
    // 添加勝利/失敗的視覺效果
    if (gameState.gameOver) {
        // 停止遊戲循環
        cancelAnimationFrame(gameLoop);
        
        // 繪製最終畫面
        drawFinalScreen();
    }
}

// 繪製最終畫面
function drawFinalScreen() {
    // 清空畫面
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 重新繪製球台
    drawTable();
    drawPockets();
    
    // 繪製所有球的最終位置
    for (const ball of balls) {
        if (!ball.inPocket) {
            ball.draw();
        }
    }
    
    // 添加漸變遮罩
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 設置文字樣式
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 繪製主標題背景
    const titleY = canvas.height / 2 - 30;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, titleY - 30, canvas.width, 60);
    
    // 繪製主標題
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    const winnerMessage = `玩家 ${gameState.winner} 獲勝！`;
    
    // 添加文字陰影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(winnerMessage, canvas.width / 2, titleY);
    
    // 重置陰影效果
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 繪製提示文字背景
    const subtitleY = canvas.height / 2 + 30;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, subtitleY - 15, canvas.width, 30);
    
    // 繪製提示文字
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('按下「新遊戲」開始新的遊戲', canvas.width / 2, subtitleY);
    
    // 繪製進球記錄
    drawWrongBalls();
}

// 處理正確進球
function handleCorrectBall(ball) {
    // 得分並記錄進球
    if (gameState.currentPlayer === 1) {
        gameState.score1++;
        gameState.pocketedBalls1.push(ball.number);
    } else {
        gameState.score2++;
        gameState.pocketedBalls2.push(ball.number);
    }
    gameState.lastPocketedBall = ball;
    messageElement.textContent = `玩家 ${gameState.currentPlayer} 進球得分！繼續回合`;
    updatePlayerDisplay();
}

// 檢查球的碰撞
function checkCollisions() {
    for (let i = 0; i < balls.length; i++) {
        const ball1 = balls[i];
        if (ball1.inPocket) continue;  // 跳過已進袋的球

        // 檢查與其他球的碰撞
        for (let j = i + 1; j < balls.length; j++) {
            const ball2 = balls[j];
            if (ball2.inPocket) continue;  // 跳過已進袋的球

            const dx = ball2.x - ball1.x;
            const dy = ball2.y - ball1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < BALL_RADIUS * 2) {
                // 首先分離球體，避免黏在一起
                const overlap = (BALL_RADIUS * 2 - distance) / 2;
                const normalX = dx / distance;
                const normalY = dy / distance;
                
                ball1.x -= normalX * overlap;
                ball1.y -= normalY * overlap;
                ball2.x += normalX * overlap;
                ball2.y += normalY * overlap;

                // 計算碰撞前的速度在法線方向上的分量
                const v1n = (ball1.dx * normalX + ball1.dy * normalY);
                const v2n = (ball2.dx * normalX + ball2.dy * normalY);

                // 計算碰撞後的速度（彈性碰撞）
                const v1nAfter = v2n;
                const v2nAfter = v1n;

                // 計算速度的切線分量（保持不變）
                const tangentX = -normalY;
                const tangentY = normalX;
                const v1t = ball1.dx * tangentX + ball1.dy * tangentY;
                const v2t = ball2.dx * tangentX + ball2.dy * tangentY;

                // 合成新的速度向量
                ball1.dx = v1nAfter * normalX + v1t * tangentX;
                ball1.dy = v1nAfter * normalY + v1t * tangentY;
                ball2.dx = v2nAfter * normalX + v2t * tangentX;
                ball2.dy = v2nAfter * normalY + v2t * tangentY;

                // 加入能量損失
                ball1.dx *= 0.95;
                ball1.dy *= 0.95;
                ball2.dx *= 0.95;
                ball2.dy *= 0.95;
            }
        }
    }
}

// 繪製瞄準輔助線
function drawGuideLine() {
    if (!isAiming) return;
    
    // 計算方向向量（從滑鼠位置指向白球）
    const dx = cueBall.x - aimEndX;
    const dy = cueBall.y - aimEndY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    // 計算單位向量
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    // 設置輔助線樣式
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // 從白球開始追蹤路徑
    let currentX = cueBall.x;
    let currentY = cueBall.y;
    let currentDirX = unitX;
    let currentDirY = unitY;
    let bounceCount = 0;
    const maxBounces = 3;  // 最多顯示3次反射
    
    while (bounceCount <= maxBounces) {
        // 計算與邊界的交點
        let nextX = currentX;
        let nextY = currentY;
        let minDist = 1000;  // 設置一個較大的初始值
        let hitWall = '';
        
        // 檢查與四個邊界的交點
        // 上邊界
        if (currentDirY < 0) {
            const t = (CUSHION_WIDTH - currentY) / currentDirY;
            const x = currentX + currentDirX * t;
            if (t > 0 && x > CUSHION_WIDTH && x < canvas.width - CUSHION_WIDTH) {
                if (t < minDist) {
                    minDist = t;
                    nextX = x;
                    nextY = CUSHION_WIDTH;
                    hitWall = 'top';
                }
            }
        }
        
        // 下邊界
        if (currentDirY > 0) {
            const t = (canvas.height - CUSHION_WIDTH - currentY) / currentDirY;
            const x = currentX + currentDirX * t;
            if (t > 0 && x > CUSHION_WIDTH && x < canvas.width - CUSHION_WIDTH) {
                if (t < minDist) {
                    minDist = t;
                    nextX = x;
                    nextY = canvas.height - CUSHION_WIDTH;
                    hitWall = 'bottom';
                }
            }
        }
        
        // 左邊界
        if (currentDirX < 0) {
            const t = (CUSHION_WIDTH - currentX) / currentDirX;
            const y = currentY + currentDirY * t;
            if (t > 0 && y > CUSHION_WIDTH && y < canvas.height - CUSHION_WIDTH) {
                if (t < minDist) {
                    minDist = t;
                    nextX = CUSHION_WIDTH;
                    nextY = y;
                    hitWall = 'left';
                }
            }
        }
        
        // 右邊界
        if (currentDirX > 0) {
            const t = (canvas.width - CUSHION_WIDTH - currentX) / currentDirX;
            const y = currentY + currentDirY * t;
            if (t > 0 && y > CUSHION_WIDTH && y < canvas.height - CUSHION_WIDTH) {
                if (t < minDist) {
                    minDist = t;
                    nextX = canvas.width - CUSHION_WIDTH;
                    nextY = y;
                    hitWall = 'right';
                }
            }
        }
        
        // 繪製當前線段
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
        
        // 如果沒有碰到邊界，結束循環
        if (hitWall === '') break;
        
        // 根據碰到的邊界計算反射方向
        if (hitWall === 'top' || hitWall === 'bottom') {
            currentDirY = -currentDirY;
        } else {
            currentDirX = -currentDirX;
        }
        
        // 更新當前位置
        currentX = nextX;
        currentY = nextY;
        bounceCount++;
    }
    
    ctx.restore();
    
    // 繪製力度指示器
    const force = Math.min(40, Math.max(5, distance * 0.2));  // 使用相同的力度計算
    const forceLine = Math.min(150, distance);  // 增加力度條的最大長度
    ctx.beginPath();
    ctx.moveTo(10, canvas.height - 20);
    ctx.lineTo(10 + forceLine, canvas.height - 20);
    ctx.strokeStyle = force > 30 ? 'red' : (force > 20 ? 'yellow' : 'white');  // 調整力度顏色的閾值
    ctx.lineWidth = 5;
    ctx.stroke();
}

// 繪製打錯的進球
function drawWrongBalls() {
    const wrongBallsCtx = wrongBallsCanvas.getContext('2d');
    wrongBallsCtx.clearRect(0, 0, wrongBallsCanvas.width, wrongBallsCanvas.height);

    // 設置背景
    wrongBallsCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    wrongBallsCtx.fillRect(0, 0, wrongBallsCanvas.width, wrongBallsCanvas.height);

    // 計算球的大小，使用畫布高度的 80% 作為球的直徑
    const ballRadius = wrongBallsCanvas.height * 0.4;
    const ballSpacing = ballRadius * 2.5;  // 球之間的間距
    
    // 計算需要顯示的總寬度
    let totalWidth = 0;
    if (gameState.firstBall) {
        totalWidth += ballRadius * 2 + 10;  // 首球寬度（包含邊框）
    }
    if (gameState.wrongBalls.length > 0) {
        if (gameState.firstBall) {
            totalWidth += ballRadius;  // 分隔線的間距
        }
        totalWidth += gameState.wrongBalls.length * ballSpacing - (ballRadius * 0.5);  // 打錯球的總寬度
    }
    
    // 計算起始 x 座標，使內容置中
    let startX = (wrongBallsCanvas.width - totalWidth) / 2;
    let currentX = startX;

    function drawBall(ball, x) {
        const centerX = x + ballRadius;
        const centerY = wrongBallsCanvas.height/2;
        
        // 繪製球的陰影
        wrongBallsCtx.beginPath();
        wrongBallsCtx.arc(centerX, centerY + 2, ballRadius, 0, Math.PI * 2);
        wrongBallsCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        wrongBallsCtx.fill();
        
        // 繪製球的基本顏色
        wrongBallsCtx.beginPath();
        wrongBallsCtx.arc(centerX, centerY, ballRadius, 0, Math.PI * 2);
        if (ball.type === 'solid') {
            wrongBallsCtx.fillStyle = '#ffdd00';  // 黃色底色
        } else {
            wrongBallsCtx.fillStyle = '#0095ff';  // 藍色底色
        }
        wrongBallsCtx.fill();
        
        // 為花色球添加白色邊框
        if (ball.type === 'stripe') {
            wrongBallsCtx.strokeStyle = 'white';
            wrongBallsCtx.lineWidth = 2;
            wrongBallsCtx.stroke();
        }
        
        // 繪製球號
        wrongBallsCtx.fillStyle = 'white';
        wrongBallsCtx.font = 'bold ' + (ballRadius * 0.8) + 'px Arial';
        wrongBallsCtx.textAlign = 'center';
        wrongBallsCtx.textBaseline = 'middle';
        wrongBallsCtx.fillText(ball.number.toString(), centerX, centerY);
    }

    // 繪製第一顆決定球種的進球（如果有）
    if (gameState.firstBall) {
        drawBall(gameState.firstBall, currentX);
        currentX += ballRadius * 2 + 10;
    }
    
    // 繪製打錯的球
    if (gameState.wrongBalls.length > 0) {
        // 添加分隔線（如果有第一顆球）
        if (gameState.firstBall) {
            wrongBallsCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            wrongBallsCtx.fillRect(currentX - ballRadius/2, 10, 2, wrongBallsCanvas.height - 20);
            currentX += ballRadius/2;
        }

        gameState.wrongBalls.forEach(ball => {
            drawBall(ball, currentX);
            currentX += ballSpacing;
        });
    }
}

// 繪製打錯球種的提示
function drawWrongBallType() {
    if (!gameState.wrongBallType || gameState.gameOver) return;
    
    const startX = canvas.width / 2 - 150;  // 從中間開始往左150像素
    const y = canvas.height - 60;  // 在底部上方60像素處
    const spacing = 30;  // 球之間的間距
    
    // 繪製提示文字
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('不能打的球種：', startX - 10, y);
    
    // 繪製示例球
    const numbers = gameState.wrongBallType === 'solid' ? [1, 2, 3, 4, 5] : [9, 10, 11, 12, 13];
    numbers.forEach((number, index) => {
        const x = startX + index * spacing;
        
        // 繪製球
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = gameState.wrongBallType === 'solid' ? '#FFD700' : '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 如果是花色球，添加條紋
        if (gameState.wrongBallType === 'stripe') {
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db';
            ctx.fill();
        }
        
        // 繪製球號
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number.toString(), x, y);
    });
}

// 檢查是否所有球都停止運動
function isStopped() {
    const stopped = balls.every(ball => Math.abs(ball.dx) < 0.01 && Math.abs(ball.dy) < 0.01);
    if (stopped && !canShoot) {
        canShoot = true;
        // 當所有球停止時，檢查是否需要換人
        if (gameState.pendingSwitch) {
            switchPlayer();
            gameState.switchedPlayer = true;
            gameState.pendingSwitch = false;
            gameState.isNewTurn = true;  // 標記為新回合
            messageElement.textContent = '換對手';
        } else if (!gameState.lastPocketedBall && !gameState.switchedPlayer) {
            messageElement.textContent = '未進球，換對手';
            switchPlayer();
            gameState.switchedPlayer = true;
            gameState.isNewTurn = true;  // 標記為新回合
        }
    }
    return stopped;
}

// 繪製球桿
function drawCue() {
    if (canShoot && !gameState.gameOver) {
        const dx = mouse.x - cueBall.x;
        const dy = mouse.y - cueBall.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 計算球桿的角度
        const angle = Math.atan2(dy, dx);
        
        // 設置球桿的長度和寬度
        const cueLength = 150;
        const cueWidth = 4;
        
        // 計算球桿的起點（從滑鼠位置開始）
        const startX = mouse.x;
        const startY = mouse.y;
        
        // 計算球桿的終點（朝向白球的反方向延伸）
        const endX = mouse.x + cueLength * Math.cos(angle);
        const endY = mouse.y + cueLength * Math.sin(angle);
        
        // 繪製球桿
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#8B4513';  // 深棕色
        ctx.lineWidth = cueWidth;
        ctx.stroke();
        
        // 繪製球桿頭（在起點附近）
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        const tipLength = 20;
        const tipX = startX + tipLength * Math.cos(angle);
        const tipY = startY + tipLength * Math.sin(angle);
        ctx.lineTo(tipX, tipY);
        ctx.strokeStyle = '#F5DEB3';  // 淺棕色
        ctx.lineWidth = cueWidth + 1;
        ctx.stroke();
    }
}

// 滑鼠事件監聽器
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousedown', e => {
    if (!canShoot || gameState.gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 檢查是否點擊到白球
    const dx = mouseX - cueBall.x;
    const dy = mouseY - cueBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= BALL_RADIUS) {
        isAiming = true;
        aimStartX = mouseX;
        aimStartY = mouseY;
    }
});

canvas.addEventListener('mousemove', e => {
    if (!isAiming || !canShoot || gameState.gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    aimEndX = e.clientX - rect.left;
    aimEndY = e.clientY - rect.top;
});

canvas.addEventListener('mouseup', e => {
    if (!isAiming || !canShoot || gameState.gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    // 計算擊球方向和力度（從滑鼠位置指向白球）
    const dx = cueBall.x - endX;
    const dy = cueBall.y - endY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 增加力度範圍
    const minForce = 5;
    const maxForce = 40;
    const forceFactor = 0.2;
    const force = Math.min(maxForce, Math.max(minForce, distance * forceFactor));
    
    // 應用力度到白球（保持相同的方向）
    cueBall.dx = (dx / distance) * force;
    cueBall.dy = (dy / distance) * force;
    
    isAiming = false;
    gameState.lastPocketedBall = null;  // 重置最後進球狀態
    gameState.switchedPlayer = false;   // 重置換人狀態
    gameState.isNewTurn = false;  // 新回合開始時重置標記
    gameState.pendingSwitch = false;  // 重置待處理的換人
});

// 按鈕事件監聽器
document.getElementById('newGameBtn').addEventListener('click', () => {
    // 重置遊戲狀態
    resetGameState();
    
    // 重新初始化遊戲
    initGame();
    
    // 清除訊息
    messageElement.textContent = '新遊戲開始！';
    
    // 重新開始遊戲循環
    gameLoop();
});

document.getElementById('resetBallBtn').addEventListener('click', () => {
    if (canShoot && !gameState.gameOver) {
        cueBall.x = 200;
        cueBall.y = canvas.height/2;
        cueBall.dx = 0;
        cueBall.dy = 0;
        cueBall.inPocket = false;
    }
});

// 重置遊戲狀態
function resetGameState() {
    gameState.currentPlayer = 1;
    gameState.score1 = 0;
    gameState.score2 = 0;
    gameState.player1Type = null;
    gameState.player2Type = null;
    gameState.pocketedBalls1 = [];
    gameState.pocketedBalls2 = [];
    gameState.lastPocketedBall = null;
    gameState.switchedPlayer = false;
    gameState.gameOver = false;
    gameState.winner = null;
    gameState.wrongBalls = [];  // 清空打錯的進球記錄
    gameState.firstBall = null;  // 清空第一顆球記錄
    gameState.isNewTurn = false;  // 清空新回合標記
    gameState.pendingSwitch = false;  // 清空待處理的換人
}

// 繪製進球記錄
function drawPocketedBalls(ctx, x, y, numbers) {
    const radius = 10;  // 小球半徑
    const spacing = 25; // 球之間的間距
    
    numbers.sort((a, b) => a - b).forEach((number, index) => {
        const ballX = x + index * spacing;
        
        // 繪製球
        ctx.beginPath();
        ctx.arc(ballX, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = number <= 7 ? '#FFD700' : '#FFFFFF';  // 實色球金色，花色球白色
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 繪製球號
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number.toString(), ballX, y);
        
        // 如果是花色球，繪製條紋
        if (number > 7 && number !== 8) {
            ctx.beginPath();
            ctx.arc(ballX, y, radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db';
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(number.toString(), ballX, y);
        }
        
        // 如果是8號球，特別處理
        if (number === 8) {
            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.fillText('8', ballX, y);
        }
    });
}

// 繪製打錯球種的提示
function drawWrongBallType() {
    if (!gameState.wrongBallType || gameState.gameOver) return;
    
    const startX = canvas.width / 2 - 150;  // 從中間開始往左150像素
    const y = canvas.height - 60;  // 在底部上方60像素處
    const spacing = 30;  // 球之間的間距
    
    // 繪製提示文字
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('不能打的球種：', startX - 10, y);
    
    // 繪製示例球
    const numbers = gameState.wrongBallType === 'solid' ? [1, 2, 3, 4, 5] : [9, 10, 11, 12, 13];
    numbers.forEach((number, index) => {
        const x = startX + index * spacing;
        
        // 繪製球
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = gameState.wrongBallType === 'solid' ? '#FFD700' : '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 如果是花色球，添加條紋
        if (gameState.wrongBallType === 'stripe') {
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db';
            ctx.fill();
        }
        
        // 繪製球號
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number.toString(), x, y);
    });
}

// 更新玩家顯示
function updatePlayerDisplay() {
    requestAnimationFrame(() => {
        // 更新分數
        score1Element.textContent = gameState.score1;
        score2Element.textContent = gameState.score2;
        
        // 更新球種
        ballType1Element.textContent = gameState.player1Type ? 
            (gameState.player1Type === 'solid' ? '實色球' : '花色球') : '未定';
        ballType2Element.textContent = gameState.player2Type ? 
            (gameState.player2Type === 'solid' ? '實色球' : '花色球') : '未定';
        
        // 創建離屏 canvas 來繪製進球記錄
        const offscreenCanvas1 = document.createElement('canvas');
        const offscreenCanvas2 = document.createElement('canvas');
        const width = Math.max(gameState.pocketedBalls1.length, gameState.pocketedBalls2.length) * 25 + 20;
        offscreenCanvas1.width = width;
        offscreenCanvas1.height = 30;
        offscreenCanvas2.width = width;
        offscreenCanvas2.height = 30;
        
        // 清除原有內容
        pocketedBalls1Element.innerHTML = '';
        pocketedBalls2Element.innerHTML = '';
        
        // 繪製進球記錄
        if (gameState.pocketedBalls1.length > 0) {
            const ctx1 = offscreenCanvas1.getContext('2d');
            drawPocketedBalls(ctx1, 15, 15, gameState.pocketedBalls1);
            pocketedBalls1Element.appendChild(offscreenCanvas1);
        } else {
            pocketedBalls1Element.textContent = '無';
        }
        
        if (gameState.pocketedBalls2.length > 0) {
            const ctx2 = offscreenCanvas2.getContext('2d');
            drawPocketedBalls(ctx2, 15, 15, gameState.pocketedBalls2);
            pocketedBalls2Element.appendChild(offscreenCanvas2);
        } else {
            pocketedBalls2Element.textContent = '無';
        }
        
        // 更新當前玩家狀態
        player1Element.classList.toggle('active', gameState.currentPlayer === 1);
        player2Element.classList.toggle('active', gameState.currentPlayer === 2);
    });
}

// 切換玩家
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    gameState.switchedPlayer = true;
    // 更新不能打的球種
    const currentPlayerType = gameState.currentPlayer === 1 ? gameState.player1Type : gameState.player2Type;
    gameState.wrongBallType = currentPlayerType === 'solid' ? 'stripe' : 'solid';
    updatePlayerDisplay();
}

// 遊戲主循環
function gameLoop() {
    // 如果遊戲結束，不再更新
    if (gameState.gameOver) {
        drawFinalScreen();
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawTable();
    drawPockets();
    
    // 更新和繪製所有球
    let moving = false;
    for (const ball of balls) {
        if (!ball.inPocket) {
            if (Math.abs(ball.dx) > 0.01 || Math.abs(ball.dy) > 0.01) {
                moving = true;
            }
            ball.update();
            ball.draw();
        }
    }
    
    // 檢查碰撞和口袋
    if (moving) {
        checkCollisions();
        checkPockets();
        canShoot = false;
    } else if (!canShoot) {
        canShoot = true;
        // 當所有球停止時
        if (gameState.pendingSwitch) {
            // 如果有待處理的換人，執行換人
            switchPlayer();
            gameState.switchedPlayer = true;
            gameState.pendingSwitch = false;
            gameState.isNewTurn = true;  // 標記為新回合
            messageElement.textContent = '換對手';
        } else if (!gameState.lastPocketedBall && !gameState.switchedPlayer) {
            // 如果沒有進球且還沒換人，則換人
            messageElement.textContent = '未進球，換對手';
            switchPlayer();
            gameState.switchedPlayer = true;
            gameState.isNewTurn = true;  // 標記為新回合
        }
    }
    
    // 確保在可以射擊且正在瞄準時顯示輔助線
    if (canShoot && isAiming && !gameState.gameOver) {
        drawGuideLine();
    }
    
    // 只在不移動時繪製球桿
    if (!moving && !gameState.gameOver) {
        drawCue();
    }
    
    // 繪製進球記錄
    drawWrongBalls();
    
    // 如果遊戲還沒結束，繼續遊戲循環
    if (!gameState.gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// 開始遊戲
function initGame() {
    // 設置主畫布尺寸
    canvas.width = 800;
    canvas.height = 400;
    
    // 設置打錯球記錄畫布的尺寸
    wrongBallsCanvas.width = 600;
    wrongBallsCanvas.height = 40;
    
    // 初始化球的位置
    initializeBalls();
    
    // 初始化球袋
    initializePockets();
    
    // 重置遊戲狀態
    resetGameState();
    
    // 開始遊戲循環
    gameLoop();
}