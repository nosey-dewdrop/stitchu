#!/usr/bin/env node
// ⭐ H8-İFADE — §4A'NIN KAPANIŞ TESTİ (GECE7 / F5-A)
//
// ---------------------------------------------------------------------------
// BU SAYI, `hedef_kosu.mjs`'İN H8'İ DEĞİLDİR. İKİSİ HARMANLANMAZ.
//
//   H8-SÖZLÜK  (hedef_kosu.mjs:350-351)  = Σ outOfVocab terim
//                                        + Σ sözlükte olmayan alan okuması
//     Bir SÖZLÜK sayacıdır: fotoğraftan okunan bir terimin kelime dağarcığında
//     karşılığı var mı. Bugün 31 (n=5). ⚠ SÖZLÜK DARALTILARAK, tek operatör
//     yazmadan düşürülebilir — §0B'nin reward-hacking maddesinin ta kendisi.
//
//   H8-İFADE   (bu betik)                = ADLI gerçek kalıplardan kaçı
//     bugünkü operatör kümesiyle bir programa ÇEVRİLEMEDİ. §4A'nın istediği
//     nicelik budur ve paydası bir sayı değil bir LİSTEDİR: aşağıdaki her
//     giysinin adı, kaynağı ve gerektirdiği operatörler künyesiyle yazılı.
//
// §4A md.3: "Yazılamayan her giysi EKSİK OPERATÖRÜN ADINI verir — çıktı bir
// şikâyet değil, bir KUYRUKTUR." Betiğin son bloğu o kuyruktur ve operatörler
// KAÇ giysiyi bloke ettiklerine göre sıralanır, yani sıradaki alt-kartın
// operatörünü seçecek olan hakem bir sayıya bakar.
//
// ---------------------------------------------------------------------------
// ⚠ NEDEN LİSTE BU DOSYANIN İÇİNDE, AYRI BİR JSON'DA DEĞİL — iki ölçülmüş sebep:
//  1. `patterns_real/` TAKİPSİZ kalemler taşıyor (K10) ve temiz bir checkout'ta
//     yokturlar; oradan okuyan bir kapı, hakemin doğrulayamayacağı bir kapıdır
//     (K14'ün `dataset/` gerekçesinin aynısı).
//  2. Takipli yeni bir `.json`, `flat_expresses_spec_check`i kırmızı yakabiliyor
//     — bu koşuda İKİ KEZ oldu (K17). Liste bir `.mjs` sabitidir; kimse onu bir
//     ürün spec'i sanamaz.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..");

let fails = 0;
const fail = (m) => { console.log(`FAIL  ${m}`); fails++; };
const ok = (m) => console.log(`ok    ${m}`);

