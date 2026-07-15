// True-scale A4 print pipeline. Engine units are millimeters; SVG rendered
// with mm dimensions prints at real size.
//
// All pieces are shelf-packed into ONE layout (like a cutting table), then
// the layout is tiled into A4 sheets. Sheets with no geometry are skipped —
// far fewer, far fuller pages than tiling each piece separately.
import { pathD, bounds } from './render.js?v=46';
import { getLang } from './i18n.js?v=46';

// The print cover carries the MOST critical instructions (printer scale,
// assembly) — a Turkish sewist must read these in Turkish or the pattern comes
// out the wrong size. Localised inline here (print.js builds raw DOM, not i18n
// data-attrs). EN kept as the fallback.
const P = {
  cover: {
    en: (g) => `${g} — stitchu pattern`,
    tr: (g) => `${g} — stitchu kalıbı`,
  },
  saIncluded: (cm) => ({
    en: `seam allowance ${cm} cm INCLUDED — cut on the OUTER line, sew on the inner fine line`,
    tr: `dikiş payı ${cm} cm DAHİL — DIŞ çizgiden kes, içteki ince çizgiden dik`,
  }),
  saNot: (cm) => ({
    en: `seam allowance ${cm} cm NOT drawn, add it while cutting`,
    tr: `dikiş payı ${cm} cm çizili DEĞİL, keserken ekle`,
  }),
  piecesFabric: (n, m) => ({
    en: `${n} pieces · ${m} m fabric at 140 cm · `,
    tr: `${n} parça · 140 cm eninde ${m} m kumaş · `,
  }),
  chalkNote: {
    en: 'MARK THESE DIRECTLY ON THE FABRIC with chalk and a ruler (straight strips — no printed piece needed). Space the gather notches evenly along each strip’s top edge:',
    tr: 'BUNLARI DOĞRUDAN KUMAŞA tebeşir ve cetvelle çiz (düz şeritler — basılı parça gerekmez). Büzgü çentiklerini her şeridin üst kenarına eşit aralıkla yerleştir:',
  },
  assemble: (n, cols) => ({
    en: `${n} sheets. Lay them in a grid ${cols} across (sheet code = row letter + column number: A1 top-left). Tape edge to edge, matching the small edge ticks — no overlap. PRINTER SETTINGS: scale 100%, headers/footers OFF, then verify the 3 cm square below.`,
    tr: `${n} sayfa. Bunları ${cols} sütunlu bir ızgaraya diz (sayfa kodu = satır harfi + sütun numarası: A1 sol üst). Kenar kenara, küçük kenar işaretlerini eşleştirerek bantla — üst üste bindirme. YAZICI AYARLARI: ölçek %100, üstbilgi/altbilgi KAPALI, sonra aşağıdaki 3 cm'lik kareyi doğrula.`,
  }),
  sheet: (g, code, cols) => ({
    en: `${g} — sheet ${code} (grid ${cols} across)`,
    tr: `${g} — sayfa ${code} (${cols} sütunlu ızgara)`,
  }),
  demoWarn: {
    en: 'STANDARD EU38 SIZE — this is not drafted to your measurements yet. Add your seven measurements on the site for a pattern that fits you.',
    tr: 'STANDART EU38 BEDEN — bu henüz senin ölçülerine çizilmedi. Sana uyan bir kalıp için sitede yedi ölçünü ekle.',
  },
  gradeCover: (g, n) => ({
    en: `${g} — size run, ${n} sizes`,
    tr: `${g} — beden serisi, ${n} beden`,
  }),
  gradeIntro: (labels) => ({
    en: `One design, graded across: ${labels}. Print only the sizes you need.`,
    tr: `Tek tasarım, şu bedenlere serilendi: ${labels}. Sadece ihtiyacın olan bedenleri yazdır.`,
  }),
  gradeAssemble: {
    en: 'Each size starts with its own cover sheet and calibration square. Keep printer scale at 100% and verify the 3 cm square on every size before cutting. Every interior sheet is stamped with its size — cut only the sheets for the size you need.',
    tr: 'Her beden kendi kapak sayfası ve kalibrasyon karesiyle başlar. Yazıcı ölçeğini %100 tut ve kesmeden önce her bedendeki 3 cm kareyi doğrula. Her iç sayfada bedeni yazılıdır — sadece ihtiyacın olan bedenin sayfalarını kes.',
  },
  gradeChartTitle: {
    en: 'Size chart — pick your size by your own measurements (standard body, cm):',
    tr: 'Beden tablosu — kendi ölçünle bedenini seç (standart vücut, cm):',
  },
  chartSize: { en: 'size', tr: 'beden' },
  chartWaist: { en: 'waist', tr: 'bel' },
  chartFabric: { en: 'fabric', tr: 'kumaş' },
};
const L = () => (getLang() === 'tr' ? 'tr' : 'en');

