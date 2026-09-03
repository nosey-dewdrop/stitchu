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
// Gather-comb spacing as a share of the gathered seam, MEASURED off
// GIRDI/iyi-flat/adaylar/09 (13 ticks over an 82 px comb = 6.3 px apart).
const BUZGU_TARAK_ARALIK_ORAN = 0.077; // contract/flat-convention-v1.json sevkPoz.buzgu.tarak.aralikOran

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
} from './flat-geom.js?v=144';
// The büzgü / ease threshold is a MEASURED contract value, not a local constant.
import { CONTRACT } from '../js/contract.gen.js?v=144';

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
// 2b. BÜZGÜ — READ OFF THE PATTERN, NEVER ASSUMED (M1-puf, 2026-09-02)
// ---------------------------------------------------------------------------
// A gathered seam is a seam whose two sides are drawn to DIFFERENT lengths. So
// the drawing does not need to be told that a sleeve is a puff, and must not be:
// it measures the pattern's own `sleeve_cap` edge against the pattern's own
// `armhole_front` + `armhole_back` edges. If the cap is longer, the surplus IS
// the gather, in millimetres, and it came from the draft.
//
// WHERE THE THRESHOLD COMES FROM. Every set-in cap is drawn a little longer
// than its armhole — that is cap EASE (3-5%), which is worked in smooth and
// must not be drawn as gathering. The line between ease and gather is not a
// number this file picks: it is the LOWEST MEASURED gather ratio in the
// contract (draft.gatherRatios.sleeveCapGathered, 1.235, measured on the
// purchased Bugra Locket). Below it, ease; at or above it, büzgü.
const BUZGU_ESIK = CONTRACT.draft.gatherRatios.sleeveCapGathered;

/** Arc length of every edge on `piece` carrying `role`, in the pattern's mm. */
function rolBoyu(piece, role) {
  if (!piece || !Array.isArray(piece.edgeRoles) || !piece.commands) return 0;
  const segs = segsFromCommands(piece.commands);
  let toplam = 0;
  for (const r of piece.edgeRoles) {
    if (r.role !== role) continue;
    const kesit = segs.filter((s) => s.i >= r.first && s.i <= r.last);
    if (kesit.length) toplam += chainLength(kesit);
  }
  return toplam;
}

/** The two büzgü readings a sleeve can carry, both measured off the draft.
 *  `kapak` = cap edge vs the armhole it is sewn into.
 *  `etek`  = sleeve hem vs the cuff band it is gathered onto.
 *  Each is null when the pattern does not carry the edges to measure — a
 *  missing reading is named in `sebep`, never replaced by a guess. */
function buzguOku(P) {
  const okuma = { kapak: null, etek: null, sebep: [] };
  const sl = P.sleeve;
  if (!sl) return okuma;
  const capMM = rolBoyu(sl, 'sleeve_cap');
  // The armhole is summed over EVERY piece that names a share of it. A princess
  // bodice splits it between the Center and the Side panel, and reading only
  // the Center halved the armhole — which made a PLAIN princess sleeve measure
  // as a 2:1 gather and printed a puff nobody asked for (caught by
  // cizim_giysi_mi (j1)). Whichever pieces carry the name, all of them count.
  const ahPieces = [P.bodice.on, P.bodice.arka,
                    P.bodiceSide && P.bodiceSide.on, P.bodiceSide && P.bodiceSide.arka]
    .filter(Boolean).map((w) => w.piece);
  let ahMM = 0;
  for (const pc of ahPieces) ahMM += rolBoyu(pc, 'armhole_front') + rolBoyu(pc, 'armhole_back');
  if (capMM > 0 && ahMM > 0) {
    const oran = capMM / ahMM;
    if (oran >= BUZGU_ESIK) okuma.kapak = { capMM, hedefMM: ahMM, oran, fazlaMM: capMM - ahMM };
  } else if (capMM > 0) {
    okuma.sebep.push('kol kapagi buzgusu olculemedi: kalipta armhole_front/armhole_back kenari yok');
  }
  const hemMM = rolBoyu(sl, 'sleeve_hem');
  // The cuff band's own finished length is its long side; the piece is drafted
  // as a rectangle whose width IS that length.
  if (hemMM > 0 && P.cuff) {
    const b = bbox(segsFromCommands(P.cuff.commands));
    const mansetMM = Math.max(b.x1 - b.x0, 0) - 2 * (P.cuff.seamAllowance || 0);
    if (mansetMM > 0) {
      const oran = hemMM / mansetMM;
      if (oran > 1.0) okuma.etek = { capMM: hemMM, hedefMM: mansetMM, oran, fazlaMM: hemMM - mansetMM };
    }
  }
  return okuma;
}

/** Gather marks: short ticks ACROSS a seam, the standard notation. `pts` is the
 *  drawn seam polyline, `adet` how many marks (the pattern's own count).
 *  Returns an array of two-point segments in drawing coordinates. */
