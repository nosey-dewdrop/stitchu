#!/usr/bin/env node
// flat_mirror_check.mjs — YÜZEY HATTININ AYNA SABİTLERİ KAPISI (H3-B, 2026-08-30).
//
// ═══ NİYE VAR: BİR KAPI SESSİZCE ÖLDÜ, YERİNİ BU ALIYOR ═════════════════════
// `ba8106c8`'de ctest'te `flat_tables_check` adında bir kapı vardı ve hükmü tek
// cümleydi (engine/CMakeLists.txt, F-INDIR 2. tur):
//
//     "Kapısı olmayan ÜRETİLMİŞ bir ayna, İKİNCİ BİR DOĞRUDUR."
//
// Yargıladığı nesne `web/lib/flat-tables.gen.js` idi: croquis kalemi yayınlanan
// köke taşınınca `contract/`'ı readFileSync edemez olmuş, beş tablo oraya
// KOPYALANMIŞTI. H3 o kalemi ve o kopyayı sildi — ve kapı HEAD'de `add_test`
// olmaktan çıktı. Nesne öldüğü için hüküm de ölmüş sayıldı.
//
// HÜKÜM ÖLMEDİ. Bugün sevk edilen çizici `web/lib/flat-from-plan.js` de tarayıcıya
// gidiyor, o da `contract/`'ı readFileSync EDEMİYOR, ve o da kanunun sayılarını
// KENDİ İÇİNE YAZIYOR — kendi sözleriyle: "the three constants below are a mirror
// of that file and a mirror with no gate on it is a second truth." Aynı sınıf,
// daha az dosya. Bu kapı o üç sabiti (ve ileride eklenecek her ayna sabitini)
// diskteki kanuna vurur.
//
// ═══ NEDEN flat_convention_check YETMİYOR ═══════════════════════════════════
// O kapı ÇIKTIYI ölçer: üretilen SVG'nin çizgi ağırlıkları ve mürekkebi kanuna
// uyuyor mu. Yeterli görünür, ama iki deliği var ve ikisi de ölçüldü:
//   1. wasm paketi (engine/dist/) yoksa o kapı ilk satırda kırmızı düşüp çıkar,
//      yani ayna hiç yargılanmaz. Bu kapının hiçbir bağımlılığı yok: iki dosya
//      okur, hepsi bu — motor derlenmemişken bile koşar.
//   2. ÇİZİLMEYEN bir sabit çıktıda görünmez. Bugün `W_SEAM` yalnızca üst sınır
//      eğrisinde kullanılıyor; yarın kullanılmayan ama beyan edilmiş bir ayna
//      sabiti eklenirse çıktı kapısı onu göremez, bu kapı görür.
//
// ═══ NASIL ÖLÇER — İSİM LİSTESİ ELLE YAZILMIYOR ════════════════════════════
// Çizicinin kaynağında her ayna sabiti YANINDA HEDEFİNİ TAŞIR:
//     const INK = '#1f3a5f';   // contract/flat-convention-v1.json ink.color
// Kapı `const <AD> = <ifade>;  // contract/<dosya>.json <nokta.yolu>` kalıbını tarar,
// dosyayı diskten okur, JSON yolunu çözer ve iki değeri karşılaştırır. Yani
// kapının kendi kanaati YOK: ne hangi sabitlerin var olduğunu, ne de ne
// olmaları gerektiğini bu dosya biliyor. Yeni bir ayna sabiti eklenince kapı
// onu KENDİLİĞİNDEN yargılamaya başlar; yorumu yazmayan kişi ise §2'ye takılır.
//
// §2 — BEYANSIZ AYNA YASAK. `web/lib/` altındaki her modülde, kanunun AYIRT EDİCİ
// bir değeri (mürekkep/kâğıt renk kodu) beyan yorumu OLMADAN geçiyorsa kırmızı:
// bir ikinci doğruyu gizlemenin en kolay yolu onu adsız yazmaktır. Çizgi
// ağırlıkları bilerek dışarıda — gerekçe §2'nin kendi bloğunda, ölçülmüş.
//
// §3 — ÜRETİLMİŞ AYNA MODÜLÜ VARSA ÜRETECİ DE OLACAK. Ölen kapının asıl hükmü
// buydu ve aynen duruyor: `web/lib/*.gen.js` biçiminde bir dosya varsa onu
// yeniden basan bir `--check` üreteci de olmak zorunda. Bugün öyle bir dosya
// YOK ve kapı bunu her koşuda ADIYLA basar — "yok" ile "bakılmadı" iki ayrı şey.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const LIB = join(root, 'web/lib');

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

