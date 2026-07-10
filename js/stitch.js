// Shared stitch drawing: discrete, evenly spaced hand stitches — never one
// long continuous line (brand rule from the approved mock).
export const STITCH_SPACING = 22;
export const STITCH_HALF = 5.5;

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

// Draw a stored stitch run (normalized 0..1 points) onto an svg of w x h.
export function drawRun(svg, run, w, h) {
  const pts = run.points.map(([x, y]) => [x * w, y * h]);
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const ang = Math.atan2(by - ay, bx - ax);
    stitchSeg(svg, bx, by, ang, run.color);
  }
}

// Freehand sewing on an svg element. Collects sampled points and calls
// onStitchRun(points) with normalized coords when the drag ends.
export function makeSewable(svg, color, onStitchRun) {
  let drawing = false;
  let last = null;
  let sampled = [];
  const pos = (e) => {
    const r = svg.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top, r.width, r.height];
  };
  svg.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    drawing = true;
    const [x, y] = pos(e);
    last = [x, y];
    sampled = [[x, y]];
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const [x, y, w, h] = pos(e);
    if (Math.hypot(x - last[0], y - last[1]) < STITCH_SPACING) return;
    const ang = Math.atan2(y - last[1], x - last[0]) + (Math.random() - 0.5) * 0.18;
    stitchSeg(svg, x, y, ang, color);
    last = [x, y];
    sampled.push([x, y]);
    svg.dataset.w = w;
    svg.dataset.h = h;
  });
  const end = () => {
    if (drawing && sampled.length > 1 && onStitchRun) {
      const w = parseFloat(svg.dataset.w) || svg.getBoundingClientRect().width;
      const h = parseFloat(svg.dataset.h) || svg.getBoundingClientRect().height;
      onStitchRun(sampled.map(([x, y]) => [
        Math.min(1, Math.max(0, x / w)),
        Math.min(1, Math.max(0, y / h)),
      ]));
    }
    drawing = false;
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointerleave', end);
}
