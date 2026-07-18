// render-garment-flat.mjs — the FINISHED-GARMENT flat technical sketch (the Etsy
// line-art hero on every pattern / collection page).
//
// IMPORTANT (the fix, 2026-07-17): a technical flat is NOT the pattern piece
// reflected. The pattern piece is a MANUFACTURING drawing (seam allowance, darts
// open, grainline, notches, cut-on-fold). The technical flat is the FINISHED
// garment as if worn on a body — darts closed, shoulder seam on top, a clean
// silhouette. You cannot get the flat by "mirror + union" of the drafted piece:
// for a SLEEVELESS garment the mirrored armhole curve reads as a fake long sleeve.
//
// So this renderer draws the flat PARAMETRICALLY FROM THE STYLE SPEC, never from
// the pieces. It reads neckline / sleeveStyle / sleeveLength / sleeveCap / shaping
// / skirtStyle / topLength / collar / placket / tie / gather / backOpening / closure
// and draws a clean finished-garment FRONT and BACK.
//
// Silhouette families (one parametric template each): TOP/SHELL, DRESS. Each is a
// single continuous outline drawn as the RIGHT half in cubic beziers, then mirrored
// with transform="scale(-1,1)" so it is perfectly symmetric. Interior design lines
// (darts, princess seams, button row, empire seam, zip, ties) overlay as separate
// thin <path>s. Stroke hierarchy: outer silhouette 2, interior 1, navy on white,
// round joins/caps.
//
// Exports renderGarmentFlat(pieces, spec). `pieces` is accepted for signature
// compatibility but NOT used to derive the outline — the flat is spec-driven.

const NAVY = '#1f3a5f';
const SEAM = '#5c7aa0';   // interior seam / dart / detail lines (thin)

const svgDoc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" ` +
  `width="100%" role="img"><rect width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#fff"/>${inner}</svg>`;

const n = (v) => (Math.round(v * 10) / 10).toFixed(1);

// ---------------------------------------------------------------------------
// Body proportions for the flat (illustration units, NOT mm — this is a fashion
// drawing, not the pattern). x=0 is center front/back; y grows downward from the
// shoulder line. We draw the RIGHT half (positive x) and mirror it.
// ---------------------------------------------------------------------------
const U = {
  shoulderW: 78,     // half shoulder width (shoulder tip x)
  neckBase: 30,      // half neck width at a crew/round base
  chestW: 74,        // half chest / bust width
  waistW: 60,        // half waist width
  hipW: 76,          // half hip width
  shoulderY: 0,      // shoulder line
  neckDrop: 4,       // how far the shoulder-neck point sits below the shoulder line
};

// Resolve the finished-garment geometry from the spec into numbers the templates
// use. Everything is in illustration units.
function geom(spec) {
  const garment = spec.garment || 'top';
  const isDress = garment === 'dress';

  // --- body length (shoulder -> hem) -------------------------------------
  // top/shell lengths, then dress skirt length adds on below the waist.
  const topLen = spec.topLength || 'hip';
  const bodyToWaist = 150;                 // shoulder to natural waist
  const empire = spec.waistline === 'empire';
  const waistY = empire ? bodyToWaist * 0.66 : bodyToWaist;

  let hemY, hemHalf;
  if (isDress) {
    const skLen = spec.skirtLength || 'midi';
    const skDrop = skLen === 'mini' ? 150 : skLen === 'midi' ? 250 : skLen === 'maxi' ? 360 : 190;
    hemY = waistY + skDrop;
    const st = spec.skirtStyle || 'aLine';
    const flare = st === 'straight' ? 1.12 : st === 'gathered' ? 1.9
      : (st === 'circle' || st === 'full') ? 2.2 : 1.58;    // aLine default
    hemHalf = U.waistW * flare;
  } else {
    // a top / shell / blouse / tunic ends at hip / waist / tunic length.
    const drop = topLen === 'crop' ? 24 : topLen === 'waist' ? 0
      : topLen === 'tunic' ? 120 : 56;     // hip default
    hemY = waistY + drop;
    // a shell hem is close to the hip width, a touch of shaping.
    hemHalf = spec.shaping === 'princess' ? U.hipW * 1.02 : U.hipW * 0.98;
  }

  // --- neckline (half width, depth of the dip below the neck base) --------
  const neck = necklineGeom(spec.neckline || 'crew');

  // --- sleeve ------------------------------------------------------------
  const hasSleeve = spec.sleeveStyle && spec.sleeveStyle !== 'none';

  // waist width depends on shaping: a fitted/princess/empire bodice nips in at
  // the waist; a relaxed shift barely tapers (a shift hangs from bust, so a deep
  // waist nip reads as a wrong hourglass V on the side seam).
  const fitted = spec.shaping === 'princess' || spec.shaping === 'darts' || empire;
  const waistW = fitted ? U.waistW : U.chestW - 6;   // shift: only a slight taper

  return {
    isDress, empire, waistY, hemY, hemHalf, neck, hasSleeve,
    shoulderW: U.shoulderW, neckBase: U.neckBase, chestW: U.chestW,
    waistW, shoulderY: U.shoulderY, neckDrop: U.neckDrop,
  };
}

