#!/usr/bin/env node
// bugra_parity_check — THE BLIND CHECK, GATED (GECE7 / F8, §1.6 · K10).
//
// WHAT THIS GATE IS FOR.
//
// `engine/tools/bugra/bugra-parity.mjs` compares the engine's own draft against
// the REAL mm geometry of two purchased Buğra patterns. It has printed a number
// for phases, and nothing has ever read that number back: it was a tool a human
// ran and a human interpreted. A number nobody's build reads is a number that
// drifts, and this one drifted for a long time in a way nobody noticed (see the
// F8 note in bugra-parity.mjs itself).
//
// So this gate reads it. Three claims, all measured, none of them a threshold
// anybody chose:
//
//   1. PARÇA EKSİĞİ — every piece Buğra cut for the corset bustier has a piece
//      the engine drafts. Today: 0 missing. This is F8's hane.
//   2. THE PIECES ARE REAL DIVISIONS, NOT NAMES. A row in a table can be closed
//      by writing "Front Side" next to something. So each mapped piece is
//      re-measured off the DRAWN commands: it must be a non-degenerate closed
//      area, and the Center/Side halves of a princess division must be
//      geometrically DISTINCT from each other. Naming one piece twice fails.
//   3. THE CHECK STAYS BLIND (§1.6). `vocab.json` ships `cupSeam: bugra` and
//      `locketTop: bugra`, and garment.cpp loads Buğra's own measured ease and
//      princess shares when it sees them — the engine MEMORISES rather than
//      draws. A comparison run through those values proves nothing. So this
//      gate asserts the parity harness never selects them.
//
// ⚠ WHAT THIS GATE DELIBERATELY DOES NOT DO — §1.6's own sentence, "kör kontrol
// AYAR VİDASI DEĞİLDİR". It does NOT gate the deviation percentages. Those are
// printed, and they are allowed to be bad; driving them down by fitting the
// engine to a purchased pattern is the one thing this whole comparison exists to
// make impossible. The deviations are reported to a human, in the tool's output.
//
// ⚠ AND IT DOES NOT GATE `bugra-locket-top`. That garment is short FOUR pieces
// (Collar · Collar Lining · Upper Sleeve · Lower Sleeve) and closing them needs
// op.derive / op.gather / op.overlay, none of which exist in the engine (K54,
// F5's queue). The number is asserted to be REPORTED and is pinned at its
// measured value so it cannot quietly grow; it is not asserted to be zero.
//
// ZERO API CALLS, ZERO COST. Pure geometry against a file on disk.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

