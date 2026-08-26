#!/usr/bin/env node
// ⭐ op.split KAPISI — BÖLME YERİ GEOMETRİDEN Mİ DÜŞÜYOR? (GECE7 / F5-C)
//
// ---------------------------------------------------------------------------
// NE ÖLÇÜLÜYOR, VE NEDEN BUNLAR.
//
// §4A'nın kuyruğunda `op.split` paydanın beş giysisinden DÖRDÜNÜ bloke ediyordu
// (hakem ölçtü). Sözleşmenin taslağı ona bir `atFraction` parametresi veriyordu
// ve bir kesir bir KADRANDIR: bölmeyi operatör olmaktan çıkarıp tekrar bir
// preset'e çevirir. `suppressPanel()`'in açı parametresi olmaması emsaldir.
// O yüzden bu kapının birinci sorusu "panel ikiye ayrıldı mı" değil, "BÖLME
// YERİ nereden geldi" sorusudur.
//
//   SP0  BÖLME YERİ BU BETİKTE YENİDEN HESAPLANIYOR.
//        Kapının en önemli kolu. Araç panelin KENDİ sütun-deficit profilini
//        basıyor; bu betik o profilden argmin'i BAĞIMSIZ olarak yeniden
//        çıkarıyor ve aracın söylediği sütunla karşılaştırıyor. Bölme yerini
//        bir sabite çeviren mutasyon tam burada yanar — ve sabitin bugünkü
//        sayıya eşit seçilmesi bile kurtarmaz, çünkü kol BEŞ koşumun BEŞİNDE
//        birden koşuyor ve koşumlar farklı sütun veriyor.
//
//   SP1  YENİ SÜTUN PROFİLİ, MOTORUN ESKİ SAYISININ TA KENDİSİ.
//        `deficitColumnDeg` F5-C'de eklendi. Toplamı `developDeficitDeg`'e
//        birebir eşit olmak zorunda: aynı köşe-açı defekti, aynı iç-düğüm
//        kümesi, sadece satır yerine sütuna toplanmış. Eşit değilse motorda
//        İKİ AYRI deficit modeli var demektir ve bu, surfacepattern.cpp'nin
//        sürekli öldürdüğü hata sınıfıdır.
//
//   SP2  BÖLMEDE İŞARETLİ DEFICIT KORUNUR — ölçülür, iddia edilmez.
//        A + B = bütün, 1e-9'da.
//
//   SP3  ALAN KORUNUR, VE KESİLEN KENAR İKİ TARAFTA AYNI UZUNLUKTA.
//        İki parçanın alanı toplamı bütünün alanı; kesiğin A parçasındaki
//        kapanış segmenti ile B parçasındakinin uzunluğu birebir eşit (walk
//        emsali: dikilecek iki kenar).
//        ⚠ ÇEVRENİN KORUNACAĞI VARSAYILMADI (K29'un dersi: `rotate`'te "çevre
//        korunur" YANLIŞ bir kapıydı). Ölçüldü, KORUNMUYOR, ve korunmadığı bir
//        KİMLİK olarak yargılanıyor: cevre_a + cevre_b = cevre_butun + 2·kesik.
//
//   SP4  İKİ PARÇA DA KENDİNİ KESMİYOR ve nokta sayıları n+2'de tutuyor.
//        Panelin dışına çıkan bir kiriş burada yanar.
//
//   SP5  BÖLME YERİ SABİT DEĞİL — beş koşum en az iki ayrı kesir veriyor.
//        Bir `atFraction` da tam böyle görünürdü; §4A'nın istediği "bölme bir
//        SAYIDAN düşer" bu değildir.
//
//   SP6  ⭐ İŞARETLİ TOPLAMIN GİZLEDİĞİ İPTAL — REPODA HİÇBİR KAPININ
//        ÖLÇMEDİĞİ SAYI. `developDeficitDeg` işaretli bir toplamdır: bir
//        panelde +30 ile −30 birbirini götürür, sayı 0 basar, ve op.suppress'in
//        RET eşiği dahil her tüketici o 0'ı "bastıracak bir şey yok" diye okur.
//        Bölme tam olarak bunu açığa çıkaran işlemdir. Kapı iptali her koşumda
//        BASAR ve en az bir koşumda ölçülmüş olmasını şart koşar.
//
//   SP7  RET GEREKÇELİ. Profili düz olan panel (koni, ve etek) bölünmez ve
//        neden bölünmediğini bir SAYIYLA söyler. Gerekçesiz ret, sessiz
//        düşürmedir (RULES 1).
//
//   SP8  BORÇ 44 / K38 — YÜK GERÇEKTEN BÖLÜNÜYOR MU?
//        `op.suppress` tek panele TEK kama açıyordu: 55.1735°, motorun kendi
//        `SheathOptions::maxDartDeg = 14` ilanının dört katı. Bölmeden sonra
//        aynı yük iki kamaya düşüyor ve toplamı korunuyor. Kapı bunu ölçüyor:
//        bölünen her koşumda kama_en_buyuk_sonra < kama_butun.
//        ⚠ 14'E AYAR YAPILMADI (§3.10). 14 motorun ÇOK-PENSLİ yerleşimine ait
//        bir sayıdır, tek kamaya uygulanacağının yayınlanmış dayanağı
//        görülmedi, ve bir eşiği bugünkü sayıya uydurmak K29'un yasakladığı
//        şeydir. Sayı YAN YANA basılır, eşitlenmez — ve bugün hâlâ TUTMUYOR.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = process.argv[2] || path.join(HERE, "..", "build", "split-op");
const FIKSTUR = TOOL.endsWith(".json");

