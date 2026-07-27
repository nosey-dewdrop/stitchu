// photo-pixels.mjs — shared offline JPG/PNG pixel plumbing for the measurement
// harnesses (measure-photo.mjs, oran-kablo-proof.mjs). One truth, one place:
// the BMP decode + crop + minimal PNG encode used to feed web/js/measure.js in
// node. NO network, NO vision credits, NO npm image deps — macOS `sips`
// converts to BMP, node parses it.
import { execFileSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import { readFileSync, writeFileSync } from 'node:fs';

// ---------- BMP (from sips) -> ImageData ----------
export function bmpToImageData(buf) {
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

// Convert any image sips understands into an ImageData via a temp BMP.
export function imageFileToImageData(srcPath, tmpBmpPath) {
  execFileSync('sips', ['-s', 'format', 'bmp', srcPath, '--out', tmpBmpPath], { stdio: 'pipe' });
  return bmpToImageData(readFileSync(tmpBmpPath));
}

export function cropImage(img, [x0, y0, x1, y1]) {
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
export function writePng(path, rgb, W, H) {
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

export function imageDataToRgb(img) {
  const rgb = Buffer.alloc(img.width * img.height * 3);
  for (let p = 0; p < img.width * img.height; p++) {
    rgb[p * 3] = img.data[p * 4];
    rgb[p * 3 + 1] = img.data[p * 4 + 1];
    rgb[p * 3 + 2] = img.data[p * 4 + 2];
  }
  return rgb;
}

export function maskToRgb(mask, landmarks) {
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
