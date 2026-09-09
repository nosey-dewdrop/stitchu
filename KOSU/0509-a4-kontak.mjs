// KOSU/0509-a4-kontak.mjs — A4 KONTAK (0-K madde 4, 2026-09-09, bastan yazildi; eski surum emsal 13'e bagliydi, emsal silindi).
// Satir = bir ilan: ILAN EKRAN GORUNTUSU (fotograf + saticinin flat'i) | BIZIM FLAT (croquis36, on+arka) | KALIP (gercek36)
//   | op sayisi | croquis36 sayilari | gercek36 sayilari | dogrulayici kirmizisi.
// Sayilar OLCULUR, yazilmaz: halka toplamlari grafdogrula --json (halkalar[].toplamMM) iki bedende ayri; beden landmark'lari
// engine/build/body_check dump. Gorseller teslim dizinindeki png'ler (flat.png / kalip-36.png) ve GIRDI ekran goruntusu.
// Kullanim: node KOSU/0509-a4-kontak.mjs <set-dizini> <tur> [no...]   ör. node KOSU/0509-a4-kontak.mjs giris-3 6
// Cikti: KOSU/ciktilar/<set>/a4-kontak-tur<tur>.png (+ .json ozet; ara svg silinir)
import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { png } from './0509-a3-png.mjs';

const [set, tur, ...secim] = process.argv.slice(2);
if (!set || !tur) { console.error('kullanim: node KOSU/0509-a4-kontak.mjs <set-dizini> <tur> [no...]'); process.exit(2); }
const kok = `KOSU/ciktilar/${set}`;
const nolar = secim.length ? secim.map(Number) : readdirSync(kok).filter((d) => /^\d+$/.test(d)).map(Number).sort((a, b) => a - b);

