import { fetchAllMatches } from "../api/matches.js";

let games = [];
let selectedLayout = "side-by-side";

async function init() {
  document.getElementById("live-count").textContent = "Loading games...";
  games = await fetchAllMatches();

  if (games.length === 0) {
    document.getElementById("live-count").textContent = "No games right now";
  } else {
    document.getElementById("live-count").textContent =
      `${games.length} game${games.length !== 1 ? "s" : ""} available`;
  }

  renderGames();
}

function renderGames() {
  const list = document.getElementById("game-list");
  list.innerHTML = "";

  games.forEach(game => {
    const card = document.createElement("div");
    card.className = `game-card ${game.selected ? "selected" : ""}`;

    card.innerHTML = `
      <div class="game-info">
        <div class="game-title">${game.away} vs ${game.home}</div>
        <div class="game-status">${game.status}</div>
      </div>
      <span class="badge">${game.platform}</span>
    `;

    card.addEventListener("click", () => {
      game.selected = !game.selected;
      renderGames();
      document.getElementById("launch-btn").disabled =
        !games.some(g => g.selected);
    });

    list.appendChild(card);
  });

  document.getElementById("launch-btn").disabled =
    !games.some(g => g.selected);
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
  const selected = games.filter(g => g.selected);
  chrome.storage.local.set({ games: selected, layout: selectedLayout }, () => {
    chrome.runtime.sendMessage({
      action: "launchMultiMatch",
      games: selected,
      layout: selectedLayout
    });
  });
});

init();
initLayoutButtons();