// render-on-figure.mjs — the "ON THE FIGURE" view: the finished garment drawn on
// a standard female fashion croquis, so a viewer sees how the size would look
// WORN. This answers "36 beden bir kızın üstünde nasıl dururdu?" — how would a
// size-36 look on a girl. It is an ILLUSTRATION, never a real photo.
//
// This is a SEPARATE renderer from render-garment-flat.mjs (the technical flat).
// The flat is the mannequin-less Etsy line-art; this one drapes the same style
// spec onto a fixed slim croquis figure. Both read the SAME spec fields
// (neckline / sleeveStyle / sleeveLength / skirtLength / silhouette / gather /
// collar / placket / etc.), so the two views stay in sync.
//
// Discipline (same as the flat): cubic beziers not polyline, right half mirrored
// with transform for symmetry, stroke hierarchy (figure thin 1, garment outline
// 2, details 1), round joins/caps, navy on white. The croquis is a reusable base
// drawn once; every garment renders onto its fixed key points.

const NAVY = '#1f3a5f';
const FIG = '#9db4cf';    // the croquis figure line: thin, light navy-grey
const SEAM = '#5c7aa0';   // garment interior detail lines (thin)

const n = (v) => (Math.round(v * 10) / 10).toFixed(1);

const svgDoc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" ` +
  `width="100%" role="img"><rect width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#fff"/>${inner}</svg>`;

// ---------------------------------------------------------------------------
// CROQUIS KEY POINTS. A fashion figure is elongated (~9 heads). All in
// illustration units; x=0 is center of the body, y grows downward from the top
// of the head. The figure faces front. We draw the RIGHT half and mirror it.
//
// These key points are the single source both the figure AND the garment use:
// the garment's neckline sits at NECK, its shoulders at SHOULDER, hems fall at
// measured leg heights, sleeves run down the arm. That shared frame is what
// makes the garment sit believably on the body.
// ---------------------------------------------------------------------------
const F = {
  headTop: 0,
  headBottom: 62,      // one head = 62 units; figure is ~9 heads tall
  chinY: 58,
  neckBaseY: 78,       // base of neck / top of shoulder slope
  shoulderY: 92,       // shoulder line (shoulder tips)
  shoulderX: 60,       // half shoulder width (shoulder tip x)
  neckX: 20,           // half neck width
  bustY: 150,          // bust line
  bustX: 52,           // half bust width
  waistY: 214,         // natural waist
  waistX: 38,          // half waist width (slim croquis)
  hipY: 286,           // hip line
  hipX: 58,            // half hip width
  crotchY: 320,        // top of legs
  kneeY: 452,          // knee
  ankleY: 574,         // ankle
  legTopX: 26,         // half separation of the two legs at the top (thigh)
  kneeX: 15,           // half leg width at knee (outer)
  ankleX: 9,           // half leg width at ankle (outer)
  wristY: 300,         // wrist when arm hangs at the side
  elbowY: 218,         // elbow
};

