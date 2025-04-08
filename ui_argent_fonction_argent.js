// === UI Monnaie & Améliorations ===

let currency = 0;
const upgrades = [
    { id: "expandPaddle", label: "🎯 Paddle Large", cost: 5 },
    { id: "extraLife", label: "❤️ +1 Vie", cost: 8 },
    { id: "multiBall", label: "⚪ Multi-balles", cost: 10 }
];

export function initUpgradeMenu(onUpgradePurchased) {
    const container = document.createElement("div");
    container.id = "upgrade-menu";
    Object.assign(container.style, {
        position: "fixed",
        top: "80px",
        left: "10px",
        background: "#f4f4f4",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "8px",
        fontFamily: "monospace",
        zIndex: 10
    });

    const title = document.createElement("div");
    title.textContent = "🪙 Améliorations";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "6px";
    container.appendChild(title);

    upgrades.forEach(up => {
        const btn = document.createElement("button");
        btn.textContent = `${up.label} (${up.cost}💰)`;
        btn.disabled = true;
        btn.style.display = "block";
        btn.style.margin = "5px 0";
        btn.onclick = () => {
            if (currency >= up.cost) {
                currency -= up.cost;
                updateCurrencyDisplay();
                onUpgradePurchased(up.id);
            }
        };
        btn.id = `upgrade-${up.id}`;
        container.appendChild(btn);
    });

    const currencyDisplay = document.createElement("div");
    currencyDisplay.id = "currency-display";
    currencyDisplay.textContent = `💰 ${currency}`;
    currencyDisplay.style.marginTop = "8px";
    container.appendChild(currencyDisplay);

    document.body.appendChild(container);
}

export function updateCurrencyDisplay() {
    const display = document.getElementById("currency-display");
    if (display) display.textContent = `💰 ${currency}`;

    upgrades.forEach(up => {
        const btn = document.getElementById(`upgrade-${up.id}`);
        if (btn) btn.disabled = currency < up.cost;
    });
}

export function addCurrency(amount = 1) {
    currency += amount;
    updateCurrencyDisplay();
}
