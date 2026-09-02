#!/usr/bin/env node
// buzgu_katman_check — BÜZGÜLÜ KENAR OPERATÖRÜNÜN KAPISI (M1-puf, 2026-09-02).
//
// ===========================================================================
// NE ÖLÇÜYOR VE NEDEN
// ===========================================================================
// KOSU/ciktilar/kusur-listesi.md A1: "balon kol PUF hacmi yok ... kok neden
// KALIP/motor ... kolun kendisi duz koni; ust kenarda buzgulu puf KABARMASI
// cizilmiyor." CLAUDE.md aynı şeyi ölçüyle söylüyor: satın alınmış Buğra
// Locket'in Upper Sleeve'i, kendi kol oyuğuna **%29 fazlalıkla** giren bir
// kenardır — "ease değil, BÜZGÜ". Motorun eksiği buydu: bir parçanın KENDİ
// kenarını uzatan bir operatör yoktu; puf, `puffedSpreadFrac = 0.45` diye
// KAYNAKSIZ bir sayıyla tacı genişletiyordu ve oyuğa varan fazlalık ne ilan
// ediliyor ne ölçülüyordu.
//
// Bu kapı operatörün beş hükmünü ölçer. Hiçbiri bu dosyanın seçtiği bir eşik
// değildir — hepsi ya kalıbın kendi milimetresi ya da contract'ta KAYNAĞIYLA
// duran ölçülmüş bir sayıdır.
//
//   (a) OPT-IN. Büzgüsüz spec, operatör hiç koşmamış gibi. Golden zinciri
//       (ctest -R golden) düz kapağın bayt-aynılığını zaten mühürlüyor; burada
//       ölçülen, büzgülü ile büzgüsüz draft arasında KOL PARÇASI DIŞINDA tek
//       bir baytın bile oynamadığıdır. Operatör yalnız adını verdiği kenara
//       dokunur.
//   (b) ORAN. Çizilen kapak kenarının yay uzunluğu = ilan edilen büzgü oranı x
//       kol oyuğunun (armhole_front + armhole_back) çizili yay uzunluğu, %1
//       içinde. İki DRAWN kenar karşılaştırılır, hiçbir skaler kendi kendine
//       eşitlenmez.
//   (c) İŞARETLER. Büzgü işaretleri kapak kenarı boyunca EŞİT dağılmış
//       (aralıklar birbirine %1 içinde) ve sayısı contract'taki ölçülmüş sayı.
//       HANGİ KATMANDA: `gatherEdge` cloth'u OYNATIR, yani verdiği parça zaten
//       başka bir parçadır; işaretleri `markings`e basar — bir kalıbın çizili
//       dikiş talimatlarının durduğu yere, ve motorun kendi C++ kapısı
//       `sleeve_check`'in "crown gather marks present" derken baktığı yere.
//       `markGatheredEdge` tek nokta oynatmamaya söz verdiği için ONUN işareti
//       teknik `notches` katmanında kalır (golden bayt-aynılığı korunur).
//   (d) FLAT. Sevk edilen çizimde büzgü çizgileri VAR (data-rol="buzgu", kanunun
//       ilan ettiği ağırlık/kesik çiftiyle) ve puf kol büzgüsüzden ÖLÇÜLEBİLİR
//       biçimde daha dolgun (kol path'inin kapladığı alan).
//   (e) İKİ KATMAN + REDDETME. İki katmanlı puf (Buğra emsali: dış büzgülü
//       Upper + gerçek set-in Lower) ÇİZİLİYOR; ve motorun çizemediği bir
//       konakta ADIYLA reddediyor, sessizce tek katman çizmiyor.
//   (f) MOTORUN KENDİ C++ KAPISI. (2026-09-03, hakem maddesi 4.) Bu dosyanın
//       ilk hali yalnız wasm/JS hattını ölçüyordu ve yeşil yanarken motorun
//       kendi `sleeve_check`'i AYNI özellik için 45 kez kırmızıydı ve TERS
//       şeyi söylüyordu ("crown wider than plain" — büzgülü taç düz taçtan
//       GENİŞ olmalı). Bir kapı, ölçtüğü hattı kendi seçemez. Artık bu kapı
//       derlenmiş `sleeve_check` ve `locket_check` ikililerini KOŞAR ve
//       çıkışlarını şart koşar; ayrıca aynı iki hükmü (taç düz taçtan geniş,
//       kapak yüksekliği yayınlanmış Aldrich bandı 130-150 mm içinde) çizilen
//       kalıptan bağımsız olarak da ölçer.
//
// ANTI-HACK: bu kapı motordan tek bir sabit import etmez. Ölçtüğü her sayı ya
// wasm paketinin bastığı kalıptan ya da sevk edilen SVG'den okunur; beklenen
// değerler contract/tables.json'dan (kaynağıyla) gelir.
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
const require = createRequire(join(ROOT, '/'));

