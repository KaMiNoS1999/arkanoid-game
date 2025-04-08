// bump-version.js
import fs from 'fs';

const versionFile = 'version.js';

// Lis le fichier
let content = fs.readFileSync(versionFile, 'utf-8');

// Extrait la version actuelle avec un regex plus souple
const match = content.match(/GAME_VERSION\s*=\s*"(\d+)\.(\d+)\.(\d+)"/);
if (!match) {
    console.error("❌ Impossible de lire la version actuelle dans version.js");
    process.exit(1);
}

let [_, major, minor, patch] = match.map(Number);

// Incrémente le patch
patch++;

// Crée la nouvelle version
const newVersion = `${major}.${minor}.${patch}`;

// Remplace la ligne dans le fichier
const newContent = `export const GAME_VERSION = "${newVersion}";\n`;
fs.writeFileSync(versionFile, newContent);

console.log(`✅ Version mise à jour : ${newVersion}`);
