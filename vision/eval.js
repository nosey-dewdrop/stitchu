/* eval.js — per-attribute accuracy of a predictions file against the
   eye-labeled ground truth. Ground-truth nulls are skipped (not visible).
   run:  node vision/eval.js eval/clip-predictions.json */
const fs = require('fs');
const path = require('path');

const predFile = process.argv[2] || 'eval/clip-predictions.json';
const labels = JSON.parse(fs.readFileSync(path.join(__dirname, 'eval/labels.json'), 'utf8'));
const preds = JSON.parse(fs.readFileSync(path.join(__dirname, predFile), 'utf8'));

const attrs = ['garment', 'neckline', 'sleeveStyle', 'sleeveLength', 'skirtStyle',
               'length', 'waistline', 'fabric', 'hemRuffle', 'keyhole'];
const stats = Object.fromEntries(attrs.map((a) => [a, { n: 0, ok: 0, misses: [] }]));

for (const [file, truth] of Object.entries(labels)) {
  if (file.startsWith('_') || !preds[file]) continue;
  for (const attr of attrs) {
    const want = truth[attr];
    if (want === null || want === undefined) continue;
    const got = preds[file][attr];
    stats[attr].n++;
    if (got === want) stats[attr].ok++;
    else stats[attr].misses.push(`${file.slice(0, 2)}: ${want}->${got}`);
  }
}

let totN = 0, totOk = 0;
console.log(`${predFile} vs eye-labeled ground truth:`);
for (const attr of attrs) {
  const { n, ok, misses } = stats[attr];
  if (!n) continue;
  totN += n; totOk += ok;
  console.log(`  ${attr.padEnd(12)} ${String(ok).padStart(2)}/${n}  ${(100 * ok / n).toFixed(0).padStart(3)}%  ${misses.slice(0, 4).join(' | ')}`);
}
console.log(`  ${'OVERALL'.padEnd(12)} ${totOk}/${totN}  ${(100 * totOk / totN).toFixed(0)}%`);