let fail = 0;
const OK = (s) => console.log(`  ok   ${s}`);
const FAIL = (s) => { console.log(`  FAIL ${s}`); fail++; };

const LAW = JSON.parse(readFileSync(join(ROOT, 'contract/flat-convention-v1.json'), 'utf8'));
const TABLES = JSON.parse(readFileSync(join(ROOT, 'contract/tables.json'), 'utf8'));
const R_PUF = TABLES.draft.gatherRatios.sleeveCapPuffed;
const R_YUM = TABLES.draft.gatherRatios.sleeveCapGathered;

// --------------------------------------------------------------- motor
const BUNDLE = join(ROOT, 'engine/dist/stitchu-engine.js');
if (!existsSync(BUNDLE)) { console.log(`FAIL wasm paketi yok: ${BUNDLE} — engine/build-wasm.sh`); process.exit(1); }
globalThis.document = { createElement: () => ({ click() {}, style: {} }),
                        head: { appendChild: (el) => queueMicrotask(() => el.onload && el.onload()) } };
const engine = await require(BUNDLE)();
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
const E = await import(join(ROOT, 'web/js/engine.js'));
const { flatSVG } = await import(join(ROOT, 'web/js/download.js'));

const mm = E.bodyForSize('EU38');
const BODY = { bust: mm.bust, waist: mm.waist, hip: mm.hip, shoulder: mm.shoulder,
               backLength: mm.backLength, armLength: mm.armLength, neck: mm.neck, upperBust: 0 };

function draft(spec) {
  // `locketTop` is deliberately NOT on the web spec surface (bugra_parity_check
  // §1.6: the blind comparison must never be able to select Bugra's memorised
  // values). It IS an engine axis, so the two-layer case is driven straight at
  // the wasm boundary instead of through a widened consumer vocabulary — no new
  // word enters the menu (madde 9).
  const es = E.engineSpec(spec);
  // Int-valued axis at the wasm boundary (specparse kSpecIntAxes): 1 = 'bugra'.
  if (spec.locketTop) es.locketTop = 1;
  const r = JSON.parse(engine.draftJSON(es, BODY));
  if (r.error) throw new Error(`draft: ${r.error}`);
  return r;
}

// ------------------------------------------------------- geometri (yerel)
const D = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function cubic(p0, c) {
  const out = [];
  for (let i = 1; i <= 48; i++) {
    const t = i / 48, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * c.cp1x + 3 * u * t * t * c.cp2x + t * t * t * c.x,
              u * u * u * p0[1] + 3 * u * u * t * c.cp1y + 3 * u * t * t * c.cp2y + t * t * t * c.y]);
  }
  return out;
}
/** Dense polyline of commands[first..last], starting from the point the command
 *  before `first` ends on. Pure reading of the drawn path. */
function edgePoly(piece, first, last) {
  const cmds = piece.commands;
  let cur = null;
  const pts = [];
  for (let i = 0; i < cmds.length; i++) {
    const c = cmds[i];
    if (c.type === 'close') continue;
    if (i === first) { pts.push(cur ? cur : [c.x, c.y]); }
    if (i >= first && i <= last) {
      if (c.type === 'curve' && cur) for (const p of cubic(cur, c)) pts.push(p);
      else pts.push([c.x, c.y]);
    }
    cur = [c.x, c.y];
  }
  return pts;
}
function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += D(pts[i - 1], pts[i]); return L; }
function rolBoyu(piece, role) {
  if (!piece || !piece.edgeRoles) return 0;
  let L = 0;
  for (const r of piece.edgeRoles) if (r.role === role) L += polyLen(edgePoly(piece, r.first, r.last));
  return L;
}
const kol = (p) => p.pieces.find((x) => /(^|\s)Sleeve$/.test(x.name));
const oyukMM = (p) => rolBoyu(p.pieces.find((x) => /Front$/.test(x.name) && (x.edgeRoles || []).some((r) => r.role === 'armhole_front')), 'armhole_front')
                    + rolBoyu(p.pieces.find((x) => /Back$/.test(x.name) && (x.edgeRoles || []).some((r) => r.role === 'armhole_back')), 'armhole_back');

