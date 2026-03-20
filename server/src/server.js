import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { getWeather } from './providers/weather.js';
import { getNews } from './providers/news.js';
import { getStocks } from './providers/stocks.js';
import { getTrends } from './providers/trends.js';
import { getTasks } from './providers/tasks.js';

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json());

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

app.get('/api/tasks/debug', async (_req, res) => {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://127.0.0.1:3000/oauth2callback'
    );

    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const tasks = google.tasks({ version: 'v1', auth });

    const listsResponse = await tasks.tasklists.list({ maxResults: 100 });
    const taskLists = listsResponse.data.items || [];

    const selectedName = process.env.GOOGLE_TASKS_LIST || 'My Tasks';
    const selectedList =
      taskLists.find((list) => list.title === selectedName) || null;

    let sampleTasks = [];
    if (selectedList?.id) {
      const tasksResponse = await tasks.tasks.list({
        tasklist: selectedList.id,
        maxResults: 10,
        showCompleted: true,
        showHidden: false,
      });

      sampleTasks = (tasksResponse.data.items || []).map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        due: task.due,
      }));
    }

    res.json({
      ok: true,
      configuredTaskListName: selectedName,
      availableTaskLists: taskLists.map((list) => ({
        id: list.id,
        title: list.title,
      })),
      matchedTaskList: selectedList
        ? { id: selectedList.id, title: selectedList.title }
        : null,
      sampleTasks,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || 'Google Tasks debug failed',
    });
  }
});

app.listen(port, () => {
  console.log(`Nexus server listening on http://localhost:${port}`);
});

