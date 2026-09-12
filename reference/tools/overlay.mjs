// Locket yuzlesmesi: Bugra beden-36 halkalari vs motor cutLine (ikisi de SA-DAHIL).
// Hizalama: centroid + PCA aci adaylari (+ayna, +90k), 2mm izgara IoU ile en iyi secilir.
// Cikti: /tmp/bugra-yuzlesme/locket/*.png + karsilastirma JSON.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const ROOT = '/Users/damummyphus/damla_projects_2026/stitchu';
const require2 = createRequire(join(ROOT, 'engine/tools/package.json'));
const { Resvg } = require2('@resvg/resvg-js');

const geo = JSON.parse(readFileSync('/tmp/bugra-yuzlesme/geometry-full.json', 'utf8'));
const motor = JSON.parse(readFileSync('/tmp/bugra-yuzlesme/motor-draft-locket.json', 'utf8'));
const M = Object.fromEntries(motor.result.peterPan.pieces.map(p => [p.name, p]));

// ---- geometri
const close = (P) => (P.length && (P[0][0] !== P[P.length-1][0] || P[0][1] !== P[P.length-1][1])) ? [...P, [...P[0]]] : P;
function moments(Praw) {
  const P = close(Praw);
  let A = 0, cx = 0, cy = 0, ixx = 0, iyy = 0, ixy = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i+1];
    const cr = x0 * y1 - x1 * y0;
    A += cr; cx += (x0 + x1) * cr; cy += (y0 + y1) * cr;
    ixx += (y0*y0 + y0*y1 + y1*y1) * cr;
    iyy += (x0*x0 + x0*x1 + x1*x1) * cr;
    ixy += (x0*y1 + 2*x0*y0 + 2*x1*y1 + x1*y0) * cr;
  }
  A /= 2; cx /= 6*A; cy /= 6*A; ixx /= 12; iyy /= 12; ixy /= 24;
  const vx = iyy/A - cx*cx, vy = ixx/A - cy*cy, vxy = ixy/A - cx*cy;
  return { A: Math.abs(A), cx, cy, angle: 0.5 * Math.atan2(2*vxy, vx - vy) };
}
const centerAt = (P, cx, cy) => P.map(([x, y]) => [x - cx, y - cy]);
const rot = (P, a) => { const c = Math.cos(a), s = Math.sin(a); return P.map(([x, y]) => [c*x - s*y, s*x + c*y]); };
const mirrorX = (P) => P.map(([x, y]) => [-x, y]);
const bbox = (P) => { const xs = P.map(p=>p[0]), ys = P.map(p=>p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys),
           w: Math.max(...xs)-Math.min(...xs), h: Math.max(...ys)-Math.min(...ys) }; };
const perim = (Praw) => { const P = close(Praw); let s = 0;
  for (let i = 1; i < P.length; i++) s += Math.hypot(P[i][0]-P[i-1][0], P[i][1]-P[i-1][1]); return s; };

