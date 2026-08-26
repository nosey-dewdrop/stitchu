#!/usr/bin/env node
// ⭐ op.rotate KAPISI — PENS TRANSFERİ GERÇEKTEN TAŞIYOR MU? (GECE7 / F5-A, K27)
//
// ---------------------------------------------------------------------------
// NE ÖLÇÜLÜYOR, VE NEDEN BU ÜÇÜ.
//
// `rotate` bir RİJİT hareket: pensin bir alt parçası apeks etrafında döner.
// Rijit hareketin hayatta kalan üç niceliği vardır ve kapı tam olarak onlara
// bakar — çünkü "pens taşındı" cümlesini bir ÖLÇÜME çeviren şey onlardır:
//
//   ALAN        birebir korunur. Kumaş yer değiştirir, eklenmez, eksilmez.
//   PENS AÇISI  birebir korunur. Transferin tanımı budur: bastırılan
//               develop-deficit sabit, operatör yalnız NEREDEN çıkacağına karar
//               verir.
//   BACAKLAR    TRUE kalır — inşadan, truing pasından değil: yeni iki bacak bir
//               sınır noktası ile onun apeks etrafındaki döndürülmüş görüntüsü,
//               yani son basamağına kadar eşit.
//
// ⚠ ÇEVRE KORUNMAZ VE "KORUNUR" DEMEK YANLIŞ BİR KAPI OLURDU. Eski pens iki
// bacağını (Lold) götürür, yenisi iki bacak (Lnew) getirir; belde duran bir
// göğüs pensi kol oyuğundaki aynı pensten çok daha uzundur. Kapının çevreye
// dair sorduğu şey bir eşitlik değil bir KİMLİK:
//
//       cevre_sonra  ==  cevre_once  -  2*Lold  +  2*Lnew
//
// ve ölçülen sayı o kimliğin artığıdır. Yanlış bir kapı, kapısızlıktan kötüdür
// (KOSU-v7 §3.8).
//
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ⭐ F5-B: TRANSFER EDİLEN PENS ARTIK BİR FİKSTÜR DEĞİL, VE KAPI BUNU TUTUYOR.
//
// F5-A'da bu kapının R0 kolu `aci_deg == 41.48` diye SABİT bir sayıya bakıyordu
// ve apeks kesri `rotate-op.cpp`'de `constexpr 0.80` olarak duruyordu — künyesi
// yorum satırındaydı, bağı yoktu. Hakem ikisini de ölçtü (HM1, K30): motordaki
// `bodiceApexFrac` 0.60'a çekilince araç hâlâ 0.80 basıyor ve kapı YEŞİL
// kalıyordu. F5-B'de:
//
//   * pensin AÇISI `op.suppress`'ten geliyor ve o da panelin kendi
//     develop-deficit'inden. Kapı bunu bir cümleye değil, İKİ ARACIN
//     karşılaştırılmasına bağlar: rotate-op'un taşıdığı açı, suppress-op'un
//     AYNI panelde ölçtüğü deficit ile birebir aynı olmak ZORUNDA (R0).
//   * apeks kesri `plan.opt.bodiceApexFrac`'tan OKUNUYOR. Kapı bunu iki koşumla
//     kanıtlar: `--apex-frac` motorun alanına girer ve derinlik TAM oranında
//     oynar (R8). Kopyalanmış bir sabit bu kolu geçemez.
//   * ve kesir künyesi artık bir YORUM değil bir EŞİK: R0b motorun ilan ettiği
//     0.80'i pinler, yani motor tarafı kayarsa kapı kırmızı yanar ve künye
//     yeniden okunur (HM1 buradan kırmızıdır).
//
// ⚠ 41.48° BU KAPININ ŞARTI OLMAKTAN ÇIKTI, VE BU BİR GEVŞETME DEĞİL BİR
// BAĞLAMADIR — kart bunu önceden ilan etti ve HAKEME GELİR. Sabit bir sayıya
// bakan kol, `op.suppress` ölçtüğü sayıyı basar basmaz yanlış kapı olurdu:
// ölçülen 55.1735°, Buğra'nın 41.48°'i BAŞKA bir gövdedeki BAŞKA bir giysinin
// sayısı. Kapı artık ölçüme ölçümle bakıyor, 41.48'i YAN YANA basıyor ve
// hiçbir yerde eşitlemiyor (§3.10).
//
// ⚠ VE SEVK EDİLEN GİYSİDE PENS HÂLÂ YOK, KAPI ONU DA BASIYOR (R9). EU38'in
// sekiz panelinin sekizi de `"pens": 0` (K28). Sebebi artık bir sayı: sevk
// edilen gövdenin develop-deficit'i NEGATİF (-1.9628°), skimBodice onu KONİYE
// çeviriyor ve koni birebir açılıyor — bastırılacak bir şey yok, op.suppress
// REDDEDİYOR. Transfer o yüzden motorun DİĞER gövdesinde koşuyor
// (`SheathOptions::skimBodice` kapalı), ve bu araç çıktısının her satırında
// yazılı.
//
// ⏱ R0'IN İKİNCİ GİRDİSİ ARTIK BİR DOSYA DA OLABİLİR (GECE7 / F5-C İŞ 0a).
// K36 KORUNUYOR: R0 hâlâ ÇAPRAZ bir ölçümdür, bir sabit değil — kıyaslanan sayı
// hâlâ `suppress-op`'un motordan okuduğu develop-deficit'tir. Değişen tek şey,
// o aracın süitte KAÇ KEZ koştuğu: 375.74 sn'lik koşum `suppress_check` ile
// burada iki kez ödeniyordu (rotate-op'un kendisi 13.4 sn). Artık bir ctest
// fikstürü aracı BİR KEZ koşturup JSON'unu yazıyor, iki kapı onu okuyor.
// Dosya `op.suppress` çıktısı olmak zorunda ve o da denetleniyor; ilgisiz bir
// JSON göstermek bu kolu KIRMIZI yakar (K35'in ödünç-ad dersinin dosya hâli).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = process.argv[2] || path.join(HERE, "..", "build", "rotate-op");
const SUPPRESS = process.argv[3] || path.join(HERE, "..", "build", "suppress-op");
const SUPPRESS_FIKSTUR = SUPPRESS.endsWith(".json");

