// indexnow-ping.mjs — submit every live URL to IndexNow (Bing + Yandex + Seznam
// index it near-instantly; Google reads the same signal indirectly). Run after a
// deploy so new/changed pages get crawled without waiting for a natural crawl.
//
// The key file (web/<KEY>.txt containing <KEY>) must be live at the site root so
// IndexNow can verify ownership. Host and key are read from that file + the
// sitemap, so there is one source of truth and no hardcoded list to drift.
//
//   node engine/tools/indexnow-ping.mjs            submit all sitemap URLs
//   node engine/tools/indexnow-ping.mjs --dry      print what would be sent
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const WEB = join(here, '../../web');
const HOST = 'stitchu.noseydewdrop.com';
const dry = process.argv.includes('--dry');

// Key = the <hex>.txt file sitting in web/ root (IndexNow ownership proof).
const keyFile = readdirSync(WEB).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) { console.error('IndexNow key file (web/<32hex>.txt) not found'); process.exit(1); }
const key = keyFile.replace('.txt', '');

// URLs = everything in the sitemap (single source; already deduped + canonical).
const sitemap = readFileSync(join(WEB, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) { console.error('no <loc> URLs in sitemap.xml'); process.exit(1); }

console.log(`IndexNow: ${urls.length} URLs, host ${HOST}, key ${key.slice(0, 8)}...`);
if (dry) { urls.forEach((u) => console.log('  ' + u)); process.exit(0); }

// IndexNow accepts up to 10,000 URLs per POST. One batch is plenty here.
const body = { host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls };
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
// 200 or 202 = accepted. 422 = key/host mismatch. 403 = key not verifiable yet.
console.log(`IndexNow response: HTTP ${res.status} ${res.statusText}`);
if (res.status === 403) console.log('  403 = key file not reachable at site root yet (deploy it first).');
if (res.status === 422) console.log('  422 = host/key mismatch, check the key file.');
process.exit(res.status < 400 ? 0 : 2);
