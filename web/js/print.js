// True-scale A4 print pipeline. Engine units are millimeters; SVG rendered
// with mm dimensions prints at real size.
//
// All pieces are shelf-packed into ONE layout (like a cutting table), then
// the layout is tiled into A4 sheets. Sheets with no geometry are skipped,
// far fewer, far fuller pages than tiling each piece separately.
import { PAGE_W, PAGE_H, bounds, packPieces, sheetCode, usedCells, sheetInner, nestedSheetInner, pieceSheetMap } from './sheet.js?v=100';
import { getLang } from './i18n.js?v=100';
import { missingFeatures, MISSING_STRINGS } from './missing.js?v=100';

// The print cover carries the MOST critical instructions (printer scale,
// assembly), a Turkish sewist must read these in Turkish or the pattern comes
// out the wrong size. Localised inline here (print.js builds raw DOM, not i18n
// data-attrs). EN kept as the fallback.
const P = {
  cover: {
    en: (g) => `${g}, stitchu pattern`,
    tr: (g) => `${g}, stitchu kalıbı`,
  },
  saIncluded: (cm) => ({
    en: `seam allowance ${cm} cm INCLUDED, cut on the OUTER line, sew on the inner fine line`,
    tr: `dikiş payı ${cm} cm DAHİL, DIŞ çizgiden kes, içteki ince çizgiden dik`,
  }),
  saNot: (cm) => ({
    en: `seam allowance ${cm} cm NOT drawn, add it while cutting`,
    tr: `dikiş payı ${cm} cm çizili DEĞİL, keserken ekle`,
  }),
  piecesFabric: (n, m) => ({
    en: `${n} pieces · ${m} m fabric at 140 cm · `,
    tr: `${n} parça · 140 cm eninde ${m} m kumaş · `,
  }),
  cutTableTitle: {
    en: 'Cutting list, every piece numbered with the sheets it prints on:',
    tr: 'Kesim listesi, her parça numaralı ve hangi sayfalarda basıldığı:',
  },
  cutTableHead: {
    en: ['no', 'piece', 'cut', 'sheets'],
    tr: ['no', 'parça', 'kes', 'sayfalar'],
  },
  chalkNote: {
    en: 'MARK THESE DIRECTLY ON THE FABRIC with chalk and a ruler (straight strips, no printed piece needed). Space the gather notches evenly along each strip’s top edge:',
    tr: 'BUNLARI DOĞRUDAN KUMAŞA tebeşir ve cetvelle çiz (düz şeritler, basılı parça gerekmez). Büzgü çentiklerini her şeridin üst kenarına eşit aralıkla yerleştir:',
  },
  assemble: (n, cols) => ({
    en: `${n} sheets. Lay them in a grid ${cols} across (big corner code = row letter + column number: A1 top-left). Cut or fold along the dashed page frame, tape edge to edge: the black corner squares and edge ticks must COMPLETE across the joint, a piece running off a page tells you which sheet it continues on. PRINTER SETTINGS: scale 100%, headers/footers OFF, then verify the 3 cm square below.`,
    tr: `${n} sayfa. Bunları ${cols} sütunlu bir ızgaraya diz (köşedeki büyük kod = satır harfi + sütun numarası: A1 sol üst). Kesikli sayfa çerçevesinden kes ya da katla, kenar kenara bantla: siyah köşe kareleri ve kenar işaretleri ek yerinde TAMAMLANMALI, sayfadan taşan parça hangi sayfada devam ettiğini söyler. YAZICI AYARLARI: ölçek %100, üstbilgi/altbilgi KAPALI, sonra aşağıdaki 3 cm'lik kareyi doğrula.`,
  }),
  sheet: (g, code, cols) => ({
    en: `${g}, sheet ${code} (grid ${cols} across)`,
    tr: `${g}, sayfa ${code} (${cols} sütunlu ızgara)`,
  }),
  demoWarn: {
    en: 'STANDARD EU38 SIZE, this is not drafted to your measurements yet. Add your seven measurements on the site for a pattern that fits you.',
    tr: 'STANDART EU38 BEDEN, bu henüz senin ölçülerine çizilmedi. Sana uyan bir kalıp için sitede yedi ölçünü ekle.',
  },
  gradeCover: (g, n) => ({
    en: `${g}, size run, ${n} sizes`,
    tr: `${g}, beden serisi, ${n} beden`,
  }),
  gradeIntro: (labels) => ({
    en: `One design, graded across: ${labels}. Print only the sizes you need.`,
    tr: `Tek tasarım, şu bedenlere serilendi: ${labels}. Sadece ihtiyacın olan bedenleri yazdır.`,
  }),
  gradeAssemble: {
    en: 'Each size starts with its own cover sheet and calibration square. Keep printer scale at 100% and verify the 3 cm square on every size before cutting. Every interior sheet is stamped with its size, cut only the sheets for the size you need.',
    tr: 'Her beden kendi kapak sayfası ve kalibrasyon karesiyle başlar. Yazıcı ölçeğini %100 tut ve kesmeden önce her bedendeki 3 cm kareyi doğrula. Her iç sayfada bedeni yazılıdır, sadece ihtiyacın olan bedenin sayfalarını kes.',
  },
  gradeChartTitle: {
    en: 'Size chart, pick your size by your own measurements (standard body, cm):',
    tr: 'Beden tablosu, kendi ölçünle bedenini seç (standart vücut, cm):',
  },
  chartSize: { en: 'size', tr: 'beden' },
  chartWaist: { en: 'waist', tr: 'bel' },
  chartFabric: { en: 'fabric', tr: 'kumaş' },
  nestedCover: (g, n) => ({
    en: `${g}, nested size run, ${n} sizes on one set of sheets`,
    tr: `${g}, iç içe beden serisi, ${n} beden tek sayfa setinde`,
  }),
  nestedIntro: {
    en: 'Every size is drawn ON TOP of the others, each in its own line colour. Print once, then trace the ONE colour for the size you need onto your fabric or a copy, no separate print per size.',
    tr: 'Her beden diğerlerinin ÜZERİNE, kendi çizgi renginde çizildi. Bir kez yazdır, sonra ihtiyacın olan bedenin TEK rengini kumaşına ya da bir kopyaya geçir, her beden için ayrı baskı yok.',
  },
  nestedLegend: { en: 'line colour → size', tr: 'çizgi rengi → beden' },
  nestedAssemble: (n, cols) => ({
    en: `${n} sheets, grid ${cols} across (A1 top-left). Tape edge to edge: the black corner squares and edge ticks must complete across the joint. PRINTER: scale 100%, headers/footers OFF, verify the 3 cm square. Then follow ONE colour per size.`,
    tr: `${n} sayfa, ${cols} sütunlu ızgara (A1 sol üst). Kenar kenara bantla: siyah köşe kareleri ve kenar işaretleri ek yerinde tamamlanmalı. YAZICI: ölçek %100, üstbilgi/altbilgi KAPALI, 3 cm kareyi doğrula. Sonra her beden için TEK rengi takip et.`,
  }),
};