// ---------------------------------------------------------------------------
// The croquis figure line art (head, neck, torso, arms hanging at the sides,
// legs). Right half drawn in beziers, mirrored by the caller. Returns the inner
// group markup (already centered on x=0 in figure units).
// ---------------------------------------------------------------------------
function croquis() {
  // --- head: a simple elongated oval, no face detail ---
  const headCx = 0, headCy = (F.headTop + F.headBottom) / 2;
  const headRx = 21, headRy = (F.headBottom - F.headTop) / 2;
  let head =
    `<ellipse cx="${n(headCx)}" cy="${n(headCy)}" rx="${n(headRx)}" ry="${n(headRy)}" ` +
    `fill="#fff" stroke="${FIG}" stroke-width="1"/>`;

  // --- neck: two short verticals from chin to shoulder base ---
  let neck = '';
  for (const dir of [-1, 1]) {
    neck += `<path d="M ${n(dir * 11)} ${n(F.chinY)} C ${n(dir * 12)} ${n(F.neckBaseY - 6)} ` +
      `${n(dir * F.neckX * 0.9)} ${n(F.neckBaseY - 2)} ${n(dir * F.neckX)} ${n(F.neckBaseY)}" ` +
      `fill="none" stroke="${FIG}" stroke-width="1" stroke-linecap="round"/>`;
  }

  // --- torso outline (right half): shoulder tip -> down side through bust,
  //     waist, hip -> to crotch center. Mirror gives the full torso. ---
  let torso = '';
  {
    const d =
      `M ${n(F.neckX)} ${n(F.neckBaseY)} ` +
      // shoulder slope out to the shoulder tip
      `L ${n(F.shoulderX)} ${n(F.shoulderY)} ` +
      // armscye curve in to the underarm, then the side seam through bust
      `C ${n(F.shoulderX)} ${n(F.shoulderY + 24)} ${n(F.bustX + 4)} ${n(F.bustY - 20)} ${n(F.bustX)} ${n(F.bustY)} ` +
      // bust -> waist (nips in)
      `C ${n(F.bustX)} ${n(F.bustY + 34)} ${n(F.waistX)} ${n(F.waistY - 30)} ${n(F.waistX)} ${n(F.waistY)} ` +
      // waist -> hip (flares out)
      `C ${n(F.waistX)} ${n(F.waistY + 30)} ${n(F.hipX)} ${n(F.hipY - 34)} ${n(F.hipX)} ${n(F.hipY)} ` +
      // hip -> crotch center
      `C ${n(F.hipX)} ${n(F.hipY + 20)} ${n(F.legTopX + 10)} ${n(F.crotchY - 6)} 0 ${n(F.crotchY)}`;
    torso = `<path d="${d}" fill="#fff" stroke="${FIG}" stroke-width="1" ` +
      `stroke-linejoin="round" stroke-linecap="round"/>`;
    torso += `<g transform="scale(-1,1)">${torso}</g>`;
  }

  // --- legs (right leg; mirrored). Outer edge from hip down, inner edge back up
  //     to the crotch. Slim, tapering to the ankle. ---
  let legs = '';
  {
    const outHipX = F.hipX, kneeOutX = F.legTopX + F.kneeX, ankleOutX = F.legTopX * 0.6 + F.ankleX;
    const inTopX = F.legTopX, kneeInX = F.legTopX - F.kneeX * 0.2, ankleInX = F.legTopX * 0.6 - F.ankleX * 0.2;
    const d =
      `M ${n(outHipX)} ${n(F.hipY)} ` +
      `C ${n(outHipX - 4)} ${n(F.hipY + 40)} ${n(kneeOutX + 4)} ${n(F.kneeY - 40)} ${n(kneeOutX)} ${n(F.kneeY)} ` +
      `C ${n(kneeOutX - 2)} ${n(F.kneeY + 50)} ${n(ankleOutX + 3)} ${n(F.ankleY - 40)} ${n(ankleOutX)} ${n(F.ankleY)} ` +
      // ankle across
      `L ${n(ankleInX)} ${n(F.ankleY)} ` +
      // inner edge back up to knee then to crotch
      `C ${n(ankleInX + 2)} ${n(F.ankleY - 50)} ${n(kneeInX)} ${n(F.kneeY + 40)} ${n(kneeInX)} ${n(F.kneeY)} ` +
      `C ${n(kneeInX)} ${n(F.kneeY - 60)} ${n(inTopX)} ${n(F.crotchY + 30)} ${n(inTopX)} ${n(F.crotchY + 2)} ` +
      `L 0 ${n(F.crotchY)}`;
    legs = `<path d="${d}" fill="#fff" stroke="${FIG}" stroke-width="1" ` +
      `stroke-linejoin="round" stroke-linecap="round"/>`;
    legs += `<g transform="scale(-1,1)">${legs}</g>`;
  }

  // --- arms hanging at the sides (right arm; mirrored). Thin, from the shoulder
  //     tip down to the wrist, slightly away from the body. ---
  let arms = '';
  {
    const topX = F.shoulderX - 2, topY = F.shoulderY + 4;
    const elbowX = F.bustX + 10, wristX = F.waistX + 16;
    const d =
      `M ${n(topX)} ${n(topY)} ` +
      `C ${n(topX + 8)} ${n(F.bustY - 10)} ${n(elbowX + 6)} ${n(F.elbowY - 14)} ${n(elbowX)} ${n(F.elbowY)} ` +
      `C ${n(elbowX)} ${n(F.elbowY + 30)} ${n(wristX + 3)} ${n(F.wristY - 24)} ${n(wristX)} ${n(F.wristY)}`;
    arms = `<path d="${d}" fill="none" stroke="${FIG}" stroke-width="1" ` +
      `stroke-linecap="round"/>`;
    arms += `<g transform="scale(-1,1)">${arms}</g>`;
  }

  return `<g>${legs}${torso}${arms}${neck}${head}</g>`;
}

// ---------------------------------------------------------------------------
// GARMENT ON THE FIGURE. Reads the same spec fields as the flat and draws a
// clean fashion-illustration outline of the dress/top as WORN. It sits at the
// figure's neck/shoulders, drapes to the silhouette, and the hem falls at the
// measured leg height for the length (mini/midi/maxi visibly different).
// Right half in beziers, mirrored by the caller.
// ---------------------------------------------------------------------------

// neckline shape at the body: half width + how deep it dips below the neck base.
function necklineOnBody(kind) {
  switch (kind) {
    case 'scoop':       return { half: 24, depth: 40 };
    case 'vNeck':       return { half: 20, depth: 58 };
    case 'square':      return { half: 24, depth: 34 };
    case 'boat':        return { half: 40, depth: 8 };
    case 'sweetheart':  return { half: 28, depth: 36 };
    case 'halter':      return { half: 12, depth: 54 };
    case 'cowl':        return { half: 26, depth: 44 };
    case 'offShoulder': return { half: 48, depth: 14 };
    case 'crew':
    default:            return { half: 20, depth: 18 };
  }
}

