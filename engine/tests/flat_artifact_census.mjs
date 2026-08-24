#!/usr/bin/env node
// flat_artifact_census.mjs — ÜÇ KANAT KAPISI / KANAT (b)+(c): ARTEFAKT SAYIMI
// ve EĞRİLİK SÜREKLİLİĞİ (V3-C, 2026-08-24).
//
// ★★ EŞİK — TEĞET SÜREKSİZLİĞİ (C1 KIRIĞI): **1.0° = 0.0174533 rad**
//    KAYNAK: McNeel Wiki, "Understanding Tolerances",
//    https://wiki.mcneel.com/rhino/faqtolerances — Rhino'nun DOKÜMAN AÇI
//    TOLERANSI VARSAYILANI. Birebir: "The angular tolerance is important in that
//    it tells Rhino at what point you want two curves or surfaces to be
//    considered tangent." · "The default setting of 1 degree is rather large for
//    fine modeling." Sayfa doğrudan çekildi, GÜVEN: YÜKSEK (GECE/V3-R.md, EŞİK 1).
//    NOT — DAHA SIKI EMSAL: CATIA V5 GSD **0.5°** ("2 faces which have an angular
//    discontinuity less than 0.5deg are continuous in tangency (G1)"), künye
//    Dassault/CATIA V5, IBM APAR HD61495 + HD27070. O sayfalar HTTP 403 verdi,
//    snippet'ten alındı → GÜVEN: ORTA, o yüzden kapı 0.5°'ye değil 1.0°'ye
//    kuruldu. Damla sıkılaştırmak isterse dayanağı CATIA'dır.
//    NOT — BAĞLAMAYIN: OCCT `Precision::Angular()` = 1e-12 rad bir PARALELLİK
//    toleransıdır, teğet süreksizliği eşiği DEĞİLDİR (V3-R, EŞİK 1 (d)).
//
// ★★ DÖRT ARTEFAKT SINIFI — yayınlanmış karşılıkları (V3-R, EŞİK 3; kaynak
//    Sheffer/Praun/Rose 2006, "Mesh Parameterization Methods and their
//    Applications", FnT CGV 2(2):105-171, PDF okundu, GÜVEN: YÜKSEK):
//      1. tırtıklı/dişli kenar   — YAYINLANMIŞ AD YOK, yayınlanmış SAYISAL EŞİK
//                                  YOK. Bizim ölçümüz: ardışık teğet açısının
//                                  İŞARET DEĞİŞTİRMESİ. Gürültüyü kusur saymamak
//                                  için sadece HER İKİ komşu dönüşü de 1.0°'yi
//                                  aşan işaret değişimleri KAPI; ham sayım da
//                                  ayrıca basılır (gizlenmez).
//      2. kendini kesen kontur   — "global overlap" (global bijectivity ihlali),
//                                  survey Fig. 2(a). İKİLİ YÜKLEM, eşik yok.
//      3. eğrilik süreksizliği   — parametrizasyon literatüründe KARŞILIĞI YOK;
//                                  karşılık CAD tarafında (yukarıdaki 1.0°).
//      4. sıfır alanlı / dejenere— "degenerate / non-positive signed area",
//                                  `igl::flipped_triangles`'ın saydığı şey.
//                                  İKİLİ YÜKLEM, eşik yok.
//
// ★★ ÖLÇÜLEN NESNE — AÇIKÇA: `shell-flat <BEDEN>` her görünüm için YARIM bir
//    siluet zinciri basıyor (omuz halkasından etek ucuna, tek yanda). Bu AÇIK
//    bir polyline'dır. Sınıf 1 ve 3 doğrudan bu zincirde ölçülür. Sınıf 2 ve 4
//    KAPALI bir kontur ister; kapalı kontur, basılan zincirin x → −x AYNASI
//    ters sırayla eklenerek KURULUR (giysinin çizilen siluetinin ta kendisi).
//    Bu kuruluş burada BEYAN EDİLİYOR, gizlenmiyor.
//
// ★★ YASAK (V3-C kartı): artefaktı kırpma, smoothing, çözünürlük düşürme ile
//    GİZLEMEK fazı tek başına düşürür. Bu dosya HİÇBİR yumuşatma yapmaz;
//    sıfır uzunluklu segmentleri ATMAZ, SAYAR.
//
// ★★ İKİ ZİNCİR — NEDEN (bu ayrım OLMADAN kapı KENDİ KENDİNİ KÖRLEŞTİRİYORDU):
//    SINIF 4 (dejenere) HAM zincirde sayılır — çakışık nokta atılırsa sayılamaz.
//    SINIF 1 ve 3 (teğet) ise ÇAKIŞIK NOKTALARI ÇÖKERTİLMİŞ zincirde ölçülür.
//    Sebep ölçülmüş bir kusurdur, kolaylık değil: sıfır uzunluklu bir segmentin
//    teğeti TANIMSIZDIR, o yüzden ilk yazımda o nokta atlanıyordu — ve tam
//    orada duran 20.56°'lik gerçek teğet kırığı GÖRÜNMEZ oluyordu. Yani çakışık
//    nokta, kendi komşusundaki C1 kırığını maskeliyor. Çökertme bir SMOOTHING
//    DEĞİLDİR (hiçbir nokta oynatılmaz, hiçbir açı yumuşatılmaz); tanımsız
//    teğeti tanımlı hale getirir ve gizlenen kırığı GÖRÜNÜR KILAR.
//
// KANIT KANCASI (4.2/4.5 için; üretimde set edilmez, edilirse ekrana basılır):
//   V3C_SHELL_JSON — shell-flat yerine hazır bir JSON artefaktı oku

