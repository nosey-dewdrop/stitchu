// MIHENK-08 gode/gore midi skirt flat grid. skirtStyle 'gore' → panel seams.
// Opt-in → golden/pins unaffected. Output: reports/gate/mihenk08/g*.svg
import { renderGarmentFlat } from './render-garment-flat.mjs';
import fs from 'fs';
// gode MIDI SKIRT (mihenk 3 = godeli midi etek): garment top with long skirt?
// A skirt-only flat: garment 'top' won't give a skirt; use dress with fitted band
// bodice OR a skirt-length top. Engine's gore is a SKIRT — render as dress + short
// bodice so the skirt dominates, plus a pure-skirt read via topLength.
const base = { garment: 'dress', shaping: 'darts', neckline: 'boat',
  skirtStyle: 'gore', ink: 'orta' };
const variants = [
  { id: 'g1', label: 'baz · 6-gore · midi', spec: { ...base, skirtLength: 'midi' } },
  { id: 'g2', label: '6-gore · maxi', spec: { ...base, skirtLength: 'maxi' } },
  { id: 'g3', label: '8-gore · midi', spec: { ...base, skirtLength: 'midi', goreCount: 8 } },
  { id: 'g4', label: '4-gore · midi', spec: { ...base, skirtLength: 'midi', goreCount: 4 } },
  { id: 'g5', label: '6-gore · mini', spec: { ...base, skirtLength: 'mini' } },
  { id: 'g6', label: '6-gore · sadelik (kolsuz, sade yaka)', spec: { ...base, skirtLength: 'midi', sleeveStyle: null, sleeveLength: null } },
];
fs.mkdirSync('reports/gate/mihenk08', { recursive: true });
for (const v of variants) {
  const svg = renderGarmentFlat([], v.spec);
  fs.writeFileSync(`reports/gate/mihenk08/${v.id}.svg`, svg);
  console.log(v.id, v.label, svg.length, 'bytes');
}