// resolve hem Y on the figure from the length.
function hemY(spec) {
  const isDress = spec.garment === 'dress';
  if (isDress) {
    const sk = spec.skirtLength || 'midi';
    // mini = mid-thigh, midi = mid-calf, maxi = ankle. Visibly different heights.
    const midThigh = (F.crotchY + F.kneeY) / 2;      // ~386
    const midCalf = (F.kneeY + F.ankleY) / 2;        // ~513
    if (sk === 'mini') return midThigh - 8;
    if (sk === 'maxi') return F.ankleY - 6;
    return midCalf;                                   // midi default
  }
  // a top ends near the hip / waist.
  const tl = spec.topLength || 'hip';
  if (tl === 'crop') return F.waistY - 6;
  if (tl === 'waist') return F.waistY + 4;
  if (tl === 'tunic') return F.hipY + 40;
  return F.hipY + 6;                                  // hip default
}

// half width of the hem given the silhouette and length.
function hemHalf(spec, hy) {
  const isDress = spec.garment === 'dress';
  if (!isDress) {
    return spec.shaping === 'princess' ? F.hipX + 4 : F.hipX + 2;
  }
  const st = spec.skirtStyle || 'aLine';
  // base hip width at the hem, scaled by how far below the hip the hem falls.
  const drop = Math.max(0, hy - F.hipY);
  const flare = st === 'straight' ? 0.10
    : st === 'gathered' ? 0.55
    : (st === 'circle' || st === 'full') ? 0.85
    : 0.34;                                            // aLine default
  return F.hipX + drop * flare;
}

// the garment outline: right half from CF neckline down the body to the hem.
function garmentHalf(spec) {
  const isDress = spec.garment === 'dress';
  const neck = necklineOnBody(spec.neckline || 'crew');
  const empire = spec.waistline === 'empire';

  const cfY = F.neckBaseY + neck.depth;               // CF neckline point
  const shoulderNeckX = neck.half;
  const shoulderNeckY = F.neckBaseY - 2;
  // wide necklines sit off the shoulder tip; otherwise a normal shoulder seam.
  const wide = neck.half >= 40;
  const shoulderX = wide ? F.shoulderX - 6 : F.shoulderX - 2;
  const shoulderY = F.shoulderY;

  const hy = hemY(spec);
  const hh = hemHalf(spec, hy);
  // side of the garment sits a touch off the body at bust, nips to the waist.
  const sideBustX = F.bustX + 6;
  const waistX = empire ? F.bustY : F.waistX + 4;     // (waistX var reused below)
  const bodiceWaistY = empire ? (F.bustY + 24) : F.waistY;
  const bodiceWaistX = empire ? F.bustX + 2 : F.waistX + 6;

  const segs = [];
  // neckline: CF point -> shoulder-neck point
  segs.push(...necklineSegs(spec.neckline || 'crew', neck.half, cfY, shoulderNeckX, shoulderNeckY));
  // shoulder seam out to the garment shoulder tip
  segs.push({ t: 'L', p: [[shoulderX, shoulderY]] });
  // armhole down to the underarm (sleeveless: clean scoop; sleeve added separately)
  segs.push({ t: 'C', p: [[shoulderX + 2, shoulderY + 22], [sideBustX + 4, F.bustY - 18], [sideBustX, F.bustY]] });
  // side seam bust -> bodice waist
  segs.push({ t: 'C', p: [[sideBustX, F.bustY + 26], [bodiceWaistX, bodiceWaistY - 26], [bodiceWaistX, bodiceWaistY]] });
  // bodice waist -> hem (skirt drape for a dress, straight-ish for a top)
  if (isDress) {
    segs.push({ t: 'C', p: [[bodiceWaistX + (hh - bodiceWaistX) * 0.22, bodiceWaistY + (hy - bodiceWaistY) * 0.4],
                            [hh, hy - (hy - bodiceWaistY) * 0.28], [hh, hy]] });
  } else {
    segs.push({ t: 'C', p: [[bodiceWaistX + 2, bodiceWaistY + (hy - bodiceWaistY) * 0.45], [hh, hy - 10], [hh, hy]] });
  }
  // hem: hem point in to CF hem (slight worn hang dip at center)
  const dip = isDress ? 8 : 4;
  segs.push({ t: 'Q', p: [[hh * 0.5, hy + dip], [0, hy + dip]] });

  return { segs, cfNeckY: cfY, cfHemY: hy + dip, neck, empire, bodiceWaistY, hy, hh };
}

