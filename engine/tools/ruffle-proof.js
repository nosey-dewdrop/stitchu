/* ruffle-proof.js — drafts the RUFFLE (fırfır) piece and renders it to SVG so
   we can LOOK at the actual pattern, not claim it works. This is the drafting
   logic that will go into engine/src/ruffle.cpp; kept here first as a visible,
   checkable proof (run with node, open the SVG).

   A ruffle is a straight strip gathered down to the edge it trims. Given the
   FINISHED edge it attaches to (hem circumference, neckline, sleeve hem) and a
   fullness ratio, the strip's cut length = edge × fullness; when gathered it
   returns to `edge`. Depth = how far the ruffle hangs. Notches divide the strip
   so you gather evenly (each strip quarter matches an edge quarter).

   run:  node engine/tools/ruffle-proof.js [edgeMM] [fullness] [depthMM] [notches]
*/

const edgeMM = parseFloat(process.argv[2]) || 900;   // e.g. a mini-skirt hem
const fullness = parseFloat(process.argv[3]) || 2.5; // 2–3× is typical for a soft ruffle
const depthMM = parseFloat(process.argv[4]) || 80;   // how deep it hangs
const notches = parseInt(process.argv[5]) || 4;      // gather segments

const HEM = 10;   // bottom rolled hem allowance (mm)
const SA = 12;    // seam allowance at the gathered (top) edge
const stripLen = edgeMM * fullness;
const stripH = depthMM + HEM + SA;

/* ── build the piece: a rectangle strip, notches on the top (gather) edge,
   a dashed hemline near the bottom, a grainline along the length. ── */
function draft() {
  const outline = [
    { t: "M", x: 0, y: 0 },
    { t: "L", x: stripLen, y: 0 },
    { t: "L", x: stripLen, y: stripH },
    { t: "L", x: 0, y: stripH },
    { t: "Z" },
  ];
  const markings = [];
  // gather notches along the top edge
  for (let i = 1; i < notches; i++) {
    const x = (stripLen * i) / notches;
    markings.push({ kind: "notch", x, y: 0 });
  }
  // hemline (fold line) near the bottom
  markings.push({ kind: "hemline", y: stripH - HEM });
  // seam line at top (gather here)
  markings.push({ kind: "seamline", y: SA });
  return {
    name: "Fırfır şeridi",
    cut: `Kumaşı enine, 1 uzun şerit kes: ${Math.round(stripLen)} × ${Math.round(stripH)} mm (gerekiyorsa ekle).`,
    outline, markings,
    grainline: { from: { x: stripLen * 0.5, y: SA + 6 }, to: { x: stripLen * 0.5, y: stripH - HEM - 6 } },
    meta: { edgeMM, fullness, depthMM, stripLen, notches },
  };
}

