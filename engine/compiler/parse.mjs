// ============================================================================
// DERLEYİCİ FAZ 2 — PARSER (cümle → spec). Damla direktifi 2026-07-22.
// Serbest metin (TR/EN) → spec-grammar.json'a uygun spec JSON.
// KURAL: gramerde OLMAYAN alan üretilemez (uydurma YASAK). Eksik bilgi →
// varsayılan DEĞİL, "belirtilmedi". Karşılığı olmayan istek → BOŞLUK RAPORU
// {anlasilan, eksik_primitif[], uretilemez:true}. İkame YASAK.
//
// LLM yerine kural-tabanlı sözlük eşleme (deterministik, kredisiz). Her eşleşme
// gramere KARŞI doğrulanır; gramerde yoksa eksik_primitif'e yazılır, spec'e DEĞİL.
// Genişletme: sözlük büyür, ama her yeni terim ancak gramerde çizilebiliyorsa
// spec üretir; çizilemiyorsa boşluk raporuna düşer.
// ============================================================================
import {readFileSync} from 'node:fs';
const GRAMMAR = JSON.parse(readFileSync(new URL('../../contract/spec-grammar.json', import.meta.url), 'utf8'));

// --- terim sözlüğü: TR/EN kelime → {slot, value}. SADECE gramerde olan value'lar
// spec üretir; PARK'takiler eksik_primitif'e gider. ---
const LEX = [
  // garment
  [/(?<![a-zçğıöşü0-9])(elbise|dress|frock)(?![a-zçğıöşü0-9])/i, 'garment', 'dress'],
  [/(?<![a-zçğıöşü0-9])(üst|ust|top|bluz|blouse|tişört|tshirt|tee|atlet|tank|kaşkorse|cami|büstiyer|bustier|korse)(?![a-zçğıöşü0-9])/i, 'garment', 'top'],
  [/(?<![a-zçğıöşü0-9])(etek|skirt)(?![a-zçğıöşü0-9])/i, 'garment', 'PARK:skirt'],
  [/(?<![a-zçğıöşü0-9])(pantolon|trouser|pants|palazzo)(?![a-zçğıöşü0-9])/i, 'garment', 'PARK:trousers'],
  // neckline
  [/(?<![a-zçğıöşü0-9])(bisiklet yaka|crew|yuvarlak yaka|round neck)(?![a-zçğıöşü0-9])/i, 'neckline', 'crew'],
  [/(?<![a-zçğıöşü0-9])(kayık yaka|kayik yaka|boat|bardot)(?![a-zçğıöşü0-9])/i, 'neckline', 'boat'],
  [/(?<![a-zçğıöşü0-9])(u yaka|scoop|geniş yuvarlak|derin yuvarlak)(?![a-zçğıöşü0-9])/i, 'neckline', 'scoop'],
  [/(?<![a-zçğıöşü0-9])(kare yaka|square)(?![a-zçğıöşü0-9])/i, 'neckline', 'square'],
  [/(?<![a-zçğıöşü0-9])(v yaka|vneck|v-neck|v neck)(?![a-zçğıöşü0-9])/i, 'neckline', 'vNeck'],
  [/(?<![a-zçğıöşü0-9])(kalp yaka|sweetheart)(?![a-zçğıöşü0-9])/i, 'neckline', 'PARK:sweetheart'],
  [/(?<![a-zçğıöşü0-9])(halter|boyundan bağlamalı)(?![a-zçğıöşü0-9])/i, 'neckline', 'PARK:halter'],
  [/(?<![a-zçğıöşü0-9])(cowl|dökümlü yaka)(?![a-zçğıöşü0-9])/i, 'neckline', 'PARK:cowl'],
  // shaping
  [/(?<![a-zçğıöşü0-9])(prenses|princess)(?![a-zçğıöşü0-9])/i, 'shaping', 'princess'],
  [/(?<![a-zçğıöşü0-9])(pens|dart|pensli)(?![a-zçğıöşü0-9])/i, 'shaping', 'dart'],
  [/(?<![a-zçğıöşü0-9])(boxy|bol kesim|oversize|oversized|kutu|salaş|salas)(?![a-zçğıöşü0-9])/i, 'shaping', 'boxy'],
  // sleeve
  [/(?<![a-zçğıöşü0-9])(kolsuz|sleeveless|askılı|askili)(?![a-zçğıöşü0-9])/i, 'sleeve', 'none'],
  [/(?<![a-zçğıöşü0-9])(düz kol|duz kol|straight sleeve|normal kol)(?![a-zçğıöşü0-9])/i, 'sleeve', 'straight'],
  [/(?<![a-zçğıöşü0-9])(balon kol|balloon|puf kol|puff|bishop)(?![a-zçğıöşü0-9])/i, 'sleeve', 'balloon'],
  [/\bcap\s*(sleeve|kol)/i, 'sleeve', 'PARK:cap'],
  // sleeveLength
  [/(?<![a-zçğıöşü0-9])(kısa kol|kisa kol|short sleeve|short)(?![a-zçğıöşü0-9])/i, 'sleeveLength', 'short'],
  [/(?<![a-zçğıöşü0-9])(dirsek|elbow)(?![a-zçğıöşü0-9])/i, 'sleeveLength', 'elbow'],
  [/(?<![a-zçğıöşü0-9])(uzun kol|long sleeve|long)(?![a-zçğıöşü0-9])/i, 'sleeveLength', 'long'],
  // skirt
  [/(?<![a-zçğıöşü0-9])(a kesim|a-line|aline|çan etek|can etek)(?![a-zçğıöşü0-9])/i, 'skirt', 'aLine'],
  [/(?<![a-zçğıöşü0-9])(gode|gore|panelli etek)(?![a-zçğıöşü0-9])/i, 'skirt', 'gore'],
  [/(?<![a-zçğıöşü0-9])(düz etek|duz etek|straight skirt|kalem etek)(?![a-zçğıöşü0-9])/i, 'skirt', 'PARK:straight'],
  [/(?<![a-zçğıöşü0-9])(büzgülü etek|buzgulu etek|gathered skirt|toplu etek)(?![a-zçğıöşü0-9])/i, 'skirt', 'PARK:gathered'],
  [/(?<![a-zçğıöşü0-9])(tam kloş|tam klos|kloş|klos|full circle|circle skirt|çember|cember)(?![a-zçğıöşü0-9])/i, 'skirt', 'PARK:full-circle'],
  [/(?<![a-zçğıöşü0-9])(pileli etek|pleated skirt)(?![a-zçğıöşü0-9])/i, 'skirt', 'PARK:pleated'],
  // length
  [/(?<![a-zçğıöşü0-9])(mini|kısa boy|kisa)(?![a-zçğıöşü0-9])/i, 'length', 'mini'],
  [/(?<![a-zçğıöşü0-9])(midi|diz boyu)(?![a-zçğıöşü0-9])/i, 'length', 'midi'],
  [/(?<![a-zçğıöşü0-9])(maxi|uzun boy|maksi)(?![a-zçğıöşü0-9])/i, 'length', 'PARK:maxi'],
  // topLength
  [/(?<![a-zçğıöşü0-9])(crop|kısa üst|kisa ust|göbek üstü)(?![a-zçğıöşü0-9])/i, 'topLength', 'cropped'],
  [/(?<![a-zçğıöşü0-9])(kalça boyu|kalca boyu|hip length)(?![a-zçğıöşü0-9])/i, 'topLength', 'hip'],
  [/(?<![a-zçğıöşü0-9])(tunik|tunic)(?![a-zçğıöşü0-9])/i, 'topLength', 'PARK:tunic'],
  // peplum
  [/(?<![a-zçğıöşü0-9])(peplum|bele volan|belden volan|frill top|fırfırlı bel|firfirli bel)(?![a-zçğıöşü0-9])/i, 'peplum', 'full'],
  // shirred
  [/(?<![a-zçğıöşü0-9])(büzgü|buzgu|shirred|shirring|gipe|smok|smock|lastikli büzgü)(?![a-zçğıöşü0-9])/i, 'shirred', 'physics'],
  // closure
  [/(?<![a-zçğıöşü0-9])(fermuar|zipper|zip)(?![a-zçğıöşü0-9])/i, 'closure', 'zipper'],
  [/(?<![a-zçğıöşü0-9])(düğme|dugme|button|patlı|patli)(?![a-zçğıöşü0-9])/i, 'closure', 'buttons'],
  [/(?<![a-zçğıöşü0-9])(arkadan bağ|arkada bağ|arka bağ|back tie|tie back|tie-back)(?![a-zçğıöşü0-9])/i, 'closure', 'tieBack'],
  [/(?<![a-zçğıöşü0-9])(korse|lace-up|laceup|bağcık|bagcik|kurdele bağ)(?![a-zçğıöşü0-9])/i, 'closure', 'PARK:lace-up'],
  // collar
  [/(?<![a-zçğıöşü0-9])(bebe yaka|peter pan|peter-pan|peterpan)(?![a-zçğıöşü0-9])/i, 'collar', 'peterPan'],
  [/(?<![a-zçğıöşü0-9])(gömlek yaka|gomlek yaka|shirt collar)(?![a-zçğıöşü0-9])/i, 'collar', 'PARK:shirt'],
  [/(?<![a-zçğıöşü0-9])(hakim yaka|mandarin|dik yaka)(?![a-zçğıöşü0-9])/i, 'collar', 'PARK:mandarin'],
  // straps
  [/(?<![a-zçğıöşü0-9])(fırfırlı askı|firfirli aski|ruffled strap)(?![a-zçğıöşü0-9])/i, 'straps', 'ruffled'],
  [/(?<![a-zçğıöşü0-9])(spagetti askı|spaghetti|ince askı)(?![a-zçğıöşü0-9])/i, 'straps', 'PARK:spaghetti'],
  [/(?<![a-zçğıöşü0-9])(omzu açık|off-shoulder|düşük omuz)(?![a-zçğıöşü0-9])/i, 'straps', 'PARK:offShoulder'],
];

