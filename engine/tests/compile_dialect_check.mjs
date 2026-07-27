#!/usr/bin/env node
// compile_dialect_check.mjs — MANDAL (2026-07-27): compile() web lehçesini tanır.
// Bulgu (json-el adli raporu): web spec'inin waistline/fabric/skirtLengthMM
// alanları gramer slot'u olmadığı için 'eksik_primitif' sayılıyor, TÜM spec
// üretilemez oluyordu — iç boru hattı ile web AYRI dil konuşuyordu. Fix: bu
// üç alan meşru web-lehçesi alanı olarak ayıklanır, değeri doğrulanır ve
// motora AYNEN taşınır. Mandallar:
//   1) lehçeli spec artık DERLENİR (eskiden üretilemezdi),
//   2) flat BYTE-IDENTICAL kalır (lehçe alanı kaleme sızmaz — davranış aynı),
//   3) skirtLengthMM motora ULAŞIR (353 vs 1100 farklı kalıp),
//   4) geçersiz lehçe değeri DÜRÜST red (sessiz düşme/kırpma yok),
//   5) gramer yasası sağlam: uydurma alan hâlâ üretilemez.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const { compile } = await import(join(root, 'engine/compiler/compile.mjs'));

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };

// köprüde referans stili OLAN bir dress spec'i (crew+princess →
// dress_princess_scoop_aline) — köprü eşleşmesi bu testin konusu değil.
const BASE = { garment: 'dress', neckline: 'crew', shaping: 'princess', skirt: 'aLine', length: 'mini' };
const DIALECT = { waistline: 'natural', fabric: 'woven', skirtLengthMM: 353 };

// 1) + 2): lehçeli spec derlenir ve flat byte-identical kalır.
const plain = await compile({ ...BASE });
const dial = await compile({ ...BASE, ...DIALECT });
if (!plain.ok) fail(`kontrol spec'i derlenemedi: ${JSON.stringify(plain.eksik_primitif)}`);
if (!dial.ok) fail(`web lehçeli spec ÜRETİLEMEZ kaldı: ${JSON.stringify(dial.eksik_primitif)} — 27 Tem ayrı-dil bug'ı geri geldi`);
if (plain.ok && dial.ok) {
  if (plain.flatHash !== dial.flatHash) fail(`lehçe alanları FLAT'i değiştirdi (${plain.flatHash} vs ${dial.flatHash}) — davranış değişmeden geçir/taşı bozuldu`);
  if (!dial.kalip) fail(`lehçeli spec kalıp üretmedi (kalipError: ${dial.kalipError})`);
}

// 3) skirtLengthMM motora ulaşır: 353 vs 1100 kalıpları FARKLI olmalı.
const mm1100 = await compile({ ...BASE, ...DIALECT, skirtLengthMM: 1100 });
if (!mm1100.ok) fail(`skirtLengthMM 1100 spec derlenemedi: ${JSON.stringify(mm1100.eksik_primitif)}`);
if (dial.ok && mm1100.ok && dial.kalip && mm1100.kalip) {
  if (JSON.stringify(dial.kalip) === JSON.stringify(mm1100.kalip)) {
    fail('353 ve 1100 mm AYNI kalıbı üretti — mm compile yolunda motora ulaşmıyor');
  }
}
// mm=0 = kapalı: kalıp mm'siz spec ile birebir aynı (opt-in default korunur).
const mm0 = await compile({ ...BASE, waistline: 'natural', fabric: 'woven', skirtLengthMM: 0 });
if (plain.ok && mm0.ok && JSON.stringify(plain.kalip) !== JSON.stringify(mm0.kalip)) {
  fail('mm=0 kalıbı mm\'siz kalıptan farklı — opt-in default bozuldu');
}

// 4) geçersiz lehçe değeri dürüst red (sessiz kırpma/düşme yasak).
for (const bad of [{ skirtLengthMM: 50 }, { skirtLengthMM: 'uzun' }, { waistline: 'dropped' }, { fabric: 'leather' }]) {
  const r = await compile({ ...BASE, ...bad });
  if (r.ok) fail(`geçersiz lehçe değeri ${JSON.stringify(bad)} sessizce kabul edildi`);
}

// 5) gramer yasası sağlam: gramerde olmayan alan hâlâ üretilemez.
const rogue = await compile({ ...BASE, sleeveHead: 'gathered' });
if (rogue.ok) fail('gramer dışı alan (sleeveHead) artık sessizce geçiyor — yasa delindi');

if (fails) { console.error(`\ncompile_dialect_check FAILED (${fails})`); process.exit(1); }
console.log(`compile_dialect_check GREEN: web lehçesi derleniyor (flat ${plain.flatHash}=${dial.flatHash} byte-identical), mm motora ulaşıyor (353!=1100 kalıp), geçersiz değer dürüst red`);
