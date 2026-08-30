// style_check — GOLDEN-PIN'in görsel kardeşi. Damla "kalemim" dediği her flat
// render'ı REPO PİNİNE (engine/STYLE-PIN/<style>.svg) diff'ler. Üretim flat
// çıktısı pinli SVG ile byte-identical değilse FAIL. Regen-vs-regen kanıt değil:
// daima repo pinine karşı.
//   node engine/tests/style_check.mjs
// Her pinli stil için üretim yolunu (renderGarmentFlatAsync) yeniden koşar,
// pin SVG'siyle cmp eder. FAIL mesajı iki dürüst yolu gösterir.
//
// ── KAPININ KAPSAMI PİN DİZİNİNDEN DEĞİL, STİL SÖZLÜĞÜNDEN GELİR ────────────
// T17'de bu kapı "PASS (nothing to enforce)" basıyordu: pin dizini yoktu, pin
// sayısı 0'dı, 0 pin 0 hüküm demekti. TUR 9 o özel hâli FAIL'e çevirdi — ama
// hüküm listesi HÂLÂ pin dizininden okunuyordu, yani kapı "elinde ne varsa
// onu" doğruluyordu. 31 stilin 1'i pinlenseydi kapı YEŞİL basardı ve geri
// kalan 30 kalem korumasız kalırdı: aynı sessiz-yeşil sınıfının küçük hâli.
// repin-style.sh --status bunu zaten İLAN ediyordu ("31 olana kadar kırmızı
// kalır") ama kodda bir karşılığı yoktu; RULES §1: kodda zorlanmayan bir
// garanti YOKTUR.
//
// Bu yüzden hüküm listesi artık engine/flat-engine/styles.json'dur:
//   beklenen pin kümesi = styles.json'daki HER stil anahtarı.
//   eksik pin        -> FAIL (pin sayısı 0 ise de, 30 ise de aynı kural).
//   sahipsiz pin     -> FAIL (styles.json'da olmayan bir .svg sessizce sayılmaz).
//   pin != render    -> FAIL (byte diff).
// "0 pin" artık ÖZEL BİR DAL DEĞİL, bu kuralın bir sonucudur. Özel dal silinse
// bile 0 pin yeşile düşemez, çünkü 0 pin = 31 eksik pin.
// Sözlüğün kendisi okunamaz/boşsa da FAIL: "0 stil = 0 şart" aynı tuzağın
// bir üst katıdır.
//
// Pin'i BU TEST kendi çıktısından ÜRETEMEZ — üretirse regen-vs-regen olur ve
// kalem kendi kendini onaylamış olur (dosyanın kendi yasası, satır 3-4).
// Tek dürüst çıkış: Damla kalemi onaylar, repin script'i pinler, defter yazılır.

import { readFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const PIN_DIR = join(root, 'engine/STYLE-PIN');
const STYLES_JSON = join(root, 'engine/flat-engine/styles.json');
const REL_PIN = 'engine/STYLE-PIN';

function howToPin(keys) {
  console.log('  Pin bir ÖLÇÜM değil bir KARARDIR — bu test onu kendi çıktısından ÜRETEMEZ');
  console.log('  (regen-vs-regen kanıt değildir; kalem kendi kendini onaylayamaz).');
  console.log('  Tek dürüst çıkış: Damla render\'a bakar, onaylar, sonra:');
  for (const k of keys.slice(0, 3)) {
    console.log(`    scripts/repin-style.sh ${k} "<beyan etiketi>"`);
  }
  if (keys.length > 3) console.log(`    ... (kalan ${keys.length - 3} stil için aynı komut)`);
  console.log(`  Her pin ${REL_PIN}/<style>.svg + ${REL_PIN}/STYLE-PIN.md defter girdisi yazar;`);
  console.log('  ikisi AYNI commit\'e girer. Onay ÖLÇÜMDEN değil KARARDAN gelir: script');
  console.log('  render\'ı açar, Damla terminale "bu benim kalemim" yazar, ancak o zaman');
  console.log('  pin donar. Boru hattından beslenen onay (tty olmayan stdin) reddedilir.');
  console.log('  Durum: scripts/repin-style.sh --status');
}

// ── 1. HÜKÜM LİSTESİ: stil sözlüğü ──────────────────────────────────────────
let styleKeys = [];
try {
  const doc = JSON.parse(readFileSync(STYLES_JSON, 'utf8'));
  styleKeys = Object.keys(doc.styles ?? {});
} catch (err) {
  console.log(`style_check FAIL: stil sözlüğü okunamadı (${STYLES_JSON}).`);
  console.log(`  ${err.message}`);
  console.log('  Sözlük olmadan kapının kapsamı YOKTUR ve kapsamsız kapı kapı değildir.');
  console.log('  Bu dal bilerek FAIL: sözlük kaybolunca test "0 stil, şart yok" deyip');
  console.log('  yeşile düşerse T17\'nin sessiz-yeşili geri gelir.');
  process.exit(1);
}
if (!styleKeys.length) {
  console.log(`style_check FAIL: ${STYLES_JSON} 0 stil anahtarı taşıyor.`);
  console.log('  "0 stil = 0 şart = yeşil" T17 sessiz-yeşilinin ta kendisidir; bu dal FAIL.');
  process.exit(1);
}
styleKeys.sort();

// ── 2. PİN KÜMESİ ───────────────────────────────────────────────────────────
const pinFiles = existsSync(PIN_DIR)
  ? readdirSync(PIN_DIR).filter((f) => f.endsWith('.svg')).sort()
  : [];
const pinnedKeys = new Set(pinFiles.map((f) => basename(f, '.svg')));

const missing = styleKeys.filter((k) => !pinnedKeys.has(k));
const orphans = [...pinnedKeys].filter((k) => !styleKeys.includes(k)).sort();

console.log(`style_check kapsam: ${styleKeys.length - missing.length}/${styleKeys.length} stil pinli` +
  ` (sözlük: engine/flat-engine/styles.json)`);

let failed = 0;

// ── 3. KAPSAM HÜKMÜ — eksik pin FAIL'dir, sayısı kaç olursa olsun ───────────
if (missing.length) {
  failed++;
  if (missing.length === styleKeys.length) {
    console.log(`style_check FAIL: pinlenmiş stil 0 — ${REL_PIN} yok/boş, ${styleKeys.length} stilin hepsi korumasız.`);
    console.log('  Bu kapı T17\'ye kadar bu hâlde YEŞİL basıyordu ve hiçbir kalemi tutmuyordu.');
    console.log('  Kalem yasası pinsiz koşamaz; sessiz skip yasak.');
  } else {
    console.log(`style_check FAIL: ${missing.length} stilin pini YOK — kapı bu stiller için hüküm veremez.`);
    console.log('  KISMİ PİN YEŞİL SAYILMAZ: kapı elindeki pinleri değil, sözlüğün tamamını korur.');
    console.log('  (Aksi hâlde 31 stilin 1\'i pinlenip kalan 30\'u sessizce korumasız kalırdı.)');
  }
  for (const k of missing) console.log(`    PİN YOK  ${k}`);
  howToPin(missing);
}

// ── 4. SAHİPSİZ PİN — sözlükte olmayan pin sessizce sayılmaz ────────────────
if (orphans.length) {
  failed++;
  console.log(`style_check FAIL: ${orphans.length} sahipsiz pin — ${REL_PIN}'de var, styles.json'da yok.`);
  for (const k of orphans) console.log(`    SAHİPSİZ  ${k}.svg`);
  console.log('  Ya stil sözlükten düştü (pini + defter satırını da düşür),');
  console.log('  ya da anahtar yanlış yazıldı. Sahipsiz pin hiçbir şeyi korumaz.');
}

// ── 5. BYTE DIFF — pinli her stil KALEMİN KENDİSİNDEN yeniden koşulur ───────
//
// H3 (2026-08-30) — YARGILANAN KALEM DEĞİŞMEDİ, ÇAĞRI YOLU DEĞİŞTİ.
// Bu satır 30 Ağustos'a kadar `renderGarmentFlatAsync` çağırıyordu. O fonksiyon
// İKİ kalemdi: önce REFERANS kalemi (engine/flat-engine/_engine-full.mjs, Damla'nın
// "kalemim" dediği, styles.json'un sözlüğü olduğu kalem) dener, eşleşme yoksa
// croquis üretim kalemine (web/lib/flat-core.js) DÜŞERDİ. H3 croquis kalemini sildi.
// Bu kapının hükmü ondan hiç etkilenmedi: kapsamı `styles.json` — yani referans
// kalemin sözlüğü — ve pinlenen SVG'yi hep referans kalem basıyordu; düşüş dalı bu
// stiller için zaten hiç çalışmıyordu. Tek doğru çağrı yolu bu yüzden köprünün
// kendisidir: engine/tools/reference-flat.mjs.
//
// null = EŞLEŞME YOK ve bu bir KIRMIZI'dır, bir atlama değil: sözlükte adı olan
// bir stilin kalemden çizim alamaması, kapının koruduğu şeyin ta kendisinin
// kaybolduğu anlamına gelir.
const { renderReferenceFlat } = await import('../tools/reference-flat.mjs');

for (const styleKey of styleKeys.filter((k) => pinnedKeys.has(k))) {
  const file = `${styleKey}.svg`;
  const pinned = readFileSync(join(PIN_DIR, file), 'utf8');
  const fresh = await renderReferenceFlat({ referenceStyle: styleKey });
  if (fresh == null) {
    failed++;
    console.log(`style_check FAIL: ${styleKey} — referans kalem bu stil için çizim VERMEDİ (null).`);
    console.log('  Sözlükte adı var, kalemde karşılığı yok: pin neyi koruduğunu bilmiyor.');
    continue;
  }
  if (fresh === pinned) {
    console.log(`style_check PASS: ${styleKey} byte-identical to pin (${pinned.length} chars)`);
  } else {
    failed++;
    console.log(`style_check FAIL: ${styleKey} differs from the REPO PIN (${REL_PIN}/${file}).`);
    console.log(`  fresh: ${fresh.length} chars   pin: ${pinned.length} chars`);
    console.log('  Two honest ways out:');
    console.log('    1. UNINTENDED change -> fix the flat code until this passes.');
    console.log('    2. INTENDED pen revision -> Damla re-approves, then scripts/repin-style.sh');
    console.log(`       + a ledger entry in ${REL_PIN}/STYLE-PIN.md.`);
    console.log('  Regen-vs-regen is not a style proof; always diff against the repo pin.');
  }
}

process.exit(failed ? 1 : 0);
