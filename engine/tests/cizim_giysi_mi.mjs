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
//      F6'dan beri ozdeslik DONUSUM ONCESI olculur: flat, ilan edilmis manken
//      donusumu tasir (contract/mannequin-chart-v1.json v2), kapi onu dosyanin
//      kendi ilanindan tersine cevirir; carpan ayrica manken_insan_ayrim_check
//      kapisinda kaynagina vurulur. Ayni beden verildiginde donusumden
//      arindirilmis cizim kalibin TA KENDISI olmak zorunda — 0.1 mm, gevseme yok.
//  (g2) UC-CIZGI MUTABAKATI (H3R): gogus/bel/kalca uc cizgide cizim ile
//      draftJSON kalibi <= 0.1 mm — bel PENS-KAPALI olculur ve kalip tarafinin
//      kapali olcumu bu dosyanin icinde, web/lib'e dokunmadan, draftJSON'un
//      kendi verisinden yeniden kurulur. Elbise + etek + top + orme dort
//      sinifin dordu de olculmek zorunda; bos gecen sinif KIRMIZI.
//  (h) AYNA. Her gorunum x = 0'a gore simetrik olmak zorunda; siluet yarim
//      cizilip aynalandigi icin bu bir tolerans degil bir OZDESLIK, esik 1e-6.
//
// YASAK: bu dosya hicbir esigi dusurmez, hicbir spec'i atlamaz. Bir spec
// cizilemezse bu bir FAIL'dir, bir "skip" degil.

import { createRequire } from 'node:module';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
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
  // BUZGULU KAPAK, IKI SATIR (M1-puf tur 2). Bu matriste `sleeveCap` ekseni HIC
  // yoktu: 14 spec'in hicbiri puf/yumusak kapak degildi, yani buzgu operatorunun
  // cizime ne yaptigini bu kapi hic gormedi — (j) poz kanunu ve (c) sleeveLaw
  // buzgulu kolu yargilamadan yesil yaniyordu. Bir elbise + bir ust, cunku iki
  // sinifin omuz/kol cercevesi ayri kod yolundan geciyor.
  ['elbise_puf_kol',          { garment: 'dress', shaping: 'dart', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', sleeveCap: 'puffed', skirtStyle: 'aLine', skirtLength: 'midi' }],
  ['ust_puf_kol',             { garment: 'top',   shaping: 'dart', fabric: 'woven', neckline: 'crew',  sleeveStyle: 'straight', sleeveLength: 'short', sleeveCap: 'puffed', topLength: 'cropped' }],
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
               w: parseFloat(g('stroke-width') || '0'),
               dash: g('stroke-dasharray'), attr: a,
               manken: g('data-manken-fark-ceyrek-mm') === null ? null : {
                 fark: parseFloat(g('data-manken-fark-ceyrek-mm')),
                 Wbel: parseFloat(g('data-manken-bel-yarim-mm')),
                 bustY: parseFloat(g('data-manken-bust-y')),
                 belY: parseFloat(g('data-manken-bel-y')),
                 kalcaY: parseFloat(g('data-manken-kalca-y')),
               } });
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

