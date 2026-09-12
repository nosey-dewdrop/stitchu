// reference-flat.mjs — THE REFERENCE PEN, AND NOTHING ELSE (H3, 2026-08-30).
//
// WHAT THIS IS AND WHAT IT IS DELIBERATELY NOT.
// engine/flat-engine/_engine-full.mjs is the READ-ONLY reference pen: Damla's own
// drawing language, 31 pinned styles, the ruler every figure/atolye/imitation tool
// is judged against. It is not a production renderer and it never was. This file
// is the one bridge to it: spec -> reference style key -> ref.renderStyle().
//
// IT REPLACES engine/tools/render-garment-flat.mjs, WHICH WAS TWO THINGS AT ONCE.
// That module re-exported web/lib/flat-core.js, the CROQUIS PRODUCTION PEN, and its
// `renderGarmentFlatAsync` tried the reference pen first and, when no style matched,
// FELL BACK to the croquis. That fallback was the second object H3 exists to kill:
// a spec with no reference style silently got a schematic drawing that no gate had
// approved and that disagreed with the pattern by 24.89mm at the EU38 waist. H3
// deleted the croquis pen, so there is nothing left to fall back TO — and this file
// does not invent one. No match is a REFUSAL (null), by RULES invariant 1, which is
// exactly what engine/compiler/compile.mjs already treated a fallback as
// ("kopru-eslesmesi-yok" -> ÜRETİLEMEZ). The behaviour those callers WANTED is now
// the behaviour they GET, instead of being reconstructed after the fact.
//
// ⚠ NODE ONLY, AND NEVER ON THE SHIPPED GARMENT LINE. The reference pen reads its
// tables off disk. Nothing under web/ imports this file and nothing should: the
// drawing a shopper downloads comes from ONE place, the surface line
// (web/js/download.js -> engine.flatJSON -> web/lib/flat-from-plan.js). Two engines
// for one garment is yasak 3; this is a tool for judging drawings, not for shipping
// them, and the gate flat_pattern_agree_check --all scans web/ to keep it that way.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const VOCAB = JSON.parse(readFileSync(join(here, '../vocab.json'), 'utf8'));

// Alan ADI elle yazılmıyor: engine/vocab.json her alanı bir enum TİPİNE bağlar ve
// ad o tipten bulunur, böylece kapalı enum'un adı tek kaynakta kalır.
const fieldOf = (enumType) => {
  const k = Object.keys(VOCAB.fields).find((f) => VOCAB.fields[f].enum === enumType);
  if (!k) throw new Error(`engine/vocab.json icinde ${enumType} tipli alan YOK`);
  return k;
};
const SLEEVE_FIELD = fieldOf('SleeveStyle');

function circleSkirt(skirtStyle) {
  const st = String(skirtStyle || '').toLowerCase();
  if (st === 'fullcircle' || st === 'full' || st === 'circle') return 'full';
  if (st === 'halfcircle') return 'half';
  return null;                                   // not a circle skirt
}

