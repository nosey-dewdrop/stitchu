// THE TECHNICAL FLAT, DRAWN FROM THE PATTERN THE SHOPPER ACTUALLY TAKES HOME.
//
// ===========================================================================
// WHY THIS FILE EXISTS — THE FLAT WAS WIRED TO THE WRONG ENGINE
// ===========================================================================
// This repo has two geometry lines and they are not siblings of equal rank:
//
//   draftJSON  (engine/src/garment.cpp)  — draws the PATTERN. 25 specs, 25
//        distinct drafts, 48 ms total. Its output already carries, in mm:
//        the front and back armhole as NAMED edges (`edgeRoles`), the sleeve
//        cap and both underarm seams as NAMED edges, the darts as `markings`,
//        the balance points as `notches`, the collar as its own piece.
//
//   flatJSON   (engine/src/seamplan.cpp) — projects a 3D SURFACE. It includes
//        neither sleeve.hpp nor collar.hpp nor shoulder.hpp: at the level of
//        its own types there is no such thing as a sleeve, a collar or a dart.
//        Its surface is a (h, phi) tube with zero shoulder seams. 24 specs
//        collapsed to 7 silhouettes and 4 paths, at 7.5-30.9 SECONDS a call.
//
// The technical drawing was being projected off the SECOND one. That is the
// whole of the "it downloads a log, not a garment" complaint: the drawing was
// not made from the thing that was drafted, so it could not show anything the
// draft knows. No new geometry is invented here — the armhole curve, the cap,
// the neckline and the darts are already solved, in millimetres, in 18 ms. What
// was missing was somebody to draw them.
//
// The 3D surface line is NOT deleted. It stays in the tree as research and as
// cross-validation (surfacepattern / flatten / shellprojection, and their
// gates). It is off the shipped drawing path, which is a different sentence.
//
// ===========================================================================
// WHAT A FLAT IS, GEOMETRICALLY, AND WHY THE PANEL'S OWN x IS ALREADY RIGHT
// ===========================================================================
// A technical flat draws the garment LAID FLAT. Laid flat, the front of a torso
// garment is half its circumference wide, so the half-width measured from the
// centre front is a QUARTER of the girth. A drafted front panel runs from the
// centre front to the side seam and is exactly that quarter. So the panel's own
// x is the drawing's x: no projection factor, no fudge, and the number the
// drawing prints is the number the pattern was cut to. This is the property the
// surface line could never have, because it was a different object.
//
// Four things are constructed rather than copied, and each is named where it
// happens: closing the darts (the sewn waist is narrower than the flat panel),
// posing the top edge (shoulder/neck/armhole to the convention bands —
// poseBodice, FLAT-ESTETIK), hanging the sleeve (lengths from the pattern,
// angle seeded by the pattern and clamped to the 20-40 degree convention
// band), and bending the collar onto the neckline.
//
// ===========================================================================
// THE FLAT LAW STILL BINDS (contract/flat-convention-v1.json)
// ===========================================================================
// One ink, hierarchy by WEIGHT and not by colour, zero fill, front AND back, a
// declared scale. The three constants below mirror the law on disk and the
// trailing `// contract <file> <path>` comment is machine-read by
// engine/tests/flat_mirror_check.mjs every run: a mirror with no gate on it is
// a second truth. They cannot be read off disk here because this module ships
// to the browser.
const INK = '#1f3a5f';   // contract/flat-convention-v1.json ink.color
const W_OUTLINE = 2.0;   // contract/flat-convention-v1.json lineClasses.classes.outline.width
const W_SEAM = 1.0;      // contract/flat-convention-v1.json lineClasses.classes.seam.width

// ===========================================================================
// THE FLAT POSE CONVENTION (contract/flat-convention-v1.json sevkPoz)
// ===========================================================================
// FLAT-ESTETIK (2026-09-02). Damla looked at the shipped flats and said "cok
// cirkin", and she was right about all three named faults: the sleeves opened
// up and out like wings, the shoulder ran as one long diagonal from the neck to
// the sleeve tip, and the neckline proportions were the panel's, not a flat's.
// The industry convention is not taste, it is a definition: a technical flat is
// the garment LAID FLAT ON A TABLE. Laid flat, the sleeve hangs from the
// shoulder tip DOWN and out (never above the shoulder horizontal), the shoulder
// is a SHORT line a few degrees off horizontal, and the armhole is a concave
// curve from the shoulder tip into the underarm, with the sleeve behind it.
//
// WHAT STAYS THE PATTERN'S AND WHAT BECOMES CONVENTION — the line is exact:
// every LENGTH and WIDTH (chest, waist, hip, sleeve length, cuff width, hem)
// is still read off the drafted pattern in millimetres; the convention sets
// only the POSE (angles) and the PROPORTION BANDS (shoulder/chest, neck
// width/shoulder, neck depth/width). Where the drafted value already sits in
// the band it passes through untouched; where it does not, it is clamped to
// the band's edge and the applied value is PUBLISHED on the path as data-*
// attributes, so the gate (engine/tests/cizim_giysi_mi.mjs, section j) can
// judge the drawing without re-deriving anything. The neck DEPTH keeps its
// style: only the floor is conventional, a drafted scoop or V stays deeper.
const KOL_ACI_MIN_DEG = 20;    // contract/flat-convention-v1.json sevkPoz.kolAcisiDeg.min
const KOL_ACI_TABAN_DEG = 30;  // contract/flat-convention-v1.json sevkPoz.kolAcisiDeg.taban
const KOL_ACI_MAX_DEG = 40;    // contract/flat-convention-v1.json sevkPoz.kolAcisiDeg.max
const OMUZ_EGIM_MIN_DEG = 15;  // contract/flat-convention-v1.json sevkPoz.omuzEgimiDeg.min
const OMUZ_EGIM_MAX_DEG = 22;  // contract/flat-convention-v1.json sevkPoz.omuzEgimiDeg.max
const OMUZ_ORAN_MIN = 0.85;    // contract/flat-convention-v1.json sevkPoz.omuzGogusOran.min
const OMUZ_ORAN_MAX = 0.90;    // contract/flat-convention-v1.json sevkPoz.omuzGogusOran.max
const YAKA_GEN_MIN = 0.36;     // contract/flat-convention-v1.json sevkPoz.yaka.genislikOverOmuz.min
const YAKA_GEN_MAX = 0.42;     // contract/flat-convention-v1.json sevkPoz.yaka.genislikOverOmuz.max
const YAKA_DER_MIN = 0.42;     // contract/flat-convention-v1.json sevkPoz.yaka.onDerinlikOverGenislik.min
const ARKA_YAKA_MIN = 0.20;    // contract/flat-convention-v1.json sevkPoz.yaka.arkaDususOverOn.min
const ARKA_YAKA_MAX = 0.30;    // contract/flat-convention-v1.json sevkPoz.yaka.arkaDususOverOn.max
const W_TOPSTITCH = 0.5;       // contract/flat-convention-v1.json sevkPoz.topstitch.width
const DASH_TOPSTITCH = '4 2';  // contract/flat-convention-v1.json sevkPoz.topstitch.dash
const YAKA_CF_ACIKLIK = 0.35;  // contract/flat-convention-v1.json sevkPoz.yakaParcasi.gomlekCFAciklikOverDerinlik
const YAKA_STAND_GORUNUR = 0.5;// contract/flat-convention-v1.json sevkPoz.yakaParcasi.standGorunurOverDerinlik

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ===========================================================================
// THE MANNEQUIN TRANSFORM (F6-konvansiyon) — flat 38 is NOT pattern 38
// ===========================================================================
// The pattern is drafted on the REAL body chart and stays sewable; the flat is
// the same garment drawn on the IDEAL figure every vendor flat implies. That
// figure was MEASURED, not invented: five reference flats were chosen
// (KOSU/ciktilar/flat-secim.md), their waist/bust half-width ratio read off the
// pixels (KOSU/flat-olcum.py -> flat-olcum.json), and the result was the
// OPPOSITE of the wasp-waist guess — the references sit at 0.858 where our
// dart-closed drawing sat at 0.806. So the transform OPENS the waist. Bust and
// hip stay on the human chart: the references' bust was only measurable on the
// two sleeveless anchors and their hip on none (every candidate flares below
// the waist), and the most constraining value for an unmeasured axis is zero.
//
// It is ONE transform, multiplicative in x, ramped in y (a tent: 0 at the bust
// line, full at the waist, 0 again at hip depth), and it is INVERTIBLE from the
// file alone: the multiplier is m(y) = 1 + d(y)/Wbel with Wbel PUBLISHED on the
// silhouette path (data-manken-bel-yarim-mm), so every gate can undo it and
// judge the pre-transform drawing against the pattern at full 0.1 mm strength.
// The sleeve and the collar are NOT warped: both anchor at or above the bust
// line where d = 0, and a sleeve is a tube hanging in front of the body — the
// mannequin's waist is not inside it.
const MANKEN_FARK_CEYREK_MM = 12.7417; // contract/mannequin-chart-v1.json v2.donusum.farkCeyrekMM
const MANKEN_KALCA_DERINLIK_MM = 200;  // contract/mannequin-chart-v1.json v2.donusum.kalcaDerinlikMM

/**
 * Build the warp for one view. `half` is the assembled right-half silhouette
 * (pre-transform), `bustY` the underarm level (null when the garment has no
 * armhole — a skirt), `waistPt` the point where the garment's waist meets its
 * side: a dress's waist-seam side end, a skirt's top-edge side end, a top's
 * side-seam pinch (the drafted waistlineWidth, read back off the sewn seam).
 * Returns { map, ... } or { sebep } when the waist cannot be anchored — a
 * refusal by name, never a silent identity.
 */
