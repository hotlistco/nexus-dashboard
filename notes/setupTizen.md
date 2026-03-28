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







#From claude after building v2.1

Here's a full review and deployment guide.                                                                                         
                                                                                                                                                                                                            
  ---                                                                                                                                                                                                       
  Issues to fix before building                                                                                                                                                                             
                                                                                                                                                                                                            
  1. Create client/.env.local with your server's LAN IP                                                                                                                                                     
                                                                                                                                                                                                            
  The app defaults to localhost:8787 which the TV can't reach:                                                                                                                                              
                                                                                                                                                                                                            
  echo "VITE_API_BASE_URL=http://YOUR_SERVER_LAN_IP:8787/api" > client/.env.local                                                                                                                           
                                                                                                                                                                                                            
  Replace YOUR_SERVER_LAN_IP with your machine's local IP (e.g. 192.168.1.42).                                                                                                                              
                                                                                                                                                                                                            
  2. Resolve the weather icons symlink                                                                                                                                                                      
                                                            
  Vite copies symlinks as-is, which breaks on the TV. Convert it to a real directory:                                                                                                                       
  
  Read 2 files (ctrl+o to expand)                                                                                                                                                                           
                                                                                                                              
⏺ Bash(readlink -f /Users/basement/projects/hotlistco/nexus-dashboard/client/public/weather-icons)
  ⎿  /Users/basement/projects/hotlistco/weather-icons/production/fill/svg                                                                                                                                   
                                                                                          
  Read 2 files (ctrl+o to expand)                                                                                                                                                                           
                                                                                                                                                                                                            
⏺ Good — the icons exist. The symlink target resolves correctly on your machine but won't on the TV. Fix it now:                                                                                            
                                                                                                                                                                                                            
  cd /Users/basement/projects/hotlistco/nexus-dashboard/client/public                                                                                                                                       
  rm weather-icons                                                                                                                                                                                          
  cp -r /Users/basement/projects/hotlistco/weather-icons/production/fill/svg weather-icons                                                                                                                  
                                                                                                                                                                                                            
  3. Add an icon.png                                                                                                                                                                                        
                                                                                                                                                                                                            
  config.xml references icon.png but it doesn't exist. Tizen Studio will warn or fail without it. Add a 512×512 PNG named icon.png to the project root. A simple placeholder works fine for sideloading — it
   only matters for the app store.
                                                                                                                                                                                                            
  4. Update vite.config.js to follow symlinks and set the correct base                                                                                                                                      
  
  Read 1 file (ctrl+o to expand)                                                                                                                                                                            
                                                            
⏺ Update(client/vite.config.js)       
  ⎿  Added 5 lines, removed 1 line                                                        
       8      host: '0.0.0.0'                                                             
       9    },                                                                                                                                                                                              
      10    build: {                                                                                                                                                                                        
      11 -    outDir: 'dist'                                                                                                                                                                                
      11 +    outDir: 'dist',                                                                                                                                                                               
      12 +    assetsInlineLimit: 0  // never inline assets as base64 — TV file system handles them fine                                                                                                     
      13 +  },                                                                                                                                                                                              
      14 +  resolve: {                                                                                                                                                                                      
      15 +    preserveSymlinks: false  // resolve symlinks so weather-icons copies correctly                                                                                                         
      16    }
      17  });

⏺ 5. Add a build script to automate the dist→root copy
                                                                                          
  Read 1 file (ctrl+o to expand)       
                                                                                                                                                                                                            
