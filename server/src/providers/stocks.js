const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'TSLA'];

function parseAlphaVantageSeries(payload) {
  const key = Object.keys(payload).find((name) => name.startsWith('Time Series'));
  return key ? payload[key] : null;
}

export async function getStocks(env) {
  const symbols = (env.STOCK_SYMBOLS || DEFAULT_TICKERS.join(',')).split(',').map((item) => item.trim()).filter(Boolean).slice(0, 6);

  const items = await Promise.all(symbols.map(async (symbol) => {
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', 'TIME_SERIES_INTRADAY');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('interval', '5min');
    url.searchParams.set('outputsize', 'compact');
    url.searchParams.set('apikey', env.ALPHAVANTAGE_API_KEY);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Stocks API failed for ${symbol}: ${response.status}`);
    const payload = await response.json();
    const series = parseAlphaVantageSeries(payload);
    if (!series) {
      const note = payload.Note || payload['Error Message'] || 'Unexpected Alpha Vantage response';
      throw new Error(`${symbol}: ${note}`);
    }
    const points = Object.entries(series).slice(0, 2);
    const latest = Number(points[0]?.[1]?.['4. close'] || 0);
    const previous = Number(points[1]?.[1]?.['4. close'] || latest);
    const delta = latest - previous;
    const pct = previous ? (delta / previous) * 100 : 0;
    return {
      symbol,
      price: `$${latest.toFixed(2)}`,
      change: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
      positive: pct >= 0
    };
  }));

  return { items };
}
