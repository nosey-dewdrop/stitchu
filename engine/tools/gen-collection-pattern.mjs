// gen-collection-pattern.mjs — gives every Collections look the SAME clickable
// depth the Pattern Blog has: a per-look detail page (web/collections/<slug>.html)
// with sewing details + a working printable-PDF download (A4 pack / A0 sheet /
// sewing guide), built through the SAME WASM engine and the SAME sheet.js tiling
// as the Pattern Blog PDFs (shared pdf-core.mjs, one source of truth).
//
// It also rebuilds:
//   - web/collections/index.html         (collection cards, unchanged look)
//   - web/collection-60s70s.html         (each look's card links to its detail page)
//
// DATA source: web/patterns/vintage6070/meta.json (owned by the engine track) for
// all display copy (names, notes, piece list, fabric, oov, period, house). The
// engine DRAFT PARAMS for each look are copied into DRAFT_PARAMS below, exactly as
// gen-pattern-pdfs.mjs copies its PATTERNS list (importing render-vintage6070.mjs
// would re-run its SVG generator into another owner's territory). If a look's
// engine params change there, mirror them here and rerun.
//
// Writing rules (Damla): Title Case on headings/nav/labels; no em dash; sentence
// headings get a full stop; explicit navy links (never purple); every visible
// string carries data-en AND data-tr.
//   run:  V=85 node engine/tools/gen-collection-pattern.mjs
import { createRequire } from 'module';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { makePdfCore } from './pdf-core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const sheet = await import(join(here, '../../web/js/sheet.js'));

const WEB = join(here, '../../web');
const VDIR = join(WEB, 'patterns/vintage6070');
const COLDIR = join(WEB, 'collections');
const PDFDIR = join(COLDIR, 'pdf');
mkdirSync(PDFDIR, { recursive: true });
const BASE = 'https://nosey-dewdrop.github.io/stitchu';
const V = process.env.V || '85';

const meta = JSON.parse(readFileSync(join(VDIR, 'meta.json'), 'utf8'));

// EU38 standard body — the size chart's EU38 row (same as gen-pattern-pdfs.mjs).
const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };

