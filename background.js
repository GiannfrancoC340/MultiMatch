chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "launchMultiMatch") {
      launchGames(message.games, message.layout);
    }
});

async function launchGames(games, layout) {
  const screen = await getScreenInfo();
  const validGames = games.filter(g => g.url && g.url.startsWith("https://"));
  const positions = calculatePositions(validGames.length, layout, screen);

  for (let i = 0; i < validGames.length; i++) {
    const pos = positions[i];
    chrome.windows.create({
      url: validGames[i].url,
      type: "popup",
      left: pos.left,
      top: pos.top,
      width: pos.width,
      height: pos.height
    });
  }
}

function getScreenInfo() {
    return new Promise((resolve) => {
      chrome.system
        ? chrome.system.display.getInfo(displays => {
            const d = displays[0];
            resolve({ width: d.workArea.width, height: d.workArea.height });
          })
        : resolve({ width: 1440, height: 900 });
    });
}

function calculatePositions(count, layout, screen) {
    const { width, height } = screen;
    const positions = [];
  
    if (layout === "side-by-side") {
      const w = Math.floor(width / Math.min(count, 3));
      for (let i = 0; i < count; i++) {
        positions.push({ left: i * w, top: 0, width: w, height });
      }
  
    } else if (layout === "2x2") {
      const w = Math.floor(width / 2);
      const h = Math.floor(height / 2);
      const grid = [
        { left: 0,    top: 0 },
        { left: w,    top: 0 },
        { left: 0,    top: h },
        { left: w,    top: h }
      ];
      for (let i = 0; i < Math.min(count, 4); i++) {
        positions.push({ ...grid[i], width: w, height: h });
      }
  
    } else if (layout === "main-mini") {
      const mainW = Math.floor(width * 0.65);
      const miniW = width - mainW;
      const miniH = Math.floor(height / Math.max(count - 1, 1));
      positions.push({ left: 0, top: 0, width: mainW, height });
      for (let i = 1; i < count; i++) {
        positions.push({ left: mainW, top: (i - 1) * miniH, width: miniW, height: miniH });
      }
    }
  
    return positions;
}