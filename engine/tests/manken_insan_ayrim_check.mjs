#!/usr/bin/env node
// manken_insan_ayrim_check.mjs — MANKEN != INSAN KAPISI (F6-konvansiyon, 2026-09-02)
//
// DAMLA'NIN IKI CUMLESI (KOSU karti, 4. ve 5. madde):
//   "flat 36 ile kalip 36 farkli: kalip dikilebilir gercek beden, flat daha
//    ideal kadin bedeni" + "butun flatler ayni ideal bedenden cikmis gibi".
//
// Bu kapi o ayrimin SAYISINI olcer. F6'ya kadar fark 0.0 mm'ydi ve o sifir
// KAYNAKSIZDI (v1._karar: 'olculmus degil, karar'). Simdi fark OLCULMUS:
// 5 referans flat secildi (KOSU/ciktilar/flat-secim.md), bel/gogus orani
// pikselden okundu (KOSU/flat-olcum.py -> KOSU/ciktilar/flat-olcum.json),
// contract/mannequin-chart-v1.json v2 o olcumden turedi, ve cizici
// (web/lib/flat-from-pattern.js mankenWarp) yalniz o cizelgeden okuyor.
//
// DORT HUKUM:
//  (1) KAYNAK ZINCIRI KOPMAZ: contract v2'nin orani, olcum dosyasinin kendi
//      ortalamasina esit; farkCeyrekMM, capa spec'inin CANLI motor ciziminden
//      ayni aritmetikle yeniden turetilebilir. Elle duzeltilmis sayi = kirmizi.
//  (2) EU38'DE FLAT != KALIP: cizilen bel yari-genisligi, kalibin pens-kapali
//      bel yari-genisliginden farkli; fark > 0 ve tam cizelgenin sayisi.
//  (3) DORT GIYSI SINIFI AYNI CIZELGEDEN: elbise / orme / etek / top —
//      dordunde de uygulanan bel farki cizelgeyle <= %1 icinde AYNI, gogus ve
//      kalca/etek ucu farki 0 (<= 0.1 mm; cizelge o eksenlerde insan
//      cizelgesini birakiyor, olcum blogundaki en-kisitlayici karar).
//      Prenses bu kapinin disinda (on IKI panelden rijit donusumla kurulur,
//      bagimsiz kalip-tarafi bel olcumu o donusumu kopyalamayi gerektirirdi);
//      prensesin kendi sert olcusu cizim_giysi_mi (g/prenses)'te.
//  (4) ILAN ZORUNLU: cizim donusumu dosyanin ustunde ilan eder
//      (data-manken-*) ve ilan cizelgeyle ayni sayidir.

import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

// --- sevk edilen hat, node-kopyasi degil (cizim_giysi_mi ile ayni stub) -----
const BUNDLE = join(ROOT, 'web/vendor/stitchu-engine.js');
if (!existsSync(BUNDLE)) { FAIL(`sevk edilen wasm paketi YOK: ${BUNDLE}`); process.exit(1); }
const engine = await require(BUNDLE)();
globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
const { flatDrawing, engineSpec, bodyForSize } = await import(join(ROOT, 'web/js/engine.js'));

const LAW = JSON.parse(readFileSync(join(ROOT, 'contract/mannequin-chart-v1.json'), 'utf8'));
const V2 = LAW.v2;
const BEDEN = 'EU38';

console.log('=== MANKEN != INSAN — flat bedeni ile kalip bedeni ayri, fark olculmus');