const PAGE_W = 190;   // printable width, mm (A4 210 minus 2x10 margins)
const PAGE_H = 250;   // printable height, mm (margin + label strip safety)
const GUTTER = 12;    // space between packed pieces, mm

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Shelf packing: tallest first, left to right, new shelf when the row is full.
function shelfPack(dims, cols) {
  const stripW = cols * PAGE_W;
  const sorted = [...dims].sort((a, b) => b.h - a.h);
  let shelfY = 0;
  let shelfH = 0;
  let x = 0;
  for (const d of sorted) {
    if (x > 0 && x + d.w > stripW) {
      shelfY += shelfH + GUTTER;
      x = 0;
      shelfH = 0;
    }
    d.x0 = x;
    d.y0 = shelfY;
    d.ox = x - d.b.minX;   // translate piece-local -> strip coords
    d.oy = shelfY - d.b.minY;
    x += d.w + GUTTER;
    shelfH = Math.max(shelfH, d.h);
  }
  return { placed: sorted, cols, stripW, stripH: shelfY + shelfH };
}

function countSheets(layout) {
  const rows = Math.ceil(layout.stripH / PAGE_H);
  let used = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x0 = col * PAGE_W;
      const y0 = row * PAGE_H;
      if (layout.placed.some((d) =>
        d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0)) used++;
    }
  }
  return used;
}

// A plain rectangle strip (ruffle tiers, halter bias binding) never earns
// pattern paper: its cut note fully describes it, so it goes on the cover as
// a chalk-and-ruler line instead of eating a row of near-empty sheets.
export function isChalkPiece(p) {
  return p.name.includes('Ruffle') || p.name.includes('Bias binding');
}

// Try every strip width and keep whichever wastes the fewest printed sheets —
// a fixed 3-wide strip left half the pages nearly empty on tall garments.
// The widest piece always fits: cols never drops below what it needs (a 1.4 m
// ruffle segment used to be silently CLIPPED at the old 5-column cap).
function packPieces(pieces) {
  const dims = pieces.map((p) => {
    const b = bounds(p);
    return { p, b, w: b.maxX - b.minX, h: b.maxY - b.minY };
  });
  const maxW = Math.max(...dims.map((d) => d.w));
  const minCols = Math.max(1, Math.ceil((maxW + 1) / PAGE_W));
  let bestCols = minCols;
  let bestSheets = Infinity;
  for (let cols = minCols; cols <= Math.max(5, minCols); cols++) {
    const sheets = countSheets(shelfPack(dims, cols));
    if (sheets < bestSheets) { bestCols = cols; bestSheets = sheets; }
  }
  // re-place at the winning width: the trial runs mutate the shared dims
  return shelfPack(dims, bestCols);
}

function pieceGroup(d) {
  // Outer solid = CUTTING line (allowance included); inner fine = SEWING line.
  // Old closet saves have no cutLine and print the single line as before.
  const hasCut = (d.p.cutLine || []).length > 0;
  let inner = hasCut
    ? `<path d="${pathD(d.p.cutLine, 1)}" fill="none" stroke="#111" stroke-width="0.6"/>` +
      `<path d="${pathD(d.p.commands, 1)}" fill="none" stroke="#555" stroke-width="0.35"/>`
    : `<path d="${pathD(d.p.commands, 1)}" fill="none" stroke="#111" stroke-width="0.6"/>`;
  if (d.p.markings.length) {
    inner += `<path d="${pathD(d.p.markings, 1)}" fill="none" stroke="#111" stroke-width="0.45" stroke-dasharray="4 3"/>`;
  }
  if (d.p.grainline) {
    // grainline with real arrowheads (the legend promises an arrow)
    const g = d.p.grainline;
    inner += `<line x1="${g.fromX}" y1="${g.fromY}" x2="${g.toX}" y2="${g.toY}" stroke="#111" stroke-width="0.45"/>` +
      `<path d="M ${g.fromX - 2.5} ${g.fromY + 4} L ${g.fromX} ${g.fromY} L ${g.fromX + 2.5} ${g.fromY + 4} ` +
      `M ${g.toX - 2.5} ${g.toY - 4} L ${g.toX} ${g.toY} L ${g.toX + 2.5} ${g.toY - 4}" fill="none" stroke="#111" stroke-width="0.45"/>`;
  }
  inner += `<text x="${d.b.minX + 6}" y="${d.b.minY + 14}" font-family="Helvetica" font-size="7" fill="#555">${d.p.name}</text>` +
           `<text x="${d.b.minX + 6}" y="${d.b.minY + 21}" font-family="Helvetica" font-size="6" fill="#888">${d.p.cutInstruction}</text>`;
  return `<g transform="translate(${d.ox.toFixed(1)} ${d.oy.toFixed(1)})">${inner}</g>`;
}

