// Hero sewing playground, one composition: a big stitched heart in the
// center, an S-curve seam on the left, a zigzag seam on the right, and
// buttons scattered around to sew on. Everything starts as a faint guide and
// fills teal as the visitor traces it.
const hero = document.getElementById('hero-sew');
const TEAL = '#3EB8AF';
const FAINT = '#d9d9d9';
const REACH = 22;

let slots = [];

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

// Turn a dense polyline into alternating stitch marks (faint guide + teal
// fill slot per mark) — the shared mechanic for every shape here.
function stitchTrail(dense, stitchLen = 13, gapLen = 8) {
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
          draw: () => seg(a[0], a[1], b[0], b[1], TEAL, 2.6),
        });
      }
      start = dense[i];
      acc = 0;
      sewing = !sewing;
    }
  }
}

function sample(fn, n) {
  const points = [];
  for (let i = 0; i <= n; i++) points.push(fn(i / n));
  return points;
}

// classic parametric heart, y flipped for screen coords
function heartPoint(t, cx, cy, scale) {
  const a = t * Math.PI * 2;
  const x = 16 * Math.sin(a) ** 3;
  const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
  return [cx + x * scale, cy - y * scale];
}

// a sew-on button: faint circle + 4 holes; filling sews the cross threads
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
    return c;
  };
  const hole = (hx, hy, color) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', hx);
    c.setAttribute('cy', hy);
    c.setAttribute('r', 1.6);
    c.setAttribute('fill', color);
    hero.appendChild(c);
  };
  const d = r * 0.38;
  circle(FAINT, 1.2);
  hole(cx - d, cy - d, FAINT); hole(cx + d, cy - d, FAINT);
  hole(cx - d, cy + d, FAINT); hole(cx + d, cy + d, FAINT);
  slots.push({
    x: cx,
    y: cy,
    draw: () => {
      circle(TEAL, 2.2);
      // cross threads through the holes
      seg(cx - d, cy - d, cx + d, cy + d, TEAL, 2);
      seg(cx + d, cy - d, cx - d, cy + d, TEAL, 2);
      hole(cx - d, cy - d, TEAL); hole(cx + d, cy - d, TEAL);
      hole(cx - d, cy + d, TEAL); hole(cx + d, cy + d, TEAL);
    },
  });
}

function build() {
  hero.innerHTML = '';
  slots = [];
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  if (w < 80) return;
  const cx = w / 2;
  const cy = h / 2 - 4;
  const scale = (h / 2 - 14) / 17;

  // center: the big heart
  stitchTrail(sample((t) => heartPoint(t, cx, cy, scale), 720));

  const heartHalf = 16 * scale + 30; // clearance around the heart

  // left: S-curve seam winding toward the heart
  const sx0 = 24;
  const sx1 = cx - heartHalf;
  if (sx1 - sx0 > 90) {
    stitchTrail(sample((t) => {
      const x = sx0 + (sx1 - sx0) * t;
      const y = cy + Math.sin(t * Math.PI * 2) * (h * 0.28);
      return [x, y];
    }, 240));
  }

  // right: zigzag seam leaving the heart
  const zx0 = cx + heartHalf;
  const zx1 = w - 24;
  if (zx1 - zx0 > 90) {
    const STEP = 26;
    const AMP = h * 0.22;
    const dense = [];
    let up = true;
    for (let x = zx0; x <= zx1; x += STEP) {
      dense.push([x, cy + (up ? -AMP : AMP)]);
      up = !up;
    }
    // densify the vertices so trail spacing works
    const fine = [];
    for (let i = 1; i < dense.length; i++) {
      for (let k = 0; k <= 12; k++) {
        const t = k / 12;
        fine.push([
          dense[i - 1][0] + (dense[i][0] - dense[i - 1][0]) * t,
          dense[i - 1][1] + (dense[i][1] - dense[i - 1][1]) * t,
        ]);
      }
    }
    stitchTrail(fine, 11, 7);
  }

  // buttons scattered in the quiet corners
  const r = Math.min(15, h * 0.11);
  button(sx0 + (sx1 - sx0) * 0.28, cy - h * 0.34, r);
  if (zx1 - zx0 > 90) {
    button(zx0 + (zx1 - zx0) * 0.4, cy + h * 0.36, r);
    button(zx1 - r - 6, cy - h * 0.3, r * 0.85);
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
