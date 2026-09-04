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
import { VOCAB, canonical } from './vocab.gen.js?v=148';
// ⭐ M3-primitif — SÖZLÜK-DIŞI KELİMEYE PRİMİTİF CEVABI.
// Anlaşılmayan bir kelime bugüne kadar yalnızca "en yakın primitif: op.gather"
// diye bir İSİM alıyordu; bu bir cevap değil bir işaretti. Aynı kelime fotoğraf
// hattında ise contract'ın eşleme tablosundan geçip ya bir PRİMİTİF DEMETİNE
// bağlanıyor ya adıyla reddedilip en yakın dikilebilir öneriyi alıyordu. İki
// hat aynı kelimeye iki ayrı şey söylüyordu. Yargı artık tek yerde
// (web/js/oov-resolve.js) ve prompt hattı da onu çağırıyor.
import { oovKarariVer, oovAdaylari } from './oov-resolve.js?v=148';

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

T('neckline', 'crew', ['crew', 'neck'], ['crew', 'neckline'], 'crew', ['bisiklet', 'yaka']);
T('neckline', 'scoop', 'scoop', ['scoop', 'neckline'], ['oval', 'yaka']);
T('neckline', 'vNeck', 'vneck', ['v', 'neck'], ['v', 'neckline'], ['v', 'yaka']);
T('neckline', 'square', ['square', 'neckline'], ['square', 'neck'], ['kare', 'yaka']);
T('neckline', 'boat', ['boat', 'neck'], ['boat', 'neckline'], 'boat', 'bateau', ['kayik', 'yaka']);
T('neckline', 'sweetheart', ['sweetheart', 'neckline'], 'sweetheart', ['kalp', 'yaka']);
T('neckline', 'halter', ['halter', 'neckline'], 'halter', ['boyundan', 'bagli']);
T('neckline', 'cowl', ['cowl', 'neckline'], 'cowl', ['dokumlu', 'yaka']);
T('neckline', 'pussyBow', ['pussy', 'bow'], ['fiyonk', 'yaka']);

T('sleeveStyle', 'none', 'sleeveless', 'kolsuz', 'strapless', 'straplez',
  ['without', 'sleeves'], ['no', 'sleeves']);
// ⭐ M6-zaten — 'fitted' TEK BAŞINA BİR KOL ŞEKLİ DEĞİLDİR.
// ÖLÇÜLDÜ 2026-09-04: `fitted dress with a back zipper` ekranda BAŞARI satırı
// olarak `fitted → sleeveStyle: straight` bastı. Kolsuz istenen bir elbiseye
// düz kol eklendi ve bu "okudum" diye duyuruldu. `fitted` alıcı için bir
// SİLÜET kelimesidir; kolu ancak cümlede bir KOL ekseni varken niteler
// (`long fitted sleeves`). Bare hâli aşağıda ZATEN tablosuna düşer, çünkü
// motorun varsayılanı (measurements.hpp `Shaping shaping = Shaping::Dart`)
// zaten belde pens açıyor — ölçüldü: bodice front markings = 2 pens,
// rehber adımı "Sew all darts first".
T('sleeveStyle', 'straight', ['straight', 'sleeves'], ['straight', 'sleeve'],
  ['duz', 'kol']);
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
// "gathered (empire) waist" on a dress = the skirt is gathered into the waist
// seam. skirtStyle:'gathered' already exists and is already named below by
// 'gathered skirt'; this is the second NAME of the same value, not a new one.
T('skirtStyle', 'gathered', ['gathered', 'waist'], ['buzgulu', 'bel']);

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
  // 'that'/'this' are relative/demonstrative words ("a dress THAT zips up the
  // front"); no table entry carries them, so nothing semantic hides here.
  'that', 'this',
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

// ⭐ M4-edge — TÜRKÇE EKİ, YENİ KELİME DEĞİLDİR.
//
// MEASURED 2026-09-03: `kare yakalı puf kollu elbise` — the single most ordinary
// Turkish way to order this garment — read the puff sleeve and the dress and
// then told the user, twice, "bunu henüz dikemiyorum, kelime kalıp motorunun
// sözlüğü dışında" about `kare` and `yakalı`. The engine draws a square
// neckline. The table carries ['kare','yaka']; the typed token was `yakali`.
// A whole axis was lost to one agglutinative suffix, and the user was told a
// FALSE sentence about the engine's ability — which is worse than silence.
//
// ⛔ THIS IS NOT MENU GROWTH (madde 9). No value, no phrase and no axis is
// added: `engine/vocab.json` and the table above stay byte-identical. What
// changes is that ONE TOKEN may lose a closed set of Turkish inflectional
// suffixes before it is compared. A stem is only tried when the token itself
// matched nothing, and the READ WORD reported back to the user is the token the
// user actually typed, so nothing is read behind their back.
//
// The set is deliberately the SMALL productive one for garment features:
//   -lı/-li/-lu/-lü  (folded: li, lu)  "yakalı, cepli, düğmeli, pileli"
//   -lar/-ler                          "cepler, kollar"
//   -ları/-leri                        "kolları"
// -sız/-siz (kolSUZ) is ABSENT ON PURPOSE: it negates, so stripping it would
// turn "sleeveless" into "sleeve" — the exact silent inversion this file exists
// to prevent.
const TR_EKLER = ['lari', 'leri', 'lar', 'ler', 'li', 'lu'];

