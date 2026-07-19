#!/usr/bin/env node
// K5 VISION CASCADE ROUTER — flag-off by default; the PUBLIC photo->pattern path is
// untouched (web/js/create.js still calls /api/analyze directly; nothing imports this).
//
// Purpose: cut the teacher (Opus vision) credit curve for OFFLINE tooling
// (mine-vocab labelling, benchmark reclassify) on the four cheap high-frequency
// fields {garment, neckline, sleeveLength, skirtStyle}.
//
// Student source (HONEST declaration): four locally trained mobilenet_v3_small heads
// (vision-student/runs/*.pt, distilled from the cached teacher ambar; global leak-free
// md5 photo split). There is NO fabricated student: fields without a trained head, or
// with "no safe tau" in the calibration, ALWAYS route to the teacher.
//
// Decision rule (calibrated in vision-student/calibrate_cascade.py, VAL only):
//   student answers a field iff top-1 softmax confidence >= tau(field), where tau was
//   chosen as the smallest threshold keeping teacher-agreement >= 95% on the
//   student-decided val subset. A PHOTO skips the teacher call entirely iff the
//   garment head is confident AND every field the predicted garment needs is
//   confident (dress: neckline+sleeveLength+skirtStyle, top: neckline+sleeveLength,
//   skirt: skirtStyle, trousers/other: nothing — not draftable).
//
// GO-LIVE GATE (RED until the 150-photo hand-labelled eval base is complete —
// dataset/eval/hand-labels.json): the flag stays OFF. Enabling requires BOTH:
//   1. STITCHU_CASCADE=1 in the environment, AND
//   2. the eval base gate file dataset/eval/hand-labels.json with >= 150 entries.
//
// DAMLA DECISION 2026-07-19: labelling STOPPED at 115/150 — DELIBERATE deferral,
// not incomplete work. Reason: a single user (Damla), no photo volume, teacher
// cost paid directly; the cascade is a pre-sale need. The remaining 35 labels +
// calibration happen when selling requires it. DO NOT calibrate on 115 — the
// gate stays RED-honest until 150. This topic is CLOSED until sales prep.
//
// Usage (offline probe):
//   node engine/tools/cascade-router.mjs <photo.jpg> [photo2.jpg ...]
//   STITCHU_CASCADE=1 node engine/tools/cascade-router.mjs <photo.jpg>
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CALIB = join(root, 'vision-student', 'runs', 'cascade-calibration.json');
const PYTHON = join(root, 'vision-student', '.venv', 'bin', 'python');
const INFER = join(root, 'vision-student', 'infer_cascade.py');
const EVAL_GATE = join(root, 'dataset', 'eval', 'hand-labels.json');
const EVAL_GATE_MIN = 150;

export const NEEDS = {
  dress: ['neckline', 'sleeveLength', 'skirtStyle'],
  top: ['neckline', 'sleeveLength'],
  skirt: ['skirtStyle'],
  trousers: [], other: [],
};

export function cascadeEnabled() {
  if (process.env.STITCHU_CASCADE !== '1') return { enabled: false, reason: 'flag off (STITCHU_CASCADE != 1)' };
  if (!existsSync(EVAL_GATE)) return { enabled: false, reason: `eval gate RED: ${EVAL_GATE} missing (need >= ${EVAL_GATE_MIN} hand labels)` };
  try {
    const n = Object.keys(JSON.parse(readFileSync(EVAL_GATE, 'utf8')).labels || {}).length;
    if (n < EVAL_GATE_MIN) return { enabled: false, reason: `eval gate RED: ${n}/${EVAL_GATE_MIN} hand labels` };
  } catch { return { enabled: false, reason: 'eval gate unreadable' }; }
  return { enabled: true, reason: 'flag on + eval gate green' };
}

export function loadTaus() {
  if (!existsSync(CALIB)) return null;
  const c = JSON.parse(readFileSync(CALIB, 'utf8'));
  const taus = {};
  for (const [f, r] of Object.entries(c.fields || {})) {
    taus[f] = {
      flat: (r.calibrated && typeof r.calibrated === 'object') ? r.calibrated.tau : null,
      perClass: (r.per_class && typeof r.per_class === 'object')
        ? Object.fromEntries(Object.entries(r.per_class).map(([cls, b]) => [cls, b.tau]))
        : {},
    };
  }
  return taus;
}

// Pure decision: studentOut = { field: [pred, conf] }. Returns
// { route: 'student'|'teacher', fields: {field: {value, conf, by}}, why }.
// Confidence rule mirrors calibrate_cascade.py: a field is student-answerable iff
// conf >= min(flat tau, class-conditional tau for the PREDICTED class), whichever exist.
export function route(studentOut, taus) {
  if (!taus) return { route: 'teacher', why: 'no calibration file' };
  const dec = {};
  const confident = (f) => {
    const t = taus[f];
    if (!t || !studentOut[f]) return false;
    const [pred, conf] = studentOut[f];
    const cands = [t.flat, t.perClass[pred]].filter((x) => x != null);
    return cands.length > 0 && conf >= Math.min(...cands);
  };
  if (!confident('garment')) return { route: 'teacher', why: 'garment head not confident' };
  const g = studentOut.garment[0];
  const needed = NEEDS[g] || null;
  if (needed === null) return { route: 'teacher', why: `unknown garment class ${g}` };
  for (const f of needed) {
    if (!confident(f)) return { route: 'teacher', why: `${f} not confident` };
  }
  for (const f of ['garment', ...needed]) {
    dec[f] = { value: studentOut[f][0], conf: studentOut[f][1], by: 'student' };
  }
  return { route: 'student', fields: dec, why: 'all needed fields above tau' };
}

// CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const photos = process.argv.slice(2);
  if (!photos.length) {
    console.error('usage: node engine/tools/cascade-router.mjs <photo.jpg> [...]');
    process.exit(1);
  }
  const gate = cascadeEnabled();
  const taus = loadTaus();
  const raw = execFileSync(PYTHON, [INFER, ...photos], { encoding: 'utf8' });
  const preds = JSON.parse(raw.trim().split('\n').pop());
  const out = {};
  for (const [p, so] of Object.entries(preds)) {
    const r = route(so, taus);
    // gate overrides: even a confident student answer is NOT used while the gate is red
    out[p] = gate.enabled ? r : { ...r, route: 'teacher', gated: r.route === 'student', gate: gate.reason };
  }
  console.log(JSON.stringify({ gate, taus, decisions: out }, null, 1));
}
