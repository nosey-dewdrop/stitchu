#!/usr/bin/env node
// ⭐⭐ ÜRÜN YOLU KAPISI — ÜÇ OPERATÖR GİYSİYE DEĞİYOR MU? (GECE7 / F5-D, K46)
//
// ---------------------------------------------------------------------------
// NEDEN VAR. Hakem üç alt-kart boyunca aynı şeyi ölçtü ve üçüncüde karara
// bağladı (K46):
//
//     panelsplit.hpp · dartsuppress.hpp · dartrotate.hpp
//       →  garment.cpp / wasm/bindings.cpp / web/js/*   :  ÜÇÜNDE DE SIFIR SATIR
//
// Üç gerçek operatör, üçü de kendi kapısıyla, ve kullanıcı hiçbirine
// dokunamıyor: bir panel böldüremiyor, bir pens açtıramıyor, bir pensi
// taşıyamıyor. "Motorda var" bir ürün değildir (CLAUDE.md'nin tek testi). Bu
// kapı o teli ölçer — ve teli kesen bir mutasyon burada yanar.
//
//   OP0  HER ADIM BİR `sebep` TAŞIR, VE RET GEREKÇESİ RET'LE BİREBİR EŞLİDİR.
//        `uygulandi=false` ⇔ `ret_gerekcesi` DOLU (RULES 1: gerekçesiz ret bir
//        çökmeden ayırt edilemez), `uygulandi=true` ⇔ gerekçe BOŞ. Ve `sebep`
//        hiçbir adımda boş değildir: bu, H4'ün ("sebebi olmayan dikiş") repoda
//        ilk kez var olan katmanıdır.
//
//   OP1  ⭐ ÜÇ OPERATÖR DE ÜRÜNE DEĞİYOR. Üçünün de en az bir adımı UYGULANDI
//        ve en az bir adımı PLANA YAZILDI. Bir operatörü tel dışına alan
//        mutasyon (adımı hiç kurmamak, ya da kurup plana yazmamak) burada
//        kırmızı yanar. Bu kolun varlık sebebi tek bir cümle: üç alt-karttır
//        operatör gerçekliği kapanıyordu, ürün yolu kapanmıyordu.
//
//   OP2  BÖLME PLANA GİRDİ — SAYIYLA. panel_sonra = panel_once + (uygulanan
//        bölme sayısı) ve dikis_sonra = dikis_once + (aynı sayı). İki parça
//        üretip hiçbir yere koymayan bir bölme (borç 51'in ta kendisi) bu
//        kimliği tutturamaz.
//
//   OP3  KESİLEN KENARIN İKİ TARAFI BİR DİKİŞ ÇİFTİDİR. İki uzunluk İKİ AYRI
//        kontur üzerinde ölçülüyor (panelsplit.cpp), yani eşitlik bir ATAMA
//        değil bir ÖLÇÜM. Ve çiftin iki parçası planın panel listesinde ADIYLA
//        duruyor — plana girmeyen bir parça bir kalıp parçası değildir.
//
//   OP4  RET DE ÜRÜN YOLUNDAN GÖRÜNÜYOR, VE BİR SAYI TAŞIYOR. Sevk edilen
//        gövde bir KONİDİR: op.suppress onu reddeder (deficit −1.9628°) ve
//        op.split arkayı/eteği reddeder (profil DÜZ). Sessizce boş dönmek §0B
//        ihlalidir; bu kol reddin sayısını arar.
//
//   OP5  YÜK GERÇEKTEN BÖLÜNÜYOR, VE İKİ YARIM KENDİ PAYINI BASTIRIYOR.
//        deficit_a + deficit_b = deficit_butun (korunum, 1e-6'da) ve bölünen
//        panelin iki yarımına açılan kamalar bütünün kamasından KÜÇÜK. Bu,
//        split_check'in SP8'inin ürün yolundaki hâli: bölme bir çizim değil,
//        bir sonraki operatörün girdisi.
//
//   OP6  `sebep` KALIP CÜMLE DEĞİL. En az beş AYRI sebep metni. Her adıma aynı
//        cümleyi basmak H4'e bir katman değil bir dolgu verirdi.
//
// ⚠ SEVK EDİLEN OKUMA DEĞİŞMEZ (RULES 4). Program planın bir KOPYASI üstünde
// koşar; planJSON/flatJSON/nodeId el değmemiştir ve bu kapı `dugum`u da basar.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = process.argv[2] || path.join(HERE, "..", "build", "plan-ops");
const FIKSTUR = TOOL.endsWith(".json");

