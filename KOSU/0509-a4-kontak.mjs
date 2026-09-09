// KOSU/0509-a4-kontak.mjs — A4 kontak: her teslimin YENI flat'i (on+arka) EMSAL flat'in (GIRDI/iyi-flat 13, deer-and-doe
// Mica, KOSU/ciktilar/flat-secim.md) yaninda, AYNI OLCEKTE ve BEL HIZALI. Olcek: emsalin omuz cizgisi -> bel mesafesi
// (px, flat-olcum.json + bu dosyadaki omuz satiri olcumu) = bizim croquis36 omuz->bel (mm). Sag sutunda mm farki
// tablosu: emsal yari-genislik (bizim mm olcegimize cevrilmis) vs croquis36 yari-genislik vs cizilen giysi yari-genisligi.
// Fotograf YOK (telifli). Kullanim: node KOSU/0509-a4-kontak.mjs [tur]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { png } from './0509-a3-png.mjs';

const tur = process.argv[2] || 'x';
const N = [1, 2, 3, 4, 5];
const olcum = JSON.parse(readFileSync('KOSU/ciktilar/flat-olcum.json', 'utf8')).flatler;

// EMSAL 13: 2188x2918 px; ust yari (y<1459) = gorunum A on+arka. Omuz cizgisi (yaka ust kenari) y=104 px, omuz ucu y=136 x=423/679
// (bu dosyanin olcumu, 2026-09-09: sutun ilk murekkep satiri; flat-olcum.py olcmuyor). Bel/gogus satiri flat-olcum.json'dan.
const E = { dosya: 'GIRDI/iyi-flat/adaylar/13-yuksek-bel-a-line.png', W: 2188, H: 2918, ustYari: 1459,
            omuzY: 104, omuzUcY: 136, omuzUcYarimPX: (679 - 423) / 2, merkezX: 551,
            belY: olcum['13-yuksek-bel-a-line.png'].bel.satirY, belYarimPX: olcum['13-yuksek-bel-a-line.png'].bel.genislikPX / 2,
            gogusY: olcum['13-yuksek-bel-a-line.png'].gogus.satirY, gogusYarimPX: olcum['13-yuksek-bel-a-line.png'].gogus.genislikPX / 2 };

// ---- SVG okuma ----------------------------------------------------------------
const attrs = (tag) => { const o = {}; for (const m of tag.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)) o[m[1]] = m[2]; return o; };
function toPolyline(d) {
  const tok = d.match(/[MLCZmlcz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const pts = []; let i = 0, cur = [0, 0], cmd = null; const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/^[MLCZ]$/i.test(tok[i])) { cmd = tok[i++]; if (/z/i.test(cmd)) { pts.push(null); continue; } }
    if (cmd === 'M') { cur = [num(), num()]; pts.push(null); pts.push(cur); }
    else if (cmd === 'L') { cur = [num(), num()]; pts.push(cur); }
    else if (cmd === 'C') { const p0 = cur, c1 = [num(), num()], c2 = [num(), num()], p3 = [num(), num()];
      for (let k = 1; k <= 16; k++) { const t = k / 16, u = 1 - t; pts.push([u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p3[0], u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p3[1]]); }
      cur = p3; }
    else i++;
  }
  return pts;
}
function halfWidthAt(pts, y) {
  let best = null;
  for (let k = 1; k < pts.length; k++) {
    const a = pts[k - 1], b = pts[k]; if (!a || !b) continue;
    if ((a[1] - y) * (b[1] - y) > 0) continue;
    const x = a[1] === b[1] ? Math.max(Math.abs(a[0]), Math.abs(b[0])) : Math.abs(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
    best = best == null ? x : Math.max(best, x);
  }
  return best;
}
function oku(svgYol) {
  const s = readFileSync(svgYol, 'utf8');
  const vb = /viewBox="([^"]+)"/.exec(s)[1].split(/\s+/).map(Number);
  const on = /<g data-view="front"[^>]*transform="translate\(([-\d.]+) 0\)">/.exec(s);
  const sil = [...s.matchAll(/<path\b[^>]*>/g)].map((m) => attrs(m[0])).find((a) => a['data-rol'] === 'siluet' && a['data-view'] === 'front');
  // on gorunumun kalin (outline) kenarlari: siluet olcumu icin
  const outlineBlok = /<g id="outline"[\s\S]*?<\/g>\s*<\/g>/.exec(s)?.[0] || '';
  const onBlok = /<g data-view="front"[\s\S]*?<\/g>/.exec(outlineBlok)?.[0] || '';
  const giysi = [...onBlok.matchAll(/<path\b[^>]*>/g)].map((m) => attrs(m[0])).filter((a) => a['data-panel'] !== 'kol').flatMap((a) => [null, ...toPolyline(a.d)]);
  return { vb, onDX: on ? parseFloat(on[1]) : 0, sil, giysi, inner: s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '') };
}