const EPS_ALAN = 1e-6;    // mm² — rijit hareket, gürültü değil sıfır bekleniyor
const EPS_ACI = 1e-9;     // derece
const EPS_TRUE = 1e-9;    // mm
const EPS_KIMLIK = 1e-6;  // mm
const BUGRA_DEG = 41.48;  // künyeli: flatten-research/16 — YALNIZ RAPOR, hiçbir kol eşitlemez
const EN_AZ_HEDEF = 2;    // kartın şartı: "en az İKİ hedef, sayıyla"
// Motorun kendi ilan ettiği apeks kesri (SheathOptions::bodiceApexFrac, header'da
// kendi çizim gerekçesiyle). PİN, çünkü künye bir yorum satırı olarak bağlı
// DEĞİLDİ (HM1): motor tarafı kayarsa bu kol kırmızı yanar ve künye elle
// yeniden okunur. Gevşetme değil, yorumun kapıya bağlanması.
const MOTOR_APEKS_FRAC = 0.80;
const APEKS_PROBE = 0.60;  // HM1'in kullandığı değer; oranın ölçülebildiği ikinci koşum

let fails = 0;
const fail = (m) => { console.log(`FAIL  ${m}`); fails++; };
const ok = (m) => console.log(`ok    ${m}`);

if (!existsSync(TOOL)) {
  console.log(`FAIL  rotate-op bulunamadı: ${TOOL}`);
  console.log("      (cmake --build engine/build --target rotate-op)");
  process.exit(1);
}

const r = JSON.parse(execFileSync(TOOL, ["EU38"], { encoding: "utf8", maxBuffer: 64 << 20 }));

