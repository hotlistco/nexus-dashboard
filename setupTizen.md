Perfect — here’s a **step-by-step guide to get Nexus running on your Samsung TV using Tizen Studio**. This assumes you already have the project running locally (server + client).

---

# 🧭 OVERVIEW (What you're doing)

You will:

1. Install Tizen Studio
2. Enable developer mode on your TV
3. Connect your TV to your computer
4. Build the Nexus app
5. Install it on the TV
6. Point it to your backend server

---

# 🧱 STEP 1 — Install Tizen Studio

👉 Download:
[https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html)

### During install:

Make sure you include:

* **TV Extension**
* **Web App Development tools**
* **Tizen SDK Tools**

---

# 📺 STEP 2 — Enable Developer Mode on your Samsung TV

On your TV:

1. Open **Apps**
2. Press:

   ```
   1 2 3 4 5 (on remote)
   ```
3. Enable **Developer Mode**
4. Enter your computer’s IP address
5. Restart the TV

---

# 💻 STEP 3 — Find your computer’s IP

On your Mac:

```bash
ipconfig getifaddr en0
```

Example:

```text
192.168.1.50
```

👉 This must match what you entered on the TV

---

# 🔌 STEP 4 — Connect TV to Tizen Studio

Open **Tizen Studio**

### Go to:

```
Tools → Device Manager
```

### Add device:

* Name: `SamsungTV`
* IP: your TV’s IP (NOT your computer’s)
* Port: `26101`

Click **Connect**

You should see:

```text
Connected: SamsungTV
```

---

# 📁 STEP 5 — Prepare Nexus project for Tizen

Make sure your project root looks like:

```text
nexus-dashboard/
  config.xml   ✅
  index.html   ✅
  assets/      ✅
```

If not, fix it:

```bash
cd nexus-dashboard/client
npm run build

cd ..
cp -R client/dist/* .
```

---

# 🌐 STEP 6 — IMPORTANT: Update backend URL for TV

Your TV cannot use `localhost`.

Edit:

```bash
client/.env.local
```

Change to your computer/server IP:

```env
VITE_API_BASE_URL=http://192.168.1.50:8787/api
```

Then rebuild:

```bash
cd client
npm run build

cd ..
cp -R client/dist/* .
```

---

# 📦 STEP 7 — Import project into Tizen Studio

In Tizen Studio:

1. Go to:

   ```
   File → Import
   ```
2. Select:

   ```
   Tizen → Tizen Web Project
   ```
3. Choose:

   ```
   nexus-dashboard/
   ```

---

# ⚙️ STEP 8 — Verify config.xml

Open `config.xml` in Tizen Studio UI editor.

Make sure:

* App name = **Nexus**
* Profile = **tv-samsung**
* Privileges include:

  * internet
  * tv.inputdevice

You already have this, so just confirm.

---

# 🔨 STEP 9 — Build the app

Right-click project → **Build Project**

If successful, you’ll see:

```text
Build Successful
```

---

# 🚀 STEP 10 — Run on your TV

Right-click project → **Run As → Tizen Web Application**

Select your TV device.

---

# 🎉 RESULT

Your TV should launch:

👉 **Nexus Dashboard**

* time + weather
* rotating content modes
* stock strip
* remote control works

---

# 🧠 STEP 11 — Keep backend running

Your TV depends on your backend.

So make sure this is always running:

```bash
cd nexus-dashboard/server
npm run dev
```

👉 For real usage later, you’ll want:

* a Mac mini / NAS / server running 24/7

---

# 🧯 TROUBLESHOOTING

## ❌ App installs but shows blank screen

* Wrong `VITE_API_BASE_URL`
* Backend not running
* CORS issue

---

## ❌ TV can’t connect to server

* TV and server not on same network
* Firewall blocking port `8787`

Test from another device:

```bash
curl http://192.168.1.50:8787/api/health
```

---

## ❌ Remote controls not working

Make sure `config.xml` includes:

```xml
<tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>
```

---

## ❌ Build fails

Usually:

* missing `index.html` in root
* forgot to copy `client/dist`

---

# 🔥 NEXT LEVEL (optional but highly recommended)

## 1. Run backend as a service

Instead of `npm run dev`, use:

* PM2
* Docker
* systemd

---

## 2. Add local hostname

Instead of IP:

```text
http://nexus.local:8787
```

---

## 3. Auto-launch on TV startup

Samsung supports:

* auto-run apps on power-on (via settings / dev tools)

---

# 🚀 If you want next

I can help you:

* set up **Google Tasks OAuth properly (step-by-step)**
* deploy backend to a **NAS / Docker / cloud**
* add **settings screen to Nexus (choose stocks, etc.)**
* make Nexus feel like a **real OS (boot screen, transitions, etc.)**

Just tell me 👍


