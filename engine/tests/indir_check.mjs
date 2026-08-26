// indir_check.mjs — F-İNDİR gate: THE USER CAN TAKE A FILE HOME.
//
// WHY. Measured 26 Aug 2026: web/js/create.js contained zero lines matching
// `download` or `dxf`. A shopper could upload a photo, watch the engine draft a
// pattern, and leave with nothing. Every other gate in this repo was green the
// whole time, because none of them asks whether the product hands over a file.
//
// WHAT IT MEASURES, on the SAME modules the browser loads (web/js/download.js,
// web/lib/pdf-core.js, the wasm bundle in engine/dist) — not a node-only
// re-implementation, which would prove nothing about what downloads:
//
//   1. DXF   engine.dxfSpecJSON exists and returns an R12 document with the
//            ASTM layers, for a SPEC (create.html's boundary). Before F-İNDİR
//            only dxfRecipeJSON existed, which create.html can never call.
//   2. DXF parity — spec DXF and the native path agree on the geometry:
//            same section structure and the same POLYLINE count as the drafted
//            piece count implies. (Byte parity for the recipe path is already
//            proven by dxf_wasm_parity; this asserts the new door is the same
//            door, not a new writer.)
//   3. SVG   patternSVG() writes a true-mm document containing every piece.
//   4. PDF   patternA4Pdf() writes real PDF bytes whose cover page carries the
//            3 cm calibration square, and the square MEASURES 30 mm: the `re`
//            operator's width/height in PDF points is read back and converted.
//            "The PDF has a calibration square" is not the claim; "the square
//            is 30.000 mm" is.
//   5. A0    patternA0Pdf() writes one single page, 841x1189 mm.
//   6. REFUSAL — a spec the validator blocks hands out NO dxf (RULES
//            invariant 1: a blocked draft must not download as a clean
//            industry file that a shopper then cuts fabric to).
//   9. FLAT  — added in F-İNDİR's 2nd round, because the referee measured the
//            first round's claim and it was half true: all ten exports of
//            web/js/download.js wrote a PATTERN. The target sentence is photo +
//            prompt -> pattern AND FLAT. This checks that the finished-garment
//            technical flat is a real downloadable document (front + back,
//            geometry present), that it is a DIFFERENT drawing from the pattern
//            SVG rather than the same bytes under a new name, that the pen
//            NAMES what the engine cannot cut instead of drawing it anyway, and
//            that the flat button is MOUNTED on the result screen.
//
// Artifacts are written next to the build so a human can open them; the paths
// are printed (RULES invariant 3 — a file path, not "I looked at it").
//
// ZERO API CALLS, ZERO COST: nothing here touches the VLM. It is pure geometry.

import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

