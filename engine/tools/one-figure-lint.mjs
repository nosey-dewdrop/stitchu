// ============================================================================
// ONE-FIGURE LINT (2026-08-05). Damla'nın tek sorusu: "31 flatin 31'i de aynı
// kişinin üstünde mi duruyor?" Bu mandal ona SAYIYLA cevap verir.
//
// Yöntem: her stilin ÇİZİLMİŞ gövde konturundan (SVG <path class="body">) figür
// landmark'ları okunur — omuz ucu, koltukaltı, bel (ve bel yüksekliği). İddia
// değil ölçüm: motorun ne hesapladığına değil, ekrana ne bastığına bakılır.
//
// Sınıflar:
//   omuzlu (shoulder) → omuz ucu + koltukaltı + bel, üçü de TEK figür olmalı
//   band (strapless)  → omzu yok; koltukaltı + bel ölçülür
//   boxy              → bel KASITLI farklı (kutu), sadece omuz/koltukaltı bağlanır
// Tolerans 1.0px: aynı croquis'ten çizilen iki flat arasındaki fark ancak
// örnekleme gürültüsü kadar olabilir.
// ============================================================================
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderGarmentFlatAsync } from './render-garment-flat.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ST = JSON.parse(readFileSync(join(root, 'engine/flat-engine/styles.json'), 'utf8')).styles;
const TOL = 1.0;
const CX = 240;

function parsePath(d) {
  const toks = d.match(/[MCLQZ]|-?\d+\.?\d*/g) || [];
  const segs = []; let i = 0, cur = [0, 0], start = [0, 0];
  while (i < toks.length) {
    const t = toks[i++];
    if (t === 'M') { cur = [+toks[i++], +toks[i++]]; start = cur.slice(); }
    else if (t === 'L') { const p = [+toks[i++], +toks[i++]]; segs.push([cur, p, p, p]); cur = p; }
    else if (t === 'C') { const c1 = [+toks[i++], +toks[i++]], c2 = [+toks[i++], +toks[i++]], p = [+toks[i++], +toks[i++]]; segs.push([cur, c1, c2, p]); cur = p; }
    else if (t === 'Q') { const c = [+toks[i++], +toks[i++]], p = [+toks[i++], +toks[i++]]; segs.push([cur, c, c, p]); cur = p; }
    else if (t === 'Z') { segs.push([cur, start, start, start]); cur = start.slice(); }
  }
  return segs;
}
const bez = (s, t) => { const u = 1 - t; return [
  u*u*u*s[0][0] + 3*u*u*t*s[1][0] + 3*u*t*t*s[2][0] + t*t*t*s[3][0],
  u*u*u*s[0][1] + 3*u*u*t*s[1][1] + 3*u*t*t*s[2][1] + t*t*t*s[3][1]]; };

// sağ yarı profil: 1px'lik y kutularında en dıştaki x. Yoğun örnekleme şart —
// seyrek örneklemede bir kutuya sadece YAKA eğrisinden nokta düşüyor ve yaka
// dibi "bel" sanılıyordu (ilk koşuda 1.9px'lik saçma beller bu yüzden çıktı).
function profile(segs) {
  const byY = new Map();
  for (const s of segs) for (let k = 0; k <= 400; k++) {
    const [x, y] = bez(s, k / 400);
    if (x < CX - 0.5) continue;
    const key = Math.round(y);
    if (!byY.has(key) || byY.get(key) < x) byY.set(key, x);
  }
  return [...byY.entries()].map(([y, x]) => ({ y, w: x - CX })).sort((a, b) => a.y - b.y);
}
const wAt = (prof, y) => { let b = null; for (const p of prof) if (b === null || Math.abs(p.y - y) < Math.abs(b.y - y)) b = p; return b; };

async function landmarks(key) {
  const svg = await renderGarmentFlatAsync(null, { referenceStyle: key });
  const m = svg.match(/<path class="body" d="([^"]+)"/);
  if (!m) return null;
  const prof = profile(parsePath(m[1]));
  if (prof.length < 20) return null;
  const y0 = prof[0].y, H = prof[prof.length - 1].y - y0;
  // omuz ucu: üst %25'teki en geniş nokta
  const upper = prof.filter((p) => p.y <= y0 + H * 0.25);
  const shoulder = upper.reduce((a, b) => (b.w > a.w ? b : a), upper[0]);
  // bel = omuzdan aşağı inerken kontur DARALMAYI BIRAKIP genişlemeye başladığı
  // ilk nokta. Global minimum kullanılamaz: eteğin dalgalı ucu CF'ye dönerken
  // belden dar y'lerden geçiyor ve minimumu oraya kaçırıyor (ilk koşuda bütün
  // elbiselerin beli y=361'de, yani etek ucunda okunmuştu).
  const mid = prof.filter((p) => p.y > shoulder.y + 10 && p.w > 10);
  if (!mid.length) return null;
  let waist = mid[0], prev = mid[0];
  for (const p of mid) {
    if (prev.w - p.w > 3) break;                // 1px'te 3px daralma = YATAY kenar (etek/peplum ucu), yan hat değil
    if (p.w < waist.w) waist = p;
    else if (p.w > waist.w + 3) break;          // kalıcı genişleme = bel geçildi
    prev = p;
  }
  return { shoulder, waist, prof };
}