const EPS_ACI = 1e-9;    // derece — korunum, gürültü değil sıfır bekleniyor
const EPS_ALAN = 1e-6;   // mm² — aynı poligonun parçalanması
const EPS_KESIK = 1e-9;  // mm — iki taraf aynı iki koordinatı birleştiriyor
const EPS_CEVRE = 1e-6;  // mm — çevre KİMLİĞİ

let fails = 0;
const fail = (m) => { console.log(`FAIL  ${m}`); fails++; };
const ok = (m) => console.log(`ok    ${m}`);

if (!existsSync(TOOL)) {
  console.log(`FAIL  ${FIKSTUR ? "op fikstürü" : "split-op"} bulunamadı: ${TOOL}`);
  console.log(FIKSTUR ? "      (ctest fikstürü koşmadı)"
                      : "      (cmake --build engine/build --target split-op)");
  process.exit(1);
}

const r = JSON.parse(FIKSTUR ? readFileSync(TOOL, "utf8")
                             : execFileSync(TOOL, ["EU38"], { encoding: "utf8",
                                                              maxBuffer: 64 << 20 }));
if (r.op !== "split") {
  console.log(`FAIL  girdi "split" değil, "${r.op}" taşıyor: ${TOOL}. Başka bir operatörün ` +
              `çıktısını op.split sanmak, kapıyı ilgisiz bir sayıya bağlar (K35'in sınıfı).`);
  process.exit(1);
}
const kosumlar = r.kosumlar || [];

console.log("=== op.split — PANEL BÖLME · beden EU38");
console.log(`    kesim kaynağı: ${r.kesim_kaynagi}`);
console.log(`    kural        : ${r.kural}`);
console.log(`    koşum sayısı : ${kosumlar.length}\n`);
for (const k of kosumlar)
  console.log(`    ${String(k.etiket).padEnd(20)} ${k.bolundu
    ? `BÖLÜNDÜ sütun ${String(k.kesim_sutunu).padStart(2)}/${k.sutun_sayisi} ` +
      `(kesir ${k.kesim_kesri_OLCULEN.toFixed(6)})`
    : "BÖLMEDİ"}  ·  ${k.yuzey}`);
