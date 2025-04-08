// === Arkanoid Game Script (Gameplay uniquement, UI dans ui.js) ===

import {
    drawScoreUI,
    drawLivesUI,
    drawBall,
    drawPaddle,
    drawBricks,
    drawPowerUps,
    displayVersion,
    showGameOverMenu,
    showVictoryMenu
} from './ui.js';

import {
    getCurrentLevel,
    nextLevel,
    resetLevels
} from './level_manager.js';

import { GAME_VERSION } from './version.js';
import { initUpgradeMenu, addCurrency } from './ui_argent_fonction_argent.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

const ballRadius = 10;
let paddleWidth = 80;
const paddleHeight = 12;
let paddleX;
const paddleSpeed = 7;

let rightPressed = false, leftPressed = false;
let brickWidth = 60, brickHeight = 20;
const brickPadding = 10, brickOffsetTop = 40, brickOffsetLeft = 30;
let bricks = [], powerUps = [], score = 0, lives = 3;
let gameRunning = false, gamePaused = false;
const balls = [];

let currentBrickColor, currentBrickRowCount, currentBrickColumnCount, currentBallSpeed, currentPowerUpChance;
let activePowerUps = [];

const powerUpTypes = [
    { type: 'expandPaddle', color: 'green' },
    { type: 'extraBall', color: 'green' },
    { type: 'slowBall', color: 'green' },
    { type: 'fastBall', color: 'yellow' },
    { type: 'shrinkPaddle', color: 'red', isMalus: true }
];

function handleUpgrade(id) {
    if (id === 'expandPaddle') paddleWidth = 120;
    else if (id === 'extraLife') lives++;
    else if (id === 'multiBall') addBall(false);
}

['Pause', 'Rejouer'].forEach((text, i) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.margin = '10px';
    btn.style.marginLeft = i ? '10px' : '0';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => {
        if (text === 'Pause') {
            gamePaused = !gamePaused;
            btn.textContent = gamePaused ? 'Reprendre' : 'Pause';
            if (!gamePaused) gameLoop();
        } else {
            resetLevels();
            initializeGame();
            gameLoop();
        }
    });
});

if (!canvas || !ctx || !scoreElement || !livesElement) {
    alert("Erreur : canvas ou élément manquant");
    throw new Error("Initialisation échouée");
}

function initializeGame() {
    const level = getCurrentLevel();

    canvas.width = 1200;
    canvas.height = 800;
    score = 0;
    lives = 3;
    balls.length = 0;
    activePowerUps = [];

    ({
        brickColor: currentBrickColor, brickRowCount: currentBrickRowCount,
        brickColumnCount: currentBrickColumnCount, ballSpeed: currentBallSpeed,
        powerUpChance: currentPowerUpChance
    } = level);

    addBall(true);
    paddleX = (canvas.width - paddleWidth) / 2;
    rightPressed = leftPressed = false;
    powerUps = [];

    initializeBricks();
    drawScoreUI(scoreElement, score);
    drawLivesUI(livesElement, lives);
    gameRunning = true;
    gamePaused = false;
}

function addBall(isMain = false) {
    balls.push({
        x: canvas.width / 2,
        y: canvas.height - 30,
        dx: currentBallSpeed,
        dy: -currentBallSpeed,
        main: isMain
    });
}

function updatePaddlePosition() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    else if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;
}

function updateBalls() {
    balls.forEach((ball, i) => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) ball.dx = -ball.dx;
        if (ball.y + ball.dy < ballRadius) ball.dy = -ball.dy;
        else if (ball.y + ball.dy > canvas.height - ballRadius) {
            if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
            } else {
                if (ball.main) {
                    balls.splice(i, 1);
                    if (--lives === 0) {
                        gameRunning = false;
                        showGameOverMenu(() => {
                            resetLevels();
                            initializeGame();
                            gameLoop();
                        });
                        return;
                    }
                    paddleWidth = 80;
                    activePowerUps = [];
                    balls.length = 0;
                    addBall(true);
                    drawLivesUI(livesElement, lives);
                } else {
                    balls.splice(i, 1);
                }
            }
        }
    });
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
                    addCurrency(1);
                    drawScoreUI(scoreElement, score);
                    if (Math.random() < currentPowerUpChance) {
                        const p = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
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
            gameRunning = false;
            showVictoryMenu(() => {
                resetLevels();
                initializeGame();
                gameLoop();
            });
        }
    }
}

function applyPowerUp(type) {
    if (type === 'expandPaddle') paddleWidth = 120;
    else if (type === 'shrinkPaddle') paddleWidth = 50;
    else if (type === 'slowBall') balls.forEach(b => { b.dx *= 0.7; b.dy *= 0.7; });
    else if (type === 'fastBall') balls.forEach(b => { b.dx *= 1.5; b.dy *= 1.5; });
    else if (type === 'extraBall') return addBall(false);

    if (!activePowerUps.includes(type)) activePowerUps.push(type);
}

function alertEnd(msg) {
    alert(msg);
    gameRunning = false;
}

function initializeBricks() {
    const totalPadding = (currentBrickColumnCount - 1) * brickPadding;
    const dynamicBrickWidth = (canvas.width - 2 * brickOffsetLeft - totalPadding) / currentBrickColumnCount;
    const offsetLeft = (canvas.width - (currentBrickColumnCount * (dynamicBrickWidth + brickPadding) - brickPadding)) / 2;
    const colors = ['#ff595e', '#ff924c', '#ffca3a', '#c4f24b', '#56e39f'];

    bricks = Array.from({ length: currentBrickColumnCount }, (_, c) =>
        Array.from({ length: currentBrickRowCount }, (_, r) => ({
            x: offsetLeft + c * (dynamicBrickWidth + brickPadding),
            y: brickOffsetTop + r * (brickHeight + brickPadding),
            status: 1,
            color: colors[r % colors.length]
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
    balls.forEach(ball => {
        if (ball.main) ctx.fillStyle = '#00f';
        else ctx.fillStyle = '#fff';
        drawBall(ctx, ball, ballRadius);
    });
    updatePaddlePosition();
    updateBalls();
    updatePowerUps();
    collisionDetection();
    requestAnimationFrame(gameLoop);
}

initializeGame();
gameLoop();

window.addEventListener("DOMContentLoaded", () => {
    displayVersion(GAME_VERSION);
    initUpgradeMenu(handleUpgrade);
});