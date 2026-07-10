// Closet: saved patterns — open inline, delete, or start a new one.
import { renderResult } from './render.js';
import { loadCloset, deleteFromCloset } from './store.js';

const screen = document.getElementById('screen');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function when(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function render() {
  screen.textContent = '';
  screen.appendChild(el('h1', 'screen-title', 'Closet'));
  const closet = loadCloset();

  if (!closet.length) {
    const empty = el('div', 'empty-state');
    empty.appendChild(el('h2', '', 'No patterns yet.'));
    empty.appendChild(el('p', '', 'Draft your first one — it takes a photo or three taps, and it stays on this device.'));
    const nav = el('div', 'step-nav');
    const go = el('a', 'btn primary', 'Start a pattern');
    go.href = 'create.html';
    nav.appendChild(go);
    empty.appendChild(nav);
    screen.appendChild(empty);
    return;
  }

  screen.appendChild(el('p', 'screen-sub', `${closet.length} saved · stored in this browser only`));
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
      detail.scrollIntoView({ behavior: 'smooth' });
    });
    row.appendChild(open);
    row.appendChild(el('span', 'when', when(entry.savedAt)));
    const del = el('button', '', 'delete');
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

render();
