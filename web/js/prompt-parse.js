// prompt-parse.js — F1: the DETERMINISTIC half of "describe it in words".
//
// A user can now type "puf kollu mini elbise" or "square neckline, long fitted
// sleeves" and this file turns the words into the SAME spec axes the pickers
// and the photo path already speak. No LLM, no network: every phrase below maps
// to a value that ALREADY EXISTS in the generated vocabulary (vocab.gen.js) or
// in the create.html picker enums (ruffle/keyhole, API-level conveniences).
//
// ⛔ THIS IS NOT A NEW WORD MENU. The law (KOSU F1 + repo direction) forbids
// growing a fixed vocabulary; what is allowed is naming the EXISTING axis
// values in the two languages the site already speaks (the picker labels are
// the source for the TR words). The module THROWS AT LOAD if any table entry
// maps to a value the vocabulary does not carry — an invented value cannot
// even be written here without turning every page red.
//
// ⛔ NO SILENT DROP. Every token of the input is accounted for: it is either
// consumed by a phrase, a stopword, or reported back as "anlasilmadi:<word>"
// with a pointer to the nearest Edge/Panel/Stitch primitive
// (contract/primitives-v1.json). parse() returns the arithmetic
// (hesap.toplam === eslesen + stop + anlasilmayan) so a gate can prove the
// zero-silence property instead of trusting it.
import { VOCAB, canonical } from './vocab.gen.js?v=144';

// Axes create.js holds that predate the generated vocabulary (see
// backend/spec-core.js ENUMS — the same two conveniences, same values).
const EXTRA_ENUMS = {
  ruffle: ['none', 'single', 'tiered'],
  keyhole: ['none', 'keyhole'],
};

// ---------------------------------------------------------------------------
// THE PHRASE TABLE. Keys are ascii-folded lowercase token sequences; values are
// (field, canonical value). TR words come from the create.html picker labels
// (SPEC_GROUPS trLabel/options), EN words from the same options + vocab
// synonyms. Where a bare word honestly under-determines the value, the SADEST
// reading is chosen and said so in a comment (provenance stays `soruldu`
// because the user did ask for the word; the axis value is the plainest host).
const P = [];
const T = (field, value, ...phrases) => {
  for (const p of phrases) P.push({ field, value, tokens: Array.isArray(p) ? p : [p] });
};

T('garment', 'dress', 'dress', 'gown', 'elbise');
T('garment', 'skirt', 'skirt', 'etek');
T('garment', 'top', 'top', 'blouse', 'bluz', 'ust');

T('neckline', 'crew', ['crew', 'neck'], 'crew', ['bisiklet', 'yaka']);
T('neckline', 'scoop', 'scoop', ['oval', 'yaka']);
T('neckline', 'vNeck', 'vneck', ['v', 'neck'], ['v', 'neckline'], ['v', 'yaka']);
T('neckline', 'square', ['square', 'neckline'], ['square', 'neck'], ['kare', 'yaka']);
T('neckline', 'boat', ['boat', 'neck'], 'boat', 'bateau', ['kayik', 'yaka']);
T('neckline', 'sweetheart', 'sweetheart', ['kalp', 'yaka']);
T('neckline', 'halter', 'halter', ['boyundan', 'bagli']);
T('neckline', 'cowl', 'cowl', ['dokumlu', 'yaka']);
T('neckline', 'pussyBow', ['pussy', 'bow'], ['fiyonk', 'yaka']);

T('sleeveStyle', 'none', 'sleeveless', 'kolsuz', 'strapless', 'straplez',
  ['without', 'sleeves'], ['no', 'sleeves']);
T('sleeveStyle', 'straight', ['straight', 'sleeves'], ['straight', 'sleeve'],
  'fitted', ['duz', 'kol']);
T('sleeveStyle', 'balloon', 'balloon', 'bishop', ['balon', 'kol'], ['balon', 'kollu']);