// ---------------------------------------------------------------------------
// PAYDA — ADLI, GERÇEK, YAYINLANMIŞ KALIPLAR. Her satır künyeli; hiçbir
// gereksinim "bence" ile yazılmadı, her biri ya ölçülmüş ya da kaynağın kendi
// parça listesinden okunmuş.
const GIYSILER = [
  {
    ad: "bugra-locket-top",
    kaynak: "satın alınmış kalıp, patterns_real/Locket Top (Buğra); 7 parça " +
            "ölçüldü: Front Body · Back Body · Upper Sleeve · Lower Sleeve · Collar · " +
            "Collar Lining · EXTRA-TL (patterns_real/geometry/geometry-full.json)",
    gerektirir: {
      "op.suppress": "göğüs pensi 41.5° = develop-deficit 41.48° (flatten-research/16)",
      "op.rotate": "pens yan dikişe/oyuğa taşınmadan Front Body'nin bugünkü kesimi çıkmaz",
      "op.split": "Front/Back Body ayrımı ve yaka bölgesi panel bölmesi",
      "op.attach": "Peter Pan yaka ayrı parça olarak gövdeye asılıyor (2 Pattern Cutting.jpg)",
      "op.derive": "Collar Lining = yakanın türev/tela parçası (kesim sayfası: interfacing " +
                   "'1 piece on fold')",
      "op.overlay": "Upper Sleeve YATAY BÖLÜNMÜŞ KOL DEĞİL, büzgülü ÜST KATMAN — ölçüldü, " +
                    "sagitta oranı 8 bedende bit-sabit 1.227 (CLAUDE.md T14)",
      "op.gather": "büzgü oranları %35.3 üst / %30.6 alt (ölçüldü)",
    },
  },
  {
    ad: "bugra-buttoned-corset-bustier",
    kaynak: "satın alınmış kalıp, patterns_real/Buttoned Corset Bustier; 6 parça ölçüldü: " +
            "Back Body (center fold) · Upper Cup · Lower Cup · Front Body (center) · " +
            "Back Body (side) · Front Body (side)",
    gerektirir: {
      "op.split": "gövde ön/arka × merkez/yan dört panele bölünmüş (parça adlarının kendisi)",
      "op.rotate": "kup dikişi bir pensin göğüs noktası etrafında kenara taşınmış hâlidir " +
                   "(Upper Cup ↔ Lower Cup ayrımı)",
      "op.suppress": "kalan göğüs/bel bastırması",
      "op.attach": "düğme patleti ayrı parça (ürün adı: Buttoned)",
    },
  },
  {
    ad: "stitchu-sheath-eu38",
    kaynak: "motorun KENDİ sevk ettiği giysi, engine/src/surfacepattern.cpp " +
            "(sınıf top/dart/woven, 8 panel, seam-plan EU38)",
    gerektirir: {
      "op.split": "bel halkası 8 panele bölünüyor; bastırma PANEL DİKİŞLERİYLE taşınıyor " +
                  "(ölçüldü: sekiz panelin sekizi de pens sayısı 0)",
      "op.suppress": "sınıfın adı `dart` ama pens bugün üretilmiyor — isim ile geometri ayrışıyor",
    },
  },
  {
    ad: "freesewing-bella",
    kaynak: "FreeSewing (MIT, §1E lisans tablosu) — yayınlanmış kadın gövde bloğu",
    gerektirir: {
      "op.suppress": "blok tanımı gereği göğüs + bel pensi",
      "op.rotate": "bloğun tek işi pensin taşınabilir olmasıdır",
    },
  },
  {
    ad: "freesewing-aaron",
    kaynak: "FreeSewing (MIT, §1E lisans tablosu) — yayınlanmış A-shirt (atlet)",
    gerektirir: {
      "op.split": "ön/arka gövde",
      "op.extend": "boy ve kol oyuğu derinliği sürekli eksen",
      "op.attach": "biye/bias şerit kol oyuğuna ve yakaya asılıyor",
    },
  },
];

