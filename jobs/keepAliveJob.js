const http = require('http');
const https = require('https');

const KEEP_ALIVE_INTERVAL_MS = 60 * 60 * 1000;

const startKeepAliveJob = () => {
  const pingUrl = process.env.KEEP_ALIVE_URL;

  // Sirf tab chalayega jab public URL set ho (production pe)
  if (!pingUrl) {
    console.log('Keep-alive skipped: KEEP_ALIVE_URL not set');
    return;
  }

  const client = pingUrl.startsWith('https') ? https : http;

  // Pehle hi ek request maar do
  const initialReq = client.get(pingUrl, () => {});
  initialReq.on('error', () => {});
  initialReq.end();

  // Best-effort ping; hosting providers may still suspend idle free services.
  setInterval(() => {
    const req = client.get(pingUrl, () => {});
    req.on('error', () => {});
    req.end();
  }, KEEP_ALIVE_INTERVAL_MS);
};

module.exports = { startKeepAliveJob };
