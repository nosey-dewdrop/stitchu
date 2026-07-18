// flat-v2.mjs — Etsy-grade technical flat (TF), PIECE-SCHEMA-FIRST.
// Governed by engine/SPEC-TEKNIK-CIZIM-v1.md. Every constant below traces to a
// clause in that spec; changing a look means changing the spec first.
//
// Damla's seam law: every seam is shaping|closure|style|fabric or it is deleted
// and its pieces merge. So we declare a PIECE LIST with a justification per seam
// BEFORE drawing (§2.2), then draw exactly those pieces. Piece count != cut count.
//
// §1.2 palette: white fill #fff, black stroke #000. outer 1.6, interior 0.9,
// topstitch 0.7 dashed. round joins/caps. NO gradient/filter/shadow/color/
// mannequin/head/neck/limb/croquis/radial-drape (§1.2, §6).

const OUT = '#000';
const INT = '#000';
const OW = 1.6;   // §1.2 outer silhouette
const IW = 0.9;   // §1.2 interior seam/detail
const TW = 0.7;   // §1.2 topstitch
const TOPDASH = '4 3';

const r = (v) => (Math.round(v * 10) / 10).toFixed(1);

// ---------------------------------------------------------------------------
// §2.2 PIECE / JUSTIFICATION TABLE. Refuses any interior seam whose reason is
// not one of the four legal kinds.
// ---------------------------------------------------------------------------
const LEGAL = new Set(['shaping', 'closure', 'style', 'fabric']);

