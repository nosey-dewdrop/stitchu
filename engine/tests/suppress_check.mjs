#!/usr/bin/env node
// ⭐ op.suppress KAPISI — BASTIRMA AÇISI GEOMETRİDEN Mİ DÜŞÜYOR? (GECE7 / F5-B)
//
// ---------------------------------------------------------------------------
// NE ÖLÇÜLÜYOR, VE NEDEN BUNLAR.
//
// §4A ve HEDEF.md'nin kanunu tek cümle: **pens formülden değil YÜZEY
// EĞRİLİĞİNDEN düşer.** O yüzden bu kapının birinci sorusu "bir kama açıldı mı"
// değil, "kamanın AÇISI nereden geldi" sorusudur. `suppressPanel()`'in bir açı
// parametresi YOKTUR; açıyı panelin kendi `developDeficitDeg`'inden okur. Kapı
// bunu bir cümleye değil üç ölçüme bağlar:
//
//   S1  SEVK EDİLEN GİYSİDE OPERATÖR **REDDEDİYOR**, ve sayısıyla.
//       Bu kapının en önemli satırı ve en rahatsız edici olanı. Sevk edilen
//       sınıfın adı `top/dart/woven` ama sekiz panelinin sekizinde de pens YOK
//       (K28). Sebebi artık bir sayı: skimBodice gövdeyi KONİYE çeviriyor, koni
//       birebir açılıyor, panelin develop-deficit'i NEGATİF (-1.9628°) — yani
//       bastırılacak bir şey yok. Bir eyeri pens yutamaz; olmayan bastırmayı
//       "açtım" diye işaretlemek, motorun kendi ölçtüğü 8.929%'luk bacak
//       gerinimini üretmenin yoludur (surfacepattern.cpp, clamp notu).
//
//   S2  AÇI SABİT DEĞİL — İKİ AYRI YÜZEY İKİ AYRI SAYI VERİYOR.
//       Bir sabiti "ölçüldü" diye basmanın tek panzehiri budur: aynı operatör
//       farklı panellerde farklı açı basmak ZORUNDA. Bugün ön 55.1735°, arka
//       56.6688°. Tek bir `constexpr` bu kolu geçemez.
//
//   S3  BASTIRMA KUMAŞI **GÖTÜRÜYOR**, ve KAMA ÇIKAN GEOMETRİDEN OKUNUYOR.
//       İki ayrı kol, ikisi de KESİN:
//         (a) alan KESİNLİKLE azaldı — bastırma kumaş götürür, götürmeyen bir
//             "bastırma" bir etikettir;
//         (b) `kama_olculen_deg`, yani çıkan konturda apeksin gerçekten
//             gerdiği açı, ölçülen deficit'e 1e-9'da eşit. "Açıldı" alanını
//             set edip geometriye dokunmayan bir mutasyon tam burada yanar.
//       ⚠ SEKTÖR ALANI KIYASI RAPORDUR, KAPI DEĞİL (K29). `kama_sektor` =
//       0.5·L²·θ, yani kamayı L yarıçaplı bir DAİRE DİLİMİ sayar; süpürülen
//       sınır ise panelin kendi kenarı. Aradaki fark türetilmemiş bir ŞEKİL
//       terimi: ölçüldü, ön panelde %3.40, arka panelde %10.06. %10.06'yı
//       geçirecek bir tolerans seçmek, eşiği bugünkü sayıya UYDURMAK olurdu —
//       uydurma eşik kapısızlıktan kötüdür. O yüzden basılıyor, kapıya
//       bağlanmıyor.
//
// ---------------------------------------------------------------------------
// ⚠ 41.48° BU KAPININ ŞARTI DEĞİLDİR VE OLMAYACAK.
//
// Gerçek Buğra Locket pensi 41.48° (develop-deficit, flatten-research/16).
// Ölçülen sayı 55.1735°. **TUTMUYOR, ve tutmuyor diye yazılıyor** (§3.10):
// 41.48 BAŞKA bir gövdedeki BAŞKA bir giysinin sayısıdır, ve bir kadranı
// başka bir kalıptan ödünç alınmış sayı tutana kadar oynatmak bu koşunun
// yasakladığı şeyin ta kendisidir. Kapı sayıyı yan yana BASAR, eşitlemez.
//
// ---------------------------------------------------------------------------
// ⚠ ÇİFT BASTIRMA — ÖLÇÜLDÜ, GİZLENMEDİ (S5).
// Motorun kendi türettiği pensler AÇIKKEN aynı panele bir kama daha açmak
// paneli KENDİNE KESTİRİYOR: artık deficit 27.8788°, giden alan 11417mm²,
// sektör 24427mm² — ikinci kesik birincilerin bacaklarını yiyor. Bu yüzden
// operatörün çalıştığı panel `maxDartDeg = 0` ile BÜTÜN geliyor, ve bu bir
// kaçamak değil bir ölçüm: kapı çift bastırmanın kestiğini de doğruluyor, yani
// yapılandırma seçimi bir yorum satırı değil bir kırmızı/yeşil.
//
// ⏱ GİRDİ İKİ BİÇİMDE GELEBİLİR (GECE7 / F5-C İŞ 0a, borç 43): bir ARAÇ yolu
// (eski davranış, araç burada koşar) ya da suppress-op'un `-o` ile yazdığı bir
// `.json`. İkincisi süitin ölçülen borcunu kapatır: araç 375.74 sn sürüyor ve
// `rotate_check` ile `suppress_check` onu AYRI AYRI koşturduğu için o hesap iki
// kez ödeniyordu. Ölçülen hiçbir sayı değişmez — okunan JSON aynı ikilinin aynı
// koşumundan gelir; yalnız ikinci koşum kalkar. Kapı ne zayıflar ne gevşer.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = process.argv[2] || path.join(HERE, "..", "build", "suppress-op");
const FIKSTUR = TOOL.endsWith(".json");

