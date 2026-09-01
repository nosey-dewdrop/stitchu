// flat-geom.js — the millimetre arithmetic the flat drawer needs, and NOTHING
// about garments. Kept apart from flat-from-pattern.js on purpose: every
// function here is a pure function of numbers, so a wrong drawing can always be
// bisected into "the geometry lied" or "the assembly lied".
//
// A SEGMENT is a cubic: { i, p: [p0, c1, c2, p3] }, each point [x, y] in mm,
// y counting DOWN (the pattern's own convention — the single flip to SVG's
// coordinate system happens once, in the writer). `i` is the index of the
// command in the piece's `commands` array the segment came from, so an
// edgeRoles range (`first`..`last`) can still address it after decomposition.
//
// Straight lines are stored as cubics with the control points at the thirds.
// That is exact (a cubic with collinear evenly spaced controls IS the line),
// and it means the rest of the file never branches on segment type.

export const EPS = 1e-9;

export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const scale = (a, s) => [a[0] * s, a[1] * s];
export const norm = (a) => Math.hypot(a[0], a[1]);
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const unit = (a) => { const n = norm(a); return n < EPS ? [0, 0] : [a[0] / n, a[1] / n]; };

/** Rotate p about c by th radians (positive = from +x toward +y, i.e. clockwise
 *  on screen because y counts down). */
export function rotAbout(p, c, th) {
  const s = Math.sin(th), co = Math.cos(th);
  const d = sub(p, c);
  return [c[0] + d[0] * co - d[1] * s, c[1] + d[0] * s + d[1] * co];
}

/** Turn a piece's `commands` array into segments. move/close carry no geometry
 *  of their own; a `close` that actually spans a gap becomes a real segment
 *  rather than a silently dropped edge. */
export function segsFromCommands(cmds) {
  const out = [];
  let cur = null, start = null;
  for (let i = 0; i < cmds.length; i++) {
    const c = cmds[i];
    if (c.type === 'move') { cur = [c.x, c.y]; start = cur; continue; }
    if (c.type === 'close') {
      if (cur && start && norm(sub(cur, start)) > 1e-7) {
        out.push({ i, p: [cur, lerp(cur, start, 1 / 3), lerp(cur, start, 2 / 3), start] });
      }
      cur = start; continue;
    }
    if (!cur) cur = [0, 0];
    const p3 = [c.x, c.y];
    if (c.type === 'line') {
      out.push({ i, p: [cur, lerp(cur, p3, 1 / 3), lerp(cur, p3, 2 / 3), p3] });
    } else if (c.type === 'curve') {
      out.push({ i, p: [cur, [c.cp1x, c.cp1y], [c.cp2x, c.cp2y], p3] });
    } else {
      continue; // an unknown command is skipped, never guessed at
    }
    cur = p3;
  }
  return out;
}

/** Subpaths of a marking/notch command list, as plain point lists. */
export function polysFromCommands(cmds) {
  const out = [];
  let cur = null;
  for (const c of cmds) {
    if (c.type === 'move') { cur = [[c.x, c.y]]; out.push(cur); continue; }
    if (c.type === 'close' || !cur) continue;
    cur.push([c.x, c.y]);
  }
  return out.filter((p) => p.length >= 2);
}

export function bezAt(p, t) {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
          a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
}

/** Sample a chain of segments as a polyline. `per` points per segment; the
 *  duplicate joint point is dropped so arc length is not double counted. */
export function samplePoly(segs, per = 24) {
  const pts = [];
  segs.forEach((s, k) => {
    for (let j = k === 0 ? 0 : 1; j <= per; j++) pts.push(bezAt(s.p, j / per));
  });
  return pts;
}

export function polyLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += norm(sub(pts[i], pts[i - 1]));
  return L;
}

export const chainLength = (segs, per = 48) => polyLength(samplePoly(segs, per));

/** Cumulative arc length, normalised to [0,1]. */
export function cumFrac(pts) {
  const c = [0];
  for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + norm(sub(pts[i], pts[i - 1])));
  const L = c[c.length - 1] || 1;
  return c.map((v) => v / L);
}

/** Point on a polyline at arc-length fraction f, plus the unit tangent there. */
export function atFrac(pts, cum, f) {
  const t = Math.min(Math.max(f, 0), 1);
  let i = 1;
  while (i < cum.length - 1 && cum[i] < t) i++;
  const span = cum[i] - cum[i - 1] || 1;
  const u = (t - cum[i - 1]) / span;
  return { p: lerp(pts[i - 1], pts[i], u), tan: unit(sub(pts[i], pts[i - 1])) };
}

