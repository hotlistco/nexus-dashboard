Add this file in `nexus-dashboard/server/get-google-tasks-token.mjs`:

```js
import http from 'node:http';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || 'http://127.0.0.1:3000/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = ['https://www.googleapis.com/auth/tasks.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes,
});

console.log('\nOpen this URL in your browser:\n');
console.log(authUrl);
console.log(`\nWaiting for callback on ${REDIRECT_URI}\n`);

const callbackUrl = new URL(REDIRECT_URI);

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `${callbackUrl.protocol}//${callbackUrl.host}`);

    if (reqUrl.pathname !== callbackUrl.pathname) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const code = reqUrl.searchParams.get('code');
    const error = reqUrl.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(`OAuth error: ${error}`);
      console.error(`OAuth error: ${error}`);
      server.close();
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing code');
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Success. Return to the terminal and copy the refresh token.');

    console.log('\nReceived tokens:\n');
    console.log(JSON.stringify(tokens, null, 2));

    console.log('\nPut these values in server/.env:\n');
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_REDIRECT_URI=${REDIRECT_URI}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token || ''}`);

    if (!tokens.refresh_token) {
      console.log('\nNo refresh token was returned.');
      console.log('Revoke the app in your Google account and run this again.');
    }

    server.close();
  } catch (err) {
    console.error('\nToken exchange failed:\n', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Token exchange failed');
    server.close();
  }
});

server.listen(Number(callbackUrl.port), callbackUrl.hostname, () => {
  console.log(`Listening on ${callbackUrl.origin}${callbackUrl.pathname}`);
});
```

Then update `server/package.json` so it includes a helper script. Replace it with this:

```json
{
  "name": "nexus-dashboard-server",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "google-tasks-token": "node get-google-tasks-token.mjs"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.1",
    "googleapis": "^149.0.0"
  }
}
```

Now add a debug endpoint in `server/src/server.js`. Use this version:

```js
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
```

Then use this exact process.

First, edit `server/.env` and set at least these:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:3000/oauth2callback
GOOGLE_TASKS_LIST=My Tasks
```

Leave `GOOGLE_REFRESH_TOKEN=` blank for now.

Next, in Terminal:

```bash
cd ~/Downloads/nexus-dashboard/server
npm install
npm run google-tasks-token
```

That prints a Google auth URL.

Open it in your browser, sign in, approve access, then copy the printed refresh token into `server/.env`:

```env
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

Then start the backend:

```bash
npm run dev
```

Now verify the task lists Google is actually returning:

```text
http://localhost:8787/api/tasks/debug
```

That response will show:

* every available task list title
* which one matched `GOOGLE_TASKS_LIST`
* a few sample tasks from that list

If `matchedTaskList` is `null`, copy one of the exact returned titles into:

```env
GOOGLE_TASKS_LIST=exact title here
```

Then restart the server.

Finally test the real app endpoint:

```text
http://localhost:8787/api/tasks
```

That should be the cleaned-up payload the Nexus frontend uses.

Most common failure points:

* `GOOGLE_TASKS_LIST` does not exactly match the real Google list name
* no refresh token was returned
* you changed the OAuth client after generating the token
* the Tasks API is not enabled
* the wrong Google account approved the app

If you want, I can also give you a ready-to-paste `tasks.js` provider that matches this debug flow exactly.


