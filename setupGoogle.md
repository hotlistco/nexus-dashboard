Here’s the cleanest way to set up **Google Tasks OAuth** for your Nexus backend so it can read your task list without prompting every time. Google’s current Tasks quickstarts say to enable the Tasks API, configure the Google Auth platform, and create an OAuth client. For local command-line apps, Google’s official quickstarts use a **Desktop app** OAuth client. ([Google for Developers][1])

## What you’re setting up

Your Nexus backend needs these three values in `server/.env`:

* `GOOGLE_CLIENT_ID`
* `GOOGLE_CLIENT_SECRET`
* `GOOGLE_REFRESH_TOKEN`

The goal is to do a **one-time consent flow**, capture a refresh token, then store it in `.env` so the server can keep fetching tasks later. Google recommends using the OAuth client type that matches the platform; for a local token-generation script, that’s a **Desktop app** client. ([Google for Developers][2])

---

## Step 1: Create or choose a Google Cloud project

Go to Google Cloud Console and either:

* create a new project for Nexus, or
* use an existing one dedicated to this app

Google’s Tasks quickstarts require a Google Cloud project before enabling the API and creating OAuth credentials. ([Google for Developers][1])

---

## Step 2: Enable the Google Tasks API

In the Google Cloud Console:

* open your project
* go to **APIs & Services**
* search for **Google Tasks API**
* click **Enable**

Google’s official quickstarts list this as the first setup step before OAuth configuration. ([Google for Developers][1])

---

## Step 3: Configure the Google Auth platform / consent screen

In Google Cloud Console:

* go to **Google Auth platform**
* open **Branding**
* click **Get started** if it is not configured yet

Fill in:

* **App name**: `Nexus`
* **User support email**: your email
* **Developer contact info**: your email

Google’s current docs describe the consent screen setup under Google Auth platform, with Branding, Audience, and Data Access. ([Google for Developers][3])

### Audience

For personal use, choose **External** unless you are using a Workspace org and want internal-only access.

### Test users

If the app is still in testing, add the Google account you’ll use for tasks as a **test user**.

This is important because if the OAuth app is not published, only listed test users can authorize it. That behavior follows Google’s Auth platform flow described in their quickstarts and consent configuration. ([Google for Developers][3])

---

## Step 4: Create the OAuth client

Go to:

* **Google Auth platform**
* **Clients**
* **Create client**

Choose:

* **Application type**: **Desktop app**

Name it something like:

* `Nexus Local Tasks Token Helper`

Google’s Node and Python Tasks quickstarts explicitly use a **Desktop app** OAuth client for local apps. ([Google for Developers][1])

After creation, copy these values:

* **Client ID**
* **Client secret**

You’ll put those into:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Step 5: Decide what redirect approach you want

You have two good options.

### Option A — easiest

Use a small local script that opens a browser and handles the callback automatically.

### Option B — manual

Generate an authorization URL, paste the returned code, and exchange it for tokens manually.

Because your backend only needs a refresh token once, **Option B is often simplest**.

---

## Step 6: Generate a refresh token

Your app needs OAuth access to Google Tasks. The refresh token is what lets the server continue working later without you logging in every time. Google’s Tasks docs describe storing the refresh token after the user grants access, then using it later to read tasks. ([Google for Developers][4])

### Use this scope

For read/write access to tasks:

```text
https://www.googleapis.com/auth/tasks
```

If you want read-only, use:

```text
https://www.googleapis.com/auth/tasks.readonly
```

For your dashboard, read-only is enough unless you plan to complete or edit tasks from the TV.

---

## Step 7: One-time token helper script

Inside your `server/` folder, create a file named `get-google-tasks-token.mjs` with this code:

```js
import http from 'node:http';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:3000/oauth2callback';

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
console.log('\nWaiting for OAuth callback on http://127.0.0.1:3000/oauth2callback ...\n');

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url.startsWith('/oauth2callback')) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const url = new URL(req.url, 'http://127.0.0.1:3000');
    const code = url.searchParams.get('code');

    if (!code) {
      res.writeHead(400);
      res.end('Missing code');
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Success. You can close this tab and return to the terminal.');

    console.log('\nTokens received:\n');
    console.log(JSON.stringify(tokens, null, 2));

    console.log('\nPut these in server/.env:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token || ''}`);

    server.close();
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('OAuth error');
    server.close();
  }
});

