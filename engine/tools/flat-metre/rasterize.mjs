// flat-metre/rasterize — kalem stillerini PNG'ye basar (ölçüm girdisi).
// Ölçüm-amaçlı araç; kalem koduna dokunmaz, pin/golden riski yok.
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'out');
mkdirSync(OUT, { recursive: true });

const { renderStyle, STYLE } = await import('../../flat-engine/_engine-full.mjs');

// arg olarak stil listesi; boşsa hepsi
const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(STYLE);
for (const k of keys) {
  if (!STYLE[k]) { console.error('bilinmeyen stil:', k); continue; }
  const svg = renderStyle(k);
  const png = new Resvg(svg, { background: 'white', fitTo: { mode: 'width', value: 940 } }).render().asPng();
  writeFileSync(join(OUT, `${k}.png`), png);
  console.log('ok', k);
}
