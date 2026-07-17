// gen-blog.mjs — builds web/blog/index.html, the patterns journal. One source:
// web/patterns/svg/meta.json for the engine facts, web/patterns/index.html for
// the approved EN/TR card copy. Title Case on every heading and card title,
// explicit link colours (no browser-default purple), EN+TR on every string, no
// em dashes. Do not hand-edit the output; edit this generator and re-run.
//   run: node engine/tools/gen-blog.mjs
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const WEB = join(here, '../../web');
const V = 80; // cache-bust, bumped consistently across every touched page

const meta = JSON.parse(readFileSync(join(WEB, 'patterns/svg/meta.json'), 'utf8'));
const copy = JSON.parse(readFileSync('/tmp/cards.json', 'utf8'));
const copyBySlug = {};
for (const c of copy) copyBySlug[c.href.replace('.html', '')] = c;

// Title Case that keeps minor words lower unless first, keeps hyphen segments,
// and preserves known acronyms/words that are already capitalised.
const MINOR = new Set(['a', 'an', 'and', 'the', 'of', 'to', 'in', 'on', 'with', 'for']);
function titleCase(s) {
  const words = s.split(' ');
  return words.map((w, i) => {
    // keep hyphenated compounds title-cased on both sides: "boat-neck" -> "Boat-Neck"
    return w.split('-').map((seg) => {
      const low = seg.toLowerCase();
      if (i !== 0 && MINOR.has(low)) return low;
      return seg.charAt(0).toUpperCase() + seg.slice(1);
    }).join('-');
  }).join(' ');
}

const GARMENT_TR = { top: 'üst', dress: 'elbise', skirt: 'etek' };

function attribution(m) {
  // "drawn by" attribution; patch !== null links to patch notes.
  if (m.patch === null) {
    return {
      en: `Drawn by the base vocabulary, in from day one.`,
      tr: `Temel dağarcıkla çizildi, ilk günden beri hazırdı.`,
    };
  }
  return {
    en: `Drawn by ${m.drawnBy}, added in patch ${m.patch}.`,
    tr: `Yama ${m.patch} ile ${trDrawnBy(m.patch, m.drawnBy)} çizildi.`,
  };
}

// Turkish for the engine feature that drew each pattern.
const DRAWNBY_TR = {
  'the front button placket': 'ön düğme patı',
  'the collar family and the button placket': 'yaka ailesi ve düğme patı',
  'the fabric back-waist tie': 'kumaş arka bel bağı',
  'the fabric back tie': 'kumaş sırt bağı',
  'the gathered bust panel and the back-waist bow': 'büzgülü büst panosu ve arka bel fiyongu',
  'the front bust drawstring gather': 'ön büst büzgü bağı',
  'the shaped open-back cutout': 'şekilli açık sırt oyuğu',
  'the open-back cutout with a tie-back closure': 'bağlamalı açık sırt oyuğu',
  'the peter-pan collar, the puff sleeve head and the smocked yoke': 'bebe yaka, puf kol başı ve büzgülü roba',
};
function trDrawnBy(patch, s) { return DRAWNBY_TR[s] || 'yeni bir motor özelliğiyle'; }

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