function fillMask(Praw, minX, minY, cell, nx, ny) {
  const P = close(Praw); const mask = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    const y = minY + (j + 0.5) * cell; const xs = [];
    for (let i = 0; i < P.length - 1; i++) {
      const [x0, y0] = P[i], [x1, y1] = P[i+1];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + (y - y0) / (y1 - y0) * (x1 - x0));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((xs[k] - minX) / cell - 0.5));
      const i1 = Math.min(nx - 1, Math.floor((xs[k+1] - minX) / cell - 0.5));
      for (let i = i0; i <= i1; i++) mask[j * nx + i] = 1;
    }
  }
  return mask;
}
function iou(Pa, Pb, cell = 2) {
  const ba = bbox(Pa), bb = bbox(Pb);
  const minX = Math.min(ba.minX, bb.minX) - cell, minY = Math.min(ba.minY, bb.minY) - cell;
  const maxX = Math.max(ba.maxX, bb.maxX) + cell, maxY = Math.max(ba.maxY, bb.maxY) + cell;
  const nx = Math.ceil((maxX - minX) / cell), ny = Math.ceil((maxY - minY) / cell);
  const ma = fillMask(Pa, minX, minY, cell, nx, ny), mb = fillMask(Pb, minX, minY, cell, nx, ny);
  let inter = 0, uni = 0;
  for (let i = 0; i < ma.length; i++) { const a = ma[i], b = mb[i]; if (a & b) inter++; if (a | b) uni++; }
  return uni ? inter / uni : 0;
}
// Bugra P'yi motor Praw cercevesine hizala (ikisi de centroid-merkezli donus)
function align(bugraRaw, motorRaw, forceMirror) {
  const mm = moments(motorRaw);
  const Mc = centerAt(motorRaw, mm.cx, mm.cy);
  let best = null;
  for (const mir of (forceMirror === undefined ? [false, true] : [forceMirror])) {
    const base = mir ? mirrorX(bugraRaw) : bugraRaw;
    const bm = moments(base);
    const Bc = centerAt(base, bm.cx, bm.cy);
    for (const extra of [null, 0, Math.PI/2, Math.PI, 3*Math.PI/2]) {
      const a = extra === null ? 0 : (mm.angle - bm.angle + extra);
      const cand = rot(Bc, a);
      const s = iou(cand, Mc, 2);
      if (!best || s > best.iou) best = { iou: s, poly: cand, rotDeg: Math.round(a * 180 / Math.PI), mirror: mir };
    }
  }
  return { best, motorCentered: Mc };
}

// ---- Bugra beden-36 halkalari (adlar duzeltilmis: kesim foyu 2 Pattern Cutting.jpg esas)
const ring36 = Object.fromEntries(
  geo.rings.filter(r => r.pattern === 'locket_top' && r.sizeGuess === '36').map(r => [r.piece, r]));
const BUGRA = {
  'Front Body':    { ring: ring36['Front Body'],    foy: '1 Front Body (2 aynali)' },
  'Back Body':     { ring: ring36['Back Body'],     foy: '2 Back Body (1 katli, bel penseli)' },
  'Collar':        { ring: ring36['EXTRA-TL (not in defter)'], foy: '3 Collar (2 katli + tela) — defterde EXTRA-TL' },
  'Collar Lining': { ring: ring36['Collar'],        foy: '4 Collar Lining (1 katli + tela) — defter adi "Collar"' },
  'Lower Sleeve':  { ring: ring36['Lower Sleeve'],  foy: '5 Lower Sleeve (2 aynali)' },
  'Upper Sleeve':  { ring: ring36['Upper Sleeve'],  foy: '6 Upper Sleeve (2 aynali, firfirli)' },
  'Tela cizimi':   { ring: ring36['Collar Lining'], foy: 'foyde ayri parca DEGIL — tela/pembe kalem cizimi, defter adi "Collar Lining"' },
};

const PAIRS = [
  { file: 'front-body',   bugra: 'Front Body',    motor: 'Top Front' },
  { file: 'back-body',    bugra: 'Back Body',     motor: 'Top Back', forceMirror: true }, // ayna IoU 0.507 vs 0.509 esit; CB kenari CB'ye gelsin diye semantik secim
  { file: 'collar',       bugra: 'Collar',        motor: 'Peter Pan Collar (bebe yaka)' },
  { file: 'collar-lining',bugra: 'Collar Lining', motor: null },
  { file: 'upper-sleeve', bugra: 'Upper Sleeve',  motor: 'Puff Sleeve' },
  { file: 'lower-sleeve', bugra: 'Lower Sleeve',  motor: 'Puff Sleeve' },
  { file: 'tela',         bugra: 'Tela cizimi',   motor: null },
];

const fmt = (b) => `${b.w.toFixed(0)}x${b.h.toFixed(0)}`;
const pathOf = (P, S, ox, oy) => 'M ' + P.map(([x, y]) => `${(ox + x*S).toFixed(1)} ${(oy + y*S).toFixed(1)}`).join(' L ') + ' Z';

