// === Arkanoid Game Script (Gameplay uniquement, UI dans ui.js) ===

import {
    drawScoreUI,
    drawLivesUI,
    drawBall,
    drawPaddle,
    drawBricks,
    drawPowerUps,
    displayVersion
} from './ui.js';

import {
    getCurrentLevel,
    nextLevel,
    resetLevels
} from './level_manager.js';

import { GAME_VERSION } from './version.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

['Pause', 'Rejouer'].forEach((text, i) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.margin = '10px';
    btn.style.marginLeft = i ? '10px' : '0';
    document.body.appendChild(btn);
    if (text === 'Pause') btn.addEventListener('click', () => {
        gamePaused = !gamePaused;
        btn.textContent = gamePaused ? 'Reprendre' : 'Pause';
        if (!gamePaused) gameLoop();
    });
    if (text === 'Rejouer') btn.addEventListener('click', () => {
        resetLevels();
        initializeGame();
        gameLoop();
    });
});

if (!canvas || !ctx || !scoreElement || !livesElement) {
    alert("Erreur : canvas ou élément manquant");
    throw new Error("Initialisation échouée");
}

let ballRadius = 10, dx, dy, x, y;
let paddleWidth = 80, paddleHeight = 12, paddleX, paddleSpeed = 7;
let rightPressed = false, leftPressed = false;
let brickWidth = 60, brickHeight = 20;
const brickPadding = 10, brickOffsetTop = 40, brickOffsetLeft = 30;
let bricks = [], powerUps = [], score = 0, lives = 3;
let gameRunning = false, gamePaused = false;
const balls = [];

// Niveau dynamique
let currentBrickColor, currentBrickRowCount, currentBrickColumnCount, currentBallSpeed, currentPowerUpChance;

const powerUpTypes = [
    { type: 'expandPaddle', color: 'green' },
    { type: 'extraBall', color: 'green' },
    { type: 'slowBall', color: 'green' },
    { type: 'fastBall', color: 'green' },
    { type: 'shrinkPaddle', color: 'red', isMalus: true }
];

function initializeGame() {
    const level = getCurrentLevel();

    canvas.width = 1200;
    canvas.height = 800;
    score = 0;
    lives = 3;
    balls.length = 0;

    currentBrickColor = level.brickColor;
    currentBrickRowCount = level.brickRowCount;
    currentBrickColumnCount = level.brickColumnCount;
    currentBallSpeed = level.ballSpeed;
    currentPowerUpChance = level.powerUpChance;

    addBall();
    paddleX = (canvas.width - paddleWidth) / 2;
    rightPressed = leftPressed = false;
    powerUps = [];

    initializeBricks();
    drawScoreUI(scoreElement, score);
    drawLivesUI(livesElement, lives);
    gameRunning = true;
    gamePaused = false;
}

function addBall() {
    balls.push({ x: canvas.width / 2, y: canvas.height - 30, dx: currentBallSpeed, dy: -currentBallSpeed });
}

function updatePaddlePosition() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    else if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;
}

function updateBalls() {
    balls.forEach((ball, index) => {
        ball.x += ball.dx; ball.y += ball.dy;

        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) ball.dx = -ball.dx;
        if (ball.y + ball.dy < ballRadius) ball.dy = -ball.dy;
        else if (ball.y + ball.dy > canvas.height - ballRadius) {
            if (ball.x > paddleX && ball.x < paddleX + paddleWidth) ball.dy = -ball.dy;
            else balls.splice(index, 1);
        }
    });
    if (!balls.length) {
        if (--lives === 0) return alertEnd("Game Over !");
        addBall();
        drawLivesUI(livesElement, lives);
    }
}

function updatePowerUps() {
    powerUps = powerUps.filter(p => {
        p.y += 2;
        if (p.y + 8 >= canvas.height - paddleHeight && p.x > paddleX && p.x < paddleX + paddleWidth) {
            applyPowerUp(p.type);
            return false;
        }
        return p.y <= canvas.height;
    });
}

function collisionDetection() {
    let bricksLeft = 0;
    bricks.forEach(col => col.forEach(b => {
        if (b.status) {
            bricksLeft++;
            balls.forEach(ball => {
                if (ball.x + ballRadius > b.x && ball.x - ballRadius < b.x + brickWidth &&
                    ball.y + ballRadius > b.y && ball.y - ballRadius < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    drawScoreUI(scoreElement, score);
                    if (Math.random() < currentPowerUpChance) {
                        let p = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                        powerUps.push({ x: b.x + brickWidth / 2, y: b.y, ...p });
                    }
                }
            });
        }
    }));
    if (bricksLeft === 0) {
        if (nextLevel()) {
            alert("Niveau suivant !");
            initializeGame();
        } else {
            alertEnd("Bravo ! Vous avez terminé tous les niveaux !");
        }
    }
}

function applyPowerUp(type) {
    const timer = 5000;
    if (type === 'expandPaddle') { paddleWidth = 120; setTimeout(() => paddleWidth = 80, timer); }
    else if (type === 'shrinkPaddle') { paddleWidth = 50; setTimeout(() => paddleWidth = 80, timer); }
    else if (type === 'slowBall') { balls.forEach(b => { b.dx *= 0.7; b.dy *= 0.7; }); setTimeout(() => balls.forEach(b => { b.dx *= 1.3; b.dy *= 1.3; }), timer); }
    else if (type === 'fastBall') { balls.forEach(b => { b.dx *= 1.5; b.dy *= 1.5; }); setTimeout(() => balls.forEach(b => { b.dx *= 0.67; b.dy *= 0.67; }), timer); }
    else if (type === 'extraBall') addBall();
}

function alertEnd(msg) {
    alert(msg);
    gameRunning = false;
}

function initializeBricks() {
    const totalPadding = (currentBrickColumnCount - 1) * brickPadding;
    const dynamicBrickWidth = (canvas.width - 2 * brickOffsetLeft - totalPadding) / currentBrickColumnCount;
    const offsetLeft = (canvas.width - (currentBrickColumnCount * (dynamicBrickWidth + brickPadding) - brickPadding)) / 2;

    bricks = Array.from({ length: currentBrickColumnCount }, (_, c) =>
        Array.from({ length: currentBrickRowCount }, (_, r) => ({
            x: offsetLeft + c * (dynamicBrickWidth + brickPadding),
            y: brickOffsetTop + r * (brickHeight + brickPadding),
            status: 1
        }))
    );

    brickWidth = dynamicBrickWidth;
}

document.addEventListener("keydown", e => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", e => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});
canvas.addEventListener("mousemove", e => {
    const relX = e.clientX - canvas.getBoundingClientRect().left;
    if (relX > 0 && relX < canvas.width) paddleX = relX - paddleWidth / 2;
});

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks(ctx, bricks, brickWidth, brickHeight, currentBrickColor);
    drawPaddle(ctx, canvas, paddleX, paddleWidth, paddleHeight);
    drawPowerUps(ctx, powerUps);
    balls.forEach(ball => drawBall(ctx, ball, ballRadius));
    updatePaddlePosition();
    updateBalls();
    updatePowerUps();
    collisionDetection();
    requestAnimationFrame(gameLoop);
}

initializeGame();
gameLoop();

// 🎮 Affichage de la version
window.addEventListener("DOMContentLoaded", () => {
    displayVersion(GAME_VERSION);
});