// Distinct line colours for nested sizes (vişne brand colour leads). Up to 10
// EU sizes; the palette is colour-blind-aware (no red/green adjacency) and
// pairs a dash pattern with each so a mono printer still separates them.
const NEST_STYLES = [
  { c: '#8f2038', d: '' },        // vişne (brand), solid
  { c: '#1f6feb', d: '5 3' },     // blue
  { c: '#c26b00', d: '' },        // amber, solid
  { c: '#5a2a82', d: '4 3' },     // purple
  { c: '#0a7d6b', d: '' },        // teal-green, solid
  { c: '#b02a6f', d: '6 3' },     // magenta
  { c: '#3a5a1f', d: '' },        // olive, solid
  { c: '#2b4a7a', d: '2 3' },     // navy
  { c: '#8a5a00', d: '' },        // brown, solid
  { c: '#444444', d: '3 2' },     // grey
];
const nestStyle = (i) => NEST_STYLES[i % NEST_STYLES.length];
const L = () => (getLang() === 'tr' ? 'tr' : 'en');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// The honest "seen vs drawn" block on the print cover, same content as the
// on-screen card, drawn as plain cover text so the person cutting the pattern
// reads exactly what was approximated. Silent on a clean draft.
function appendMissingToCover(cover, seen, lang) {
  const items = missingFeatures(seen, lang);
  if (!items.length) return;
  cover.appendChild(el('div', 'print-sub print-missing-head', MISSING_STRINGS.heading[lang]));
  const list = el('ul', 'print-map');
  for (const it of items) {
    const tail = it.applied
      ? `, ${MISSING_STRINGS.gaveClosest[lang]}: ${it.applied}. ${it.note}`
      : `, ${MISSING_STRINGS.notInPattern[lang]}`;
    list.appendChild(el('li', '', it.label + tail));
  }
  cover.appendChild(list);
}

// A plain rectangle strip (ruffle tiers, halter bias binding) never earns
// pattern paper: its cut note fully describes it, so it goes on the cover as
// a chalk-and-ruler line instead of eating a row of near-empty sheets.
export function isChalkPiece(p) {
  return p.name.includes('Ruffle') || p.name.includes('Bias binding');
}

