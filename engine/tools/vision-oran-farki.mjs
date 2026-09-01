#!/usr/bin/env node
// vision-oran-farki.mjs — F2-vision ÜRÜN ÇIKTISI (2026-09-01). Aynı fixture
// fotoğraf okumasından İKİ kalıp + İKİ flat basar: ORANLI (ölçülen oranlar
// motora indi) ve ORANSIZ (ölçüm reddedildi, standart tablo çizdi) — fark
// gözle görünür: etek boyu mm, etek sınıfı, bel hattı. Kalıp draftJSON'un
// kendi mm parçaları, flat sevk edilen web/lib/flat-from-pattern.js hattı.
//
//   usage: node engine/tools/vision-oran-farki.mjs [cikti-dizini]
//   default çıktı: KOSU/ciktilar/vision-oran-farki.svg
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const outDir = process.argv[2] || join(root, 'KOSU/ciktilar');
mkdirSync(outDir, { recursive: true });

// DOM stub (cizim_giysi_mi.mjs ile aynı): sevk edilen loader node'da koşsun.
const require = createRequire(import.meta.url);
const BUNDLE = join(root, 'web/vendor/stitchu-engine.js');
const engine = existsSync(BUNDLE) ? await require(BUNDLE)() : null;
if (!engine) { console.error('wasm paketi yok: ' + BUNDLE); process.exit(1); }
globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };

const { applyMeasuredRatios, applyRatioAxes, pickSkirtFullness, refreshSkirtLengthMM } =
  await import(join(root, 'web/js/vision-bridge.js'));
const { flatDrawing } = await import(join(root, 'web/js/engine.js'));
const { engineSpec } = await import(join(root, 'backend/spec-core.js'));

const DEMO = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
const fx = JSON.parse(readFileSync(join(root, 'engine/tests/fixtures/vision/okuma-askili-elbise.json'), 'utf8'));

function specFrom(olcum) {
  const seen = JSON.parse(JSON.stringify(fx.seen));
  applyMeasuredRatios(seen, olcum);
  const spec = {
    garment: seen.garment, neckline: seen.neckline, sleeveStyle: seen.sleeveStyle,
    sleeveLength: seen.sleeveLength, skirtStyle: seen.skirtStyle,
    skirtLength: seen.length, waistline: seen.waistline, fabric: seen.fabric,
  };
  const fullness = pickSkirtFullness(seen);
  if (fullness) spec.skirtStyle = fullness;
  spec.skirtLengthMM = refreshSkirtLengthMM(0, seen, DEMO, false);
  applyRatioAxes(spec, seen, DEMO);
  return spec;
}

const oranli = specFrom(fx.olcum);
const oransiz = specFrom({ ok: false, confidence: 0.3, ratios: null });

const draft = (spec) => JSON.parse(engine.draftJSON(engineSpec(spec), { ...DEMO, backLength: 40.5, upperBust: 0 }));
const dOranli = draft(oranli);
const dOransiz = draft(oransiz);
if (dOranli.issues.length || dOransiz.issues.length) {
  console.error('draft reddetti:', dOranli.issues, dOransiz.issues); process.exit(1);
}
const hash8 = (d) => createHash('sha256').update(JSON.stringify(d.pattern)).digest('hex').slice(0, 8);

const fOranli = await flatDrawing(oranli, { size: 'EU38' });
const fOransiz = await flatDrawing(oransiz, { size: 'EU38' });

// ---- kalıp parçaları -> SVG path'leri ----
function pieceToPath(pc) {
  let d = '';
  for (const c of pc.commands) {
    if (c.type === 'move') d += `M ${c.x} ${c.y} `;
    else if (c.type === 'line') d += `L ${c.x} ${c.y} `;
    else if (c.type === 'curve') d += `C ${c.cp1x} ${c.cp1y} ${c.cp2x} ${c.cp2y} ${c.x} ${c.y} `;
    else if (c.type === 'close') d += 'Z ';
  }
  return d.trim();
}
function bbox(pc) {
  const xs = []; const ys = [];
  for (const c of pc.commands) {
    if (c.x !== undefined) { xs.push(c.x); ys.push(c.y); }
    if (c.cp1x !== undefined) { xs.push(c.cp1x, c.cp2x); ys.push(c.cp1y, c.cp2y); }
  }
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}
// parçaları tek satıra diz (soldan sağa), 1/4 ölçek.
function layoutPieces(pieces, color) {
  const S = 0.25; const GAP = 30;
  let x = 0; let maxH = 0; let g = '';
  for (const pc of pieces) {
    const b = bbox(pc);
    const w = (b.maxX - b.minX); const h = (b.maxY - b.minY);
    g += `<g transform="translate(${(x - b.minX * S).toFixed(1)},${(-b.minY * S).toFixed(1)}) scale(1)">` +
      `<path d="${pieceToPath(pc)}" transform="scale(${S})" fill="none" stroke="${color}" stroke-width="3"/></g>`;
    g += `<text x="${(x + w * S / 2).toFixed(1)}" y="${(h * S + 14).toFixed(1)}" font-size="10" text-anchor="middle" fill="#444">${pc.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
    x += w * S + GAP;
    maxH = Math.max(maxH, h * S);
  }
  return { g, w: x, h: maxH + 20 };
}

const rowOranli = layoutPieces(dOranli.pattern.pieces, '#1a3a8f');
const rowOransiz = layoutPieces(dOransiz.pattern.pieces, '#8f1a1a');

// flat SVG'lerini iç <svg> olarak göm (kendi viewBox'larıyla ölçeklenir).
const embedFlat = (svg, x, y, w, h) => {
  // iç <svg>'nin kendi <?xml?> bildirimi dış belgeyi bozar — soyulur; kendi
  // width/height'i viewBox'la çakışmasın diye düşürülür.
  let inner = svg
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '');
  // gömülünün KENDİ width/height'i düşürülür (nitelik tekrarı XML'i bozar),
  // sonra bizim x/y/width/height eklenir; viewBox ölçeklemeyi taşır.
  inner = inner.replace(/<svg ([^>]*)>/, (m, attrs) => {
    const temiz = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    return `<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" ${temiz}>`;
  });
  return inner;
};