const SPEC_DUZ = { garment: 'top', shaping: 'dart', fabric: 'woven', neckline: 'crew',
                   sleeveStyle: 'straight', sleeveLength: 'short', topLength: 'hip' };
const SPEC_PUF = { ...SPEC_DUZ, sleeveCap: 'puffed' };
const SPEC_YUM = { ...SPEC_DUZ, sleeveCap: 'gathered' };
const SPEC_BALON = { garment: 'top', shaping: 'dart', fabric: 'woven', neckline: 'crew',
                     sleeveStyle: 'balloon', sleeveLength: 'long', topLength: 'hip' };
const SPEC_BALON_PUF = { ...SPEC_BALON, sleeveCap: 'puffed' };

const dDuz = draft(SPEC_DUZ), dPuf = draft(SPEC_PUF), dYum = draft(SPEC_YUM);
const dBalon = draft(SPEC_BALON), dBalonPuf = draft(SPEC_BALON_PUF);

// =================================================================== (a) OPT-IN
console.log('\n--- (a) OPT-IN: buzgu yalniz adini verdigi kenara dokunur');
{
  const other = (p) => JSON.stringify(p.pattern.pieces
    .filter((x) => !/Sleeve/.test(x.name))
    .map((x) => [x.name, x.commands, x.markings]));
  if (other(dDuz) !== other(dPuf)) FAIL('(a) puf spec, kol disindaki parcalari da degistirmis');
  else OK(`(a) kol disindaki ${dDuz.pattern.pieces.filter((x) => !/Sleeve/.test(x.name)).length} parca bayt-ayni`);
  // Düz kapakta operatör hiç koşmaz: tek bir büzgü işareti yok.
  const n = (kol(dDuz.pattern).notches || []).length;
  if (n !== 0) FAIL(`(a) duz kapakta ${n / 2} buzgu isareti var — operator opt-in degil`);
  else OK('(a) duz kapakta sifir buzgu isareti (opt-in)');
  // Ve düz kapağın fazlalığı EASE bandındadır, büzgü değil.
  const oran = rolBoyu(kol(dDuz.pattern), 'sleeve_cap') / oyukMM(dDuz.pattern);
  if (oran >= R_YUM) FAIL(`(a) duz kapak orani ${oran.toFixed(4)} — olculmus buzgu tabanina (${R_YUM}) ulasiyor`);
  else OK(`(a) duz kapak orani ${oran.toFixed(4)} < buzgu tabani ${R_YUM} (ease, buzgu degil)`);
}

// ==================================================================== (b) ORAN
console.log('\n--- (b) ORAN: cizili kapak yayi = oran x cizili kol oyugu yayi (%1)');
for (const [ad, d, R] of [['puffed', dPuf, R_PUF], ['gathered', dYum, R_YUM], ['balloon+puffed', dBalonPuf, R_PUF]]) {
  const cap = rolBoyu(kol(d.pattern), 'sleeve_cap');
  const ah = oyukMM(d.pattern);
  if (!(cap > 0 && ah > 0)) { FAIL(`(b) ${ad}: kenar olculemedi (cap ${cap}, oyuk ${ah})`); continue; }
  const oran = cap / ah;
  const sapma = Math.abs(oran - R) / R;
  if (sapma > 0.01) FAIL(`(b) ${ad}: oran ${oran.toFixed(4)} != ilan ${R} (sapma %${(sapma * 100).toFixed(2)}) — cap ${cap.toFixed(2)} / oyuk ${ah.toFixed(2)} mm`);
  else OK(`(b) ${ad}: cap ${cap.toFixed(2)} / oyuk ${ah.toFixed(2)} = ${oran.toFixed(4)} (ilan ${R}, sapma %${(sapma * 100).toFixed(2)})`);
}

