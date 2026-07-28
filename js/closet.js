// Closet: saved patterns, open inline, delete, or start a new one.
import { applyStatic, t } from './i18n.js?v=131';
import { printPattern } from './print.js?v=131';
import { renderResult } from './render.js?v=131';
import { loadCloset, deleteFromCloset } from './store.js?v=131';

const screen = document.getElementById('screen');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function when(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return t('closet.today');
  if (days === 1) return t('closet.yesterday');
  if (days < 7) return t('closet.daysago', { n: days });
  return new Date(ts).toLocaleDateString();
}

function render() {
  screen.textContent = '';
  screen.appendChild(el('h1', 'screen-title', t('closet.title')));
  const closet = loadCloset();

  if (!closet.length) {
    const empty = el('div', 'empty-state');
    empty.appendChild(el('h2', '', t('closet.empty.title')));
    empty.appendChild(el('p', '', t('closet.empty.body')));
    const nav = el('div', 'step-nav');
    const go = el('a', 'btn primary', t('closet.start'));
    go.href = 'create.html';
    nav.appendChild(go);
    empty.appendChild(nav);
    screen.appendChild(empty);
    return;
  }

  screen.appendChild(el('p', 'screen-sub', t('closet.sub', { n: closet.length })));
  const list = el('div', 'closet-list');
  const detail = el('div');
  detail.style.marginTop = '40px';

  for (const entry of closet) {
    const row = el('div', 'closet-item');
    const open = el('a', '', entry.result.pattern.garment);
    open.href = '#';
    open.addEventListener('click', (e) => {
      e.preventDefault();
      detail.textContent = '';
      detail.appendChild(el('h2', 'screen-title', entry.result.pattern.garment));
      const body = el('div');
      detail.appendChild(body);
      renderResult(body, entry.result);
      if (!entry.result.issues.length) {
        const nav = el('div', 'step-nav');
        const print = el('button', 'btn primary', t('create.print'));
        print.addEventListener('click', () => printPattern(entry.result));
        nav.appendChild(print);
        detail.appendChild(nav);
      }
      detail.scrollIntoView({ behavior: 'smooth' });
    });
    row.appendChild(open);
    row.appendChild(el('span', 'when', when(entry.savedAt)));
    const del = el('button', '', t('closet.delete'));
    del.addEventListener('click', () => {
      deleteFromCloset(entry.id);
      render();
    });
    row.appendChild(del);
    list.appendChild(row);
  }
  screen.appendChild(list);
  screen.appendChild(detail);
}

applyStatic();
// Language toggle is owned by the canonical header (js/shared-header.js).
render();
