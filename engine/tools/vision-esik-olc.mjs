#!/usr/bin/env node
// vision-esik-olc.mjs — F2-vision (2026-09-01). The PROVENANCE tool for every
// threshold in contract/vision-tasima-v1.json oranKablolari: it drafts the
// engine's own variants on the EU38 demo body (engine/dist wasm, the same
// binary geometry the product ships) and prints the millimetres the thresholds
// are the midpoints of. No number in the contract file may disagree with this
// output — vision_tasima_check re-runs the derivation and goes red on drift.
//
//   usage: node engine/tools/vision-esik-olc.mjs
//
// Printed JSON: the measured class landmarks + the derived midpoints.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const createEngine = (await import(join(root, 'engine/dist/stitchu-engine.js'))).default;
const eng = await createEngine();
const { engineSpec } = await import(join(root, 'backend/spec-core.js'));

// EU38 demo body (create.js DEMO_BODY).
const MEAS = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35, upperBust: 0 };
const BASE = { garment: 'dress', sleeveStyle: 'none', skirtStyle: 'aLine', skirtLength: 'midi', neckline: 'crew' };

const draftPieces = (s) => {
  const out = JSON.parse(eng.draftJSON(engineSpec(s), MEAS));
  if (out.issues.length) throw new Error(`draft refused for ${JSON.stringify(s)}: ${out.issues}`);
  return out.pattern.pieces;
};
const bbox = (pc) => {
  const xs = []; const ys = [];
  for (const c of pc.commands) {
    if (c.x !== undefined) { xs.push(c.x); ys.push(c.y); }
    if (c.cp1x !== undefined) { xs.push(c.cp1x, c.cp2x); ys.push(c.cp1y, c.cp2y); }
  }
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};
const r2 = (v) => Math.round(v * 100) / 100;

const out = {};

// neckline: CF neck depth (first move y) + neck half width / shoulder tip x.
out.neckline = {};
for (const nl of ['crew', 'scoop', 'boat']) {
  const f = draftPieces({ ...BASE, neckline: nl }).find((p) => p.name === 'Bodice Front');
  out.neckline[nl] = {
    cfNeckDepthMM: r2(f.commands[0].y),
    neckHalfWidthMM: r2(f.commands[1].x),
    shoulderTipXMM: r2(f.commands[2].x),
    neckWidthToShoulder: r2(f.commands[1].x / f.commands[2].x * 100) / 100,
  };
}
out.neckDepthEsikMM = r2((out.neckline.crew.cfNeckDepthMM + out.neckline.scoop.cfNeckDepthMM) / 2);
out.neckWidthEsikOran = r2((out.neckline.crew.neckWidthToShoulder + out.neckline.boat.neckWidthToShoulder) / 2 * 100) / 100;

// waistline: bodice front height natural vs empire.
out.waistline = {};
for (const wl of ['natural', 'empire']) {
  const f = draftPieces({ ...BASE, waistline: wl }).find((p) => p.name === 'Bodice Front');
  out.waistline[wl] = { bodiceHeightMM: r2(bbox(f).h) };
}
out.waistYEsikMM = r2((out.waistline.natural.bodiceHeightMM + out.waistline.empire.bodiceHeightMM) / 2);

// sleeve lengths: drafted sleeve piece height per class.
out.sleeve = {};
for (const sl of ['short', 'elbow', 'long']) {
  const p = draftPieces({ ...BASE, sleeveStyle: 'straight', sleeveLength: sl }).find((x) => x.name === 'Sleeve');
  out.sleeve[sl] = { pieceHeightMM: r2(bbox(p).h) };
}
out.sleeveEsiklerMM = [
  r2((out.sleeve.short.pieceHeightMM + out.sleeve.elbow.pieceHeightMM) / 2),
  r2((out.sleeve.elbow.pieceHeightMM + out.sleeve.long.pieceHeightMM) / 2),
];

// straps: the engine's finished widths are constants (strap.hpp:40 spaghetti
// 8mm, constants.gen.hpp kStrapFinishedWidthMM wide 22mm); the drafted CUT
// pieces are printed as the visible witness.
out.strap = {};
for (const st of ['spaghetti', 'wide']) {
  const p = draftPieces({ ...BASE, ruffledStraps: st }).find((x) => /Strap/.test(x.name));
  out.strap[st] = { cutPieceWidthMM: r2(bbox(p).w), name: p.name };
}
out.strapEsikMM = (8 + 22) / 2;

console.log(JSON.stringify(out, null, 2));