server.listen(3000, '127.0.0.1');
```

---

## Step 8: Add a redirect URI

For the script above, go back to your OAuth client settings and make sure this redirect URI is allowed if Google asks for it in that client flow:

```text
http://127.0.0.1:3000/oauth2callback
```

For **Desktop app** clients, Google generally supports loopback redirect handling for local installed apps, which is why their quickstarts use local/browser-based flows for command-line apps. ([Google for Developers][1])

---

## Step 9: Run the token helper

In your terminal:

```bash
cd ~/Downloads/nexus-dashboard/server
npm install
export GOOGLE_CLIENT_ID='your-client-id'
export GOOGLE_CLIENT_SECRET='your-client-secret'
node get-google-tasks-token.mjs
```

It will print a Google authorization URL.

Open it in your browser:

* sign in with the Google account whose tasks you want
* approve access

When redirected back, the terminal will print a token object including a `refresh_token`.

---

## Step 10: Put the values into `server/.env`

Edit your server env file:

```bash
nano .env
```

Add:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_TASKS_LIST=My Tasks
```

Your existing project already expects these variables based on its `.env.example`.

---

## Step 11: Start the Nexus server

```bash
cd ~/Downloads/nexus-dashboard/server
npm run dev
```

The backend should now be able to exchange the refresh token for access tokens and call Google Tasks.

---

## Step 12: Verify Google Tasks is working

Open:

```text
http://localhost:8787/api/tasks
```

If everything is correct, you should get task data back as JSON.

If it fails, the most common causes are:

* wrong Google account not added as a test user
* Tasks API not enabled
* bad client ID or secret
* refresh token missing
* refresh token was issued without offline access
* you reused an already-approved flow and Google did not return a new refresh token

---

## Important gotcha: refresh token not returned

Google often only returns a refresh token the **first time** a user consents for that client/scope combination. To reliably force a refresh token in a one-time setup flow, include:

* `access_type: 'offline'`
* `prompt: 'consent'`

That matches Google’s OAuth behavior for installed apps and web flows. ([Google for Developers][4])

If you still don’t get one:

* revoke the app’s access in your Google account security settings
* then rerun the token helper

---

## Recommended scope for Nexus

Use this:

```text
https://www.googleapis.com/auth/tasks.readonly
```

That’s the safer choice for a display dashboard since it only needs to read tasks.

---

## Production note

Your Samsung TV app should **not** perform Google OAuth directly. Keeping Google OAuth in the backend is the right design because it keeps secrets and refresh tokens off the TV. Google’s quickstarts also separate client-side sample auth from server-side and local command-line auth depending on platform. ([Google for Developers][3])

---

## Exact checklist

Do these in order:

1. create/select Google Cloud project
2. enable Google Tasks API
3. configure Google Auth platform branding/audience
4. add yourself as test user
5. create OAuth client as **Desktop app**
6. copy client ID and secret
7. run a one-time local token helper
8. authorize your Google account
9. capture `refresh_token`
10. put it into `server/.env`
11. run `npm run dev` in `server/`
12. test `/api/tasks`

---

## Practical recommendation for your project

Because your server already uses `googleapis`, the cleanest path is:

* keep the TV app unchanged
* generate the refresh token once on your Mac
* store it in `server/.env`
* let the backend do the rest

I can also give you a **copy-paste-ready `get-google-tasks-token.mjs` file tailored exactly to your Nexus server folder**, plus the exact code change to add a `/api/tasks/debug` endpoint so you can confirm which task list name Google is returning.

[1]: https://developers.google.com/workspace/tasks/quickstart/nodejs?utm_source=chatgpt.com "Node.js quickstart  |  Google Tasks  |  Google for Developers"
[2]: https://developers.google.com/identity/protocols/oauth2/policies?utm_source=chatgpt.com "OAuth 2.0 Policies  |  Google for Developers"
[3]: https://developers.google.com/workspace/tasks/quickstart/js?utm_source=chatgpt.com "JavaScript quickstart  |  Google Tasks  |  Google for Developers"
[4]: https://developers.google.com/workspace/tasks/oauth-authorization-callback-handler?utm_source=chatgpt.com "Build Authorization Callback Handler  |  Google Tasks  |  Google for Developers"



