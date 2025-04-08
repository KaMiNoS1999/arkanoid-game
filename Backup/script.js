// --- Références aux éléments HTML ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // Contexte pour dessiner en 2D
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

// --- Vérification Canvas ---
if (!canvas || !ctx || !scoreElement || !livesElement) {
    console.error("Impossible d'initialiser le canvas ou les éléments de score/vies. Vérifiez les ID dans le HTML.");
    alert("Erreur : Impossible de démarrer le jeu. Un élément requis n'est pas trouvé.");
    throw new Error('Required HTML element not found'); // Arrête le script
}

// --- Variables Globales du Jeu ---

// Balle
let ballRadius = 10;
let x, y, dx, dy; // Positions et vitesses seront initialisées

// Raquette (Paddle)
let paddleHeight = 12;
let paddleWidth = 80;
let paddleX; // Sera initialisé
let paddleSpeed = 7;

// Contrôles de la raquette
let rightPressed = false;
let leftPressed = false;

// Briques
let brickRowCount = 4; // Nombre de rangées
let brickColumnCount = 6; // Nombre de colonnes
let brickWidth = 60;
let brickHeight = 20;
let brickPadding = 10; // Espace entre les briques
let brickOffsetTop = 40; // Marge en haut
let brickOffsetLeft = 30; // Marge à gauche
let bricks = []; // Tableau pour stocker les briques

// État du jeu
let score = 0;
let lives = 3;
let gameRunning = false; // Pour savoir si le jeu a démarré

// --- Initialisation (Position Balle/Raquette, Briques, Affichage) ---
function initializeGame() {
    score = 0;
    lives = 3;
    x = canvas.width / 2; // Position X initiale (centre)
    y = canvas.height - 30; // Position Y initiale (juste au-dessus de la raquette)
    dx = 3; // Vitesse horizontale (pixels par frame)
    dy = -3; // Vitesse verticale (pixels par frame)
    paddleX = (canvas.width - paddleWidth) / 2; // Position X initiale (centre)
    rightPressed = false;
    leftPressed = false;
    initializeBricks();
    drawScore();
    drawLives();
    gameRunning = true; // Marque le jeu comme prêt/en cours
    console.log("Jeu initialisé.");
}

function initializeBricks() {
    bricks = []; // Réinitialise le tableau
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            // status: 1 = visible, 0 = cassée
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
    console.log("Briques initialisées.");
}

// --- Écouteurs d'événements (Contrôles) ---
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if (!gameRunning) return; // Ne pas prendre d'input si le jeu n'est pas lancé (ex: après game over)
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (!gameRunning) return;
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    if (!gameRunning) return;
    // Calcule la position X relative au canvas
    const rect = canvas.getBoundingClientRect(); // Prend en compte le padding/border de la page
    const root = document.documentElement;
    const relativeX = e.clientX - rect.left - root.scrollLeft;

    if (relativeX > 0 && relativeX < canvas.width) {
        // Centre la raquette sur la souris, en la gardant dans les limites du canvas
        paddleX = relativeX - paddleWidth / 2;
        if (paddleX < 0) {
            paddleX = 0;
        }
        if (paddleX + paddleWidth > canvas.width) {
            paddleX = canvas.width - paddleWidth;
        }
    }
}

// --- Fonctions de Dessin ---

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#e63946"; // Rouge vif
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#457b9d"; // Bleu acier
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) { // Dessine seulement les briques actives
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX; // Stocke la position pour la détection de collision
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                // Alternance simple de couleurs par rangée
                ctx.fillStyle = (r % 2 === 0) ? "#1d3557" : "#fca311"; // Bleu foncé / Orange
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    if (scoreElement) scoreElement.textContent = score;
}

function drawLives() {
    if (livesElement) livesElement.textContent = lives;
}

// --- Logique de Collision ---

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) { // Vérifie seulement si la brique est active
                // Conditions de collision (la balle touche la brique)
                if (
                    x + ballRadius > b.x && // Balle dépasse bord gauche brique
                    x - ballRadius < b.x + brickWidth && // Balle avant bord droit brique
                    y + ballRadius > b.y && // Balle dépasse bord haut brique
                    y - ballRadius < b.y + brickHeight // Balle au-dessus bord bas brique
                ) {
                    dy = -dy; // Inverse direction verticale
                    b.status = 0; // La brique est cassée
                    score++;
                    drawScore(); // Met à jour l'affichage du score

                    // Vérifier si toutes les briques sont cassées (condition de victoire)
                    if (score === brickRowCount * brickColumnCount) {
                        alert("BRAVO, VOUS AVEZ GAGNÉ ! Score: " + score);
                        gameRunning = false; // Arrête la boucle de jeu
                        // Optionnel: proposer de rejouer au lieu de recharger direct
                        document.location.reload(); // Recharge pour rejouer
                    }
                    return; // Sortir après une collision pour éviter multi-collisions / bugs
                }
            }
        }
    }
}

// --- Fonctions de Mise à Jour (Logique principale) ---

function updateBallPosition() {
    // Collision murs gauche/droite
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    // Collision mur haut
    if (y + dy < ballRadius) {
        dy = -dy;
    }
    // Collision mur bas / raquette
    else if (y + dy > canvas.height - ballRadius - paddleHeight / 2) { // Ajustement pour mieux détecter près du bas
        // Est-ce que la balle touche la raquette ? (Vérifier quand la balle est au niveau de la raquette)
        if (y + dy > canvas.height - ballRadius - paddleHeight && x > paddleX && x < paddleX + paddleWidth) {
            // Collision avec la raquette
            dy = -dy;
            // Rendre le rebond un peu moins prévisible
            // let collidePoint = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            // dx = collidePoint * 5; // Influence l'angle de rebond
        }
        // Vérifier si la balle est complètement sortie par le bas
        else if (y + dy > canvas.height - ballRadius) {
            // La balle touche le bas SANS toucher la raquette -> Perdu une vie
            lives--;
            drawLives(); // Met à jour l'affichage des vies

            if (lives <= 0) {
                // Game Over
                alert("GAME OVER. Score final: " + score);
                gameRunning = false; // Arrête la boucle de jeu
                document.location.reload(); // Recharge la page
            } else {
                // Réinitialiser la position de la balle et de la raquette pour la nouvelle vie
                x = canvas.width / 2;
                y = canvas.height - 30;
                // Garder la direction actuelle ou réinitialiser? Réinitialisons pour l'instant
                dx = 3 * (Math.random() < 0.5 ? 1 : -1); // Direction horizontale aléatoire
                dy = -3;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    // Appliquer le mouvement après toutes les vérifications de collision
    x += dx;
    y += dy;
}

function updatePaddlePosition() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }
}

// --- Boucle Principale du Jeu ---
function gameLoop() {
    if (!gameRunning) {
        return; // Arrête la boucle si le jeu est terminé
    }

    // 1. Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Dessiner les éléments
    drawBricks();
    drawBall();
    drawPaddle();
    // Score et Vies sont mis à jour via leurs fonctions dédiées quand nécessaire

    // 3. Mettre à jour les positions et états
    updatePaddlePosition(); // Mettre à jour la position de la raquette
    updateBallPosition();   // Mettre à jour la position de la balle + collisions murs/raquette/bas
    collisionDetection(); // Vérifier les collisions avec les briques

    // 4. Demander la prochaine frame
    requestAnimationFrame(gameLoop);
}

// --- Démarrage du jeu ---
initializeGame(); // Prépare le jeu
gameLoop();       // Lance la boucle de jeu