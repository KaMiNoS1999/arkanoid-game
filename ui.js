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

// === Version améliorée de drawBricks ===
export function drawBricks(ctx, bricks, brickWidth, brickHeight, defaultColor) {
    bricks.forEach(column => {
        column.forEach(brick => {
            if (brick.status) {
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
                ctx.fillStyle = brick.color || defaultColor;
                ctx.fill();
                ctx.closePath();
            }
        });
    });
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

// === Ajout de la fonction displayVersion ===
export function displayVersion(version) {
    const versionTag = document.createElement("div");
    versionTag.textContent = `Version ${version}`;
    versionTag.id = "game-version";
    versionTag.style.position = "fixed";
    versionTag.style.bottom = "10px";
    versionTag.style.left = "20px";
    versionTag.style.fontSize = "0.9em";
    versionTag.style.color = "#000";
    versionTag.style.fontFamily = "monospace";
    versionTag.style.opacity = "0.8";
    versionTag.style.zIndex = "10";
    document.body.appendChild(versionTag);
}

// === Ajout de la fonction showGameOverMenu ===
export function showGameOverMenu(onRestart) {
    const overlay = document.createElement("div");
    overlay.id = "game-over-overlay";
    Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontSize: "3em",
        fontFamily: "monospace",
        zIndex: "9999"
    });

    const message = document.createElement("div");
    message.textContent = "🎮 GAME OVER";

    const btn = document.createElement("button");
    btn.textContent = "Rejouer";
    Object.assign(btn.style, {
        marginTop: "20px",
        padding: "10px 30px",
        fontSize: "1em",
        cursor: "pointer"
    });
    btn.onclick = () => {
        overlay.remove();
        onRestart();
    };

    overlay.appendChild(message);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
}