// ---------------------------------------------------------------------------
// kalip tarafi aritmetigi — cizim_giysi_mi (g2) ile ayni TANIM (pens kapatmak
// budur), web/lib'den import YOK: kalip tarafi bagimsiz olculur.
// ---------------------------------------------------------------------------
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const vnorm = (a) => Math.hypot(a[0], a[1]);
const vlerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const rot = (p, c, th) => {
  const s = Math.sin(th), co = Math.cos(th), d = vsub(p, c);
  return [c[0] + d[0] * co - d[1] * s, c[1] + d[0] * s + d[1] * co];
};
const bez = (p, t) => {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, cc = 3 * u * t * t, dd = t * t * t;
  return [a * p[0][0] + b * p[1][0] + cc * p[2][0] + dd * p[3][0],
          a * p[0][1] + b * p[1][1] + cc * p[2][1] + dd * p[3][1]];
};
function segsOf(cmds) {
  const out = []; let cur = null, start = null;
  for (const c of cmds) {
    if (c.type === 'move') { cur = [c.x, c.y]; start = cur; continue; }
    if (c.type === 'close') {
      if (cur && start && vnorm(vsub(cur, start)) > 1e-7) {
        out.push([cur, vlerp(cur, start, 1 / 3), vlerp(cur, start, 2 / 3), start]);
      }
      cur = start; continue;
    }
    if (!cur) cur = [0, 0];
    const p3 = [c.x, c.y];
    if (c.type === 'line') out.push([cur, vlerp(cur, p3, 1 / 3), vlerp(cur, p3, 2 / 3), p3]);
    else if (c.type === 'curve') out.push([cur, [c.cp1x, c.cp1y], [c.cp2x, c.cp2y], p3]);
    else continue;
    cur = p3;
  }
  return out;
}
const sample = (segs, per = 40) => {
  const out = [];
  segs.forEach((s, k) => { for (let j = k === 0 ? 0 : 1; j <= per; j++) out.push(bez(s, j / per)); });
  return out;
};
const nearest = (P, q) => {
  let best = 0, bd = Infinity;
  for (let i = 0; i < P.length; i++) { const d = vnorm(vsub(P[i], q)); if (d < bd) { bd = d; best = i; } }
  return best;
};
const dartsOf = (piece) => {
  const polys = []; let cur = null;
  for (const c of piece.markings || []) {
    if (c.type === 'move') { cur = [[c.x, c.y]]; polys.push(cur); continue; }
    if (c.type === 'close' || !cur) continue;
    cur.push([c.x, c.y]);
  }
  return polys.filter((p) => p.length >= 3);
};
function closeDartL(pts, dart, outboardAtStart) {
  const apex = dart[1], legA = dart[0], legB = dart[dart.length - 1];
  let i1 = nearest(pts, legA), i2 = nearest(pts, legB);
  if (i1 > i2) { const t = i1; i1 = i2; i2 = t; }
  if (i2 - i1 < 1) return null;
  const ang = (i) => Math.atan2(pts[i][1] - apex[1], pts[i][0] - apex[0]);
  const th = outboardAtStart ? ang(i2) - ang(i1) : ang(i1) - ang(i2);
  if (!isFinite(th)) return null;
  if (outboardAtStart) return pts.slice(0, i1 + 1).map((p) => rot(p, apex, th)).concat(pts.slice(i2 + 1));
  return pts.slice(0, i1 + 1).concat(pts.slice(i2).map((p) => rot(p, apex, th)));
}
/** pens-kapali bel yari-genisligi: beden panelinde hem, etek panelinde ust. */
function kapaliBel(piece, kind) {
  const segs = segsOf(piece.commands);
  if (!segs.length) return null;
  const all = segs.flat();
  const yTop = Math.min(...all.map((p) => p[1]));
  const yBot = Math.max(...all.map((p) => p[1]));
  const H = yBot - yTop || 1;
  let edge, outboardAtStart;
  if (kind === 'hem') {
    let hemIdx = -1;
    for (let k = 0; k < segs.length; k++) if (Math.abs(segs[k][3][1] - yBot) < 1.0) hemIdx = k;
    if (hemIdx < 0) return null;
    edge = [segs[hemIdx]]; outboardAtStart = true;
  } else {
    let t = 0;
    while (t < segs.length && Math.max(...segs[t].map((p) => p[1])) < yTop + 0.08 * H) t++;
    if (!t) return null;
    edge = segs.slice(0, t); outboardAtStart = false;
  }
  let pts0 = sample(edge, 40);
  const darts = dartsOf(piece)
    .map((d) => ({ d, at: nearest(pts0, d[0]) }))
    .filter(({ d }) => Math.min(vnorm(vsub(pts0[nearest(pts0, d[0])], d[0])),
                                vnorm(vsub(pts0[nearest(pts0, d[d.length - 1])], d[d.length - 1]))) <= 8)
    .sort((a, b) => (outboardAtStart ? a.at - b.at : b.at - a.at));
  for (const { d } of darts) { const r = closeDartL(pts0, d, outboardAtStart); if (r) pts0 = r; }
  return Math.max(...pts0.map((p) => p[0]));
}
const pieceMaxX = (p) => Math.max(...p.commands.filter((k) => k.type !== 'close')
  .flatMap((k) => [k.x, k.cp1x, k.cp2x].filter((v) => typeof v === 'number')));

