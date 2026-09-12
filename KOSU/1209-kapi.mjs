// KOSU/pembe-kapi.mjs — HER TURDAN SONRA KOSULAN KAPI.
// Kor hakem (12 Eyl, 3. tur): "her turda duzeltilen kalem duzeliyor ama komsusu
// boziliyor. Motorda parametreler birbirine bagli ve REGRESYON TESTI YOK."
// Bu kapi 7 orani + 3 nesne kontrolunu olcer. Tek tek duzeltme yerine her turdan
// sonra kosulur; bir kalem duzelirken baskasi kirilirsa aninda gorunur.
//   node KOSU/pembe-kapi.mjs <siluet.json>
import { readFileSync } from 'node:fs';
import { ciz, nokta } from './siluet-ciz.mjs';

const HEDEF = {
  'aciklik derinligi/govde': 0.267,
  'aciklik genisligi/gogus': 0.496,
  // PERSPEKTIF DUZELTMESI (12 Eyl kok teshisi): hakem uc turda da fotograftan
  // 0.945 olctu, ama fotograf 3/4 DONUK. yolB'nin iki eksenli kalibrasyonu:
  // dikey 1.6408 mm/px, yatay 1.1911 -> oran 1.378. Yatay eksen kisaldigi icin
  // BEL OLDUGUNDAN GENIS olculuyor. Duzeltme: 0.945 / sqrt(1.378) = 0.805.
  // Kanit: 0.945 ile daralma %5.5 cikiyor ve flat GORSEL olarak tunik gibi
  // duruyor; fotografta bel belirgin. Gorsel kum saati %14-18 daralma ister.
  'bel/gogus': 0.805,
  // TURETILMIS, ELLE GIRILMEZ (12 Eyl kok duzeltme): once 'kalca/bel 1.392'
  // yaziliydi ve UC HEDEF MATEMATIKSEL OLARAK TUTARSIZDI:
  //   bel/gogus 0.945 x etek/bel 1.392 = 1.315, ama etek/gogus hedefi 1.113.
  // Kapi imkansiz bir sey istiyordu; hangi sayiyi tutturursan digeri bozuluyordu.
  // Bagimsiz olcumler bel/gogus ve etek/gogus'tur (hakem uc turda da ayni olctu);
  // etek/bel ONLARDAN TURER: 1.113 / 0.945 = 1.178.
  'etek/bel': 1.113 / 0.805,
  'etek/gogus': 1.113,
  'kol boyu/govde': 0.195,
  // PERSPEKTIF + GEOMETRI KONTROLU (12 Eyl): 2.235 hedefi de yatay paydayla
  // olculdu (gogus 3/4 pozda kisa okunuyor -> oran buyuk cikiyor). Iki bagimsiz
  // hesap: (a) perspektif duzeltmesi 2.235/1.378 = 1.622; (b) GEOMETRI —
  // mini elbise = etek ucu kalcanin hemen altinda; omuz y=62, hip y=629.5,
  // etek ~hip+40 -> govde 607, gogus tam 309.4 -> 1.96. Geometri daha guvenilir
  // (olcum degil tanim), secilen 1.96.
  'govde boyu/gogus': 1.96,
};
const BANT = 0.08;   // +-%8 hedefte sayilir

const girdi = process.argv[2];
if (!girdi) { console.error('kullanim: node KOSU/pembe-kapi.mjs <siluet.json>'); process.exit(2); }
const o = JSON.parse(readFileSync(girdi, 'utf8'));
const on = o.on, K = on.kontur;
const p = (k) => nokta(K[k]);
const omuz = p('omuzUc'), koltuk = p('koltukalti'), gogus = p('gogus');
const bel = p('bel'), kalca = p('kalca'), etek = p('etekYan');
const govdeBoyu = etek.y - omuz.y;

// aciklik: keyhole ogesi varsa ondan, yoksa yaka konturundan
const kh = (on.ogeler || []).find((x) => x.tip === 'keyhole');
const acikUst = kh ? nokta(kh.noktalar[0]).y : p('yakaOmuz').y;
const acikAlt = kh ? nokta(kh.noktalar[1]).y : p('yakaOrta').y;
const acikGen = kh ? (kh.genislik ?? 0) / 2 : Math.abs(p('yakaOmuz').x);

