#!/usr/bin/env node
// ⭐ TEK NESNE KAPISI — flat ile kalıp AYNI DİKİŞ PLANINDAN mı çıkıyor?
// (GECE7 / F3, kartın 6. kapısı.)
//
// ---------------------------------------------------------------------------
// KAPI EŞİTLİK DEĞİLDİR, VE BU BİR DÜZELTMEDİR (KOSU-v7 §2).
//
// v7'nin bir önceki taslağı "flat'in beli = kalıbın beli, fark < 1mm" diyordu.
// §2 onu EZDİ: flat 36 ile kalıp 36 FARKLI BEDENLERDİR. Kalıp gerçek, paylı,
// dikilebilir İNSAN bedenine; flat ideal MANKEN bedenine değerlenir. Bir
// eşitlik kapısı kuran faz DÜŞER. Burada ölçülen şey eşitlik değil:
//
//     TEK KAYNAK  +  TEK İLAN EDİLMİŞ DÖNÜŞÜM
//
// ---------------------------------------------------------------------------
// NE ÖLÇÜLÜYOR — dördü de ayrı bir kusur sınıfı:
//
//  K1. ORTAK ATA VAR MI. İki okuma da aynı `dugum`u basıyor mu? `dugum`,
//      planın tanımlayıcı geometrisinin (kabuk halkaları + ÇÖZÜLMÜŞ üst sınır,
//      iki koordinatıyla) parmak izidir. Aynı düğüm = tek nesne.
//
//  K2. DÜĞÜM SABİT DEĞİL. Spec değişince düğüm de değişiyor mu? Her iki okumaya
//      sabit bir dize bastırmak K1'i bedavaya geçirirdi; K2 o kaçışı kapatır.
//
//  K3. ⭐ ASIL KAPI — DEĞİŞİKLİK HER İKİ TARAFTA DA GÖRÜNÜYOR MU.
//      Yakayı 20mm derinleştiren TEK spec değişikliği hem kalıpta hem flat'te
//      ÖLÇÜLEBİLİR bir değişiklik üretmeli. Kartın cümlesi: "Flat'te değişip
//      kalıpta değişmeyen (ya da tersi) SIFIR alan." Yani bu iki yönlüdür ve
//      ÖN/ARKA bölge bölge sorulur:
//        ön  bölge: flat'in ön üst sınırı  ↔  kalıbın ön gövde panelleri
//        arka bölge: flat'in arka üst sınırı ↔ kalıbın arka gövde panelleri
//      ÖN değişikliği ön bölgeyi İKİ tarafta da oynatmalı, arka bölgeyi İKİ
//      tarafta da oynatmamalı. Bir tarafta oynayıp diğerinde oynamayan bölge
//      = ayrışma = KIRMIZI.
//
//  K4. FLAT SAYIYI KALIPTAN OKUYOR MU, YOKSA KENDİ Mİ ÇİZİYOR.
//      Flat'in ön ortasının düşüşü, istenen düşüşe EŞİT olmalı. Bu bir
//      "yaklaşık" değil: flat, kalıbın kendi çözülmüş üst sınırını (topColXMM /
//      topColZMM) okuyor, yeniden türetmiyor. Yeniden türetseydi bölge modeli
//      (TopProfile::zAt) ile yüzey arasındaki bilinen -9.4..-9.7mm'lik fark
//      buraya sızardı (docs/H1.0-KAPI.md § 4.1).
//
// ---------------------------------------------------------------------------
// ⚠ BU KAPI BİR CIRCIR SAYISI DEĞİLDİR ve öyle okunmamalı. F3'ün birinci sınıfı
// (top/dart/woven) hakemin göz etiketinde havuzun 2/19'unu kapsıyor, yani hedef
// koşusunun sayıları bu fazda kımıldamaz — kart bunu ÖNCEDEN ilan etti.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = process.argv[2] || path.join(HERE, "..", "build", "seam-plan");
const AUDIT = process.argv[3] || path.join(HERE, "..", "build", "shell-audit");
const DROP_MM = 20.0;      // kartın kendi sayısı
const EPS = 1e-4;          // "kımıldadı" eşiği, mm — ölçüm gürültüsünün çok üstü
const ARC_EPS = 1e-3;      // yay/çevre karşılaştırması, mm