console.log('=== FLAT AYNA KAPISI (H3-B) — tarayiciya giden sabitler diskteki kanuna vuruluyor');
console.log('    olen kapinin halefi: flat_tables_check (ba8106c8, HEAD\'de add_test DEGIL)');

if (!existsSync(LIB)) { FAIL(`web/lib YOK: ${LIB}`); process.exit(1); }
const MODULLER = readdirSync(LIB).filter((f) => f.endsWith('.js')).sort();
console.log(`    taranan modul: ${MODULLER.join(', ')}`);

// --- 1. BEYAN EDİLMİŞ AYNA SABİTLERİ ---------------------------------------
// `const AD = <ifade>;   // contract/<dosya>.json <nokta.yolu>`
// <ifade> düz bir sabit OLMAK ZORUNDA DEĞİL: pdf-core.js rengi `HEX('#1f3a5f')`
// diye sarıyor. Ayna DEĞERİ ifadenin içindeki ilk tırnaklı dize ya da ilk sayıdır.
const AYNA_RE = /const\s+([A-Za-z0-9_]+)\s*=\s*([^;\n]+);[ \t]*\/\/[ \t]*(contract\/\S+\.json)[ \t]+([A-Za-z0-9_.]+)/g;
const degerCikar = (ifade) => {
  const s = /'([^']*)'|"([^"]*)"/.exec(ifade);
  if (s) return s[1] !== undefined ? s[1] : s[2];
  const n = /-?\d+(?:\.\d+)?/.exec(ifade);
  return n ? n[0] : null;
};
const cozYol = (obj, yol) => yol.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

console.log('\n--- 1. BEYANLI AYNA SABITLERI (deger diskteki kanunla ayni mi)');
let sayilan = 0;
const gorulenDegerler = new Map();   // §2 icin: bu modulde mesru olan sayilar
for (const dosya of MODULLER) {
  const src = readFileSync(join(LIB, dosya), 'utf8');
  for (const m of src.matchAll(AYNA_RE)) {
    const [, ad, ifade, kanunDosya, yol] = m;
    const hamDeger = degerCikar(ifade);
    sayilan += 1;
    if (hamDeger === null) {
      FAIL(`[1] web/lib/${dosya}: ${ad} bir ayna beyan ediyor ama ifadesinde okunacak sabit YOK: ${ifade.trim()}`);
      continue;
    }
    const kanunYol = join(root, kanunDosya);
    if (!existsSync(kanunYol)) {
      FAIL(`[1] web/lib/${dosya}: ${ad} "${kanunDosya}" kanununa atif yapiyor ama o dosya DISKTE YOK`);
      continue;
    }
    let beklenen;
    try { beklenen = cozYol(JSON.parse(readFileSync(kanunYol, 'utf8')), yol); }
    catch (e) { FAIL(`[1] ${kanunDosya} okunamadi: ${e.message}`); continue; }
    if (beklenen === undefined) {
      FAIL(`[1] web/lib/${dosya}: ${ad} -> ${kanunDosya} icinde "${yol}" yolu YOK — beyan bir yere isaret etmiyor`);
      continue;
    }
    const olculen = hamDeger;
    const esit = typeof beklenen === 'number'
      ? Math.abs(Number(olculen) - beklenen) < 1e-12
      : String(olculen).toLowerCase() === String(beklenen).toLowerCase();
    const key = String(hamDeger).toLowerCase();
    gorulenDegerler.set(key, (gorulenDegerler.get(key) || 0) + 1);
    if (!esit) {
      FAIL(`[1] web/lib/${dosya}: ${ad} = ${olculen}, kanun ${kanunDosya} ${yol} = ${JSON.stringify(beklenen)} — AYNA KAYMIS`);
    } else {
      OK(`1 ayna — web/lib/${dosya}: ${ad} = ${olculen} == ${kanunDosya} ${yol}`);
    }
  }
}
if (!sayilan) {
  FAIL('[1] web/lib altinda BEYANLI tek bir ayna sabiti bulunamadi — ya kalip bozuldu ya beyan silindi; ' +
       'ikisi de bu kapiyi kor birakir (kalip: `const AD = deger;  // contract <dosya>.json <nokta.yolu>`)');
} else {
  console.log(`    beyanli ayna sabiti: ${sayilan}`);
}

// --- 2. BEYANSIZ AYNA YASAK ------------------------------------------------
// Kanunun kendi sayilari (murekkep + kagit rengi, cizgi agirliklari) web/lib
// icinde beyan yorumu olmadan geciyorsa: adsiz ikinci dogru.
console.log('\n--- 2. BEYANSIZ AYNA (kanunun sayisi adsiz yaziliysa kirmizi)');
const LAW_YOL = 'contract/flat-convention-v1.json';
const LAW = existsSync(join(root, LAW_YOL))
  ? JSON.parse(readFileSync(join(root, LAW_YOL), 'utf8')) : null;
