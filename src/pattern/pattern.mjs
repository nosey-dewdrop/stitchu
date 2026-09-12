// src/pattern/pattern.mjs — SILUET -> KALIP (0-K.10.e). Flat genislikleri kaliba HEDEF, pens ve bolluk oradan.
//   node src/pattern/pattern.mjs <set> [no...]
// Girdi: KOSU/onbellek/siluet-<sha>.json (okuma), <no>/ops-topoloji.json (panel/dikis topolojisi: roba, aski, kup, pat;
//        A4 tur6 okumasindan dondurulmus; yoksa o anki ops.json'dan bir kez kopyalanir)
// Uretilen: ops.json = topoloji + siluetten yazilan etek ucu (extendTo) ve klos (flare); hedefler.json = bel/gogus,
//        kalca/gogus GENISLIK oranlari (kaynak 'siluet-orani enGenis' -> motor payda olarak cizilen en genis kesiti alir);
//        graf.json (grafuygula --hedef, gercek36), kalip-36.svg/png (grafciz kalip). Dikilebilirlik gecitleri kalipta.
import { readFileSync, writeFileSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { noktaBeden } from '../draw/draw-cli.mjs';
import { png } from '../png.mjs';

const [set, ...secim] = process.argv.slice(2);
const kok = `output/${set}`;
const nolar = secim.length ? secim.map(Number) : readdirSync(kok).filter((d) => /^\d+$/.test(d)).map(Number).sort((a, b) => a - b);
const BODY = JSON.parse(readFileSync('law/1309-body.json', 'utf8'));
const G36 = BODY.bedenler.gercek36.landmarklar;
const ozet = [];
for (const no of nolar) {
  const d = `${kok}/${no}`;
  const kaynak = readFileSync(`${d}/kaynak-yolu.txt`, 'utf8').split('\n');
  const sha = kaynak[1].split(' ')[1];
  const okuma = JSON.parse(readFileSync(`KOSU/onbellek/siluet-${sha}.json`, 'utf8'));
  const eski = existsSync(`KOSU/onbellek/${sha}.json`) ? JSON.parse(readFileSync(`KOSU/onbellek/${sha}.json`, 'utf8')) : {};
  const taban = eski.tabanGraf || 'law/1309-base-graph.json';
  if (!existsSync(`${d}/ops-topoloji.json`)) copyFileSync(`${d}/ops.json`, `${d}/ops-topoloji.json`);
  const topo = JSON.parse(readFileSync(`${d}/ops-topoloji.json`, 'utf8'));
  const K = okuma.on.kontur, pt = (k) => noktaBeden(K[k], 'gercek36');
  const etekOrta = pt('etekOrta'), etekYan = pt('etekYan'), kalca = pt('kalca');
  // ORANLAR flat'ten (croquis36): flat genislikleri kaliba hedef (0-K.10.e); uzunluklar gercek36 landmark'larinda
  const cq = (k) => noktaBeden(K[k], 'croquis36'); const bel = cq('bel'), gogus = cq('gogus'), kalcaC = cq('kalca');
  let hemOffset = Math.round(etekOrta.y - G36['landmark.hip'].y);
  // MOTOR SINIRI (10 Eyl olculdu: 8 ve 11'de kendini_kesme + halka_kesit kalca): taban graf kalca halkasini tasir, etek ucu
  // kalcanin ustune cikamiyor. Flat'e dokunulmaz (siluet highHip'te biter); KALIP etek ucu kalcaya kirpilir ve yazilir.
  let hemKirpma = null;
  if (hemOffset < 0) { hemKirpma = `kalip etek ucu kalcaya kirpildi: siluet ${hemOffset} mm (kalcanin ustunde), motor kalca halkasiz kesemiyor`; hemOffset = 0; }
  const klos = Math.min(2, Math.max(1, etekYan.x / kalca.x));
  // topoloji op'larinda etek ucu / klos siluetten yazilir; kol etek ucu dokunulmaz
  const ops = topo.map((o) => JSON.parse(JSON.stringify(o)));
  const hemOps = ops.filter((o) => o.op === 'extendTo' && /^hem_(front|back)$/.test(o.args.edge));
  for (const o of hemOps) { o.args.yLandmark = 'landmark.hip'; o.args.yOffsetMM = hemOffset; }
  const flareOps = ops.filter((o) => o.op === 'flare' && /^hem_(front|back)$/.test(o.args.edge));
  for (const o of flareOps) o.args.factor = Number(klos.toFixed(3));
  if (!flareOps.length && klos > 1.05) for (const h of hemOps) ops.push({ op: 'flare', args: { panel: h.args.panel, edge: h.args.edge, factor: Number(klos.toFixed(3)) } });
  writeFileSync(`${d}/ops.json`, JSON.stringify(ops, null, 1) + '\n');
  // hedefler: genislik oranlari (flat'ten), motor bolluga cevirir; oturmayan giyside oran >= 1 -> bolluk ust sinira kirpilir (notes'ta)
  let hedefler = [
    { ring: 'girth.waist', ratioTo: 'girth.bust', ratio: Number((bel.x / gogus.x).toFixed(4)), kaynak: 'siluet-orani enGenis (siluet-v1 kontur bel/gogus, croquis36 = flat genisligi)' },
    { ring: 'girth.hip', ratioTo: 'girth.bust', ratio: Number((kalcaC.x / gogus.x).toFixed(4)), kaynak: 'siluet-orani enGenis (siluet-v1 kontur kalca/gogus)' },
  ];
  let r, dusen = [];
  for (let deneme = 0; deneme < 3; deneme++) {
    writeFileSync(`${d}/hedefler.json`, JSON.stringify(hedefler, null, 1) + '\n');
    r = spawnSync('engine/build/grafuygula', [taban, `${d}/ops.json`, '--id', `foto-${sha.slice(0, 8)}`, '--hedef', `${d}/hedefler.json`, '--beden', 'gercek36'], { encoding: 'utf8', maxBuffer: 64e6 });
    if (r.status === 0) break;
    const m = /hedef: hicbir panel (\S+) bollugu tasimiyor/.exec(r.stderr || '');
    if (m) { dusen.push(m[1]); hedefler = hedefler.filter((h) => h.ring !== m[1]); continue; }
    break;
  }
  const satir = { no, ilan: okuma.ilan, taban, hemOffsetMM: hemOffset, hemKirpma, klos: Number(klos.toFixed(3)), hedefler: hedefler.map((h) => `${h.ring}/${h.ratioTo}=${h.ratio}`), hedefDusen: dusen, motorExit: r.status };
  if (r.status !== 0) { satir.stderr = String(r.stderr || '').trim().split('\n').slice(-2).join(' | '); ozet.push(satir); continue; }
  writeFileSync(`${d}/graf.json`, r.stdout);
  satir.hedefSonuc = String(r.stderr || '').split('\n').filter((l) => l.startsWith('hedef: ')).map((l) => l.slice(7, 140));
  const c = spawnSync('engine/build/grafciz', [taban, '--ops', `${d}/ops.json`, '--hedef', `${d}/hedefler.json`, 'gercek36', 'kalip'], { encoding: 'utf8', maxBuffer: 64e6 });
  if (c.status !== 0) { satir.cizStderr = String(c.stderr || '').trim().split('\n').slice(-2).join(' | '); ozet.push(satir); continue; }
  writeFileSync(`${d}/kalip-36.svg`, c.stdout);
  const p = await png(`${d}/kalip-36.svg`, `${d}/kalip-36.png`, 900);
  satir.kalipPng = p.ok;
  // kaynak-yolu: cizim satiri artik siluet
  const yeni = kaynak.filter((l) => !/^(cizim|hedef|okuyan) /.test(l) && l.trim());
  yeni.push(`okuyan siluet-v1: ${okuma.okuyan}`);
  yeni.push(`cizim flat = src/draw/draw-cli.mjs (okuma KOSU/onbellek/siluet-${sha.slice(0, 12)}….json; motor flat'e girmez)`);
  if (hemKirpma) yeni.push(`KIRPMA ${hemKirpma}`);
  yeni.push(`kalip = ops-topoloji.json (${topo.length} op) + siluetten etek ucu/klos -> ops.json (${ops.length} op) + hedefler.json (${hedefler.length}) -> grafuygula/grafciz gercek36`);
  writeFileSync(`${d}/kaynak-yolu.txt`, yeni.join('\n') + '\n');
  ozet.push(satir);
}
console.log(JSON.stringify(ozet, null, 1));
if (ozet.some((o) => o.motorExit !== 0 || o.cizStderr)) process.exit(1);