import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const SIZE = process.env.V3C_SIZE || 'EU38';
const SHELL_BIN = join(root, 'engine/build/shell-flat');

const ANGLE_TOL_DEG = 1.0;              // McNeel Rhino doküman açı toleransı varsayılanı
const DEGEN_LEN_MM = 1e-9;              // sıfır uzunluk: ikili yüklem, "eşik" değil

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

console.log('=== KANAT (b)+(c) — ARTEFAKT SAYIMI · beden ' + SIZE);
console.log(`    C1 eşiği ${ANGLE_TOL_DEG.toFixed(1)}° — McNeel Rhino "Understanding Tolerances" doküman varsayılanı (GÜVEN: YÜKSEK)`);
console.log('    daha sıkı emsal: CATIA V5 GSD 0.5° (GÜVEN: ORTA, sayfa 403) — kapıya BAĞLANMADI');
if (process.env.V3C_SHELL_JSON) console.log(`    ⚠ KANIT KANCASI AKTİF: V3C_SHELL_JSON=${process.env.V3C_SHELL_JSON}`);

// ---------------------------------------------------------------------------
function readFlat() {
  if (process.env.V3C_SHELL_JSON) return JSON.parse(readFileSync(process.env.V3C_SHELL_JSON, 'utf8'));
  if (!existsSync(SHELL_BIN)) { FAIL(`[b] shell-flat ikilisi YOK: ${SHELL_BIN} — eksik alet = eksik kanıt`); return null; }
  return JSON.parse(execFileSync(SHELL_BIN, [SIZE], { encoding: 'utf8', maxBuffer: 1 << 28 }));
}

const seg = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
function turnDeg(p0, p1, p2) {
  const ax = p1[0] - p0[0], ay = p1[1] - p0[1], bx = p2[0] - p1[0], by = p2[1] - p1[1];
  if (Math.hypot(ax, ay) < 1e-12 || Math.hypot(bx, by) < 1e-12) return null;
  let d = Math.atan2(by, bx) - Math.atan2(ay, ax);
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d * 180 / Math.PI;
}
function segsIntersect(p, p2, q, q2) {
  const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d1 = d(q, q2, p), d2 = d(q, q2, p2), d3 = d(p, p2, q), d4 = d(p, p2, q2);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
const shoelace = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return a / 2;
};

// ---------------------------------------------------------------------------
const flat = readFlat();
const report = [];   // sınıf -> {count, sites}