// On ortayi gecen bir polyline'i x >= 0 tarafinda kirpar. Kesisme noktasi iki
// komsu nokta arasinda dogrusal interpolasyonla BULUNUR; hicbir koordinat
// secilmez.
function cfKirp(pts) {
  const o = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    if (a[0] >= 0) o.push(a);
    if (b && (a[0] >= 0) !== (b[0] >= 0)) {
      const t = a[0] / (a[0] - b[0]);
      o.push([0, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return o.length >= 2 ? o : pts;
}

function poliUzunluk(pts) {
  if (!Array.isArray(pts) || pts.length < 2) return 0;
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += norm(sub(pts[i], pts[i - 1]));
  return L;
}

// `yon`: null ise tik dikişi ORTALAR (iki yana eşit). Bir işaret verilirse tik
// dikişin ÜSTÜNDEN başlar ve o yöne gider. Konvansiyon (contract
// flat-convention-v1 sevkPoz.buzgu.tarak, referans 04/06/09): büzgü tarağı
// BÜZÜLEN parçanın kenarında durur — kol kapağı büzülüyorsa tarak KOLUN
// üstündedir, gövdenin kol oyuğunda değil. Ortalanmış tik bunu ihlal ediyordu:
// yarısı gövdeye taşıyordu (gözle doğrulandı, KOSU/ciktilar/bugra-spec-giysi.png
// FRONT figürü, oyuk hattı).
function buzguIsaretleri(pts, adet, uzunlukMM, yon = null) {
  if (!Array.isArray(pts) || pts.length < 2 || adet < 1) return [];
  const kum = [0];
  for (let i = 1; i < pts.length; i++) kum.push(kum[i - 1] + norm(sub(pts[i], pts[i - 1])));
  const toplam = kum[kum.length - 1];
  if (!(toplam > EPS)) return [];
  const out = [];
  for (let n = 0; n < adet; n++) {
    const hedef = toplam * (n + 1) / (adet + 1);
    let i = 1;
    while (i + 1 < kum.length && kum[i] < hedef) i++;
    const span = kum[i] - kum[i - 1];
    const u = span > EPS ? (hedef - kum[i - 1]) / span : 0;
    const p = lerp(pts[i - 1], pts[i], u);
    const t = unit(sub(pts[i], pts[i - 1]));
    let nrm = [-t[1], t[0]];
    if (yon === 'disari') { if (nrm[0] < 0) nrm = [-nrm[0], -nrm[1]]; out.push([p, add(p, scale(nrm, uzunlukMM))]); }
    else out.push([add(p, scale(nrm, uzunlukMM / 2)), sub(p, scale(nrm, uzunlukMM / 2))]);
  }
  return out;
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
  //
  // G2-goz (2026-09-02): a LONG sleeve still read as a wing at the 30 floor.
  // Measured cause: the triangle seed is dragged DOWN by the hem width Lh —
  // a long STRAIGHT sleeve (Lh 121) seeds at 36-38 and hangs right, but its
  // long BALLOON sibling (identical Lf/Lu, only Lh 158 from the wide gathered
  // cuff) seeds at 20.6 and drops to the flat 30 floor. Cuff width is a STYLE
  // axis and must not shallow the droop. So the floor now rises with the
  // sleeve's own length: a long sleeve's wrist belongs at hip level (the
  // convention line above), which is the top of the band, not its midpoint.
  // Short sleeves (Lf ~= Lu + one cuff) keep the 30 floor; the ramp is on
  // Lf/Lu, both drafted lengths, so no drawn-in number and the seed still wins
  // whenever it already clears the raised floor (the long straight is untouched
  // at 36-38). Band stays 20-40, so gate (j) is unaffected.
  // Length signal = fold length over the underarm-seam-plus-hem the short
  // sleeve is made of. Short sleeve Lf ~= 227 (barely past the cap); a long
  // sleeve reaches the wrist, Lf ~= 557. Normalise on the hem width Lh (the
  // sleeve's own scale) so it is size-free: short Lf/Lh ~= 1.9, long ~= 3.5+.
  const uzunOran = clamp((Lf / Math.max(Lh, 1) - 2.3) / 1.0, 0, 1);   // 0 short .. 1 long
  const taban = KOL_ACI_TABAN_DEG + uzunOran * (KOL_ACI_MAX_DEG - 2 - KOL_ACI_TABAN_DEG);
  const aci = clamp(deg, taban, KOL_ACI_MAX_DEG);
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

/** A dart-closed edge, drawn as ONE curve (G2-goz, 2026-09-02). Closing a
 *  dart rigidly rotates the outboard run, so a multi-dart waist edge is a
 *  chain of straight facets with a convex kink at every closure — measured on
 *  07: five facets, and the judge read the waist as a scribble. On the sewn
 *  garment those kinks are eased flat by the very darts that made them, so
 *  the drawing shows the eased curve: a sparse even-arc resample (the kinks
 *  fall between samples) corner-cut smooth. Both steps pin the endpoints, so
 *  the side corner the (g2) gate compares against the pattern survives
 *  byte-exact. */
function smoothEdge(pts, K = 12) {
  if (pts.length < 3) return pts;
  const nc = cumFrac(pts);
  const P = [];
  for (let k = 0; k <= K; k++) P.push(atFrac(pts, nc, k / K).p);
  // First choice: the classic drafted waistline, a single constant-curvature
  // arc through the edge's two ends and its arc-length midpoint (zero kinks by
  // construction). Guard: if the chain is genuinely not arc-like (deviation
  // over 12 mm), fall back to the corner-cut chain rather than draw a shape
  // the pattern does not support.
  const arc = arc3(P[0], P[K / 2 | 0], P[K], 24);
  const anc = cumFrac(arc);
  let dev = 0;
  for (let k = 0; k <= K; k++) {
    const q = atFrac(arc, anc, k / K).p;
    dev = Math.max(dev, Math.hypot(q[0] - P[k][0], q[1] - P[k][1]));
  }
  return dev <= 12 ? arc : chaikin(P, 3);
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
    // rounded CF lobe. G2-goz (2026-09-02): the ease used to start at ZERO
    // width, so the lobe's edge met the neckline exactly at CF and the two
    // mirrored lobes read as a sharp V-notch — not the classic bebe-yaka.
    // Every peterPan reference (GIRDI/iyi-flat) shows two ROUND lobes parting
    // at CF with the lobe still carrying most of its depth there. So the ease
    // now starts at 0.6 D (a convention shape fraction like the others in
    // yakaParcasi._sekilSabitleri — no mm source, DOGRULANMADI) and rises on
    // the same quarter-circle to the piece's own measured depth D.
    const g0 = 0.6;
    wOf = (t) => {
      if (t >= D) return D;
      const u = t / D;
      return D * (g0 + (1 - g0) * Math.sqrt(Math.max(0, 2 * u - u * u)));
    };
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
  const out = { which, paths: [], sebep: [], notes: {} };
  if (!bod && !skirtP) { out.sebep.push(`${which}: ne beden ne etek parcasi bulundu`); return out; }
  // ⭐ SESSIZ DUSME KAPANDI (M3-primitif, 2026-09-03). OLCULEN HATA: roba
  // (yoke) bolmesi acikken motor beden panellerini "Front Yoke Center" /
  // "Front Body Center" diye adlandiriyor; asagidaki isim tablosunun hicbir
  // deseni tutmuyordu, `bod` null kaliyordu ve BU FONKSIYON HIC SIKAYET
  // ETMEDEN yalnizca etegi ciziyordu. Yani 14 parcalik prenses+roba ELBISESI
  // duz bir A ETEK olarak basiliyordu ve dosyanin `cizilemeyen:` yorumu bile
  // bos kaliyordu (K2, KOSU/ciktilar/primitif-K2-prenses-roba-flat.svg'nin ilk
  // basimi). Bu dosyanin kendi yasasi: "REFUSES rather than draws a lie".
  // Artik kalipta beden sinifi bir parca VARSA ama tabloya oturmadiysa gorunum
  // ADIYLA reddediliyor — cizim yerine sebep, ve sebep hangi parcanin
  // taninmadigini soyluyor.
  if (!bod && P.tanimsizBeden && P.tanimsizBeden.length) {
    out.sebep.push(`${which}: kalipta beden parcasi var ama cizim tablosuna oturmadi ` +
      `(${P.tanimsizBeden.join(', ')}) — etek tek basina cizilseydi giysi yanlis gorunurdu; ` +
      'sonraki adim: bu parca adlarini web/lib/flat-from-pattern.js gather() tablosuna bagla');
    return out;
  }

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
      // G2-goz (2026-09-02): the bodice waist seam was pushed RAW, but every
      // dart closure leaves a kink on it (same cause as the skirt top at
      // line ~1044), so on 01/03/08/09 it printed as a sagging kinked "box"
      // across the underbust — a scribble against any vendor reference. It is
      // now the same single smoothEdge curve the skirt top already uses; both
      // endpoints (the side corner + CF, which the mannequin peg and the gates
      // read) are pinned byte-exact by smoothEdge, so nothing downstream moves.
      interior.push(['bel-dikisi', smoothEdge(sewn.edgePts), true]);
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
    // ⛔ GROWN-ON STAND / PLEAT UNDERLAY IS NOT A CENTRE SEAM (M3-primitif).
    // A button placket grows the WHOLE centre-front edge outward (placket.cpp:46,
    // -73 mm at EU38 for the asymmetric case) and an inverted box pleat grows it
    // by twice the pleat depth (-80 mm). Both are CONSTRUCTION extensions that
    // fold back on themselves; on the finished garment neither is a visible
    // line. Drawn through this branch — and then mirrored — they printed as the
    // floating closed RECTANGLE the referee named, hanging off the neckline and
    // crossing the waist seam. The closure itself is drawn by the `kapama` /
    // `pili` features below, from the piece's own fold-line markings.
    const kapanisAdi = bod.piece.closure || '';
    if (d.centre.length && !/placket|pleat/.test(kapanisAdi) &&
        Math.max(...d.centre.flatMap((s) => s.p.map((p) => Math.abs(p[0])))) > 0.5) {
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
      // G2-goz (2026-09-02): every dart closure leaves a KINK on the waist
      // edge (the outboard run is rigidly rotated), and drawn raw the skirt's
      // top read as five straight facets — a scribble against any vendor
      // reference. The edge is re-sampled sparsely and corner-cut so the
      // facets merge into one curve; the endpoints (the side corner the (g2)
      // gate measures) are pinned by both steps.
      half = half.concat(segsFromPoly(smoothEdge(sewn.edgePts.map(mv))));
    }
    half = half.concat(skirtSide, mapSegs(d.hem, mv));
    out.notes.hemPts = samplePoly(d.hem, 32).map(mv);
    out.notes.hemSA = skirtP.piece.seamAllowance;
    // G2-goz (2026-09-02): a drafted waistband's lower line used to be offset
    // with per-point polyline normals off the KINKED dart-closed edge — the
    // normals whipped at every closure corner and the line's ends shot out
    // past the side seams as whiskers (seen on 07). The offset now walks the
    // smoothed edge with central-difference normals (smoothBand), is clamped
    // to the waist's own half-width (the side seam only widens below it), and
    // the dart legs start BELOW the band — on the garment the band covers
    // their top ends.
    const wbDepth = (P.waistband && waistJoinY === null) ? stripDepth(P.waistband) : 0;
    for (const leg of sewn.legs) {
      let L = leg.map(mv);
      if (wbDepth > 0 && L.length === 2) {
        const v = sub(L[1], L[0]), n = norm(v);
        if (n > wbDepth * 1.5) L = [add(L[0], scale(v, wbDepth / n)), L[1]];
      }
      interior.push(['pens', L, true]);
    }
    if (d.princess) { interior.push(['prenses', mapSegs(d.princess, mv), false]); out.notes.princessKacikMM = d.princessKacikMM; }
    // A drafted waistband is a real piece of cloth sitting on top of the skirt,
    // and its depth is the piece's own short side.
    if (wbDepth > 0) {
      const w = smoothEdge(sewn.edgePts.map(mv));
      const yHigh = Math.min(...w.map((p) => p[1]));
      const B = smoothBand(w, 48, [0, yHigh - 1e4]);   // normals point down, onto the skirt
      // The band's lower line stops at the waist's own half-width: the side
      // seam only widens BELOW the waist, so a point pushed past that width
      // is an overshoot (the 07 whiskers), and it is DROPPED, not crimped.
      const xCap = Math.max(Math.abs(w[0][0]), Math.abs(w[w.length - 1][0])) - 0.5;
      const sl = chaikin(trimLoops(
        B.p.map((p, k) => add(p, scale(B.n[k], wbDepth)))
           .filter((q) => Math.abs(q[0]) <= xCap)));
      if (sl.length > 1) interior.push(['bel-dikisi', sl, true]);
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
  // ⚠ `armholePts.length` (M3-primitif, 2026-09-03): omuz-acik (bardot) bedende
  // kol oyugu kenari HIC CIZILMIYOR, dizi BOS geliyordu ve asagidaki satir
  // `armholePts[0][1]`'i okuyunca cizim TypeError ile PATLIYORDU — yani
  // create.html'den bir bardot elbisenin flat'i hic inmiyordu. Bos dizi
  // `undefined` degildir; kontrol uzunluga bakmak zorunda.
  if (!out.notes.sleeve && out.notes.armholePts && out.notes.armholePts.length && P.neckFinish &&
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

  // ⭐ DÜĞMELER — ön görünüşte, ön orta hattın üstünde, kalıptan okunarak.
  // Ön ortadaki derinlik kesri kalıbın kendi düğme y'sinden; flat'teki karşılığı
  // aynı kesir, silüetin ön orta (x=0) açıklığında. Mirror YOK: düğme ön ortada
  // TEK sıradır, `interior` listesine konulsa iki kez üst üste çizilirdi.
  if (F && P.bodice && P.bodice.on && P.bodice.on.piece) {
    const dug = dugmeleriOku(P.bodice.on.piece);
    if (dug.length) {
      const kb = P.bodice.on.piece.commands.filter((c) => c.type !== 'close');
      const kY0 = Math.min(...kb.map((c) => c.y));
      const kY1 = Math.max(...kb.map((c) => c.y));
      const cf = closed.flatMap((s) => s.p).filter((q) => Math.abs(q[0]) <= 2.0);
      if (kY1 > kY0 && cf.length >= 2) {
        const fY0 = Math.min(...cf.map((q) => q[1]));
        const fY1 = Math.max(...cf.map((q) => q[1]));
        for (const b of dug) {
          // KESIRSEL esleme: kalibin ON ORTA acikligindaki derinlik orani,
          // flat'in ON ORTA acikligina. 1:1 mm de denendi ve ELENDI (olculdu):
          // flat'in on orta acikligi manken donusumundan sonra kalibin panel
          // boyundan KISA, o yuzden mutlak mm son iki dugmeyi ust uste yigiyor.
          // Oran, iki uzayda da AYNI seyi (yakadan etege giden yol) olcer.
          const t = (b.y - kY0) / (kY1 - kY0);
          const y = fY0 + t * (fY1 - fY0);
          const r = b.r;
          const k = 0.5522847498 * r;
          const Y = flipY;   // P.flipY bir FONKSIYON (flat-geom polyD imzasi), bayrak degil
          const d = `M ${r.toFixed(3)} ${Y(y).toFixed(3)}` +
            ` C ${r.toFixed(3)} ${Y(y + k).toFixed(3)} ${k.toFixed(3)} ${Y(y + r).toFixed(3)} 0 ${Y(y + r).toFixed(3)}` +
            ` C ${(-k).toFixed(3)} ${Y(y + r).toFixed(3)} ${(-r).toFixed(3)} ${Y(y + k).toFixed(3)} ${(-r).toFixed(3)} ${Y(y).toFixed(3)}` +
            ` C ${(-r).toFixed(3)} ${Y(y - k).toFixed(3)} ${(-k).toFixed(3)} ${Y(y - r).toFixed(3)} 0 ${Y(y - r).toFixed(3)}` +
            ` C ${k.toFixed(3)} ${Y(y - r).toFixed(3)} ${r.toFixed(3)} ${Y(y - k).toFixed(3)} ${r.toFixed(3)} ${Y(y).toFixed(3)} Z`;
          out.paths.push({ rol: 'dugme', d, w: W_TOPSTITCH,
            extra: ` data-view="front" data-dugme-r-mm="${r.toFixed(2)}"`, dash: null });
        }
        out.notes.dugmeSayisi = dug.length;
      }
    }
  }

  // =========================================================================
  // ⭐ GIYSIYI ADIYLA CIZEN OZELLIKLER (M3-primitif, 2026-09-03)
  //
  // HAKEM TESPITI, ADIYLA: "cizilen 6 kompozisyonun 4'unde giysinin ADINI
  // VEREN ozellik CIZIMDE YOK (K1 buzgu, K3 katman, K7 fermuar+manset, K8 cep)."
  // Kalip o ozellikleri TASIYOR — motor "Shirred Waist Panel", "Pocket Bag",
  // "Ruffle tier 1..3", "Hem Flounce", "Button Cuff" parcalarini ve
  // `closure` / `markings` / `notches` katmanlarini basiyor — ama bu dosya
  // onlarin hicbirini OKUMUYORDU. Asagidaki blok her birini kalibin KENDI
  // milimetresinden cizer; tek bir konum, tek bir derinlik, tek bir aralik
  // burada SECILMEZ, hepsi parcanin kendi geometrisinden ya da kendi
  // markings/notches katmanindan okunur.
  //
  // OLCEK: kalip mm -> cizim mm. Cizim 1:1 oldugu icin Y birebir; X ise manken
  // donusumunden (mankenWarp) sonra genisledigi icin govdenin kendi en genis
  // yarim-genisligi oraniyla tasinir. Oran her cizgide data-olcek olarak ILAN
  // edilir, yani okuyan tersine cevirebilir.
  // =========================================================================
  {
    const kapaliPts = closed.flatMap((s) => s.p);
    const flatMaxX = kapaliPts.length ? Math.max(...kapaliPts.map((q) => Math.abs(q[0]))) : 0;
    const govdeParca = [bod, skirtP].filter(Boolean).map((w) => w.piece);
    const cfQ = kapaliPts.filter((q) => Math.abs(q[0]) <= 2.0);
    const yQ = cfQ.length ? cfQ : kapaliPts;
    const fY0 = yQ.length ? Math.min(...yQ.map((q) => q[1])) : 0;
    const fY1 = kapaliPts.length ? Math.max(...kapaliPts.map((q) => q[1])) : 0;
    // Bel dikisi (varsa) — hem placket'in alt sinirini hem buzgu panosunun
    // oturdugu cizgiyi verir. Manken donusumunden GECMIS hali okunur.
    let belSeam = null;
    for (const [rol, geom, isPoly] of interior) {
      if (rol !== 'bel-dikisi' || !isPoly || geom.length < 2) continue;
      // Ayni on-orta kirpmasi: bant cizgileri bel dikisinin KOPYASI oldugu icin
      // kirpilmamis hali aynalaninca ayni papyonu bir kat daha basiyordu.
      const g2 = Math.min(...geom.map((p) => p[0])) < -0.5 ? cfKirp(geom) : geom;
      if (!belSeam || g2.length > belSeam.length) belSeam = g2;
    }
    const belY = belSeam ? Math.min(...belSeam.map((p) => p[1])) : null;
    // ⚖ OLCEK BOLGESEL. Tek bir govde orani kullanmak, ETEGIN kendi yarim
    // genisligini BEDENIN oraniyla tasiyordu ve yan dikis cebinin agzi silüetin
    // DISINA dusuyordu (K8, ilk basim). Her parca kendi dikey araliginda cizimin
    // o araliktaki gercek yarim genisligiyle olceklenir.
    const sxBolge = (piece, yUst, yAlt) => {
      const kb = piece.commands.filter((c) => c.type !== 'close');
      const pMax = Math.max(...kb.map((c) => c.x));
      const q = kapaliPts.filter((p) => p[1] >= yUst - 1 && p[1] <= yAlt + 1);
      const fMax = q.length ? Math.max(...q.map((p) => Math.abs(p[0]))) : flatMaxX;
      return pMax > 0 ? fMax / pMax : 1;
    };
    const yBel = belY === null ? fY1 : belY;
    const sxUst = bod ? sxBolge(bod.piece, fY0, yBel) : 1;
    const sxAlt = skirtP ? sxBolge(skirtP.piece, yBel, fY1) : sxUst;
    const oz = (rol, pts, w, ad, sx, ek = '') => {
      if (!pts || pts.length < 2) return;
      push(rol, polyD(pts, flipY), w,
           ` data-view="${F ? 'front' : 'back'}" data-ozellik="${ad}"` +
           ` data-olcek="${sx.toFixed(6)}"${ek}`, pts);
    };
    const ozAyna = (rol, pts, w, ad, sx, ek = '') => {
      oz(rol, pts, w, ad, sx, `${ek} data-yan="sag"`);
      oz(rol, pts.map((p) => [-p[0], p[1]]), w, ad, sx, `${ek} data-yan="sol"`);
    };
    // Bir parcanin kendi y araligini cizimin bir y araligina tasiyan esleme.
    const esle = (piece, yUst, yAlt) => {
      const kb = piece.commands.filter((c) => c.type !== 'close');
      const y0 = Math.min(...kb.map((c) => c.y)), y1 = Math.max(...kb.map((c) => c.y));
      const dy = (y1 - y0) || 1;
      return (y) => yUst + ((y - y0) / dy) * (yAlt - yUst);
    };
    const kapanis = (bod && bod.piece.closure) || '';

    // --- KAPAMA (dugme patasi). Kalibin KENDI pata isaretlerinden: kapama
    // (katlama) cizgisi, pata/tela kenari, ve asimetrikse gercek ON ORTA
    // referans cizgisi. AYNA YOK — bir pata giyside TEK tanedir; aynalanirsa
    // asimetrik bir kapama simetrik gorunur, ki K4'un "asimetrik" adinin
    // ciziminde kaybolmasinin sebebi tam olarak buydu (hakem maddesi 5).
    if (F && bod && /placket/.test(kapanis)) {
      const mY = esle(bod.piece, fY0, yBel);
      const m = bod.piece.markings || [];
      const kb = bod.piece.commands.filter((c) => c.type !== 'close');
      const boy = Math.max(...kb.map((c) => c.y)) - Math.min(...kb.map((c) => c.y));
      for (let i = 0; i + 1 < m.length; i++) {
        if (m[i].type !== 'move' || m[i + 1].type !== 'line') continue;
        const a = m[i], b = m[i + 1];
        const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
        if (dx < 0.5 && dy > boy * 0.5) {
          oz('kapama', [[a.x * sxUst, mY(a.y)], [b.x * sxUst, mY(b.y)]], W_SEAM, 'kapama',
             sxUst, ` data-kapama-x-mm="${a.x.toFixed(2)}"`);
        } else if (dy < 0.5 && dx > 1 && dx < 40) {
          oz('kapama', [[a.x * sxUst, mY(a.y)], [b.x * sxUst, mY(b.y)]], W_TOPSTITCH,
             'kapama-dugme', sxUst);
        }
      }
    }

    // --- PILI (ortadan ters kutu pili). Kalip on ortayi pilinin ALTLIGI kadar
    // buyutur (K8 EU38: -80 mm = 2 x 40 mm derinlik); giyside gorunen sey o
    // altligin iki katlama cizgisidir, ON ORTADAN +/- derinlik kadar.
    if (F && bod && /pleat/.test(kapanis)) {
      const kb = bod.piece.commands.filter((c) => c.type !== 'close');
      const derin = Math.abs(Math.min(...kb.map((c) => c.x))) / 2;
      if (derin > 1) {
        ozAyna('pili', [[derin * sxUst, fY0], [derin * sxUst, yBel]], W_SEAM, 'pili', sxUst,
               ` data-pili-derinlik-mm="${derin.toFixed(2)}"`);
      }
    }

    // --- FERMUAR (gorunur/exposed zip). Disler kalibin KENDI `notches`
    // katmanindaki teethGlyph'ten okunur (engine/src/exposedzip.cpp): bir omurga
    // + iki yana donusumlu kisa tirnaklar. Yalniz DIKISIN uzerindekiler alinir
    // (|x| <= 20 mm): ayni katmanda kol oyugu/bel centikleri de duruyor ve
    // filtresiz cizimde iki tanesi giysinin ortasinda ORTASIZ tik olarak
    // basiliyordu (K7 ilk basim).
    {
      const zp = govdeParca.find((p) => /exposed zipper/.test(p.closure || ''));
      if (zp) {
        const mY = esle(zp, fY0, fY1);
        const n = zp.notches || [];
        const sxZ = zp === (skirtP && skirtP.piece) ? sxAlt : sxUst;
        for (let i = 0; i + 1 < n.length; i++) {
          if (n[i].type !== 'move' || n[i + 1].type !== 'line') continue;
          const a = n[i], b = n[i + 1];
          if (Math.abs(a.x) > 20 || Math.abs(b.x) > 20) continue;
          const uzun = Math.abs(b.y - a.y) > Math.abs(b.x - a.x);
          oz('fermuar', [[a.x * sxZ, mY(a.y)], [b.x * sxZ, mY(b.y)]],
             uzun ? W_SEAM : W_TOPSTITCH, 'fermuar', sxZ);
        }
      }
    }

    // --- CEP. Yan dikis cebinin agzi kalibin ETEK parcasina isaret olarak
    // basilmistir (iki uc tirnagi + agiz cizgisi, x yan dikise yakin). Cep
    // parcasi kalipta VARSA cizilir; yoksa hicbir sey uydurulmaz.
    if (P.pocket && skirtP) {
      const sp = skirtP.piece;
      const kb = sp.commands.filter((c) => c.type !== 'close');
      const spMaxX = Math.max(...kb.map((c) => c.x));
      const mY = esle(sp, yBel, fY1);
      // Cep agzi yan dikise SABIT bir uzaklikta durur. Bolge olcegiyle mutlak x
      // basmak onu silüetin DISINA atiyordu (etegin en genis yeri hem, cep ise
      // belin hemen altinda): isaret, CIZILEN yan dikisten iceri dogru kendi
      // olculen uzakligi kadar konur.
      const yanX = (y) => {
        let en = null;
        for (const q of kapaliPts) {
          if (Math.abs(q[1] - y) < 8 && (en === null || Math.abs(q[0]) > en)) en = Math.abs(q[0]);
        }
        return en;
      };
      const m = sp.markings || [];
      for (let i = 0; i + 1 < m.length; i++) {
        if (m[i].type !== 'move' || m[i + 1].type !== 'line') continue;
        const a = m[i], b = m[i + 1];
        if (Math.min(a.x, b.x) < spMaxX * 0.6) continue;   // yan dikise yakin degil
        const ya = mY(a.y), yb = mY(b.y);
        const wa = yanX(ya), wb = yanX(yb);
        if (wa === null || wb === null) continue;
        ozAyna('cep', [[wa - (spMaxX - a.x) * sxAlt, ya], [wb - (spMaxX - b.x) * sxAlt, yb]],
               W_SEAM, 'cep', sxAlt);
      }
    }

    // --- BUZGU: BEL PANOSU. Pano bir kumas seridi: uzun kenari kesim boyu,
    // KISA kenari panonun derinligi. Bel dikisinden o derinlik kadar asagi
    // inen bir bant cizilir ve panonun KENDI markings katmanindaki buzgu
    // siralari (lastik dikis satirlari) kendi kesirlerinde basilir.
    if (P.waistPanel && belSeam) {
      const wp = P.waistPanel;
      const b = bbox(segsFromCommands(wp.commands));
      const derin = Math.min(b.x1 - b.x0, b.y1 - b.y0);
      if (derin > 1) {
        const kaydir = (f) => belSeam.map((p) => [p[0], p[1] + f * derin]);
        ozAyna('buzgu', kaydir(1), W_SEAM, 'buzgu-pano', sxAlt,
               ` data-pano-derinlik-mm="${derin.toFixed(2)}"`);
        for (const mk of (wp.markings || [])) {
          if (mk.type !== 'move') continue;
          const f = (mk.y - b.y0) / ((b.y1 - b.y0) || 1);
          if (f <= 0.01 || f >= 0.99) continue;
          ozAyna('buzgu', kaydir(f), W_TOPSTITCH, 'buzgu-sira', sxAlt);
        }
        // Buzgu taragi: bant boyunca dik tikler — kanunun kendi olculmus
        // sikligiyla (sevkPoz.buzgu.tarak.aralikOran).
        const adet = Math.max(1, Math.round(1 / BUZGU_TARAK_ARALIK_ORAN) - 1);
        for (const [q0, q1] of buzguIsaretleri(kaydir(0.5), adet, derin * 0.8)) {
          ozAyna('buzgu', [q0, q1], W_TOPSTITCH, 'buzgu-tarak', sxAlt);
        }
      }
    }

    // --- KATMAN (kademeli firfir + etek ucu volani). Her katman bir kumas
    // seridi: UZUN kenari kesim cevresi, KISA kenari derinligi. On gorunumde
    // cizilen yarim genislik cevrenin CEYREGIDIR (etek on paneli 239.7 mm =
    // 958.8 mm cevrenin ceyregi — kalibin kendi sayisi). Katmanlar hem
    // cizgisinden asagi asilir; SIRA parca listesinin sirasi degil GIYSININ
    // sirasidir: numarali firfir kademeleri once, bitmis hemden ayri asilan
    // volan/peplum EN ALTTA.
    if (P.katmanlar && P.katmanlar.length && kapaliPts.length) {
      const sira = P.katmanlar.slice().sort((a, b2) => {
        const k = (n) => (/Flounce|Peplum/.test(n) ? 1e6 : 0) +
          (parseInt((/(\d+)/.exec(n) || [0, 0])[1], 10) || 0);
        return k(a.name) - k(b2.name);
      });
      let y = fY1;
      let oncekiCevre = null;
      for (const p of sira) {
        const b = bbox(segsFromCommands(p.commands));
        const uzun = Math.max(b.x1 - b.x0, b.y1 - b.y0);
        const derin = Math.min(b.x1 - b.x0, b.y1 - b.y0);
        if (!(uzun > 0 && derin > 0)) continue;
        const w = (uzun / 4) * sxAlt;
        // ⚠ OLCULEN UYUSMAZLIK, GIZLENMEDI: bir katman kendi ustundeki katmanin
        // ALT kenarindan KISA cikabiliyor. K3 EU38'de olculdu: Hem Flounce 988.8
        // mm (etegin kendi hem cevresine gore cizilmis) ama uzerine dikilecegi
        // Ruffle tier 3'un alt kenari 1361.9 mm — 373.1 mm eksik. Kok sebep
        // KALIPTA: hemflounce blogu firfir kademelerinden HABERSIZ, hemi olcuyor.
        // Cizim onu duzeltmez (duzeltirse kalibi yalanlar); FARKI ILAN EDER.
        const eksik = oncekiCevre !== null && uzun < oncekiCevre - 1
          ? ` data-katman-eksik-mm="${(oncekiCevre - uzun).toFixed(2)}"` : '';
        const ek = ` data-katman="${p.name.replace(/"/g, '')}"` +
                   ` data-katman-derinlik-mm="${derin.toFixed(2)}"` +
                   ` data-katman-cevre-mm="${uzun.toFixed(2)}"${eksik}`;
        oncekiCevre = uzun;
        oz('katman', [[-w, y], [w, y]], W_SEAM, 'katman-dikis', sxAlt, ek);
        oz('katman', [[-w, y], [-w, y + derin], [w, y + derin], [w, y]], W_OUTLINE,
           'katman-kontur', sxAlt, ek);
        const adet = Math.max(1, Math.round(1 / BUZGU_TARAK_ARALIK_ORAN) - 1);
        for (const [q0, q1] of buzguIsaretleri([[-w, y], [w, y]], adet, Math.min(derin * 0.4, 14))) {
          oz('buzgu', [q0, q1], W_TOPSTITCH, 'katman-buzgu', sxAlt, ek);
        }
        y += derin;
      }
      out.notes.katmanSayisi = P.katmanlar.length;
    }
  }

  for (const [rol, geomHam, isPoly] of interior) {
    // ⭐ BEL DIKISI ON ORTAYI GECEMEZ — "PAPYON" KUSURUNUN KOKU (M3-primitif).
    // Kruvaze (surplice) bir onde beden panelinin alt kenari ON ORTAYI 116.4 mm
    // ASIYOR (olculdu, K1 EU38: sag yarim bel dikisi x = 211.5 .. -116.4).
    // Bu kenar bir yarim olarak cizilip AYNALANINCA iki cizgi belin altinda
    // birbirini kesiyor ve giysinin beline bir PAPYON basiyordu. Bir bel dikisi
    // giysinin oteki yarisina gecemez: kenar on ortada KESILIR (kesisme noktasi
    // dogrusal olarak bulunur, bir nokta bile uydurulmaz), ayna ondan sonra
    // alinir. Kirpma yalniz gercekten gecen kenarda calisir (-0.5 mm esigi),
    // yani gecmeyen her cizim BAYT-AYNI kalir.
    const geom = (isPoly && geomHam.length &&
                  Math.min(...geomHam.map((p) => p[0])) < -0.5)
      ? cfKirp(geomHam) : geomHam;
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
    const bz = P.buzgu || { kapak: null, etek: null };
    // ★ THE PUFF, DRAWN AS THE CONSEQUENCE OF ITS OWN SURPLUS (M1-puf).
    //
    // Until today a puff sleeve printed as the same straight cone as a plain
    // one (KOSU/ciktilar/kusur-listesi.md A1: "balon kol PUF hacmi yok ... kol
    // dogru sarkik ama 'balon' degil 'genis duz' okunuyor"). The reason was not
    // taste: the outer contour was a STRAIGHT segment S -> out, and a straight
    // segment cannot hold surplus cloth.
    //
    // Laid flat, a gathered cap's surplus has exactly one place to go: the
    // outer contour bows away from the body. So the contour is drawn as a
    // circular arc on the SAME chord (S -> out, the pattern's own fold length)
    // whose ARC LENGTH is that chord plus this half's share of the measured
    // surplus, (capMM - armholeMM) / 2. Nothing here is chosen — the chord is
    // the pattern's, the surplus is the pattern's, and the bulge is the only
    // circular arc that joins them. A plain cap (ease, below BUZGU_ESIK) is
    // never gathered, so its contour stays the straight line it always was.
    // The references draw exactly this (GIRDI/iyi-flat/adaylar/09, 04, 06).
    const yay = (A, B, fazlaMM) => {
      const kiris = norm(sub(B, A));
      if (!(kiris > EPS) || !(fazlaMM > 0)) return [A, B];
      // DIRECTION: away from the fold line, on the outboard side (+x on this
      // half, which is the half that is drawn — the other is its mirror). That
      // is where a puff's fullness sits.
      //
      // ⚖ THE SHOULDER-HORIZONTAL CLAMP IS GONE, AND THE LAW SAYS SO BY NAME.
      // The first cut clamped every point of this curve to the shoulder line,
      // because sevkPoz's sentence reads "kol ASLA omuz yatayinin ustune
      // cikmaz". That sentence was written for a PLAIN sleeve (it lives in
      // kolAcisiDeg._kaynak, the block that sets the 20-40 deg hang), and the
      // clamp printed the fault it was supposed to prevent: 83% of the sleeve's
      // horizontal reach came out as a flat shelf welded to the shoulder line —
      // a square epaulette, not a puff. sevkPoz.buzgu.omuzUstuKubbe is the named
      // exception, sourced to the same three reference flats the puff shape
      // itself is sourced to (GIRDI/iyi-flat/adaylar/04, 06, 09), in all three
      // of which the gathered crown DOMES ABOVE the shoulder line while the
      // sleeve body still hangs. Gate (j1) reads that exception; gate (j4)
      // measures the shelf that replaced it (<= 20% of the sleeve's horizontal
      // reach may lie on the shoulder horizontal).
      const d = unit(sub(B, A));
      let dik = [d[1], -d[0]];
      if (dik[0] < 0) dik = [-dik[0], -dik[1]];
      // With the clamp gone the push direction is the PERPENDICULAR to the fold
      // line, plain. The bisector with "straight outboard" only existed to keep
      // the bump under the clamp; unclamped it pushes the crown sideways into
      // the same shelf. Perpendicular is where a gathered cap's surplus
      // physically goes when the sleeve is laid flat: square out of the seam.
      const nrm = dik;
      const N = 28;
      // PROFILE. Zero at both seam ends, crest at t = 0.25 — the fullness sits
      // where the gathers are, at the cap, and the contour tapers to the hem.
      // The exponent 0.5 is not decoration: it makes the slope at t = 0 INFINITE,
      // so the contour leaves the shoulder point square out of the seam and
      // climbs. The previous cosine profile left A tangentially ALONG the chord
      // (slope 0 at t = 0), so the puff's first 70 mm ran flat across the
      // shoulder line before it began to rise — half of the 41% shelf (j4)
      // measured after the clamp came off was that tangent, not the clamp.
      const bump = (t) => Math.sin(Math.PI * Math.sqrt(t));
      const cizgi = (amp) => {
        const pts = [];
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          pts.push(add(lerp(A, B, t), scale(nrm, amp * bump(t))));
        }
        return pts;
      };
      const boy = (amp) => { const q = cizgi(amp); let L = 0; for (let i = 1; i < q.length; i++) L += norm(sub(q[i], q[i - 1])); return L; };
      const hedef = kiris + fazlaMM;
      let lo = 0, hi = Math.max(kiris, fazlaMM) * 6;
      if (boy(hi) < hedef) return cizgi(hi);
      for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (boy(mid) < hedef) lo = mid; else hi = mid; }
      return cizgi((lo + hi) / 2);
    };
    const ustKenar = bz.kapak ? yay(g.S, g.out, bz.kapak.fazlaMM / 2) : [g.S, g.out];
    const shape = ustKenar.concat(g.under.slice().reverse());
    const attr = (yan) => ` data-view="${F ? 'front' : 'back'}" data-yan="${yan}"` +
      ` data-kol-aci="${g.angleDeg.toFixed(2)}" data-kol-olcek="${g.olcek.toFixed(4)}"` +
      (bz.kapak ? ` data-buzgu-kapak-oran="${bz.kapak.oran.toFixed(4)}"` +
                  ` data-buzgu-kapak-fazla-mm="${bz.kapak.fazlaMM.toFixed(2)}"` : '') +
      (bz.etek ? ` data-buzgu-etek-oran="${bz.etek.oran.toFixed(4)}"` : '');
    // The cuff seam, or failing that the sleeve hem's stitch line. The depth is
    // the drafted cuff piece's own short side, not a drawn-in number.
    // ⭐ MANSET BIR DIKIS, UST DIKIS DEGIL (M3-primitif, 2026-09-03). Kalipta
    // gercek bir manset BANDI varsa (Button Cuff / Ribbed Cuff), kolun ucundaki
    // o cizgi bir topstitch degil, iki ayri kumas parcasinin BIRLESIM DIKISIDIR
    // ve kanunun 1.0 duz sinifiyla cizilir. Manset yoksa cizgi eskisi gibi
    // etegin kendi ust dikisidir (0.5 kesik).
    const depth = P.cuff ? stripDepth(P.cuff) : (P.sleeve.seamAllowance || 0);
    if (depth > 0) {
      const mansetli = !!P.cuff;
      const rolM = mansetli ? 'manset' : 'dikis-izi';
      const wM = mansetli ? W_SEAM : W_TOPSTITCH;
      const dM = mansetli ? null : DASH_TOPSTITCH;
      const ekM = mansetli ? ` data-ozellik="manset" data-manset-derinlik-mm="${depth.toFixed(2)}"` : '';
      const c = [sub(g.out, scale(g.d, depth)), sub(g.inn, scale(g.d, depth))];
      push(rolM, polyD(c, flipY), wM, ` data-view="${F ? 'front' : 'back'}" data-yan="sag"${ekM}`, c, dM);
      const cm = c.map((p) => [-p[0], p[1]]);
      push(rolM, polyD(cm, flipY), wM, ` data-view="${F ? 'front' : 'back'}" data-yan="sol"${ekM}`, cm, dM);
    }
    push('kol', polyD(shape, flipY), W_OUTLINE, attr('sag'), shape);
    push('kol', polyD(shape.map((p) => [-p[0], p[1]]), flipY), W_OUTLINE, attr('sol'),
         shape.map((p) => [-p[0], p[1]]));

    // BÜZGÜ COMB. Short ticks across the gathered seam — the standard notation
    // for "the fullness is drawn up here". Class: 0.5 SOLID — the thinnest
    // weight of the 4:2:1 hierarchy, and solid because the law reserves the
    // DASHED 0.5 for `dikis-izi` (topstitch) alone.
    //
    // ⭐ DENSITY IS MEASURED, AND IT IS NOT THE PATTERN'S NOTCH COUNT (2026-09-03).
    // Round 2 drew THREE ticks here, because it took the count from the pattern
    // piece's own gather marks. Three ticks is a notch drawing, not a gather:
    // reference 09 runs a comb of THIRTEEN ticks over 87% of the cap seam
    // (measured px-by-px, contract flat-convention-v1 sevkPoz.buzgu.tarak).
    // Two different quantities were being equated — the pattern's three marks
    // are the Bugra Lower Sleeve's measured ALIGNMENT notches (a sewing
    // instruction), the drawing's comb is a NOTATION density. The count below
    // comes from the measured spacing so the comb covers the seam the way the
    // reference does; the pattern's own count is untouched and still rides on
    // the piece.
    const isaretAdet = Math.max(1, Math.round(1 / BUZGU_TARAK_ARALIK_ORAN) - 1);
    const tikMM = Math.max(6, (P.sleeve.seamAllowance || 15) * 0.7);
    // The comb declares the seam it sits on, in drawn mm, so its COVERAGE is a
    // measurement and not an arithmetic identity: the gate compares the span of
    // the marks against this length (contract sevkPoz.buzgu.tarak.kapsamaOranMin).
    const bzAttr = (yan, tur, o, dikisMM) =>
      ` data-view="${F ? 'front' : 'back'}" data-yan="${yan}"` +
      ` data-buzgu="${tur}" data-buzgu-oran="${o.toFixed(4)}"` +
      ` data-buzgu-dikis-mm="${dikisMM.toFixed(2)}"`;
    const bzPush = (segler, tur, o, dikisMM) => {
      for (const [a, b] of segler) {
        push('buzgu', polyD([a, b], flipY), W_TOPSTITCH, bzAttr('sag', tur, o, dikisMM), [a, b]);
        const m = [[-a[0], a[1]], [-b[0], b[1]]];
        push('buzgu', polyD(m, flipY), W_TOPSTITCH, bzAttr('sol', tur, o, dikisMM), m);
      }
    };
    if (bz.kapak && out.notes.armholePts) {
      bzPush(buzguIsaretleri(out.notes.armholePts, isaretAdet, tikMM, 'disari'), 'kapak', bz.kapak.oran,
             poliUzunluk(out.notes.armholePts));
    }
    if (bz.etek && depth > 0) {
      const c = [sub(g.out, scale(g.d, depth)), sub(g.inn, scale(g.d, depth))];
      bzPush(buzguIsaretleri(c, isaretAdet, tikMM), 'etek', bz.etek.oran, poliUzunluk(c));
    }
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
      // G2-goz (2026-09-02): the collar is CLOTH LYING ON TOP of the garment,
      // and it was drawn at seam weight — a pale ghost behind the bold posed
      // neckline underneath it. Every vendor reference draws the collar's own
      // edge at full contour weight (it IS an outer edge of cloth). Outline
      // weight is a declared class of the law, so gate (i) stays green.
      for (const s of sh) {
        push('yaka', polyD(s.pts, flipY, s.kapali), W_OUTLINE, attr('sag'), s.pts);
        const mir = s.pts.map((p) => [-p[0], p[1]]);
        push('yaka', polyD(mir, flipY, s.kapali), W_OUTLINE, attr('sol'), mir);
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
// DÜĞMELER — ÇİZİLEN KALIBIN KENDİ DÜĞMELERİ (2026-09-03, hakem K7)
// ---------------------------------------------------------------------------
// Motor düğmeyi ÇİZİYOR: engine/src/buttonrow.cpp `buttonCircle` her düğmeyi
// dört kübik çeyrek yayla bir kapalı daire olarak `markings`e basar (ölçüldü,
// EU38 Bugra spec'i: Top Front markings 110 komut, 7 düğme). Ama teknik çizim
// o katmanı HİÇ OKUMUYORDU: `buttonRow: 'functional'` diyen bir sayfa düğmesiz
// bir giysi basıyordu ve sayfanın kendi başlığı "düğmeli" diyordu. Bu bir motor
// eksiği değil, iki katman arasındaki KOPUKLUKTU.
//
// Burada hiçbir sayı uydurulmaz: düğme SAYISI, YARIÇAPI ve ön ortadaki DERİNLİK
// KESRİ üçü de kalıp parçasının kendi işaretlerinden okunur; flat sadece onları
// kendi ön-orta hattına izdüşürür (flat = kalıbın izdüşümü).
function dugmeleriOku(piece) {
  const cs = [];
  const m = (piece && piece.markings) || [];
  for (let i = 0; i + 5 < m.length; i++) {
    if (m[i].type !== 'move' || m[i + 5].type !== 'close') continue;
    let dortYay = true;
    for (let k = 1; k <= 4; k++) if (m[i + k].type !== 'curve') dortYay = false;
    if (!dortYay) continue;
    // Dört yayın uç noktaları dairenin dört ana yönü: ortalaması merkez,
    // merkeze uzaklıkları yarıçap. Bir buttonCircle'ın tanımı budur.
    const q = [m[i + 1], m[i + 2], m[i + 3], m[i + 4]].map((c) => [c.x, c.y]);
    const cx = q.reduce((a, b) => a + b[0], 0) / 4;
    const cy = q.reduce((a, b) => a + b[1], 0) / 4;
    const r = q.reduce((a, b) => a + Math.hypot(b[0] - cx, b[1] - cy), 0) / 4;
    // Bir daire olduğunun mandalı: dört uç merkeze EŞİT uzaklıkta.
    if (!(r > 0.5)) continue;
    if (q.some((b) => Math.abs(Math.hypot(b[0] - cx, b[1] - cy) - r) > 0.05 * r)) continue;
    cs.push({ y: cy, r });
    i += 5;
  }
  return cs;
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
  const P = {
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
    // ⭐ M3-primitif (2026-09-03). Bu üç satıra kadar bu tablo giysinin ADINI
    // veren parçaları HİÇ tanımıyordu: kalıpta "Shirred Waist Panel", "Pocket
    // Bag", "Ruffle tier 1..3", "Hem Flounce" diye parçalar duruyor, çizimde
    // hiçbiri yoktu ve dosya bunu şikayet bile etmiyordu. Sonuç: "büzgülü bel"
    // adlı giysinin çiziminde büzgü, "cepli" giysinin çiziminde cep, "katmanlı
    // etek"in çiziminde katman YOKTU — kapı da yalnız "taban ile bayt-aynı
    // değil" diye baktığı için hepsini yeşil yakıyordu (hakem tespiti).
    waistPanel: pick(ps, /Waist Panel/),
    pocket: pick(ps, /Pocket/),
    katmanlar: ps.filter((p) => /(Ruffle tier|Flounce|Peplum)/.test(p.name)),
  };
  // Tabloya oturmayan BEDEN SINIFI parcalar. Bir kesim parcasi (biye, kemer,
  // firfir, bagcik) burada sayilmaz; sayilan sey govdenin kendisini tasiyan
  // panellerdir, cunku ciziminde onlarin eksikligi giysinin SINIFINI degistirir.
  const secilen = new Set([P.bodice.on, P.bodice.arka, P.bodiceSide.on, P.bodiceSide.arka]
    .filter(Boolean).map((w) => w.piece.name));
  P.tanimsizBeden = ps.map((p) => p.name)
    .filter((n) => /(Yoke|Bodice|Cup|^Top |Body)/.test(n) && !secilen.has(n));
  // BÜZGÜ is read once, off the assembled pieces, and shared by both views.
  P.buzgu = buzguOku(P);
  return P;
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
  // ⭐ ON GORUNUM ZORUNLU (M3-primitif, 2026-09-03). OLCULEN HATA: kup dikisli
  // bustiyerde on beden panelleri "Front Body Center Front" / "Upper Cup ..."
  // diye adlandiriliyor, tablo onlari tanimiyor, ON gorunum bos donuyor — ve
  // ARKA cizildigi icin bu satirin eski hali (yalniz "hicbir gorunum yok" mu
  // diye bakan hali) dosyayi GECIRIYORDU. Sonuc, satici tarafinda yalnizca
  // SIRTI cizilmis bir teknik cizimdi (K5, ilk basim). Arkasi olmayan bir flat
  // eksiktir; ONU olmayan bir flat yanlistir.
  if (!drawn.some((d) => d.which === 'on')) {
    throw new Error('flat: ON gorunum cizilemedi — ' +
      (views.find((v) => v.which === 'on') || { sebep: [] }).sebep.join('; '));
  }

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
