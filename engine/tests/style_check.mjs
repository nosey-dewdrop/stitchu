// style_check — GOLDEN-PIN'in görsel kardeşi. Damla "kalemim" dediği her flat
// render'ı REPO PİNİNE (engine/STYLE-PIN/<style>.svg) diff'ler. Üretim flat
// çıktısı pinli SVG ile byte-identical değilse FAIL. Regen-vs-regen kanıt değil:
// daima repo pinine karşı.
//   node engine/tests/style_check.mjs
// Her pinli stil için üretim yolunu (renderGarmentFlatAsync) yeniden koşar,
// pin SVG'siyle cmp eder. FAIL mesajı iki dürüst yolu gösterir.

import { readFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const PIN_DIR = join(root, 'engine/STYLE-PIN');

// pinli her stil dosyası: <styleKey>.svg → üretim yolu {style: styleKey}
const pins = existsSync(PIN_DIR)
  ? readdirSync(PIN_DIR).filter((f) => f.endsWith('.svg'))
  : [];

if (!pins.length) {
  console.log('style_check: no pins yet (engine/STYLE-PIN boş) — PASS (nothing to enforce)');
  process.exit(0);
}

const { renderGarmentFlatAsync } = await import('../tools/render-garment-flat.mjs');

let failed = 0;
for (const file of pins) {
  const styleKey = basename(file, '.svg');
  const pinned = readFileSync(join(PIN_DIR, file), 'utf8');
  const fresh = await renderGarmentFlatAsync([], { style: styleKey });
  if (fresh === pinned) {
    console.log(`style_check PASS: ${styleKey} byte-identical to pin (${pinned.length} chars)`);
  } else {
    failed++;
    console.log(`style_check FAIL: ${styleKey} differs from the REPO PIN (engine/STYLE-PIN/${file}).`);
    console.log(`  fresh: ${fresh.length} chars   pin: ${pinned.length} chars`);
    console.log('  Two honest ways out:');
    console.log('    1. UNINTENDED change -> fix the flat code until this passes.');
    console.log('    2. INTENDED pen revision -> Damla re-approves, then scripts/repin-style.sh');
    console.log('       + a ledger entry in engine/STYLE-PIN/STYLE-PIN.md.');
    console.log('  Regen-vs-regen is not a style proof; always diff against the repo pin.');
  }
}
process.exit(failed ? 1 : 0);
