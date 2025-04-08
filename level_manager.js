// === level_manager.js ===
// Gère les niveaux, leur progression, et leur configuration (briques, vitesse, etc.)

export const levels = [
    {
        name: "Niveau 1",
        brickRowCount: 5,
        brickColumnCount: 8,
        ballSpeed: 3,
        powerUpChance: 0.3,
        brickColor: "#0095DD"
    },
    {
        name: "Niveau 2",
        brickRowCount: 6,
        brickColumnCount: 10,
        ballSpeed: 3.5,
        powerUpChance: 0.35,
        brickColor: "#00C851"
    },
    {
        name: "Niveau 3",
        brickRowCount: 7,
        brickColumnCount: 12,
        ballSpeed: 4,
        powerUpChance: 0.4,
        brickColor: "#ff4444"
    }
];

let currentLevelIndex = 0;

export function getCurrentLevel() {
    return levels[currentLevelIndex];
}

export function nextLevel() {
    if (currentLevelIndex < levels.length - 1) {
        currentLevelIndex++;
        return true;
    }
    return false; // Dernier niveau atteint
}

export function resetLevels() {
    currentLevelIndex = 0;
}

export function getLevelIndex() {
    return currentLevelIndex;
}
