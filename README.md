# Nexus Samsung TV dashboard

This project gives you a Samsung TV / Tizen web app frontend and a small backend that proxies the live data sources you wanted:

- date and time
- weather (current + 5-day)
- news headlines
- trending searches
- six-stock tracker
- rotating mini learning / quote / fact / vocabulary mode
- Google Tasks mode

## Project layout

- `client/` React UI for the TV
- `server/` Express API proxy for weather, news, stocks, trends, and Google Tasks
- `config.xml` starter Tizen manifest
- `.env.example` environment variable template

## Why there is a backend

For a TV app, putting your API keys and Google OAuth tokens directly in the client is a bad idea. The backend keeps secrets off the TV and normalizes each provider into one clean payload for the dashboard.

## Data providers used

- Weather: OpenWeather
- News: GNews
- Stocks: Alpha Vantage
- Trends: Google Trends API alpha if you have access, otherwise SerpApi fallback
- Tasks: Google Tasks API via `googleapis`

## Local development

### 1) Server

```bash
cd server
npm install
cp ../.env.example .env
# fill in real keys in .env
npm run dev
```

### 2) Client

```bash
cd client
npm install
printf 'VITE_API_BASE_URL=http://localhost:8787/api\n' > .env.local
npm run dev
```

## Google Tasks setup

1. Create a Google Cloud project.
2. Enable the Google Tasks API.
3. Create an OAuth client.
4. Obtain a refresh token for the Google account whose tasks you want to display.
5. Put the client ID, client secret, and refresh token into the server `.env`.

The server then calls Google Tasks and returns a simplified list suitable for the TV UI.

## Tizen packaging flow

1. Run `npm run build` inside `client/`.
2. Copy the built files from `client/dist/` into the Tizen project root beside `config.xml`.
3. Add a launcher icon as `icon.png`.
4. Open the project in Tizen Studio.
5. Edit `config.xml` in the Tizen configuration editor if you want to change app ID, version, or network policy.
6. Build and run on the Samsung TV emulator or device.

## Notes

- The frontend rotates modes every 20 seconds.
- The frontend refreshes data every 5 minutes.
- Alpha Vantage free quotas are limited; if you hit quota often, switch the stocks provider to Finnhub or Polygon.
- Google Trends' official API is in alpha and not generally available yet, so SerpApi is the practical fallback.

## Samsung remote controls

The app now supports Samsung TV remote navigation. On Samsung TVs, `ArrowLeft`, `ArrowRight`, `Enter`, and `Back` are mandatory keys and are available automatically, while optional keys like media and color buttons must be registered through `tizen.tvinputdevice` after declaring the `tv.inputdevice` privilege in `config.xml`. citeturn128043search0turn128043search1

Current bindings:

- Left / Right: previous or next mode
- Enter or Play/Pause: pause or resume auto-rotation
- Up or Red: refresh all data
- Green: jump to News
- Yellow: jump to Stocks
- Blue or Down: jump to Tasks

These same controls also work from a keyboard in desktop browser testing.

## Suggested next improvements

- Burn-in protection via slight pixel drift
- Per-mode schedule by time of day
- Auto-dim at night
- Image-backed weather animations
- A signed-in settings page for choosing stocks and task list