// A four-line DOM stub so the SAVERS themselves run here, not just the
// builders. Without it the branch that decides whether a refused draft still
// lands on someone's cutting table lives in a browser-only function that no
// gate can turn red — measured: an early mutation that made saveDXF swallow the
// engine's refusal left this file GREEN.
const saved = [];
globalThis.document = { createElement: () => ({ click() { saved.push(this.download); } }) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:stub', revokeObjectURL: () => {} };

const { patternSVG, patternA4Pdf, patternA0Pdf, relayDXF, safeName, flatSVG, flatGaps, saveFlatSVG } =
  await import(join(ROOT, 'web/js/download.js'));
const KOKEN = await import(join(ROOT, 'web/js/provenance.js'));

const MM = 72 / 25.4;
const OUT = join(ROOT, 'Logs', 'indir-check');
mkdirSync(OUT, { recursive: true });

const fails = [];
const kfails = [];   // section 10 (KÖKEN) — its own exit code, see the tail
const note = [];
function check(name, cond, detail) {
  if (cond) note.push(`  ok   ${name}${detail ? ` — ${detail}` : ''}`);
  else fails.push(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
}
function kcheck(name, cond, detail) {
  if (cond) note.push(`  ok   [köken] ${name}${detail ? ` — ${detail}` : ''}`);
  else kfails.push(`  FAIL [köken] ${name}${detail ? ` — ${detail}` : ''}`);
}

// EU38, the body create.html drafts a first-time visitor on.
const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
const SPEC = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
};

const engine = await require(join(ROOT, 'engine/dist/stitchu-engine.js'))();

// engineSpec() lives in web/js/engine.js behind a browser-only loadEngine(), so
// the wire format is spelled out here the way the boundary declares it. Any
// field left out arrives at its documented default; nothing is coerced.
const wire = {
  ...SPEC, fabricStretchPct: -1, skirtLengthMM: 0, ruffleHem: false, ruffleTiers: 1,
  keyhole: false, frontPlacket: false, tieClosure: 0, sleeveCap: 0, collarType: 0,
  collarEdge: 0, gatherType: 0, gatherZone: 0, backOpening: 0, laceUpBack: 0,
  wrapFront: 0, backSlit: 0, ruffledStraps: 0, peplum: 0, hemFlounce: 0,
  placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0, hemShape: 0,
  shoulderStyle: 0, buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0,
  cupSeam: 0, yoke: 0, boxPleat: 0,
};

const drafted = JSON.parse(engine.draftJSON(wire, BODY));
check('draft is clean', !drafted.error && drafted.pattern && !drafted.issues.length,
  drafted.error || `${drafted.issues.length} issue(s)`);
const pattern = drafted.pattern;
if (!pattern) {
  console.log(note.join('\n'));
  console.log(fails.join('\n'));
  console.log('\nİNDİR KAPISI: KIRMIZI — engine could not draft the reference spec.');
  process.exit(1);
}

// ---------------------------------------------------------------- 1 + 2. DXF
check('engine exposes dxfSpecJSON', typeof engine.dxfSpecJSON === 'function',
  'create.html has no recipe text; without this binding its DXF button cannot exist');

let dxf = '';
if (typeof engine.dxfSpecJSON === 'function') {
  const out = JSON.parse(engine.dxfSpecJSON(wire, BODY));
  check('spec DXF built', !out.error && !!out.dxf, out.error || `${(out.dxf || '').length} chars`);
  dxf = out.dxf || '';
}
check('DXF is an R12 document', dxf.includes('SECTION') && dxf.includes('ENTITIES') && dxf.trimEnd().endsWith('EOF'));
// ASTM D6673 layer names the native dxf-export writes; if the spec door wrote
// its own geometry instead of calling dxf::exportPattern these would be absent.
for (const layer of ['1', '8']) {
  check(`DXF carries layer ${layer}`, new RegExp(`^\\s*8\\r?\\n${layer}\\r?$`, 'm').test(dxf));
}
const polylines = (dxf.match(/\nPOLYLINE\r?\n/g) || []).length;
check('DXF has one polyline run per drafted piece or more',
  polylines >= pattern.pieces.length, `${polylines} POLYLINE vs ${pattern.pieces.length} pieces`);

// --------------------------------------------------------------------- 3. SVG
const svg = patternSVG(pattern);
check('SVG is a document', svg.startsWith('<?xml') && svg.trimEnd().endsWith('</svg>'));
check('SVG is dimensioned in mm', /width="[\d.]+mm" height="[\d.]+mm"/.test(svg));
let named = 0;
for (const p of pattern.pieces) if (svg.includes(p.name)) named++;
check('every piece is labelled in the SVG', named === pattern.pieces.length,
  `${named}/${pattern.pieces.length}`);

// --------------------------------------------------------------------- 4. PDF
const a4 = patternA4Pdf(pattern, 'Dress');
const a4text = Buffer.from(a4).toString('latin1');
check('A4 PDF is PDF bytes', a4text.startsWith('%PDF-1.') && a4text.trimEnd().endsWith('%%EOF'));
const a4pages = Number((a4text.match(/\/Type \/Pages [^>]*\/Count (\d+)/) || [])[1] || 0);
check('A4 pack has a cover plus at least one tiled sheet', a4pages >= 2, `${a4pages} pages`);
check('A4 cover names the calibration square', a4text.includes('3 cm, measure me before cutting'));

// The measurement itself: find every `w h re` operator and look for the square.
// PDF user space is points; 30 mm is 85.039 pt. A wrong unit, a wrong scale or a
// silently "fixed" square all move this number, which is the whole point.
let squareMM = null;
for (const m of a4text.matchAll(/([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) re/g)) {
  const w = Number(m[3]) / MM, h = Number(m[4]) / MM;
  if (Math.abs(w - h) < 0.01 && Math.abs(w - 30) < 0.5) { squareMM = w; break; }
}
check('the calibration square measures 3.000 cm',
  squareMM !== null && Math.abs(squareMM - 30) < 0.01,
  squareMM === null ? 'no square-shaped `re` near 30 mm found' : `${squareMM.toFixed(4)} mm`);

// ---------------------------------------------------------------------- 5. A0
const a0 = patternA0Pdf(pattern, 'Dress');
const a0text = Buffer.from(a0).toString('latin1');
const a0pages = Number((a0text.match(/\/Type \/Pages [^>]*\/Count (\d+)/) || [])[1] || 0);
check('A0 is a single sheet', a0pages === 1, `${a0pages} pages`);
const box = a0text.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);
check('A0 sheet is 841 x 1189 mm',
  !!box && Math.abs(Number(box[1]) / MM - 841) < 0.1 && Math.abs(Number(box[2]) / MM - 1189) < 0.1,
  box ? `${(Number(box[1]) / MM).toFixed(1)} x ${(Number(box[2]) / MM).toFixed(1)} mm` : 'no MediaBox');

// ------------------------------------------------------------------ 6. REFUSAL
// An unknown enum value must not produce a file. This is the honest-refusal
// invariant on the download path: the failure the user must never get is a
// clean-looking DXF for a garment the engine did not agree to draft.
if (typeof engine.dxfSpecJSON === 'function') {
  const bad = JSON.parse(engine.dxfSpecJSON({ ...wire, neckline: 'ZZ_NOT_A_NECKLINE' }, BODY));
  check('unknown enum hands out NO dxf', !!bad.error && !bad.dxf, JSON.stringify(bad).slice(0, 120));
  const noBody = JSON.parse(engine.dxfSpecJSON(wire, { ...BODY, bust: 0 }));
  check('unusable body hands out NO dxf', !!noBody.error && !noBody.dxf, JSON.stringify(noBody).slice(0, 120));
}

// --------------------------------------------- 7. THE REFUSAL REACHES THE USER
// The engine refusing is only half of invariant 1; the page must not save
// anything either, and must say why.
const before = saved.length;
const refusal = relayDXF({ error: 'validator blocked this draft', dxf: null }, 'nope.dxf');
check('a refused DXF saves NO file', saved.length === before, `${saved.length - before} file(s) saved`);
check('a refused DXF returns the reason', refusal === 'validator blocked this draft', String(refusal));
check('an accepted DXF does save', relayDXF({ dxf: dxf || 'x' }, 'yes.dxf') === null && saved.includes('yes.dxf'));

// ------------------------------------------------------- 8. THE BUTTON EXISTS
// The six checks above prove the WRITERS work. They would all stay green if
// create.html never called them — which is precisely the state the repo was in
// on 26 Aug, with a perfectly good download path sitting in studio.js that the
// shopper's page could not reach. So the wiring itself is measured, in the same
// terms the disease was measured in: the count of `download`/`dxf` lines in
// create.js, which was ZERO.
const createSrc = readFileSync(join(ROOT, 'web/js/create.js'), 'utf8');
check('create.js imports the download module', /from '\.\/download\.js/.test(createSrc));
for (const fn of ['saveA4Pdf', 'saveSVG', 'saveDXF']) {
  check(`create.js calls ${fn}`, new RegExp(`\\b${fn}\\s*\\(`).test(createSrc),
    'the result screen must offer this file, not merely be able to build it');
}
// MOUNTED, not merely defined. The first draft of this line matched
// `downloadPanel(` and stayed green when the mount was deleted, because the
// function DECLARATION still matched — a gate that cannot go red. It now looks
// for the append itself.
check('the result screen mounts the panel',
  /appendChild\(\s*downloadPanel\(/.test(createSrc),
  'a panel that is built but never appended is the 26 Aug state with extra code');

// --------------------------------------------------------------------- 9. FLAT
// The other half of the target sentence. Everything above is the PATTERN — the
// pieces you cut. The flat is the finished garment as worn: what the thing IS.
// It is drawn from the SPEC by web/lib/flat-core.js, the same pen the flat gates
// (flat_convention_check, flat_expresses_spec_check) judge. Before this round
// that pen could not run in a browser at all (five readFileSync calls), so no
// shipped page had ever printed a pixel of it.
const flat = flatSVG(SPEC);
check('flat is an SVG document', flat.trimStart().startsWith('<svg') && flat.trimEnd().endsWith('</svg>'));
check('flat draws both views', /<text[^>]*>FRONT<\/text>/.test(flat) && /<text[^>]*>BACK<\/text>/.test(flat),
  'a technical flat without a back view is half a tech pack (contract/flat-convention-v1.json views.required)');
const flatPaths = (flat.match(/<path/g) || []).length;
check('flat carries real geometry', flatPaths >= 4, `${flatPaths} <path> elements`);
// NOT the pattern under another name. If someone ever wires this button to
// patternSVG the file still downloads, still opens, and is silently wrong.
check('flat is a different drawing from the pattern', flat !== svg && !flat.includes('cutInstruction'),
  'the flat must not be the pattern sheet renamed');
// The pattern SVG is millimetres of paper; the flat is a croquis-scaled view.
check('flat is not dimensioned as cut paper', !/width="[\d.]+mm"/.test(flat),
  'a flat printed at "true mm" would invite someone to cut it');

// NAMED REFUSAL, not a silent redraw. `sleeveStyle: straight` is expressible to
// the reading vocabulary but the v2 registry has no shipped operator for it, and
// the 2026-07-18 precedent in CLAUDE.md is a puff sleeve that was silently
// dropped. The pen stamps the axis; create.js prints the stamp.
const gaps = flatGaps({ ...SPEC, sleeveStyle: 'straight' });
check('the flat names what the engine cannot cut', gaps.length > 0, gaps.join(' · ') || 'no stamp');
check('a spec with nothing to draw is refused, not blank',
  (() => { try { flatSVG({}); return false; } catch { return true; } })(),
  'an empty file that opens is worse than an error');

// The saver itself, through the same DOM stub the DXF refusal branch uses.
// AWAITED since GECE7/F3: saveFlatSVG became async because a class on the
// seam-plan line has to wait for the wasm engine to answer. Nothing about what
// this line JUDGES changed — it still asks whether a file reaches the user's
// disk — but an un-awaited promise would have made it read `0 file(s) saved`
// forever, which is how a green gate stops meaning anything. It caught the
// signature change on the first run and that is the gate working.
const beforeFlat = saved.length;
await saveFlatSVG(SPEC, 'dress-flat.svg');
check('the flat actually saves a file', saved.includes('dress-flat.svg'),
  `${saved.length - beforeFlat} file(s) saved`);

// And it is offered, not merely buildable — the 26 Aug disease in its own terms.
check('create.js calls saveFlatSVG', /\bsaveFlatSVG\s*\(/.test(createSrc),
  'the result screen must offer the flat, not merely be able to build it');
check('the flat button is mounted in the download row',
  /row\.appendChild\(\s*flatBtn\s*\)/.test(createSrc),
  'a button that is built but never appended is the 26 Aug state with extra code');

// ------------------------------------------------------------------- 10. KÖKEN
// WHY THIS SECTION EXISTS (F0, 2026-08-26). The referee measured the phase this
// gate had just passed and found the thing it did NOT ask:
//
//   H10 = %58.3   — 70 of 120 spec fields came from host defaults, not the photo
//   H3  = 4       — four fields invented and never declared
//   grep -rn "cikarildi|inferred|defaulted" web/js/create.js web/js/download.js
//               -> 0 lines
//
// So the user was already carrying a pattern AND a flat home (sections 1-9),
// and more than half of what they carried had never been in their photograph,
// and nothing anywhere said so. §0B does not forbid inferring — the engine
// fills every field on purpose — it forbids inferring IN SILENCE.
//
// What is measured here is therefore not "the spec has a new field". It is:
// the label exists, it is legal, it CANNOT be faked or emptied without the file
// refusing to be written, and it reaches the two surfaces the user actually
// looks at — the flat's root element and the A4 cover — plus the result screen.
//
// FUTURE-PROOFING IS PART OF THE SHAPE, NOT DECORATION. `cikarildi` will be
// split by F2 into H10a (impossible to see: back, inside, covered) and H10b
// (visible but not read); only H10b is on the ratchet. F0 does not split it —
// but a single-bucket schema would force F2 to unpick every call site, so the
// record carries a second axis from day one and the gate proves it is settable.
const AXES = Object.keys(SPEC);

// (a) A record built the honest way: everything derived until proven otherwise.
const rec = KOKEN.yeniKoken(AXES);
kcheck('a fresh record labels every axis, and labels it derived',
  KOKEN.dogrula(rec, AXES).length === 0 && KOKEN.alanlar(rec, 'cikarildi').length === AXES.length,
  `${AXES.length} axes`);

// (b) The photo takes two of them back. This is the only shape that matters:
// what the photo showed must LEAVE the derived list, or the list is decoration.
KOKEN.isaretle(rec, 'neckline', 'gorulen');
KOKEN.isaretle(rec, 'skirtStyle', 'gorulen');
const derived = KOKEN.ilanEdilecek(rec);
kcheck('a photo reading leaves the derived list',
  derived.length === AXES.length - 2 && !derived.includes('neckline') && !derived.includes('skirtStyle'),
  `${derived.length}/${AXES.length} derived`);

// (c) The bucket is SPLITTABLE (F2's H10a/H10b). Not split here — settable here.
const iki = KOKEN.yeniKoken(['a', 'b']);
KOKEN.isaretle(iki, 'a', 'cikarildi', 'gorunmez');   // H10a — cannot be photographed
KOKEN.isaretle(iki, 'b', 'cikarildi', 'gorunur');    // H10b — visible, not read
kcheck('the derived bucket can be split into H10a / H10b without a schema change',
  KOKEN.dogrula(iki, ['a', 'b']).length === 0 &&
  iki.a.gorunurluk === 'gorunmez' && iki.b.gorunurluk === 'gorunur');
kcheck('F0 itself did NOT split it (that is F2 work)',
  KOKEN.alanlar(rec, 'cikarildi').every((f) => rec[f].gorunurluk === 'bilinmiyor'));

// (d) A LABEL CANNOT BE FAKED. An unknown tag is thrown out, not swallowed
// (RULES invariant 1); a missing axis and a ghost axis are both violations.
kcheck('an unknown origin tag is refused, not swallowed',
  (() => { try { KOKEN.isaretle(rec, 'neckline', 'sanirim'); return false; } catch { return true; } })());
const eksik = KOKEN.yeniKoken(AXES); delete eksik.fabric;
kcheck('an axis with no origin label is a violation', KOKEN.dogrula(eksik, AXES).length === 1,
  KOKEN.dogrula(eksik, AXES).join('; '));
const hayalet = KOKEN.yeniKoken([...AXES, 'kolyeUcu']);
kcheck('an origin label for an axis the spec does not have is a violation',
  KOKEN.dogrula(hayalet, AXES).length === 1, KOKEN.dogrula(hayalet, AXES).join('; '));

// (e) THE FLAT CARRIES IT, IN THE FILE. Offline, in Illustrator, with no site.
const flatK = flatSVG(SPEC, rec, AXES);
const attrOf = (k) => (new RegExp(`data-koken-${k}="([^"]*)"`).exec(flatK) || [])[1];
kcheck('the flat root declares the origin count and the total',
  attrOf('cikarildi') === String(derived.length) && attrOf('toplam') === String(AXES.length),
  `cikarildi=${attrOf('cikarildi')} toplam=${attrOf('toplam')}`);
kcheck('the flat root NAMES the derived axes, and the names match the count',
  (attrOf('alanlar') || '').split(' ').filter(Boolean).join(' ') === derived.join(' '),
  `${(attrOf('alanlar') || '').slice(0, 70)}…`);
kcheck('stamping did not disturb the pen',
  flatK.replace(/ data-koken-[a-z]+="[^"]*"/g, '') === flat,
  'flat-core.js output must stay byte-identical — style_check diffs it against engine/STYLE-PIN');

// (f) EMPTYING THE LIST DOES NOT PRODUCE A FILE. This is the reward-hack the
// phase invites: drop the record, keep the download, look finished. Both
// builders refuse, and the DOM saver writes nothing.
kcheck('an emptied origin record hands out NO flat',
  (() => { try { flatSVG(SPEC, {}, AXES); return false; } catch { return true; } })());
kcheck('a half-labelled origin record hands out NO flat',
  (() => { try { flatSVG(SPEC, eksik, AXES); return false; } catch { return true; } })());
kcheck('an emptied origin record hands out NO A4 pack',
  (() => { try { patternA4Pdf(pattern, 'Dress', {}, AXES); return false; } catch { return true; } })());
const beforeK = saved.length;
try { saveFlatSVG(SPEC, 'nope-flat.svg', {}, AXES); } catch { /* expected */ }
kcheck('a refused stamp saves no file at all', saved.length === beforeK,
  `${saved.length - beforeK} file(s) saved`);

// (g) THE A4 COVER CARRIES IT ON PAPER, with every derived axis named — a
// truncated list would be the same silence, shorter.
const a4kBytes = patternA4Pdf(pattern, 'Dress', rec, AXES);
const a4k = Buffer.from(a4kBytes).toString('latin1');
kcheck('the A4 cover has an Origin block', /Origin \/ K/.test(a4k));
kcheck('the A4 cover prints the derived count', a4k.includes(`${derived.length} of ${AXES.length} fields`),
  `${derived.length} of ${AXES.length}`);
const missingOnCover = derived.filter((f) => !a4k.includes(f));
kcheck('the A4 cover names every derived axis', missingOnCover.length === 0,
  missingOnCover.join(', ') || `${derived.length} names on the cover`);
// The block is printed ABOVE the calibration square; if it ever pushes the
// square off the sheet the pattern silently loses its scale check.
let squareK = null;
for (const m of a4k.matchAll(/([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) re/g)) {
  const w = Number(m[3]) / MM, h = Number(m[4]) / MM;
  if (Math.abs(w - h) < 0.01 && Math.abs(w - 30) < 0.5) { squareK = { x: Number(m[1]) / MM, y: Number(m[2]) / MM, w }; break; }
}
kcheck('the origin block did not push the 3 cm square off the cover',
  !!squareK && squareK.y > 0 && squareK.y + squareK.w < 297 && squareK.x > 0,
  squareK ? `square at ${squareK.x.toFixed(1)}, ${squareK.y.toFixed(1)} mm` : 'square gone from the cover');

// (h) THE RESULT SCREEN SAYS IT TOO, and the shipped page is the one that must
// pass a record to the writers. A gate that only proves the module works is the
// 26 Aug disease with a new name.
kcheck('create.js labels origins as it writes the spec', /\bisaretle\(\s*koken\b/.test(createSrc));
kcheck('create.js prints the derived list on the result screen',
  /appendChild\(\s*kokenSatiri\s*\)/.test(createSrc),
  'a sentence that is built but never appended is the 26 Aug state with extra code');
for (const fn of ['saveFlatSVG', 'saveA4Pdf']) {
  kcheck(`create.js hands the origin record to ${fn}`,
    new RegExp(`${fn}\\([^)]*\\bkoken\\b`).test(createSrc),
    'the file must leave with the record, not merely be able to carry one');
}

// (i) NO SILENT WRITE ON THE PHOTO PATH. Every assignment to a spec axis inside
// the vision block must sit within one line of a labelling call. This is the
// check that keeps the phase alive after the phase: the next axis someone wires
// from the photo cannot arrive unlabelled.
//
// The label must NAME THE FIELD IT IS WRITTEN NEXT TO. An earlier version of
// this check only asked whether SOME labelling call sat within one line, and a
// mutation walked straight through it: `spec.neckline = seen.neckline` sitting
// directly under `fotoSet('garment', …)` counted as labelled. Adjacency is not
// provenance.
const visionBlock = createSrc.slice(
  createSrc.indexOf('applyMeasuredRatios(seen'), createSrc.indexOf('spec.seen = {'));
// Not spec AXES: carrier fields the engine reads but no picker offers, and
// which therefore have no origin of their own to declare.
const CARRIER = new Set(['skirtLengthMM', 'photoFabric', 'frontPlacket', 'seen']);
const lines = visionBlock.split('\n');
const unlabelled = [];
lines.forEach((ln, i) => {
  for (const m of ln.matchAll(/\bspec\.([a-zA-Z]+)\s*=[^=]/g)) {
    const field = m[1];
    if (CARRIER.has(field)) continue;
    const window = [ln, lines[i + 1] || ''].join(' ');
    const named = new RegExp(`(isaretle\\(\\s*koken,\\s*|fotoSet\\(|konakSet\\()'${field}'`).test(window);
    if (!named) unlabelled.push(`${field} (vision block line ${i + 1})`);
  }
});
kcheck('no axis is written from the photo without an origin label NAMING IT',
  unlabelled.length === 0, unlabelled.join(', ') || `${lines.length} lines scanned, ${CARRIER.size} carrier fields exempt`);

// (j) THE LABEL IS NOT ONLY PRESENT, IT IS TRUE (F2 İŞ 3).
// Everything above measures that a label EXISTS, is legal, and reaches the file.
// None of it measures whether the label is CORRECT. §0B's reward-hacking clause
// names the exact hack this leaves open: marking a field that IS visible as
// derived-and-invisible moves a real defect out of H10b — the bucket the ratchet
// watches — and into H10a, which by Damla's 26 Aug ruling is not on the ratchet
// at all. A split measured on top of a lying label is two wrong numbers instead
// of one, which is why this is the PRECONDITION of H10a/H10b, not a follow-up.
//
// The judge is a HUMAN visibility statement (`alan -> true/false`), the same
// statement the referee fills in vision/eval/labels-hakem-BOS.json. A record
// that contradicts it is a violation in both directions, and claiming to have
// READ an axis the human says cannot be photographed is a third.
const gorunurBeyan = { a: true, b: false };
const durust = KOKEN.yeniKoken(['a', 'b']);
KOKEN.isaretle(durust, 'a', 'cikarildi', 'gorunur');    // visible, not read = H10b
KOKEN.isaretle(durust, 'b', 'cikarildi', 'gorunmez');   // cannot be seen  = H10a
kcheck('an origin record that agrees with the human statement is clean',
  KOKEN.gorunurlukCelismesi(durust, gorunurBeyan).length === 0,
  KOKEN.gorunurlukCelismesi(durust, gorunurBeyan).join('; '));

const kacamak = KOKEN.yeniKoken(['a', 'b']);
KOKEN.isaretle(kacamak, 'a', 'cikarildi', 'gorunmez');  // ⚠ human said VISIBLE
KOKEN.isaretle(kacamak, 'b', 'cikarildi', 'gorunmez');
kcheck('marking a VISIBLE axis invisible is caught (the H10b -> H10a escape)',
  KOKEN.gorunurlukCelismesi(kacamak, gorunurBeyan).length === 1,
  KOKEN.gorunurlukCelismesi(kacamak, gorunurBeyan).join('; ') || 'not caught');

const sisirme = KOKEN.yeniKoken(['a', 'b']);
KOKEN.isaretle(sisirme, 'a', 'cikarildi', 'gorunur');
KOKEN.isaretle(sisirme, 'b', 'cikarildi', 'gorunur');   // ⚠ human said IMPOSSIBLE
kcheck('marking an UNPHOTOGRAPHABLE axis visible is caught (H10b inflated)',
  KOKEN.gorunurlukCelismesi(sisirme, gorunurBeyan).length === 1);

const gormus = KOKEN.yeniKoken(['a', 'b']);
KOKEN.isaretle(gormus, 'a', 'cikarildi', 'gorunur');
KOKEN.isaretle(gormus, 'b', 'gorulen', 'gorunmez');     // ⚠ read the unreadable
kcheck('claiming to have READ an axis the human says cannot be seen is caught',
  KOKEN.gorunurlukCelismesi(gormus, gorunurBeyan).length === 1);

kcheck('a human statement about an axis with no origin record at all is caught',
  KOKEN.gorunurlukCelismesi(KOKEN.yeniKoken(['a']), gorunurBeyan).length === 1);

// And the split itself: three buckets, and they must EXHAUST the derived bucket.
// Two buckets that do not add back up to the one they came from is a rewrite of
// the number, not a decomposition of it.
const bolme = KOKEN.ayristir(kacamak, gorunurBeyan);
const bolmeX = KOKEN.ayristir(KOKEN.yeniKoken(['a', 'b', 'c']), { a: true });
kcheck('the derived bucket splits into H10a / H10b and the parts exhaust it',
  bolme.H10a.length + bolme.H10b.length + bolme.bilinmiyor.length === bolme.toplam &&
  bolme.toplam === KOKEN.alanlar(kacamak, 'cikarildi').length,
  `H10a ${bolme.H10a.length} + H10b ${bolme.H10b.length} + bilinmiyor ${bolme.bilinmiyor.length} = ${bolme.toplam}`);
kcheck('an axis with NO human statement lands in neither H10a nor H10b',
  bolmeX.bilinmiyor.length === 2 && bolmeX.H10a.length === 0 && bolmeX.H10b.length === 1,
  `a=${bolmeX.H10b.join(',')} bilinmiyor=${bolmeX.bilinmiyor.join(',')}`);

// (k) THE GATE RUNS AT THE SHIPPED RECORD WIDTH (F2 İŞ 4, referee's K13).
// The referee's H2-A mutation deleted one axis from create.js's spec defaults,
// KOKEN_ALANLARI fell 38 -> 37, and this file still exited 0: every item above
// runs on a 10-axis REFERENCE spec, not on the 38 axes that actually ship. So
// the number the phase reports could be lowered by anyone, silently, and no gate
// would notice. The floor below is a RATCHET, not a description: it may only be
// raised, and raising it means the shipped record genuinely got wider.
const SEVK_TABAN = 38;   // measured by the referee on F0-yesil, 2026-08-26
const specBlock = createSrc.slice(createSrc.indexOf('\nconst spec = {'),
  createSrc.indexOf('const KOKEN_ALANLARI'));
const specKeys = [...specBlock.matchAll(/(?:^|[{,]\s*)([A-Za-z][A-Za-z0-9]*)\s*:/g)].map((m) => m[1]);
const groupBlock = createSrc.slice(createSrc.indexOf('SPEC_GROUPS = ['),
  createSrc.indexOf('\nconst spec = {'));
const groupKeys = [...groupBlock.matchAll(/\bkey:\s*'([^']+)'/g)].map((m) => m[1]);
const extraKeys = [...(createSrc.slice(createSrc.indexOf('const KOKEN_ALANLARI'),
  createSrc.indexOf('const koken = yeniKoken')).matchAll(/'([^']+)'/g))].map((m) => m[1]);
const SEVK_ALANLARI = [...new Set([...specKeys, ...groupKeys, ...extraKeys])];
kcheck('the shipped origin record still covers at least the declared floor of axes',
  SEVK_ALANLARI.length >= SEVK_TABAN,
  `${SEVK_ALANLARI.length} axes parsed from create.js (floor ${SEVK_TABAN})`);
kcheck('parsing found the three sources, not one of them',
  specKeys.length > 0 && groupKeys.length > 0 && SEVK_ALANLARI.length > specKeys.length,
  `spec ${specKeys.length} + groups ${groupKeys.length} + literals ${extraKeys.length} -> ${SEVK_ALANLARI.length}`);

// Every item that mattered above, re-run at the SHIPPED width instead of 10.
const sevkRec = KOKEN.yeniKoken(SEVK_ALANLARI);
kcheck('a record at the shipped width validates, and every axis is labelled',
  KOKEN.dogrula(sevkRec, SEVK_ALANLARI).length === 0 &&
  KOKEN.alanlar(sevkRec, 'cikarildi').length === SEVK_ALANLARI.length,
  `${SEVK_ALANLARI.length} axes`);
const sevkFlat = flatSVG(SPEC, sevkRec, SEVK_ALANLARI);
const sevkAttr = (k) => (new RegExp(`data-koken-${k}="([^"]*)"`).exec(sevkFlat) || [])[1];
kcheck('the flat carries the SHIPPED axis count, not the reference one',
  sevkAttr('toplam') === String(SEVK_ALANLARI.length) &&
  (sevkAttr('alanlar') || '').split(' ').filter(Boolean).length === SEVK_ALANLARI.length,
  `toplam=${sevkAttr('toplam')}`);
const sevkA4 = Buffer.from(patternA4Pdf(pattern, 'Dress', sevkRec, SEVK_ALANLARI)).toString('latin1');
const sevkMissing = SEVK_ALANLARI.filter((f) => !sevkA4.includes(f));
kcheck('the A4 cover names every SHIPPED derived axis', sevkMissing.length === 0,
  sevkMissing.join(', ') || `${SEVK_ALANLARI.length} names on the cover`);

// ------------------------------------------------------------------ artifacts
const base = join(OUT, safeName('stitchu-dress-aline'));
writeFileSync(`${base}.dxf`, dxf);
writeFileSync(`${base}.svg`, svg);
writeFileSync(`${base}-a4.pdf`, a4);
writeFileSync(`${base}-a0.pdf`, a0);
writeFileSync(`${base}-flat.svg`, flat);
writeFileSync(`${base}-flat-koken.svg`, flatK);
writeFileSync(`${base}-a4-koken.pdf`, a4kBytes);

console.log('İNDİR KAPISI — kullanıcı eve bir dosya götürüyor mu? (0 API çağrısı)');
console.log(note.join('\n'));
if (fails.length) console.log(fails.join('\n'));
console.log('\nyazılan dosyalar (RULES invariant 3 — yol, "baktım" değil):');
for (const f of ['.dxf', '.svg', '-a4.pdf', '-a0.pdf', '-flat.svg', '-flat-koken.svg', '-a4-koken.pdf']) console.log(`  ${base}${f}`);
if (kfails.length) console.log(kfails.join('\n'));
// EXIT 8 IS THE KÖKEN CODE (F0 card, gate item 4): a faked or emptied origin
// label is a different failure from a missing file and reports as one, so a
// mutation run can tell which door it broke.
console.log(`\nİNDİR KAPISI: ${fails.length || kfails.length ? `KIRMIZI — ${fails.length} kalem + ${kfails.length} köken kalemi` : 'YEŞİL'}`);
if (kfails.length) process.exit(8);
process.exit(fails.length ? 1 : 0);