// ⭐ M7-cogul — İNGİLİZCE ÇOĞUL EKİ DE YENİ KELİME DEĞİLDİR.
//
// ÖLÇÜLDÜ 2026-09-04: `gathered dress with puff sleeves`
//   -> anlasilmadi ['sleeves' → "sleeveCap was already read as 'puffed'"]
// Tablo `['puff','sleeve']` taşıyor, kullanıcı `sleeves` yazdı ve İNGİLİZCE
// satan bir sitede "sleeves" kelimesi kırmızıya boyandı. Türkçe eki soyan kural
// (M4-edge) yukarıda beş haftadır duruyor; İngilizce çoğul eki için aynı kural
// yoktu. `zips` de aynı sebeple hiçbir şeye bağlanmıyordu.
//
// ⛔ MENÜ BÜYÜTME DEĞİL (madde 9): tek bir değer/ifade/eksen eklenmiyor,
// engine/vocab.json bayt bayt aynı. Bir token, tablodaki hâliyle eşleşmediyse
// kapalı bir çekim eki kümesini kaybedebiliyor. `-less` (sleeveLESS) burada da
// YOK: olumsuzlar, soyulursa "kolsuz" -> "kol" olur.
const EN_EKLER = ['es', 's'];

/** Stems to try for one token, most specific first. Always starts with the
 *  token itself, so an exact table hit can never be beaten by a stem. */
function govdeler(tok) {
  const out = [tok];
  for (const ek of TR_EKLER) {
    if (!tok.endsWith(ek) || tok.length - ek.length < 3) continue;
    const stem = tok.slice(0, tok.length - ek.length);
    out.push(stem);
    // Turkish consonant doubling: kol + lu -> kollu, so the stripped stem can
    // end in a doubled consonant that the dictionary form does not have.
    if (stem.length >= 4 && stem[stem.length - 1] === stem[stem.length - 2]) {
      out.push(stem.slice(0, -1));
    }
  }
  for (const ek of EN_EKLER) {
    if (!tok.endsWith(ek) || tok.length - ek.length < 3) continue;
    out.push(tok.slice(0, tok.length - ek.length));
  }
  return out;
}

/** Does `tok` speak the table token `want`, allowing a Turkish suffix? */
function tokenEsler(tok, want) {
  if (tok === want) return true;
  return govdeler(tok).includes(want);
}

// ⭐ M5-yon — YÖN KELİMESİ SERBEST KELİME DEĞİL, EKSENİN DEĞERİDİR.
//
// MEASURED 2026-09-04, before this function existed:
//   parsePrompt('... exposed zip at center back')
//     -> eksenler.exposedZip = 'centerFront'
//        anlasilmadi ['center' → en yakın primitif: edge,
//                     'back'   → tek başına bir eksen belirtmiyor]
// The user wrote the direction OUT LOUD, the axis has a `centerBack` value in
// engine/vocab.json, and the engine drew the zip on the FRONT while announcing
// the read as a SUCCESS. That is the worst class of bug in this repo: a silent
// default wearing the user's own words. A back-zip dress sewn with a front zip
// is a ruined garment, not a mis-render.
//
// ⛔ NOT MENU GROWTH (madde 9). No value and no phrase is added: `centerBack`
// is already in the vocabulary, it simply had no way to be spoken. The rule is
// structural and axis-agnostic: IF a matched axis landed on a value whose only
// difference from a sibling value in the SAME vocabulary enum is the direction
// word Front/Back, THEN an unconsumed direction token in the sentence is that
// axis's business, not a free word. It binds, it is consumed, and the read is
// reported with the user's own words in it.
const YON = [
  { yon: 'Front', tokens: ['front', 'onden', 'onde'] },
  { yon: 'Back', tokens: ['back', 'arka', 'arkada', 'arkadan', 'sirt', 'sirtta'] },
];
// 'center'/'orta' rides along with the direction when the value is center-*.
// It is never a direction on its own, so it can only be consumed as a partner.
const ORTA = ['center', 'centre', 'orta'];

/** Value in `values` that is `value` with its direction word swapped, or null. */
function yonKardesi(values, value, yon) {
  for (const y of YON) {
    if (y.yon === yon || !value.endsWith(y.yon)) continue;
    const kardes = value.slice(0, -y.yon.length) + yon;
    if (values.includes(kardes)) return kardes;
  }
  return null;
}