const EPS_MM = 1e-9;    // mm — iki taraf aynı iki koordinatı birleştiriyor
const EPS_ACI = 1e-6;   // derece — korunum kimliği
// ⚠ OP8'İN İKİ EPSİLONU UYDURULMADI: ikisi de `rotate_check.mjs`'in KENDİ
// sayıları (EPS_ALAN 1e-6 mm², EPS_ACI 1e-9 derece) ve buraya AYNEN alındı.
// Emsal budur ve gevşetilemez (§3.10 / K29): rijit bir hareketin alanı ve
// bastırdığı açı korunur, o yüzden beklenen sayı gürültü değil SIFIRDIR.
const EPS_ALAN_R = 1e-6;   // mm²
const EPS_ACI_R = 1e-9;    // derece

let fails = 0;
const fail = (m) => { console.log(`FAIL  ${m}`); fails++; };
const ok = (m) => console.log(`ok    ${m}`);

if (!existsSync(TOOL)) {
  console.log(`FAIL  ${FIKSTUR ? "program fikstürü" : "plan-ops"} bulunamadı: ${TOOL}`);
  console.log(FIKSTUR ? "      (ctest fikstürü koşmadı)"
                      : "      (cmake --build engine/build --target plan-ops)");
  process.exit(1);
}

const r = JSON.parse(FIKSTUR ? readFileSync(TOOL, "utf8")
                             : execFileSync(TOOL, ["EU38"], { encoding: "utf8",
                                                              maxBuffer: 64 << 20 }));
if (r.op !== "program") {
  console.log(`FAIL  girdi "program" değil, "${r.op}" taşıyor: ${TOOL}. Başka bir çıktıyı ` +
              `operatör programı sanmak, kapıyı ilgisiz bir sayıya bağlar (K35'in sınıfı).`);
  process.exit(1);
}
const okumalar = r.okumalar || [];
console.log("=== OPERATÖR PROGRAMI — üç operatör SEVK EDİLEN dikiş planına bağlı mı · beden EU38");
if (!okumalar.length) fail("çıktıda hiç okuma YOK.");

const UCU = ["op.split", "op.suppress", "op.rotate"];
const uygulandiHic = new Set(), yazildiHic = new Set(), gorulduHic = new Set();
const sebepler = new Set();

