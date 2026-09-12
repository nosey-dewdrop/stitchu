// Motor (cupSeam=bugra) vs Bugra-36 rings: piece-by-piece IoU + W/H.
// Alignment identical to overlay.mjs: centroid + PCA angle candidates
// (+mirror, +90k), 2mm grid IoU, best kept. Motor input = the native
// engine/build/bugra-dump binary's JSON (cutPoly, SA 15 included); Bugra =
// geometry-full.json size-36 rings (SA 10 included) with the CORRECTED piece
// identities (2026-07-27 foy IoU matching, /tmp/bugra-yuzlesme/corset/matching.json).
// Usage: node motor-bugra-iou.mjs [dump.json] [outdir]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const require2 = createRequire(join(ROOT, 'engine/tools/package.json'));
const { Resvg } = require2('@resvg/resvg-js');

const dumpPath = process.argv[2] || '/tmp/bugra-dump.json';
const outDir = process.argv[3] || '/tmp/bugra-motor-loop';
mkdirSync(outDir, { recursive: true });

const geo = JSON.parse(readFileSync(join(HERE, '..', 'geometry', 'geometry-full.json'), 'utf8'));
const motor = JSON.parse(readFileSync(dumpPath, 'utf8'));
const M = Object.fromEntries(motor.pieces.map((p) => [p.name, p]));

// Corrected identities: extraction name in geometry-full.json -> true Bugra piece.
const PAIRS = [
  { ext: 'Upper Cup',              bugra: 'Upper Cup (askili, foy 1)',      motor: 'Upper Cup' },
  { ext: 'Back Body (side)',       bugra: 'Lower Cup hilal (foy 2)',        motor: 'Lower Cup' },
  { ext: 'Lower Cup',              bugra: 'Front Body orta (foy 4)',        motor: 'Front Body Center' },
  { ext: 'Front Body (side)',      bugra: 'Front Body yan (foy 3)',         motor: 'Front Body Side' },
  { ext: 'Back Body (center fold)',bugra: 'Back Body + aski (foy 5)',       motor: 'Back Body Side' },
  { ext: 'Front Body (center)',    bugra: 'Back Body fold (foy 6)',         motor: 'Back Body Center' },
];

const ring36 = Object.fromEntries(
  geo.rings.filter((r) => r.pattern === 'corset_bustier' && r.sizeGuess === '36').map((r) => [r.piece, r]));

// ---- geometry (verbatim from overlay.mjs) ----
const close = (P) => (P.length && (P[0][0] !== P[P.length-1][0] || P[0][1] !== P[P.length-1][1])) ? [...P, [...P[0]]] : P;
function moments(Praw) {
  const P = close(Praw);
  let A = 0, cx = 0, cy = 0, ixx = 0, iyy = 0, ixy = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i+1];
    const cr = x0 * y1 - x1 * y0;
    A += cr; cx += (x0 + x1) * cr; cy += (y0 + y1) * cr;
    ixx += (y0*y0 + y0*y1 + y1*y1) * cr;
    iyy += (x0*x0 + x0*x1 + x1*x1) * cr;
    ixy += (x0*y1 + 2*x0*y0 + 2*x1*y1 + x1*y0) * cr;
  }
  A /= 2; cx /= 6*A; cy /= 6*A; ixx /= 12; iyy /= 12; ixy /= 24;
  const vx = iyy/A - cx*cx, vy = ixx/A - cy*cy, vxy = ixy/A - cx*cy;
  return { A: Math.abs(A), cx, cy, angle: 0.5 * Math.atan2(2*vxy, vx - vy) };
}
const centerAt = (P, cx, cy) => P.map(([x, y]) => [x - cx, y - cy]);
const rot = (P, a) => { const c = Math.cos(a), s = Math.sin(a); return P.map(([x, y]) => [c*x - s*y, s*x + c*y]); };
const mirrorX = (P) => P.map(([x, y]) => [-x, y]);
const bbox = (P) => { const xs = P.map(p=>p[0]), ys = P.map(p=>p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys),
           w: Math.max(...xs)-Math.min(...xs), h: Math.max(...ys)-Math.min(...ys) }; };
