#!/usr/bin/env node
// sizechart_source_check — THE SIZE CHART'S SOURCE GATE (TUR 18B, 2026-08-17).
//
// WHY THIS GATE EXISTS. contract/tables.json draft.euSizeChart is 70 numbers
// and it is the whole body of the engine: every girth, every length the drafter
// builds a panel from comes from here, and a buyer picks a size off it. From
// 77193d5 (7 Jul 2026) to 17 Aug 2026 those 70 numbers carried ONE sentence of
// provenance — a comment reading "EU size chart (German convention)" — and that
// comment was written in a TEST HARNESS (engine-check/main.swift), next to
// hand-invented bodies called tall/petite/pear/apple/bigNeckSmallShoulder.
// 1eafc16 copied the fixture verbatim into engine/src/sizechart.hpp and it
// became the engine's truth. Nobody ever named a book, a standard or a table.
//
// The repo's own lesson (CLAUDE.md): GUESSED PATTERNMAKING NUMBERS threw away
// 07-sleeve. A guessed BODY number is worse: it is worn by a person.
//
// WHAT THIS GATE ASKS — one question, per column, and it is not a threshold:
//   does this column of the chart name the publication it came from?
// Every entry in _fields must have an entry in _sources whose status is
// 'verified' AND that carries source + url + published[] matching the chart's
// own column value-for-value. status 'NONE' is an HONEST declaration of a
// verified absence: it is recorded, it is not deleted, and it is RED.
//
// ⚠ THIS GATE IS BORN RED, DELIBERATELY. 3 of 7 columns are sourced
// (bust/waist/hip == burda style's published Damen Maßtabelle, exact 10/10);
// 4 are not (shoulder, backLength, armLength, neck). Red is the true reading,
// so the gate is shipped red rather than shipped green with a softer question.
//
// FINISH CONDITION (when this gate may go green, and the ONLY way):
//   each remaining column is either (a) matched to a published table whose url
//   and numbers go into _sources, or (b) REPLACED by Damla with numbers from a
//   named source. An agent may not close it by editing the chart: changing a
//   body measurement without a source breaks a buyer's body. The open columns
//   are queued in DAMLA-KUYRUK K10.
// Painting this gate green by relaxing the question is forbidden; the mutation
// probes below exist so that a weakened question fails loudly here first.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const TABLES = join(root, 'contract/tables.json');

let failures = 0;
const fail = (m) => { console.error('FAIL:', m); failures += 1; };
const ok = (m) => console.log('ok:', m);

