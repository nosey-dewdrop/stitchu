// KOSU/siluet-ciz.mjs — SILUET -> FLAT, NODE/CLI SARMALAYICISI.
//
// 11 Eyl 2026, G2: CIZIM GEOMETRISI ARTIK BURADA DEGIL. Urunun tek flat kalemi
// web/lib/siluet-ciz.js'tir (bu dosyanin 10 Eyl'deki govdesinin TASINMIS hali,
// kopyasi degil). Bu dosya yalniz iki is yapar:
//   1. contract/body-v1.json + contract/siluet-v1.json'u DISKTEN okur ve
//      kanunuKur() ile kaleme verir (tarayici bunlari fetch ile alir),
//   2. CLI'yi acar ve kalemin her seyini oldugu gibi yeniden disari verir.
// Boylece KOSU (node) ile web (tarayici) AYNI geometriyi kosar; iki yerde iki
// cizim olamaz, cunku iki cizim yok.
//
//   node KOSU/siluet-ciz.mjs <siluet.json> <cikis.svg>
//   import { ciz } from './siluet-ciz.mjs'; ciz(okuma) -> { svg, imza, kirmizi[] }
import { readFileSync, writeFileSync } from 'node:fs';
import { kanunuKur, kanunKurulduMu } from '../web/lib/siluet-ciz.js';

// Kanunu bir kez, import aninda kur: bu modulu import eden her KOSU scripti
// (siluet-uret, siluet-kalip, ...) hicbir sey yapmadan cizebilsin.
if (!kanunKurulduMu()) {
  kanunuKur(
    JSON.parse(readFileSync('contract/body-v1.json', 'utf8')),
    JSON.parse(readFileSync('contract/siluet-v1.json', 'utf8')),
  );
}

export { ciz, nokta, noktaBeden, kanunuKur, kanunKurulduMu } from '../web/lib/siluet-ciz.js';
import { ciz } from '../web/lib/siluet-ciz.js';

if (process.argv[1] && process.argv[1].endsWith('siluet-ciz.mjs')) {
  const [girdi, cikis] = process.argv.slice(2);
  if (!girdi || !cikis) { console.error('kullanim: node KOSU/siluet-ciz.mjs <siluet.json> <cikis.svg>'); process.exit(2); }
  const r = ciz(JSON.parse(readFileSync(girdi, 'utf8')));
  writeFileSync(cikis, r.svg);
  console.log(JSON.stringify({ svg: cikis, imza: r.imza, kirmizi: r.kirmizi }));
  if (r.kirmizi.length) process.exit(1);
}
