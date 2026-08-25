// gen-guide.mjs — generates the sewing-guide content pages (web/guide/*.html)
// from ONE data array below, so the copy has a single source and the pages are
// regenerable (never hand-edit the output; edit here + rerun).
//   run: node engine/tools/gen-guide.mjs
// The garment content is drawn from knowledge/sewing-guide.md (fabric weight/
// drape logic + the 9-phase construction order); every fabric fact traces to the
// Extension fibre guides already in web/data/fabrics.json. The index page is
// hand-authored (web/guide/index.html) and NOT touched by this script.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteVersion } from './site-version.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', '..', 'web', 'guide');
// Shared asset cache stamp, read from web/ (the single record). This was the
// literal 'v83' until TUR 13 and it was wrong TWICE: frozen 53 bumps behind a
// site at 136, and malformed — it is interpolated as `?${V}`, so it emitted
// `?v83`, with no '=', which is not the `?v=N` param every other page and
// every check in this repo uses. Found by mutation testing site-health, not
// by reading: no version-shaped regex can match the string 'v83'.
const V = `v=${siteVersion()}`;

// The 9-phase construction order (mirrors knowledge/sewing-guide.md section 2).
const ORDER = [
  ['Prep', 'Check the calibration square, cut every piece as labelled (on fold / cut 2), muslin first if the fit matters.'],
  ['Stabilise', 'Staystitch curved raw edges so they cannot stretch; fuse interfacing to facings, collars and plackets while flat.'],
  ['Shape', 'Sew the darts or princess seams and form the gathers first, while each panel is still flat and single.'],
  ['Flat add-ons', 'Work plackets, keyholes and back cutouts before the side seams close the garment into a tube.'],
  ['Neck finish', 'Sew the shoulders, then attach and understitch the facing, set the collar, or run the binding while it still opens flat.'],
  ['Close the tube', 'Sew the side seams, set in the sleeves, add the straps.'],
  ['Skirt + join', 'Sew the skirt (leave the centre back open for the zipper), join it to the bodice at the waist matching side seams.'],
  ['Closure', 'Insert the invisible zipper before closing the seam below it; sew and catch the ties at their notch.'],
  ['Hem last', 'Try it on, mark, then hem; a half-circle hangs 24 h first so the bias drops before you cut it even.'],
];

// The four fabric profiles (mirrors section 1 of the knowledge base).
const FABRIC = {
  structured: {
    want: 'a medium, crisp woven that holds its shape',
    why: 'The fitted seams and the stand-away shape read as clean lines only if the cloth holds them; a fluid fabric goes limp and the fitted lines collapse.',
    families: 'cotton poplin, linen, wool suiting or gabardine',
    ask: 'medium weight, crisp, holds a fold (about 150 to 250 g/m²)',
    tradeoff: 'crisp cloth creases (linen especially) and needs pressing as you go.',
  },
  fluid: {
    want: 'a light, fluid woven that pours',
    why: 'The fall of the cloth IS the design here; a crisp poplin would stand out in a stiff bell instead of flowing close to the body.',
    families: 'viscose or rayon, crepe, cotton lawn',
    ask: 'light weight, fluid, drapes (about 80 to 140 g/m²)',
    tradeoff: 'fluid cloth shifts while you cut and sew, so cut single layer and use a walking foot.',
  },
  gathered: {
    want: 'a soft-medium woven with body but movement',
    why: 'Gathers and babydoll fullness need enough body to fill out but enough softness to fall; too crisp and they jut like cardboard, too heavy and they sag at the seam.',
    families: 'cotton lawn, voile, chambray, soft crepe',
    ask: 'light to medium, soft with a little body',
    tradeoff: 'get the weight wrong and the gathers either stick out or drag the seam down.',
  },
  tailored: {
    want: 'a crisp, medium woven that presses sharp',
    why: 'The collar stand and the placket fold need a fabric that takes a hard press; a soft viscose collar will not stand up.',
    families: 'cotton poplin, shirting, linen',
    ask: 'medium weight shirting, crisp, presses flat',
    tradeoff: 'interfacing matters as much as the cloth: fuse a crisp interfacing to the collar and placket.',
  },
};