// neckline shape: how wide the half-neck opening is, how deep it dips at CF, and a
// `kind` tag so we can draw the correct curve (U scoop, V vNeck, square, boat line,
// sweetheart, cowl, off-shoulder).
function necklineGeom(kind) {
  switch (kind) {
    case 'scoop':      return { kind, half: 40, depth: 40 };
    case 'vNeck':      return { kind, half: 30, depth: 66 };
    case 'square':     return { kind, half: 34, depth: 40 };
    case 'boat':       return { kind, half: 52, depth: 12 };
    case 'sweetheart': return { kind, half: 40, depth: 44 };
    case 'halter':     return { kind, half: 18, depth: 64 };
    case 'cowl':       return { kind, half: 36, depth: 50 };
    case 'offShoulder':return { kind, half: 62, depth: 20 };
    case 'crew':
    default:           return { kind: 'crew', half: 30, depth: 22 };
  }
}

// ---------------------------------------------------------------------------
// Right-half outline as cubic beziers. Returns the SVG path `d` for ONE half:
// from the CF neckline point, up/out along the neckline to the shoulder-neck
// point, out the shoulder to the shoulder tip, down the armhole, down the side
// seam (through waist) to the hem, then in along the hem to CF, closing up the
// center line. The mirror is applied by the caller via transform="scale(-1,1)".
//
// `view` = 'front' | 'back'. Back necklines sit higher (shallower) than front.
// ---------------------------------------------------------------------------
function halfOutline(g, view) {
  const { neck } = g;
  const isBack = view === 'back';
  // back neck is shallow regardless of the front style (a real garment's back
  // neck is a small scoop) EXCEPT wide styles (boat/offShoulder) stay wide.
  const wide = neck.kind === 'boat' || neck.kind === 'offShoulder';
  const nHalf = neck.half;
  // back neck always sits shallower than the front of the same style: a small
  // scoop about a third of the front depth (clamped), so front/back read as
  // clearly different pieces, not mirror copies. Wide boat/off-shoulder stay wide.
  const nDepth = isBack ? (wide ? Math.min(neck.depth, 14) : Math.max(10, Math.min(neck.depth * 0.35, 18))) : neck.depth;
  const cfY = nDepth;                         // CF neckline point y
  const shoulderNeckX = nHalf;
  const shoulderNeckY = g.shoulderY + g.neckDrop;
  const shoulderTipX = g.shoulderW;
  // real garment shoulder slopes DOWN from neck point to tip (~22deg). Tip must
  // sit clearly BELOW the shoulder-neck point so the seam reads as a natural
  // sloping shoulder, never an upward "smile" that sags at center.
  const shoulderTipY = shoulderNeckY + (shoulderTipX - shoulderNeckX) * 0.32;
  const armDeepY = 92;                          // underarm / bottom of armhole
  const chestX = g.chestW;
  const waistX = g.waistW;
  const hemX = g.hemHalf;

  const underX = chestX;
  const dip = g.isDress ? 10 : 4;

  // Build the right-half boundary as an ordered SEGMENT list, from the CF neck
  // point (0,cfY) down to the CF hem point (0, hemY+dip). NO center-line edge —
  // the caller stitches this to its mirror so the CF join is invisible (there is
  // no fake center-front seam stroked down the garment).
  const segs = [];
  // neckline CF -> shoulder-neck point
  segs.push(...necklineSegs(neck.kind, isBack, nHalf, cfY, shoulderNeckX, shoulderNeckY));
  // shoulder seam (neck point -> shoulder tip)
  segs.push({ t: 'L', p: [[shoulderTipX, shoulderTipY]] });
  // armhole: shoulder tip -> underarm (sleeveless = clean scooped armhole, NOT a
  // sleeve). First control drops STRAIGHT DOWN from the tip (x = tip, not tip+4)
  // so the sloped shoulder flows into the armhole without an outward kink/point.
  segs.push({ t: 'C', p: [[shoulderTipX, shoulderTipY + 26], [underX + 12, armDeepY - 26], [underX, armDeepY]] });
  // side seam: underarm -> waist. Ease INTO the waist (control point stays near
  // waistX, not pulled sharply in) so the bust-to-waist curve reads as a soft
  // taper, never a hard hourglass corner that snaps in then out at the seam.
  segs.push({ t: 'C', p: [[underX - 2, g.waistY - 46], [waistX, g.waistY - 22], [waistX, g.waistY]] });
  if (g.isDress) {
    // skirt: leave the waist ALONG the waist tangent (control near waistX) then
    // sweep OUT to the hem so the skirt visibly flares/A-lines away from the body
    // instead of dropping as a straight tube. Deeper outward control = real flare.
    segs.push({ t: 'C', p: [[waistX + (hemX - waistX) * 0.12, g.waistY + (g.hemY - g.waistY) * 0.28],
                            [hemX - (hemX - waistX) * 0.28, g.hemY - (g.hemY - g.waistY) * 0.14], [hemX, g.hemY]] });
  } else {
    segs.push({ t: 'C', p: [[waistX + 6, g.waistY + (g.hemY - g.waistY) * 0.4], [hemX, g.hemY - 12], [hemX, g.hemY]] });
  }
  // hem: hem point in to the CF hem point (with a slight worn-hang dip at center)
  segs.push({ t: 'Q', p: [[hemX * 0.5, g.hemY + dip], [0, g.hemY + dip]] });
  return { segs, cfNeckY: cfY, cfHemY: g.hemY + dip };
}