T('sleeveLength', 'short', ['short', 'sleeves'], ['short', 'sleeve'], ['kisa', 'kol'], ['kisa', 'kollu']);
T('sleeveLength', 'elbow', 'elbow', 'dirsek');
T('sleeveLength', 'long', ['long', 'sleeves'], ['long', 'sleeve'], ['uzun', 'kol'], ['uzun', 'kollu']);

// puff/puf reads as the sleeve HEAD (same wire the vision path drives:
// sleeveHead 'puffed' -> sleeveCap 'puffed'; birlestir() adds the carrying
// sleeve as a construction consequence, exactly like create.js does).
T('sleeveCap', 'puffed', 'puff', 'puffed', 'puf', ['puf', 'kollu'], ['puff', 'sleeve']);
T('sleeveCap', 'gathered', ['gathered', 'sleeve'], ['buzgulu', 'kol']);
T('sleeveCap', 'cap', ['cap', 'sleeve'], ['cap', 'sleeves']);

T('skirtStyle', 'aLine', ['a', 'line'], 'aline', ['a', 'kesim']);
// pencil/kalem = the drafted straight skirt, the plainest reading.
T('skirtStyle', 'straight', ['straight', 'skirt'], ['duz', 'etek'],
  ['pencil', 'skirt'], ['kalem', 'etek']);
T('skirtStyle', 'gathered', ['gathered', 'skirt'], ['buzgulu', 'etek']);
T('skirtStyle', 'halfCircle', ['half', 'circle'], ['circle', 'skirt'],
  ['yarim', 'klos'], 'klos');
T('skirtStyle', 'pleated', 'pleated', 'pileli');
T('skirtStyle', 'gore', 'gored', 'godeli', 'gode');

T('skirtLength', 'mini', 'mini');
T('skirtLength', 'midi', 'midi');
T('skirtLength', 'maxi', 'maxi', 'maksi', ['floor', 'length']);

T('topLength', 'cropped', 'cropped', 'crop');
T('topLength', 'tunic', 'tunic', 'tunik');

T('waistline', 'empire', 'empire', 'babydoll', ['gogus', 'alti']);

T('shaping', 'princess', 'princess', 'prenses');
T('shaping', 'dart', 'darts', 'dart', 'pens', 'pensli');

T('fabric', 'knit', 'knit', 'stretch', 'strec', 'orme');
T('fabric', 'woven', 'woven', 'dokuma');

T('collarType', 'peterPan', ['peter', 'pan'], ['bebe', 'yaka']);
T('collarType', 'shirt', ['shirt', 'collar'], ['gomlek', 'yaka']);
T('collarType', 'stand', ['stand', 'collar'], ['dik', 'yaka']);
T('collarType', 'mock', 'mandarin');
T('collarEdge', 'scallop', 'scalloped', 'scallop', 'fisto');

T('keyhole', 'keyhole', 'keyhole', ['anahtar', 'deligi']);

T('wrapFront', 'surplice', 'kruvaze', 'surplice', 'wrap');
T('laceUpBack', 'corset', 'corset', 'korse', ['lace', 'up'], ['bagcikli', 'sirt']);
// An "open back" with no shape word: the sadest cutout is the round one.
T('backOpening', 'round', ['open', 'back'], ['acik', 'sirt']);

T('backSlit', 'slit', 'slit', 'yirtmac', 'yirtmacli');
T('backSlit', 'vent', ['walking', 'vent'], 'vent');

T('ruffledStraps', 'ruffled', ['ruffled', 'straps'], ['firfirli', 'aski']);
T('ruffle', 'single', 'ruffle', 'ruffled', 'firfir', 'firfirli');
T('ruffle', 'tiered', 'tiered', 'kademeli');
// A bare "peplum" is the full-circle one (the create.html first real option).
T('peplum', 'full', 'peplum');