function mankenWarp(half, bustY, waistPt) {
  const F = MANKEN_FARK_CEYREK_MM;
  if (!(Math.abs(F) > 0)) return null;
  if (!waistPt) {
    return { sebep: 'manken donusumu: bel noktasi yok (dikilen kenardan bel cikarilamadi) — cizim donussuz basildi, bir sonraki adim: bu sinifa bel noktasi tasit' };
  }
  const pts = samplePoly(half, 6);
  const yTop = Math.min(...pts.map((p) => p[1]));
  const yBot = Math.max(...pts.map((p) => p[1]));
  const waistY = waistPt[1];
  const Wbel = waistPt[0];
  if (!(Wbel > 1)) return { sebep: 'manken donusumu: bel yari-genisligi olculemedi — cizim donussuz basildi' };
  // A garment with no armhole (a skirt) has nothing above its waist to protect:
  // the ramp then starts at the silhouette's own top, which for a skirt IS the
  // waist give or take the edge's slope.
  if (bustY == null) bustY = Math.min(yTop, waistY);
  else if (!(waistY > bustY + 1e-3)) {
    return { sebep: 'manken donusumu: bel hizasi gogus hattinin ustunde cikti — cizim donussuz basildi, bir sonraki adim: bu spec icin bel noktasini kontrol et' };
  }
  const hipY = Math.min(waistY + MANKEN_KALCA_DERINLIK_MM, yBot);
  // A tent with a degenerate top (a skirt: bust level == waist level) is FLAT
  // above the waist — the same rule, at the same 1e-3 threshold, that every
  // reader of the published attributes applies, so forward and inverse agree
  // even after the attributes' 4-decimal rounding.
  const dOf = (y) => {
    if (y >= hipY) return 0;
    if (y <= waistY) {
      if (waistY - bustY <= 1e-3) return F;
      return y <= bustY ? 0 : F * (y - bustY) / (waistY - bustY);
    }
    return F * (hipY - y) / (hipY - waistY);
  };
  const map = (p) => {
    const d = dOf(p[1]);
    return d ? [p[0] * (1 + d / Wbel), p[1]] : p;
  };
  return { map, farkCeyrekMM: F, bustY, waistY, hipY, belYarimMM: Wbel };
}

import {
  EPS, add, sub, scale, norm, unit, lerp, rotAbout,
  segsFromCommands, polysFromCommands, samplePoly, polyLength, chainLength,
  cumFrac, atFrac, nearestIdx, mapSegs, mirrorSegs, rampSegs,
  pathD, polyD, segsFromPoly, bbox, densifySegs,
} from './flat-geom.js?v=143';

// ---------------------------------------------------------------------------
// 1. PANEL DECOMPOSITION — which drafted edge is which garment edge
// ---------------------------------------------------------------------------
// The armhole is not guessed: `edgeRoles` names it, and the engine's own drawing
// code is what put the name there. Everything else follows from the outline's
// TRAVERSAL ORDER, which every drafted panel shares: it starts at the centre
// top, runs out over the top edge, down the outer edge, back along the bottom
// edge, and up the centre. So:
//
//   hem     = the last edge that ENDS at the panel's lowest point
//   centre  = whatever follows the hem (the fold/centre-seam edge, or, on a
//             princess panel, the princess seam)
//   armhole = the edgeRoles range, when there is one
//   neck / shoulder = the edges before the armhole (the last one is the
//             shoulder: on every drafted bodice it is the straight run from the
//             neck point to the shoulder tip)
//   side    = the edges between the armhole (or the top edge) and the hem
//
// A panel with no armhole role (a skirt) has its top edge found by height
// instead: the leading run that stays within 8% of the panel height of the top.
// 8% and not 15% is measured, not taste — at 15% a princess skirt's first
// princess-seam segment (which rises to y=90 on a 652 mm panel) was swallowed
// into the waist.
const TOP_BAND = 0.08;

function decompose(piece) {
  const segs = segsFromCommands(piece.commands);
  if (!segs.length) return null;
  const all = segs.flatMap((s) => s.p);
  const yTop = Math.min(...all.map((p) => p[1]));
  const yBot = Math.max(...all.map((p) => p[1]));
  const H = yBot - yTop || 1;

  let hemIdx = -1;
  for (let k = 0; k < segs.length; k++) if (Math.abs(segs[k].p[3][1] - yBot) < 1.0) hemIdx = k;
  if (hemIdx < 0) return null;

  const centre = segs.slice(hemIdx + 1);
  const hem = [segs[hemIdx]];

  const role = (piece.edgeRoles || []).find((r) => /^armhole_/.test(r.role));
  let neck = [], shoulder = [], armhole = [], side = [], top = [];
  if (role) {
    const a = segs.findIndex((s) => s.i === role.first);
    let b = -1;
    for (let k = 0; k < segs.length; k++) if (segs[k].i === role.last) b = k;
    if (a < 0 || b < a) return null;
    armhole = segs.slice(a, b + 1);
    const before = segs.slice(0, a);
    if (before.length) { shoulder = before.slice(-1); neck = before.slice(0, -1); }
    side = segs.slice(b + 1, hemIdx);
    top = neck;
  } else {
    let t = 0;
    while (t < hemIdx && Math.max(...segs[t].p.map((p) => p[1])) < yTop + TOP_BAND * H) t++;
    top = segs.slice(0, t);
    side = segs.slice(t, hemIdx);
  }
  return { segs, neck, shoulder, armhole, side, hem, centre, top, yTop, yBot,
           xMax: Math.max(...all.map((p) => p[0])) };
}

/**
 * A PRINCESS BODICE OR SKIRT IS TWO PANELS, AND IT HAS TO BE SEWN UP TOO.
 *
 * With only the centre panel drawn, a princess dress came out roughly a third
 * too narrow: the side panel carries the armhole's lower half, the whole side
 * seam and its share of the waist and the hem. So the side panel is placed by
 * the RIGID transform that puts its princess seam onto the centre panel's — the
 * same seam, seen from its two sides — and the composite is handed on as if it
 * had been one panel all along.
 *
 * Rigid, not similarity: the two edges of one seam are not the same length (the
 * pattern eases one onto the other), and stretching one of them to close the gap
 * would make the drawing stop being a measurement. The transform is anchored on
 * the armhole end and the leftover at the waist is PUBLISHED
 * (`data-prenses-kacigi-mm` on the seam), never scaled away.
 *
 * Returns the same shape `decompose` does, so nothing downstream knows or cares
 * whether it is looking at one panel or two.
 */
function composite(cd, sd) {
  const cSeam = cd.side, sSeam = sd.centre;       // one seam, two sides
  if (!cSeam.length || !sSeam.length) return null;
  const A = cSeam[0].p[0];                        // centre side, armhole/waist end
  const W = cSeam[cSeam.length - 1].p[3];         // centre side, hem/waist end
  const a = sSeam[sSeam.length - 1].p[3];         // side panel, same end as A
  const w = sSeam[0].p[0];                        // side panel, same end as W
  const va = sub(W, A), vb = sub(w, a);
  if (norm(va) < 1e-6 || norm(vb) < 1e-6) return null;
  const th = Math.atan2(va[1], va[0]) - Math.atan2(vb[1], vb[0]);
  const T = (q) => add(A, rotAbout(sub(q, a), [0, 0], th));
  const kacik = norm(sub(T(w), W));
  const t = (chain) => mapSegs(chain, T);
  return {
    neck: cd.neck, shoulder: cd.shoulder,
    armhole: cd.armhole.concat(t(sd.armhole)),
    side: t(sd.side),
    hem: t(sd.hem).concat(cd.hem),
    top: cd.top.concat(t(sd.top)),
    centre: cd.centre,
    princess: cSeam, princessKacikMM: kacik,
    yTop: cd.yTop, yBot: Math.max(cd.yBot, sd.yBot), xMax: cd.xMax + sd.xMax,
  };
}

/**
 * The stitch line an edge carries on the finished garment: the edge, offset
 * into the cloth by exactly the seam allowance the piece was drafted with.
 * Every one of the fifteen vendor references draws these — the second line at
 * the neckline, at the hem, at the cuff — and the number is not a style choice,
 * it is `piece.seamAllowance` in millimetres.
 */
function stitchLine(pts, d, awayFrom) {
  if (!(d > 0) || !pts || pts.length < 2) return null;
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let n = unit([-(b[1] - a[1]), b[0] - a[0]]);
    if (n[0] * (pts[i][0] - awayFrom[0]) + n[1] * (pts[i][1] - awayFrom[1]) < 0) n = scale(n, -1);
    out.push(add(pts[i], scale(n, d)));
  }
  return out;
}

/** The short side of a strip-shaped piece (a cuff, a waistband): its depth. */
function stripDepth(piece) {
  if (!piece) return 0;
  const b = bbox(segsFromCommands(piece.commands));
  return Math.min(b.x1 - b.x0, b.y1 - b.y0);
}

/** Darts: a marking subpath with three or more points, i.e. two legs meeting at
 *  an apex. The two-point subpaths are the centre-front cross and the princess
 *  ticks and are not darts; calling them darts would be a lie the gate would
 *  then happily count. */
const dartsOf = (piece) => polysFromCommands(piece.markings || []).filter((p) => p.length >= 3);