// --- NESTED param haritası: gramerdeki her value.alt'ı düz sözlüğe aç, ki
// drawable() özyinelemeli olmadan da nested param'ı tanısın (sınıf hatası fix:
// 5 nested param sessizce 'eksik' raporlanıyordu). ---
const NESTED = {};   // paramAdı → izinli değerler[]
for (const sd of Object.values(GRAMMAR.slots)) {
  for (const vd of Object.values(sd.values || {})) {
    if (vd && vd.alt) for (const [k, vals] of Object.entries(vd.alt)) {
      NESTED[k] = (NESTED[k] || []).concat(vals);
    }
  }
}

// gramerde bir (slot,value) çizilebilir mi? — TOP-LEVEL slot VEYA nested alt-param.
function drawable(slot, value) {
  const s = GRAMMAR.slots[slot];
  if (s && s.values && s.values[value]) return true;      // top-level slot değeri
  if (NESTED[slot] && NESTED[slot].includes(value)) return true;  // nested alt-param
  return false;
}

// GRAMERE KARŞI DOĞRULAMA — kaynaktan bağımsız (regex ya da LLM fark etmez).
// Bir aday spec'i alır: her slot gramerde çizilebilir mi? PARK/uydurma → red.
// Bu, katmanın kalbi: regex de LLM de çıktısını BUNA verir.
export function validateSpec(candidate) {
  const spec = {}, eksik_primitif = [], reddedilen = [];
  for (const [slot, value] of Object.entries(candidate)) {
    if (value == null) continue;
    if (typeof value === 'string' && value.startsWith('PARK:')) {
      const p = value.slice(5); if (!eksik_primitif.includes(p)) eksik_primitif.push(p); continue;
    }
    if (drawable(slot, value)) spec[slot] = value;
    else {
      // gramerde YOK → uydurma/park; spec'e girmez, eksik_primitif'e
      if (!eksik_primitif.includes(value)) eksik_primitif.push(String(value));
      reddedilen.push(`${slot}=${value}`);
    }
  }
  return { spec, eksik_primitif, reddedilen };
}