// Engine draft params per look, mirrored from render-vintage6070.mjs LOOKS. Only
// the engine-facing fields (garment/shaping/.../collar/tie/gather) are here; all
// editorial copy comes from meta.json so it is never duplicated. `style` is the EN
// name, pulled from meta at build time.
const DRAFT_PARAMS = {
  'sixties-fit-flare-knit-dress': { garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'knit', neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
  'sixties-mondrian-shift-mini': { garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
  'sixties-princess-seam-shift': { garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
  'sixties-empire-knit-mini': { garment: 'dress', shaping: 'dart', waistline: 'empire', fabric: 'knit', neckline: 'boat', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
  'sixties-boat-neck-shift-mini': { garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
  'sixties-crew-neck-jersey-mini': { garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'knit', neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
  'sixties-pointed-collar-tunic': { garment: 'top', shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'vNeck', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'tunic', collarType: 5, collarEdge: 1 },
  'sixties-front-button-pinafore': { garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'vNeck', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip', frontPlacket: true },
  'sixties-vneck-front-zip-dress': { garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'vNeck', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', tie: 3 },
  'sixties-side-tie-tweed-shift': { garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'boat', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', tie: 1 },
  'sixties-empire-gathered-babydoll': { garment: 'dress', shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'vNeck', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip' },
  'sixties-crew-neck-tent-mini': { garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
  'sixties-mod-colorblock-mini': { garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
  'seventies-scoop-neck-shift-mini': { garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
  'sixties-babydoll-scoop-mini': { garment: 'dress', shaping: 'dart', waistline: 'empire', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'none', sleeveLength: 'short', skirtStyle: 'gathered', skirtLength: 'mini', topLength: 'hip' },
  'sixties-boat-neck-longsleeve-mini': { garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'knit', neckline: 'boat', sleeveStyle: 'straight', sleeveLength: 'long', skirtStyle: 'aLine', skirtLength: 'mini', topLength: 'hip' },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
const cleanPiece = (n) => n.replace(/\s*\([^)]*\)\s*$/, '').trim();

// ---- build the printable PDFs for every look ----------------------------
const engine = await createEngine();
const core = makePdfCore({ engine, sheet, body: BODY });

const pdfBySlug = {};
for (const m of meta) {
  const dp = DRAFT_PARAMS[m.slug];
  if (!dp) { console.log('NO DRAFT_PARAMS for', m.slug); continue; }
  const spec = { slug: m.slug, style: m.en, ...dp };
  const row = core.buildAll(spec, PDFDIR, writeFileSync, join);
  if (row.error) { console.log(m.slug, 'PDF ERROR', row.error); continue; }
  pdfBySlug[m.slug] = row;
  console.log(`${m.slug}: A4 ${row.a4pages}p ${kb(row.a4bytes)} | A0 ${kb(row.a0bytes)} | guide ${kb(row.guidebytes)}`);
}
writeFileSync(join(PDFDIR, 'pdf-manifest.json'), JSON.stringify(Object.values(pdfBySlug), null, 2));

// ---- shared shell (byte-identical to the collections index header) ------
// Same canonical header used across the site. Collections is sh-active. Path
// prefix is "../" because detail pages live one level deep in web/collections/.
const HEADER = `<header class="sh-header">
  <a class="brandpatch" href="../index.html">stitchu</a>
  <nav class="sh-nav">
    <a href="../create.html" data-en="Create" data-tr="Çiz">Create</a>
    <a href="../closet.html" data-en="Closet" data-tr="Dolap">Closet</a>
    <a href="../patterns/index.html" data-en="Pattern Blog" data-tr="Kalıp Günlüğü">Pattern Blog</a>
    <a href="index.html" class="sh-active" data-en="Collections" data-tr="Koleksiyonlar">Collections</a>
    <a href="../benchmark.html" data-en="Benchmark" data-tr="Kıyaslama">Benchmark</a>
    <a href="../patches.html" data-en="Patch Notes" data-tr="Yama Notları">Patch Notes</a>
    <a href="../api.html" data-en="API" data-tr="API">API</a>
    <span class="sh-lang"><button id="lang-en">EN</button><span>·</span><button id="lang-tr">TR</button></span>
  </nav>
</header>`;

const FOOTER = `<footer>
  <span>stitchu · a pattern-making engine</span>
  <span><a href="../index.html" data-en="Home" data-tr="Ana Sayfa">Home</a> · <a href="../patterns/index.html" data-en="Pattern Blog" data-tr="Kalıp Günlüğü">Pattern Blog</a> · <a href="index.html" data-en="Collections" data-tr="Koleksiyonlar">Collections</a> · <a href="../benchmark.html" data-en="Benchmark" data-tr="Kıyaslama">Benchmark</a> · <a href="../patches.html" data-en="Patch Notes" data-tr="Yama Notları">Patch Notes</a> · <a href="../api.html">API</a> · <a href="../privacy.html" data-en="Privacy" data-tr="Gizlilik">Privacy</a> · @nosey-dewdrop · <span style="opacity:.55">v${V}</span></span>
</footer>`;

// Detail-page CSS: same tokens/type/cards/download layout as the Pattern Blog
// detail pages (gen-pattern-pages.mjs STYLE), so a collection look reads exactly
// like a blog look.
const STYLE = `<style>
  :root{ --bb:#8fbfe8; --bb-deep:#3f74a8; --bb-pale:#dceaf7; --bb-line:#bcd7ee; --navy:#1f3a5f; --ink:#2b4a6b; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Helvetica,Arial,sans-serif;color:var(--navy);background:#fff;line-height:1.55;overflow-x:hidden}
  a{color:var(--bb-deep)}
  /* Header comes from ../css/shared-header.css (one source, byte-identical bar). */
  .wrap{max-width:840px;margin:0 auto;padding:14px 32px 100px}
  .crumbs{font-size:12px;color:#5b7089;letter-spacing:.4px;margin-bottom:16px}
  .crumbs a{text-decoration:none;color:var(--navy)}
  h1{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:38px;line-height:1.14;font-weight:400;margin:8px 0 12px;color:var(--navy);max-width:26ch}
  .era{font-size:12.5px;letter-spacing:.4px;color:#5b7089;margin-bottom:14px}
  .era .period{font-variant-numeric:tabular-nums;font-weight:700;color:var(--navy)}
  .lead{font-size:15.5px;color:var(--ink);max-width:64ch;margin-bottom:26px}
  .drawing{border:1px solid var(--bb-line);border-radius:4px;background:#fff;box-shadow:0 8px 26px rgba(63,116,168,.10);padding:18px;margin:6px 0 10px}
  .drawing img{display:block;width:100%;height:auto}
  .viewlabel{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--navy);margin:0 0 12px;font-weight:600}
  .cap{font-size:12px;color:#5b7089;margin-top:10px;letter-spacing:.3px}
  h2{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:23px;font-weight:400;margin:38px 0 12px;color:var(--navy)}
  table{border-collapse:collapse;width:100%;font-size:13.5px;margin-top:6px}
  th,td{text-align:left;padding:9px 14px;border-bottom:1px solid var(--bb-line)}
  th{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#5b7089;background:var(--bb-pale)}
  td.v{font-variant-numeric:tabular-nums;font-weight:700;color:var(--navy)}
  .honest{font-size:13.5px;color:#5b7089;font-style:italic;margin:6px 0 4px;max-width:66ch}
  .honest a{font-style:normal}
  /* CTA look lives in ../css/shared-button.css (.sb-btn). Layout-only helpers here. */
  .sb-btn{margin-top:30px}
  .cta2{display:inline-block;margin:30px 0 0 16px;font-size:13px;letter-spacing:.4px;color:var(--navy);text-decoration:none;border-bottom:1px dashed var(--bb-deep);padding-bottom:2px}
  .dl .sb-btn{margin-top:14px}
  .dl-alt{margin:16px 0 0;display:flex;flex-wrap:wrap;gap:22px}
  .dl-link{font-size:13px;letter-spacing:.3px;color:var(--navy);text-decoration:none;border-bottom:1px dashed var(--bb-deep);padding-bottom:2px}
  .dl-size{font-size:12px;color:#5b7089;letter-spacing:.3px}
  .dl .honest{margin-top:16px}
  footer{border-top:1px solid var(--bb-line);padding:24px 40px 34px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:11px;letter-spacing:1px;color:#5b7089}
  footer a{color:var(--navy);text-decoration:none}
  body::before{content:"";display:block;height:12px;background:repeating-linear-gradient(90deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),repeating-linear-gradient(0deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),#fff;}
</style>`;

function head(title, desc, canonical, ldjson) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%272%27 fill=%27%231f3a5f%27/%3E%3Cline x1=%276%27 y1=%2716%27 x2=%2726%27 y2=%2716%27 stroke=%27%23fff%27 stroke-width=%273%27 stroke-dasharray=%275 4%27/%3E%3C/svg%3E">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="stitchu">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${BASE}/assets/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${BASE}/assets/og-card.png">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<script type="application/ld+json">${JSON.stringify(ldjson)}</script>
<link rel="stylesheet" href="../css/shared-header.css?v=${V}">
<link rel="stylesheet" href="../css/theme-transitions.css?v=${V}">
<link rel="stylesheet" href="../css/shared-button.css?v=${V}">
${STYLE}
</head>
<body>`;
}

// ---- per-look detail pages ----------------------------------------------
const COLLECTION = { slug: 'sixties-seventies', nameEn: 'The Sixties Seventies Collection', nameTr: 'Altmışlar Yetmişler Koleksiyonu', href: '../collection-60s70s.html' };

for (const m of meta) {
  const dp = DRAFT_PARAMS[m.slug];
  if (!dp) continue;
  const pdf = pdfBySlug[m.slug];
  const canonical = `${BASE}/collections/${m.slug}.html`;
  const title = `${m.en} sewing pattern · stitchu`;
  const desc = m.note_en.length > 155 ? m.note_en.slice(0, 152) + '...' : m.note_en;
  const svgUrl = `../patterns/vintage6070/${m.slug}.svg`;
  const flatUrl = m.flat ? `../patterns/vintage6070/${m.flat}` : null;
  const pieces = m.pieceNames.map(cleanPiece);

  const ldjson = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: title, description: desc,
    image: `${BASE}/patterns/vintage6070/${m.slug}.svg`,
    author: { '@type': 'Organization', name: 'stitchu' },
    publisher: { '@type': 'Organization', name: 'stitchu' },
    datePublished: '2026-07-17', mainEntityOfPage: canonical,
    articleSection: 'Collections', inLanguage: 'en',
    about: { '@type': 'Thing', name: m.en },
    isPartOf: `${BASE}/collections/`,
  };

  const pieceRows = pieces.map((p) => `<li>${esc(p)}</li>`).join('');

  // OOV honest note: surface décor the engine does not draft, listed not dropped.
  const oovList = (m.oov || []).map((o) => esc(o)).join('; ');
  const oovNote = oovList
    ? { en: `This look drafts complete as a silhouette. The engine does not draw these surface details, so they are noted here, not silently dropped: ${oovList}.`,
        tr: `Bu görünüm siluet olarak tam çizilir. Motor şu yüzey detaylarını çizmez, bu yüzden sessizce atlanmaz, burada belirtilir: ${oovList}.` }
    : { en: `This look drafts complete: every piece is in the engine's core vocabulary, so it comes out with no missing construction.`,
        tr: `Bu görünüm tam çizilir: her parça motorun temel dağarcığında, bu yüzden hiçbir yapım eksiği olmadan çıkar.` };

  const dlSection = pdf ? `
  <h2 data-en="Download The Printable Pattern." data-tr="Baskıya Hazır Kalıbı İndir.">Download The Printable Pattern.</h2>
  <div class="dl">
    <a class="sb-btn sb-primary" href="pdf/${m.slug}-a4.pdf" download data-en="A4 print pack (EU38)" data-tr="A4 baskı paketi (EU38)">A4 print pack (EU38)</a>
    <span class="dl-size" data-en=" A4, ${pdf.a4pages} pages, ${kb(pdf.a4bytes)}." data-tr=" A4, ${pdf.a4pages} sayfa, ${kb(pdf.a4bytes)}."> A4, ${pdf.a4pages} pages, ${kb(pdf.a4bytes)}.</span>
    <div class="dl-alt">
      <a class="dl-link" href="pdf/${m.slug}-a0.pdf" download data-en="A0 single sheet (${kb(pdf.a0bytes)})" data-tr="A0 tek sayfa (${kb(pdf.a0bytes)})">A0 single sheet (${kb(pdf.a0bytes)})</a>
      <a class="dl-link" href="pdf/${m.slug}-guide.pdf" download data-en="sewing guide (${pdf.guideSteps} steps, ${kb(pdf.guidebytes)})" data-tr="dikiş kılavuzu (${pdf.guideSteps} adım, ${kb(pdf.guidebytes)})">sewing guide (${pdf.guideSteps} steps, ${kb(pdf.guidebytes)})</a>
    </div>
    <p class="honest" data-en="Every sheet carries a 3 cm calibration square. Measure it after printing at 100 percent scale, no fit-to-page, so the pattern comes out true to size." data-tr="Her sayfada 3 cm’lik bir kalibrasyon karesi var. Yüzde 100 ölçekte, sayfaya sığdırmadan bastıktan sonra ölç; böylece kalıp gerçek boyutunda çıkar.">Every sheet carries a 3 cm calibration square. Measure it after printing at 100 percent scale, no fit-to-page, so the pattern comes out true to size.</p>
  </div>
` : '';

  const html = head(title, desc, canonical, ldjson) + `
${HEADER}
<div class="wrap">
  <p class="crumbs"><a href="../index.html">stitchu</a> / <a href="index.html" data-en="Collections" data-tr="Koleksiyonlar">Collections</a> / <a href="${COLLECTION.href}" data-en="${esc(COLLECTION.nameEn)}" data-tr="${esc(COLLECTION.nameTr)}">${esc(COLLECTION.nameEn)}</a> / ${esc(m.en)}</p>
  <h1 data-en="${esc(m.en)}, drafted." data-tr="${esc(m.en)}, çizildi.">${esc(m.en)}, drafted.</h1>
  <p class="era"><span class="period">${esc(m.period)}</span> · <span data-en="${esc(m.house)}" data-tr="${esc(m.house)}">${esc(m.house)}</span></p>
  <p class="lead" data-en="${esc(m.note_en)}" data-tr="${esc(m.note_tr)}">${esc(m.note_en)}</p>

  ${flatUrl ? `<div class="drawing">
    <p class="viewlabel" data-en="Technical Flat" data-tr="Teknik Çizim">Technical Flat</p>
    <img src="${flatUrl}" alt="${esc(m.en)} front and back flat technical sketch drafted by the stitchu engine" loading="lazy">
    <p class="cap" data-en="The front and back flat sketch, the way a commercial pattern shows the garment. Drawn from the engine's own pieces with grainline, balance notches and the closure mark." data-tr="Ön ve arka düz teknik çizim, ticari bir kalıbın modeli gösterdiği gibi. Motorun kendi parçalarından, düzgü, denge çentikleri ve kapanma işaretiyle çizildi.">The front and back flat sketch, the way a commercial pattern shows the garment. Drawn from the engine's own pieces with grainline, balance notches and the closure mark.</p>
  </div>` : ''}
  <div class="drawing">
    <img src="${svgUrl}" alt="${esc(m.en)} pattern pieces drafted by the stitchu engine" loading="lazy">
    <p class="cap" data-en="The engine's own drafted pieces for this look, laid out for cutting. Drawn to an EU38 demo body." data-tr="Bu görünüm için motorun kendi çizdiği parçalar, kesim için yerleştirilmiş. EU38 örnek beden üzerine çizildi.">The engine's own drafted pieces for this look, laid out for cutting. Drawn to an EU38 demo body.</p>
  </div>

  <h2 data-en="What Is In The Pattern." data-tr="Kalıpta Ne Var.">What Is In The Pattern.</h2>
  <table>
    <tr><th data-en="pattern pieces" data-tr="kalıp parçaları">pattern pieces</th><th data-en="fabric estimate" data-tr="kumaş tahmini">fabric estimate</th></tr>
    <tr><td><ul style="list-style:none;margin:0">${pieceRows}</ul></td><td class="v"><span data-en="Roughly ${m.fabric} m at 140 cm wide." data-tr="140 cm ende yaklaşık ${m.fabric} m.">Roughly ${m.fabric} m at 140 cm wide.</span><br><span style="font-weight:400;color:#5b7089;font-size:12px" data-en="${m.pieces} pieces · fabric scales to your measurements" data-tr="${m.pieces} parça · kumaş ölçülerinize göre değişir">${m.pieces} pieces · fabric scales to your measurements</span></td></tr>
  </table>

  <h2 data-en="The Honest Note." data-tr="Dürüst Not.">The Honest Note.</h2>
  <p class="honest" data-en="${esc(oovNote.en)}" data-tr="${esc(oovNote.tr)}">${esc(oovNote.en)}</p>
  <p class="honest"><a href="../patches.html" data-en="See the full patch history →" data-tr="Tüm yama geçmişine bak →">See the full patch history →</a></p>
${dlSection}
  <a class="sb-btn sb-primary" href="../create.html" data-en="Draft this to your measurements, free." data-tr="Bunu ölçülerine göre çiz, ücretsiz.">Draft this to your measurements, free.</a>
  <a class="cta2" href="${COLLECTION.href}" data-en="Back to the collection →" data-tr="Koleksiyona geri dön →">Back to the collection →</a>
</div>
${FOOTER}
<script src="../js/shared-header.js?v=${V}"></script>
</body>
</html>`;
  writeFileSync(join(COLDIR, `${m.slug}.html`), html);
}

console.log(`generated ${meta.length} collection detail pages -> ${COLDIR}`);
