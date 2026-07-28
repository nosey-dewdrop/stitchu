#!/usr/bin/env node
// gen-factory-pack.mjs — build the downloadable FACTORY PACK the studio serves.
// The pack is the genuine industrial production package tools/tech-pack.cpp
// emits (machine manifest + one graded DXF per EU size + a human-readable PDF
// spec sheet), zipped into web/factory/<recipe-id>.zip. Everything is 100%
// motor-derived and deterministic (same recipe + param + width + gsm -> the same
// bytes), the SAME output the tech_pack_check ctest proves against ezdxf +
// poppler. Nothing is invented here; this script only ORCHESTRATES the proven
// native tools so the studio can offer the pack as a static download.
//
// A factory size run is by definition a grade over the STANDARD EU size chart —
// it does not depend on one shopper's custom body (the shopper picks their size
// from the published size table). So the pack for a recipe's default design
// param is the complete, honest deliverable; the studio labels it exactly that.
//
//   usage: node gen-factory-pack.mjs
// Requires: engine/build/tech-pack, node, zip, engine/.venv-dxf (poppler not
// needed to BUILD the pack, only the PDF gen which is pure node here).
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const engineDir = join(here, '..');
const root = join(engineDir, '..');
const techPack = join(engineDir, 'build/tech-pack');
const genPdf = join(here, 'gen-techpack-pdf.mjs');
const outDir = join(root, 'web/factory');

if (!existsSync(techPack)) {
  console.error(`tech-pack binary missing at ${techPack} — build it first (cmake --build engine/build --target tech-pack)`);
  process.exit(2);
}

// Same studio defaults the recipe picker uses (studio.js buildParamFields):
// skirtLengthMM table -> 450, else range midpoint. Fabric width + gsm are the
// standard industry values the tech_pack_check pins.
const RECIPES = [
  { id: 'skirt.aline.dart', file: 'skirt-aline-dart.json', param: 450, widthMM: 1400, gsm: 220 },
  { id: 'top.shift.square.spaghetti', file: 'shift-dress-square-spaghetti.json', param: 390, widthMM: 1400, gsm: 180 },
];

mkdirSync(outDir, { recursive: true });
const manifestEntries = [];

for (const r of RECIPES) {
  const recipePath = join(root, 'recipes', r.file);
  const work = join(outDir, `.build-${r.id}`);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(join(work, 'dxf'), { recursive: true });

  // 1) native tech-pack: machine manifest + one graded DXF per EU size.
  const rep = execFileSync(techPack,
    [recipePath, String(r.param), String(r.widthMM), work, '--gsm', String(r.gsm)],
    { encoding: 'utf8' });
  process.stdout.write(rep);

  // 2) human-readable PDF spec sheet (deterministic, straight off the manifest).
  execFileSync('node', [genPdf, join(work, 'manifest.json'), join(work, 'tech-pack.pdf')], { stdio: 'inherit' });

  // 3) a short README so the pack is self-describing offline.
  const man = JSON.parse(readFileSync(join(work, 'manifest.json'), 'utf8'));
  const paramName = Object.keys(man.param)[0];
  const readme =
`stitchu factory pack — ${man.recipe} (${man.garment})
============================================================
This is a graded production package for the studio demo recipe at its default
design parameter (${paramName} = ${man.param[paramName]} mm). A factory size run
grades ONE design across the whole standard EU size chart; it does not depend on
a single shopper's custom body — a buyer picks their size from the size table.

Contents:
  manifest.json   machine-readable package (stitchu.techpack/1): size table,
                  cut list, fabric metres + weight, marker efficiency + roll
                  length, and the graded DXF file name per EU size.
  tech-pack.pdf   human-readable spec sheet (page 1 cover + cut list, page 2
                  full grade table). Every number is copied from manifest.json.
  dxf/            one DXF-AAMA/ASTM R12 interchange file per EU size. Layers:
                  1=cut boundary, 8=seamline, 7=grainline, 4=notch, 11=internal,
                  15=text. $INSUNITS=4 (millimeters). Opens in Valentina,
                  Seamly2D, ezdxf, and standard CAD.

Marker fabric width: ${man.markerFabricWidthMM} mm.  Gramaj: ${man.gsm} g/m2.
Graded sizes clean: ${man.gradedSizesClean}/${man.gradedSizesTotal}.

Every value is computed by the deterministic stitchu engine — no LLM, no guessed
number. Same recipe + parameters -> the same package bytes.
`;
  writeFileSync(join(work, 'README.txt'), readme);

  // 4) zip (deterministic: -X strips extra file attributes / timestamps that
  //    would otherwise vary the archive; we sort entries for a stable order).
  const zipName = `${r.id}.zip`;
  const zipPath = join(outDir, zipName);
  rmSync(zipPath, { force: true });
  // list entries in a fixed order for byte-stability
  const entries = ['manifest.json', 'tech-pack.pdf', 'README.txt',
    ...man.sizes.filter((s) => s.dxf).map((s) => s.dxf)];
  execFileSync('zip', ['-X', '-q', zipPath, ...entries], { cwd: work });
  rmSync(work, { recursive: true, force: true });

  const bytes = readFileSync(zipPath).length;
  console.log(`  -> web/factory/${zipName} (${bytes} bytes, ${man.gradedSizesClean}/${man.gradedSizesTotal} clean sizes)`);
  manifestEntries.push({
    id: r.id, file: zipName, param: paramName, paramMM: r.param,
    fabricWidthMM: r.widthMM, gsm: r.gsm,
    gradedSizesClean: man.gradedSizesClean, gradedSizesTotal: man.gradedSizesTotal,
    bytes,
  });
}

// index the packs so the studio can find the right zip for the selected recipe.
writeFileSync(join(outDir, 'index.json'),
  JSON.stringify({ schema: 'stitchu.factory/1', packs: manifestEntries }, null, 2) + '\n');
console.log(`wrote web/factory/index.json (${manifestEntries.length} packs)`);
