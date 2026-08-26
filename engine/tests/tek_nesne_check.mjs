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
