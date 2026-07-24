// MIHENK-07 wrap dress variant grid. Sweeps wrap params on the production flat.
// Opt-in spec.wrap → golden/pins unaffected. Output: reports/gate/mihenk07/w*.svg
import { renderGarmentFlat } from './render-garment-flat.mjs';
import fs from 'fs';
const base = { garment: 'dress', skirtLength: 'midi', shaping: 'darts',
  neckline: 'vNeck', skirtStyle: 'aLine', sleeveStyle: 'set',
  sleeveLength: 'short', ink: 'orta' };
// variants: overlap side + skirt fullness + neckline depth read
const variants = [
  { id: 'w1', label: 'baz · wrap-sol · A-line', spec: { ...base, wrap: 1 } },
  { id: 'w2', label: 'wrap-sağ (ayna)', spec: { ...base, wrap: 2 } },
  { id: 'w3', label: 'gathered etek (daha akışkan)', spec: { ...base, wrap: 1, skirtStyle: 'gathered' } },
  { id: 'w4', label: 'düz shift etek', spec: { ...base, wrap: 1, skirtStyle: 'shift' } },
  { id: 'w5', label: 'derin V (surplice belirgin)', spec: { ...base, wrap: 1, neckline: 'scoop' } },
  { id: 'w6', label: 'kolsuz wrap', spec: { ...base, wrap: 1, sleeveStyle: null, sleeveLength: null } },
];
fs.mkdirSync('reports/gate/mihenk07', { recursive: true });
for (const v of variants) {
  const svg = renderGarmentFlat([], v.spec);
  fs.writeFileSync(`reports/gate/mihenk07/${v.id}.svg`, svg);
  console.log(v.id, v.label, svg.length, 'bytes');
}
