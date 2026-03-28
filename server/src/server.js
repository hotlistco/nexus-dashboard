import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getWeather } from './providers/weather.js';
import { getNews } from './providers/news.js';
import { getStocks } from './providers/stocks.js';
import { getTrends } from './providers/trends.js';
import { getTasks } from './providers/tasks.js';
import { getWod } from './providers/wod.js';

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({
    endpoints: [
      'GET /api/health',
      'GET /api/weather',
      'GET /api/news',
      'GET /api/stocks',
      'GET /api/trends',
      'GET /api/tasks',
      'GET /api/wod',
    ]
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'nexus-dashboard-server' });
});

function route(handler) {
  return async (_req, res) => {
    try {
      const payload = await handler(process.env);
      res.json(payload);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Unexpected server error' });
    }
  };
}

app.get('/api/weather', route(getWeather));
app.get('/api/news', route(getNews));
app.get('/api/stocks', route(getStocks));
app.get('/api/trends', route(getTrends));
app.get('/api/tasks', route(getTasks));
app.get('/api/wod', route(getWod));

app.listen(port, () => {
  console.log(`Nexus server listening on http://localhost:${port}`);
});
