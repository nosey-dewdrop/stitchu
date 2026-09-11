// KOSU/altin-kiyas.mjs — okuyucunun cikstisini ALTIN KOPYA ile kiyaslar. (11 Eyl 2026)
//
// Neden: G1 okuyucusunun "calisti" demesi yetmez. Insanin (Damla'nin oturumu)
// elle yazdigi okuma altin kopyadir; okuyucu ona ne kadar yaklasti, SAYIYLA olculur.
// Okuyucu altin kopyayi GORMEZ (kapi bunu ayrica denetler).
//
// Kullanim: node KOSU/altin-kiyas.mjs <uretilen.json> <altin.json>
// Cikti tek satir: "GECTI kontur=8/10 oge=3/4 sapma=6.1%" ya da "KALDI ..."
//
// Olcut (HEDEF md.1 ve md.11'e bagli):
//  - kontur noktalari: altindaki her anahtar uretilende de olmali; ortak noktalarda
//    landmark ADI ayni olmali (oran sapmasi ayri raporlanir, esik %15)
//  - ogeler: altindaki oge TIPLERI kumesi yakalanmali (fazladan oge ceza degil,
//    eksik oge cezadir -- giysiyi eksik gormek, fazla gormekten kotudur)
//  - GECTI sarti: kontur >= %80 ve oge >= %75 ve ortalama oran sapmasi <= %15

import { readFileSync } from 'node:fs';

const [, , uretilenYol, altinYol] = process.argv;
if (!uretilenYol || !altinYol) { console.log('KULLANIM'); process.exit(2); }

let U, A;
try { U = JSON.parse(readFileSync(uretilenYol, 'utf8')); }
catch { console.log('KALDI uretilen-okunamadi'); process.exit(1); }
try { A = JSON.parse(readFileSync(altinYol, 'utf8')); }
catch { console.log('KALDI altin-yok'); process.exit(1); }

// --- x ifadesinden oran cek: "bustLine*1.04" -> {lm:'bustLine', k:1.04}
function xCoz(s) {
  const m = /^(\w+)\*(-?[0-9.]+)(?:([+-][0-9.]+))?$/.exec(String(s ?? ''));
  return m ? { lm: m[1], k: parseFloat(m[2]) } : null;
}

let konturTop = 0, konturOK = 0, sapmalar = [];
for (const gorunum of ['on', 'arka']) {
  const ak = A?.[gorunum]?.kontur, uk = U?.[gorunum]?.kontur;
  if (!ak) continue;
  for (const [ad, aDeger] of Object.entries(ak)) {
    if (aDeger == null) continue;           // altinda da yoksa sayma
    konturTop++;
    const uDeger = uk?.[ad];
    if (uDeger == null) continue;           // eksik -> ceza
    const a = xCoz(aDeger[0]), u = xCoz(uDeger[0]);
    if (!a || !u) continue;
    if (a.lm !== u.lm) continue;            // yanlis landmark -> ceza
    konturOK++;
    if (a.k !== 0) sapmalar.push(Math.abs(u.k - a.k) / Math.abs(a.k));
  }
}

let ogeTop = 0, ogeOK = 0;
for (const gorunum of ['on', 'arka']) {
  const aOge = A?.[gorunum]?.ogeler || [];
  const uTipler = new Set((U?.[gorunum]?.ogeler || []).map(o => o?.tip));
  const aTipler = [...new Set(aOge.map(o => o?.tip))];
  for (const t of aTipler) { ogeTop++; if (uTipler.has(t)) ogeOK++; }
}

const konturOran = konturTop ? konturOK / konturTop : 0;
const ogeOran = ogeTop ? ogeOK / ogeTop : 1;
const ortSapma = sapmalar.length ? sapmalar.reduce((a, b) => a + b, 0) / sapmalar.length : 0;

// NOT (11 Eyl, olculdu): landmark ADLARI giysiler arasi buyuk olcude ayni
// (yakaOrta/omuzUc/koltukalti... hepsinde var), bu yuzden kontur orani TEK BASINA
// ayirt etmiyor -- iki farkli giysi de 18/18 veriyor. Ayirt eden sey ORAN sapmasi
// ve oge kumesi. O yuzden sapma esigi dar tutuldu (%8): etsy-01 ile etsy-05 arasi
// olculen sapma %4.1 idi, yani ayni giysi olmayan bir okuma bu esigi zorlar.
const gecti = konturOran >= 0.80 && ogeOran >= 0.75 && ortSapma <= 0.08;
const yuzde = (x) => (x * 100).toFixed(1) + '%';
console.log(
  `${gecti ? 'GECTI' : 'KALDI'} kontur=${konturOK}/${konturTop} oge=${ogeOK}/${ogeTop} sapma=${yuzde(ortSapma)}`
);
process.exit(gecti ? 0 : 1);
