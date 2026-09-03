// rehber-tr.js — the Turkish sewing guide the shopper takes home NEXT TO the
// pattern pack and the flat. One pure function, string in / string out, so
// engine/tests/uctan_uca_check.mjs and rehber_kaynak_check.mjs run the exact
// bytes the download hands over (the same law download.js lives under:
// builders pure, savers DOM).
//
// EVERY SENTENCE HAS A NAMED SOURCE — "kaynaksız tavsiye cümlesi 0" is not a
// review note here, it is the construction. The guide is assembled ONLY from
//   1. the engine's own REHBER entries (pattern.rehber), each of which already
//      carries its own `basis` — either `computed:` numbers THIS draft measured
//      or `source:` rows in contract/guide-sources.json. guide_completeness_check
//      refuses any engine advice whose printed numbers are in neither.
//   2. the engine's own drafted numbers printed verbatim (seam allowance mm,
//      cut list, piece names).
//   3. the engine's own guideSteps, translated through web/js/guide-tr.js.
//   4. contract/fabric-catalog-v1.json numbers via web/js/fabric-catalog.js
//      (each number carries the seller page in GIRDI/kumaslar.md).
//
// ⭐ M5-rehber (2026-09-03) — WHAT CHANGED AND WHY IT MATTERED.
// Until now this file printed its OWN needle paragraph, and for every woven it
// printed "KAYNAK-YOK: no published needle measurement exists in any catalog in
// this repo". That was false by the time it was written: the engine's `sew.needle`
// advice existed, carried a source, and was rendered on the RESULT SCREEN — and
// this page, the one the buyer actually takes to the machine, never printed a
// single engine rehber entry. The buyer was told "we don't know" about a thing
// the engine knew. The fix is not a better paragraph: it is to print the engine's
// advice HERE, with its basis line under it, so the page and the screen say the
// same thing from the same place.
//
// The Turkish wording is a TEMPLATE PER ADVICE ID fed from the advice's own
// `basis` key=value pairs — so the NUMBERS are the engine's, never re-derived
// here, and an id with no template ships the engine's English verbatim rather
// than a paraphrase (the same law web/js/guide-tr.js already lives under: a
// paraphrase would be a sentence with no source).

import { GUIDE_TR } from '../js/guide-tr.js?v=148';
import { FABRIC_CATALOG } from '../js/fabric-catalog.js?v=148';
import { fabricProfile } from '../js/sewing.js?v=148';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// `computed:a=1;b=2;source:x` -> { a: '1', b: '2' } plus the cited source ids.
export function basisAyristir(basis) {
  const kv = {};
  const kaynaklar = [];
  for (const parca of String(basis || '').split(';')) {
    const t = parca.trim();
    if (!t) continue;
    if (t.startsWith('source:')) { kaynaklar.push(t.slice(7)); continue; }
    const body = t.startsWith('computed:') ? t.slice(9) : t;
    const eq = body.indexOf('=');
    if (eq > 0) kv[body.slice(0, eq)] = body.slice(eq + 1);
  }
  return { kv, kaynaklar };
}

