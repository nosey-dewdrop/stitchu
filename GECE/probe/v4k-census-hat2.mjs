#!/usr/bin/env node
// V4-K PROBE 2 — HAT-2'nin siluetini flat_artifact_census.mjs'in KANIT KANCASINA
// (V3C_SHELL_JSON) uygun bir shell-flat JSON'una çevirir. Hiçbir üretim dosyası
// değişmez; census DEĞİŞTİRİLMEDEN, kendi kancasıyla koşulur.
//
// BEYAN (gizlenmiyor):
//  - HAT-2 kullanıcı biriminde çizer; kanun data-unit-mm=3 diyor. Zincir ×3 ile
//    mm'ye çevrilir.
//  - HAT-2 SVG y AŞAĞI sayar, census z YUKARI sayar; y bir kez ters çevrilir.
//  - HAT-2'nin siluet path'i CF-yaka'dan başlayıp CF-etek'te biten KAPALI bir
//    yarımdır (ayna transform="scale(-1,1)" ile ekleniyor). Census kapalı konturu
//    x -> -x aynasıyla kuruyor; bu AYNI kuruluş. CF'deki iki uç nokta aynasıyla
//    çakışacağı için orada 2 dejenere birleşim BEKLENİR — kuruluş artefaktıdır,
//    kalemin kusuru DEĞİLDİR, ayrıca raporlanır.
//  - Örnekleme adımı 4mm: HAT-1'in kSampleStepMM=4.0'ı ile aynı, kıyas adil olsun.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const LAW = JSON.parse(readFileSync(join(root, 'contract/flat-convention-v1.json'), 'utf8'));
const { renderGarmentFlat } = await import(join(root, 'engine/tools/render-garment-flat.mjs'));
const UNIT = LAW.scale.unitMM;
const STEP_MM = 4.0;

const STYLE = process.argv[2] || 'princess_scoop_dress';
const SPECS = {
  princess_scoop_dress: { garment: 'dress', neckline: 'scoop', shaping: 'princess', skirtStyle: 'aLine', skirtLength: 'midi', closure: 'backZip' },
  boat_shift_dress: { garment: 'dress', neckline: 'boat', shaping: 'shift', skirtStyle: 'straight', skirtLength: 'mini' },
  crew_sleeved_top: { garment: 'top', neckline: 'crew', shaping: 'darts', topLength: 'hip', sleeveStyle: 'set', sleeveLength: 'short' },
  vneck_empire_dress: { garment: 'dress', neckline: 'vNeck', waistline: 'empire', shaping: 'darts', skirtStyle: 'gathered', skirtLength: 'maxi' },
};

function sampleAdaptive(d) {
  // M/L/C/Q/Z mutlak; her segmenti yay-uzunluğuna göre ~STEP_MM/UNIT birimde örnekler
  const tok = d.match(/[MLCQZ]|-?\d+(?:\.\d+)?(?:e-?\d+)?/gi) || [];
  const out = []; let i = 0, cmd = '', cur = [0, 0];
  const num = () => parseFloat(tok[i++]);
  const stepU = STEP_MM / UNIT;
  const push = (p) => { const l = out[out.length - 1]; if (!l || Math.hypot(p[0]-l[0], p[1]-l[1]) > 1e-12) out.push(p); else out.push(p); };
  const bez = (fn, approx) => { const n = Math.max(2, Math.ceil(approx / stepU)); for (let k = 1; k <= n; k++) push(fn(k / n)); };
  while (i < tok.length) {
    const t = tok[i];
    if (/^[MLCQZ]$/i.test(t)) { cmd = t.toUpperCase(); i += 1; if (cmd === 'Z') continue; }
    if (cmd === 'M') { cur = [num(), num()]; out.push(cur.slice()); }
    else if (cmd === 'L') { const p = [num(), num()]; const L = Math.hypot(p[0]-cur[0], p[1]-cur[1]);
      bez((t2) => [cur[0]+(p[0]-cur[0])*t2, cur[1]+(p[1]-cur[1])*t2], L); cur = p; }
    else if (cmd === 'C') { const c1=[num(),num()], c2=[num(),num()], p3=[num(),num()];
      const approx = Math.hypot(c1[0]-cur[0],c1[1]-cur[1])+Math.hypot(c2[0]-c1[0],c2[1]-c1[1])+Math.hypot(p3[0]-c2[0],p3[1]-c2[1]);
      const p0 = cur;
      bez((u) => { const v=1-u; return [v*v*v*p0[0]+3*v*v*u*c1[0]+3*v*u*u*c2[0]+u*u*u*p3[0], v*v*v*p0[1]+3*v*v*u*c1[1]+3*v*u*u*c2[1]+u*u*u*p3[1]]; }, approx);
      cur = p3; }
    else if (cmd === 'Q') { const c=[num(),num()], p1=[num(),num()];
      const approx = Math.hypot(c[0]-cur[0],c[1]-cur[1])+Math.hypot(p1[0]-c[0],p1[1]-c[1]);
      const p0 = cur;
      bez((u) => { const v=1-u; return [v*v*p0[0]+2*v*u*c[0]+u*u*p1[0], v*v*p0[1]+2*v*u*c[1]+u*u*p1[1]]; }, approx);
      cur = p1; }
    else i += 1;
  }
  return out;
}

