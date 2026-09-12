// KOSU/0509-a3-kontak.mjs — 5 fotografin kontak sayfasi.
// YALNIZ flat + kalip; FOTOGRAF YOK (telifli, brief: "kontak ... fotograf yok").
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { png } from './0509-a3-png.mjs';

const N = [1, 2, 3, 4, 5];
const H = 300, W = 225, PAD = 14, BAS = 62;
const satirY = (i) => BAS + i * (H + 44);

const kutu = (x, y, w, h, svgYol, etiket) => {
  if (!existsSync(svgYol)) return `<text x="${x}" y="${y + h / 2}" font-size="11" fill="#b00">YOK: ${etiket}</text>`;
  let s = readFileSync(svgYol, 'utf8');
  const vb = /viewBox="([^"]+)"/.exec(s);
  const inner = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const [vx, vy, vw, vh] = vb ? vb[1].split(/\s+/).map(Number) : [0, 0, 1000, 1000];
  const k = Math.min(w / vw, h / vh);
  return `<g transform="translate(${x + (w - vw * k) / 2} ${y + (h - vh * k) / 2}) scale(${k}) translate(${-vx} ${-vy})">${inner}</g>`
       + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#ddd"/>`;
};

let g = '', y = BAS;
for (const n of N) {
  const d = `KOSU/ciktilar/giris/${n}`;
  const kaynak = existsSync(`${d}/kaynak-yolu.txt`) ? readFileSync(`${d}/kaynak-yolu.txt`, 'utf8').split('\n') : [];
  const ad = (kaynak[0] || '').split('/').pop();
  const arka = (kaynak.find((l) => l.startsWith('arka.koken')) || '').split(' ')[1] || '?';
  g += `<text x="${PAD}" y="${y - 8}" font-size="12" font-weight="600">${n}. ${ad}</text>`
     + `<text x="${PAD + 300}" y="${y - 8}" font-size="10" fill="#666">arka: ${arka}</text>`
     + kutu(PAD, y, W, H, `${d}/flat.svg`, `${n}/flat`)
     + kutu(PAD + W + 22, y, W * 1.7, H, `${d}/kalip-36.svg`, `${n}/kalip`)
     + `<text x="${PAD}" y="${y + H + 13}" font-size="9" fill="#888">flat (croquis36)</text>`
     + `<text x="${PAD + W + 22}" y="${y + H + 13}" font-size="9" fill="#888">kalip (gercek36)</text>`;
  y += H + 44;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="${y + 20}" viewBox="0 0 640 ${y + 20}">`
  + `<rect width="100%" height="100%" fill="#fff"/>`
  + `<text x="${PAD}" y="26" font-size="15" font-weight="700">A4 — bes fotograftan kalip ve flat (grafciz, croquis36 / gercek36)</text>`
  + `<text x="${PAD}" y="44" font-size="10" fill="#666">Fotograflar telifli, kontakta YOK. Her satir: solda flat, sagda kalip sayfasi.</text>`
  + g + `</svg>`;
writeFileSync('KOSU/ciktilar/giris/giris-foto-5.svg', svg);
const r = await png('KOSU/ciktilar/giris/giris-foto-5.svg', 'KOSU/ciktilar/giris/giris-foto-5.png', 1280);
console.log(JSON.stringify({ svg: 'KOSU/ciktilar/giris/giris-foto-5.svg', ...r }));
