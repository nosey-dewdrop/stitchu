// gusto-lint.mjs — otomatik zevk denetçisi (PALANTIR).
// "Satar mı / kalem mi" hükmünü Damla değil İSTATİSTİK verir. Bir görsel
// çıktıyı (flat SVG + spec) contract/gusto-corpus.json'daki DONMUŞ bantlara
// karşı beş boyutta puanlar. Eşik altı = düzeltme kuyruğu; eşik üstü = ray
// kendi kendine yeşil. Korpus salt-okunur (DERSLER.md: korpus salt-okunur).
//
//   node engine/tools/gusto-lint.mjs <flat.svg> [spec.json]
//   node engine/tools/gusto-lint.mjs --calibrate   (5 mihenk/vintage flat'i toplu puanla)
//
// spec.json (opsiyonel) alanları: { family, terms:[], props:{...}, pieces:N,
// pages:N, garmentKind:'dress'|'blouse'|'skirt' }. Yoksa lint sadece SVG'den
// ölçebildiğini (çizgi hiyerarşisi, kompozisyon) puanlar, diğerlerini "n/a"
// bırakır ve ağırlığı kalanlara dağıtır.

import { readFileSync, readdirSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const CORPUS = JSON.parse(readFileSync(join(root, 'contract/gusto-corpus.json'), 'utf8'));

// ---- SVG'den ölçülebilenler --------------------------------------------
function measureSvg(svgText) {
  const strokeWidths = [...svgText.matchAll(/stroke-width="([0-9.]+)"/g)].map((m) => parseFloat(m[1]));
  const layers = [...new Set(strokeWidths)].sort((a, b) => b - a);
  const viewBox = (svgText.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/) || []).slice(1).map(Number);
  const dashCount = (svgText.match(/stroke-dasharray/g) || []).length; // drape/fold + grainline
  const pathCount = (svgText.match(/<path /g) || []).length;
  const navy = svgText.includes(CORPUS.line_hierarchy.color_navy);
  const seam = svgText.includes(CORPUS.line_hierarchy.color_seam);
  return { strokeWidths, layers, viewBox, dashCount, pathCount, navy, seam };
}

// ---- 5 boyut puanlama (her biri 0-1) -----------------------------------
function scoreSilhouetteGrammar(spec) {
  if (!spec || !spec.terms) return null;
  const g = CORPUS.silhouette_grammar;
  const fam = spec.family && g.known_families.includes(spec.family);
  const known = spec.terms.filter((t) => g.high_freq_grammar[t] !== undefined);
  // ailesi korpusta + en az yarısı emsal-frekanslı terim = tam puan
  const famScore = fam ? 0.5 : 0.0;
  const termScore = spec.terms.length ? 0.5 * (known.length / spec.terms.length) : 0.0;
  return { score: famScore + termScore, detail: `aile ${fam ? 'korpusta' : 'DIŞI'}, ${known.length}/${spec.terms.length} terim emsal-frekansli` };
}

function inBand(v, band) {
  if (v == null || !band) return null;
  if (v < band.min || v > band.max) return 0.0;
  if (band.typical && (v < band.typical[0] || v > band.typical[1])) return 0.6; // bantta ama tipik-dışı
  return 1.0;
}

function scoreProportionBands(spec) {
  if (!spec || !spec.props) return null;
  const pb = CORPUS.proportion_bands;
  const checks = [];
  for (const [k, v] of Object.entries(spec.props)) {
    const band = pb.shared[k] || pb.own[k];
    const s = inBand(v, band);
    if (s != null) checks.push({ k, v, s });
  }
  if (!checks.length) return null;
  const avg = checks.reduce((a, c) => a + c.s, 0) / checks.length;
  const outOfBand = checks.filter((c) => c.s === 0).map((c) => c.k);
  return { score: avg, detail: `${checks.length} oran olculdu, bant-disi: ${outOfBand.length ? outOfBand.join(',') : 'yok'}` };
}

function scoreLineHierarchy(m) {
  const lh = CORPUS.line_hierarchy;
  const want = [lh.outline_width, ...lh.interior_widths]; // [2.0, 1.4, 1.0]
  const have = m.layers;
  const matched = want.filter((w) => have.some((h) => Math.abs(h - w) < 0.05)).length;
  let score = matched / want.length; // katman kapsamı
  // renk uyumu bonus/ceza
  if (!m.navy) score *= 0.7;
  const detail = `${matched}/${want.length} cizgi katmani (${have.join('/')}), navy ${m.navy ? 'var' : 'YOK'}`;
  return { score, detail };
}

function scorePiecePageBands(spec) {
  if (!spec || (spec.pieces == null && spec.pages == null)) return null;
  const ppb = CORPUS.piece_page_bands;
  const checks = [];
  if (spec.pieces != null && spec.garmentKind && ppb.pieces[spec.garmentKind]) {
    const b = ppb.pieces[spec.garmentKind];
    checks.push(spec.pieces >= b.min && spec.pieces <= b.max ? 1.0 : 0.0);
  }
  if (spec.pages != null) {
    const bands = Object.values(ppb.pages);
    checks.push(bands.some((b) => spec.pages >= b.min && spec.pages <= b.max) ? 1.0 : 0.0);
  }
  if (!checks.length) return null;
  return { score: checks.reduce((a, c) => a + c, 0) / checks.length, detail: `parca ${spec.pieces ?? '-'}, sayfa ${spec.pages ?? '-'}` };
}

