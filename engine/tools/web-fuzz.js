/* web-fuzz.js — walks the WEB layer's whole spec space (the mapping create.js
   sends to draftJSON, including ruffle/keyhole translation) across body-corner
   measurements, then simulates the print packer's math on every draft to prove
   no piece can be clipped and page counts stay sane.
   run:  node engine/tools/web-fuzz.js */
const createEngine = require(process.env.HOME + '/damla_projects_2026/00_currently_on_working/stitchu/engine/dist/stitchu-engine.js');

const PAGE_W = 190, PAGE_H = 250, GUTTER = 12;

// Same UI ranges as web/js/store.js MEASUREMENTS.
const RANGES = { bust: [60, 160], waist: [45, 140], hip: [60, 170], shoulder: [26, 52],
                 backLength: [28, 55], armLength: [40, 75], neck: [26, 55] };

// Body corners: mid, all-min, all-max, and mixed stress bodies.
const BODIES = [
  { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 },
  Object.fromEntries(Object.entries(RANGES).map(([k, [lo]]) => [k, lo])),
  Object.fromEntries(Object.entries(RANGES).map(([k, [, hi]]) => [k, hi])),
  { bust: 160, waist: 45, hip: 60, shoulder: 26, backLength: 55, armLength: 40, neck: 55 },
  { bust: 60, waist: 140, hip: 170, shoulder: 52, backLength: 28, armLength: 75, neck: 26 },
];

function bounds(piece) {
  const xs = [], ys = [];
  for (const c of [...piece.commands, ...piece.markings, ...(piece.cutLine || [])]) {
    if (c.x !== undefined) { xs.push(c.x); ys.push(c.y); }
    if (c.cp1x !== undefined) { xs.push(c.cp1x, c.cp2x); ys.push(c.cp1y, c.cp2y); }
  }
  if (piece.grainline) {
    xs.push(piece.grainline.fromX, piece.grainline.toX);
    ys.push(piece.grainline.fromY, piece.grainline.toY);
  }
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

// Mirror of print.js (shelfPack/countSheets/packPieces + chalk split).
function shelfPack(dims, cols) {
  const stripW = cols * PAGE_W;
  const sorted = [...dims].sort((a, b) => b.h - a.h);
  let shelfY = 0, shelfH = 0, x = 0;
  for (const d of sorted) {
    if (x > 0 && x + d.w > stripW) { shelfY += shelfH + GUTTER; x = 0; shelfH = 0; }
    d.x0 = x; d.y0 = shelfY;
    x += d.w + GUTTER; shelfH = Math.max(shelfH, d.h);
  }
  return { placed: sorted, cols, stripW, stripH: shelfY + shelfH };
}
function countSheets(layout) {
  const rows = Math.ceil(layout.stripH / PAGE_H);
  let used = 0;
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < layout.cols; col++) {
      const x0 = col * PAGE_W, y0 = row * PAGE_H;
      if (layout.placed.some((d) => d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0)) used++;
    }
  return used;
}
function packPieces(pieces) {
  const dims = pieces.map((p) => { const b = bounds(p); return { p, b, w: b.maxX - b.minX, h: b.maxY - b.minY }; });
  const maxW = Math.max(...dims.map((d) => d.w));
  const minCols = Math.max(1, Math.ceil((maxW + 1) / PAGE_W));
  let bestCols = minCols, bestSheets = Infinity;
  for (let cols = minCols; cols <= Math.max(5, minCols); cols++) {
    const sheets = countSheets(shelfPack(dims, cols));
    if (sheets < bestSheets) { bestCols = cols; bestSheets = sheets; }
  }
  return shelfPack(dims, bestCols);
}
const isChalkPiece = (p) => p.name.includes('Ruffle') || p.name.includes('Bias binding');

