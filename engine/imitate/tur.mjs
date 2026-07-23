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

// ADAY HAVUZU (deneyip-ölçen router için): hedefe öznitelik-benzerliğiyle en yakın K stili
// döndürür. Tam styleKey varsa BAŞA konur. Havuz DAR (≤maxK) tutulur ki tur hızlı kalsın —
// benzerlik daraltır, ölçüm seçer. Öznitelik ağırlıkları: garment > neckline > shaping > skirt.
function candidateStyles(spec, exact, maxK = 4) {
  const s = spec || {};
  const norm = { neckline: s.neckline === 'vNeck' ? 'v' : s.neckline, shaping: s.shaping, garment: s.garment,
                 skirt: s.skirt || s.skirtStyle };
  const keys = Object.keys(ref.STYLE).filter(k => !k.startsWith('_'));
  const scored = keys.map(k => {
    const st = ref.STYLE[k]; let sc = 0;
    if (st.garment === norm.garment) sc += 4; else sc -= 2;
    if (st.neckline === norm.neckline) sc += 3;
    if (st.shaping && st.shaping === norm.shaping) sc += 2;
    if (st.corset && s.shaping === 'princess') sc += 1;
    return { k, sc };
  }).sort((a, b) => b.sc - a.sc);
  const out = [];
  if (exact && ref.STYLE[exact]) out.push(exact);
  for (const c of scored) { if (out.length >= maxK) break; if (!out.includes(c.k)) out.push(c.k); }
  return out;
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
  done++;
  // DENEYİP-ÖLÇEN ROUTER (Damla kararı 2026-07-23): tahmin eden if-else YOK. Aday havuzunu
  // (tam styleKey varsa o + garment-uyumlu birkaç en-benzer stil) HER BİRİYLE dene, taklit
  // motoru EN DÜŞÜK sapmalıyı SEÇSİN. Router = ölçüm, tahmin değil.
  const exact = styleKeyFor(t.spec);
  const cands = candidateStyles(t.spec, exact);
  let best = null;
  for (const style of cands) {
    try {
      const r = imitate(style, crop, 16);
      if (!best || r.err < best.err) best = { style, err: r.err, ok: r.ok };
    } catch { /* bu aday çizemedi, atla */ }
  }
  if (!best) { results.push({ id: t.id, sapma: null, sebep: 'aday-cizemedi' }); continue; }
  results.push({ id: t.id, style: best.style, yakin: best.style !== exact, sapma: +(best.err * 100).toFixed(2), ok: best.ok, denenenAday: cands.length });
  process.stdout.write(`id${t.id} -> ${best.style}${best.style !== exact ? '~' : ''}: %${(best.err * 100).toFixed(2)}${best.ok ? ' ✓' : ''} (${cands.length} aday)\n`);
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