// --- SVG okuyucu ------------------------------------------------------------
function paths(svg) {
  const out = [];
  const re = /<path\b([^>]*)\/>/g;
  let m;
  while ((m = re.exec(svg))) {
    const a = m[1];
    const g = (k) => { const r = new RegExp(`${k}="([^"]*)"`).exec(a); return r ? r[1] : null; };
    out.push({ rol: g('data-rol'), view: g('data-view'), yan: g('data-yan'), d: g('d') || '',
               fark: g('data-manken-fark-ceyrek-mm'), Wbel: g('data-manken-bel-yarim-mm'),
               belY: g('data-manken-bel-y') });
  }
  return out;
}
/** SVG path d -> ORNEKLENMIS egri noktalari (M/L/C; kubikler per adimda). */
function samplePathD(d, per = 24) {
  const out = [];
  let cur = null;
  const re = /([MLCZz])([^MLCZz]*)/g;
  let m;
  while ((m = re.exec(d))) {
    const op = m[1].toUpperCase();
    const n = (m[2].match(/-?\d+(\.\d+)?(e[-+]?\d+)?/gi) || []).map(Number);
    if (op === 'M' && n.length >= 2) { cur = [n[0], n[1]]; out.push(cur); }
    else if (op === 'L') { for (let i = 0; i + 1 < n.length; i += 2) { cur = [n[i], n[i + 1]]; out.push(cur); } }
    else if (op === 'C') {
      for (let i = 0; i + 5 < n.length; i += 6) {
        const p0 = cur, seg = [p0, [n[i], n[i + 1]], [n[i + 2], n[i + 3]], [n[i + 4], n[i + 5]]];
        for (let j = 1; j <= per; j++) out.push(bez(seg, j / per));
        cur = [n[i + 4], n[i + 5]];
      }
    }
  }
  return out;
}

function pts(d) {
  const nums = d.match(/-?\d+(\.\d+)?(e[-+]?\d+)?/gi) || [];
  const out = [];
  for (let i = 0; i + 1 < nums.length; i += 2) out.push([parseFloat(nums[i]), parseFloat(nums[i + 1])]);
  return out;
}

