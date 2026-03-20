export async function getTrends(env) {
  if (env.GOOGLE_TRENDS_API_URL && env.GOOGLE_TRENDS_API_KEY) {
    const response = await fetch(env.GOOGLE_TRENDS_API_URL, {
      headers: { Authorization: `Bearer ${env.GOOGLE_TRENDS_API_KEY}` }
    });
    if (!response.ok) throw new Error(`Google Trends API failed: ${response.status}`);
    const payload = await response.json();
    return {
      items: (payload.items || payload.trends || []).slice(0, 8).map((item) => ({
        query: item.query || item.title,
        volume: item.value || item.formattedValue || 'Trending'
      }))
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
      items: (payload.trending_searches || []).slice(0, 8).map((item) => ({
        query: item.query,
        volume: item.search_volume || item.active || 'Trending'
      }))
    };
  }

  throw new Error('No trends provider configured. Set GOOGLE_TRENDS_API_URL + GOOGLE_TRENDS_API_KEY or SERPAPI_API_KEY.');
}