// ================================================================ (c) ISARETLER
console.log('\n--- (c) ISARETLER: kapak kenari boyunca esit dagilmis');
{
  const s = kol(dPuf.pattern);
  const role = (s.edgeRoles || []).find((r) => r.role === 'sleeve_cap');
  const poly = edgePoly(s, role.first, role.last);
  const total = polyLen(poly);
  // Her işaret bir Move + bir Line; ortası tikin orta noktası. Kapak büzgüsü
  // `markings`e basılır (yukarıdaki (c) notu), ve düz kolun markings'i taban:
  // ARADAKİ FARK büzgü işaretleridir, sayısı bu dosyada değil operatörde durur.
  const taban = (kol(dDuz.pattern).markings || []).length;
  const nots = (s.markings || []).slice(taban);
  const merkez = [];
  for (let i = 0; i + 1 < nots.length; i += 2)
    merkez.push([(nots[i].x + nots[i + 1].x) / 2, (nots[i].y + nots[i + 1].y) / 2]);
  if (!merkez.length) { FAIL('(c) puf kapaginda hic buzgu isareti yok'); }
  else {
    // Her işaretin kenar üstündeki yay konumu.
    const kum = [0];
    for (let i = 1; i < poly.length; i++) kum.push(kum[i - 1] + D(poly[i - 1], poly[i]));
    // Arc position by EXACT projection onto the polyline (not nearest vertex:
    // the samples sit ~5 mm apart, so snapping alone would print a 2 mm error
    // that belongs to the measurement, not to the operator).
    const s_ = merkez.map((m) => {
      let best = 0, bd = Infinity;
      for (let i = 1; i < poly.length; i++) {
        const a = poly[i - 1], b = poly[i];
        const vx = b[0] - a[0], vy = b[1] - a[1];
        const L2 = vx * vx + vy * vy;
        const u = L2 > 0 ? Math.max(0, Math.min(1, ((m[0] - a[0]) * vx + (m[1] - a[1]) * vy) / L2)) : 0;
        const px = a[0] + vx * u, py = a[1] + vy * u;
        const dd = Math.hypot(px - m[0], py - m[1]);
        if (dd < bd) { bd = dd; best = kum[i - 1] + Math.sqrt(L2) * u; }
      }
      return best;
    }).sort((a, b) => a - b);
    const araliklar = [s_[0], ...s_.slice(1).map((v, i) => v - s_[i]), total - s_[s_.length - 1]];
    const ort = araliklar.reduce((a, b) => a + b, 0) / araliklar.length;
    const enKotu = Math.max(...araliklar.map((v) => Math.abs(v - ort) / ort));
    if (enKotu > 0.01) FAIL(`(c) isaret araliklari esit degil: ${araliklar.map((v) => v.toFixed(1)).join(' / ')} mm (en kotu sapma %${(enKotu * 100).toFixed(2)})`);
    else OK(`(c) ${merkez.length} isaret, araliklar ${araliklar.map((v) => v.toFixed(1)).join(' / ')} mm (sapma %${(enKotu * 100).toFixed(2)})`);
  }
  // Balon + puf İKİ UÇLU: kapakta VE etekte işaret var — ve ikisi ayrı
  // operatör çağrısından geldiği için ayrı katmanlarda durur (kapak markings,
  // etek notches). "İki uçlu" = ikisi de dolu.
  const b = kol(dBalonPuf.pattern);
  const etek = (b.notches || []).length / 2;
  const kapak = ((b.markings || []).length - (kol(dBalon.pattern).markings || []).length) / 2;
  if (!(etek > 0 && kapak > 0))
    FAIL(`(c) balon iki-uclu degil: etek ${etek}, kapak ${kapak} isaret`);
  else OK(`(c) balon iki-uclu: etek buzgusu ${etek} isaret + kapak buzgusu ${kapak} isaret`);
}

