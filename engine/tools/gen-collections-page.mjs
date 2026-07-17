// gen-collections-page.mjs — builds the Collections landing (web/collections/index.html).
// Collections is its own top-level site section, separate from the Pattern Blog.
// A collection is a curated group of patterns with its own page; this index lists
// them as cards. Adding a new collection later is one entry in COLLECTIONS below
// plus its own page, nothing else. Shell = the canonical baby-blue universe
// (header/footer/theme, EN/TR toggle). Content is the engine's own drafted output.
// Writing rules (Damla): Title Case on headings/nav/labels; no em dash; sentence
// headings get a full stop; "i" not "we".
//   run:  node engine/tools/gen-collections-page.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const WEB = join(here, '../../web');
const OUT = join(WEB, 'collections');
mkdirSync(OUT, { recursive: true });
const BASE = 'https://nosey-dewdrop.github.io/stitchu';
const V = process.env.V || '84';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The data-driven collection list. One entry = one collection card. To add a new
// collection: draft its page, drop a thumbnail, then append an entry here. The
// "count" is the number of looks in that collection; "thumb" is a relative path
// from web/collections/ to a representative engine SVG.
// The taste collections (Mod Mini, Little Frocks, Good Collars, Retro Dresses)
// are owned by gen-taste-collections.mjs; importing it also builds their pages.
// Run that generator first, then this one, so the index lists everything.
import { TASTE_COLLECTIONS } from './gen-taste-collections.mjs';

const COLLECTIONS = [
  {
    slug: 'sixties-seventies',
    href: '../collection-60s70s.html',
    thumb: '../patterns/vintage6070/sixties-fit-flare-knit-dress.svg',
    thumbAlt: 'Sixties fit-and-flare knit dress pattern',
    nameEn: 'The Sixties Seventies Collection',
    nameTr: 'Altmışlar Yetmişler Koleksiyonu',
    descEn: 'Sixteen 1960s and 1970s dress and skirt silhouettes read from museum photographs, each drafted to a full pattern piece by piece.',
    descTr: '1960 ve 1970’lerin müze fotoğraflarından okunan on altı elbise ve etek silueti, her biri parça parça tam kalıba çizildi.',
    countEn: '16 looks',
    countTr: '16 görünüm',
  },
  ...TASTE_COLLECTIONS,
];

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
  .lead{font-size:15.5px;color:var(--ink);max-width:64ch;margin-bottom:26px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;margin:22px 0 6px}
  .card{display:flex;gap:16px;background:#fff;border:1px solid var(--bb-line);border-radius:4px;overflow:hidden;text-decoration:none;color:var(--navy);box-shadow:0 6px 20px rgba(63,116,168,.08)}
  .card:hover{border-color:var(--bb-deep);box-shadow:0 10px 28px rgba(63,116,168,.16)}
  .card .thumb{flex:0 0 108px;background:#fff;border-right:1px solid var(--bb-line);padding:12px;display:flex;align-items:center;justify-content:center}
  .card .thumb img{max-width:100%;max-height:100%}
  .card .body{padding:16px 18px 16px 4px;display:flex;flex-direction:column;justify-content:center}
  .card .nm{font-family:'Didot',Georgia,serif;font-size:19px;margin-bottom:6px;line-height:1.2}
  .card .ds{font-size:13px;color:#5b7089;line-height:1.5}
  .card .ct{font-size:11.5px;letter-spacing:.5px;color:var(--bb-deep);margin-top:8px;font-variant-numeric:tabular-nums}
  footer{border-top:1px solid var(--bb-line);padding:24px 40px 34px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:11px;letter-spacing:1px;color:#5b7089}
  footer a{color:var(--navy);text-decoration:none}
  body::before{content:"";display:block;height:12px;background:repeating-linear-gradient(90deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),repeating-linear-gradient(0deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),#fff;}
</style>`;

function card(c) {
  return `<a class="card" href="${c.href}">
    <div class="thumb"><img src="${c.thumb}" alt="${esc(c.thumbAlt)}" loading="lazy"></div>
    <div class="body">
      <div class="nm" data-en="${esc(c.nameEn)}" data-tr="${esc(c.nameTr)}">${esc(c.nameEn)}</div>
      <div class="ds" data-en="${esc(c.descEn)}" data-tr="${esc(c.descTr)}">${esc(c.descEn)}</div>
      <div class="ct" data-en="${esc(c.countEn)}" data-tr="${esc(c.countTr)}">${esc(c.countEn)}</div>
    </div>
  </a>`;
}

const title = 'Collections · stitchu';
const desc = 'Curated collections of stitchu patterns, each look drafted to a full sewing pattern by the engine. Every piece shown is the engine’s own output.';
const canonical = `${BASE}/collections/`;

const ldjson = {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: title, description: desc, url: canonical, inLanguage: 'en',
  isPartOf: `${BASE}/`,
  mainEntity: {
    '@type': 'ItemList', numberOfItems: COLLECTIONS.length,
    itemListElement: COLLECTIONS.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.nameEn,
      url: `${BASE}/${c.href.replace(/^\.\.\//, '')}`,
    })),
  },
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%272%27 fill=%27%231f3a5f%27/%3E%3Cline x1=%276%27 y1=%2716%27 x2=%2726%27 y2=%2716%27 stroke=%27%23fff%27 stroke-width=%273%27 stroke-dasharray=%275 4%27/%3E%3C/svg%3E">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="stitchu">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${BASE}/assets/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${BASE}/assets/og-card.png">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${esc(desc)}">
<script type="application/ld+json">${JSON.stringify(ldjson)}</script>
<link rel="stylesheet" href="../css/shared-header.css?v=${V}">
<link rel="stylesheet" href="../css/theme-transitions.css?v=${V}">
${STYLE}
</head>
<body>
${HEADER}
<div class="wrap">
  <p class="crumbs"><a href="../index.html">stitchu</a> / <span data-en="collections" data-tr="koleksiyonlar">collections</span></p>
  <h1 data-en="Collections." data-tr="Koleksiyonlar.">Collections.</h1>
  <p class="lead" data-en="A collection is a curated group of patterns drawn around one idea. Each look inside is drafted end to end by the engine, and the list grows as new collections are published." data-tr="Bir koleksiyon, tek bir fikir etrafında kürate edilmiş kalıplar grubudur. İçindeki her görünüm motor tarafından baştan sona çizilir ve liste yeni koleksiyonlar yayınlandıkça büyür.">A collection is a curated group of patterns drawn around one idea. Each look inside is drafted end to end by the engine, and the list grows as new collections are published.</p>

  <div class="grid">
  ${COLLECTIONS.map(card).join('\n  ')}
  </div>
</div>
${FOOTER}
<script src="../js/shared-header.js?v=${V}"></script>
</body>
</html>`;

writeFileSync(join(OUT, 'index.html'), html);
console.log(`generated collections index (${COLLECTIONS.length} collection(s)) -> ${join(OUT, 'index.html')}`);
