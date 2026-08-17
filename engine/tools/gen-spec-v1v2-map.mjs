// gen-spec-v1v2-map.mjs — v1 (okuma dili) ile v2 (operatör sicili) arasındaki
// EŞLEME TABLOSUNU üretir: contract/spec-v1-v2-map.json.
//
// NEDEN VAR (Tur 11, halka: v1<->v2 esleme):
// contract/garment-spec.schema.json (v1) ÖLÜ DEĞİL — ölçüldü: contract_check ve
// collar_bridge_check onu okuyor, gen-contract.mjs $defs.visionReading'i
// backend/contract.gen.js + web/js/contract.gen.js'e GÖMÜYOR, ayrıca
// dataset/eval/label-tool.mjs, web/js/spec-validate.js, web/js/vision-bridge.js
// ve vision-student/ ona dayanıyor. Damgalanacak bir ceset değil, koşan bir kapı.
//
// Ama v1'i v2'nin TÜREVİ yapmak da YANLIŞ olurdu ve gerekçesi HEDEF.md'nin
// bitiş tanımıdır: "kalan 2'si EKSİK OPERATÖRÜNÜ ADIYLA SÖYLEYEREK reddeder."
// Bir giysiyi adıyla reddedebilmek için önce onu OKUYABİLMEK gerekir. v1 9 yaka,
// 8 yaka-tipi, 8 askı okuyabiliyor; v2 bunların çoğunu üretemiyor. v1'i v2'ye
// daraltmak, motoru "peterPan yakayı çıkaramıyorum" diyemez hale getirir — red
// cümlesi susar. İki dosya İKİ AYRI SORUYA cevap veriyor:
//   v1 = "bu fotoğrafta/cümlede NE GÖRÜYORUM?"   (okuma dili, geniş)
//   v2 = "bunu ÜRETEBİLİYOR MUYUM?"              (operatör sicili, dar)
// "İki doğru" ancak ikisi AYNI soruya farklı cevap verirse olur. Bu tablo tam
// olarak o çelişkiyi imkânsız kılar: her v1 değeri için v2'deki karşılığını ve
// o karşılığın BUGÜNKÜ üretilebilirliğini tek yerde yazar.
//
// K1 disiplini: aşağıdaki CORRESPONDENCE tek insan kararıdır (hangi v1 kelimesi
// hangi v2 eksenine denk düşer). HÜKÜM (üretilebilir mi, hangi operatör eksik)
// YAZILMAZ, iki sözleşmeden HESAPLANIR. v2'de bir operatör shipped olur olmaz
// tablo kendiliğinden döner; elle güncellenecek bir "durum" alanı yoktur.
//
//   node engine/tools/gen-spec-v1v2-map.mjs           -> yazar
//   node engine/tools/gen-spec-v1v2-map.mjs --check   -> diskteki ile karsilastirir

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const OUT = 'contract/spec-v1-v2-map.json';

const v1 = JSON.parse(readFileSync(join(root, 'contract/garment-spec.schema.json'), 'utf8'));
const v2 = JSON.parse(readFileSync(join(root, 'contract/garment-spec-v2.json'), 'utf8'));