T('pocketStyle', 'patch', ['patch', 'pocket'], ['patch', 'pockets'], ['yama', 'cep']);
T('pocketStyle', 'slash', ['slash', 'pocket'], ['egik', 'cep']);
// A bare "pocket": the invisible side-seam bag is what a dress wearer means.
T('pocketStyle', 'sideSeam', 'pocket', 'pockets', 'cep', 'cepli');

T('placketStyle', 'standard', 'dugmeli', 'buttoned', ['button', 'front'],
  ['button', 'placket'], ['dugme', 'patli']);
T('placketStyle', 'asymmetric', ['asymmetric', 'placket'], ['asimetrik', 'pat']);

T('gatherType', 'smocked', 'smocked', 'smok');
T('gatherType', 'shirred', 'shirred', ['lastik', 'buzgu']);
T('gatherType', 'drawstring', 'drawstring', ['ip', 'buzgu']);

T('yoke', 'plain', 'yoke', 'roba');
T('edgeFinish', 'facing', 'facing', 'pervaz');
T('cuffStyle', 'button', ['button', 'cuff'], 'manset');
T('cuffStyle', 'ribbed', ['ribbed', 'cuff'], 'ribana');
T('backDetail', 'cape', ['back', 'cape'], ['arka', 'pelerin'], 'pelerin', 'cape');
T('backDetail', 'flounce', ['arka', 'volan'], ['back', 'flounce']);
T('backDetail', 'ruffle', ['back', 'ruffle'], ['arka', 'firfir']);
T('bardotStyle', 'plain', ['off', 'shoulder'], ['omuz', 'acik'], 'bardot');
T('hemShape', 'shirttail', 'shirttail', ['shirt', 'tail'], ['gomlek', 'etegi']);
T('hemShape', 'highLow', ['high', 'low']);
T('exposedZip', 'centerFront', ['gorunur', 'fermuar'], ['exposed', 'zip'], ['exposed', 'zipper']);

// LOAD-TIME LOCK: every table value must exist in the vocabulary (or the two
// documented conveniences). This is what makes "the parser cannot invent a
// value" a structural fact instead of a promise.
for (const e of P) {
  const legal = EXTRA_ENUMS[e.field]
    ? EXTRA_ENUMS[e.field].includes(e.value)
    : canonical(e.field, e.value) !== undefined && VOCAB[e.field];
  if (!legal) {
    throw new Error(`prompt-parse tablosu uydurma değer taşıyor: ${e.field}='${e.value}'`);
  }
}
// Longest phrase first, so "patch pocket" wins before the bare "pocket".
P.sort((a, b) => b.tokens.length - a.tokens.length);

// Connectives in both languages. NOT garment words: a stopword can never be a
// value, so nothing semantic can hide in this list.
const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'with', 'in', 'of', 'for', 'to', 'on', 'at',
  'is', 'it', 'i', 'my', 'me', 'want', 'like', 'please', 'some', 'very',
  've', 'ile', 'bir', 'icin', 'olsun', 'istiyorum', 'lutfen', 'biraz', 'cok',
  'gibi', 'olan', 'tarz', 'tarzi', 'seklinde',
]);

