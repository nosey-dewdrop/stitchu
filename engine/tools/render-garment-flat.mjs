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
const SEAM = '#5c7aa0';   // interior seam / dart / detail lines

// F2 çizgi hiyerarşisi (Damla kalemi, gusto-corpus line_hierarchy 3 katman):
// gövde konturu KALIN, konstrüksiyon dikişi (prenses seam / dart / empire seam)
// ORTA — konturdan ince ama işaretten kalın, "bu bir dikiş çizgisi" okunur;
// yardımcı işaret (grainline dash, buton, gather tick) İNCE. Eşit ağırlık =
// vektör-şema hissi (MIHENK-01 reddi: "dikiş çizgisi kontur ile aynı ağırlıkta").
const W_OUTLINE = 2.0;    // dış siluet
const W_SEAM = 1.4;       // konstrüksiyon dikişi (orta katman — eksikti)
const W_MARK = 1.0;       // yardımcı işaret

const svgDoc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" ` +
  `width="100%" role="img"><rect width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#fff"/>${inner}</svg>`;

const n = (v) => (Math.round(v * 10) / 10).toFixed(1);

// ---------------------------------------------------------------------------
// PORT: Damla kalem dili — REFERANS KALEM'den (engine/flat-engine/_engine-full.mjs)
// alınan taper mürekkep + deterministik drape planı. Şematik düz çizgi yerine
// el-çizimi karakteri: kıvrımlar taper'la kalınlaşıp incelir, drape planı ana
// sırt (köşeye giden) + sönen ikincil kıvrımları asimetrik dağıtır.
// ---------------------------------------------------------------------------
// deterministik gürültü (aynı seed = aynı çizim; MIHENK-01 randomluk dersi)
function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// cubic bezier noktası
function cubicPt(s, t) {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * s[0] + b * s[2] + c * s[4] + d * s[6], a * s[1] + b * s[3] + c * s[5] + d * s[7]];
}
function samplePts(p0, c1, c2, p1, m) {
  const s = [p0[0], p0[1], c1[0], c1[1], c2[0], c2[1], p1[0], p1[1]], out = [];
  for (let i = 0; i <= m; i++) out.push(cubicPt(s, i / m));
  return out;
}
// TAPER: bir nokta dizisini, ortası kalın uçları sivri kapalı bir mürekkep
// şeridine çevirir (REFERANS KALEM'deki taper ile aynı matematik). bias eğrisi
// kalınlığın nasıl doğup söndüğünü ayarlar.
function taperInk(pts, maxw, bias, color) {
  const L = pts.length, a = [], b = [];
  for (let i = 0; i < L; i++) {
    const t = L > 1 ? i / (L - 1) : 0.5;
    const q = pts[Math.min(i + 1, L - 1)], r = pts[Math.max(i - 1, 0)];
    const dx = q[0] - r[0], dy = q[1] - r[1], d = Math.hypot(dx, dy) || 1;
    const w = maxw * 0.5 * Math.pow(Math.sin(Math.PI * Math.min(Math.max(t, 0.002), 0.998)), bias || 0.5);
    a.push([pts[i][0] - dy / d * w, pts[i][1] + dx / d * w]);
    b.push([pts[i][0] + dy / d * w, pts[i][1] - dx / d * w]);
  }
  let s = `M ${n(a[0][0])} ${n(a[0][1])}`;
  for (let i = 1; i < L; i++) s += ` L ${n(a[i][0])} ${n(a[i][1])}`;
  for (let i = L - 1; i >= 0; i--) s += ` L ${n(b[i][0])} ${n(b[i][1])}`;
  return `<path d="${s} Z" fill="${color || NAVY}" stroke="none"/>`;
}
// DRAPE PLANI: n kıvrım, ana sırt (köşeye giden, prim) + sönen ikincil.
// REFERANS KALEM drapePlan mantığı: ink rejimi kıvrım sayısını verir, deterministik
// jitter yerlerini dağıtır, orta ön temiz kalır.
function drapePlan(seed, ink, foldCount, drape) {
  const rnd = rng(seed);
  const cnt = ink === 'minimal' ? 2 : ink === 'orta' ? 3 : Math.max(2, Math.round((foldCount || 10) / 2));
  const R = [], CORE = 0.20;
  for (let i = 0; i < cnt; i++) {
    const prim = i % 2 === 0, base = (i + 0.65) / (cnt + 0.25);
    const u = Math.min(0.96, Math.max(0.04, base + (rnd() - 0.5) * 0.8 / cnt));
    R.push({ u: CORE + (1 - CORE) * u, prim,
      swing: prim ? 0.55 + rnd() * 0.45 : 0.15 + rnd() * 0.30,
      birth: prim ? rnd() * 0.05 : (0.14 + rnd() * 0.30) * (drape || 1),
      die: prim ? 1 : 0.40 + rnd() * 0.35,
      sway: (rnd() - 0.5) * 0.45 });
  }
  R.sort((a, b) => a.u - b.u);
  R[R.length - 1].prim = true; R[0].prim = false; // orta ön temiz
  if (ink === 'minimal') R.forEach((r) => { r.prim = true; });
  return R;
}

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

  // Bust apex (göğüs noktası): the anatomical landmark a princess seam passes
  // THROUGH. Height between shoulder and waist (bustHeight 0..1, default 0.42 of
  // the shoulder->waist span, flat-engine styles.json bustHeight~0.3-0.4); half-x
  // sits between neck and chest edge (~0.55 of chest half). A real princess seam
  // runs armhole -> apex -> waist as an S; without the apex it reads as a random
  // bracket bulge (MIHENK-01 taste-lexicon "parantez çizgi").
  const bustFrac = typeof spec.bustHeight === 'number' ? (0.30 + spec.bustHeight * 0.30) : 0.42;
  const apexY = waistY * bustFrac;
  const apexHalfX = U.chestW * 0.55;

  return {
    isDress, empire, waistY, hemY, hemHalf, neck, hasSleeve, apexY, apexHalfX,
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
  const puff = spec.sleeveCap === 2;
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
      s += `<line x1="${n(gx)}" y1="${n(shoulderTipY - 2)}" x2="${n(gx)}" y2="${n(shoulderTipY + 9)}" stroke="${SEAM}" stroke-width="${W_MARK}"/>`;
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
      `stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-dasharray="7 4"/>`;
  }

  if (spec.shaping === 'princess') {
    // Anatomik prenses dikişi: armhole/shoulder → BUST APEX → waist (→ hem on a
    // dress). The seam passes THROUGH the apex as an S-curve that follows the body
    // — over the bust it bows outward to the apex, then draws in to the waist nip,
    // then eases back out toward the hip. NOT a single random outward bracket
    // (MIHENK-01: apex'i geçmeyen bombeli quadratic yanlıştı). Two cubics joined
    // at the apex give the S. Front passes the true apex; back has no bust so its
    // apex flattens toward the shoulder-blade line.
    // Classic bodice princess line: starts at the ARMHOLE (over the chest edge,
    // near the underarm), NOT at the neck — a neck-start reads as a wrong V. Runs
    // down over the bust apex, in to the waist nip, out to the hip/hem.
    const apexY = isBack ? g.apexY * 0.78 : g.apexY;
    const apexBow = isBack ? 0.46 : 0.62;   // back princess is a straighter blade seam
    for (const dir of [-1, 1]) {
      const xTop = dir * g.chestW * 0.80;             // armhole origin (over the chest, near the underarm)
      const yTop = 30;                                // just below the armhole notch
      const xApex = dir * g.apexHalfX * apexBow;      // eases to the apex over the bust
      const xWaist = dir * g.waistW * 0.46;           // draws in at the waist nip
      const xBot = dir * (g.isDress ? g.hemHalf * 0.44 : g.waistW * 0.52);
      const yBot = g.isDress ? g.hemY : g.hemY - 6;
      // cubic 1: armhole -> apex (gentle inward ease, no bulge)
      let d = `M ${n(xTop)} ${n(yTop)} C ${n(xTop - (xTop - xApex) * 0.25)} ${n(yTop + (apexY - yTop) * 0.55)} ` +
        `${n(xApex)} ${n(apexY - 18)} ${n(xApex)} ${n(apexY)} `;
      // cubic 2: apex -> waist nip (draw in, following the body)
      d += `C ${n(xApex)} ${n(apexY + (waistY - apexY) * 0.55)} ${n(xWaist)} ${n(waistY - 12)} ${n(xWaist)} ${n(waistY)} `;
      // cubic 3: waist -> hip/hem (ease back out)
      if (g.isDress) d += `C ${n(xWaist)} ${n(waistY + (yBot - waistY) * 0.35)} ${n(xBot)} ${n(waistY + (yBot - waistY) * 0.62)} ${n(xBot)} ${n(yBot)} `;
      else d += `L ${n(xBot)} ${n(yBot)} `;
      s += `<path d="${d}" fill="none" stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  } else if (!isBack) {
    // front bust/waist darts: short tapered lines from the waist up toward the bust
    // apex (a real dart points AT the apex, not at a guessed height).
    for (const dir of [-1, 1]) {
      const x = dir * g.waistW * 0.5;
      s += `<path d="M ${n(x)} ${n(bodyBottom * 0.99)} L ${n(dir * g.apexHalfX * 0.5)} ${n(g.apexY + 6)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-linecap="round"/>`;
    }
  }

  // button row / placket (front only)
  const hasPlacket = spec.frontPlacket || (spec.placketStyle && spec.placketStyle > 0);
  if (hasPlacket && !isBack) {
    const top = g.neck.depth + 6;
    const bot = (g.isDress ? g.hemY : g.hemY) * 0.94;
    s += `<line x1="0" y1="${n(g.neck.depth)}" x2="0" y2="${n(bot + 8)}" stroke="${SEAM}" stroke-width="${W_SEAM}"/>`;
    const nb = 6;
    for (let i = 0; i < nb; i++) {
      const y = top + (bot - top) * i / (nb - 1);
      s += `<circle cx="0" cy="${n(y)}" r="3.4" fill="none" stroke="${NAVY}" stroke-width="${W_MARK}"/>`;
    }
  }

  // PORT: BÜZGÜ PANOSU (REFERANS KALEM shirr dili). Düz paralel çizgi yerine
  // dalgalı taper büzgü sıraları — panonun toplanan dokusu. drawstring için
  // ayrıca casing (kanal) çizgisi. Referans kalemdeki dalgalı taper karakteri.
  if (spec.gatherType) {
    const zoneY = spec.gatherZone === 1 ? 60 : spec.gatherZone === 2 ? waistY - 6 : g.neck.depth + 14;
    const halfW = g.chestW * 0.9;
    const gseed = (isBack ? 71 : 23) + Math.round(halfW) * 3 + Math.round(zoneY);
    const grnd = rng(gseed);
    // panonun dikey kapsamı: casing/üst kenardan empire seam'e kadar birkaç sıra
    const rowTop = spec.gatherType === 1 ? zoneY : Math.max(g.neck.depth + 16, zoneY - 24);
    const rowBot = spec.gatherType === 1 ? zoneY + 16 : Math.min((g.isDress ? waistY : g.hemY * 0.5) - 6, zoneY + 22);
    const rows = spec.gatherType === 1 ? 2 : 4;
    if (spec.gatherType === 1) {                 // drawstring: iki casing çizgisi + fiyonk deliği
      for (const off of [0, 10]) {
        s += `<line x1="${n(-halfW)}" y1="${n(zoneY + off)}" x2="${n(halfW)}" y2="${n(zoneY + off)}" stroke="${SEAM}" stroke-width="${W_SEAM}"/>`;
      }
    }
    // dalgalı taper büzgü sıraları (drawstring casing altında, shirred tüm panoda)
    for (let i = 0; i < rows; i++) {
      const ry = rows > 1 ? rowTop + (rowBot - rowTop) * (i / (rows - 1)) : rowTop;
      const bumps = Math.max(4, Math.round(5 + (grnd() - 0.5) * 2));
      const amp = 0.9 + grnd() * 0.9, ph = grnd() * Math.PI, pts = [];
      for (let b = 0; b <= bumps * 2; b++) {
        const u = b / (bumps * 2);
        pts.push([-halfW + (2 * halfW) * u, ry + Math.sin(ph + u * bumps * Math.PI) * amp]);
      }
      s += taperInk(pts, 1.3, 0.35, SEAM);
    }
  }

  // back-view specifics: center-back zip, back ties, open-back cutout
  if (isBack) {
    if (spec.closure && /zip/i.test(spec.closure)) {
      s += `<line x1="0" y1="${n(g.neck.depth + 4)}" x2="0" y2="${n(g.isDress ? waistY + 40 : g.hemY * 0.8)}" ` +
        `stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-dasharray="2 3"/>`;
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
        `fill="none" stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-dasharray="4 3"/>`;
    }
  }

  // -------------------------------------------------------------------------
  // PORT: DRAPE MÜREKKEBİ (REFERANS KALEM dili). Boş etek yerine el-çizimi
  // kıvrımlar — ana sırt (skirtBottom'a inen, taper kalın) + sönen ikincil
  // (yarı yolda biter, ince). Gathered/full etekte yoğun, düz etekte az.
  // Şematik boş etek MIHENK-01 "vektör-şema" hissinin yarısıydı.
  // -------------------------------------------------------------------------
  {
    const skirtTop = g.isDress ? waistY : (g.hemY - (g.hemY - waistY) * 0.5);
    const skirtBot = g.hemY;
    const topHalf = g.isDress ? g.waistW * 1.0 : g.chestW * 0.9;
    const botHalf = g.hemHalf;
    const st = spec.skirtStyle || (g.isDress ? 'aLine' : 'shift');
    const full = st === 'gathered' || st === 'full' || st === 'circle';
    const ink = full ? 'orta' : (spec.ink || 'minimal');
    if (skirtBot - skirtTop > 30) {                 // sadece görünür bir etek varsa
      // ASİMETRİ (taste-lexicon "yelpaze" düzeltmesi): sol ve sağ AYRI drapePlan
      // (ayrı seed) alır — fabric folds ayna simetrik bir yelpaze değil, iki yön
      // farklı boy/eğim/yerde düşer, tıpkı gerçek kumaş gibi.
      const baseSeed = (isBack ? 977 : 131) + Math.round(botHalf) * 7 + Math.round(g.hemY);
      const planByDir = {
        '-1': drapePlan(baseSeed, ink, spec.foldCount, spec.drape),
        '1': drapePlan(baseSeed * 3 + 61, ink, spec.foldCount, spec.drape),
      };
      for (const dir of [-1, 1]) {
        for (const r of planByDir[dir]) {
          // başlangıç: etek üstünde, orta ile yan arası u konumunda
          const su = 0.14 + r.u * 0.5;
          const ax = dir * topHalf * su;
          const ay = skirtTop + 4 + r.birth * (skirtBot - skirtTop) * 0.55;
          // bitiş: prim ise ete kadar dışa savrulur, ikincil yarı yolda söner
          const endU = r.prim ? (0.55 + r.u * 0.4) : r.u * 0.85;
          const bx = dir * botHalf * endU;
          const by = r.prim ? skirtBot - 3 : skirtTop + (skirtBot - skirtTop) * r.die;
          const h = by - ay;
          const c1 = [ax + (bx - ax) * (r.prim ? 0.10 : 0.18), ay + h * 0.40];
          const c2 = [bx - (bx - ax) * 0.10, by - h * (r.prim ? 0.46 : 0.58)];
          const line = samplePts([ax, ay], c1, c2, [bx, by], 14);
          if (ink === 'minimal') {
            // kısa izler: büzgü altında + ete yakın (referans kalem minimal reji)
            s += taperInk(line.slice(0, 4), 1.3, 0.55, SEAM);
            s += taperInk(line.slice(9), 1.5, 0.5, SEAM);
          } else {
            s += taperInk(line, r.prim ? 1.8 : 0.95, r.prim ? 0.34 : 0.62, SEAM);
          }
        }
      }
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
  if (g.hasSleeve) maxX = Math.max(maxX, g.shoulderW + (spec.sleeveCap === 2 ? 62 : 48));
  const pad = 20;
  const w = (maxX + pad) * 2;
  const h = bottom + pad;
  // shift so x=0 maps to w/2, y starts at pad
  const inner = `<g transform="translate(${n(w / 2)} ${pad})">${outline}${sleeves}${details}</g>`;
  return { inner, w, h };
}

// ---------------------------------------------------------------------------
// REFERANS KALEM KÖPRÜSÜ (Damla mimari kararı 2026-07-19): strapless / band-top
// stiller (babydoll ailesi) için üretim renderer'ın kendi bluz-gövde yolu YANLIŞ
// form üretiyordu (MIHENK-03: çadır + boynuz). Bu formlar için ÜRETİM, REFERANS
// KALEM motorunu doğrudan ÇAĞIRIR — form birebir referans, kopya yok, tek hakikat
// (referans salt-okunur cetvel kalır). spec bir referans stiline eşlenir; eşleşme
// yoksa üretim kendi flat yolunu kullanır (prenses, shift, vb).
// ---------------------------------------------------------------------------
async function tryReferencePen(spec) {
  // Bu spec bir band-top/strapless babydoll mı? İşaretler: strapless neckline,
  // band top, ya da açıkça referenceStyle verilmiş.
  const wantsBand =
    spec.referenceStyle ||
    spec.top === 'band' ||
    spec.neckline === 'strapless' ||
    spec.style === 'drawstring_babydoll' ||
    spec.style === 'lace_vneck_70s' ||
    spec.style === 'peterpan_puff' ||
    spec.style === 'courtney_lace_vneck';
  if (!wantsBand) return null;
  const styleKey = spec.referenceStyle || spec.style || 'drawstring_babydoll';
  try {
    const ref = await import('../flat-engine/_engine-full.mjs');
    if (!ref.STYLE[styleKey]) return null;
    // shared parametreleri spec'ten geçir (beden/boy/etek/düşüş korunur)
    const overrides = {};
    for (const k of ['size', 'length', 'skirtFull', 'ink', 'foldCount', 'hemWave', 'drape', 'hemDip', 'seed', 'bustProject', 'bustHeight', 'waistNip']) {
      if (spec[k] != null) overrides[k] = spec[k];
    }
    return ref.renderStyle(styleKey, overrides);
  } catch {
    return null;
  }
}

// public: assembled FRONT + BACK finished-garment flat, spec-driven.
// `pieces` is unused for the outline (kept for signature compatibility).
// Band-top strapless styles route to the reference pen (async); everything else
// draws through the production flat path (sync). renderGarmentFlat stays sync for
// callers; use renderGarmentFlatAsync to get the reference-pen routing.
export async function renderGarmentFlatAsync(pieces, spec = {}) {
  const ref = await tryReferencePen(spec);
  if (ref) return ref;
  return renderGarmentFlat(pieces, spec);
}

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
