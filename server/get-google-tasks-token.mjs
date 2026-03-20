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