console.log();

const bolunen = kosumlar.filter((k) => k.bolundu);
const reddeden = kosumlar.filter((k) => !k.bolundu);
if (!kosumlar.length) fail("çıktıda hiç koşum YOK.");
if (!bolunen.length)
  fail("hiçbir koşumda panel BÖLÜNMEDİ. Hiçbir şey bölmeyen bir bölme operatörü " +
       "bir operatör değildir.");
if (!reddeden.length)
  fail("hiçbir koşumda RET yok. Sevk edilen giysinin düz profilli paneline de 'böldüm' " +
       "diyen bir araç, operatörün ürüne ne dediğini gizler (F5-B'nin S1 dersi).");

// --- SP0: BÖLME YERİ BU BETİKTE YENİDEN HESAPLANIYOR ----------------------
//
// Aracın bastığı sütun profilinden argmin'i bağımsız olarak çıkarıyoruz. Bu,
// header'da yazılı kuralın ta kendisi ve BAŞKA HİÇBİR ŞEY: eşik yok, kesir yok.
for (const k of bolunen) {
  const prof = k.sutun_deficit_deg || [];
  const ad = k.panel.padEnd(12);
  if (prof.length !== k.sutun_sayisi + 1) {
    fail(`SP0 ${ad} profil ${prof.length} kalem, sütun sayısı ${k.sutun_sayisi} ` +
         `(beklenen ${k.sutun_sayisi + 1}). Profil bu panelin değil.`);
    continue;
  }
  const T = prof.reduce((a, b) => a + b, 0);
  let en = -1, sutun = -1, cum = prof[0];
  for (let c = 1; c < k.sutun_sayisi; c++) {
    cum += prof[c];
    const kotu = Math.max(Math.abs(cum), Math.abs(T - cum));
    if (en < 0 || kotu < en) { en = kotu; sutun = c; }
  }
  if (sutun === k.kesim_sutunu)
    ok(`SP0 ${ad} bölme yeri ÖLÇÜLEN profilden: sütun ${sutun}/${k.sutun_sayisi} — ` +
       `bu betik profili bağımsız tarayıp aynı sütunu buldu (en kötü yarı ${en.toFixed(4)}°)`);
  else
    fail(`SP0 ${ad} araç sütun ${k.kesim_sutunu} diyor, panelin KENDİ profili sütun ${sutun} ` +
         `diyor. Bölme yeri panelin geometrisinden düşmüyor — bir yerden yazılıyor.`);
}

// --- SP1: yeni sütun profili, motorun eski sayısının ta kendisi -----------
for (const k of kosumlar) {
  const ad = k.panel.padEnd(12);
  const prof = k.sutun_deficit_deg || [];
  const T = prof.reduce((a, b) => a + b, 0);
  if (Math.abs(k.sutun_toplami_deg - k.deficit_butun_deg) < EPS_ACI &&
      Math.abs(T - k.deficit_butun_deg) < 1e-6)
    ok(`SP1 ${ad} sütun profilinin toplamı ${k.sutun_toplami_deg}° = panelin ` +
       `developDeficitDeg'i ${k.deficit_butun_deg}° — tek deficit modeli`);
  else
    fail(`SP1 ${ad} sütun toplamı ${k.sutun_toplami_deg}° (basılan profilden ${T.toFixed(6)}°), ` +
         `panelin developDeficitDeg'i ${k.deficit_butun_deg}°. Motorda İKİ AYRI deficit ` +
         `modeli var; hangisinin doğru olduğunu hiçbir kapı söyleyemez.`);
}