// The nearest-primitive pointer for a word nothing above understands. The
// candidate list is the primitive/component layer of contract/primitives-v1.json
// — the ONLY place new expressive power is allowed to grow, so that is where
// the suggestion points.
const PRIMITIVES = [
  'edge', 'panel', 'seam',
  'op.gather', 'op.flare', 'op.extend', 'op.split', 'op.overlay', 'op.attach',
  'op.suppress', 'op.rotate',
  'bodice', 'sleeve', 'skirt', 'collar', 'cuff', 'band', 'overlay',
];

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function enYakinPrimitif(word) {
  let best = PRIMITIVES[0], bestD = Infinity;
  for (const p of PRIMITIVES) {
    const d = levenshtein(word, p.replace('op.', ''));
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}

// TR-aware fold: lowercase + strip diacritics, so 'Kloş' and 'klos' meet.
export function fold(s) {
  return String(s || '').toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u');
}

const GAP = 2; // a phrase may skip up to 2 tokens ("long FITTED sleeves")

/**
 * Deterministic parse: free text -> existing spec axes + the honest remainder.
 * Returns { eksenler, anlasilmadi, hesap, bos }.
 */
export function parsePrompt(text) {
  const tokens = fold(text).match(/[a-z0-9]+/g) || [];
  if (!tokens.length) {
    return { eksenler: {}, anlasilmadi: [], hesap: { toplam: 0, eslesen: 0, stop: 0, anlasilmayan: 0 }, bos: true };
  }
  const used = new Array(tokens.length).fill(false);
  const eksenler = {};
  const anlasilmadi = [];

  for (const entry of P) {
    for (let i = 0; i < tokens.length; i++) {
      if (used[i] || tokens[i] !== entry.tokens[0]) continue;
      // Try to complete the phrase from i, allowing small gaps.
      const picks = [i];
      let pos = i;
      let okTokens = true;
      for (let k = 1; k < entry.tokens.length; k++) {
        let found = -1;
        for (let j = pos + 1; j <= Math.min(tokens.length - 1, pos + 1 + GAP); j++) {
          if (!used[j] && tokens[j] === entry.tokens[k]) { found = j; break; }
        }
        if (found === -1) { okTokens = false; break; }
        picks.push(found); pos = found;
      }
      if (!okTokens) continue;
      const kelime = picks.map((j) => tokens[j]).join(' ');
      const onceki = eksenler[entry.field];
      if (onceki && onceki.value !== entry.value) {
        // Same axis, second different word: NOT applied and NOT silent.
        anlasilmadi.push({
          kelime,
          oneri: `'${entry.field}' ekseni bu metinde zaten '${onceki.kelime}' -> '${onceki.value}' okundu; '${kelime}' uygulanmadı`,
        });
        for (const j of picks) used[j] = 'reported';
        continue;
      }
      for (const j of picks) used[j] = 'matched';
      if (!onceki) eksenler[entry.field] = { value: entry.value, kelime };
    }
  }

  let eslesen = 0, stop = 0, anlasilmayan = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (used[i] === 'matched') { eslesen++; continue; }
    if (used[i] === 'reported') { anlasilmayan++; continue; } // already in anlasilmadi
    if (STOP.has(tokens[i])) { stop++; continue; }
    anlasilmayan++;
    // A leftover token that belongs to a phrase of an already-set axis gets the
    // conflict sentence; anything else gets the nearest primitive.
    const owner = P.find((e) => e.tokens.includes(tokens[i]) && eksenler[e.field]);
    anlasilmadi.push(owner
      ? { kelime: tokens[i], oneri: `'${owner.field}' ekseni zaten '${eksenler[owner.field].value}' okundu; '${tokens[i]}' uygulanmadı` }
      : { kelime: tokens[i], oneri: `en yakın primitif: ${enYakinPrimitif(tokens[i])} (contract/primitives-v1.json)` });
  }
  return {
    eksenler,
    anlasilmadi,
    hesap: { toplam: tokens.length, eslesen, stop, anlasilmayan },
    bos: false,
  };
}