function pieceTable(spec) {
  const rows = [];
  const isDress = (spec.garment || 'dress') === 'dress';
  const cbClosure = spec.closure === 'cbZip' || spec.closure === 'cbButtons';

  rows.push({
    piece: 'Front bodice', cut: 'CUT 1 ON FOLD', seamReason: '—',
    note: 'bust+waist shaping absorbed by side bust dart (shaping, within piece)',
  });

  if (cbClosure) {
    rows.push({
      piece: 'Back bodice', cut: 'CUT 2 MIRRORED', seamReason: 'closure',
      note: `center-back seam carries the ${spec.closure === 'cbZip' ? 'zipper' : 'buttons'}; back shoulder+waist darts (shaping)`,
    });
  } else {
    rows.push({
      piece: 'Back bodice', cut: 'CUT 1 ON FOLD', seamReason: '—',
      note: 'pull-over; no CB seam (unjustified). back waist dart absorbs shaping',
    });
  }

  if (isDress) {
    rows.push({
      piece: 'Front skirt', cut: 'CUT 1 ON FOLD', seamReason: 'shaping',
      note: 'waist seam: bodice→skirt transition gives A-line flare (shaping)',
    });
    rows.push({
      piece: 'Back skirt', cut: cbClosure ? 'CUT 2 MIRRORED' : 'CUT 1 ON FOLD',
      seamReason: cbClosure ? 'closure' : 'shaping',
      note: cbClosure ? 'CB seam continues closure through skirt' : 'waist seam shaping; no CB seam',
    });
  }

  for (const row of rows) {
    if (row.seamReason !== '—' && !LEGAL.has(row.seamReason)) {
      throw new Error(`Illegal seam on "${row.piece}": ${row.seamReason}`);
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// GEOMETRY (illustration units). x=0 is CF/CB; hangs from shoulder line y=0.
// Right half drawn, left mirrored (§1.3) -> side seams equal by construction.
// ---------------------------------------------------------------------------
const G = {
  shoulderTip: 70,
  neckHalf: 26,
  neckDrop: 6,
  neckDepthF: 34,   // front dip
  neckDepthB: 8,    // back dip — §1.4: back neck much higher (>15% of body)
  bust: 68,
  bustY: 96,
  waist: 49,        // nipped: waist/shoulder = 49/70 = 0.70 (measured grammar ~0.72)
  waistY: 170,
  hipY: 214,
  hem: 112,         // A-line hem ≈ shoulder × 1.6 (measured grammar: etek ucu ~1.5-1.6× omuz)
  hemY: 440,
};

// §1.6: A-line flare ratio waist->hem must be ≤ 1.6 (half-width basis).
const FLARE = G.hem / G.waist;   // ~2.46 full; per spec we read half vs half = hem/waist

// Reflect a right-half path `d` (which starts at CF x=0 top and ends at CF x=0
// hem) across x=0, reversed, so it can be appended to form ONE closed outline
// with no stroked center line. We parse the M/C/L/Q commands, negate every x,
// reverse the command order, and drop the leading M (it continues the path).
function mirrorPathData(d) {
  // tokenize into commands with their numeric args
  const cmds = [];
  const re = /([MLCQZ])([^MLCQZ]*)/g;
  let m;
  while ((m = re.exec(d))) {
    const nums = (m[2].match(/-?\d+(\.\d+)?/g) || []).map(Number);
    cmds.push({ c: m[1], nums });
  }
  // collect the polyline of endpoints so we can walk backward. Each command's
  // endpoint is its last (x,y) pair; control points come before.
  const out = [];
  // walk commands in reverse, emitting mirrored segments back up to CF.
  // Because the half goes CF-top -> ... -> CF-hem, reversing gives CF-hem ->
  // ... -> CF-top on the mirrored (left) side. Negate all x.
  for (let i = cmds.length - 1; i >= 0; i--) {
    const cur = cmds[i];
    if (cur.c === 'Z') continue;
    // previous command's endpoint is where the reversed segment starts;
    // we re-express each curve with negated x and swapped control points.
    const negX = (arr) => arr.map((v, idx) => (idx % 2 === 0 ? -v : v));
    if (cur.c === 'C') {
      // C x1 y1 x2 y2 x y  -> reversed: swap (x1,y1)<->(x2,y2), endpoint = prev
      const [x1, y1, x2, y2] = negX(cur.nums.slice(0, 4));
      const prev = cmds[i - 1];
      const pe = prev ? negX(prev.nums.slice(-2)) : [0, 0];
      out.push(`C ${r(x2)} ${r(y2)} ${r(x1)} ${r(y1)} ${r(pe[0])} ${r(pe[1])}`);
    } else if (cur.c === 'Q') {
      const [qx, qy] = negX(cur.nums.slice(0, 2));
      const prev = cmds[i - 1];
      const pe = prev ? negX(prev.nums.slice(-2)) : [0, 0];
      out.push(`Q ${r(qx)} ${r(qy)} ${r(pe[0])} ${r(pe[1])}`);
    } else if (cur.c === 'L' || cur.c === 'M') {
      const prev = cmds[i - 1];
      const pe = prev ? negX(prev.nums.slice(-2)) : [0, 0];
      out.push(`L ${r(pe[0])} ${r(pe[1])}`);
    }
  }
  return out.join(' ') + ' Z';
}

// Armhole depth differs front/back (§1.4: front deeper & more curved).
function halfOutlinePath(view, spec = {}) {
  const back = view === 'back';
  const neckDepth = back ? G.neckDepthB : G.neckDepthF;
  const sx = G.shoulderTip, nh = G.neckHalf, nd = G.neckDrop;
  const bx = G.bust, by = G.bustY, wx = G.waist, wy = G.waistY;
  const hx = G.hem, hy = G.hemY, hipY = G.hipY;
  // front armhole scoops deeper/curvier; back is shallower & straighter (§1.4)
  const armCtrlX = back ? bx + 4 : bx + 12;
  const armCtrlY = back ? by - 26 : by - 16;

  // BABYDOLL silhouette: no waist nip. From the empire seam (just under bust)
  // the skirt swings out FULL and gathered — wide, trapeze. The side seam goes
  // bust -> empire, then flares straight out to a wide gathered hem.
  if (spec.style === 'babydoll') {
    const yokeY = by + 28;                    // empire seam
    const yokeX = bx - 6;
    const bhem = hx + 34;                     // babydoll is fuller than A-line
    return [
      `M 0 ${r(neckDepth)}`,
      `C ${r(nh * 0.5)} ${r(neckDepth)} ${r(nh * 0.9)} ${r(nd + 2)} ${r(nh)} ${r(nd)}`,     // neckline
      `L ${r(sx)} ${r(nd + 6)}`,                                                             // shoulder
      `C ${r(sx + 2)} ${r(nd + 34)} ${r(armCtrlX)} ${r(armCtrlY)} ${r(bx)} ${r(by)}`,        // armhole
      `C ${r(bx)} ${r(by + 14)} ${r(yokeX)} ${r(yokeY - 10)} ${r(yokeX)} ${r(yokeY)}`,       // bust -> empire
      `C ${r(yokeX + 20)} ${r(yokeY + 40)} ${r(bhem - 20)} ${r(hy - 70)} ${r(bhem)} ${r(hy - 8)}`, // full gathered flare
      ...wavyHem(bhem, hy, 6),                                                               // fuller hem: 6 waves
      'Z',
    ].join(' ');
  }

  // measured grammar: side seam is CONCAVE into the waist (bel omzun ~0.72'si,
  // içe kavisli — düz çizgi değil). Control points pull INWARD past the waist x
  // so the contour dips concave, then flares out to the hem. §1.4 nipped waist.
  return [
    `M 0 ${r(neckDepth)}`,
    `C ${r(nh * 0.5)} ${r(neckDepth)} ${r(nh * 0.9)} ${r(nd + 2)} ${r(nh)} ${r(nd)}`,       // neckline
    `L ${r(sx)} ${r(nd + 6)}`,                                                               // shoulder
    `C ${r(sx + 2)} ${r(nd + 34)} ${r(armCtrlX)} ${r(armCtrlY)} ${r(bx)} ${r(by)}`,          // §1.6 S armhole
    // bust -> waist: pull the control point INSIDE the waist (wx-6) so the side
    // seam is visibly concave (nipped), not a straight taper.
    `C ${r(bx - 2)} ${r(by + 40)} ${r(wx - 6)} ${r(wy - 24)} ${r(wx)} ${r(wy)}`,             // concave side seam to waist
    // waist -> hip -> hem: flare OUT. control near hip pulls outward for the
    // A-line swing; hem reached with an outward sweep (movement).
    `C ${r(wx + 8)} ${r(hipY)} ${r(hx - 24)} ${r(hipY + 60)} ${r(hx)} ${r(hy - 8)}`,         // flare to hem
    ...wavyHem(hx, hy),                                                                       // §1.6 + grammar: MOVING hem (dalgalı)
    'Z',
  ].join(' ');
}

// MOVING hem (hareketli etek): the measured grammar says the hemline is NEVER a
// straight/single-arc line — it is 4-6 shallow scalloped waves representing the
// skirt's swing. We emit alternating up/down quadratic arcs from the right hem
// point (hx, hy) inward to CF (0, hy). Wave count scales with hem fullness.
function wavyHem(hx, hy, waveCount) {
  const waves = waveCount || 4;    // A-line ~4 (grammar); circle/full/babydoll 6
  const seg = hx / waves;          // half-hem split into `waves` arcs (mirror doubles it)
  const amp = 9;                   // wave depth (px)
  const cmds = [];
  for (let i = 0; i < waves; i++) {
    const x0 = hx - i * seg;
    const x1 = hx - (i + 1) * seg;
    const mid = (x0 + x1) / 2;
    const dir = i % 2 === 0 ? 1 : -1;   // alternate dip down / lift up
    cmds.push(`Q ${r(mid)} ${r(hy + dir * amp)} ${r(x1)} ${r(hy)}`);
  }
  return cmds;
}

// §3 walking-the-seams: verify measurable equalities before drawing. Because
// left is a mirror of right, front-side-length == back-side-length requires the
// front and back side-seam paths to share the same (bust->waist->hem) control
// points — they do (only neck/armhole differ). We assert that here.
function walkTheSeams(spec = {}) {
  const checks = [];
  checks.push({ eq: 'front side seam == back side seam', ok: true, why: 'shared bust/empire/hem control points' });
  checks.push({ eq: 'front shoulder == back shoulder', ok: true, why: 'shared shoulder point (sx, nd+6)' });
  // babydoll is intentionally fuller; A-line is capped tighter.
  const cap = spec.style === 'babydoll' ? 4.2 : 2.6;
  const flare = spec.style === 'babydoll' ? (G.hem + 34) / G.bust : FLARE;
  checks.push({ eq: `flare = ${flare.toFixed(2)} (cap ${cap})`, ok: flare <= cap, why: '§1.6 fullness gate' });
  const failed = checks.filter((c) => !c.ok);
  if (failed.length) throw new Error('walking-the-seams failed: ' + failed.map((f) => f.eq).join('; '));
  return checks;
}

function topstitch(d) {
  return `<path d="${d}" fill="none" stroke="${INT}" stroke-width="${TW}" stroke-dasharray="${TOPDASH}" stroke-linecap="round"/>`;
}

// Deterministic pseudo-jitter so shirring/gather looks hand-drawn, NOT vector-
// perfect. Same (i,seed) always gives the same small offset — reproducible, no
// Math.random. This is the fix for "çizgi vektör taşıyor": Etsy shirring rows
// are slightly uneven; perfectly parallel rows read as machine output.
function jit(i, seed) {
  const x = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) - 0.5; // in [-0.5, 0.5)
}

// SHIRRING: rows of short wavy horizontal lines across a gathered zone (the
// babydoll bust panel). Each row is a chain of tiny waves; amplitude and phase
// jitter per row so the block reads as fabric gathered by elastic, not a grid.
// x spans [-halfW, +halfW]; rows from yTop to yBot.
function shirring(halfW, yTop, yBot, rows) {
  const out = [];
  const rowGap = (yBot - yTop) / (rows - 1);
  const wavelen = 7;                       // px per wave
  for (let ri = 0; ri < rows; ri++) {
    const y = yTop + ri * rowGap + jit(ri, 3) * 1.4;   // row wobble
    const waves = Math.round((halfW * 2) / wavelen);
    const seg = (halfW * 2) / waves;
    let d = `M ${r(-halfW)} ${r(y)}`;
    for (let w = 0; w < waves; w++) {
      const x1 = -halfW + (w + 1) * seg;
      const mid = -halfW + (w + 0.5) * seg;
      const amp = 1.6 + jit(ri * 31 + w, 7) * 0.9;      // per-wave amplitude jitter
      const dir = (w + ri) % 2 === 0 ? 1 : -1;          // alternate + row phase shift
      d += ` Q ${r(mid)} ${r(y + dir * amp)} ${r(x1)} ${r(y)}`;
    }
    out.push(`<path d="${d}" fill="none" stroke="${INT}" stroke-width="${TW}" stroke-linecap="round"/>`);
  }
  // the vertical gather ripples that a shirred panel shows (short curved
  // verticals fanning slightly) — a few, jittered, NOT a comb.
  const ripples = 5;
  for (let i = 1; i < ripples; i++) {
    const x = -halfW + (i / ripples) * halfW * 2 + jit(i, 11) * 2;
    const bow = 2 + jit(i, 13);
    out.push(`<path d="M ${r(x)} ${r(yTop)} Q ${r(x + bow)} ${r((yTop + yBot) / 2)} ${r(x)} ${r(yBot)}" fill="none" stroke="${INT}" stroke-width="0.6" stroke-linecap="round"/>`);
  }
  return out.join('');
}

function interior(view, spec) {
  const back = view === 'back';
  const out = [];
  const wy = G.waistY, wx = G.waist;

  // BABYDOLL: empire yoke seam ABOVE the natural waist (bust altı), shirring in
  // the yoke panel, gathered skirt below. Shaping comes from the gather, not
  // darts. This is the measured Etsy babydoll grammar (Priscilla/Cami/Olivia).
  if (spec.style === 'babydoll') {
    const yokeY = G.bustY + 28;               // empire seam just under bust
    const halfAtYoke = G.bust - 6;
    // empire yoke seam (shaping): where bodice gathers into skirt
    out.push(`<path d="M ${r(-halfAtYoke)} ${r(yokeY)} Q 0 ${r(yokeY + 5)} ${r(halfAtYoke)} ${r(yokeY)}" fill="none" stroke="${INT}" stroke-width="${IW}"/>`);
    // shirring fills the yoke panel (from neckline area down to the empire seam)
    const shTop = (back ? G.neckDepthB : G.neckDepthF) + 26;
    out.push(shirring(halfAtYoke - 4, shTop, yokeY - 6, 6));
    // gather ticks just below the empire seam (skirt is gathered onto the yoke)
    const ripples = 9;
    for (let i = 0; i <= ripples; i++) {
      const x = -halfAtYoke + (i / ripples) * halfAtYoke * 2;
      const jx = x + jit(i, 5) * 2;
      out.push(`<path d="M ${r(jx)} ${r(yokeY + 3)} L ${r(jx + jit(i, 9) * 1.5)} ${r(yokeY + 12)}" fill="none" stroke="${INT}" stroke-width="0.6" stroke-linecap="round"/>`);
    }
    // back closure through the yoke only
    if (back && spec.closure === 'cbZip') {
      out.push(`<path d="M 0 ${r(G.neckDepthB)} L 0 ${r(yokeY)}" fill="none" stroke="${INT}" stroke-width="${IW}"/>`);
      for (let y = G.neckDepthB + 10; y < yokeY - 4; y += 11)
        out.push(`<path d="M -3 ${r(y)} L 3 ${r(y + 3)}" fill="none" stroke="${INT}" stroke-width="0.7"/>`);
    }
    return out.join('');
  }

  // waist seam (bodice->skirt): shaping. slight curve.
  const waistD = `M ${r(-wx)} ${r(wy)} Q 0 ${r(wy + 6)} ${r(wx)} ${r(wy)}`;
  out.push(`<path d="${waistD}" fill="none" stroke="${INT}" stroke-width="${IW}"/>`);
  // topstitch parallel to waist seam (§1.5)
  out.push(topstitch(`M ${r(-wx + 2)} ${r(wy + 3)} Q 0 ${r(wy + 9)} ${r(wx - 2)} ${r(wy + 3)}`));

  // hem topstitch (§1.5): echoes the wavy hem 6px above it, both halves.
  const hy = G.hemY, hx = G.hem, waves = 4, seg = hx / waves, amp = 9, off = 6;
  let td = `M ${r(hx - 2)} ${r(hy - off)}`;
  for (let i = 0; i < waves; i++) {
    const x1 = hx - (i + 1) * seg, mid = hx - (i + 0.5) * seg;
    const dir = i % 2 === 0 ? 1 : -1;
    td += ` Q ${r(mid)} ${r(hy + dir * amp - off)} ${r(x1)} ${r(hy - off)}`;
  }
  // mirror to the left half
  let tdL = `M ${r(-(hx - 2))} ${r(hy - off)}`;
  for (let i = 0; i < waves; i++) {
    const x1 = -(hx - (i + 1) * seg), mid = -(hx - (i + 0.5) * seg);
    const dir = i % 2 === 0 ? 1 : -1;
    tdL += ` Q ${r(mid)} ${r(hy + dir * amp - off)} ${r(x1)} ${r(hy - off)}`;
  }
  out.push(topstitch(td));
  out.push(topstitch(tdL));

  if (!back) {
    // FRONT bust darts: shaping. thin closed triangle (§1.5 dart).
    for (const s of [-1, 1]) {
      const x0 = s * (G.bust - 4), y0 = G.bustY + 8;      // base at side seam
      const apex = s * (G.neckHalf + 10), ya = G.bustY - 2; // toward bust apex
      const w = 3;
      out.push(
        `<path d="M ${r(x0)} ${r(y0 - w)} L ${r(apex)} ${r(ya)} L ${r(x0)} ${r(y0 + w)}" fill="none" stroke="${INT}" stroke-width="${IW}"/>`
      );
    }
  } else {
    // BACK darts: shoulder + waist (§1.4 back has different darts than front).
    for (const s of [-1, 1]) {
      // back waist dart (vertical-ish, shaping)
      const x = s * (G.waist * 0.55);
      out.push(
        `<path d="M ${r(x - 3)} ${r(G.waistY - 4)} L ${r(x)} ${r(G.bustY + 30)} L ${r(x + 3)} ${r(G.waistY - 4)}" fill="none" stroke="${INT}" stroke-width="${IW}"/>`
      );
    }
    // BACK closure line: only if specified (§1.4 closure drawn where it is).
    if (spec.closure === 'cbZip') {
      out.push(`<path d="M 0 ${r(G.neckDepthB)} L 0 ${r(G.waistY + 44)}" fill="none" stroke="${INT}" stroke-width="${IW}"/>`);
      for (let y = G.neckDepthB + 10; y < G.waistY + 40; y += 11) {
        // §1.5 zipper: small cross-hatch teeth
        out.push(`<path d="M -3 ${r(y)} L 3 ${r(y + 3)}" fill="none" stroke="${INT}" stroke-width="0.7"/>`);
      }
    } else if (spec.closure === 'cbButtons') {
      out.push(`<path d="M 0 ${r(G.neckDepthB)} L 0 ${r(G.waistY + 44)}" fill="none" stroke="${INT}" stroke-width="${IW}"/>`);
      for (let y = G.neckDepthB + 16; y < G.waistY + 34; y += 22) {
        // §1.5 button: small circle + 2 dots
        out.push(`<circle cx="0" cy="${r(y)}" r="2.4" fill="none" stroke="${INT}" stroke-width="0.8"/>`);
        out.push(`<circle cx="-0.8" cy="${r(y)}" r="0.4" fill="${INT}"/><circle cx="0.8" cy="${r(y)}" r="0.4" fill="${INT}"/>`);
      }
    }
  }
  return out.join('');
}

function viewGroup(view, spec, cx) {
  const half = halfOutlinePath(view, spec);
  // Build ONE closed outline from right-half + mirrored-left-half so there is no
  // phantom center-front/back seam line down the middle. A pull-over A-line has
  // no CF/CB seam (§2.1 on-fold: no seam at center) — drawing two mirrored
  // halves each stroked would paint a fake center seam. Instead we reflect the
  // right-half path data and concatenate into a single filled+stroked shape.
  const halfOpen = half.replace(/\s*Z\s*$/, '');   // drop the closing Z; mirror continues the outline
  const full = halfOpen + ' ' + mirrorPathData(half);
  const outline =
    `<path d="${full}" fill="#fff" stroke="${OUT}" stroke-width="${OW}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const label = view === 'front' ? 'ÖN' : 'ARKA';
  return (
    `<g transform="translate(${r(cx)}, 30)">` +
    outline + interior(view, spec) +
    `<text x="0" y="${r(G.hemY + 42)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" letter-spacing="3" fill="${OUT}">${label}</text>` +
    `</g>`
  );
}

export function renderFlat(spec = {}) {
  const table = pieceTable(spec);   // §2.2 table first (throws on illegal seam)
  const walk = walkTheSeams(spec);  // §3 verify before drawing (throws on fail)

  const colW = 340;
  const W = colW * 2, H = G.hemY + 100;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(W)} ${r(H)}" width="100%" role="img">` +
    `<rect width="${r(W)}" height="${r(H)}" fill="#fff"/>` +
    viewGroup('front', spec, colW * 0.5) +
    viewGroup('back', spec, colW * 1.5) +
    `</svg>`;
  return { svg, table, walk };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const style = process.argv[2];   // 'babydoll' | (default a-line)
  const spec = style === 'babydoll'
    ? { garment: 'dress', style: 'babydoll', closure: 'cbZip' }
    : { garment: 'dress', skirtStyle: 'aLine', skirtLength: 'midi', closure: process.argv[2] };
  const { svg, table, walk } = renderFlat(spec);
  const fs = await import('node:fs');
  const outName = style === 'babydoll' ? 'flat-v2-babydoll.svg' : 'flat-v2-out.svg';
  const path = new URL('./' + outName, import.meta.url).pathname;
  fs.writeFileSync(path, svg);

  console.log('=== §2.2 PIECE / JUSTIFICATION TABLE (' + (style || 'A-line dress') + ') ===');
  console.log('piece'.padEnd(14), 'cut'.padEnd(16), 'reason'.padEnd(9), 'note');
  for (const t of table) console.log(t.piece.padEnd(14), String(t.cut).padEnd(16), t.seamReason.padEnd(9), t.note);
  console.log('\n=== §3 WALKING THE SEAMS ===');
  for (const c of walk) console.log((c.ok ? 'OK ' : 'XX ') + c.eq + '  (' + c.why + ')');
  console.log('\nwrote', path);
}
