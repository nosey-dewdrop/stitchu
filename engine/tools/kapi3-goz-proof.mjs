#!/usr/bin/env node
// kapi3-goz-proof.mjs — Kapi 3 HAZIRLIK kaniti (2026-07-28, goz kolu).
// Deterministik piksel olcum modulu v1'in uc testi, GERCEK probe fotolarinda
// (benchmark-58, lokal arsiv; ag yok, LLM yok, kredi 0):
//   (a) GERCEK: olcumler adli rapor el bandina oturur (13.50.04 L/W 2.2-2.6),
//       capa yankisi 1.55'ten uzak; vision'in 1.55/1.5 okudugu minilerde
//       olcum >= 2.0; bagimsiz Python cross-check (farkli dil + farkli esik
//       kurali) %5 icinde ayni sayiyi verir; worn/negatif fotolar durustce
//       reddedilir.
//   (b) AYRISMA: farkli fotolar farkli oranlar verir (vision'da hepsi 1.55'ti).
//   (c) DETERMINIZM: tam boru hatti (sips -> crop -> olcum) iki bagimsiz
//       kosuda bayt-ayni JSON (sha256 esit); modul cagrisi da cagri basina
//       iki kez kosulup karsilastirilir.
// Kanit dosyalari: reports/gate/kapi-3-hazirlik/ (JSON + txt) — repo'ya girer.
// Girdi kirpimlari + maskeler ~/Desktop/KAPI-3-OLCUM/ — telifli kaynak
// gorselden turetildigi icin repo'ya GIRMEZ (gitignore disiplini).
// Canli hatta baglama YOK: worker'a dokunulmaz, cutover karari Damla'nin.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { measureGarment } from '../../web/js/measure.js';
import { bmpToImageData, cropImage, writePng, imageDataToRgb, maskToRgb } from './photo-pixels.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PHOTOS = join(ROOT, 'benchmark-58', 'photos-1024');
const BANK = join(ROOT, 'benchmark-58', 'results-2026-07-27.json');
const OUTDIR = join(ROOT, 'reports', 'gate', 'kapi-3-hazirlik');
const DESKTOP = join(homedir(), 'Desktop', 'KAPI-3-OLCUM');
const DATE = '2026-07-28';

// Same crops as measure-photo.mjs: the product-photo region of each 1024x666
// screenshot (= what a create.js user actually uploads).
const MANIFEST = [
  { tag: '13.50.04', crop: [335, 300, 460, 600], note: 'mini shift flat (adli el bandi L/W 2.2-2.6; vision 1.55 okudu)', handBand: [2.2, 2.6] },
  { tag: '13.53.55', crop: [175, 182, 372, 472], note: 'boat-neck tank flat (kisa ust — mini kumesinden ayrismali)' },
  { tag: '13.50.29', crop: [268, 192, 415, 428], note: 'tartan pinafore fit-and-flare flat' },
  { tag: '13.48.48', crop: [430, 272, 552, 432], note: 'babydoll mini flat (beyaz/pembe dusuk kontrast)' },
  { tag: '13.48.42', crop: [170, 272, 290, 432], note: 'HELOISE fit-and-flare mini flat' },
  { tag: '13.52.12', crop: [195, 125, 385, 575], note: 'halter midi MODELDE — durust red beklenir', expectRefusal: true },
  { tag: '13.48.01', crop: [215, 130, 520, 585], note: 'keten mini MODELDE, mermer duvar — durust red beklenir', expectRefusal: true },
  { tag: '13.47.49', crop: [200, 145, 533, 590], note: 'NEGATIF: sokak sahnesi — durust red beklenir', expectRefusal: true },
];
const ANCHOR = 1.55; // worker prompt "mini dress ~1.6" capasinin yankilanan degeri (adli rapor)

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };
const pass = (m) => console.log('PASS:', m);
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

