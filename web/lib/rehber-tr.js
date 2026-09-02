// rehber-tr.js — F9: the Turkish sewing guide the shopper takes home NEXT TO
// the A4 pattern pack and the flat. One pure function, string in / string out,
// so engine/tests/uctan_uca_check.mjs runs the exact bytes the download hands
// over (the same law download.js lives under: builders pure, savers DOM).
//
// EVERY SENTENCE HAS A NAMED SOURCE — "kaynaksiz tavsiye cumlesi 0" is not a
// review note here, it is the construction: the guide is assembled ONLY from
//   1. the engine's own drafted numbers (seam allowance mm, cut list, fabric
//      meters) — the pattern is the source, printed verbatim;
//   2. the engine's own guideSteps, translated through web/js/guide-tr.js
//      (the same table render.js shows on screen);
//   3. web/data/sewing-guide.json fabric profiles (source field inside the
//      file: NMSU/SDSU/UKY Extension + Reader's Digest/Aldrich/Armstrong);
//   4. contract/fabric-catalog-v1.json numbers via web/js/fabric-catalog.js
//      (each number carries the seller page in GIRDI/kumaslar.md).
// What none of those sources can answer is DECLARED by name with the next
// step, never filled from thin air (RULES invariant 1): the five catalog
// bolts have NO published needle/stitch measurement for wovens, so the
// needle section for a woven says KAYNAK-YOK and tells the sewist what to do
// about it, instead of inventing a number.

