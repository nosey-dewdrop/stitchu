// ============================================================================
// DERLEYİCİ FAZ 4 — KAPI. compile() sonrası otomatik değerlendirme.
// Damla direktifi 2026-07-22.
//
// compile(spec) → {flat, kalıp} → gate() otomatik koşar:
//   1. BANT PUANLAMA   — parça sayısı gusto-corpus emsal bandında mı
//   2. ÇİFT KANAT HAKEM — flat kör test + kalıp Δmm (LLM, runtime = ürünün kendisi)
//   3. PARÇA BANDI      — (1'in içinde) blouse 3-5, dress 4-8, skirt 2-4
//   4. TERZİ GÖZÜ       — giriş kontrolü (guard YAZILANA KADAR ZORUNLU, LLM)
//
// Geçen → "ÜRETİLDİ" (uretildi:true, gecti:true)
// Geçmeyen → "ÜRETİLDİ AMA GEÇMEDİ" (uretildi:true, gecti:false, eksik[])
// Deterministik kısımlar (bant/parça) burada; hakem/terzi hook'ları dışarıdan
// (judgeFn/tailorFn) — LLM runtime, verilmezse o kanat "ÖLÇÜLMEDİ".
// ============================================================================
import {readFileSync} from 'node:fs';
const GUSTO = JSON.parse(readFileSync(new URL('../../contract/gusto-corpus.json', import.meta.url), 'utf8'));

// parça bandı: garment → {min,max}. AMA gusto-corpus bandı SADE bluz/dress
// emsalinden ölçülü (BugraPatterns). peplum/shirred/princess-kompleks o SINIF
// DEĞİL — yanlış sınıfa bant uygulamak uydurma eşik olur. Bu sınıf için gusto'da
// emsal parça verisi YOK (gusto FROZEN, external band yok) → ÖLÇÜLMEDİ, kapı bu
// kanatta SUSAR (FAIL vermez). (2026-07-22 Damla direktifi 2b.)
function pieceBand(spec) {
  // kompleks parça getiren primitifler → sade band uygulanamaz → ÖLÇÜLMEDİ
  const kompleks = (spec.peplum && spec.peplum !== 'none')
    || (spec.shirred && spec.shirred !== 'none')
    || spec.shaping === 'princess';
  if (kompleks) return { olculmedi: true, sinif: 'peplum/shirred/princess kompleks' };
  const b = GUSTO.piece_page_bands.pieces;
  if (spec.garment === 'top') return b.blouse;
  if (spec.garment === 'dress') return b.dress;
  if (spec.garment === 'skirt') return b.skirt;
  return null;
}

// gate: compile() çıktısını değerlendir. judgeFn/tailorFn LLM hook'ları (runtime).
export async function gate(compiled, opts = {}) {
  const eksik = [];
  const rapor = { bant: null, hakem: null, parcaBandi: null, terzi: null };

  if (!compiled.ok) {
    return { uretildi: false, gecti: false, uretilemez: true,
             eksik_primitif: compiled.eksik_primitif, not: compiled.not };
  }

  const spec = compiled.spec;
  const parcaSayisi = compiled.kalip && compiled.kalip.pieces
    ? compiled.kalip.pieces.filter(p => !/binding|chalk|ruffle|bias/i.test(p.name)).length + 0  // yapısal
    : null;

  // --- 3. PARÇA SAYISI BANDI (deterministik, emsal — ÖLÇÜLMEDİ ise sus) ---
  const band = pieceBand(spec);
  const total = compiled.kalip && compiled.kalip.pieces ? compiled.kalip.pieces.length : null;
  if (band && band.olculmedi) {
    // kompleks sınıf: emsal parça verisi yok → bu kanat PUANLAMAZ (sus).
    rapor.parcaBandi = { parca: total, not: `ÖLÇÜLMEDİ — ${band.sinif} için emsal parça bandı yok (uydurma eşik yasak)` };
  } else if (band && total != null) {
    const inBand = total >= band.min && total <= band.max;
    rapor.parcaBandi = { parca: total, band: [band.min, band.max], gecti: inBand };
    if (!inBand) eksik.push(`parça ${total} emsal bandı [${band.min},${band.max}] dışında (${total < band.min ? 'eksik' : 'puzzle'})`);
  } else {
    rapor.parcaBandi = { not: 'ÖLÇÜLMEDİ — kalıp parçası okunamadı' };
  }

  // --- 1. BANT PUANLAMA (flat referans mı, kalıp 0-issue mu — deterministik) ---
  rapor.bant = { flatReferans: compiled.flatIsReference, kalipError: compiled.kalipError };
  if (!compiled.flatIsReference) eksik.push('flat köprüden geçmedi (fallback)');
  if (compiled.kalipError) eksik.push(`kalıp draft hatası: ${compiled.kalipError}`);

  // --- 2. ÇİFT KANAT HAKEM (LLM runtime = ürünün kendisi) ---
  if (opts.judgeFn) {
    const v = await opts.judgeFn(compiled);   // {flatPass, kalipPass, gerekce}
    rapor.hakem = v;
    if (!v.flatPass) eksik.push(`hakem FLAT: ${v.gerekce || 'kör test düştü'}`);
    if (!v.kalipPass) eksik.push(`hakem KALIP: ${v.gerekce || 'Δmm düştü'}`);
  } else {
    rapor.hakem = { not: 'ÖLÇÜLMEDİ — judgeFn verilmedi (çift kanat hakem çalıştırılmadı)' };
  }

  // --- 4. TERZİ GÖZÜ GİRİŞ KONTROLÜ (guard yazılana kadar ZORUNLU, LLM) ---
  // Guard eşiği henüz ÖLÇÜLMEDİ (kart-giris-guard.md). O yazılana kadar terzi
  // gözü kontrolü ZORUNLU — atlanamaz. tailorFn verilmezse kapı EKSİK sayılır.
  if (opts.tailorFn) {
    const t = await opts.tailorFn(compiled);   // {girisVar, dikilir, gerekce}
    rapor.terzi = t;
    if (!t.girisVar) eksik.push(`terzi gözü: giriş yok — ${t.gerekce || 'kafa/gövde geçmez'}`);
    if (!t.dikilir) eksik.push(`terzi gözü: DİKİLMEZ — ${t.gerekce || ''}`);
  } else {
    // ZORUNLU kanat eksik → kapı tamamlanmadı
    rapor.terzi = { not: 'ZORUNLU ama tailorFn verilmedi — giriş kontrolü guard yazılana kadar şart' };
    eksik.push('terzi gözü giriş kontrolü çalıştırılmadı (guard yazılana kadar zorunlu)');
  }

  const gecti = eksik.length === 0;
  return {
    uretildi: true, gecti,
    durum: gecti ? 'ÜRETİLDİ' : 'ÜRETİLDİ AMA GEÇMEDİ',
    eksik, rapor, specHash: compiled.specHash, parcaSayisi,
  };
}

// CLI test: node gate.mjs '{"garment":"top",...}' (hakem/terzi ÖLÇÜLMEDİ döner)
import {pathToFileURL} from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {compile} = await import('./compile.mjs');
  const spec = JSON.parse(process.argv[2] || '{}');
  const c = await compile(spec, { referenceStyle: process.argv[3] });
  const g = await gate(c);
  console.log(JSON.stringify({ durum: g.durum, gecti: g.gecti, eksik: g.eksik,
    parcaBandi: g.rapor.parcaBandi }, null, 1));
}