const EPS_ACI = 1e-9;      // derece — kama açısı ÖLÇÜLEN deficit'in ta kendisi
const EPS_TRUE = 1e-9;     // mm — iki bacak inşadan eşit
const EPS_APEKS = 1e-9;    // mm — apeks derinliği = frac × sütun
const BUGRA_DEG = 41.48;   // künyeli, YALNIZ RAPOR — hiçbir kol buna eşitlemez

let fails = 0;
const fail = (m) => { console.log(`FAIL  ${m}`); fails++; };
const ok = (m) => console.log(`ok    ${m}`);

if (!existsSync(TOOL)) {
  console.log(`FAIL  ${FIKSTUR ? "op fikstürü" : "suppress-op"} bulunamadı: ${TOOL}`);
  console.log(FIKSTUR ? "      (ctest fikstürü op_fixture koşmadı)"
                      : "      (cmake --build engine/build --target suppress-op)");
  process.exit(1);
}

const r = JSON.parse(FIKSTUR ? readFileSync(TOOL, "utf8")
                             : execFileSync(TOOL, ["EU38"], { encoding: "utf8",
                                                              maxBuffer: 64 << 20 }));
if (r.op !== "suppress") {
  console.log(`FAIL  fikstür "suppress" değil, "${r.op}" taşıyor: ${TOOL}. Başka bir ` +
              `operatörün çıktısını op.suppress sanmak, kapıyı ilgisiz bir sayıya bağlar.`);
  process.exit(1);
}
const kosumlar = r.kosumlar || [];

console.log("=== op.suppress — BASTIRMA · beden EU38");
console.log(`    açı kaynağı: ${r.aci_kaynagi}`);
console.log(`    koşum sayısı: ${kosumlar.length}\n`);
for (const k of kosumlar)
  console.log(`    ${String(k.etiket).padEnd(20)} deficit ${String(k.deficit_deg).padStart(9)}°  ` +
              `${k.acildi ? `AÇILDI ${k.kama_deg}°` : "REDDETTİ"}  ·  ${k.yuzey}`);
console.log();

const red = kosumlar.filter((k) => !k.acildi);
const acik = kosumlar.filter((k) => k.acildi && !k.kesisme_bekleniyor);
const cift = kosumlar.filter((k) => k.kesisme_bekleniyor);

