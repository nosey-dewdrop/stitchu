// gen-taste-collections.mjs — builds Damla's taste collections under
// web/collections/<slug>.html. A taste collection is a curated grouping of the
// Pattern Blog patterns around one idea (mod minis, sweet frocks, good collars,
// retro dresses). Each look card is CLICKABLE through to the pattern's own blog
// detail page (../patterns/<slug>.html), which already carries the sewing details
// + the A4/A0/guide PDF downloads. Same structure as the Pattern Blog and the
// sixties/seventies collection: clickable -> detail -> download.
//
// DATA: web/patterns/svg/meta.json (owned by the engine track) for names, piece
// list, fabric, closure; the flat sketch + nested-piece SVGs are inlined from
// web/patterns/svg/. No source photos, only the engine's own output.
//
// Writing rules (Damla): Title Case on headings/nav/labels/collection names; no
// em dash; sentence headings get a full stop; explicit navy links (never purple);
// every visible string carries data-en AND data-tr.
//   run:  V=88 node engine/tools/gen-taste-collections.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { siteVersion } from './site-version.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const WEB = join(here, '../../web');
const SVGDIR = join(WEB, 'patterns', 'svg');
const OUT = join(WEB, 'collections');
mkdirSync(OUT, { recursive: true });
const BASE = 'https://stitchu.noseydewdrop.com';
// Asset cache-bust version: read from web/ (the single record), never a
// frozen literal. TUR 13 found this file pinned at 90 while the live site
// stood at 136 — running it would have rewound the pages it writes.
const V = process.env.V || siteVersion();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const meta = JSON.parse(readFileSync(join(SVGDIR, 'meta.json'), 'utf8'));
const bySlug = Object.fromEntries(meta.map((m) => [m.slug, m]));

// Strip the xml width attr so CSS controls size; keep viewBox.
const svgOf = (file) => readFileSync(join(SVGDIR, file), 'utf8').replace(/ width="100%"/, '').trim();
const cleanPiece = (n) => n.replace(/\s*\([^)]*\)\s*$/, '').trim();