// --- TEK İNSAN KARARI: v1 kelimesi -> v2 ekseni.değeri (yoksa null + sebep) ---
// null'un iki sebebi olur:
//   NO_AXIS  : v2'de bu ekseni karşılayan bir topoloji ekseni HİÇ yok.
//   NO_VALUE : eksen var ama v2'nin kapalı enum'unda bu değer yok.
// Üçüncü bir hâl: QUANTITY — v1 bunu bir kelimeyle sayıyor, v2 sürekli bir
// kadranla ölçüyor; ikisi çelişmez, ayrık katmandır.
const CORRESPONDENCE = {
  garment: {
    skirt: 'garment.skirt', dress: 'garment.sheathDress', top: 'garment.top',
    trousers: ['NO_VALUE', 'v2 garment enum pantolon tasimiyor; motorda bacak yuzeyi yok'],
    other: ['NO_VALUE', 'kapali enum kacak degeri kabul etmez'],
  },
  neckline: {
    _axisNote: 'v2 YAKA SEKLI ekseni tasimiyor. necklineDraft operatoru SHIPPED ama sekli enum ile degil, quantities.neckDrop*/neckWidth* kadranlariyla ciziyor. Yani bu dokuz kelime OKUNUR, motor tarafindan AYIRT EDILMEZ.',
    crew: 'QUANTITY.necklineDraft', scoop: 'QUANTITY.necklineDraft', vNeck: 'QUANTITY.necklineDraft',
    square: 'QUANTITY.necklineDraft', boat: 'QUANTITY.necklineDraft',
    sweetheart: 'QUANTITY.necklineDraft', halter: 'QUANTITY.necklineDraft',
    cowl: 'QUANTITY.necklineDraft', pussyBow: 'QUANTITY.necklineDraft',
  },
  sleeveStyle: { none: 'sleeve.none', straight: 'sleeve.setIn', balloon: 'sleeve.puff' },
  sleeveLength: {
    _axisNote: 'kol UZUNLUGU v2 de hic yok: sleeve operatoru absent oldugu icin bagli bir kadran da yok.',
    short: ['NO_AXIS', 'sleeve operatoru absent'], elbow: ['NO_AXIS', 'sleeve operatoru absent'],
    long: ['NO_AXIS', 'sleeve operatoru absent'],
  },
  skirtStyle: {
    aLine: 'skirtShape.aLine', straight: 'skirtShape.straight', gathered: 'skirtShape.gathered',
    pleated: 'skirtShape.pleated', gore: 'skirtShape.gore',
    halfCircle: ['NO_VALUE', 'v2 sadece fullCircle tasiyor; yarim daire EN YAKIN karsilik ama AYNI degil'],
  },
  length: {
    _axisNote: 'v1 kelimeyle (mini/midi/maxi), v2 mm ile olcer: quantities.hemDropBelowHipMM.',
    mini: 'QUANTITY.hemDropBelowHipMM', midi: 'QUANTITY.hemDropBelowHipMM', maxi: 'QUANTITY.hemDropBelowHipMM',
  },
  topLength: {
    cropped: 'QUANTITY.hemDropBelowHipMM', hip: 'QUANTITY.hemDropBelowHipMM', tunic: 'QUANTITY.hemDropBelowHipMM',
  },
  shaping: { princess: 'suppression.seamOnly', dart: 'suppression.dart' },
  waistline: {
    // dogal bel bir kadran degil: bodiceSurface in tek bel halkasinin kendisi.
    natural: 'QUANTITY.bodiceSurface',
    empire: ['NO_AXIS', 'v2 de bel yuksekligi ekseni yok; govde yuzeyi tek dogal bel halkasi tasiyor'],
  },
  fabric: {
    _axisNote: 'malzeme geometri ekseni degil; v2 topolojisi kumas tanimaz (kumas onerisi H1.1b, ayri hat).',
    woven: ['NO_AXIS', 'kumas v2 topolojisinde yok'], knit: ['NO_AXIS', 'kumas v2 topolojisinde yok'],
  },
  hemRuffle: {
    none: 'closure.none',
    single: ['NO_AXIS', 'etek ucu firfiri icin operator yok'],
    tiered: ['NO_AXIS', 'etek ucu firfiri icin operator yok'],
  },
  closure: {
    none: 'closure.none', zipper: 'closure.centreBackZip', buttons: 'closure.buttonFront',
    placket: ['NO_VALUE', 'v2 closure enum patlet tasimiyor'],
    ties: ['NO_VALUE', 'v2 closure enum bag tasimiyor'],
    'lace-up': ['NO_VALUE', 'v2 closure enum kordon tasimiyor'],
    hookEye: ['NO_VALUE', 'v2 closure enum kopca tasimiyor'],
  },
  collar: {
    none: 'collar.none', stand: 'collar.stand', shirt: 'collar.shirt', peterPan: 'collar.peterPan',
    mandarin: ['NO_VALUE', 'v2 collar enum tasimiyor'], notched: ['NO_VALUE', 'v2 collar enum tasimiyor'],
    sailor: ['NO_VALUE', 'v2 collar enum tasimiyor'], other: ['NO_VALUE', 'kapali enum kacak degeri kabul etmez'],
  },
  straps: {
    none: 'shoulder.strapless', shoulder: 'shoulder.shoulderSeam',
    spaghetti: ['NO_VALUE', 'v2 shoulder enum sadece strapless|shoulderSeam'],
    wide: ['NO_VALUE', 'v2 shoulder enum sadece strapless|shoulderSeam'],
    halter: ['NO_VALUE', 'v2 shoulder enum sadece strapless|shoulderSeam'],
    ruffled: ['NO_VALUE', 'v2 shoulder enum sadece strapless|shoulderSeam'],
    oneShoulder: ['NO_VALUE', 'v2 shoulder enum sadece strapless|shoulderSeam'],
    offShoulder: ['NO_VALUE', 'v2 shoulder enum sadece strapless|shoulderSeam'],
  },
  sleeveHead: {
    plain: 'sleeve.setIn', gathered: 'sleeve.puff', puffed: 'sleeve.puff', capped: 'sleeve.cap',
  },
  yoke: {
    none: 'closure.none',
    shoulderYoke: ['NO_AXIS', 'roba operatoru yok'], shirring: ['NO_AXIS', 'buzgu katmani absent'],
    smocking: ['NO_AXIS', 'buzgu katmani absent'],
  },
  backDetail: {
    none: 'closure.none', openBack: 'closure.backOpening',
    keyholeBack: ['NO_VALUE', 'v2 closure enum tasimiyor'], vBack: ['NO_VALUE', 'v2 closure enum tasimiyor'],
    tieBack: ['NO_VALUE', 'v2 closure enum tasimiyor'], lacedBack: ['NO_VALUE', 'v2 closure enum tasimiyor'],
    buttonBack: ['NO_VALUE', 'v2 closure enum tasimiyor'],
  },
};