// REGEX HIZLI YOL: cümleden aday (slot,value) çiftleri çıkar. TUTMAMASI ARTIK
// HATA DEĞİL — tutmazsa LLM yoluna düşer (aşağıda parseAsync). Tam eşleşmede
// LLM atlanır (hız). Türkçe ekli/devrik cümlede regex kaçırır, LLM yakalar.
function regexCandidate(sentence) {
  const cand = {};
  for (const [re, slot, value] of LEX) {
    if (!re.test(sentence)) continue;
    if (cand[slot] && cand[slot] !== value && !value.startsWith('PARK:')) continue; // ilk eşleşme
    if (!cand[slot]) cand[slot] = value;
  }
  return cand;
}

// senkron parse = regex hızlı yol + gramer doğrulama. LLM yok (deterministik).
// Ekli/devrik cümle regex'i kaçırırsa eksik kalır → parseAsync LLM'e düşürür.
export function parse(sentence, llmCandidate) {
  const candidate = llmCandidate || regexCandidate(sentence);
  const { spec: vspec, eksik_primitif, reddedilen } = validateSpec(candidate);
  const spec = { ...vspec };
  const anlasilan = { ...candidate };
  const cakisma = [];

  // ÇELİŞKİ kontrolü: cümlede İKİ zıt değer birden geçerse (kolsuz + balon kol)
  // → İMKANSIZ, red. Aday spec'te değil, ham cümlede iki işaret arar.
  const celiski = [];
  const has = (re) => re.test(sentence);
  if (has(/kolsuz|sleeveless|askılı|askili/i) && has(/balon kol|balloon|puf kol|puff|düz kol|duz kol|straight sleeve|uzun kol|kısa kol|kisa kol/i))
    celiski.push('kolsuz + kollu (imkansız)');
  if (has(/(?<![a-zçğıöşü])(üst|top|bluz|atlet|tank)(?![a-zçğıöşü])/i) && has(/(?<![a-zçğıöşü])(elbise|dress)(?![a-zçğıöşü])/i))
    celiski.push('üst + elbise (iki garment)');

  // geçersiz kombinasyon kontrolü (gramerden, düzeltilebilir)
  const gecersiz = [];
  if (spec.sleeve === 'none' && (spec.sleeveLength)) { delete spec.sleeveLength; gecersiz.push('kolsuz+sleeveLength → sleeveLength silindi'); }
  if (spec.peplum && spec.peplum !== 'none' && spec.garment === 'dress') { gecersiz.push('peplum+dress geçersiz'); }
  if (spec.boxy && spec.shaping === 'princess') { gecersiz.push('boxy+princess çelişir'); }

  // ÜRETİLEMEZ: eksik primitif VAR ya da çelişki VAR
  const uretilemez = eksik_primitif.length > 0 || celiski.length > 0;

  return {
    sentence,
    spec: uretilemez ? null : spec,        // eksik primitif varsa üretme
    anlasilan,
    eksik_primitif,
    cakisma,
    celiski,
    gecersiz,
    uretilemez,
    red: celiski.length > 0,
    belirtilmedi: missingSlots(spec, uretilemez)
  };
}

