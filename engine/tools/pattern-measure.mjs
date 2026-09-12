#!/usr/bin/env node
// pattern-measure — the six shell measures, read off the PATTERN side.
//
// `shell-flat` prints six numbers from the 3D shell's own rings. This tool
// prints the same six names from the FLAT PANELS (surface-pattern's
// GarmentCode-shaped specification.json) so the two lines can be put side by
// side. It only ever measures what the panels actually carry:
//
//   * a circumference is the SUM OF REAL ARC LENGTHS of the panel edges that
//     make up that ring. Cubic edges are integrated by sampling at a step of
//     at most 0.05mm (20x finer than the 0.25mm the contract allows), never by
//     chord, never by control-polygon estimate.
//   * a measure the panels do not carry gets mm=null and a reason. There is no
//     fudge factor, no correction coefficient, no calibration against
//     shell-flat anywhere in this file. Whatever the panels say is what gets
//     printed.
//
// Which edges make up which ring is READ OFF THE STITCH GRAPH, not hardcoded:
//   waist  = the torso side of every torso<->skirt stitch
//   hem    = every skirt edge that no stitch mentions (the free lower boundary)
//   top    = every torso edge that no stitch mentions (the free upper boundary)
// Panel roles come from the stable names surface-pattern emits (walk.py's
// convention: *torso*, *skirt*), the same signal h3b-rings.py leans on.
//
// Usage: node engine/tools/pattern-measure.mjs <pattern.json> [--size EU38]
// Exit code is always 0: this tool measures, it does not judge. The verdict is
// somebody else's gate.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const MAX_STEP_MM = 0.05; // sampling step ceiling for cubic arc length
const CM_TO_MM = 10.0;

const argv = process.argv.slice(2);
let src = null, sizeArg = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--size' && i + 1 < argv.length) sizeArg = argv[++i];
  else if (src === null) src = argv[i];
}
if (!src) {
  process.stderr.write('usage: node pattern-measure.mjs <pattern.json> [--size EU38]\n');
  process.exit(0);
}

const raw = JSON.parse(readFileSync(src, 'utf8'));
const pat = raw.pattern ? raw.pattern : raw;
const panels = pat.panels || {};
const stitches = pat.stitches || [];

// The spec carries no size field, so the size is taken from the path (that is
// how the packs are named) or from --size. If neither says, it stays null
// rather than being guessed.
const size = sizeArg || (basename(String(src)).match(/EU\d{2}/i) || [null])[0];

// ---- arc length -----------------------------------------------------------
// walk.py's edge convention: an absolute control point is
//   c = a + r0*(b-a) + r1*perp(b-a),  perp(ex,ey) = (-ey, ex)
// (the same reconstruction surface-pattern.cpp writeSvg uses).
function control(a, b, p) {
  const ex = b[0] - a[0], ey = b[1] - a[1];
  return [a[0] + p[0] * ex - p[1] * ey, a[1] + p[0] * ey + p[1] * ex];
}

function edgeLengthMM(panel, edge) {
  const a = panel.vertices[edge.endpoints[0]];
  const b = panel.vertices[edge.endpoints[1]];
  if (!edge.curvature) return Math.hypot(b[0] - a[0], b[1] - a[1]) * CM_TO_MM;
  if (edge.curvature.type !== 'cubic')
    throw new Error(`unsupported curvature type: ${edge.curvature.type}`);
  const c1 = control(a, b, edge.curvature.params[0]);
  const c2 = control(a, b, edge.curvature.params[1]);
  // The control polygon is an upper bound on the arc, so sizing the sample
  // count from it guarantees the real step is <= MAX_STEP_MM.
  const polyMM = (Math.hypot(c1[0] - a[0], c1[1] - a[1]) +
                  Math.hypot(c2[0] - c1[0], c2[1] - c1[1]) +
                  Math.hypot(b[0] - c2[0], b[1] - c2[1])) * CM_TO_MM;
  const n = Math.max(64, Math.ceil(polyMM / MAX_STEP_MM));
  let len = 0, px = a[0], py = a[1];
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    const x = u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0];
    const y = u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1];
    len += Math.hypot(x - px, y - py);
    px = x; py = y;
  }
  return len * CM_TO_MM;
}

const lenOf = (pname, ei) => edgeLengthMM(panels[pname], panels[pname].edges[ei]);
const isTorso = (n) => n.includes('torso');
const isSkirt = (n) => n.includes('skirt');

// ---- which edges a stitch uses -------------------------------------------
const used = {};
for (const name of Object.keys(panels)) used[name] = new Set();
for (const st of stitches) {
  const sides = Array.isArray(st) ? st : (st.sides || []);
  for (const s of sides) if (used[s.panel]) used[s.panel].add(s.edge);
}

