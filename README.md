# Nexus Dashboard

An ambient information display for Samsung Tizen TVs. Cycles through live panels showing news, weather, trending searches, stocks, tasks, and more — all fetched from a small backend that keeps API secrets off the TV.

## What it displays

| Panel | Content |
|---|---|
| NYT Homepage | Top 6 New York Times homepage stories with images |
| NYT Technology | Top 6 NYT Technology section stories with images |
| Weather | Current conditions, moon phase, and 5-day forecast |
| Trending Searches | Top 8 Google Trends with volume, growth %, and breakdown |
| Stocks | Six configurable tickers with price, change, and % |
| Word of the Day | Dictionary word with definition and example sentence |
| Tasks | Open and completed items from Google Tasks |

## Samsung remote controls

| Button | Action |
|---|---|
| Left / Right | Previous / next panel |
| Enter, Play, or Pause | Pause or resume auto-rotation |
| Up or Red | Refresh all data now |
| Yellow | Jump to Stocks |
| Blue or Down | Jump to Tasks |

These same keys work from a keyboard in a desktop browser.

## Project layout

```
nexus-dashboard/
├── client/                  React + Vite frontend (the TV UI)
│   ├── public/
│   │   └── images/
│   │       ├── weather-icons/   Bas Milius SVG weather icons
│   │       └── fullMoon.png     Moon phase base image
│   ├── src/
│   │   ├── App.jsx          All panels and layout
│   │   ├── hooks/
│   │   │   └── useDashboardData.js  Data fetching, mode cycling, remote keys
│   │   └── lib/
│   │       ├── api.js       Thin fetch wrapper for the backend
│   │       └── tizenRemote.js  Tizen key registration
│   └── vite.config.js
├── server/                  Express API proxy (port 8787)
│   ├── src/
│   │   ├── server.js        Routes
│   │   └── providers/       One file per data source
│   │       ├── weather.js   OpenWeather API
│   │       ├── nythome.js   NYT Homepage RSS
│   │       ├── nyttech.js   NYT Technology RSS
│   │       ├── trends.js    SerpApi Google Trends
│   │       ├── stocks.js    Alpha Vantage
│   │       ├── tasks.js     Google Tasks API
│   │       └── wod.js       Local dictionary JSON
│   └── data/
│       └── dictionary-improved.json
├── config.xml               Tizen app manifest
└── icon.png                 App icon shown in TV launcher
```

---

## Developer setup

### Prerequisites

- Node.js 18 or later
- Tizen Studio with TV Extensions (for TV deployment only)
- API keys for the data sources you want to enable (details below)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd nexus-dashboard

cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Create the server environment file

Create `server/.env` from this template:

```dotenv
# Server
PORT=8787

# OpenWeather — https://openweathermap.org/api (free tier)
OPENWEATHER_API_KEY=your_key_here
OPENWEATHER_LAT=40.7128
OPENWEATHER_LON=-74.0060
OPENWEATHER_UNITS=imperial

# SerpApi (Google Trends) — https://serpapi.com (100 free searches/month)
SERPAPI_KEY=your_key_here
SERPAPI_GEO=US-NY         # region code, e.g. US-NY for New York

# Alpha Vantage (stocks) — https://www.alphavantage.co/support/#api-key (free tier)
ALPHA_VANTAGE_API_KEY=your_key_here
STOCK_SYMBOLS=AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA

# Google Tasks OAuth — see setup below
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_TASK_LIST_ID=@default
```

All keys are optional — if a key is missing the panel will show a fallback or empty state rather than crashing.

### 3. Create the client environment file

Create `client/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8787/api
```

When deploying to the TV, change this to your development machine's LAN IP (e.g. `http://192.168.1.50:8787/api`) so the TV can reach the backend.

### 4. Run locally

In two separate terminals:

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Open `http://localhost:5173` in a browser. The dashboard auto-rotates through panels and fetches live data from the backend.

---

## API key acquisition

### OpenWeather