const cards = meta.map((m) => {
  const c = copyBySlug[m.slug] || { ds_en: '', ds_tr: '' };
  const title = titleCase(m.style);
  const at = attribution(m);
  const garmentTr = GARMENT_TR[m.garment] || m.garment;
  return `  <a class="card" href="../patterns/${m.slug}.html">
    <div class="thumb"><img src="../patterns/svg/${m.slug}.svg" alt="${esc(title)} pattern" loading="lazy"></div>
    <div class="body">
      <div class="nm">${esc(title)}</div>
      <div class="ds" data-en="${esc(c.ds_en)}" data-tr="${esc(c.ds_tr)}">${esc(c.ds_en)}</div>
      <div class="specs">
        <span class="spec"><span class="k" data-en="Garment" data-tr="Giysi">Garment</span> <span class="val" data-en="${m.garment}" data-tr="${garmentTr}">${m.garment}</span></span>
        <span class="spec"><span class="k" data-en="Pieces" data-tr="Parça">Pieces</span> <span class="val">${m.pieces}</span></span>
        <span class="spec"><span class="k" data-en="Fabric" data-tr="Kumaş">Fabric</span> <span class="val">${m.fabric} m</span></span>
      </div>
      <div class="attr" data-en="${esc(at.en)}" data-tr="${esc(at.tr)}">${esc(at.en)}</div>
    </div>
  </a>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%272%27 fill=%27%231f3a5f%27/%3E%3Cline x1=%276%27 y1=%2716%27 x2=%2726%27 y2=%2716%27 stroke=%27%23fff%27 stroke-width=%273%27 stroke-dasharray=%275 4%27/%3E%3C/svg%3E">
<title>The Pattern Journal · stitchu</title>
<meta name="description" content="Every pattern the stitchu engine drafts end to end from a single photo, gathered in one place. The sixties and seventies collection plus all twelve sewable patterns from the benchmark, each with the honest patch that drew it.">
<link rel="canonical" href="https://nosey-dewdrop.github.io/stitchu/blog/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="stitchu">
<meta property="og:title" content="The Pattern Journal · stitchu">
<meta property="og:description" content="Every pattern the engine drafts from a single photo, gathered in one place. The sixties and seventies collection plus all twelve sewable patterns from the benchmark.">
<meta property="og:url" content="https://nosey-dewdrop.github.io/stitchu/blog/">
<meta property="og:image" content="https://nosey-dewdrop.github.io/stitchu/assets/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://nosey-dewdrop.github.io/stitchu/assets/og-card.png">
<meta name="twitter:title" content="The Pattern Journal · stitchu">
<meta name="twitter:description" content="Every pattern the engine drafts from a single photo, gathered in one place.">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"The Pattern Journal · stitchu","description":"Every pattern the stitchu engine drafts end to end from a single photo, gathered in one place.","url":"https://nosey-dewdrop.github.io/stitchu/blog/","inLanguage":"en","mainEntity":{"@type":"ItemList","numberOfItems":${meta.length},"itemListElement":[${meta.map((m, i) => `{"@type":"ListItem","position":${i + 1},"name":"${titleCase(m.style)}","url":"https://nosey-dewdrop.github.io/stitchu/patterns/${m.slug}.html"}`).join(',')}]}}</script>
<link rel="stylesheet" href="../css/shared-header.css?v=${V}">
<link rel="stylesheet" href="../css/theme-transitions.css?v=${V}">
<link rel="stylesheet" href="../css/shared-button.css?v=${V}">
<style>
  :root{ --bb:#8fbfe8; --bb-deep:#3f74a8; --bb-pale:#dceaf7; --bb-line:#bcd7ee; --navy:#1f3a5f; --ink:#2b4a6b; --cherry:#8f2038; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Helvetica,Arial,sans-serif;color:var(--navy);background:#fff;line-height:1.55;overflow-x:hidden}
  a{color:var(--bb-deep)}
  /* Header comes from ../css/shared-header.css (one source, byte-identical bar). */
  .wrap{max-width:960px;margin:0 auto;padding:14px 32px 100px}
  .crumbs{font-size:12px;color:#5b7089;letter-spacing:.4px;margin-bottom:16px}
  .crumbs a{text-decoration:none;color:var(--navy)}
  h1{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:40px;line-height:1.12;font-weight:400;margin:8px 0 12px;color:var(--navy);max-width:24ch}
  .lead{font-size:15.5px;color:var(--ink);max-width:66ch;margin-bottom:10px}
  .counter{font-size:14px;color:var(--ink);max-width:62ch;margin:2px 0 4px}
  .counter b{color:var(--navy);font-variant-numeric:tabular-nums}
  .counter a{color:var(--navy);text-decoration:none;border-bottom:1px dashed var(--bb-deep);padding-bottom:1px}
  .sec{margin:46px 0 0}
  h2{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:26px;font-weight:400;margin:0 0 8px;color:var(--navy)}
  .secline{font-size:15px;color:var(--ink);max-width:66ch;margin-bottom:8px}
  .seclink{font-size:13.5px;letter-spacing:.3px;color:var(--navy);text-decoration:none;border-bottom:1px dashed var(--bb-deep);padding-bottom:2px}
  .honest{font-size:13.5px;color:#5b7089;font-style:italic;margin:8px 0 2px;max-width:66ch}
  .honest a{font-style:normal;color:var(--navy)}
  .vintage{border:1px solid var(--bb-line);background:var(--bb-pale);border-radius:3px;padding:20px 22px;margin-top:16px}
  .vintage h3{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:20px;font-weight:400;color:var(--cherry);margin:0 0 6px}
  .vintage p{font-size:14px;color:var(--ink);max-width:62ch;margin-bottom:14px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin:20px 0 6px}
  .card{display:block;background:#fff;border:1px solid var(--bb-line);border-radius:4px;overflow:hidden;text-decoration:none;color:var(--navy);box-shadow:0 6px 20px rgba(63,116,168,.08)}
  .card:hover{border-color:var(--bb-deep);box-shadow:0 10px 28px rgba(63,116,168,.16)}
  .card .thumb{background:#fff;border-bottom:1px solid var(--bb-line);padding:14px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center}
  .card .thumb img{max-width:100%;max-height:100%}
  .card .body{padding:14px 16px}
  .card .nm{font-family:'Didot',Georgia,serif;font-size:17px;margin-bottom:5px;line-height:1.2;color:var(--navy)}
  .card .ds{font-size:12.5px;color:#5b7089;line-height:1.45;margin-bottom:10px}
  .card .specs{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:9px;padding-top:9px;border-top:1px solid var(--bb-line)}
  .card .spec{font-size:11.5px;color:#5b7089;letter-spacing:.2px}
  .card .spec .k{text-transform:uppercase;letter-spacing:.6px;font-size:10px;color:#8397ac}
  .card .spec .val{font-variant-numeric:tabular-nums;font-weight:700;color:var(--navy)}
  .card .attr{font-size:11.5px;color:#5b7089;line-height:1.4}
  footer{border-top:1px solid var(--bb-line);padding:24px 40px 34px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:11px;letter-spacing:1px;color:#5b7089;margin-top:40px}
  footer a{color:var(--navy);text-decoration:none}
  body::before{content:"";display:block;height:12px;background:repeating-linear-gradient(90deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),repeating-linear-gradient(0deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),#fff;}
</style>
</head>
<body>
<header class="sh-header">
  <a class="brandpatch" href="../index.html">stitchu</a>
  <nav class="sh-nav">
    <a href="../create.html" data-en="Create" data-tr="Çiz">Create</a>
    <a href="../closet.html" data-en="Closet" data-tr="Dolap">Closet</a>
    <a href="../patterns/index.html" data-en="Patterns" data-tr="Kalıplar">Patterns</a>
    <a href="index.html" class="sh-active" data-en="Blog" data-tr="Günlük">Blog</a>
    <a href="../benchmark.html" data-en="Benchmark" data-tr="Kıyaslama">Benchmark</a>
    <a href="../patches.html" data-en="Patch Notes" data-tr="Yama Notları">Patch Notes</a>
    <a href="../api.html" data-en="API" data-tr="API">API</a>
    <span class="sh-lang"><button id="lang-en">EN</button><span>·</span><button id="lang-tr">TR</button></span>
  </nav>
</header>
<div class="wrap">
  <p class="crumbs"><a href="../index.html">stitchu</a> / <span data-en="blog" data-tr="günlük">blog</span></p>
  <h1 data-en="The Pattern Journal." data-tr="Kalıp Günlüğü.">The Pattern Journal.</h1>
  <p class="lead" data-en="This is where the engine's work is collected as something you can read. Every pattern below was drafted end to end from a single photo, and every drawing is the engine's own output, nothing traced or mocked." data-tr="Burası, motorun işinin okunabilir bir şeye dönüştüğü yer. Aşağıdaki her kalıp tek bir fotoğraftan baştan sona çizildi ve her çizim motorun kendi çıktısı, hiçbiri kopyalanmış ya da taklit değil.">This is where the engine's work is collected as something you can read. Every pattern below was drafted end to end from a single photo, and every drawing is the engine's own output, nothing traced or mocked.</p>
  <p class="counter" data-en="37 of 54 real product photos turn into a full pattern, and counting." data-tr="54 gerçek ürün fotoğrafının 37'si tam kalıba dönüşüyor, ve artıyor.">37 of 54 real product photos turn into a full pattern, and counting.</p>
  <p class="counter"><a href="../patches.html" data-en="Follow The Number In The Patch Notes" data-tr="Sayıyı Yama Notlarında Takip Et">Follow The Number In The Patch Notes</a></p>

  <section class="sec">
    <h2 data-en="The Sixties Seventies Collection." data-tr="Altmışlar Yetmişler Koleksiyonu.">The Sixties Seventies Collection.</h2>
    <p class="secline" data-en="The vintage silhouettes, twelve looks from 1960s and 1970s dresses and skirts, each read from a museum photograph and drafted to a full pattern piece by piece." data-tr="Vintage siluetler, 1960'lar ve 1970'lar elbise ve eteklerinden on iki görünüm, her biri bir müze fotoğrafından okunup parça parça tam kalıba çizildi.">The vintage silhouettes, twelve looks from 1960s and 1970s dresses and skirts, each read from a museum photograph and drafted to a full pattern piece by piece.</p>
    <div class="vintage">
      <h3 data-en="Quant, Biba, Courrèges, Pucci And More." data-tr="Quant, Biba, Courrèges, Pucci Ve Daha Fazlası.">Quant, Biba, Courrèges, Pucci And More.</h3>
      <p data-en="Twelve period looks, every pattern piece validator clean, with the surface detail the engine does not yet draw noted honestly on each one." data-tr="On iki dönem görünümü, her kalıp parçası doğrulayıcıdan temiz geçti, motorun henüz çizmediği yüzey detayı her birinde dürüstçe not edildi.">Twelve period looks, every pattern piece validator clean, with the surface detail the engine does not yet draw noted honestly on each one.</p>
      <a class="seclink" href="../collection-60s70s.html" data-en="Open The Sixties Seventies Collection" data-tr="Altmışlar Yetmişler Koleksiyonunu Aç">Open The Sixties Seventies Collection</a>
    </div>
  </section>

  <section class="sec">
    <h2 data-en="Patterns From The Benchmark." data-tr="Kıyaslamadan Gelen Kalıplar.">Patterns From The Benchmark.</h2>
    <p class="secline" data-en="Every one of these is a real product style the engine read from a photo and drafted into a complete, sewable pattern. These twelve are the ones that draft cleanly today. Each card links to its full pattern page." data-tr="Bunların her biri, motorun bir fotoğraftan okuyup tam, dikilebilir bir kalıba çizdiği gerçek bir ürün modeli. Bu on iki tanesi bugün temiz çizilenler. Her kart kendi tam kalıp sayfasına bağlanır.">Every one of these is a real product style the engine read from a photo and drafted into a complete, sewable pattern. These twelve are the ones that draft cleanly today. Each card links to its full pattern page.</p>
    <p class="honest" data-en="The misses are public too. The photos that do not yet draft to a full pattern are tracked openly in the benchmark and the patch notes." data-tr="Kaçırılanlar da açık. Henüz tam kalıba dönüşmeyen fotoğraflar kıyaslamada ve yama notlarında açıkça takip ediliyor.">The misses are public too. The photos that do not yet draft to a full pattern are tracked openly in the <a href="../benchmark.html" data-en="benchmark" data-tr="kıyaslama">benchmark</a> and the <a href="../patches.html" data-en="patch notes" data-tr="yama notları">patch notes</a>.</p>

    <div class="grid">
${cards}
    </div>
  </section>

  <a class="sb-btn sb-primary" href="../create.html" data-en="Draft One To Your Measurements, Free." data-tr="Birini Ölçülerine Göre Çiz, Ücretsiz." style="margin-top:36px">Draft One To Your Measurements, Free.</a>
</div>
<footer>
  <span>stitchu · a pattern-making engine</span>
  <span><a href="../index.html" data-en="Home" data-tr="Ana Sayfa">Home</a> · <a href="../patterns/index.html" data-en="Patterns" data-tr="Kalıplar">Patterns</a> · <a href="../benchmark.html" data-en="Benchmark" data-tr="Kıyaslama">Benchmark</a> · <a href="../patches.html" data-en="Patch Notes" data-tr="Yama Notları">Patch Notes</a> · <a href="../api.html">API</a> · <a href="../privacy.html" data-en="Privacy" data-tr="Gizlilik">Privacy</a> · @nosey-dewdrop · <span style="opacity:.55">v${V}</span></span>
</footer>
<script src="../js/shared-header.js?v=${V}"></script>
</body>
</html>
`;

writeFileSync(join(WEB, 'blog/index.html'), html);
console.log(`wrote web/blog/index.html (${meta.length} pattern cards + sixties seventies section)`);