console.log("=== op.rotate — PENS TRANSFERİ (pivot) · beden EU38");
console.log(`    panel: ${r.panel} (${r.panel_nokta} nokta) · düğüm ${r.dugum}`);
console.log(`    canlı planda pens sayısı: ${r.canli_planda_pens_sayisi}`);
console.log(`    yüzey  : ${r.yuzey}`);
console.log(`    pens   : op.suppress ${r.pens.aci_deg}° · apeks ${r.pens.apeks_derinlik_mm}mm ` +
            `(frac ${r.pens.apeks_frac})`);
console.log(`    kaynak : ${r.pens.aci_kaynak}\n`);

// --- R0: TAŞINAN AÇI, op.suppress'in AYNI PANELDE ÖLÇTÜĞÜ SAYI MI? ------
//
// İki AYRI aracın çıktısı karşılaştırılıyor. rotate-op bir açı uydursa ya da
// eski sabiti geri koysa, suppress-op'un ölçtüğü deficit ile ayrışır ve bu kol
// kırmızı yanar. Tek bir aracın kendi kendini onaylaması değil.
{
  if (!existsSync(SUPPRESS)) {
    fail(`R0 ${SUPPRESS_FIKSTUR ? "op fikstürü" : "suppress-op"} bulunamadı: ${SUPPRESS}. ` +
         `rotate'in pensinin nereden geldiği bağımsız olarak doğrulanamaz.`);
  } else {
    const s = JSON.parse(SUPPRESS_FIKSTUR
      ? readFileSync(SUPPRESS, "utf8")
      : execFileSync(SUPPRESS, ["EU38"], { encoding: "utf8", maxBuffer: 64 << 20 }));
    if (s.op !== "suppress")
      fail(`R0 çapraz ölçümün kaynağı "op": "${s.op}" taşıyor, "suppress" değil (${SUPPRESS}). ` +
           `Başka bir operatörün çıktısını op.suppress sanmak, R0'ı ilgisiz bir sayıya bağlar.`);
    const esi = (s.kosumlar || []).find(
      (k) => k.panel === r.panel && k.acildi && !k.kesisme_bekleniyor);
    if (!esi) {
      fail(`R0 suppress-op ${r.panel} panelinde açılmış bir kama bildirmiyor; rotate ise ` +
           `${r.pens.aci_deg}° taşıdığını söylüyor. İki operatör aynı paneli görmüyor.`);
    } else if (Math.abs(esi.kama_deg - r.pens.aci_deg) < EPS_ACI) {
      ok(`R0 taşınan pens ÖLÇÜLMÜŞ: ${r.pens.aci_deg}° = op.suppress'in ${r.panel} ` +
         `panelinde ölçtüğü develop-deficit (${esi.deficit_deg}°) — fikstür DEĞİL`);
    } else {
      fail(`R0 rotate ${r.pens.aci_deg}° taşıyor, op.suppress aynı panelde ${esi.kama_deg}° ` +
           `ölçüyor. rotate pensini kendi uyduruyor.`);
    }
  }
  console.log(`   ↳ 41.48° (Buğra Locket, flatten-research/16) YAN YANA: ölçülen ` +
              `${r.pens.aci_deg}°, fark ${r.bugra_ile_fark_deg}° — TUTMUYOR, ayarlanmadı`);
}

// --- R0b: APEKS KÜNYESİ BİR EŞİK (HM1 buradan kırmızı) ------------------
if (Math.abs(r.pens.apeks_frac - MOTOR_APEKS_FRAC) < 1e-9)
  ok(`R0b apeks kesri motorun ilan ettiği değerde: ${r.pens.apeks_frac} ` +
     `(${r.pens.apeks_kaynak})`);
else
  fail(`R0b apeks kesri ${r.pens.apeks_frac}, motorun ilan ettiği ${MOTOR_APEKS_FRAC}. ` +
       `Motor tarafı kaymışsa künye ELLE yeniden okunur — bu kol tam olarak onun için var ` +
       `(hakem mutasyonu HM1: künye bir yorum satırıydı ve bağlı değildi).`);

