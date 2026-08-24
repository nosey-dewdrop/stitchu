#!/usr/bin/env node
// gen-vision-vocab.mjs — writes vision-student/vocab.py from the two committed
// vocabulary tables. Same K1 discipline as gen-spec-v2.mjs / gen-vocab.mjs: the
// derivative is generated, never hand-edited, and vocab_source_check fails the
// suite the moment the file on disk stops matching this output.
//
//   node engine/tools/gen-vision-vocab.mjs                 # write in place
//   node engine/tools/gen-vision-vocab.mjs --out /tmp/x.py # write elsewhere
//   node engine/tools/gen-vision-vocab.mjs --check         # exit 1 if stale
//
// WHY THIS FILE EXISTS. vision-student/vocab.py carried a THIRD hand-copied
// word list. Measured 2026-08-24 against engine/vocab.json (the authority,
// GECE/V2-R.md §3.3): neckline 7 vs 9 (`cowl` and `pussyBow` missing), garment
// ["skirt","dress","top","trousers","other"] vs ["skirt","dress","top"]
// (`trousers` and `other` exist in no engine axis at all), skirtStyle 5 vs 6
// (`gore` missing). Its own docstring says the classes "MUST stay identical to
// the teacher schema" — and no gate in the repo checked that sentence, so it
// had been false for as long as anyone could measure.
//
// WHAT DECIDES A CLASS LIST. Two committed inputs, in this order:
//   engine/vocab.json                  which words exist on an axis
//   contract/vocab-resolution-v1.json  what each word resolves to (Layer 3 -> 1)
// A word ships as a class only when the resolution table says `resolved`.
//   `sentinel` (a "none" meaning absence) is NOT a class: the student is never
//     trained to predict absence — AMBAR YASASI already drops abstentions.
//   `absent` (in the vocabulary but unresolvable) is NOT silently dropped; it
//     lands in _UNRESOLVED with the table's own absentReason.
// Neither list is typed twice: change the tables, rerun, the file follows.
//
// WHICH AXES BECOME HEADS is a property of the STUDENT, not of the vocabulary —
// a head exists because someone is training it. So HEADS is declared here, with
// the reason, rather than sucked out of vocab.json's 37 axes.
//
// WHAT IT DOES NOT DO. It does not invent classes for the two words the hand
// list carried and no engine axis has. RULES invariant 1 forbids silently
// dropping them, so they are emitted into _UNRESOLVED with the reason, and
// vocab_source_check audits that block separately.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const VOCAB_PATH = 'engine/vocab.json';
export const RESOLUTION_PATH = 'contract/vocab-resolution-v1.json';
export const OUT_PATH = 'vision-student/vocab.py';

// The student's heads. `why` is emitted into the file so the reason travels
// with the list, and `pyName` keeps the module's published API unchanged —
// six other files in vision-student/ import these names.
export const HEADS = [
  { field: 'neckline', pyName: 'NECKLINE_CLASSES',
    why: 'K5 kaskadinin ilk kafasi; egitilen tek kafa buydu (train_neckline.py).' },
  { field: 'garment', pyName: 'GARMENT_CLASSES',
    why: 'Kaskadin koku: giysi ailesi secilmeden diger kafalar anlamsiz.' },
  { field: 'sleeveLength', pyName: 'SLEEVE_LENGTH_CLASSES',
    why: 'Fotograftan okunabilen, motorun da tanidigi tek kol ekseni.' },
  { field: 'skirtStyle', pyName: 'SKIRT_STYLE_CLASSES',
    why: 'Etek ailesi; motorun skirtStyle ekseniyle birebir.' },
];

// Words the hand-written list carried that NO engine axis defines. They are not
// resolution-table `absent` entries — they were never in the vocabulary at all,
// so the table cannot speak for them and the reason has to be declared here.
export const FOREIGN = [
  { field: 'garment', value: 'trousers',
    reason: 'engine/vocab.json fields.garment ["skirt","dress","top"] icinde YOK ve contract/vocab-resolution-v1.json\'da garment.trousers kalemi YOK: motor pantolon cizmiyor. Elle yazilmis listeden devralindi (kaynagini "backend/worker.js prompt" diye veriyordu). SILINMEDI cunku ogretmen sema fotografta pantolon gorebiliyor; bir sinif olarak egitilemez.' },
  { field: 'garment', value: 'other',
    reason: 'Ayni sekilde hicbir eksende YOK. "other" bir giysi degil, bir kacis kutusudur; UNCERTAIN_VALUES zaten cekimserligi disliyor, bu yuzden ayri bir sinif olarak egitilmesi AMBAR YASASI ile celisir.' },
];

export function load() {
  const vocab = JSON.parse(readFileSync(join(root, VOCAB_PATH), 'utf8'));
  const res = JSON.parse(readFileSync(join(root, RESOLUTION_PATH), 'utf8'));
  return { vocab, res };
}

const q = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

