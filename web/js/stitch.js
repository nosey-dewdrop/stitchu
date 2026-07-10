// Shared stitch drawing: discrete, evenly spaced hand stitches — never one
// long continuous line (brand rule from the approved mock).
export const STITCH_SPACING = 11;
export const STITCH_HALF = 4;

export function stitchSeg(svg, cx, cy, ang, color) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  s.setAttribute('x1', (cx - Math.cos(ang) * STITCH_HALF).toFixed(1));
  s.setAttribute('y1', (cy - Math.sin(ang) * STITCH_HALF).toFixed(1));
  s.setAttribute('x2', (cx + Math.cos(ang) * STITCH_HALF).toFixed(1));
  s.setAttribute('y2', (cy + Math.sin(ang) * STITCH_HALF).toFixed(1));
  s.setAttribute('stroke', color);
  s.setAttribute('stroke-width', '2.4');
  s.setAttribute('stroke-linecap', 'round');
  svg.appendChild(s);
  return s;
}

// A tiny stitched heart stamped at (cx, cy).
export function heartStamp(svg, cx, cy, color) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const s = 1.1; // scale
  p.setAttribute('d',
    `M ${cx} ${cy + 3 * s} C ${cx} ${cy + 0.5 * s} ${cx - 4 * s} ${cy - 1.5 * s} ${cx - 6 * s} ${cy + 1.5 * s} ` +
    `C ${cx - 7.5 * s} ${cy + 4.5 * s} ${cx - 3 * s} ${cy + 8 * s} ${cx} ${cy + 11 * s} ` +
    `C ${cx + 3 * s} ${cy + 8 * s} ${cx + 7.5 * s} ${cy + 4.5 * s} ${cx + 6 * s} ${cy + 1.5 * s} ` +
    `C ${cx + 4 * s} ${cy - 1.5 * s} ${cx} ${cy + 0.5 * s} ${cx} ${cy + 3 * s} Z`);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', color);
  p.setAttribute('stroke-width', '1.8');
  p.setAttribute('stroke-dasharray', '3 2');
  svg.appendChild(p);
  return p;
}

function lineSeg(svg, x1, y1, x2, y2, color) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  s.setAttribute('x1', x1.toFixed(1));
  s.setAttribute('y1', y1.toFixed(1));
  s.setAttribute('x2', x2.toFixed(1));
  s.setAttribute('y2', y2.toFixed(1));
  s.setAttribute('stroke', color);
  s.setAttribute('stroke-width', '2');
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
    for (let i = 1; i < pts.length; i++) {
      lineSeg(svg, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], run.color);
    }
    return;
  }
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const ang = Math.atan2(by - ay, bx - ax);
    stitchSeg(svg, bx, by, ang, run.color);
  }
}

// Freehand sewing on an svg element. getKind() is read at each drag start so a
// picker can switch styles live. Calls onStitchRun({kind, points}) with
// normalized coords when the drag ends.
const SPACING_BY_KIND = { run: STITCH_SPACING, zigzag: 9, heart: 26 };
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
    } else if (kind === 'zigzag') {
      // offset the vertex perpendicular to the drag direction, alternating
      const dir = Math.atan2(py - last[1], px - last[0]);
      x = px + Math.cos(dir + Math.PI / 2) * ZIG_AMPLITUDE * zigFlip;
      y = py + Math.sin(dir + Math.PI / 2) * ZIG_AMPLITUDE * zigFlip;
      zigFlip *= -1;
      lineSeg(svg, last[0], last[1], x, y, color);
    } else {
      const ang = Math.atan2(py - last[1], px - last[0]) + (Math.random() - 0.5) * 0.18;
      stitchSeg(svg, x, y, ang, color);
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