// hangi temel slotlar belirtilmedi (varsayılan DEĞİL, açık işaret)
function missingSlots(spec, uretilemez) {
  if (uretilemez) return [];
  const temel = ['garment', 'neckline'];
  const eksik = temel.filter(s => !spec[s]);
  return eksik;
}

// --- SPEC CACHE: parse sonucu diske (contract/parsed/<hash>.json, commit'li).
// Aynı cümle ikinci kez LLM'e GİTMEZ. Determinizm burada DEĞİL (parser doğru
// olmalı, deterministik değil); cache maliyeti düşürür. ---
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const CACHE_DIR = new URL('../../contract/parsed/', import.meta.url);
function cacheKey(sentence) { return createHash('md5').update(sentence.trim().toLowerCase()).digest('hex').slice(0, 16); }
function cacheGet(sentence) {
  const f = new URL(cacheKey(sentence) + '.json', CACHE_DIR);
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
}
function cachePut(sentence, result) {
  try { mkdirSync(CACHE_DIR, { recursive: true }); } catch {}
  writeFileSync(new URL(cacheKey(sentence) + '.json', CACHE_DIR), JSON.stringify(result, null, 1));
}

// LLM parse: gramerin izinli değerlerini prompt'a koyup cümleyi aday spec'e
// çevirtir. Çıktı parse()'ta GRAMERE KARŞI doğrulanır (uydurma alan = red).
// Bu RUNTIME yol — ürünün kendisi. llmFn(prompt)→JSON dışarıdan verilir
// (test'te Claude agent, canlıda worker vision). Verilmezse null (regex-only).
export function grammarPromptValues() {
  const out = {};
  for (const [slot, sd] of Object.entries(GRAMMAR.slots)) {
    if (!sd.values) continue;
    out[slot] = Object.keys(sd.values);   // sadece ÇİZİLEBİLİR değerler (PARK yok)
  }
  return out;
}

// tam parse: cache → regex hızlı yol → (eksik/boşsa) LLM adayı → gramer doğrula.
export async function parseFull(sentence, llmFn) {
  const cached = cacheGet(sentence);
  if (cached) return { ...cached, _cache: 'hit' };
  // 1) regex hızlı yol
  let result = parse(sentence);
  // 2) regex tuttu ve temel slotlar dolu ve boşluk yok → kabul
  const regexYeterli = !result.uretilemez && result.spec && result.spec.garment && result.spec.neckline;
  if (!regexYeterli && llmFn) {
    // 3) LLM yolu: aday spec üret, gramere karşı doğrula
    const cand = await llmFn(sentence, grammarPromptValues());
    if (cand) result = parse(sentence, cand);
  }
  result._cache = 'miss';
  cachePut(sentence, result);
  return result;
}

// CLI: node parse.mjs "kolsuz kare yaka büzgülü peplum üst"
import {pathToFileURL} from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sentence = process.argv.slice(2).join(' ');
  console.log(JSON.stringify(parse(sentence), null, 2));
}