if (flat) {
  const total = { jagRaw: 0, jagSig: 0, xsect: 0, c1: 0, degen: 0, zeroArea: 0 };
  let worstTurn = { deg: 0, where: '—' };

  for (const v of flat.views || []) {
    const chain = (v.outline || []).map((p) => [p.x, p.z]);
    const spanOf = (i) => (v.outline[i] || {}).span || '?';

    // --- SINIF 4a: DEJENERE SEGMENT (sıfır uzunluk) -----------------------
    const degenSites = [];
    for (let i = 0; i + 1 < chain.length; i++) {
      if (seg(chain[i], chain[i + 1]) <= DEGEN_LEN_MM) degenSites.push(`${v.view} i${i}->${i + 1} @z=${chain[i][1].toFixed(3)} span ${spanOf(i)}|${spanOf(i + 1)}`);
    }
    total.degen += degenSites.length;
    if (degenSites.length) report.push(['4 dejenere segment', degenSites]);

    // --- SINIF 3 + 1: TEĞET AÇISI (ÇÖKERTİLMİŞ zincirde — başlıktaki gerekçe)
    const tchain = [];              // çakışık nokta çökertilmiş, HAM index korunur
    for (let i = 0; i < chain.length; i++) {
      const last = tchain[tchain.length - 1];
      if (last && seg(last.p, chain[i]) <= DEGEN_LEN_MM) continue;
      tchain.push({ p: chain[i], raw: i });
    }
    const turns = [];
    for (let i = 1; i + 1 < tchain.length; i++) {
      const t = turnDeg(tchain[i - 1].p, tchain[i].p, tchain[i + 1].p);
      if (t == null) continue;
      const ri = tchain[i].raw;
      turns.push({ i: ri, deg: t });
      if (Math.abs(t) > Math.abs(worstTurn.deg)) worstTurn = { deg: t, where: `${v.view} ham-i${ri} span ${spanOf(ri)}` };
      if (Math.abs(t) > ANGLE_TOL_DEG) {
        total.c1 += 1;
        report.push(['3 C1 kırığı', [`${v.view} ham-i${ri} teğet farkı ${t.toFixed(4)}° > ${ANGLE_TOL_DEG}° @z=${chain[ri][1].toFixed(3)} span ${spanOf(ri - 1)}|${spanOf(ri + 1)}`]]);
      }
    }
    for (let k = 1; k < turns.length; k++) {
      const a = turns[k - 1], b = turns[k];
      if (a.deg === 0 || b.deg === 0) continue;
      if (Math.sign(a.deg) !== Math.sign(b.deg)) {
        total.jagRaw += 1;
        if (Math.abs(a.deg) > ANGLE_TOL_DEG && Math.abs(b.deg) > ANGLE_TOL_DEG) {
          total.jagSig += 1;
          report.push(['1 tırtıklı kenar', [`${v.view} i${a.i}/${b.i} işaret değişimi ${a.deg.toFixed(4)}° -> ${b.deg.toFixed(4)}°`]]);
        }
      }
    }

    // --- SINIF 2 + 4b: KAPALI KONTUR --------------------------------------
    const closed = chain.concat(chain.slice().reverse().map((p) => [-p[0], p[1]]));
    const dedup = closed.filter((p, i) => i === 0 || seg(closed[i - 1], p) > DEGEN_LEN_MM);
    const n = dedup.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue;
        if (segsIntersect(dedup[i], dedup[(i + 1) % n], dedup[j], dedup[(j + 1) % n])) {
          total.xsect += 1;
          report.push(['2 kendini kesen kontur', [`${v.view} segment ${i} x ${j}`]]);
        }
      }
    }
    const area = shoelace(dedup);
    if (Math.abs(area) <= 1e-9) { total.zeroArea += 1; report.push(['4 sıfır alan', [`${v.view} kapalı kontur alanı ${area}`]]); }
    console.log(`\n    ${v.view}: ${chain.length} nokta · kapalı kontur ${n} nokta · alan ${(Math.abs(area) / 100).toFixed(2)} cm²`);
  }

  // -------------------------------------------------------------------------
  console.log('\n--- SAYIM (kaç adet · kaynak dosya:satır · kök çözüm)');
  const rows = [
    ['1 tırtıklı/dişli kenar', total.jagSig,
     'engine/src/shellprojection.cpp:94-97 (halfWidthAt örneklemesi, kSampleStepMM=4.0)',
     `KÖK ÇÖZÜM: siluet noktası ${'`'}effectiveSection${'`'}'dan tek tek okunuyor; tırtık çıkarsa kesitin kendi C1'i kırıktır, örneklemeyi sıklaştırmak DEĞİL kesit karışımını (hip blend) sürekli hale getirmek gerekir. HAM işaret değişimi ${total.jagRaw} (gürültü dahil, gizlenmiyor).`],
    ['2 kendini kesen kontur', total.xsect,
     'engine/src/shellprojection.cpp:89-118 (project(), tek yanlı zincir + ayna)',
     'KÖK ÇÖZÜM: yarı-genişlik h boyunca monoton örneklendiği için öz-kesişim ancak halfWidthAt işaret değiştirirse doğar; çözüm kesim değil, negatif yarı-genişliği Result::Err ile reddetmek.'],
    ['3 eğrilik süreksizliği (C1)', total.c1,
     'engine/src/surfacepattern.cpp:71-81 (GarmentSurf::effectiveSection, SKIM RUN başlangıcı h=skimBaseH=bel) — ikincil aday: engine/src/surfacepattern.cpp:43-52 (profile()\'ın halkalar arası DOĞRUSAL lin() interpolasyonu). shellprojection.cpp:104\'ün fitCubics\'i DEĞİL: kırık, fit\'ten ÖNCE ham örneklenmiş poligonda ölçüldü.',
     'KÖK ÇÖZÜM: bel yüksekliğinin ÜSTÜNDE kabuk "skim envelope" yasasına, ALTINDA halka interpolasyonuna uyuyor; iki yasa skimBaseH\'de HİÇBİR TEĞET KOŞULU OLMADAN buluşuyor, o yüzden bel bir V köşesi. Kalçada bu sorun zaten çözülmüş (surfacepattern.cpp:55-60, blendMM ile kuadratik köşe yuvarlama) — aynı köşe yuvarlaması BELDE YOK; ya oraya da uygulanmalı ya da skim run\'ın alt ucu halka interpolasyonunun bel eğimiyle eşitlenmeli.'],
    ['4 dejenere segment / sıfır alan', total.degen + total.zeroArea,
     'engine/src/shellprojection.cpp:94-97 + 112-115 (her koşu r.top..r.bot KAPALI aralık örnekliyor, ardışık koşuların uç noktası AYNI h)',
     'KÖK ÇÖZÜM: koşu sınırındaki nokta iki kez push_back ediliyor (bir önceki koşunun son noktası = sonraki koşunun ilk noktası). Kırpma değil: ikinci koşu i=1\'den başlamalı ya da out.outline\'a yazarken sınır noktası tekilleştirilmeli.'],
  ];
  for (const [name, count, src, fix] of rows) {
    console.log(`\n    ${name}`);
    console.log(`      adet   : ${count}`);
    console.log(`      kaynak : ${src}`);
    console.log(`      ${fix}`);
  }
  console.log(`\n    en büyük teğet farkı: ${worstTurn.deg.toFixed(6)}° @ ${worstTurn.where}  (eşik ${ANGLE_TOL_DEG}°)`);

  // --- KAPILAR --------------------------------------------------------------
  console.log('\n--- KAPI HÜKÜMLERİ');
  if (total.jagSig > 0) FAIL(`[1 tırtıklı] ${total.jagSig} anlamlı işaret değişimi (her iki komşu dönüş de > ${ANGLE_TOL_DEG}°)`);
  else OK(`1 tırtıklı — anlamlı işaret değişimi 0 (ham ${total.jagRaw}, hepsi ${ANGLE_TOL_DEG}° altında)`);
  if (total.xsect > 0) FAIL(`[2 öz-kesişim] ${total.xsect} kesişen segment çifti — "global overlap", ikili yüklem, tolerans YOK`);
  else OK('2 öz-kesişim — 0 (global overlap yok)');
  if (total.c1 > 0) FAIL(`[3 C1] ${total.c1} nokta teğet farkı ${ANGLE_TOL_DEG}°'yi aşıyor`);
  else OK(`3 C1 — en büyük teğet farkı ${Math.abs(worstTurn.deg).toFixed(6)}° <= ${ANGLE_TOL_DEG}°`);
  if (total.degen > 0) FAIL(`[4 dejenere] ${total.degen} sıfır uzunluklu segment — ikili yüklem, tolerans YOK, KIRPILMADI SAYILDI`);
  else OK('4 dejenere — sıfır uzunluklu segment 0');
  if (total.zeroArea > 0) FAIL(`[4 sıfır alan] ${total.zeroArea} görünümün kapalı konturu sıfır alanlı`);
  else OK('4 sıfır alan — her görünümün kapalı konturu pozitif alanlı');

  if (report.length) {
    console.log('\n--- YER LİSTESİ (ilk 20)');
    for (const [cls, sites] of report.slice(0, 20)) console.log(`    ${cls}: ${sites.join(' ; ')}`);
  }
}

console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} flat_artifact_census — ${fails} ihlal`);
process.exit(fails === 0 ? 0 : 1);