// A right-half segment list -> a single closed full outline path `d`. The right
// half runs CF-neck -> ... -> CF-hem; we then walk it BACKWARD mirrored (x -> -x)
// from CF-hem up to CF-neck, closing the loop. Result: one continuous silhouette
// with no interior center line.
function fullOutlinePath(half) {
  const { segs, cfNeckY, cfHemY } = half;
  let d = `M 0 ${n(cfNeckY)} `;
  for (const s of segs) {
    if (s.t === 'L') d += `L ${n(s.p[0][0])} ${n(s.p[0][1])} `;
    else if (s.t === 'Q') d += `Q ${n(s.p[0][0])} ${n(s.p[0][1])} ${n(s.p[1][0])} ${n(s.p[1][1])} `;
    else if (s.t === 'C') d += `C ${n(s.p[0][0])} ${n(s.p[0][1])} ${n(s.p[1][0])} ${n(s.p[1][1])} ${n(s.p[2][0])} ${n(s.p[2][1])} `;
  }
  // now at CF-hem (0, cfHemY); walk the mirror backward up to CF-neck.
  // a segment from A -> B with controls c1,c2 becomes, reversed & mirrored,
  // B' -> A' with controls c2',c1' (all x negated).
  const mx = (pt) => [-pt[0], pt[1]];
  // reconstruct start points to reverse cleanly: track the running "from" point.
  const pts = [[0, cfNeckY]];
  for (const s of segs) pts.push(s.p[s.p.length - 1]);
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    const from = pts[i];              // mirror target (we END here going backward)
    const to = mx(from);
    if (s.t === 'L') d += `L ${n(to[0])} ${n(to[1])} `;
    else if (s.t === 'Q') {
      const c = mx(s.p[0]);
      d += `Q ${n(c[0])} ${n(c[1])} ${n(to[0])} ${n(to[1])} `;
    } else if (s.t === 'C') {
      const c2 = mx(s.p[1]), c1 = mx(s.p[0]);
      d += `C ${n(c2[0])} ${n(c2[1])} ${n(c1[0])} ${n(c1[1])} ${n(to[0])} ${n(to[1])} `;
    }
  }
  d += 'Z';
  return d;
}