const perim = (Praw) => { const P = close(Praw); let s = 0;
  for (let i = 1; i < P.length; i++) s += Math.hypot(P[i][0]-P[i-1][0], P[i][1]-P[i-1][1]); return s; };
function fillMask(Praw, minX, minY, cell, nx, ny) {
  const P = close(Praw); const mask = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    const y = minY + (j + 0.5) * cell; const xs = [];
    for (let i = 0; i < P.length - 1; i++) {
      const [x0, y0] = P[i], [x1, y1] = P[i+1];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + (y - y0) / (y1 - y0) * (x1 - x0));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((xs[k] - minX) / cell - 0.5));
      const i1 = Math.min(nx - 1, Math.floor((xs[k+1] - minX) / cell - 0.5));
      for (let i = i0; i <= i1; i++) mask[j * nx + i] = 1;
    }
  }
  return mask;
}
function iou(Pa, Pb, cell = 2, dilateBmm = 0) {
  const ba = bbox(Pa), bb = bbox(Pb);
  const pad = cell + dilateBmm;
  const minX = Math.min(ba.minX, bb.minX) - pad, minY = Math.min(ba.minY, bb.minY) - pad;
  const maxX = Math.max(ba.maxX, bb.maxX) + pad, maxY = Math.max(ba.maxY, bb.maxY) + pad;
  const nx = Math.ceil((maxX - minX) / cell), ny = Math.ceil((maxY - minY) / cell);
  const ma = fillMask(Pa, minX, minY, cell, nx, ny);
  let mb = fillMask(Pb, minX, minY, cell, nx, ny);
  if (dilateBmm > 0) {
    // disc dilation: grow Pb's mask by dilateBmm (the seam-allowance equalizer —
    // the motor SEWING line grown by Bugra's own 10 mm SA, so both sides sit on
    // the same cut basis instead of 15 mm vs 10 mm).
    const r = Math.round(dilateBmm / cell);
    const offs = [];
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++)
        if (dx * dx + dy * dy <= r * r) offs.push([dx, dy]);
    const out = new Uint8Array(nx * ny);
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        if (!mb[j * nx + i]) continue;
        for (const [dx, dy] of offs) {
          const x = i + dx, y = j + dy;
          if (x >= 0 && x < nx && y >= 0 && y < ny) out[y * nx + x] = 1;
        }
      }
    mb = out;
  }
  let inter = 0, uni = 0;
  for (let i = 0; i < ma.length; i++) { const a = ma[i], b = mb[i]; if (a & b) inter++; if (a | b) uni++; }
  return uni ? inter / uni : 0;
}
// Best RIGID alignment (rotation + mirror about centroids), not just the PCA
// candidates: the rings sit on the A0 at arbitrary placement angles, and for
// L-shaped pieces the PCA axis is a poor stand-in — a coarse 4° sweep (4 mm
// grid) followed by a 0.5° refinement (2 mm grid) finds the honest optimum.
function align(bugraRaw, motorRaw, dilateMmm = 0) {
  const mm = moments(motorRaw);
  const Mc = centerAt(motorRaw, mm.cx, mm.cy);
  let best = null;
  const consider = (Bc, a, mir, cell) => {
    const cand = rot(Bc, a);
    const s = iou(cand, Mc, cell, dilateMmm);
    if (!best || s > best.iou) best = { iou: s, poly: cand, rad: a, rotDeg: Math.round(a * 180 / Math.PI), mirror: mir };
  };
  for (const mir of [false, true]) {
    const base = mir ? mirrorX(bugraRaw) : bugraRaw;
    const bm = moments(base);
    const Bc = centerAt(base, bm.cx, bm.cy);
    for (let deg = 0; deg < 360; deg += 4) consider(Bc, deg * Math.PI / 180, mir, 4);
    for (const extra of [0, Math.PI/2, Math.PI, 3*Math.PI/2])
      consider(Bc, mm.angle - bm.angle + extra, mir, 4);
  }
  // refine around the winner on the fine grid
  {
    const mir = best.mirror;
    const base = mir ? mirrorX(bugraRaw) : bugraRaw;
    const bm = moments(base);
    const Bc = centerAt(base, bm.cx, bm.cy);
    const center = best.rad;
    best = null;
    for (let d = -4; d <= 4; d += 0.5) consider(Bc, center + d * Math.PI / 180, mir, 2);
  }
  return { best, motorCentered: Mc };
}