let fails = 0;
const fail = (m) => { console.log(`FAIL  ${m}`); fails++; };
const ok = (m) => console.log(`ok    ${m}`);

if (!existsSync(TOOL)) {
  console.log(`FAIL  seam-plan bulunamadı: ${TOOL}`);
  console.log("      (cmake --build engine/build --target seam-plan)");
  process.exit(1);
}

const read = (okuma, dropMM) =>
  JSON.parse(execFileSync(TOOL, ["EU38", `--${okuma}`, "--neck-drop", String(dropMM)],
                          { encoding: "utf8", maxBuffer: 64 << 20 }));

console.log("=== TEK NESNE KAPISI — flat ile kalıp aynı dikiş planından mı? · beden EU38");
console.log(`    sınıf: top / dart / woven   ·   spec değişikliği: yakayı ${DROP_MM}mm derinleştir`);
console.log(`    kanun: KOSU-v7 §2 — EŞİTLİK DEĞİL, tek kaynak + tek ilan edilmiş dönüşüm`);
console.log(`    araç : ${TOOL}\n`);

const base = { kalip: read("kalip", 0), flat: read("flat", 0) };
const deep = { kalip: read("kalip", DROP_MM), flat: read("flat", DROP_MM) };

// --- K1: ortak ata --------------------------------------------------------
for (const [ad, s] of [["taban", base], [`yaka+${DROP_MM}mm`, deep]]) {
  if (s.kalip.dugum === s.flat.dugum)
    ok(`K1 ${ad}: iki okuma da aynı düğüm — ${s.kalip.dugum}`);
  else
    fail(`K1 ${ad}: AYRI DÜĞÜM — kalıp ${s.kalip.dugum} · flat ${s.flat.dugum}. ` +
         `İki okuma iki ayrı nesneden çıkıyor; ortak ata YOK.`);
}

// --- K2: düğüm sabit değil ------------------------------------------------
if (base.kalip.dugum !== deep.kalip.dugum)
  ok(`K2 düğüm spec ile değişiyor: ${base.kalip.dugum} -> ${deep.kalip.dugum}`);
else
  fail(`K2 düğüm SABİT (${base.kalip.dugum}) — spec değişti, düğüm değişmedi. ` +
       `Sabit bir dize K1'i bedavaya geçirir; düğüm bir kimlik değil süs olur.`);

// --- K3: değişiklik iki tarafta de aynı bölgede -------------------------
// Flat tarafı: üst sınır eğrisinin yayı + ortasının yüksekliği.
const flatBolge = (f, yon) => {
  const pts = f.ust_sinir[yon];
  const orta = pts.find((p) => Math.abs(p[0]) < 1e-6);
  if (!orta) throw new Error(`flat ${yon}: orta nokta (x=0) yok`);
  return { yay: f.ust_sinir[`${yon}_yay_mm`], orta: orta[1] };
};
// Kalıp tarafı: o yönün gövde panellerinin çevresi.
const kalipBolge = (k, yon) => {
  const ek = yon === "on" ? "ftorso" : "btorso";
  const ps = k.paneller.filter((p) => p.ad.endsWith(ek));
  if (!ps.length) throw new Error(`kalıp ${yon}: ${ek} paneli yok`);
  return { cevre: ps.reduce((s, p) => s + p.cevre_mm, 0) };
};