// neckline as a segment list (CF point -> shoulder-neck point).
function necklineSegs(kind, isBack, nHalf, cfY, snX, snY) {
  if (isBack) {
    return [{ t: 'C', p: [[nHalf * 0.35, cfY], [nHalf * 0.7, snY + (cfY - snY) * 0.4], [snX, snY]] }];
  }
  switch (kind) {
    case 'vNeck':
      return [{ t: 'L', p: [[snX, snY]] }];
    case 'square':
      return [{ t: 'L', p: [[nHalf, cfY]] }, { t: 'L', p: [[snX, snY]] }];
    case 'boat':
    case 'offShoulder':
      // gentle near-horizontal boat line; control sits just BELOW cfY so the
      // line never bows upward into a smile between the two shoulder points.
      return [{ t: 'Q', p: [[nHalf * 0.55, cfY + 3], [snX, snY]] }];
    case 'sweetheart':
      return [{ t: 'C', p: [[nHalf * 0.22, cfY - 20], [nHalf * 0.6, cfY - 6], [nHalf * 0.66, cfY - 16]] },
              { t: 'C', p: [[nHalf * 0.8, snY + (cfY - snY) * 0.3], [snX, snY + 6], [snX, snY]] }];
    case 'halter':
      return [{ t: 'C', p: [[nHalf * 0.6, cfY - 6], [snX, snY + 24], [snX, snY]] }];
    case 'scoop':
    case 'cowl':
    case 'crew':
    default:
      return [{ t: 'C', p: [[nHalf * 0.28, cfY], [snX, snY + (cfY - snY) * 0.55], [snX, snY]] }];
  }
}