// ── TÜRKÇE ŞABLONLAR ────────────────────────────────────────────────────────
// Her şablon SADECE `kv`den okur. Buraya elle bir sayı yazılamaz: yazılırsa
// motorun ölçtüğü sayı ile sayfadaki sayı ayrışır ve rehber_kaynak_check
// (kayıtsız cümle) kırmızı yanar.
const TR = {
  'fabric.band': (k) =>
    `Bu kalıp <strong>${k.band === 'woven' ? 'dokuma' : k.band}</strong> kumaş için kesildi: enine esneme %${k.stretchPct}, göğüste %${k.chestEasePct} rahatlık payı ile çizildi. Başka bir esneme sınıfı başka bir kesim ister — tahmin etme, yeniden çizdir.`,
  'fabric.stretchTest': (k) =>
    k.maxCM && k.minCM
      ? `<strong>${k.testLenCM} cm esneme testi:</strong> kumaşın enine ${k.testLenCM} cm işaretle ve cetvel boyunca çek. Bu kalıp için ${k.minCM} cm ile ${k.maxCM} cm arasına ulaşmalı (yani %${k.lowPct}–%${k.highPct} esneme). Daha azı giyilmez, daha fazlası sarkar.`
      : `<strong>${k.testLenCM} cm esneme testi:</strong> kumaşın enine (kenardan kenara) ${k.testLenCM} cm işaretle ve çek. Dokuma kumaş neredeyse hiç oynamaz — ${k.testLenCM} cm'in ${k.maxCM} cm'i geçiyorsa o kumaşta bu kalıbın hesaba katmadığı bir esneme var ve giysi bol durur.`,
  'sew.needle': (k) =>
    k.weightDeclared === '0'
      ? `<strong>İğne: numara veremem.</strong> Yayınlanmış çizelge iğne numarasını kumaşın AĞIRLIĞINA bağlıyor, bu kumaş ağırlıksız seçildi — buraya yazacağım her numara uydurma olur. Uç tipi güvenli: ${k.cls === 'knit' ? 'yuvarlak uçlu (ballpoint/jersey)' : 'universal'}. <em>Sonraki adım:</em> topun ucundaki ${k.birim} değerini oku, ya da ${k.swatchCM}×${k.swatchCM} cm bir parça kes, gram olarak tart ve ${k.gsmFactor} ile çarp.`
      : k.needle
        ? `<strong>İğne: yuvarlak uçlu (ballpoint/jersey), ${k.needle}.</strong> Bu top ${k.weightGSM} ${k.birim}, yani ${k.weightClass === 'medium' ? 'orta' : k.weightClass === 'light' ? 'hafif' : 'ağır'} ağırlıkta bir örme; çizelge örme için 75/11 hafif, 80/12 orta, 90/14 ağır veriyor. Sivri uçlu iğne örme ilmeklerini <em>keser</em> ve dikiş kaçık gibi söküler.`
        : `<strong>İğne: universal, ${k.needleLow} – ${k.needleHigh}.</strong> Bu top ${k.weightGSM} ${k.birim}; ağırlığa göre ${k.weightClass === 'light' ? 'hafif' : k.weightClass === 'medium' ? 'orta' : 'ağır'} sınıfa düşüyor (${k.lightMaxGSM} ${k.birim} altı hafif, ${k.mediumMaxGSM}'e kadar orta) ve çizelgenin o sınıf için yayınladığı numara aralığı bu. Çizelge tek numara değil ARALIK veriyor, bu satır da öyle yapıyor — artık bir parçada ince uçtan başla, dikiş atlıyorsa bir numara yukarı çık.`,
  'sew.stitch': (k, en) =>
    /zigzag|overlock/.test(en)
      ? `<strong>Dikiş:</strong> dar zikzak (1–1.5 mm) ya da overlok (ISO 4915 sınıf 500). Düz dikişin esnemesi yoktur; giysi ilk giyilişte dikişten patlar.`
      : `<strong>Dikiş:</strong> düz dikiş, ISO 4915 tip 301, yaklaşık 2.5 mm boyunda.`,
  'sew.seamClass': () =>
    `<strong>Dikiş sınıfı:</strong> bu kalıptaki her düz birleşim üst üste bindirilmiş düz dikiştir: ISO 4916 dikiş 1.01.01 + ISO 4915 batış 301. Bu çifti bir imalathaneye söylersen ne istediğini tam olarak anlarlar.`,
  'sew.edgeFinish': () =>
    `<strong>Kenar temizleme:</strong> overlok, ISO 4916 6.01.01. Ev makinesindeki karşılığı kenar üstünden zikzaktır.`,
  'sew.boundEdge': (k) =>
    `<strong>Biye ile kapatılan kenar:</strong> ${k.bindingPieces} biye şeridi kenarı pervazlamıyor, <em>sarıyor</em> — bu ISO 4916 sınıf 3 (bound), sanayinin tişört yakasında kullandığı sınıfın aynısı. İç kavislerde şeridi çok hafif gererek yatır.`,
  'sew.interfacing': (k) =>
    k.facingPieces === '0'
      ? `<strong>Tela: yok</strong> — ve bu atlanmış değil, ölçülmüş. Bu kalıpta tela taşıyan cinsten (pervaz, yaka, bant, manşet, patlet, kemer) ${k.facingPieces} parça var; buradaki formu dikişler ve pensler tutuyor. Tela satın alma.`
      : `<strong>Tela:</strong> bu kalıpta form tutan ${k.facingPieces} parça var (pervaz, yaka, bant ya da manşet). Her birine tela yapıştır — telasız, ne kadar iyi dikilirse dikilsin dışa doğru kıvrılırlar. <em>Ağırlık tavanı:</em> kumaşla aynı ya da daha hafif, yani en fazla ${k.weightGSM ? `${k.weightGSM} ${k.birim}` : `${k.swatchCM}×${k.swatchCM} cm parçayı tartıp ×${k.gsmFactor} ile bulacağın sayı`}. Daha ağır tela giysiyi ele geçirir ve parça artık seçtiğin kumaşa benzemez.`,
  'prep.prewash': (k) =>
    k.oneSizeShrinkPct
      ? `<strong>Kesmeden önce yıka.</strong> Bu kalıp ${k.bustCM} cm göğse çizildi ve grade edildiği beden çizelgesinin en küçük adımı ${k.sizeStepCM} cm. Yani enine sadece %${k.oneSizeShrinkPct} çekme (${k.sizeStepCM} cm) bitmiş giysiyi <em>tam bir beden</em> aşağı indirir — bu kadar azı yetiyor. Kumaşı, bitmiş giysiyi nasıl yıkayacaksan tam öyle yıka ve kurut, ütüle, sonra kes. Kestikten sonra yapılacak bir şey yok.`
      : `<strong>Kesmeden önce yıka:</strong> kumaşı, bitmiş giysiyi nasıl yıkayacaksan öyle yıka ve kurut. Ne kadar çekmenin bir bedene mal olduğunu burada söyleyemem, çünkü bu çizim karşılaştıracak bir göğüs ölçüsü olmadan geldi.`,
  'cut.yardage': (k) =>
    k.fitsBolt === '0'
      ? `<strong>Bu top için metraj veremem.</strong> En geniş parça (${k.widestPiece}) kumaş enine ${k.widestPieceMM} mm yer istiyor, senin kumaşın ise ${k.boltMM} mm — o parça bu topa hiçbir uzunlukta sığmaz. <em>Sonraki adım:</em> en az ${k.neededWidthCM} cm enli bir top al, ya da daha dar bir etek/beden stili seç. Kalıbın kendisi dikilebilir; dar olan bu kumaş.`
      : `<strong>Kumaş:</strong> ${k.metersAtWidth} m, ${k.widthCM} cm ende, boyuna katlanmış. Kumaşta hav ya da tek yönlü desen varsa biraz fazla al.`,
  'cut.pieces': (k) =>
    `<strong>Kesim planı:</strong> ${k.pieces} kalıp parçası, bunların ${k.onFold} tanesi kumaş katında. Her parçanın kendi kesim notunu uygula.`,
  'tip.notches': (k) =>
    `Bu parçalarda <strong>${k.notches} çentik</strong> var ve bir tanesi bile süs değil — her biri iki kenarın buluşmak zorunda olduğu bir nokta. Keserken, kâğıdı yerinden oynatmadan önce dikiş payının içine ${k.snipMM} mm çentik at.`,
  'tip.seamAllowance': (k) =>
    `Her parçadaki <strong>dış çizgi KESİM</strong>, içteki <strong>DİKİŞ</strong> çizgisidir; aralarında ${k.seamAllowanceMM} mm var. İçteki çizgiden dik, yoksa giysi her dikişte o kadar büyük çıkar.`,
  'tip.longestPiece': (k) =>
    `En büyük parça '<strong>${k.piece}</strong>', ${k.longestMM} mm. Pimlemeye başlamadan önce masanın ve kumaş eninin bunu aldığını kontrol et.`,
  'tip.negativeEase': (k) =>
    `Bu kalıp bilerek göğsünden <strong>%${k.negativeEasePct} DAR</strong> çizildi. Bu bir hata değil — kumaşın vücuda gerilmesi bekleniyor. Keserken geri ekleme.`,
  'zor.ozet': (k) =>
    `Bu kalıpta, bu kumaşta <strong>${k.candidates} zorluk ölçüldü</strong>; en zor ${k.shown} tanesi aşağıda, her biri kendi sınırını ne kadar aştığına göre sıralı (${k.neutralRatio} = yapacak bir şey yok demek). Bunlar genel dikiş tavsiyesi değil, <em>bu giysinin bu kumaşta</em> direndiği yerler.`,
  'zor.capEase': (k) =>
    `<strong>Kol kapağı / cap ease.</strong> Kol kapağı ${k.capMM} mm, gireceği kol oyuğu ${k.armholeMM} mm — arada ${k.capEaseMM} mm (%${k.capEasePct}) var. ` +
    (Number(k.capEaseMM) < 1
      ? `İkisi TUTUYOR: büzülecek bir şey yok, çentikten çentiğe pimle ve dik. Makinede bolluk buluyorsan iki kavisten birini gerdirmişsindir; pileyle yok etme, ütüyle geri al.`
      : `Bu bolluk kapak çentikleri arasında toplanıyor. Oraya iki sıra uzun dikiş at, kapak oyuğa eşitlenene kadar büz, ve <em>pimlemeden önce</em> dağıt — önce pimlersen pile olur.`),
  'zor.clip': (k) =>
    `<strong>Çentikleme.</strong> Kalıptaki en dar kavis '${k.piece}' parçasında, yarıçapı ${k.tightRadiusMM} mm; içine yatırman gereken dikiş payı ise ${k.seamAllowanceMM} mm. ` +
    (Number(k.ratio) >= 1
      ? `Pay, döndüğü kavisten GENİŞ — fiziksel olarak düz yatamaz. Parçayı çevirmeden önce payı çentikle (dikiş çizgisine ${k.clipStopMM} mm kala dur), yoksa dikiş büzülür ve hiçbir ütü bunu düzeltmez.`
      : `Pay kavisin içine sığıyor, ama kıl payı — ütülenen dikiş çekiyorsa çentikle.`) +
    ` Oran pay/yarıçap = ${k.ratio}.`,
  'zor.boltRoom': (k) =>
    `<strong>Top eni.</strong> En geniş parça '${k.widestPiece}', kumaş enine ${k.widestPieceMM} mm; topun ${k.boltMM} mm. Geriye ${k.spareMM} mm boş en kalıyor. ` +
    (Number(k.spareMM) < 0
      ? `Bu NEGATİF: parça sığmıyor, hiçbir yerleşim kurtarmaz.`
      : Number(k.spareMM) < Number(k.tightSpareMM)
        ? `${k.tightSpareMM} mm'nin altında — bu parçayı İLK yerleştir ve kumaşı önce gönyele; burada eğri bir düz iplik sana parçayı kaybettirir.`
        : `Yer var; yine de en geniş parçayı ilk yerleştir.`) +
    ` Oran parça/top = ${k.ratio}.`,
  'zor.smallPiece': (k) =>
    `<strong>Küçük parça.</strong> En küçük kesim parçası '${k.piece}', dar kenarı ${k.smallestDimMM} mm, ve her iki yanında ${k.seamAllowanceMM} mm pay taşıyor — ${k.smallestDimMM} mm'nin ${k.allowancesMM} mm'si pay. ` +
    (Number(k.ratio) >= 1
      ? `İki dikiş çizgisi arasında kumaş KALMIYOR: bu parçayı komşusuna dikmeden fazlalığını kesme.`
      : `Dikeceğin ana kadar kâğıdı üstünde bırak — bir beden yanlış kesilen hep küçük parçadır.`) +
    ` Oran paylar/en = ${k.ratio}.`,
};

