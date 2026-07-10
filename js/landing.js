// Hero strip: free drag-to-sew that simply follows the pointer, in the
// chosen stitch style (running / curly / zigzag / hearts). The faint guide
// line stays as an invitation, but stitches can go anywhere in the strip.
import { makeSewable } from './stitch.js';

const hero = document.getElementById('hero-sew');
const GUIDE_Y = 75;

function heroGuide() {
  // keep sewn stitches on resize; only (re)draw the guide once per width
  let guide = hero.querySelector('.guide');
  if (!guide) {
    guide = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    guide.setAttribute('class', 'guide');
    guide.setAttribute('stroke', '#d9d9d9');
    guide.setAttribute('stroke-width', '1');
    guide.setAttribute('stroke-dasharray', '9 6');
    hero.prepend(guide);
  }
  guide.setAttribute('x1', 0);
  guide.setAttribute('y1', GUIDE_Y);
  guide.setAttribute('x2', hero.clientWidth);
  guide.setAttribute('y2', GUIDE_Y);
}
heroGuide();
window.addEventListener('resize', heroGuide);

let heroKind = 'run';
for (const button of document.querySelectorAll('#hero-kinds .kind')) {
  button.addEventListener('click', () => {
    heroKind = button.dataset.kind;
    for (const b of document.querySelectorAll('#hero-kinds .kind')) {
      b.setAttribute('aria-pressed', String(b === button));
    }
  });
}

makeSewable(hero, '#3EB8AF', null, () => heroKind);