// ===================================================================== (d) FLAT
console.log('\n--- (d) FLAT: buzgu cizgileri var, kol olculebilir bicimde dolgun');
{
  const alanOf = (svg, yan = 'sag') => {
    const re = /<path[^>]*data-rol="kol"[^>]*d="([^"]+)"[^>]*>|<path[^>]*d="([^"]+)"[^>]*data-rol="kol"[^>]*>/g;
    const paths = [...svg.matchAll(/<path\b[^>]*>/g)].map((m) => m[0])
      .filter((t) => /data-rol="kol"/.test(t) && t.includes(`data-yan="${yan}"`) && t.includes('data-view="front"'));
    if (!paths.length) return 0;
    const d = /d="([^"]+)"/.exec(paths[0])[1];
    const nums = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
    let A = 0;
    for (let i = 0; i + 3 < nums.length; i += 2) {
      A += nums[i] * nums[i + 3] - nums[i + 2] * nums[i + 1];
    }
    return Math.abs(A) / 2;
  };
  const svgDuz = (await flatSVG(SPEC_DUZ, { size: 'EU38' })).svg;
  const svgPuf = (await flatSVG(SPEC_PUF, { size: 'EU38' })).svg;
  const svgBalonPuf = (await flatSVG(SPEC_BALON_PUF, { size: 'EU38' })).svg;

  const bzDuz = (svgDuz.match(/data-rol="buzgu"/g) || []).length;
  const bzPuf = (svgPuf.match(/data-rol="buzgu"/g) || []).length;
  if (bzDuz !== 0) FAIL(`(d) buzgusuz cizimde ${bzDuz} buzgu cizgisi var`);
  else OK('(d) buzgusuz cizimde sifir buzgu cizgisi');
  if (bzPuf < 2) FAIL(`(d) puf cizimde buzgu cizgisi yok (${bzPuf})`);
  else OK(`(d) puf cizimde ${bzPuf} buzgu cizgisi`);

  // Kanunun ilan ettiği sınıfla çizilmiş mi (agirlik + kesik cifti)?
  const LAWBZ = LAW.sevkPoz.buzgu;
  if (!LAWBZ) FAIL('(d) kanunda buzgu sinifi ilan edilmemis (contract/flat-convention-v1.json sevkPoz.buzgu)');
  else {
    const kotu = [...svgPuf.matchAll(/<path\b[^>]*data-rol="buzgu"[^>]*>/g)].map((m) => m[0])
      .filter((t) => {
        const w = /stroke-width="([\d.]+)"/.exec(t);
        return !w || Number(w[1]) !== Number(LAWBZ.width) || /stroke-dasharray=/.test(t);
      });
    if (kotu.length) FAIL(`(d) ${kotu.length} buzgu cizgisi kanunun sinifinda degil (${LAWBZ.width}, duz)`);
    else OK(`(d) butun buzgu cizgileri kanunun sinifinda (${LAWBZ.width}, duz)`);
  }
  // Oran ÇİZİMDE de ilan ediliyor mu, ve kalıbın ölçtüğü sayı mı?
  const ilan = /data-buzgu-kapak-oran="([\d.]+)"/.exec(svgPuf);
  const olculen = rolBoyu(kol(dPuf.pattern), 'sleeve_cap') / oyukMM(dPuf.pattern);
  if (!ilan) FAIL('(d) cizim buzgu oranini ILAN etmiyor (data-buzgu-kapak-oran)');
  else if (Math.abs(Number(ilan[1]) - olculen) > 0.005)
    FAIL(`(d) cizimin ilan ettigi oran ${ilan[1]} != kalibin olculen orani ${olculen.toFixed(4)}`);
  else OK(`(d) cizim orani ILAN ediyor ve kalipla ayni: ${ilan[1]}`);

  const aDuz = alanOf(svgDuz), aPuf = alanOf(svgPuf), aBalonPuf = alanOf(svgBalonPuf);
  if (!(aDuz > 0 && aPuf > 0)) FAIL('(d) kol path alani olculemedi');
  else if (!(aPuf > aDuz * 1.05))
    FAIL(`(d) puf kol dolgun degil: alan ${aPuf.toFixed(0)} vs duz ${aDuz.toFixed(0)} mm2 (x${(aPuf / aDuz).toFixed(3)})`);
  else OK(`(d) puf kol alani ${aPuf.toFixed(0)} mm2, duz kol ${aDuz.toFixed(0)} mm2 — x${(aPuf / aDuz).toFixed(3)} dolgun`);
  if (aBalonPuf > 0) OK(`(d) balon+puf kol alani ${aBalonPuf.toFixed(0)} mm2`);

  // TARAK KAPSAMASI (hakem maddesi 5). Uc dik tik bir centik cizimidir, buzgu
  // degil: referans 09'da tarak kapak dikisinin 0.87'sini kapliyor. Kapsama
  // TAUTOLOJI olmasin diye cizici, taragin uzerinde durdugu dikisin cizili
  // boyunu path'e yaziyor (data-buzgu-dikis-mm); burada isaretlerin ACIKLIGI
  // o boyla kiyaslanir.
  const TARAK = LAW.sevkPoz.buzgu.tarak;
  const kapakTik = [...svgPuf.matchAll(/<path([^>]*data-buzgu="kapak"[^>]*)>/g)]
    .map((m) => m[1])
    .filter((a) => /data-yan="sag"/.test(a) && /data-view="front"/.test(a))
    .map((a) => {
      const d = /d="([^"]+)"/.exec(a)[1].match(/-?\d+\.?\d*/g).map(Number);
      return [(d[0] + d[2]) / 2, (d[1] + d[3]) / 2];
    });
  const dikisMM = Number((/data-buzgu-dikis-mm="([\d.]+)"/.exec(svgPuf) || [])[1]);
  if (!(kapakTik.length > 1) || !(dikisMM > 0)) {
    FAIL(`(d) tarak olculemedi: ${kapakTik.length} tik, dikis ${dikisMM} mm`);
  } else {
    const xs = kapakTik.map((p) => p[0]), ys = kapakTik.map((p) => p[1]);
    const aciklik = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const kapsama = aciklik / dikisMM;
    const bek = Math.round(1 / TARAK.aralikOran) - 1;
    if (kapakTik.length !== bek)
      FAIL(`(d) tarak ${kapakTik.length} tik cizdi, kanunun araligi (${TARAK.aralikOran}) ${bek} istiyor`);
    else if (kapsama < TARAK.kapsamaOranMin)
      FAIL(`(d) tarak kapak dikisinin ${(kapsama * 100).toFixed(0)}%'ini kapliyor, taban %${TARAK.kapsamaOranMin * 100}`);
    else OK(`(d) tarak ${kapakTik.length} tik, kapak dikisinin %${(kapsama * 100).toFixed(0)}'ini kapliyor (taban %${TARAK.kapsamaOranMin * 100}, referans 09'da %87)`);
  }
}

