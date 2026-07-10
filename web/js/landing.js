// Hero sewing space — a SKILL game, not a fill game. Your stitches sew
// exactly where your finger drags (freehand, can wobble, can miss). The faint
// shapes are just targets scattered around the space: a heart up top, a tilted
// line, an angled S, a zigzag, buttons. Staying on the line is up to you.
import { makeSewable } from './stitch.js?v=5';

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
  // The text block owns roughly the left 58% of the upper 55%; patterns
  // scatter through the rest: the void right of the headline and the band
  // below it. Positions are fractions of the free zones, never over text.
  const rightX = w * 0.62;             // start of the right void
  const lowY = h * 0.62;               // start of the lower band

  // heart, big, floating in the right void beside the headline
  faintPath(pathFrom(sample((t) => heartPoint(t, w * 0.8, h * 0.26, h * 0.0085), 240)));

  // an S at an angle, right void lower part
  const sAng = -0.55;
  const cosA = Math.cos(sAng);
  const sinA = Math.sin(sAng);
  faintPath(pathFrom(sample((t) => {
    const lx = (t - 0.5) * w * 0.16;
    const ly = Math.sin(t * Math.PI * 2) * h * 0.1;
    return [rightX + w * 0.08 + lx * cosA - ly * sinA, h * 0.52 + lx * sinA + ly * cosA];
  }, 160)));

  // a plain tilted line, lower-left band
  faintPath(pathFrom([[w * 0.06, h * 0.92], [w * 0.24, lowY + h * 0.06]]));

  // zigzag drifting across the lower middle
  const zig = [];
  for (let i = 0; i <= 6; i++) {
    zig.push([w * 0.34 + i * w * 0.04, h * 0.88 + (i % 2 ? -h * 0.08 : h * 0.01)]);
  }
  faintPath(pathFrom(zig));

  // a loose curl in the lower right
  faintPath(pathFrom(sample((t) => {
    const a = t * Math.PI * 3.2;
    const r = h * 0.16 * (1 - t * 0.55);
    return [w * 0.83 + Math.cos(a) * r, h * 0.8 + Math.sin(a) * r * 0.7];
  }, 200)));

  // buttons in the quiet corners of the free zones
  faintButton(w * 0.66, h * 0.12, 12);
  faintButton(w * 0.96, h * 0.45, 10);
  faintButton(w * 0.16, lowY + h * 0.05, 12);
  faintButton(w * 0.55, h * 0.72, 10);
}

build();
window.addEventListener('resize', build);

// freehand: teal stitches land exactly where you drag
makeSewable(hero, '#3EB8AF', null, () => 'run');