/** Bind a loose front/back token to the axis whose value it qualifies. */
function yonNiteleyiciBagla(tokens, used, eksenler) {
  for (const [field, e] of Object.entries(eksenler)) {
    const values = (VOCAB[field] && VOCAB[field].values) || [];
    // Only axes that actually carry a Front/Back pair are eligible.
    if (!YON.some((y) => e.value.endsWith(y.yon))) continue;
    let best = -1, bestYon = null, bestD = Infinity;
    for (let i = 0; i < tokens.length; i++) {
      if (used[i]) continue;
      const y = YON.find((v) => v.tokens.some((w) => tokenEsler(tokens[i], w)));
      if (!y) continue;
      const d = Math.min(...e.idx.map((j) => Math.abs(j - i)));
      if (d < bestD) { bestD = d; best = i; bestYon = y.yon; }
    }
    if (best === -1) continue;
    const kardes = e.value.endsWith(bestYon) ? e.value : yonKardesi(values, e.value, bestYon);
    if (!kardes) continue; // the axis has no sibling in that direction: leave the word loose.
    const alinan = [best];
    // A neighbouring 'center'/'orta' belongs to the same phrase.
    if (kardes.startsWith('center')) {
      for (let j = Math.max(0, best - 1 - GAP); j <= Math.min(tokens.length - 1, best + 1 + GAP); j++) {
        if (!used[j] && ORTA.some((w) => tokenEsler(tokens[j], w))) { alinan.push(j); break; }
      }
    }
    for (const j of alinan) used[j] = 'matched';
    e.value = kardes;
    e.idx = e.idx.concat(alinan);
    e.kelime = `${e.kelime} ${alinan.sort((a, b) => a - b).map((j) => tokens[j]).join(' ')}`;
  }
}

// ⭐ M6-zaten (a) — DEĞER NİTELEYİCİSİ: SÖZLÜĞÜN KENDİ EŞ ANLAMLISI, KOMŞUSUNA
// BAĞLI OKUNUR.
//
// `fitted` engine/vocab.json'da sleeveStyle'ın eş anlamlısıdır ("fitted" ->
// "straight") — AMA yalnız bir KOLU nitelerken. Tabloya serbest kelime olarak
// yazıldığında `fitted dress` cümlesine kimsenin istemediği düz kolu ekliyordu.
// Kural yapısal: bir eş anlamlı ancak cümle o eksenin AİLESİNDEN bir eksen
// zaten okuduysa bağlanır. Yeni değer, yeni ifade, yeni eksen YOK; var olan
// eş anlamlı tablosu (VOCAB[field].synonyms) okunuyor.
const NITELEYICI = [
  // token -> hangi eksene, o eksen ailesinden biri cümlede varsa
  { token: 'fitted', field: 'sleeveStyle', aile: ['sleeveStyle', 'sleeveLength', 'sleeveCap', 'cuffStyle'] },
];

// ⭐ M7-mesafe — SIFAT, CÜMLEDE BİR YERDE DEĞİL, NİTELEDİĞİ ŞEYİN YANINDA DURUR.
//
// ÖLÇÜLDÜ 2026-09-04:
//   'a fitted midi dress with gathered puff sleeves and a zipper at the back'
//     -> BAŞARI satırı: "fitted -> sleeveStyle: straight"
// Kullanıcı PUF kol istedi; uygulama düz kol okuduğunu okundu diye yazdı, üstelik
// aynı ekranda sleeveCap: puffed de duruyordu — iki çelişen okuma yan yana.
// Sebep: kural, cümlede kol ailesinden HERHANGİ bir eksen varsa bağlıyordu;
// oysa buradaki `fitted` `dress`in sıfatı (indeks 1), kolun kelimeleri indeks
// 5-7'de. Aynı dosyanın ifade eşleştiricisi zaten bir MESAFE bütçesiyle çalışır
// (GAP): sıfat da o bütçeye uyar. `long fitted sleeves` bağlanmaya devam eder,
// çünkü orada sıfat gerçekten kolun yanındadır.
const NITELEYICI_MESAFE = 1 + GAP;

function niteleyiciBagla(tokens, used, eksenler) {
  for (const n of NITELEYICI) {
    const hedef = canonical(n.field, n.token);
    if (hedef === undefined) continue; // the synonym left the vocabulary: bind nothing.
    const aileIdx = n.aile.flatMap((f) => (eksenler[f] ? eksenler[f].idx : []));
    if (!aileIdx.length) continue;
    for (let i = 0; i < tokens.length; i++) {
      if (used[i] || !tokenEsler(tokens[i], n.token)) continue;
      if (Math.min(...aileIdx.map((j) => Math.abs(j - i))) > NITELEYICI_MESAFE) continue;
      used[i] = 'matched';
      const onceki = eksenler[n.field];
      if (onceki) { onceki.idx.push(i); onceki.kelime += ` ${tokens[i]}`; }
      else eksenler[n.field] = { value: hedef, kelime: tokens[i], idx: [i] };
      break;
    }
  }
}

