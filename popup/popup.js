const mockGames = [
    {
      id: 1,
      home: "Chelsea",
      away: "Liverpool",
      status: "LIVE 62'",
      platform: "Peacock",
      url: "https://www.peacocktv.com",
      selected: true
    },
    {
      id: 2,
      home: "Inter Milan",
      away: "Napoli",
      status: "LIVE 58'",
      platform: "Paramount+",
      url: "https://www.paramountplus.com",
      selected: true
    },
    {
      id: 3,
      home: "Real Madrid",
      away: "Barcelona",
      status: "Starts in 28 min",
      platform: "ESPN+",
      url: "https://www.espnplus.com",
      selected: false
    }
];

let selectedLayout = "side-by-side";

function renderGames() {
    const list = document.getElementById("game-list");
    const liveCount = mockGames.filter(g => g.selected).length;
    document.getElementById("live-count").textContent = `${mockGames.length} games available`;

    list.innerHTML = "";
    mockGames.forEach(game => {
        const card = document.createElement("div");
        card.className = `game-card ${game.selected ? "selected" : ""}`;

        card.innerHTML = `
        <div class="game-info">
            <div class="game-title">${game.home} vs ${game.away}</div>
            <div class="game-status">${game.status}</div>
        </div>
        <span class="badge">${game.platform}</span>
        `;

        card.addEventListener("click", () => {
            game.selected = !game.selected;
            renderGames();
        });

        list.appendChild(card);
    });

    const anySelected = mockGames.some(g => g.selected);
    document.getElementById("launch-btn").disabled = !anySelected;
}

function initLayoutButtons() {
    document.querySelectorAll(".layout-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".layout-btn").forEach(b =>
                b.classList.remove("active")
            );
            btn.classList.add("active");
            selectedLayout = btn.dataset.layout;
        });
    });
}

document.getElementById("launch-btn").addEventListener("click", () => {
    const selected = mockGames.filter(g => g.selected);
    chrome.storage.local.set({ games: selected, layout: selectedLayout }, () => {
        chrome.runtime.sendMessage({ action: "launchMultiMatch", games: selected, layout: selectedLayout });
    });
});

renderGames();
initLayoutButtons();