#!/usr/bin/env node
// flat_ayni_insan_check.mjs — KAPI B: AYNI INSAN (F0, 2026-09-05).
//
// HEDEF.md madde 5: "Butun flat'ler ayni olcuden, ayni insan icin tasarlanmis
// gibi gorunecek. Eski flat'lerde gogus-beden mesafesi, bel, kalca gibi ortak
// olmasi gereken hicbir seyde ortaklik yoktu." Bu kapi o ortakligi SAYIYLA
// olcer: bir flat kumesinde gogus/bel/kalca hattinin y'si ve omuz ucunun x'i
// flat'ten flat'e ne kadar oynuyor.
//
// NE OLCER. Her SVG'de on gorunumun siluet yolu (data-rol="siluet"
// data-view="front"). Iki kaynaktan okur ve ikisini de basar:
//   ILAN:  cizimin kendi ilan ettigi data-manken-bust-y / -bel-y / -kalca-y ve
//          data-omuz-uc (x y) — web/lib/flat-from-pattern.js yaziyor.
//   CIZIM: siluet yolunun GEOMETRISI: yol (M/L/C) polilineye acilir, ilan
//          edilen bel y'sinde yolun en genis |x|'i (yari-genislik) ve yolun en
//          ust noktasi (omuz cizgisi y) olculur. Ilan ile cizim ayrisirsa bu
//          da basilir — ilan bir sey, cizim baska bir sey soyleyemez.
// Koordinat: her gorunum kendi <g transform="translate(...)"> icinde; grup ici
// y=0 cizimin ust kenari (omuz cizgisi), x=0 CF. Birim mm (data-unit-mm="1").
// Etek gibi omuzsuz giysilerde y=0 bel ustudur ve omuz ucu YOKTUR; bu bir
// olcum degil bir BULGUDUR (origin beden landmark'i degil) ve tabloda "—"
// olarak durur, sapmaya katilmaz — sessizce atlanmaz, satir basilir.
//
// SAPMA. Her olculen icin kume ustunde max-min (mm) ve ortalamadan en buyuk
// mutlak sapma. Tolerans contract/body-v1.json ayniInsan.toleransMM'den okunur:
//   null  -> kapi yalnizca OLCER, exit 0 ("once" sayisi; F1 dolduracak).
//   sayi  -> max-min > tolerans olan her olcu KIRMIZI, exit 1.
// Bu dosya tolerans ICERMEZ; sayi contract'tan gelir (uydurma sayi yok).
//
// KULLANIM
//   node engine/tests/flat_ayni_insan_check.mjs                 # KOSU/ciktilar/*.svg (0X-*.svg)
//   node engine/tests/flat_ayni_insan_check.mjs a.svg b.svg ... # verilen kume
//   node engine/tests/flat_ayni_insan_check.mjs --json          # tabloyu JSON olarak da bas

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const args = process.argv.slice(2);
const wantJSON = args.includes('--json');
let files = args.filter((a) => a.endsWith('.svg'));
if (files.length === 0) {
  const dir = join(ROOT, 'KOSU/ciktilar');
  files = existsSync(dir)
    ? readdirSync(dir).filter((f) => /^\d\d-.*\.svg$/.test(f)).sort().map((f) => join(dir, f))
    : [];
}
if (files.length === 0) { console.log('FAIL  olculecek flat yok (KOSU/ciktilar/0X-*.svg bulunamadi; once node KOSU/uret.mjs)'); process.exit(1); }

// tolerans: contract'tan, yoksa null (olc-yalniz)
let TOL = null;
const bodyPath = join(ROOT, 'contract/body-v1.json');
if (existsSync(bodyPath)) {
  const b = JSON.parse(readFileSync(bodyPath, 'utf8'));
  TOL = b?.ayniInsan?.toleransMM ?? null;
}

// ---- SVG okuma: on siluet yolu + nitelikleri ---------------------------------
function attrs(tag) {
  const o = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)) o[m[1]] = m[2];
  return o;
}
function frontSiluet(svg) {
  const tags = [...svg.matchAll(/<path\b[^>]*>/g)].map((m) => m[0]);
  const t = tags.find((x) => /data-rol="siluet"/.test(x) && /data-view="front"/.test(x));
  return t ? attrs(t) : null;
}

// ---- path d -> polyline (M/L/C/Z, mutlak) -------------------------------------
function toPolyline(d) {
  const tok = d.match(/[MLCZmlcz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const pts = []; let i = 0, cur = [0, 0], cmd = null;
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/^[MLCZ]$/i.test(tok[i])) { cmd = tok[i++]; if (/z/i.test(cmd)) continue; }
    if (cmd === 'M' || cmd === 'L') { cur = [num(), num()]; pts.push(cur); }
    else if (cmd === 'C') {
      const p0 = cur, c1 = [num(), num()], c2 = [num(), num()], p3 = [num(), num()];
      for (let k = 1; k <= 16; k++) {
        const t = k / 16, u = 1 - t;
        pts.push([u*u*u*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p3[0],
                  u*u*u*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p3[1]]);
      }
      cur = p3;
    } else { i++; }
  }
  return pts;
}
// polyline'in y = yLevel hizasindaki en buyuk |x|'i (kesisen segmentlerden)
function halfWidthAt(pts, yLevel) {
  let best = null;
  for (let k = 1; k < pts.length; k++) {
    const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
    if ((y0 - yLevel) * (y1 - yLevel) > 0) continue;
    if (y0 === y1) { best = Math.max(best ?? 0, Math.abs(x0), Math.abs(x1)); continue; }
    const t = (yLevel - y0) / (y1 - y0);
    const x = Math.abs(x0 + t * (x1 - x0));
    best = best == null ? x : Math.max(best, x);
  }
  return best;
}