// ============================================================== (e) IKI KATMAN
console.log('\n--- (e) IKI KATMAN: Bugra emsali cizilir, olmayan konakta ADIYLA reddedilir');
{
  // Buğra Locket konağı: iki katmanlı puf (dış büzgülü Upper + gerçek set-in
  // Lower), motorun locketTop ekseninden. Yeni bir SÖZCÜK eklenmedi (madde 9).
  const KONAK = { garment: 'top', shaping: 'dart', fabric: 'woven', neckline: 'crew',
                  topLength: 'cropped', sleeveStyle: 'straight', sleeveLength: 'short',
                  sleeveCap: 'puffed', frontPlacket: true, collarType: 'crescent',
                  locketTop: 'bugra' };
  let d;
  try { d = draft(KONAK); } catch (e) { d = null; FAIL(`(e) iki katmanli konak draft edilemedi: ${e.message}`); }
  if (d) {
    const ust = d.pattern.pieces.find((p) => /Upper Sleeve/i.test(p.name));
    const alt = d.pattern.pieces.find((p) => /Lower Sleeve/i.test(p.name));
    if (!ust || !alt) FAIL(`(e) iki katman cizilmedi (parcalar: ${d.pattern.pieces.map((p) => p.name).join(', ')})`);
    else {
      // Dış katman gerçekten büzgülü olmalı: üst kenarı iç katmanınkinden UZUN.
      const uW = Math.max(...ust.commands.filter((c) => c.type !== 'close').map((c) => c.x)) -
                 Math.min(...ust.commands.filter((c) => c.type !== 'close').map((c) => c.x));
      const aW = Math.max(...alt.commands.filter((c) => c.type !== 'close').map((c) => c.x)) -
                 Math.min(...alt.commands.filter((c) => c.type !== 'close').map((c) => c.x));
      if (!(uW > aW)) FAIL(`(e) dis katman ic katmandan genis degil (${uW.toFixed(1)} vs ${aW.toFixed(1)} mm) — buzgu yok`);
      else OK(`(e) iki katman cizildi: Upper ${uW.toFixed(1)} mm > Lower ${aW.toFixed(1)} mm (buzgu payi x${(uW / aW).toFixed(3)})`);
    }
  }
  // Ve konak DEĞİLKEN: sessizce tek katman çizip susmuyor, ADIYLA reddediyor.
  const YANLIS = { garment: 'top', shaping: 'dart', fabric: 'woven', neckline: 'crew',
                   topLength: 'hip', sleeveStyle: 'straight', sleeveLength: 'long',
                   sleeveCap: 'puffed', locketTop: 'bugra' };
  const r = draft(YANLIS);
  const red = (r.pattern.guideSteps || []).find((g) => /skipped|reddedildi|refus/i.test(g) && /Locket|buzgu/i.test(g));
  const katman = r.pattern.pieces.filter((p) => /Upper Sleeve|Lower Sleeve/i.test(p.name)).length;
  if (katman > 0) FAIL('(e) konak degilken de iki katman cizilmis');
  else if (!red) FAIL(`(e) konak degilken SESSIZ tek katman cizildi — adiyla reddetmedi. rehber: ${(r.pattern.guideSteps || []).slice(-2).join(' | ')}`);
  else OK(`(e) konak degilken adiyla reddetti: "${red.slice(0, 110)}..."`);
}

