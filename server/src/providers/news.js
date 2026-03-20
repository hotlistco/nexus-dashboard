function relativeTime(iso) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const mins = Math.max(1, Math.round((now - then) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} day ago`;
}

export async function getNews(env) {
  const url = new URL('https://gnews.io/api/v4/top-headlines');
  url.searchParams.set('country', env.NEWS_COUNTRY || 'us');
  url.searchParams.set('lang', env.NEWS_LANG || 'en');
  url.searchParams.set('max', '5');
  url.searchParams.set('apikey', env.GNEWS_API_KEY);
  if (env.NEWS_TOPIC) {
    url.searchParams.set('category', env.NEWS_TOPIC);
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`News API failed: ${response.status}`);
  const payload = await response.json();
  return {
    items: (payload.articles || []).map((article) => ({
      title: article.title,
      image: article.image,
      source: article.source?.name || 'Unknown source',
      url: article.url,
      published: relativeTime(article.publishedAt)
    }))
  };
}