if (!LAW) {
  FAIL(`[2] kanun diskte YOK: ${LAW_YOL}`);
} else {
  // YALNIZ AYIRT EDİCİ DEĞERLER: mürekkep/kâğıt renk kodları. Çizgi ağırlıkları
  // (1.0 · 1.4 · 2.0) BİLEREK DIŞARIDA — ölçüldü: `1` ve `2` web/lib/pdf-core.js
  // içinde 40+ yerde sayfa kenarı, font boyu ve döngü sayacı olarak geçiyor ve
  // kapı 48 sahte kırmızı basıyordu. Ayırt edici olmayan bir sayıyı kovalayan
  // kural, kapıyı susturulacak bir gürültü kaynağına çevirir; ağırlıkları zaten
  // ÇIKTIDA flat_convention_check §3 ölçüyor (çizilen her elemanın ağırlık+kesik
  // çifti kanunun tablosundan bir sınıfa EŞİT olmak zorunda). Renk kodu ise
  // tesadüfen yazılamaz: geçiyorsa kanundan gelmiştir, beyanı da olmalıdır.
  const izlenen = new Set([String(LAW.ink.color).toLowerCase(), String(LAW.ink.paper).toLowerCase()]);
  const before = fails;
  for (const dosya of MODULLER) {
    const src = readFileSync(join(LIB, dosya), 'utf8');
    // Yorumlar (beyanin kendisi) ve string olmayan baglamlar disarida degil:
    // aranan sey KODDA gecen bir deger. Beyanli satirlari dusuyoruz.
    const kodSatirlari = src.split('\n').filter((l) => !/\/\/[ \t]*contract\/\S+\.json/.test(l));
    for (const deger of izlenen) {
      for (const l of kodSatirlari) {
        if (l.trim().startsWith('//') || l.trim().startsWith('*')) continue;
        const re = new RegExp(`(^|[^\\w.-])${deger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w.-]|$)`);
        if (re.test(l) && !gorulenDegerler.has(deger)) {
          FAIL(`[2] web/lib/${dosya}: kanunun degeri ${deger} BEYANSIZ geciyor -> ${l.trim().slice(0, 90)}`);
        }
      }
    }
  }
  if (fails === before) OK(`2 beyansiz ayna — web/lib icinde kanunun ${izlenen.size} degerinden hicbiri adsiz gecmiyor`);
}

// --- 3. URETILMIS AYNA MODULU -> URETECI OLACAK ----------------------------
// Olen kapinin ASIL hukmu. Bugun boyle bir dosya yok; kapi bunu ADIYLA basar.
console.log('\n--- 3. URETILMIS AYNA MODULU (varsa ureteci de olacak)');
{
  const uretilmis = MODULLER.filter((f) => f.endsWith('.gen.js'));
  if (!uretilmis.length) {
    // ⚠ SILINEN AYNANIN DOSYA ADI BU DIZEDE ANILMAZ — BILEREK. Adi bir KOD dizesine
    // yazmak, flat_pattern_agree_check --all'in "kalemin canli referansi kaldi mi"
    // taramasina takilir (o tarama yorumlari atar, dizeleri atmaz) ve hakli olarak:
    // silinen bir modulun adini calisan koda yazmak yari silinmis bir motordur.
    // Adi bu dosyanin BASLIGINDA, yorumda duruyor.
    OK('3 uretilmis ayna — web/lib altinda uretilmis (*.gen.js) ayna modulu YOK. ' +
       '"Yok" ile "bakilmadi" ayri sey: bu satir her kosuda basilir.');
  } else {
    for (const f of uretilmis) {
      const taban = f.replace(/\.gen\.js$/, '');
      const aday = readdirSync(join(root, 'engine/tools'))
        .filter((t) => t.startsWith('gen-') && t.includes(taban));
      if (!aday.length) {
        FAIL(`[3] web/lib/${f} uretilmis bir ayna ama engine/tools altinda onu yeniden basan ` +
             '`gen-*` ureteci YOK — kapisi olmayan uretilmis ayna = ikinci dogru');
      } else {
        OK(`3 uretilmis ayna — web/lib/${f} <- engine/tools/${aday.join(', ')}`);
      }
    }
  }
}

console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} flat_mirror_check — ${fails} ihlal`);
process.exit(fails === 0 ? 0 : 1);
