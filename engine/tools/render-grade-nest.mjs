// render-grade-nest.mjs — nested grade nest visual proof (PIPELINE Aşama 5).
// Grades ONE recipe across the full EU size chart (contract/tables.json, the K1
// single source) by calling recipe-json-dump for every standard body, then
// overlays every size's SHAPED body pieces on one canvas — nested at a common
// grade origin (the waist/neck reference corner), light -> dark by size. This is
// the industry grade-nest picture: the size lines must sit as concentric, evenly
// spreading outlines (no crossing, no repeat), the geometric echo of the
// monotonic-growth + constant-topology proof in recipe_grade_check.
//
// Visual verification is an OUTPUT not a claim (RULES invariant 3): the PNG path
// + sha256 go to stdout so the report can quote them.
//   usage: node render-grade-nest.mjs <recipe.json> <paramMM> <dumpBin> <tablesJson> <outPng>
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { Resvg } from '@resvg/resvg-js';

const [, , recipePath, paramMM, dumpBin, tablesJson, outPng] = process.argv;
if (!outPng) {
  console.error('usage: node render-grade-nest.mjs <recipe.json> <paramMM> <dumpBin> <tablesJson> <outPng>');
  process.exit(2);
}

// EU chart from the K1 single source (same numbers the engine grades against).
const tables = JSON.parse(readFileSync(tablesJson, 'utf8'));
const chart = tables.draft.euSizeChart;
const sizes = Object.keys(chart).filter((k) => k !== '_fields').sort();

// Strip/notion pieces are cut-to-length, not a grade dimension — same exclusion
// the grade test uses; a nest of the shaped body panels is the honest picture.
const isStrip = (name) =>
  /Bias binding|Binding|Strap|Tie|Cord|Waistband/.test(name);

// Serialize one PathCommand list to an SVG path `d`. Command JSON is FLAT
// ({type, x, y, cp1x, cp1y, cp2x, cp2y}), matching wasm/bindings.cpp + recipe-
// json-dump; close has no coordinates.
const pathD = (cmds) =>
  cmds
    .map((c) => {
      if (c.type === 'move') return `M ${c.x} ${c.y}`;
      if (c.type === 'line') return `L ${c.x} ${c.y}`;
      if (c.type === 'curve') return `C ${c.cp1x} ${c.cp1y} ${c.cp2x} ${c.cp2y} ${c.x} ${c.y}`;
      if (c.type === 'close') return 'Z';
      return '';
    })
    .join(' ');

// Every (x,y) a command touches, for bbox — the endpoint plus any control points.
const points = (c) => {
  const pts = [];
  if (c.x !== undefined) pts.push([c.x, c.y]);
  if (c.cp1x !== undefined) pts.push([c.cp1x, c.cp1y]);
  if (c.cp2x !== undefined) pts.push([c.cp2x, c.cp2y]);
  return pts;
};

// Draft each size, collect its shaped pieces, and record the global bbox so the
// whole nest fits one viewBox. Pieces keep their own drafted coordinates (all
// share the same origin: waist/neck at y≈0), so the overlay IS the true nest.
const runs = [];
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const size of sizes) {
  const cm = chart[size].join(',');
  const json = execFileSync(dumpBin, [recipePath, `custom:${cm}`, paramMM], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const pattern = JSON.parse(json);
  const pieces = pattern.pieces.filter((p) => !isStrip(p.name));
  for (const p of pieces)
    for (const c of p.commands)
      for (const [x, y] of points(c)) {
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
  runs.push({ size, pieces });
}

const pad = 20;
const vbX = minX - pad, vbY = minY - pad;
const vbW = maxX - minX + 2 * pad, vbH = maxY - minY + 2 * pad;

// light -> dark by size (small = light grey, EU52 = ink); the smallest size sits
// innermost, the largest outermost — a correct grade reads as a clean fan.
const nSizes = runs.length;
const shade = (i) => {
  const t = nSizes > 1 ? i / (nSizes - 1) : 0;
  const v = Math.round(200 - 180 * t); // 200 (light) -> 20 (ink)
  return `rgb(${v},${v},${v})`;
};

let inner = '';
runs.forEach((run, i) => {
  const color = shade(i);
  for (const p of run.pieces)
    inner += `<path d="${pathD(p.commands)}" fill="none" stroke="${color}" stroke-width="1.6"/>`;
  // markings (darts) drawn thin in the same shade — dart legs must nest too.
  for (const p of run.pieces)
    if (p.markings && p.markings.length)
      inner += `<path d="${pathD(p.markings)}" fill="none" stroke="${color}" stroke-width="0.8" stroke-dasharray="4 3"/>`;
});

// size legend, top-left.
const lx = vbX + 8;
let ly = vbY + 18;
runs.forEach((run, i) => {
  inner += `<rect x="${lx}" y="${ly - 10}" width="14" height="6" fill="${shade(i)}"/>`;
  inner += `<text x="${lx + 20}" y="${ly - 4}" font-family="monospace" font-size="12" fill="#111">${run.size}</text>`;
  ly += 16;
});

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${vbW}mm" height="${vbH}mm" ` +
  `viewBox="${vbX} ${vbY} ${vbW} ${vbH}">` +
  `<rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="#faf8f4"/>` +
  inner +
  `</svg>`;

mkdirSync(dirname(outPng), { recursive: true });
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
writeFileSync(outPng, png);
const sha = createHash('sha256').update(png).digest('hex');
console.log(`nest: ${outPng}`);
console.log(`sizes: ${sizes.join(' ')} (${nSizes})`);
console.log(`bbox mm: x[${minX.toFixed(1)}..${maxX.toFixed(1)}] y[${minY.toFixed(1)}..${maxY.toFixed(1)}]`);
console.log(`sha256: ${sha}`);
