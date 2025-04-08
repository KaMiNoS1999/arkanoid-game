// === UI Monnaie & Améliorations séparées (permanentes + temporaires) ===

let currency = parseInt(localStorage.getItem("currency")) || 0;
const ownedUpgrades = new Set(JSON.parse(localStorage.getItem("upgrades") || "[]"));
const selectedTemporaryBonuses = new Set();

const upgradesPermanent = [
    { id: "expandPaddle", label: "🎯 Paddle Large", cost: 25 },
    { id: "extraLife", label: "❤️ +1 Vie", cost: 8 }
];

const bonusesTemp = [
    { id: "startExtraLife", label: "❤️ Vie bonus (temp.)", cost: 3 },
    { id: "startBigPaddle", label: "🎯 Paddle XL (temp.)", cost: 4 },
    { id: "startSlowBall", label: "🐢 Balle lente (temp.)", cost: 4 },
    { id: "multiBall", label: "⚪ Multi-balles (temp.)", cost: 10 }
];

export function initUpgradeMenu(onUpgradePurchased) {
    createMenuBox("🛠️ Améliorations permanentes", upgradesPermanent, ownedUpgrades, true, onUpgradePurchased, 80);
    createMenuBox("⚡ Bonus temporaires", bonusesTemp, selectedTemporaryBonuses, false, onUpgradePurchased, 300);
    updateCurrencyDisplay();
}

function createMenuBox(titleText, items, storageSet, isPermanent, onPurchase, topOffset) {
    const container = document.createElement("div");
    container.className = "upgrade-menu-box";
    Object.assign(container.style, {
        position: "fixed",
        top: `${topOffset}px`,
        left: "10px",
        background: "#f4f4f4",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "8px",
        fontFamily: "monospace",
        zIndex: 10,
        width: "220px"
    });

    const title = document.createElement("div");
    title.textContent = titleText;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "6px";
    container.appendChild(title);

    items.forEach(up => {
        const btn = document.createElement("button");
        btn.textContent = `${up.label} (${up.cost}💰)`;
        btn.disabled = currency < up.cost || storageSet.has(up.id);
        btn.style.display = "block";
        btn.style.margin = "5px 0";
        btn.onclick = () => {
            if (currency >= up.cost && !storageSet.has(up.id)) {
                currency -= up.cost;
                storageSet.add(up.id);
                saveState();
                updateCurrencyDisplay();
                onPurchase(up.id);
                btn.disabled = true;
            }
        };
        btn.id = `upgrade-${up.id}`;
        container.appendChild(btn);
    });

    document.body.appendChild(container);
}

function saveState() {
    localStorage.setItem("currency", currency);
    localStorage.setItem("upgrades", JSON.stringify([...ownedUpgrades]));
}

export function updateCurrencyDisplay() {
    const currencyDisplays = document.querySelectorAll("#currency-display");
    currencyDisplays.forEach(display => {
        display.textContent = `💰 ${currency}`;
    });

    [...upgradesPermanent, ...bonusesTemp].forEach(up => {
        const btn = document.getElementById(`upgrade-${up.id}`);
        if (btn) {
            const isPermanent = upgradesPermanent.find(u => u.id === up.id);
            const alreadyBought = isPermanent
                ? ownedUpgrades.has(up.id)
                : selectedTemporaryBonuses.has(up.id);
            btn.disabled = currency < up.cost || alreadyBought;
        }
    });
}

export function addCurrency(amount = 1) {
    currency += amount;
    saveState();
    updateCurrencyDisplay();
}

export function resetCurrency() {
    currency = 0;
    ownedUpgrades.clear();
    selectedTemporaryBonuses.clear();
    saveState();
    updateCurrencyDisplay();
}

export function isUpgradeOwned(id) {
    return ownedUpgrades.has(id);
}

export function getTemporaryBonuses() {
    return [...selectedTemporaryBonuses];
}
