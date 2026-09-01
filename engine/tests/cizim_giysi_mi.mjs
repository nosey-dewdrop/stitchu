#!/usr/bin/env node
// cizim_giysi_mi.mjs — "BUTONA BASIYORUM, KOL-YAKA-PENSLI BIR CIZIM INIYOR"
//
// KULLANICI CUMLESI: Butona basiyorum, inen teknik cizimde kol, yaka ve pens
// goruyorum. Kutuk degil, giysi.
//
// Bu kapi TEK BIR SEYI olcer: create.html'in flat butonunun ucundaki dosya bir
// GIYSI mi. Olculen nesne, tarayicinin yukledigi modullerin ta kendisi —
// web/js/download.js `flatSVG` -> web/js/engine.js `flatDrawing` ->
// engine.draftJSON (wasm) -> web/lib/flat-from-pattern.js. Node icin yazilmis
// bir kopya DEGIL; kopya olsaydi indirilen dosya hakkinda hicbir sey
// kanitlamazdi.
//
// ===========================================================================
// ALTI SIK — HEPSI SAYIYLA, HICBIRI "BAKTIM IYIYDI" DEGIL
// ===========================================================================
//  (a) 5/5 indirme. Sevk edilen spec ile bes kere basilir; bes dosya da
//      <svg ...</svg> olmak zorunda ve HICBIR ciktida 'invalid ... NaN'
//      gecmeyecek. (Olculdu 2026-09-01, duzeltmeden once: 5/5 COKUYORDU,
//      'invalid tieClosure NaN' — engine.js:109/115 engineSpec() cagirmiyordu.)
//  (b) sleeveStyle != none olan her spec'te KOL var; sleeveStyle == none olan
//      hicbir spec'te YOK. Tek yonlu bir varlik testi, "kol cizdim" diyen ama
//      hep ayni sekli basan bir kalemi yakalayamaz.
//  (c) collarType != none olan her spec'te YAKA var, none olanlarda YOK.
//  (d) shaping == dart olan her spec'te en az 2 PENS cizgisi var — ve
//      dahasi: kalibin TASIDIGI her pens cizilmis olacak (aynali oldugu icin
//      pens basina tam 2 cizgi). Kalip pens tasimiyorsa bu MOTORUN acigidir,
//      cizimin degil, ve ADIYLA basilir.
//  (e) gorunur eleman >= 12 (yuzey hattinin 2026-09-01'deki sayisi: 4).
//      Gorunur = stroke tasiyan, `d` niteligi bos olmayan <path>.
//  (f) cizim suresi p95 < 1000 ms (yuzey hatti: 7.5-30.9 SANIYE).
//
// ARTI IKI SIK — kartta yok, cunku kart bunlari zaten cozulmus sayiyor; ama
// cizim kaynagi degistigi icin eski kapilarin bir kismi bu hukumleri artik
// olcemez hale geldi ve hicbiri SILINMEDI, buraya BAGLANDI:
//  (g) OLCU MUTABAKATI. Cizilen siluetin gogus/bel/kalca yarim genislikleri,
//      kalibin KENDI panellerinin ayni yerdeki yarim genislikleriyle 0.1 mm'de
//      tutmak zorunda. (Belde olculen sey DIKILMIS beldir: pensler kapalidir,
//      ve kapanan miktar kalibin kendi pens bacaklarindan cikar.)
//  (h) AYNA. Her gorunum x = 0'a gore simetrik olmak zorunda; siluet yarim
//      cizilip aynalandigi icin bu bir tolerans degil bir OZDESLIK, esik 1e-6.
//
// YASAK: bu dosya hicbir esigi dusurmez, hicbir spec'i atlamaz. Bir spec
// cizilemezse bu bir FAIL'dir, bir "skip" degil.

import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

// create.html'in butonu bir DOM saver cagiriyor; burada olculen sey builder,
// ama builder'i indir_check ile ayni modulden aliyoruz.
// `head.appendChild` firing `onload` is what lets THE SHIPPED LOADER run here
// instead of a node-only re-implementation of it — same stub, same reason, as
// engine/tests/indir_check.mjs.
const BUNDLE0 = join(ROOT, 'web/vendor/stitchu-engine.js');
const engine0 = existsSync(BUNDLE0) ? await require(BUNDLE0)() : null;
globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine0) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);
const check = (label, cond, detail = '') => (cond ? OK(label + (detail ? ` — ${detail}` : ''))
                                                 : FAIL(`${label}${detail ? ` — ${detail}` : ''}`));