// ---------------------------------------------------------------------------
// (1) KAYNAK ZINCIRI
// ---------------------------------------------------------------------------
console.log('\n--- (1) kaynak zinciri: olcum dosyasi -> cizelge -> canli capa turetmesi');
{
  const OLCUM_YOL = join(ROOT, 'KOSU/ciktilar/flat-olcum.json');
  if (!existsSync(OLCUM_YOL)) {
    // olcum dosyasi gitignore'lu KOSU/ciktilar altinda yasar; yoksa yeniden
    // uretilebilir olmali. Kapi burada cizelgenin KENDI kayit kopyasina duser
    // ve bunu adiyla soyler — sessizce degil.
    console.log('      not: KOSU/ciktilar/flat-olcum.json diskte yok (gitignore alani) — '
              + 'cizelgenin kayit kopyasi (v2.olcum) uzerinden olculuyor; yeniden uretmek icin: python3 KOSU/flat-olcum.py');
  }
  const oranlar = existsSync(OLCUM_YOL)
    ? JSON.parse(readFileSync(OLCUM_YOL, 'utf8')).oranlar.kaynakFlatler
    : V2.olcum.belGogusOrani;
  const adlar = Object.keys(oranlar);
  const ort = adlar.reduce((s, k) => s + oranlar[k], 0) / adlar.length;
  if (Math.abs(ort - V2.oran.belGogus) > 5e-6) {
    FAIL(`(1) cizelge orani ${V2.oran.belGogus}, olcumun ortalamasi ${ort.toFixed(6)} — zincir kopuk`);
  } else OK(`(1) oran ${V2.oran.belGogus} == olcum ortalamasi (${adlar.length} capa: ${adlar.join(', ')})`);

  // capa turetmesi CANLI motordan
  const drafted = JSON.parse(engine.draftJSON(engineSpec(V2.capa.spec), bodyForSize(V2.capa.beden)));
  const bodice = drafted.pattern.pieces.find((p) => /^(Bodice Front|Top Front)$/.test(p.name));
  if (!bodice) FAIL('(1) capa spec beden paneli vermedi');
  else {
    const bust = pieceMaxX(bodice);
    const bel = kapaliBel(bodice, 'hem');
    const fark = bust * V2.oran.belGogus - bel;
    const d1 = Math.abs(bust - V2.capa.kalipGogusYarimMM);
    const d2 = Math.abs(bel - V2.capa.kalipBelKapaliYarimMM);
    const d3 = Math.abs(fark - V2.donusum.farkCeyrekMM);
    if (d1 > 0.01 || d2 > 0.01 || d3 > 0.01) {
      FAIL(`(1) capa turetmesi tutmuyor: gogus ${bust.toFixed(4)}/${V2.capa.kalipGogusYarimMM} · `
         + `bel ${bel.toFixed(4)}/${V2.capa.kalipBelKapaliYarimMM} · fark ${fark.toFixed(4)}/${V2.donusum.farkCeyrekMM}`);
    } else OK(`(1) farkCeyrekMM ${V2.donusum.farkCeyrekMM} = ${bust.toFixed(4)} * ${V2.oran.belGogus} - ${bel.toFixed(4)} — canli motordan yeniden turedi`);
  }
}

// ---------------------------------------------------------------------------
// (2) EU38: FLAT != KALIP, fark > 0, kaynagi cizelge
// ---------------------------------------------------------------------------
console.log('\n--- (2) EU38 flat bel != kalip bel (pens-kapali), fark = cizelgenin sayisi');
{
  const r = await flatDrawing(V2.capa.spec, { size: BEDEN });
  const ps = paths(r.svg);
  const bel = ps.find((p) => p.rol === 'bel-dikisi' && p.view === 'front' && p.yan === 'sag');
  const sil = ps.find((p) => p.rol === 'siluet' && p.view === 'front');
  const drafted = JSON.parse(engine.draftJSON(engineSpec(V2.capa.spec), bodyForSize(BEDEN)));
  const bodice = drafted.pattern.pieces.find((p) => /^(Bodice Front|Top Front)$/.test(p.name));
  if (!bel || !sil || !bodice) FAIL('(2) cizim ya da kalip parcasi eksik');
  else {
    const flatBel = Math.max(...pts(bel.d).map((p) => p[0]));
    const kalipBel = kapaliBel(bodice, 'hem');
    const fark = flatBel - kalipBel;
    console.log(`      flat bel ${flatBel.toFixed(4)} mm · kalip bel ${kalipBel.toFixed(4)} mm · `
              + `fark ${fark.toFixed(4)} mm (cevre farki ${(4 * fark).toFixed(2)} mm)`);
    if (!(Math.abs(fark) > 0.5)) FAIL(`(2) flat bel == kalip bel (${fark.toFixed(4)} mm) — ayrim yok, F6 oncesine donulmus`);
    else if (!(fark > 0)) FAIL(`(2) fark ${fark.toFixed(4)} negatif — cizelge pozitif diyor (v2.donusum.yon)`);
    else if (Math.abs(fark - V2.donusum.farkCeyrekMM) > 0.1) {
      FAIL(`(2) fark ${fark.toFixed(4)} ama cizelge ${V2.donusum.farkCeyrekMM} — fark cizelgeden gelmiyor`);
    } else OK(`(2) EU38 flat beli kalip belinden ${fark.toFixed(4)} mm genis == cizelge ${V2.donusum.farkCeyrekMM} (kaynak: flat-olcum.json)`);
    // (4) ilan
    if (!sil.fark) FAIL('(4) on siluette data-manken-fark-ceyrek-mm ilani YOK');
    else if (Math.abs(parseFloat(sil.fark) - V2.donusum.farkCeyrekMM) > 1e-9) {
      FAIL(`(4) ilan ${sil.fark} != cizelge ${V2.donusum.farkCeyrekMM}`);
    } else OK('(4) donusum dosyanin ustunde ilanli ve cizelgeyle ayni');
  }
}

