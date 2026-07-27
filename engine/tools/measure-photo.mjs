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
import { deflateSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { measureGarment } from '../../web/js/measure.js';

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

// ---------- BMP (from sips) -> ImageData ----------
function bmpToImageData(buf) {
  if (buf[0] !== 0x42 || buf[1] !== 0x4d) throw new Error('not a BMP');
  const off = buf.readUInt32LE(10);
  const W = buf.readInt32LE(18);
  const rawH = buf.readInt32LE(22);
  const H = Math.abs(rawH);
  const topDown = rawH < 0;
  const bpp = buf.readUInt16LE(28);
  if (bpp !== 24 && bpp !== 32) throw new Error('unsupported bpp ' + bpp);
  const bytes = bpp / 8;
  const stride = Math.ceil((W * bytes) / 4) * 4;
  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    const srcY = topDown ? y : H - 1 - y;
    const row = off + srcY * stride;
    for (let x = 0; x < W; x++) {
      const s = row + x * bytes;
      const d = (y * W + x) * 4;
      data[d] = buf[s + 2]; // BMP is BGR(A)
      data[d + 1] = buf[s + 1];
      data[d + 2] = buf[s];
      data[d + 3] = 255;
    }
  }
  return { data, width: W, height: H };
}

function cropImage(img, [x0, y0, x1, y1]) {
  const W = x1 - x0;
  const H = y1 - y0;
  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    const src = ((y + y0) * img.width + x0) * 4;
    data.set(img.data.subarray(src, src + W * 4), y * W * 4);
  }
  return { data, width: W, height: H };
}

// ---------- minimal PNG encoder (node zlib) ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, payload) {
  const out = Buffer.alloc(12 + payload.length);
  out.writeUInt32BE(payload.length, 0);
  out.write(type, 4, 'ascii');
  payload.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + payload.length)), 8 + payload.length);
  return out;
}
function writePng(path, rgb, W, H) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter none
    for (let x = 0; x < W; x++) {
      const s = (y * W + x) * 3;
      const d = y * (1 + W * 3) + 1 + x * 3;
      raw[d] = rgb[s];
      raw[d + 1] = rgb[s + 1];
      raw[d + 2] = rgb[s + 2];
    }
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

function imageDataToRgb(img) {
  const rgb = Buffer.alloc(img.width * img.height * 3);
  for (let p = 0; p < img.width * img.height; p++) {
    rgb[p * 3] = img.data[p * 4];
    rgb[p * 3 + 1] = img.data[p * 4 + 1];
    rgb[p * 3 + 2] = img.data[p * 4 + 2];
  }
  return rgb;
}

function maskToRgb(mask, landmarks) {
  const { data, width: W, height: H } = mask;
  const rgb = Buffer.alloc(W * H * 3);
  for (let p = 0; p < W * H; p++) {
    const v = data[p] ? 255 : 0;
    rgb[p * 3] = v;
    rgb[p * 3 + 1] = v;
    rgb[p * 3 + 2] = v;
  }
  if (landmarks) {
    const line = (y, r, g, b) => {
      if (!Number.isInteger(y) || y < 0 || y >= H) return;
      for (let x = 0; x < W; x++) {
        rgb[(y * W + x) * 3] = r;
        rgb[(y * W + x) * 3 + 1] = g;
        rgb[(y * W + x) * 3 + 2] = b;
      }
    };
    line(landmarks.y0, 255, 80, 80); // garment top
    line(landmarks.y1, 255, 80, 80); // hem
    line(landmarks.waistY, 80, 160, 255); // narrowest (waist)
    line(landmarks.bustY0, 90, 200, 90); // bust band
    line(landmarks.bustY1, 90, 200, 90);
  }
  return rgb;
}

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