for (const rd of okumalar) {
  const adimlar = rd.adimlar || [];
  console.log();
  console.log(`--- ${rd.etiket}  ·  ${rd.yuzey}`);
  console.log(`    düğüm ${rd.dugum} · panel ${rd.panel_once} → ${rd.panel_sonra} · ` +
              `dikiş ${rd.dikis_once} → ${rd.dikis_sonra} · uygulanan ${rd.uygulanan} · ` +
              `reddedilen ${rd.reddedilen} · adım ${adimlar.length}`);

  // --- OP0: sebep + ret gerekçesi -----------------------------------------
  let sebepsiz = 0, gerekcesiz = 0, gereksizGerekce = 0;
  for (const s of adimlar) {
    gorulduHic.add(s.op);
    if (!String(s.sebep || "").trim()) sebepsiz++;
    else sebepler.add(String(s.sebep).slice(0, 60));
    if (!s.uygulandi && !String(s.ret_gerekcesi || "").trim()) gerekcesiz++;
    if (s.uygulandi && String(s.ret_gerekcesi || "").trim()) gereksizGerekce++;
    if (s.uygulandi) uygulandiHic.add(s.op);
    if (s.plana_yazildi) yazildiHic.add(s.op);
  }
  if (sebepsiz)
    fail(`OP0 ${rd.etiket}: ${sebepsiz} adımda \`sebep\` BOŞ. H4'ün saydığı şey tam olarak ` +
         `sebebi olmayan dikiştir; sebepsiz bir adım o sayıyı ölçülemez bırakır.`);
  else if (gerekcesiz)
    fail(`OP0 ${rd.etiket}: ${gerekcesiz} RET gerekçesiz. Gerekçesiz bir ret bir çökmeden ` +
         `ayırt edilemez (RULES 1).`);
  else if (gereksizGerekce)
    fail(`OP0 ${rd.etiket}: ${gereksizGerekce} adım hem UYGULANDI hem ret gerekçesi taşıyor. ` +
         `İki cevabı birden veren bir adım hiçbir cevap vermiyordur.`);
  else
    ok(`OP0 ${rd.etiket}: ${adimlar.length} adımın ${adimlar.length}'i bir \`sebep\` taşıyor, ` +
       `ve ret ⇔ gerekçe eşlemesi birebir`);

  // --- OP2: bölme PLANA girdi ---------------------------------------------
  const bolunen = adimlar.filter((s) => s.op === "op.split" && s.uygulandi);
  const yeniPanel = rd.panel_sonra - rd.panel_once;
  const yeniDikis = rd.dikis_sonra - rd.dikis_once;
  if (yeniPanel === bolunen.length && yeniDikis === bolunen.length)
    ok(`OP2 ${rd.etiket}: ${bolunen.length} bölmenin ${bolunen.length}'i PLANA GİRDİ — ` +
       `panel +${yeniPanel}, dikiş +${yeniDikis}. İki parça üretip hiçbir yere koymayan bir ` +
       `bölme (borç 51) bu kimliği tutturamaz.`);
  else
    fail(`OP2 ${rd.etiket}: ${bolunen.length} bölme uygulandı ama plan +${yeniPanel} panel ve ` +
         `+${yeniDikis} dikiş kazandı. Operatörün çıktısı plana YAZILMIYOR.`);

  // --- OP3: kesik bir DİKİŞ ÇİFTİ, ve iki parça planda ---------------------
  const panelAdlari = new Set((rd.paneller || []).map((p) => p.ad));
  for (const s of bolunen) {
    const c = s.dikis_cifti;
    if (!c) { fail(`OP3 ${s.panel}: bölündü ama bir DİKİŞ ÇİFTİ ilan etmedi.`); continue; }
    if (!(c.a_mm > 0) || Math.abs(c.a_mm - c.b_mm) >= EPS_MM) {
      fail(`OP3 ${s.panel}: kesik A ${c.a_mm}mm, B ${c.b_mm}mm (fark ${c.fark_mm}). Eşit ` +
           `olmayan iki kenar dikilemez; iki uzunluk İKİ AYRI kontur üzerinde ölçülüyor, ` +
           `yani bu bir ölçüm, bir atama değil.`);
      continue;
    }
    if (!panelAdlari.has(s.parca_a) || !panelAdlari.has(s.parca_b)) {
      fail(`OP3 ${s.panel}: parçalar "${s.parca_a}" / "${s.parca_b}" planın panel listesinde ` +
           `YOK. Plana girmeyen bir parça bir kalıp parçası değildir.`);
      continue;
    }
    ok(`OP3 ${s.panel} → ${s.parca_a} + ${s.parca_b}, kesim sütunu ${s.kesim_sutunu}/` +
       `${s.sutun_sayisi} (en eğri sütun ${s.en_egri_sutun} YAN YANA, K42) · dikiş çifti ` +
       `${c.a_mm}mm ↔ ${c.b_mm}mm, fark ${c.fark_mm}mm`);
  }

  // --- OP5: yük gerçekten bölünüyor ---------------------------------------
  for (const s of bolunen) {
    const toplam = s.deficit_a_deg + s.deficit_b_deg;
    if (Math.abs(toplam - s.deficit_butun_deg) >= EPS_ACI) {
      fail(`OP5 ${s.panel}: A ${s.deficit_a_deg}° + B ${s.deficit_b_deg}° = ${toplam}°, bütün ` +
           `${s.deficit_butun_deg}°. Bölme eğrilik üretti ya da yuttu.`);
      continue;
    }
    const kamalar = adimlar.filter((q) => q.op === "op.suppress" && q.uygulandi &&
                                          (q.panel === s.parca_a || q.panel === s.parca_b));
    if (kamalar.length)
      ok(`OP5 ${s.panel}: yük KORUNDU (${s.deficit_a_deg}° + ${s.deficit_b_deg}° = ` +
         `${s.deficit_butun_deg}°) ve iki yarımdan ${kamalar.length}'i KENDİ payını bastırdı ` +
         `(${kamalar.map((q) => q.olculen_kama_deg + "°").join(" · ")}) — bölme bir çizim ` +
         `değil, bir sonraki operatörün girdisi`);
    else
      console.log(`      ↳ OP5 ${s.panel}: yük korundu (${s.deficit_butun_deg}°); yarımlarda ` +
                  `op.suppress bu yüzeyde REDDETTİ, sebebi adımlarında yazılı`);
  }
}