const rows = [];
for (const key of Object.keys(ST)) {
  const L = await landmarks(key);
  if (!L) { console.log(`  skip ${key} (gövde konturu yok)`); continue; }
  rows.push({ key, st: ST[key], ...L });
}
// KOLTUKALTI KESİTİ MUTLAK YÜKSEKLİKTE ALINIR. Straplez bir üstün "omzu" band'in
// üst kenarıdır, figürün omzu değil; kesit stil-göreli alınırsa band ailesi farklı
// yükseklikten ölçülür ve fark FİGÜR farkı sanılır. Aynı gövdenin üstündeyseler
// AYNI MUTLAK y'de aynı genişlikte olmalılar — test edilen cümle bu.
const shoulderFam0 = rows.filter((r) => r.st.top !== 'band');
const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
const refSh = med(shoulderFam0.map((r) => r.shoulder.y));
const refWa = med(shoulderFam0.map((r) => r.waist.y));
const armpitY = refSh + 0.5692 * (refWa - refSh);   // şablon: koltukaltı torso'nun %56.9'unda
for (const r of rows) r.armpit = wAt(r.prof, armpitY);

function spread(list, pick) {
  const v = list.map(pick).filter((x) => x != null);
  return v.length ? { lo: Math.min(...v), hi: Math.max(...v), d: Math.max(...v) - Math.min(...v) } : null;
}
// İKİ KASITLI İSTİSNA (ikisi de styles.json'da bayrakla ilan edilmiş, gizli değil):
//   boxy       → bel çekmesi YOK, kutu siluet (2 stil)
//   fittedBand → korse gövde, straplez band gövdeyi büst hattında sıkar (1 stil)
// Bunların dışında hiçbir stilin kendi vücudu olamaz.
const shoulderFam = rows.filter((r) => r.st.top !== 'band');
const nonBoxy = rows.filter((r) => !r.st.boxy);
const bodyFam = rows.filter((r) => !r.st.fittedBand);

const checks = [
  ['omuz ucu yarı genişliği (omuzlu aile)',  spread(shoulderFam, (r) => +r.shoulder.w.toFixed(2))],
  ['koltukaltı yarı genişliği (korse hariç)', spread(bodyFam,    (r) => r.armpit && +r.armpit.w.toFixed(2))],
  ['bel yarı genişliği (boxy hariç)',         spread(nonBoxy,    (r) => +r.waist.w.toFixed(2))],
  ['bel YÜKSEKLİĞİ y (boxy hariç)',           spread(nonBoxy,    (r) => +r.waist.y.toFixed(2))],
  ['bel yarı genişliği (boxy kendi içinde)',  spread(rows.filter((r) => r.st.boxy), (r) => +r.waist.w.toFixed(2))],
];

let fails = 0;
console.log('\n  stil                                    omuz   koltukaltı   bel     bel-y');
for (const r of rows) {
  console.log('  ' + r.key.padEnd(38) +
    r.shoulder.w.toFixed(1).padStart(6) +
    (r.armpit ? r.armpit.w.toFixed(1) : '   —').padStart(12) +
    r.waist.w.toFixed(1).padStart(8) + r.waist.y.toFixed(1).padStart(9) +
    (r.st.boxy ? '   (boxy)' : r.st.top === 'band' ? '   (band)' : ''));
}
console.log('');
for (const [label, s] of checks) {
  if (!s) continue;
  const ok = s.d <= TOL;
  if (!ok) fails++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(38)} yayılım ${s.d.toFixed(2)}px  [${s.lo.toFixed(1)} .. ${s.hi.toFixed(1)}]`);
}
if (fails) { console.error(`\none-figure-lint: ${fails} landmark tek figürde DEĞİL (tolerans ${TOL}px)`); process.exit(1); }
console.log(`\nOK one-figure-lint: ${rows.length} flatin hepsi aynı croquis'in üstünde (tüm landmark yayılımları ≤ ${TOL}px)`);