function necklineSegs(kind, nHalf, cfY, snX, snY) {
  switch (kind) {
    case 'vNeck':
      return [{ t: 'L', p: [[snX, snY]] }];
    case 'square':
      return [{ t: 'L', p: [[nHalf, cfY]] }, { t: 'L', p: [[snX, snY]] }];
    case 'boat':
    case 'offShoulder':
      return [{ t: 'Q', p: [[nHalf * 0.55, cfY - 2], [snX, snY]] }];
    case 'sweetheart':
      return [{ t: 'C', p: [[nHalf * 0.22, cfY - 16], [nHalf * 0.6, cfY - 4], [nHalf * 0.66, cfY - 12]] },
              { t: 'C', p: [[nHalf * 0.82, snY + (cfY - snY) * 0.3], [snX, snY + 4], [snX, snY]] }];
    case 'halter':
      return [{ t: 'C', p: [[nHalf * 0.6, cfY - 6], [snX, snY + 20], [snX, snY]] }];
    case 'scoop':
    case 'cowl':
    case 'crew':
    default:
      // a soft U: hold the CF depth flat-ish across the base, then sweep up to
      // the shoulder-neck point so it reads as a round scoop, not a V point.
      return [{ t: 'C', p: [[nHalf * 0.62, cfY], [snX, cfY - (cfY - snY) * 0.35], [snX, snY]] }];
  }
}