// ---- yerlesim -------------------------------------------------------------------
const ROW = 440, PAD = 16, BAS = 70, SOL = 360, EMSAL_W = 660, TAB_X = 360 + EMSAL_W + 30, W = TAB_X + 470;
const EMSAL_B64 = readFileSync(E.dosya).toString('base64');   // png() svg'yi gecici dizine kopyalar, yerel href kopar
const kE = ROW / E.ustYari;                              // emsal px -> kontak px
const mmPerEmsalPX = 390 / (E.belY - E.omuzY);            // croquis36 omuz->bel 390 mm  == emsal (517-104) px
let g = '', bulgular = [];
for (const [i, n] of N.entries()) {
  const d = `KOSU/ciktilar/giris/${n}`, y0 = BAS + i * (ROW + 40);
  const svgYol = `${d}/flat.svg`;
  if (!existsSync(svgYol)) { g += `<text x="${PAD}" y="${y0 + 20}" fill="#b00">YOK: ${svgYol}</text>`; continue; }
  const f = oku(svgYol);
  const ad = (readFileSync(`${d}/kaynak-yolu.txt`, 'utf8').split('\n')[0] || '').split('/').pop();
  const belMM = parseFloat(f.sil['data-manken-bel-y']), gogusMM = parseFloat(f.sil['data-manken-bust-y']);
  const kO = kE / mmPerEmsalPX;                            // mm -> kontak px (emsalle ayni olcek)
  // bel hizasi: bizim bel y'si emsalin bel satiriyla ayni kontak y'sinde
  const emsalBelPX = y0 + E.belY * kE;
  const ty = emsalBelPX - belMM * kO;
  // bizim flat: viewBox x'i SOL sutuna sigacak sekilde ortala
  const tx = PAD + (SOL - PAD - f.vb[2] * kO) / 2 - f.vb[0] * kO;
  g += `<g transform="translate(${tx} ${ty}) scale(${kO})">${f.inner}</g>`;
  // emsal (ust yari)
  g += `<clipPath id="c${n}"><rect x="${SOL}" y="${y0}" width="${EMSAL_W}" height="${ROW}"/></clipPath>`
     + `<image clip-path="url(#c${n})" x="${SOL}" y="${y0}" width="${E.W * kE}" height="${E.H * kE}" href="data:image/png;base64,${EMSAL_B64}"/>`;
  // hiza cizgileri: bel (kalin) ve gogus (ince) — iki sutunu da keser
  for (const [yy, ad2, w] of [[emsalBelPX, 'bel', 0.8], [y0 + E.gogusY * kE, 'gogus (emsal)', 0.4], [ty + gogusMM * kO, 'gogus (croquis36)', 0.4]])
    g += `<line x1="${PAD}" y1="${yy}" x2="${SOL + EMSAL_W}" y2="${yy}" stroke="#c33" stroke-width="${w}" stroke-dasharray="6 4"/><text x="${SOL + EMSAL_W - 4}" y="${yy - 3}" font-size="8" fill="#c33" text-anchor="end">${ad2}</text>`;
  // sayilar (mm, bizim olcekte)
  const em = { gogus: E.gogusYarimPX * mmPerEmsalPX, bel: E.belYarimPX * mmPerEmsalPX, omuzUc: E.omuzUcYarimPX * mmPerEmsalPX,
               gogusY: (E.gogusY - E.omuzY) * mmPerEmsalPX, belY: 390, omuzUcY: (E.omuzUcY - E.omuzY) * mmPerEmsalPX };
  const cr = { gogus: halfWidthAt(toPolyline(f.sil.d), gogusMM), bel: parseFloat(f.sil['data-manken-bel-yarim-mm']),
               omuzUc: parseFloat(f.sil['data-omuz-uc'].split(' ')[0]), gogusY: gogusMM, belY: belMM, omuzUcY: parseFloat(f.sil['data-omuz-uc'].split(' ')[1]) };
  const gi = { gogus: halfWidthAt(f.giysi, gogusMM), bel: halfWidthAt(f.giysi, belMM) };
  const satir = [['gogus yarim', em.gogus, cr.gogus, gi.gogus], ['bel yarim', em.bel, cr.bel, gi.bel], ['omuz ucu x (13 cut-in, askı kenarı!)', em.omuzUc, cr.omuzUc, null],
                 ['omuz->gogus y', em.gogusY, cr.gogusY, null], ['omuz->bel y', em.belY, cr.belY, null], ['omuz->omuz ucu y', em.omuzUcY, cr.omuzUcY, null]];
  const f1 = (v) => (v == null || Number.isNaN(v) ? '—' : v.toFixed(0));
  g += `<text x="${TAB_X}" y="${y0 + 14}" font-size="11" font-weight="600">mm (emsal 13 bizim olcege: ${mmPerEmsalPX.toFixed(3)} mm/px)</text>`
     + `<text x="${TAB_X}" y="${y0 + 30}" font-size="9" fill="#666">kalem | emsal | croquis36 | giysi (cizim) | croquis-emsal</text>`;
  satir.forEach(([k, e, c, gg], j) => {
    g += `<text x="${TAB_X}" y="${y0 + 46 + j * 14}" font-size="9" font-family="monospace">${k.padEnd(30)} ${f1(e).padStart(5)} ${f1(c).padStart(6)} ${f1(gg).padStart(6)}  ${(c - e >= 0 ? '+' : '') + f1(c - e)}</text>`;
  });
  if (i === 0) bulgular = satir.map(([k, e, c]) => `${k}: emsal ${f1(e)} / croquis36 ${f1(c)} / fark ${(c - e >= 0 ? '+' : '') + f1(c - e)} mm`);
  g += `<text x="${PAD}" y="${y0 - 6}" font-size="12" font-weight="600">${n}. ${ad}</text>`
     + `<text x="${SOL}" y="${y0 - 6}" font-size="10" fill="#666">emsal: deer-and-doe Mica (13), gorunum A, ayni olcek, bel hizali</text>`
     + `<rect x="${PAD}" y="${y0}" width="${SOL - PAD - 6}" height="${ROW}" fill="none" stroke="#ddd"/>`;
}
const H = BAS + N.length * (ROW + 40);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
  + `<rect width="100%" height="100%" fill="#fff"/>`
  + `<text x="${PAD}" y="26" font-size="15" font-weight="700">A4 tur ${tur} — yeni flat (croquis36) vs emsal 13, ayni olcek, bel hizali</text>`
  + `<text x="${PAD}" y="44" font-size="10" fill="#666">Solda grafciz flat (on+arka), ortada emsal, sagda mm tablosu. Kirmizi kesikli: bel (kalin) ve gogus (ince) hizalari. Fotograf yok (telifli).</text>`
  + g + `</svg>`;
const cikis = `KOSU/ciktilar/giris/a4-kontak-tur${tur}`;
writeFileSync(`${cikis}.svg`, svg);
// href yerel dosya: png icin mutlak yol
const r = await png(`${cikis}.svg`, `${cikis}.png`, 1500, Math.round(H * 1500 / W));
console.log(JSON.stringify({ svg: `${cikis}.svg`, png: `${cikis}.png`, ...r, bulgular }, null, 1));