// The collection definitions. `looks` are Pattern Blog slugs, curated by taste.
// A pattern can appear in more than one collection. `line` is a one-line reason
// each look belongs here (EN + TR). Skip a collection with too few real matches.
const COLLECTIONS = [
  {
    slug: 'babydoll',
    nameEn: 'Babydoll', nameTr: 'Babydoll',
    descEn: 'The babydoll silhouette: a high empire or bust yoke that flares soft and short, gathered or smocked, in every neckline the engine drafts.',
    descTr: 'Babydoll silueti: yüksek bir empire ya da büst robasından yumuşak ve kısa açılan, büzgülü ya da robalı, motorun çizdiği her yakada.',
    manifestoEn: 'A babydoll sits its fit high, at an empire seam or a bust yoke, then falls away loose and short. The bust is gathered, smocked or drawn on a drawstring, and the neckline is free to be square, round or collared. These are the babydoll patterns from the Pattern Blog, each drafted complete by the engine with every gathered and yoked piece drawn, not implied.',
    manifestoTr: 'Bir babydoll oturmayı yükseğe, bir empire dikişe ya da büst robasına taşır, sonra bol ve kısa dökülür. Büst büzülür, robalanır ya da bir büzgü bağıyla toplanır; yaka kare, yuvarlak ya da yakalı olmakta serbesttir. Bunlar Kalıp Günlüğü’nden babydoll kalıpları, her biri motor tarafından tam çizildi; büzülen ve robalanan her parça ima değil, çizilmiş.',
    looks: [
      { slug: 'ruffled-strap-milkmaid-babydoll-dress', en: 'Ruffled straps, a shirred bust yoke and a soft front tie.', tr: 'Fırfırlı askılar, büzgülü büst robası ve yumuşak ön bağ.' },
      { slug: 'square-neck-drawstring-babydoll-dress', en: 'A square neckline gathered soft at the bust by a drawstring.', tr: 'Büstten bir büzgü bağıyla yumuşak toplanan kare yaka.' },
      { slug: 'square-neck-back-tie-babydoll-top', en: 'A square-neck babydoll top that closes with a back tie.', tr: 'Arka bağla kapanan kare yakalı bir babydoll üst.' },
      { slug: 'shirt-collar-smocked-babydoll-top', en: 'A pointed shirt collar over a smocked babydoll yoke.', tr: 'Büzgülü bir babydoll robasının üstünde sivri gömlek yakası.' },
      { slug: 'peter-pan-collar-puff-sleeve-babydoll-dress', en: 'A round peter-pan collar, puff sleeves and a smocked yoke.', tr: 'Yuvarlak bebe yaka, puf kollar ve büzgülü roba.' },
    ],
  },
  {
    slug: 'mod-mini',
    nameEn: 'Mod Mini', nameTr: 'Mod Mini',
    descEn: 'The clean sixties mod silhouette: a straight, high-armhole mini that skims from a simple neckline to a short hem.',
    descTr: 'Sade altmışlar mod silueti: basit bir yakadan kısa eteğe sinen, düz ve yüksek kol oyuklu bir mini.',
    manifestoEn: 'The mod mini is the sixties in one shape: a short, clean line with a high armhole and a quiet neckline, shaped just enough to skim the body. These are the minis from the Pattern Blog that read as pure mod, each drafted end to end by the engine.',
    manifestoTr: 'Mod mini, altmışları tek bir biçimde toplar: yüksek kol oyuklu, sakin yakalı, vücudu sinecek kadar biçimlenmiş kısa ve temiz bir çizgi. Bunlar Kalıp Günlüğü’nden saf mod okunan miniler, her biri motor tarafından baştan sona çizildi.',
    looks: [
      { slug: 'scoop-neck-tank-mini-dress', en: 'A soft scoop-neck knit tank, the simplest mod line.', tr: 'Yumuşak oval yakalı örme atlet, en sade mod çizgi.' },
      { slug: 'back-tie-shift-mini-dress', en: 'A boat-neck shift that skims straight to a mini hem.', tr: 'Kayık yakalı, düz mini eteğe sinen bir salaş kesim.' },
      { slug: 'gathered-bust-empire-mini-dress', en: 'A boat-neck empire mini with a gathered bust panel.', tr: 'Kayık yakalı empire mini, büzgülü büst panosuyla.' },
      { slug: 'open-back-princess-mini-dress', en: 'A princess-seam mini with a shaped open back.', tr: 'Prenses dikişli mini, şekilli açık sırtıyla.' },
      { slug: 'open-back-tie-back-mini-dress', en: 'A dart-shaped mini with a round open back and a tie.', tr: 'Pensle biçimlenmiş mini, yuvarlak açık sırt ve bağıyla.' },
    ],
  },
  {
    slug: 'little-frocks',
    nameEn: 'Little Frocks', nameTr: 'Küçük Elbiseler',
    descEn: 'Sweet, chic babydoll minis: empire seams, gathered panels and soft details that keep the line young and romantic.',
    descTr: 'Tatlı, şık babydoll miniler: empire dikişler, büzgülü panolar ve çizgiyi genç ve romantik tutan yumuşak detaylar.',
    manifestoEn: 'A little frock is short, sweet and a little romantic: an empire seam sitting the fit under the bust, a panel gathered soft, a collar or a tie to finish. These are the babydoll minis from the Pattern Blog, each drafted complete by the engine with every gathered piece drawn, not implied.',
    manifestoTr: 'Küçük bir elbise kısadır, tatlıdır ve biraz romantiktir: oturmayı büstün altına taşıyan bir empire dikiş, yumuşak büzülmüş bir pano, bitiren bir yaka ya da bağ. Bunlar Kalıp Günlüğü’nden babydoll miniler, her biri motor tarafından tam çizildi; büzülen her parça ima değil, çizilmiş.',
    looks: [
      { slug: 'ruffled-strap-milkmaid-babydoll-dress', en: 'Ruffled straps, a shirred bust yoke and a soft front tie.', tr: 'Fırfırlı askılar, büzgülü büst robası ve yumuşak ön bağ.' },
      { slug: 'peter-pan-collar-puff-sleeve-babydoll-dress', en: 'A round peter-pan collar, puff sleeves and a smocked yoke.', tr: 'Yuvarlak bebe yaka, puf kollar ve büzgülü roba.' },
      { slug: 'square-neck-drawstring-babydoll-dress', en: 'A square neckline gathered soft at the bust by a drawstring.', tr: 'Büstten bir büzgü bağıyla yumuşak toplanan kare yaka.' },
      { slug: 'gathered-bust-empire-mini-dress', en: 'An empire mini with a gathered bust and a back-waist bow.', tr: 'Büzgülü büstlü ve arka bel fiyonklu bir empire mini.' },
    ],
  },
  {
    slug: 'good-collars',
    nameEn: 'Good Collars', nameTr: 'Güzel Yakalar',
    descEn: 'The collars worth the extra pieces: a mandarin stand, a rounded peter-pan and a pointed shirt collar, each drafted straight off the neckline.',
    descTr: 'Ekstra parçaya değen yakalar: bir dik mandarin, yuvarlak bir bebe ve sivri bir gömlek yakası; her biri doğrudan yakadan çizildi.',
    manifestoEn: 'A good collar is a separate piece, and the engine draws it straight off the neckline the bodice already drew, so it can never come out longer or shorter than the opening it sits on. These are the collared patterns from the Pattern Blog: a mandarin stand, a rounded peter-pan and a pointed shirt collar.',
    manifestoTr: 'Güzel bir yaka ayrı bir parçadır ve motor onu gövdenin çizdiği yakadan doğrudan çizer, böylece oturduğu açıklıktan asla uzun ya da kısa çıkamaz. Bunlar Kalıp Günlüğü’nden yakalı kalıplar: bir dik mandarin, yuvarlak bir bebe ve sivri bir gömlek yakası.',
    looks: [
      { slug: 'mandarin-collar-fitted-blouse', en: 'A low mandarin stand collar on a fitted button blouse.', tr: 'Oturmuş düğmeli bir bluzda alçak dik mandarin yaka.' },
      { slug: 'peter-pan-collar-puff-sleeve-babydoll-dress', en: 'A round peter-pan collar on a puff-sleeve babydoll.', tr: 'Puf kollu bir babydollda yuvarlak bebe yaka.' },
      { slug: 'shirt-collar-smocked-babydoll-top', en: 'A pointed shirt collar on a smocked babydoll top.', tr: 'Büzgülü bir babydoll üstte sivri gömlek yakası.' },
    ],
  },
  {
    slug: 'retro-dresses',
    nameEn: 'Retro Dresses', nameTr: 'Retro Elbiseler',
    descEn: 'Vintage-silhouette dresses: back-tie shifts, empire bows and open backs that carry a clear mid-century line.',
    descTr: 'Vintage siluetli elbiseler: arka bağlı salaşlar, empire fiyonklar ve net bir yüzyıl-ortası çizgi taşıyan açık sırtlar.',
    manifestoEn: 'These are the dresses from the Pattern Blog that carry a clear vintage line: the back-tie shift, the empire bow, the open back with a tie. Each is drafted end to end by the engine, with the ties and bows drawn as real cut pieces rather than markings.',
    manifestoTr: 'Bunlar Kalıp Günlüğü’nden net bir vintage çizgi taşıyan elbiseler: arka bağlı salaş, empire fiyonk, bağlı açık sırt. Her biri motor tarafından baştan sona çizildi; bağlar ve fiyonklar işaret değil, gerçek kesim parçaları olarak çizildi.',
    looks: [
      { slug: 'back-tie-shift-mini-dress', en: 'A boat-neck shift with a fabric tie at the back waist.', tr: 'Arka belinde kumaş bağı olan kayık yakalı salaş.' },
      { slug: 'empire-waist-tie-back-dress', en: 'An empire dress with a gathered bust and a back bow.', tr: 'Büzgülü büstlü ve arka fiyonklu empire elbise.' },
      { slug: 'open-back-tie-back-mini-dress', en: 'A round open back closed with a fabric tie.', tr: 'Kumaş bağla kapanan yuvarlak açık sırt.' },
      { slug: 'peter-pan-collar-puff-sleeve-babydoll-dress', en: 'A peter-pan collar and puff sleeves, pure retro sweetness.', tr: 'Bebe yaka ve puf kollar, saf retro tatlılık.' },
      { slug: 'ruffled-strap-milkmaid-babydoll-dress', en: 'A milkmaid babydoll with ruffled straps and a front tie.', tr: 'Fırfırlı askılı ve ön bağlı bir milkmaid babydoll.' },
    ],
  },
];