// right half segment list -> one closed full outline path (mirror walked back).
function fullOutlinePath(half) {
  const { segs, cfNeckY, cfHemY } = half;
  let d = `M 0 ${n(cfNeckY)} `;
  for (const s of segs) {
    if (s.t === 'L') d += `L ${n(s.p[0][0])} ${n(s.p[0][1])} `;
    else if (s.t === 'Q') d += `Q ${n(s.p[0][0])} ${n(s.p[0][1])} ${n(s.p[1][0])} ${n(s.p[1][1])} `;
    else if (s.t === 'C') d += `C ${n(s.p[0][0])} ${n(s.p[0][1])} ${n(s.p[1][0])} ${n(s.p[1][1])} ${n(s.p[2][0])} ${n(s.p[2][1])} `;
  }
  const mx = (pt) => [-pt[0], pt[1]];
  const pts = [[0, cfNeckY]];
  for (const s of segs) pts.push(s.p[s.p.length - 1]);
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    const to = mx(pts[i]);
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

// sleeve drawn ON the arm when the spec has one (right half; mirrored).
function sleeveOnFigure(spec) {
  const hasSleeve = spec.sleeveStyle && spec.sleeveStyle !== 'none';
  if (!hasSleeve) return '';
  const shoulderX = F.shoulderX - 2, shoulderY = F.shoulderY;
  const len = spec.sleeveLength || 'short';
  const puff = spec.sleeveCap === 2;
  const cap = spec.sleeveStyle === 'cap' || spec.sleeveCap === 4;

  // sleeve hem Y down the arm (short = upper arm, long = wrist).
  const hemArmY = cap ? F.shoulderY + 24
    : len === 'long' ? F.wristY
    : len === 'threeQuarter' ? F.elbowY + 44
    : len === 'elbow' ? F.elbowY
    : F.bustY + 6;                                    // short default
  const outW = cap ? 16 : puff ? 30 : 22;
  const armX = F.bustX + 8;                            // arm center-ish x at the sleeve
  const capRise = puff ? 16 : 6;

  let d = `M ${n(shoulderX)} ${n(shoulderY)} `;
  // over the cap head out to the sleeve outer edge
  d += `C ${n(shoulderX + outW * 0.5)} ${n(shoulderY - capRise)} ${n(armX + outW)} ${n(shoulderY + 10)} ${n(armX + outW)} ${n(shoulderY + 40)} `;
  // down the outer sleeve edge to the hem
  d += `L ${n(armX + outW * 0.7)} ${n(hemArmY)} `;
  // across the sleeve hem back to the inner (body side) edge
  d += `Q ${n(armX)} ${n(hemArmY + 6)} ${n(F.bustX + 2)} ${n(cap ? shoulderY + 26 : hemArmY - 6)} `;
  // up the underarm back to the armhole underarm point
  d += `L ${n(F.bustX + 4)} ${n(F.bustY)} `;

  let s = `<path d="${d}" fill="#fbfcfe" stroke="${NAVY}" stroke-width="2" ` +
    `stroke-linejoin="round" stroke-linecap="round"/>`;
  if (puff) {
    for (let t = 0.2; t <= 0.8; t += 0.2) {
      const gx = shoulderX + outW * t;
      s += `<line x1="${n(gx)}" y1="${n(shoulderY - 1)}" x2="${n(gx)}" y2="${n(shoulderY + 8)}" stroke="${SEAM}" stroke-width="1"/>`;
    }
  }
  return `<g>${s}<g transform="scale(-1,1)">${s}</g></g>`;
}

// interior detail lines on the worn garment (thin): empire seam, princess/darts,
// button placket, gather band, collar. Drawn on both halves explicitly.
function interiorOnFigure(spec, half) {
  let s = '';
  const isDress = spec.garment === 'dress';
  const empire = spec.waistline === 'empire';
  const waistY = empire ? half.bodiceWaistY : F.waistY;

  // empire / waist seam
  if (isDress) {
    const wSpan = empire ? F.bustX + 2 : F.waistX + 6;
    s += `<line x1="${n(-wSpan)}" y1="${n(waistY)}" x2="${n(wSpan)}" y2="${n(waistY)}" ` +
      `stroke="${SEAM}" stroke-width="1" stroke-dasharray="6 4"/>`;
  }

  if (spec.shaping === 'princess') {
    for (const dir of [-1, 1]) {
      const xTop = dir * half.neck.half * 0.9;
      const xMid = dir * F.bustX * 0.55;
      const xBot = dir * half.hh * 0.4;
      s += `<path d="M ${n(xTop)} ${n(F.neckBaseY + 16)} C ${n(xMid)} ${n(F.bustY)} ${n(xMid)} ${n(waistY - 20)} ${n(xBot)} ${n(half.hy)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="1" stroke-linecap="round"/>`;
    }
  } else {
    // bust/waist darts (front): short tapered lines from the waist up to the bust
    for (const dir of [-1, 1]) {
      const x = dir * (F.waistX + 2);
      s += `<path d="M ${n(x)} ${n(waistY - 4)} L ${n(x * 0.7)} ${n(F.bustY + 8)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="1" stroke-linecap="round"/>`;
    }
  }

  // button placket (front): a clean CF fold line + a row of cute round buttons,
  // each with a tiny center dot so it reads as a real button, not just a ring.
  const hasPlacket = spec.frontPlacket || (spec.placketStyle && spec.placketStyle > 0);
  if (hasPlacket) {
    const top = F.neckBaseY + half.neck.depth + 4;
    const bot = half.hy - 8;
    // asymmetric plackets sit the button row a touch off the center front.
    const bx = spec.placketStyle === 2 ? 5 : 0;
    s += `<line x1="${n(bx)}" y1="${n(top - 4)}" x2="${n(bx)}" y2="${n(bot)}" stroke="${SEAM}" stroke-width="1"/>`;
    const nb = 6;
    for (let i = 0; i < nb; i++) {
      const y = top + (bot - top) * i / (nb - 1);
      s += `<circle cx="${n(bx)}" cy="${n(y)}" r="3" fill="#fff" stroke="${NAVY}" stroke-width="1.1"/>`;
      s += `<circle cx="${n(bx)}" cy="${n(y)}" r="0.7" fill="${NAVY}"/>`;
    }
  }

  // gather band (drawstring / shirred / smocked)
  if (spec.gatherType) {
    const zoneY = spec.gatherZone === 1 ? F.bustY - 4
      : spec.gatherZone === 2 ? waistY - 4
      : F.neckBaseY + half.neck.depth + 12;           // neck yoke
    const halfW = F.bustX * 0.8;
    if (spec.gatherType === 1) {
      for (const off of [-4, 4]) {
        s += `<line x1="${n(-halfW)}" y1="${n(zoneY + off)}" x2="${n(halfW)}" y2="${n(zoneY + off)}" stroke="${SEAM}" stroke-width="1"/>`;
      }
    } else {
      for (let x = -halfW; x <= halfW; x += 11) {
        s += `<line x1="${n(x)}" y1="${n(zoneY - 6)}" x2="${n(x)}" y2="${n(zoneY + 6)}" stroke="${SEAM}" stroke-width="0.9"/>`;
      }
    }
  }

  // gathered skirt: soft vertical drape lines from the waist to the hem
  if (isDress && (spec.skirtStyle === 'gathered' || spec.skirtStyle === 'circle' || spec.skirtStyle === 'full')) {
    for (const dir of [-1, 1]) {
      for (const f of [0.3, 0.62]) {
        const xTop = dir * F.waistX * f;
        const xBot = dir * half.hh * f;
        s += `<path d="M ${n(xTop)} ${n(waistY + 6)} C ${n(xTop * 1.1)} ${n(waistY + (half.hy - waistY) * 0.5)} ${n(xBot)} ${n(half.hy - 30)} ${n(xBot)} ${n(half.hy)}" ` +
          `fill="none" stroke="${SEAM}" stroke-width="0.8" stroke-linecap="round"/>`;
      }
    }
  }

  return s;
}

// collar hugging the worn neckline (front). Each collar type is drawn as its own
// recognizable shape so the figure reads the real garment:
//   stand / mock = a little upstanding band around the neck
//   flat / peter-pan = two soft collar leaves lying on the chest (round/pointed/
//                      scalloped outer edge per collarEdge)
//   shirt = a small pointed shirt collar with an open V and a stand band
function collarOnFigure(spec, half) {
  const t = spec.collarType || 0;
  if (!t) return '';
  const edge = spec.collarEdge || 0;                   // 0 round, 1 pointed, 2 scallop
  const nHalf = half.neck.half;
  const ny = F.neckBaseY + half.neck.depth * 0.4;
  const nbY = F.neckBaseY;

  // stand / mock collar: a short band standing up around the neck base.
  if (t === 1 || t === 2) {
    let s = '';
    const bandTop = nbY - 12;
    for (const dir of [-1, 1]) {
      s += `<path d="M ${n(dir * 2)} ${n(nbY - 2)} L ${n(dir * (nHalf * 0.7 + 2))} ${n(nbY - 2)} ` +
        `L ${n(dir * (nHalf * 0.7))} ${n(bandTop)} L ${n(dir * 3)} ${n(bandTop)}" ` +
        `fill="#fff" stroke="${NAVY}" stroke-width="1.4" stroke-linejoin="round"/>`;
    }
    return s;
  }

  // shirt collar: a stand band + two pointed collar leaves flopping open in a V.
  if (t === 5) {
    let s = '';
    s += `<path d="M ${n(-nHalf * 0.7)} ${n(nbY - 2)} Q 0 ${n(nbY - 12)} ${n(nHalf * 0.7)} ${n(nbY - 2)}" ` +
      `fill="none" stroke="${NAVY}" stroke-width="1.4"/>`;
    for (const dir of [-1, 1]) {
      // collar leaf: from the neck point out and down to a sharp point on the chest.
      s += `<path d="M ${n(dir * 4)} ${n(nbY - 6)} L ${n(dir * nHalf * 1.15)} ${n(ny + 6)} ` +
        `L ${n(dir * nHalf * 0.5)} ${n(ny + 30)} L ${n(dir * 3)} ${n(ny + 10)} Z" ` +
        `fill="#fff" stroke="${NAVY}" stroke-width="1.3" stroke-linejoin="round"/>`;
    }
    return s;
  }

  // flat / peter-pan collar: two plump rounded leaves lying on the chest, each
  // hugging the neckline at the top and swelling to a soft round outer edge.
  let s = '';
  const nx0 = 3;                                       // small gap at center front
  for (const dir of [-1, 1]) {
    const innerX = dir * nx0, topY = ny - 2;           // near the neck point
    const outX = dir * nHalf * 1.28, outMidY = ny + 18;
    const botX = dir * nHalf * 0.5, botY = ny + 34;    // where the leaf meets the chest
    // top edge: neck point -> arc up and out to the widest outer point.
    let outerEdge;
    if (edge === 1) {                                  // pointed tip
      outerEdge = `Q ${n(dir * nHalf * 1.15)} ${n(ny + 6)} ${n(dir * nHalf * 1.4)} ${n(ny + 20)} ` +
        `Q ${n(dir * nHalf * 1.1)} ${n(ny + 28)} ${n(botX)} ${n(botY)} `;
    } else if (edge === 2) {                           // scallop: two little bumps
      outerEdge = `Q ${n(dir * nHalf * 1.25)} ${n(ny + 8)} ${n(dir * nHalf)} ${n(ny + 20)} ` +
        `Q ${n(dir * nHalf * 1.15)} ${n(ny + 30)} ${n(botX)} ${n(botY)} `;
    } else {                                           // round (default) — plump leaf
      outerEdge = `C ${n(outX)} ${n(ny + 4)} ${n(outX)} ${n(outMidY + 8)} ${n(botX + dir * nHalf * 0.35)} ${n(botY)} ` +
        `Q ${n(botX)} ${n(botY + 2)} ${n(botX * 0.6)} ${n(botY - 2)} `;
    }
    s += `<path d="M ${n(innerX)} ${n(topY)} ` +
      `Q ${n(dir * nHalf * 0.7)} ${n(ny - 6)} ${n(outX)} ${n(ny + 4)} ` +
      outerEdge +
      `Q ${n(dir * nHalf * 0.2)} ${n(ny + 18)} ${n(innerX)} ${n(topY)} Z" ` +
      `fill="#fff" stroke="${NAVY}" stroke-width="1.4" stroke-linejoin="round"/>`;
  }
  return s;
}

// a cute little drawn BOW/RIBBON centered at (cx, cy), half-width `w`. Two soft
// loops, a knot in the middle, and two tails hanging down — reads as a ribbon.
function bow(cx, cy, w = 16) {
  const lh = w;                 // loop reach to each side
  const lv = w * 0.62;          // loop height
  const knot = w * 0.26;        // knot half size
  const tailLen = w * 1.35;
  let s = `<g>`;
  for (const dir of [-1, 1]) {
    // one ribbon loop: knot edge -> swoop out and up -> back down to knot.
    s += `<path d="M ${n(cx + dir * knot)} ${n(cy - knot * 0.5)} ` +
      `C ${n(cx + dir * (lh * 0.6))} ${n(cy - lv)} ${n(cx + dir * lh)} ${n(cy - lv * 0.7)} ${n(cx + dir * lh)} ${n(cy)} ` +
      `C ${n(cx + dir * lh)} ${n(cy + lv * 0.7)} ${n(cx + dir * (lh * 0.6))} ${n(cy + lv)} ${n(cx + dir * knot)} ${n(cy + knot * 0.5)} Z" ` +
      `fill="#fff" stroke="${NAVY}" stroke-width="1.5" stroke-linejoin="round"/>`;
    // a tail hanging from the knot, gently curved and notched at the tip.
    const tx = cx + dir * knot * 0.6, ty = cy + knot;
    const tipX = cx + dir * knot * 2.1, tipY = cy + tailLen;
    s += `<path d="M ${n(tx)} ${n(ty)} C ${n(tx + dir * 2)} ${n(cy + tailLen * 0.5)} ${n(tipX - dir * 3)} ${n(tipY - 6)} ${n(tipX)} ${n(tipY)} ` +
      `L ${n(tipX - dir * 4)} ${n(tipY - 4)}" fill="none" stroke="${NAVY}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  // the knot: a small soft rounded rectangle in the middle.
  s += `<rect x="${n(cx - knot)}" y="${n(cy - knot)}" width="${n(knot * 2)}" height="${n(knot * 2)}" rx="${n(knot * 0.5)}" ` +
    `fill="#fff" stroke="${NAVY}" stroke-width="1.5"/>`;
  return s + `</g>`;
}

// a ribbon/bow drawn on the figure where the spec's tie sits. TiePlacement:
// 1 backWaist, 2 backWaistBow, 3 frontNeckBow, 4 tieBack, 5 cuffTies,
// 6 frontWaistTie, 7 wrapFront, 8 frontWaistBow.
function bowsOnFigure(spec, half) {
  const t = spec.tie || 0;
  if (!t) return '';
  const empire = spec.waistline === 'empire';
  const waistY = empire ? half.bodiceWaistY : F.waistY;
  switch (t) {
    case 3: {                                          // front neck bow (pussy-bow)
      const cy = F.neckBaseY + half.neck.depth + 6;
      return bow(0, cy, 15);
    }
    case 2:                                            // back-waist bow (seen from back-ish, draw centered at waist)
    case 4:                                            // tie-back (bow at center back waist)
    case 8:                                            // front waist bow
    case 6:                                            // front waist tie
    case 1:                                            // back waist
      return bow(0, waistY, 17);
    case 7: {                                          // wrap front: bow at the side waist
      return bow(half.hh * 0.35, waistY, 14);
    }
    case 5: {                                          // cuff ties: little bows at each wrist
      let s = '';
      for (const dir of [-1, 1]) s += bow(dir * (F.waistX + 16), F.wristY - 6, 9);
      return s;
    }
    default:
      return bow(0, waistY, 16);
  }
}

// pockets on the figure. Patch pocket = a cute rounded pocket square on the front
// hip; side-seam pocket = a short hint line tucked into the hip side seam.
function pocketsOnFigure(spec, half) {
  const ps = spec.pocketStyle || 0;
  if (!ps) return '';
  const isDress = spec.garment === 'dress';
  const py = isDress ? F.hipY + 14 : F.hipY - 6;
  let s = '';
  if (ps === 1) {                                      // patch pocket (draw a pair)
    const w = 20, h = 24, offX = F.hipX * 0.5;
    for (const dir of [-1, 1]) {
      const x = dir * offX - w / 2;
      // rounded-bottom pocket with a top hem line.
      s += `<path d="M ${n(x)} ${n(py)} L ${n(x + w)} ${n(py)} L ${n(x + w)} ${n(py + h * 0.6)} ` +
        `Q ${n(x + w)} ${n(py + h)} ${n(x + w / 2)} ${n(py + h)} ` +
        `Q ${n(x)} ${n(py + h)} ${n(x)} ${n(py + h * 0.6)} Z" ` +
        `fill="none" stroke="${NAVY}" stroke-width="1.3" stroke-linejoin="round"/>`;
      s += `<line x1="${n(x + 2)}" y1="${n(py + 5)}" x2="${n(x + w - 2)}" y2="${n(py + 5)}" stroke="${SEAM}" stroke-width="1"/>`;
    }
    return s;
  }
  // side-seam pocket: a short curved opening line at each hip side seam.
  for (const dir of [-1, 1]) {
    const x = dir * (half.hh - 2);
    s += `<path d="M ${n(x)} ${n(py - 8)} C ${n(x - dir * 8)} ${n(py + 2)} ${n(x - dir * 8)} ${n(py + 14)} ${n(x)} ${n(py + 22)}" ` +
      `fill="none" stroke="${SEAM}" stroke-width="1.2" stroke-linecap="round"/>`;
  }
  return s;
}

