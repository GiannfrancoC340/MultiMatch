const LEAGUES = [
    { id: "eng.1", name: "Premier League" },
    { id: "esp.1", name: "La Liga" },
    { id: "ita.1", name: "Serie A" },
    { id: "ger.1", name: "Bundesliga" },
    { id: "fra.1", name: "Ligue 1" },
    { id: "usa.1", name: "MLS" }
  ];
  
  const PLATFORM_URLS = {
    "Peacock":    "https://www.peacocktv.com",
    "ESPN+":      "https://www.espnplus.com",
    "Paramount+": "https://www.paramountplus.com",
    "fuboTV":     "https://www.fubo.tv",
    "Apple TV+":  "https://tv.apple.com"
  };
  
  async function fetchLeagueMatches(leagueId) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard`;
    const res = await fetch(url);
    const data = await res.json();
    return data.events || [];
  }
  
  function parseMatch(event, leagueName) {
    const competition = event.competitions?.[0];
    if (!competition) return null;
  
    const status = competition.status;
    const state = status?.type?.state;
    const competitors = competition.competitors || [];
  
    const home = competitors.find(c => c.homeAway === "home");
    const away = competitors.find(c => c.homeAway === "away");
  
    if (!home || !away) return null;
  
    const homeName = home.team.shortDisplayName;
    const awayName = away.team.shortDisplayName;
  
    let statusText = "";
    if (state === "in") {
      statusText = `LIVE ${status.displayClock}`;
    } else if (state === "pre") {
      statusText = status.type.detail;
    } else if (state === "post") {
      statusText = "Full Time";
    }
  
    const broadcasts = competition.broadcasts || [];
    const platformName = broadcasts[0]?.names?.[0] || "Unknown";
    const platformUrl = PLATFORM_URLS[platformName] || "#";
  
    return {
      id: event.id,
      home: homeName,
      away: awayName,
      status: statusText,
      state,
      league: leagueName,
      platform: platformName,
      url: platformUrl,
      selected: false
    };
  }
  
  export async function fetchAllMatches() {
    const results = await Promise.all(
      LEAGUES.map(async (league) => {
        try {
          const events = await fetchLeagueMatches(league.id);
          return events
            .map(e => parseMatch(e, league.name))
            .filter(Boolean);
        } catch (err) {
          console.error(`Failed to fetch ${league.name}:`, err);
          return [];
        }
      })
    );
  
    return results.flat();
  }