// --- SP2: işaretli deficit KORUNUR ---------------------------------------
for (const k of bolunen) {
  const ad = k.panel.padEnd(12);
  if (Math.abs(k.deficit_toplam_deg - k.deficit_butun_deg) < EPS_ACI)
    ok(`SP2 ${ad} deficit KORUNDU: ${k.deficit_a_deg}° + ${k.deficit_b_deg}° = ` +
       `${k.deficit_toplam_deg}° (bütün ${k.deficit_butun_deg}°)`);
  else
    fail(`SP2 ${ad} A ${k.deficit_a_deg}° + B ${k.deficit_b_deg}° = ${k.deficit_toplam_deg}°, ` +
         `bütün ${k.deficit_butun_deg}°. Bölme eğrilik üretti ya da yuttu.`);
}

// --- SP3: ALAN korunur · KESİK iki tarafta aynı · ÇEVRE KORUNMAZ ---------
for (const k of bolunen) {
  const ad = k.panel.padEnd(12);
  if (Math.abs(k.alan_toplam_mm2 - k.alan_butun_mm2) < EPS_ALAN)
    ok(`SP3 ${ad} ALAN KORUNDU: ${k.alan_a_mm2} + ${k.alan_b_mm2} = ${k.alan_toplam_mm2}mm² ` +
       `(bütün ${k.alan_butun_mm2}mm²)`);
  else
    fail(`SP3 ${ad} alan ${k.alan_a_mm2} + ${k.alan_b_mm2} = ${k.alan_toplam_mm2}mm², bütün ` +
         `${k.alan_butun_mm2}mm². Bölme kumaş üretti ya da yuttu.`);

  const dk = Math.abs(k.kesik_a_mm - k.kesik_b_mm);
  if (dk < EPS_KESIK && k.kesik_a_mm > 0)
    ok(`SP3 ${ad} KESİLEN KENAR iki tarafta AYNI: ${k.kesik_a_mm}mm ↔ ${k.kesik_b_mm}mm ` +
       `(fark ${dk.toExponential(1)}mm) — dikilebilir bir çift`);
  else
    fail(`SP3 ${ad} kesik A ${k.kesik_a_mm}mm, B ${k.kesik_b_mm}mm, fark ${dk}. Eşit ` +
         `olmayan iki kenar dikilemez (walk'un kendi sorusu).`);

  // KORUNMAYAN — bir eşitlik olarak DEĞİL bir kimlik olarak yargılanır (K29).
  const beklenen = k.cevre_butun_mm + 2 * k.kesik_a_mm;
  const toplam = k.cevre_a_mm + k.cevre_b_mm;
  if (Math.abs(toplam - beklenen) < EPS_CEVRE)
    console.log(`      ↳ KORUNMAYAN (K29): ÇEVRE korunmaz ve korunur demek YANLIŞ bir kapı ` +
                `olurdu. Kimlik tutuyor: ${k.cevre_a_mm} + ${k.cevre_b_mm} = ` +
                `${toplam.toFixed(4)} = ${k.cevre_butun_mm} + 2×${k.kesik_a_mm.toFixed(4)}`);
  else
    fail(`SP3 ${ad} çevre kimliği TUTMUYOR: ${toplam.toFixed(6)} ≠ ${beklenen.toFixed(6)}. ` +
         `İki parçanın sınırı, bütünün sınırı artı iki kesik değil — bölme bir ` +
         `parçalanma değil.`);
}

// --- SP4: iki parça da kesilebilir bir parça -----------------------------
for (const k of bolunen) {
  const ad = k.panel.padEnd(12);
  if (!k.a_kendini_kesiyor && !k.b_kendini_kesiyor)
    ok(`SP4 ${ad} iki parça da kendini KESMİYOR (${k.nokta_a} + ${k.nokta_b} nokta)`);
  else
    fail(`SP4 ${ad} parça kendini KESİYOR (A ${k.a_kendini_kesiyor}, B ${k.b_kendini_kesiyor}). ` +
         `Kesilemeyen bir parça bir kalıp değildir; kiriş panelin dışına çıkmış.`);

  if (k.nokta_a + k.nokta_b === k.panel_nokta + 2)
    ok(`SP4 ${ad} nokta sayısı tutuyor: ${k.nokta_a} + ${k.nokta_b} = ` +
       `${k.panel_nokta} + 2 (kesiğin iki ucu iki parçada da var, yeni nokta UYDURULMADI)`);
  else
    fail(`SP4 ${ad} ${k.nokta_a} + ${k.nokta_b} = ${k.nokta_a + k.nokta_b}, panel ` +
         `${k.panel_nokta} + 2 = ${k.panel_nokta + 2}. Bölme sınıra nokta ekliyor ya da ` +
         `düşürüyor.`);
}