// One A4 sheet: a viewBox window over the packed strip; all markup (pieces +
// register system) comes from sheet.js so node tests render the same pixels.
function sheetSVG(layout, col, row, used) {
  const x0 = col * PAGE_W;
  const y0 = row * PAGE_H;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${PAGE_W}mm`);
  svg.setAttribute('height', `${PAGE_H}mm`);
  svg.setAttribute('viewBox', `${x0} ${y0} ${PAGE_W} ${PAGE_H}`);
  svg.innerHTML = sheetInner(layout, col, row, used);
  return svg;
}

function calibrationSVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '34mm');
  svg.setAttribute('height', '47mm');
  svg.setAttribute('viewBox', '0 0 34 47');
  // 3 cm square + a 1 inch bar: whichever ruler the sewist owns, one of the
  // two references reads directly (imperial printers/US Letter buyers too).
  svg.innerHTML =
    '<rect x="2" y="2" width="30" height="30" fill="none" stroke="#111" stroke-width="0.5"/>' +
    '<text x="17" y="37" font-family="Helvetica" font-size="3.2" fill="#111" text-anchor="middle">3 cm, measure me before cutting</text>' +
    '<line x1="2" y1="41" x2="27.4" y2="41" stroke="#111" stroke-width="0.5"/>' +
    '<line x1="2" y1="39.2" x2="2" y2="42.8" stroke="#111" stroke-width="0.5"/>' +
    '<line x1="27.4" y1="39.2" x2="27.4" y2="42.8" stroke="#111" stroke-width="0.5"/>' +
    '<text x="14.7" y="46.2" font-family="Helvetica" font-size="3.2" fill="#111" text-anchor="middle">1 inch</text>';
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
  const { sheets, used } = usedCells(layout);

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
  // Numbered cutting table (Blok 2): every piece gets a number and the sheets it
  // prints on, so a piece split across pages is found at a glance, not hunted.
  cover.appendChild(el('div', 'print-sub', P.cutTableTitle[lang]));
  const cutRows = pieceSheetMap(layout);
  const cutTable = el('table', 'print-cuttable');
  const cutHead = el('tr', '');
  for (const h of P.cutTableHead[lang]) cutHead.appendChild(el('th', '', h));
  cutTable.appendChild(cutHead);
  cutRows.forEach((row, i) => {
    const tr = el('tr', '');
    for (const c of [String(i + 1), row.name, row.cutInstruction, row.sheets.join(', ')]) {
      tr.appendChild(el('td', '', c));
    }
    cutTable.appendChild(tr);
  });
  cover.appendChild(cutTable);
  if (chalk.length && paper.length) {
    cover.appendChild(el('div', 'print-sub', P.chalkNote[lang]));
    const chalkMap = el('ul', 'print-map');
    for (const piece of chalk) {
      chalkMap.appendChild(el('li', '', `${piece.name}, ${piece.cutInstruction}`));
    }
    cover.appendChild(chalkMap);
  }
  // Honesty on paper: whoever cuts this must read what the vision saw but the
  // pattern could not draw, and the closest derivative given. Same single
  // source (missing.js) as the on-screen card.
  appendMissingToCover(cover, result.seen, lang);
  cover.appendChild(el('div', 'print-sub', P.assemble(sheets.length, layout.cols)[lang]));
  cover.appendChild(calibrationSVG());
  root.appendChild(cover);

  for (const { col, row } of sheets) {
    const page = el('div', 'print-page');
    page.appendChild(el('div', 'print-label',
      P.sheet(titleGarment, sheetCode(row, col), layout.cols)[lang]));
    // In a graded run every sheet must SHOUT its size on the artwork itself: if
    // the label strip is trimmed or the sheets get shuffled, a buyer must never
    // cut EU44 sheets thinking they are EU38 (that is fabric on the floor).
    if (sizeLabel) page.appendChild(el('div', 'print-size-stamp', sizeLabel));
    page.appendChild(sheetSVG(layout, col, row, used));
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
      b.bust != null ? `${b.bust} cm` : ', ',
      b.waist != null ? `${b.waist} cm` : ', ',
      b.hip != null ? `${b.hip} cm` : ', ',
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

// One nested A4 sheet: the SAME viewBox window as a normal sheet, but every
// size's same-named piece is drawn over the largest size's placement, each in
// its own colour. Markup comes from sheet.js (single source, node-testable).
function nestedSheetSVG(layout, sizes, styleByLabel, col, row, used) {
  const x0 = col * PAGE_W;
  const y0 = row * PAGE_H;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${PAGE_W}mm`);
  svg.setAttribute('height', `${PAGE_H}mm`);
  svg.setAttribute('viewBox', `${x0} ${y0} ${PAGE_W} ${PAGE_H}`);
  svg.innerHTML = nestedSheetInner(layout, sizes, styleByLabel, col, row, used);
  return svg;
}

