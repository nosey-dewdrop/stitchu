# Deploy the Stitchu API Worker

This Worker proxies the Anthropic garment-analysis call so the app never ships
an API key. Do this once (and again whenever worker.js changes).

## 1. Install wrangler (once)

```
npm install -g wrangler
wrangler login
```

## 2. (Optional) Create the rate-limit KV namespace

```
cd backend
npx wrangler kv namespace create RATE_LIMIT
```

Copy the returned `id` into `wrangler.toml` (replace `REPLACE_WITH_KV_NAMESPACE_ID`).
Skip this and delete the `[[kv_namespaces]]` block if you don't want rate limiting.

## 3. Set the secrets (never committed)

```
npx wrangler secret put CLAUDE_API_KEY
# paste your Anthropic sk-ant- key when prompted

npx wrangler secret put APP_TOKEN
# paste a long random string (e.g. `openssl rand -hex 32`)
```

- `CLAUDE_API_KEY` — the real Anthropic key. Lives only in Cloudflare.
- `APP_TOKEN` — shared secret between the app and the Worker. Put the SAME value
  in the app's `App/Stitchu/Secrets.swift` (`appToken`).

## 4. Deploy

```
npx wrangler deploy
```

Wrangler prints the Worker URL, e.g. `https://stitchu-api.<you>.workers.dev`.
Put that URL in `App/Stitchu/Secrets.swift` (`backendURL`), pointing at the
`/api/analyze` route: `https://stitchu-api.<you>.workers.dev/api/analyze`.

## 5. Smoke test

```
curl -X POST https://stitchu-api.<you>.workers.dev/api/analyze \
  -H "x-app-token: YOUR_APP_TOKEN" \
  -H "content-type: application/json" \
  -d '{"image":"<base64 jpeg>"}'
```

A missing/wrong `x-app-token` returns 401. A valid call returns the Anthropic
messages response body.

## Endpoint

`POST /api/analyze`
Headers: `x-app-token: <APP_TOKEN>`, `content-type: application/json`
Body: `{ "image": "<base64 jpeg>", "mediaType": "image/jpeg" }`
Returns: the raw Anthropic `/v1/messages` response (the app parses `content[].text`).
