#!/usr/bin/env node
// v10-e-olcu.mjs — ekran görüntüsü + WCAG 2.2 SC 1.4.10 (Reflow) taşma ölçümü.
// SIFIR npm bağımlılığı: diskteki Google Chrome + Node'un yerleşik WebSocket'i (v22+).
//
//   node GECE/v10-e-olcu.mjs <W> <H> <cikti-dizini|-> <sayfa...>
//   ör: node GECE/v10-e-olcu.mjs 320 640 GECE/log/V10-E.png index create api
//       node GECE/v10-e-olcu.mjs 320 640 -  index          (sadece ölçüm)
//
// NEDEN CDP, NEDEN DÜZ CLI DEĞİL — ÖLÇÜLDÜ:
//   `--headless=new --window-size=320,640` bu makinede pencereyi 320'ye İNDİRMİYOR;
//   sayfa 500 CSS px genişlikte açılıyor (document.documentElement.clientWidth = 500).
//   Yani düz CLI ile 320px reflow ölçümü YAPILAMAZ. Çözüm: Chrome'u
//   --remote-debugging-port ile açıp Emulation.setDeviceMetricsOverride ile
//   viewport'u tam 320'ye zorlamak. Yeni bağımlılık kurulmadı.
//
// Ölçüm body{overflow-x:hidden}'a GÜVENMEZ: taşmayı clipleyen bütün atalar
// geçici olarak overflow:visible yapılır, GİZLENEN taşma da sayılır.
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const WEB = join(ROOT, 'web');

const W = Number(process.argv[2] || 320);
const H = Number(process.argv[3] || 640);
const OUT = process.argv[4] || '-';
const PAGES = process.argv.slice(5);
if (!PAGES.length) { console.error('kullanim: node GECE/v10-e-olcu.mjs <W> <H> <cikti|-> <sayfa...>'); process.exit(2); }
if (OUT !== '-') mkdirSync(resolve(ROOT, OUT), { recursive: true });

const PROBE = `(function () {
  function sel(el) {
    if (el === document.documentElement) return 'html';
    if (el === document.body) return 'body';
    var s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      var c = el.className.trim().split(/\\s+/).slice(0, 3).join('.');
      if (c) s += '.' + c;
    }
    return s;
  }
  var all = document.querySelectorAll('*');
  // kendi icinde yatay kayan kutular (overflow-x auto/scroll) — WCAG 1.4.10 bunlari
  // "iki boyutlu yerlesim gerektiren icerik" istisnasinda sayar, SAYFAYI kaydirmazlar.
  var scrollers = [];
  for (var a = 0; a < all.length; a++) {
    var c2 = getComputedStyle(all[a]);
    if (/auto|scroll/.test(c2.overflowX) && all[a].scrollWidth > all[a].clientWidth + 1)
      scrollers.push({ sel: sel(all[a]), inner: all[a].scrollWidth, box: all[a].clientWidth });
  }
  var restore = [];
  for (var i = 0; i < all.length; i++) {
    var cs = getComputedStyle(all[i]);
    if (/hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflow)) {
      restore.push([all[i], all[i].style.overflowX, all[i].style.overflow]);
      all[i].style.overflow = 'visible'; all[i].style.overflowX = 'visible';
    }
  }
  // 1. sadece hidden/clip acilir -> "tasma ORTULUYOR mu" sorusunun durust cevabi
  //    (overflow:auto/scroll kendi icinde kayan bir kutudur, ortme degildir)
  var vw = document.documentElement.clientWidth;
  var over = [];
  for (var j = 0; j < all.length; j++) {
    var el = all[j], r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    var right = r.right + window.scrollX;
    if (right > vw + 0.5) over.push({ sel: sel(el), right: +right.toFixed(2), over: +(right - vw).toFixed(2), w: +r.width.toFixed(2) });
  }
  var unclipped = document.documentElement.scrollWidth;
  for (var k = 0; k < restore.length; k++) { restore[k][0].style.overflowX = restore[k][1]; restore[k][0].style.overflow = restore[k][2]; }
  var clipped = document.documentElement.scrollWidth;
  over.sort(function (a, b) { return b.over - a.over; });
  return JSON.stringify({ viewport: vw, scrollWidth_clipped: clipped, scrollWidth_unclipped: unclipped,
                          bodyScrollWidth: document.body.scrollWidth, count: over.length, top: over.slice(0, 20),
                          innerScrollers: scrollers,
                          domNodes: all.length,
                          pageHeight: Math.ceil(document.documentElement.scrollHeight) });
})()`;

const PORT = 9500 + (process.pid % 400);
const prof = `/tmp/v10e-cdp-${process.pid}`;
mkdirSync(prof, { recursive: true });
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--hide-scrollbars',
  `--user-data-dir=${prof}`, `--remote-debugging-port=${PORT}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function browserWS() {
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); return (await r.json()).webSocketDebuggerUrl; }
    catch { await sleep(200); }
  }
  throw new Error('CHROME CDP ACILMADI');
}

const ws = new WebSocket(await browserWS());
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map(); const events = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  else if (m.method) events.push(m);
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const n = ++id; pending.set(n, (m) => (m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
});

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 800 }, sessionId);
await send('Page.enable', {}, sessionId);

const results = {};
for (const p of PAGES) {
  // BASE=http://127.0.0.1:8123 verilirse oradan yuklenir. GEREKLI: create.html
  // ekranini `js/create.js` (ES module) basiyor ve ES module file:// altinda
  // CORS ile bloklanir -> sayfa BOS cikar. Olcum HTTP uzerinden yapilir.
  const url = process.env.BASE ? `${process.env.BASE}/${p}.html` : `file://${join(WEB, p + '.html')}`;
  events.length = 0;
  await send('Page.navigate', { url }, sessionId);
  for (let i = 0; i < 60 && !events.some((e) => e.method === 'Page.loadEventFired'); i++) await sleep(100);
  await sleep(1500);                                     // JS'in yerleştirmesi için
  const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true }, sessionId);
  results[p] = JSON.parse(r.result.value);
  if (OUT !== '-') {
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, sessionId);
    const file = join(resolve(ROOT, OUT), `${p}-${W}.png`);
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    results[p].png = file;
  }
}
console.log(JSON.stringify({ width: W, height: H, pages: results }, null, 2));
try { await send('Browser.close'); } catch { /* kapaniyor */ }
ws.close(); chrome.kill('SIGKILL'); process.exit(0);