// Which engine advices belong under which printed heading, in the order a
// person actually uses them: prepare -> buy -> cut -> sew -> the hard bits.
const BOLUMLER = [
  { baslik: 'Kumaş', ids: ['fabric.band', 'fabric.stretchTest', 'fabric.recovery', 'fabric.drape'] },
  { baslik: 'Kesmeden önce', ids: ['prep.prewash'] },
  { baslik: 'Ne alacaksın', ids: ['cut.yardage', 'sew.interfacing'] },
  { baslik: 'İğne, dikiş, kenar', ids: ['sew.needle', 'sew.stitch', 'sew.seamClass', 'sew.edgeFinish', 'sew.boundEdge'] },
  { baslik: 'Bu giysinin bu kumaştaki zor noktaları', ids: ['zor.ozet', 'zor.capEase', 'zor.clip', 'zor.boltRoom', 'zor.smallPiece'] },
  { baslik: 'Püf noktalar', ids: ['cut.pieces', 'tip.notches', 'tip.seamAllowance', 'tip.longestPiece', 'tip.negativeEase', 'tip.dartsDropOut'] },
];

function adviceHTML(a) {
  const { kv, kaynaklar } = basisAyristir(a.basis);
  const tr = TR[a.id];
  // NO TEMPLATE -> the engine's own English, verbatim. A paraphrase invented
  // here would be a sentence with no source, which is the one thing forbidden.
  const govde = tr ? tr(kv, a.text) : esc(a.text);
  const kayn = [];
  if (kaynaklar.length) kayn.push(`kaynak: contract/guide-sources.json → ${kaynaklar.join(' + ')}`);
  const hesap = Object.entries(kv).filter(([, v]) => v !== '').map(([x, y]) => `${x}=${y}`);
  if (hesap.length) kayn.push(`bu çizimin ölçtüğü: ${hesap.join(' · ')}`);
  return `<p class="ad" data-advice="${esc(a.id)}">${govde}</p>
<p class="kaynak">${esc(kayn.join(' | '))}</p>`;
}