for (const yon of ["on", "arka"]) {
  const fb = flatBolge(base.flat, yon), fd = flatBolge(deep.flat, yon);
  const kb = kalipBolge(base.kalip, yon), kd = kalipBolge(deep.kalip, yon);
  const dFlat = Math.abs(fd.yay - fb.yay) + Math.abs(fd.orta - fb.orta);
  const dKalip = Math.abs(kd.cevre - kb.cevre);
  const flatOynadi = dFlat > ARC_EPS, kalipOynadi = dKalip > ARC_EPS;
  // ÖN değişikliği: ön bölge iki tarafta da oynar, arka bölge ikisinde de durur.
  const beklenen = yon === "on";
  const satir = `${yon.padEnd(4)} flat Δ=${dFlat.toFixed(4)}mm · kalıp Δ=${dKalip.toFixed(4)}mm`;

  if (flatOynadi !== kalipOynadi) {
    fail(`K3 ${satir} — AYRIŞMA: ${flatOynadi ? "flat oynadı, KALIP DURDU" : "kalıp oynadı, FLAT DURDU"}. ` +
         `Bir tarafta görünüp diğerinde görünmeyen değişiklik, iki nesne demektir.`);
  } else if (flatOynadi !== beklenen) {
    fail(`K3 ${satir} — beklenen "${beklenen ? "oynar" : "durur"}", ölçülen ` +
         `"${flatOynadi ? "oynadı" : "durdu"}". ÖN yakanın değişikliği ${
           beklenen ? "ön bölgeyi oynatmalıydı" : "arka bölgeye DOKUNMAMALIYDI"}.`);
  } else {
    ok(`K3 ${satir} — ikisi de ${flatOynadi ? "oynadı" : "durdu"} (beklenen)`);
  }
}

// --- K4: flat sayıyı kalıptan okuyor -------------------------------------
{
  const b = flatBolge(base.flat, "on").orta, d = flatBolge(deep.flat, "on").orta;
  const olculen = b - d;
  if (Math.abs(olculen - DROP_MM) < EPS)
    ok(`K4 flat'in ön ortası TAM ${olculen.toFixed(4)}mm düştü (istenen ${DROP_MM}) — ` +
       `flat, kalıbın çözülmüş üst sınırını OKUYOR, yeniden türetmiyor`);
  else
    fail(`K4 flat'in ön ortası ${olculen.toFixed(4)}mm düştü, istenen ${DROP_MM}mm. ` +
         `Sapma ${(olculen - DROP_MM).toFixed(4)}mm — flat sınırı kendi modelinden ` +
         `türetiyor olabilir (bölge modeli ile yüzey EU38'de -9.4..-9.7mm ayrışır, ` +
         `docs/H1.0-KAPI.md § 4.1).`);
}