// ---------------------------------------------------------------------------
// 2. CLOSING A DART — why the old drawing was a log
// ---------------------------------------------------------------------------
// The EU38 front bodice panel is 244.2 mm at the underarm and 241.2 mm at the
// waist: a 3 mm taper over a whole bodice, i.e. a tube. That is not a drafting
// fault, it is what a flat panel LOOKS like before its dart is sewn — the waist
// dart takes out 50.1 mm and the skirt's takes another 28.2 mm. A drawing that
// copies the panel outline draws the unsewn tube; a drawing of the GARMENT has
// to sew it.
//
// Closing is the real operation and nothing else: rotate the outboard part of
// the waist edge about the dart apex until one leg lies on the other. The angle
// is not chosen, it is the angle between the legs. Whatever the side seam's
// bottom end does under that rotation, the side seam follows (rampSegs).
function closeDart(edgePts, dart, outboardAtStart) {
  const apex = dart[1];
  const legA = dart[0], legB = dart[dart.length - 1];
  let i1 = nearestIdx(edgePts, legA), i2 = nearestIdx(edgePts, legB);
  if (i1 > i2) { const t = i1; i1 = i2; i2 = t; }
  if (i2 - i1 < 1) return null;
  // The outboard side is the one carrying the side seam. On a bodice the waist
  // edge is traversed side -> centre, so that is the head of the polyline; on a
  // skirt it is traversed centre -> side, so it is the tail.
  const th = outboardAtStart
    ? Math.atan2(edgePts[i2][1] - apex[1], edgePts[i2][0] - apex[0]) -
      Math.atan2(edgePts[i1][1] - apex[1], edgePts[i1][0] - apex[0])
    : Math.atan2(edgePts[i1][1] - apex[1], edgePts[i1][0] - apex[0]) -
      Math.atan2(edgePts[i2][1] - apex[1], edgePts[i2][0] - apex[0]);
  if (!isFinite(th)) return null;
  let pts, moved, before;
  let mouth;
  if (outboardAtStart) {
    before = edgePts[0];
    const head = edgePts.slice(0, i1 + 1).map((p) => rotAbout(p, apex, th));
    pts = head.concat(edgePts.slice(i2 + 1));
    moved = head[0];
    mouth = head[head.length - 1];
  } else {
    before = edgePts[edgePts.length - 1];
    const tail = edgePts.slice(i2).map((p) => rotAbout(p, apex, th));
    pts = edgePts.slice(0, i1 + 1).concat(tail);
    moved = tail[tail.length - 1];
    mouth = tail[0];
  }
  // `fold` is the dart AS SEWN: both legs land on one point, so what is left on
  // the garment is a single stitch line from the seam to the apex. Drawing the
  // open V would draw 50 mm of cloth that has been folded away.
  return { pts, fold: [mouth, apex], delta: sub(moved, before),
           takeupMM: norm(sub(edgePts[i1], edgePts[i2])), angle: th };
}

/**
 * A panel, sewn: its hem edge with every dart on it closed, its side seam
 * carried along, and the dart legs kept as lines to DRAW (a sewn dart is still
 * a visible stitch line on a technical flat — see any of the fifteen vendor
 * references in GIRDI/iyi-flat/adaylar).
 */
// `edge`     the seam the darts sit on, as drafted (a bodice's waist, a skirt's
//            waist). It is traversed in the panel's own outline order.
// `sideSegs` the side seam, traversed from the panel's top towards its hem.
// `outboardAtStart` true when `edge` is traversed side-seam-first (a bodice
//            waist runs side -> centre; a skirt waist runs centre -> side).
// The side seam's MOVING end is whichever end touches `edge`: the bodice's is
// its last point, the skirt's is its first — hence atStart = !outboardAtStart.
function sewPanel(piece, edge, sideSegs, outboardAtStart) {
  const base = samplePoly(edge, 40);
  // ⛔ ORDER MATTERS AND IT WAS WRONG. An A-line skirt panel carries TWO waist
  // darts. Closing the inner one first rotates the whole outboard run of the
  // edge, which carries the OUTER dart's legs away with it — the outer dart is
  // then no longer on the edge and was silently skipped. Measured: a skirt
  // drafted with 2 darts a panel was drawn with 1. So darts are closed from the
  // OUTBOARD end inwards, where nothing a later closure touches has moved yet,
  // and each closure carries the folds already recorded outboard of it.
  const darts = dartsOf(piece)
    .map((d) => ({ d, at: nearestIdx(base, d[0]) }))
    .filter(({ d }) => {
      const n = Math.min(norm(sub(base[nearestIdx(base, d[0])], d[0])),
                         norm(sub(base[nearestIdx(base, d[d.length - 1])], d[d.length - 1])));
      return n <= 8;   // this dart really does sit on this edge
    })
    .sort((a, b) => (outboardAtStart ? a.at - b.at : b.at - a.at));

  let pts = base;
  let delta = [0, 0];
  let legs = [];
  for (const { d } of darts) {
    const r = closeDart(pts, d, outboardAtStart);
    if (!r) continue;
    pts = r.pts;
    delta = add(delta, r.delta);
    legs = legs.map((f) => f.map((q) => rotAbout(q, d[1], r.angle)));
    legs.push(r.fold);
  }
  const side = sideSegs.length ? rampSegs(sideSegs, delta, !outboardAtStart) : [];
  return { edgePts: pts, side, delta, legs, dartCount: legs.length };
}

// ---------------------------------------------------------------------------
// 2b. THE POSED TOP EDGE — neck, shoulder and armhole, in convention pose
// ---------------------------------------------------------------------------
// The drafted panel's own top edge is a PATTERN shape: the shoulder tip sits at
// 0.67-0.81 of the chest half-width (measured over the shipped matrix at EU38)
// because that is where a sewable shoulder seam lands after ease and slope.
// Drawn as-is it reads as one long raglan-like diagonal — Damla's second fault.
// A flat draws the GARMENT WORN AND LAID FLAT: shoulder tip at 0.85-0.90 of the
// chest, a short shoulder line at 15-22 degrees, and a concave armhole from the
// tip into the pattern's own underarm point. The underarm point U is NOT moved:
// it carries the chest width the (g)/(g2) gates hold to 0.1 mm.
//
// The drafted neck curve is kept as a SHAPE (a V stays a V, a scoop a scoop)
// and rescaled to convention proportions: width to the 0.36-0.42 band of the
// shoulder width, depth clamped only from BELOW (a drafted scoop or V keeps its
// own deeper drop — the depth axis is a style the shopper chose; erasing it
// would redraw every neckline as a crew). The back drop is 20-30% of the front
// depth (the ~2 cm convention), so the back view reads as the near-flat curve
// every vendor flat shows. Every applied value rides on the silhouette path as
// data-* attributes; the gate reads those and verifies the declared shoulder
// tip is a real point of the drawn path — a declaration cannot lie.
function poseBodice(d, U, which, poz) {
  if (!d.shoulder.length || !U) return null;
  const N0 = d.shoulder[0].p[0];                          // drafted neck-side point
  const S0 = d.shoulder[d.shoulder.length - 1].p[3];      // drafted shoulder tip
  const xChest = U[0];
  if (!(xChest > 1) || !(U[1] > N0[1] + 1)) return null;
  const xS = clamp(S0[0], OMUZ_ORAN_MIN * xChest, OMUZ_ORAN_MAX * xChest);
  const egim = clamp(Math.atan2(S0[1] - N0[1], S0[0] - N0[0]) * 180 / Math.PI,
                     OMUZ_EGIM_MIN_DEG, OMUZ_EGIM_MAX_DEG);
  let neckSegs = [], nX2 = N0[0], genOran = null, derOran = null;
  if (d.neck.length) {
    const cT = d.neck[0].p[0];                            // centre top (x ~ 0, or the CB stand-off)
    const nX = N0[0], nD = cT[1] - N0[1];
    nX2 = clamp(nX, YAKA_GEN_MIN * xS, YAKA_GEN_MAX * xS);
    let nD2 = nD;
    if (which === 'on') {
      // floor only: convention sets the shallowest honest crew, style keeps depth
      nD2 = Math.max(nD, YAKA_DER_MIN * 2 * nX2);
      poz.onDerinlikMM = nD2;
      derOran = nD2 / (2 * nX2);
    } else if (poz.onDerinlikMM > 0) {
      nD2 = clamp(nD, ARKA_YAKA_MIN * poz.onDerinlikMM, ARKA_YAKA_MAX * poz.onDerinlikMM);
      derOran = nD2 / poz.onDerinlikMM;
    }
    // scale about the centre edge x and the neck-side y, so the curve still
    // starts on the centre line (or the drafted CB stand-off) and still ends
    // at the shoulder's neck point
    const x0 = cT[0];
    const sx = Math.abs(nX - x0) > 1e-6 ? (nX2 - x0) / (nX - x0) : 1;
    const sy = Math.abs(nD) > 1e-6 ? nD2 / nD : 1;
    neckSegs = mapSegs(d.neck, (p) => [x0 + (p[0] - x0) * sx, N0[1] + (p[1] - N0[1]) * sy]);
    genOran = nX2 / xS;
  }
  const N2 = [nX2, N0[1]];
  const S2 = [xS, N0[1] + Math.tan(egim * Math.PI / 180) * (xS - nX2)];
  if (!(U[1] > S2[1] + 1) || !(U[0] > S2[0] + 1)) return null;   // pose cannot close — draw the pattern
  const dx = U[0] - S2[0], dy = U[1] - S2[1];
  // concave armhole: near-vertical leaving the shoulder tip, near-horizontal
  // entering the underarm — Techpacker: "be considerate of the armhole curvature".
  // The drafted armhole's outermost CONTROL point can sit slightly outside the
  // underarm point (measured: +0.7 to +2.6 mm on the sleeveless drafts at EU38
  // — the convex turn into the underarm). That hull maximum IS the pattern's
  // declared chest width and the (g)/(g2) gates hold the drawing to it at
  // 0.1 mm, so the posed curve's second control carries it verbatim.
  const armMaxX = Math.max(...d.armhole.flatMap((s) => s.p.map((q) => q[0])));
  const c2x = Math.max(U[0] - 0.32 * dx, armMaxX);
  const armSeg = { i: -1, p: [S2, [S2[0] + 0.06 * dx, S2[1] + 0.45 * dy], [c2x, U[1]], U] };
  const attrs = ` data-omuz-egim-deg="${egim.toFixed(2)}" data-omuz-oran="${(xS / xChest).toFixed(4)}"` +
    ` data-omuz-uc="${S2[0].toFixed(4)} ${S2[1].toFixed(4)}"` +
    (genOran == null ? '' : ` data-yaka-gen-oran="${genOran.toFixed(4)}"`) +
    (derOran == null ? '' : (which === 'on'
      ? ` data-yaka-derinlik-oran="${derOran.toFixed(4)}"`
      : ` data-arka-yaka-oran="${derOran.toFixed(4)}"`));
  return { neckSegs, shoulderSegs: segsFromPoly([N2, S2]), armSeg, S2, attrs };
}