// --- SP5: bölme yeri SABİT DEĞİL ----------------------------------------
{
  const ayri = new Set(bolunen.map((k) => k.kesim_kesri_OLCULEN.toFixed(6)));
  if (ayri.size >= 2)
    ok(`SP5 bölme yeri SABİT DEĞİL: ${ayri.size} ayrı ölçülen kesir — ` +
       `${[...ayri].join(" · ")}. Tek bir atFraction bu kolu geçemez.`);
  else
    fail(`SP5 bölünen bütün paneller aynı kesiri (${[...ayri][0]}) basıyor. Bir kesir ` +
         `parametresi de tam böyle görünür; §4A'nın istediği "bölme bir SAYIDAN düşer" ` +
         `bu değildir.`);
}

// --- SP6: ⭐ İŞARETLİ TOPLAMIN GİZLEDİĞİ İPTAL ---------------------------
{
  console.log();
  console.log("--- İŞARETLİ TOPLAMIN GİZLEDİĞİ EĞRİLİK (repoda ilk kez ölçülüyor) ---");
  let olculen = 0;
  for (const k of kosumlar) {
    const beklenen = k.mutlak_sutun_toplami_deg - Math.abs(k.sutun_toplami_deg);
    if (Math.abs(beklenen - k.iptal_olan_deg) > 1e-6) {
      fail(`SP6 ${k.panel}: iptal ${k.iptal_olan_deg}°, |sütun| toplamı ` +
           `${k.mutlak_sutun_toplami_deg}° eksi |işaretli| ${Math.abs(k.sutun_toplami_deg)}° = ` +
           `${beklenen.toFixed(6)}°. Sayı kendi tanımını tutmuyor.`);
      continue;
    }
    if (k.iptal_olan_deg > 0) olculen++;
    console.log(`  ${k.panel.padEnd(12)} işaretli ${String(k.sutun_toplami_deg).padStart(9)}°  ` +
                `mutlak ${String(k.mutlak_sutun_toplami_deg).padStart(9)}°  ` +
                `İPTAL OLAN ${String(k.iptal_olan_deg).padStart(9)}°` +
                (k.bolundu ? `  → bölmeden sonra A ${k.iptal_a_deg}° · B ${k.iptal_b_deg}°` : ""));
  }
  if (olculen)
    ok(`SP6 ${olculen} panelde işaretli toplam gerçekten eğrilik GİZLİYOR ve sayısı ` +
       `basıldı. op.suppress'in RET eşiği bu işaretli sayıyı okuyor; hiçbir kapı bugüne ` +
       `kadar iptali ölçmemişti (F5-B hakemi: DOĞRULANMADI).`);
  else
    fail(`SP6 hiçbir panelde iptal ölçülmedi. F5-B hakeminin uyarısı (bir panelde +30/−30 ` +
         `birbirini götürüp operatörü yanlışlıkla "reddet"e sürükleyebilir) bu koşumda ` +
         `sınanmamış demektir — sınanmayan bir uyarı kapatılmış sayılmaz.`);
}