// a scalloped / wavy ruffle edge from (x0,y0) to (x1,y1) drawn as little bumps —
// used for ruffled straps, hem ruffles, off-shoulder frills.
function ruffleEdge(x0, y0, x1, y1, bumps = 5, amp = 5) {
  const dx = (x1 - x0) / bumps, dy = (y1 - y0) / bumps;
  // perpendicular direction for the bump to bulge outward (downward-ish).
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const nx = (y1 - y0) / len, ny = -(x1 - x0) / len;   // normal
  let d = `M ${n(x0)} ${n(y0)} `;
  for (let i = 0; i < bumps; i++) {
    const sx = x0 + dx * i, sy = y0 + dy * i;
    const ex = x0 + dx * (i + 1), ey = y0 + dy * (i + 1);
    const mx = (sx + ex) / 2 + nx * amp, my = (sy + ey) / 2 + ny * amp;
    d += `Q ${n(mx)} ${n(my)} ${n(ex)} ${n(ey)} `;
  }
  return `<path d="${d}" fill="none" stroke="${NAVY}" stroke-width="1.4" stroke-linejoin="round"/>`;
}

// ruffled shoulder straps: replace the plain shoulder line with a cute frilled
// strap running from the neckline point up over each shoulder, drawn wavy.
function ruffledStrapsOnFigure(spec, half) {
  if (!(spec.ruffledStraps && spec.ruffledStraps > 0)) return '';
  const nHalf = half.neck.half;
  const shoulderX = F.shoulderX - 8, shoulderY = F.shoulderY;
  const innerX = nHalf, innerY = F.neckBaseY + half.neck.depth * 0.3;
  let s = '';
  for (const dir of [-1, 1]) {
    // a strap band with a ruffle running along its outer edge.
    s += ruffleEdge(dir * innerX, innerY, dir * shoulderX, shoulderY, 4, dir === 1 ? -6 : 6);
    // inner clean band line so it reads as a strap, not a loose frill.
    s += `<path d="M ${n(dir * (innerX + 4))} ${n(innerY + 6)} L ${n(dir * (shoulderX - 2))} ${n(shoulderY + 5)}" ` +
      `fill="none" stroke="${SEAM}" stroke-width="1"/>`;
  }
  return s;
}