// One A4 sheet: a viewBox window over the packed strip + edge join ticks.
function sheetSVG(layout, col, row) {
  const x0 = col * PAGE_W;
  const y0 = row * PAGE_H;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${PAGE_W}mm`);
  svg.setAttribute('height', `${PAGE_H}mm`);
  svg.setAttribute('viewBox', `${x0} ${y0} ${PAGE_W} ${PAGE_H}`);

  let inner = '';
  const ghosts = [];
  for (const d of layout.placed) {
    if (d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0) {
      inner += pieceGroup(d);
      // the piece's own label lives at its top-left corner; on every OTHER
      // sheet the piece touches, whisper its name so no page is anonymous
      const labelX = d.x0 + 6, labelY = d.y0 + 14;
      if (labelX < x0 || labelX > x0 + PAGE_W || labelY < y0 || labelY > y0 + PAGE_H) {
        ghosts.push(d.p.name);
      }
    }
  }
  if (ghosts.length) {
    inner += `<text x="${x0 + 4}" y="${y0 + 6}" font-family="Helvetica" font-size="4" fill="#999">on this sheet: ${ghosts.join(' · ')}</text>`;
  }
  // sheet code inside the drawing area, bottom-left, so a loose page is never anonymous
  inner += `<text x="${x0 + 4}" y="${y0 + PAGE_H - 3}" font-family="Helvetica" font-size="4" fill="#999">sheet ${String.fromCharCode(65 + row)}${col + 1}</text>`;
  // join ticks at every shared edge midpoint (match tick to tick, no overlap)
  const t = 6;
  inner += `<line x1="${x0}" y1="${y0 + PAGE_H / 2}" x2="${x0 + t}" y2="${y0 + PAGE_H / 2}" stroke="#111" stroke-width="0.4"/>` +
           `<line x1="${x0 + PAGE_W - t}" y1="${y0 + PAGE_H / 2}" x2="${x0 + PAGE_W}" y2="${y0 + PAGE_H / 2}" stroke="#111" stroke-width="0.4"/>` +
           `<line x1="${x0 + PAGE_W / 2}" y1="${y0}" x2="${x0 + PAGE_W / 2}" y2="${y0 + t}" stroke="#111" stroke-width="0.4"/>` +
           `<line x1="${x0 + PAGE_W / 2}" y1="${y0 + PAGE_H - t}" x2="${x0 + PAGE_W / 2}" y2="${y0 + PAGE_H}" stroke="#111" stroke-width="0.4"/>`;
  svg.innerHTML = inner;
  return svg;
}

function calibrationSVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '34mm');
  svg.setAttribute('height', '38mm');
  svg.setAttribute('viewBox', '0 0 34 38');
  svg.innerHTML =
    '<rect x="2" y="2" width="30" height="30" fill="none" stroke="#111" stroke-width="0.5"/>' +
    '<text x="17" y="37" font-family="Helvetica" font-size="3.2" fill="#111" text-anchor="middle">3 cm — measure me before cutting</text>';
  return svg;
}

// Build one pattern's cover + sheets into `root`. Shared by a single print and
// by a graded size run (each size appends its own block, labelled by size).
// `sizeLabel` (e.g. "EU40"), when given, is stamped on the cover title.
function buildPrintPages(result, root, sizeLabel) {
  const p = result.pattern;
  const chalk = p.pieces.filter(isChalkPiece);
  const paper = p.pieces.filter((piece) => !isChalkPiece(piece));
  const layout = packPieces(paper.length ? paper : p.pieces);
  const rows = Math.ceil(layout.stripH / PAGE_H);

  const sheets = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x0 = col * PAGE_W;
      const y0 = row * PAGE_H;
      const used = layout.placed.some((d) =>
        d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0);
      if (used) sheets.push({ col, row });
    }
  }

  const lang = L();
  const cover = el('div', 'print-page');
  const titleGarment = sizeLabel ? `${p.garment} · ${sizeLabel}` : p.garment;
  cover.appendChild(el('div', 'print-title', P.cover[lang](titleGarment)));
  if (result.demoBody) {
    cover.appendChild(el('div', 'print-demo-warn', P.demoWarn[lang]));
  }
  const hasCutLines = p.pieces.some((piece) => (piece.cutLine || []).length > 0);
  const saCm = p.pieces[0].seamAllowance / 10;
  cover.appendChild(el('div', 'print-sub',
    P.piecesFabric(p.pieces.length, p.fabricMeters140)[lang] +
    (hasCutLines ? P.saIncluded(saCm)[lang] : P.saNot(saCm)[lang])));
  const map = el('ul', 'print-map');
  for (const piece of paper.length ? paper : p.pieces) {
    map.appendChild(el('li', '', `${piece.name} — ${piece.cutInstruction}`));
  }
  cover.appendChild(map);
  if (chalk.length && paper.length) {
    cover.appendChild(el('div', 'print-sub', P.chalkNote[lang]));
    const chalkMap = el('ul', 'print-map');
    for (const piece of chalk) {
      chalkMap.appendChild(el('li', '', `${piece.name} — ${piece.cutInstruction}`));
    }
    cover.appendChild(chalkMap);
  }
  cover.appendChild(el('div', 'print-sub', P.assemble(sheets.length, layout.cols)[lang]));
  cover.appendChild(calibrationSVG());
  root.appendChild(cover);

  for (const { col, row } of sheets) {
    const page = el('div', 'print-page');
    page.appendChild(el('div', 'print-label',
      P.sheet(titleGarment, `${String.fromCharCode(65 + row)}${col + 1}`, layout.cols)[lang]));
    // In a graded run every sheet must SHOUT its size on the artwork itself: if
    // the label strip is trimmed or the sheets get shuffled, a buyer must never
    // cut EU44 sheets thinking they are EU38 (that is fabric on the floor).
    if (sizeLabel) page.appendChild(el('div', 'print-size-stamp', sizeLabel));
    page.appendChild(sheetSVG(layout, col, row));
    root.appendChild(page);
  }
}

// Print a whole graded size run in one document: a run cover, then every size's
// full cover + sheets, each labelled with its EU size. The seller deliverable.
export function printGrade(sizes, garmentLabel) {
  const root = el('div', '');
  root.id = 'print-root';
  const lang = L();
  const cover = el('div', 'print-page');
  cover.appendChild(el('div', 'print-title', P.gradeCover(garmentLabel, sizes.length)[lang]));
  cover.appendChild(el('div', 'print-sub', P.gradeIntro(sizes.map((s) => s.size).join(', '))[lang]));

  // Size chart: the buyer picks their size by their OWN body, so publish the
  // standard bust/waist/hip (cm) for every size next to its fabric estimate.
  cover.appendChild(el('div', 'print-sub', P.gradeChartTitle[lang]));
  const table = el('table', 'print-sizechart');
  const head = el('tr', '');
  for (const h of [P.chartSize[lang], 'bust', P.chartWaist[lang], 'hip', P.chartFabric[lang]]) {
    head.appendChild(el('th', '', h));
  }
  table.appendChild(head);
  for (const s of sizes) {
    const tr = el('tr', '');
    const b = s.body || {};
    const cells = [
      s.size,
      b.bust != null ? `${b.bust} cm` : '—',
      b.waist != null ? `${b.waist} cm` : '—',
      b.hip != null ? `${b.hip} cm` : '—',
      `${s.draft.pattern.fabricMeters140} m`,
    ];
    for (const c of cells) tr.appendChild(el('td', '', c));
    table.appendChild(tr);
  }
  cover.appendChild(table);
  cover.appendChild(el('div', 'print-sub', P.gradeAssemble[lang]));
  cover.appendChild(calibrationSVG());
  root.appendChild(cover);

  for (const s of sizes) {
    const r = { pattern: s.draft.pattern, issues: s.draft.issues };
    buildPrintPages(r, root, s.size);
  }

  document.body.appendChild(root);
  const cleanup = () => {
    root.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}

export function printPattern(result) {
  const root = el('div', '');
  root.id = 'print-root';
  buildPrintPages(result, root);
  document.body.appendChild(root);
  const cleanup = () => {
    root.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}