// ---------------------------------------------------------------------------
// F7-edit: SAYILI EDİT KALIPLARI — "yakayı 2cm derinleştir", "boyu 3 cm uzat",
// "kolu 2cm uzat", "2cm kısalt". Bunlar eksen-değer çifti DEĞİL, mm taşıyan
// operatörlerdir (patternedit.cpp), o yüzden kelime tablosuna girmezler: sayı
// kullanıcının kendi sayısıdır, sözlük değeri değil. Alan adları
// contract/edit-locality-v1.json fieldZones'ta İLANLIDIR; bölge kapısı
// (edit_locality_check.mjs) her birini ölçer. Birim yazılmadıysa cm okunur
// (kalıpçının konuştuğu birim); mm yazan mm alır.
const MIKTAR = '(\\d+(?:[.,]\\d+)?)\\s*(cm|mm)?';
const EDIT_PATTERNS = [
  { field: 'editNeckDeepenMM', re: new RegExp(`(?:yakayi|yaka(?:\\s+oyugunu)?)\\s+${MIKTAR}\\s+derinlestir\\w*`) },
  { field: 'editNeckDeepenMM', re: new RegExp(`deepen\\s+(?:the\\s+)?neck(?:line)?\\s+by\\s+${MIKTAR}`) },
  { field: 'editSleeveExtendMM', re: new RegExp(`(?:kolu|kollari)\\s+${MIKTAR}\\s+uzat\\w*`) },
  { field: 'editSleeveExtendMM', re: new RegExp(`lengthen\\s+(?:the\\s+)?sleeves?\\s+by\\s+${MIKTAR}`) },
  { field: 'editShortenMM', re: new RegExp(`(?:boyu\\s+|etegi\\s+)?${MIKTAR}\\s+kisalt\\w*`) },
  { field: 'editShortenMM', re: new RegExp(`shorten\\s+(?:it\\s+|the\\s+\\w+\\s+)?by\\s+${MIKTAR}`) },
  { field: 'editExtendMM', re: new RegExp(`(?:boyu\\s+|etegi\\s+)?${MIKTAR}\\s+uzat\\w*`) },
  { field: 'editExtendMM', re: new RegExp(`lengthen\\s+(?:it\\s+|the\\s+\\w+\\s+)?by\\s+${MIKTAR}`) },
];

/**
 * Sayılı edit kalıplarını metinden çeker. Döner: { alanlar, kalan }.
 * alanlar[field] = { mm, kelime }; kalan = eşleşen ifadeler ÇIKARILMIŞ metin
 * (parsePrompt'a o verilir ki "derinlestir" anlaşılmadı diye düşmesin).
 * Aynı alan iki kez yazılırsa İLK okuma kalır, ikincisi kalan metinde kalır ve
 * parsePrompt onu adıyla raporlar — sessiz üzerine yazma yok.
 */
export function parseEditPrompt(text) {
  let kalan = fold(text);
  const alanlar = {};
  for (const { field, re } of EDIT_PATTERNS) {
    const m = kalan.match(re);
    if (!m || alanlar[field]) continue;
    const sayi = Number(m[1].replace(',', '.'));
    if (!Number.isFinite(sayi) || sayi <= 0) continue;
    const birim = m[2] === 'mm' ? 1 : 10;
    alanlar[field] = { mm: sayi * birim, kelime: m[0].trim() };
    kalan = kalan.replace(m[0], ' ');
  }
  return { alanlar, kalan };
}

/**
 * Apply a parse onto a spec. THE PRIORITY RULE LIVES HERE (F1 madde 3): the
 * prompt is the user's explicit ask, so it overwrites whatever the photo read
 * — the caller labels every parsed axis `soruldu` and leaves the photo's
 * untouched axes `gorulen`. Returns the fields changed and the construction
 * consequences (to be labelled `zorunlu`, same as the photo path's).
 */
export function birlestir(spec, parsed) {
  const degisen = [];
  for (const [field, e] of Object.entries(parsed.eksenler)) {
    if (spec[field] !== e.value) degisen.push([field, spec[field], e.value]);
    spec[field] = e.value;
  }
  const zorunlu = [];
  // A sleeve head or a sleeve length needs an actual sleeve to sit on — the
  // same consequence create.js applies on the photo path (not a reading).
  const wantsSleeve = (parsed.eksenler.sleeveCap && parsed.eksenler.sleeveCap.value !== 'plain') ||
    (parsed.eksenler.sleeveLength && !parsed.eksenler.sleeveStyle);
  if (wantsSleeve && (!spec.sleeveStyle || spec.sleeveStyle === 'none') &&
      !(parsed.eksenler.sleeveStyle && parsed.eksenler.sleeveStyle.value === 'none')) {
    spec.sleeveStyle = 'straight';
    zorunlu.push('sleeveStyle');
  }
  return { degisen, zorunlu };
}