// v1'in enum TASIMAYAN alanlari (serbest metin / sayi / bayrak): eslemeye girmez.
const V1_NON_ENUM = ['keyhole', 'fabricName', 'cupSeams', 'outOfVocab', 'details', 'ratios'];

// --- HUKUM: iki sozlesmeden HESAPLANIR, yazilmaz ---
function operatorStatus(id) {
  const o = v2.operators[id];
  return o ? o.status : 'UNKNOWN_OPERATOR';
}

function resolve(target) {
  // QUANTITY.<x> -> surekli katman
  if (target.startsWith('QUANTITY.')) {
    const key = target.slice('QUANTITY.'.length);
    if (v2.operators[key]) {
      const st = operatorStatus(key);
      return { layer: 'quantity', v2: target, requires: [key],
        expressible: st === 'shipped', missing: st === 'shipped' ? [] : [key] };
    }
    const q = v2.quantities[key];
    return { layer: 'quantity', v2: target, requires: [],
      expressible: !!q, missing: q ? [] : ['QUANTITY_NOT_IN_V2:' + key] };
  }
  const [axis, value] = target.split('.');
  const ax = v2.topology[axis];
  if (!ax) return { layer: 'topology', v2: target, requires: [], expressible: false, missing: ['NO_SUCH_V2_AXIS:' + axis] };
  const val = ax.values[value];
  if (!val) return { layer: 'topology', v2: target, requires: [], expressible: false, missing: ['NO_SUCH_V2_VALUE:' + target] };
  const requires = val.requires || [];
  const missing = requires.filter((r) => operatorStatus(r) !== 'shipped');
  return { layer: 'topology', v2: target, requires, expressible: missing.length === 0, missing };
}

const axes = {};
let readable = 0, expressible = 0;
for (const [axisName, table] of Object.entries(CORRESPONDENCE)) {
  const entry = { note: table._axisNote || null, values: {} };
  for (const [v1val, target] of Object.entries(table)) {
    if (v1val === '_axisNote') continue;
    readable++;
    if (Array.isArray(target)) {
      entry.values[v1val] = { v2: null, reason: target[0], why: target[1], expressible: false, missing: [] };
    } else {
      const r = resolve(target);
      entry.values[v1val] = { v2: r.v2, layer: r.layer, requires: r.requires,
        expressible: r.expressible, missing: r.missing };
      if (r.expressible) expressible++;
    }
  }
  axes[axisName] = entry;
}

const out = {
  _contract: 'v1 (okuma dili) <-> v2 (operator sicili) ESLEME TABLOSU. URETILMIS DOSYA — elle duzenleme. Kaynak: engine/tools/gen-spec-v1v2-map.mjs. Hukum (expressible/missing) YAZILMAZ, contract/garment-spec.schema.json + contract/garment-spec-v2.json okunarak HESAPLANIR.',
  _law: [
    'v1 OLU DEGIL: contract_check ve collar_bridge_check onu okuyor, gen-contract.mjs $defs.visionReading i backend/ ve web/ e gomuyor. Damgalanacak ceset degil.',
    'v1 v2 nin TUREVI de DEGIL: bir giysiyi ADIYLA reddedebilmek icin once onu OKUYABILMEK gerekir (HEDEF.md bitis tanimi). v1 i v2 ye daraltmak red cumlesini susturur.',
    'IKI DOGRU YOK, cunku iki AYRI SORU var: v1 = "ne goruyorum?", v2 = "uretebiliyor muyum?". Uretilebilirligin TEK cevabi v2.operators tir.',
    'Bir v1 enum degerine bakip "motor bunu cikarir" DEME. Bu tablodaki expressible alanina bak.',
  ],
  generatedFrom: { v1: 'contract/garment-spec.schema.json', v2: 'contract/garment-spec-v2.json', v2specVersion: v2.specVersion || v2.version || null },
  summary: { v1EnumValuesMapped: readable, expressibleToday: expressible, notExpressibleToday: readable - expressible },
  v1NonEnumFields: V1_NON_ENUM,
  axes,
};

const text = JSON.stringify(out, null, 2) + '\n';
const check = process.argv.includes('--check');
const path = join(root, OUT);
if (check) {
  let cur = null;
  try { cur = readFileSync(path, 'utf8'); } catch { /* yok */ }
  if (cur !== text) {
    console.error(`FAIL ${OUT} guncel degil — 'node engine/tools/gen-spec-v1v2-map.mjs' kos.`);
    process.exit(1);
  }
  console.log(`OK ${OUT} guncel (${readable} v1 enum degeri, ${expressible} uretilebilir)`);
} else {
  writeFileSync(path, text);
  console.log(`yazildi ${OUT}: ${readable} v1 enum degeri eslendi, ${expressible} bugun uretilebilir, ${readable - expressible} degil`);
}