const svg = renderGarmentFlat([], SPECS[STYLE] || SPECS.princess_scoop_dress);
const views = {};
for (const view of ['front', 'back']) {
  const blk = svg.match(new RegExp(`data-view="${view}"([\\s\\S]*?)(?=data-view="|$)`));
  if (!blk) { console.error(`view ${view} YOK`); process.exit(2); }
  // SİLUET SEÇİMİ (beyan): kalem yarım siluetı CF'den (x=0) başlatır ve CF'de
  // bitirir; sonra transform="scale(-1,1)" ile aynalar. bbox-en-büyük seçimi
  // YANLIŞ sonuç verdi (drape mürekkebi taperInk şeritleri daha geniş bbox'a
  // sahip), o yüzden siluet "M 0 ile başlayan İLK path" olarak seçilir.
  let best = null, bd = '';
  for (const m of blk[1].matchAll(/ d="([^"]+)"/g)) {
    if (!/^M\s+0(\.0+)?\s/.test(m[1])) continue;
    const pts = sampleAdaptive(m[1]);
    if (pts.length < 4) continue;
    // ÖLÇÜLDÜ (gizlenmiyor): kalemin siluet path'i YARIM DEĞİL, sağ yarı + ONUN
    // AÇIKÇA YAZILMIŞ AYNASI + Z ile KAPALI TAM konturdur. Census kapalı konturu
    // kendisi x -> -x aynasıyla kuruyor; tam kontur verilirse ikinci kez aynalanır
    // (ölçtüm: alan 0.00 cm², orta noktada 180° sahte dönüş). O yüzden burada
    // SAĞ YARI kesilir: baştan, x'in ilk kez negatife düştüğü noktaya kadar.
    let cut = pts.length;
    for (let k = 1; k < pts.length; k++) if (pts[k][0] < -1e-9) { cut = k; break; }
    best = pts.slice(0, cut); bd = m[1]; break;
  }
  if (!best) { console.error(`view ${view}: CF'den başlayan siluet path'i BULUNAMADI`); process.exit(3); }
  const yMax = Math.max(...best.map(p => p[1]));
  views[view] = { pts: best, d: bd, yMax };
}
const yRef = Math.max(views.front.yMax, views.back.yMax);

const out = { size: 'EU38', source: `render-garment-flat.mjs/${STYLE}`, measures: [], views: [] };
for (const view of ['front', 'back']) {
  const pts = views[view].pts;
  const outline = pts.map((p) => ({ x: Math.abs(p[0]) * UNIT, z: (yRef - p[1]) * UNIT, span: 'silhouette' }));
  out.views.push({ view, topZMM: Math.max(...outline.map(o=>o.z)), bottomZMM: Math.min(...outline.map(o=>o.z)),
                   spans: [{ name: 'silhouette', firstPt: 0, lastPt: outline.length-1, firstSeg: 0, segCount: 1,
                             polyLenMM: 0, fitLenMM: 0 }], outline, segs: [] });
  console.error(`${view}: ${outline.length} nokta, ham path d uzunluğu ${views[view].d.length} karakter`);
}
const dest = join(root, `GECE/log/V4-K.hat2-shell.${STYLE}.json`);
writeFileSync(dest, JSON.stringify(out));
console.log(dest);