// ---------------------------------------------------------------------------
// 3. THE SLEEVE — the one degree of freedom, and it is solved, not picked
// ---------------------------------------------------------------------------
// Sewn in and laid flat, a sleeve is a folded tube hanging off the armhole. The
// pattern fixes three lengths and two anchor points:
//
//   S  shoulder tip   = the posed shoulder tip (poseBodice)
//   U  underarm point = the armhole edge's end point     (edgeRoles)
//   Lf fold length    = cap apex -> hem centre, along the grain
//   Lu underarm seam  = the sleeve's own sleeve_underarm edge  (edgeRoles)
//   Lh half hem       = hem centre -> underarm seam
//
// The one thing left free is the ARM ANGLE, and FLAT-ESTETIK moved its source:
// it used to be solved from the closing triangle alone, and the solutions
// ranged 16.5-41.5 degrees at EU38 — the shallow ones drew the arm nearly in
// line with the shoulder diagonal, the "wings" Damla named. The industry
// convention is a definition, not taste (Adstronaut "laying perfectly flat",
// Techpacker flat sketch basics): the sleeve hangs from the shoulder tip DOWN
// and out, 20-40 degrees below the horizontal, wrist near hip on a long
// sleeve. So the triangle solve still SEEDS the angle (two different sleeves
// still land at two different angles) but the result is clamped to the
// convention band, and the published data-kol-aci is the applied angle in
// degrees BELOW horizontal. Lf and the hem half-width Lh stay the pattern's
// exact millimetres; the hem is drawn perpendicular to the fold at exactly Lh,
// and the underarm curve is carried over by the similarity that pins its two
// endpoints (scale published as data-kol-olcek, as before).
function sleeveGeometry(sleeve, S, U) {
  const segs = segsFromCommands(sleeve.commands);
  const roles = sleeve.edgeRoles || [];
  const cap = roles.find((r) => r.role === 'sleeve_cap');
  const unders = roles.filter((r) => r.role === 'sleeve_underarm');
  if (!cap || !unders.length) return { sebep: 'kol parcasinda sleeve_cap/sleeve_underarm kenari yok' };

  const capSegs = segs.filter((s) => s.i >= cap.first && s.i <= cap.last);
  if (!capSegs.length) return { sebep: 'sleeve_cap kenari komut araligina denk gelmiyor' };
  const capPts = samplePoly(capSegs, 32);
  // The apex is the cap's highest point; the fold runs from it straight down the
  // grain, and the hem centre is where the fold meets the hem line.
  let apex = capPts[0];
  for (const p of capPts) if (p[1] < apex[1]) apex = p;
  const all = segs.flatMap((s) => s.p);
  const yHem = Math.max(...all.map((p) => p[1]));
  const Lf = yHem - apex[1];

  const uSeg = segs.filter((s) => s.i === unders[0].first);
  const Lu = chainLength(uSeg);
  // Half the hem = the hem line from the fold (x = apex.x) to the underarm seam.
  const hemSeg = segs.filter((s) => Math.abs(s.p[0][1] - yHem) < 0.5 && Math.abs(s.p[3][1] - yHem) < 0.5);
  const Lh = hemSeg.length ? chainLength(hemSeg) / 2 : Math.abs(unders[0].endX - apex[0]);

  if (!(Lf > 1e-6)) return { sebep: 'kol katlanma boyu olculemedi' };

  // Seed the angle from the pattern's own closing triangle when it closes;
  // then clamp to the convention band. The outward root is the one pointing
  // away from the centre front (larger cosine); an arm folded across the body
  // is the other root and is never the answer for a flat.
  const v = sub(U, S), Lv = norm(v);
  const dL = Lf - Lu;
  let deg = (KOL_ACI_MIN_DEG + KOL_ACI_MAX_DEG) / 2;
  if (dL > 1e-6 && Lv > 1e-6) {
    const cosPhi = (dL * dL + Lv * Lv - Lh * Lh) / (2 * dL * Lv);
    if (cosPhi >= -1 && cosPhi <= 1) {
      const phi = Math.acos(cosPhi), av = Math.atan2(v[1], v[0]);
      const a = Math.cos(av - phi) >= Math.cos(av + phi) ? av - phi : av + phi;
      deg = a * 180 / Math.PI;
    }
  }
  // The drawing floor is the band's MIDPOINT, not its edge, and the reason is
  // measured: the posed shoulder slopes at up to 22 deg, and a gathered/balloon
  // sleeve's triangle seed lands at ~20.6 deg — the two read as ONE unbroken
  // diagonal from neck to wrist, which is exactly the wing Damla named. At 30+
  // the sleeve visibly BREAKS off the shoulder line and hangs ("uzun kolda
  // bilek kalca/etek hizasina duser"). The gate's tolerance band stays 20-40.
  const aci = clamp(deg, KOL_ACI_TABAN_DEG, KOL_ACI_MAX_DEG);
  const th0 = aci * Math.PI / 180;
  const dvec = [Math.cos(th0), Math.sin(th0)];              // down-outward, y counts down
  const out = add(S, scale(dvec, Lf));                      // fold end, at the pattern's own length
  const inn = add(out, scale([-dvec[1], dvec[0]], Lh));     // hem, perpendicular, pattern's own width

  // The fold line and the hem are straight and are drawn straight. The underarm
  // seam is NOT: a balloon sleeve bulges there and a straight line would erase
  // the very axis the shopper chose. So the sleeve's own underarm edge is
  // carried over by the similarity that pins its two endpoints onto U and the
  // hem corner. Both endpoints are then exact; the only liberty is a uniform
  // scale, and it is published on the path as data-kol-olcek.
  const uPts = samplePoly(uSeg, 24);
  let a0 = uPts[0], a1 = uPts[uPts.length - 1];
  // uSeg runs from the underarm point down to the hem, or the reverse.
  if (a0[1] > a1[1]) { const t = a0; a0 = a1; a1 = t; uPts.reverse(); }
  const va = sub(a1, a0), vb = sub(inn, U);
  const la = norm(va), lb = norm(vb);
  const k = la < 1e-6 ? 1 : lb / la;
  const th = Math.atan2(vb[1], vb[0]) - Math.atan2(va[1], va[0]);
  const cs = Math.cos(th) * k, sn = Math.sin(th) * k;
  const under = uPts.map((p) => {
    const d0 = sub(p, a0);
    return [U[0] + d0[0] * cs - d0[1] * sn, U[1] + d0[0] * sn + d0[1] * cs];
  });
  return { S, U, out, inn, d: dvec, Lf, Lu, Lh, under, olcek: k, angleDeg: aci };
}

// ---------------------------------------------------------------------------
// 4. THE COLLAR — measured off the pattern's own collar piece, SHAPED by the
//    convention (G1-yaka)
// ---------------------------------------------------------------------------
// The old drawing re-sampled the collar piece's own outline onto the neckline
// and offset by whatever "width" fell out. Measured on the shipped files, that
// width was garbage — the piece's cap edges were counted into the outer edge,
// so a 28 mm shirt-collar stand printed as an 80 mm blob hanging into the
// chest (09), and a stand collar printed as a star of triangles (02). Damla:
// "yaka parcalari cirkin", and she was right.
//
// The split now is the one the FLAT-ESTETIK pose already uses everywhere else:
// every MILLIMETRE comes from the drafted collar piece, every SHAPE from the
// convention. Measured off the piece (collarMeasures): its neck-edge arc
// length (at EU38 it matches the garment's front+back half neckline to 0.01%
// on all five collar types — 205.3/205.3 peterPan, 220.7/220.7 stand ...),
// its mean depth (outline area / neck-edge length — a rectangle's height, a
// crescent's mean width), its deepest point, and WHICH SIDE of its neck edge
// the cloth sits on (a stand is drafted above the attach edge, a lying collar
// below it — the draft itself says whether the collar stands or lies).
//
// The convention shapes (vendor references, GIRDI/iyi-flat/adaylar):
//   dik   (stand/mock/shirt-stand) — a constant-height band following the
//          neckline on the HOLLOW side (it stands up around the neck).
//   yatik (peterPan/flat)          — a band lying ON the garment, outer edge
//          at the piece's mean depth, ROUNDED at the centre front: the width
//          eases in over one depth of arc on a quarter-circle profile, which
//          is what draws the classic bebe-yaka lobe.
//   gomlek (shirt stand + blade)   — TWO pointed leaves meeting near CF plus
//          a visible stand crescent behind the neck. The first cut of this
//          (2026-09-02) offset the whole neckline like a band and the judge
//          read it as a cape draped shoulder-to-shoulder, its contour showing
//          25 curvature sign flips in 74 points. The leaf is now BUILT from
//          its landmarks — shoulder neck point, a V corner on the neckline
//          one CF opening from the mirror, a tip dropped one blade depth onto
//          the chest — with the outer edge one Catmull-Rom curve through
//          points held one blade depth off the neckline. Smooth by
//          construction, judged by gate (k3).
//
// SMOOTHNESS. The old drawing offset each of 36 samples along the tangent of
// whichever polyline SEGMENT contained it (atFrac): a piecewise-constant
// tangent, so the offset edge inherited a normal that JUMPED at every sample.
// That is the measured wobble. Offsets now walk an even-arc-length resample
// with central-difference tangents (smoothBand), which is the standard
// discrete estimator with a continuous turn along the curve.
function collarMeasures(piece) {
  if (!piece) return null;
  const segs = segsFromCommands(piece.commands);
  if (segs.length < 3) return null;
  // The attach edge is drafted ON y = 0 starting at the origin — all five
  // collar drafts share this frame (measured, see header).
  const neckEdge = segs.filter((s) => Math.abs(s.p[0][1]) < 0.5 && Math.abs(s.p[3][1]) < 0.5);
  if (!neckEdge.length) return null;
  const boyMM = chainLength(neckEdge);
  if (!(boyMM > 1)) return null;
  const pts = samplePoly(segs, 60);
  let A2 = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    A2 += a[0] * b[1] - b[0] * a[1];
  }
  const ys = pts.map((q) => q[1]);
  return {
    boyMM,
    derinlikMM: Math.abs(A2) / 2 / boyMM,
    ucMM: Math.max(Math.abs(Math.min(...ys)), Math.abs(Math.max(...ys))),
    duruyor: Math.min(...ys) < -0.5,          // cloth above the attach edge = stands
  };
}