const HEADER = `<header class="sh-header">
  <a class="brandpatch" href="../index.html">stitchu</a>
  <nav class="sh-nav">
    <a href="../create.html" data-en="Create" data-tr="Çiz">Create</a>
    <a href="../closet.html" data-en="Closet" data-tr="Dolap">Closet</a>
    <a href="index.html" class="sh-active" data-en="Collections" data-tr="Koleksiyonlar">Collections</a>
    <a href="../benchmark.html" data-en="Benchmark" data-tr="Kıyaslama">Benchmark</a>
    <a href="../patches.html" data-en="Patch Notes" data-tr="Yama Notları">Patch Notes</a>
    <a href="../api.html" data-en="API" data-tr="API">API</a>
    <span class="sh-lang"><button id="lang-en">EN</button><span>·</span><button id="lang-tr">TR</button></span>
  </nav>
</header>`;

const FOOTER = `<footer>
  <span>stitchu · a pattern-making engine</span>
  <span><a href="../index.html" data-en="Home" data-tr="Ana Sayfa">Home</a> · <a href="index.html" data-en="Collections" data-tr="Koleksiyonlar">Collections</a> · <a href="../benchmark.html" data-en="Benchmark" data-tr="Kıyaslama">Benchmark</a> · <a href="../patches.html" data-en="Patch Notes" data-tr="Yama Notları">Patch Notes</a> · <a href="../api.html">API</a> · <a href="../privacy.html" data-en="Privacy" data-tr="Gizlilik">Privacy</a> · @nosey-dewdrop · <span style="opacity:.55">v${V}</span></span>
</footer>`;