// ---------------------------------------------------------------------------
// MOTORDA GERÇEKTEN VAR OLAN OPERATÖRLER — İDDİA DEĞİL, İKİ KAYNAĞIN KESİŞİMİ.
//
// contract/primitives-v1.json her op için `motorda_kapi` taşıyor: o operatörün
// motorda var olduğunu kanıtlayan ctest testinin ADI, ya da `null`. Betik o adı
// engine/CMakeLists.txt'in `add_test(NAME ...)` kayıtlarıyla karşılaştırır.
// Sebep §0B: uygulanmış operatör kümesini şişirmek, H8-ifadeyi tek satır kod
// yazmadan düşürmenin en ucuz yoludur — o yol burada KIRMIZI yanar.
const contract = JSON.parse(readFileSync(path.join(REPO, "contract/primitives-v1.json"), "utf8"));
const cmake = readFileSync(path.join(REPO, "engine/CMakeLists.txt"), "utf8");
const kayitliTestler = new Set([...cmake.matchAll(/add_test\s*\(\s*NAME\s+([A-Za-z0-9_]+)/g)]
  .map((m) => m[1]));

// İki blok: TANIMLI operatörler (`primitifler`) ve §4A'nın henüz TANIMLANMAMIŞ
// olanları (`_eksik_operatorler`, hepsinin kapısı null). İkincisi bir uygulama
// iddiası değil, kuyruğun bir isme yazılabilmesi için tutulan kayıttır.
const kaynakBloklar = { ...contract.primitifler, ...(contract._eksik_operatorler || {}) };
const opAdlari = Object.keys(kaynakBloklar).filter((k) => k.startsWith("op."));
const motorda = new Set();
for (const op of opAdlari) {
  const kapi = kaynakBloklar[op].motorda_kapi;
  if (kapi === null || kapi === undefined) continue;
  if (!kayitliTestler.has(kapi)) {
    fail(`${op} kendini "motorda var" ilan ediyor ve kapısı olarak "${kapi}" gösteriyor, ` +
         `ama engine/CMakeLists.txt'te öyle bir add_test YOK. Uygulanmamış bir operatörü ` +
         `uygulanmış saymak H8-ifadeyi bedavaya düşürür (§0B).`);
    continue;
  }
  motorda.add(op);
}
if (!fails)
  ok(`operatör kümesi: sözleşmede ${opAdlari.length}, MOTORDA ${motorda.size} ` +
     `(${[...motorda].join(", ") || "—"}) · kapıları ctest'te doğrulandı`);

// Bir gerekliliğin sözleşmede karşılığı yoksa liste ile sözleşme ayrışmış demektir.
for (const g of GIYSILER) {
  const bilinmeyen = Object.keys(g.gerektirir).filter((o) => !opAdlari.includes(o));
  if (bilinmeyen.length)
    fail(`${g.ad}: sözleşmede olmayan operatör isteniyor — ${bilinmeyen.join(", ")}. ` +
         `Kuyruk, sözleşmenin bilmediği bir isme yazılamaz.`);
  if (!Object.keys(g.gerektirir).length)
    fail(`${g.ad}: gereksinim listesi BOŞ. Hiçbir şey istemeyen bir giysi paydayı ` +
         `bedavaya şişirir.`);
}

// ---------------------------------------------------------------------------
// ÖLÇÜM
console.log("\n=== H8-İFADE — adlı kalıplar, operatör programına çevrilebiliyor mu?\n");
let cevrilemeyen = 0;
const kuyruk = new Map();
for (const g of GIYSILER) {
  const eksik = Object.keys(g.gerektirir).filter((o) => !motorda.has(o));
  for (const o of eksik) kuyruk.set(o, (kuyruk.get(o) || 0) + 1);
  if (eksik.length) {
    cevrilemeyen++;
    console.log(`  ÇEVRİLEMEDİ  ${g.ad}`);
    console.log(`               eksik operatör: ${eksik.join(" · ")}`);
  } else {
    console.log(`  ÇEVRİLDİ     ${g.ad}`);
  }
  console.log(`               kaynak: ${g.kaynak}`);
}

console.log(`\nH8-İFADE = ${cevrilemeyen} / ${GIYSILER.length}  (n=${GIYSILER.length}, payda ADLI: ` +
            `${GIYSILER.map((g) => g.ad).join(", ")})`);
console.log(`H8-SÖZLÜK bu betiğin ölçtüğü sayı DEĞİLDİR — onu hedef_kosu.mjs basar, ` +
            `ve ikisi ayrı satırda durur.`);

console.log("\n--- KUYRUK — eksik operatörler, kaç giysiyi bloke ettiklerine göre ---");
for (const [op, n] of [...kuyruk.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
  console.log(`  ${String(n).padStart(2)} giysi  ${op}`);
if (!kuyruk.size) console.log("  (boş — §4A'nın anlamında SINIRSIZ: kuyruk boşaldı)");

console.log();
if (fails) {
  console.log(`FAIL expressability_check — ${fails} ihlal`);
  process.exit(1);
}
console.log(`expressability_check: YESIL — H8-İFADE ${cevrilemeyen}/${GIYSILER.length} ölçüldü ve ` +
            `kuyruk ${kuyruk.size} operatör adıyla basıldı.`);