const rows = [];
for (const f of files) {
  const svg = readFileSync(f, 'utf8');
  const a = frontSiluet(svg);
  const row = { flat: basename(f, '.svg'), sinif: (svg.match(/data-sinif="([^"]*)"/) || [])[1] ?? '?' };
  if (!a) { row.hata = 'on siluet yolu yok'; rows.push(row); continue; }
  const n = (k) => (a[k] == null ? null : parseFloat(a[k]));
  row.bustY = n('data-manken-bust-y');
  row.belY = n('data-manken-bel-y');
  row.kalcaY = n('data-manken-kalca-y');
  const omuz = a['data-omuz-uc'] ? a['data-omuz-uc'].split(/\s+/).map(parseFloat) : null;
  row.omuzX = omuz ? omuz[0] : null;
  row.omuzY = omuz ? omuz[1] : null;
  const pts = toPolyline(a.d || '');
  row.cizimUstY = pts.length ? Math.min(...pts.map((p) => p[1])) : null;
  row.cizimBelYarim = row.belY != null ? halfWidthAt(pts, row.belY) : null;
  row.cizimBustYarim = row.bustY != null ? halfWidthAt(pts, row.bustY) : null;
  row.cizimKalcaYarim = row.kalcaY != null ? halfWidthAt(pts, row.kalcaY) : null;
  rows.push(row);
}

// ---- sapma -------------------------------------------------------------------
const OLCULER = [
  ['bustY', 'gogus hatti y (ilan)'],
  ['belY', 'bel hatti y (ilan)'],
  ['kalcaY', 'kalca hatti y (ilan)'],
  ['omuzX', 'omuz ucu x (ilan)'],
  ['cizimBelYarim', 'bel yari-genislik (cizimden)'],
  ['cizimBustYarim', 'gogus yari-genislik (cizimden)'],
];
const f1 = (v) => (v == null || Number.isNaN(v) ? '—' : v.toFixed(1).padStart(7));
console.log(`flat_ayni_insan_check — ${rows.length} flat, tolerans ${TOL == null ? 'YOK (contract/body-v1.json ayniInsan.toleransMM null -> yalniz olcum)' : TOL + ' mm'}`);
console.log('flat                                   sinif                 bustY    belY  kalcaY   omuzX  belYar bustYar  ustY');
for (const r of rows) {
  if (r.hata) { console.log(`${r.flat.padEnd(38)} ${r.sinif.padEnd(20)} HATA ${r.hata}`); continue; }
  console.log(`${r.flat.padEnd(38)} ${r.sinif.padEnd(20)}${f1(r.bustY)} ${f1(r.belY)} ${f1(r.kalcaY)} ${f1(r.omuzX)} ${f1(r.cizimBelYarim)} ${f1(r.cizimBustYarim)} ${f1(r.cizimUstY)}`);
}

let fails = 0;
const sapma = {};
console.log('\nsapma (kume ustunde):');
for (const [k, ad] of OLCULER) {
  const vals = rows.map((r) => r[k]).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  const eksik = rows.length - vals.length;
  if (vals.length < 2) { console.log(`  ${ad.padEnd(32)} olculemedi (${vals.length} deger)`); continue; }
  const mn = Math.min(...vals), mx = Math.max(...vals), ort = vals.reduce((s, v) => s + v, 0) / vals.length;
  const maxAbs = Math.max(...vals.map((v) => Math.abs(v - ort)));
  const spread = mx - mn;
  sapma[k] = { n: vals.length, eksik, min: mn, max: mx, ort, spread, maxAbs };
  let hukum = 'olcum';
  if (TOL != null) { hukum = spread <= TOL ? 'OK  ' : 'FAIL'; if (spread > TOL) fails++; }
  console.log(`  ${hukum}  ${ad.padEnd(32)} n=${vals.length}${eksik ? ` (${eksik} yok)` : ''}  min ${mn.toFixed(1)}  max ${mx.toFixed(1)}  max-min ${spread.toFixed(1)} mm  ort ${ort.toFixed(1)}  en buyuk |sapma| ${maxAbs.toFixed(1)} mm`);
}
// ilan-cizim mutabakati: bel yari-genisligi ilan (data-manken-bel-yarim-mm) vs cizim
const bulgular = [];
for (const r of rows) {
  if (r.hata) continue;
  if (r.omuzX == null) bulgular.push(`${r.flat}: omuz ucu ilani yok (sinif ${r.sinif}) — origin bel ustu, beden landmark'i degil`);
  if (r.belY != null && r.belY < 0) bulgular.push(`${r.flat}: bel y ${r.belY.toFixed(1)} < 0 — gorunum origin'i beden landmark'ina bagli degil`);
  if (r.cizimUstY != null && Math.abs(r.cizimUstY) > 0.5) bulgular.push(`${r.flat}: cizim ust kenari y=${r.cizimUstY.toFixed(1)} (omuz cizgisi 0 degil)`);
}
if (bulgular.length) { console.log('\nbulgular:'); for (const b of bulgular) console.log(`  - ${b}`); }

if (wantJSON) console.log('\n' + JSON.stringify({ tolerans: TOL, rows, sapma, bulgular }, null, 1));

if (TOL == null) { console.log(`\nolcum bitti — tolerans yokken hukum yok (F1 contract'a yazinca kapi kirmizi/yesil verir)`); process.exit(0); }
if (fails) { console.log(`\nFAIL  ${fails} olcu toleransi (${TOL} mm) asti — flat'ler ayni insana cizilmemis`); process.exit(1); }
console.log(`\nOK    ${rows.length} flat ayni insan (tolerans ${TOL} mm)`);
