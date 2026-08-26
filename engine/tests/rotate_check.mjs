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
// ⚠ KARTA GEÇEN ÖLÇÜM, VE RAHATSIZ EDİCİ OLANI: sevk edilen sınıfın adı
// `top/dart/woven` ama sevk edilen dikiş planında PENS YOK — EU38'in sekiz
// panelinin sekizi de `"pens": 0` basıyor (omuz dikişi açık ya da kapalı, her
// maxDartDeg'de ölçüldü). Bastırma PANEL DİKİŞLERİYLE taşınıyor. Bu yüzden
// transfer edilen pens `op.suppress` fikstürüyle BİLDİRİLİYOR ve iki sayısı da
// künyeli: açı 41.48° (gerçek Buğra Locket pensi = develop-deficit,
// flatten-research/16) · apeks 0.80 (`SheathOptions::bodiceApexFrac`, motorun
// kendi ilan ettiği kesir). `op.suppress`'in gerçek bir operatör olması KUYRUK
// maddesidir ve burada iddia EDİLMİYOR (§4A).
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = process.argv[2] || path.join(HERE, "..", "build", "rotate-op");

const EPS_ALAN = 1e-6;    // mm² — rijit hareket, gürültü değil sıfır bekleniyor
const EPS_ACI = 1e-9;     // derece
const EPS_TRUE = 1e-9;    // mm
const EPS_KIMLIK = 1e-6;  // mm
const BUGRA_DEG = 41.48;  // künyeli: flatten-research/16
const EN_AZ_HEDEF = 2;    // kartın şartı: "en az İKİ hedef, sayıyla"

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
console.log(`    fikstür: op.suppress ${r.fikstur.aci_deg}° · apeks ${r.fikstur.apeks_derinlik_mm}mm`);
console.log(`    kaynak : ${r.fikstur.kaynak}\n`);

// --- R0: fikstürün açısı künyeli sayı mı --------------------------------
if (Math.abs(r.fikstur.aci_deg - BUGRA_DEG) < 1e-9)
  ok(`R0 pens açısı künyeli: ${r.fikstur.aci_deg}° = ölçülmüş Buğra develop-deficit`);
else
  fail(`R0 pens açısı ${r.fikstur.aci_deg}°, künyeli sayı ${BUGRA_DEG}°. ` +
       `Künyesiz sayı koda girmez (§3.10).`);

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

console.log();
if (fails) {
  console.log(`FAIL rotate_check — ${fails} ihlal`);
  process.exit(1);
}
console.log(`rotate_check: YESIL — ${t.length} hedefe transfer; alan, açı ve TRUE bacaklar ` +
            `birebir korundu, çevre kimliği tuttu, hiçbiri kendini kesmiyor.`);
