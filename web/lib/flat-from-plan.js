// THE FLAT, DRAWN FROM THE SEAM PLAN (GECE7 / F3).
//
// WHAT THIS REPLACED, AND WHY IT IS A REPLACEMENT AND NOT AN ALTERNATIVE.
// The croquis pen drew the flat from a 2D croquis: a set of
// hand-authored curves keyed off the spec's words. It was a good pen and it was
// not the problem. The problem was that its croquis is a SECOND OBJECT. At EU38
// it said the waist is 700.0mm while the pattern the same screen handed the user
// said 724.89mm, and no amount of care makes two objects agree — they agree
// until somebody edits one of them.
//
// H3 (2026-08-30): that pen is DELETED and the allow-list that chose between the
// two lines (`planLineClass`) is deleted with it. Every class — dress, skirt,
// top, knit — is drawn here, from its own seam plan. An axis the surface line
// cannot carry is named in `desteklenmeyen_eksenler`, never drawn as something
// else. Gate: engine/tests/flat_pattern_agree_check.mjs --all measures the
// silhouette this file writes against the pattern's own bust/waist/hip lines in
// all four classes, and requires 0.1mm.
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
//
// ⭐ THE FLAT LAW STILL APPLIES, AND IT APPLIES HERE NOW.
// contract/flat-convention-v1.json is not the croquis pen's private style sheet;
// it is Damla's law for what a flat of hers looks like — one ink, hierarchy by
// WEIGHT not colour, zero paint, front and back. The pen that used to obey it is
// gone, and the drawing a shopper downloads is written here, so the obligation
// moved here with it. `engine/tests/flat_convention_check.mjs` reads the law off
// disk and measures THIS output against it: the three constants below are a
// mirror of that file and a mirror with no gate on it is a second truth. They
// cannot be readFileSync'd because this module ships to the browser.
//
// ⭐ AND THE GATE EXISTS NOW (H3-B): engine/tests/flat_mirror_check.mjs. The
// trailing comment on each line is not decoration — it is the MACHINE-READ
// declaration `// contract <file>.json <dotted.path>`, and the gate resolves it
// against the file on disk every run. `flat_tables_check` used to hold exactly
// this law over the deleted web/lib/flat-tables.gen.js; it died with its object
// and this is what took its place, so the sentence "a mirror with no gate on it
// is a second truth" is no longer just a sentence.
const INK = '#1f3a5f';   // contract/flat-convention-v1.json ink.color
const W_OUTLINE = 2.0;   // contract/flat-convention-v1.json lineClasses.classes.outline.width
const W_SEAM = 1.0;      // contract/flat-convention-v1.json lineClasses.classes.seam.width

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
    // THE SCALE IS DECLARED, AND IT IS DECLARED IN THE LAW'S OWN GRAMMAR:
    // data-scale = 1:unitMM, where unitMM is the real garment millimetres one
    // SVG user unit stands for. Here that is 1 — this document is full size, not
    // a schematic — and the gate does not take the declaration's word for it: it
    // multiplies the drawn half-width by the declared unitMM and requires the
    // pattern's own bust/waist/hip. A lying scale is caught by arithmetic.
    `viewBox="0 0 ${W.toFixed(4)} ${H.toFixed(4)}" data-scale="1:1" data-unit-mm="1" ` +
    `data-source="SeamPlan" ` +
    // ⭐ THE NODE ID TRAVELS IN THE FILE. A flat opened offline in Illustrator,
    // with no site around it, can still be held next to a pattern and asked the
    // only question that matters: did you two come out of the same object?
    `data-dugum="${flat.dugum}" data-size="${flat.beden}" ` +
    `data-sinif="${flat.sinif.garment}/${flat.sinif.shaping}/${flat.sinif.fabric}">`);
  // ⭐ VIEW NAMES ARE THE LAW'S NAMES (`views.required` = front / back), not the
  // engine's Turkish field names. The engine keeps calling its own arrays `on`
  // and `arka`; the DRAWING speaks the convention, and the translation happens
  // once, here, at the boundary — the same discipline as the single y flip above.
  const VIEW = { on: 'front', arka: 'back' };
  parts.push(`  <g fill="none" stroke="${INK}">`);
  flat.siluet.forEach((v, i) => {
    parts.push(`    <path data-view="${VIEW[v.gorunum] || v.gorunum}" data-curve="siluet" ` +
      `stroke-width="${W_OUTLINE}" d="${siluetPath(v.yari_kontur, cx[i], topZ)}"/>`);
  });
  ['on', 'arka'].forEach((yon, i) => {
    parts.push(`    <path data-view="${VIEW[yon]}" data-curve="ust-sinir" ` +
      `stroke-width="${W_SEAM}" d="${ustSinirPath(flat.ust_sinir[yon], cx[i], topZ)}"/>`);
  });
  parts.push('  </g>');
  parts.push(`  <g font-family="sans-serif" font-size="14" text-anchor="middle" fill="${INK}">`);
  parts.push(`    <text x="${cx[0].toFixed(4)}" y="${(H - 12).toFixed(4)}">FRONT ${flat.beden}</text>`);
  parts.push(`    <text x="${cx[1].toFixed(4)}" y="${(H - 12).toFixed(4)}">BACK ${flat.beden}</text>`);
  parts.push('  </g>');
  parts.push('</svg>');
  return parts.join('\n');
}