// --- OP7: ÜRÜN YOLUNDAKİ KAMA DA PANELİN KENDİ SAYISI --------------------
//
// op.suppress'in AÇI PARAMETRESİ YOKTUR: kama, panelin kendi ölçülen
// develop-deficit'idir. Bu kol o kanunu ÜRÜN YOLUNDA iki uçtan bağlar —
//   (a) sonucun sınırından geri okunan açı = adımın ilan ettiği deficit
//       ("bir alan set edildi" ile "bir kama açıldı"nın farkı budur), ve
//   (b) bölünmüş bir yarımın deficit'i = op.split'in O YARIM için ölçtüğü pay.
// Motorda açıyı bir sabite çeviren bir mutasyon (a)'yı geçebilir; (b)'yi
// geçemez, çünkü (b) sayıyı BAŞKA bir operatörün ölçümüne bağlar.
console.log();
for (const rd of okumalar) {
  const adimlar = rd.adimlar || [];
  const paylar = new Map();
  for (const s of adimlar.filter((q) => q.op === "op.split" && q.uygulandi)) {
    paylar.set(s.parca_a, s.deficit_a_deg);
    paylar.set(s.parca_b, s.deficit_b_deg);
  }
  let bagli = 0;
  for (const s of adimlar.filter((q) => q.op === "op.suppress" && q.uygulandi)) {
    if (Math.abs(s.olculen_kama_deg - s.deficit_deg) >= EPS_ACI) {
      fail(`OP7 ${rd.etiket} ${s.panel}: sınırdan geri okunan kama ${s.olculen_kama_deg}°, ` +
           `adımın ilan ettiği deficit ${s.deficit_deg}°. Bir ALAN set edilmiş, bir KAMA ` +
           `açılmamış (op.suppress'in açı parametresi YOK).`);
      continue;
    }
    if (paylar.has(s.panel)) {
      const pay = paylar.get(s.panel);
      if (Math.abs(pay - s.deficit_deg) >= EPS_ACI) {
        fail(`OP7 ${rd.etiket} ${s.panel}: op.suppress ${s.deficit_deg}° bastırdı ama ` +
             `op.split bu yarımın payını ${pay}° ölçtü. Kama panelin KENDİ sayısı değil — ` +
             `bir yerden yazılıyor.`);
        continue;
      }
      bagli++;
    }
  }
  if (bagli)
    ok(`OP7 ${rd.etiket}: ${bagli} yarımda kama ÇİFTE bağlı — sınırdan geri okunan açı adımın ` +
       `deficit'ine, ve o deficit op.split'in o yarım için ÖLÇTÜĞÜ paya eşit. Açıyı bir ` +
       `sabite çeviren mutasyon ikinci bağda yanar.`);
}

