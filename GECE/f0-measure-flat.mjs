// F0 OLCUM ALETI — flat SVG'nin siluet olculeri (SVG birimi).
// Onarim yok. Sadece olcer.
//
// Ne olcer: `.body` sinifli ana siluet path'ini ornekler, sonra belirli
// yuksekliklerde yatay kesit genisligini basar (omuz / gogus / bel / etek ucu)
// + govde yuksekligi. Cikti SVG BIRIMINDEDIR; dosyada mm/cm beyani YOKTUR
// (kanit: cikti icinde unitDeclared alani).
//
// kullanim: node GECE/f0-measure-flat.mjs <styleKey>

import { readFileSync } from 'fs';

const styleKey = process.argv[2] || 'dress_princess_scoop_aline';
const eng = await import('../engine/flat-engine/_engine-full.mjs');
const svg = eng.renderStyle(styleKey, {});

// --- olcek beyani var mi? (F0 madde: flat gercek olcuye bagli mi)
const unitDeclared =
  /data-scale|data-mm|data-cm|width="\d+(\.\d+)?(mm|cm|in)"/.test(svg);

// --- .body path'lerini cek (ana siluet; on ve arka iki grup)
const bodies = [...svg.matchAll(/<path class="body" d="([^"]+)"/g)].map((m) => m[1]);

function samplePath(d, per = 40) {
  // "M x,y C c1x,c1y c2x,c2y x,y ..." — sadece M/C/Z destegi (motor bunu uretiyor)
  const toks = d.trim().split(/(?=[MCZz])/);
  const pts = [];
  let cur = null;
  for (const t of toks) {
    const head = t[0];
    const nums = (t.slice(1).match(/-?\d+(\.\d+)?/g) || []).map(Number);
    if (head === 'M') {
      cur = [nums[0], nums[1]];
      pts.push(cur);
    } else if (head === 'C') {
      for (let i = 0; i + 5 < nums.length; i += 6) {
        const p0 = cur;
        const c1 = [nums[i], nums[i + 1]];
        const c2 = [nums[i + 2], nums[i + 3]];
        const p1 = [nums[i + 4], nums[i + 5]];
        for (let k = 1; k <= per; k++) {
          const t2 = k / per, s = 1 - t2;
          pts.push([
            s ** 3 * p0[0] + 3 * s * s * t2 * c1[0] + 3 * s * t2 * t2 * c2[0] + t2 ** 3 * p1[0],
            s ** 3 * p0[1] + 3 * s * s * t2 * c1[1] + 3 * s * t2 * t2 * c2[1] + t2 ** 3 * p1[1],
          ]);
        }
        cur = p1;
      }
    }
  }
  return pts;
}

// ON gorunus = ilk .body path'i + aynasi. Motor yarim cizip mirror ediyor,
// bu yuzden yarim path'in |x - cx| degeri yari genisliktir.
const pts = samplePath(bodies[0]);
const xs = pts.map((p) => p[0]);
const ys = pts.map((p) => p[1]);
const yTop = Math.min(...ys), yBot = Math.max(...ys);
const H = yBot - yTop;
// merkez ekseni: motor cx=240 (on) kullaniyor, ama olcumu veriden al:
// yarim siluetin en kucuk x'i merkez eksene en yakin nokta degil — bu yuzden
// merkez, path'in ilk noktasinin x'i (CF hem noktasi) olarak alinir.
const cx = pts[0][0];

function halfWidthAt(yFrac) {
  const y = yTop + H * yFrac;
  let best = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    if ((y0 - y) * (y1 - y) <= 0 && Math.abs(y1 - y0) > 1e-9) {
      const t = (y - y0) / (y1 - y0);
      const x = x0 + t * (x1 - x0);
      const w = Math.abs(x - cx);
      if (best === null || w > best) best = w;
    }
  }
  return best;
}

const m = {
  shoulder_half: halfWidthAt(0.03),
  chest_half: halfWidthAt(0.22),
  waist_half: halfWidthAt(0.42),
  hem_half: halfWidthAt(0.99),
  body_height: H,
};

const out = {
  style: styleKey,
  unit: 'SVG-user-unit',
  unitDeclared,                       // false ise flat gercek olcuye BAGLI DEGIL
  viewBox: (svg.match(/viewBox="([^"]+)"/) || [])[1] || null,
  bodyPaths: bodies.length,
  centerAxis_x: Number(cx.toFixed(2)),
  measures: Object.fromEntries(
    Object.entries(m).map(([k, v]) => [k, v === null ? null : Number(v.toFixed(2))])
  ),
  ratios: {
    hem_over_waist: m.hem_half && m.waist_half ? Number((m.hem_half / m.waist_half).toFixed(4)) : null,
    chest_over_waist: m.chest_half && m.waist_half ? Number((m.chest_half / m.waist_half).toFixed(4)) : null,
    shoulder_over_chest: m.shoulder_half && m.chest_half ? Number((m.shoulder_half / m.chest_half).toFixed(4)) : null,
    length_over_chest: m.chest_half ? Number((m.body_height / (2 * m.chest_half)).toFixed(4)) : null,
  },
};

console.log(JSON.stringify(out, null, 2));