const fails = [];
const note = [];
const check = (name, cond, detail) => {
  if (cond) note.push(`  ok   ${name}${detail ? ` — ${detail}` : ''}`);
  else fails.push(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── 1. RUN THE TOOL AND READ ITS OWN NUMBER ────────────────────────────────
// The tool is run as a CHILD PROCESS on purpose: the gate judges the thing a
// human runs, byte for byte, not a re-implementation of it that could agree
// with the gate and disagree with the tool.
const TOOL = join(ROOT, 'engine/tools/bugra/bugra-parity.mjs');
let out = '';
try {
  out = execFileSync(process.execPath, [TOOL], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
} catch (e) {
  console.log('BUĞRA PARİTE KAPISI: KIRMIZI — bugra-parity.mjs koşmadı');
  console.log(String((e && (e.stderr || e.message)) || e));
  process.exit(1);
}

const eksikOf = (key) => {
  const m = new RegExp(`^\\s*MOTOR EKSİĞİ: ${key} = (\\d+)`, 'm').exec(out);
  return m ? Number(m[1]) : null;
};
const bustierEksik = eksikOf('corset_bustier');
const locketEksik = eksikOf('locket_top');

check('the tool prints a machine-readable piece-deficit for the bustier',
  bustierEksik !== null, 'MOTOR EKSİĞİ: corset_bustier = N');
check('the tool prints one for the locket top too', locketEksik !== null);

// ⭐ F8'İN HANESİ. 3 -> 0 (F7 sonrası taban 3).
check('BUSTIER: every piece Buğra cut has an engine piece',
  bustierEksik === 0, `MOTOR EKSİĞİ = ${bustierEksik}`);

// Reported, pinned, NOT required to be zero. K54: op.derive/op.gather/op.overlay
// are not in the engine, and this card is not the card that adds them.
check('LOCKET TOP: the four known-missing pieces are still exactly four, not more',
  locketEksik === 4,
  `MOTOR EKSİĞİ = ${locketEksik} (Collar · Collar Lining · Upper Sleeve · Lower Sleeve — ` +
  `op.derive/op.gather/op.overlay yok, K54)`);

// ── 2. THE CHECK IS BLIND (§1.6) ───────────────────────────────────────────
// garment.cpp:568 and :593 load CupSeamBlock::bugra:: / LocketBlock::bugra::
// constants — Buğra's own measured ease and princess shares — the moment the
// spec carries those vocabulary values. A parity run that went through them
// would be comparing Buğra against a memorised copy of Buğra.
const toolSrc = readFileSync(TOOL, 'utf8');
const vocab = JSON.parse(readFileSync(join(ROOT, 'engine/vocab.json'), 'utf8'));
const cupSeamValues = vocab.fields.cupSeam.values;
const locketValues = vocab.fields.locketTop.values;
const bugraCupSeamIdx = cupSeamValues.indexOf('bugra');
const bugraLocketIdx = locketValues.indexOf('bugra');
check('the memorising vocabulary values still exist and are known by index',
  bugraCupSeamIdx > 0 && bugraLocketIdx > 0,
  `cupSeam:bugra=${bugraCupSeamIdx} locketTop:bugra=${bugraLocketIdx}`);
// The harness's own draft() calls are read out of its source. Anything that
// selects the memorising index — by name or by number — fails.
const draftCalls = [...toolSrc.matchAll(/const\s+\w+\s*=\s*draft\(\{([\s\S]*?)\}\s*,/g)]
  .map((m) => m[1]);
check('the parity harness issues its own draft calls', draftCalls.length >= 2,
  `${draftCalls.length} draft() call(s)`);
for (const [i, body] of draftCalls.entries()) {
  const cup = /cupSeam\s*:\s*([^,}\n]+)/.exec(body);
  const loc = /locketTop\s*:\s*([^,}\n]+)/.exec(body);
  const bad = (m, idx) => {
    if (!m) return false;
    const v = m[1].trim().replace(/['"]/g, '');
    return v === 'bugra' || Number(v) === idx;
  };
  check(`draft call ${i + 1} does NOT select a memorised Buğra preset`,
    !bad(cup, bugraCupSeamIdx) && !bad(loc, bugraLocketIdx),
    `cupSeam=${cup ? cup[1].trim() : '-'} locketTop=${loc ? loc[1].trim() : '-'}`);
}

// ── 3. THE MATCHED PIECES ARE REAL DIVISIONS, NOT NAMES ────────────────────
// Re-drafted here off the SAME wasm bundle the harness uses, and measured off
// the DRAWN commands. A table row can be closed with a string; a closed area
// with its own distinct outline cannot.
const createEngine = require(join(ROOT, 'web/vendor/stitchu-engine.js'));
const engine = await createEngine();
const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };
const SPEC = {
  garment: 'top', shaping: 'princess', neckline: 'sweetheart', sleeveStyle: 'none',
  topLength: 'hip', cupSeam: 1,
  waistline: 'natural', fabric: 'woven', sleeveLength: 'short', skirtStyle: 'aLine',
  skirtLength: 'mini', frontPlacket: false, tieClosure: 0, sleeveCap: 0, collarType: 0,
  collarEdge: 0, gatherType: 0, gatherZone: 0, backOpening: 0, backSlit: 0,
  ruffledStraps: 0, peplum: 0, placketStyle: 0, edgeFinish: 0, pocketStyle: 0,
  cuffStyle: 0, hemShape: 0, shoulderStyle: 0, buttonRow: 0, exposedZip: 0,
  backDetail: 0, bardotStyle: 0,
};
const drafted = JSON.parse(engine.draftJSON(SPEC, BODY));
check('the bustier drafts clean', !drafted.error && drafted.pattern &&
  !(drafted.issues || []).length, drafted.error || `${(drafted.issues || []).length} issue(s)`);

const pieces = new Map();
for (const p of (drafted.pattern ? drafted.pattern.pieces : [])) pieces.set(p.name, p);

// Shoelace on the flattened outline. Bezier chords are enough: the claim is
// "this is a real area", not a length to four decimals.
function area(cmds) {
  let a2 = 0, px = 0, py = 0, sx = 0, sy = 0;
  for (const c of cmds) {
    if (c.type === 'close') { a2 += px * sy - sx * py; continue; }
    if (c.type === 'move') { px = c.x; py = c.y; sx = c.x; sy = c.y; continue; }
    a2 += px * c.y - c.x * py; px = c.x; py = c.y;
  }
  return Math.abs(a2) / 2 / 100; // cm2
}
const outline = (p) => p.commands.map((c) =>
  `${c.type}:${(c.x ?? 0).toFixed(4)},${(c.y ?? 0).toFixed(4)}`).join('|');

// The six pieces the parity table now matches one-to-one or in a pair.
const MATCHED = [
  'Upper Cup Center Front', 'Upper Cup Side Front',
  'Lower Cup Center Front', 'Lower Cup Side Front',
  'Front Body Center Front', 'Front Body Side Front',
  'Top Center Back', 'Top Side Back',
];
for (const name of MATCHED) {
  const p = pieces.get(name);
  check(`"${name}" is a drafted piece with a real area`,
    !!p && area(p.commands) > 1.0, p ? `${area(p.commands).toFixed(1)} cm2` : 'YOK');
}
// ⭐ THE ANTI-NAMING CLAUSE. A division produces two pieces that differ. If a
// future change made Center and Side the same outline under two labels, every
// count above would still pass and this would not.
const DIVISIONS = [
  ['Upper Cup Center Front', 'Upper Cup Side Front'],
  ['Lower Cup Center Front', 'Lower Cup Side Front'],
  ['Front Body Center Front', 'Front Body Side Front'],
  ['Top Center Back', 'Top Side Back'],
];
for (const [a, b] of DIVISIONS) {
  const pa = pieces.get(a), pb = pieces.get(b);
  check(`"${a}" and "${b}" are a real division, not one shape named twice`,
    !!pa && !!pb && outline(pa) !== outline(pb) &&
    Math.abs(area(pa.commands) - area(pb.commands)) > 1e-6,
    pa && pb ? `${area(pa.commands).toFixed(1)} vs ${area(pb.commands).toFixed(1)} cm2` : 'eksik');
}

// ⭐ AND THE LENGTH CLAIM THE HARNESS RESTS ON, ASSERTED RATHER THAN ASSUMED:
// a CROPPED bustier genuinely has no below-cup panel, which is why the old
// harness reported two of them missing. If that ever stopped being true the
// harness's reasoning would be stale and this says so.
const cropped = JSON.parse(engine.draftJSON({ ...SPEC, topLength: 'cropped' }, BODY));
const croppedNames = new Set((cropped.pattern ? cropped.pattern.pieces : []).map((p) => p.name));
check('a CROPPED bustier has no below-cup body panel — the harness reasoning holds',
  !croppedNames.has('Front Body Center Front') && !croppedNames.has('Front Body Side Front'),
  `cropped: ${croppedNames.size} piece(s)`);

// ── 4. 🚨 THE REAL TUNING SCREW, GATED (GECE7 / F9 İŞ 4, borç 98) ──────────
//
// The referee's HM-3 set the harness's `topLength` from 'hip' to 'tunic' — the
// length that FLATTERS the deviations — and this gate stayed rc=0, green. §1.6
// says the blind check is not a tuning screw, and until today that sentence was
// a comment in a file rather than a condition anybody enforced. The deviations
// move by up to 48 points across the three lengths, so whoever picks the length
// picks the answer.
//
// 🚨 THE DEVIATION PERCENTAGES ARE STILL NOT GATED, AND MUST NOT BE. Gating them
// is exactly the thing §1.6 forbids: it would make the engine chase a purchased
// pattern. What is gated is the SELECTION RULE — "the shortest length the engine
// offers that goes below the waist" — which is a property of the garment class
// Buğra cut, not of how well we happen to match it.
//
// The rule is measured, not asserted. For every length in the vocabulary the
// engine is asked to draft, and a length "goes below the waist" if it produces
// a below-cup body panel — the engine's own division, the same fact check 3
// above already relies on. Among the lengths that qualify, the rule takes the
// SHORTEST, measured as the lowest hem the draft reaches.
{
  const declared = vocab.fields.topLength.values;
  const hemOf = (d) => Math.max(...(d.pattern ? d.pattern.pieces : [])
    .flatMap((p) => p.commands.map((c) => (c.y ?? -Infinity))));
  const measured = [];
  for (const v of declared) {
    const d = JSON.parse(engine.draftJSON({ ...SPEC, topLength: v }, BODY));
    const names = new Set((d.pattern ? d.pattern.pieces : []).map((p) => p.name));
    measured.push({
      v,
      belowWaist: names.has('Front Body Center Front') || names.has('Front Body Side Front'),
      hem: hemOf(d),
    });
  }
  const qualifying = measured.filter((m) => m.belowWaist && Number.isFinite(m.hem));
  check('at least one offered length goes below the waist — otherwise the rule is empty',
    qualifying.length > 0,
    measured.map((m) => `${m.v}:${m.belowWaist ? 'kup-altı VAR' : 'yok'} hem ${m.hem.toFixed(1)}`).join(' · '));
  const rule = qualifying.slice().sort((a, b) => a.hem - b.hem)[0];

  // What the harness ACTUALLY drafts, read out of its source rather than
  // assumed: the gate and the tool disagreeing silently is the hole HM-3 walked
  // through, and it walked through it because this gate hard-coded 'hip' in its
  // own SPEC and never compared the two.
  const bustierCall = draftCalls.find((b) => /garment\s*:\s*'top'/.test(b) && /cupSeam/.test(b));
  const chosen = bustierCall ? (/topLength\s*:\s*'([^']+)'/.exec(bustierCall) || [])[1] : undefined;
  check('the harness declares a topLength for the bustier and the gate can read it',
    !!chosen && declared.includes(chosen), String(chosen));
  check('the harness uses the SHORTEST offered length that goes below the waist — not the flattering one',
    !!rule && chosen === rule.v,
    `harness '${chosen}' · kural '${rule ? rule.v : '-'}' · ` +
    `ölçülen: ${measured.map((m) => `${m.v} hem ${m.hem.toFixed(1)}${m.belowWaist ? ' (kup-altı)' : ''}`).join(', ')}`);
  // And the gate's own SPEC must be the same length, or arms 1-3 above are
  // measuring a different garment from the one the tool reports on.
  check('the gate re-drafts at the SAME length the harness drafts at',
    SPEC.topLength === chosen, `kapı '${SPEC.topLength}' · harness '${chosen}'`);
}

console.log('BUĞRA PARİTE KAPISI — satın alınmış kalıbın parça listesi çıkıyor mu? (0 API çağrısı)');
console.log(note.join('\n'));
if (fails.length) console.log(fails.join('\n'));
console.log('\n--- bugra-parity.mjs çıktısı (sapma RAPORLANIR, HEDEFLENMEZ — §1.6) ---');
console.log(out.trimEnd());
console.log(`\nBUĞRA PARİTE KAPISI: ${fails.length ? `KIRMIZI — ${fails.length} kalem` : 'YEŞİL'}`);
process.exit(fails.length ? 1 : 0);
