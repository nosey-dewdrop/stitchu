// render-garment-flat.mjs — the ASSEMBLED garment flat sketch (the Etsy line-art
// look). This is the HERO image on every pattern / collection detail page.
//
// The other renderer (render-flat.mjs renderScattered / the cutting layout) lays
// the drafted pieces APART on a sheet — that is a cutting layout, NOT what a
// commercial pattern shows as its cover figure. A commercial flat shows ONE clean
// line drawing of the FINISHED garment: the front silhouette (shoulders, neckline,
// smooth armholes, side seams, waist/empire seam, hem) with interior seams/darts/
// buttons as thin lines, and the same for the BACK — as if the pieces were sewn
// together at their seams and laid flat.
//
// We DERIVE that silhouette from the engine's own drafted pieces: every bodice /
// skirt / top piece is drafted on the center-front (or center-back) FOLD, so its
// outline is a garment HALF. Mirroring the half about x=0 gives the full front
// (or back) silhouette; stacking the bodice over the skirt at the waist seam gives
// the whole garment. No piece is laid apart; the shapes are the real drafted
// curves (smooth beziers from the upstream armhole fix). Thin navy lines on white,
// the commercial flat convention.
//
// Exports renderGarmentFlat(pieces, spec). render-flat.mjs re-exports it as
// renderFrontBack so the page/collection generators pick up the new hero without
// any template change.

const NAVY = '#1f3a5f';
const SEAM = '#4a6b93';   // interior seam / dart / detail lines (thin)
const FAINT = '#9fb6d0';  // notches, grainline hints

const svgDoc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" ` +
  `width="100%" role="img"><rect width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#fff"/>${inner}</svg>`;

// ---- outline sampling ------------------------------------------------------
// Flatten a piece's outline commands into a dense polyline of {x,y} points so we
// can mirror it and re-emit a single smooth path. Beziers are sampled; the visual
// smoothness comes from the engine's own control points (the upstream bezier fix).
function sampleOutline(commands, steps = 14) {
  const pts = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;
  for (const c of commands) {
    if (c.type === 'move') { cx = c.x; cy = c.y; sx = cx; sy = cy; pts.push({ x: cx, y: cy }); }
    else if (c.type === 'line') { cx = c.x; cy = c.y; pts.push({ x: cx, y: cy }); }
    else if (c.type === 'curve') {
      const x0 = cx, y0 = cy;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps, u = 1 - t;
        const x = u*u*u*x0 + 3*u*u*t*c.cp1x + 3*u*t*t*c.cp2x + t*t*t*c.x;
        const y = u*u*u*y0 + 3*u*u*t*c.cp1y + 3*u*t*t*c.cp2y + t*t*t*c.y;
        pts.push({ x, y });
      }
      cx = c.x; cy = c.y;
    } else if (c.type === 'close') { pts.push({ x: sx, y: sy }); }
  }
  return pts;
}

const xr = (pts) => { const xs = pts.map((p) => p.x); return { min: Math.min(...xs), max: Math.max(...xs) }; };
const yr = (pts) => { const ys = pts.map((p) => p.y); return { min: Math.min(...ys), max: Math.max(...ys) }; };

