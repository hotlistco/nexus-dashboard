Absolutely — here’s the clean step-by-step for getting **Nexus** running after you unzip it.

## 1. Unzip the file

Put the zip somewhere convenient, then unzip it.

On macOS:

```bash
cd ~/Downloads
unzip nexus-dashboard.zip
```

That should create a folder like:

```text
nexus-dashboard/
  config.xml
  .env.example
  client/
  server/
  README.md
```

## 2. Open two terminal windows

You’ll want:

* one terminal for the **server**
* one terminal for the **client**

The server and client are separate processes.

## 3. Start the server

In terminal window 1:

```bash
cd ~/Downloads/nexus-dashboard/server
npm install
cp ../.env.example .env
```

Now edit the new `.env` file and add your real API keys and Google Tasks credentials.

You can edit it with:

```bash
nano .env
```

At minimum, fill in the providers you want to use:

* `OPENWEATHER_API_KEY`
* `GNEWS_API_KEY`
* `ALPHAVANTAGE_API_KEY`
* either `SERPAPI_API_KEY` or Google Trends API values
* Google Tasks values if you want tasks:

  * `GOOGLE_CLIENT_ID`
  * `GOOGLE_CLIENT_SECRET`
  * `GOOGLE_REFRESH_TOKEN`

Then run the server:

```bash
npm run dev
```

You should see something like:

```text
Nexus server listening on http://localhost:8787
```

Leave that terminal running.

## 4. Test the server quickly

In a browser, open:

```text
http://localhost:8787/api/health
```

You should get JSON back, something like:

```json
{"ok":true,"service":"nexus-dashboard-server"}
```

If that works, your backend is running.

## 5. Start the client

In terminal window 2:

```bash
cd ~/Downloads/nexus-dashboard/client
npm install
printf 'VITE_API_BASE_URL=http://localhost:8787/api\n' > .env.local
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173
```

Open that in your browser.

At that point:

* the **client** runs in the browser
* the **server** runs in the other terminal
* the client calls the server for weather, news, stocks, trends, and tasks

## 6. What each part does

Here’s the split:

### Server

Runs from:

```text
nexus-dashboard/server
```

It does:

* holds API keys safely
* talks to OpenWeather, GNews, Alpha Vantage, SerpApi, Google Tasks
* exposes clean endpoints like:

  * `/api/weather`
  * `/api/news`
  * `/api/stocks`
  * `/api/trends`
  * `/api/tasks`

### Client

Runs from:

```text
nexus-dashboard/client
```

It does:

* renders the TV UI
* rotates between modes
* talks only to your local backend

## 7. When you want to stop it

In each terminal, press:

```text
Ctrl + C
```

## 8. Run it again later

Next time, you do not need to unzip again.

Just reopen the two terminals.

Server:

```bash
cd ~/Downloads/nexus-dashboard/server
npm run dev
```

Client:

```bash
cd ~/Downloads/nexus-dashboard/client
npm run dev
```

## 9. Build the client for Tizen

Once you’re happy with the UI in the browser, build the production client.

From the client folder:

```bash
cd ~/Downloads/nexus-dashboard/client
npm run build
```

That creates:

```text
client/dist/
```

## 10. Prepare the Tizen app files

The Tizen app root is the top-level folder that contains `config.xml`.

So your Tizen app root is:

```text
nexus-dashboard/
```

You need the built client files to live beside `config.xml`.

Copy the built files from `client/dist` into the top-level project folder.

From the project root:

```bash
cd ~/Downloads/nexus-dashboard
cp -R client/dist/* .
```

After that, the top level should contain things like:

```text
config.xml
index.html
assets/
icon.png   <-- if you add one
```

That top-level folder is what you use in **Tizen Studio**.

## 11. Open in Tizen Studio

In Tizen Studio:

1. Open **Tizen Studio**
2. Import or open the project folder:

   ```text
   nexus-dashboard/
   ```
3. Make sure it sees:

   * `config.xml`
   * `index.html`
   * `assets/`

Then you can:

* build for emulator
* run on a Samsung TV
* package the app

## 12. Important note about the backend on a real TV

The Samsung TV app does **not** run your Node server.

The TV only runs the **client**.

That means your **server must run somewhere else** that the TV can reach, such as:

* your Mac
* a mini PC
* a Raspberry Pi
* a NAS
* a cloud VM

For local testing, running it on your Mac is fine.

For actual living-room use, you’ll want the server running on a machine that stays on.

Example:

```text
Mac mini / home server
  └── runs Nexus backend on port 8787

Samsung TV
  └── runs Nexus frontend and calls that backend
```

## 13. Change the client to use your real backend host

For browser testing on the same machine, this is fine:

```env
VITE_API_BASE_URL=http://localhost:8787/api
```

For the TV, `localhost` will mean the TV itself, which is wrong.

So before building for the TV, change `client/.env.local` to your backend machine’s LAN IP, for example:

```env
VITE_API_BASE_URL=http://192.168.1.50:8787/api
```

Then rebuild:

```bash
cd ~/Downloads/nexus-dashboard/client
npm run build
```

And copy `client/dist/*` into the top-level project folder again.

## 14. Recommended real deployment flow

This is the simplest path:

### On your always-on machine

Run the backend:

```bash
cd ~/Downloads/nexus-dashboard/server
npm install
cp ../.env.example .env
nano .env
npm run dev
```

Later, you can turn that into a persistent service.

### On your development machine

Run the frontend for testing:

```bash
cd ~/Downloads/nexus-dashboard/client
npm install
printf 'VITE_API_BASE_URL=http://YOUR-SERVER-IP:8787/api\n' > .env.local
npm run dev
```

### For TV install

```bash
cd ~/Downloads/nexus-dashboard/client
npm run build
cd ..
cp -R client/dist/* .
```

Then open `nexus-dashboard/` in Tizen Studio.

## 15. If something doesn’t load

These are the first things to check:

### Client opens but no data shows

Usually means:

* server is not running
* bad API key
* `VITE_API_BASE_URL` is wrong
* CORS or network issue

### TV app opens but can’t reach backend

Usually means:

* you left `localhost` in `VITE_API_BASE_URL`
* TV and backend are not on same network
* backend machine firewall is blocking port `8787`

### Google Tasks doesn’t work

Usually means:

* bad refresh token
* Tasks API not enabled
* wrong OAuth client config

## 16. Short version

The exact order is:

1. unzip project
2. `cd server && npm install`
3. copy `.env.example` to `server/.env`
4. fill in keys
5. `npm run dev` in `server`
6. `cd client && npm install`
7. create `client/.env.local` pointing to the server
8. `npm run dev` in `client`
9. test in browser
10. `npm run build` in `client`
11. copy `client/dist/*` to the top-level folder next to `config.xml`
12. open that top-level folder in Tizen Studio

If you want, I can give you a **next step guide specifically for Tizen Studio and installing it onto your Samsung TV**.