const W = 470 + Math.max(rowOranli.w, rowOransiz.w, 500) + 40;
const FLAT_H = 330;
const y1 = 70; const y2 = y1 + FLAT_H + 30; const y3 = y2 + rowOranli.h + 60;
const y4 = y3 + FLAT_H + 30;
const H = y4 + rowOransiz.h + 80;

const fark = [
  `etek boyu: ORANLI skirtLengthMM=${oranli.skirtLengthMM}mm (foto orani L/W ${fx.olcum.ratios.lengthToWidth} x govde) — ORANSIZ tablo '${oransiz.skirtLength}' (${oranli.skirtLengthMM ? 'surekli mm' : ''} vs 650mm)`,
  `etek sinifi: ORANLI '${oranli.skirtStyle}' (hem/bel ${fx.olcum.ratios.hemToWaistWidth}) — ORANSIZ '${oransiz.skirtStyle}'`,
  `bel hatti: ORANLI '${oranli.waistline}' (waistY ${fx.olcum.ratios.waistYToLength}) — ORANSIZ '${oransiz.waistline}'`,
  `aski sinifi: ORANLI '${oranli.ruffledStraps || '-'}' (aski/omuz ${fx.olcum.ratios.strapWidthToShoulder}) — ORANSIZ '${oransiz.ruffledStraps || '-'}'`,
  `kalip hash: ${hash8(dOranli)} vs ${hash8(dOransiz)}`,
];

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica,Arial,sans-serif">
<rect width="${W}" height="${H}" fill="#faf7f2"/>
<text x="20" y="28" font-size="18" fill="#111">F2-vision — aynı fotoğraf okuması, oranlı ve oransız kalıp + flat farkı (EU38 demo gövde)</text>
<text x="20" y="48" font-size="12" fill="#555">fixture: engine/tests/fixtures/vision/okuma-askili-elbise.json · üreteç: engine/tools/vision-oran-farki.mjs</text>
<text x="20" y="${y1 - 8}" font-size="14" fill="#1a3a8f">ORANLI — ölçülen 7 oran motora indi (confidence ${fx.olcum.confidence})</text>
${embedFlat(fOranli.svg, 20, y1, 420, FLAT_H)}
<g transform="translate(470,${y1 + 20})">${rowOranli.g}</g>
<text x="20" y="${y3 - 8}" font-size="14" fill="#8f1a1a">ORANSIZ — ölçüm reddedildi, standart tablo çizdi</text>
${embedFlat(fOransiz.svg, 20, y3, 420, FLAT_H)}
<g transform="translate(470,${y3 + 20})">${rowOransiz.g}</g>
${fark.map((f, i) => `<text x="20" y="${y4 + rowOransiz.h + 20 + i * 14}" font-size="11" fill="#333">• ${f.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`).join('\n')}
</svg>`;

const outSvg = join(outDir, 'vision-oran-farki.svg');
writeFileSync(outSvg, svg);
console.log('yazildi:', outSvg);
console.log('ORANLI spec:', JSON.stringify({ skirtLengthMM: oranli.skirtLengthMM, skirtStyle: oranli.skirtStyle, waistline: oranli.waistline, neckline: oranli.neckline, ruffledStraps: oranli.ruffledStraps }));
console.log('ORANSIZ spec:', JSON.stringify({ skirtLengthMM: oransiz.skirtLengthMM, skirtStyle: oransiz.skirtStyle, waistline: oransiz.waistline, neckline: oransiz.neckline, ruffledStraps: oransiz.ruffledStraps }));
console.log('kalip hash:', hash8(dOranli), 'vs', hash8(dOransiz));