// ---------------------------------------------------------------------------
// Sleeve: an ACTUAL sleeve shape attached at the shoulder, drawn only when the
// spec HAS a sleeve. Sleeveless -> nothing (the clean armhole in halfOutline is
// the whole story). Right-half only; mirrored by the caller.
// ---------------------------------------------------------------------------
function sleeveHalf(g, spec) {
  if (!g.hasSleeve) return '';
  // MUST match the sloped shoulder tip used in halfOutline, or the sleeve cap
  // detaches from the body and reads as an outward kink/ear. Same formula.
  const shoulderNeckY = g.shoulderY + g.neckDrop;
  const shoulderTipX = g.shoulderW;
  const shoulderTipY = shoulderNeckY + (shoulderTipX - g.neck.half) * 0.32;
  const underX = g.chestW, underY = 92;
  const style = spec.sleeveStyle;
  const len = spec.sleeveLength || 'short';
  const puff = spec.sleeveCap === 2 || style === 'puff';
  const cap = style === 'cap' || spec.sleeveCap === 4;

  // sleeve length (how far the hem drops below the shoulder tip)
  const drop = cap ? 34 : len === 'long' ? 300 : len === 'threeQuarter' ? 220
    : len === 'elbow' ? 150 : 96;            // short default
  // how far the sleeve projects outward at the hem. A cap sleeve barely extends
  // past the shoulder tip (it caps the shoulder, it does not wing out); keeping
  // outW small stops the round "ear" kink at the shoulder.
  const outW = cap ? 16 : puff ? 62 : 48;
  const hemX = shoulderTipX + outW;
  const hemTopY = shoulderTipY + drop * 0.5;
  const hemBotY = shoulderTipY + drop;

  // cap head: puff rises above the shoulder; plain/cap follows the shoulder line
  const capRise = puff ? 22 : cap ? 6 : 8;
  let d = `M ${n(shoulderTipX)} ${n(shoulderTipY)} `;
  // over the cap head, out to the outer shoulder of the sleeve
  d += `C ${n(shoulderTipX + outW * 0.4)} ${n(shoulderTipY - capRise)} ${n(hemX - outW * 0.1)} ${n(shoulderTipY + 6)} ${n(hemX)} ${n(hemTopY)} `;
  // down the outer sleeve edge to the hem
  d += `L ${n(hemX - (cap ? 6 : 4))} ${n(hemBotY)} `;
  // along the sleeve hem back toward the body
  d += `Q ${n((hemX + underX) * 0.5)} ${n(hemBotY + (cap ? 4 : 8))} ${n(underX + (cap ? 6 : 10))} ${n(cap ? underY + 6 : hemBotY - drop * 0.12)} `;
  // up the underarm seam back to the underarm point on the body
  d += `L ${n(underX)} ${n(underY)} `;

  let s = `<path d="${d}" fill="none" stroke="${NAVY}" stroke-width="2" ` +
    `stroke-linejoin="round" stroke-linecap="round"/>`;
  if (puff) {
    // gather ticks at the cap head
    for (let t = 0.2; t <= 0.85; t += 0.16) {
      const gx = shoulderTipX + outW * t;
      s += `<line x1="${n(gx)}" y1="${n(shoulderTipY - 2)}" x2="${n(gx)}" y2="${n(shoulderTipY + 9)}" stroke="${SEAM}" stroke-width="1"/>`;
    }
  }
  return s;
}