/** The plan for one garment's collar: type from the pieces themselves, every
 *  number from collarMeasures, the neckline length for the (k) gate's
 *  piece-vs-neckline consistency published alongside. */
function collarPlan(g, neckMM) {
  const piece = g.collarBlade || g.collar;
  const m = collarMeasures(piece);
  if (!m) return null;
  const stand = g.collarBlade ? collarMeasures(g.collar) : null;   // shirt: g.collar IS the stand
  return {
    tur: g.collarBlade ? 'gomlek' : (m.duruyor ? 'dik' : 'yatik'),
    derinlikMM: m.derinlikMM, ucMM: m.ucMM,
    standMM: stand ? stand.derinlikMM : 0,
    parcaMM: m.boyMM, cizgiMM: neckMM,
  };
}

/** Even-arc-length resample of a polyline with central-difference tangents.
 *  Returns { p: [pts], n: [unit normals] } with the normal ORIENTED away from
 *  `away` (so `+w` moves onto the garment when `away` is the neck hollow). */
function smoothBand(pts, N, away) {
  const nc = cumFrac(pts);
  const P = [];
  for (let k = 0; k <= N; k++) P.push(atFrac(pts, nc, k / N).p);
  const nrm = [];
  for (let k = 0; k <= N; k++) {
    const a = P[Math.max(0, k - 1)], b = P[Math.min(N, k + 1)];
    let n = unit([-(b[1] - a[1]), b[0] - a[0]]);
    if (n[0] * (P[k][0] - away[0]) + n[1] * (P[k][1] - away[1]) < 0) n = scale(n, -1);
    nrm.push(n);
  }
  return { p: P, n: nrm };
}

/** One quadratic Bezier, sampled. A quadratic's curvature CANNOT change sign —
 *  which is exactly the property the smoothness gate (k3) wants from a collar
 *  arc — so every free-standing collar curve here is quadratic or circular. */