⏺ Update(client/package.json)          
  ⎿  Added 1 line                                                                                                                                                                                           
       6    "scripts": {                                                                  
       7      "dev": "vite",                                                                                                                                                                                
       8      "build": "vite build",                                                                                                                                                                        
       9 +    "build:tv": "vite build && cp -r dist/* ..",                                                                                                                                                  
      10      "preview": "vite preview"                                                                                                                                                                     
      11    },                                              
      12    "dependencies": {                                                                                                                                                                               
                                                            
⏺ ---                                  
  Certificate question                                                                    
                      
  Yes, you can reuse the same author certificate for multiple apps. A Tizen author certificate identifies you as the developer, not a specific app. Each app has its own unique Package ID (uYj8h9Nexus in  
  your config.xml) which is what distinguishes them. No conflict. Just select the same author certificate profile in Tizen Studio when building this app.                                                   
                                                                                                                                                                                                            
  ---                                                                                                                                                                                                       
  Step-by-step deployment guide                             
                                                                                                                                                                                                            
  Step 1 — Resolve the weather icons symlink
                                                                                                                                                                                                            
  cd /Users/basement/projects/hotlistco/nexus-dashboard/client/public
  rm weather-icons                                                                                                                                                                                          
  cp -r /Users/basement/projects/hotlistco/weather-icons/production/fill/svg weather-icons                                                                                                                  
                                                                                                                                                                                                            
  Step 2 — Set the server IP                                                                                                                                                                                
                                                                                                                                                                                                            
  echo "VITE_API_BASE_URL=http://YOUR_LAN_IP:8787/api" > /Users/basement/projects/hotlistco/nexus-dashboard/client/.env.local                                                                               
                                                                                                                                                                                                            
  Step 3 — Add icon.png
                                                                                                                                                                                                            
  Drop any 512×512 PNG as icon.png in the project root (/Users/basement/projects/hotlistco/nexus-dashboard/icon.png).                                                                                       
  
  Step 4 — Build and copy to project root                                                                                                                                                                   
                                                            
  cd /Users/basement/projects/hotlistco/nexus-dashboard/client                                                                                                                                              
  npm run build:tv                                          
  After this, your project root should contain index.html, assets/, weather-icons/, fullMoon.png, and config.xml all side by side.
                                                                                                                                                                                                            
  Step 5 — Connect your TV in Tizen Studio
                                                                                                                                                                                                            
  1. Open Tizen Studio → Device Manager                     
  2. Click the remote device icon → Add Device                                                                                                                                                              
  3. Enter your TV's IP address, port 26101                                                                                                                                                                 
  4. Click Connect — the TV should ask to allow the connection, accept it on the TV                                                                                                                         
                                                                                                                                                                                                            
  Step 6 — Import the project                                                                                                                                                                               
                                                                                                                                                                                                            
  1. File → Import → Tizen → Tizen Project                                                                                                                                                                  
  2. Navigate to /Users/basement/projects/hotlistco/nexus-dashboard
  3. Tizen Studio will detect config.xml and import it as a TV Web project                                                                                                                                  
                                                                                                                                                                                                            
  Step 7 — Set signing profile                                                                                                                                                                              
                                                                                                                                                                                                            
  1. Right-click the project → Properties → Tizen Studio → Package → Signing                                                                                                                                
  2. Select your existing author certificate profile        
  3. Click OK                                                                                                                                                                                               
  
  Step 8 — Run on TV                                                                                                                                                                                        
                                                            
  1. Make sure your TV appears as connected in Device Manager                                                                                                                                               
  2. Right-click the project → Run As → Tizen Web Application
  3. Select your TV from the device list                                                                                                                                                                    
  4. Tizen Studio packages, signs, and installs it — the app launches automatically
                                                                                                                                                                                                            
  Step 9 — Keep your server running                                                                                                                                                                         
                                                                                                                                                                                                            
  The TV app connects back to your machine at port 8787. Make sure the Express server is running whenever you want the dashboard to work:                                                                   
  cd /Users/basement/projects/hotlistco/nexus-dashboard/server
  npm start                                                                                                                                                                                                 
  Consider setting it up as a launchd service or using pm2 so it starts automatically when your Mac boots.

  ---                                                                                                                                                                                                       
  After deployment
                                                                                                                                                                                                            
  ┌───────────────┬──────────────────────────────┐          
  │ Remote button │            Action            │
  ├───────────────┼──────────────────────────────┤                                                                                                                                                          
  │ Left / Right  │ Cycle modes                  │
  ├───────────────┼──────────────────────────────┤                                                                                                                                                          
  │ Enter / Play  │ Pause / resume auto-rotation │          
  ├───────────────┼──────────────────────────────┤                                                                                                                                                          
  │ Up / Red      │ Refresh all data             │
  ├───────────────┼──────────────────────────────┤                                                                                                                                                          
  │ Yellow        │ Jump to Stocks               │          
  ├───────────────┼──────────────────────────────┤                                                                                                                                                          
  │ Down / Blue   │ Jump to Tasks                │          
  └───────────────┴──────────────────────────────┘                     










