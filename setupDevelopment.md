Here’s the easiest way to set up your **Nexus development environment** on macOS.

## What you’ll install

You need:

* **Node.js**
* **npm** (comes with Node)
* **Tizen Studio**
* a code editor like **VS Code**
* the **Nexus project** unzipped locally

You’ll run:

* the **server** in one terminal
* the **client** in another terminal
* optionally **Tizen Studio** for TV deployment

---

## 1. Install Node.js

Check whether you already have it:

```bash
node -v
npm -v
```

If those fail, install Node.

### Recommended way on macOS

Using Homebrew:

```bash
brew install node
```

Then verify:

```bash
node -v
npm -v
```

---

## 2. Install a code editor

VS Code is the simplest choice.

After installing it, open the project folder in VS Code:

```bash
code ~/Downloads/nexus-dashboard
```

If `code` is not found, open VS Code manually and choose:

* **File → Open Folder**
* select `nexus-dashboard`

---

## 3. Unzip the Nexus project

Put the zip somewhere convenient, then unzip it.

Example:

```bash
cd ~/Downloads
unzip nexus-dashboard.zip
```

You should end up with:

```text
nexus-dashboard/
  config.xml
  .env.example
  client/
  server/
  README.md
```

---

## 4. Create your two working terminals

Open **two Terminal windows**.

You’ll use:

* Terminal 1 = backend server
* Terminal 2 = frontend client

---

## 5. Set up the backend

In Terminal 1:

```bash
cd ~/Downloads/nexus-dashboard/server
npm install
cp ../.env.example .env
```

Now edit the env file:

```bash
nano .env
```

Fill in the keys you actually want to use:

* weather
* news
* stocks
* trends
* Google Tasks

Save and exit:

* `Ctrl + O`
* `Enter`
* `Ctrl + X`

Then start the backend:

```bash
npm run dev
```

You should see:

```text
Nexus server listening on http://localhost:8787
```

Leave that terminal running.

---

## 6. Set up the frontend

In Terminal 2:

```bash
cd ~/Downloads/nexus-dashboard/client
npm install
printf 'VITE_API_BASE_URL=http://localhost:8787/api\n' > .env.local
npm run dev
```

Vite will print a local URL, usually something like:

```text
http://localhost:5173
```

Open that in your browser.

---

## 7. Verify everything works

Test the backend directly in a browser:

```text
http://localhost:8787/api/health
```

You should get JSON.

Then open the frontend URL from Vite.

If both are running:

* backend serves API data
* frontend renders Nexus
* frontend calls backend using `VITE_API_BASE_URL`

---

## 8. Recommended folder workflow

Use this structure:

```text
~/Projects/nexus-dashboard
```

If you want, move it there:

```bash
mkdir -p ~/Projects
mv ~/Downloads/nexus-dashboard ~/Projects/
```

Then use:

```bash
cd ~/Projects/nexus-dashboard
```

That keeps it in a cleaner permanent location.

---

## 9. Recommended VS Code workflow

Open the root folder:

```bash
code ~/Projects/nexus-dashboard
```

Then keep these files handy:

* `server/.env`
* `server/src/server.js`
* `server/src/providers/tasks.js`
* `client/src/App.jsx`
* `config.xml`

That will cover most of your development.

---

## 10. Install Tizen Studio

You only need this when you want to run Nexus on the Samsung TV or emulator.

Install:

* **Tizen Studio**
* **TV Extension**
* **Web tools**

After install, you’ll use it to:

* import the top-level Nexus folder
* build the Tizen app
* deploy to the TV

---

## 11. Build the client for Tizen

When you’re ready to push the UI into the TV project:

```bash
cd ~/Projects/nexus-dashboard/client
npm run build
```

Then copy the built files to the project root beside `config.xml`:

```bash
cd ~/Projects/nexus-dashboard
cp -R client/dist/* .
```

Your top-level folder should then contain:

* `config.xml`
* `index.html`
* `assets/`

That top-level folder is what Tizen Studio wants.

---

## 12. Daily development routine

Each time you work on it:

### Terminal 1

```bash
cd ~/Projects/nexus-dashboard/server
npm run dev
```

### Terminal 2

```bash
cd ~/Projects/nexus-dashboard/client
npm run dev
```

Then open the frontend URL in your browser.

---

## 13. If you want your TV to use the backend

For browser testing:

```env
VITE_API_BASE_URL=http://localhost:8787/api
```

For the TV:
replace `localhost` with the IP of the machine running the backend, for example:

```env
VITE_API_BASE_URL=http://192.168.1.50:8787/api
```

Then rebuild:

```bash
cd ~/Projects/nexus-dashboard/client
npm run build
cd ..
cp -R client/dist/* .
```

---

## 14. Common problems

### `npm install` fails

Usually means Node is missing or too old.

Check:

```bash
node -v
npm -v
```

### Frontend loads but no data appears

Usually:

* backend not running
* bad `.env`
* wrong `VITE_API_BASE_URL`

### TV app works in browser but not on TV

Usually:

* still pointing to `localhost`
* backend machine firewall blocking port `8787`

---

## 15. Nice-to-have tools

Helpful but optional:

* **iTerm2** for better terminals
* **nvm** for Node version management
* **Postman** or **Insomnia** to test API endpoints
* **jq** for viewing JSON in terminal

Example:

```bash
curl http://localhost:8787/api/tasks | jq
```

---

## 16. Best next setup after this

Once everything is running, the best next improvements are:

* put the project in `~/Projects`
* get Google Tasks OAuth working
* set the backend to run from a machine that stays on
* use Tizen Studio to deploy to your TV

The next most useful thing I can give you is a **copy-paste bootstrap script that sets up the whole local environment in one shot**.