const STYLE = `<style>
  :root{ --bb:#8fbfe8; --bb-deep:#3f74a8; --bb-pale:#dceaf7; --bb-line:#bcd7ee; --navy:#1f3a5f; --ink:#2b4a6b; --cherry:#8f2038; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Helvetica,Arial,sans-serif;color:var(--navy);background:#fff;line-height:1.5;overflow-x:hidden}
  a{color:var(--bb-deep)}
  .wrap{max-width:960px;margin:0 auto;padding:16px 32px 110px}
  .crumbs{font-size:12px;color:#5b7089;letter-spacing:.4px;margin:6px 0 4px}
  .crumbs a{text-decoration:none;color:var(--navy)}
  h1{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:42px;line-height:1.1;font-weight:400;margin:14px 0 12px;color:var(--navy)}
  .manifesto{font-size:15px;color:var(--ink);max-width:66ch;margin-bottom:6px}
  .updated{font-size:12px;color:#5b7089;letter-spacing:.5px;margin-bottom:40px}
  .look{margin:0 0 56px;padding:0 0 40px;border-bottom:1px solid var(--bb-line)}
  .look:last-child{border-bottom:none}
  .lhead h2{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:30px;font-weight:400;margin:0 0 4px}
  .lhead h2 .lhead-link{color:var(--cherry);text-decoration:none}
  .lhead h2 .lhead-link:hover{text-decoration:underline;text-underline-offset:3px}
  .lline{font-size:15.5px;color:var(--ink);max-width:64ch;margin-bottom:14px}
  .caps{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
  .cap{font-size:11.5px;letter-spacing:.3px;padding:5px 12px;border:1px solid var(--bb-line);background:var(--bb-pale);color:var(--navy);border-radius:2px;white-space:nowrap}
  .lmeta{font-size:13px;color:#5b7089;letter-spacing:.3px;margin-bottom:22px}
  .lmeta .num{font-variant-numeric:tabular-nums;font-weight:700;color:var(--navy)}
  .lmeta .ok{color:var(--bb-deep)}
  .figwrap{display:block;border:1px solid var(--bb-line);background:#fff;box-shadow:0 6px 18px rgba(63,116,168,.08);padding:18px;margin-bottom:16px;border-radius:3px;text-decoration:none}
  a.figwrap:hover{border-color:var(--bb-deep);box-shadow:0 10px 28px rgba(63,116,168,.16)}
  .figwrap svg{width:100%;height:auto}
  .viewcap{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#5b7089;margin:6px 0 6px}
  .detaillink{margin:12px 0 0;font-size:14px}
  .detaillink a{color:var(--navy);text-decoration:none;border-bottom:1px dashed var(--bb-deep);padding-bottom:2px}
  .detaillink a:hover{color:var(--bb-deep)}
  footer{border-top:1px solid var(--bb-line);padding:24px 40px 34px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:11px;letter-spacing:1px;color:#5b7089}
  footer a{color:var(--navy);text-decoration:none}
  body::before{content:"";display:block;height:12px;
    background:
      repeating-linear-gradient(90deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),
      repeating-linear-gradient(0deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),
      #fff;}
</style>`;

