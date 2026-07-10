// Hero sewing space — a SKILL game, not a fill game. Your stitches sew
// exactly where your finger drags (freehand, can wobble, can miss). The faint
// shapes are just targets scattered around the space: a heart up top, a tilted
// line, an angled S, a zigzag, buttons. Staying on the line is up to you.
import { makeSewable } from './stitch.js?v=6';

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
  // One flowing chain of patterns through the free space (right void + lower
  // band), shapes almost touching, tiny connector seams stitching them
  // together. Text zone (left ~58% of upper half) stays clear.

  const connect = (a, b) => faintPath(pathFrom([a, b]));

  // -- right void, top to bottom --
  faintButton(w * 0.655, h * 0.09, 11);
  connect([w * 0.67, h * 0.12], [w * 0.72, h * 0.16]);

  const heartC = [w * 0.8, h * 0.25];
  faintPath(pathFrom(sample((t) => heartPoint(t, heartC[0], heartC[1], h * 0.0075), 240)));
  connect([w * 0.8, h * 0.37], [w * 0.78, h * 0.42]);

  // S angled under the heart
  const sAng = -0.55;
  const cosA = Math.cos(sAng);
  const sinA = Math.sin(sAng);
  faintPath(pathFrom(sample((t) => {
    const lx = (t - 0.5) * w * 0.13;
    const ly = Math.sin(t * Math.PI * 2) * h * 0.08;
    return [w * 0.74 + lx * cosA - ly * sinA, h * 0.5 + lx * sinA + ly * cosA];
  }, 160)));
  connect([w * 0.79, h * 0.55], [w * 0.85, h * 0.55]);

  // curl to its right
  faintPath(pathFrom(sample((t) => {
    const a = t * Math.PI * 3.2;
    const r = h * 0.09 * (1 - t * 0.5);
    return [w * 0.9 + Math.cos(a) * r, h * 0.57 + Math.sin(a) * r * 0.8];
  }, 200)));

  faintButton(w * 0.68, h * 0.58, 10);
  connect([w * 0.67, h * 0.62], [w * 0.63, h * 0.68]);

  // -- lower band, flowing right to left --
  const zig = [];
  for (let i = 0; i <= 6; i++) {
    zig.push([w * 0.44 + i * w * 0.032, h * 0.74 + (i % 2 ? -h * 0.06 : h * 0.01)]);
  }
  faintPath(pathFrom(zig));
  connect([w * 0.44, h * 0.74], [w * 0.4, h * 0.76]);

  // small heart in the band
  faintPath(pathFrom(sample((t) => heartPoint(t, w * 0.34, h * 0.8, h * 0.0035), 240)));
  connect([w * 0.29, h * 0.8], [w * 0.25, h * 0.82]);

  // tilted line running out to the left
  faintPath(pathFrom([[w * 0.08, h * 0.92], [w * 0.24, h * 0.82]]));

  faintButton(w * 0.13, h * 0.8, 11);
  faintButton(w * 0.55, h * 0.87, 10);
  faintButton(w * 0.93, h * 0.74, 10);
}

build();
window.addEventListener('resize', build);

// freehand: teal stitches land exactly where you drag
makeSewable(hero, '#3EB8AF', null, () => 'run');
