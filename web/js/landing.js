// Hero drag-to-sew strip: coloring-book feel — rub along the guide line and
// neat stitch slots fill in one by one (approved interaction from the mock).
const hero = document.getElementById('hero-sew');
const SLOT = 26;
const GUIDE_Y = 45;
let slots = [];

function heroGuide() {
  hero.innerHTML = '';
  const w = hero.clientWidth;
  slots = new Array(Math.max(1, Math.floor(w / SLOT))).fill(false);
  const guide = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  guide.setAttribute('x1', 0);
  guide.setAttribute('y1', GUIDE_Y);
  guide.setAttribute('x2', w);
  guide.setAttribute('y2', GUIDE_Y);
  guide.setAttribute('stroke', '#d9d9d9');
  guide.setAttribute('stroke-width', '1');
  guide.setAttribute('stroke-dasharray', '9 6');
  hero.appendChild(guide);
}

function heroSew(e) {
  const r = hero.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  if (Math.abs(y - GUIDE_Y) > 34) return; // near the seam only
  const i = Math.floor(x / SLOT);
  if (i < 0 || i >= slots.length || slots[i]) return;
  slots[i] = true;
  const jitter = (Math.random() - 0.5) * 3;
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  s.setAttribute('x1', i * SLOT + 5);
  s.setAttribute('y1', GUIDE_Y + jitter);
  s.setAttribute('x2', i * SLOT + SLOT - 9);
  s.setAttribute('y2', GUIDE_Y + jitter);
  s.setAttribute('stroke', '#3EB8AF');
  s.setAttribute('stroke-width', '2.4');
  s.setAttribute('stroke-linecap', 'round');
  hero.appendChild(s);
}

let heroDown = false;
hero.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  heroDown = true;
  hero.setPointerCapture(e.pointerId);
  heroSew(e);
});
hero.addEventListener('pointermove', (e) => { if (heroDown) heroSew(e); });
hero.addEventListener('pointerup', () => { heroDown = false; });

heroGuide();
window.addEventListener('resize', heroGuide);
