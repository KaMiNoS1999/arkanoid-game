// === UI.js : Affichage Arkanoid ===

export function drawScoreUI(scoreElement, score) {
    scoreElement.textContent = score;
}

export function drawLivesUI(livesElement, lives) {
    livesElement.textContent = lives;
}

export function drawBall(ctx, ball, radius = 10) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.closePath();
}

export function drawPaddle(ctx, canvas, paddleX, paddleWidth, paddleHeight) {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.closePath();
}

export function drawBricks(ctx, bricks, brickWidth, brickHeight) {
    bricks.forEach(col => col.forEach(b => {
        if (b.status) {
            ctx.beginPath();
            ctx.rect(b.x, b.y, brickWidth, brickHeight);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
        }
    }));
}

export function drawPowerUps(ctx, powerUps) {
    powerUps.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
    });
}