// judge(chart) -> list of failure strings. Pure, so the mutation probes below
// can run it on a doctored copy without touching the repo.
function judge(chart) {
  const bad = [];
  const fields = chart._fields;
  const sources = chart._sources;
  if (!Array.isArray(fields) || !fields.length) return ['euSizeChart._fields missing or empty'];
  if (!sources || typeof sources !== 'object') return ['euSizeChart._sources missing — the chart declares no provenance at all'];

  const labels = Object.keys(chart).filter((k) => !k.startsWith('_'));

  for (const [i, field] of fields.entries()) {
    const s = sources[field];
    if (!s) { bad.push(`column '${field}' carries NO source declaration at all`); continue; }
    if (!('status' in s)) { bad.push(`column '${field}' source has no status`); continue; }
    if (s.status === 'NONE') {
      bad.push(`column '${field}' is UNSOURCED (status NONE) — ${labels.length} published values with no publication behind them`);
      continue;
    }
    if (s.status !== 'verified') { bad.push(`column '${field}' status '${s.status}' is not one of verified|NONE`); continue; }
    // verified must actually carry the evidence, and it must match the chart.
    if (!s.source || typeof s.source !== 'string') { bad.push(`column '${field}' is 'verified' but names no source`); continue; }
    if (!s.url || !/^https?:\/\//.test(String(s.url))) { bad.push(`column '${field}' is 'verified' but carries no url`); continue; }
    if (!Array.isArray(s.published)) { bad.push(`column '${field}' is 'verified' but publishes no numbers to compare`); continue; }
    if (s.published.length !== labels.length) {
      bad.push(`column '${field}' published[] has ${s.published.length} values, chart has ${labels.length} sizes`);
      continue;
    }
    const mismatch = [];
    for (const [j, label] of labels.entries()) {
      const own = chart[label][i];
      if (own !== s.published[j]) mismatch.push(`${label}: chart ${own} vs published ${s.published[j]}`);
    }
    if (mismatch.length) bad.push(`column '${field}' DRIFTED from its declared source — ${mismatch.join('; ')}`);
  }
  for (const k of Object.keys(sources)) {
    if (!fields.includes(k)) bad.push(`_sources declares '${k}', which is not a column of the chart`);
  }
  return bad;
}

// ---- the real reading --------------------------------------------------------
let tables;
try {
  tables = JSON.parse(readFileSync(TABLES, 'utf8'));
} catch (e) {
  fail(`contract/tables.json unparsable: ${e.message}`);
  process.exit(1);
}
const chart = tables.draft.euSizeChart;
const verdicts = judge(chart);

const sourced = chart._fields.filter((f) => chart._sources?.[f]?.status === 'verified');
const unsourced = chart._fields.filter((f) => chart._sources?.[f]?.status === 'NONE');
const sizes = Object.keys(chart).filter((k) => !k.startsWith('_')).length;
console.log(`euSizeChart: ${chart._fields.length} columns x ${sizes} sizes = ${chart._fields.length * sizes} numbers on a buyer's body`);
console.log(`  sourced (verified against a publication): ${sourced.length} -> ${sourced.join(', ') || '(none)'}`);
console.log(`  UNSOURCED (verified absence, declared):   ${unsourced.length} -> ${unsourced.join(', ') || '(none)'}`);
for (const v of verdicts) fail(v);
if (!verdicts.length) ok('every column of euSizeChart names the publication it came from, and matches it value-for-value');

// ---- MUTATION PROOF ----------------------------------------------------------
// A gate that never says no is decoration. Each probe doctors an in-memory copy
// and the gate must react; a probe that fails to move the verdict is itself a
// failure of this test.
{
  const clone = () => JSON.parse(JSON.stringify(chart));
  const base = verdicts.length;
  let probes = 0, moved = 0;
  const probe = (name, doctor, want) => {
    probes += 1;
    const c = clone();
    doctor(c);
    const got = judge(c);
    const hit = want(got, base);
    if (hit) { moved += 1; ok(`mutation probe '${name}': gate reacted (${base} -> ${got.length} verdicts)`); }
    else fail(`mutation probe '${name}': gate did NOT react (${base} -> ${got.length} verdicts) — the question is too weak`);
  };

  // 1. strip the whole provenance block -> everything is unsourced.
  probe('drop _sources', (c) => { delete c._sources; }, (g) => g.length === 1 && /declares no provenance/.test(g[0]));

  // 2. a sourced column's chart value is edited but the citation is left alone:
  //    this is the exact way a body measurement silently drifts off its source.
  probe('drift bustCM at EU38 by +1cm', (c) => { c.EU38[0] = c.EU38[0] + 1; },
        (g) => g.some((v) => /bustCM' DRIFTED/.test(v) && /EU38: chart 89 vs published 88/.test(v)));

  // 3. the +6cm regime above EU46 is the chart's most-doubted feature and it IS
  //    published; flattening it to +4 must read as drift, not as a tidy-up.
  probe('flatten the +6cm regime to +4 (EU48/50/52 bust)', (c) => { c.EU48[0] = 108; c.EU50[0] = 112; c.EU52[0] = 116; },
        (g) => g.some((v) => /bustCM' DRIFTED/.test(v) && /EU48: chart 108 vs published 110/.test(v) && /EU52: chart 116 vs published 122/.test(v)));

  // 4. claiming 'verified' without evidence must not buy a green.
  probe('claim neckCM verified with no url/published', (c) => { c._sources.neckCM = { status: 'verified', source: 'trust me' }; },
        (g) => g.some((v) => /neckCM.*verified.*no url/.test(v)));

  // 5. an unknown status word must not slip through as neither verified nor NONE.
  probe('invent a status word', (c) => { c._sources.backLengthCM.status = 'probably'; },
        (g) => g.some((v) => /backLengthCM.*'probably'/.test(v)));

  // 6. adding a column with no declaration must be caught immediately.
  probe('add an undeclared column', (c) => { c._fields.push('thighCM'); for (const k of Object.keys(c)) if (!k.startsWith('_')) c[k].push(55); },
        (g) => g.some((v) => /'thighCM' carries NO source declaration/.test(v)));

  // 7. and the honest direction: sourcing a column must REMOVE a verdict, so the
  //    gate is closable by real work and not only by weakening it.
  probe('source armLengthCM properly (hypothetical) removes its verdict', (c) => {
    const labels = Object.keys(c).filter((k) => !k.startsWith('_'));
    const i = c._fields.indexOf('armLengthCM');
    c._sources.armLengthCM = { status: 'verified', source: 'hypothetical publication', url: 'https://example.invalid/x.pdf', published: labels.map((l) => c[l][i]) };
  }, (g, b) => g.length === b - 1);

  console.log(`mutation probes: ${moved}/${probes} moved the verdict`);
  if (moved !== probes) failures += 1;
}

if (failures) {
  console.error(`\nsizechart source gate FAILED (${failures})`);
  console.error('This gate is DELIBERATELY RED as of TUR 18B. It closes when the unsourced');
  console.error('columns are matched to a publication or replaced from a named source by Damla');
  console.error('(DAMLA-KUYRUK K10). Do NOT close it by editing the chart or softening the question.');
  process.exit(1);
}
ok('sizechart source gate PASSED');