// --- S1: sevk edilen giysi — operatör REDDEDİYOR, ve K28'in kökü bir sayı ---
{
  const sevk = kosumlar.filter((k) => String(k.etiket).startsWith("sevk_edilen"));
  if (!sevk.length) {
    fail("S1 çıktıda sevk edilen giysinin koşumu YOK. Operatörün ürüne ne dediğini " +
         "basmayan bir kapı, operatörün ürüne değmediğini gizler.");
  }
  for (const k of sevk) {
    if (k.acildi) {
      fail(`S1 ${k.panel}: deficit ${k.deficit_deg}° ile kama AÇILMIŞ. Sevk edilen gövde bir ` +
           `KONİ (skimBodice) ve konisi birebir açılır; negatif/sıfır deficit'te açılan bir ` +
           `kama, yüzeyin hiç istemediği bastırmayı uydurur.`);
    } else if (!(k.deficit_deg <= k.esik_deg)) {
      fail(`S1 ${k.panel}: reddedildi ama deficit ${k.deficit_deg}° > eşik ${k.esik_deg}°. ` +
           `Gerekçesiz ret, sessiz düşürmedir (RULES 1).`);
    } else if (!String(k.ret_gerekcesi || "").length) {
      fail(`S1 ${k.panel}: ret gerekçesi BOŞ. Neden reddettiğini söylemeyen bir ret, ` +
           `bir çökmeden ayırt edilemez.`);
    } else if (k.planda_pens_sayisi !== 0) {
      fail(`S1 ${k.panel}: operatör "bastıracak bir şey yok" diyor ama planda ` +
           `${k.planda_pens_sayisi} pens var. İki kaynak çelişiyor.`);
    } else {
      ok(`S1 ${k.panel} REDDETTİ: deficit ${k.deficit_deg}° ≤ eşik ${k.esik_deg}° — ` +
         `planda pens ${k.planda_pens_sayisi} (K28'in kökü, ARTIK BİR SAYI)`);
    }
  }
}

// --- S2: açı SABİT DEĞİL — ölçülen deficit'in ta kendisi -----------------
{
  for (const k of [...acik, ...cift]) {
    if (Math.abs(k.kama_deg - k.deficit_deg) < EPS_ACI)
      ok(`S2 ${k.panel.padEnd(12)} kama açısı = ÖLÇÜLEN deficit: ${k.kama_deg}° ` +
         `(fark ${Math.abs(k.kama_deg - k.deficit_deg).toExponential(1)}°)`);
    else
      fail(`S2 ${k.panel}: kama ${k.kama_deg}° ≠ deficit ${k.deficit_deg}°. Operatör ölçtüğü ` +
           `sayıyı değil başka bir sayıyı açıyor.`);
  }
  const ayri = new Set([...acik, ...cift].map((k) => k.kama_deg.toFixed(4)));
  if (ayri.size >= 2)
    ok(`S2 açı SABİT DEĞİL: ${ayri.size} ayrı ölçülen değer — ${[...ayri].join("° · ")}°. ` +
       `Tek bir constexpr bu kolu geçemez.`);
  else
    fail(`S2 açılan bütün kamalar aynı açıyı (${[...ayri][0]}°) basıyor. Bir sabit de tam ` +
         `böyle görünür; §4A'nın istediği "pens bir SAYIDAN düşer" bu değildir.`);
}

// --- S3: alan KESİNLİKLE gitti + kama ÇIKAN GEOMETRİDEN okundu -----------
for (const k of [...acik, ...cift]) {
  const ad = k.panel.padEnd(12);
  if (k.alan_giden_mm2 > 0 && k.alan_sonra_mm2 < k.alan_once_mm2)
    ok(`S3 ${ad} alan ${k.alan_once_mm2} -> ${k.alan_sonra_mm2}mm², GİDEN ` +
       `${k.alan_giden_mm2}mm² — bastırma kumaşı gerçekten götürdü`);
  else
    fail(`S3 ${ad} alan ${k.alan_once_mm2} -> ${k.alan_sonra_mm2}mm², giden ` +
         `${k.alan_giden_mm2}. BASTIRMA KUMAŞI GÖTÜRÜR; götürmeyen bir "bastırma" ` +
         `bir etikettir (F5-A'nın dersi).`);

  if (Math.abs(k.kama_olculen_deg - k.deficit_deg) < EPS_ACI)
    ok(`S3 ${ad} ÇIKAN konturda apeksin gerdiği açı ${k.kama_olculen_deg}° = ölçülen ` +
       `deficit ${k.deficit_deg}° — "açıldı" bir alan değil, bir geometri`);
  else
    fail(`S3 ${ad} çıkan konturda apeks ${k.kama_olculen_deg}° geriyor, ölçülen deficit ` +
         `${k.deficit_deg}°. Rapor "açıldı" diyor ama geometri o kamayı taşımıyor.`);

  const bagil = Math.abs(k.alan_giden_mm2 - k.kama_sektor_alani_mm2) /
                Math.max(k.kama_sektor_alani_mm2, 1e-9);
  console.log(`      ↳ RAPOR (kapı DEĞİL, K29): sektör ${k.kama_sektor_alani_mm2}mm², ` +
              `bağıl fark ${(bagil * 100).toFixed(2)}% — türetilmemiş şekil terimi, ` +
              `eşik UYDURULMADI`);
}