function drawCell(layers, S, pad) {
  const all = layers.flatMap(l => l.poly);
  const b = bbox(all);
  const w = b.w * S + 2*pad, h = b.h * S + 2*pad;
  const ox = pad - b.minX * S, oy = pad - b.minY * S;
  let svg = '';
  for (const l of layers)
    svg += `<path d="${pathOf(l.poly, S, ox, oy)}" fill="${l.fill || 'none'}" stroke="${l.stroke}" stroke-width="${l.width}" stroke-linejoin="round"/>`;
  return { svg, w, h };
}

const results = [];
const cellsForSheet = {};
for (const pair of PAIRS) {
  const bug = BUGRA[pair.bugra];
  const bPoly = bug.ring.polygon;
  const layers = [];
  let note = '', a = null, alignedB = null, mB, mM = null, mp = null;
  if (pair.motor) {
    mp = M[pair.motor];
    const r = align(bPoly, mp.cutPoly, pair.forceMirror);
    a = r.best; alignedB = a.poly;
    layers.push({ poly: r.motorCentered, stroke: '#d21f2e', width: 1.4 });
    layers.push({ poly: alignedB, stroke: '#191938', width: 2.6, fill: 'rgba(25,25,56,0.05)' });
    mB = bbox(alignedB); mM = bbox(r.motorCentered);
    note = `IoU ${a.iou.toFixed(2)} (donus ${a.rotDeg}deg${a.mirror ? ' + ayna' : ''})`;
  } else {
    const m0 = moments(bPoly);
    alignedB = centerAt(bPoly, m0.cx, m0.cy);
    layers.push({ poly: alignedB, stroke: '#191938', width: 2.6, fill: 'rgba(25,25,56,0.05)' });
    mB = bbox(alignedB);
    note = 'motor: YOK';
  }
  results.push({
    file: pair.file, bugra: pair.bugra, foy: bug.foy, motor: pair.motor || 'YOK',
    bugraW: mB.w, bugraH: mB.h, bugraPerim: perim(bPoly),
    motorW: mM ? mM.w : null, motorH: mM ? mM.h : null, motorPerim: mp ? perim(mp.cutPoly) : null,
    iou: a ? a.iou : null, rotDeg: a ? a.rotDeg : null, mirror: a ? a.mirror : null,
    motorCut: mp ? mp.cutInstruction : null,
  });

  // --- tekil PNG
  const S = 1.1, pad = 28;
  const cell = drawCell(layers, S, pad);
  const head = 56, foot = 64;
  const W = Math.max(cell.w, 940), H = cell.h + head + foot;
  const barPx = 100 * S;
  const perimTxt = mp ? `perim B ${perim(bPoly).toFixed(0)} / M ${perim(mp.cutPoly).toFixed(0)} mm` : `perim B ${perim(bPoly).toFixed(0)} mm`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#faf8f4"/>
<text x="16" y="24" font-family="Helvetica" font-size="16" font-weight="bold" fill="#191938">Locket 36 — ${pair.bugra}  vs  motor: ${pair.motor || 'YOK'}</text>
<text x="16" y="44" font-family="Helvetica" font-size="12" fill="#555">Bugra koyu (SA dahil, foy: ${bug.foy}) · motor kirmizi ince (cutLine, SA 15mm) · ${note}</text>
<g transform="translate(${(W - cell.w) / 2}, ${head})">${cell.svg}</g>
<text x="16" y="${H - 40}" font-family="Helvetica" font-size="12" fill="#333">B ${fmt(mB)} mm${mM ? ` · M ${fmt(mM)} mm` : ''} · ${perimTxt}${mp ? ` · motor kesim: ${mp.cutInstruction}` : ''}</text>
<rect x="16" y="${H - 26}" width="${barPx}" height="4" fill="#191938"/><text x="${20 + barPx}" y="${H - 20}" font-family="Helvetica" font-size="11" fill="#333">100 mm</text></svg>`;
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1400 } }).render().asPng();
  writeFileSync(`/tmp/bugra-yuzlesme/locket/${pair.file}.png`, png);
  cellsForSheet[pair.file] = layers;
  console.log(`${pair.file}.png  B=${fmt(mB)}${mM ? ' M=' + fmt(mM) : ''} ${note}`);
}

// --- motor fazlasi: pervazlar (Bugra'da yok)
{
  const fn = M['Front Neck Facing'], bn = M['Back Neck Facing'];
  const c1 = moments(fn.cutPoly), c2 = moments(bn.cutPoly);
  const p1 = centerAt(fn.cutPoly, c1.cx, c1.cy);
  const off = bbox(p1).w / 2 + bbox(centerAt(bn.cutPoly, c2.cx, c2.cy)).w / 2 + 30;
  const p2 = centerAt(bn.cutPoly, c2.cx, c2.cy).map(([x, y]) => [x + off, y]);
  const layers = [{ poly: p1, stroke: '#d21f2e', width: 1.8 }, { poly: p2, stroke: '#d21f2e', width: 1.8 }];
  const S = 1.1, pad = 28, cell = drawCell(layers, S, pad);
  const W = Math.max(cell.w, 980), H = cell.h + 56 + 64, barPx = 100 * S;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#faf8f4"/>
<text x="16" y="24" font-family="Helvetica" font-size="16" font-weight="bold" fill="#191938">Motor FAZLASI — Front + Back Neck Facing (Bugra: YOK)</text>
<text x="16" y="44" font-family="Helvetica" font-size="12" fill="#555">Bugra yakayi pervazsiz, Collar Lining ile bitiriyor; motor iki pervaz parcasi ekliyor (${fn.cutInstruction} / ${bn.cutInstruction})</text>
<g transform="translate(${(W - cell.w) / 2}, 56)">${cell.svg}</g>
<text x="16" y="${H - 40}" font-family="Helvetica" font-size="12" fill="#333">Front ${fmt(bbox(fn.cutPoly))} mm perim ${perim(fn.cutPoly).toFixed(0)} · Back ${fmt(bbox(bn.cutPoly))} mm perim ${perim(bn.cutPoly).toFixed(0)}</text>
<rect x="16" y="${H - 26}" width="${barPx}" height="4" fill="#d21f2e"/><text x="${20 + barPx}" y="${H - 20}" font-family="Helvetica" font-size="11" fill="#333">100 mm</text></svg>`;
  writeFileSync('/tmp/bugra-yuzlesme/locket/motor-fazlasi-pervazlar.png',
    new Resvg(svg, { fitTo: { mode: 'width', value: 1400 } }).render().asPng());
  cellsForSheet['motor-fazlasi-pervazlar'] = layers;
  results.push({ file: 'motor-fazlasi-pervazlar', bugra: 'YOK', motor: 'Front + Back Neck Facing',
    motorW: null, motorH: null, note: 'motor fazlasi' });
  console.log('motor-fazlasi-pervazlar.png');
}
writeFileSync('/tmp/bugra-yuzlesme/locket/compare.json', JSON.stringify({ results }, null, 1));
console.log('compare.json yazildi');

