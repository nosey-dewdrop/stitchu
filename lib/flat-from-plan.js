// THE FLAT, DRAWN FROM THE SEAM PLAN (GECE7 / F3).
//
// WHAT THIS REPLACES, AND WHY IT IS A REPLACEMENT AND NOT AN ALTERNATIVE.
// web/lib/flat-core.js draws the flat with a PEN, from a 2D croquis: a set of
// hand-authored curves keyed off the spec's words. It is a good pen and it is
// not the problem. The problem is that its croquis is a SECOND OBJECT. At EU38
// it says the waist is 700.0mm while the pattern the same screen hands the user
// says 724.89mm, and no amount of care makes two objects agree — they agree
// until somebody edits one of them.
//
// Here the flat is not drawn, it is PROJECTED: engine.flatJSON() returns the
// orthographic projection of the very GarmentSurf the pattern was cut from
// (engine/src/seamplan.cpp), and this file turns that into SVG path data and
// nothing else. There is no geometry in this file. Every number it prints came
// out of the engine; if a curve here is wrong, it is wrong in the pattern too,
// which is the entire point.
//
// TWO CURVES, AND THE SECOND ONE IS THE NEW THING:
//   1. the SILHOUETTE — the shell's extreme x, which the old line also had;
//   2. the TOP BOUNDARY — neckline, shoulder line, armhole. Interior to the
//      silhouette, and therefore invisible to it. Measured on the shipped tree:
//      deepening the front neckline 20mm moved the pattern's front torso panel
//      perimeter by 6.15mm and the flat's silhouette by 0.0000mm. The flat was
//      not lying, it was blind. This curve is what it was blind to.
//
// Units are millimetres, 1 user unit = 1mm, so the document is 1:1.

/** SVG path data for one closed silhouette, mirrored about x = 0. */
function siluetPath(yariKontur, x0, topZ) {
  if (!Array.isArray(yariKontur) || !yariKontur.length) return '';
  // y flips ONCE, here, because SVG counts down and the shell counts up. The
  // flip is declared at the boundary rather than baked into the geometry — the
  // same choice tools/shell-flat.cpp makes, and for the same reason.
  const X = (x) => (x0 + x).toFixed(4);
  const Y = (z) => (topZ - z).toFixed(4);
  const f = yariKontur[0];
  let d = `M ${X(f[0])} ${Y(f[1])}`;
  for (const s of yariKontur) {
    d += ` C ${X(s[2])} ${Y(s[3])} ${X(s[4])} ${Y(s[5])} ${X(s[6])} ${Y(s[7])}`;
  }
  const last = yariKontur[yariKontur.length - 1];
  d += ` L ${X(-last[6])} ${Y(last[7])}`;
  for (let i = yariKontur.length - 1; i >= 0; i--) {
    const s = yariKontur[i];
    d += ` C ${X(-s[4])} ${Y(s[5])} ${X(-s[2])} ${Y(s[3])} ${X(-s[0])} ${Y(s[1])}`;
  }
  return d + ' Z';
}

/**
 * The top boundary as an OPEN path. Open on purpose: a neckline is not a closed
 * shape on a technical drawing, it is where the cloth stops. Closing it would
 * draw an edge the garment does not have.
 */
function ustSinirPath(pts, x0, topZ) {
  if (!Array.isArray(pts) || pts.length < 2) return '';
  return pts
    .map((p, i) => `${i ? 'L' : 'M'} ${(x0 + p[0]).toFixed(4)} ${(topZ - p[1]).toFixed(4)}`)
    .join(' ');
}

/**
 * Render the engine's flatJSON as one 1:1 SVG document, front and back.
 *
 * REFUSES rather than draws a lie (RULES invariant 1): an engine error, a
 * missing silhouette or a missing top boundary all throw. A flat with a
 * silently absent neckline is exactly the failure this file was written to end,
 * so "no neckline" is never a quiet blank — it is an exception with the
 * engine's own words in it.
 */
