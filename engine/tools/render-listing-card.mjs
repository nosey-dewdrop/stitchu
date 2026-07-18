// render-listing-card.mjs — one self-contained Etsy-style listing card SVG per
// pattern, composed 100% from what the engine already produces: the pattern's
// style name (typography), its technical flat (<slug>-flat.svg), its on-figure
// croquis (<slug>-figure.svg) as the photoless "worn" image, and honest badges
// (format / size range / paper / difficulty) derived from meta.
//
// Damla's insight: every slot of an Etsy pattern-listing card except the photo
// already exists inside stitchu. So the cover image is FREE — no Canva, no
// per-product design. renderListingCard(meta, {flatSvg, figureSvg}) -> SVG.
//
// Brand: navy (#1f3a5f) accent on a cream ground (#faf6ee). Display serif
// (Didot) for the product name, hairline small-caps for badges. No pink (that's
// what every Etsy seller uses; navy+cream is stitchu's differentiation). No real
// photos, ever — the on-figure croquis IS the illustrated stand-in.
//
// Output canvas: 1000 x 1250 portrait (a listing thumbnail aspect).

const NAVY = '#1f3a5f';
const DEEP = '#3f74a8';
const CREAM = '#ffffff';    // card ground (was cream, now plain white)
const CARD = '#ffffff';     // inner panel
const LINE = '#d8c9ae';      // warm hairline that reads on cream
const MUTE = '#6b5c40';      // warm muted ink for sub-labels

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Title-case a style name and give it a clean "The " prefix when it reads like a
// product name (skip when it already leads with "The"). Etsy names are short and
// proper: "The Lua Top". We keep the engine's honest style words but present them.
const MINOR = new Set(['a', 'an', 'and', 'the', 'of', 'to', 'in', 'on', 'with', 'for']);
function titleCase(s) {
  return s.split(' ').map((w, i) => w.split('-').map((seg) => {
    const low = seg.toLowerCase();
    if (i !== 0 && MINOR.has(low)) return low;
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  }).join('-')).join(' ');
}

// Pull the inner drawing out of a stitchu SVG so it can be nested: drop the
// outer <svg> wrapper and the white background rect (the card supplies its own
// ground), keep the viewBox so we can place it in its own coordinate box.
function extractInner(svg) {
  if (!svg) return { viewBox: '0 0 100 100', inner: '' };
  const vbMatch = svg.match(/viewBox="([^"]*)"/);
  const viewBox = vbMatch ? vbMatch[1] : '0 0 100 100';
  let inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  // Remove the full-canvas white background rect (fill #fff or #ffffff).
  inner = inner.replace(/<rect[^>]*fill="#f{3,6}"[^>]*\/>/i, '');
  return { viewBox, inner };
}

// Difficulty, derived honestly from piece count + construction features. This is
// the same logic a seller would use to tag a listing.
function difficulty(m) {
  const pieces = m.pieces || 0;
  const hasClosure = !!m.closure;
  const collar = /collar/i.test(m.style || '');
  const zip = /zip|invisible zipper/i.test(m.closure || '');
  if (pieces >= 8 || collar || zip) return { en: 'Intermediate', tr: 'Orta Seviye', stars: 3 };
  if (pieces >= 6 || hasClosure) return { en: 'Confident Beginner', tr: 'Cesur Başlangıç', stars: 2 };
  return { en: 'Beginner Friendly', tr: 'Başlangıç Dostu', stars: 1 };
}

// A filled navy pill badge (Title Case, small caps hairline label).
function pillFilled(x, y, w, h, label) {
  const cy = y + h / 2 + 5.5;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${NAVY}"/>
    <text x="${x + w / 2}" y="${cy}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="17" font-weight="600" letter-spacing="1.2" fill="${CREAM}">${esc(label)}</text>
  </g>`;
}

// A hairline-outlined pill badge (for the secondary spec chips).
function pillOutline(x, y, w, h, label) {
  const cy = y + h / 2 + 5;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="none" stroke="${NAVY}" stroke-width="1.4"/>
    <text x="${x + w / 2}" y="${cy}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="15.5" font-weight="600" letter-spacing="1" fill="${NAVY}">${esc(label)}</text>
  </g>`;
}

// Rough text width estimate for auto-sizing pills (Helvetica 15-17px caps).
function pillWidth(label, per = 10.5, pad = 34) {
  return Math.round(label.length * per + pad);
}

// Fit a display-serif product name to the card width by dropping font-size until
// it fits (single line preferred; the names are short "The X Top" forms).
function fitName(name, maxWidth, maxSize) {
  let size = maxSize;
  // Didot caps run ~0.56em average; be conservative so nothing clips.
  while (size > 34 && name.length * size * 0.54 > maxWidth) size -= 2;
  return size;
}

/**
 * renderListingCard(meta, assets) -> SVG string.
 * @param {object} meta      one entry from web/patterns/svg/meta.json
 * @param {object} assets    { flatSvg, figureSvg, sizeRange }
 */
