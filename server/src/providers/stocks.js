const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'TSLA'];

export async function getStocks(env) {
  const symbols = (env.STOCK_SYMBOLS || DEFAULT_TICKERS.join(','))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const items = await Promise.all(symbols.map(async (symbol) => {
    const url = new URL('https://finnhub.io/api/v1/quote');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('token', env.FINNHUB_API_KEY);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Finnhub request failed for ${symbol}: ${response.status}`);
    const data = await response.json();

    if (data.c == null || data.c === 0) throw new Error(`${symbol}: No data returned from Finnhub`);

    const price = data.c;
    const pct = data.dp;

    return {
      symbol,
      price: `$${price.toFixed(2)}`,
      change: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
      positive: pct >= 0,
    };
  }));

  return { items };
}
