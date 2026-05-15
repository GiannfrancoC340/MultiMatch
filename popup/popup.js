import { fetchAllMatches, LEAGUES } from "../api/matches.js";

let games = [];
let selectedLayout = "side-by-side";
let activeLeagues = new Set(["all"]);
let activeDate = "all";
let activeStatus = "all";

async function init() {
  document.getElementById("live-count").textContent = "Loading games...";
  games = await fetchAllMatches();

  document.getElementById("live-count").textContent =
    games.length === 0
      ? "No games available"
      : `${games.length} game${games.length !== 1 ? "s" : ""} available`;

  buildLeagueFilters();
  renderGames();
  initFilterPanel();
  initLayoutButtons();
  initLaunchButton();

  setInterval(async () => {
    const previousSelections = new Set(
      games.filter(g => g.selected).map(g => g.id)
    );
  
    games = await fetchAllMatches();
  
    games.forEach(g => {
      if (previousSelections.has(g.id)) g.selected = true;
    });
  
    document.getElementById("live-count").textContent =
      `${games.length} game${games.length !== 1 ? "s" : ""} available`;
  
    renderGames();
  }, 60000);
}

function buildLeagueFilters() {
  const container = document.getElementById("league-filters");

  const allChip = document.createElement("button");
  allChip.className = "chip active";
  allChip.dataset.league = "all";
  allChip.textContent = "All leagues";
  container.appendChild(allChip);

  LEAGUES.forEach(({ name }) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.league = name;
    chip.textContent = name;
    container.appendChild(chip);
  });

  container.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const league = chip.dataset.league;

    if (league === "all") {
      activeLeagues = new Set(["all"]);
      container.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
    } else {
      activeLeagues.delete("all");
      container.querySelector("[data-league='all']").classList.remove("active");

      if (chip.classList.contains("active")) {
        chip.classList.remove("active");
        activeLeagues.delete(league);
        if (activeLeagues.size === 0) {
          activeLeagues.add("all");
          container.querySelector("[data-league='all']").classList.add("active");
        }
      } else {
        chip.classList.add("active");
        activeLeagues.add(league);
      }
    }

    updateFilterCount();
    renderGames();
  });
}

function initFilterPanel() {
  const toggleBtn = document.getElementById("filter-toggle");
  const panel = document.getElementById("filter-panel");

  toggleBtn.addEventListener("click", () => {
    const isOpen = !panel.classList.contains("hidden");
    panel.classList.toggle("hidden", isOpen);
    toggleBtn.classList.toggle("active", !isOpen);
  });

  document.getElementById("date-filters").addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    document.querySelectorAll("#date-filters .chip").forEach(c =>
      c.classList.remove("active")
    );
    chip.classList.add("active");
    activeDate = chip.dataset.date;

    updateFilterCount();
    renderGames();
  });
}

document.getElementById("status-filters").addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  document.querySelectorAll("#status-filters .chip").forEach(c =>
    c.classList.remove("active")
  );
  chip.classList.add("active");
  activeStatus = chip.dataset.status;

  updateFilterCount();
  renderGames();
});

function updateFilterCount() {
  const count =
    (activeLeagues.has("all") ? 0 : activeLeagues.size) +
    (activeDate === "all" ? 0 : 1) +
    (activeStatus === "all" ? 0 : 1);

  const badge = document.getElementById("filter-count");
  badge.textContent = count;
  badge.classList.toggle("hidden", count === 0);
}

function matchesDateFilter(game) {
  if (activeDate === "all") return true;
  if (!game.date) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const gameDate = new Date(game.date);
  gameDate.setHours(0, 0, 0, 0);

  if (activeDate === "today") return gameDate.getTime() === today.getTime();
  if (activeDate === "tomorrow") return gameDate.getTime() === tomorrow.getTime();
  if (activeDate === "week") return gameDate >= today && gameDate <= weekEnd;

  return true;
}

function getFilteredGames() {
  return games.filter(game => {
    const leagueMatch = activeLeagues.has("all") || activeLeagues.has(game.league);
    const dateMatch = matchesDateFilter(game);
    const statusMatch = activeStatus === "all" || game.state === activeStatus;
    return leagueMatch && dateMatch && statusMatch;
  });
}

function renderGames() {
  const list = document.getElementById("game-list");
  list.innerHTML = "";

  const filtered = getFilteredGames();

  document.getElementById("live-count").textContent =
    filtered.length === 0
      ? "No games available"
      : `${filtered.length} game${filtered.length !== 1 ? "s" : ""} available`;

  if (filtered.length === 0) {
    list.innerHTML = `<div class="no-games">No games match your filters</div>`;
    document.getElementById("launch-btn").disabled = true;
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement("div");
    card.className = `game-card ${game.selected ? "selected" : ""}`;

    card.innerHTML = `
      <div class="game-info">
        <div class="game-title">${game.away} vs ${game.home}</div>
        <div class="game-meta">
          <span class="game-status">${game.status}</span>
          <span class="game-league">· ${game.league}</span>
        </div>
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

function initLaunchButton() {
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
}

init();