// ================= KONTAK SAYFASI =================
{
  const S = 0.42, GAP = 26, PAD = 10;
  const mkCell = (file, title, sub) => {
    const cell = drawCell(cellsForSheet[file], S, PAD);
    return { file, title, sub, ...cell };
  };
  const R = Object.fromEntries(results.map(r => [r.file, r]));
  const f = (x) => x === null || x === undefined ? '—' : x.toFixed(0);
  const wh = (w, h) => (w === null || w === undefined) ? 'YOK' : `${w.toFixed(0)}x${h.toFixed(0)}`;
  const row1 = [
    mkCell('front-body', 'On beden', `B ${wh(R['front-body'].bugraW, R['front-body'].bugraH)} / M ${wh(R['front-body'].motorW, R['front-body'].motorH)}`),
    mkCell('back-body', 'Arka beden', `B ${wh(R['back-body'].bugraW, R['back-body'].bugraH)} / M ${wh(R['back-body'].motorW, R['back-body'].motorH)}`),
    mkCell('collar', 'Yaka', `B ${wh(R['collar'].bugraW, R['collar'].bugraH)} / M ${wh(R['collar'].motorW, R['collar'].motorH)}`),
    mkCell('collar-lining', 'Yaka astari', `B ${wh(R['collar-lining'].bugraW, R['collar-lining'].bugraH)} / motor YOK`),
  ];
  const row2 = [
    mkCell('upper-sleeve', 'Ust kol (firfirli)', `B ${wh(R['upper-sleeve'].bugraW, R['upper-sleeve'].bugraH)} / M ${wh(R['upper-sleeve'].motorW, R['upper-sleeve'].motorH)}`),
    mkCell('lower-sleeve', 'Alt kol', `B ${wh(R['lower-sleeve'].bugraW, R['lower-sleeve'].bugraH)} / M ayni Puff Sleeve`),
    mkCell('tela', 'Tela cizimi', `B ${wh(R['tela'].bugraW, R['tela'].bugraH)} / motor YOK`),
    mkCell('motor-fazlasi-pervazlar', 'Motor FAZLASI: pervazlar', 'Bugra YOK · 144x202 + 160x109'),
  ];
  const W = 1120;
  const rowH = (row) => Math.max(...row.map(c => c.h)) + 44;
  const layoutRow = (row, y) => {
    const tw = row.reduce((s, c) => s + c.w, 0) + GAP * (row.length - 1);
    let x = (W - tw) / 2, svg = '';
    const H = Math.max(...row.map(c => c.h));
    for (const c of row) {
      svg += `<g transform="translate(${x}, ${y + (H - c.h)})">${c.svg}</g>`;
      svg += `<text x="${x + c.w/2}" y="${y + H + 16}" text-anchor="middle" font-family="Helvetica" font-size="12" font-weight="bold" fill="#191938">${c.title}</text>`;
      svg += `<text x="${x + c.w/2}" y="${y + H + 31}" text-anchor="middle" font-family="Helvetica" font-size="10" fill="#666">${c.sub}</text>`;
      x += c.w + GAP;
    }
    return svg;
  };
  // tablo
  const cols = [30, 200, 330, 445, 505, 565, 700, 760];
  const tRows = [
    ['Parca (Bugra 36)', 'Bugra WxH mm', 'Motor WxH mm', 'dW', 'dH', 'perim B/M', 'IoU', 'Not'],
    ['1 Front Body', wh(R['front-body'].bugraW, R['front-body'].bugraH), wh(R['front-body'].motorW, R['front-body'].motorH), '-4', '+138', '1655/1717', '0.66', 'motor kalca boyu, Bugra bel boyu'],
    ['2 Back Body', wh(R['back-body'].bugraW, R['back-body'].bugraH), wh(R['back-body'].motorW, R['back-body'].motorH), '+72', '+161', '1264/1648', '0.51', 'B: 1 katli+pense / M: cut 2 CB dikisli'],
    ['3 Collar', wh(R['collar'].bugraW, R['collar'].bugraH), wh(R['collar'].motorW, R['collar'].motorH), '-51', '-55', '833/650', '0.47', 'B derin hilal / M neredeyse duz bant'],
    ['4 Collar Lining', wh(R['collar-lining'].bugraW, R['collar-lining'].bugraH), 'YOK', '—', '—', '568/—', '—', 'motor ayri astar parcasi cizmiyor'],
    ['5 Lower Sleeve', wh(R['lower-sleeve'].bugraW, R['lower-sleeve'].bugraH), '(473x372)', '—', '—', '840/1314', '0.25', 'motor kolu bolmuyor: ayni tek parca'],
    ['6 Upper Sleeve', wh(R['upper-sleeve'].bugraW, R['upper-sleeve'].bugraH), wh(R['upper-sleeve'].motorW, R['upper-sleeve'].motorH), '-16', '+112', '1180/1314', '0.40', 'firfirli ust kol; motorda karsiligi tek parca'],
    ['(tela cizimi)', wh(R['tela'].bugraW, R['tela'].bugraH), 'YOK', '—', '—', '453/—', '—', 'tela ayri cizim; motorda sadece talimat'],
    ['(motor fazlasi)', 'YOK', '144x202+160x109', '—', '—', '—/553+444', '—', 'on+arka yaka pervazi Bugra da yok'],
  ];
  const tableSvg = (y0) => {
    let s = `<line x1="30" y1="${y0 + 6}" x2="${W - 30}" y2="${y0 + 6}" stroke="#191938" stroke-width="1"/>`;
    tRows.forEach((row, i) => {
      const y = y0 + 24 + i * 18;
      row.forEach((cell, j) => {
        s += `<text x="${cols[j]}" y="${y}" font-family="Helvetica" font-size="${i ? 11 : 11.5}" ${i ? '' : 'font-weight="bold"'} fill="${i ? '#222' : '#191938'}">${cell}</text>`;
      });
      if (i === 0) s += `<line x1="30" y1="${y + 6}" x2="${W - 30}" y2="${y + 6}" stroke="#999" stroke-width="0.7"/>`;
    });
    return { svg: s, h: 24 + tRows.length * 18 + 10 };
  };
  const verdicts = [
    '1. KOL AYRISIMI — Bugra kolu YATAY 2 parca cizer (Upper 489x261 firfirli + Lower 310x209); motor TEK Puff Sleeve 473x372. IoU 0.40/0.25.',
    '2. BOY/SILUET — motor topu kalca boyunda ve kutu cizer: on +138mm, arka +161mm daha uzun; yarim genislik toplami M 568 vs B 499mm (~+138mm cevre).',
    '3. YAKA KURULUSU — Bugra 3 cizim (derin hilal yaka 287x149 + AYRI astar 183x165 + tela); motor tek geometri 235x94, neredeyse duz bant; perim 833 vs 650.',
    '4. ARKA KURULUS — Bugra arka 1 katli (cut-on-fold) + bel pensesi; motor arkayi cut 2 (CB dikisli) kesiyor.',
    '5. MOTOR FAZLASI — on+arka yaka pervazi (2 parca) Bugra da yok; Bugra yakayi astarla bitiriyor. Toplam parca: Bugra 6 (+tela cizimi) vs motor 6.',
    '6. SA TABANI — iki taraf da SA-DAHIL kesim cizgisi; ama motor SA 15mm uniform, Bugra 10mm + 30mm etek ucu. peterPan ve flat collar cikislari BIREBIR ozdes.',
  ];
  const h1 = rowH(row1), h2 = rowH(row2);
  const headH = 96;
  const tblY = headH + h1 + h2 + 36;
  const tbl = tableSvg(tblY);
  const verY = tblY + tbl.h + 18;
  const H = verY + verdicts.length * 17 + 26;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#faf8f4"/>
<text x="30" y="30" font-family="Helvetica" font-size="20" font-weight="bold" fill="#191938">BUGRA LOCKET TOP (beden 36) vs STITCHU MOTORU — parca parca yuzlesme</text>
<text x="30" y="52" font-family="Helvetica" font-size="12" fill="#444">Govde: bust 88 / bel 68 / kalca 94 (Bugra beden tablosu 36 = EU38 bust~88). Motor spec: top + scoop + peterPan yaka + dart + kisa puf kol + dugmeli on + woven.</text>
<text x="30" y="69" font-family="Helvetica" font-size="12" fill="#444">Taban: iki taraf da SA-DAHIL kesim cizgisi (Bugra 1cm SA + 3cm etek dahil; motor cutLine 15mm). Hizalama: centroid + PCA/ayna, IoU ile. d = motor - Bugra.</text>
<text x="30" y="86" font-family="Helvetica" font-size="12" fill="#8f2038">Bugra KOYU dolgulu, motor KIRMIZI ince. Bilinen motor eksikleri olculdu: 2-parcali kol YOK, yaka astari parcasi YOK.</text>
${layoutRow(row1, headH)}
${layoutRow(row2, headH + h1 + 18)}
${tbl.svg}`;
  verdicts.forEach((v, i) => {
    svg += `<text x="30" y="${verY + i * 17}" font-family="Helvetica" font-size="11.5" fill="${i < 3 ? '#8f2038' : '#333'}">${v}</text>`;
  });
  svg += '</svg>';
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 2240 } }).render().asPng();
  writeFileSync('/Users/damummyphus/Desktop/bugra-locket-yuzlesme.png', png);
  console.log('KONTAK: ~/Desktop/bugra-locket-yuzlesme.png');
}
