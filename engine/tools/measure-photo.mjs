#!/usr/bin/env node
// Offline proof harness for web/js/measure.js (deterministic photo measurement).
// NO network, NO vision credits, NO browser needed.
//
// PNG/JPG -> ImageData path (documented per task):
//   1. macOS built-in `sips` converts the benchmark JPG to BMP
//      (24bpp BGR, top-down when height is negative) — zero npm deps.
//   2. This file parses the BMP into an ImageData-like {data,width,height}
//      RGBA buffer, crops the product-photo region out of the browser
//      screenshot (benchmark-58 photos are full Safari screenshots; the crop
//      simulates what a create.js user actually uploads: the garment photo),
//   3. calls measureGarment() — the exact module the browser will run,
//   4. writes the cropped input + silhouette mask as PNGs (minimal PNG
//      encoder on node's built-in zlib; landmark rows drawn in gray).
//
// Usage: node engine/tools/measure-photo.mjs [outDir]
// Outputs: <outDir>/inputs/*.png, <outDir>/masks/*.png, <outDir>/results.json
// benchmark-58 content is read as LOCAL test input only; nothing is copied
// into the repo or the site.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { measureGarment } from '../../web/js/measure.js';
// shared offline pixel plumbing (one truth; oran-kablo-proof.mjs uses the same)
import { bmpToImageData, cropImage, writePng, imageDataToRgb, maskToRgb } from './photo-pixels.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PHOTOS = join(ROOT, 'benchmark-58', 'photos-1024');
const OUT = process.argv[2] || '/tmp/stitchu-measure';

// Each entry: screenshot file tag + absolute pixel crop [x0,y0,x1,y1] on the
// 1024x666 screenshot isolating the product image (= what a user uploads).
// `expect` documents the human-visible ground truth used to judge the row.
const MANIFEST = [
  { tag: '13.50.04', crop: [335, 300, 460, 600], note: 'mini shift dress, technical flat FRONT on plain beige (vision read L/W 1.55)' },
  { tag: '13.53.55', crop: [175, 182, 372, 472], note: 'boat-neck tank FRONT flat, white on plain black' },
  { tag: '13.50.29', crop: [268, 192, 415, 428], note: 'tartan pinafore fit-and-flare flat on plain light gray' },
  { tag: '13.48.48', crop: [430, 272, 552, 432], note: 'babydoll mini flat inset on plain pink' },
  { tag: '13.48.42', crop: [170, 272, 290, 432], note: 'HELOISE fit-and-flare mini FRONT flat (blue on white)' },
  { tag: '13.52.12', crop: [195, 125, 385, 575], note: 'halter midi WORN on model, plain cream studio (worn refusal expected)' },
  { tag: '13.48.01', crop: [215, 130, 520, 585], note: 'white linen mini WORN on model, marble wall (honest refusal expected)' },
  { tag: '13.47.49', crop: [200, 145, 533, 590], note: 'NEGATIVE: street scene, mixed ground (building + dark door + pavement)' },
];

// ---------- run ----------
mkdirSync(join(OUT, 'bmp'), { recursive: true });
mkdirSync(join(OUT, 'inputs'), { recursive: true });
mkdirSync(join(OUT, 'masks'), { recursive: true });

const results = [];
for (const item of MANIFEST) {
  const file = `Ekran Resmi 2026-07-15 ${item.tag}.jpg`;
  const bmpPath = join(OUT, 'bmp', item.tag + '.bmp');
  execFileSync('sips', ['-s', 'format', 'bmp', join(PHOTOS, file), '--out', bmpPath], { stdio: 'pipe' });
  const full = bmpToImageData(readFileSync(bmpPath));
  const img = cropImage(full, item.crop);
  const inputPath = join(OUT, 'inputs', item.tag + '.png');
  writePng(inputPath, imageDataToRgb(img), img.width, img.height);

  const res = measureGarment(img, { wantMask: true });
  let maskPath = null;
  if (res.debug && res.debug.mask) {
    maskPath = join(OUT, 'masks', item.tag + '-mask.png');
    writePng(maskPath, maskToRgb(res.debug.mask, res.debug.landmarkRows), res.debug.mask.width, res.debug.mask.height);
  }
  const row = {
    photo: file,
    crop: item.crop,
    note: item.note,
    ok: res.ok,
    reason: res.reason || null,
    confidence: res.confidence,
    ratios: res.ratios,
    px: res.debug && res.debug.px ? res.debug.px : null,
    groundUniformity: res.debug ? res.debug.groundUniformity : null,
    tol: res.debug ? res.debug.tol : null,
    secondCompFrac: res.debug ? res.debug.secondCompFrac : null,
    fillFactor: res.debug ? res.debug.fillFactor : null,
    headTopFrac: res.debug ? res.debug.headTopFrac : null,
    legSplitFrac: res.debug ? res.debug.legSplitFrac : null,
    inputPng: inputPath,
    maskPng: maskPath,
  };
  results.push(row);
  const r = res.ratios || {};
  console.log(
    `${item.tag}  ok=${res.ok}${res.reason ? ' (' + res.reason + ')' : ''}  conf=${res.confidence}` +
    (res.ok ? `  L/W=${r.lengthToWidth}  hem/waist=${r.hemToWaistWidth}  waistY/L=${r.waistYToLength}` : ''),
  );
}
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2));
console.log('\nresults ->', join(OUT, 'results.json'));