function freeSum(pred) {
  let sum = 0, n = 0;
  for (const [name, p] of Object.entries(panels)) {
    if (!pred(name)) continue;
    p.edges.forEach((e, i) => { if (!used[name].has(i)) { sum += edgeLengthMM(p, e); n++; } });
  }
  return { mm: sum, edges: n };
}

// waist: the torso side of every torso<->skirt stitch (h3b-rings' A side)
let waistTorso = 0, waistSkirt = 0, waistN = 0;
for (const st of stitches) {
  const sides = Array.isArray(st) ? st : (st.sides || []);
  if (sides.length < 2) continue;
  const [a, b] = sides;
  const at = isTorso(a.panel), bt = isTorso(b.panel);
  const as = isSkirt(a.panel), bs = isSkirt(b.panel);
  if (at && bs) { waistTorso += lenOf(a.panel, a.edge); waistSkirt += lenOf(b.panel, b.edge); waistN++; }
  else if (bt && as) { waistTorso += lenOf(b.panel, b.edge); waistSkirt += lenOf(a.panel, a.edge); waistN++; }
}

// centre-front run: the stitch between the two FRONT torso panels, continued
// by the stitch between the two FRONT skirt panels. Both chains span their
// panel end to end (waist->top edge, waist->hem), so the two together are the
// full front centre line of the flat garment.
function seamRun(pred) {
  let sum = 0, n = 0;
  for (const st of stitches) {
    const sides = Array.isArray(st) ? st : (st.sides || []);
    if (sides.length < 2) continue;
    const [a, b] = sides;
    if (a.panel === b.panel) continue;
    if (pred(a.panel) && pred(b.panel)) { sum += lenOf(a.panel, a.edge); n++; }
  }
  return { mm: sum, edges: n };
}
const cfTorso = seamRun((n) => isTorso(n) && n.includes('ftorso'));
const cfSkirt = seamRun((n) => isSkirt(n) && n.includes('front'));

const top = freeSum(isTorso);
const hem = freeSum(isSkirt);

const bodyLengthOK = cfTorso.edges > 0 && cfSkirt.edges > 0;

const r4 = (x) => Number(x.toFixed(4));

const measures = [
  {
    name: 'hem_circumference',
    mm: hem.edges ? r4(hem.mm) : null,
    how: `sum of the ${hem.edges} skirt-panel edges that no stitch mentions (the free lower boundary), each cubic integrated by sampling at step <= ${MAX_STEP_MM}mm; source coords are cm, multiplied by 10`,
    reason: hem.edges ? null : 'no skirt panel has a free edge in this spec',
  },
  {
    name: 'bust_circumference',
    mm: null,
    how: 'not attempted from the panels',
    reason: 'the flat panels carry no bust edge. A bust ring is a horizontal section of the 3D shell; in the developed pattern it is an interior curve with no vertex, no edge and no stitch, so nothing in this file locates it. Finding it would need the 3D->2D map, which the spec does not carry. Deriving it from the waist or the top ring is forbidden, so it stays null.',
  },
  {
    name: 'waist_circumference',
    mm: waistN ? r4(waistTorso) : null,
    how: `sum of the torso-side edges of all ${waistN} torso<->skirt stitches (the bodice waist ring, h3b-rings' A side); skirt side of the same stitches measures ${waistN ? r4(waistSkirt) : 'n/a'}mm`,
    reason: waistN ? null : 'no torso<->skirt stitch in this spec',
  },
  {
    name: 'body_length',
    mm: bodyLengthOK ? r4(cfTorso.mm + cfSkirt.mm) : null,
    how: `arc along the centre-front line: front-torso centre seam ${bodyLengthOK ? r4(cfTorso.mm) : 'n/a'}mm (top free edge down to waist, ${cfTorso.edges} edges) + front-skirt centre seam ${bodyLengthOK ? r4(cfSkirt.mm) : 'n/a'}mm (waist down to hem, ${cfSkirt.edges} edges). This is a length ALONG the cloth, not a vertical height difference`,
    reason: bodyLengthOK ? null : 'no centre-front seam found between two front panels',
  },
  {
    name: 'neck_opening_width',
    mm: null,
    how: 'not attempted from the panels',
    reason: `this pattern has no neckline: every torso panel's free upper boundary is one continuous top ring (${top.edges} edges, ${r4(top.mm)}mm total arc) with no neck cut in it — the garment is strapless. And a width is a projected 3D quantity; a flat panel can give an arc, not a projected width. Two different quantities, so no number is printed.`,
  },
  {
    name: 'shoulder_width',
    mm: null,
    how: 'not attempted from the panels',
    reason: 'this pattern has no shoulder: the torso panels stop at the top ring, there is no shoulder seam and no armhole in the stitch graph. Nothing to measure.',
  },
];

process.stdout.write(JSON.stringify({ source: String(src), size, measures }, null, 2) + '\n');
process.exit(0);
