// Hero sewing space: shapes SCATTERED across the strip (never lined up in a
// row) — an S-curve, a big heart, a zigzag, buttons in between. The game is
// FOLLOWING the line: stitches only sew in order along a trail. Jumping to
// the middle of a trail does nothing; you pick an end (or continue where you
// left off) and trace.
const hero = document.getElementById('hero-sew');
const TEAL = '#3EB8AF';
const FAINT = '#d9d9d9';
const REACH = 15;

let trails = []; // {slots: [{x, y, filled, draw}], started: bool}

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

// dense polyline -> ordered stitch slots (faint guide + teal fill)
function makeTrail(dense, stitchLen = 12, gapLen = 8) {
  const slots = [];
  let acc = 0;
  let start = dense[0];
  let sewing = true;
  for (let i = 1; i < dense.length; i++) {
    acc += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
    if (acc >= (sewing ? stitchLen : gapLen)) {
      if (sewing) {
        const [a, b] = [start, dense[i]];
        seg(a[0], a[1], b[0], b[1], FAINT, 1.2);
        slots.push({
          x: (a[0] + b[0]) / 2,
          y: (a[1] + b[1]) / 2,
          filled: false,
          draw: () => seg(a[0], a[1], b[0], b[1], TEAL, 2.6),
        });
      }
      start = dense[i];
      acc = 0;
      sewing = !sewing;
    }
  }
  trails.push({ slots });
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

// sew-on button: a one-slot trail (touch it to sew it on)
function button(cx, cy, r) {
  const circle = (color, width) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', cx);
    c.setAttribute('cy', cy);
    c.setAttribute('r', r);
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', color);
    c.setAttribute('stroke-width', width);
    hero.appendChild(c);
  };
  const hole = (hx, hy, color) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', hx);
    c.setAttribute('cy', hy);
    c.setAttribute('r', 1.5);
    c.setAttribute('fill', color);
    hero.appendChild(c);
  };
  const d = r * 0.38;
  circle(FAINT, 1.2);
  hole(cx - d, cy - d, FAINT); hole(cx + d, cy - d, FAINT);
  hole(cx - d, cy + d, FAINT); hole(cx + d, cy + d, FAINT);
  trails.push({
    slots: [{
      x: cx,
      y: cy,
      filled: false,
      draw: () => {
        circle(TEAL, 2.2);
        seg(cx - d, cy - d, cx + d, cy + d, TEAL, 2);
        seg(cx + d, cy - d, cx - d, cy + d, TEAL, 2);
        hole(cx - d, cy - d, TEAL); hole(cx + d, cy - d, TEAL);
        hole(cx - d, cy + d, TEAL); hole(cx + d, cy + d, TEAL);
      },
    }],
  });
}

function build() {
  hero.innerHTML = '';
  trails = [];
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  if (w < 120) return;

  // scattered composition: different heights, different sizes, gaps between
  // S-curve up on the left
  makeTrail(sample((t) => [
    w * 0.05 + w * 0.24 * t,
    h * 0.38 + Math.sin(t * Math.PI * 2) * h * 0.26,
  ], 240));

  // heart low center-left, the biggest piece
  const hs = h * 0.026;
  makeTrail(sample((t) => heartPoint(t, w * 0.46, h * 0.56, hs), 720));

  // zigzag high on the right, tilted down
  const zig = [];
  const steps = 9;
  for (let i = 0; i <= steps; i++) {
    const x = w * 0.66 + (w * 0.28 / steps) * i;
    const y = h * 0.3 + (i % 2 ? h * 0.16 : -h * 0.02) + i * h * 0.015;
    zig.push([x, y]);
  }
  const fine = [];
  for (let i = 1; i < zig.length; i++) {
    for (let k = 0; k <= 12; k++) {
      const t = k / 12;
      fine.push([
        zig[i - 1][0] + (zig[i][0] - zig[i - 1][0]) * t,
        zig[i - 1][1] + (zig[i][1] - zig[i - 1][1]) * t,
      ]);
    }
  }
  makeTrail(fine, 10, 6);

  // buttons scattered in the gaps, varied sizes
  button(w * 0.145, h * 0.82, 13);
  button(w * 0.33, h * 0.14, 10);
  button(w * 0.6, h * 0.8, 12);
  button(w * 0.94, h * 0.62, 10);
}

// Following mechanic: a slot fills only if it's next to an already-filled
// slot on its trail — or if the trail is untouched and you start at either
// END of it. Poking the middle sews nothing.
function sewNear(px, py) {
  for (const trail of trails) {
    const slots = trail.slots;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (slot.filled) continue;
      if (Math.hypot(px - slot.x, py - slot.y) >= REACH) continue;
      const anyFilled = slots.some((s) => s.filled);
      const ok = anyFilled
        ? (slots[i - 1]?.filled || slots[i + 1]?.filled)
        : (i === 0 || i === slots.length - 1);
      if (ok) {
        slot.filled = true;
        slot.draw();
      }
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
