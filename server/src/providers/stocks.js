const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'QQQ', 'SPY', 'DIA'];

// Quote cache tracks whether the market was open when the data was last fetched so we know
// whether to do one final after-hours refresh before holding the cache overnight.
const quoteCache   = { data: null, at: 0, key: '', fetchedWhileOpen: false };
const historyCache = { data: null, at: 0, key: '' };
const MARKET_OPEN_TTL  = 30 * 60 * 1000;      // refresh every 30 min while NYSE is open
const AFTER_HOURS_TTL  = 24 * 60 * 60 * 1000; // hold overnight after the one post-close refresh
const HISTORY_TTL      =  4 * 60 * 60 * 1000;
let historyFetchPending = false;

// Returns true Mon–Fri 09:30–16:00 America/New_York.
function isNyseOpen() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const day = get('weekday');
  const minutes = parseInt(get('hour')) * 60 + parseInt(get('minute'));
  return !['Sat', 'Sun'].includes(day) && minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

function isQuoteCacheValid(symbolStr, now) {
  if (!quoteCache.data || quoteCache.key !== symbolStr) return false;
  const open = isNyseOpen();
  if (open) {
    return now - quoteCache.at < MARKET_OPEN_TTL;
  }
  // After hours: if the cache was set while the market was open, it needs one more refresh
  // to capture the closing price. After that post-close fetch it holds until next open.
  if (quoteCache.fetchedWhileOpen) return false;
  return now - quoteCache.at < AFTER_HOURS_TTL;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Twelve Data request failed: ${res.status}`);
  const json = await res.json();
  if (json.status === 'error') throw new Error(`Twelve Data error: ${json.message}`);
  return json;
}

function normalize(json, symbols) {
  if (symbols.length === 1) return { [symbols[0]]: json };
  return json;
}

export async function getStocks(env) {
  const apiKey = env.TWELVE_DATA_API_KEY;
  if (!apiKey) throw new Error('TWELVE_DATA_API_KEY not set');

  const symbols = (env.STOCK_SYMBOLS || DEFAULT_TICKERS.join(','))
    .split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8);
  const symbolStr = symbols.join(',');
  const now = Date.now();

  // --- Quotes ---
  let quotes;
  if (isQuoteCacheValid(symbolStr, now)) {
    quotes = quoteCache.data;
  } else {
    const json = await fetchJson(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbolStr)}&apikey=${apiKey}`
    );
    quotes = normalize(json, symbols);
    quoteCache.data             = quotes;
    quoteCache.at               = now;
    quoteCache.key              = symbolStr;
    quoteCache.fetchedWhileOpen = isNyseOpen();
  }

  // --- History (26 weeks ≈ 6 months) ---
  // Fetched in the background 65 s after quotes to stay within the 8-credit/min free tier limit.
  let histories;
  if (historyCache.data && historyCache.key === symbolStr && now - historyCache.at < HISTORY_TTL) {
    histories = historyCache.data;
  } else {
    histories = historyCache.key === symbolStr ? (historyCache.data || {}) : {};
    if (!historyFetchPending) {
      historyFetchPending = true;
      setTimeout(async () => {
        try {
          const json = await fetchJson(
            `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbolStr)}&interval=1week&outputsize=26&apikey=${apiKey}`
          );
          historyCache.data = normalize(json, symbols);
          historyCache.at   = Date.now();
          historyCache.key  = symbolStr;
        } catch (e) {
          console.warn('History background fetch failed:', e.message);
        } finally {
          historyFetchPending = false;
        }
      }, 65000);
    }
  }

  const items = symbols.map((symbol) => {
    const q = quotes[symbol];
    if (!q || q.status === 'error' || q.code != null) return null;

    const price   = parseFloat(q.close);
    const pct     = parseFloat(q.percent_change);
    const dailyHi = parseFloat(q.high);
    const dailyLo = parseFloat(q.low);

    const h = histories[symbol];
    const history = (h?.values || [])
      .map((v) => parseFloat(v.close))
      .filter((v) => !isNaN(v))
      .reverse();

    return {
      symbol,
      name:     q.name || symbol,
      price:    `$${price.toFixed(2)}`,
      change:   `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
      positive: pct >= 0,
      current:  price,
      high:     dailyHi,
      low:      dailyLo,
      history,
    };
  }).filter(Boolean);

  return { items };
}
