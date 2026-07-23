// KALIP PARÇASI KONTUR-ÇIKARICI (2026-07-23, örnekten-şablon yolu, Damla emri).
// Gerçek kalıp parçasının (raster) DIŞ HATTINI otomatik izler → normalize nokta listesi
// (şablon). Ben (LLM) bezier YAZMIYORUM — parçanın kendi hattı şablon oluyor. Motor bu
// şablonu kendi beden ölçüsüne göre ölçekleyip çizecek + kalıba bağlayacak.
//
// YÖNTEM: bbox içinde dış-hat = her açıda merkezden en uzak dark piksel (radial trace).
// Çok-bedenli kalıpta EN DIŞ hat = en büyük beden; onu izler. Renkli çizgiler gri eşiğiyle.
//
// KULLANIM: node engine/imitate/trace-piece.mjs <piece.png> <out.json> [ink=150] [npts=120]

import { PNG } from './png.mjs';
import { writeFileSync } from 'node:fs';

const [, , src, out, inkArg, nptsArg] = process.argv;
const INK = inkArg ? +inkArg : 150;
const NPTS = nptsArg ? +nptsArg : 120;

const { gray, W, H } = PNG.grayFromFile(src);
// bbox (dark = çizim)
let y0 = 1e9, y1 = -1, x0 = 1e9, x1 = -1;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (gray[y * W + x] < INK) { if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x; }
const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;

// radial trace: her açıda merkezden dışarı, EN UZAK dark piksel = dış hat (en büyük beden)
const pts = [];
for (let i = 0; i < NPTS; i++) {
  const ang = (i / NPTS) * 2 * Math.PI;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const maxR = Math.hypot(W, H);
  let hitR = 0;
  for (let r = 2; r < maxR; r += 1) {
    const px = Math.round(cx + dx * r), py = Math.round(cy + dy * r);
    if (px < 0 || px >= W || py < 0 || py >= H) break;
    if (gray[py * W + px] < INK) hitR = r;   // en son (en dış) dark = dış hat
  }
  if (hitR > 0) pts.push([cx + dx * hitR, cy + dy * hitR]);
}
// normalize: bbox merkezine göre, [-1,1] kutu (motor kendi ölçüsüne çarpacak)
const bw = (x1 - x0) / 2, bh = (y1 - y0) / 2;
const norm = pts.map(([px, py]) => [(px - cx) / bw, (py - cy) / bh]);

writeFileSync(out, JSON.stringify({
  src, ink: INK, npts: norm.length,
  bbox: { w: x1 - x0, h: y1 - y0 },
  contour: norm,   // normalize dış hat noktaları (radial sıralı)
  ts: '2026-07-23',
}, null, 1));
console.log(`kontur çıkarıldı: ${norm.length} nokta, bbox ${x1 - x0}x${y1 - y0} -> ${out}`);