export function renderListingCard(meta, assets = {}) {
  const W = 1000, H = 1250;
  const pad = 56;
  const inW = W - pad * 2;

  const rawName = titleCase(meta.style || meta.slug || 'Pattern');
  // "The X" prefix for a clean product feel, unless it already starts with The.
  const name = /^the /i.test(rawName) ? rawName : `The ${rawName}`;

  const sizeRange = assets.sizeRange || 'EU34-52';
  const diff = difficulty(meta);
  // The card shows only the pattern pieces (cutting layout) — no on-figure
  // croquis, no front/back technical flat.
  const { viewBox: piecesVB, inner: piecesInner } = extractInner(assets.piecesSvg);

  // ---- layout bands (top to bottom) ----
  // 1) brand corner + hairline rule
  // 2) product name (largest, display serif)
  // 3) format + size + paper badges row
  // 4) the "worn" panel: on-figure croquis (left) + technical flat (right)
  // 5) difficulty stars + footer line

  const brandY = 74;
  const ruleY = 104;
  const nameSize = fitName(name, inW, 92);
  const nameY = ruleY + 96;

  // Badge row: filled Format pill + outlined Size + outlined Paper.
  const badgeY = nameY + 44;
  const badgeH = 44;
  const fmtLabel = 'PDF Pattern';
  const sizeLabel = sizeRange;
  const paperLabel = 'A0 · A4 · Letter';
  const fmtW = pillWidth(fmtLabel, 10.5, 40);
  const sizeW = pillWidth(sizeLabel, 10.5, 40);
  const paperW = pillWidth(paperLabel, 9.5, 40);
  let bx = pad;
  const badges = [
    pillFilled(bx, badgeY, fmtW, badgeH, fmtLabel),
    (bx += fmtW + 14, pillOutline(bx, badgeY, sizeW, badgeH, sizeLabel)),
    (bx += sizeW + 14, pillOutline(bx, badgeY, paperW, badgeH, paperLabel)),
  ].join('\n');

  // ---- illustration panel ----
  const panelY = badgeY + badgeH + 34;
  const panelH = 720;
  const panelX = pad;
  const panelW = inW;

  // A single panel holding the nested pattern pieces (cutting layout),
  // centered and scaled to fit.
  const insetTop = 40, insetBot = 64, insetSide = 40;
  const [, , piecesWv, piecesHv] = piecesVB.split(/\s+/).map(Number);
  const boxW = panelW - insetSide * 2;
  const boxH = panelH - insetTop - insetBot;
  const piecesScale = Math.min(boxW / piecesWv, boxH / piecesHv);
  const piecesDrawW = piecesWv * piecesScale, piecesDrawH = piecesHv * piecesScale;
  const piecesInnerX = panelX + insetSide + (boxW - piecesDrawW) / 2;
  const piecesInnerY = panelY + insetTop + (boxH - piecesDrawH) / 2;

  // ---- difficulty + footer ----
  const footY = panelY + panelH + 62;
  const stars = '★★★'.slice(0, diff.stars) + '☆☆☆'.slice(0, 3 - diff.stars);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(name)} sewing pattern listing card">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="10" fill="${CARD}" stroke="${LINE}" stroke-width="1.5"/>

  <!-- brand corner -->
  <g transform="translate(${pad} ${brandY})">
    <text x="0" y="0" font-family="'Didot','Bodoni 72',Georgia,serif" font-size="30" fill="${NAVY}" letter-spacing="0.5">stitchu</text>
  </g>
  <g transform="translate(${W - pad} ${brandY})">
    <text x="0" y="0" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="14" letter-spacing="3" fill="${MUTE}">SEWING PATTERN</text>
  </g>
  <line x1="${pad}" y1="${ruleY}" x2="${W - pad}" y2="${ruleY}" stroke="${LINE}" stroke-width="1.5"/>

  <!-- product name (largest element, display serif) -->
  <text x="${pad}" y="${nameY}" font-family="'Didot','Bodoni 72',Georgia,serif" font-size="${nameSize}" font-weight="400" fill="${NAVY}">${esc(name)}</text>

  <!-- badges -->
  ${badges}

  <!-- illustration panel: the pattern pieces (cutting layout), no photo -->
  <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="8" fill="#fff" stroke="${LINE}" stroke-width="1.4"/>
  <text x="${panelX + panelW / 2}" y="${panelY + panelH - 30}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="13" letter-spacing="2.5" fill="${MUTE}">PATTERN PIECES</text>

  <svg x="${piecesInnerX}" y="${piecesInnerY}" width="${piecesDrawW}" height="${piecesDrawH}" viewBox="${piecesVB}" preserveAspectRatio="xMidYMid meet">${piecesInner}</svg>

  <!-- difficulty + footer -->
  <line x1="${pad}" y1="${footY - 34}" x2="${W - pad}" y2="${footY - 34}" stroke="${LINE}" stroke-width="1.5"/>
  <text x="${pad}" y="${footY}" font-family="Helvetica,Arial,sans-serif" font-size="22" letter-spacing="2" fill="${DEEP}">${stars}</text>
  <text x="${pad + 96}" y="${footY}" font-family="'Didot','Bodoni 72',Georgia,serif" font-size="24" fill="${NAVY}">${esc(diff.en)}</text>
  <text x="${W - pad}" y="${footY}" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="15" letter-spacing="1" fill="${MUTE}">Instant Download · ${meta.pieces || '?'} pieces</text>
</svg>`;
}

// TR label variants available for callers that render a Turkish card.
export const CARD_LABELS_TR = {
  format: 'PDF Kalıp',
  paper: 'A0 · A4 · Letter',
  instant: 'Anında İndirme',
  sewingPattern: 'DİKİŞ KALIBI',
  onFigure: 'ÜZERİNDE',
  technicalFlat: 'TEKNİK ÇİZİM',
  pieces: 'parça',
};
