// gen-vintage-page.mjs — build web/collection-60s70s.html from the rendered
// vintage looks. Inlines each look's engine-drafted SVG (same as showcase.html).
// Generator-produced: never hand-edit the HTML, edit this file then rerun.
//   run:  node engine/tools/gen-vintage-page.mjs [?vNN]
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const VDIR = join(here, '../../web/patterns/vintage6070');
const meta = JSON.parse(readFileSync(join(VDIR, 'meta.json'), 'utf8'));
const V = (process.argv[2] || 'v=74').replace(/^\?/, '');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// pull the inner <svg>...</svg> from each rendered file and scale it down for
// the card thumbnail (keep viewBox, set max height via CSS).
function svgOf(slug) {
  const raw = readFileSync(join(VDIR, `${slug}.svg`), 'utf8');
  // strip the xml width attr so CSS controls size; keep viewBox.
  return raw.replace(/ width="100%"/, '').trim();
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: 'Sixties seventies collection · stitchu',
  description: 'Twelve 1960s and 1970s dress and skirt silhouettes, each drafted to a full sewing pattern by the stitchu engine. Every piece shown is the engine’s own output.',
  url: 'https://nosey-dewdrop.github.io/stitchu/collection-60s70s.html',
  inLanguage: 'en', isPartOf: 'https://nosey-dewdrop.github.io/stitchu/',
  hasPart: meta.map((m) => ({ '@type': 'CreativeWork', name: m.en,
    about: `${m.period} ${m.house}`, url: `https://nosey-dewdrop.github.io/stitchu/collection-60s70s.html#${m.slug}` })),
};

