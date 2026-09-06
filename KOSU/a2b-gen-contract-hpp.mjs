// a2b-gen-contract-hpp.mjs — 0509 A2b: iki sozlesmeyi WASM'in icine gomer.
// NEDEN: native grafciz sozlesmeyi diskten okur (repo kokunden); tarayicida disk YOKTUR,
// ama kabul_P1 wasm flatSVG(grafJSON, bodyId)'nin native ile BAYT-AYNI cikmasini istiyor.
// Ayni cikti ancak AYNI SOZLESME METNI ile mumkun, o yuzden metin oldugu gibi gomulur
// (kopyalanmis SAYI degil, dosyanin kendisi; sozlesme degisince bu baslik yeniden uretilir).
// Cikti: engine/src/grafcontract.gen.hpp  ·  Kosum: node KOSU/a2b-gen-contract-hpp.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const kaynaklar = [
  ['kGrafContractJSON', 'contract/graf-v1.json'],
  ['kPatternSheetJSON', 'contract/pattern-sheet-v1.json'],
];
let out = `#pragma once
// grafcontract.gen.hpp — URETILMIS DOSYA, ELLE DUZENLEME.
// Ureten: node KOSU/a2b-gen-contract-hpp.mjs (0509 A2b)
// Icerik: contract/graf-v1.json ve contract/pattern-sheet-v1.json'un BAYT-AYNI metni.
// Amac: WASM'de disk yok; wasm flatSVG/kalipSVG native ile ayni sozlesmeyi okusun diye gomulur.
namespace stitchu {
namespace graf {
`;
for (const [ad, yol] of kaynaklar) {
  const metin = readFileSync(yol, 'utf8');
  // C++11 ham dize: JSON icinde )stitchu" dizisi olamaz, sinirlayici guvenli.
  if (metin.includes(')stitchu"')) throw new Error(`sinirlayici carpisti: ${yol}`);
  out += `\n// ${yol} (${Buffer.byteLength(metin)} bayt)\ninline const char* ${ad}() { return R"stitchu(${metin})stitchu"; }\n`;
}
out += `
}  // namespace graf
}  // namespace stitchu
`;
writeFileSync('engine/src/grafcontract.gen.hpp', out);
console.log(`engine/src/grafcontract.gen.hpp yazildi (${Buffer.byteLength(out)} bayt)`);