1. Go to https://openweathermap.org/api and create a free account.
2. Under your profile → API keys, copy the default key.
3. Set `OPENWEATHER_API_KEY`, `OPENWEATHER_LAT`, and `OPENWEATHER_LON` in `server/.env`.
4. Find lat/lon for your city at https://openweathermap.org/find.

### SerpApi (Google Trends)

1. Go to https://serpapi.com and create a free account (100 searches/month free).
2. Copy your private API key from the dashboard.
3. Set `SERPAPI_KEY` in `server/.env`.
4. Set `SERPAPI_GEO` to a region code like `US-NY`, `US-CA`, or `US` for national. Find codes at https://serpapi.com/google-trends-api under the `geo` parameter.

### Alpha Vantage (stocks)

1. Go to https://www.alphavantage.co/support/#api-key and claim a free key.
2. Set `ALPHA_VANTAGE_API_KEY` in `server/.env`.
3. Set `STOCK_SYMBOLS` to a comma-separated list of up to ~6 tickers (free tier is rate-limited; more symbols means slower refresh).

### Google Tasks OAuth

1. Go to https://console.cloud.google.com and create a new project (or use an existing one).
2. Enable the **Google Tasks API** under APIs & Services → Library.
3. Go to APIs & Services → Credentials → Create Credentials → OAuth client ID.
4. Choose **Desktop app** as the application type.
5. Download the `client_secret_*.json` file into the `server/` directory.
6. Run the one-time auth flow to get a refresh token:

```bash
cd server
node -e "
const { google } = require('googleapis');
const fs = require('fs');
const file = fs.readdirSync('.').find(f => f.startsWith('client_secret'));
const { client_id, client_secret } = JSON.parse(fs.readFileSync(file)).installed;
const auth = new google.auth.OAuth2(client_id, client_secret, 'urn:ietf:wg:oauth:2.0:oob');
console.log(auth.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/tasks.readonly'] }));
"
```

7. Open the printed URL in your browser, authorize, and copy the code.
8. Exchange the code for tokens:

```bash
node -e "
const { google } = require('googleapis');
const fs = require('fs');
const file = fs.readdirSync('.').find(f => f.startsWith('client_secret'));
const { client_id, client_secret } = JSON.parse(fs.readFileSync(file)).installed;
const auth = new google.auth.OAuth2(client_id, client_secret, 'urn:ietf:wg:oauth:2.0:oob');
auth.getToken('PASTE_CODE_HERE').then(({ tokens }) => console.log(JSON.stringify(tokens, null, 2)));
"
```

9. Copy `refresh_token` from the output into `server/.env` as `GOOGLE_REFRESH_TOKEN`.
10. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the same credentials file.
11. To find your task list ID, run `node -e "require('./src/providers/tasks').getTasks().then(console.log)"` while the server is configured — the default `@default` usually works.

---

## TV deployment

### Step 1 — Install Tizen Studio

1. Download Tizen Studio from https://developer.tizen.org/development/tizen-studio/download.
2. Run the installer, then open **Package Manager** from the Tizen Studio toolbar.
3. Under **Extension SDK**, install **TV Extensions** and **TV Extensions Tools**.

### Step 2 — Create or reuse an author certificate

You only need one author certificate per developer — the same certificate can sign multiple apps.

**If you already have a certificate** from a previous Tizen app, skip to Step 3.

**To create a new certificate:**

1. In Tizen Studio, go to **Tools → Certificate Manager**.
2. Click **+** to add a new certificate profile.
3. Choose **Samsung** (not Tizen) and follow the wizard.
4. You will need a Samsung account. Create one at https://account.samsung.com if needed.
5. At the device registration step, enter your TV's IP address (see Step 4 for how to get it into developer mode).
6. Save the profile — Tizen Studio will use it automatically for all future builds.

### Step 3 — Configure config.xml

Open `config.xml` and update these fields:

```xml
<widget id="com.yourname.nexusdashboard" ...>
  <tizen:application id="YourPkgId.AppName" ... />
```

