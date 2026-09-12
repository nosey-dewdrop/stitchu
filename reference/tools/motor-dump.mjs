// Motor Locket draftini tam dok: peterPan + flat iki aday, cutLine poligonlari mm.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = '/Users/damummyphus/damla_projects_2026/stitchu';
const backend = await import(join(ROOT, 'backend/spec-core.js'));
const createEngine = (await import(join(ROOT, 'engine/dist/stitchu-engine.js'))).default;
const eng = await createEngine();
const BODY = { bust: 88, waist: 68, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
const base = {
  garment: 'top', neckline: 'scoop', shaping: 'dart', waistline: 'natural',
  sleeveStyle: 'straight', sleeveLength: 'short', sleeveCap: 'puffed',
  buttonRow: 'functional', placketStyle: 'standard', fabric: 'woven',
};
function toPoly(cmds) {
  const pts = []; let cur = null;
  for (const c of cmds) {
    if (c.type === 'move' || c.type === 'line') { cur = [c.x, c.y]; pts.push(cur); }
    else if (c.type === 'curve') {
      const p0 = cur, p1 = [c.cp1x, c.cp1y], p2 = [c.cp2x, c.cp2y], p3 = [c.x, c.y];
      for (let i = 1; i <= 16; i++) {
        const t = i / 16, u = 1 - t;
        pts.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],
                  u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]);
      }
      cur = p3;
    } else if (c.type === 'close') { if (pts.length) pts.push([...pts[0]]); }
  }
  return pts.map(p => [Math.round(p[0]*100)/100, Math.round(p[1]*100)/100]);
}
const result = {};
for (const collarType of ['peterPan', 'flat']) {
  const spec = { ...base, collarType, collarEdge: 'round' };
  const val = backend.validateDraftRequest({ spec, measurements: BODY });
  if (val.error) { console.log('RED', JSON.stringify(val)); continue; }
  const out = JSON.parse(eng.draftJSON(backend.engineSpec(val.spec), { ...BODY, upperBust: 0 }));
  result[collarType] = {
    spec, issues: out.issues,
    pieces: out.pattern.pieces.map(p => ({
      name: p.name, cutInstruction: p.cutInstruction, seamAllowance: p.seamAllowance,
      cutPoly: toPoly(p.cutLine), seamPoly: toPoly(p.commands),
    })),
  };
}
writeFileSync('/tmp/bugra-yuzlesme/motor-draft-locket.json', JSON.stringify({ body: BODY, result }));
for (const [k, v] of Object.entries(result)) {
  console.log('---', k, 'issues:', JSON.stringify(v.issues));
  for (const p of v.pieces) console.log(`  ${p.name} | SA=${p.seamAllowance} | ${p.cutInstruction} | cutPts=${p.cutPoly.length}`);
}
