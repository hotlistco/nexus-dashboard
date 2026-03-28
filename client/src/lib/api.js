const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';

async function readJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

export const dashboardApi = {
  getWeather: () => readJson('/weather'),
  getNews: () => readJson('/news'),
  getTrends: () => readJson('/trends'),
  getStocks: () => readJson('/stocks'),
  getTasks: () => readJson('/tasks'),
  getHealth: () => readJson('/health'),
  getWod: () => readJson('/wod'),
  getNytHome: () => readJson('/nythome')
};