// --- R9: SEVK EDİLEN GİYSİNİN KENDİ CEVABI, GİZLENMİYOR -----------------
{
  const sp = r.sevk_edilen_panel;
  if (!sp) {
    fail("R9 çıktı sevk edilen panelin cevabını taşımıyor. rotate'in ürüne DEĞMEDİĞİ " +
         "gerçeği kapıdan düşerse, kart onu bir sonraki turda yeniden keşfeder.");
  } else if (sp.suppress_acildi) {
    fail(`R9 sevk edilen ${sp.panel} panelinde op.suppress AÇMIŞ (deficit ` +
         `${sp.deficit_deg}°) ama planda ${sp.planda_pens_sayisi} pens var. İki kaynak ` +
         `çelişiyor; K28 ya kapandı ya da ölçüm bozuldu — ikisi de hakemin işi.`);
  } else {
    ok(`R9 sevk edilen ${sp.panel}: deficit ${sp.deficit_deg}° → op.suppress REDDETTİ, ` +
       `planda pens ${sp.planda_pens_sayisi}. Transfer motorun DİĞER gövdesinde koşuyor ` +
       `ve bu her satırda yazılı (K28 kapanmadı, SAYIYA bağlandı).`);
  }
}

// --- R1: en az iki AYRI hedef --------------------------------------------
const t = r.transferler || [];
const noktalar = new Set(t.map((x) => x.hedef_nokta.join(",")));
if (t.length >= EN_AZ_HEDEF && noktalar.size === t.length)
  ok(`R1 ${t.length} ayrı hedef kenar: ${t.map((x) => x.hedef).join(" · ")}`);
else
  fail(`R1 ${t.length} hedef, ${noktalar.size} ayrı nokta — en az ${EN_AZ_HEDEF} AYRI hedef ` +
       `gerekiyor. Aynı noktaya iki kez taşımak bir transfer değildir.`);

// --- R2..R6: her transfer, kalem kalem ----------------------------------
for (const x of t) {
  const ad = x.hedef.padEnd(12);

  if (x.alan_farki_mm2 < EPS_ALAN)
    ok(`R2 ${ad} ALAN korundu: ${x.alan_once_mm2} -> ${x.alan_sonra_mm2} mm² ` +
       `(fark ${x.alan_farki_mm2})`);
  else
    fail(`R2 ${ad} ALAN ${x.alan_once_mm2} -> ${x.alan_sonra_mm2} mm², fark ` +
         `${x.alan_farki_mm2} > ${EPS_ALAN}. Rijit bir hareket kumaş ekleyemez/eksiltemez.`);

  if (x.aci_farki_deg < EPS_ACI)
    ok(`R3 ${ad} AÇI korundu: ${x.aci_once_deg}° -> ${x.aci_sonra_deg}°`);
  else
    fail(`R3 ${ad} AÇI ${x.aci_once_deg}° -> ${x.aci_sonra_deg}°, fark ${x.aci_farki_deg}°. ` +
         `Transfer bastırma miktarını değiştiremez, yalnız yerini.`);

  if (x.bacak_true_once_mm < EPS_TRUE && x.bacak_true_sonra_mm < EPS_TRUE)
    ok(`R4 ${ad} BACAKLAR TRUE: önce ${x.bacak_true_once_mm}mm, sonra ${x.bacak_true_sonra_mm}mm ` +
       `(bacak ${x.bacak_once_mm} -> ${x.bacak_sonra_mm}mm)`);
  else
    fail(`R4 ${ad} bacaklar TRUE değil: önce ${x.bacak_true_once_mm}mm, sonra ` +
         `${x.bacak_true_sonra_mm}mm. Eşit olmayan iki bacak dikilemez.`);

  if (x.cevre_kimlik_artigi_mm < EPS_KIMLIK)
    ok(`R5 ${ad} ÇEVRE kimliği tutuyor: ${x.cevre_once_mm} -> ${x.cevre_sonra_mm}mm, ` +
       `artık ${x.cevre_kimlik_artigi_mm}mm (−2×${x.bacak_once_mm} +2×${x.bacak_sonra_mm})`);
  else
    fail(`R5 ${ad} çevre kimliği artığı ${x.cevre_kimlik_artigi_mm}mm > ${EPS_KIMLIK}. ` +
         `cevre_sonra = cevre_once − 2·Lold + 2·Lnew tutmuyor: hareket rijit değil.`);

  if (!x.kendini_kesiyor)
    ok(`R6 ${ad} panel kendini KESMİYOR — kesilebilir bir parça`);
  else
    fail(`R6 ${ad} panel kendini KESİYOR. Kesilemeyen bir parça bir kalıp değildir.`);

  // Bir şey GERÇEKTEN oldu mu: aynı çevreyi basan bir "transfer", geometriye
  // hiç dokunmadan etiket taşımış olabilir. Kartın istediği mutasyon tam olarak
  // budur ve burada yanar.
  if (Math.abs(x.cevre_sonra_mm - x.cevre_once_mm) > 1e-3)
    ok(`R7 ${ad} geometri gerçekten oynadı: Δçevre ${(x.cevre_sonra_mm - x.cevre_once_mm).toFixed(4)}mm`);
  else
    fail(`R7 ${ad} çevre hiç değişmedi (${x.cevre_once_mm} -> ${x.cevre_sonra_mm}). ` +
         `Pens "taşındı" diye işaretlenip geometri bırakılmış olabilir — bu bir transfer değil, ` +
         `bir etikettir.`);
}

