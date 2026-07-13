// Hero sewing space, full bleed. Guides live in non-overlapping CELLS so
// shapes never collide at any screen size, and your sewn stitches survive
// resizes (stored normalized, redrawn on rebuild).
import { drawRun, makeSewable } from './stitch.js?v=23';

const hero = document.getElementById('hero-sew');
const FAINT = '#dedede';
const sewnRuns = []; // normalized {kind, points, color}

function faintPath(d) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', FAINT);
  p.setAttribute('stroke-width', '1.4');
  p.setAttribute('stroke-dasharray', '7 6');
  hero.appendChild(p);
}

function pathFrom(points) {
  return points.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
}

function sample(fn, n) {
  const points = [];
  for (let i = 0; i <= n; i++) points.push(fn(i / n));
  return points;
}

function heartPoint(t, cx, cy, scale) {
  const a = t * Math.PI * 2;
  const x = 16 * Math.sin(a) ** 3;
  const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
  return [cx + x * scale, cy - y * scale];
}

function faintButton(cx, cy, r) {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', cx);
  circle.setAttribute('cy', cy);
  circle.setAttribute('r', r);
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', FAINT);
  circle.setAttribute('stroke-width', '1.4');
  hero.appendChild(circle);
  const d = r * 0.38;
  for (const [hx, hy] of [[cx - d, cy - d], [cx + d, cy - d], [cx - d, cy + d], [cx + d, cy + d]]) {
    const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hole.setAttribute('cx', hx);
    hole.setAttribute('cy', hy);
    hole.setAttribute('r', 1.6);
    hole.setAttribute('fill', FAINT);
    hero.appendChild(hole);
  }
}

// ---- shape painters: each draws CENTERED in its cell, sized to fit it ----
const SHAPES = {
  heart(cx, cy, s) {
    faintPath(pathFrom(sample((t) => heartPoint(t, cx, cy, s / 30), 240)));
  },
  scurve(cx, cy, s) {
    const ang = -0.5;
    const c = Math.cos(ang);
    const n = Math.sin(ang);
    faintPath(pathFrom(sample((t) => {
      const lx = (t - 0.5) * s;
      const ly = Math.sin(t * Math.PI * 2) * s * 0.3;
      return [cx + lx * c - ly * n, cy + lx * n + ly * c];
    }, 160)));
  },
  curl(cx, cy, s) {
    faintPath(pathFrom(sample((t) => {
      const a = t * Math.PI * 3.2;
      const r = (s / 2) * (1 - t * 0.5);
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85];
    }, 200)));
  },
  zigzag(cx, cy, s) {
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      pts.push([cx - s / 2 + (s / 6) * i, cy + (i % 2 ? -s * 0.18 : s * 0.12)]);
    }
    faintPath(pathFrom(pts));
  },
  line(cx, cy, s) {
    faintPath(pathFrom([[cx - s / 2, cy + s * 0.18], [cx + s / 2, cy - s * 0.18]]));
  },
  button(cx, cy, s) {
    faintButton(cx, cy, Math.min(13, s / 3));
  },
};

// place shapes into a grid of non-overlapping cells inside a box
function placeInBox(x0, y0, x1, y1, cols, rows, names) {
  const cw = (x1 - x0) / cols;
  const ch = (y1 - y0) / rows;
  let i = 0;
  for (const name of names) {
    if (name) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = x0 + cw * (col + 0.5);
      const cy = y0 + ch * (row + 0.5);
      SHAPES[name](cx, cy, Math.min(cw, ch) * 0.72);
    }
    i += 1;
  }
}

function build() {
  hero.innerHTML = '';
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  if (w < 120) return;

  const wl = Math.max((w - 1060) / 2, 0) + 24; // wrap left edge
  const textRight = wl + 690;                   // text column ends here
  // measure where the copy actually ends — the band hugs it, no dead gap
  const copyEl = document.querySelector('.hero-copy');
  const textBottom = copyEl
    ? Math.min(h - 120, copyEl.getBoundingClientRect().bottom - hero.getBoundingClientRect().top + 6)
    : h * 0.7;

  // left screen margin: one narrow column of cells
  if (wl > 80) {
    placeInBox(8, h * 0.06, wl - 8, textBottom, 1, 3, ['curl', 'line', 'button']);
  }

  // right of the headline out to the screen edge
  const rw = w - textRight - 16;
  if (rw > 420) {
    placeInBox(textRight + 8, h * 0.04, w - 8, textBottom, 2, 2,
      ['heart', 'curl', 'scurve', 'button']);
  } else if (rw > 160) {
    placeInBox(textRight + 8, h * 0.04, w - 8, textBottom, 1, 2, ['heart', 'scurve']);
  }

  // the band under everything, full width
  placeInBox(16, textBottom + 6, w - 16, h - 8, 5, 1,
    ['line', 'heart', 'zigzag', 'button', 'curl']);

  // re-sew everything the visitor already stitched (normalized -> px)
  for (const run of sewnRuns) drawRun(hero, run, w, h);
}

build();
window.addEventListener('resize', build);

// freehand dotted-pen stitching; runs are kept so resize never eats them
makeSewable(hero, '#3EB8AF', (run) => {
  sewnRuns.push({ kind: run.kind, points: run.points, color: '#3EB8AF' });
}, () => 'run');