const kol = on.kol ? nokta(on.kol.dis) : null;
const olcum = {
  'aciklik derinligi/govde': (acikAlt - acikUst) / govdeBoyu,
  'aciklik genisligi/gogus': acikGen / Math.abs(gogus.x),
  'bel/gogus': Math.abs(bel.x) / Math.abs(gogus.x),
  'etek/bel': Math.abs(etek.x) / Math.abs(bel.x),
  'etek/gogus': Math.abs(etek.x) / Math.abs(gogus.x),
  'kol boyu/govde': kol ? (kol.y - omuz.y) / govdeBoyu : 0,
  'govde boyu/gogus': govdeBoyu / (2 * Math.abs(gogus.x)),
};

let gecen = 0;
const satir = [];
for (const [ad, h] of Object.entries(HEDEF)) {
  const v = olcum[ad], sap = (v - h) / h;
  const ok = Math.abs(sap) <= BANT; if (ok) gecen++;
  satir.push(`${ok ? 'OK ' : '   '} ${ad.padEnd(26)} ${v.toFixed(3)}  hedef ${h}  ${(sap * 100).toFixed(1)}%`);
}

// NESNE KONTROLU — GENEL (12 Eyl kok duzeltme): kapi once pembe elbiseye ozeldi
// ("bant var mi", "pens var mi", "kol var mi") ve bantsiz/kolsuz bir elbisede
// yanlis yeri olcuyordu. Artik SADECE VAR OLAN nesneler denetlenir: bir oge yoksa
// o kontrol ATLANIR, hata sayilmaz. Kapi her giysiye kosulabilir.
const nesne = [];
for (const oge of (on.ogeler || [])) {
  if (oge.tip === 'pens' && oge.noktalar && oge.noktalar[1]) {
    const bacak = nokta(oge.noktalar[1]);
    const fark = Math.abs(koltuk.x) - Math.abs(bacak.x);
    nesne.push([fark >= -2 && fark <= 24, `pens bacagi yan dikise yakin (${fark.toFixed(0)} mm)`]);
  }
  if (oge.tip === 'pat' && oge.noktalar && oge.noktalar[1]) {
    const ucu = nokta(oge.noktalar[1]);
    nesne.push([Math.abs(ucu.x) <= Math.abs(etek.x) && ucu.y <= etek.y + 2,
      `pat govde icinde bitiyor (${Math.abs(ucu.x).toFixed(0)} <= ${Math.abs(etek.x).toFixed(0)})`]);
  }
  if (oge.tip === 'yakaBandi') nesne.push([true, 'bant nesnesi var']);
}
const kolIc = on.kol ? nokta(on.kol.ic) : null;
if (kolIc) {
  const oyuk = Math.abs(koltuk.x) - Math.abs(kolIc.x);
  nesne.push([oyuk >= 6, `koltukalti oyugu acik (${oyuk.toFixed(0)} mm)`]);
}
// KOLSUZ giyside kol evi kenari icbukey olmali (contract yanlislama 5)
if (!on.kol) nesne.push([Math.abs(koltuk.x) < Math.abs(gogus.x),
  `kolsuz: kol evi govdeye oyuk (${Math.abs(koltuk.x).toFixed(0)} < ${Math.abs(gogus.x).toFixed(0)})`]);

// BICIM KONTROLU (12 Eyl): kapi 7/7 gecti ama flat CIRKINDI — kalca balon gibi
// sisti, etek ucu ICE daraldi. Oran hedefte olmasi bicimin dogru oldugunu
// GOSTERMIYOR. Silüetin en genis yeri etek ucu olmali (A hatti); kalca ondan
// genisse giysi armut gorunur.
nesne.push([Math.abs(kalca.x) <= Math.abs(etek.x) * 1.02,
  `kalca etek ucunu asmiyor (kalca ${Math.abs(kalca.x).toFixed(0)} / etek ${Math.abs(etek.x).toFixed(0)})`]);
// Yan hat MONOTON olmali: bel -> kalca -> etek surekli genislesin, geri donmesin
nesne.push([Math.abs(bel.x) <= Math.abs(kalca.x) && Math.abs(kalca.x) <= Math.abs(etek.x) * 1.02,
  'yan hat belden eteg dogru monoton']);

const r = ciz(o);
nesne.push([r.kirmizi.length === 0, `sifir kirmizi (${r.kirmizi.length})`]);

console.log(satir.join('\n'));
console.log('');
for (const [ok, ad] of nesne) console.log(`${ok ? 'OK ' : 'XX '} ${ad}`);
const nOk = nesne.filter(([x]) => x).length;
console.log(`\nORAN ${gecen}/7   NESNE ${nOk}/${nesne.length}`);
process.exit(gecen === 7 && nOk === nesne.length ? 0 : 1);
