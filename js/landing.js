// Hero sewing space — a SKILL game, not a fill game. Your stitches sew
// exactly where your finger drags (freehand, can wobble, can miss). The faint
// shapes are just targets scattered around the space: a heart up top, a tilted
// line, an angled S, a zigzag, buttons. Staying on the line is up to you.
import { makeSewable } from './stitch.js?v=4';

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

  // heart, floating in the upper middle
  faintPath(pathFrom(sample((t) => heartPoint(t, w * 0.52, h * 0.30, h * 0.011), 240)));

  // a plain line, tilted, lower left — just a seam to practice on
  faintPath(pathFrom([[w * 0.07, h * 0.78], [w * 0.27, h * 0.5]]));

  // an S at an angle near the right, rotated ~35 deg
  const sAng = -0.6;
  const cosA = Math.cos(sAng);
  const sinA = Math.sin(sAng);
  faintPath(pathFrom(sample((t) => {
    const lx = (t - 0.5) * w * 0.2;
    const ly = Math.sin(t * Math.PI * 2) * h * 0.16;
    return [w * 0.78 + lx * cosA - ly * sinA, h * 0.62 + lx * sinA + ly * cosA];
  }, 160)));

  // a short zigzag drifting under the heart
  const zig = [];
  for (let i = 0; i <= 6; i++) {
    zig.push([w * 0.36 + i * w * 0.035, h * 0.78 + (i % 2 ? -h * 0.1 : h * 0.02)]);
  }
  faintPath(pathFrom(zig));

  // buttons in the leftover quiet spots
  faintButton(w * 0.16, h * 0.22, 13);
  faintButton(w * 0.62, h * 0.86, 11);
  faintButton(w * 0.93, h * 0.24, 12);
}

build();
window.addEventListener('resize', build);

// freehand: teal stitches land exactly where you drag
makeSewable(hero, '#3EB8AF', null, () => 'run');