// Nested/stacked size run: every size overlaid on ONE set of sheets, each in
// its own line colour, the industry-standard multi-size PDF. Print once, trace
// the one colour you need. `sizes` = [{size, body, draft:{pattern,issues}}].
export function printGradeNested(sizes, garmentLabel) {
  const root = el('div', '');
  root.id = 'print-root';
  const lang = L();

  // Index each size's paper pieces by name; the largest size defines the
  // envelope the sheets are packed to (it contains every smaller size).
  const prepared = sizes.map((s) => {
    const paper = s.draft.pattern.pieces.filter((p) => !isChalkPiece(p));
    const byName = new Map(paper.map((p) => [p.name, p]));
    return { size: s.size, body: s.body, pattern: s.draft.pattern, paper, byName };
  });
  // Largest = last size (grade is monotonic, EU34<...<EU52); guard by area.
  const area = (pr) => pr.paper.reduce((a, p) => {
    const b = bounds(p); return a + (b.maxX - b.minX) * (b.maxY - b.minY);
  }, 0);
  const largest = prepared.reduce((m, pr) => (area(pr) > area(m) ? pr : m), prepared[0]);
  // No rotation for nested runs: every size registers on the SAME placement.
  const layout = packPieces(largest.paper, false);
  const styleByLabel = new Map(prepared.map((pr, i) => [pr.size, nestStyle(i)]));
  const { sheets, used } = usedCells(layout);

  // ---- cover ----
  const cover = el('div', 'print-page');
  cover.appendChild(el('div', 'print-title', P.nestedCover(garmentLabel, prepared.length)[lang]));
  cover.appendChild(el('div', 'print-sub', P.nestedIntro[lang]));

  // Legend: colour swatch -> size.
  cover.appendChild(el('div', 'print-sub', P.nestedLegend[lang]));
  const legend = el('div', 'print-nest-legend');
  for (const pr of prepared) {
    const st = styleByLabel.get(pr.size);
    const item = el('div', 'nest-legend-item');
    const sw = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sw.setAttribute('width', '30'); sw.setAttribute('height', '10'); sw.setAttribute('viewBox', '0 0 30 10');
    sw.innerHTML = `<line x1="1" y1="5" x2="29" y2="5" stroke="${st.c}" stroke-width="1.6"${st.d ? ` stroke-dasharray="${st.d}"` : ''}/>`;
    item.appendChild(sw);
    item.appendChild(el('span', '', pr.size));
    legend.appendChild(item);
  }
  cover.appendChild(legend);

  // Size chart (same as the sequential run, the buyer picks by their body).
  cover.appendChild(el('div', 'print-sub', P.gradeChartTitle[lang]));
  const table = el('table', 'print-sizechart');
  const head = el('tr', '');
  for (const h of [P.chartSize[lang], 'bust', P.chartWaist[lang], 'hip', P.chartFabric[lang]]) head.appendChild(el('th', '', h));
  table.appendChild(head);
  for (const pr of prepared) {
    const tr = el('tr', '');
    const b = pr.body || {};
    const cells = [pr.size, b.bust != null ? `${b.bust} cm` : ', ', b.waist != null ? `${b.waist} cm` : ', ',
      b.hip != null ? `${b.hip} cm` : ', ', `${pr.pattern.fabricMeters140} m`];
    for (const c of cells) tr.appendChild(el('td', '', c));
    table.appendChild(tr);
  }
  cover.appendChild(table);
  cover.appendChild(el('div', 'print-sub', P.nestedAssemble(sheets.length, layout.cols)[lang]));
  cover.appendChild(calibrationSVG());
  root.appendChild(cover);

  // ---- nested sheets ----
  const sizesForSheet = prepared; // largest..smallest handled inside the sheet
  for (const { col, row } of sheets) {
    const page = el('div', 'print-page');
    page.appendChild(el('div', 'print-label',
      P.sheet(garmentLabel, sheetCode(row, col), layout.cols)[lang]));
    page.appendChild(nestedSheetSVG(layout, sizesForSheet, styleByLabel, col, row, used));
    root.appendChild(page);
  }

  document.body.appendChild(root);
  const cleanup = () => { root.remove(); window.removeEventListener('afterprint', cleanup); };
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
