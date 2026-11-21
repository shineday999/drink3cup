#!/usr/bin/env node
/**
 * get-gmail-refresh-token.mjs — Gmail OAuth2 one-time refresh token setup
 *
 * 流程:
 *   1. 到 Google Cloud Console 建 OAuth client (Web application)
 *      Authorized redirect URI = http://localhost:3000/oauth2callback
 *   2. 設 env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   3. 跑這個 script → terminal 印 URL → 打開 browser → 按 Allow
 *   4. refresh_token 印在 terminal,加到 /data2/hermes-profiles/profiles/xiaxiq/.env
 *
 * 之後 batch sender 走 OAuth2 XOAUTH2,nodemailer 自動 refresh access token,
 * 不再需要 Gmail app password。
 */
import http from "node:http";
import { URL } from "node:url";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback";
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Need GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in env");
  console.error(
    "  GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/get-gmail-refresh-token.mjs",
  );
  process.exit(1);
}

const authParams = new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope: SCOPES.join(" "),
  access_type: "offline",
  prompt: "consent",
  include_granted_scopes: "true",
});

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams}`;

console.log("=== Step 1: 打開這個 URL ===");
console.log(authUrl);
console.log("");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/oauth2callback") {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("missing code");
    return;
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenRes.json();

  if (tokens.refresh_token) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h1>OK! 關掉這個分頁。</h1>" +
        "<p>refresh_token 已印在 terminal,加進 xiaxiq .env 即可。</p>",
    );
    server.close();
    console.log("");
    console.log("=== Step 3: 加到 .env ===");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    setTimeout(() => process.exit(0), 500);
  } else {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h1>沒拿到 refresh_token。</h1><pre>" +
        JSON.stringify(tokens, null, 2) +
        "</pre>",
    );
    console.error("");
    console.error("=== ERROR: 沒拿到 refresh_token ===");
    console.error("可能你之前已經授權過這 app。");
    console.error("到 https://myaccount.google.com/permissions 撤銷後重跑。");
    console.error(JSON.stringify(tokens, null, 2));
    setTimeout(() => process.exit(1), 500);
  }
});

server.listen(3000, () => {
  console.log(
    "=== Step 2: local server listening on http://localhost:3000 ===",
  );
  console.log("   (按 Allow 後會跳回這裡)");
});
