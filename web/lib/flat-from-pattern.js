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
// Three things are constructed rather than copied, and each is named where it
// happens: closing the darts (the sewn waist is narrower than the flat panel),
// swinging the sleeve out (one degree of freedom the pattern does not fix, and
// it is SOLVED from the pattern's own three lengths, not chosen), and bending
// the collar onto the neckline.
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
const W_SEAM = 1.4;      // contract/flat-convention-v1.json lineClasses.classes.seam.width

import {
  add, sub, scale, norm, unit, lerp, rotAbout,
  segsFromCommands, polysFromCommands, samplePoly, polyLength, chainLength,
  cumFrac, atFrac, nearestIdx, mapSegs, reverseSegs, mirrorSegs, rampSegs,
  pathD, polyD, segsFromPoly, bbox,
} from './flat-geom.js?v=141';

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
// 3. THE SLEEVE — the one degree of freedom, and it is solved, not picked
// ---------------------------------------------------------------------------
// Sewn in and laid flat, a sleeve is a folded tube hanging off the armhole. The
// pattern fixes three lengths and two anchor points and leaves exactly one
// thing free, the arm angle:
//
//   S  shoulder tip   = the armhole edge's start point   (edgeRoles)
//   U  underarm point = the armhole edge's end point     (edgeRoles)
//   Lf fold length    = cap apex -> hem centre, along the grain
//   Lu underarm seam  = the sleeve's own sleeve_underarm edge  (edgeRoles)
//   Lh half hem       = hem centre -> underarm seam
//
// With the fold line and the underarm seam parallel (they are, to the taper),
// the hem closes the figure, and |(Lf - Lu)*d - (U - S)| = Lh has ONE outward
// solution for the direction d. So the arm angle is read off the sleeve, not
// chosen to look nice: a puff sleeve and a long straight sleeve come out at
// different angles because their cap heights differ. When the triangle does not
// close (a sleeve so short the hem cannot reach), we say so by name instead of
// drawing a plausible sleeve — `sebep` travels out with the drawing.
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

  const v = sub(U, S), Lv = norm(v);
  const dL = Lf - Lu;
  if (dL <= 1e-6 || Lv < 1e-6) return { sebep: 'kol katlanma boyu koltukalti dikisinden kisa' };
  const cosPhi = (dL * dL + Lv * Lv - Lh * Lh) / (2 * dL * Lv);
  if (!(cosPhi >= -1 && cosPhi <= 1)) {
    return { sebep: `kol ucgeni kapanmiyor (Lf=${Lf.toFixed(1)} Lu=${Lu.toFixed(1)} Lh=${Lh.toFixed(1)} |SU|=${Lv.toFixed(1)})` };
  }
  const phi = Math.acos(cosPhi);
  const av = Math.atan2(v[1], v[0]);
  // Two branches; the outward one is the one whose hem centre lands further from
  // the centre front than the shoulder tip does. An arm folded across the body
  // is the other root and is never the answer for a flat.
  const cand = [av - phi, av + phi].map((a) => {
    const d = [Math.cos(a), Math.sin(a)];
    return { d, out: add(S, scale(d, Lf)), inn: add(U, scale(d, Lu)) };
  });
  const pick = cand[0].out[0] >= cand[1].out[0] ? cand[0] : cand[1];

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
  const va = sub(a1, a0), vb = sub(pick.inn, U);
  const la = norm(va), lb = norm(vb);
  const k = la < 1e-6 ? 1 : lb / la;
  const th = Math.atan2(vb[1], vb[0]) - Math.atan2(va[1], va[0]);
  const cs = Math.cos(th) * k, sn = Math.sin(th) * k;
  const under = uPts.map((p) => {
    const d0 = sub(p, a0);
    return [U[0] + d0[0] * cs - d0[1] * sn, U[1] + d0[0] * sn + d0[1] * cs];
  });
  return { S, U, out: pick.out, inn: pick.inn, d: pick.d, Lf, Lu, Lh, under, olcek: k,
           angleDeg: Math.atan2(pick.d[1], pick.d[0]) * 180 / Math.PI };
}

