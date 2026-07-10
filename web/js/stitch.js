// Shared stitch drawing: discrete, evenly spaced hand stitches — never one
// long continuous line (brand rule from the approved mock).
export const STITCH_SPACING = 10;
export const STITCH_HALF = 4.5;

// One even dash from a toward b, covering 55% of the step — reads like a
// dotted pen following the hand, no spikes.
export function stitchDash(svg, a, b, color) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  const t = 0.55;
  s.setAttribute('x1', a[0].toFixed(1));
  s.setAttribute('y1', a[1].toFixed(1));
  s.setAttribute('x2', (a[0] + (b[0] - a[0]) * t).toFixed(1));
  s.setAttribute('y2', (a[1] + (b[1] - a[1]) * t).toFixed(1));
  s.setAttribute('stroke', color);
  s.setAttribute('stroke-width', '1.6');
  s.setAttribute('stroke-linecap', 'round');
  svg.appendChild(s);
  return s;
}

// A tiny stitched heart stamped at (cx, cy).
export function heartStamp(svg, cx, cy, color) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const s = 0.8; // scale
  p.setAttribute('d',
    `M ${cx} ${cy + 3 * s} C ${cx} ${cy + 0.5 * s} ${cx - 4 * s} ${cy - 1.5 * s} ${cx - 6 * s} ${cy + 1.5 * s} ` +
    `C ${cx - 7.5 * s} ${cy + 4.5 * s} ${cx - 3 * s} ${cy + 8 * s} ${cx} ${cy + 11 * s} ` +
    `C ${cx + 3 * s} ${cy + 8 * s} ${cx + 7.5 * s} ${cy + 4.5 * s} ${cx + 6 * s} ${cy + 1.5 * s} ` +
    `C ${cx + 4 * s} ${cy - 1.5 * s} ${cx} ${cy + 0.5 * s} ${cx} ${cy + 3 * s} Z`);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', color);
  p.setAttribute('stroke-width', '1.6');
  p.setAttribute('stroke-dasharray', '2.2 1.6');
  svg.appendChild(p);
  return p;
}

// One cursive loop from `from` to `to` — the "kıvırcık" stitch.
export function curlSeg(svg, from, to, color) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const h = 13;
  const cp1x = from[0] + dx * 1.35 + px * h;
  const cp1y = from[1] + dy * 1.35 + py * h;
  const cp2x = from[0] - dx * 0.35 + px * h;
  const cp2y = from[1] - dy * 0.35 + py * h;
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', `M ${from[0].toFixed(1)} ${from[1].toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${to[0].toFixed(1)} ${to[1].toFixed(1)}`);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', color);
  p.setAttribute('stroke-width', '1.4');
  p.setAttribute('stroke-linecap', 'round');
  svg.appendChild(p);
  return p;
}

// Zigzag leg shortened at both ends so vertices read as needle holes.
function zigLeg(svg, a, b, color) {
  const t0 = 0.14;
  const t1 = 0.86;
  return lineSeg(svg,
    a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0,
    a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, color);
}

function lineSeg(svg, x1, y1, x2, y2, color) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  s.setAttribute('x1', x1.toFixed(1));
  s.setAttribute('y1', y1.toFixed(1));
  s.setAttribute('x2', x2.toFixed(1));
  s.setAttribute('y2', y2.toFixed(1));
  s.setAttribute('stroke', color);
  s.setAttribute('stroke-width', '1.6');
  s.setAttribute('stroke-linecap', 'round');
  svg.appendChild(s);
  return s;
}

// Draw a stored stitch run (normalized 0..1 points) onto an svg of w x h.
// kind: 'run' (default) discrete hand stitches, 'zigzag' connected zig lines,
// 'heart' a heart stamped at every point.
export function drawRun(svg, run, w, h) {
  const pts = run.points.map(([x, y]) => [x * w, y * h]);
  const kind = run.kind || 'run';
  if (kind === 'heart') {
    for (const [x, y] of pts) heartStamp(svg, x, y, run.color);
    return;
  }
  if (kind === 'zigzag') {
    for (let i = 1; i < pts.length; i++) zigLeg(svg, pts[i - 1], pts[i], run.color);
    return;
  }
  if (kind === 'curly') {
    for (let i = 1; i < pts.length; i++) curlSeg(svg, pts[i - 1], pts[i], run.color);
    return;
  }
  for (let i = 1; i < pts.length; i++) {
    stitchDash(svg, pts[i - 1], pts[i], run.color);
  }
}

// Freehand sewing on an svg element. getKind() is read at each drag start so a
// picker can switch styles live. Calls onStitchRun({kind, points}) with
// normalized coords when the drag ends.
const SPACING_BY_KIND = { run: STITCH_SPACING, zigzag: 9, heart: 21, curly: 16 };
const ZIG_AMPLITUDE = 5;

export function makeSewable(svg, color, onStitchRun, getKind = () => 'run') {
  let drawing = false;
  let last = null;
  let sampled = [];
  let kind = 'run';
  let zigFlip = 1;
  const pos = (e) => {
    const r = svg.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top, r.width, r.height];
  };
  svg.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    drawing = true;
    kind = getKind();
    const [x, y] = pos(e);
    last = [x, y];
    sampled = [[x, y]];
    if (kind === 'heart') heartStamp(svg, x, y, color);
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const [px, py, w, h] = pos(e);
    if (Math.hypot(px - last[0], py - last[1]) < SPACING_BY_KIND[kind]) return;
    let x = px;
    let y = py;
    if (kind === 'heart') {
      heartStamp(svg, x, y, color);
    } else if (kind === 'curly') {
      curlSeg(svg, last, [px, py], color);
    } else if (kind === 'zigzag') {
      // offset the vertex perpendicular to the drag direction, alternating
      const dir = Math.atan2(py - last[1], px - last[0]);
      x = px + Math.cos(dir + Math.PI / 2) * ZIG_AMPLITUDE * zigFlip;
      y = py + Math.sin(dir + Math.PI / 2) * ZIG_AMPLITUDE * zigFlip;
      zigFlip *= -1;
      zigLeg(svg, last, [x, y], color);
    } else {
      stitchDash(svg, last, [px, py], color);
    }
    last = [x, y];
    sampled.push([x, y]);
    svg.dataset.w = w;
    svg.dataset.h = h;
  });
  const end = () => {
    if (drawing && sampled.length > 1 && onStitchRun) {
      const w = parseFloat(svg.dataset.w) || svg.getBoundingClientRect().width;
      const h = parseFloat(svg.dataset.h) || svg.getBoundingClientRect().height;
      onStitchRun({
        kind,
        points: sampled.map(([x, y]) => [
          Math.min(1, Math.max(0, x / w)),
          Math.min(1, Math.max(0, y / h)),
        ]),
      });
    }
    drawing = false;
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointerleave', end);
}
