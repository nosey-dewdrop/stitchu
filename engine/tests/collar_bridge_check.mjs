#!/usr/bin/env node
// collar_bridge_check.mjs — MANDAL (2026-07-27): yaka sessiz-düşme sınıfı ÖLÜ.
// Bulgu (json-el adli raporu): vision şeması camelCase 'peterPan' verir, köprü
// regex'i ('peter pan'/'peter-pan'/'bebe') eşleşmez → yaka sessizce çizilmezdi
// VE missing.js COLLAR_DRAWN listesi ('peterPan' listedeydi) kartı da
// bastırırdı: iki taraf birden kör. İKİ mandal:
//   1) köprü: şemanın KAPALI enum'undaki her çizilebilir tip deterministik
//      eşleşir (peterPan/stand/shirt/mandarin), notched/sailor dürüst null;
//   2) dürüstlük: şemadaki HER collar tipi ya köprüde eşleşir ya missing.js
//      kartına düşer — üçüncü (sessiz) sınıf YOK. Şema enum'u üzerinden
//      programatik tarama: şemaya yarın eklenen tip de bu mandala çarpar.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const { pickCollar } = await import(join(root, 'web/js/vision-bridge.js'));
const { missingFeatures } = await import(join(root, 'web/js/missing.js'));
const { VOCAB } = await import(join(root, 'web/js/vocab.gen.js'));
const schema = JSON.parse(readFileSync(join(root, 'contract/garment-spec.schema.json'), 'utf8'));

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };

// şemanın collar.type enum'unu bul (visionReading altında).
const findCollarEnum = (node) => {
  if (!node || typeof node !== 'object') return null;
  if (node.collar && node.collar.properties && node.collar.properties.type &&
      Array.isArray(node.collar.properties.type.enum)) return node.collar.properties.type.enum;
  for (const v of Object.values(node)) { const r = findCollarEnum(v); if (r) return r; }
  return null;
};
const collarEnum = findCollarEnum(schema);
if (!collarEnum) { fail('şemada collar.type enum bulunamadı'); }
const types = (collarEnum || []).filter((t) => typeof t === 'string' && t !== 'none');

// 1) KÖPRÜ: kapalı enum deterministik eşleşir; motor sözlüğünde OLAN tipe gider.
const WANT = { peterPan: 'peterPan', stand: 'stand', shirt: 'shirt', mandarin: 'mock' };
for (const [enumType, wantSpec] of Object.entries(WANT)) {
  const got = pickCollar({ collar: { type: enumType, name: null } });
  if (!got || got.type !== wantSpec) {
    fail(`enum '${enumType}' köprüde '${wantSpec}' olmalıydı, ${got ? got.type : 'null (sessiz düşme!)'} çıktı`);
  } else if (!VOCAB.collarType.values.includes(got.type)) {
    fail(`köprü '${got.type}' üretti ama motor sözlüğünde yok`);
  }
}
for (const honest of ['notched', 'sailor']) {
  if (pickCollar({ collar: { type: honest, name: null } }) !== null) {
    fail(`'${honest}' (dikimli yaka, motor çizmez) köprüde null olmalıydı`);
  }
}
// serbest-metin kanalı yaşıyor: name/oov hâlâ eşleşir, bias-bound dürüst null.
const byName = pickCollar({ collar: { type: 'other', name: 'peter pan collar' } });
if (!byName || byName.type !== 'peterPan') fail("name 'peter pan collar' serbest-metin yolu bozuldu");
if (pickCollar({ collar: { type: 'other', name: 'bias-bound neckline' } }) !== null) fail('bias-bound name dürüst null kalmalıydı');

// 2) SESSİZ SINIF YOK: şemadaki HER tip ya çizilir (köprü eşleşir) ya missing.js
// kartına düşer (collarDrawn=false iken kart BASILIR). Üçüncü yol yok.
for (const tp of types) {
  const mapped = pickCollar({ collar: { type: tp, name: null } });
  const seen = { collar: { type: tp, name: null }, collarDrawn: !!mapped, outOfVocab: [] };
  const carded = missingFeatures(seen, 'en').some((it) => /collar|yaka/i.test(it.label) || it.label === 'collar');
  if (mapped && carded) fail(`'${tp}': hem çizildi (köprü ${mapped.type}) hem kart basıldı — çifte konuşma`);
  if (!mapped && !carded) fail(`'${tp}': köprü eşleşmedi VE dürüstlük kartı da yok — SESSİZ DÜŞME (yasak sınıf)`);
}
// çizilen yaka (collarDrawn=true) kart üretmez — yanlış alarm yok.
const drawnSeen = { collar: { type: 'peterPan', name: 'peter pan' }, collarDrawn: true, outOfVocab: [] };
if (missingFeatures(drawnSeen, 'en').some((it) => /collar|peter/i.test(it.label))) {
  fail('çizilen peterPan yakaya kart basıldı — yanlış alarm');
}

if (fails) { console.error(`\ncollar_bridge_check FAILED (${fails})`); process.exit(1); }
console.log(`collar_bridge_check GREEN: şema enum'unun ${types.length} tipi de ya çizili ya kartlı — yaka sessiz-düşme sınıfı ölü (peterPan köprüde, notched/sailor kartta)`);