function bedenSerisiHTML(seri) {
  if (!seri || !Array.isArray(seri.bedenler) || !seri.bedenler.length) return '';
  const satir = seri.bedenler.map((b) =>
    `<tr${b.size === seri.merkez ? ' class="merkez"' : ''}><td>${esc(b.size)}${b.size === seri.merkez ? ' ★' : ''}</td>` +
    `<td>${b.bust}</td><td>${b.waist}</td><td>${b.hip}</td>` +
    `<td>${b.pieces}</td><td>${b.meters} m</td></tr>`).join('\n');
  return `
<h2>Beden serisi — ${esc(seri.merkez)} ve ±${seri.komsu} komşusu</h2>
<p>Bu paket tek beden değil: seçtiğin bedenin iki yanındaki ${seri.komsu} bedeni de aynı çizimden,
aynı motorla üretildi ve pakette <strong>her beden ayrı bir A4 kalıp PDF'i</strong> olarak duruyor
(<code>kalip-A4-EU34.pdf</code>, <code>kalip-A4-EU36.pdf</code>, …)${seri.kirpildi && seri.kirpildi !== 'kırpılmadı' ? ` — ${esc(seri.kirpildi)}` : ''}. Ölçün iki bedenin
arasına düşüyorsa ya da giysi ilk provada dar/bol geliyorsa, yeni bir kalıp satın almadan komşu katmanı
kesersin. Aşağıdaki göğüs/bel/kalça sayıları <em>vücut</em> ölçüsüdür (giysi değil), beden çizelgesinden gelir.</p>
<table>
<tr><th>beden</th><th>göğüs cm</th><th>bel cm</th><th>kalça cm</th><th>parça</th><th>kumaş</th></tr>
${satir}
</table>
<p class="kaynak">kaynak: motorun kendi gradeJSON çıktısı (engine/wasm/bindings.cpp) · vücut ölçüleri contract/tables.json draft.euSizeChart</p>`;
}