/* ── SVG render (mm → px, thin long strip is honest for a ruffle) ── */
function svg(piece) {
  const S = 0.28;                    // mm→px scale so a 2m strip fits
  const pad = 60;
  const W = stripLen * S + pad * 2 + 220;   // room for the preview label on the right
  const H = stripH * S + pad * 2 + 40 + depthMM * S + 90;   // room for the gathered preview below
  const X = (mm) => pad + mm * S;
  const Y = (mm) => pad + mm * S;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(0)}" height="${H.toFixed(0)}" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}">`;
  s += `<rect width="100%" height="100%" fill="#fbf7f2"/>`;
  // outline
  let d = "";
  piece.outline.forEach((c) => {
    if (c.t === "M") d += `M ${X(c.x).toFixed(1)} ${Y(c.y).toFixed(1)} `;
    else if (c.t === "L") d += `L ${X(c.x).toFixed(1)} ${Y(c.y).toFixed(1)} `;
    else if (c.t === "Z") d += "Z";
  });
  s += `<path d="${d}" fill="#fff" stroke="#8f2038" stroke-width="2"/>`;
  // markings
  piece.markings.forEach((m) => {
    if (m.kind === "notch") s += `<line x1="${X(m.x).toFixed(1)}" y1="${Y(0).toFixed(1)}" x2="${X(m.x).toFixed(1)}" y2="${(Y(0) + 12).toFixed(1)}" stroke="#8f2038" stroke-width="2"/>`;
    if (m.kind === "hemline") s += `<line x1="${X(0)}" y1="${Y(m.y).toFixed(1)}" x2="${X(stripLen)}" y2="${Y(m.y).toFixed(1)}" stroke="#c98" stroke-width="1" stroke-dasharray="6 4"/>`;
    if (m.kind === "seamline") s += `<line x1="${X(0)}" y1="${Y(m.y).toFixed(1)}" x2="${X(stripLen)}" y2="${Y(m.y).toFixed(1)}" stroke="#c98" stroke-width="1" stroke-dasharray="6 4"/>`;
  });
  // grainline
  const g = piece.grainline;
  s += `<line x1="${X(g.from.x).toFixed(1)}" y1="${Y(g.from.y).toFixed(1)}" x2="${X(g.to.x).toFixed(1)}" y2="${Y(g.to.y).toFixed(1)}" stroke="#333" stroke-width="1.5" marker-start="url(#a)" marker-end="url(#a)"/>`;
  s += `<defs><marker id="a" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M1,1 L4,4 L1,7" fill="none" stroke="#333"/></marker></defs>`;
  // ── gathered preview: the SAME strip büzülünce nasıl durur (dalgalı) ──
  const pv = Y(stripH) + 46;                 // preview baseline y
  const pvLen = edgeMM * S;                   // gathered length = the edge it trims
  const pvX0 = pad;
  const waves = Math.round(edgeMM / 55);      // ~55mm per gather wave
  let wd = `M ${pvX0.toFixed(1)} ${pv.toFixed(1)} `;
  const amp = depthMM * S;                     // hangs down by the ruffle depth
  for (let i = 0; i < waves; i++) {
    const x0 = pvX0 + (pvLen * i) / waves;
    const x1 = pvX0 + (pvLen * (i + 0.5)) / waves;
    const x2 = pvX0 + (pvLen * (i + 1)) / waves;
    wd += `C ${x0.toFixed(1)} ${(pv + amp).toFixed(1)} ${x1.toFixed(1)} ${(pv + amp).toFixed(1)} ${x1.toFixed(1)} ${pv.toFixed(1)} `;
    wd += `C ${x1.toFixed(1)} ${(pv + amp).toFixed(1)} ${x2.toFixed(1)} ${(pv + amp).toFixed(1)} ${x2.toFixed(1)} ${pv.toFixed(1)} `;
  }
  s += `<line x1="${pvX0}" y1="${pv.toFixed(1)}" x2="${(pvX0 + pvLen).toFixed(1)}" y2="${pv.toFixed(1)}" stroke="#8f2038" stroke-width="2"/>`;
  s += `<path d="${wd}" fill="none" stroke="#8f2038" stroke-width="1.6"/>`;
  s += `<text x="${(pvX0 + pvLen + 12).toFixed(1)}" y="${(pv + amp * 0.5).toFixed(1)}" font-family="Helvetica" font-size="12" fill="#8f2038">büzülmüş hâli (${edgeMM} mm kenara diker)</text>`;

  // labels
  const lblY = H - 20;
  s += `<text x="${pad}" y="${lblY}" font-family="Helvetica" font-size="15" fill="#222">${piece.name} · düz şerit ${Math.round(stripLen)} mm → büzülünce ${edgeMM} mm · derinlik ${depthMM} mm · dolgunluk ${fullness}× · ${piece.meta.notches} büzgü aralığı</text>`;
  s += `<text x="${pad}" y="${(Y(0)-14).toFixed(1)}" font-family="Helvetica" font-size="12" fill="#8f2038">↑ üst kenarı büz (gather) — çentikler eşit büzmek için</text>`;
  s += `</svg>`;
  return s;
}

const piece = draft();
const out = svg(piece);
require("fs").writeFileSync(__dirname + "/ruffle-proof.svg", out);
console.log(JSON.stringify(piece.meta, null, 0));
console.log("cut:", piece.cut);
console.log("wrote engine/tools/ruffle-proof.svg");