function scoreComposition(m, spec) {
  const cb = CORPUS.composition_bands;
  const folds = m.dashCount; // drape fold + grainline dash ~= kompozisyon yogunlugu proxy'si
  const b = cb.drape_fold_count;
  let score;
  if (folds === 0) score = 0.2; // steril: hicbir drape/grainline isareti yok
  else if (folds >= b.typical[0] && folds <= b.typical[1]) score = 1.0;
  else if (folds >= b.min && folds <= b.max) score = 0.7; // sade ama mesru
  else score = 0.4; // asiri kalabalik (band ustu)
  return { score, detail: `drape/fold yogunlugu ~${folds} (bant ${b.min}-${b.max}, tipik ${b.typical[0]}-${b.typical[1]})` };
}

// ---- toplu puanla -------------------------------------------------------
export function gustoScore(svgPath, spec) {
  const svgText = readFileSync(svgPath, 'utf8');
  const m = measureSvg(svgText);
  const dims = {
    silhouette_grammar: scoreSilhouetteGrammar(spec),
    proportion_bands: scoreProportionBands(spec),
    line_hierarchy: scoreLineHierarchy(m),
    piece_page_bands: scorePiecePageBands(spec),
    composition_bands: scoreComposition(m, spec),
  };
  const w = CORPUS.thresholds.weights;
  // n/a boyutların ağırlığını ölçülenlere yeniden dağıt
  const active = Object.keys(dims).filter((k) => dims[k] != null);
  const wsum = active.reduce((a, k) => a + w[k], 0) || 1;
  let overall = 0;
  for (const k of active) overall += (w[k] / wsum) * dims[k].score;
  const floors = active.filter((k) => dims[k].score < CORPUS.thresholds.dimension_floor);
  return {
    file: basename(svgPath),
    overall: +overall.toFixed(3),
    pass: overall >= CORPUS.thresholds.overall_pass && floors.length === 0,
    belowFloor: floors,
    dims: Object.fromEntries(active.map((k) => [k, { score: +dims[k].score.toFixed(3), detail: dims[k].detail }])),
    naDims: Object.keys(dims).filter((k) => dims[k] == null),
  };
}

// ---- CLI ----------------------------------------------------------------
function fmt(r) {
  const lines = [`${r.pass ? 'PASS' : 'FAIL'}  ${r.file}  overall=${r.overall} (esik ${CORPUS.thresholds.overall_pass})`];
  for (const [k, d] of Object.entries(r.dims)) lines.push(`   ${d.score < CORPUS.thresholds.dimension_floor ? 'x' : '.'} ${k.padEnd(20)} ${d.score}  ${d.detail}`);
  if (r.naDims.length) lines.push(`   - olculemedi (spec yok): ${r.naDims.join(', ')}`);
  if (r.belowFloor.length) lines.push(`   ! taban-alti (${CORPUS.thresholds.dimension_floor}): ${r.belowFloor.join(', ')}`);
  return lines.join('\n');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
const args = process.argv.slice(2);
if (isMain && args[0] === '--calibrate') {
  // kalibrasyon: mevcut vintage + svg flat'lerini spec'siz toplu puanla (F0 yeşil kanıtı)
  const dirs = [join(root, 'web/patterns/vintage6070'), join(root, 'web/patterns/svg')];
  const files = dirs.flatMap((d) => {
    try { return readdirSync(d).filter((f) => f.endsWith('-flat.svg')).map((f) => join(d, f)); } catch { return []; }
  });
  console.log(`gusto-lint kalibrasyon: ${files.length} mevcut flat SVG (spec'siz, sadece cizgi+kompozisyon boyutlari)\n`);
  let sum = 0;
  const scored = files.map((f) => gustoScore(f, null));
  for (const r of scored.slice(0, 8)) console.log(fmt(r) + '\n');
  for (const r of scored) sum += r.overall;
  const passN = scored.filter((r) => r.pass).length;
  console.log(`--- ozet: ${scored.length} flat, ortalama overall ${(sum / scored.length).toFixed(3)}, PASS ${passN}/${scored.length} ---`);
  console.log(`(spec'siz kalibrasyon: 3 boyut n/a; F1'de spec ile tam 5 boyut olculecek)`);
} else if (isMain && args.length) {
  const spec = args[1] ? JSON.parse(readFileSync(args[1], 'utf8')) : null;
  console.log(fmt(gustoScore(args[0], spec)));
} else if (isMain) {
  console.log('kullanim: node engine/tools/gusto-lint.mjs <flat.svg> [spec.json]');
  console.log('          node engine/tools/gusto-lint.mjs --calibrate');
  process.exit(2);
}