export function renderFlatFromPlan(flat) {
  if (!flat || typeof flat !== 'object') throw new Error('flat: engine returned nothing');
  if (flat.error) throw new Error(`flat: ${flat.error}`);
  if (!Array.isArray(flat.siluet) || flat.siluet.length !== 2) {
    throw new Error('flat: the plan carries no front/back silhouette');
  }
  if (!flat.ust_sinir || flat.ust_sinir.hata) {
    throw new Error(`flat: ${(flat.ust_sinir && flat.ust_sinir.hata) || 'the plan carries no top boundary'}`);
  }

  const h = flat.ustZ_mm - flat.altZ_mm;
  let wHalf = 0;
  for (const v of flat.siluet)
    for (const s of v.yari_kontur) wHalf = Math.max(wHalf, Math.abs(s[0]), Math.abs(s[6]));
  for (const yon of ['on', 'arka'])
    for (const p of flat.ust_sinir[yon] || []) wHalf = Math.max(wHalf, Math.abs(p[0]));

  const pad = 40, gap = 80, panelW = 2 * wHalf;
  const W = 2 * pad + 2 * panelW + gap, H = 2 * pad + h + 30;
  const cx = [pad + wHalf, pad + panelW + gap + wHalf];
  const topZ = pad + flat.ustZ_mm;

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(2)}mm" height="${H.toFixed(2)}mm" ` +
    `viewBox="0 0 ${W.toFixed(4)} ${H.toFixed(4)}" data-scale="1" data-source="SeamPlan" ` +
    // ⭐ THE NODE ID TRAVELS IN THE FILE. A flat opened offline in Illustrator,
    // with no site around it, can still be held next to a pattern and asked the
    // only question that matters: did you two come out of the same object?
    `data-dugum="${flat.dugum}" data-size="${flat.beden}" ` +
    `data-sinif="${flat.sinif.garment}/${flat.sinif.shaping}/${flat.sinif.fabric}">`);
  parts.push('  <g fill="none" stroke="#111" stroke-width="1.2">');
  flat.siluet.forEach((v, i) => {
    parts.push(`    <path data-view="${v.gorunum}" data-curve="siluet" d="${siluetPath(v.yari_kontur, cx[i], topZ)}"/>`);
  });
  ['on', 'arka'].forEach((yon, i) => {
    parts.push(`    <path data-view="${yon}" data-curve="ust-sinir" d="${ustSinirPath(flat.ust_sinir[yon], cx[i], topZ)}"/>`);
  });
  parts.push('  </g>');
  parts.push('  <g font-family="sans-serif" font-size="14" text-anchor="middle" fill="#111">');
  parts.push(`    <text x="${cx[0].toFixed(4)}" y="${(H - 12).toFixed(4)}">FRONT ${flat.beden}</text>`);
  parts.push(`    <text x="${cx[1].toFixed(4)}" y="${(H - 12).toFixed(4)}">BACK ${flat.beden}</text>`);
  parts.push('  </g>');
  parts.push('</svg>');
  return parts.join('\n');
}

/**
 * WHICH CLASSES ARE ON THE SEAM-PLAN LINE.
 *
 * F3 ships ONE class and the migration is per class, deliberately: doing all of
 * them at once kills the phase (KOSU-v7 §F3). Two rules ride on this function:
 *
 *  1. A class on this list must NOT also be drawn by the pen — two engines for
 *     one garment is forbidden (yasak 3), not merely untidy.
 *  2. ⚠ THIS COUNT NEVER REACHES THE USER INTERFACE. "33% of the system is on
 *     the new line" makes a shopper read "this site is broken". The migration is
 *     silent; the user sees only their own garment's output. The counter lives
 *     in the phase card and in the referee's hands, nowhere else.
 */
export function planLineClass(spec) {
  if (!spec || typeof spec !== 'object') return null;
  // top / dart / woven — the referee's choice (K22), on two measurements:
  // fewest panels (37-tunic-blouse and 36-crop-top both draft 3 panels against
  // a dress's 6-10), and `woven` is 18 of the 19 photos in the pool.
  const garment = String(spec.garment || '');
  const shaping = String(spec.shaping || 'dart');
  const fabric = String(spec.fabric || 'woven');
  if (garment === 'top' && shaping === 'dart' && fabric === 'woven') {
    return { garment: 'top', shaping: 'dart', fabric: 'woven' };
  }
  return null;
}
