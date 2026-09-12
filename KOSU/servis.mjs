#!/usr/bin/env node
// KOSU/servis.mjs — YEREL KOPRU: tarayici -> claude -p -> flat + kalip. (12 Eyl 2026)
//
// NEDEN VAR. Damla'nin sitede fotograf yukleyip flat + kalip almasi icin eksik
// olan tek halka buydu: tarayici `claude -p` calistiramaz. Bu dosya o alt sureci
// calistiran KUCUK bir yerel HTTP sunucusudur.
//
//   node KOSU/servis.mjs            ->  http://localhost:7311
//
// PARA: sifir. API anahtari OKUNMAZ, ARANMAZ. Tek arka uc Damla'nin Claude Code
// aboneligidir (KOSU/siluet-oku.mjs -> 'claude -p' alt sureci).
// BAGIMLILIK: sifir. Yalniz node'un yerlesik http/fs/child_process'i. npm YOK.
//
// UCLAR
//   GET  /                 yukleme sayfasi
//   POST /oku              gövde: { adi, veri(base64) } -> { is: "<id>" } (hemen doner)
//   GET  /durum?is=<id>    ilerleme + bitince okuma/flat/kalip yollari
//   GET  /dosya?yol=...    uretilen dosyayi indir (yalniz is klasoru altindan)
//   GET  /contract/...     kanun dosyalari (tarayicidaki cizici fetch eder)
//   GET  /lib/...          web/lib (siluet-ciz.js tarayicida kosar)
//
// SESSIZ DEFAULT YASAK: her adimin hatasi KODUYLA (ERR_SEMA, ERR_OKUYUCU, ...)
// ekrana dusar; "olmadi ama bir sey ciz" yok.
//
// BU YEREL BIR TEST ARACIDIR. Kimlik dogrulama / kota / guvenlik katmani YOK ve
// olmayacak; 127.0.0.1'e baglanir.

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { extname, resolve, relative } from 'node:path';

const KOK = resolve(new URL('..', import.meta.url).pathname);
const PORT = Number(process.env.PORT || 7311);
const SET = 'yerel';                          // KOSU/ciktilar/yerel/<no>/
const SET_KOK = `${KOK}/KOSU/ciktilar/${SET}`;
// Jenerik taban topoloji: kolsuz/duz govde (9 op). Siluet okumasi bunun uzerine
// etek ucu + klos + genislik hedeflerini yazar (bkz. siluet-kalip.mjs).
const TABAN_TOPOLOJI = `${KOK}/KOSU/ciktilar/giris-3/1/ops-topoloji.json`;