const fmt = (b) => `${b.w.toFixed(0)}x${b.h.toFixed(0)}`;
const pathOf = (P, S, ox, oy) => 'M ' + P.map(([x, y]) => `${(ox + x*S).toFixed(1)} ${(oy + y*S).toFixed(1)}`).join(' L ') + ' Z';

const results = [];
for (const pair of PAIRS) {
  const ring = ring36[pair.ext];
  const mp = M[pair.motor];
  if (!ring || !mp) {
    results.push({ piece: pair.bugra, motor: pair.motor, missing: !mp ? 'motor' : 'ring' });
    console.log(`${pair.bugra}: MISSING ${!mp ? 'motor piece' : 'ring'}`);
    continue;
  }
  const r = align(ring.polygon, mp.cutPoly);
  const a = r.best;
  // SA-equalized score (the honest apples-to-apples): the ring includes Bugra's
  // 10 mm SA, the motor cutPoly includes 15 mm — so ALSO align the ring against
  // the motor SEWING line grown by the same 10 mm. Same rigid-alignment search.
  const rSA = align(ring.polygon, mp.sewPoly, 10);
  const mB = bbox(a.poly), mM = bbox(r.motorCentered);
  results.push({
    piece: pair.bugra, motor: pair.motor,
    iou: +a.iou.toFixed(3), iouSA10: +rSA.best.iou.toFixed(3),
    rotDeg: a.rotDeg, mirror: a.mirror,
    bugraW: +mB.w.toFixed(1), bugraH: +mB.h.toFixed(1), bugraPerim: +perim(ring.polygon).toFixed(0),
    motorW: +mM.w.toFixed(1), motorH: +mM.h.toFixed(1), motorPerim: +perim(mp.cutPoly).toFixed(0),
  });
  console.log(`${pair.bugra.padEnd(28)} IoU ${a.iou.toFixed(3)} | SA10 ${rSA.best.iou.toFixed(3)}  B ${fmt(mB)}  M ${fmt(mM)}  (rot ${a.rotDeg}deg${a.mirror ? ' +mirror' : ''})`);

  // per-piece overlay PNG
  const S = 1.1, pad = 28;
  const layers = [
    { poly: r.motorCentered, stroke: '#d21f2e', width: 1.4 },
    { poly: a.poly, stroke: '#191938', width: 2.6, fill: 'rgba(25,25,56,0.05)' },
  ];
  const all = layers.flatMap((l) => l.poly);
  const b = bbox(all);
  const w = b.w * S + 2*pad, h = b.h * S + 2*pad;
  const ox = pad - b.minX * S, oy = pad - b.minY * S;
  let inner = '';
  for (const l of layers)
    inner += `<path d="${pathOf(l.poly, S, ox, oy)}" fill="${l.fill || 'none'}" stroke="${l.stroke}" stroke-width="${l.width}" stroke-linejoin="round"/>`;
  const W = Math.max(w, 760), H = h + 96;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#faf8f4"/>
<text x="14" y="22" font-family="Helvetica" font-size="15" font-weight="bold" fill="#191938">${pair.bugra} vs motor ${pair.motor} — IoU ${a.iou.toFixed(3)}</text>
<text x="14" y="40" font-family="Helvetica" font-size="11" fill="#555">Bugra koyu (SA 10 dahil) · motor kirmizi (cutLine, SA 15) · B ${fmt(mB)} / M ${fmt(mM)} mm</text>
<g transform="translate(${(W - w) / 2}, 56)">${inner}</g></svg>`;
  const file = pair.motor.toLowerCase().replace(/ /g, '-');
  writeFileSync(join(outDir, `${file}.png`), new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
writeFileSync(join(outDir, 'iou.json'), JSON.stringify({ results }, null, 1));
const scored = results.filter((r) => r.iou !== undefined);
const minSA = Math.min(...scored.map((r) => r.iouSA10));
const min = Math.min(...scored.map((r) => r.iou));
console.log(`\npieces scored ${scored.length}/6, min IoU ${isFinite(min) ? min.toFixed(3) : "-"} | min SA10 ${isFinite(minSA) ? minSA.toFixed(3) : "-"}  (hedef her parca >= 0.70)`);