// F6-KONVANSIYON: cizim artik MANKEN donusumu tasiyor (flat 38 != kalip 38,
// contract/mannequin-chart-v1.json v2). Donusum dosyanin KENDI ustunde ilan
// edilir (siluet path'inin data-manken-* nitelikleri) ve buradaki hukumler
// "donusum ONCESI ozdeslik" olarak olculur: ilan edilen carpan m(y) = 1 +
// d(y)/Wbel tersine cevrilir, kalan her sey ayni 0.1 mm'de kalipla ayni olmak
// zorunda. Bu bir gevsetme DEGIL: carpanin kendisi ayrica hem kanuna (asagida)
// hem kaynak olcumune (engine/tests/manken_insan_ayrim_check.mjs) vurulur.
// FLAT-ESTETIK: sevk edilen cizimin poz/oran kanunu ayni kanun dosyasinin
// sevkPoz blogunda durur; (b) kol acisi bandini, (i) topstitch sinifini,
// (j) omuz/yaka bandlarini ORADAN okur — burada kopyasi yok.
const FLAT_LAW = JSON.parse(readFileSync(join(ROOT, 'contract/flat-convention-v1.json'), 'utf8'));
const MANKEN_LAW = JSON.parse(readFileSync(join(ROOT, 'contract/mannequin-chart-v1.json'), 'utf8'));
const MANKEN_FARK = MANKEN_LAW.v2.donusum.farkCeyrekMM;
function mankenTers(sil) {
  const m = sil && sil.manken;
  if (!m || !isFinite(m.fark) || m.fark === 0) return (p) => p;
  const dOf = (y) => {
    if (y >= m.kalcaY) return 0;
    if (y <= m.belY) {
      if (m.belY - m.bustY <= 1e-3) return m.fark;   // etek: tepe duz (bust == bel)
      return y <= m.bustY ? 0 : m.fark * (y - m.bustY) / (m.belY - m.bustY);
    }
    return m.fark * (m.kalcaY - y) / (m.kalcaY - m.belY);
  };
  return (p) => [p[0] / (1 + dOf(p[1]) / m.Wbel), p[1]];
}
// ilan zorunlu: kanunun farki sifir degilken on siluette ne donusum ilani ne de
// adli bir RED varsa, cizici donusumu SESSIZCE atlamis demektir — kirmizi.
function mankenIlanKontrol(ad, c, sil) {
  if (!MANKEN_FARK) return true;
  if (sil.manken) {
    if (Math.abs(sil.manken.fark - MANKEN_FARK) > 1e-9) {
      FAIL(`(manken) ${ad}: cizim fark ${sil.manken.fark} ilan ediyor, kanun ${MANKEN_FARK} diyor`);
      return false;
    }
    return true;
  }
  if (/manken donusumu:/.test(c.svg)) return true;   // adiyla reddedilmis
  FAIL(`(manken) ${ad}: kanunun farki ${MANKEN_FARK} ama on siluette ne data-manken-* ilani ne adli red var`);
  return false;
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

// --------------------------------------------------------------- (0b) YAN DIKIS ON/ARKA — OLCUM, HUKUM YOK
// F1 duzeltme turu (karar ajani 5a; F0 hakem ENGEL 1): flat'te on ve arka
// gorunum ayni bedende degildi (KAPI B dBel 16-100 mm). Kalip tarafinda ayni
// dikisin iki yakasi — on parcanin yan dikisi ile arka parcanin yan dikisi —
// esit uzunlukta mi? Bu satir yalniz OLCER (mm, panel bazinda) ve basar; hukum
// koymaz, cunku "once" sayisi F2 motoru degistirmeden ONCE alinmak zorundadir
// (HEDEF §3.3). 9 KOSU spec'inin sayisi contract/body-v1.json
// ayniInsan.once.yanDikisFark_mm'de durur; F2 sonrasi ayni satir tekrar okunur.
// Yan dikis tanimi kalibin kendi kenar dizisinden: bodice'ta kol oyugu
// rolunun (edgeRoles armhole_front/armhole_back) hemen ardindan gelen kenar
// (koltukalti -> bel), etekte bel ucundan (2. komut sonu) etek ucu kavisinden
// onceki kenara kadar (kalca -> etek ucu). Kavisler 64 adimla acilir.
{
  const { draft: draftJSON, bodyForSize } = await import(join(ROOT, 'web/js/engine.js'));
  const segLen = (cmds, i0, i1) => {
    let L = 0, cur = null;
    for (let i = 0; i <= i1 && i < cmds.length; i++) {
      const c = cmds[i];
      if (c.type === 'move') { cur = [c.x, c.y]; continue; }
      if (c.type === 'close' || !cur) continue;
      const nxt = [c.x, c.y];
      if (i >= i0) {
        if (c.type === 'curve') {
          let p = cur;
          for (let k = 1; k <= 64; k++) {
            const t = k / 64, u = 1 - t;
            const q = [u*u*u*cur[0] + 3*u*u*t*c.cp1x + 3*u*t*t*c.cp2x + t*t*t*nxt[0],
                       u*u*u*cur[1] + 3*u*u*t*c.cp1y + 3*u*t*t*c.cp2y + t*t*t*nxt[1]];
            L += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q;
          }
        } else L += Math.hypot(nxt[0] - cur[0], nxt[1] - cur[1]);
      }
      cur = nxt;
    }
    return L;
  };
  const yanDikis = (piece) => {
    const cmds = piece.commands || [];
    const arm = (piece.edgeRoles || []).find((r) => /^armhole_/.test(r.role));
    if (arm) return segLen(cmds, arm.last + 1, arm.last + 1);                 // govde: koltukalti -> bel
    // etek benzeri parca (kol oyugu yok): bel ucundan (2. komut sonu) en dis x'li koseye (etek ucu yani)
    let maxI = -1, maxX = -Infinity;
    cmds.forEach((c, i) => { if (c.type !== 'move' && c.type !== 'close' && c.x > maxX) { maxX = c.x; maxI = i; } });
    return maxI > 2 ? segLen(cmds, 2, maxI) : null;
  };
  console.log('\n--- (0b) yan dikis on - arka, mm (kalip parcasi; OLCUM, hukum yok)');
  const satirlar = [];
  const z = (v) => (Math.abs(v) < 0.05 ? 0 : v);
  for (const [ad, spec] of M) {
    let d;
    try { d = await draftJSON(spec, bodyForSize(BEDEN)); } catch (e) { console.log(`      ${ad.padEnd(24)} kalip alinamadi — ${e.message}`); continue; }
    const pieces = (d.pattern && d.pattern.pieces) || [];
    const parts = [];
    for (const pf of pieces) {
      if (!/Front/.test(pf.name)) continue;
      const pb = pieces.find((q) => q.name === pf.name.replace('Front', 'Back'));
      if (!pb) continue;
      const etiket = pf.name.replace(/\s*Front\s*/, ' ').trim().toLowerCase() || 'govde';
      const lf = yanDikis(pf), lb = yanDikis(pb);
      if (lf == null || lb == null) { parts.push(`${etiket} —`); continue; }
      const fark = z(+(lf - lb).toFixed(1));
      parts.push(`${etiket} ${lf.toFixed(1)}/${lb.toFixed(1)} fark ${fark.toFixed(1)}`);
      satirlar.push({ ad, parca: etiket, on: +lf.toFixed(1), arka: +lb.toFixed(1), fark });
    }
    console.log(`      ${ad.padEnd(24)} ${parts.join(' · ') || 'on/arka parca cifti yok'}`);
  }
  if (process.env.CIZIM_YANDIKIS_JSON) writeFileSync(process.env.CIZIM_YANDIKIS_JSON, JSON.stringify({ beden: BEDEN, satirlar }, null, 1));
}

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
  // FLAT-ESTETIK: aci artik konvansiyon bandindadir (kalibin kendi ucgen
  // cozumunden tohumlanir, banda kirpilir; data-kol-aci = yatayin ALTINA dogru
  // derece). Eski 'iki farkli aci' sarti KALDI (kirpma sonrasi da iki farkli
  // kol iki farkli aci veriyor, olculdu) ve ustune BAND sarti geldi. Kolun
  // gercekten omuz yatayinin altinda sarktigi ayrica (j)'de GEOMETRIDEN olculur.
  const BAND = FLAT_LAW.sevkPoz.kolAcisiDeg;
  const acilar = cizimler.flatMap((c) => [...c.svg.matchAll(/data-kol-aci="(-?[\d.]+)"/g)].map((m) => parseFloat(m[1])));
  const farkli = new Set(acilar.map((a) => a.toFixed(2)));
  const bandDisi = acilar.filter((a) => !(a >= BAND.min && a <= BAND.max));
  check(`(b) kol acisi konvansiyon bandinda [${BAND.min}, ${BAND.max}] deg (yatayin altina dogru)`,
        acilar.length > 0 && bandDisi.length === 0,
        `${acilar.length} aci, ${farkli.size} farkli: ${[...farkli].join(' ')}` +
        (bandDisi.length ? ` — BAND DISI: ${bandDisi.join(' ')}` : ''));
  check('(b) kol acisi kalibin kendi olculerinden tohumlaniyor (sabit degil)', farkli.size >= 2,
        `${farkli.size} farkli aci`);
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
    if (!mankenIlanKontrol(c.ad, c, sil)) { bad++; continue; }
    const ters = mankenTers(sil);                       // donusum ONCESI olcum
    const cizimMax = Math.max(...pts(sil.d).map((p) => ters(p)[0]));
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

// --------------------------------------------------------------- (g2) UC-CIZGI MUTABAKATI
// Gogus / bel / kalca UC cizgide cizim ile draftJSON kalibi 0.1 mm'de tutmak
// zorunda — ve BEL, PENS-KAPALI olculur: cizici pensleri kapatarak ciziyor
// (flat-from-pattern.js sewPanel), o yuzden kalip tarafinda da AYNI kapali
// olcum burada, web/lib'e HIC dokunmadan, draftJSON'un kendi komut/marking
// verisinden yeniden kurulur. Iki taraf ayni sayiyi vermek zorunda; cizim
// tarafina atilacak tek eksenlik bir kaydirma (orn. x*1.001) bu siki KIRMIZI
// dusurur — mutasyon disiplini kaniti bu satirlarin uzerinde kosuldu.
// Kapsam: elbise + etek + top + orme (dort sinif). Prenses (g)'deki gerekceyle
// disarida: on IKI panelden kurulur ve kendi sert olcusuyle (dikis kacigi)
// yargilanir.
console.log('\n--- (g2) uc-cizgi mutabakati: gogus/bel/kalca, cizim <-> kalip <= 0.1 mm (bel PENS-KAPALI)');
{
  const TOL = 0.1;
  // yerel mm aritmetigi — web/lib'den import YOK, kalip tarafi bagimsiz olculur
  const vsub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const vnorm = (a) => Math.hypot(a[0], a[1]);
  const vlerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const rot = (p, c, th) => {
    const s = Math.sin(th), co = Math.cos(th), d = vsub(p, c);
    return [c[0] + d[0] * co - d[1] * s, c[1] + d[0] * s + d[1] * co];
  };
  const bez = (p, t) => {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, cc = 3 * u * t * t, dd = t * t * t;
    return [a * p[0][0] + b * p[1][0] + cc * p[2][0] + dd * p[3][0],
            a * p[0][1] + b * p[1][1] + cc * p[2][1] + dd * p[3][1]];
  };
  function segsOf(cmds) {
    const out = []; let cur = null, start = null;
    for (const c of cmds) {
      if (c.type === 'move') { cur = [c.x, c.y]; start = cur; continue; }
      if (c.type === 'close') {
        if (cur && start && vnorm(vsub(cur, start)) > 1e-7) {
          out.push([cur, vlerp(cur, start, 1 / 3), vlerp(cur, start, 2 / 3), start]);
        }
        cur = start; continue;
      }
      if (!cur) cur = [0, 0];
      const p3 = [c.x, c.y];
      if (c.type === 'line') out.push([cur, vlerp(cur, p3, 1 / 3), vlerp(cur, p3, 2 / 3), p3]);
      else if (c.type === 'curve') out.push([cur, [c.cp1x, c.cp1y], [c.cp2x, c.cp2y], p3]);
      else continue;
      cur = p3;
    }
    return out;
  }
  const sample = (segs, per = 40) => {
    const out = [];
    segs.forEach((s, k) => { for (let j = k === 0 ? 0 : 1; j <= per; j++) out.push(bez(s, j / per)); });
    return out;
  };
  const nearest = (P, q) => {
    let best = 0, bd = Infinity;
    for (let i = 0; i < P.length; i++) { const d = vnorm(vsub(P[i], q)); if (d < bd) { bd = d; best = i; } }
    return best;
  };
  const dartsOf = (piece) => {
    const polys = []; let cur = null;
    for (const c of piece.markings || []) {
      if (c.type === 'move') { cur = [[c.x, c.y]]; polys.push(cur); continue; }
      if (c.type === 'close' || !cur) continue;
      cur.push([c.x, c.y]);
    }
    return polys.filter((p) => p.length >= 3);
  };
  // Pensi KAPAT: bacaklarin arasindaki aciyla, apeks etrafinda, kenarin
  // yan-dikis tarafini dondur. flat-from-pattern.js closeDart'in yaptigi
  // OPERASYONUN kendisi — kod degil, tanim ortak: pens kapatmak budur.
  function closeDartL(pts, dart, outboardAtStart) {
    const apex = dart[1], legA = dart[0], legB = dart[dart.length - 1];
    let i1 = nearest(pts, legA), i2 = nearest(pts, legB);
    if (i1 > i2) { const t = i1; i1 = i2; i2 = t; }
    if (i2 - i1 < 1) return null;
    const ang = (i) => Math.atan2(pts[i][1] - apex[1], pts[i][0] - apex[0]);
    const th = outboardAtStart ? ang(i2) - ang(i1) : ang(i1) - ang(i2);
    if (!isFinite(th)) return null;
    if (outboardAtStart) return pts.slice(0, i1 + 1).map((p) => rot(p, apex, th)).concat(pts.slice(i2 + 1));
    return pts.slice(0, i1 + 1).concat(pts.slice(i2).map((p) => rot(p, apex, th)));
  }
  // Panelin pens kenarini bul (beden: alt/hem kenari, etek: ust/bel kenari),
  // ustundeki TUM pensleri dis uctan iceri dogru kapat, kapali noktalari dondur.
  function closedEdge(piece, kind) {
    const segs = segsOf(piece.commands);
    if (!segs.length) return null;
    const all = segs.flat();
    const yTop = Math.min(...all.map((p) => p[1]));
    const yBot = Math.max(...all.map((p) => p[1]));
    const H = yBot - yTop || 1;
    let edge, outboardAtStart;
    if (kind === 'hem') {                      // beden/top: pens kenari = hem (yan -> orta)
      let hemIdx = -1;
      for (let k = 0; k < segs.length; k++) if (Math.abs(segs[k][3][1] - yBot) < 1.0) hemIdx = k;
      if (hemIdx < 0) return null;
      edge = [segs[hemIdx]]; outboardAtStart = true;
    } else {                                   // etek: pens kenari = ust/bel (orta -> yan)
      let t = 0;
      while (t < segs.length && Math.max(...segs[t].map((p) => p[1])) < yTop + 0.08 * H) t++;
      if (!t) return null;
      edge = segs.slice(0, t); outboardAtStart = false;
    }
    let pts0 = sample(edge, 40);
    const darts = dartsOf(piece)
      .map((d) => ({ d, at: nearest(pts0, d[0]) }))
      .filter(({ d }) => Math.min(vnorm(vsub(pts0[nearest(pts0, d[0])], d[0])),
                                  vnorm(vsub(pts0[nearest(pts0, d[d.length - 1])], d[d.length - 1]))) <= 8)
      .sort((a, b) => (outboardAtStart ? a.at - b.at : b.at - a.at));
    let n = 0;
    for (const { d } of darts) { const r = closeDartL(pts0, d, outboardAtStart); if (r) { pts0 = r; n++; } }
    return { pts: pts0, kapatilan: n };
  }
  const pieceMaxX = (p) => Math.max(...p.commands.filter((k) => k.type !== 'close')
    .flatMap((k) => [k.x, k.cp1x, k.cp2x].filter((v) => typeof v === 'number')));
  const pieceMaxY = (p) => Math.max(...p.commands.filter((k) => k.type !== 'close')
    .flatMap((k) => [k.y].filter((v) => typeof v === 'number')));

  let bad = 0;
  const sayilan = { elbise: 0, etek: 0, top: 0, orme: 0 };
  for (const c of cizimler) {
    if ((c.spec.shaping || 'dart') === 'princess') continue;   // (g)'deki kapsam karari
    const drafted = JSON.parse(engine.draftJSON(engineSpec(c.spec), bodyForSize(BEDEN)));
    const P = drafted.pattern.pieces;
    const bodice = P.find((p) => /^(Bodice Front|Top Front)$/.test(p.name));
    const skirt = P.find((p) => /^(Skirt Front|Skirt Center Front|Front)$/.test(p.name));
    const sil = byRol(c.ps, 'siluet').find((p) => p.view === 'front');
    if (!sil) { FAIL(`(g2) ${c.ad}: on siluet yok`); bad++; continue; }
    if (!mankenIlanKontrol(c.ad, c, sil)) { bad++; continue; }
    const ters = mankenTers(sil);                       // donusum ONCESI olcum
    const silPts = pts(sil.d).map(ters);
    const belYollari = byRol(c.ps, 'bel-dikisi').filter((p) => p.view === 'front' && p.yan === 'sag');
    const satir = [];
    const kiyas = (ad, kalipMM, cizimMM) => {
      const fark = Math.abs(cizimMM - kalipMM);
      satir.push(`${ad} kalip ${kalipMM.toFixed(4)} / cizim ${cizimMM.toFixed(4)} (fark ${fark.toFixed(4)})`);
      if (!(fark <= TOL)) { FAIL(`(g2) ${c.ad}: ${ad} cizim ${cizimMM.toFixed(4)} mm, kalip ${kalipMM.toFixed(4)} mm, fark ${fark.toFixed(4)} > ${TOL}`); bad++; }
    };

    if (bodice) {
      // GOGUS: beden panelinin en genis noktasi == siluetin beden bolgesindeki
      // en genis nokta (kontrol noktalari dahil; pens kapanisi bel ucunu
      // oynatir, koltukalti ucunu oynatmaz — rampSegs ust ucu sabit tutar).
      const bodBot = pieceMaxY(bodice);
      kiyas('gogus', pieceMaxX(bodice),
            Math.max(...silPts.filter((p) => p[1] <= bodBot + 0.5).map((p) => p[0])));
      // BEL (elbise/orme) ya da ETEK UCU=KALCA HIZASI (top): pens-KAPALI kenar.
      const kapali = closedEdge(bodice, 'hem');
      if (!kapali) { FAIL(`(g2) ${c.ad}: beden pens kenari bulunamadi`); bad++; }
      else if (skirt) {
        // elbisede kapali beden beli cizimde bel-dikisi olarak DURUYOR
        if (belYollari.length !== 1) { FAIL(`(g2) ${c.ad}: cizimde ${belYollari.length} bel-dikisi, beklenen 1`); bad++; }
        else kiyas(`bel(pens-kapali,${kapali.kapatilan} pens)`,
                   Math.max(...kapali.pts.map((p) => p[0])),
                   Math.max(...pts(belYollari[0].d).map((p) => ters(p)[0])));
      } else {
        // top'ta kapali hem siluetin kendisinde; kalibin kapali uc noktasi
        // cizimde 0.1 mm icinde AYNEN var olmak zorunda (nokta uyeligi)
        const uc = kapali.pts.reduce((a, b) => (b[0] > a[0] ? b : a));
        const en = Math.min(...silPts.map((p) => vnorm(vsub(p, uc))));
        satir.push(`etek-ucu(pens-kapali,${kapali.kapatilan} pens) kalip ucu [${uc[0].toFixed(4)}, ${uc[1].toFixed(4)}] cizimde en yakin ${en.toFixed(4)}`);
        if (!(en <= TOL)) { FAIL(`(g2) ${c.ad}: pens-kapali etek ucu kalipta [${uc[0].toFixed(4)}, ${uc[1].toFixed(4)}] ama cizimdeki en yakin nokta ${en.toFixed(4)} mm uzakta`); bad++; }
      }
    }
    if (skirt) {
      if (bodice) {
        // KALCA/ETEK BOLGESI: etegin en genis noktasi (duz etekte kalca, A'da
        // etek ucu) == siluetin bel alti bolgesindeki en genis nokta. Pens
        // kapanisi etegin ALT ucunu oynatmaz (rampSegs: delta belde, etekte 0).
        const bodBot = pieceMaxY(bodice);
        kiyas('kalca/etek', pieceMaxX(skirt),
              Math.max(...silPts.filter((p) => p[1] >= bodBot + 1.0).map((p) => p[0])));
      } else {
        // etek sinifi: kalca/etek = butun siluetin en genisi
        kiyas('kalca/etek', pieceMaxX(skirt), Math.max(...silPts.map((p) => p[0])));
        // BEL pens-KAPALI: cizimdeki ust bel-dikisi (alttaki, kemer derinligi
        // kadar asagi ofsetlenmis dikis izi cizgisidir)
        const kapali = closedEdge(skirt, 'top');
        if (!kapali) { FAIL(`(g2) ${c.ad}: etek pens kenari bulunamadi`); bad++; }
        else if (belYollari.length < 1) { FAIL(`(g2) ${c.ad}: cizimde bel-dikisi yok`); bad++; }
        else {
          const ort = (p) => pts(p.d).reduce((s, q) => s + q[1], 0) / pts(p.d).length;
          const ust = belYollari.reduce((a, b) => (ort(b) < ort(a) ? b : a));
          kiyas(`bel(pens-kapali,${kapali.kapatilan} pens)`,
                Math.max(...kapali.pts.map((p) => p[0])),
                Math.max(...pts(ust.d).map((p) => ters(p)[0])));
        }
      }
    }
    const sinif = c.spec.garment === 'dress' ? (c.spec.fabric === 'knit' ? 'orme' : 'elbise')
                : c.spec.garment === 'skirt' ? 'etek' : 'top';
    sayilan[sinif]++;
    console.log(`      ${c.ad.padEnd(24)} ${satir.join(' · ')}`);
  }
  // dort sinifin dordu de OLCULMUS olmak zorunda — bos gecen sinif = olculmemis hukum
  for (const [s, n] of Object.entries(sayilan)) {
    if (!n) { FAIL(`(g2) ${s} sinifinda hic spec olculmedi`); bad++; }
  }
  if (!bad) OK(`(g2) ${Object.values(sayilan).reduce((a, b) => a + b, 0)} spec'te (elbise ${sayilan.elbise} · etek ${sayilan.etek} · top ${sayilan.top} · orme ${sayilan.orme}) gogus/bel/kalca cizim == kalip, 0.1 mm'de, bel pens-kapali`);
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

// ------------------------------------------------- (h2) AYNA KACIGI (hakem K2)
// M6-vitrin, hakemin devrettigi kalem: "flat'te arka orta dikis TEK cizgi
// olacak" (referans GIRDI/iyi-flat/adaylar/13-yuksek-bel-a-line.png; onbes
// satici referansinin onbesinde de arka orta TEK yol ve tam ortadan geciyor).
//
// KOKU BIR OLCU, BIR ZEVK TERCIHI DEGIL: kalibin arka govde paneli ayna
// ekseninin DISINDA baslar (EU38'de 9.01 mm, bu dosyada asagida yeniden
// olculur), cunku arka orta bir DIKIS'tir, katlama degil. O kenar bulundugu
// yerde cizilip aynalaninca sayfaya birbirine paralel IKI dikey cizgi dusuyor,
// bel dikisi de ortasindan 2 x 9.01 = 18.02 mm kesik kaliyordu — giysi
// sirtindan ve belinden yarik gibi okunuyordu.
//
// HUKUM iki cumle, ikisi de eksik ucu olculuyor:
//   (h2a) ayna ekseninde durmasi gereken her `orta-dikis` yolunun HER noktasi
//         |x| <= 0.5 mm icinde olacak (tek yol).
//   (h2b) her `bel-dikisi` yolunun MERKEZ ucu (iki ucundan eksene yakin olani)
//         |x| <= 0.5 mm icinde olacak (bel dikisi ortadan kesik degil).
// Esik 0.5 mm cizim cozunurlugudur, tolerans degil: ihlal 9 mm buyuklugunde.
//
// ⛔ HAKEMIN IKINCI KALEMI ("pensler kapali V olacak") BILEREK YAZILMADI, ve
// gerekcesi olculdu: hakemin kendi gosterdigi referansta (ayni dosya, arka
// govde, 8x buyutme) pensler TEK CIZGI olarak cizili — kapali V degil. Kapali
// V hukmu konsaydi kapi, sevk edilen cizimi kendi referansindan UZAKLASTIRAN
// bir yasa dayatmis olurdu. Kalem kaybolmadi: raporda "KARAR GEREKEN" altinda,
// olculen kanitla birlikte duruyor.
console.log('\n--- (h2) ayna kacigi: arka orta TEK yol, bel dikisi ortadan kesik degil');
{
  const EKSEN_TOL = 0.5;   // mm
  let bad = 0, olculen = 0, enBuyuk = 0;
  for (const c of cizimler) {
    for (const p of byRol(c.ps, 'orta-dikis')) {
      olculen++;
      const uzak = Math.max(...pts(p.d).map((q) => Math.abs(q[0])));
      enBuyuk = Math.max(enBuyuk, uzak);
      if (uzak > EKSEN_TOL) {
        FAIL(`(h2a) ${c.ad}/${p.view}/${p.yan}: orta-dikis eksenden ${uzak.toFixed(2)} mm disarida — ` +
             `aynalaninca iki paralel cizgi olur, satici referansinda TEK yol`);
        bad++;
      }
    }
    for (const p of byRol(c.ps, 'bel-dikisi')) {
      olculen++;
      const P = pts(p.d);
      const uc = Math.min(Math.abs(P[0][0]), Math.abs(P[P.length - 1][0]));
      enBuyuk = Math.max(enBuyuk, uc);
      if (uc > EKSEN_TOL) {
        FAIL(`(h2b) ${c.ad}/${p.view}/${p.yan}: bel-dikisi merkez ucu x=${uc.toFixed(2)} mm — ` +
             `aynali cift arasinda ${(2 * uc).toFixed(2)} mm bosluk kalir, bel ortasindan kesik gorunur`);
        bad++;
      }
    }
  }
  if (!olculen) FAIL('(h2) hic orta-dikis / bel-dikisi olculmedi — kapi bos gecti');
  else if (!bad) OK(`(h2) ${olculen} orta-dikis/bel-dikisi yolunun hepsi ayna ekseninde ` +
                    `(en buyuk kacik ${enBuyuk.toFixed(4)} mm, tavan ${EKSEN_TOL})`);

  // (h2c) AYNI KUSUR SINIFININ ZOR YARISI — HAKEM KIRMIZI 2, ADIYLA:
  // "(h2b) sadece merkez ucun X'ine bakiyor, TEGETIN eksene dik olup olmadigina
  // BAKMIYOR. Kapi, yapilan duzeltmeye gore yazilmis, kusur SINIFINA gore
  // degil." Dogruydu: (h2b) yesilken flat-kumas-dokuma-eu38.svg on bel
  // dikisinde eksendeki teget yataya 9.55 derece duruyordu, aynalaninca on
  // ortada 19.1 derecelik SIVRI V ve yan bele gore 16.78 mm centik.
  //
  // OLCULEN BUYUKLUK BIR ACI DEGIL, MILIMETRE: ayna ekseninden 10 mm yay boyu
  // uzakta, kenarin kendi y'si merkez ucun y'sinden ne kadar sapiyor. Teget
  // eksene dikse bu sapma sifira gider; degilse aynalanan cift orada 2 x sapma
  // kadar kirilir. 10 mm OLCU CUBUGUDUR, tolerans degil; tolerans (h2a/h2b) ile
  // AYNI 0.5 mm cizim cozunurlugudur — yani "kirilma murekkep kaliniginin
  // altinda kalacak". Gercek bir kavisli bel bu kapidan rahat gecer: yaricapi
  // 1250 mm olan sevk edilen bel egrisinde sapma 0.04 mm.
  const OLCU_CUBUGU = 10;  // mm, tegetin olculdugu yay boyu
  let bad2 = 0, olculen2 = 0, enBuyuk2 = 0, enBuyukAd = '';
  for (const c of cizimler) {
    for (const p of byRol(c.ps, 'bel-dikisi')) {
      const P = pts(p.d);
      if (P.length < 3) continue;
      const bas = Math.abs(P[0][0]) <= Math.abs(P[P.length - 1][0]) ? P : P.slice().reverse();
      if (Math.abs(bas[0][0]) > EKSEN_TOL) continue;   // (h2b) zaten yargiladi
      // merkez uctan OLCU_CUBUGU kadar yay boyu yuru
      let s = 0, q = null;
      for (let i = 1; i < bas.length; i++) {
        const d0 = Math.hypot(bas[i][0] - bas[i - 1][0], bas[i][1] - bas[i - 1][1]);
        if (s + d0 >= OLCU_CUBUGU) {
          const t = (OLCU_CUBUGU - s) / d0;
          q = [bas[i - 1][0] + t * (bas[i][0] - bas[i - 1][0]),
               bas[i - 1][1] + t * (bas[i][1] - bas[i - 1][1])];
          break;
        }
        s += d0;
      }
      if (!q) continue;                                 // 10 mm'den kisa yol
      olculen2++;
      const sapma = Math.abs(q[1] - bas[0][1]);
      const aci = Math.abs(Math.atan2(q[1] - bas[0][1], q[0] - bas[0][0]) * 180 / Math.PI);
      if (sapma > enBuyuk2) { enBuyuk2 = sapma; enBuyukAd = `${c.ad}/${p.view}/${p.yan}`; }
      if (sapma > EKSEN_TOL) {
        FAIL(`(h2c) ${c.ad}/${p.view}/${p.yan}: bel-dikisi ayna eksenine DIK bitmiyor — ` +
             `eksenden ${OLCU_CUBUGU} mm otede kenar ${sapma.toFixed(2)} mm sapiyor ` +
             `(teget yataya ${(aci > 90 ? 180 - aci : aci).toFixed(2)} derece), aynalaninca ` +
             `on ortada ${(2 * sapma).toFixed(2)} mm'lik SIVRI bir V kosesi basar; ` +
             'motor "V bel" ilan etmiyorsa bu bir artefakttir');
        bad2++;
      }
    }
  }
  if (!olculen2) FAIL('(h2c) hic bel-dikisi tegeti olculmedi — kapi bos gecti');
  else if (!bad2) OK(`(h2c) ${olculen2} bel-dikisi yolunun hepsi ayna eksenine dik bitiyor ` +
                     `(en buyuk sapma ${enBuyuk2.toFixed(4)} mm @ ${enBuyukAd}, tavan ${EKSEN_TOL})`);
}

// --------------------------------------------------------------- (i) FLAT KANUNU
// contract/flat-convention-v1.json Damla'nin flat kanunudur: tek murekkep,
// hiyerarsi RENKLE degil AGIRLIKLA, sifir boya, on + arka, ilan edilmis olcek.
// flat_convention_check bu kanunu YUZEY hattinin ciziminde olcmeye devam ediyor;
// kanun sevk edilen kaleme de aynen bagli, o yuzden BURADA da olculuyor. Kanun
// diskten okunuyor — burada yeniden yazilan bir kopyasi YOK.
console.log('\n--- (i) flat kanunu (contract/flat-convention-v1.json) sevk edilen cizimde');
{
  const LAW = FLAT_LAW;
  const INK = String(LAW.ink.color).toLowerCase();
  // sevk hattinin uc sinifi: kanunun iki ortak sinifi + sevkPoz.topstitch
  // (o sinif lineClasses tablosunda DEGIL — gerekcesi kanunun kendi
  // _FLAT_ESTETIK blogunda: arastirma hatti topstitch cizmiyor).
  const TS = LAW.sevkPoz.topstitch;
  const AGIRLIKLAR = new Set([...Object.values(LAW.lineClasses.classes)
    .map((c) => Number(c.width)).filter((n) => isFinite(n)), Number(TS.width)]);
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
    // KESIK cizgi = topstitch, duz cizgi = dikis (sevkPoz.topstitch): dikis-izi
    // rolu tam (width, dash) ciftiyle cizilir, baska hicbir rol kesik cizemez.
    for (const p of gorunur(c.ps)) {
      if (p.rol === TS.drawnBy) {
        if (p.dash !== TS.dash || p.w !== Number(TS.width)) {
          FAIL(`(i) ${c.ad}: ${p.rol} (${p.w}, "${p.dash}") — kanun topstitch (${TS.width}, "${TS.dash}") diyor`);
          bad++;
        }
      } else if (p.dash) {
        FAIL(`(i) ${c.ad}: ${p.rol} kesikli cizilmis ("${p.dash}") — kesik cizgi yalniz topstitch (${TS.drawnBy})`);
        bad++;
      }
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

// --------------------------------------------------------------- (j) FLAT POZ KONVANSIYONU
// FLAT-ESTETIK (2026-09-02): teknik flat MASAYA DUZ SERILMIS giysidir. Uc kok
// kusurun kapisi (contract/flat-convention-v1.json sevkPoz):
//   j1  KOL SARKIK: kol path'i omuz ucundan baslar; HICBIR noktasi onun ustune
//       (daha kucuk y'ye) cikamaz — kanat yasak. Bu ILANDAN degil GEOMETRIDEN
//       olculur, cunku aciyi dogru ilan edip kolu yanlis cizmek mumkundur.
//   j2  OMUZ KISA + EGIMLI: siluetin ilan ettigi omuz egimi ve omuz/gogus orani
//       kanun bandinda; ilan edilen omuz ucu GERCEKTEN cizilen path'in bir
//       noktasi (ilan yalan soyleyemez — manken ilaniyla ayni disiplin).
//   j3  YAKA ORANDA: yaka genisligi / omuz bandi, on derinlik / genislik
//       (taban konvansiyon, tavan stil siniri) ve arka dusus / on derinlik.
// Govdesiz siniflar (etek) yargilanmaz ama SAYILIR: govdeli hicbir spec poz
// ilani olmadan gecemez.
console.log('\n--- (j) flat poz konvansiyonu (sevkPoz): kol sarkik, omuz kisa+egimli, yaka oranda');
{
  const SP = FLAT_LAW.sevkPoz;
  let bad = 0, govdeli = 0;
  const attrNum = (p, k) => { const m = new RegExp(`${k}="(-?[\\d.]+)"`).exec(p.attr); return m ? parseFloat(m[1]) : null; };
  const bandCheck = (ad, deger, lo, hi, ne) => {
    if (deger === null) { FAIL(`(j) ${ad}: ${ne} ilani YOK`); bad++; return; }
    if (!(deger >= lo && deger <= hi)) { FAIL(`(j) ${ad}: ${ne} ${deger} — band [${lo}, ${hi}] disi`); bad++; }
  };
  for (const c of cizimler) {
    // j1 — kol omuz yatayinin ALTINDA (geometri, her kol path'inde)
    //      ISTISNA, ADIYLA: buzgulu kapak (sevkPoz.buzgu.omuzUstuKubbe). Kolun
    //      kendisi buzgulu oldugunu path uzerinde ILAN ediyor
    //      (data-buzgu-kapak-oran); ilan yoksa istisna da yok.
    // j4 — YATAY RAF: kubbe bedava degil. Kol dis konturunun omuz yatayina
    //      yapisik yatay uzanimi, kolun yatay acikliginin
    //      sevkPoz.buzgu.yatayRafOranMax'ini gecemez. Bu hukum HER kolda
    //      calisir (buzgulu ya da degil), cunku duz kolda olculen deger 0.00.
    const RAF = SP.buzgu.yatayRafOranMax;
    for (const p of byRol(c.ps, 'kol')) {
      const P = pts(p.d);
      if (P.length < 2) continue;
      const yS = P[0][1];
      const buzgulu = /data-buzgu-kapak-oran="/.test(p.attr);
      const ust = P.filter((q) => q[1] < yS - 1e-3);
      if (ust.length && !buzgulu) {
        FAIL(`(j1) ${c.ad}/${p.view}/${p.yan}: kol omuz yatayinin USTUNE cikiyor — ` +
             `${ust.length} nokta, en yukarisi y=${Math.min(...ust.map((q) => q[1])).toFixed(2)} < omuz y=${yS.toFixed(2)}`);
        bad++;
      }
      const xs = P.map((q) => q[0]);
      const acik = Math.max(...xs) - Math.min(...xs);
      let raf = 0;
      for (let i = 1; i < P.length; i++)
        if (Math.abs(P[i][1] - yS) <= RAF.tolMM && Math.abs(P[i - 1][1] - yS) <= RAF.tolMM)
          raf += Math.abs(P[i][0] - P[i - 1][0]);
      const oran = acik > 1e-6 ? raf / acik : 0;
      if (oran > RAF.deger) {
        FAIL(`(j4) ${c.ad}/${p.view}/${p.yan}: kol omuz yatayinda YATAY RAF — ` +
             `${raf.toFixed(1)} / ${acik.toFixed(1)} mm = ${(oran * 100).toFixed(0)}%, ` +
             `kanun tavani ${(RAF.deger * 100).toFixed(0)}%`);
        bad++;
      }
    }
    if ((c.spec.garment || '') === 'skirt') continue;
    govdeli++;
    for (const view of ['front', 'back']) {
      const sil = byRol(c.ps, 'siluet').find((p) => p.view === view);
      if (!sil) continue;
      const ad = `${c.ad}/${view}`;
      // j2 — omuz
      bandCheck(ad, attrNum(sil, 'data-omuz-egim-deg'), SP.omuzEgimiDeg.min, SP.omuzEgimiDeg.max, 'omuz egimi (deg)');
      bandCheck(ad, attrNum(sil, 'data-omuz-oran'), SP.omuzGogusOran.min, SP.omuzGogusOran.max, 'omuz/gogus orani');
      const uc = /data-omuz-uc="(-?[\d.]+) (-?[\d.]+)"/.exec(sil.attr);
      if (!uc) { FAIL(`(j2) ${ad}: data-omuz-uc ilani yok`); bad++; }
      else {
        const q = [parseFloat(uc[1]), parseFloat(uc[2])];
        const en = Math.min(...pts(sil.d).map((r) => Math.hypot(r[0] - q[0], r[1] - q[1])));
        if (en > 0.05) { FAIL(`(j2) ${ad}: ilan edilen omuz ucu cizilen siluette YOK (en yakin ${en.toFixed(3)} mm)`); bad++; }
      }
      // j3 — yaka
      bandCheck(ad, attrNum(sil, 'data-yaka-gen-oran'),
                SP.yaka.genislikOverOmuz.min, SP.yaka.genislikOverOmuz.max, 'yaka genislik/omuz orani');
      if (view === 'front') {
        bandCheck(ad, attrNum(sil, 'data-yaka-derinlik-oran'),
                  SP.yaka.onDerinlikOverGenislik.min, SP.yaka.onDerinlikOverGenislik.maxKapi, 'on yaka derinlik/genislik orani');
      } else {
        bandCheck(ad, attrNum(sil, 'data-arka-yaka-oran'),
                  SP.yaka.arkaDususOverOn.min, SP.yaka.arkaDususOverOn.max, 'arka yaka dusus/on orani');
      }
    }
  }
  if (!govdeli) { FAIL('(j) hic govdeli spec olculmedi'); }
  else if (!bad) OK(`(j) ${govdeli} govdeli spec'te poz kanunda: kol sarkik (geometri; buzgulu kapak ` +
                    `omuzUstuKubbe istisnasiyla), yatay raf <= ${(SP.buzgu.yatayRafOranMax.deger * 100).toFixed(0)}%, ` +
                    'omuz egim/oran bandda, omuz ucu ilani cizili noktayla ozdes, yaka oranlari bandda');
}

// --------------------------------------------------------------- (k) YAKA PARCASI
// G1-yaka (2026-09-02): yaka artik kalibin KENDI yaka parcasindan olculuyor
// (boy = parca yaka kenari, derinlik = alan/boy), sekli konvansiyondan. Iki
// hukum, ikisi de dosyanin kendi ilanindan + kendi geometrisinden:
//   k1  TUTARLILIK: her yaka path'i data-yaka-parca-mm (parcanin yaka kenari)
//       ve data-yaka-cizgi-mm (giysinin on+arka yarim yaka cizgisi, draft'tan)
//       ilan eder; ikisi ±%5 icinde ayni olmak zorunda. Olculdu (EU38, bes
//       yaka tipi): oran 0.9999-1.0001 — motor yakayi yaka cizgisine ciziyor,
//       band genis.
//   k2  KONTUR: hicbir yaka path'i kendini kesmez (2026-09-02 oncesi 09'un
//       gomlek yakasi blob, 02'nin dik yakasi ucgen yildizdi — ikisi de
//       kendini kesen konturdu).
//   k2b AYNA CIFTI: sag yarim ile aynadaki esi (x -> -x, ayna cizgisi d
//       koordinatlarinda x=0) birbirini KESEMEZ. Uc noktasi temasi serbest
//       (yatik lobun CF'de bulusmasi tema, gecis degil). Hakem bulgusu
//       2026-09-02: 09'un iki aynali yapragi CF'de kucuk X'le birbirinin
//       ustunden geciyordu ve path-BASINA test bunu goremiyordu — kapi kor
//       noktasiydi, genisletildi.
console.log('\n--- (k) yaka: parca boyu <-> yaka cizgisi (±%5) + kontur kendini kesmiyor (ayna cifti dahil) + titrek degil (k3)');
{
  const segsOf = (P, kapali) => {
    const pts2 = P.filter((p, i) => i === 0 || Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]) > 1e-6);
    const n = pts2.length, out = [];
    for (let i = 0; i + 1 < n; i++) out.push([pts2[i], pts2[i + 1]]);
    if (kapali && n > 2) out.push([pts2[n - 1], pts2[0]]);
    return out;
  };
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const kesiyorSeg = (s, t) => {
    const [a, b] = s, [c, d] = t;
    const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b);
    return ((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) &&
           ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9));
  };
  const kesisiyor = (P, kapali) => {
    // ardisik olmayan kenar ciftlerinde GERCEK kesisme (uc noktasi teması degil)
    const segs2 = segsOf(P, kapali);
    const m = segs2.length;
    for (let i = 0; i < m; i++) {
      for (let j = i + 2; j < m; j++) {
        if (i === 0 && j === m - 1 && kapali) continue;   // kapanis kenari ilk kenara komsu
        if (kesiyorSeg(segs2[i], segs2[j])) return [i, j];
      }
    }
    return null;
  };
  const kesisiyorAyna = (P, kapali) => {
    const A = segsOf(P, kapali), B = segsOf(P.map((q) => [-q[0], q[1]]), kapali);
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < B.length; j++) if (kesiyorSeg(A[i], B[j])) return [i, j];
    }
    return null;
  };
  const attrNum = (p, k) => { const m = new RegExp(`${k}="(-?[\\d.]+)"`).exec(p.attr); return m ? parseFloat(m[1]) : null; };
  const TOL_ORAN = FLAT_LAW.sevkPoz.yakaParcasi.boyToleransOran;   // kanun, kopya degil
  // k3 PURUZSUZLUK (2026-09-02 hakem karari 2): sevk edilen 09'un gomlek
  // yakasi (k)'nin butun hukumlerinden yesildi ama konturu titrekti — 74
  // noktada 25 egrilik isaret degisimi. Kapi puruzsuzlugu olcmuyordu, kor
  // noktaydi. Hukum: minDonusDeg'den buyuk donuslerin isaret degisimi sayisi
  // tavani asamaz. Sayilar kanundan (contract yakaParcasi.puruzsuzluk).
  const PUR = FLAT_LAW.sevkPoz.yakaParcasi.puruzsuzluk;
  const isaretDegisimi = (P, kapali) => {
    const segs2 = segsOf(P, kapali);
    const minRad = (PUR.minDonusDeg * Math.PI) / 180;
    let onceki = 0, sayi = 0;
    for (let i = 0; i + 1 < segs2.length; i++) {
      const a = segs2[i], b = segs2[i + 1];
      const u = [a[1][0] - a[0][0], a[1][1] - a[0][1]], v = [b[1][0] - b[0][0], b[1][1] - b[0][1]];
      const donus = Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]);
      if (Math.abs(donus) < minRad) continue;                     // olcum cozunurlugu alti
      const s = Math.sign(donus);
      if (onceki !== 0 && s !== onceki) sayi++;
      onceki = s;
    }
    return sayi;
  };
  let bad = 0, yakali = 0;
  for (const c of cizimler) {
    if ((c.spec.collarType || 'none') === 'none') continue;
    yakali++;
    const yakalar = byRol(c.ps, 'yaka');
    if (!yakalar.length) continue;   // yoklugu (c) zaten kirmizi yapar
    for (const p of yakalar) {
      const ad = `${c.ad}/${p.view}/${p.yan}`;
      const parca = attrNum(p, 'data-yaka-parca-mm');
      const cizgi = attrNum(p, 'data-yaka-cizgi-mm');
      if (parca === null || cizgi === null) { FAIL(`(k1) ${ad}: data-yaka-parca-mm / data-yaka-cizgi-mm ilani YOK`); bad++; }
      else if (!(cizgi > 1) || Math.abs(parca / cizgi - 1) > TOL_ORAN) {
        FAIL(`(k1) ${ad}: yaka parcasi ${parca} mm, yaka cizgisi ${cizgi} mm — oran ${(parca / cizgi).toFixed(4)}, band ±%${TOL_ORAN * 100} disi`);
        bad++;
      }
      const kapali = /z\s*$/i.test(p.d.trim());
      const P = pts(p.d);
      const kes = kesisiyor(P, kapali);
      if (kes) { FAIL(`(k2) ${ad}: yaka konturu kendini kesiyor (kenar ${kes[0]} x kenar ${kes[1]})`); bad++; }
      const salinim = isaretDegisimi(P, kapali);
      if (salinim > PUR.isaretDegisimiTavan) {
        FAIL(`(k3) ${ad}: yaka konturu titrek — ${salinim} egrilik isaret degisimi ` +
             `(>${PUR.minDonusDeg} deg donuslerde), tavan ${PUR.isaretDegisimiTavan}`);
        bad++;
      }
      if (p.yan === 'sag') {   // sol zaten sag'in aynasi: cift bir kez olculur
        const kesA = kesisiyorAyna(P, kapali);
        if (kesA) { FAIL(`(k2b) ${ad}: aynali yaka cifti birbirini kesiyor (kenar ${kesA[0]} x ayna kenar ${kesA[1]})`); bad++; }
      }
    }
  }
  if (!yakali) FAIL('(k) hic yakali spec olculmedi');
  else if (!bad) OK(`(k) ${yakali} yakali spec'te yaka parcasi boyu yaka cizgisiyle ±%5 icinde, hicbir yaka konturu (ayna cifti dahil) kesismiyor ve hicbiri titrek degil (k3 isaret-degisimi tavani ${PUR.isaretDegisimiTavan})`);
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
console.log(`\nok cizim_giysi_mi — ${cizimler.length} spec, (a)-(k) + (g2) uc-cizgi mutabakati hepsi yesil`);