// ---------------------------------------------------------------------------
// Interior design lines (thin). Darts / princess seams / button row / empire
// seam / back zip / ties / gather. Drawn on BOTH halves (x and -x) explicitly
// because they are not part of the mirrored outline group.
// ---------------------------------------------------------------------------
function interior(g, spec, view) {
  const isBack = view === 'back';
  let s = '';
  const waistY = g.waistY, bodyBottom = g.isDress ? g.waistY : g.hemY;

  // empire / waist seam
  if (g.isDress) {
    s += `<line x1="${n(-g.waistW * 1.02)}" y1="${n(waistY)}" x2="${n(g.waistW * 1.02)}" y2="${n(waistY)}" ` +
      `stroke="${SEAM}" stroke-width="1" stroke-dasharray="7 4"/>`;
  }

  if (spec.shaping === 'princess') {
    // two curved princess seams shoulder-ish -> hem on each side
    for (const dir of [-1, 1]) {
      const xTop = dir * g.neck.half * 0.9;
      const xMid = dir * g.chestW * 0.62;
      const xBot = dir * (g.isDress ? g.hemHalf * 0.42 : g.waistW * 0.5);
      s += `<path d="M ${n(xTop)} ${n(20)} C ${n(xMid)} ${n(70)} ${n(xMid)} ${n(waistY - 30)} ${n(xBot)} ${n(g.isDress ? g.hemY : g.hemY - 6)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="1" stroke-linecap="round"/>`;
    }
  } else if (!isBack) {
    // front bust/waist darts: short tapered lines from the waist up toward the bust
    for (const dir of [-1, 1]) {
      const x = dir * g.waistW * 0.5;
      s += `<path d="M ${n(x)} ${n(bodyBottom * 0.99)} L ${n(x * 0.86)} ${n(waistY * 0.6)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="1" stroke-linecap="round"/>`;
    }
  }

  // button row / placket (front only)
  const hasPlacket = spec.frontPlacket || (spec.placketStyle && spec.placketStyle > 0);
  if (hasPlacket && !isBack) {
    const top = g.neck.depth + 6;
    const bot = (g.isDress ? g.hemY : g.hemY) * 0.94;
    s += `<line x1="0" y1="${n(g.neck.depth)}" x2="0" y2="${n(bot + 8)}" stroke="${SEAM}" stroke-width="1"/>`;
    const nb = 6;
    for (let i = 0; i < nb; i++) {
      const y = top + (bot - top) * i / (nb - 1);
      s += `<circle cx="0" cy="${n(y)}" r="3.4" fill="none" stroke="${NAVY}" stroke-width="1"/>`;
    }
  }

  // gather (drawstring / shirred / smocked) — thin horizontal or tick band
  if (spec.gatherType) {
    const zoneY = spec.gatherZone === 1 ? 60 : spec.gatherZone === 2 ? waistY - 6 : g.neck.depth + 14;
    const halfW = g.chestW * 0.9;
    if (spec.gatherType === 1) {                 // drawstring: two parallel channels
      for (const off of [-5, 5]) {
        s += `<line x1="${n(-halfW)}" y1="${n(zoneY + off)}" x2="${n(halfW)}" y2="${n(zoneY + off)}" stroke="${SEAM}" stroke-width="1"/>`;
      }
    } else {                                      // shirred / smocked: tick band
      for (let x = -halfW; x <= halfW; x += 13) {
        s += `<line x1="${n(x)}" y1="${n(zoneY - 7)}" x2="${n(x)}" y2="${n(zoneY + 7)}" stroke="${SEAM}" stroke-width="0.9"/>`;
      }
    }
  }

  // back-view specifics: center-back zip, back ties, open-back cutout
  if (isBack) {
    if (spec.closure && /zip/i.test(spec.closure)) {
      s += `<line x1="0" y1="${n(g.neck.depth + 4)}" x2="0" y2="${n(g.isDress ? waistY + 40 : g.hemY * 0.8)}" ` +
        `stroke="${SEAM}" stroke-width="1" stroke-dasharray="2 3"/>`;
    }
    if (spec.tie && spec.tie > 0) {
      const ty = g.isDress ? waistY : g.hemY * 0.86;
      for (const dir of [-1, 1]) {
        s += `<path d="M ${n(dir * g.waistW)} ${n(ty - 6)} Q ${n(dir * g.waistW * 0.4)} ${n(ty)} 0 ${n(ty + 2)}" ` +
          `fill="none" stroke="${SEAM}" stroke-width="1.4" stroke-linecap="round"/>`;
      }
    }
    if (spec.backOpening && spec.backOpening > 0) {
      s += `<path d="M ${n(-g.neck.half * 0.72)} ${n(g.neck.depth + 6)} Q 0 ${n(waistY * 0.5)} ${n(g.neck.half * 0.72)} ${n(g.neck.depth + 6)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="1" stroke-dasharray="4 3"/>`;
    }
  }

  return s;
}