// --- K5: ⭐ SİLUET KOLU (GECE7 / F5-A İŞ 0, karar K24) --------------------
//
// NEDEN VAR — bir SUÇLAMA değil, hakemin ÖLÇTÜĞÜ bir kapı boşluğu (HM-F2).
// `engine/src/shellprojection.cpp`'de `projectBack` `projectFront`'un kopyası
// yapıldı: arka teknik çizim LİTERALLY ön teknik çizim oldu. İkili gerçekten
// kımıldadı (2ccf4bc7… -> 60ea1cde…, yani bayat-ikili tuzağı değil) ve bu kapı
// yine de EXIT 0 verdi, düğüm de hiç değişmedi. Sebebi ikiydi:
//   1. `nodeId()` siluetı hash'lemiyordu (yalnız halkalar + üst sınır);
//   2. K3'ün `arka` kolu ayırt edici değil — yaka değişikliği siluetı zaten
//      oynatmadığı için o kol 0.0000'ı 0.0000 ile kıyaslıyor, ve arka literally
//      ön olsa bile kıyaslamaya devam ediyor.
// K3 hâlâ doğru bir kapı; DAR. Aşağıdaki üç ölçüm o darlığı kapatır ve üçü de
// HM-F2'de KIRMIZI yanar (log: GECE7/log/f5a.mutasyon.txt).
{
  const [on, arka] = base.flat.siluet;

  // K5a — görünüm etiketi. İki "on" basan bir flat, arkayı hiç çizmemiştir.
  if (on.gorunum === "on" && arka.gorunum === "arka")
    ok(`K5a siluet iki görünüm basıyor: "${on.gorunum}" + "${arka.gorunum}"`);
  else
    fail(`K5a siluet görünümleri "${on.gorunum}" + "${arka.gorunum}" — ` +
         `arka görünüm ön görünümün kopyası. Kullanıcı iki kez aynı çizimi alıyor.`);

  // K5b — arka yarım kontur, önün x'te AYNASI. shellprojection.hpp bunu bir
  // yasa olarak ilan ediyor ("the back view is the same curve mirrored in x");
  // ilan edilmiş bir yasa ölçülmüyorsa yoktur (RULES 6). Aynalanmamış bir arka
  // = kopyala-yapıştır, ve sayısı 2·|x|'tir, gürültü değil.
  if (on.yari_kontur.length !== arka.yari_kontur.length) {
    fail(`K5b ön ${on.yari_kontur.length} segment, arka ${arka.yari_kontur.length} — ` +
         `iki görünüm aynı kabuktan çıkmıyor.`);
  } else {
    let enKotuX = 0, enKotuY = 0;
    for (let i = 0; i < on.yari_kontur.length; i++)
      for (let k = 0; k < 8; k += 2) {
        enKotuX = Math.max(enKotuX, Math.abs(on.yari_kontur[i][k] + arka.yari_kontur[i][k]));
        enKotuY = Math.max(enKotuY, Math.abs(on.yari_kontur[i][k + 1] - arka.yari_kontur[i][k + 1]));
      }
    if (enKotuX < 1e-6 && enKotuY < 1e-6)
      ok(`K5b arka siluet önün x-aynası: en kötü |x_ön+x_arka| = ${enKotuX.toFixed(6)}mm, ` +
         `|y_ön−y_arka| = ${enKotuY.toFixed(6)}mm (${on.yari_kontur.length} segment × 4 nokta)`);
    else
      fail(`K5b arka siluet önün aynası DEĞİL: en kötü |x_ön+x_arka| = ${enKotuX.toFixed(4)}mm, ` +
           `|y_ön−y_arka| = ${enKotuY.toFixed(4)}mm. Aynalanmamış bir arka görünüm, ` +
           `önün kopyasıdır (HM-F2).`);
  }

  // K5c — arka ölçüler önünkinden AYRI türüyor mu. Kabuk ön/arka simetrik
  // değil (kesit c(phi) = (a cos phi, bm sin phi + bd sin²phi): merkez-ön
  // phi=+pi/2'de bm+bd, merkez-arka phi=−pi/2'de −bm+bd), o yüzden
  // `body_length` iki görünümde AYRI bir sayı olmak zorunda. Eşitse arka
  // görünüm önden kopyalanmıştır — ve bu, aynanın yakalayamadığı ikinci yön.
  const olc = (v, ad) => {
    const m = v.olculer.find((o) => o.ad === ad);
    if (!m) throw new Error(`siluet ${v.gorunum}: "${ad}" ölçüsü yok`);
    return m.mm;
  };
  const dOn = olc(on, "body_length"), dArka = olc(arka, "body_length");
  const fark = Math.abs(dOn - dArka);
  if (fark > 1.0)
    ok(`K5c arka merkez-arka yayı önden AYRI: ${dOn.toFixed(4)} vs ${dArka.toFixed(4)}mm, ` +
       `fark ${fark.toFixed(4)}mm — arka görünüm kendi geometrisinden türüyor`);
  else
    fail(`K5c ön/arka body_length ${dOn.toFixed(4)} vs ${dArka.toFixed(4)}mm, fark ` +
         `${fark.toFixed(4)}mm ≤ 1mm. Kabuk ön/arka simetrik DEĞİL; iki yayın eşit ` +
         `çıkması arka görünümün ön görünümden kopyalandığı anlamına gelir (HM-F2).`);
}


