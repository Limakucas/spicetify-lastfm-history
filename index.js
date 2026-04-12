// Last.fm History — Spicetify custom app
// Shows top artists / tracks / albums for a last.fm user across multiple time periods.
// Display only — no Spotify enrichment yet (TODO: revisit images and click-through).

const LASTFM_API_KEY = "16af2b753a37b109ecf20be69b6ec5c4";
const LASTFM_USER = "traxaber";
const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/";

const PERIODS = [
  { key: "7day", label: "Week" },
  { key: "1month", label: "Month" },
  { key: "3month", label: "3 Months" },
  { key: "6month", label: "6 Months" },
  { key: "12month", label: "Year" },
  { key: "overall", label: "All Time" },
];

const TABS = [
  { key: "artists", label: "Artists", method: "user.gettopartists" },
  { key: "tracks", label: "Tracks", method: "user.gettoptracks" },
  { key: "albums", label: "Albums", method: "user.gettopalbums" },
];

async function lastfmFetch(method, period, limit = 50) {
  const url = `${LASTFM_BASE}?method=${method}&user=${LASTFM_USER}&period=${period}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`last.fm ${res.status}`);
  return res.json();
}

function extractItems(json, tabKey) {
  if (tabKey === "artists") return json.topartists?.artist ?? [];
  if (tabKey === "tracks") return json.toptracks?.track ?? [];
  if (tabKey === "albums") return json.topalbums?.album ?? [];
  return [];
}

function App() {
  const { useState, useEffect } = Spicetify.React;
  const h = Spicetify.React.createElement;

  const [tab, setTab] = useState("artists");
  const [period, setPeriod] = useState("7day");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const tabDef = TABS.find((t) => t.key === tab);
    lastfmFetch(tabDef.method, period)
      .then((json) => {
        if (cancelled) return;
        setItems(extractItems(json, tab));
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, period]);

  const tabBar = h(
    "div",
    { className: "lfm-tabs" },
    TABS.map((t) =>
      h(
        "button",
        {
          key: t.key,
          className: "lfm-tab" + (t.key === tab ? " active" : ""),
          onClick: () => setTab(t.key),
        },
        t.label,
      ),
    ),
  );

  const periodBar = h(
    "div",
    { className: "lfm-periods" },
    PERIODS.map((p) =>
      h(
        "button",
        {
          key: p.key,
          className: "lfm-period" + (p.key === period ? " active" : ""),
          onClick: () => setPeriod(p.key),
        },
        p.label,
      ),
    ),
  );

  let body;
  if (loading) {
    body = h("div", { className: "lfm-status" }, "Loading…");
  } else if (error) {
    body = h("div", { className: "lfm-status lfm-error" }, `Error: ${error}`);
  } else if (items.length === 0) {
    body = h("div", { className: "lfm-status" }, "No data for this period.");
  } else {
    body = h(
      "ol",
      { className: "lfm-list" },
      items.map((item, idx) => {
        const playcount = item.playcount ? `${item.playcount} plays` : "";
        const subtitle =
          tab === "artists" ? playcount : `${item.artist?.name ?? ""} · ${playcount}`;
        return h(
          "li",
          { key: `${tab}-${idx}-${item.name}`, className: "lfm-item" },
          h("span", { className: "lfm-rank" }, idx + 1),
          h(
            "div",
            { className: "lfm-meta" },
            h("div", { className: "lfm-title" }, item.name),
            h("div", { className: "lfm-subtitle" }, subtitle),
          ),
        );
      }),
    );
  }

  return h(
    "section",
    { className: "lfm-app" },
    h(
      "header",
      { className: "lfm-header" },
      h("h1", { className: "lfm-h1" }, "Last.fm History"),
      h("div", { className: "lfm-user" }, `@${LASTFM_USER}`),
    ),
    tabBar,
    periodBar,
    body,
  );
}

(function injectStyles() {
  if (document.getElementById("lfm-styles")) return;
  const style = document.createElement("style");
  style.id = "lfm-styles";
  style.textContent = `
    .lfm-app { padding: 24px 32px; color: var(--spice-text); }
    .lfm-header { display: flex; align-items: baseline; gap: 16px; margin-bottom: 16px; }
    .lfm-h1 { font-size: 32px; font-weight: 700; margin: 0; }
    .lfm-user { color: var(--spice-subtext); font-size: 14px; }
    .lfm-tabs, .lfm-periods { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .lfm-tab, .lfm-period {
      background: var(--spice-card); color: var(--spice-text);
      border: 1px solid transparent; border-radius: 999px;
      padding: 6px 14px; font-size: 13px; cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .lfm-tab:hover, .lfm-period:hover { border-color: var(--spice-button); }
    .lfm-tab.active, .lfm-period.active {
      background: var(--spice-button); color: var(--spice-main); font-weight: 600;
    }
    .lfm-status { padding: 24px 0; color: var(--spice-subtext); }
    .lfm-error { color: #ff6b6b; }
    .lfm-list { list-style: none; padding: 0; margin: 16px 0 0 0; }
    .lfm-item {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 12px; border-radius: 6px;
    }
    .lfm-rank { width: 28px; text-align: right; color: var(--spice-subtext); font-variant-numeric: tabular-nums; }
    .lfm-meta { display: flex; flex-direction: column; min-width: 0; }
    .lfm-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lfm-subtitle { font-size: 12px; color: var(--spice-subtext); }
  `;
  document.head.appendChild(style);
})();

// eslint-disable-next-line no-unused-vars
function render() {
  return Spicetify.React.createElement(App);
}