// ---------------------------------------------------------------------------
// (3) DORT SINIF, TEK CIZELGE — uygulanan bel farki <= %1 icinde ayni;
//     gogus ve kalca/etek ucu donusumden ETKILENMEZ (<= 0.1 mm)
// ---------------------------------------------------------------------------
console.log('\n--- (3) dort giysi sinifi ayni cizelgeden (tutarlilik <= %1)');
{
  const SINIFLAR = [
    ['elbise', { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'crew', sleeveStyle: 'none', skirtStyle: 'aLine', skirtLength: 'midi' }],
    ['orme',   { garment: 'dress', shaping: 'dart', fabric: 'knit', neckline: 'scoop', sleeveStyle: 'none', skirtStyle: 'aLine', skirtLength: 'midi' }],
    ['etek',   { garment: 'skirt', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', skirtLength: 'midi' }],
    ['top',    { garment: 'top', shaping: 'dart', fabric: 'woven', neckline: 'crew', sleeveStyle: 'none', topLength: 'hip' }],
  ];
  const F = V2.donusum.farkCeyrekMM;
  let olculen = 0;
  for (const [ad, spec] of SINIFLAR) {
    const r = await flatDrawing(spec, { size: BEDEN });
    const ps = paths(r.svg);
    const sil = ps.find((p) => p.rol === 'siluet' && p.view === 'front');
    const drafted = JSON.parse(engine.draftJSON(engineSpec(spec), bodyForSize(BEDEN)));
    const P = drafted.pattern.pieces;
    const bodice = P.find((p) => /^(Bodice Front|Top Front)$/.test(p.name));
    const skirt = P.find((p) => /^(Skirt Front|Skirt Center Front|Front)$/.test(p.name));
    if (!sil) { FAIL(`(3) ${ad}: on siluet yok`); continue; }
    const silPts = pts(sil.d);
    let flatBel = null, kalipBel = null;
    if (ad === 'elbise' || ad === 'orme') {
      const bel = ps.find((p) => p.rol === 'bel-dikisi' && p.view === 'front' && p.yan === 'sag');
      if (!bel || !bodice) { FAIL(`(3) ${ad}: bel-dikisi ya da beden paneli yok`); continue; }
      flatBel = Math.max(...pts(bel.d).map((p) => p[0]));
      kalipBel = kapaliBel(bodice, 'hem');
    } else if (ad === 'etek') {
      const beller = ps.filter((p) => p.rol === 'bel-dikisi' && p.view === 'front' && p.yan === 'sag');
      if (!beller.length || !skirt) { FAIL('(3) etek: bel-dikisi ya da etek paneli yok'); continue; }
      const ort = (p) => pts(p.d).reduce((s, q) => s + q[1], 0) / pts(p.d).length;
      const ust = beller.reduce((a, b) => (ort(b) < ort(a) ? b : a));
      flatBel = Math.max(...pts(ust.d).map((p) => p[0]));
      kalipBel = kapaliBel(skirt, 'top');
    } else { // top: bel = yan dikisin kendi bogumu (cizilen bel dikisi yok)
      if (!bodice || !sil.belY) { FAIL('(3) top: beden paneli ya da bel ilani yok'); continue; }
      const belY = parseFloat(sil.belY);
      // kalip tarafi bagimsiz: panelin yan kenari (kol oyugu ile hem arasi), en dar x.
      // ust_kolsuz kalibi PENSSIZ geliyor (cizim_giysi_mi (d) circiri), yani yan
      // dikis kaydirilmamis panel kenaridir — dogrudan olculebilir.
      if (dartsOf(bodice).length) { FAIL('(3) top: kalip pens tasiyor, bagimsiz yan-dikis olcumu bu halde tanimsiz (circir: cizim_giysi_mi (d))'); continue; }
      const segs = segsOf(bodice.commands);
      const role = (bodice.edgeRoles || []).find((r2) => /^armhole_/.test(r2.role));
      if (!role) { FAIL('(3) top: kol oyugu kenari yok'); continue; }
      const all = segs.flat();
      const yBot = Math.max(...all.map((p) => p[1]));
      let hemIdx = -1;
      for (let k = 0; k < segs.length; k++) if (Math.abs(segs[k][3][1] - yBot) < 1.0) hemIdx = k;
      // armhole role.last -> segment indeksi: komut indeksinden geri say
      // (segsOf komut sirasini korur; role araligindan SONRAKI kenarlar yan dikistir)
      // pratik ve saglam: yan dikis = kol oyugu bitis noktasindan hem baslangicina
      // kadar olan orta bant; en dar x'i orneklenmis butun segmentlerden, yalniz
      // bel civarindaki (belY +- 40 mm) kusakta al.
      const sPts = sample(segs, 24).filter((p) => Math.abs(p[1] - belY) <= 40);
      if (!sPts.length) { FAIL('(3) top: bel kusaginda panel kenari yok'); continue; }
      kalipBel = Math.min(...sPts.filter((p) => p[0] > 100).map((p) => p[0]));
      const silSample = samplePathD(sil.d, 160).filter((p) => p[0] > 0 && Math.abs(p[1] - belY) <= 2);
      if (!silSample.length) { FAIL('(3) top: siluette bel hizasinda ornek yok'); continue; }
      flatBel = Math.max(...silSample.map((p) => p[0]));
    }
    const delta = flatBel - kalipBel;
    const sapma = Math.abs(delta - F) / Math.abs(F);
    // gogus (varsa) ve etek ucu/kalca: donusum disi, kalanin 0.1 mm ozdesligi
    // cizim_giysi_mi (g2)'de tam genislikte olculuyor; burada sadece belin
    // TEK cizelgeden geldigi yargilaniyor.
    console.log(`      ${ad.padEnd(7)} flat bel ${flatBel.toFixed(4)} · kalip bel ${kalipBel.toFixed(4)} · `
              + `uygulanan fark ${delta.toFixed(4)} (cizelge ${F}, sapma %${(100 * sapma).toFixed(3)})`);
    if (sapma > 0.01) { FAIL(`(3) ${ad}: uygulanan fark ${delta.toFixed(4)}, cizelge ${F} — sapma %${(100 * sapma).toFixed(2)} > %1`); continue; }
    olculen += 1;
  }
  if (olculen === SINIFLAR.length) OK(`(3) ${olculen}/4 sinifta bel farki tek cizelgeden, sapma <= %1 (gogus/kalca 0.1 mm ozdesligi: cizim_giysi_mi g2)`);
  else FAIL(`(3) ${olculen}/4 sinif olculebildi — bos gecen sinif olculmemis hukum`);
}

if (fails) { console.log(`\nFAIL manken_insan_ayrim_check — ${fails} ihlal`); process.exit(1); }
console.log('\nok manken_insan_ayrim_check — manken bedeni olculmus, kalip bedeni dokunulmamis, dort sinif tek cizelgede');
