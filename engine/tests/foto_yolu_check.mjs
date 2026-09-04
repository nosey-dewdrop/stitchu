#!/usr/bin/env node
// foto_yolu_check.mjs — KAPI: "A photo goes in." cumlesi TARAYICIDA dogru mu?
//
// NEDEN VAR (2026-09-04, bagimsiz denetci Tur 5):
//   Canli sitede gercek bir giysi fotografi yuklendiginde /api/analyze'a SIFIR
//   istek gitti ve alicinin ekranina ham bir yigin izi basildi:
//       "Cannot read properties of undefined (reading 'then')"
//   O sirada 8 JS kapisinin 8'i de YESILDI. Kapi seti motoru koruyordu,
//   URETIM YOLUNU korumuyordu. Bu dosya o bosluk.
//
// KOK SEBEP (olculdu, tahmin degil — Cloudflare'in kendi api.js'i okundu):
//   `turnstile.execute()` HICBIR SEY DONDURMEZ. `execute:function` govdesindeki
//   her dal ciplak `return;` ile biter. Eski analyze.js `.execute(...).then(...)`
//   yaziyordu, yani her fotograf yuklemesinin ILK isi TypeError atmakti.
//   MUTASYON KANITI: bu kapiya eski `.then` bicimi geri konuldugunda canli
//   yarim tam olarak denetcinin gordugu cumleyi basiyor:
//     "THREW Cannot read properties of undefined (reading 'then')" + 0 istek.
//
// ⚠ GERI CEKILEN BIR IDDIA (durustluk kaydi): once "display:none host hic
//   cozmuyor" diye olctum (render id donuyor, getResponse 3sn sonra undefined).
//   Ayni kapiya display:none MUTASYONU sokulunca kapi YESIL kaldi — callback
//   yoluyla token 45sn icinde geliyor. Yani ilk olcum erken okumaydi, iddia
//   DOGRULANMADI ve bu kapida bir kural olarak DURMUYOR. Host yine de ekran
//   disinda tutuluyor (zarari yok), ama bu bir yasa degil.
//
// IKI YARIM:
//   A) STATIK — analyze.js kaynagi. Baglayici, her kosuda.
//   B) CANLI  — gercek Chrome, gercek Cloudflare (her yerde gecen TEST sitekey),
//      GERCEK web/js/analyze.js modulu, gercek bir dosya, ve /api/analyze'i
//      dinleyen yerel bir sunucu. "Fotograf girdi mi" sorusunu tek dogru
//      sekilde sorar: girdiyse sunucu bir istek gorur.
//      Chrome yoksa ya da Cloudflare'a cikilamiyorsa B "OLCULMEDI" der ve
//      yesil sayilmaz-ama-kirmizi da degil; A yarisi her halukarda baglayici.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync, mkdtempSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { execFileSync, spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const web = join(root, 'web');

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };
const ok = (m) => console.log('  ok:', m);
const note = (m) => console.log('  NOT MEASURED:', m);

