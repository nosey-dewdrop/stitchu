// F-D KALIP LEVHASI — bugra-dump'in bastigi parca poligonlarini TEK sayfaya
// serer. Bu bir FLAT KALEMI DEGIL (ikinci kalem dogurmuyoruz): giysi silueti
// cizmez, motorun kendi kalip parcalarini oldugu gibi cizer.
// Yine de ayni murekkep kanununa uyar (contract/flat-convention-v1.json):
// tek renk, beyanli agirlik siniflari, sifir tint.
//   kesim cizgisi (cutPoly) = outline sinifi
//   dikis cizgisi (sewPoly) = seam sinifi
// kullanim: node GECE/f-d-kalip-plot.mjs <dump.json> <out.svg>
import { readFileSync, writeFileSync } from 'node:fs';

const LAW = JSON.parse(readFileSync(new URL('../contract/flat-convention-v1.json', import.meta.url), 'utf8'));
const INK = LAW.ink.color, PAPER = LAW.ink.paper;
const LC = LAW.lineClasses.classes;

const [, , inp, outp] = process.argv;
const dump = JSON.parse(readFileSync(inp, 'utf8'));
const n = (v) => (Math.round(v * 10) / 10).toFixed(1);
const bbox = (P) => ({ x0: Math.min(...P.map((p) => p[0])), y0: Math.min(...P.map((p) => p[1])),
  x1: Math.max(...P.map((p) => p[0])), y1: Math.max(...P.map((p) => p[1])) });
const dOf = (P, ox, oy) => 'M ' + P.map(([x, y]) => `${n(x - ox)} ${n(y - oy)}`).join(' L ') + ' Z';

// yatay raf yerlesimi (mm)
const GAP = 30, PAD = 40, LABEL = 26;
let x = PAD, maxH = 0, inner = '';
for (const p of dump.pieces) {
  const cut = p.cutPoly.length ? p.cutPoly : p.sewPoly;
  const b = bbox(cut);
  const w = b.x1 - b.x0, h = b.y1 - b.y0;
  inner += `<g transform="translate(${n(x)} ${PAD + LABEL})">`;
  inner += `<path d="${dOf(cut, b.x0, b.y0)}" fill="${PAPER}" stroke="${INK}" stroke-width="${LC.outline.width}" stroke-linejoin="round"/>`;
  if (p.sewPoly.length) inner += `<path d="${dOf(p.sewPoly, b.x0, b.y0)}" fill="none" stroke="${INK}" stroke-width="${LC.seam.width}" stroke-dasharray="${LC.topstitch.dash}" stroke-linejoin="round"/>`;
  inner += `<text x="0" y="-8" font-family="Helvetica,Arial,sans-serif" font-size="16" fill="${INK}">${p.name} — ${n(w)}x${n(h)} mm</text>`;
  inner += '</g>';
  x += w + GAP;
  maxH = Math.max(maxH, h);
}
// sag kenar: son parcanin ETIKETI konturdan tasabiliyor (olculdu: Collar Lining
// kirpiliyordu). Kirpmayi gizlemek yerine sayfa etiket genisligi kadar buyutuldu.
const labelW = Math.max(...dump.pieces.map((q) => q.name.length)) * 8 + 90;
const W = x - GAP + labelW + PAD, H = PAD * 2 + LABEL + maxH;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(W)} ${n(H)}" width="100%" ` +
  `role="img" data-unit-mm="1" data-scale="1:1" data-kind="pattern-sheet">` +
  `<rect width="${n(W)}" height="${n(H)}" fill="${PAPER}"/>` +
  `<text x="${PAD}" y="26" font-family="Helvetica,Arial,sans-serif" font-size="20" font-weight="600" fill="${INK}">` +
  `KALIP — ${dump.garment} · ${dump.pieces.length} parca · dolu=kesim cizgisi, kesik=dikis cizgisi</text>` +
  `${inner}</svg>`;
writeFileSync(outp, svg);
console.log(`svg: ${outp}  ${n(W)}x${n(H)} mm  parca=${dump.pieces.length}`);