createEngine().then((e) => {
  const necklines = ['crew', 'scoop', 'vNeck', 'square', 'boat', 'sweetheart', 'halter'];
  const sleeves = [['none', 'short'], ['straight', 'long'], ['balloon', 'elbow']];
  const skirts = ['aLine', 'straight', 'gathered', 'halfCircle', 'pleated'];
  const lengths = ['mini', 'midi', 'maxi'];
  const ruffles = ['none', 'single', 'tiered'];
  const keyholes = ['none', 'keyhole'];

  let drafts = 0, blocked = 0, failures = 0, maxSheets = 0;
  const blockedExamples = [];

  const run = (label, args, m, placket = false) => {
    drafts++;
    const out = JSON.parse(e.draftJSON(...args,
      m.bust, m.waist, m.hip, m.shoulder, m.backLength, m.armLength, m.neck, 0, placket));
    if (out.issues.length) {
      blocked++;
      if (blockedExamples.length < 8) blockedExamples.push(`${label}: ${out.issues[0]}`);
      return; // honestly blocked drafts never reach print
    }
    const paper = out.pattern.pieces.filter((p) => !isChalkPiece(p));
    const layout = packPieces(paper);
    for (const d of layout.placed) {
      if (d.x0 + d.w > layout.stripW + 0.001) {
        failures++;
        console.log(`CLIP ${label}: ${d.p.name} ${d.w.toFixed(0)}mm > strip ${layout.stripW}mm`);
      }
    }
    const sheets = countSheets(layout);
    maxSheets = Math.max(maxSheets, sheets);
    // Backstop only: very large bodies in maxi pleated dresses legitimately
    // need 80+ sheets; three-digit counts would mean packing went wrong.
    if (sheets > 100) { failures++; console.log(`PAGES ${label}: ${sheets} sheets`); }
    if (!(out.pattern.fabricMeters140 > 0 && out.pattern.fabricMeters140 < 30)) {
      failures++; console.log(`FABRIC ${label}: ${out.pattern.fabricMeters140} m`);
    }
  };

  // Loop 8 gather variant: appends the full trailing arg list (frontPlacket,
  // tieClosure, sleeveCap, collarType, collarEdge, gatherType, gatherZone) so the
  // gathered panel + drawstring cord are drafted and packed like any other piece.
  const gatherRun = (label, args, m, gatherType, gatherZone) => {
    drafts++;
    const out = JSON.parse(e.draftJSON(...args,
      m.bust, m.waist, m.hip, m.shoulder, m.backLength, m.armLength, m.neck, 0,
      false, 0, 0, 0, 0, gatherType, gatherZone, 0));
    if (out.issues.length) { blocked++; return; }
    const paper = out.pattern.pieces.filter((p) => !isChalkPiece(p));
    const layout = packPieces(paper);
    for (const d of layout.placed) {
      if (d.x0 + d.w > layout.stripW + 0.001) {
        failures++;
        if (blockedExamples.length < 8) blockedExamples.push(`CLIP ${label}`);
      }
    }
    // Use the same USED-SET sheet count the main run() uses (countSheets), not a
    // bounding-box product — a long thin drawstring cord spans a wide bbox but
    // only touches a handful of real sheets, so the product wildly overcounts.
    const sheets = countSheets(layout);
    maxSheets = Math.max(maxSheets, sheets);
    if (sheets > 100) { failures++; console.log(`PAGES ${label}: ${sheets} sheets`); }
  };

  // Loop 9b open-back variant: appends the full trailing arg list with the
  // backOpening enum LAST so the open-back cutout facing is drafted + packed.
  const backOpenRun = (label, args, m, backOpening) => {
    drafts++;
    const out = JSON.parse(e.draftJSON(...args,
      m.bust, m.waist, m.hip, m.shoulder, m.backLength, m.armLength, m.neck, 0,
      false, 0, 0, 0, 0, 0, 0, backOpening));
    if (out.issues.length) { blocked++; return; }
    const paper = out.pattern.pieces.filter((p) => !isChalkPiece(p));
    const layout = packPieces(paper);
    for (const d of layout.placed) {
      if (d.x0 + d.w > layout.stripW + 0.001) {
        failures++;
        if (blockedExamples.length < 8) blockedExamples.push(`CLIP ${label}`);
      }
    }
    const sheets = countSheets(layout);
    maxSheets = Math.max(maxSheets, sheets);
    if (sheets > 100) { failures++; console.log(`PAGES ${label}: ${sheets} sheets`); }
  };

  for (const [bi, m] of BODIES.entries()) {
    // dresses: the full web picker space (shaping princess default; dart spot-checked below)
    for (const neckline of necklines)
      for (const [sleeve, sleeveLen] of sleeves)
        for (const skirt of skirts)
          for (const len of lengths)
            for (const waist of ['natural', 'empire'])
              for (const ruffle of ruffles)
                for (const key of keyholes)
                  run(`b${bi} dress/${neckline}/${sleeve}/${skirt}/${len}/${waist}/${ruffle}/${key}`,
                      ['dress', 'princess', waist, 'woven', neckline, sleeve, sleeveLen, skirt, len, 'hip',
                       ruffle !== 'none', ruffle === 'tiered' ? 3 : 1, key === 'keyhole'], m);
    // skirts + ruffle
    for (const skirt of skirts)
      for (const len of lengths)
        for (const ruffle of ruffles)
          run(`b${bi} skirt/${skirt}/${len}/${ruffle}`,
              ['skirt', 'princess', 'natural', 'woven', 'crew', 'none', 'short', skirt, len, 'hip',
               ruffle !== 'none', ruffle === 'tiered' ? 3 : 1, false], m);
    // tops + keyhole, knit axis, dart spot-check
    for (const neckline of necklines)
      for (const topLen of ['cropped', 'hip', 'tunic'])
        for (const key of keyholes)
          for (const fabric of ['woven', 'knit'])
            run(`b${bi} top/${neckline}/${topLen}/${key}/${fabric}`,
                ['top', 'princess', 'natural', fabric, neckline, 'straight', 'long', 'aLine', 'midi', topLen,
                 false, 1, key === 'keyhole'], m);
    // Loop 3: front button placket across necklines, dresses + tops, princess + dart.
    for (const neckline of necklines) {
      if (neckline === 'halter') continue; // no CF placket on a halter
      run(`b${bi} placket dress/${neckline}`,
          ['dress', 'princess', 'natural', 'woven', neckline, 'none', 'short', 'aLine', 'midi', 'hip', false, 1, false], m, true);
      run(`b${bi} placket top/${neckline}`,
          ['top', 'princess', 'natural', 'woven', neckline, 'straight', 'long', 'aLine', 'midi', 'hip', false, 1, false], m, true);
    }
    run(`b${bi} placket dart dress`, ['dress', 'dart', 'natural', 'woven', 'vNeck', 'none', 'short', 'aLine', 'midi', 'hip', false, 1, false], m, true);
    run(`b${bi} dart dress`, ['dress', 'dart', 'natural', 'woven', 'sweetheart', 'none', 'short', 'aLine', 'midi', 'hip', true, 3, true], m);
    run(`b${bi} knit babydoll`, ['dress', 'princess', 'empire', 'knit', 'crew', 'balloon', 'short', 'gathered', 'mini', 'hip', true, 1, true], m);
    // Loop 8: drawstring / shirred / smocked gathering across zones, dress + top,
    // princess + dart. The gather panel (+ drawstring cord) is a fresh piece that
    // must pack without clipping. Sleeve zone gets a real sleeve so it draws.
    for (const [gt, gtName] of [[1, 'drawstring'], [2, 'shirred'], [3, 'smocked']]) {
      for (const [gz, gzName] of [[0, 'neck'], [1, 'bust'], [2, 'waist'], [3, 'sleeve']]) {
        const dressArgs = ['dress', 'princess', 'natural', 'woven', 'crew',
          gz === 3 ? 'straight' : 'none', 'short', 'aLine', 'midi', 'hip', false, 1, false];
        gatherRun(`b${bi} gather-${gtName}-${gzName} dress`, dressArgs, m, gt, gz);
        const topArgs = ['top', 'dart', 'natural', 'woven', 'crew',
          gz === 3 ? 'straight' : 'none', 'long', 'aLine', 'midi', 'hip', false, 1, false];
        gatherRun(`b${bi} gather-${gtName}-${gzName} top`, topArgs, m, gt, gz);
      }
    }
    // Loop 9b: open-back cutout across the 4 shapes, dress + top, princess + dart.
    // The facing is a fresh piece that must pack without clipping.
    for (const [bo, boName] of [[1, 'round'], [2, 'lowV'], [3, 'square'], [4, 'keyhole']]) {
      backOpenRun(`b${bi} openback-${boName} dress`,
        ['dress', 'princess', 'natural', 'woven', 'scoop', 'none', 'short', 'aLine', 'midi', 'hip', false, 1, false], m, bo);
      backOpenRun(`b${bi} openback-${boName} top`,
        ['top', 'dart', 'natural', 'woven', 'crew', 'straight', 'long', 'aLine', 'midi', 'hip', false, 1, false], m, bo);
    }
  }

  console.log(`\nweb fuzz: ${drafts} drafts | ${blocked} validator-blocked (honest) | max ${maxSheets} sheets | ${failures} FAILURES`);
  if (blocked) console.log('blocked examples:\n  ' + blockedExamples.join('\n  '));
  process.exit(failures === 0 ? 0 : 1);
});