// ---- A. STATIK: kaynak, olculen iki gercekle celisemez ---------------------
// Comments are stripped first: this file's OWN prose quotes the two forbidden
// shapes, and so does analyze.js's warning note. The gate judges CODE.
const src = readFileSync(join(web, 'js/analyze.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/^\s*\/\/.*$/gm, ' ');

// A1 — execute() bir promise degil. Ustunde .then/.catch/await YASAK.
if (/\.execute\s*\([^;]*\)\s*\n?\s*\.(then|catch)/.test(src) || /await\s+window\.turnstile\.execute/.test(src)) {
  fail('analyze.js turnstile.execute() sonucunu promise gibi kullaniyor — '
     + 'execute() undefined doner, bu satir alicinin ekranina TypeError basar');
} else ok('execute() promise gibi kullanilmiyor');

// A2 — token yalnizca render()'in callback'inden gelebilir.
if (!/callback\s*:/.test(src) || !/'error-callback'|"error-callback"/.test(src)) {
  fail('analyze.js render() cagrisinda callback / error-callback yok — token gelecek kapi yok');
} else ok('token render() callback zincirinden aliniyor');

// A3 — render() undefined donebilir; korumasiz birakilamaz.
if (!/undefined|null/.test(src.slice(src.indexOf('turnstile.render'), src.indexOf('turnstile.render') + 1400))) {
  fail('render() undefined donusu icin dal yok — kotu sitekey/hostname ham hata verir');
} else ok('render() basarisizligi okunabilir bir mesaja donuyor');

// ---- B. CANLI: gercek tarayici, gercek modul --------------------------------
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TEST_SITEKEY = '1x00000000000000000000AA'; // Cloudflare'in her zaman gecen cifti

async function liveRun() {
  if (!existsSync(CHROME)) { note(`Chrome yok (${CHROME}) — canli yarim kosulmadi`); return; }

  const dir = mkdtempSync(join(tmpdir(), 'stitchu-foto-'));
  const site = join(dir, 'web');
  cpSync(web, site, { recursive: true });

  // TEK degisiklik: sitekey testinki, backend yerel sunucu. analyze.js'in
  // kendisine DOKUNULMAZ — kapinin oldugu sey tam olarak sevk edilen dosya.
  let resultLine = null;
  let hits = 0;
  let sawToken = null;
  let lastBodyBytes = 0;

  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/analyze') {
      hits += 1;
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => {
        try {
          const j = JSON.parse(body);
          sawToken = j.turnstileToken || null;
          lastBodyBytes = (j.image || '').length;
        } catch { /* gate judges hits/token, a bad body shows up as null */ }
        res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
        res.end(JSON.stringify({ content: [{ text: JSON.stringify({ garment: 'dress' }) }] }));
      });
      return;
    }
    if (url.pathname === '/RESULT') {
      resultLine = decodeURIComponent(url.search.slice(1));
      res.writeHead(200); res.end('');
      return;
    }
    const p = join(site, url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
    if (!p.startsWith(site) || !existsSync(p)) { res.writeHead(404); res.end(''); return; }
    const type = p.endsWith('.js') ? 'text/javascript'
      : p.endsWith('.json') ? 'application/json'
        : p.endsWith('.css') ? 'text/css' : 'text/html';
    res.writeHead(200, { 'content-type': type });
    res.end(readFileSync(p));
  });

  const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
  const origin = `http://localhost:${port}`;

  const cfg = readFileSync(join(site, 'js/config.js'), 'utf8')
    .replace(/export const BACKEND_URL = '[^']*'/, `export const BACKEND_URL = '${origin}'`)
    .replace(/export const TURNSTILE_SITE_KEY = '[^']*'/, `export const TURNSTILE_SITE_KEY = '${TEST_SITEKEY}'`);
  writeFileSync(join(site, 'js/config.js'), cfg);

  // Harness: bir tuval -> gercek bir File -> SEVK EDILEN analyzePhoto().
  writeFileSync(join(site, '__foto-kapi.html'), `<!doctype html><meta charset="utf-8"><body>
<script type="module">
const R = (m) => { new Image().src = '/RESULT?' + encodeURIComponent(m); };
// Turnstile's own iframe raises an opaque cross-origin "Script error." on the
// way to a SUCCESSFUL token (measured in the same probe that found the root
// cause). It is noise, so it is collected, never reported as the verdict.
const noise = [];
window.addEventListener('error', (e) => noise.push(e.message));
try {
  const m = await import('./js/analyze.js?v=gate');
  if (!m.photoAvailable()) { R('photoAvailable=false'); throw new Error('stop'); }
  const c = document.createElement('canvas'); c.width = 1400; c.height = 900;
  const x = c.getContext('2d');
  x.fillStyle = '#e8e2d8'; x.fillRect(0, 0, 1400, 900);
  x.fillStyle = '#2b3a4a'; x.fillRect(430, 120, 540, 700);
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  const file = new File([blob], 'garment.png', { type: 'image/png' });
  const out = await m.analyzePhoto(file);
  R('OK garment=' + out.reading.garment + ' px=' + out.pixels.width + 'x' + out.pixels.height);
} catch (e) { if (e.message !== 'stop') R('THREW ' + e.message + ' | noise: ' + noise.join(' ; ')); }
</script></body>`);

  // ⚠ Headless Chrome DOES NOT reliably exit on this machine (measured: even
  // `--screenshot https://example.com` sat until the 60s kill). So it is never
  // waited on — it is spawned, polled for the beacon, and killed. A gate that
  // blocks on Chrome is a gate that hangs the suite.
  const profile = join(dir, 'chrome-profile');
  const child = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--mute-audio',
    `--user-data-dir=${profile}`, '--window-size=1000,800',
    `${origin}/__foto-kapi.html`,
  ], { stdio: 'ignore', detached: true });

  const deadline = Date.now() + 45000;
  while (resultLine === null && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 250));
  }
  try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already gone */ }
  child.unref();
  await new Promise((r) => setTimeout(r, 300));
  server.closeAllConnections?.();
  server.close();
  try { execFileSync('/usr/bin/pkill', ['-f', `user-data-dir=${profile}`], { stdio: 'pipe' }); } catch { /* none left */ }

  if (resultLine === null) {
    note('tarayici hic cevap donduremedi (Cloudflare\'a cikilamiyor olabilir) — canli yarim olculmedi');
  } else if (resultLine.startsWith('OK ')) {
    ok(`gercek tarayici fotografi gecirdi: ${resultLine}`);
    if (hits !== 1) fail(`/api/analyze ${hits} kez cagrildi, 1 bekleniyordu`);
    else ok('/api/analyze tam 1 kez cagrildi');
    if (!sawToken) fail('istek turnstile token TASIMIYOR — Worker 403 basardi');
    else ok(`istek turnstile token tasiyor (${sawToken.length} karakter)`);
    if (lastBodyBytes < 1000) fail(`gonderilen goruntu ${lastBodyBytes} bayt — kucultme yolu kirik`);
    else ok(`kucultulmus JPEG gonderildi (${lastBodyBytes} base64 bayt)`);
  } else {
    fail(`fotograf yolu tarayicida dustu: ${resultLine}`);
    if (hits === 0) fail('/api/analyze HIC cagrilmadi — denetcinin canlida gordugu tablo');
  }
  rmSync(dir, { recursive: true, force: true });
}

await liveRun();

if (fails) { console.error(`\nfoto_yolu_check FAILED (${fails})`); process.exit(1); }
console.log('foto_yolu_check GREEN: fotograf gercek tarayicida girdi, token tasidi, /api/analyze cagrildi.');
process.exit(0);