// A polyline -> SVG path string, mapped through fn(pt) -> {x,y}.
function poly(pts, fn) {
  return pts.map((p, i) => {
    const q = fn(p);
    return `${i === 0 ? 'M' : 'L'} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }).join(' ');
}

// Isolate the outer garment boundary of an on-fold half: the arc from the
// fold-TOP (neckline at center) around neck/shoulder/armhole/side down to the
// fold-BOTTOM (waist at center), dropping the closing center-fold edge (x~=0)
// that would otherwise draw a line down the middle. `H` is the half's height.
function outerBoundary(pts, H) {
  const foldTol = Math.max(6, H * 0.02);
  // fold points are those hugging x~0; the boundary runs from the topmost fold
  // point to the bottommost fold point THE LONG WAY (through the wide outer arc).
  const foldIdx = pts.map((p, i) => ({ p, i })).filter(({ p }) => p.x <= foldTol);
  if (foldIdx.length < 2) return pts;                 // no clear fold; use as-is
  let top = foldIdx[0], bot = foldIdx[0];
  for (const f of foldIdx) { if (f.p.y < top.p.y) top = f; if (f.p.y > bot.p.y) bot = f; }
  // Walk both directions from top to bot; keep the arc whose points reach widest.
  const walk = (from, to, step) => {
    const out = [];
    for (let i = from; i !== to; i = (i + step + pts.length) % pts.length) out.push(pts[i]);
    out.push(pts[to]); return out;
  };
  const fwd = walk(top.i, bot.i, 1);
  const bwd = walk(top.i, bot.i, -1);
  const width = (arr) => Math.max(...arr.map((p) => p.x));
  return width(fwd) >= width(bwd) ? fwd : bwd;
}

// ---- garment assembly ------------------------------------------------------
// Build one VIEW (front or back). The BODICE uses the real drafted on-fold half
// (mirrored) so the neckline / armhole / side-seam are the engine's own smooth
// curves. The SKIRT is drawn as the FINISHED garment skirt — a clean silhouette
// that hangs from the bodice waist and flares to a hem — NOT the raw cut piece.
// A gathered skirt is cut as a wide flat rectangle; drawing that rectangle makes
// a sandwich-board box, not a dress. So we synthesize the worn drape: waist =
// bodice finished waist, hem width set by the skirt style, a soft curved hem.
// Returns geometry in a local, mm-scaled, x-centered coordinate.
function assembleView(bodice, skirt, side, spec) {
  // Bodice half sampled, normalised so the fold is at x=0, shoulder at y=0.
  const bpts0 = sampleOutline(bodice.commands);
  const bx = xr(bpts0), by = yr(bpts0);
  const foldX = Math.max(0, bx.min);
  const normed = bpts0.map((p) => ({ x: p.x - foldX, y: p.y - by.min }));
  const bH = by.max - by.min;
  // Keep only the OUTER boundary (neck-top -> shoulder -> armhole -> side -> waist).
  // The drafted half closes up the center fold (x~0) back to the neck; that fold
  // edge, if left in, draws a spurious line down the middle and crosses its mirror.
  let bodiceRight = outerBoundary(normed, bH);

  // Bodice waist half-width = the drafted half at its lowest edge (the seam that
  // meets the skirt / the garment's finished waist on that side).
  const waistBand = bodiceRight.filter((p) => Math.abs(p.y - bH) < bH * 0.08);
  const waistHalf = waistBand.length
    ? Math.max(...waistBand.map((p) => p.x)) : Math.max(...bodiceRight.map((p) => p.x));

  // The boundary of a CENTER panel (princess / multi-panel bodice) runs down the
  // side seam to the waist then BACK IN along the waist to the center fold (x~0).
  // That inward return leaves the silhouette ending at the waist-center, so the
  // skirt (which starts at the outer waist half-width) begins with a step/notch.
  // Trim any trailing points after the LAST time the boundary reaches its widest
  // waist point, so the chain ends exactly at the side-seam waist the skirt joins.
  {
    let cut = bodiceRight.length - 1;
    for (let i = bodiceRight.length - 1; i >= 0; i--) {
      if (bodiceRight[i].x >= waistHalf - 0.5 && bodiceRight[i].y > bH * 0.6) { cut = i; break; }
    }
    if (cut < bodiceRight.length - 1) bodiceRight = bodiceRight.slice(0, cut + 1);
  }

  // Skirt silhouette (finished drape), if a skirt piece exists.
  let skirtRight = null, skH = 0, hipHalf = 0;
  if (skirt) {
    const sp = sampleOutline(skirt.commands);
    const syr = yr(sp);
    skH = syr.max - syr.min;                         // true drafted skirt LENGTH
    // Hem flare relative to the finished waist. Straight = column, aLine = flare,
    // gathered = fullest sweep. Read from spec.skirtStyle; default a gentle A.
    const style = (spec.skirtStyle || 'aLine');
    const flare = style === 'straight' ? 1.06
      : style === 'gathered' ? 1.9
      : style === 'circle' || style === 'full' ? 2.2
      : 1.42;                                          // aLine / default
    const hemHalf = waistHalf * flare;
    hipHalf = Math.max(waistHalf, hemHalf * 0.7);
    // A clean skirt half: waist -> side seam gently bowing out -> hem, with a soft
    // hem curve. Sampled so it re-emits as one smooth polyline.
    const seg = [];
    const N = 16;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      // ease the widen so it flows out of the waist, not a hard V.
      const w = waistHalf + (hemHalf - waistHalf) * Math.pow(t, style === 'straight' ? 1 : 0.82);
      seg.push({ x: w, y: t * skH });
    }
    // Soft hem dip toward the fold (a gathered/flared hem hangs a touch lower at CF).
    skirtRight = seg;
  }

  const waistY = bH;
  const totalH = bH + skH;

  // Full silhouette: right side = bodice half then (offset) skirt half, then the
  // curved hem across to the fold, then the mirrored left side back up.
  const skirtAtWaist = skirtRight ? skirtRight.map((p) => ({ x: p.x, y: p.y + waistY })) : null;
  const rightChain = skirtAtWaist ? [...bodiceRight, ...skirtAtWaist] : bodiceRight;

  let d = poly(rightChain, (p) => p);
  if (skirtAtWaist) {
    // Curved hem from the right hem point across to the mirrored-left hem point,
    // dipping slightly at center for a garment-like hang.
    const hem = skirtAtWaist[skirtAtWaist.length - 1];
    const dip = (skirt && ((spec.skirtStyle || 'aLine') !== 'straight')) ? skH * 0.06 : skH * 0.02;
    d += ` Q ${(hem.x * 0.5).toFixed(1)} ${(hem.y + dip).toFixed(1)} 0 ${(hem.y + dip).toFixed(1)}`;
    d += ` Q ${(-hem.x * 0.5).toFixed(1)} ${(hem.y + dip).toFixed(1)} ${(-hem.x).toFixed(1)} ${hem.y.toFixed(1)}`;
    // up the mirrored left side (skirt then bodice), skipping the duplicate hem pt.
    const revUp = [...skirtAtWaist].slice(0, -1).reverse().concat([...bodiceRight].reverse());
    d += ' ' + revUp.map((p) => `L ${(-p.x).toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
  } else {
    const rev = [...rightChain].reverse();
    d += ' ' + rev.map((p) => `L ${(-p.x).toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
  }

  const allX = rightChain.map((p) => p.x);
  const W = Math.max(...allX) * 2;
  const neckPts = bodiceRight.filter((p) => p.y < bH * 0.14);
  const neckHalf = neckPts.length ? Math.max(...neckPts.map((p) => p.x)) : 40;

  // Armhole geometry for seating a sleeve flush. Shoulder tip = the outer point
  // of the shoulder line (widest point in the upper third, at its own x). Underarm
  // = where the side seam begins (widest point in the mid band). The sleeve is
  // drawn between THOSE two points so it attaches to the real armhole edge.
  const shoulderX = Math.max(...bodiceRight.map((p) => p.x));
  const upper = bodiceRight.filter((p) => p.y < bH * 0.34);
  const tip = upper.length ? upper.reduce((a, p) => (p.x > a.x ? p : a), upper[0]) : { x: shoulderX, y: bH * 0.1 };
  const midBand = bodiceRight.filter((p) => p.y >= bH * 0.3 && p.y < bH * 0.62);
  const under = midBand.length ? midBand.reduce((a, p) => (p.x > a.x ? p : a), midBand[0]) : { x: shoulderX, y: bH * 0.4 };

  return { d, W, H: totalH, waistY, hasSkirt: !!skirtRight, bodiceH: bH,
    neckHalf, waistHalf, hipHalf, shoulderX,
    shoulderTipX: tip.x, shoulderTipY: tip.y, underArmX: under.x, underArmY: under.y };
}

// ---- interior detail lines -------------------------------------------------
// Thin construction lines drawn INSIDE the silhouette: waist/empire seam, princess
// seams, darts, button row, drawstring channel. All in view-local mm coords.
function interior(view, spec, pieces) {
  let s = '';
  const { W, waistY, bodiceH, neckHalf, waistHalf } = view;
  const cx = 0; // center is x=0 in view space; caller translates

  // Waist / empire seam line (only if the garment has a skirt joined to a bodice).
  if (view.hasSkirt) {
    const label = spec.waistline === 'empire' ? waistY * 0.82 : waistY;
    s += `<line x1="${(-waistHalf * 1.02).toFixed(1)}" y1="${label.toFixed(1)}" ` +
      `x2="${(waistHalf * 1.02).toFixed(1)}" y2="${label.toFixed(1)}" ` +
      `stroke="${SEAM}" stroke-width="1" stroke-dasharray="6 4"/>`;
  }

  // Princess seams (shaping === 'princess'): two curved lines shoulder->hem.
  if (spec.shaping === 'princess') {
    for (const dir of [-1, 1]) {
      const x = dir * neckHalf * 0.72;
      const xh = dir * waistHalf * 0.5;
      s += `<path d="M ${x.toFixed(1)} ${(bodiceH * 0.06).toFixed(1)} ` +
        `Q ${(dir * neckHalf * 0.95).toFixed(1)} ${(bodiceH * 0.5).toFixed(1)} ` +
        `${xh.toFixed(1)} ${(bodiceH * 0.98).toFixed(1)}" fill="none" stroke="${SEAM}" stroke-width="1"/>`;
    }
  } else {
    // Waist / bust darts (dart shaping): two short tapered lines from waist up.
    for (const dir of [-1, 1]) {
      const x = dir * waistHalf * 0.45;
      s += `<path d="M ${x.toFixed(1)} ${(bodiceH * 0.98).toFixed(1)} ` +
        `L ${(x * 0.9).toFixed(1)} ${(bodiceH * 0.55).toFixed(1)}" fill="none" ` +
        `stroke="${SEAM}" stroke-width="0.9"/>`;
    }
  }

  // Button placket: a vertical row of small circles down center front, plus the
  // fold/closure line. Read real button y-positions from the placket piece's
  // markings if available; else evenly space them.
  const hasPlacket = spec.frontPlacket || (spec.placketStyle && spec.placketStyle > 0);
  if (hasPlacket && spec.__view === 'front') {
    const front = pieces.find((p) => /front/i.test(p.name) && /(bodice|top)/i.test(p.name));
    let ys = [];
    if (front && front.markings) {
      // Buttonhole ticks sit at x in [-4,4] pairs; collect their y once.
      const seen = new Set();
      for (const c of front.markings) {
        if (c.type === 'line' && Math.abs(c.x) <= 5 && !seen.has(Math.round(c.y))) {
          seen.add(Math.round(c.y)); ys.push(c.y);
        }
      }
      // normalise against the piece's own y-min.
      const ymin = Math.min(...front.commands.filter((c) => c.y !== undefined).map((c) => c.y));
      ys = ys.map((y) => y - ymin).filter((y) => y > 4 && y < bodiceH * (view.hasSkirt ? 1.6 : 1));
    }
    if (!ys.length) {
      const n = 5, top = bodiceH * 0.14, bot = (view.hasSkirt ? view.H : bodiceH) * 0.92;
      for (let i = 0; i < n; i++) ys.push(top + (bot - top) * i / (n - 1));
    }
    const bottom = Math.max(...ys, bodiceH);
    s += `<line x1="0" y1="${(bodiceH * 0.1).toFixed(1)}" x2="0" y2="${(bottom + 10).toFixed(1)}" ` +
      `stroke="${SEAM}" stroke-width="1"/>`;
    for (const y of ys) s += `<circle cx="0" cy="${y.toFixed(1)}" r="4.5" fill="none" stroke="${NAVY}" stroke-width="1"/>`;
  }

  // Drawstring channel (gatherType drawstring at neck/bust): two thin parallel
  // lines across the gathered zone.
  if (spec.gatherType === 1) {
    const zy = spec.gatherZone === 0 ? bodiceH * 0.16 : bodiceH * 0.34;
    for (const off of [-6, 6]) {
      s += `<line x1="${(-waistHalf).toFixed(1)}" y1="${(zy + off).toFixed(1)}" ` +
        `x2="${waistHalf.toFixed(1)}" y2="${(zy + off).toFixed(1)}" stroke="${SEAM}" stroke-width="0.8"/>`;
    }
  } else if (spec.gatherType && (spec.gatherType === 2 || spec.gatherType === 3)) {
    // Shirred / smocked yoke: a band of short vertical gather ticks.
    const zy = spec.gatherZone === 0 ? bodiceH * 0.14 : bodiceH * 0.3;
    for (let k = -Math.floor(waistHalf / 14); k <= Math.floor(waistHalf / 14); k++) {
      const x = k * 14;
      s += `<line x1="${x.toFixed(1)}" y1="${(zy - 7).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(zy + 7).toFixed(1)}" ` +
        `stroke="${SEAM}" stroke-width="0.7"/>`;
    }
  }

  // Back-view specifics: center-back seam + invisible-zip line, or the back tie.
  if (spec.__view === 'back') {
    if (spec.closure && /zip/i.test(spec.closure)) {
      s += `<line x1="0" y1="${(bodiceH * 0.06).toFixed(1)}" x2="0" y2="${(view.hasSkirt ? view.H * 0.6 : bodiceH).toFixed(1)}" ` +
        `stroke="${SEAM}" stroke-width="1" stroke-dasharray="2 3"/>`;
    }
    if (spec.tie && spec.tie > 0) {
      // Two back-tie straps meeting at center back near the waist.
      const ty = view.hasSkirt ? waistY : bodiceH * 0.9;
      for (const dir of [-1, 1]) {
        s += `<path d="M ${(dir * waistHalf).toFixed(1)} ${(ty - 6).toFixed(1)} ` +
          `Q ${(dir * waistHalf * 0.4).toFixed(1)} ${ty.toFixed(1)} 0 ${(ty + 2).toFixed(1)}" ` +
          `fill="none" stroke="${SEAM}" stroke-width="1.4"/>`;
      }
    }
    if (spec.backOpening && spec.backOpening > 0) {
      // Shaped open-back cutout at the upper back.
      s += `<path d="M ${(-neckHalf * 0.7).toFixed(1)} ${(bodiceH * 0.12).toFixed(1)} ` +
        `Q 0 ${(bodiceH * 0.5).toFixed(1)} ${(neckHalf * 0.7).toFixed(1)} ${(bodiceH * 0.12).toFixed(1)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="1" stroke-dasharray="4 3"/>`;
    }
  }

  return s;
}

// ---- sleeve -----------------------------------------------------------------
// A short/cap sleeve reads on the flat as a small sleeve projecting from each
// armhole. It must ATTACH flush to the silhouette: it springs from the shoulder
// tip and folds back to the underarm point, hugging the armhole edge (no floating
// wing). Sleeveless -> nothing. The armhole shoulder tip and underarm are read
// from the drafted bodice half so the sleeve seats on the real armhole.
function sleeves(view, spec) {
  if (!spec.sleeveStyle || spec.sleeveStyle === 'none') return '';
  const { shoulderX, bodiceH, armTop, armBot } = view;
  // shoulder tip (top of the armhole) and underarm point, in view coords.
  const topY = armTop !== undefined ? armTop : bodiceH * 0.1;
  const underY = armBot !== undefined ? armBot : bodiceH * 0.34;
  const puff = spec.sleeveCap === 2;
  const width = shoulderX * (puff ? 0.62 : 0.5);       // how far the sleeve projects
  const drop = (underY - topY) * (puff ? 1.15 : 1.0);  // sleeve hem length
  let s = '';
  for (const dir of [-1, 1]) {
    const sx = dir * shoulderX;
    // From shoulder tip: out over a (puffed) cap head, down the outer sleeve edge
    // to the hem, along the hem, then back IN to the underarm point on the body.
    const capBow = puff ? 1.2 : 0.85;
    s += `<path d="M ${sx.toFixed(1)} ${topY.toFixed(1)} ` +
      `Q ${(sx + dir * width * capBow).toFixed(1)} ${(topY - (puff ? bodiceH * 0.03 : 0)).toFixed(1)} ` +
      `${(sx + dir * width).toFixed(1)} ${(topY + drop * 0.5).toFixed(1)} ` +
      `L ${(sx + dir * width * 0.82).toFixed(1)} ${(topY + drop).toFixed(1)} ` +
      `Q ${(sx + dir * width * 0.4).toFixed(1)} ${(underY + drop * 0.18).toFixed(1)} ` +
      `${sx.toFixed(1)} ${underY.toFixed(1)}" ` +
      `fill="#fbfcfe" stroke="${NAVY}" stroke-width="1.6" stroke-linejoin="round"/>`;
    if (puff) {
      for (let t = 0.18; t < 0.9; t += 0.16) {
        const gx = sx + dir * width * t;
        s += `<line x1="${gx.toFixed(1)}" y1="${(topY + 2).toFixed(1)}" x2="${gx.toFixed(1)}" y2="${(topY + 11).toFixed(1)}" stroke="${SEAM}" stroke-width="0.6"/>`;
      }
    }
  }
  return s;
}

// ---- collar ---------------------------------------------------------------
function collar(view, spec) {
  if (!spec.collarType || spec.collarType === 0) return '';
  const { neckHalf, bodiceH } = view;
  const ny = bodiceH * 0.06;
  // A simple collar band / flat collar hugging the neckline.
  if (spec.collarType === 4) { // peter-pan: two rounded flat collar leaves
    let s = '';
    for (const dir of [-1, 1]) {
      s += `<path d="M 0 ${(ny + 2).toFixed(1)} ` +
        `Q ${(dir * neckHalf * 0.8).toFixed(1)} ${(ny - 6).toFixed(1)} ` +
        `${(dir * neckHalf * 1.15).toFixed(1)} ${(ny + bodiceH * 0.12).toFixed(1)} ` +
        `Q ${(dir * neckHalf * 0.9).toFixed(1)} ${(ny + bodiceH * 0.16).toFixed(1)} ` +
        `${(dir * neckHalf * 0.3).toFixed(1)} ${(ny + bodiceH * 0.09).toFixed(1)} Z" ` +
        `fill="#fff" stroke="${NAVY}" stroke-width="1.4"/>`;
    }
    return s;
  }
  // stand / mock / shirt collar: a band along the neckline.
  return `<path d="M ${(-neckHalf).toFixed(1)} ${(ny + bodiceH * 0.03).toFixed(1)} ` +
    `Q 0 ${(ny - bodiceH * 0.05).toFixed(1)} ${neckHalf.toFixed(1)} ${(ny + bodiceH * 0.03).toFixed(1)}" ` +
    `fill="none" stroke="${NAVY}" stroke-width="1.6"/>`;
}

// ---- one labelled view panel ----------------------------------------------
function viewPanel(bodice, skirt, spec, side, pieces) {
  const view = assembleView(bodice, skirt, side, spec);
  const vspec = { ...spec, __view: side };
  const body =
    `<path d="${view.d}" fill="#fbfcfe" stroke="${NAVY}" stroke-width="1.8" stroke-linejoin="round"/>` +
    sleeves(view, vspec) +
    collar(view, vspec) +
    interior(view, vspec, pieces);
  // Center the silhouette: view coords are centered on x=0, so shift right by W/2.
  const padX = view.W * 0.62;
  return { inner: `<g transform="translate(${padX.toFixed(1)} 8)">${body}</g>`,
    w: view.W * 1.24, h: view.H + 24 };
}

// ---- public: assembled front + back garment flat --------------------------
export function renderGarmentFlat(pieces, spec = {}) {
  // Pick the silhouette-defining pieces.
  const find = (re) => pieces.find((p) => re.test(p.name));
  const bodiceF = find(/^(bodice (center )?front|top front)$/i) || find(/bodice.*front|top front/i) || find(/front/i);
  const bodiceB = find(/^(bodice (center )?back|top back)$/i) || find(/bodice.*back|top back/i) || find(/back/i);
  // Any skirt panel (front / center-front / side-front) means the garment has a
  // skirt; the silhouette is synthesized from the bodice waist + skirt LENGTH, so
  // one representative panel per side is enough.
  const skirtF = find(/^skirt (center )?front$/i) || find(/skirt.*front/i);
  const skirtB = find(/^skirt (center )?back$/i) || find(/skirt.*back/i);
  if (!bodiceF) return svgDoc(400, 300, `<text x="200" y="150" text-anchor="middle" fill="${NAVY}">flat unavailable</text>`);

  const fp = viewPanel(bodiceF, skirtF, spec, 'front', pieces);
  const bp = bodiceB ? viewPanel(bodiceB, skirtB, spec, 'back', pieces) : null;

  const HEAD = 44, GAP = 70, PAD = 24;
  const panelH = Math.max(fp.h, bp ? bp.h : 0);
  const W = PAD + fp.w + GAP + (bp ? bp.w : 0) + PAD;
  const H = HEAD + panelH + PAD;
  const head = (x, w, label) =>
    `<text x="${(x + w / 2).toFixed(1)}" y="30" text-anchor="middle" ` +
    `font-family="Helvetica,Arial,sans-serif" font-size="24" font-weight="600" ` +
    `letter-spacing="3" fill="${NAVY}">${label}</text>`;

  let inner = head(PAD, fp.w, 'FRONT');
  inner += `<g transform="translate(${PAD} ${HEAD})">${fp.inner}</g>`;
  if (bp) {
    const bx = PAD + fp.w + GAP;
    inner += head(bx, bp.w, 'BACK');
    inner += `<g transform="translate(${bx} ${HEAD})">${bp.inner}</g>`;
    const dx = (PAD + fp.w + GAP / 2).toFixed(1);
    inner += `<line x1="${dx}" y1="${HEAD}" x2="${dx}" y2="${(HEAD + panelH).toFixed(1)}" ` +
      `stroke="#e2e9f2" stroke-width="1"/>`;
  }
  return svgDoc(W, H, inner);
}