// --- K6: ⭐ DOĞRULUK KOLU (GECE7 / F5-B İŞ 0b, karar K30) -----------------
//
// NEDEN VAR — bir HAKEM MUTASYONU, bir fikir değil (HM3).
//
// K1–K5 KİMLİK kuruyor: "flat ile kalıp aynı nesneden çıktı". Hakem
// `shellprojection.cpp`'yi değiştirip `bust_circumference`'ı **BELİN** çevresini
// basacak hâle getirdi — kullanıcıya inen teknik çizim yanlış bir büst ölçüsü
// yayınlıyor — ve ölçtü: düğüm kımıldadı (kimlik ÇALIŞIYOR, K24 çalışıyor) ve
// bu kapı ile rotate_check **İKİSİ DE YEŞİL** kaldı. Repoda hiçbir kapı
// "yayınlanan sayı DOĞRU mu" diye sormuyordu, yalnız "doğru atadan mı geldi".
//
// ⚠ VE BU İKİNCİ BİR ÇAĞRI DEĞİL, İKİNCİ BİR YOL. Aynı fonksiyonu tekrar
// koşturup kendisiyle kıyaslamak regen-vs-regen'dir ve hiçbir şey kanıtlamaz.
// `shellprojection.cpp` çevreyi GAUSS-LEGENDRE kadratürü (order 24) + Steiner'in
// ANALİTİK ofset kimliğiyle (P + 2πd), yarım genişliği KAPALI FORMLA (a + d),
// merkez yayını 0.05mm adımla ölçüyor. `shell-audit` ise kabuğun KENDİ
// NOKTALARINI basıyor (halka başına 20000 örnek, merkez zinciri 0.02mm) ve bu
// kol onları düz KİRİŞ TOPLAMIYLA ölçüyor. Farklı aritmetik, Steiner yok,
// kapalı form yok, ortak kod yolu yok.
//
// ⚠ NE DENETLENMİYOR, SÖYLENİYOR (K29): `GarmentSurf::at()` iki yolun da
// altında. YÜZEY yanlışsa iki okuma birlikte yanlış olur ve bu kol göremez.
// Gördüğü şey, HM3'ün ait olduğu sınıfın tamamı: yanlış YÜKSEKLİKTE, yanlış
// HALKADA, yanlış NİCELİKTE ya da öbür görünümden KOPYALANMIŞ bir ölçü.
//
// ⚠ ÖZET SATIRI KOŞULLU (GECE7 / F5-C İŞ 0e, borç 48). Hakem HM-B'de ölçtü:
// `GarmentSurf::at()` %5 bozulunca 14 ölçünün 10'u KIRMIZI yandı ve exit kodu
// doğru (1) oldu, AMA aşağıdaki "ok K6 ... doğrulandı" satırı yine basıldı.
// Loga bakan bir insan on FAIL'in yanında YEŞİL bir cümle görüyordu. Bu, K33'ün
// "hiçbir şey ölçmedim ≠ her şey geçti" dersinin küçük tekrarı, tersinden:
// "her şey ölçüldü ≠ her şey tuttu". Özet artık YALNIZ bu kolun kendi ihlali
// yokken basılır; kolun kendi sayacı `k6Girdi` ile alınır, global `fails`'ten
// ayrı tutulur ki başka bir kolun kırmızısı bu satırı bastırmasın.
{
  const k6Girdi = fails;
  if (!existsSync(AUDIT)) {
    fail(`K6 shell-audit bulunamadı: ${AUDIT}. Yayınlanan ölçünün DOĞRULUĞUNU ` +
         `karşılaştıracak ikinci yol yok — kimlik var, doğruluk yok (HM3).`);
  } else {
    const a = JSON.parse(execFileSync(AUDIT, ["EU38"], { encoding: "utf8", maxBuffer: 512 << 20 }));
    if (a.dugum !== base.flat.dugum)
      fail(`K6 shell-audit düğümü ${a.dugum}, flat ${base.flat.dugum} — denetim BAŞKA bir ` +
           `nesneyi ölçüyor, kıyas geçersiz.`);

    // Kiriş toplamı, dışbükey bir eğrinin uzunluğunu O(h²/R) ALTTAN sayar; 20000
    // kirişte bu mikronun çok altında. Eşik ölçümün kendi çözünürlüğünden
    // türüyor, seçilmiyor — ve HM3'ün yakaladığı sapma (büst ↔ bel, ~100mm)
    // bunun beş bin katı.
    const TOL_MM = 0.05;
    const halka = new Map(a.halkalar.map((h) => [h.ad, h]));
    const kirisToplam = (pts) => {
      let L = 0;
      for (let i = 0; i < pts.length; i++) {
        const q = pts[(i + 1) % pts.length];
        L += Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]);
      }
      return L;
    };
    const zincirToplam = (pts) => {
      let L = 0;
      for (let i = 1; i < pts.length; i++)
        L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1],
                        pts[i][2] - pts[i - 1][2]);
      return L;
    };
    const enGenis = (pts) => 2 * Math.max(...pts.map((q) => Math.abs(q[0])));

    let denetlenen = 0, olcemedim = [];
    for (const v of base.flat.siluet) {
      for (const m of v.olculer) {
        let ikinci = null, nasil = "";
        const h = halka.get(m.halka);
        if (/_circumference$/.test(m.ad) && h) {
          ikinci = kirisToplam(h.nokta);
          nasil = `halka "${m.halka}" (h=${h.h_mm}mm) poligonunun kiriş toplamı`;
        } else if (/_width$/.test(m.ad) && h) {
          ikinci = enGenis(h.nokta);
          nasil = `halka "${m.halka}" poligonunun 2·max|x|'i`;
        } else if (m.ad === "body_length") {
          const zincir = v.gorunum === "on" ? a.merkez_on : a.merkez_arka;
          ikinci = zincirToplam(zincir);
          nasil = `merkez-${v.gorunum} zincirinin (${a.merkez_adim_mm}mm adım) kiriş toplamı`;
        } else if (m.ad === "body_height_projected") {
          ikinci = a.omuz_z_mm - a.hem_z_mm;
          nasil = "omuz halkası z'si eksi etek ucu z'si";
        }

        if (ikinci === null) {
          olcemedim.push(`${v.gorunum}/${m.ad}`);
          continue;
        }
        denetlenen++;
        const d = Math.abs(ikinci - m.mm);
        if (d < TOL_MM)
          ok(`K6 ${v.gorunum.padEnd(4)} ${m.ad.padEnd(22)} yayınlanan ${m.mm.toFixed(4)}mm ` +
             `↔ ikinci yol ${ikinci.toFixed(4)}mm (Δ ${d.toFixed(6)}mm) — ${nasil}`);
        else
          fail(`K6 ${v.gorunum} ${m.ad}: YAYINLANAN ${m.mm.toFixed(4)}mm, ikinci yoldan ` +
               `${ikinci.toFixed(4)}mm, Δ ${d.toFixed(4)}mm > ${TOL_MM}mm. Ölçü, ADININ ` +
               `söylediği şeyi ölçmüyor — ${nasil}. Kullanıcının indirdiği teknik çizim ` +
               `YANLIŞ bir sayı yayınlıyor (hakem mutasyonu HM3).`);
      }
    }
    if (olcemedim.length)
      console.log(`      ↳ ÖLÇEMEDİM (ikinci yol yok, uydurulmadı — K29): ${olcemedim.join(", ")}`);
    if (!denetlenen)
      fail("K6 hiçbir ölçü denetlenemedi. Sıfır kalem doğrulayan bir kol, kapının " +
           `"hiçbir şey ölçmedim" ile "her şey geçti"yi ayırt etmemesidir (K33'ün sınıfı).`);
    else if (fails === k6Girdi)
      ok(`K6 ${denetlenen} yayınlanan ölçü BAĞIMSIZ İKİNCİ YOLDAN doğrulandı ` +
         `(kiriş toplamı ↔ Gauss-Legendre + Steiner; ortak kod yolu yok)`);
    else
      console.log(`      ↳ K6 ÖZET BASILMADI: ${denetlenen} ölçü denetlendi ama ` +
                  `${fails - k6Girdi}'i TUTMADI. "Doğrulandı" cümlesi yalnız bu kolun ` +
                  `kendi ihlali sıfırken basılır (İŞ 0e, borç 48).`);
  }
}

// --- ilan: manken açık kalemi gizlenmiyor --------------------------------
{
  const bl = base.flat.bedenlendirme;
  if (bl && String(bl.ACIK_KALEM || "").includes("YAYIN BULUNAMADI"))
    ok("§2 dönüşümü İLAN EDİLİ: flat'in manken çizelgesi YAYIN BULUNAMADI, " +
       "ayrışma F4'e yazılı (sessiz varsayılan yok)");
  else
    fail("§2 dönüşümü ilan edilmemiş — flat hangi bedene değerlendiğini söylemiyor. " +
         "Uydurulmuş bir manken, ilan edilmemiş bir manken kadar kötüdür.");
}

console.log();
if (fails) {
  console.log(`FAIL tek_nesne_check — ${fails} ihlal`);
  process.exit(1);
}
console.log("tek_nesne_check: YESIL — tek spec değişikliği iki okumayı da, " +
            "aynı düğümden, aynı bölgede oynattı.");
