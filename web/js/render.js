// SVG rendering of drafted pieces (mm -> px preview; true-scale printing is
// the print pipeline's job, not this preview's).
import { fabricAdvice } from './fabrics.js?v=25';
import { getLang, t } from './i18n.js?v=25';

const PREVIEW_SCALE = 0.28;

export function pathD(commands, scale) {
  return commands.map((c) => {
    switch (c.type) {
      case 'move': return `M ${(c.x * scale).toFixed(1)} ${(c.y * scale).toFixed(1)}`;
      case 'line': return `L ${(c.x * scale).toFixed(1)} ${(c.y * scale).toFixed(1)}`;
      case 'curve': return `C ${(c.cp1x * scale).toFixed(1)} ${(c.cp1y * scale).toFixed(1)} ` +
        `${(c.cp2x * scale).toFixed(1)} ${(c.cp2y * scale).toFixed(1)} ` +
        `${(c.x * scale).toFixed(1)} ${(c.y * scale).toFixed(1)}`;
      case 'close': return 'Z';
      default: return '';
    }
  }).join(' ');
}

export function bounds(piece) {
  const xs = [];
  const ys = [];
  for (const c of [...piece.commands, ...piece.markings]) {
    if (c.x !== undefined) { xs.push(c.x); ys.push(c.y); }
    if (c.cp1x !== undefined) { xs.push(c.cp1x, c.cp2x); ys.push(c.cp1y, c.cp2y); }
  }
  if (piece.grainline) {
    xs.push(piece.grainline.fromX, piece.grainline.toX);
    ys.push(piece.grainline.fromY, piece.grainline.toY);
  }
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

export function pieceCard(piece) {
  const s = PREVIEW_SCALE;
  const b = bounds(piece);
  const pad = 10;
  const vx = b.minX * s - pad;
  const vy = b.minY * s - pad;
  const w = (b.maxX - b.minX) * s + pad * 2;
  const h = (b.maxY - b.minY) * s + pad * 2;

  let inner = `<path d="${pathD(piece.commands, s)}" fill="none" stroke="#111" stroke-width="1.6"/>`;
  if (piece.markings.length) {
    inner += `<path d="${pathD(piece.markings, s)}" fill="none" stroke="#8f2038" stroke-width="1.4" stroke-dasharray="6 4"/>`;
  }
  if (piece.grainline) {
    const g = piece.grainline;
    inner += `<line x1="${g.fromX * s}" y1="${g.fromY * s}" x2="${g.toX * s}" y2="${g.toY * s}" stroke="#111" stroke-width="1.2"/>`;
    // arrowheads
    const ang = Math.atan2(g.toY - g.fromY, g.toX - g.fromX);
    for (const [px, py, dir] of [[g.fromX * s, g.fromY * s, ang], [g.toX * s, g.toY * s, ang + Math.PI]]) {
      const a1x = px + Math.cos(dir + 0.4) * 8;
      const a1y = py + Math.sin(dir + 0.4) * 8;
      const a2x = px + Math.cos(dir - 0.4) * 8;
      const a2y = py + Math.sin(dir - 0.4) * 8;
      inner += `<path d="M ${a1x} ${a1y} L ${px} ${py} L ${a2x} ${a2y}" fill="none" stroke="#111" stroke-width="1.2"/>`;
    }
  }

  const div = document.createElement('div');
  div.className = 'piece-card';
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = piece.name + ' · ';
  const cut = document.createElement('span');
  cut.className = 'cut';
  cut.textContent = piece.cutInstruction;
  label.appendChild(cut);
  div.appendChild(label);
  const svgWrap = document.createElement('div');
  svgWrap.innerHTML = `<svg width="${w.toFixed(0)}" height="${h.toFixed(0)}" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}">${inner}</svg>`;
  div.appendChild(svgWrap.firstChild);
  return div;
}

export function renderResult(container, result) {
  container.textContent = '';
  const p = result.pattern;

  if (result.issues.length) {
    const box = document.createElement('div');
    box.className = 'issues-box';
    const head = document.createElement('p');
    head.textContent = t('result.blocked');
    box.appendChild(head);
    console.error('stitchu validation issues:', result.issues);
    container.appendChild(box);
    return;
  }

  const meta = document.createElement('ul');
  meta.className = 'result-meta';
  const rows = [
    [t('result.pieces'), t('result.piecesv', { n: p.pieces.length })],
    [t('result.fabric'), t('result.fabricv', { n: p.fabricMeters140 })],
    [t('result.sa'), t('result.sav', { n: p.pieces[0].seamAllowance / 10 })],
  ];
  for (const [k, v] of rows) {
    const li = document.createElement('li');
    const key = document.createElement('span');
    key.className = 'k';
    key.textContent = k;
    const val = document.createElement('span');
    val.textContent = v;
    li.append(key, val);
    meta.appendChild(li);
  }
  container.appendChild(meta);

  const grid = document.createElement('div');
  grid.className = 'pieces-grid';
  for (const piece of p.pieces) grid.appendChild(pieceCard(piece));
  container.appendChild(grid);

  const legend = document.createElement('p');
  legend.style.cssText = 'font-size:13px;color:#8a8a8a;margin-top:14px;max-width:640px';
  legend.textContent = t('result.legend');
  container.appendChild(legend);

  const guideTitle = document.createElement('h2');
  guideTitle.style.cssText = 'font-weight:400;font-size:22px;margin-top:44px';
  guideTitle.textContent = t('result.guide');
  container.appendChild(guideTitle);
  if (getLang() === 'tr') {
    const note = document.createElement('p');
    note.style.cssText = 'font-size:13px;color:#8a8a8a;margin-top:6px';
    note.textContent = t('result.guidetrnote');
    container.appendChild(note);
  }
  const ol = document.createElement('ol');
  ol.className = 'guide-list';
  for (const step of p.guideSteps) {
    const li = document.createElement('li');
    li.textContent = step;
    ol.appendChild(li);
  }
  container.appendChild(ol);

  appendFabricAdvice(container, p.fabricAdviceKey, result.photoFabric || null);
}

// Verified-DB aliases for the vision's fabric vocabulary.
const FABRIC_ALIASES = {
  'jersey': 'jersey (knit)',
  'viscose': 'viscose / rayon',
};

async function appendFabricAdvice(container, garmentKey, photoFabric) {
  const { suggested, avoid } = await fabricAdvice(garmentKey);
  if (!suggested.length && !avoid.length && !photoFabric) return;

  const title = document.createElement('h2');
  title.style.cssText = 'font-weight:400;font-size:22px;margin-top:44px';
  title.textContent = t('result.fabricadvice');
  container.appendChild(title);

  // Sewing-assistant line: what the photo's fabric means for THIS project.
  // Only verified-DB facts are stated; unknown fabrics get an honest note.
  if (photoFabric) {
    const canonical = FABRIC_ALIASES[photoFabric] || photoFabric;
    const inSuggested = suggested.find((f) => f.name === canonical);
    const inAvoid = avoid.find((f) => f.name === canonical);
    const line = document.createElement('p');
    line.style.maxWidth = '640px';
    if (inSuggested) {
      line.textContent = t('result.photofabric.good', { name: photoFabric, note: inSuggested.commonMistakes[0] || inSuggested.drape });
    } else if (inAvoid) {
      line.textContent = t('result.photofabric.bad', { name: photoFabric, drape: inAvoid.drape });
    } else {
      line.textContent = t('result.photofabric.unknown', { name: photoFabric });
    }
    container.appendChild(line);
  }

  const list = document.createElement('ul');
  list.className = 'result-meta';
  list.style.maxWidth = '640px';
  for (const fabric of suggested) {
    const li = document.createElement('li');
    li.style.display = 'block';
    const name = document.createElement('span');
    name.textContent = `${fabric.name} — ${fabric.drape}, ${fabric.beginnerDifficulty} to sew. `;
    const note = document.createElement('span');
    note.className = 'k';
    note.textContent = fabric.commonMistakes[0] || '';
    li.append(name, note);
    list.appendChild(li);
  }
  for (const fabric of avoid) {
    const li = document.createElement('li');
    li.style.display = 'block';
    const name = document.createElement('span');
    name.textContent = `avoid ${fabric.name} here — `;
    const note = document.createElement('span');
    note.className = 'k';
    note.textContent = `works against this shape (${fabric.drape}).`;
    li.append(name, note);
    list.appendChild(li);
  }
  container.appendChild(list);
}