// ---------- one full pipeline run (sips -> crop -> measure x2) ----------
function runPipeline(tmpTag, writeEvidence) {
  const tmp = `/tmp/kapi3-${tmpTag}`;
  mkdirSync(tmp, { recursive: true });
  const rows = [];
  for (const item of MANIFEST) {
    const file = `Ekran Resmi 2026-07-15 ${item.tag}.jpg`;
    const bmpPath = join(tmp, item.tag + '.bmp');
    execFileSync('sips', ['-s', 'format', 'bmp', join(PHOTOS, file), '--out', bmpPath], { stdio: 'pipe' });
    const img = cropImage(bmpToImageData(readFileSync(bmpPath)), item.crop);
    const res1 = measureGarment(img, { wantMask: writeEvidence });
    const res2 = measureGarment(img, { wantMask: writeEvidence });
    // (c) modul determinizmi: ayni buffer iki cagri, bayt-ayni JSON
    const strip = (r) => JSON.stringify({ ok: r.ok, reason: r.reason || null, confidence: r.confidence, ratios: r.ratios, ratioNull: r.ratioNull || null });
    if (strip(res1) !== strip(res2)) fail(`(c) ${item.tag}: ayni goruntu iki cagrida farkli sonuc`);
    if (writeEvidence) {
      mkdirSync(join(DESKTOP, 'inputs'), { recursive: true });
      mkdirSync(join(DESKTOP, 'masks'), { recursive: true });
      writePng(join(DESKTOP, 'inputs', item.tag + '.png'), imageDataToRgb(img), img.width, img.height);
      if (res1.debug && res1.debug.mask) {
        writePng(join(DESKTOP, 'masks', item.tag + '-mask.png'),
          maskToRgb(res1.debug.mask, res1.debug.landmarkRows), res1.debug.mask.width, res1.debug.mask.height);
      }
    }
    rows.push({
      tag: item.tag,
      crop: item.crop,
      note: item.note,
      ok: res1.ok,
      reason: res1.reason || null,
      confidence: res1.confidence,
      ratios: res1.ratios ? { ...res1.ratios, shoulderToHemProfile: undefined } : null,
      ratioNull: res1.ratioNull || null,
    });
  }
  return rows;
}

// ---------- (c) tam boru hatti determinizmi: iki bagimsiz kosu ----------
const rows1 = runPipeline('run1', true);
const rows2 = runPipeline('run2', false);
const canon1 = JSON.stringify(rows1, null, 2);
const canon2 = JSON.stringify(rows2, null, 2);
const h1 = sha256(canon1);
const h2 = sha256(canon2);
if (h1 !== h2) fail(`(c) tam boru hatti iki kosuda farkli JSON (${h1.slice(0, 12)} vs ${h2.slice(0, 12)})`);
else pass(`(c) determinizm: iki bagimsiz kosu bayt-ayni JSON, sha256 ${h1.slice(0, 16)}...`);

// ---------- vision bankasi (2026-07-27 canli tarama, capa yankili sayilar) ----------
const bank = JSON.parse(readFileSync(BANK, 'utf8'));
const visionOf = (tag) => {
  const key = Object.keys(bank).find((k) => k.includes(tag));
  return key && bank[key].spec ? bank[key].spec.ratios || null : null;
};

// ---------- (a) GERCEK ----------
const byTag = Object.fromEntries(rows1.map((r) => [r.tag, r]));

// a1: adli el bandi — 13.50.04 (curutucu ajanin elle olctugu foto)
{
  const r = byTag['13.50.04'];
  const item = MANIFEST[0];
  if (!r.ok) fail(`(a1) 13.50.04 olculemedi (${r.reason})`);
  else {
    const lw = r.ratios.lengthToWidth;
    const [lo, hi] = item.handBand;
    if (lw >= lo && lw <= hi) pass(`(a1) 13.50.04 L/W ${lw} adli el bandinda [${lo}, ${hi}]`);
    else fail(`(a1) 13.50.04 L/W ${lw} adli el bandi [${lo}, ${hi}] disinda`);
    const dAnchor = Math.abs(lw - ANCHOR);
    if (dAnchor > 0.5) pass(`(a1) capa olumu: |${lw} - ${ANCHOR}| = ${dAnchor.toFixed(3)} > 0.5`);
    else fail(`(a1) olcum capaya fazla yakin: |${lw} - ${ANCHOR}| = ${dAnchor.toFixed(3)}`);
  }
}

// a2: vision'in 1.55/1.5'e kumeledigi mini elbise flatleri — olcum kumeden cikar.
// Esik gerekcesi: adli rapor gercek mini L/W'yi 2.2-2.6 olcttu; capa 1.55.
// Aradaki bosluk 0.65 — olcum >= 2.0 (bandin altina 0.2 pay) ve
// olcum - vision >= 0.4 (bosluğun yarisindan fazlasi) capanin oldugunu kanitlar.
for (const tag of ['13.50.04', '13.50.29', '13.48.48', '13.48.42']) {
  const r = byTag[tag];
  const v = visionOf(tag);
  if (!r.ok) { fail(`(a2) ${tag} olculemedi (${r.reason})`); continue; }
  const lw = r.ratios.lengthToWidth;
  const vlw = v && typeof v.lengthToWidth === 'number' ? v.lengthToWidth : null;
  if (vlw === null) { fail(`(a2) ${tag}: bankada vision L/W yok`); continue; }
  if (lw >= 2.0 && lw - vlw >= 0.4) {
    pass(`(a2) ${tag}: olcum ${lw} vs vision yankisi ${vlw} (fark ${(lw - vlw).toFixed(2)})`);
  } else {
    fail(`(a2) ${tag}: olcum ${lw} capa kumesinden cikamadi (vision ${vlw})`);
  }
}