// a hem ruffle: a wavy scalloped flounce along the garment hem.
function hemRuffleOnFigure(spec, half) {
  if (!(spec.hemRuffle && spec.hemRuffle > 0)) return '';
  const hy = half.hy, hh = half.hh;
  // draw the wavy edge across the full hem (left tip -> center -> right tip).
  return ruffleEdge(-hh, hy + 2, 0, hy + 8, 4, 6) + ruffleEdge(0, hy + 8, hh, hy + 2, 4, 6);
}

// off-shoulder / bardot frill: a soft ruffled band across the chest for a wide
// off-shoulder neckline, drawn as a wavy flounce sitting off both shoulders.
function offShoulderFrillOnFigure(spec, half) {
  if ((spec.neckline || '') !== 'offShoulder') return '';
  const nHalf = half.neck.half;
  const cy = F.neckBaseY + half.neck.depth;
  return ruffleEdge(-nHalf, cy, 0, cy + 4, 4, 5) + ruffleEdge(0, cy + 4, nHalf, cy, 4, 5);
}

// ---------------------------------------------------------------------------
// public: the garment illustrated on the croquis, one figure.
// ---------------------------------------------------------------------------
export function renderOnFigure(spec = {}) {
  const half = garmentHalf(spec);
  const outline =
    `<path d="${fullOutlinePath(half)}" fill="#fbfcfe" stroke="${NAVY}" ` +
    `stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  const sleeves = sleeveOnFigure(spec);
  // structural interior first, then the cute surface details on top so a bow,
  // button, pocket or ruffle always reads clearly over seams and gathers.
  const details = interiorOnFigure(spec, half)
    + ruffledStrapsOnFigure(spec, half)
    + hemRuffleOnFigure(spec, half)
    + offShoulderFrillOnFigure(spec, half)
    + pocketsOnFigure(spec, half)
    + collarOnFigure(spec, half)
    + bowsOnFigure(spec, half);

  // z-order: figure first (behind), then garment over it.
  const inner = croquis() + outline + sleeves + details;

  // frame: whole figure height + a little, width to the widest of hem / shoulder / hip.
  const maxX = Math.max(half.hh, F.shoulderX + 4, F.hipX, 34) + 24;
  const top = -14, bottom = F.ankleY + 20;
  const w = maxX * 2;
  const h = bottom - top;
  const body = `<g transform="translate(${n(w / 2)} ${n(-top)})">${inner}</g>`;
  return svgDoc(w, h, body);
}