const looks = meta.map((m) => {
  const oov = (m.oov || []).map((o) => `<span class="cap oov">${esc(o)}</span>`).join('');
  return `
<section class="look" id="${m.slug}">
  <div class="lhead">
    <h2 data-en="${esc(m.en)}" data-tr="${esc(m.tr)}">${esc(m.en)}</h2>
    <p class="era"><span class="period">${esc(m.period)}</span> · <span data-en="${esc(m.house)}" data-tr="${esc(m.house)}">${esc(m.house)}</span></p>
    <p class="lline" data-en="${esc(m.note_en)}" data-tr="${esc(m.note_tr)}">${esc(m.note_en)}</p>
    <div class="caps">${m.pieceNames.map((n) => `<span class="cap">${esc(n)}</span>`).join('')}</div>
    <p class="lmeta"><span class="num">${m.pieces}</span> <span data-en="pattern pieces" data-tr="kalıp parçası">pattern pieces</span> · <span class="num">${m.fabric}</span> m <span data-en="fabric at 140 cm" data-tr="140 cm kumaş">fabric at 140 cm</span> · <span class="ok" data-en="validator clean" data-tr="validator temiz">validator clean</span></p>
  </div>
  <div class="figwrap">${svgOf(m.slug)}</div>
  ${oov ? `<p class="honest" data-en="Drafted complete as a silhouette. The engine does not draw these surface details, so they are noted, not silently dropped:" data-tr="Siluet olarak tam çizildi. Motor bu yüzey detaylarını çizmez, bu yüzden sessizce atlanmaz, belirtilir:">Drafted complete as a silhouette. The engine does not draw these surface details, so they are noted, not silently dropped:</p><div class="caps">${oov}</div>` : ''}
</section>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%272%27 fill=%27%231f3a5f%27/%3E%3Cline x1=%276%27 y1=%2716%27 x2=%2726%27 y2=%2716%27 stroke=%27%23fff%27 stroke-width=%273%27 stroke-dasharray=%275 4%27/%3E%3C/svg%3E">
<title>Sixties seventies collection · stitchu</title>
<meta name="description" content="Twelve 1960s and 1970s dress and skirt silhouettes drafted to full sewing patterns by the stitchu engine. Every pattern piece shown is the engine's own output, validator clean.">
<link rel="canonical" href="https://nosey-dewdrop.github.io/stitchu/collection-60s70s.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="stitchu">
<meta property="og:title" content="Sixties seventies collection · stitchu">
<meta property="og:description" content="Twelve 1960s and 1970s silhouettes, every pattern piece drafted by the engine.">
<meta property="og:url" content="https://nosey-dewdrop.github.io/stitchu/collection-60s70s.html">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Sixties seventies collection · stitchu">
<meta name="twitter:description" content="Twelve 1960s and 1970s silhouettes, drafted by the engine.">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<link rel="stylesheet" href="css/theme-transitions.css?${V}">
<link rel="stylesheet" href="css/shared-header.css?${V}">
<style>
  :root{ --bb:#8fbfe8; --bb-deep:#3f74a8; --bb-pale:#dceaf7; --bb-line:#bcd7ee; --navy:#1f3a5f; --ink:#2b4a6b; --cherry:#8f2038; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Helvetica,Arial,sans-serif;color:var(--navy);background:#fff;line-height:1.5;overflow-x:hidden}
  a{color:var(--bb-deep)}
  .wrap{max-width:960px;margin:0 auto;padding:16px 32px 110px}
  h1{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:42px;line-height:1.1;font-weight:400;margin:20px 0 12px;color:var(--navy)}
  .manifesto{font-size:15px;color:var(--ink);max-width:66ch;margin-bottom:6px}
  .updated{font-size:12px;color:#5b7089;letter-spacing:.5px;margin-bottom:40px}
  .look{margin:0 0 56px;padding:0 0 40px;border-bottom:1px solid var(--bb-line)}
  .look:last-child{border-bottom:none}
  .lhead h2{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:30px;font-weight:400;color:var(--cherry);margin:0 0 4px}
  .era{font-size:12.5px;letter-spacing:.4px;color:#5b7089;margin-bottom:12px}
  .era .period{font-variant-numeric:tabular-nums;font-weight:700;color:var(--navy)}
  .lline{font-size:15.5px;color:var(--ink);max-width:64ch;margin-bottom:14px}
  .caps{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
  .cap{font-size:11.5px;letter-spacing:.3px;padding:5px 12px;border:1px solid var(--bb-line);background:var(--bb-pale);color:var(--navy);border-radius:2px;white-space:nowrap}
  .cap.oov{background:#fff;border-style:dashed;color:#5b7089}
  .lmeta{font-size:13px;color:#5b7089;letter-spacing:.3px;margin-bottom:22px}
  .lmeta .num{font-variant-numeric:tabular-nums;font-weight:700;color:var(--navy)}
  .lmeta .ok{color:var(--bb-deep)}
  .figwrap{border:1px solid var(--bb-line);background:#fff;box-shadow:0 6px 18px rgba(63,116,168,.08);padding:18px;margin-bottom:16px;border-radius:3px}
  .figwrap svg{width:100%;height:auto}
  .honest{font-size:13px;color:#5b7089;font-style:italic;margin:4px 0 10px;max-width:70ch}
  footer{border-top:1px solid var(--bb-line);padding:24px 40px 34px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:11px;letter-spacing:1px;color:#5b7089}
  footer a{color:var(--navy);text-decoration:none}
  body::before{content:"";display:block;height:12px;
    background:
      repeating-linear-gradient(90deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),
      repeating-linear-gradient(0deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),
      #fff;}
</style>
</head>
<body>
<header class="sh-header">
  <a class="brandpatch" href="index.html">stitchu</a>
  <nav class="sh-nav">
    <a href="create.html" data-en="create" data-tr="çiz">create</a>
    <a href="closet.html" data-en="closet" data-tr="dolap">closet</a>
    <a href="patterns/index.html" data-en="patterns" data-tr="kalıplar">patterns</a>
    <a href="benchmark.html" data-en="benchmark" data-tr="kıyaslama">benchmark</a>
    <a href="patches.html" data-en="patch notes" data-tr="yama notları">patch notes</a>
    <a href="api.html" data-en="API" data-tr="API">API</a>
    <span class="sh-lang"><button id="lang-en">EN</button><span>·</span><button id="lang-tr">TR</button></span>
  </nav>
</header>

<div class="wrap">
  <h1 data-en="Sixties seventies collection" data-tr="Altmışlar yetmişler koleksiyonu">Sixties seventies collection</h1>
  <p class="manifesto" data-en="I love the dresses and skirts of the sixties and seventies, so I gathered public-domain museum photographs of real garments from that period, read each one with the vision model, and let the engine draft its pattern. Every piece below is the engine's own output at an EU38 body, not a rendering. The source photographs stay private and are never published, only the pattern the engine draws." data-tr="Altmışların ve yetmişlerin elbiselerini ve eteklerini çok seviyorum, bu yüzden o döneme ait gerçek giysilerin kamuya açık müze fotoğraflarını topladım, her birini görü modeliyle okudum ve motorun kalıbını çizmesini sağladım. Aşağıdaki her parça EU38 beden üzerinde motorun kendi çıktısı, bir render değil. Kaynak fotoğraflar özel kalır ve asla yayınlanmaz, yalnızca motorun çizdiği kalıp.">I love the dresses and skirts of the sixties and seventies, so I gathered public-domain museum photographs of real garments from that period, read each one with the vision model, and let the engine draft its pattern. Every piece below is the engine's own output at an EU38 body, not a rendering. The source photographs stay private and are never published, only the pattern the engine draws.</p>
  <p class="updated" data-en="Twelve looks, drafted through the same engine the create page runs. Published 2026-07-17." data-tr="On iki görünüm, çiz sayfasının çalıştırdığı aynı motorla çizildi. Yayın 2026-07-17.">Twelve looks, drafted through the same engine the create page runs. Published 2026-07-17.</p>
${looks}
</div>

<footer>
  <span>stitchu · a pattern-making engine</span>
  <span><a href="index.html" data-en="home" data-tr="ana sayfa">home</a> · <a href="patterns/index.html" data-en="patterns" data-tr="kalıplar">patterns</a> · <a href="showcase.html" data-en="showcase" data-tr="vitrin">showcase</a> · <a href="benchmark.html" data-en="benchmark" data-tr="kıyaslama">benchmark</a> · <a href="patches.html" data-en="patch notes" data-tr="yama notları">patch notes</a> · <a href="api.html">API</a> · <a href="privacy.html" data-en="privacy" data-tr="gizlilik">privacy</a> · @nosey-dewdrop · <span style="opacity:.55">${V.replace('v=', 'v')}</span></span>
</footer>

<script src="js/shared-header.js?${V}"></script>
</body>
</html>`;

writeFileSync(join(here, '../../web/collection-60s70s.html'), html);
console.log(`collection-60s70s.html written (${meta.length} looks, ${V})`);
