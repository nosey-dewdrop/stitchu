// render-one — tek stili verilen knob override'larıyla PNG'ye basar (taklit döngüsü içi).
// kullanım: node render-one.mjs <style> <out.png> '<overridesJSON>'
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';
const [, , style, out, ovJson] = process.argv;
const { renderStyle, STYLE } = await import('../../flat-engine/_engine-full.mjs');
if (!STYLE[style]) { console.error('bilinmeyen stil: ' + style); process.exit(1); }
const ov = ovJson ? JSON.parse(ovJson) : {};
const svg = renderStyle(style, ov);
const png = new Resvg(svg, { background: 'white', fitTo: { mode: 'width', value: 940 } }).render().asPng();
writeFileSync(out, png);
