// Hero: one faint guide trail made of four sections — running stitch, zigzag,
// curly loops, hearts. The visitor drags ALONG the trail and each mark fills
// in teal where they pass (coloring-book mechanic). No picker: the trail
// itself decides the stitch style.
import { curlSeg, heartStamp } from './stitch.js';

const hero = document.getElementById('hero-sew');
const TEAL = '#3EB8AF';
const FAINT = '#d9d9d9';
const Y = 60;
const REACH = 26; // how close the pointer must pass to sew a mark

let slots = [];

function line(x1, y1, x2, y2, color, width, dash) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  s.setAttribute('x1', x1.toFixed(1));
  s.setAttribute('y1', y1.toFixed(1));
  s.setAttribute('x2', x2.toFixed(1));
  s.setAttribute('y2', y2.toFixed(1));
  s.setAttribute('stroke', color);
  s.setAttribute('stroke-width', width);
  s.setAttribute('stroke-linecap', 'round');
  if (dash) s.setAttribute('stroke-dasharray', dash);
  hero.appendChild(s);
  return s;
}

function build() {
  hero.innerHTML = '';
  slots = [];
  const w = hero.clientWidth;
  if (w < 80) return;
  const runEnd = w * 0.30;
  const zigStart = w * 0.34;
  const zigEnd = w * 0.54;
  const curlStart = w * 0.58;
  const curlEnd = w * 0.78;
  const heartStart = w * 0.84;

  // running stitch: faint dashes, each fills as a short teal stitch
  line(4, Y, runEnd, Y, FAINT, 1, '9 6');
  for (let x = 10; x + 18 < runEnd; x += 26) {
    slots.push({ x: x + 9, y: Y, draw: () => line(x, Y, x + 13, Y, TEAL, 2.4) });
  }

  // zigzag: faint peaks, each leg fills separately (needle gap at vertices)
  const AMP = 10;
  const STEP = 17;
  let vx = zigStart;
  let up = true;
  let prev = [vx, Y + AMP];
  while (vx + STEP <= zigEnd) {
    const next = [vx + STEP, up ? Y - AMP : Y + AMP];
    const [a, b] = [prev, next];
    line(a[0] + (b[0] - a[0]) * 0.1, a[1] + (b[1] - a[1]) * 0.1,
         a[0] + (b[0] - a[0]) * 0.9, a[1] + (b[1] - a[1]) * 0.9, FAINT, 1);
    slots.push({
      x: (a[0] + b[0]) / 2,
      y: (a[1] + b[1]) / 2,
      draw: () => line(a[0] + (b[0] - a[0]) * 0.14, a[1] + (b[1] - a[1]) * 0.14,
                       a[0] + (b[0] - a[0]) * 0.86, a[1] + (b[1] - a[1]) * 0.86, TEAL, 2.2),
    });
    prev = next;
    vx += STEP;
    up = !up;
  }

  // curly loops: faint loop per step, fills as a teal loop
  const CSTEP = 22;
  for (let x = curlStart; x + CSTEP <= curlEnd; x += CSTEP) {
    const from = [x, Y + 4];
    const to = [x + CSTEP, Y + 4];
    const guide = curlSeg(hero, from, to, FAINT);
    guide.setAttribute('stroke-width', '1');
    slots.push({ x: x + CSTEP / 2, y: Y - 4, draw: () => curlSeg(hero, from, to, TEAL) });
  }

  // hearts: three faint hearts, each fills whole
  for (let i = 0; i < 3; i++) {
    const hx = heartStart + i * ((w - 24 - heartStart) / 2.2);
    const guide = heartStamp(hero, hx, Y - 6, FAINT);
    guide.setAttribute('stroke-width', '1.2');
    slots.push({ x: hx, y: Y, draw: () => heartStamp(hero, hx, Y - 6, TEAL) });
  }
}

function sewNear(px, py) {
  for (const slot of slots) {
    if (!slot.filled && Math.hypot(px - slot.x, py - slot.y) < REACH) {
      slot.filled = true;
      slot.draw();
    }
  }
}

let down = false;
const pos = (e) => {
  const r = hero.getBoundingClientRect();
  return [e.clientX - r.left, e.clientY - r.top];
};
hero.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  down = true;
  hero.setPointerCapture(e.pointerId);
  sewNear(...pos(e));
});
hero.addEventListener('pointermove', (e) => { if (down) sewNear(...pos(e)); });
hero.addEventListener('pointerup', () => { down = false; });

build();
window.addEventListener('resize', build);
