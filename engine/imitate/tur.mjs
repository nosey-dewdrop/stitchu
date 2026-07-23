// ÖĞRENME DÖNGÜSÜ TUR SÜRÜCÜSÜ (2026-07-23, Damla emri: "103 hedefin üstünden geç, motor
// öğrensin, sonra öğrendiklerinle tekrar geç, daha iyi sonuç + yeni şeyler öğren, tekrar geç").
//
// TUR N: her hedefi (styleKey'i olan) taklit motorundan geçir → sapma + oturmuş param kaydet.
// Tur sonu RAPORU: ortalama sapma, en kötü hedefler, en çok tekrarlayan eksik-yetenek (bir
// sonraki turun motora ne ekleyeceğini söyler). Birikim engine/imitate/learned/ + tur-<N>.json.
//
// KULLANIM: node engine/imitate/tur.mjs [tur_no=1] [limit]

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { imitate } from './imitate.mjs';
import * as ref from '../flat-engine/_engine-full.mjs';

const HERE = new URL('.', import.meta.url).pathname;
const ROOT = HERE + '../../';

// hedef spec → motor styleKey (compile köprüsünün özet kopyası: bilinen aileler).
// Bilinmeyen = "styleKey yok" (o hedef bu turda atlanır, eksik-yetenek olarak sayılır).
function styleKeyFor(spec) {
  const s = spec || {};
  const nl = s.neckline, garment = s.garment, skirt = s.skirt || s.skirtStyle, shaping = s.shaping;
  const straps = s.straps, sleeve = s.sleeveStyle && s.sleeveStyle !== 'none';
  const circle = skirt === 'fullCircle' || skirt === 'halfCircle' || skirt === 'circle';
  const wrap = (s.closure && (s.closure.type === 'wrap' || s.closure === 'wrap')) || s.wrapFront;
  const tieBack = s.backDetail === 'tieBack' || (s.closure && s.closure.location === 'back');
  const strapType = (s.straps && (s.straps.type || s.straps)) || s.strapType;
  const gathered = skirt === 'gathered';
  if (garment === 'dress') {
    if (nl === 'boat' && tieBack) return 'dress_boat_aline_tieback';
    if (nl === 'vNeck' && wrap) return 'wrap_dress';
    if (nl === 'square' && shaping === 'princess' && circle) return 'dress_square_princess_circle';
    if (nl === 'boat' && shaping === 'princess' && circle) return 'dress_boat_princess_circle';
    if (nl === 'sweetheart' && shaping === 'princess' && circle && strapType === 'spaghetti') return 'dress_sweetheart_spag_circle';
    if (nl === 'sweetheart' && shaping === 'princess' && circle) return 'dress_sweetheart_princess_circle';
    if (nl === 'vNeck' && gathered && sleeve) return 'dress_vneck_gathered';
    if ((nl === 'scoop' || nl === 'crew') && shaping === 'princess') return s.length === 'midi' ? 'dress_princess_scoop_aline_midi' : 'dress_princess_scoop_aline';
  }
  return null;
}

// EN YAKIN STİL (2026-07-23, Damla: "her turda tümünü dene"). styleKey bulunamayan hedef
// ATLANMAZ — en yakın mevcut stille denenir ki motor ondan öğrensin (atlamak = öğrenmemek).
// Yakınlık: garment + neckline/shaping ipuçlarıyla kaba eşleşme; hiçbiri yoksa garment tabanı.
function nearestStyle(spec) {
  const s = spec || {}, g = s.garment, nl = s.neckline;
  const keys = Object.keys(ref.STYLE).filter(k => !k.startsWith('_'));
  const cands = keys.map(k => ({ k, st: ref.STYLE[k] }));
  // aynı garment
  let pool = cands.filter(c => c.st.garment === g);
  if (!pool.length) pool = cands;
  // neckline eşleşmesi öncelikli
  const nlMatch = pool.filter(c => c.st.neckline === nl || (nl === 'vNeck' && c.st.neckline === 'v'));
  if (nlMatch.length) return nlMatch[0].k;
  return pool[0].k;
}

const turNo = +(process.argv[2] || 1);
const limit = process.argv[3] ? +process.argv[3] : Infinity;

const targets = JSON.parse(readFileSync(ROOT + 'contract/hedef-giysiler.json')).targets;
const results = [];
let done = 0;
for (const t of targets) {
  if (done >= limit) break;
  // örnek crop
  let crop = null;
  for (const c of (t.crops || [])) { const p = ROOT + 'design_patterns/crops/' + c.replace('-alt', ''); if (existsSync(p)) { crop = p; break; } }
  if (!crop) { results.push({ id: t.id, sapma: null, sebep: 'crop-yok' }); continue; }
  // TÜMÜNÜ DENE: tam styleKey yoksa en yakın stile düş (atlama yok)
  let style = styleKeyFor(t.spec), yakin = false;
  if (!style || !ref.STYLE[style]) { style = nearestStyle(t.spec); yakin = true; }
  done++;
  try {
    const r = imitate(style, crop, 16);
    results.push({ id: t.id, style, yakin, sapma: +(r.err * 100).toFixed(2), ok: r.ok });
    process.stdout.write(`id${t.id} ${style}${yakin ? '~' : ''}: %${(r.err * 100).toFixed(2)}${r.ok ? ' ✓' : ''}\n`);
  } catch (e) {
    results.push({ id: t.id, style, sapma: null, sebep: 'hata:' + e.message });
  }
}

// TUR RAPORU
const measured = results.filter(r => r.sapma != null);
const avg = measured.reduce((s, r) => s + r.sapma, 0) / (measured.length || 1);
const worst = measured.slice().sort((a, b) => b.sapma - a.sapma).slice(0, 8);
const passed = measured.filter(r => r.ok).length;
const skipped = results.filter(r => r.sapma == null);
const eksikStyle = {}; for (const r of skipped) eksikStyle[r.sebep] = (eksikStyle[r.sebep] || 0) + 1;

const yakinCount = measured.filter(r => r.yakin).length;   // en yakın stille denenen (gerçek stili eksik)
const rapor = {
  tur: turNo, ts: '2026-07-23',
  olculdu: measured.length, gecti_1pct: passed,
  ortalama_sapma: +avg.toFixed(2),
  en_yakinla_denenen: yakinCount,   // bu kadar hedefin GERÇEK stili eksik → sonraki tur motora bunları ekle
  en_kotu: worst.map(r => ({ id: r.id, style: r.style, yakin: r.yakin, sapma: r.sapma })),
  atlanan: eksikStyle,
  hepsi: results,
};
writeFileSync(HERE + `tur-${turNo}.json`, JSON.stringify(rapor, null, 1));
console.log('\n=== TUR ' + turNo + ' RAPORU ===');
console.log('ölçüldü:', measured.length, '| %1 geçen:', passed, '| ortalama sapma: %' + avg.toFixed(2));
console.log('en kötü 3:', worst.slice(0, 3).map(r => `id${r.id}(%${r.sapma})`).join(' '));
console.log('atlanan:', JSON.stringify(eksikStyle));
console.log('rapor: engine/imitate/tur-' + turNo + '.json');
