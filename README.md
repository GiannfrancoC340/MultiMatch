# MultiMatch

**MultiMatch** is a Chrome browser extension that lets you watch multiple soccer matches at the same time. Select the games you want from a live scoreboard, pick a window layout, and launch — MultiMatch opens each stream in a precisely tiled browser window so nothing overlaps.

---

## Overview

Keeping up with multiple matches across different streaming platforms usually means alt-tabbing, missing goals, or paying for a second monitor setup that still requires manual window management. MultiMatch solves this by pulling live match data from ESPN's public API, showing you every available game on US streaming services, and automatically positioning the browser windows on your screen.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Platform | Chrome Extension (Manifest V3) |
| Language | Vanilla JavaScript (ES Modules) |
| UI | HTML + CSS |
| Data | ESPN public scoreboard API |
| Window management | Chrome Extensions API (`windows`, `system.display`) |

---

## Key Features

- **Live scoreboard** — fetches match data for 9 leagues and shows live scores, halftime, full-time results, and upcoming kickoff times
- **Streaming platform filter** — only shows games available on US English broadcasts (Peacock, ESPN+, Paramount+, fuboTV, Apple TV+, CBS, TNT, Max, NBC, USA Network)
- **Filter panel** — narrow the list by league, date (today / tomorrow / this week), or match status (Live / Upcoming / Finished)
- **Multi-select** — tap any number of game cards to queue them up; selected cards highlight with a green accent
- **Three window layouts** — Side by side, 2×2 grid, or Main + mini (one large stream with smaller ones stacked alongside)
- **Automatic window positioning** — reads your screen resolution via `chrome.system.display` and calculates pixel-perfect tile positions before opening each stream
- **Live score refresh** — scores and match states update every 60 seconds; your current game selections are preserved across refreshes

---

## Standout Details

- Match data is fetched in parallel across all leagues using `Promise.all`, so the popup loads in a single round-trip
- The layout engine handles any number of selected games gracefully, capping side-by-side at 3 columns and 2×2 at 4 windows
- The filter badge on the Filter button counts only active (non-default) filters, giving instant visual feedback without opening the panel
- Only games with a known US English broadcast and a mapped platform URL are shown — no dead links

---

## Media

### Screenshots

**First Picture**
> <img width="387" height="433" alt="Screenshot 2026-05-14 at 12 58 48 PM" src="https://github.com/user-attachments/assets/ba22c02f-0d08-4329-a5ee-331423a2c818" />

**More games uploaded**
> <img width="375" height="675" alt="Screenshot 2026-05-14 at 8 18 43 PM" src="https://github.com/user-attachments/assets/99e9c49e-a86d-48f9-8fb6-a420e94b20db" />

**ESPN API added**
> <img width="363" height="547" alt="Screenshot 2026-05-14 at 8 36 29 PM" src="https://github.com/user-attachments/assets/7d239fd3-df72-4947-b220-2b589ff43684" />

**Live game tracking**
> <img width="346" height="532" alt="Screenshot 2026-05-15 at 3 07 25 PM" src="https://github.com/user-attachments/assets/5c4942a8-b412-4022-8f20-7113d6f587a8" />

### Videos

> [upload videos here]

---

## Supported Leagues

| ID | League |
|---|---|
| Premier League | England top flight |
| La Liga | Spain top flight |
| Serie A | Italy top flight |
| Bundesliga | Germany top flight |
| Ligue 1 | France top flight |
| MLS | US Major League Soccer |
| UCL | UEFA Champions League |
| UEL | UEFA Europa League |
| UECL | UEFA Europa Conference League |

---

## Installation

Chrome extensions in development must be loaded as an unpacked extension.

1. Clone the repository:
   ```bash
   git clone https://github.com/GiannfrancoCrovetto/MultiMatch.git
   cd MultiMatch
   ```

2. Open Chrome and navigate to `chrome://extensions`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked** and select the `MultiMatch` folder

5. The MultiMatch icon will appear in your Chrome toolbar

> No build step required — the extension runs as plain ES Modules.

---

## Usage

1. Click the **MultiMatch** icon in the Chrome toolbar
2. Browse the match list — each card shows the teams, live score or kickoff time, league, and streaming platform
3. Use the **Filter** button to narrow by league, date, or match status
4. Click one or more game cards to select them (cards turn green)
5. Choose a window layout: **Side by side**, **2 x 2**, or **Main + mini**
6. Click **Launch MultiMatch** — your chosen streams open in tiled windows

---

## Project Structure

```
MultiMatch/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker — window creation & layout positioning
├── content.js             # Content script injected into streaming platform pages
├── api/
│   └── matches.js         # ESPN API fetching, match parsing, platform URL mapping
├── popup/
│   ├── popup.html         # Extension popup markup
│   ├── popup.js           # Popup logic — filtering, selection, launch
│   └── popup.css          # Popup styles
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## API Details

Match data comes from ESPN's public scoreboard endpoint:

```
https://site.api.espn.com/apis/site/v2/sports/soccer/{leagueId}/scoreboard
```

No API key is required. The extension filters results to US English geo-broadcasts only, then maps broadcaster names to their direct stream URLs. Games without a known US broadcaster are silently excluded.

---

## Challenges & Solutions

**Window positioning without a native tiling API**
Chrome doesn't expose a tiling API, so the extension uses `chrome.system.display.getInfo` to read the primary monitor's work area dimensions and calculates `left`, `top`, `width`, and `height` for each popup window before opening them.

**Preserving selections across live score refreshes**
The auto-refresh replaces the entire `games` array each minute. To avoid losing the user's selections, the refresh captures selected game IDs into a `Set` before the fetch, then re-applies them by ID after the new data arrives.

**Halftime vs. live clock display**
ESPN's API uses `STATUS_HALFTIME` as a named status type rather than a clock value. The parser checks for this name explicitly and renders "Halftime" instead of a clock string.

---

## Future Improvements

- [ ] Support for additional leagues (Championship, Liga MX, Eredivisie, etc.)
- [ ] Persist layout preference and last-used filters between sessions
- [ ] In-popup score notifications / goal alerts
- [ ] Custom layout editor for non-standard monitor aspect ratios
- [ ] Support for additional streaming regions beyond US English

---

## What I Learned

- Building a Chrome Manifest V3 extension end-to-end, including service workers, content scripts, and the `chrome.windows` / `chrome.system.display` APIs
- Parsing ESPN's undocumented public scoreboard API and handling edge cases like missing broadcaster data
- Designing a compact, information-dense popup UI in 340px width using only vanilla CSS
- Managing stateful UI (selections, filters, live refresh) without a framework

---

## License

[MIT](LICENSE)

---

## Author

**Giannfranco Crovetto** — [GitHub](https://github.com/GiannfrancoCrovetto)