// The pages. profile picks the fabric block; steps = the phase indices that
// actually apply to this garment (so the order reads true, not padded).
const PAGES = [
  {
    slug: 'choosing-fabric',
    title: 'Choosing fabric: weight and drape',
    h1: ['Which fabric, ', 'and why.'],
    lead: 'The question is never which fabric in the abstract; it is which fabric for THIS shape. Two levers decide it, weight and drape, and one rule ties them to the pattern.',
    kind: 'pillar-fabric',
  },
  {
    slug: 'construction-order',
    title: 'The order to sew, and why',
    h1: ['Build flat, ', 'close last.'],
    lead: 'Every garment follows the same nine-phase order. It is not arbitrary: each step is done at the last moment it is still easy, while the piece is still open and flat.',
    kind: 'pillar-order',
  },
  {
    slug: 'fitted-dress',
    title: 'How to sew a fitted dress',
    h1: ['A fitted dress, ', 'sewn.'],
    lead: 'Princess or dart shaping, a natural waist, clean fitted lines. The fabric holds the fit; the order keeps the seams crisp.',
    profile: 'structured',
    steps: [0, 1, 2, 4, 5, 6, 7, 8],
    tips: [
      'Press each dart toward the centre; a dart pressed the wrong way shows a ridge on the outside.',
      'On a princess seam, clip the side panel curve over the bust inside the seam allowance so it lies flat.',
      'Understitch the neckline facing so it rolls to the inside and never peeks out.',
    ],
    cta: '../create.html?garment=dress&shaping=princess&skirtStyle=aLine',
  },
  {
    slug: 'babydoll-dress',
    title: 'How to sew a babydoll / gathered dress',
    h1: ['A babydoll dress, ', 'sewn.'],
    lead: 'An empire waist that sits under the bust, a gathered skirt, maybe a ruffle. The fullness IS the look, so the fabric and the gathering technique carry it.',
    profile: 'gathered',
    steps: [0, 1, 2, 4, 5, 6, 8],
    tips: [
      'Gather with two rows of long stitches, not one; pull both together so the gathers stay even and the thread does not snap.',
      'Distribute the fullness evenly along the seam, then pin at the quarter points before sewing.',
      'The empire seam sits right under the bust; join the bodice to the skirt there, matching side seams.',
    ],
    cta: '../create.html?garment=dress&waistline=empire&skirtStyle=gathered',
  },
  {
    slug: 'a-line-skirt',
    title: 'How to sew an A-line or straight skirt',
    h1: ['A skirt, ', 'sewn.'],
    lead: 'A shape that stands away from the body. The whole job is a crisp cloth that holds the flare, a short flat-then-close order, and the walking vent if you want to stride.',
    profile: 'structured',
    steps: [0, 1, 2, 5, 7, 8],
    tips: [
      'Sew the darts first while the panels are flat, then the side seams.',
      'Bar-tack the top of a walking vent so the centre-back seam cannot tear open above it.',
      'Interface the waistband; a soft waistband rolls and gapes.',
    ],
    cta: '../create.html?garment=skirt&skirtStyle=aLine',
  },
  {
    slug: 'collared-top',
    title: 'How to sew a collared / button top',
    h1: ['A collared top, ', 'sewn.'],
    lead: 'A collar stand and a button placket only stand up on a fabric that presses sharp. The cloth matters, and the interfacing matters just as much.',
    profile: 'tailored',
    steps: [0, 1, 2, 3, 4, 5, 8],
    tips: [
      'Fuse a crisp interfacing to the collar and the placket stand before you sew them; that is what holds them up.',
      'A womenswear front laps right over left; the buttonholes go on the right front, the buttons under the left.',
      'Place a mandatory button at the bust level so the front cannot gape open.',
    ],
    cta: '../create.html?garment=top&collarType=shirt&frontPlacket=true',
  },
];

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function head(p) {
  const url = `https://stitchu.noseydewdrop.com/guide/${p.slug}.html`;
  const desc = esc(p.lead);
  const ld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: p.title, description: p.lead,
    author: { '@type': 'Organization', name: 'stitchu' },
    publisher: { '@type': 'Organization', name: 'stitchu' },
    mainEntityOfPage: url, inLanguage: 'en',
  });
  const crumb = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'stitchu', item: 'https://stitchu.noseydewdrop.com/' },
      { '@type': 'ListItem', position: 2, name: 'Sewing guide', item: 'https://stitchu.noseydewdrop.com/guide/' },
      { '@type': 'ListItem', position: 3, name: p.title, item: url },
    ],
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%272%27 fill=%27%231f3a5f%27/%3E%3Cline x1=%276%27 y1=%2716%27 x2=%2726%27 y2=%2716%27 stroke=%27%23fff%27 stroke-width=%273%27 stroke-dasharray=%275 4%27/%3E%3C/svg%3E">
<title>${esc(p.title)} · stitchu</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="stitchu">
<meta property="og:title" content="${esc(p.title)} · stitchu">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://stitchu.noseydewdrop.com/assets/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://stitchu.noseydewdrop.com/assets/og-card.png">
<meta name="twitter:title" content="${esc(p.title)} · stitchu">
<meta name="twitter:description" content="${desc}">
<link rel="stylesheet" href="../css/theme-transitions.css?${V}">
<link rel="stylesheet" href="../css/shared-header.css?${V}">
<link rel="stylesheet" href="../css/shared-button.css?${V}">
<script type="application/ld+json">${crumb}</script>
<script type="application/ld+json">${ld}</script>
<style>
  :root{ --bb:#8fbfe8; --bb-deep:#3f74a8; --bb-pale:#dceaf7; --bb-line:#bcd7ee; --navy:#1f3a5f; --ink:#2b4a6b; --visne:#8f2038; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Helvetica,Arial,sans-serif;color:var(--navy);background:#fff;line-height:1.55;overflow-x:hidden}
  a{color:var(--bb-deep)}
  .brandpatch{position:relative;display:inline-block;box-sizing:border-box;padding:4px 12px;background:#1f3a5f;border:1px solid #1f3a5f;border-radius:2px;font-family:'Didot','Bodoni 72',Georgia,serif;font-weight:400;font-size:22px;letter-spacing:.5px;line-height:1;color:#fff;text-decoration:none;white-space:nowrap;vertical-align:middle;transition:background .18s}
  .brandpatch::after{content:"";position:absolute;inset:4px;border:1.5px dashed rgba(255,255,255,.85);border-radius:2px;opacity:.9;pointer-events:none;transition:inset .18s}
  .brandpatch:hover{background:#2b4f7a}
  .sh-nav a:hover,.sh-nav a.sh-active{border-bottom-color:var(--bb-deep)}
  .wrap{max-width:840px;margin:0 auto;padding:14px 32px 90px}
  .crumbs{font-size:12px;color:#5b7089;letter-spacing:.4px;margin-bottom:20px}
  .crumbs a{text-decoration:none;color:var(--bb-deep)}
  h1{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:38px;line-height:1.14;font-weight:400;margin:10px 0 14px;max-width:24ch;color:var(--navy)}
  h1 em{font-style:italic}
  .lead{font-size:15px;color:var(--ink);max-width:64ch;margin-bottom:34px}
  h2{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:24px;font-weight:400;margin:40px 0 12px;color:var(--navy)}
  .fact{font-size:13.5px;color:var(--ink);max-width:66ch;margin-bottom:12px}
  table{border-collapse:collapse;width:100%;font-size:13.5px;background:#fff;border:1px solid var(--bb-line);border-radius:3px;overflow:hidden;margin-top:6px;max-width:66ch}
  th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--bb-line);color:var(--ink)}
  th{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--navy);background:var(--bb-pale)}
  td.k{color:var(--navy);font-weight:700;white-space:nowrap;vertical-align:top}
  ol.steps{margin:8px 0 6px 20px;max-width:66ch}
  ol.steps li{font-size:13.5px;color:var(--ink);margin-bottom:9px;padding-left:4px}
  ol.steps li b{color:var(--navy)}
  ul.tips{margin:8px 0 6px 20px;max-width:66ch}
  ul.tips li{font-size:13.5px;color:var(--ink);margin-bottom:8px}
  .actions{margin-top:36px;display:flex;align-items:baseline;flex-wrap:wrap;gap:16px}
  .cta2{display:inline-block;font-size:13px;letter-spacing:.4px;color:var(--bb-deep);text-decoration:none;border-bottom:1px dashed var(--bb);padding-bottom:2px}
  .cta2:hover{border-bottom-color:var(--bb-deep)}
  .also{font-size:13px;margin-top:14px;color:var(--ink)}
  footer{padding:26px 40px;font-size:12px;color:#5b7089;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;border-top:1px solid var(--bb-line);margin-top:40px}
  footer a{color:var(--navy);text-decoration:none}
</style>
</head>
<body>
<header class="sh-header">
  <a class="brandpatch" href="../index.html">stitchu</a>
  <nav class="sh-nav">
    <a href="../create.html" data-en="Create" data-tr="Çiz">Create</a>
    <a href="index.html" class="sh-active" data-en="guide" data-tr="rehber">guide</a>
    <a href="../styles/index.html" data-en="styles" data-tr="stiller">styles</a>
    <a href="../benchmark.html" data-en="Benchmark" data-tr="Kıyaslama">Benchmark</a>
    <a href="../patches.html" data-en="Patch Notes" data-tr="Yama Notları">Patch Notes</a>
    <a href="../api.html" data-en="API" data-tr="API">API</a>
    <span class="sh-lang"><button id="lang-en">EN</button><span>·</span><button id="lang-tr">TR</button></span>
  </nav>
</header>
<div class="wrap">
  <p class="crumbs"><a href="../index.html">stitchu</a> / <a href="index.html">sewing guide</a> / ${esc(p.title.toLowerCase())}</p>
  <h1>${esc(p.h1[0])}<em>${esc(p.h1[1])}</em></h1>
  <p class="lead">${esc(p.lead)}</p>`;
}

function fabricBlock(profileKey) {
  const f = FABRIC[profileKey];
  return `
  <h2>Which fabric, and why.</h2>
  <p class="fact">For this shape, look for ${esc(f.want)}. ${esc(f.why)}</p>
  <table>
    <tr><th>what</th><th>which</th></tr>
    <tr><td class="k">families</td><td>${esc(f.families)}</td></tr>
    <tr><td class="k">ask for</td><td>${esc(f.ask)}</td></tr>
    <tr><td class="k">trade-off</td><td>${esc(f.tradeoff)}</td></tr>
  </table>
  <p class="fact" style="margin-top:12px">Preshrink a natural fibre (cotton, linen) before cutting; it shrinks in the first wash, and an un-preshrunk garment comes out a size small.</p>`;
}

function orderBlock(stepIdx) {
  const rows = stepIdx.map((i) => {
    const [name, note] = ORDER[i];
    return `    <li><b>${esc(name)}.</b> ${esc(note)}</li>`;
  }).join('\n');
  return `
  <h2>The order it comes together.</h2>
  <p class="fact">Build flat for as long as you can: every seam is easier to sew and press while the piece is still open. Close it into a tube (side seams, sleeves) only near the end.</p>
  <ol class="steps">
${rows}
  </ol>`;
}

function tipsBlock(tips) {
  const rows = tips.map((t) => `    <li>${esc(t)}</li>`).join('\n');
  return `
  <h2>Sewing tips for this garment.</h2>
  <ul class="tips">
${rows}
  </ul>`;
}

function foot(p, ctaHref, ctaLabel) {
  return `
  <div class="actions">
    <a class="sb-btn sb-primary" href="${ctaHref}">${esc(ctaLabel)}</a>
    <a class="cta2" href="index.html">Back to the sewing guide →</a>
  </div>
  <p class="also">Every fabric fact is sourced (Extension fibre guides); the order is the standard tailoring sequence from Aldrich, Armstrong and the Reader's Digest guide. When the engine cannot draft a detail it says so on the <a href="../patches.html">result and the patch notes</a>, never a silent guess.</p>
</div>
<footer>
  <span>stitchu · the pattern-making engine</span>
  <span><a href="../index.html">home</a> · <a href="index.html">sewing guide</a> · <a href="../styles/index.html">styles</a> · <a href="../privacy.html">privacy</a></span>
</footer>
<script src="../js/shared-header.js?${V}"></script>
</body>
</html>
`;
}

let n = 0;
for (const p of PAGES) {
  let body = head(p);
  if (p.kind === 'pillar-fabric') {
    body += `
  <h2>The one rule.</h2>
  <p class="fact">A silhouette that STANDS AWAY from the body wants a fabric that holds its shape: crisp, medium weight. A silhouette that FALLS CLOSE to the body wants a fabric that drapes: fluid, light weight. Gathers and full skirts are the middle case, a soft-medium with body but movement.</p>
  <p class="fact"><b>Weight (gramaj)</b> is how heavy the cloth is, in grams per square metre. Light is about 80 to 140, medium 150 to 250, heavy 250 and up. <b>Drape</b> is how it falls under its own weight, set by weight and weave together.</p>`;
    for (const key of ['structured', 'fluid', 'gathered', 'tailored']) {
      const f = FABRIC[key];
      const label = { structured: 'Standing-away shapes (fitted bodice, A-line, tailored skirt)', fluid: 'Falling-close shapes (drapey dress, half-circle, cowl)', gathered: 'Gathered / babydoll / empire', tailored: 'Collared / plackets / tailored' }[key];
      body += `
  <h2>${esc(label)}.</h2>
  <p class="fact">Look for ${esc(f.want)}. ${esc(f.why)}</p>
  <table>
    <tr><th>what</th><th>which</th></tr>
    <tr><td class="k">families</td><td>${esc(f.families)}</td></tr>
    <tr><td class="k">ask for</td><td>${esc(f.ask)}</td></tr>
    <tr><td class="k">trade-off</td><td>${esc(f.tradeoff)}</td></tr>
  </table>`;
    }
    body += `
  <p class="fact" style="margin-top:14px">Knit fabric is the exception: a stable ponte for structure, a soft jersey for a close fit. The pattern is drafted with less ease because the cloth stretches, and it needs a ballpoint needle and a stretch or zigzag stitch.</p>`;
    body += foot(p, '../create.html', 'Draft a pattern, true-scale A4, free');
  } else if (p.kind === 'pillar-order') {
    body += orderBlock([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    body += `
  <h2>Why the order matters.</h2>
  <p class="fact">Every step is done at the last moment it is still easy. Set a sleeve after the side seam is closed and you fight a tube. Sew a dart after the side seam and you cannot press it open cleanly. Hem before the seams settle and the hemline goes wavy. The whole sequence is one idea: stay flat, close last, hem after it hangs.</p>`;
    body += foot(p, '../create.html', 'Draft a pattern, true-scale A4, free');
  } else {
    body += fabricBlock(p.profile);
    body += orderBlock(p.steps);
    body += tipsBlock(p.tips);
    body += foot(p, p.cta, 'Print this pattern, true-scale A4, free');
  }
  writeFileSync(join(OUT, `${p.slug}.html`), body);
  n++;
}
console.log(`gen-guide: wrote ${n} pages to web/guide/`);