// ⭐ M6-zaten (b) — MOTORUN ZATEN ÇİZDİĞİ ŞEYE "ANLAMADIM" DEMEK YALANDIR.
//
// ÖLÇÜLDÜ 2026-09-04, bu tablo yokken:
//   'invisible zipper center back' -> 0 eksen, dört kelime de kırmızı
//      ('invisible' -> "en yakın primitif: bodice")
//   'back zip dress' / 'zipper at back' / 'arkadan fermuarlı elbise' -> 0 fermuar
// Oysa MOTOR ÇIKTISINDA ÖLÇÜLDÜ (engine/dist, varsayılan elbise):
//   pieces[Bodice Back].closure === 'invisible zipper (center back)'
//   guideSteps: "Insert an invisible zipper in the center back through bodice
//   and skirt". Yani kullanıcının istediği şey ZATEN çiziliydi ve ona
//   "bunu bilmiyorum" dendi. Bu, sessiz default'tan beter: var olan bir
//   yeteneği inkâr etmek.
//
// ⛔ MENÜ BÜYÜTME DEĞİL (madde 9): tek bir eksen, değer ya da ifade
// eklenmiyor; engine/vocab.json bayt bayt aynı. Eklenen şey bir CEVAP:
// motorun koşulsuz yaptığı işi adıyla söylemek. Her kayıt bir MOTOR OLGUSUNA
// dayanır ve `kanit` alanında o olgunun kaynağı yazılıdır.
const ZATEN = [
  {
    id: 'cbZip',
    kanit: 'engine/src/garment.cpp annotateTechnical: closure "invisible zipper (center back)"',
    tokens: ['zipper', 'zip', 'fermuar'],
    // ⭐ M7-yon — "ZATEN VAR" CEVABI, KULLANICININ YAZDIĞI YÖNE BAKMADAN
    // VERİLEMEZ. Motorun koşulsuz çizdiği fermuar ARKA ortadadır (`yon`).
    // ÖLÇÜLDÜ 2026-09-04: 'dress with a front zipper' -> ekran "you already
    // have it: invisible CENTER-BACK zipper" dedi ve 'front' kelimesine
    // "not understood" bastı. ÖNDEN isteyene ARKADAN verip "zaten var" demek,
    // sessiz default'un en kötü hâli: kullanıcının kendi kelimesi inkâr
    // ediliyor. Oysa motor önden çizebiliyor — exposedZip'in sözlüğünde
    // `centerFront` DEĞERİ ZATEN VAR (vocab.json ExposedZip) ve
    // 'exposed zip at center front' cümlesi bugün de çalışıyor; eksik olan tek
    // şey, o değerin sıradan bir cümleyle söylenebilmesiydi.
    // ⛔ Menü büyütme değil: yeni değer/ifade/eksen yok, yalnız var olan
    // `exposedZip: centerFront` konuşulabilir hâle geliyor.
    yon: 'Back',
    yonEkseni: 'exposedZip',
    // Komşu nitelikler aynı ifadeye aittir; ayrı ayrı kırmızı satır olamazlar.
    nitelik: ['invisible', 'hidden', 'concealed', 'gizli', 'normal',
      'back', 'arka', 'arkada', 'arkadan', 'sirt', 'sirtta',
      'center', 'centre', 'orta'],
    // Fermuar kararı ÖLÇÜLÜ (wearability.cpp: en dar geçiş vs baş çevresi) ve
    // yalnız elbisede bir CB dikişi var; etek/üstte motor fermuar çizmiyor.
    kosul: (e) => (e.garment ? e.garment.value : 'dress') === 'dress',
    evet: {
      tr: 'zaten çiziliyor: elbise arka ortada gizli fermuarla kapanıyor; gerekli mi diye motor senin ölçünle karar veriyor ve sonuç sayfasında sebebini yazıyor',
      en: 'already drawn: the dress closes with an invisible center-back zipper; whether you need one is decided from your own measurements and the reason is printed on the result page',
    },
    hayir: {
      tr: 'bu giysinin fermuarı yok — etek ve üst baştan/belden geçerek giyiliyor; fermuar istiyorsan "elbise" yaz',
      en: 'this garment has no zipper — a skirt and a top are pulled on, no closure is drafted; write "dress" if you want the zippered one',
    },
  },
  {
    id: 'fitted',
    kanit: 'engine/src/measurements.hpp: Shaping shaping = Shaping::Dart (default); bodice front markings = 2 waist darts',
    tokens: ['fitted', 'tailored'],
    nitelik: ['vucuda', 'oturan', 'dar'],
    kosul: () => true,
    evet: {
      tr: 'zaten çiziliyor: gövde belde pensle daraltılıyor (varsayılan pens; "prenses" yazarsan prenses dikişi olur)',
      en: 'already drawn: the body is taken in at the waist with darts (the default; write "princess" for princess seams instead)',
    },
  },
];

/** Consume the ZATEN phrases and their neighbouring qualifiers. */
function zatenOku(tokens, used, eksenler) {
  const out = [];
  for (const z of ZATEN) {
    let anchor = -1;
    for (let i = 0; i < tokens.length && anchor === -1; i++) {
      if (used[i]) continue;
      if (z.tokens.some((w) => tokenEsler(tokens[i], w))) anchor = i;
    }
    if (anchor === -1) continue;
    // M7-yon: does the sentence name a direction this engine fact does NOT have?
    // If so, the fact is not an answer — the axis that carries that direction is.
    if (z.yon && z.yonEkseni && !eksenler[z.yonEkseni]) {
      const values = (VOCAB[z.yonEkseni] && VOCAB[z.yonEkseni].values) || [];
      let karsi = -1, karsiYon = null;
      for (let j = 0; j < tokens.length; j++) {
        if (used[j] || Math.abs(j - anchor) > 1 + GAP) continue;
        const y = YON.find((v) => v.tokens.some((w) => tokenEsler(tokens[j], w)));
        if (!y || y.yon === z.yon) continue;
        karsi = j; karsiYon = y.yon; break;
      }
      const deger = karsiYon && values.find((v) => v.endsWith(karsiYon) && v !== 'none');
      if (deger) {
        const alinan = [anchor, karsi];
        for (let j = Math.max(0, karsi - 1 - GAP); j <= Math.min(tokens.length - 1, karsi + 1 + GAP); j++) {
          if (!used[j] && !alinan.includes(j) && deger.startsWith('center') &&
              ORTA.some((w) => tokenEsler(tokens[j], w))) { alinan.push(j); break; }
        }
        alinan.sort((a, b) => a - b);
        for (const j of alinan) used[j] = 'matched';
        eksenler[z.yonEkseni] = {
          value: deger,
          kelime: alinan.map((j) => tokens[j]).join(' '),
          idx: alinan,
        };
        continue;
      }
    }
    const alinan = [anchor];
    for (let j = 0; j < tokens.length; j++) {
      if (used[j] || j === anchor || Math.abs(j - anchor) > 1 + GAP) continue;
      if (z.nitelik.some((w) => tokenEsler(tokens[j], w))) alinan.push(j);
    }
    for (const j of alinan) used[j] = 'zaten';
    const tamam = z.kosul(eksenler);
    out.push({
      id: z.id,
      kelime: alinan.sort((a, b) => a - b).map((j) => tokens[j]).join(' '),
      durum: tamam ? 'ciziliyor' : 'yok',
      metin: tamam ? z.evet : z.hayir,
      kanit: z.kanit,
    });
  }
  return out;
}