const b64 = (p) => 'data:image/png;base64,' + readFileSync(p).toString('base64');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function pngBoyut(p) {   // IHDR
  const b = readFileSync(p); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function halkalar(grafYol, beden) {
  const r = spawnSync('engine/build/grafdogrula', [grafYol, beden, '--json'], { encoding: 'utf8', maxBuffer: 64e6 });
  let j; try { j = JSON.parse(r.stdout); } catch { return { hata: 'grafdogrula JSON okunamadi', kirmizi: null, h: {} }; }
  const h = {};
  for (const x of j.halkalar || []) h[x.ring] = x.toplamMM;
  return { kirmizi: j.kirmizi, h, fail: (j.hukumler || []).filter((x) => !x.gecti && !x.bilgi).map((x) => `${x.kural}:${x.hedef}`) };
}
// beden landmark'lari contract/body-v1.json bedenler.<id>.landmarklar (body_check dump yalniz croquis36'yi basar, 2026-09-09 olculdu)
const BODY = JSON.parse(readFileSync('contract/body-v1.json', 'utf8'));
const beden = (id) => (BODY.bedenler && BODY.bedenler[id]) ? BODY.bedenler[id] : null;
const B = { croquis36: beden('croquis36'), gercek36: beden('gercek36') };
const lm = (b, k) => (b && b.landmarklar && b.landmarklar[k]) ? [b.landmarklar[k].x, b.landmarklar[k].y] : [NaN, NaN];
const f0 = (v) => (v == null || !(v === v)) ? '-' : v.toFixed(0);

// ---- satirlar
const ROW_H = 520, COL = { ilan: 620, flat: 640, kalip: 520, metin: 560 }, PAD = 16;
const W = COL.ilan + COL.flat + COL.kalip + COL.metin + PAD * 5;
const H = 120 + nolar.length * (ROW_H + PAD);
let s = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">\n`;
s += `<rect width="${W}" height="${H}" fill="#fff"/>\n`;
s += `<text x="${PAD}" y="40" font-size="28" font-weight="bold">A4 kontak — ${esc(set)} tur ${esc(tur)} — ${new Date().toISOString().slice(0, 10)}</text>\n`;
s += `<text x="${PAD}" y="72" font-size="16" fill="#444">sutunlar: ilan (fotograf + saticinin flat'i, GIRDI/hedef-fotograflar-3) | bizim flat (croquis36 = manken 90-60-90/178, on+arka) | kalip (gercek36) | sayilar (op, halka toplamlari mm iki bedende, dogrulayici)</text>\n`;
s += `<text x="${PAD}" y="96" font-size="16" fill="#444">croquis36 landmark yarim genislik: gogus ${f0(lm(B.croquis36, 'landmark.bustLine')[0])} / bel ${f0(lm(B.croquis36, 'landmark.waist')[0])} / kalca ${f0(lm(B.croquis36, 'landmark.hip')[0])} mm, omuz->bel ${f0(lm(B.croquis36, 'landmark.waist')[1])} mm · gercek36: gogus ${f0(lm(B.gercek36, 'landmark.bustLine')[0])} / bel ${f0(lm(B.gercek36, 'landmark.waist')[0])} / kalca ${f0(lm(B.gercek36, 'landmark.hip')[0])} mm, omuz->bel ${f0(lm(B.gercek36, 'landmark.waist')[1])} mm</text>\n`;

const ozet = [];
nolar.forEach((no, i) => {
  const d = `${kok}/${no}`;
  const y0 = 120 + i * (ROW_H + PAD);
  const kaynak = existsSync(`${d}/kaynak-yolu.txt`) ? readFileSync(`${d}/kaynak-yolu.txt`, 'utf8').split('\n') : [];
  const ilanYol = kaynak[0] || '';
  const okuma = existsSync(`${d}/ops.json`) ? JSON.parse(readFileSync(`${d}/ops.json`, 'utf8')) : [];
  const dikil = existsSync(`${d}/dikilebilir.md`) ? readFileSync(`${d}/dikilebilir.md`, 'utf8') : '';
  const ad = (dikil.match(/^# .*$/m) || [''])[0].replace(/^# \d+\. /, '');
  const ilanAd = (() => { try { const sha = (kaynak[1] || '').split(' ')[1]; const o = JSON.parse(readFileSync(`KOSU/onbellek/${sha}.json`, 'utf8')); return o.ilan || ''; } catch { return ''; } })();
  let x = PAD;
  const img = (yol, w) => {
    if (!yol || !existsSync(yol)) { s += `<rect x="${x}" y="${y0}" width="${w}" height="${ROW_H}" fill="#f6f6f6" stroke="#ccc"/><text x="${x + 10}" y="${y0 + 30}" font-size="14" fill="#c00">YOK: ${esc(yol)}</text>\n`; x += w + PAD; return; }
    const { w: iw, h: ih } = pngBoyut(yol); const k = Math.min(w / iw, ROW_H / ih);
    s += `<image x="${x}" y="${y0}" width="${(iw * k).toFixed(1)}" height="${(ih * k).toFixed(1)}" xlink:href="${b64(yol)}"/>\n`;
    x += w + PAD;
  };
  img(ilanYol, COL.ilan);
  img(`${d}/flat.png`, COL.flat);
  img(`${d}/kalip-36.png`, COL.kalip);
  // sayilar
  const hc = existsSync(`${d}/graf.json`) ? halkalar(`${d}/graf.json`, 'croquis36') : { h: {}, kirmizi: null, fail: [] };
  const hg = existsSync(`${d}/graf.json`) ? halkalar(`${d}/graf.json`, 'gercek36') : { h: {}, kirmizi: null, fail: [] };
  const sat = [
    [`${no}. ${ilanAd || ad}`, 18, '#000', true],
    [`ilan: ${ilanYol.split('/').pop()}`, 13, '#444'],
    [`op sayisi: ${okuma.length} (${[...new Set(okuma.map((o) => o.op))].join(', ')})`, 13, '#000'],
    ['', 8],
    ['halka toplamlari (dikilen, mm)      croquis36   gercek36', 13, '#000', true],
    ...['gogus_halka', 'bel_halka', 'kalca_halka', 'etek_ucu', 'yaka', 'kol_oyugu_halka'].map((r) => [`${r.padEnd(22, ' ')} ${f0(hc.h[r]).padStart(8, ' ')}   ${f0(hg.h[r]).padStart(8, ' ')}`, 13, '#000']),
    ['', 8],
    [`dogrulayici gercek36 kirmizi: ${hg.kirmizi == null ? '-' : hg.kirmizi}${hg.fail?.length ? ' (' + hg.fail.join('; ') + ')' : ''}`, 13, hg.kirmizi ? '#c00' : '#060'],
    [`dogrulayici croquis36 kirmizi: ${hc.kirmizi == null ? '-' : hc.kirmizi}${hc.fail?.length ? ' (' + hc.fail.join('; ') + ')' : ''}`, 13, hc.kirmizi ? '#c00' : '#060'],
  ];
  let ty = y0 + 24;
  for (const [t, fs, col, bold] of sat) {
    if (t) s += `<text x="${x}" y="${ty}" font-size="${fs}" fill="${col || '#000'}"${bold ? ' font-weight="bold"' : ''} xml:space="preserve" font-family="${/halka|gogus_|bel_|kalca_|etek_|yaka|kol_/.test(t) && !bold ? 'Menlo, monospace' : 'Helvetica, Arial, sans-serif'}">${esc(t.length > 78 ? t.slice(0, 77) + '…' : t)}</text>\n`;
    ty += fs + 6;
  }
  s += `<line x1="${PAD}" y1="${y0 + ROW_H + PAD / 2}" x2="${W - PAD}" y2="${y0 + ROW_H + PAD / 2}" stroke="#ddd"/>\n`;
  ozet.push({ no, ilan: ilanAd || ad, op: okuma.length, kirmiziGercek: hg.kirmizi, kirmiziCroquis: hc.kirmizi, fail: hg.fail, halka: { croquis36: hc.h, gercek36: hg.h } });
});
s += '</svg>\n';
const svgYol = `${kok}/a4-kontak-tur${tur}.svg`, pngYol = `${kok}/a4-kontak-tur${tur}.png`;
writeFileSync(svgYol, s);
const p = await png(svgYol, pngYol, 1600, Math.round(1600 * H / W));
if (p.ok) unlinkSync(svgYol);   // svg base64 gomulu png'lerle 30 MB (2026-09-09 olculdu): repoya png girer, svg ara urun
writeFileSync(`${kok}/a4-kontak-tur${tur}.json`, JSON.stringify(ozet, null, 1) + '\n');
console.log(JSON.stringify({ svg: svgYol, png: pngYol, pngOk: p.ok, satir: nolar.length, ozet: ozet.map((o) => `${o.no}: op ${o.op}, kirmizi g36 ${o.kirmiziGercek}` ) }, null, 1));