async function tryReferencePen(spec) {
  // TEK HAKİKAT, TEK KALEM (Damla kararı 2026-07-20): referans motor artık band-top
  // babydoll ailesinin ÖTESİNDE prenses/wrap/gode gibi TÜM figür-tabanlı siluetleri
  // de çiziyor (figür kuralı + kalem dili orada MERKEZİ). Üretim renderer bu ailelerde
  // KENDİ şematik gövde yolunu KULLANMAZ — referans stiline eşleşen HER spec köprüden
  // geçer (ikinci kalem = beş-turluk sosis/parantez/çadır krizinin kök nedeniydi).
  // Kapı: spec bir referans STYLE anahtarına eşleşiyor (referenceStyle / style / band
  // işareti). Eşleşme yoksa üretim kendi yolunu kullanır (henüz referansta olmayan formlar).
  let ref;
  // node-only: the read-only reference pen still reads its tables off disk, so
  // in a browser this import rejects and the production path draws instead.
  try { ref = await import('../flat-engine/_engine-full.mjs'); } catch { return null; }
  // aday stil anahtarı: explicit referenceStyle > style > band işaretlerinden çıkarım
  let styleKey = spec.referenceStyle || spec.style || null;
  if (!styleKey && (spec.top === 'band' || spec.neckline === 'strapless')) {
    styleKey = 'drawstring_babydoll';
  }
  // TOP family (2026-07-20, item 8/9 — first bare-top production round). A plain
  // sleeveless top with no beyond-engine detail routes to the matching reference
  // top style so it draws figured, NOT through the schematic fallback. Only the
  // simplest, detail-free tops match here; anything with sleeves/collar/gather/etc
  // falls through until those primitives land in the reference pen.
  // SPEC → styleKey deterministik eşleme (2026-07-22 FAZ 6 — uçtan uca köprü).
  // referenceStyle olmadan cümle→spec→köprü otomatik eşlesin. 13 kanıtlı stil.
  // Eşleşmeyen spec (henüz primitifi olmayan) → null → ÜRETİLEMEZ (ikame yok).
  if (!styleKey) {
    const nl = spec.neckline;
    const sleeve = spec.sleeve || spec[SLEEVE_FIELD];   // gramer 'sleeve' | contract kol alani
    const sleeved = sleeve && sleeve !== 'none';
    const peplum = spec.peplum && spec.peplum !== 'none';
    const hemRuffle = spec.hemRuffle === 'single';   // peplum hem fırfırı (id84/91)
    const shirred = (spec.shirred === 'physics') || (spec.gatherType === 'shirred');
    const boxy = spec.shaping === 'boxy';
    const princess = spec.shaping === 'princess';
    const tieBack = spec.closure === 'tieBack' || spec.backDetail === 'tieBack' || spec.tieClosure === 'tieBack';
    const wrapFront = spec.closure === 'wrapFront' || spec.tieClosure === 'wrapFront';

    const straps = spec.straps;                          // wide | spaghetti | ruffled | none
    // KÖPRÜ SIKILAŞTIRMA (2026-07-23): strapType TEK KAYNAK (contract {type} object VE
    // gramer string ikisini de çözer). camiStrap eskiden `straps==='wide'` string
    // kontrolüydü → contract object'te FALSE → id4/74 cami yerine plain'e DÜŞÜYORDU (bug).
    const strapType = (straps && typeof straps === 'object') ? straps.type : straps;  // contract {type} | gramer string
    const camiStrap = strapType === 'wide' || strapType === 'spaghetti';
    if (spec.garment === 'top') {
      // CAMI / BANDEAU ailesi (2026-07-22 ASKI ailesi): dar askılı (wide/spaghetti)
      // band-top gövde — mevcut top gövdesinden ÖNCE eşleşir (spesifik → genel).
      if (camiStrap && (nl === 'square' || nl === 'vNeck') && shirred && peplum && strapType === 'spaghetti' && hemRuffle) styleKey = 'top_cami_sq_spag_shirred_peplum_ruffle';  // id84/91 (peplum hem fırfırı)
      else if (camiStrap && nl === 'square' && shirred && peplum && strapType === 'spaghetti') styleKey = 'top_cami_sq_spag_shirred_peplum';
      else if (camiStrap && nl === 'square' && shirred && peplum) styleKey = 'top_cami_sq_wide_shirred_peplum';
      else if (camiStrap && nl === 'square' && shirred) styleKey = 'top_cami_sq_wide_shirred';
      else if (camiStrap && nl === 'square' && strapType === 'spaghetti') styleKey = 'top_cami_sq_spaghetti';
      // kompleks kombinasyonlar önce (spesifik → genel)
      else if ((nl === 'straight' || nl === 'strapless') && (strapType === 'none' || !strapType) && shirred && peplum) styleKey = 'top_bandeau_shirred_peplum';  // id40
      else if (nl === 'square' && shirred && peplum && sleeved) styleKey = 'top_sq_puff_shirred_peplum';
      else if (nl === 'square' && shirred && peplum) styleKey = 'top_sq_shirred_peplum';
      else if (peplum && princess) styleKey = 'top_princess_peplum';
      else if (boxy && sleeved) styleKey = 'top_crew_boxy_sleeve';
      else if (boxy) styleKey = 'top_crew_boxy_crop';
      else if ((nl === 'boat' || nl === 'square') && princess) styleKey = 'top_boat_princess';
      // KÖPRÜ SIKILAŞTIRMA: princess top (boat/square dışı yaka) princess-top stili YOK →
      // sessizce plain dart'a DÜŞÜRME (ikame). styleKey null kalır → compile ÜRETİLEMEZ der.
      // top_scoop_cami/top_crew_dart SADECE princess DEĞİLKEN eşleşir (dart/plain gövde).
      else if (nl === 'scoop' && !princess) styleKey = 'top_scoop_cami';
      else if ((nl === 'crew' || nl === 'boat' || nl === 'square' || nl === 'vNeck') && !princess && !sleeved && !peplum && !shirred) styleKey = 'top_crew_dart';
      // KÖPRÜ SIKILAŞTIRMA: hemRuffle (peplum hem fırfırı) istenip peplum-ruffle
      // stiline eşleşmediyse (scoop/princess varyantı yok), fırfırsız stile DÜŞÜRME
      // (ikame). styleKey null → ÜRETİLEMEZ. id62/75 sınıfı (peplum-ruffle stili yok).
      if (hemRuffle && styleKey && !/_ruffle$/.test(styleKey)) styleKey = null;
    } else if (spec.garment === 'dress') {
      const circle = circleSkirt(spec.skirt || spec.skirtStyle) !== null;  // full/half circle
      const gathered = (spec.skirt || spec.skirtStyle) === 'gathered';     // dirndl gathered skirt
      if (nl === 'boat' && tieBack) styleKey = 'dress_boat_aline_tieback';
      else if (nl === 'vNeck' && wrapFront) styleKey = 'wrap_dress';                              // id13/68
      else if (nl === 'square' && princess && circle) styleKey = 'dress_square_princess_circle';  // id47
      else if (nl === 'boat' && princess && circle) styleKey = 'dress_boat_princess_circle';      // id27
      else if (nl === 'sweetheart' && princess && circle && !shirred && !sleeved && strapType === 'spaghetti') styleKey = 'dress_sweetheart_spag_circle';  // id101 (sweetheart spaghetti-tie-strap princess fit-and-flare, ön bow)
      else if (nl === 'sweetheart' && princess && circle && !shirred && !sleeved && (strapType === 'wide' || strapType === 'none' || !strapType)) styleKey = 'dress_sweetheart_princess_circle';  // id54 (sweetheart wide-strap princess fit-and-flare — ruched cup/shirred + kollu ayrı primitif, ikame yok)
      else if (nl === 'vNeck' && gathered && sleeved && sleeve !== 'balloon' && !wrapFront && spec.sleeveHead !== 'puffed' && !shirred) styleKey = 'dress_vneck_gathered';  // id24/57 (dirndl gathered skirt, plain kısa kol — puff/balloon kol + shirred ayrı primitif, ikame yok)
      else if ((nl === 'scoop' || nl === 'crew') && princess) {
        styleKey = (spec.length === 'midi') ? 'dress_princess_scoop_aline_midi' : 'dress_princess_scoop_aline';
      }
    }
  }
  if (!styleKey || !ref.STYLE[styleKey]) return null;
  try {
    // shared parametreleri spec'ten geçir (beden/boy/etek/düşüş/nip korunur)
    const overrides = {};
    for (const k of ['size', 'length', 'skirtFull', 'ink', 'foldCount', 'hemWave', 'drape', 'hemDip', 'seed', 'bustProject', 'bustHeight', 'waistNip']) {
      if (spec[k] != null) overrides[k] = spec[k];
    }
    // BEL BAĞI varyantı (2026-07-23): dirndl gathered dress'te tek stil, tie/bow
    // varyantı spec.tieClosure'dan türetilir (id24 frontWaistBow → bow, id57
    // frontWaistTie → tie). Motor ikisini de kalıpta ayrı parça olarak çiziyor.
    if (styleKey === 'dress_vneck_gathered') {
      const tc = spec.tieClosure;
      if (tc === 'frontWaistTie') overrides.waistTie = 'tie';
      else if (tc === 'frontWaistBow') overrides.waistTie = 'bow';
    }
    return ref.renderStyle(styleKey, overrides);
  } catch {
    return null;
  }
}

/**
 * The reference pen's drawing for this spec, or null when no reference style
 * matches. NULL IS THE ANSWER, not a failure to answer: the caller must report a
 * gap ("this spec has no reference style yet"), never substitute a drawing.
 */
export async function renderReferenceFlat(spec = {}) {
  return tryReferencePen(spec);
}