/** Index of the polyline point nearest q. */
export function nearestIdx(pts, q) {
  let best = 0, bd = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const d = norm(sub(pts[i], q));
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

export function mapSegs(segs, fn) {
  return segs.map((s) => ({ i: s.i, p: s.p.map(fn) }));
}

/** Reverse a chain so it is traversed end-to-start (control points reverse too). */
export function reverseSegs(segs) {
  return segs.slice().reverse().map((s) => ({ i: s.i, p: [s.p[3], s.p[2], s.p[1], s.p[0]] }));
}

/** The same chain reflected through x = 0 and traversed backwards — the other
 *  half of a symmetric garment. It is DERIVED, never redrawn: a mirrored half
 *  that is drawn twice is two objects again. */
export function mirrorSegs(segs) {
  return reverseSegs(segs).map((s) => ({ i: s.i, p: s.p.map((q) => [-q[0], q[1]]) }));
}

/**
 * Shift a chain by `delta`, ramped linearly in arc length from 0 at the start
 * to the full delta at the end (or the reverse when `atStart`).
 *
 * WHY THIS EXISTS AND WHAT IT IS NOT. Closing a dart moves the point where the
 * dart's edge meets the side seam. The side seam must follow it or the outline
 * tears open. A straight side seam ramped this way stays EXACTLY straight (a
 * linear function of a linear function), so for every straight side seam in the
 * shipped drafts this is not an approximation at all. For a curved one it is a
 * declared drawing decision: the curve keeps its shape and its far end stays
 * pinned.
 */
export function rampSegs(segs, delta, atStart = false) {
  const pts = segs.flatMap((s) => s.p);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + norm(sub(pts[i], pts[i - 1])));
  const L = cum[cum.length - 1] || 1;
  const out = [];
  for (let k = 0; k < segs.length; k++) {
    const s = segs[k];
    out.push({ i: s.i, p: s.p.map((q, j) => {
      const t = cum[k * 4 + j] / L;
      return add(q, scale(delta, atStart ? 1 - t : t));
    }) });
  }
  return out;
}

/** The exact sub-cubic of p on [t0, t1] (two de Casteljau splits). */
export function segSlice(p, t0, t1) {
  const split = (q, t) => {
    const a = lerp(q[0], q[1], t), b = lerp(q[1], q[2], t), c = lerp(q[2], q[3], t);
    const d = lerp(a, b, t), e = lerp(b, c, t), f = lerp(d, e, t);
    return [[q[0], a, d, f], [f, e, c, q[3]]];
  };
  const right = split(p, t0)[1];
  const u = t0 >= 1 ? 0 : (t1 - t0) / (1 - t0);
  return split(right, u)[0];
}

/**
 * Split every segment into pieces no taller/wider than `maxSpan` mm (measured
 * on the control hull). EXACT: each piece is the same curve (de Casteljau), so
 * densifying is free of drawing decisions. It exists for one reason: a warp
 * applied to control points only follows the intended point-wise warp as
 * closely as the control points sample the curve — a tent peak falling in the
 * middle of one long side seam would otherwise be flattened away.
 */
export function densifySegs(segs, maxSpan = 12) {
  const out = [];
  for (const s of segs) {
    const xs = s.p.map((q) => q[0]), ys = s.p.map((q) => q[1]);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const n = Math.min(32, Math.max(1, Math.ceil(span / maxSpan)));
    for (let k = 0; k < n; k++) out.push({ i: s.i, p: segSlice(s.p, k / n, (k + 1) / n) });
  }
  return out;
}

/** SVG path data for a chain. `open` leaves it unclosed. */
export function pathD(segs, flipY, closed = false) {
  if (!segs.length) return '';
  const X = (p) => p[0].toFixed(4);
  const Y = (p) => flipY(p[1]).toFixed(4);
  let d = `M ${X(segs[0].p[0])} ${Y(segs[0].p[0])}`;
  for (const s of segs) d += ` C ${X(s.p[1])} ${Y(s.p[1])} ${X(s.p[2])} ${Y(s.p[2])} ${X(s.p[3])} ${Y(s.p[3])}`;
  return closed ? d + ' Z' : d;
}

export function polyD(pts, flipY, closed = false) {
  if (!pts || pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(4)} ${flipY(pts[0][1]).toFixed(4)}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0].toFixed(4)} ${flipY(pts[i][1]).toFixed(4)}`;
  return closed ? d + ' Z' : d;
}

/** Segments from a straight run of points (for lines built here, not drafted). */
export function segsFromPoly(pts, i = -1) {
  const out = [];
  for (let k = 1; k < pts.length; k++) {
    out.push({ i, p: [pts[k - 1], lerp(pts[k - 1], pts[k], 1 / 3), lerp(pts[k - 1], pts[k], 2 / 3), pts[k]] });
  }
  return out;
}

export function bbox(segs) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of segs) for (const p of s.p) {
    x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]);
    y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
  }
  return { x0, y0, x1, y1 };
}