// --- S4: TRUE bacaklar · apeks OKUNMUŞ · panel kendini KESMİYOR ----------
for (const k of acik) {
  const ad = k.panel.padEnd(12);
  if (k.bacak_true_mm < EPS_TRUE)
    ok(`S4 ${ad} BACAKLAR TRUE: ${k.bacak_a_mm} ↔ ${k.bacak_b_mm}mm (fark ${k.bacak_true_mm})`);
  else
    fail(`S4 ${ad} bacaklar TRUE değil: ${k.bacak_a_mm} ↔ ${k.bacak_b_mm}mm, fark ` +
         `${k.bacak_true_mm}. Eşit olmayan iki bacak dikilemez.`);

  const beklenen = k.apeks_frac * k.sutun_uzunluk_mm;
  if (Math.abs(k.apeks_derinlik_mm - beklenen) < EPS_APEKS)
    ok(`S4 ${ad} apeks derinliği motorun kesirinden: ${k.apeks_frac} × ` +
       `${k.sutun_uzunluk_mm}mm = ${k.apeks_derinlik_mm}mm (${k.apeks_frac_kaynak})`);
  else
    fail(`S4 ${ad} apeks derinliği ${k.apeks_derinlik_mm}mm, kesir × sütun ` +
         `${beklenen.toFixed(4)}mm. Derinlik motorun ilan ettiği kesirden düşmüyor.`);

  if (!k.kendini_kesiyor)
    ok(`S4 ${ad} panel kendini KESMİYOR — kesilebilir bir parça`);
  else
    fail(`S4 ${ad} panel kendini KESİYOR. Kesilemeyen bir parça bir kalıp değildir.`);
}

// --- S5: ÇİFT BASTIRMA gerçekten kesiyor — yapılandırma seçimi ÖLÇÜLÜ ----
{
  if (!cift.length) {
    fail("S5 çift bastırma koşumu YOK. `maxDartDeg = 0` ile çalışmanın gerekçesi bir yorum " +
         "satırı olarak kalır; bir yorum kapı değildir.");
  }
  for (const k of cift) {
    if (k.kendini_kesiyor)
      ok(`S5 ${k.panel.padEnd(12)} ÇİFT BASTIRMA paneli KESİYOR (artık deficit ` +
         `${k.deficit_deg}°, giden ${k.alan_giden_mm2}mm² ↔ sektör ` +
         `${k.kama_sektor_alani_mm2}mm²) — operatörün BÜTÜN panelde koşmasının ölçülmüş sebebi`);
    else
      fail(`S5 ${k.panel} çift bastırmada panel artık KESMİYOR. Bu bir iyileşme olabilir, ama ` +
           `operatörün yapılandırma gerekçesi bu ölçüme dayanıyordu — hakeme gelir, ` +
           `sessizce güncellenmez.`);
  }
}

// --- 41.48 YAN YANA — RAPOR, EŞİTLİK DEĞİL ------------------------------
console.log();
console.log(`--- 41.48° İLE YAN YANA (Buğra Locket pensi, flatten-research/16) ---`);
for (const k of [...acik, ...cift]) {
  const fark = k.deficit_deg - BUGRA_DEG;
  console.log(`  ${k.panel.padEnd(12)} ölçülen ${String(k.deficit_deg).padStart(9)}°  ` +
              `Buğra ${BUGRA_DEG}°  fark ${fark >= 0 ? "+" : ""}${fark.toFixed(4)}°  ` +
              `→ TUTMUYOR (ayarlanmadı, §3.10)`);
}
for (const k of red)
  console.log(`  ${k.panel.padEnd(12)} ölçülen ${String(k.deficit_deg).padStart(9)}°  ` +
              `→ KAMA YOK; Buğra'nın 41.48°'i bu giysinin sayısı DEĞİL`);

console.log();
if (fails) {
  console.log(`FAIL suppress_check — ${fails} ihlal`);
  process.exit(1);
}
console.log(`suppress_check: YESIL — ${red.length} panelde operatör REDDETTİ (deficit ≤ eşik), ` +
            `${acik.length} panelde kamayı panelin KENDİ ölçülen deficit'inden açtı, ` +
            `hiçbiri kendini kesmiyor, ve 41.48° yalnız yan yana basıldı.`);