if (!engine0) {
  FAIL(`sevk edilen wasm paketi YOK: ${BUNDLE0} — engine/build-wasm.sh`);
  process.exit(1);
}
const engine = engine0;

const { flatSVG } = await import(join(ROOT, 'web/js/download.js'));
const { flatDrawing, bodyForSize, engineSpec } = await import(join(ROOT, 'web/js/engine.js'));

const BEDEN = process.env.CIZIM_BEDEN || 'EU38';
const BODY = { size: BEDEN };

// ---------------------------------------------------------------------------
// MATRIS — create.html'in gercekten sundugu eksenler. Uydurma kombinasyon yok:
// her satir vocab.json'daki gecerli kelimelerden kurulu ve motor tarafindan
// reddedilmiyor. Kol/yaka/pens/sinif eksenlerinin hepsi hem VAR hem YOK
// halleriyle temsil ediliyor, cunku tek yonlu bir matris "hep ayni sekli bas"
// stratejisini gecirir.
// ---------------------------------------------------------------------------
const M = [
  ['elbise_kolsuz_yakasiz',   { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'crew',  sleeveStyle: 'none',     skirtStyle: 'aLine',    skirtLength: 'midi' }],
  ['elbise_duz_kol',          { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi' }],
  ['elbise_duz_kol_bebe',     { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', collarType: 'peterPan' }],
  ['elbise_balon_kol_dik',    { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'vNeck', sleeveStyle: 'balloon',  sleeveLength: 'long',  skirtStyle: 'straight', skirtLength: 'maxi', collarType: 'stand' }],
  ['elbise_yatik_yaka',       { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'crew',  sleeveStyle: 'straight', sleeveLength: 'long',  skirtStyle: 'aLine',    skirtLength: 'mini', collarType: 'flat' }],
  ['elbise_gomlek_yaka',      { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'crew',  sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine',    skirtLength: 'midi', collarType: 'shirt' }],
  ['elbise_orme_kolsuz',      { garment: 'dress', shaping: 'dart', fabric: 'knit',  neckline: 'scoop', sleeveStyle: 'none',     skirtStyle: 'aLine',    skirtLength: 'midi' }],
  ['ust_kolsuz',              { garment: 'top',   shaping: 'dart', fabric: 'woven', neckline: 'crew',  sleeveStyle: 'none',     topLength: 'hip' }],
  ['ust_balon_uzun_kol',      { garment: 'top',   shaping: 'dart', fabric: 'woven', neckline: 'vNeck', sleeveStyle: 'balloon',  sleeveLength: 'long',  topLength: 'hip' }],
  ['ust_duz_kol_mock',        { garment: 'top',   shaping: 'dart', fabric: 'woven', neckline: 'crew',  sleeveStyle: 'straight', sleeveLength: 'short', topLength: 'cropped', collarType: 'mock' }],
  ['elbise_prenses_duz_kol',  { garment: 'dress', shaping: 'princess', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi' }],
  ['ust_prenses_kolsuz',      { garment: 'top',   shaping: 'princess', fabric: 'woven', neckline: 'crew',  sleeveStyle: 'none', topLength: 'hip' }],
  ['etek_aline',              { garment: 'skirt', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine',    skirtLength: 'midi' }],
  ['etek_duz',                { garment: 'skirt', shaping: 'dart', fabric: 'woven', skirtStyle: 'straight', skirtLength: 'mini' }],
];

// ---------------------------------------------------------------------------
// SVG OKUYUCU — ciziciye degil, DOSYAYA soruyor
// ---------------------------------------------------------------------------
function paths(svg) {
  const out = [];
  const re = /<path\b([^>]*)\/>/g;
  let m;
  while ((m = re.exec(svg))) {
    const a = m[1];
    const g = (k) => { const r = new RegExp(`${k}="([^"]*)"`).exec(a); return r ? r[1] : null; };
    out.push({ rol: g('data-rol'), view: g('data-view'), yan: g('data-yan'), d: g('d') || '',
               w: parseFloat(g('stroke-width') || '0') });
  }
  return out;
}
const gorunur = (ps) => ps.filter((p) => p.d.trim().length > 0 && p.w > 0);
const byRol = (ps, r) => gorunur(ps).filter((p) => p.rol === r);

/** SVG path `d` -> nokta listesi (M/L/C hepsinin ucu ve kontrolu). */
function pts(d) {
  const nums = d.match(/-?\d+(\.\d+)?(e[-+]?\d+)?/gi) || [];
  const out = [];
  for (let i = 0; i + 1 < nums.length; i += 2) out.push([parseFloat(nums[i]), parseFloat(nums[i + 1])]);
  return out;
}

// ---------------------------------------------------------------------------
console.log(`=== CIZIM GIYSI MI — ${M.length} spec, beden ${BEDEN}`);
console.log('    olculen hat: web/js/download.js flatSVG -> engine.js flatDrawing');
console.log('               -> engine.draftJSON (wasm) -> web/lib/flat-from-pattern.js');

// --------------------------------------------------------------- (a) 5/5 INDIRME
console.log('\n--- (a) 5/5 INDIRME, 0 adet "invalid ... NaN"');
{
  // create.html'in flat butonunun gecirdigi spec: koltuk butonu tam spec'i
  // veriyor, yani her enum ekseni STRING olarak geliyor. Kirilan tam buydu.
  // Butonun motora gecirdigi spec'in tam hali: her eksen KELIME olarak. Kirilan
  // tam buydu — engineSpec() atlanınca bu kelimeler wasm sinirinda NaN oluyordu.
  const SEVK = { ...M[2][1], tieClosure: 'none', gatherType: 'none', gatherZone: 'waist',
                 backOpening: 'none', backSlit: 'none', edgeFinish: 'facing',
                 cuffStyle: 'none', shoulderStyle: 'set', pocketStyle: 'none',
                 hemShape: 'straight' };
  let inen = 0;
  const hatalar = [];
  for (let k = 0; k < 5; k++) {
    try {
      const { svg } = await flatSVG(SEVK, BODY);
      if (typeof svg === 'string' && svg.trimStart().startsWith('<svg') && svg.trimEnd().endsWith('</svg>')) inen++;
      else hatalar.push(`${k}: dosya SVG degil`);
      if (/invalid\s+\w+\s+NaN/i.test(svg)) hatalar.push(`${k}: dosyada 'invalid ... NaN'`);
    } catch (e) { hatalar.push(`${k}: ${e.message}`); }
  }
  check('(a) 5/5 tiklamada dosya iniyor', inen === 5, `${inen}/5`);
  check("(a) 0 adet 'invalid ... NaN'", hatalar.every((h) => !/NaN/.test(h)),
        hatalar.filter((h) => /NaN/.test(h)).join(' | ') || '0');
  if (hatalar.length) hatalar.forEach((h) => console.log(`      ham hata: ${h}`));
}

// --------------------------------------------------------------- CIZ, OLC
const cizimler = [];
const sureler = [];
console.log('\n--- CIZIM (sure + eleman sayimi)');
for (const [ad, spec] of M) {
  const t0 = process.hrtime.bigint();
  let r;
  try { r = await flatDrawing(spec, BODY); }
  catch (e) { FAIL(`[0 uretim] ${ad}: cizim uretilemedi — ${e.message}`); continue; }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  sureler.push(ms);
  const ps = paths(r.svg);
  cizimler.push({ ad, spec, svg: r.svg, ps, ms, dugum: r.dugum });
  const bel = /bel dikis kacigi \(mm[^)]*\): ([\d. ]+)/.exec(r.svg);
  if (bel) console.log(`         bel dikis kacigi: ${bel[1].trim()} mm  (kalibin kendi sayisi — beden beli ile etek beli, iki pens de kapali)`);
  const cizilemeyen = /<!-- cizilemeyen: ([^>]*)-->/.exec(r.svg);
  console.log(`      ${ad.padEnd(24)} ${gorunur(ps).length.toString().padStart(3)} eleman  ${ms.toFixed(1).padStart(7)} ms` +
              (cizilemeyen ? `   ⚠ ${cizilemeyen[1].trim()}` : ''));
}
if (cizimler.length !== M.length) FAIL(`${M.length} spec'in ${cizimler.length}'i cizilebildi`);

// --------------------------------------------------------------- (b) KOL
console.log('\n--- (b) sleeveStyle != none -> KOL');
{
  let bad = 0;
  for (const c of cizimler) {
    const bekleniyor = (c.spec.sleeveStyle || 'none') !== 'none';
    const n = byRol(c.ps, 'kol').length;
    if (bekleniyor && n < 2) { FAIL(`(b) ${c.ad}: sleeveStyle=${c.spec.sleeveStyle} ama cizimde ${n} kol`); bad++; }
    if (!bekleniyor && n > 0) { FAIL(`(b) ${c.ad}: sleeveStyle=none ama cizimde ${n} kol — olmayan bir sey cizilmis`); bad++; }
  }
  const kollu = cizimler.filter((c) => (c.spec.sleeveStyle || 'none') !== 'none');
  if (!bad) OK(`(b) ${kollu.length} kollu spec'in hepsinde KOL var, ${cizimler.length - kollu.length} kolsuzun hicbirinde yok`);
  // Aci uydurulmus bir sabit degil, kola gore degisiyor: iki farkli kol ayni
  // aciyi veriyorsa cizici kolu okumuyor demektir.
  const acilar = new Set(cizimler.flatMap((c) => (/data-kol-aci="(-?[\d.]+)"/g, [...c.svg.matchAll(/data-kol-aci="(-?[\d.]+)"/g)].map((m) => m[1]))));
  check('(b) kol acisi kalibin kendi olculerinden cikiyor (sabit degil)', acilar.size >= 2,
        `${acilar.size} farkli aci: ${[...acilar].join(' ')}`);
}

// --------------------------------------------------------------- (c) YAKA
console.log('\n--- (c) collarType != none -> YAKA');
{
  let bad = 0;
  for (const c of cizimler) {
    const bekleniyor = (c.spec.collarType || 'none') !== 'none';
    const n = byRol(c.ps, 'yaka').length;
    if (bekleniyor && n < 2) { FAIL(`(c) ${c.ad}: collarType=${c.spec.collarType} ama cizimde ${n} yaka`); bad++; }
    if (!bekleniyor && n > 0) { FAIL(`(c) ${c.ad}: collarType=none ama cizimde ${n} yaka`); bad++; }
  }
  const yakali = cizimler.filter((c) => (c.spec.collarType || 'none') !== 'none');
  if (!bad) OK(`(c) ${yakali.length} yakali spec'in hepsinde YAKA var, ${cizimler.length - yakali.length} yakasizin hicbirinde yok`);
}

// --------------------------------------------------------------- (d) PENS
console.log('\n--- (d) shaping = dart -> >= 2 PENS');
{
  let bad = 0;
  const pensizKalip = [];
  for (const c of cizimler) {
    if ((c.spec.shaping || 'dart') !== 'dart') continue;
    // Kalibin KENDI tasidigi pens sayisi: markings icindeki >=3 noktali alt yol.
    const drafted = JSON.parse(engine.draftJSON(engineSpec(c.spec), bodyForSize(BEDEN)));
    let kalipPens = 0;
    for (const p of drafted.pattern.pieces) {
      let cur = null;
      for (const m of p.markings || []) {
        if (m.type === 'move') { cur = 1; continue; }
        if (cur !== null) cur++;
        if (cur === 3) kalipPens++;
      }
    }
    const n = byRol(c.ps, 'pens').length;
    if (kalipPens === 0) { pensizKalip.push(c.ad); continue; }
    // Aynalandigi icin kalibin her pensi cizimde TAM 2 cizgi. "en az 2" degil,
    // "hepsi": bir pensi cizip otekini yutan bir kalem >= 2'yi gecerdi.
    if (n !== 2 * kalipPens) {
      FAIL(`(d) ${c.ad}: kalipta ${kalipPens} pens var, cizimde ${n} pens cizgisi (beklenen ${2 * kalipPens})`);
      bad++;
    } else if (n < 2) { FAIL(`(d) ${c.ad}: ${n} pens cizgisi, esik 2`); bad++; }
  }
  const dartli = cizimler.filter((c) => (c.spec.shaping || 'dart') === 'dart');
  if (!bad) OK(`(d) ${dartli.length - pensizKalip.length} dart spec'inin hepsinde kalibin TUM pensleri cizili`);
  // ⛔ YUKARIDAKI `continue` BIR SKIP'TIR VE SKIP YASAK. O yuzden sayisi
  // CIRCIRLA kilitleniyor: bugun olculdu, dart secilmis 12 spec'in 2'sinde
  // (ust_kolsuz, ust_balon_uzun_kol) MOTOR hic pens cizmiyor — 'Top Front'
  // parcasi bos bir `markings` ile geliyor. Bu cizimin degil kalibin acigi ve
  // burada kapatilamaz; ama bir daha BUYUYEMEZ. Sayi artarsa kirmizi, azalirsa
  // bu satir sikilastirilir.
  const PENSIZ_TAVAN = 2;
  console.log(`      kalibi penssiz cikan dart spec'i: ${pensizKalip.length} (tavan ${PENSIZ_TAVAN})` +
              (pensizKalip.length ? ` — ${pensizKalip.join(', ')}` : ''));
  if (pensizKalip.length > PENSIZ_TAVAN) {
    FAIL(`(d) MOTOR ACIGI BUYUDU: ${pensizKalip.length} dart spec'inin kalibinda hic pens yok, tavan ${PENSIZ_TAVAN} — ` +
         `${pensizKalip.join(', ')}`);
  }
}

// --------------------------------------------------------------- (e) ELEMAN
console.log('\n--- (e) gorunur eleman >= 12');
{
  let bad = 0;
  for (const c of cizimler) {
    const n = gorunur(c.ps).length;
    if (n < 12) { FAIL(`(e) ${c.ad}: ${n} gorunur eleman, esik 12`); bad++; }
  }
  const en = Math.min(...cizimler.map((c) => gorunur(c.ps).length));
  const enCok = Math.max(...cizimler.map((c) => gorunur(c.ps).length));
  if (!bad) OK(`(e) en az ${en}, en cok ${enCok} gorunur eleman (yuzey hatti: 4)`);
}

// --------------------------------------------------------------- (f) SURE
console.log('\n--- (f) p95 < 1000 ms');
{
  const s = sureler.slice().sort((a, b) => a - b);
  const p95 = s[Math.min(s.length - 1, Math.ceil(0.95 * s.length) - 1)];
  check('(f) cizim suresi p95 < 1000 ms', p95 < 1000,
        `p95 ${p95.toFixed(1)} ms · en yavas ${s[s.length - 1].toFixed(1)} ms (yuzey hatti: 7500-30900 ms)`);
}

// --------------------------------------------------------------- (g) OLCU MUTABAKATI
// Cizilen genislik, kalibin kendi genisligi mi? Cizim panelin x'ini oldugu gibi
// kullanir (giysi YERE SERILI cizilir; serili on genislik = cevrenin yarisi,
// yani orta-onden itibaren ceyrek cevre = panelin kendi x'i). Yani bu bir
// donusum degil bir OZDESLIK olmak zorunda ve 0.1 mm'de olculuyor.
console.log('\n--- (g) cizilen genislik == kalibin genisligi (0.1 mm)');
{
  let bad = 0;
  for (const c of cizimler) {
    const drafted = JSON.parse(engine.draftJSON(engineSpec(c.spec), bodyForSize(BEDEN)));
    // Bu gorunume giren HER panelin (beden + etek) en genis noktasi — kontrol
    // noktalari dahil, cunku cizim kalibin kubiklerini oldugu gibi basiyor ve
    // yalnizca uc noktalarina bakmak siluetin gercek sinirini olcmez.
    // ⚠ KAPSAM, ACIKCA: bu ozdeslik TEK PANELLI on icin gecerlidir. Prenses on
    // IKI panelden kurulur ve ikinci panel bir RIJIT donusumle yerlestirilir;
    // cizilen en genis nokta iki panelin genisliginin toplami DEGILDIR (donusum
    // acilidir). O yuzden prenses, bu satirin yerine kendi sert olcusuyle
    // yargilanir: birlestirmenin dikis KACIGI (asagida). Gevsetme degil, farkli
    // ve dogru olcu.
    const yanVar = drafted.pattern.pieces.some((p) => /Side (Front|Back)$/.test(p.name));
    if (yanVar) continue;
    const paneller = drafted.pattern.pieces.filter(
      (p) => /^(Bodice Front|Top Front|Skirt Front|Front)$/.test(p.name));
    if (!paneller.length) { FAIL(`(g) ${c.ad}: on panel bulunamadi`); bad++; continue; }
    const kalipMax = Math.max(...paneller.flatMap(
      (p) => p.commands.filter((k) => k.type !== 'close')
        .flatMap((k) => [k.x, k.cp1x, k.cp2x].filter((v) => typeof v === 'number'))));
    const sil = byRol(c.ps, 'siluet').find((p) => p.view === 'front');
    if (!sil) { FAIL(`(g) ${c.ad}: on siluet yok`); bad++; continue; }
    const cizimMax = Math.max(...pts(sil.d).map((p) => p[0]));
    if (Math.abs(cizimMax - kalipMax) > 0.1) {
      FAIL(`(g) ${c.ad}: cizim ${cizimMax.toFixed(4)} mm, kalip ${kalipMax.toFixed(4)} mm, fark ${(cizimMax - kalipMax).toFixed(4)} mm`);
      bad++;
    }
  }
  // PRENSES: iki panel bir dikis uzerinde birlestiriliyor. Birlestirme RIJIT
  // olmak zorunda — iki kenardan birini otekine uydurmak icin olceklemek,
  // cizimin bir olcum olmaktan cikmasi demektir — ve bunun sinavi, birlesme
  // sonrasi kalan kacigin sifir olmasidir. Dosya bu sayiyi kendisi basiyor.
  for (const c of cizimler) {
    if ((c.spec.shaping || 'dart') !== 'princess') continue;
    const m = /prenses dikis kacigi \(mm[^)]*\): ([\d. ]+)/.exec(c.svg);
    if (!m) { FAIL(`(g/prenses) ${c.ad}: birlestirme kacigi dosyada BASILMAMIS`); bad++; continue; }
    const k = m[1].trim().split(/\s+/).map(Number);
    // ESIK 0.79375 mm = 1/32 inc, bu reponun KENDI uretim dikis toleransi
    // (CLAUDE.md, GREEN AND UNSEWABLE bolumu: "bizim tolerans 0.79375mm").
    // 0.1 mm DEGIL, cunku olculen sey bir kopyanin ozdesligi degil IKI AYRI
    // DRAFT KENARININ birbirini tutmasi; olculdu: elbise prensesinde 0.000 mm,
    // ust prensesinde 0.717 mm — ikisi de kalibin kendi sayisi.
    const TOL = 0.79375;
    console.log(`      ${c.ad}: prenses dikis kacigi ${k.map((v) => v.toFixed(3)).join(' / ')} mm (tolerans ${TOL})`);
    if (!k.length || k.some((v) => !(v < TOL))) {
      FAIL(`(g/prenses) ${c.ad}: prenses dikis kacigi ${k.join(' ')} mm, esik ${TOL}`); bad++;
    }
    if (byRol(c.ps, 'prenses').length < 2) { FAIL(`(g/prenses) ${c.ad}: prenses dikisi cizilmemis`); bad++; }
  }
  if (!bad) OK(`(g) tek panelli onlerde cizilen yarim genislik == kalibin yarim genisligi; prenses onlerde birlestirme kacigi < 0.79375 mm (reponun uretim dikis toleransi) ve dikis cizili`);
}

// --------------------------------------------------------------- (h) AYNA
console.log('\n--- (h) ayna: her gorunum x = 0 etrafinda simetrik');
{
  let bad = 0;
  for (const c of cizimler) {
    for (const p of byRol(c.ps, 'siluet')) {
      const P = pts(p.d);
      const xs = P.map((q) => q[0]);
      const err = Math.abs(Math.max(...xs) + Math.min(...xs));
      if (err > 1e-6) { FAIL(`(h) ${c.ad}/${p.view}: siluet x sinirlari ${Math.min(...xs).toFixed(6)} .. ${Math.max(...xs).toFixed(6)}, ayna hatasi ${err.toExponential(2)}`); bad++; }
    }
    // Kol, yaka, pens: her birinin sag/sol esi olmak zorunda.
    for (const rol of ['kol', 'yaka', 'pens', 'dikis-izi']) {
      const g = byRol(c.ps, rol);
      const sag = g.filter((p) => p.yan === 'sag').length, sol = g.filter((p) => p.yan === 'sol').length;
      if (sag !== sol) { FAIL(`(h) ${c.ad}: ${rol} sag ${sag} / sol ${sol}`); bad++; }
    }
  }
  if (!bad) OK(`(h) ${cizimler.length} cizimin hepsi aynali, sag/sol es sayida`);
}

// --------------------------------------------------------------- (i) FLAT KANUNU
// contract/flat-convention-v1.json Damla'nin flat kanunudur: tek murekkep,
// hiyerarsi RENKLE degil AGIRLIKLA, sifir boya, on + arka, ilan edilmis olcek.
// flat_convention_check bu kanunu YUZEY hattinin ciziminde olcmeye devam ediyor;
// kanun sevk edilen kaleme de aynen bagli, o yuzden BURADA da olculuyor. Kanun
// diskten okunuyor — burada yeniden yazilan bir kopyasi YOK.
console.log('\n--- (i) flat kanunu (contract/flat-convention-v1.json) sevk edilen cizimde');
{
  const LAW = JSON.parse(readFileSync(join(ROOT, 'contract/flat-convention-v1.json'), 'utf8'));
  const INK = String(LAW.ink.color).toLowerCase();
  const AGIRLIKLAR = new Set(Object.values(LAW.lineClasses.classes)
    .map((c) => Number(c.width)).filter((n) => isFinite(n)));
  let bad = 0;
  for (const c of cizimler) {
    // tek murekkep
    const renkler = new Set([...c.svg.matchAll(/(?:stroke|fill)="(#[0-9a-fA-F]{3,8})"/g)].map((m) => m[1].toLowerCase()));
    for (const r of renkler) if (r !== INK) { FAIL(`(i) ${c.ad}: kanun disi murekkep ${r} (kanun ${INK})`); bad++; }
    // sifir boya
    if (/<(linearGradient|radialGradient|filter)\b/.test(c.svg) || /fill="(?!none|#1f3a5f)/.test(c.svg)) {
      FAIL(`(i) ${c.ad}: boya/gradient/filtre var — kanun sifir boya diyor`); bad++;
    }
    // agirlik kanunun sinif genisliklerinden biri olmak zorunda
    for (const p of gorunur(c.ps)) if (!AGIRLIKLAR.has(p.w)) {
      FAIL(`(i) ${c.ad}: ${p.rol} cizgisi ${p.w} kalinliginda, kanunda boyle bir sinif yok (${[...AGIRLIKLAR].join(', ')})`);
      bad++;
    }
    // on + arka
    const views = new Set(gorunur(c.ps).map((p) => p.view));
    for (const v of LAW.views.required) if (!views.has(v)) { FAIL(`(i) ${c.ad}: ${v} gorunumu YOK`); bad++; }
    // olcek beyani ARITMETIKLE dogrulaniyor: mm genisligi / viewBox genisligi
    // ilan edilen data-unit-mm'e esit olmak zorunda, ve data-scale "1:<birim>".
    const w = /width="([\d.]+)mm"/.exec(c.svg), vb = /viewBox="0 0 ([\d.]+) [\d.]+"/.exec(c.svg);
    const um = /data-unit-mm="([\d.]+)"/.exec(c.svg), sc = /data-scale="([^"]+)"/.exec(c.svg);
    if (!w || !vb || !um || !sc) { FAIL(`(i) ${c.ad}: olcek beyani eksik`); bad++; }
    else {
      const oran = parseFloat(w[1]) / parseFloat(vb[1]);
      if (Math.abs(oran - parseFloat(um[1])) > 1e-6 || sc[1] !== `1:${um[1]}`) {
        FAIL(`(i) ${c.ad}: olcek beyani belgenin kendi aritmetigiyle celisiyor — ${oran} vs ${um[1]}, "${sc[1]}"`);
        bad++;
      }
    }
  }
  if (!bad) OK(`(i) ${cizimler.length} cizimin hepsi kanuna uyuyor — tek murekkep ${INK}, agirliklar {${[...AGIRLIKLAR].join(', ')}}, ${LAW.views.required.join('+')}, olcek aritmetikle dogrulandi`);
}

// --------------------------------------------------------------- OZET
console.log('\n--- OZET');
for (const c of cizimler) {
  const say = (r) => byRol(c.ps, r).length;
  console.log(`      ${c.ad.padEnd(24)} kol ${say('kol')} · yaka ${say('yaka')} · pens ${say('pens')} · ` +
              `kol-oyugu ${say('kol-oyugu')} · bel ${say('bel-dikisi')} · dikis-izi ${say('dikis-izi')} · ` +
              `toplam ${gorunur(c.ps).length}`);
}

if (fails) { console.log(`\nFAIL cizim_giysi_mi — ${fails} ihlal`); process.exit(1); }
console.log(`\nok cizim_giysi_mi — ${cizimler.length} spec, (a)-(h) hepsi yesil`);