/**
 * ⭐ OKUNMUS BIR EKSENIN KENDI ADI "ANLASILMADI" DEGILDIR (T4-hakem, kusur 6).
 *
 * OLCULEN HATA (canli site, tek okumada ayni ekran): "knit -> fabric: knit"
 * DOGRU okundu, ve AYNI ekranda kirmiziyla "not understood: fabric — I cannot
 * draw this as a detail of its own; the closest thing I can draw is the flare"
 * yazdi. Ayni sekilde "peter pan -> collarType: peterPan" okundu ve 'collar'
 * kelimesi kirmizi bir satir dogurdu. Alici, cumlesinin TAMAMI dogru okunmusken
 * ekranda dort kirmizi "anlamadim" satiri goruyordu.
 *
 * KOK SEBEP: `P` tablosu ekseni STIL KELIMESIYLE tasiyor ('knit', 'peter pan'),
 * eksenin KENDI ADIYLA degil. Cumledeki 'fabric' / 'collar' / 'neckline'
 * kelimeleri hicbir ifadeye ait olmadigi icin artik kalıyor ve artik kelimeler
 * dogrudan "en yakin primitif" cikmaz sokagina dusuyor — kelimenin gercek
 * karsiligi zaten O SATIRDA okunmus olmasina ragmen.
 *
 * ⛔ TABLOYA HICBIR KELIME EKLENMEDI. Eslesme, spec eksen ADININ kendisinden
 * turer: `collarType` -> ['collar','type'], `fabric` -> ['fabric'],
 * `skirtLength` -> ['skirt','length']. Yani yeni bir sozluk degil, var olan
 * eksen adlarinin okunmasi. Ve yalnizca O EKSEN ZATEN OKUNMUSSA yutulur:
 * okunmamis bir eksenin adi hala gercek bir bosluktur ve kirmizi kalir.
 */
function eksenAdiYut(tokens, used, eksenler) {
  const parcala = (alan) => alan.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().split(/\s+/);
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    if (used[i]) continue;
    for (const alan of Object.keys(eksenler)) {
      if (!parcala(alan).some((w) => tokenEsler(tokens[i], w))) continue;
      const e = eksenler[alan];
      used[i] = 'zaten';
      out.push({
        id: `eksen-adi:${alan}`,
        kelime: tokens[i],
        durum: 'ciziliyor',
        metin: {
          tr: `'${alan}' ekseni bu cumlede zaten '${e.kelime}' -> '${e.value}' olarak okundu`,
          en: `${alan} was already read in this sentence as '${e.value}' from '${e.kelime}'`,
        },
        kanit: `eksenler.${alan}`,
      });
      break;
    }
  }
  return out;
}

/** One report line, in both languages, built once. */
const rapor = (kelime, tr, en) => ({ kelime, oneri: tr, oneriI18n: { tr, en } });

/**
 * Deterministic parse: free text -> existing spec axes + the honest remainder.
 * Returns { eksenler, anlasilmadi, zaten, hesap, bos }.
 */
