#!/usr/bin/env node
// render-lint.mjs — K2 flat-engine render lint (2026-07-19), the flat-side
// sibling of style-lint. The flat engine had ZERO tests (K0 finding 4.1); this
// closes that boundary. For EVERY style record in engine/flat-engine/styles.json
// it renders the flat headlessly (the same code path the product uses) and
// fails loudly on:
//   1. NaN / non-finite coordinates in any path
//   2. zero-area closed loops (degenerate geometry)
//   3. self-intersection of the STRUCTURAL outlines (body / piece / tie
//      classes; seeded ink strokes are decorative and may legitimately overlap)
//   4. reversed normals: a closed loop inside one structural path whose winding
//      opposes the path's dominant winding (offset/normal flipped)
//   5. sampleX y-monotonicity: every silhouette segment sampleX bisects must be
//      y-monotone — the bisection silently returns a wrong x otherwise (the old
//      ribbon-tip bug class)
// Runs in ctest (flat_render_lint) and is chained after style-lint.mjs so the
// existing deploy proof step runs it automatically.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const engine = await import(join(root, 'engine/flat-engine/_engine-full.mjs'));
const styles = JSON.parse(readFileSync(join(root, 'engine/flat-engine/styles.json'), 'utf8'));
// Pinned pre-existing findings (declared, not silently passed): the lint's job
// in the closing chain is to FREEZE the current state and catch regressions.
// Every allow entry is a v1.1 fix candidate, listed in the K2 report.
const ALLOW = new Set(JSON.parse(readFileSync(join(here, 'render-lint.allow.json'), 'utf8')).allow);

let failures = 0, allowed = 0;
const fail = (style, msg, key) => {
  if (key && ALLOW.has(key)) { allowed += 1; console.log(`allowed (pinned): [${style}] ${msg}`); return; }
  console.error(`FAIL [${style}] ${msg}`);
  failures += 1;
};

// ---- SVG path helpers --------------------------------------------------------
// The engine only ever emits "M x,y" + "C ..." + "L ..." + "Z" path data.
function parsePath(d) {
  const subpaths = [];
  let pts = [], closed = false;
  const tokens = d.match(/[MCLZ]|-?\d+\.?\d*(?:e-?\d+)?/gi) || [];
  let i = 0, cmd = '';
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[MCLZ]$/i.test(t)) { cmd = t.toUpperCase(); i += 1; if (cmd === 'Z') { closed = true; subpaths.push({ pts, closed }); pts = []; closed = false; } continue; }
    if (cmd === 'M') { if (pts.length) { subpaths.push({ pts, closed: false }); pts = []; } pts.push([num(), num()]); cmd = 'L'; }
    else if (cmd === 'L') pts.push([num(), num()]);
    else if (cmd === 'C') {
      const p0 = pts[pts.length - 1];
      const c1 = [num(), num()], c2 = [num(), num()], p1 = [num(), num()];
      // flatten the cubic into 12 line steps
      for (let k = 1; k <= 12; k++) {
        const t2 = k / 12, u = 1 - t2;
        pts.push([
          u * u * u * p0[0] + 3 * u * u * t2 * c1[0] + 3 * u * t2 * t2 * c2[0] + t2 * t2 * t2 * p1[0],
          u * u * u * p0[1] + 3 * u * u * t2 * c1[1] + 3 * u * t2 * t2 * c2[1] + t2 * t2 * t2 * p1[1],
        ]);
      }
    }
  }
  if (pts.length) subpaths.push({ pts, closed: false });
  return subpaths;
}

const area2 = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
};

function segIntersect(a, b, c, d) {
  const cross = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

// Self-intersection of one flattened loop, skipping adjacent segments. The
// flattening itself introduces near-tangent steps, so intersections shorter
// than `eps` are noise, not geometry.
function selfIntersects(pts, closed) {
  const n = pts.length;
  const segs = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-6) continue; // duplicate point
    segs.push([p, q, i]);
  }
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 2; j < segs.length; j++) {
      if (closed && i === 0 && j === segs.length - 1) continue; // wrap-adjacent
      if (segIntersect(segs[i][0], segs[i][1], segs[j][0], segs[j][1])) {
        return `segments ${segs[i][2]} and ${segs[j][2]} cross near (${segs[j][0][0].toFixed(1)}, ${segs[j][0][1].toFixed(1)})`;
      }
    }
  }
  return null;
}

