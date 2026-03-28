function parseVolume(v) {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return 0;
  const n = parseFloat(v.replace(/,/g, ''));
  if (isNaN(n)) return 0;
  if (v.includes('M')) return n * 1_000_000;
  if (v.includes('K')) return n * 1_000;
  return n;
}

function sortByVolume(items) {
  return items.slice().sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
}

export async function getTrends(env) {
  if (env.GOOGLE_TRENDS_API_URL && env.GOOGLE_TRENDS_API_KEY) {
    const response = await fetch(env.GOOGLE_TRENDS_API_URL, {
      headers: { Authorization: `Bearer ${env.GOOGLE_TRENDS_API_KEY}` }
    });
    if (!response.ok) throw new Error(`Google Trends API failed: ${response.status}`);
    const payload = await response.json();
    return {
      items: sortByVolume((payload.items || payload.trends || []).slice(0, 8).map((item) => ({
        query: item.query || item.title,
        volume: item.value || item.formattedValue || 'Trending'
      })))
    };
  }

  if (env.SERPAPI_API_KEY) {
    const url = new URL('https://serpapi.com/search');
    url.searchParams.set('engine', 'google_trends_trending_now');
    url.searchParams.set('geo', env.TRENDS_GEO || 'US');
    url.searchParams.set('api_key', env.SERPAPI_API_KEY);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Trends API failed: ${response.status}`);
    const payload = await response.json();
    return {
      items: sortByVolume((payload.trending_searches || []).slice(0, 8).map((item) => ({
        query: item.query,
        volume: item.search_volume || item.active || 'Trending'
      })))
    };
  }

  throw new Error('No trends provider configured. Set GOOGLE_TRENDS_API_URL + GOOGLE_TRENDS_API_KEY or SERPAPI_API_KEY.');
}