function quadArc(a, c, b, M = 14) {
  const out = [];
  for (let k = 0; k <= M; k++) {
    const t = k / M, u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
              u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return out;
}

/** Circular arc through three points (constant curvature, zero inflections).
 *  Falls back to the polyline itself when they are near-collinear. */
function arc3(a, q, b, M = 20) {
  const d = 2 * (a[0] * (q[1] - b[1]) + q[0] * (b[1] - a[1]) + b[0] * (a[1] - q[1]));
  if (Math.abs(d) < 1e-6) return [a, q, b];
  const s = (p) => p[0] * p[0] + p[1] * p[1];
  const cx = (s(a) * (q[1] - b[1]) + s(q) * (b[1] - a[1]) + s(b) * (a[1] - q[1])) / d;
  const cy = (s(a) * (b[0] - q[0]) + s(q) * (a[0] - b[0]) + s(b) * (q[0] - a[0])) / d;
  const th = (p) => Math.atan2(p[1] - cy, p[0] - cx);
  const r = Math.hypot(a[0] - cx, a[1] - cy);
  let t0 = th(a), t1 = th(b), tq = th(q);
  // walk the side that contains q
  const wrap = (x) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  let sweep = wrap(t1 - t0);
  if (wrap(tq - t0) > sweep) sweep -= 2 * Math.PI;
  const out = [];
  for (let k = 0; k <= M; k++) {
    const t = t0 + sweep * (k / M);
    out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return out;
}

/** Chaikin corner cutting, endpoints pinned. Kills the resample aliasing that
 *  the even-arc-length walk leaves on a polyline-of-a-curve (sub-degree
 *  alternating turns — the judged wobble of the 2026-09-02 shirt collar). */
function chaikin(pts, iters = 2) {
  let P = pts;
  for (let it = 0; it < iters; it++) {
    const out = [P[0]];
    for (let i = 0; i + 1 < P.length; i++) {
      out.push(lerp(P[i], P[i + 1], 0.25), lerp(P[i], P[i + 1], 0.75));
    }
    out.push(P[P.length - 1]);
    P = out;
  }
  return P;
}

/** Standard offset cleanup: an offset pushed toward the hollow side folds into
 *  a small loop wherever the offset depth exceeds the local curvature radius
 *  (measured on the stand collar's back neckline, 2026-09-02 — gate k2 caught
 *  the crossing). The loop is cut at its own intersection point. */
function trimLoops(pts, win = 10) {
  const X = (a, b, c, d) => {
    const r = [b[0] - a[0], b[1] - a[1]], q = [d[0] - c[0], d[1] - c[1]];
    const den = r[0] * q[1] - r[1] * q[0];
    if (Math.abs(den) < EPS) return null;
    const t = ((c[0] - a[0]) * q[1] - (c[1] - a[1]) * q[0]) / den;
    const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
    return t > 1e-9 && t < 1 - 1e-9 && u > 1e-9 && u < 1 - 1e-9
      ? [a[0] + t * r[0], a[1] + t * r[1]] : null;
  };
  const P = pts.slice();
  for (let i = 0; i + 1 < P.length; i++) {
    for (let j = i + 2; j < Math.min(P.length - 1, i + win); j++) {
      const p = X(P[i], P[i + 1], P[j], P[j + 1]);
      if (p) { P.splice(i + 1, j - i, p); break; }
    }
  }
  return P;
}

/** The drawn collar for one view: an array of { pts, kapali } polylines in the
 *  view's own frame, right half only (the mirror is derived like everything
 *  else). `neckPts` runs centre -> shoulder; `hollow` is the neck hollow;
 *  `shPts` is the posed shoulder line (neck point -> shoulder tip), used to
 *  keep a lying collar's edge from poking past the shoulder seam — the thin
 *  wedge artefact the judge named on the 2026-09-02 prints. */
function yakaKonvansiyon(Y, neckPts, hollow, F, shPts) {
  const L = polyLength(neckPts);
  const D = Y.derinlikMM;
  if (!(L > 5) || !(D > 0.5)) return null;
  const N = 48;
  const B = smoothBand(neckPts, N, hollow);        // normals point ONTO the garment
  // Clamp for lying cloth: nothing drawn past the shoulder seam. The garment
  // side of that line is where the neckline's own CF point is.
  let shClamp = (q) => q;
  if (shPts && shPts.length >= 2) {
    const A = shPts[0], Sv = sub(shPts[shPts.length - 1], A);
    const side = (p) => Sv[0] * (p[1] - A[1]) - Sv[1] * (p[0] - A[0]);
    const ref = side(B.p[0]) >= 0 ? 1 : -1;        // CF deep point = garment side
    shClamp = (q) => {
      if (side(q) * ref >= 0) return q;
      const t = ((q[0] - A[0]) * Sv[0] + (q[1] - A[1]) * Sv[1]) / (Sv[0] * Sv[0] + Sv[1] * Sv[1]);
      return add(A, scale(Sv, Math.max(0, Math.min(1, t))));
    };
  }
  if (Y.tur === 'gomlek' && F) {
    // THE SHIRT COLLAR, FRONT: two pointed leaves + a visible stand crescent.
    // Landmarks first, curves through them — not an offset of the neckline.
    const NP = B.p[N];                                   // shoulder neck point
    const gap = Math.min(0.4, (YAKA_CF_ACIKLIK * D) / L);
    const at = (g) => B.p[Math.round(g * N)];
    const nAt = (g) => B.n[Math.round(g * N)];
    const V = at(gap);                                   // V corner ON the neckline
    const T = shClamp(add(V, scale(nAt(gap), 1.05 * D)));         // the point, on the chest
    // outer edge: ONE circular arc from the tip to a visible roll at the
    // shoulder, bulging one blade depth off the neckline — constant curvature,
    // so it cannot carry an inflection for (k3) to count
    const rib = (g, w) => shClamp(add(at(g), scale(nAt(g), w * D)));
    const E = rib(1, 0.4);                               // roll line at the shoulder
    const outer = arc3(T, rib(0.55, 0.85), E, 22);
    // inner edge: the neckline itself, shoulder -> V corner
    const iV = Math.round(gap * N);
    const leaf = chaikin(B.p.slice(iV).reverse()).concat([T], outer.slice(1));
    const shapes = [{ pts: leaf.map((q) => [Math.max(0, q[0]), q[1]]), kapali: true }];
    if (Y.standMM > 1) {
      // the stand behind the neck: a thin crescent from the neck point to the
      // mirror line, visible height a convention fraction of the measured
      // stand (full height read as a dome, 2026-09-02). Drawn as a CLOSED
      // band of two quadratics so it reads as cloth, not as a stray line.
      const h = Y.standMM * YAKA_STAND_GORUNUR;
      const ust = quadArc(NP, [NP[0] * 0.45, NP[1] - h * 1.15], [0, NP[1] - h]);
      const alt = quadArc(NP, [NP[0] * 0.42, NP[1] - h * 0.5], [0, NP[1] - h * 0.45]);
      shapes.push({ pts: ust.concat(alt.reverse().slice(0, -1)), kapali: true });
    }
    return shapes;
  }
  // BAND COLLARS: a stand runs toward the hollow, everything else lies on the
  // garment; the back view of every type runs unbroken across CB.
  const yon = Y.tur === 'dik' ? -1 : 1;
  const clampFn = yon > 0 ? shClamp : (q) => q;         // standing cloth may rise over the shoulder line
  let wOf;
  if (Y.tur !== 'yatik' || !F) wOf = () => D;
  else {
    // rounded CF lobe: quarter-circle ease over one depth of arc
    wOf = (t) => (t < D ? D * Math.sqrt(Math.max(0, 2 * (t / D) - (t / D) * (t / D))) : D);
  }
  let spine = [], edge = [];
  for (let k = 0; k <= N; k++) {
    const q = clampFn(add(B.p[k], scale(B.n[k], yon * wOf((k / N) * L))));
    spine.push(B.p[k]);
    // NOTHING crosses the mirror line in a half-frame drawing: a standing
    // band's CF cap sits ON it, a lying collar's lobe at worst touches it
    edge.push([Math.max(0, q[0]), q[1]]);
  }
  spine = chaikin(spine);
  edge = chaikin(trimLoops(edge));
  return [{ pts: spine.concat(edge.reverse()), kapali: true }];
}

// ---------------------------------------------------------------------------
// 5. ONE VIEW
// ---------------------------------------------------------------------------
function buildView(P, which) {
  const F = which === 'on';
  const bod = P.bodice[which], skirtP = P.skirt[which];
  const out = { paths: [], sebep: [], notes: {} };
  if (!bod && !skirtP) { out.sebep.push(`${which}: ne beden ne etek parcasi bulundu`); return out; }

  // Every drawn point widens the frame. A sleeve that hangs outside the box the
  // body alone would need is not a layout detail: before this was tracked, a
  // long sleeve ran off the page and the two views overlapped.
  const boxPts = [];
  const push = (rol, d, w, extra = '', pts = null, dash = null) => {
    if (!d) return;
    out.paths.push({ rol, d, w, extra, dash });
    if (pts) for (const p of pts) boxPts.push(p);
  };
  // Line hierarchy is the convention's 4:2:1 — outline 2.0, construction seam
  // 1.0, topstitch 0.5 DASHED. A solid line is a seam, a dashed line is a
  // topstitch; the hem/cuff stitch lines used to print as a doubled solid
  // contour and read as a drawing error.
  const wOf = (rol) => (rol === 'dikis-izi' ? W_TOPSTITCH : W_SEAM);
  const dashOf = (rol) => (rol === 'dikis-izi' ? DASH_TOPSTITCH : null);
  let half = [];          // the right half of the silhouette, top to bottom
  const interior = [];    // [rol, segsOrPts, isPoly]

  let waistJoinY = null, S = null, U = null, warpWaistPt = null;

  if (bod) {
    let d = decompose(bod.piece);
    if (!d) { out.sebep.push(`${which}: beden paneli cozulemedi`); return out; }
    const bodSide = P.bodiceSide[which];
    if (bodSide) {
      const sd = decompose(bodSide.piece);
      const c = sd && composite(d, sd);
      if (!c) out.sebep.push(`${which}: prenses yan beden paneli birlestirilemedi`);
      else d = c;
    }
    // A bodice's dart edge is its hem: on a dress that hem IS the waist seam.
    const sewn = sewPanel(bod.piece, d.hem, d.side, true);
    out.notes.bodiceDarts = sewn.dartCount;
    if (d.armhole.length) {
      S = d.armhole[0].p[0];
      U = d.armhole[d.armhole.length - 1].p[3];
    }
    // FLAT-ESTETIK: the top edge is drawn in CONVENTION POSE (poseBodice) —
    // short 15-22 deg shoulder at 0.85-0.90 of the chest, neck rescaled to the
    // convention bands, concave armhole into the pattern's own underarm point.
    // The armhole always stays on the body outline; a set-in sleeve is its own
    // shape hung off it, which is how every one of the fifteen vendor
    // references in GIRDI/iyi-flat/adaylar is drawn, and it means the armhole
    // line exists exactly ONCE in the file. When the pose cannot be built the
    // drafted edges are drawn as-is and the fallback is named in `sebep`.
    const poz = U ? poseBodice(d, U, which, P.poz) : null;
    if (poz) {
      half = half.concat(poz.neckSegs, poz.shoulderSegs, [poz.armSeg]);
      S = poz.S2;
      out.notes.pozAttr = poz.attrs;
      out.notes.armholePts = samplePoly([poz.armSeg], 24);
      out.notes.neck = samplePoly(poz.neckSegs, 24);
      out.notes.shoulder = samplePoly(poz.shoulderSegs, 4);
    } else {
      out.sebep.push(`${which}: konvansiyon pozu kurulamadi — kalibin kendi ust kenari basildi`);
      half = half.concat(d.neck, d.shoulder, d.armhole);
      out.notes.armholePts = samplePoly(d.armhole, 24);
      out.notes.neck = samplePoly(d.neck, 24);
      out.notes.shoulder = samplePoly(d.shoulder, 4);
    }
    if (P.sleeve && S && U) {
      const g = sleeveGeometry(P.sleeve, S, U);
      if (g.sebep) out.sebep.push(`${which} kol: ${g.sebep}`);
      else out.notes.sleeve = g;
    }
    half = half.concat(sewn.side);
    if (skirtP) {
      // The bodice hem becomes the WAIST SEAM: an interior line, not an edge.
      waistJoinY = sewn.edgePts[sewn.edgePts.length - 1][1];
      // The mannequin tent pegs where the waist seam MEETS the side seam: that
      // is the point the gates measure, so it must carry the full fark exactly.
      warpWaistPt = sewn.edgePts[0];
      interior.push(['bel-dikisi', sewn.edgePts, true]);
    } else {
      // A top draws no waist seam; its waist is the side seam's own pinch —
      // the drafted waistlineWidth, read back off the sewn side seam.
      if (sewn.side.length) {
        const sp = samplePoly(sewn.side, 24);
        warpWaistPt = sp.reduce((a, b) => (b[0] < a[0] ? b : a));
      }
      half = half.concat(segsFromPoly(sewn.edgePts));
      out.notes.hemPts = sewn.edgePts;
      out.notes.hemSA = bod.piece.seamAllowance;
    }
    // Dart legs: drawn where they are sewn, on the unclosed panel, because that
    // is where the stitch line is on the finished garment.
    for (const leg of sewn.legs) interior.push(['pens', leg, true]);
    out.notes.bodiceWaistSide = sewn.edgePts[0];
    out.notes.hollow = [0, d.yTop];
    // A centre back is a SEAM, not a fold: the back panel's centre edge stands
    // off the mirror line (8.47 mm at EU38) and drawing it is what stops the two
    // mirrored halves meeting in mid air.
    if (d.centre.length && Math.max(...d.centre.flatMap((s) => s.p.map((p) => Math.abs(p[0])))) > 0.5) {
      interior.push(['orta-dikis', d.centre, false]);
    }
    if (d.princess) { interior.push(['prenses', d.princess, false]); out.notes.princessKacikMM = d.princessKacikMM; }
  }

  if (skirtP) {
    let d = decompose(skirtP.piece);
    if (!d) { out.sebep.push(`${which}: etek paneli cozulemedi`); return out; }
    const skSide = P.skirtSide[which];
    if (skSide) {
      const sd = decompose(skSide.piece);
      const c = sd && composite(d, sd);
      if (!c) out.sebep.push(`${which}: prenses yan etek paneli birlestirilemedi`);
      else d = c;
    }
    // A skirt's dart edge is its TOP edge (the waist), traversed centre -> side.
    const sewn = sewPanel(skirtP.piece, d.top, d.side, false);
    out.notes.skirtDarts = sewn.dartCount;
    // Anchor: the skirt's centre-front waist point sits on the bodice's.
    const oy = waistJoinY === null ? 0 : waistJoinY - sewn.edgePts[0][1];
    out.notes.skirtDY = oy;
    const mv = (p) => [p[0], p[1] + oy];
    const waistSide = mv(sewn.edgePts[sewn.edgePts.length - 1]);
    if (!bod) warpWaistPt = waistSide;   // a skirt's waist IS its top edge
    let skirtSide = mapSegs(sewn.side, mv);
    if (out.notes.bodiceWaistSide) {
      // The bodice waist and the skirt waist are ONE seam and, darts closed,
      // they do not land on the same point. The residual is still MEASURED and
      // PRINTED (the "bel dikis kacigi" comment, 29.4/39.8 mm on the shipped
      // A-line dresses), but it is no longer drawn as an outline zigzag: that
      // zigzag read as a fake dart-V at the waist on every dress (G1-yaka
      // diagnosis — 01/02/09, both sides). On the garment the two side seams
      // MEET, so the skirt's side seam is carried to the bodice's waist point
      // by the same ramp a dart closure already uses (rampSegs: full at the
      // waist, zero at the hem — the hem the (g)/(g2) gates measure does not
      // move).
      const jog = norm(sub(waistSide, out.notes.bodiceWaistSide));
      out.notes.waistJogMM = jog;
      if (jog > 0.2) skirtSide = rampSegs(skirtSide, sub(out.notes.bodiceWaistSide, waistSide), true);
    } else {
      half = half.concat(segsFromPoly(sewn.edgePts.map(mv)));
    }
    half = half.concat(skirtSide, mapSegs(d.hem, mv));
    out.notes.hemPts = samplePoly(d.hem, 32).map(mv);
    out.notes.hemSA = skirtP.piece.seamAllowance;
    for (const leg of sewn.legs) interior.push(['pens', leg.map(mv), true]);
    if (d.princess) { interior.push(['prenses', mapSegs(d.princess, mv), false]); out.notes.princessKacikMM = d.princessKacikMM; }
    // A drafted waistband is a real piece of cloth sitting on top of the skirt,
    // and its depth is the piece's own short side.
    if (P.waistband && waistJoinY === null) {
      const depth = stripDepth(P.waistband);
      const w = sewn.edgePts.map(mv);
      const yHigh = Math.min(...w.map((p) => p[1]));
      const sl = stitchLine(w, depth, [0, yHigh - 1e4]);
      if (sl) interior.push(['bel-dikisi', sl, true]);
      interior.push(['bel-dikisi', w, true]);
    }
  }

  // The hem's own stitch line, at the piece's own seam allowance.
  if (out.notes.hemPts && out.notes.hemSA) {
    const yLow = Math.max(...out.notes.hemPts.map((p) => p[1]));
    const sl = stitchLine(out.notes.hemPts, out.notes.hemSA, [0, yLow + 1e4]);
    if (sl) interior.push(['dikis-izi', sl, true]);
  }
  // The bound armhole. Not decoration and not a guess: on a sleeveless draft the
  // engine issues one strip named "Bias binding (neckline + armholes)" and its
  // own guide step reads "Finish each armhole with its bias strip ... turn and
  // topstitch it to the inside". That topstitch is a line on the garment, at the
  // binding's own allowance. When the strip does not name the armhole, nothing
  // is drawn there.
  if (!out.notes.sleeve && out.notes.armholePts && P.neckFinish &&
      /armhole/i.test(P.neckFinish.name)) {
    // "turn and topstitch it to the INSIDE": the stitch line sits on the BODY
    // side of the armhole edge, so the offset points toward the centre — away
    // from a far point OUTSIDE the armhole. (It used to point away from the
    // centre and the dashed line ran outside the outline; seen on 03-kolsuz.)
    const sl = stitchLine(out.notes.armholePts, P.neckFinish.seamAllowance, [1e4, out.notes.armholePts[0][1]]);
    if (sl) interior.push(['dikis-izi', sl, true]);
  }
  // The neckline's, when a facing or a binding is what finishes it. With a
  // collar there is already a seam drawn there and a second line would be a
  // seam the garment does not have.
  if (!P.collar && P.neckFinish && out.notes.neck && out.notes.hollow) {
    const sl = stitchLine(out.notes.neck, P.neckFinish.seamAllowance, out.notes.hollow);
    if (sl) interior.push(['dikis-izi', sl, true]);
  }

  if (!half.length) { out.sebep.push(`${which}: siluet bos`); return out; }

  // F6-konvansiyon: the mannequin transform (mankenWarp above), applied to the
  // BODY silhouette and its interior seam lines only, after assembly and before
  // mirroring — the mirror and every published residual stay derived. Its
  // parameters ride on the silhouette path so any reader can invert it.
  const MK = mankenWarp(half, U ? U[1] : null, warpWaistPt);
  let mkAttr = '';
  if (MK && MK.sebep) out.sebep.push(`${which}: ${MK.sebep}`);
  else if (MK && MK.map) {
    mkAttr = ` data-manken-fark-ceyrek-mm="${MK.farkCeyrekMM}"` +
      ` data-manken-bel-yarim-mm="${MK.belYarimMM.toFixed(4)}"` +
      (MK.bustY == null ? '' : ` data-manken-bust-y="${MK.bustY.toFixed(4)}"`) +
      ` data-manken-bel-y="${MK.waistY.toFixed(4)}" data-manken-kalca-y="${MK.hipY.toFixed(4)}"`;
    // Densify first (EXACT subdivision): the warp lands on control points, and
    // a control-sparse curve would only feel the tent where its controls sit.
    // ONLY segments the tent touches are split — outside it the warp is the
    // identity and the original control points (whose hull the pattern-side
    // gates measure) must survive byte-for-byte.
    const dens = (segs) => segs.flatMap((sg) => {
      const ys = sg.p.map((q) => q[1]);
      return (Math.min(...ys) < MK.hipY && Math.max(...ys) > MK.bustY) ? densifySegs([sg]) : [sg];
    });
    half = mapSegs(dens(half), MK.map);
    for (const e of interior) e[1] = e[2] ? e[1].map(MK.map) : mapSegs(dens(e[1]), MK.map);
  }

  // The half is drawn out and the mirror is DERIVED. A garment drawn twice is
  // two garments.
  const closed = half.concat(mirrorSegs(half));
  const flipY = P.flipY;
  push('siluet', pathD(closed, flipY, true), W_OUTLINE,
       ` data-view="${F ? 'front' : 'back'}"${mkAttr}${out.notes.pozAttr || ''}`,
       closed.flatMap((s) => s.p));

  for (const [rol, geom, isPoly] of interior) {
    const dRight = isPoly ? polyD(geom, flipY) : pathD(geom, flipY);
    const mir = isPoly ? geom.map((p) => [-p[0], p[1]]) : mirrorSegs(geom);
    const dLeft = isPoly ? polyD(mir, flipY) : pathD(mir, flipY);
    const gp = isPoly ? geom : geom.flatMap((s) => s.p);
    const mp = isPoly ? mir : mir.flatMap((s) => s.p);
    push(rol, dRight, wOf(rol), ` data-view="${F ? 'front' : 'back'}" data-yan="sag"`, gp, dashOf(rol));
    push(rol, dLeft, wOf(rol), ` data-view="${F ? 'front' : 'back'}" data-yan="sol"`, mp, dashOf(rol));
  }

  // The sleeve: fold line, hem, and the sleeve's own underarm curve. Open, not
  // closed, because its fourth side is the armhole the body already drew.
  if (out.notes.sleeve) {
    const g = out.notes.sleeve;
    const shape = [g.S, g.out].concat(g.under.slice().reverse());
    const attr = (yan) => ` data-view="${F ? 'front' : 'back'}" data-yan="${yan}"` +
      ` data-kol-aci="${g.angleDeg.toFixed(2)}" data-kol-olcek="${g.olcek.toFixed(4)}"`;
    // The cuff seam, or failing that the sleeve hem's stitch line. The depth is
    // the drafted cuff piece's own short side, not a drawn-in number.
    const depth = P.cuff ? stripDepth(P.cuff) : (P.sleeve.seamAllowance || 0);
    if (depth > 0) {
      const c = [sub(g.out, scale(g.d, depth)), sub(g.inn, scale(g.d, depth))];
      push('dikis-izi', polyD(c, flipY), W_TOPSTITCH, ` data-view="${F ? 'front' : 'back'}" data-yan="sag"`, c, DASH_TOPSTITCH);
      const cm = c.map((p) => [-p[0], p[1]]);
      push('dikis-izi', polyD(cm, flipY), W_TOPSTITCH, ` data-view="${F ? 'front' : 'back'}" data-yan="sol"`, cm, DASH_TOPSTITCH);
    }
    push('kol', polyD(shape, flipY), W_OUTLINE, attr('sag'), shape);
    push('kol', polyD(shape.map((p) => [-p[0], p[1]]), flipY), W_OUTLINE, attr('sol'),
         shape.map((p) => [-p[0], p[1]]));
  }

  // The collar: sized by the pattern's own collar piece, shaped by the
  // convention (section 4). The piece length and the drafted neckline length
  // ride on every collar path so the (k) gate can hold them together.
  if (P.yakaPlan && out.notes.neck && out.notes.neck.length > 1) {
    const sh = yakaKonvansiyon(P.yakaPlan, out.notes.neck, out.notes.hollow, F, out.notes.shoulder);
    if (sh) {
      const attr = (yan) => ` data-view="${F ? 'front' : 'back'}" data-yan="${yan}"` +
        ` data-yaka-tur="${P.yakaPlan.tur}"` +
        ` data-yaka-parca-mm="${P.yakaPlan.parcaMM.toFixed(4)}"` +
        ` data-yaka-cizgi-mm="${P.yakaPlan.cizgiMM.toFixed(4)}"`;
      for (const s of sh) {
        push('yaka', polyD(s.pts, flipY, s.kapali), W_SEAM, attr('sag'), s.pts);
        const mir = s.pts.map((p) => [-p[0], p[1]]);
        push('yaka', polyD(mir, flipY, s.kapali), W_SEAM, attr('sol'), mir);
      }
    } else out.sebep.push(`${which} yaka: yaka parcasindan olcu cikarilamadi`);
  }

  out.box = {
    x0: Math.min(...boxPts.map((p) => p[0])), x1: Math.max(...boxPts.map((p) => p[0])),
    y0: Math.min(...boxPts.map((p) => p[1])), y1: Math.max(...boxPts.map((p) => p[1])),
  };
  return out;
}

// ---------------------------------------------------------------------------
// 6. PIECE LOOKUP
// ---------------------------------------------------------------------------
// Names come from the drafting code and are matched, not assumed: a class whose
// pieces are not found is REFUSED by name rather than drawn as something else.
function pick(pieces, re) { return pieces.find((p) => re.test(p.name)) || null; }

function gather(pattern) {
  const ps = pattern.pieces || [];
  const wrap = (p) => (p ? { piece: p } : null);
  return {
    bodice: {
      on:   wrap(pick(ps, /^(Bodice Front|Bodice Center Front|Top Front|Top Center Front)$/)),
      arka: wrap(pick(ps, /^(Bodice Back|Bodice Center Back|Top Back|Top Center Back)$/)),
    },
    bodiceSide: {
      on:   wrap(pick(ps, /^(Bodice|Top) Side Front$/)),
      arka: wrap(pick(ps, /^(Bodice|Top) Side Back$/)),
    },
    skirt: {
      // F5-parca: a zipperless simple dress carries ONE merged skirt piece
      // ("Skirt Front & Back", cut 2 on fold) — measured identical quarters,
      // so the SAME piece honestly draws both views.
      on:   wrap(pick(ps, /^(Skirt Front|Skirt Center Front|Front|Skirt Front & Back|Front & Back)$/)),
      arka: wrap(pick(ps, /^(Skirt Back|Skirt Center Back|Back|Skirt Front & Back|Front & Back)$/)),
    },
    skirtSide: {
      on:   wrap(pick(ps, /^Skirt Side Front$/)),
      arka: wrap(pick(ps, /^Skirt Side Back$/)),
    },
    sleeve: pick(ps, /(^|\s)Sleeve$/),
    cuff: pick(ps, /Cuff/),
    // A shirt collar is TWO pieces: the stand (drafted above its attach edge)
    // and the blade/fall. `collar` finds the first collar piece — for a shirt
    // that is the stand — and `collarBlade` the fall, when there is one.
    collar: pick(ps, /Collar/),
    collarBlade: pick(ps, /Collar Blade/),
    waistband: pick(ps, /^Waistband$/),
    neckFinish: pick(ps, /(Neck Facing|Bias binding)/),
  };
}

// ---------------------------------------------------------------------------
// 7. THE WRITER
// ---------------------------------------------------------------------------
/**
 * @param {object} draft  the {pattern, issues} object engine.draftJSON returns
 * @param {object} meta   { beden, dugum, sinif:{garment,shaping,fabric},
 *                          desteklenmeyen_eksenler }
 * @returns {string} one 1:1 SVG document, front and back
 *
 * REFUSES rather than draws a lie (RULES invariant 1): a blocked draft, a
 * missing pattern or a view that cannot be assembled throws with the engine's
 * own words. A flat with a silently absent sleeve is the exact failure this
 * file was written to end.
 */
export function renderFlatFromPattern(draft, meta = {}) {
  if (!draft || typeof draft !== 'object') throw new Error('flat: motor bir sey dondurmedi');
  if (draft.error) throw new Error(`flat: ${draft.error}`);
  if (!draft.pattern || !Array.isArray(draft.pattern.pieces) || !draft.pattern.pieces.length) {
    throw new Error('flat: kalipta parca yok');
  }
  const g = gather(draft.pattern);
  // One collar spans front AND back: the drafted neckline (front + back half)
  // is measured here so the collar piece's own length can be held against it —
  // published on every collar path, judged by the (k) gate at ±5%.
  const neckLen = (w) => {
    const b = g.bodice[w];
    if (!b) return 0;
    const d = decompose(b.piece);
    return d && d.neck.length ? chainLength(d.neck) : 0;
  };
  const lf = neckLen('on'), lb = neckLen('arka');
  // `poz` is the one cross-view channel: the front view publishes its posed
  // neck depth there and the back view reads it (back drop = 20-30% of front).
  const P = { ...g, flipY: (y) => y, yakaPlan: collarPlan(g, lf + lb), poz: {} };

  const views = ['on', 'arka'].map((w) => buildView(P, w));
  const drawn = views.filter((v) => v.paths.length);
  if (!drawn.length) throw new Error(`flat: hicbir gorunum cizilemedi — ${views.flatMap((v) => v.sebep).join('; ')}`);

  // Layout: the two views side by side, both in the same millimetre frame, so
  // one ruler measures both.
  const boxes = drawn.map((v) => v.box);
  const yLo = Math.min(...boxes.map((b) => b.y0)), yHi = Math.max(...boxes.map((b) => b.y1));
  const wHalf = Math.max(...boxes.map((b) => Math.max(Math.abs(b.x0), Math.abs(b.x1))));
  const pad = 40, gap = 90, panelW = 2 * wHalf, h = yHi - yLo;
  // F3-arka: an invented back needs two more caption lines under BACK; the
  // frame grows to hold them so the declaration is never clipped out of the
  // viewBox. `capY` is the FRONT/BACK caption baseline — identical to the old
  // H-12 when no arka claim rides, so every other export stays byte-same.
  const capY = 2 * pad + h + 18;
  const W = 2 * pad + 2 * panelW + gap, H = capY + 12 + (meta.arka === 'uydurma' ? 36 : 0);
  const cx = [pad + wHalf, pad + panelW + gap + wHalf];

  const parts = [];
  parts.push(
    // The physical size and the viewBox are printed at the SAME precision on
    // purpose: the scale declaration is checked by dividing one by the other,
    // and rounding them differently made a 1:1 document declare 0.99999891 mm
    // per unit. A scale that is only nearly true is not a scale.
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(4)}mm" height="${H.toFixed(4)}mm" ` +
    `viewBox="0 0 ${W.toFixed(4)} ${H.toFixed(4)}" data-scale="1:1" data-unit-mm="1" ` +
    `data-source="DraftedPattern" data-dugum="${meta.dugum || ''}" data-size="${meta.beden || ''}" ` +
    `data-sinif="${(meta.sinif && meta.sinif.garment) || ''}/${(meta.sinif && meta.sinif.shaping) || ''}/` +
    `${(meta.sinif && meta.sinif.fabric) || ''}"` +
    // F3-arka: the back view's ORIGIN, on the root so it survives offline.
    // Absent when the caller carries no köken record (null): a drawing must not
    // claim "seen" or "invented" about a back nobody recorded.
    (meta.arka ? ` data-arka-koken="${meta.arka}"` : '') + '>');

  drawn.forEach((v, i) => {
    parts.push(`  <g fill="none" stroke="${INK}" transform="translate(${cx[i].toFixed(4)},${(pad - yLo).toFixed(4)})">`);
    for (const p of v.paths) {
      parts.push(`    <path data-rol="${p.rol}"${p.extra} stroke-width="${p.w}"` +
                 `${p.dash ? ` stroke-dasharray="${p.dash}"` : ''} d="${p.d}"/>`);
    }
    parts.push('  </g>');
  });

  parts.push(`  <g font-family="sans-serif" font-size="14" text-anchor="middle" fill="${INK}">`);
  parts.push(`    <text x="${cx[0].toFixed(4)}" y="${capY.toFixed(4)}">FRONT ${meta.beden || ''}</text>`);
  if (drawn.length > 1) parts.push(`    <text x="${cx[1].toFixed(4)}" y="${capY.toFixed(4)}">BACK ${meta.beden || ''}</text>`);
  // F3-arka: an INVENTED back says so ON the drawing, in the ink, next to the
  // view it is about — not in metadata a viewer never opens. Damla's rule: with
  // only a front photo the back is invented (plain back, neck mirroring the
  // front, a zip only when it will not slip on) and the invention is DECLARED.
  if (drawn.length > 1 && meta.arka === 'uydurma') {
    parts.push(`  <g font-family="sans-serif" text-anchor="middle" fill="${INK}">`);
    parts.push(`    <text x="${cx[1].toFixed(4)}" y="${(capY + 16).toFixed(4)}" font-size="13" font-weight="bold">ARKA: UYDURMA / BACK: INVENTED</text>`);
    parts.push(`    <text x="${cx[1].toFixed(4)}" y="${(capY + 30).toFixed(4)}" font-size="10">arka fotograf yok — duz sirt, boyun on yakanin aynasi, gecmiyorsa fermuar</text>`);
    parts.push('  </g>');
  }
  parts.push('  </g>');
  // The bodice waist and the skirt waist are ONE seam and, with both panels'
  // darts closed, they do not land on the same point. That residual is a fact
  // about the pattern, not about the drawing, so it is PRINTED rather than
  // scaled away — scaling one of two mating seams to fit the other is how a
  // drawing stops being a measurement.
  const bel = drawn.map((v) => v.notes.waistJogMM).filter((x) => typeof x === 'number');
  if (bel.length) {
    parts.push(`  <!-- bel dikis kacigi (mm, olculdu, kapatilmadi): ${bel.map((k) => k.toFixed(3)).join(' ')} -->`);
  }
  const kacik = drawn.map((v) => v.notes.princessKacikMM).filter((x) => typeof x === 'number');
  if (kacik.length) {
    parts.push(`  <!-- prenses dikis kacigi (mm, olculdu, kapatilmadi): ${kacik.map((k) => k.toFixed(3)).join(' ')} -->`);
  }
  const sebep = views.flatMap((v) => v.sebep);
  if (sebep.length) parts.push(`  <!-- cizilemeyen: ${sebep.join(' | ').replace(/--/g, '- -')} -->`);
  parts.push('</svg>');
  return parts.join('\n');
}