// ---------------------------------------------------------------------------
// 4. THE COLLAR — bent onto the neckline it was drafted for
// ---------------------------------------------------------------------------
// A collar piece is drafted flat. On the garment it lies along the neckline. So
// it is re-parameterised by arc length onto the neckline and offset along the
// neckline's outward normal by its OWN width, sampled from its own two edges.
// The width profile is the collar's; only the spine it hangs on is the
// neckline's. A stand collar and a Peter Pan collar therefore come out with
// different depths without either number being written here.
//
// `f0`..`f1` is the SHARE of the collar this view gets. It is not a guess: at
// EU38 the drafted Peter Pan collar's neck edge is 205.3 mm and the front and
// back half necklines are 131.7 and 73.6 mm — the collar is drafted for one
// half of the garment, front plus back, and 131.7 + 73.6 = 205.3 exactly. So the
// split is measured off the two panels every run, and a collar whose neck edge
// does not match the neckline (a stand collar is 190.3 mm) is re-parameterised
// with the ratio PRINTED on the path, not silently stretched.
function collarOnNeck(collar, neckPts, hollow, f0, f1) {
  const segs = segsFromCommands(collar.commands);
  if (segs.length < 3) return null;
  const all = segs.flatMap((s) => s.p);
  const yTop = Math.min(...all.map((p) => p[1]));
  const inner = segs.filter((s) => Math.abs(s.p[0][1] - yTop) < 1 && Math.abs(s.p[3][1] - yTop) < 1);
  if (!inner.length) return null;
  const outer = segs.filter((s) => !inner.includes(s));
  if (!outer.length) return null;
  const ip = samplePoly(inner, 24), op = samplePoly(reverseSegs(outer), 24);
  const ic = cumFrac(ip), oc = cumFrac(op);

  const nc = cumFrac(neckPts);
  const N = 28, edge = [];
  for (let k = 0; k <= N; k++) {
    const g = k / N;                 // along THIS view's neckline
    const f = f0 + (f1 - f0) * g;    // the matching place on the collar
    const a = atFrac(ip, ic, f).p;
    const b = atFrac(op, oc, f).p;
    const w = norm(sub(b, a));
    const on = atFrac(neckPts, nc, g);
    let nrm = [-on.tan[1], on.tan[0]];
    if (nrm[0] * (on.p[0] - hollow[0]) + nrm[1] * (on.p[1] - hollow[1]) < 0) nrm = scale(nrm, -1);
    edge.push(add(on.p, scale(nrm, w)));
  }
  return { edge, spine: neckPts, neckMM: polyLength(ip), payMM: polyLength(neckPts) };
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
  const push = (rol, d, w, extra = '', pts = null) => {
    if (!d) return;
    out.paths.push({ rol, d, w, extra });
    if (pts) for (const p of pts) boxPts.push(p);
  };
  let half = [];          // the right half of the silhouette, top to bottom
  const interior = [];    // [rol, segsOrPts, isPoly]

  let waistJoinY = null, S = null, U = null;

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
    half = half.concat(d.neck, d.shoulder);
    if (d.armhole.length) {
      S = d.armhole[0].p[0];
      U = d.armhole[d.armhole.length - 1].p[3];
    }
    // The sleeve takes over the silhouette between S and U; the armhole itself
    // becomes an interior seam, which is exactly what a set-in sleeve looks like.
    // The armhole always stays on the body outline. A set-in sleeve is its own
    // closed shape hung off it, which is how every one of the fifteen vendor
    // references in GIRDI/iyi-flat/adaylar is drawn, and it means the armhole
    // line exists exactly ONCE in the file.
    half = half.concat(d.armhole);
    out.notes.armholePts = samplePoly(d.armhole, 24);
    if (P.sleeve && S && U) {
      const g = sleeveGeometry(P.sleeve, S, U);
      if (g.sebep) out.sebep.push(`${which} kol: ${g.sebep}`);
      else out.notes.sleeve = g;
    }
    half = half.concat(sewn.side);
    if (skirtP) {
      // The bodice hem becomes the WAIST SEAM: an interior line, not an edge.
      waistJoinY = sewn.edgePts[sewn.edgePts.length - 1][1];
      interior.push(['bel-dikisi', sewn.edgePts, true]);
    } else {
      half = half.concat(segsFromPoly(sewn.edgePts));
      out.notes.hemPts = sewn.edgePts;
      out.notes.hemSA = bod.piece.seamAllowance;
    }
    // Dart legs: drawn where they are sewn, on the unclosed panel, because that
    // is where the stitch line is on the finished garment.
    for (const leg of sewn.legs) interior.push(['pens', leg, true]);
    out.notes.bodiceWaistSide = sewn.edgePts[0];
    out.notes.neck = samplePoly(d.neck, 24);
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
    if (out.notes.bodiceWaistSide) {
      // The bodice waist and the skirt waist are one seam and they do not land
      // on the same point: the residual is PRINTED (data-bel-kacigi-mm) rather
      // than scaled away, because scaling one of two mating seams to fit the
      // other is how a drawing stops being a measurement.
      const jog = norm(sub(waistSide, out.notes.bodiceWaistSide));
      out.notes.waistJogMM = jog;
      if (jog > 0.2) half = half.concat(segsFromPoly([out.notes.bodiceWaistSide, waistSide]));
    } else {
      half = half.concat(segsFromPoly(sewn.edgePts.map(mv)));
    }
    half = half.concat(mapSegs(sewn.side, mv), mapSegs(d.hem, mv));
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
    const sl = stitchLine(out.notes.armholePts, P.neckFinish.seamAllowance, [-1e4, out.notes.armholePts[0][1]]);
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

  // The half is drawn out and the mirror is DERIVED. A garment drawn twice is
  // two garments.
  const closed = half.concat(mirrorSegs(half));
  const flipY = P.flipY;
  push('siluet', pathD(closed, flipY, true), W_OUTLINE, ` data-view="${F ? 'front' : 'back'}"`,
       closed.flatMap((s) => s.p));

  for (const [rol, geom, isPoly] of interior) {
    const dRight = isPoly ? polyD(geom, flipY) : pathD(geom, flipY);
    const mir = isPoly ? geom.map((p) => [-p[0], p[1]]) : mirrorSegs(geom);
    const dLeft = isPoly ? polyD(mir, flipY) : pathD(mir, flipY);
    const gp = isPoly ? geom : geom.flatMap((s) => s.p);
    const mp = isPoly ? mir : mir.flatMap((s) => s.p);
    push(rol, dRight, W_SEAM, ` data-view="${F ? 'front' : 'back'}" data-yan="sag"`, gp);
    push(rol, dLeft, W_SEAM, ` data-view="${F ? 'front' : 'back'}" data-yan="sol"`, mp);
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
      push('dikis-izi', polyD(c, flipY), W_SEAM, ` data-view="${F ? 'front' : 'back'}" data-yan="sag"`, c);
      const cm = c.map((p) => [-p[0], p[1]]);
      push('dikis-izi', polyD(cm, flipY), W_SEAM, ` data-view="${F ? 'front' : 'back'}" data-yan="sol"`, cm);
    }
    push('kol', polyD(shape, flipY), W_OUTLINE, attr('sag'), shape);
    push('kol', polyD(shape.map((p) => [-p[0], p[1]]), flipY), W_OUTLINE, attr('sol'),
         shape.map((p) => [-p[0], p[1]]));
  }

  // The collar, bent onto this view's own neckline, taking its own share of the
  // one collar piece.
  if (P.collar && out.notes.neck && out.notes.neck.length > 1) {
    // The collar's fraction 0 is the centre-front end, so the front runs
    // centre -> shoulder and the back carries on shoulder -> centre back.
    const spine = F ? out.notes.neck : out.notes.neck.slice().reverse();
    const [f0, f1] = F ? [0, P.collarSplit] : [P.collarSplit, 1];
    const c = collarOnNeck(P.collar, spine, out.notes.hollow, f0, f1);
    if (c) {
      const shape = c.spine.concat(c.edge.slice().reverse());
      const attr = (yan) => ` data-view="${F ? 'front' : 'back'}" data-yan="${yan}"` +
        ` data-yaka-pay="${(c.neckMM / (c.payMM || 1)).toFixed(4)}"`;
      push('yaka', polyD(shape, flipY, true), W_SEAM, attr('sag'), shape);
      push('yaka', polyD(shape.map((p) => [-p[0], p[1]]), flipY, true), W_SEAM, attr('sol'),
           shape.map((p) => [-p[0], p[1]]));
    } else out.sebep.push(`${which} yaka: yaka parcasi bir ic/dis kenara ayrilamadi`);
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
      on:   wrap(pick(ps, /^(Skirt Front|Skirt Center Front|Front)$/)),
      arka: wrap(pick(ps, /^(Skirt Back|Skirt Center Back|Back)$/)),
    },
    skirtSide: {
      on:   wrap(pick(ps, /^Skirt Side Front$/)),
      arka: wrap(pick(ps, /^Skirt Side Back$/)),
    },
    sleeve: pick(ps, /(^|\s)Sleeve$/),
    cuff: pick(ps, /Cuff/),
    collar: pick(ps, /Collar/),
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
  // One collar spans front AND back. Its share of each view is the MEASURED
  // arc-length share of that view's own half neckline — never a half-and-half
  // assumption, which at EU38 would put 102.6 mm of collar on a 73.6 mm back
  // neckline and buckle it.
  const neckLen = (w) => {
    const b = g.bodice[w];
    if (!b) return 0;
    const d = decompose(b.piece);
    return d && d.neck.length ? chainLength(d.neck) : 0;
  };
  const lf = neckLen('on'), lb = neckLen('arka');
  const P = { ...g, flipY: (y) => y, collarSplit: (lf + lb) > 0 ? lf / (lf + lb) : 0.5 };

  const views = ['on', 'arka'].map((w) => buildView(P, w));
  const drawn = views.filter((v) => v.paths.length);
  if (!drawn.length) throw new Error(`flat: hicbir gorunum cizilemedi — ${views.flatMap((v) => v.sebep).join('; ')}`);

  // Layout: the two views side by side, both in the same millimetre frame, so
  // one ruler measures both.
  const boxes = drawn.map((v) => v.box);
  const yLo = Math.min(...boxes.map((b) => b.y0)), yHi = Math.max(...boxes.map((b) => b.y1));
  const wHalf = Math.max(...boxes.map((b) => Math.max(Math.abs(b.x0), Math.abs(b.x1))));
  const pad = 40, gap = 90, panelW = 2 * wHalf, h = yHi - yLo;
  const W = 2 * pad + 2 * panelW + gap, H = 2 * pad + h + 30;
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
    `${(meta.sinif && meta.sinif.fabric) || ''}">`);

  drawn.forEach((v, i) => {
    parts.push(`  <g fill="none" stroke="${INK}" transform="translate(${cx[i].toFixed(4)},${(pad - yLo).toFixed(4)})">`);
    for (const p of v.paths) {
      parts.push(`    <path data-rol="${p.rol}"${p.extra} stroke-width="${p.w}" d="${p.d}"/>`);
    }
    parts.push('  </g>');
  });

  parts.push(`  <g font-family="sans-serif" font-size="14" text-anchor="middle" fill="${INK}">`);
  parts.push(`    <text x="${cx[0].toFixed(4)}" y="${(H - 12).toFixed(4)}">FRONT ${meta.beden || ''}</text>`);
  if (drawn.length > 1) parts.push(`    <text x="${cx[1].toFixed(4)}" y="${(H - 12).toFixed(4)}">BACK ${meta.beden || ''}</text>`);
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