// a3: bagimsiz Python cross-check (farkli dil, farkli esik kurali: Otsu vs
// 3.2 x p90). Tolerans %5 — iki esik kurali kenari 1-2px farkli kesebilir;
// olculen en buyuk sapma %1.5 idi, %5 bandi bunun 3 kati.
for (const r of rows1) {
  if (!r.ok) continue;
  const out = execFileSync('python3', [join(ROOT, 'engine/tools/kapi3-cross-measure.py'), join(DESKTOP, 'inputs', r.tag + '.png')], { encoding: 'utf8' });
  const x = JSON.parse(out.trim());
  r.cross = x;
  if (!x.ok) { fail(`(a3) ${r.tag}: python cross-check reddetti (${x.reason})`); continue; }
  for (const k of ['lengthToWidth', 'hemToWaistWidth']) {
    const rel = Math.abs(x[k] - r.ratios[k]) / r.ratios[k];
    if (rel <= 0.05) pass(`(a3) ${r.tag} ${k}: node ${r.ratios[k]} / python ${x[k]} (fark %${(rel * 100).toFixed(1)})`);
    else fail(`(a3) ${r.tag} ${k}: node ${r.ratios[k]} vs python ${x[k]} — %5 tolerans disi (%${(rel * 100).toFixed(1)})`);
  }
}

// a4: worn/negatif fotolar sayi uydurmaz, durustce reddeder.
for (const item of MANIFEST.filter((i) => i.expectRefusal)) {
  const r = byTag[item.tag];
  if (r.ok === false && r.reason) pass(`(a4) ${item.tag} durust red: ${r.reason}`);
  else fail(`(a4) ${item.tag}: red beklenirken sayi uretti (${JSON.stringify(r.ratios)})`);
}

// ---------- (b) AYRISMA ----------
{
  const okRows = rows1.filter((r) => r.ok);
  const lws = okRows.map((r) => r.ratios.lengthToWidth);
  const uniq = new Set(lws.map((v) => v.toFixed(3)));
  if (uniq.size === lws.length) pass(`(b) ${lws.length} olculebilir fotonun L/W'lari ikili ikili farkli: ${lws.join(', ')}`);
  else fail(`(b) L/W carpismasi var: ${lws.join(', ')}`);
  const d1 = Math.abs(byTag['13.50.04'].ratios.lengthToWidth - byTag['13.53.55'].ratios.lengthToWidth);
  if (d1 > 0.3) pass(`(b) mini elbise vs kisa ust L/W farki ${d1.toFixed(3)} > 0.3`);
  else fail(`(b) mini elbise vs kisa ust ayrismadi (${d1.toFixed(3)})`);
  const d2 = Math.abs(byTag['13.50.04'].ratios.hemToWaistWidth - byTag['13.48.42'].ratios.hemToWaistWidth);
  if (d2 > 0.3) pass(`(b) shift vs fit-and-flare hem/bel farki ${d2.toFixed(3)} > 0.3`);
  else fail(`(b) shift vs fit-and-flare hem/bel ayrismadi (${d2.toFixed(3)})`);
}

// ---------- kanit dosyalari ----------
mkdirSync(OUTDIR, { recursive: true });
const evidence = {
  date: DATE,
  method: 'web/js/measure.js (deterministik piksel olcumu, LLM yok) — sips -> crop -> silutet -> satir-genislik profili -> worker-sema oranlar',
  anchorEcho: { value: ANCHOR, source: 'reports/2026-07-27-stitchu-json-el-adli.txt (KOK 1: model prompt ornegini geri yaziyor)' },
  tolerances: {
    handBand: '13.50.04 L/W [2.2, 2.6] — adli rapordaki bagimsiz el olcumu bandi',
    anchorDeath: 'olcum >= 2.0 ve olcum - vision >= 0.4 (el bandi ile capa arasindaki 0.65 boslugun yarisindan fazlasi)',
    crossCheck: 'python (Otsu, ayri dil/esik) ile %5 — gozlenen max sapma %1.5',
  },
  determinism: { sha256_run1: h1, sha256_run2: h2, equal: h1 === h2 },
  vision: Object.fromEntries(rows1.map((r) => [r.tag, visionOf(r.tag)])),
  rows: rows1,
  pngEvidence: 'Desktop/KAPI-3-OLCUM/ (girdi kirpimlari + maskeler; telifli kaynak turevi, repoya girmez)',
  fails,
};
writeFileSync(join(OUTDIR, `goz-olcum-${DATE}.json`), JSON.stringify(evidence, null, 2));
console.log(`\nkanit -> ${join(OUTDIR, `goz-olcum-${DATE}.json`)}`);
if (fails) { console.error(`\nkapi3-goz-proof FAILED (${fails})`); process.exit(1); }
console.log('kapi3-goz-proof GREEN (a: el bandi + capa olumu + cross-check + durust red, b: ayrisma, c: determinizm)');
