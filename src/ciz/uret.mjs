// src/ciz/uret.mjs — SILUET OKUMASI -> flat.svg/png (0-K.10). Kalip ayri: src/kalip/kalip.mjs.
//   node src/ciz/uret.mjs <set> [no...]     ör. node src/ciz/uret.mjs giris-3 1 3
// Girdi: cikti/<set>/<no>/kaynak-yolu.txt (fotograf + sha) -> KOSU/onbellek/siluet-<sha>.json (okuma)
// Cikti: cikti/<set>/<no>/flat.svg, flat.png, siluet.json (okumanin kopyasi), imza
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { ciz } from '../ciz/ciz-cli.mjs';
import { png } from '../png.mjs';

const [set, ...secim] = process.argv.slice(2);
const kok = `cikti/${set}`;
const nolar = secim.length ? secim.map(Number) : readdirSync(kok).filter((d) => /^\d+$/.test(d)).map(Number).sort((a, b) => a - b);
const ozet = [];
for (const no of nolar) {
  const d = `${kok}/${no}`;
  const kaynak = readFileSync(`${d}/kaynak-yolu.txt`, 'utf8').split('\n');
  const sha = (kaynak[1] || '').split(' ')[1];
  const okumaYol = `KOSU/onbellek/siluet-${sha}.json`;
  if (!existsSync(okumaYol)) { ozet.push({ no, hata: 'okuma yok: ' + okumaYol }); continue; }
  const okuma = JSON.parse(readFileSync(okumaYol, 'utf8'));
  const r = ciz(okuma);
  writeFileSync(`${d}/flat.svg`, r.svg);
  writeFileSync(`${d}/siluet.json`, JSON.stringify(okuma, null, 1) + '\n');
  const p = await png(`${d}/flat.svg`, `${d}/flat.png`, 900);
  ozet.push({ no, ilan: okuma.ilan, imza: r.imza.slice(0, 60) + '…', kirmizi: r.kirmizi, png: p.ok });
}
console.log(JSON.stringify(ozet, null, 1));
if (ozet.some((o) => o.hata || (o.kirmizi && o.kirmizi.length))) process.exit(1);
