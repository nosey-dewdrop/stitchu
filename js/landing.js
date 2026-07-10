// Hero sewing space — a SKILL game, not a fill game. Your stitches sew
// exactly where your finger drags (freehand, can wobble, can miss). The faint
// shapes are just targets scattered around the space: a heart up top, a tilted
// line, an angled S, a zigzag, buttons. Staying on the line is up to you.
import { makeSewable } from './stitch.js?v=7';

const hero = document.getElementById('hero-sew');
const FAINT = '#dedede';

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

function build() {
  hero.innerHTML = '';
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  if (w < 120) return;
  // Full-bleed canvas. The text lives inside the centered 1060px column, left
  // ~660px of its upper part — everything else gets the pattern chain:
  // left screen margin, right of the headline out to the screen edge, and the
  // band below. Shapes sit close, tiny connector seams stitch them together.
  const wl = Math.max((w - 1060) / 2, 0) + 24; // wrap left edge
  const textRight = wl + 680;                   // free space starts here
  const rx = (textRight + Math.min(w, textRight + 620)) / 2; // right flow line

  const connect = (a, b) => faintPath(pathFrom([a, b]));

  // -- left screen margin (only when there is one) --
  if (wl > 70) {
    faintPath(pathFrom(sample((t) => {
      const a = t * Math.PI * 3;
      const r = wl * 0.3 * (1 - t * 0.5);
      return [wl * 0.5 + Math.cos(a) * r, h * 0.18 + Math.sin(a) * r * 0.9];
    }, 200)));
    connect([wl * 0.5, h * 0.28], [wl * 0.45, h * 0.38]);
    faintPath(pathFrom([[wl * 0.25, h * 0.52], [wl * 0.7, h * 0.4]]));
    faintButton(wl * 0.5, h * 0.62, 11);
  }

  // -- right of the headline, top to bottom --
  faintButton(textRight + 30, h * 0.09, 11);
  connect([textRight + 42, h * 0.12], [rx - w * 0.045, h * 0.16]);

  faintPath(pathFrom(sample((t) => heartPoint(t, rx, h * 0.25, h * 0.0075), 240)));
  connect([rx, h * 0.37], [rx - w * 0.02, h * 0.42]);

  const sAng = -0.55;
  const cosA = Math.cos(sAng);
  const sinA = Math.sin(sAng);
  faintPath(pathFrom(sample((t) => {
    const lx = (t - 0.5) * w * 0.11;
    const ly = Math.sin(t * Math.PI * 2) * h * 0.08;
    return [rx - w * 0.04 + lx * cosA - ly * sinA, h * 0.5 + lx * sinA + ly * cosA];
  }, 160)));
  connect([rx + 10, h * 0.55], [rx + w * 0.06, h * 0.56]);

  faintPath(pathFrom(sample((t) => {
    const a = t * Math.PI * 3.2;
    const r = h * 0.09 * (1 - t * 0.5);
    return [rx + w * 0.1 + Math.cos(a) * r, h * 0.58 + Math.sin(a) * r * 0.8];
  }, 200)));

  // right screen edge ornament
  if (w - textRight > 500) {
    faintButton(w - 40, h * 0.32, 10);
    faintPath(pathFrom([[w - 70, h * 0.42], [w - 20, h * 0.52]]));
  }

  faintButton(textRight + 50, h * 0.58, 10);
  connect([textRight + 45, h * 0.62], [w * 0.6, h * 0.7]);

  // -- lower band, full width, flowing right to left --
  const zig = [];
  for (let i = 0; i <= 6; i++) {
    zig.push([w * 0.46 + i * w * 0.03, h * 0.75 + (i % 2 ? -h * 0.06 : h * 0.01)]);
  }
  faintPath(pathFrom(zig));
  connect([w * 0.46, h * 0.75], [w * 0.42, h * 0.78]);

  faintPath(pathFrom(sample((t) => heartPoint(t, w * 0.36, h * 0.81, h * 0.0035), 240)));
  connect([w * 0.31, h * 0.81], [w * 0.27, h * 0.83]);

  faintPath(pathFrom([[w * 0.08, h * 0.93], [w * 0.26, h * 0.83]]));

  faintButton(w * 0.15, h * 0.8, 11);
  faintButton(w * 0.57, h * 0.88, 10);
  faintButton(w * 0.8, h * 0.85, 11);
  faintPath(pathFrom(sample((t) => {
    const a = t * Math.PI * 3;
    const r = h * 0.07 * (1 - t * 0.5);
    return [w * 0.92 + Math.cos(a) * r, h * 0.86 + Math.sin(a) * r * 0.8];
  }, 200)));
}

build();
window.addEventListener('resize', build);

// freehand: teal stitches land exactly where you drag
makeSewable(hero, '#3EB8AF', null, () => 'run');