export function parsePrompt(text) {
  const tokens = fold(text).match(/[a-z0-9]+/g) || [];
  if (!tokens.length) {
    return { eksenler: {}, anlasilmadi: [], oovKarar: [], zaten: [], hesap: { toplam: 0, eslesen: 0, stop: 0, zaten: 0, anlasilmayan: 0 }, bos: true };
  }
  const used = new Array(tokens.length).fill(false);
  const eksenler = {};
  const anlasilmadi = [];

  for (const entry of P) {
    for (let i = 0; i < tokens.length; i++) {
      if (used[i] || !tokenEsler(tokens[i], entry.tokens[0])) continue;
      // Try to complete the phrase from i, allowing small gaps.
      const picks = [i];
      let pos = i;
      let okTokens = true;
      for (let k = 1; k < entry.tokens.length; k++) {
        let found = -1;
        for (let j = pos + 1; j <= Math.min(tokens.length - 1, pos + 1 + GAP); j++) {
          if (!used[j] && tokenEsler(tokens[j], entry.tokens[k])) { found = j; break; }
        }
        if (found === -1) { okTokens = false; break; }
        picks.push(found); pos = found;
      }
      if (!okTokens) continue;
      const kelime = picks.map((j) => tokens[j]).join(' ');
      const onceki = eksenler[entry.field];
      if (onceki && onceki.value !== entry.value) {
        // Same axis, second different word: NOT applied and NOT silent.
        anlasilmadi.push(rapor(kelime,
          `'${entry.field}' ekseni bu metinde zaten '${onceki.kelime}' -> '${onceki.value}' okundu; '${kelime}' uygulanmadı`,
          `this sentence already set ${entry.field} to '${onceki.value}' with '${onceki.kelime}', so '${kelime}' was not applied`));
        for (const j of picks) used[j] = 'reported';
        continue;
      }
      for (const j of picks) used[j] = 'matched';
      if (!onceki) eksenler[entry.field] = { value: entry.value, kelime, idx: picks.slice() };
    }
  }

  niteleyiciBagla(tokens, used, eksenler);
  yonNiteleyiciBagla(tokens, used, eksenler);
  const zaten = zatenOku(tokens, used, eksenler);
  // Eksenin kendi adi, `zatenOku`'dan SONRA yutulur: ZATEN tablosunun kendi
  // capalari (fermuar, pens) once konusur, artan eksen adi ondan sonra.
  zaten.push(...eksenAdiYut(tokens, used, eksenler));

  let eslesen = 0, stop = 0, anlasilmayan = 0, zatenSayi = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (used[i] === 'matched') { eslesen++; continue; }
    // A ZATEN token IS matched — it landed on a construction the engine draws
    // unconditionally and it gets its own printed line. It stays inside
    // `eslesen` so the zero-silence arithmetic (toplam = eslesen+stop+
    // anlasilmayan) keeps its original shape; `hesap.zaten` is a SUBSET of
    // `eslesen`, not a fourth bucket.
    if (used[i] === 'zaten') { eslesen++; zatenSayi++; continue; }
    if (used[i] === 'reported') { anlasilmayan++; continue; } // already in anlasilmadi
    if (STOP.has(tokens[i])) { stop++; continue; }
    anlasilmayan++;
    // A leftover token that belongs to a phrase of an already-set axis gets the
    // conflict sentence; anything else gets the nearest primitive.
    // ⭐ M7-sahip — BİR KELİME İKİ EKSENDE YAŞIYORSA, "O EKSEN ZATEN OKUNDU"
    // CÜMLESİ YANLIŞ EKSENİ SUÇLAR.
    // ÖLÇÜLDÜ 2026-09-04: 'gathered dress with puff sleeves' -> 'gathered' için
    // ekran "sleeveCap was already read as 'puffed'" dedi. Kullanıcı BÜZGÜLÜ
    // ETEK istiyordu; kelime tabloda hem skirtStyle'da hem sleeveCap'te yaşıyor
    // ve `find` sırf listede önce geldiği için kolu suçladı. Başlık sessizce
    // "A-line puff-sleeve dress" oldu. Çakışma cümlesi ancak kelimenin TEK bir
    // ekseni varsa doğrudur; birden çok eksende yaşıyorsa doğru cevap, hangi
    // tamamlamayı beklediğini söylemektir (aşağıdaki yarım-ifade cümlesi).
    const sahipler = [...new Set(P.filter((e) => e.tokens.some((w) => tokenEsler(tokens[i], w)))
      .map((e) => e.field))];
    const owner = sahipler.length === 1 && eksenler[sahipler[0]]
      ? { field: sahipler[0] } : null;
    if (owner) {
      anlasilmadi.push(rapor(tokens[i],
        `'${owner.field}' ekseni zaten '${eksenler[owner.field].value}' okundu; '${tokens[i]}' uygulanmadı`,
        `${owner.field} was already read as '${eksenler[owner.field].value}', so '${tokens[i]}' was not applied`));
      continue;
    }
    // ⭐ M4-edge — "BU KELİME SÖZLÜĞÜN DIŞINDA" DEMEK, KELİME SÖZLÜKTEYKEN, YALAN.
    //
    // MEASURED 2026-09-03 on the mixed TR/EN sentence a Turkish user actually
    // types — `square yakali puf kollu mini dress` — the word `square` came back
    // as "bunu henüz dikemiyorum, kelime kalıp motorunun sözlüğü dışında". The
    // engine draws neckline:'square'. The word is IN the table; what was missing
    // was its partner token (the table carries `square neckline`, not
    // `square` + a Turkish `yaka`). Telling a buyer the engine cannot do
    // something it does is worse than saying nothing, and it is a dead end: the
    // sentence offers no way forward.
    //
    // ⛔ NOTHING IS ADDED TO THE TABLE to fix this (madde 9): the answer is to
    // say WHICH COMPLETION the known word needs. Zero new values, zero new
    // phrases, engine/vocab.json untouched.
    // ANY position, not just the first: `yakali` ('yaka') is the SECOND token of
    // every Turkish neckline phrase, so a first-token-only lookup left the most
    // common Turkish garment word in the repo pointing at "en yakın primitif".
    const yarim = P.filter((e) => e.tokens.length > 1 &&
      e.tokens.some((w) => tokenEsler(tokens[i], w)));
    if (yarim.length) {
      const tamam = [...new Set(yarim.map((e) => e.tokens.join(' ')))].slice(0, 3);
      anlasilmadi.push(rapor(tokens[i],
        `'${tokens[i]}' bilinen bir kelime ama tek başına bir eksen belirtmiyor; şöyle yaz: ${tamam.join(' / ')}`,
        `'${tokens[i]}' is a word I know, but on its own it does not say which detail you mean; try: ${tamam.join(' / ')}`));
      continue;
    }
    // ⭐ BIR OKUNMUS IFADENIN YANINDAKI SIFAT, "EN YAKIN PRIMITIF" DEGILDIR
    //    (T4-hakem, kusur 6).
    // OLCULEN HATA: '... deep v neckline' cumlesinde 'v neckline' DOGRU okundu
    // (neckline: vNeck) ve komsusundaki 'deep' icin ekrana "I cannot draw this
    // as a detail of its own; the closest thing I can draw is the EDGE" yazildi.
    // Bu cumle iki kez yanlis: kelime bir yaka DERINLIGI niteliyor, ve onerilen
    // 'edge' ekseninin onunla hicbir alakasi yok — `enYakinPrimitif` bir metin
    // yakinligi olcusu, bir anlam olcusu degil, ve komsusu zaten okunmus bir
    // artik uzerinde calistirilinca sacma cikiyor. Dogru cevap komsudan turer:
    // hangi ekseni hangi kelimeden okudugumu soyle, ve o eksenin bu sifat icin
    // ayri bir kadrani OLMADIGINI adiyla soyle. Yeni kelime, yeni tablo YOK.
    const komsuAlan = (() => {
      for (const [alan, e] of Object.entries(eksenler)) {
        if (!Array.isArray(e.idx)) continue;
        if (e.idx.some((j) => Math.abs(j - i) <= 1 + GAP)) return { alan, e };
      }
      return null;
    })();
    if (komsuAlan) {
      anlasilmadi.push(rapor(tokens[i],
        `'${komsuAlan.alan}' ekseni yanindaki '${komsuAlan.e.kelime}' kelimesinden okundu; ` +
        `'${tokens[i]}' icin ayri bir kadran yok, uygulanmadi`,
        `I read ${komsuAlan.alan} from '${komsuAlan.e.kelime}' next to it; there is no separate dial for '${tokens[i]}', so it was not applied`));
      continue;
    }
    // ⭐ M6-zaten: the dead end used to read "en yakın primitif: bodice
    // (contract/primitives-v1.json)" — an internal file path and a word
    // ('primitif') that means nothing to someone buying a pattern. Same
    // pointer, said in the buyer's language, no repo path.
    anlasilmadi.push(rapor(tokens[i],
      `bunu tek bir detay olarak çizemiyorum; en yakın çizebildiğim şey '${enYakinPrimitif(tokens[i]).replace('op.', '')}' ekseni`,
      `I cannot draw this as a detail of its own; the closest thing I can draw is the ${enYakinPrimitif(tokens[i]).replace('op.', '')}`));
  }
  // ⭐ SÖZLÜK-DIŞI KELİMELER, CONTRACT'IN KENDİ TABLOSUNDAN GEÇİRİLİYOR.
  // `anlasilmadi` bir kelimenin en yakın PRİMİTİF ADINI söylüyor; bu, kullanıcı
  // için bir cevap değil. `oovKarar` aynı kelimelere fotoğraf hattının verdiği
  // cevabın AYNISINI verir: ya bir primitif demeti (op.split + seam …) ya adıyla
  // bir ret + en yakın dikilebilir öneri. Adaylar hem tek kelime hem KOMŞU İKİLİ
  // olarak üretilir, çünkü tablonun kurallarının çoğu iki kelimelik ('welt
  // pocket'); yalnız tek kelimeye bakan bir çağrı onları hiç göremezdi.
  // ⭐ M4-edge: A TOKEN THE TABLE CARRIES IS NOT OUT OF VOCABULARY, whatever
  // else went wrong with it. `square` in "square yakali" failed to complete its
  // phrase; sending it down this channel made the engine say "the word is
  // outside the pattern engine's vocabulary" about a word it drafts. The
  // incomplete-phrase sentence above is that token's honest answer.
  const bilinmeyenIdx = [];
  for (let i = 0; i < tokens.length; i++) {
    if (used[i] === 'matched' || STOP.has(tokens[i])) continue;
    if (P.some((e) => e.tokens.some((w) => tokenEsler(tokens[i], w)))) continue;
    bilinmeyenIdx.push(i);
  }
  const oovTokens = tokens.map((w) => (STOP.has(w) ? null : w));
  const oovKarar = oovAdaylari(oovTokens, bilinmeyenIdx).map((t) => oovKarariVer(t, null));

  // ⭐ M6-zaten — CONTRACT'IN CEVABI VARKEN LEVENSHTEIN TAHMİNİ BASMAK.
  // ÖLÇÜLDÜ 2026-09-04: 'shirt dress with buttons' -> 'buttons' için ekrana
  // "en yakın primitif: op.extend" yazılıyordu. Oysa AYNI ÇAĞRIDA
  // contract/vision-tasima-v1.json'ın `dugmeSirasi` kuralı o kelimeyi
  // buttonRow eksenine bağlamıştı; cevap hesaplanıp atılıyordu. Harf-mesafesi
  // tahmini yalnız contract'ın da bir sözü olmadığında konuşur.
  for (const k of oovKarar) {
    const idx = anlasilmadi.findIndex((u) => k.term.split(' ').includes(u.kelime));
    if (idx === -1) continue;
    const u = anlasilmadi[idx];
    // Bilinen-kelime-yarım-ifade cümlesi (M4-edge) daha iyidir, ona dokunma.
    if (/şöyle yaz|zaten/.test(u.oneri)) continue;
    if (k.durum === 'eslendi') {
      anlasilmadi[idx] = rapor(u.kelime,
        `'${k.term}' bu motorda '${k.eksen}' ekseninde yaşıyor; aşağıdaki seçimlerden onu aç`,
        `'${k.term}' lives on the '${k.eksen}' setting in this engine — turn it on in the picks below`);
    } else if (k.kural !== 'bilinmeyen' && k.sebep && k.oneri) {
      // Only a NAMED contract rule ("welt pocket", "hood") says something a
      // buyer can act on. The generic `bilinmeyen` verdict carries no garment
      // information, so the nearest-drawable pointer above stays.
      anlasilmadi[idx] = rapor(u.kelime,
        `${k.sebep.tr} — ${k.oneri.tr}`, `${k.sebep.en} — ${k.oneri.en}`);
    }
  }

  return {
    eksenler,
    anlasilmadi,
    oovKarar,
    zaten,
    hesap: { toplam: tokens.length, eslesen, stop, anlasilmayan, zaten: zatenSayi },
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
  return { degisen, zorunlu, konaksiz: konaksizEksenler(parsed) };
}