// ---------------------------------------------------------------------------
// collar (front only, hugs the neckline). Peter-pan = two rounded leaves; stand /
// mock / shirt = a band along the neckline.
// ---------------------------------------------------------------------------
function collar(g, spec) {
  const t = spec.collarType || 0;
  if (!t) return '';
  const nHalf = g.neck.half, ny = g.neck.depth * 0.5 + 2;
  if (t === 4) {                                  // peter-pan: rounded flat leaves
    let s = '';
    for (const dir of [-1, 1]) {
      s += `<path d="M 0 ${n(ny + 4)} Q ${n(dir * nHalf * 0.9)} ${n(ny - 4)} ${n(dir * nHalf * 1.2)} ${n(ny + 34)} ` +
        `Q ${n(dir * nHalf * 0.85)} ${n(ny + 44)} ${n(dir * nHalf * 0.32)} ${n(ny + 20)} Z" ` +
        `fill="#fff" stroke="${NAVY}" stroke-width="1.4" stroke-linejoin="round"/>`;
    }
    return s;
  }
  // stand / mock / shirt band along the neckline
  return `<path d="M ${n(-nHalf)} ${n(ny + 10)} Q 0 ${n(ny - 8)} ${n(nHalf)} ${n(ny + 10)}" ` +
    `fill="none" stroke="${NAVY}" stroke-width="2" stroke-linecap="round"/>`;
}

// ---------------------------------------------------------------------------
// One VIEW (front or back): the mirrored outline group + sleeves + interior.
// Returns { inner, w, h } in view-local coords (centered on x=0).
// ---------------------------------------------------------------------------
function viewPanel(spec, view) {
  const g = geom(spec);
  g.skirtStyle = spec.skirtStyle;

  const half = halfOutline(g, view);
  // outline: ONE continuous closed silhouette (right half + reversed mirror),
  // so there is no stroked center-front line / fake seam down the garment.
  const outline =
    `<path d="${fullOutlinePath(half)}" fill="#fbfcfe" stroke="${NAVY}" ` +
    `stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;

  const slv = sleeveHalf(g, spec);
  const sleeves = slv
    ? `<g>${slv}<g transform="scale(-1,1)">${slv}</g></g>`
    : '';

  const details = collar(g, spec) + interior(g, spec, view);

  const bottom = g.hemY + (g.isDress ? 10 : 4);
  // widest extent: outline hem/hip/chest, or sleeve reach if sleeved
  let maxX = Math.max(g.hemHalf, g.chestW, g.shoulderW);
  if (g.hasSleeve) maxX = Math.max(maxX, g.shoulderW + (spec.sleeveCap === 2 || spec.sleeveStyle === 'puff' ? 62 : 48));
  const pad = 20;
  const w = (maxX + pad) * 2;
  const h = bottom + pad;
  // shift so x=0 maps to w/2, y starts at pad
  const inner = `<g transform="translate(${n(w / 2)} ${pad})">${outline}${sleeves}${details}</g>`;
  return { inner, w, h };
}

// ---------------------------------------------------------------------------
// public: assembled FRONT + BACK finished-garment flat, spec-driven.
// `pieces` is unused for the outline (kept for signature compatibility).
// ---------------------------------------------------------------------------
export function renderGarmentFlat(pieces, spec = {}) {
  const fp = viewPanel(spec, 'front');
  const bp = viewPanel(spec, 'back');

  const HEAD = 40, GAP = 56, PAD = 24;
  const panelH = Math.max(fp.h, bp.h);
  const W = PAD + fp.w + GAP + bp.w + PAD;
  const H = HEAD + panelH + PAD;
  const head = (x, w, label) =>
    `<text x="${n(x + w / 2)}" y="28" text-anchor="middle" ` +
    `font-family="Helvetica,Arial,sans-serif" font-size="22" font-weight="600" ` +
    `letter-spacing="3" fill="${NAVY}">${label}</text>`;

  let inner = head(PAD, fp.w, 'FRONT');
  inner += `<g transform="translate(${n(PAD)} ${HEAD})">${fp.inner}</g>`;
  const bx = PAD + fp.w + GAP;
  inner += head(bx, bp.w, 'BACK');
  inner += `<g transform="translate(${n(bx)} ${HEAD})">${bp.inner}</g>`;
  const dx = PAD + fp.w + GAP / 2;
  inner += `<line x1="${n(dx)}" y1="${HEAD}" x2="${n(dx)}" y2="${n(HEAD + panelH)}" stroke="#e2e9f2" stroke-width="1"/>`;

  return svgDoc(W, H, inner);
}