// --- R8: APEKS KESRİ GERÇEKTEN MOTORDAN GEÇİYOR MU (HM1'in kök sorusu) ---
//
// R0b bir PİN'dir ve tek başına yetmez: doğru sayıyı basan bir SABİT de o kolu
// geçer. Burada araç ikinci kez, `--apex-frac` ile koşuluyor — o değer
// SheathOptions'a girip buildSeamPlan'dan dönüyor. Derinlik TAM oranında
// oynamak zorunda. Kopyalanmış bir `constexpr` hiç oynamaz ve bu kol kırmızı
// yanar; hakemin HM1'de bulduğu boşluk tam olarak burasıdır.
{
  const p2 = JSON.parse(execFileSync(TOOL, ["EU38", "--apex-frac", String(APEKS_PROBE)],
                                     { encoding: "utf8", maxBuffer: 64 << 20 }));
  const beklenenOran = APEKS_PROBE / MOTOR_APEKS_FRAC;
  const olculenOran = p2.pens.apeks_derinlik_mm / r.pens.apeks_derinlik_mm;
  if (Math.abs(p2.pens.apeks_frac - APEKS_PROBE) > 1e-9) {
    fail(`R8 araca ${APEKS_PROBE} verildi, çıktısında apeks kesri ${p2.pens.apeks_frac}. ` +
         `Kesir motora hiç ULAŞMIYOR; araç kendi sayısını taşıyor.`);
  } else if (Math.abs(olculenOran - beklenenOran) < 1e-9) {
    ok(`R8 apeks derinliği motorun alanıyla oynuyor: ${r.pens.apeks_derinlik_mm}mm ` +
       `(${MOTOR_APEKS_FRAC}) -> ${p2.pens.apeks_derinlik_mm}mm (${APEKS_PROBE}), ` +
       `oran ${olculenOran.toFixed(9)} = ${beklenenOran} — OKUNUYOR, kopyalanmıyor`);
  } else {
    fail(`R8 apeks derinliği ${r.pens.apeks_derinlik_mm} -> ${p2.pens.apeks_derinlik_mm}mm, ` +
         `oran ${olculenOran.toFixed(9)}, beklenen ${beklenenOran}. Derinlik motorun ` +
         `bodiceApexFrac alanının fonksiyonu DEĞİL — künye bir yorum satırı (HM1).`);
  }
}

console.log();
if (fails) {
  console.log(`FAIL rotate_check — ${fails} ihlal`);
  process.exit(1);
}
console.log(`rotate_check: YESIL — ${t.length} hedefe transfer; alan, açı ve TRUE bacaklar ` +
            `birebir korundu, çevre kimliği tuttu, hiçbiri kendini kesmiyor.`);
