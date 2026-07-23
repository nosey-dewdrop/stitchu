// Minimal PNG → grayscale decoder (bağımlılık yok, Node zlib). Taklit motoru için.
// Sadece 8-bit RGB/RGBA, non-interlaced PNG (Chrome headless çıktısı böyle).
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

function paeth(a, b, c) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }

export const PNG = {
  grayFromFile(path) {
    const buf = readFileSync(path);
    let off = 8; // skip signature
    let W = 0, H = 0, bitDepth = 0, colorType = 0;
    const idat = [];
    while (off < buf.length) {
      const len = buf.readUInt32BE(off); const type = buf.toString('ascii', off + 4, off + 8);
      const data = buf.subarray(off + 8, off + 8 + len);
      if (type === 'IHDR') { W = data.readUInt32BE(0); H = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
      else if (type === 'IDAT') idat.push(data);
      else if (type === 'IEND') break;
      off += 12 + len;
    }
    const raw = inflateSync(Buffer.concat(idat));
    const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 4;
    const stride = W * channels;
    const gray = new Uint8Array(W * H);
    const prevLine = new Uint8Array(stride);
    const line = new Uint8Array(stride);
    let rp = 0;
    for (let y = 0; y < H; y++) {
      const filter = raw[rp++];
      for (let x = 0; x < stride; x++) {
        const rawB = raw[rp++];
        const a = x >= channels ? line[x - channels] : 0;
        const b = prevLine[x];
        const c = x >= channels ? prevLine[x - channels] : 0;
        let v;
        switch (filter) {
          case 0: v = rawB; break;
          case 1: v = rawB + a; break;
          case 2: v = rawB + b; break;
          case 3: v = rawB + ((a + b) >> 1); break;
          case 4: v = rawB + paeth(a, b, c); break;
          default: v = rawB;
        }
        line[x] = v & 0xff;
      }
      for (let x = 0; x < W; x++) {
        const o = x * channels;
        // luminance (RGB) ya da gri
        gray[y * W + x] = channels >= 3 ? ((line[o] * 299 + line[o + 1] * 587 + line[o + 2] * 114) / 1000) | 0 : line[o];
      }
      prevLine.set(line);
    }
    return { gray, W, H };
  }
};
