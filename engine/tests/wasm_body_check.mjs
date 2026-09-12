#!/usr/bin/env node
// wasm_body_check.mjs — F1 tur 6 kapisi (karar ajani 2, sart 2): SEVK EDILEN motor Body'yi tasiyor mu?
//
// Once: body.cpp ENGINE_SRCS'e girdi ama tuketicisiz kaldi, linker atti, bundle bayt-ayni kaldi; 'Body sevk
// motorunda' cumlesi yalandi. Sonra tek okuyucu embind bodyJSON eklendi ve node'dan ELLE okundu — kanit degil.
// Bu dosya o el okumasini KAPI yapar: her build'de web/vendor/stitchu-engine.js (sitenin yuklediği bayt) icindeki
// bodyJSON(...) contract/body-v1.json ile kiyaslanir:
//   (1) croquis36 ve gercek36: TUM landmark'lar (x, y) 1e-6 icinde (ozellikle croquis36 landmark.bustApex == [77.2, 254.9])
//   (2) croquis36 ve gercek36: TUM halka cevreleri (girth.*) == cevreMM 1e-6 icinde
//   (3) EU34..EU44: gradeTablosu.degerler girth.bust/waist/hip/neckBase/highHip/biceps/wrist mm == bodyJSON rings
//   (4) bodyJSON cizim yapmaz: dondurdugu JSON yalniz id/landmarks/rings anahtarlarini tasir (karar 5'in amaci:
//       F2'den once web Body'den CIZMEZ; okuyucu okur, cizmez)
// Bundle damgasi (source-stamp satiri) ciktida basilir: hangi bayt dogrulandi, belli olsun.
//   usage: node wasm_body_check.mjs [path/to/stitchu-engine.js]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const enginePath = process.argv[2] ? resolve(process.argv[2]) : join(root, 'web/vendor/stitchu-engine.js');
const TOL = 1e-6;

let fails = 0, checks = 0;
const fail = (m) => { console.error('  [FAIL]', m); fails += 1; };
const ok = (c, m) => { checks += 1; if (!c) fail(m); };

const head = readFileSync(enginePath, 'utf8').slice(0, 200).split('\n')[0];
const stamp = /source-stamp ([0-9a-f]{16})/.exec(head)?.[1] ?? 'DAMGA YOK';
console.log(`wasm_body_check — ${enginePath}\n  bundle damgasi: ${stamp}`);

const contract = JSON.parse(readFileSync(join(root, 'contract/body-v1.json'), 'utf8'));
const createEngine = (await import(enginePath)).default;
const eng = await createEngine();
if (typeof eng.bodyJSON !== 'function') { fail('bundle bodyJSON export etmiyor — body.cpp sevk motorunda DEGIL'); console.log(`FAIL — ${fails} FAIL`); process.exit(1); }

const read = (id) => {
  const j = JSON.parse(eng.bodyJSON(id));
  if (j.error) fail(`${id}: ${j.error}`);
  return j;
};

// (1)+(2)+(4) iki sozlesme bedeni
for (const id of ['gercek36', 'croquis36']) {
  const c = contract.bedenler[id], j = read(id);
  ok(JSON.stringify(Object.keys(j).sort()) === JSON.stringify(['id', 'landmarks', 'rings']), `${id}: bodyJSON yalniz id/landmarks/rings tasir (cizim yok), geldi: ${Object.keys(j).join(',')}`);
  ok(j.id === id, `${id}: id`);
  for (const [name, lm] of Object.entries(c.landmarklar)) {
    if (name.startsWith('_')) continue;
    const got = j.landmarks[name];
    ok(Array.isArray(got), `${id}: ${name} bundle'da yok`);
    if (!got) continue;
    ok(Math.abs(got[0] - lm.x) <= TOL && Math.abs(got[1] - lm.y) <= TOL, `${id}: ${name} bundle [${got}] != contract [${lm.x}, ${lm.y}]`);
  }
  for (const [name, r] of Object.entries(c.halkalar)) {
    if (name.startsWith('_') || typeof r.cevreMM !== 'number') continue;
    const got = j.rings[name];
    ok(typeof got === 'number' && Math.abs(got - r.cevreMM) <= TOL, `${id}: ${name} bundle ${got} != contract ${r.cevreMM}`);
  }
}
const apex = read('croquis36').landmarks['landmark.bustApex'];
console.log(`  croquis36 landmark.bustApex = [${apex}] (contract [${contract.bedenler.croquis36.landmarklar['landmark.bustApex'].x}, ${contract.bedenler.croquis36.landmarklar['landmark.bustApex'].y}])`);

// (3) grade serisi
const gt = contract.gradeTablosu.degerler, sizes = gt._sutunlar;
for (const [ring, row] of Object.entries(gt)) {
  if (!ring.startsWith('girth.') || !Array.isArray(row.mm)) continue;
  sizes.forEach((sz, i) => {
    const got = read(sz).rings[ring];
    ok(typeof got === 'number' && Math.abs(got - row.mm[i]) <= TOL, `${sz}: ${ring} bundle ${got} != gradeTablosu ${row.mm[i]}`);
  });
}
console.log(`  ${checks} kiyas, ${fails} FAIL`);
console.log(fails ? `FAIL — ${fails} FAIL` : 'OK — sevk edilen bundle Body sayilari contract ile ayni');
process.exit(fails ? 1 : 0);
