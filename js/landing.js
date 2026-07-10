// Hero: ONE interactive piece in the space beside the headline — a big heart
// outlined in faint stitch marks. Landing a stitch ON the line is the game:
// drag close to the outline and that stitch sews in teal; stray drags sew
// nothing.
const hero = document.getElementById('hero-sew');
const TEAL = '#3EB8AF';
const FAINT = '#d9d9d9';
const REACH = 16; // tight: the stitch must actually meet the line

let slots = [];
let filled = 0;
let done = false;

function seg(x1, y1, x2, y2, color, width) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  s.setAttribute('x1', x1.toFixed(1));
  s.setAttribute('y1', y1.toFixed(1));
  s.setAttribute('x2', x2.toFixed(1));
  s.setAttribute('y2', y2.toFixed(1));
  s.setAttribute('stroke', color);
  s.setAttribute('stroke-width', width);
  s.setAttribute('stroke-linecap', 'round');
  hero.appendChild(s);
  return s;
}

function heartPoint(t, cx, cy, scale) {
  const a = t * Math.PI * 2;
  const x = 16 * Math.sin(a) ** 3;
  const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
  return [cx + x * scale, cy - y * scale];
}

function build() {
  hero.innerHTML = '';
  slots = [];
  filled = 0;
  done = false;
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  if (w < 60) return;
  const cx = w / 2;
  const cy = h / 2 - 6;
  const scale = Math.min((h / 2 - 16) / 17, (w / 2 - 10) / 18);

  const dense = [];
  const N = 720;
  for (let i = 0; i <= N; i++) dense.push(heartPoint(i / N, cx, cy, scale));

  const STITCH = 13;
  const GAP = 8;
  let acc = 0;
  let start = dense[0];
  let sewing = true;
  for (let i = 1; i < dense.length; i++) {
    acc += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
    if (acc >= (sewing ? STITCH : GAP)) {
      if (sewing) {
        const [a, b] = [start, dense[i]];
        seg(a[0], a[1], b[0], b[1], FAINT, 1.2);
        slots.push({
          x: (a[0] + b[0]) / 2,
          y: (a[1] + b[1]) / 2,
          draw: () => seg(a[0], a[1], b[0], b[1], TEAL, 2.6),
        });
      }
      start = dense[i];
      acc = 0;
      sewing = !sewing;
    }
  }
}

function celebrate() {
  // the finished heart beats once — cheap, pure CSS transform on the svg
  hero.style.transition = 'transform 0.18s ease-in-out';
  hero.style.transform = 'scale(1.06)';
  setTimeout(() => { hero.style.transform = 'scale(1)'; }, 190);
  setTimeout(() => { hero.style.transform = 'scale(1.04)'; }, 380);
  setTimeout(() => { hero.style.transform = 'scale(1)'; }, 560);
}

function sewNear(px, py) {
  for (const slot of slots) {
    if (!slot.filled && Math.hypot(px - slot.x, py - slot.y) < REACH) {
      slot.filled = true;
      slot.draw();
      filled += 1;
    }
  }
  if (!done && slots.length && filled === slots.length) {
    done = true;
    celebrate();
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