// =========================================== (f) MOTORUN KENDI C++ KAPILARI
// Hakem maddesi 4. Bu dosyanin ilk hali wasm hattini olcup yesil basiyordu,
// motorun kendi `sleeve_check`'i ise ayni ozellik icin 45 kez kirmiziydi. Bir
// kapi, olctugu hatti kendi secemez: burada C++ kapilari KOSULUR.
console.log('\n--- (f) MOTORUN KENDI C++ KAPILARI: sleeve_check + locket_check');
{
  for (const [ad, sart] of [['sleeve_check', /all sleeve checks pass/],
                            ['locket_check', /ALL LOCKET CHECKS PASS/]]) {
    const bin = join(ROOT, 'engine/build', ad);
    if (!existsSync(bin)) { FAIL(`(f) ${ad} derlenmemis (${bin}) — kapi olculemedi`); continue; }
    const r = spawnSync(bin, { encoding: 'utf8' });
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    const kirmizi = out.split('\n').filter((l) => /\[FAIL\]|FAILED/.test(l));
    if (!sart.test(out))
      FAIL(`(f) ${ad} KIRMIZI (${kirmizi.length} satir): ${kirmizi.slice(0, 3).join(' | ')}`);
    else OK(`(f) ${ad} yesil (${out.split('\n').filter((l) => /\[PASS\]/.test(l)).length} hukum)`);
  }
  // Ve ayni iki hukum, cizilen kaliptan bagimsiz olarak.
  const kirisMM = (p) => {
    const c = p.commands.filter((x) => x.type !== 'close');
    return Math.max(...c.map((x) => x.x)) - Math.min(...c.map((x) => x.x));
  };
  const duz = kol(dDuz.pattern), puf = kol(dPuf.pattern), yum = kol(dYum.pattern);
  for (const [ad, p] of [['puffed', puf], ['gathered', yum]]) {
    const k = kirisMM(p), k0 = kirisMM(duz);
    if (!(k > k0 + 5)) FAIL(`(f) ${ad} taci duz tactan genis degil (${k.toFixed(1)} vs ${k0.toFixed(1)} mm)`);
    else OK(`(f) ${ad} taci duz tactan genis: ${k.toFixed(1)} > ${k0.toFixed(1)} mm (x${(k / k0).toFixed(3)})`);
  }
  // Kapak yuksekligi = tacin y=0'indan bicep hattina. Aldrich EU38 bandi
  // 13-15cm (knowledge/cap-ease-isareti-2026-08-17.md 2. bolum) — motor bu
  // bedende cizdigi kalibi o bandin USTUNE cikaramaz.
  // Kapak yuksekligi = tacin tepesi (y minimum) ile bicep hattinin (kapak
  // kenarinin kirisi, yani parcanin ilk noktasi) arasi — `sleeve_check`'in
  // capTopY'siyle ayni okuma.
  const capH = (p) => {
    const c = p.commands.filter((x) => x.type !== 'close');
    return p.commands[0].y - Math.min(...c.map((x) => x.y));
  };
  for (const [ad, p, band] of [['duz', duz, true], ['puffed', puf, true], ['gathered', yum, true]]) {
    void band;
    const h = capH(p);
    if (!(h >= 130 && h <= 150))
      FAIL(`(f) ${ad} EU38 kapak yuksekligi ${h.toFixed(1)} mm — yayinlanmis Aldrich bandi 130-150 mm disinda`);
    else OK(`(f) ${ad} EU38 kapak yuksekligi ${h.toFixed(1)} mm, Aldrich bandi 130-150 mm icinde`);
  }
}

console.log(fail ? `\nBUZGU KATMAN: ${fail} FAIL` : '\nBUZGU KATMAN: hepsi yesil');
process.exit(fail ? 1 : 0);
