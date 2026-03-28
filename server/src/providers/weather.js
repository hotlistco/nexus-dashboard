function windDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function fahrenheit(value) {
  return `${Math.round(value)}°`;
}

function weekday(ts, timezoneOffsetSeconds = 0) {
  const date = new Date((ts + timezoneOffsetSeconds) * 1000);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(date);
}

function formatTime(ts, timezoneOffsetSeconds = 0) {
  const date = new Date((ts + timezoneOffsetSeconds) * 1000);
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(date);
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
  const city = payload.city || {};
  const tzOffset = city.timezone || 0;
  const currentEntry = entries[0];

  const byDay = new Map();
  for (const entry of entries) {
    const day = weekday(entry.dt, tzOffset);
    const bucket = byDay.get(day) || [];
    bucket.push(entry);
    byDay.set(day, bucket);
  }

  const forecast = [...byDay.entries()].slice(0, 5).map(([day, values]) => {
    const highs = values.map((v) => v.main.temp_max);
    const lows = values.map((v) => v.main.temp_min);
    const pops = values.map((v) => v.pop || 0);
    const winds = values.map((v) => v.wind?.speed || 0);
    const midday = values[Math.min(2, values.length - 1)];
    const avgWind = Math.round(winds.reduce((a, b) => a + b, 0) / winds.length);
    const windDir = windDirection(midday.wind?.deg || 0);
    const precipMm = values.reduce((sum, v) => sum + (v.rain?.['3h'] || 0) + (v.snow?.['3h'] || 0), 0);
    const precipIn = precipMm / 25.4;
    return {
      day,
      iconCode: midday.weather?.[0]?.icon || '01d',
      description: midday.weather?.[0]?.description || '',
      high: fahrenheit(Math.max(...highs)),
      low: fahrenheit(Math.min(...lows)),
      pop: `${Math.round(Math.max(...pops) * 100)}%`,
      wind: avgWind >= 20 ? `${avgWind} mph ${windDir}` : null,
      precip: precipIn > 0 ? `${precipIn.toFixed(2)}"` : null
    };
  });

  return {
    current: currentEntry ? {
      temp: fahrenheit(currentEntry.main.temp),
      feelsLike: fahrenheit(currentEntry.main.feels_like),
      description: currentEntry.weather?.[0]?.description || 'Conditions unavailable',
      humidity: `${currentEntry.main.humidity}%`,
      wind: Math.round(currentEntry.wind?.speed || 0) >= 20 ? `${Math.round(currentEntry.wind.speed)} mph ${windDirection(currentEntry.wind.deg || 0)}` : null,
      iconCode: currentEntry.weather?.[0]?.icon || '01d',
      location: env.WEATHER_LABEL || city.name || 'Home',
      sunrise: formatTime(city.sunrise, tzOffset),
      sunset: formatTime(city.sunset, tzOffset)
    } : null,
    forecast
  };
}
