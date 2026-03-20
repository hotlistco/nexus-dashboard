const WEATHER_EMOJIS = {
  Thunderstorm: '⛈️',
  Drizzle: '🌦️',
  Rain: '🌧️',
  Snow: '❄️',
  Atmosphere: '🌫️',
  Clear: '☀️',
  Clouds: '☁️'
};

function groupToIcon(main) {
  return WEATHER_EMOJIS[main] || '🌤️';
}

function fahrenheit(value) {
  return `${Math.round(value)}°`;
}

function weekday(ts, timezoneOffsetSeconds = 0) {
  const date = new Date((ts + timezoneOffsetSeconds) * 1000);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(date);
}

export async function getWeather(env) {
  const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
  url.searchParams.set('lat', env.WEATHER_LAT);
  url.searchParams.set('lon', env.WEATHER_LON);
  url.searchParams.set('appid', env.OPENWEATHER_API_KEY);
  url.searchParams.set('units', 'imperial');

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather API failed: ${response.status}`);
  const payload = await response.json();
  const entries = payload.list || [];
  const city = payload.city?.name || env.WEATHER_LABEL || 'Home';
  const currentEntry = entries[0];

  const byDay = new Map();
  for (const entry of entries) {
    const day = weekday(entry.dt, payload.city?.timezone || 0);
    const bucket = byDay.get(day) || [];
    bucket.push(entry);
    byDay.set(day, bucket);
  }

  const forecast = [...byDay.entries()].slice(0, 5).map(([day, values]) => {
    const highs = values.map((v) => v.main.temp_max);
    const lows = values.map((v) => v.main.temp_min);
    const midday = values[Math.min(2, values.length - 1)];
    return {
      day,
      icon: groupToIcon(midday.weather?.[0]?.main),
      high: fahrenheit(Math.max(...highs)),
      low: fahrenheit(Math.min(...lows))
    };
  });

  return {
    current: currentEntry ? {
      temp: fahrenheit(currentEntry.main.temp),
      feelsLike: fahrenheit(currentEntry.main.feels_like),
      summary: currentEntry.weather?.[0]?.description || 'Conditions unavailable',
      detail: `Humidity ${currentEntry.main.humidity}%`,
      icon: groupToIcon(currentEntry.weather?.[0]?.main),
      location: env.WEATHER_LABEL || city
    } : null,
    forecast
  };
}