// ---- 1-4: per-style SVG geometry checks --------------------------------------
const STRUCTURAL = new Set(['body', 'piece', 'tie']);
for (const styleKey of Object.keys(styles.styles)) {
  let svg;
  try {
    svg = engine.renderStyle(styleKey);
  } catch (e) {
    fail(styleKey, `render threw: ${e.message}`);
    continue;
  }
  if (/NaN|Infinity/.test(svg)) { fail(styleKey, 'NaN/Infinity coordinate in rendered SVG'); continue; }
  // Dedupe: M() emits every path twice (raw + mirrored <g scale(-1,1)> copy
  // with identical d) — lint each unique (class, d) once.
  const seen = new Set();
  const paths = [...svg.matchAll(/<path class="([a-z]+)" d="([^"]+)"/g)]
    .filter(([, cls, d]) => { const k = cls + '|' + d; if (seen.has(k)) return false; seen.add(k); return true; });
  if (!paths.length) { fail(styleKey, 'no paths rendered'); continue; }
  for (const [, cls, d] of paths) {
    if (!STRUCTURAL.has(cls)) continue; // ink/seam/stitch strokes are decorative
    const subpaths = parsePath(d);
    const closedLoops = subpaths.filter((s) => s.closed && s.pts.length > 2);
    // 2. zero-area loops
    for (const loop of closedLoops) {
      if (Math.abs(area2(loop.pts)) < 1.0) {
        fail(styleKey, `${cls} path has a zero-area loop (|area| < 1 px²)`);
      }
    }
    // 3. self-intersection (structural outlines only)
    for (const loop of closedLoops) {
      const hit = selfIntersects(loop.pts, true);
      if (hit) {
        const key = `${styleKey}|${cls}|selfx|${hit.replace(/segments (\d+) and (\d+).*/, '$1x$2')}`;
        fail(styleKey, `${cls} outline self-intersects: ${hit}`, key);
      }
    }
    // 4. reversed normals: loop winding vs the path's dominant winding
    if (closedLoops.length > 1) {
      const areas = closedLoops.map((l) => area2(l.pts));
      const dominant = Math.sign(areas.reduce((s, a) => s + a, 0));
      for (const a of areas) {
        if (Math.sign(a) !== 0 && Math.sign(a) !== dominant && Math.abs(a) > 1.0) {
          fail(styleKey, `${cls} path holds loops with OPPOSITE winding (reversed normal/offset), areas ${areas.map((x) => x.toFixed(0)).join(', ')}`);
        }
      }
    }
  }
  console.log(`ok: ${styleKey} — ${paths.length} unique paths, structural outlines checked`);
}

// ---- 5: sampleX y-monotonicity ----------------------------------------------
// sampleX bisects each silhouette segment ASSUMING y is monotone along it; a
// non-monotone segment silently yields a wrong x (the ribbon-tip bug class).
// Assert monotonicity on the exact geometry render() hands to sampleX, in the
// exact y-band render() queries it (the shirr rows: panelTop..yEmp), with
// sampleX's own bracketing tolerance (0.5 px) — a sub-tolerance wiggle in the
// hem drape cannot mislead the bisection and is not a finding.
for (const styleKey of Object.keys(styles.styles)) {
  const p = engine.defaults(styleKey);
  const st = engine.STYLE[styleKey];
  for (const isBack of [false, true]) {
    const cx = isBack ? 700 : 240;
    const rnd = engine.rng(p.seed * 131 + (isBack ? 977 : 13));
    const b = engine.buildHalf(p, cx, isBack, rnd);
    const half = engine.enforceC1(b.g.slice(), !b.k.pointed);
    const bandTop = b.k.panelTop;
    const bandBot = b.k.yEmp;
    half.forEach((seg, idx) => {
      // only segments whose y-range overlaps the queried band matter
      const yMin = Math.min(seg[1], seg[7]), yMax = Math.max(seg[1], seg[7]);
      if (yMax < bandTop - 0.5 || yMin > bandBot + 0.5) return;
      let prevY = null, dir = 0;
      for (let k = 0; k <= 40; k++) {
        const y = engine.cubic(seg, k / 40)[1];
        if (prevY !== null) {
          const step = y - prevY;
          if (Math.abs(step) > 1e-6) {
            const d = Math.sign(step);
            if (dir === 0) dir = d;
            else if (d !== dir && Math.abs(step) > 0.5) {
              fail(styleKey, `${isBack ? 'back' : 'front'} segment ${idx} is not y-monotone inside the sampleX band (reverses by ${step.toFixed(2)} px) — bisection unsafe`);
              break;
            }
          }
        }
        prevY = y;
      }
    });
  }
}

console.log(failures
  ? `\nrender lint FAILED (${failures} new finding${failures === 1 ? '' : 's'}, ${allowed} pinned)`
  : `\nrender lint GREEN (${Object.keys(styles.styles).length} styles: geometry + winding + zero-area + sampleX monotonicity; ${allowed} pinned pre-existing finding${allowed === 1 ? '' : 's'})`);
process.exit(failures ? 1 : 0);
