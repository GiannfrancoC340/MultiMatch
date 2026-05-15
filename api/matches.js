export const LEAGUES = [
    { id: "eng.1",          name: "Premier League" },
    { id: "esp.1",          name: "La Liga" },
    { id: "ita.1",          name: "Serie A" },
    { id: "ger.1",          name: "Bundesliga" },
    { id: "fra.1",          name: "Ligue 1" },
    { id: "usa.1",          name: "MLS" },
    { id: "uefa.champions", name: "UCL" },
    { id: "uefa.europa",    name: "UEL" },
    { id: "uefa.europa.conf", name: "UECL" }
  ];
  
  const PLATFORM_URLS = {
    "Peacock":            "https://www.peacocktv.com",
    "ESPN+":              "https://www.espnplus.com",
    "Paramount+":         "https://www.paramountplus.com",
    "fuboTV":             "https://www.fubo.tv",
    "Apple TV+":          "https://tv.apple.com",
    "CBS":                "https://www.cbssports.com",
    "CBS Sports Network": "https://www.cbssports.com",
    "TNT":                "https://www.tntdrama.com",
    "Max":                "https://www.max.com"
  };
  
  async function fetchLeagueMatches(leagueId) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard`;
    const res = await fetch(url);
    const data = await res.json();
    return data.events || [];
  }

  function getEnglishPlatform(competition) {
    const geoBroadcasts = competition.geoBroadcasts || [];
  
    const englishBroadcast = geoBroadcasts.find(
      b => b.lang === "en" && b.region === "us"
    );
  
    if (englishBroadcast) {
      return englishBroadcast.media?.shortName || null;
    }
  
    const broadcasts = competition.broadcasts || [];
    const englishFallback = broadcasts.find(
      b => b.market === "national"
    );
  
    return englishFallback?.names?.[0] || null;
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
    const homeScore = home.score || "0";
    const awayScore = away.score || "0";
  
    let statusText = "";
    if (state === "in") {
      statusText = `LIVE ${status.displayClock} — ${awayScore} - ${homeScore}`;
    } else if (state === "pre") {
      statusText = status.type.detail;
    } else if (state === "post") {
      statusText = `Full Time — ${awayScore} - ${homeScore}`;
    }
  
    const platformName = getEnglishPlatform(competition);
  
    if (!platformName) return null;
  
    const platformUrl = PLATFORM_URLS[platformName];
    if (!platformUrl) return null;
  
    return {
      id: event.id,
      home: homeName,
      away: awayName,
      status: statusText,
      state,
      date: event.date,
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