const IZINLI_UZANTI = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
const TIP = { '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

// ------------------------------------------------------------------ is defteri
/** id -> { durum, adim, yuzde, hata, klasor, no, sonuc } */
const ISLER = new Map();
let siraNo = Date.now() % 100000;

function komut(argv, { uzerine } = {}) {
  return new Promise((coz) => {
    const p = spawn(process.execPath, argv, { cwd: KOK, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; if (uzerine) uzerine(String(d)); });
    p.on('error', (e) => coz({ kod: -1, out, err: String(e.message) }));
    p.on('close', (kod) => coz({ kod, out, err }));
  });
}

/** stderr'in ilk satirindaki ERR_* kodunu cikar; yoksa son satiri dondur. */
function hataKodu(err, varsayilan) {
  const m = /\bERR_[A-Z_]+\b/.exec(err || '');
  if (m) {
    const satir = (err.split('\n').find((l) => l.includes(m[0])) || m[0]).trim();
    return satir.slice(0, 400);
  }
  const satirlar = String(err || '').trim().split('\n').filter(Boolean);
  return satirlar.length ? `${varsayilan}: ${satirlar[satirlar.length - 1].slice(0, 400)}` : varsayilan;
}

async function isiKos(id, adi, bayt) {
  const is = ISLER.get(id);
  const uzanti = (extname(adi) || '.png').toLowerCase();
  if (!IZINLI_UZANTI[uzanti]) {
    Object.assign(is, { durum: 'hata', hata: `ERR_GIRDI: desteklenmeyen gorsel bicimi "${uzanti}" (png/jpg/webp/gif)` });
    return;
  }
  const no = ++siraNo;
  const d = `${SET_KOK}/${no}`;
  mkdirSync(d, { recursive: true });
  is.no = no;
  is.klasor = relative(KOK, d);

  const fotoYolu = `${d}/girdi${uzanti}`;
  writeFileSync(fotoYolu, bayt);
  const sha = createHash('sha256').update(bayt).digest('hex');
  is.sha = sha;

  // siluet-uret / siluet-kalip kaynak-yolu.txt'nin 2. satirindan sha okur.
  writeFileSync(`${d}/kaynak-yolu.txt`,
    `${relative(KOK, fotoYolu)}\nsha256 ${sha}\ngorunum on\narka.koken turetildi\nyukleyen KOSU/servis.mjs (yerel kopru)\n`);
  copyFileSync(TABAN_TOPOLOJI, `${d}/ops-topoloji.json`);

  // ---------------------------------------------------------- 1) OKUMA (claude -p)
  is.adim = 'okuma';
  is.yuzde = 5;
  is.not = 'fotograf okunuyor (claude -p alt sureci, 30-90 sn)';
  const t0 = Date.now();
  const o = await komut(['KOSU/siluet-oku.mjs', relative(KOK, fotoYolu)]);
  is.okumaSn = Math.round((Date.now() - t0) / 1000);
  if (o.kod !== 0) {
    Object.assign(is, { durum: 'hata', adim: 'okuma', hata: hataKodu(o.err, 'ERR_OKUYUCU') });
    return;
  }
  const okumaYolu = `${KOK}/KOSU/onbellek/siluet-${sha}.json`;
  if (!existsSync(okumaYolu)) {
    Object.assign(is, { durum: 'hata', adim: 'okuma', hata: `ERR_OKUYUCU: okuma onbellege yazilmadi (${relative(KOK, okumaYolu)})` });
    return;
  }
  const okuma = JSON.parse(readFileSync(okumaYolu, 'utf8'));
  is.okuma = okuma;
  is.ilan = okuma.ilan || '';
  is.yuzde = 55;

  // ---------------------------------------------------------------- 2) FLAT
  is.adim = 'flat';
  is.not = 'flat ciziliyor';
  const f = await komut(['KOSU/siluet-uret.mjs', SET, String(no)]);
  let kirmizi = [];
  try { kirmizi = (JSON.parse(f.out)[0] || {}).kirmizi || []; } catch { /* ozet ayristirilamadi */ }
  is.kirmizi = kirmizi;
  if (!existsSync(`${d}/flat.svg`)) {
    Object.assign(is, { durum: 'hata', adim: 'flat', hata: hataKodu(f.err, 'ERR_CIZIM') });
    return;
  }
  is.flatSvg = `${is.klasor}/flat.svg`;
  if (existsSync(`${d}/flat.png`)) is.flatPng = `${is.klasor}/flat.png`;
  is.yuzde = 75;

  // --------------------------------------------------------------- 3) KALIP
  is.adim = 'kalip';
  is.not = 'kalip uretiliyor (motor)';
  const k = await komut(['KOSU/siluet-kalip.mjs', SET, String(no)]);
  let ozet = null;
  try { ozet = (JSON.parse(k.out) || [])[0] || null; } catch { /* ozet yok */ }
  is.kalipOzet = ozet;
  if (existsSync(`${d}/kalip-36.svg`)) {
    is.kalipSvg = `${is.klasor}/kalip-36.svg`;
    if (existsSync(`${d}/kalip-36.png`)) is.kalipPng = `${is.klasor}/kalip-36.png`;
  } else {
    // Flat DURUYOR; kalip patladi. Sessiz gecme: ekranda kodla soyle.
    is.kalipHata = (ozet && (ozet.stderr || ozet.cizStderr)) || hataKodu(k.err, 'ERR_KALIP');
  }

  is.durum = 'bitti';
  is.adim = 'bitti';
  is.yuzde = 100;
  is.not = is.kalipHata ? 'flat hazir, kalip patladi' : 'flat + kalip hazir';
}

// ------------------------------------------------------------------- HTTP
function gonderDosya(res, mutlak) {
  if (!existsSync(mutlak)) { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('yok: ' + mutlak); return; }
  const t = TIP[extname(mutlak).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': t, 'cache-control': 'no-store' });
  res.end(readFileSync(mutlak));
}

function govde(req, sinirBayt = 24 * 1024 * 1024) {
  return new Promise((coz, red) => {
    const parcalar = []; let n = 0;
    req.on('data', (c) => { n += c.length; if (n > sinirBayt) { red(new Error('ERR_BOYUT: 24 MB ustu')); req.destroy(); return; } parcalar.push(c); });
    req.on('end', () => coz(Buffer.concat(parcalar)));
    req.on('error', red);
  });
}

const sunucu = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const yol = decodeURIComponent(u.pathname);
  try {
    if (yol === '/' || yol === '/index.html') {
      gonderDosya(res, `${KOK}/KOSU/servis-sayfa.html`); return;
    }
    if (yol.startsWith('/contract/')) { gonderDosya(res, `${KOK}${yol}`); return; }
    if (yol.startsWith('/lib/')) { gonderDosya(res, `${KOK}/web${yol}`); return; }

    if (yol === '/oku' && req.method === 'POST') {
      const ham = await govde(req);
      let g;
      try { g = JSON.parse(ham.toString('utf8')); } catch { g = null; }
      if (!g || !g.veri) { res.writeHead(400, { 'content-type': 'application/json' }); res.end(JSON.stringify({ hata: 'ERR_GIRDI: govdede {adi, veri(base64)} yok' })); return; }
      const bayt = Buffer.from(String(g.veri).replace(/^data:[^,]+,/, ''), 'base64');
      if (!bayt.length) { res.writeHead(400, { 'content-type': 'application/json' }); res.end(JSON.stringify({ hata: 'ERR_GIRDI: bos dosya' })); return; }
      const id = createHash('sha1').update(String(Date.now()) + Math.random()).digest('hex').slice(0, 10);
      ISLER.set(id, { id, durum: 'kosuyor', adim: 'basliyor', yuzde: 1, adi: g.adi || 'girdi.png', not: 'hazirlaniyor' });
      // ARKA PLAN: istek hemen doner, tarayici /durum ile izler (okuma dakikalar surebilir).
      isiKos(id, g.adi || 'girdi.png', bayt).catch((e) => {
        Object.assign(ISLER.get(id), { durum: 'hata', hata: 'ERR_SERVIS: ' + String((e && e.message) || e) });
      });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ is: id }));
      return;
    }

    if (yol === '/durum') {
      const is = ISLER.get(u.searchParams.get('is'));
      if (!is) { res.writeHead(404, { 'content-type': 'application/json' }); res.end(JSON.stringify({ hata: 'ERR_IS_YOK: bilinmeyen is' })); return; }
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify(is));
      return;
    }

    if (yol === '/dosya') {
      const istenen = u.searchParams.get('yol') || '';
      const mutlak = resolve(KOK, istenen);
      // yalniz uretim klasoru altindan
      if (!mutlak.startsWith(SET_KOK + '/')) { res.writeHead(403, { 'content-type': 'text/plain' }); res.end('ERR_YOL: is klasoru disi'); return; }
      gonderDosya(res, mutlak);
      return;
    }

    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('yok: ' + yol);
  } catch (e) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ hata: 'ERR_SERVIS: ' + String((e && e.message) || e) }));
  }
});

if (!existsSync(TABAN_TOPOLOJI)) {
  process.stderr.write(`ERR_TABAN: taban topoloji yok: ${TABAN_TOPOLOJI}\n`);
  process.exit(1);
}
mkdirSync(SET_KOK, { recursive: true });
sunucu.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`stitchu yerel kopru: http://localhost:${PORT}\n`);
});