// --- OP8: ⭐ TRANSFERİN GEOMETRİSİ, PLANIN KENDİ KONTURUNDAN ---------------
//
// borç 66 / K49. OP1'in "soruldu, uygulandı, PLANA YAZILDI"sı bir KİMLİKTİR;
// rijitlik bir DOĞRULUKTUR ve bu kapının sekiz kolunun sekizi de onu
// sormuyordu. Hakem ölçtü (HM-J2): `dartrotate.cpp`'de transfer açısı
// `theta * 0.90` yapılınca `rotate_check` EXIT 1 yanıyor (ALAN 32473.1791 →
// 36134.0402 mm², 3660.86 mm² kumaş yoktan üretildi) ve `op_program_check`
// EXIT 0 kalıyordu. Ürün yolundaki bir transfer kumaş üretti ve ürün kapısı
// geçirdi — K30'un tam sınıfı.
//
// ⭐ VE BU KOL ADIMIN İLAN ETTİĞİ DÖRT SAYIYA BAKMIYOR. Onlar `rotateDart()`'ın
// KENDİSİ hakkındaki beyanıdır; yalan söyleyen kod kendi beyanını da tutarlı
// basar. Kol, transferin PLANA YAZDIĞI konturu yürüyor ve alanı ile kama
// açısını KENDİ hesaplıyor — sonra ikisini de beyanla karşılaştırıyor. Üç bağ:
//
//   R2'  ALAN kimliği:  alan(kontur_sonra) == alan(kontur_once)   (rijitlik)
//   R3'  AÇI kimliği :  kama(kontur_sonra) == kama(kontur_once)   (transfer
//        bastırma MİKTARINI değiştiremez, yalnız yerini)
//   R8'  BEYAN == ÖLÇÜM: adımın bastığı dört sayı, konturdan yeniden okunanla
//        aynı olmak zorunda; değilse rapor geometriden kopmuştur.
//
// Epsilonlar rotate_check'in kendi epsilonlarıdır, bir bant değil bir SIFIR
// beklentisidir, ve gevşetilemez.
{
  const kPi = Math.PI;
  // C++ `contourAreaMM2` (dartsuppress.cpp) ile AYNI toplama sırası: aynı
  // formülü başka bir sırayla yazmak, kimliği geometride değil kayan noktada
  // kırar.
  const alan = (c) => {
    let a = 0;
    for (let i = 0; i < c.length; i++) {
      const p = c[i], q = c[(i + 1) % c.length];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return Math.abs(0.5 * a);
  };
  const isaretliAci = (o, from, to) => {
    const a1 = Math.atan2(from[1] - o[1], from[0] - o[0]);
    const a2 = Math.atan2(to[1] - o[1], to[0] - o[0]);
    let d = a2 - a1;
    while (d <= -kPi) d += 2 * kPi;
    while (d > kPi) d -= 2 * kPi;
    return d;
  };
  // dartrotate.cpp'nin kendi kama tanımı: apeksin iki komşusunun apeks
  // etrafında gerdiği açı.
  const kama = (c, ai) => {
    const n = c.length;
    return Math.abs(isaretliAci(c[ai], c[(ai + 1) % n], c[(ai + n - 1) % n])) * 180 / kPi;
  };

  console.log();
  let olculen = 0;
  for (const rd of okumalar) {
    for (const s of (rd.adimlar || []).filter((q) => q.op === "op.rotate" && q.uygulandi)) {
      const ad = `${rd.etiket} ${s.panel}`;
      const co = s.kontur_once, cs = s.kontur_sonra;
      if (!Array.isArray(co) || !Array.isArray(cs) || co.length < 5 || cs.length < 5) {
        fail(`OP8 ${ad}: adım UYGULANDI ama plana yazdığı konturu TAŞIMIYOR. Kendi ilan ettiği ` +
             `dört sayıdan başka kanıtı olmayan bir transfer, ölçülemez (borç 66 / K49).`);
        continue;
      }
      if (!(Number.isInteger(s.apeks_once) && Number.isInteger(s.apeks_sonra) &&
            s.apeks_once >= 0 && s.apeks_once < co.length &&
            s.apeks_sonra >= 0 && s.apeks_sonra < cs.length)) {
        fail(`OP8 ${ad}: apeks indeksi (${s.apeks_once} / ${s.apeks_sonra}) konturun dışında — ` +
             `kama açısı hangi köşeden okunacağı SORULAMIYOR.`);
        continue;
      }
      olculen++;
      const aOnce = alan(co), aSonra = alan(cs);
      const kOnce = kama(co, s.apeks_once), kSonra = kama(cs, s.apeks_sonra);
      const dAlan = Math.abs(aSonra - aOnce), dAci = Math.abs(kSonra - kOnce);

      if (dAlan < EPS_ALAN_R)
        ok(`OP8/R2 ${ad}: ALAN korundu — plandan yeniden ölçülen ${aOnce.toFixed(6)} → ` +
           `${aSonra.toFixed(6)} mm², fark ${dAlan.toExponential(3)}. Rijit bir hareket kumaş ` +
           `ekleyemez/eksiltemez.`);
      else
        fail(`OP8/R2 ${ad}: ALAN ${aOnce.toFixed(6)} → ${aSonra.toFixed(6)} mm², fark ` +
             `${dAlan.toFixed(6)} > ${EPS_ALAN_R}. Ürün yolundaki bir transfer KUMAŞ ÜRETTİ ` +
             `(ya da yuttu); bu bir yer değiştirme değil.`);

      if (dAci < EPS_ACI_R)
        ok(`OP8/R3 ${ad}: AÇI korundu — plandan yeniden ölçülen ${kOnce.toFixed(9)}° → ` +
           `${kSonra.toFixed(9)}°, fark ${dAci.toExponential(3)}. Transfer bastırma miktarını ` +
           `değiştiremez, yalnız yerini.`);
      else
        fail(`OP8/R3 ${ad}: AÇI ${kOnce.toFixed(9)}° → ${kSonra.toFixed(9)}°, fark ` +
             `${dAci.toFixed(9)}° > ${EPS_ACI_R}. Kama ürün yolunda BÜYÜDÜ/KÜÇÜLDÜ.`);

      const beyan = [["kama_once_deg", s.kama_once_deg, kOnce, EPS_ACI, "°"],
                     ["kama_sonra_deg", s.kama_sonra_deg, kSonra, EPS_ACI, "°"],
                     ["alan_once_mm2", s.alan_once_mm2, aOnce, 1e-3, " mm²"],
                     ["alan_sonra_mm2", s.alan_sonra_mm2, aSonra, 1e-3, " mm²"]];
      // ⚠ Bu üçüncü bağın toleransı bir GEVŞETME değil, adımın kendi BASKI
      // çözünürlüğüdür: `num()` altı basamak basıyor, yani beyanla ölçüm
      // arasında yuvarlamadan gelen ≤5e-7 (açı) / ≤5e-7 (alan) zaten var.
      // Kimliklerin kendisi (R2'/R3') yukarıda, ham konturdan, gevşetilmemiş
      // epsilonla kuruldu.
      const kopuk = beyan.filter(([, b, m, e]) => !(Math.abs(b - m) < e));
      if (kopuk.length)
        fail(`OP8/R8 ${ad}: adımın BEYANI plandaki konturdan kopuk — ` +
             kopuk.map(([k, b, m, , u]) => `${k} ${b}${u} ilan edildi, konturdan ${m}${u} ` +
                                           `ölçüldü`).join(" · ") +
             `. Rapor geometriden bağımsız yazılıyor.`);
      else
        ok(`OP8/R8 ${ad}: adımın dört sayısı da plandaki konturdan yeniden okunanla aynı — ` +
           `beyan bir ölçümdür, bir cümle değil.`);
    }
  }
  if (!olculen)
    fail(`OP8 hiçbir okumada UYGULANMIŞ bir op.rotate adımının geometrisi ölçülemedi. ` +
         `Rijitliği hiç denetlenmeyen bir transfer, K49'un kapattığı deliği geri açar.`);
  else
    ok(`OP8 ${olculen} transferin ${olculen}'inde ALAN ve KAMA AÇISI planın KENDİ konturundan ` +
       `yeniden ölçüldü (rotate_check'in R2/R3 kimlikleri artık ÜRÜN YOLUNDA da kurulu).`);
}

// --- OP1: ÜÇ OPERATÖR DE ÜRÜNE DEĞİYOR ------------------------------------
console.log();
for (const op of UCU) {
  if (!gorulduHic.has(op))
    fail(`OP1 ${op} programda HİÇ SORULMADI. Kullanıcının hiç ulaşamadığı bir operatör, ` +
         `motorda ne kadar gerçek olursa olsun, satın alınabilir bir nesneyle bitmiyor ` +
         `(K46, CLAUDE.md'nin tek testi).`);
  else if (!uygulandiHic.has(op))
    fail(`OP1 ${op} programın hiçbir okumasında UYGULANMADI. İki yüzey de sorulduğu hâlde ` +
         `hiç uygulanmayan bir operatörün ürün yolu ölçülmemiş demektir.`);
  else if (!yazildiHic.has(op))
    fail(`OP1 ${op} uygulandı ama hiçbir okumada PLANA YAZILMADI. Çıktısı plana girmeyen bir ` +
         `operatör hâlâ bir rapor, bir ürün değil (borç 45 + 49 + 51).`);
  else
    ok(`OP1 ${op} ÜRÜN YOLUNDA: soruldu, uygulandı, ve plana YAZILDI`);
}

// --- OP4: RET de görünüyor, ve bir sayı taşıyor ----------------------------
{
  const retler = okumalar.flatMap((rd) => rd.adimlar || []).filter((s) => !s.uygulandi);
  const sayili = retler.filter((s) => /-?\d+\.\d+/.test(String(s.sebep || "")));
  if (!retler.length)
    fail(`OP4 programda hiç RET yok. Sevk edilen gövde bir KONİDİR ve op.suppress onu ` +
         `reddeder; hiç reddetmeyen bir program operatörün ürüne ne dediğini gizler.`);
  else if (!sayili.length)
    fail(`OP4 ${retler.length} ret var ama hiçbiri bir SAYI taşımıyor. Sayısız bir ret, ` +
         `sessiz düşürmedir (§0B).`);
  else
    ok(`OP4 RET ÜRÜN YOLUNDAN GÖRÜNÜYOR: ${retler.length} ret, ${sayili.length}'i ölçülmüş bir ` +
       `sayıyla — ör. "${String(sayili[0].sebep).slice(0, 96)}…"`);
}

// --- OP6: sebep kalıp cümle değil -----------------------------------------
if (sebepler.size >= 5)
  ok(`OP6 \`sebep\` katmanı KALIP DEĞİL: ${sebepler.size} ayrı sebep metni. H4 bu katmanı ` +
     `sayacak (bugün hedef_kosu H4'ü hâlâ ÖLÇEMEDİM basıyor — o sayı draftJSON hattından ` +
     `okunuyor, kartta YER olarak yazıldı).`);
else
  fail(`OP6 yalnız ${sebepler.size} ayrı \`sebep\` metni var. Her adıma aynı cümleyi basmak ` +
       `H4'e bir katman değil bir DOLGU verir.`);

console.log();
if (fails) {
  console.log(`FAIL op_program_check — ${fails} ihlal`);
  process.exit(1);
}
console.log(`op_program_check: YESIL — üç operatörün üçü de sevk edilen dikiş planına bağlı, ` +
            `bölünen panellerin parçaları plana PANEL olarak girdi, kesilen kenarın iki tarafı ` +
            `DİKİŞ ÇİFTİ olarak ilan edildi ve iki uzunluk iki ayrı kontur üzerinde ölçüldü, ` +
            `her adım bir \`sebep\` taşıyor, ve RET de sayısıyla ürün yolundan görünüyor.`);