// --- SP7: RET gerekçeli, ve gerekçesi bir SAYI --------------------------
console.log();
for (const k of reddeden) {
  const ad = k.panel.padEnd(12);
  if (!String(k.ret_gerekcesi || "").length)
    fail(`SP7 ${ad} ret gerekçesi BOŞ. Neden bölmediğini söylemeyen bir ret, bir ` +
         `çökmeden ayırt edilemez (RULES 1).`);
  else if (!(k.mutlak_sutun_toplami_deg < k.taban_deg))
    fail(`SP7 ${ad} reddedildi ama mutlak sütun toplamı ${k.mutlak_sutun_toplami_deg}° ` +
         `≥ taban ${k.taban_deg}°. Gerekçesiz ret, sessiz düşürmedir.`);
  else
    ok(`SP7 ${ad} BÖLMEDİ: mutlak sütun profili ${k.mutlak_sutun_toplami_deg}° < taban ` +
       `${k.taban_deg}° — profil DÜZ, hiçbir sütun bir yer adlandırmıyor`);
}

// --- SP8: BORÇ 44 / K38 — yük gerçekten bölünüyor mu? -------------------
console.log();
console.log("--- BORÇ 44 / K38: TEK KAMA ↔ BÖLÜNMÜŞ YÜK, ve maxDartDeg YAN YANA ---");
for (const k of bolunen) {
  const ad = k.panel.padEnd(12);
  if (k.kama_butun_deg <= 0) {
    console.log(`  ${ad} bütün panelde op.suppress zaten REDDEDİYOR (deficit ` +
                `${k.deficit_butun_deg}°); bölünecek bir bastırma yükü YOK`);
    continue;
  }
  if (k.kama_en_buyuk_sonra_deg < k.kama_butun_deg - EPS_ACI)
    ok(`SP8 ${ad} YÜK BÖLÜNDÜ: tek kama ${k.kama_butun_deg}° → iki kama ` +
       `${k.kama_a_deg}° + ${k.kama_b_deg}° (toplam ${k.deficit_toplam_deg}°, KORUNDU); ` +
       `en büyüğü ${k.kama_en_buyuk_sonra_deg}°`);
  else
    fail(`SP8 ${ad} bölmeden sonra en büyük kama ${k.kama_en_buyuk_sonra_deg}° ≥ tek kama ` +
         `${k.kama_butun_deg}°. Bölme bastırma yükünü BÖLMÜYOR; borç 44 kapanmaz.`);
  const kat = k.kama_en_buyuk_sonra_deg / k.motor_maxDartDeg;
  console.log(`      ↳ YAN YANA (§3.10, AYARLANMADI): motorun kendi ilanı ` +
              `SheathOptions::maxDartDeg = ${k.motor_maxDartDeg}°; bölmeden sonraki en büyük ` +
              `kama ${k.kama_en_buyuk_sonra_deg}° = ${kat.toFixed(2)}× — ` +
              `${kat > 1 ? "HÂLÂ TUTMUYOR" : "tutuyor"}. 14 motorun ÇOK-PENSLİ yerleşimine ` +
              `ait bir sayıdır; tek kamaya uygulanacağının YAYINLANMIŞ DAYANAĞI GÖRÜLMEDİ, ` +
              `ve 14'e uyacak bir bölme seçmek eşiği bugünkü sayıya uydurmak olurdu (K29).`);
}

console.log();
if (fails) {
  console.log(`FAIL split_check — ${fails} ihlal`);
  process.exit(1);
}
console.log(`split_check: YESIL — ${bolunen.length} panelde bölme yeri panelin KENDİ ölçülen ` +
            `sütun-deficit profilinden düştü (kol bu betikte yeniden hesaplandı), ` +
            `${reddeden.length} panelde profil DÜZ olduğu için REDDETTİ, alan ve işaretli ` +
            `deficit korundu, kesilen kenar iki tarafta birebir aynı, çevre KORUNMADI ve ` +
            `kimliğiyle basıldı, ve işaretli toplamın gizlediği eğrilik ilk kez ölçüldü.`);