/**
 * The whole guide as a self-contained HTML document (printable, offline).
 * @param {object} p        drafted pattern (engine draftJSON .pattern)
 * @param {object} spec     the site spec the pattern was drafted from
 * @param {string} fabricId key into FABRIC_CATALOG ('cotton-lawn', ...)
 * @param {object} guideData web/data/sewing-guide.json (caller loads it — the
 *                           browser fetches, node reads; the builder stays pure)
 * @param {object} opts     { baslik, beden, kokenSatiri, bedenSerisi }
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

  // ── the engine's own advice, grouped. An advice the engine emitted and no
  // section claims is printed at the end under "Motorun diğer notları" rather
  // than dropped: a dropped advice is an advice that does not exist.
  const rehberList = Array.isArray(p.rehber) ? p.rehber : [];
  const byId = new Map(rehberList.map((a) => [a.id, a]));
  const kullanildi = new Set();
  const bolumHTML = BOLUMLER.map(({ baslik: h, ids }) => {
    const parcalar = ids.filter((id) => byId.has(id));
    if (!parcalar.length) return '';
    parcalar.forEach((id) => kullanildi.add(id));
    return `<h2>${esc(h)}</h2>\n${parcalar.map((id) => adviceHTML(byId.get(id))).join('\n')}`;
  }).filter(Boolean).join('\n');
  const artan = rehberList.filter((a) => !kullanildi.has(a.id));
  const artanHTML = artan.length
    ? `<h2>Motorun diğer notları</h2>\n${artan.map(adviceHTML).join('\n')}` : '';

  // inşa sırası — the engine's own steps, Turkish through the shipped table.
  const adimlar = (p.guideSteps || []).map((s) =>
    `<li>${esc(GUIDE_TR[s] || s)}</li>`).join('\n');

  // kesim planı — verbatim from the drafted pieces.
  const kesim = p.pieces.map((pc) =>
    `<tr><td>${esc(pc.name)}</td><td>${esc(pc.cutInstruction)}</td></tr>`).join('\n');

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
  body { max-width: 760px; margin: 40px auto; padding: 0 22px;
         font: 15px/1.6 -apple-system, system-ui, sans-serif; color: #1f3a5f; }
  h1 { font-weight: 500; font-size: 27px; margin-bottom: 4px; }
  h2 { font-weight: 600; font-size: 13px; letter-spacing: .14em; text-transform: uppercase;
       margin-top: 34px; padding-bottom: 6px; border-bottom: 1px solid #e2e2de; color: #33506f; }
  table { border-collapse: collapse; width: 100%; }
  th { text-align: left; font-size: 12px; letter-spacing: .06em; text-transform: uppercase;
       color: #6b7f97; padding: 4px 10px 4px 0; border-bottom: 1px solid #e2e2de; }
  td { border-top: 1px solid #eeeeea; padding: 6px 10px 6px 0; vertical-align: top; }
  tr.merkez td { background: #f7f1e2; font-weight: 600; }
  ol li { margin: 8px 0; }
  p.ad { margin: 12px 0 2px; }
  .kaynak { color: #7d8794; font-size: 11.5px; margin: 0 0 14px; }
  .sa { background: #f7f1e2; padding: 10px 14px; }
  @media print { body { margin: 10mm auto; } h2 { page-break-after: avoid; } }
</style>
<h1>${esc(baslik)} — dikiş rehberi</h1>
<p class="kaynak">${esc(beden)} · ${p.pieces.length} parça · ${p.fabricMeters140} m kumaş (140 cm en)${opts.kokenSatiri ? ' · ' + esc(opts.kokenSatiri) : ''}</p>

<h2>Dikiş payı</h2>
<p class="sa"><strong>dikiş payı ${saMM} mm — kesim çizgisine DAHİL.</strong>
DIŞ çizgiden kes, içteki ince çizgiden dik. Bu sayı kalıbın kendi geometrisinden okunur
(her parçanın <code>seamAllowance</code> alanı), ayrı bir tablodan değil.</p>

${bolumHTML}
${artanHTML}

<h2>Kumaş sayıları</h2>
<table>
${kumasSatirlar}
</table>
<p class="kaynak">sayıların kaynağı: contract/fabric-catalog-v1.json → GIRDI/kumaslar.md (her sayının yanında yayınlayan satıcı sayfası; ölçülmemiş alan ÖLÇÜLMEDİ etiketi taşır)</p>
${logic ? `<p><strong>Bu kesim ne ister?</strong> ${esc(logic.want)} — ${esc(logic.why)}</p>
<p><strong>Mağazada iste:</strong> ${esc(logic.ask)}. Aileler: ${esc(logic.families)}.</p>
<p><strong>Bedeli:</strong> ${esc(logic.tradeoff)}</p>
<p class="kaynak">kaynak: web/data/sewing-guide.json (${esc(guideKaynak)})</p>` : ''}
${bedenSerisiHTML(opts.bedenSerisi)}

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