function lookSection(l) {
  const m = bySlug[l.slug];
  if (!m) throw new Error(`collection look references unknown pattern slug: ${l.slug}`);
  const detail = `../patterns/${m.slug}.html`;
  const pieces = m.pieceNames.map(cleanPiece);
  return `
<section class="look" id="${m.slug}">
  <div class="lhead">
    <h2><a class="lhead-link" href="${detail}" data-en="${esc(m.style)}" data-tr="${esc(m.style)}">${esc(m.style)}</a></h2>
    <p class="lline" data-en="${esc(l.en)}" data-tr="${esc(l.tr)}">${esc(l.en)}</p>
    <div class="caps">${pieces.map((n) => `<span class="cap">${esc(n)}</span>`).join('')}</div>
    <p class="lmeta"><span class="num">${m.pieces}</span> <span data-en="pattern pieces" data-tr="kalıp parçası">pattern pieces</span> · <span class="num">${m.fabric}</span> m <span data-en="fabric at 140 cm" data-tr="140 cm kumaş">fabric at 140 cm</span> · <span class="ok" data-en="validator clean" data-tr="validator temiz">validator clean</span>${m.closure ? ` · <span class="ok" data-en="closure: ${esc(m.closure)}" data-tr="kapanma: ${esc(m.closure)}">${esc(m.closure)}</span>` : ''}</p>
  </div>
  <a class="figwrap" href="${detail}">${svgOf(`${m.slug}.svg`)}</a>
  <p class="detaillink"><a href="${detail}" data-en="See the sewing details and download the pattern →" data-tr="Dikiş detaylarını gör ve kalıbı indir →">See the sewing details and download the pattern →</a></p>
</section>`;
}

for (const col of COLLECTIONS) {
  const looks = col.looks.map(lookSection).join('\n');
  const canonical = `${BASE}/collections/${col.slug}.html`;
  const title = `${col.nameEn} collection · stitchu`;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: title, description: col.descEn, url: canonical, inLanguage: 'en',
    isPartOf: `${BASE}/collections/`,
    hasPart: col.looks.map((l) => ({ '@type': 'CreativeWork', name: bySlug[l.slug].style,
      url: `${BASE}/patterns/${l.slug}.html` })),
  };
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%272%27 fill=%27%231f3a5f%27/%3E%3Cline x1=%276%27 y1=%2716%27 x2=%2726%27 y2=%2716%27 stroke=%27%23fff%27 stroke-width=%273%27 stroke-dasharray=%275 4%27/%3E%3C/svg%3E">
<title>${esc(title)}</title>
<meta name="description" content="${esc(col.descEn)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="stitchu">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(col.descEn)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${BASE}/assets/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${BASE}/assets/og-card.png">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(col.descEn)}">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<link rel="stylesheet" href="../css/theme-transitions.css?v=${V}">
<link rel="stylesheet" href="../css/shared-header.css?v=${V}">
${STYLE}
</head>
<body>
${HEADER}
<div class="wrap">
  <p class="crumbs"><a href="../index.html">stitchu</a> / <a href="index.html" data-en="collections" data-tr="koleksiyonlar">collections</a> / ${esc(col.nameEn)}</p>
  <h1 data-en="${esc(col.nameEn)}" data-tr="${esc(col.nameTr)}">${esc(col.nameEn)}</h1>
  <p class="manifesto" data-en="${esc(col.manifestoEn)}" data-tr="${esc(col.manifestoTr)}">${esc(col.manifestoEn)}</p>
  <p class="updated" data-en="${col.looks.length} looks, each clickable through to its pattern page with the printable PDF pack. Drafted through the same engine the create page runs." data-tr="${col.looks.length} görünüm, her biri baskıya hazır PDF paketiyle kendi kalıp sayfasına tıklanabilir. Çiz sayfasının çalıştırdığı aynı motorla çizildi.">${col.looks.length} looks, each clickable through to its pattern page with the printable PDF pack. Drafted through the same engine the create page runs.</p>
${looks}
</div>
${FOOTER}
<script src="../js/shared-header.js?v=${V}"></script>
</body>
</html>`;
  writeFileSync(join(OUT, `${col.slug}.html`), html);
  console.log(`collections/${col.slug}.html written (${col.looks.length} looks)`);
}

// Export the collection metadata so gen-collections-page.mjs lists them on the index.
export const TASTE_COLLECTIONS = COLLECTIONS.map((c) => ({
  slug: c.slug, href: `${c.slug}.html`,
  thumb: `../patterns/svg/${c.looks[0].slug}.svg`,
  thumbAlt: `${c.nameEn} collection, ${bySlug[c.looks[0].slug].style} pattern`,
  nameEn: `The ${c.nameEn} Collection`, nameTr: `${c.nameTr} Koleksiyonu`,
  descEn: c.descEn, descTr: c.descTr,
  countEn: `${c.looks.length} looks`, countTr: `${c.looks.length} görünüm`,
}));

console.log(`\n${COLLECTIONS.length} taste collections generated -> ${OUT}`);