- **widget id** — a reverse-DNS string you invent, e.g. `com.yourname.nexusdashboard`. Must be globally unique.
- **tizen:application id** — must be `PackageId.AppName` where `PackageId` is exactly 10 alphanumeric characters. This is the ID that appears in Device Manager and on the TV launcher. Choose any 10-character ID that doesn't conflict with your other apps.

If you reuse an existing certificate, the package ID must match the one registered on that certificate. Open **Certificate Manager**, view the profile, and copy the package ID shown there.

### Step 4 — Enable developer mode on the TV

1. On the TV, open **Settings → Support → About This TV** (some models: **Device Care → Self Diagnosis → Reset Smart Hub**). On newer TVs: **Settings → All Settings → Support → Developer Mode**.
2. Toggle **Developer Mode** to On and enter your development machine's IP address.
3. Restart the TV when prompted.
4. After reboot, a "Developer Mode" banner appears on the home screen.

### Step 5 — Connect in Device Manager

1. In Tizen Studio, open **Tools → Device Manager**.
2. Click **Remote Device Manager** (the network icon).
3. Click **+**, enter your TV's IP address, and click **Add**.
4. Toggle the connection switch to On. The TV should show a confirmation prompt — accept it.
5. The device appears as **Connected** in Device Manager.

### Step 6 — Build the client for TV

Update `client/.env.local` to use your LAN IP instead of localhost:

```dotenv
VITE_API_BASE_URL=http://192.168.1.50:8787/api
```

Replace `192.168.1.50` with your actual development machine IP (`ifconfig | grep "inet "` on Mac).

Then build and copy into the project root:

```bash
cd client
npm run build:tv
```

This runs `vite build` and copies everything from `client/dist/` into the repo root alongside `config.xml`.

### Step 7 — Add an icon

Place a 512×423 PNG at the repo root named `icon.png`. This appears in the TV's app launcher.

### Step 8 — Deploy from Tizen Studio

1. Open Tizen Studio and import the project: **File → Import → Tizen → Tizen Project**.
2. Select the repo root (the folder containing `config.xml`).
3. Right-click the project in **Project Explorer** → **Run As → Tizen Web Application**.
4. Tizen Studio signs the package with your certificate, installs it on the TV, and launches it.

To install without launching: **Run As → Run Configurations → Target** → set to your device.

### Step 9 — Keep the backend running

The TV app connects to your backend on port 8787. The backend must be running on your development machine (or a server on the same network) whenever the TV is in use.

For a persistent setup, use pm2:

```bash
npm install -g pm2
cd /path/to/nexus-dashboard/server
pm2 start src/server.js --name nexus-backend
pm2 save
pm2 startup   # follow the printed command to auto-start on login
```

---

## Rebuilding after changes

```bash
# After any client change:
cd client && npm run build:tv

# Re-deploy from Tizen Studio (right-click → Run As → Tizen Web Application)
```

No re-deploy needed for backend-only changes — just restart the server.

---

## Data refresh schedule

| Source | Interval |
|---|---|
| All panels | Every 5 minutes (automatic) |
| Manual refresh | Up arrow or Red button on remote |

---

## Architecture notes

**Why there is a backend**: API keys cannot be safely embedded in a TV web app — the app bundle is accessible on the device. The Express backend keeps all secrets server-side and presents a single clean JSON API to the frontend.

**Why RSS for NYT**: The New York Times Developer API requires an application key and rate-limits requests. The public RSS feeds require no credentials, have no rate limits, and include enough data (title, description, image URL, publish date) for an ambient display.

**Why SerpApi for trends**: Google Trends does not have a stable public API. SerpApi provides a reliable paid-but-generous-free-tier wrapper around it.

**Weather icons**: The icons in `client/public/images/weather-icons/` are from the Bas Milius weather-icons project (MIT license). They are stored as actual SVG files rather than symlinks so they survive the Vite build and the `build:tv` copy step.