// ⭐ M4-edge — ÇELİŞKİLİ PROMPT SESSİZCE ÇÖZÜLÜYORDU.
//
// MEASURED 2026-09-03, before this function existed:
//   parsePrompt('kolsuz uzun kollu elbise')
//     -> eksenler { sleeveStyle:'none', sleeveLength:'long', garment:'dress' }
//        anlasilmadi []   hesap.anlasilmayan 0
// Four tokens, four matched, zero reported. The conflict guard above this one
// only fires when TWO WORDS LAND ON THE SAME AXIS ('mini' + 'midi'); a
// contradiction spread ACROSS two axes was invisible, and `uzun kollu` — half
// the user's sentence — was applied to an axis that a sleeveless garment does
// not have and then dropped without a word. That is a silent default with the
// user's own text in it.
//
// The host rules below are NOT a new table: they are the three `for(s)` gates
// create.js already draws its pickers with (web/js/create.js SPEC_GROUPS —
// `!isSkirt(s)`, `!isTop(s)`, `s.sleeveStyle !== 'none'`), stated once here so
// the PROMPT path says out loud what the picker path shows by hiding a row.
// A dead axis is REPORTED with the next step, never silently kept.
const KONAK_KURALLARI = [
  { konak: 'garment', konakDeger: 'skirt',
    olenler: ['neckline', 'sleeveStyle', 'sleeveLength', 'sleeveCap', 'cuffStyle',
              'collarType', 'collarEdge', 'topLength', 'keyhole', 'wrapFront',
              'backOpening', 'laceUpBack', 'backDetail', 'bardotStyle',
              'peplum', 'placketStyle', 'edgeFinish'],
    sonraki: "etek seçildi; üst gövde ekseni yok — bu kelimeyi kullanmak için 'elbise' ya da 'bluz' yaz",
    sonrakiEn: "you picked a skirt, so there is no upper body to put this on — write 'dress' or 'top' to use this word" },
  { konak: 'garment', konakDeger: 'top',
    olenler: ['skirtStyle', 'skirtLength', 'ruffle', 'backSlit', 'waistline'],
    sonraki: "üst seçildi; etek ekseni yok — bu kelimeyi kullanmak için 'elbise' ya da 'etek' yaz",
    sonrakiEn: "you picked a top, so there is no skirt to put this on — write 'dress' or 'skirt' to use this word" },
  { konak: 'sleeveStyle', konakDeger: 'none',
    olenler: ['sleeveLength', 'sleeveCap', 'cuffStyle'],
    sonraki: "kolsuz seçildi; kol ekseni yok — kol istiyorsan 'kolsuz' kelimesini çıkar",
    sonrakiEn: "you asked for sleeveless, so there is no sleeve to shape — drop the word 'sleeveless' if you want sleeves" },
];

/** The axes this parse SET whose own host the same parse killed. Each entry is
 *  named with the user's own word plus the next step they can take. */
export function konaksizEksenler(parsed) {
  const out = [];
  const e = parsed && parsed.eksenler;
  if (!e) return out;
  for (const k of KONAK_KURALLARI) {
    if (!e[k.konak] || e[k.konak].value !== k.konakDeger) continue;
    for (const alan of k.olenler) {
      if (!e[alan]) continue;
      const tr = `'${e[k.konak].kelime}' okundu, ${k.sonraki}; '${e[alan].kelime}' uygulanmadı`;
      const en = `I read '${e[k.konak].kelime}': ${k.sonrakiEn}; '${e[alan].kelime}' was not applied`;
      out.push({
        alan,
        kelime: e[alan].kelime,
        konak: `${e[k.konak].kelime} → ${k.konak}: ${k.konakDeger}`,
        oneri: tr,
        oneriI18n: { tr, en },
      });
    }
  }
  return out;
}