export function buildPy({ vocab, res }) {
  const L = [];
  const unresolved = [];

  for (const h of HEADS) {
    const axis = vocab.fields[h.field];
    if (!axis) throw new Error(`HEADS names '${h.field}', which engine/vocab.json does not define`);
    const classes = [];
    for (const value of axis.values) {
      const key = `${h.field}.${value}`;
      const r = res.resolutions[key];
      if (!r) throw new Error(`${key} is in engine/vocab.json but not in ${RESOLUTION_PATH}`);
      if (r.status === 'resolved') classes.push(value);
      else if (r.status === 'absent') {
        unresolved.push({ field: h.field, value,
          reason: `contract/vocab-resolution-v1.json ${key} status=absent: ${r.absentReason || '(absentReason YOK)'}` });
      }
      // sentinel: absence is not a class.
    }
    L.push({ ...h, classes, dropped: axis.values.filter((v) => !classes.includes(v)) });
  }
  for (const f of FOREIGN) unresolved.push({ ...f });

  const out = [];
  out.push('"""Shared vocabulary for the student CV heads. URETILMISTIR — ELLE DUZENLENMEZ.');
  out.push('');
  out.push(`Ureteci     : engine/tools/gen-vision-vocab.mjs`);
  out.push(`Kaynaklar   : ${VOCAB_PATH} (hangi kelime var)`);
  out.push(`              ${RESOLUTION_PATH} (kelime neye cozuluyor)`);
  out.push(`Kapi        : engine/tests/vocab_source_check.sh (ctest: vocab_source_check)`);
  out.push('');
  out.push('Bu dosyaya elle bir kelime eklemek testi KIRAR. Sinif listesi degisecekse');
  out.push('yukaridaki iki tabloyu degistir ve ureteci yeniden kostur:');
  out.push('    node engine/tools/gen-vision-vocab.mjs');
  out.push('');
  out.push('Bir kelime ancak cozum tablosunda status=resolved ise SINIF olur.');
  out.push('  sentinel ("none" = yokluk) sinif DEGILDIR — yokluk tahmin edilmez.');
  out.push('  absent (sozlukte var, cozulemiyor) SILINMEZ — _UNRESOLVED\'a gerekcesiyle duser.');
  out.push('');
  out.push('AMBAR YASASI (see DEVAM-DATA-LOOP.md):');
  out.push('  - A label is a CACHE, not ground truth. The photo + source record is the asset.');
  out.push('  - null / missing / "belirsiz" (uncertain) => the sample is EXCLUDED from training,');
  out.push('    never mapped to a class. The student must not learn to guess where the teacher');
  out.push('    honestly abstained.');
  out.push('  - A whole labelling batch can be flagged "suspect" (teacher anchor check failed);');
  out.push('    suspect batches are excluded wholesale.');
  out.push('"""');
  out.push('');
  out.push('# Field -> ordered class list (index == class id). null is intentionally NOT here.');
  out.push('# Order is engine/vocab.json declaration order, so index == enum value.');
  for (const h of L) {
    out.push('');
    out.push(`# ${h.field}: ${h.why}`);
    if (h.dropped.length) out.push(`# sinif OLMAYAN degerler: ${h.dropped.join(', ')}`);
    out.push(`${h.pyName} = [${h.classes.map(q).join(', ')}]`);
  }
  out.push('');
  out.push('# Registry so more heads can be added later without touching the training loop.');
  out.push('FIELDS = {');
  for (const h of L) out.push(`    ${q(h.field)}: ${h.pyName},`);
  out.push('}');
  out.push('');
  out.push('# Names that reached this module but CANNOT be a class today. Kept, never deleted:');
  out.push('# RULES invariant 1 — an unsupported value is refused out loud, not silently dropped.');
  out.push('# vocab_source_check audits this block: every entry must still be unresolvable, and');
  out.push('# no entry may also appear in FIELDS.');
  out.push('_UNRESOLVED = {');
  for (const u of unresolved) {
    out.push(`    (${q(u.field)}, ${q(u.value)}):`);
    out.push(`        ${q(u.reason)},`);
  }
  out.push('}');
  out.push('');
  out.push('# Values that mean "teacher abstained / not applicable" -> drop the sample for that field.');
  out.push('UNCERTAIN_VALUES = {None, "", "null", "belirsiz", "uncertain", "unknown"}');
  out.push('');
  out.push('');
  out.push('def classes_for(field: str):');
  out.push('    if field not in FIELDS:');
  out.push('        raise KeyError(f"unknown field \'{field}\'; known: {list(FIELDS)}")');
  out.push('    return FIELDS[field]');
  out.push('');
  out.push('');
  out.push('def label_to_index(field: str, value):');
  out.push('    """Return class index, or None if the value is uncertain / out of vocab.');
  out.push('');
  out.push('    None means: exclude this sample from training for this field (AMBAR YASASI).');
  out.push('    """');
  out.push('    if value in UNCERTAIN_VALUES:');
  out.push('        return None');
  out.push('    classes = classes_for(field)');
  out.push('    if value not in classes:');
  out.push('        # Out-of-vocab value in a label file => treat as uncertain, do not train on it.');
  out.push('        return None');
  out.push('    return classes.index(value)');
  return out.join('\n') + '\n';
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const want = buildPy(load());
  const outFlag = process.argv.indexOf('--out');
  const target = outFlag >= 0 ? process.argv[outFlag + 1] : join(root, OUT_PATH);
  if (process.argv.includes('--check')) {
    const got = existsSync(target) ? readFileSync(target, 'utf8') : null;
    if (got !== want) {
      console.error(`FAIL: ${OUT_PATH} is stale — run: node engine/tools/gen-vision-vocab.mjs`);
      process.exit(1);
    }
    console.log(`ok: ${OUT_PATH} in sync with ${VOCAB_PATH} + ${RESOLUTION_PATH}`);
  } else {
    writeFileSync(target, want);
    console.log(`wrote ${target} (${want.length} bytes)`);
  }
}