import { GUIDE_TR } from '../js/guide-tr.js?v=141';
import { FABRIC_CATALOG } from '../js/fabric-catalog.js?v=141';
import { fabricProfile } from '../js/sewing.js?v=141';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The one sourced needle/stitch sentence in the repo is for KNITS (engine's own
// guide step, mirrored in web/data/fabrics.json jersey entry, UNL NF00-415 via
// its source field). For a woven there is no published needle number in any
// catalog file — declared, not defaulted.
function igneBlok(cls, kaynakEtiketi) {
  if (cls === 'knit') {
    return {
      html: `<p>${esc(GUIDE_TR['Knit fabric: sew with a narrow zigzag or stretch stitch and a ballpoint/stretch needle so the seams stretch with the fabric.'])}</p>
<p class="kaynak">kaynak: motorun kendi dikiş adımı (web/js/guide-tr.js) · web/data/fabrics.json "jersey (knit)" (UNL Extension NF00-415)</p>`,
    };
  }
  return {
    html: `<p><strong>KAYNAK-YOK:</strong> ${esc(kaynakEtiketi)} için yayınlanmış bir iğne/dikiş ölçümü repodaki hiçbir katalogda yok
(contract/fabric-catalog-v1.json bu kumaş için iğne alanı taşımıyor; GIRDI/kumaslar.md satıcı sayfaları iğne yayınlamıyor).
Uydurma sayı basılmadı.</p>
<p><strong>Sonraki adım:</strong> makinenin kendi kılavuzundaki dokuma ayarıyla, gerçek kumaşın bir artığında deneme dikişi yap;
dikiş kumaşı büzüyor ya da atlıyorsa iğneyi kılavuzdaki bir sonraki numaraya taşı. Kalıbın kendi adımları (aşağıdaki inşa sırası) dikişin NEREYE atılacağını tarif ediyor.</p>`,
  };
}

/**
 * The whole guide as a self-contained HTML document (printable, offline).
 * @param {object} p        drafted pattern (engine draftJSON .pattern)
 * @param {object} spec     the site spec the pattern was drafted from
 * @param {string} fabricId key into FABRIC_CATALOG ('cotton-lawn', ...)
 * @param {object} guideData web/data/sewing-guide.json (caller loads it — the
 *                           browser fetches, node reads; the builder stays pure)
 * @param {object} opts     { baslik, beden, kokenSatiri }
 */
export function rehberHTML(p, spec, fabricId, guideData, opts = {}) {
  if (!p || !Array.isArray(p.pieces) || !p.pieces.length) {
    throw new Error('rehber: no drafted pieces — a guide for a blocked draft would be a lie');
  }
  const preset = FABRIC_CATALOG[fabricId];
  if (!preset) {
    throw new Error(`rehber: unknown fabric '${fabricId}' (valid: ${Object.keys(FABRIC_CATALOG).join(', ')})`);
  }
  const saMM = Math.round(p.pieces[0].seamAllowance);
  const beden = opts.beden || 'EU38';
  const baslik = opts.baslik || p.garment;
  const profile = fabricProfile(spec);
  const logic = guideData && guideData.fabricLogic && guideData.fabricLogic[profile]
    ? guideData.fabricLogic[profile].tr : null;
  const guideKaynak = (guideData && guideData._source) || '';

  // 3. inşa sırası — the engine's own steps, Turkish through the shipped table.
  // An untranslated step is shipped in English rather than paraphrased: a
  // paraphrase would be a sentence with no source.
  const adimlar = (p.guideSteps || []).map((s, i) =>
    `<li>${esc(GUIDE_TR[s] || s)}</li>`).join('\n');

  // 4. kesim planı — verbatim from the drafted pieces.
  const kesim = p.pieces.map((pc) =>
    `<tr><td>${esc(pc.name)}</td><td>${esc(pc.cutInstruction)}</td></tr>`).join('\n');

  const igne = igneBlok(preset.cls, preset.trLabel);

  const kumasSatirlar = [
    `<tr><td>kumaş</td><td>${esc(preset.trLabel)}</td></tr>`,
    `<tr><td>ağırlık</td><td>${preset.fabricWeightGSM} g/m²</td></tr>`,
    `<tr><td>top eni</td><td>${preset.fabricWidthCM} cm</td></tr>`,
    `<tr><td>esneme</td><td>${preset.fabricStretchPct >= 0 ? preset.fabricStretchPct + ' %' : 'ÖLÇÜLMEDİ'}</td></tr>`,
    `<tr><td>gereken kumaş</td><td>${p.fabricMeters140} m (140 cm ende, motorun kendi yerleşiminden)</td></tr>`,
  ].join('\n');

  return `<!doctype html>
<html lang="tr">
<meta charset="utf-8">
<title>${esc(baslik)} — dikiş rehberi (${esc(beden)})</title>
<style>
  body { max-width: 720px; margin: 40px auto; padding: 0 20px;
         font: 15px/1.55 -apple-system, system-ui, sans-serif; color: #1f3a5f; }
  h1 { font-weight: 500; font-size: 26px; }
  h2 { font-weight: 600; font-size: 14px; letter-spacing: .12em; text-transform: uppercase; margin-top: 36px; }
  table { border-collapse: collapse; width: 100%; }
  td { border-top: 1px solid #e2e2de; padding: 6px 10px 6px 0; vertical-align: top; }
  ol li { margin: 8px 0; }
  .kaynak { color: #666; font-size: 12.5px; }
  .sa { background: #f7f1e2; padding: 10px 14px; }
  @media print { body { margin: 10mm auto; } }
</style>
<h1>${esc(baslik)} — dikiş rehberi</h1>
<p class="kaynak">${esc(beden)} · ${p.pieces.length} parça · ${p.fabricMeters140} m kumaş (140 cm en)${opts.kokenSatiri ? ' · ' + esc(opts.kokenSatiri) : ''}</p>

<h2>Dikiş payı</h2>
<p class="sa"><strong>dikiş payı ${saMM} mm — kesim çizgisine DAHİL.</strong>
DIŞ çizgiden kes, içteki ince çizgiden dik. Bu sayı kalıbın kendi geometrisinden okunur
(her parçanın <code>seamAllowance</code> alanı), ayrı bir tablodan değil.</p>

<h2>Kumaş${logic ? ' — neden bu kumaş?' : ''}</h2>
<table>
${kumasSatirlar}
</table>
<p class="kaynak">sayıların kaynağı: contract/fabric-catalog-v1.json → GIRDI/kumaslar.md (her sayının yanında yayınlayan satıcı sayfası; ölçülmemiş alan ÖLÇÜLMEDİ etiketi taşır)</p>
${logic ? `<p><strong>Bu kesim ne ister?</strong> ${esc(logic.want)} — ${esc(logic.why)}</p>
<p><strong>Mağazada iste:</strong> ${esc(logic.ask)}. Aileler: ${esc(logic.families)}.</p>
<p><strong>Bedeli:</strong> ${esc(logic.tradeoff)}</p>
<p class="kaynak">kaynak: web/data/sewing-guide.json (${esc(guideKaynak)})</p>` : ''}

<h2>İğne ve dikiş tipi</h2>
${igne.html}

<h2>Kesim planı</h2>
<table>
${kesim}
</table>
<p class="kaynak">kesim talimatları motorun kendi parça listesinden, kelimesi kelimesine.</p>

<h2>İnşa sırası</h2>
<ol>
${adimlar}
</ol>
<p class="kaynak">her adım motorun kendi dikiş talimatı (engine guideSteps), Türkçesi web/js/guide-tr.js tablosundan; tabloda olmayan adım UYDURULMAZ, İngilizce basılır.</p>
</html>
`;
}
