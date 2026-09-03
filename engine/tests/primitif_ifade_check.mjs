#!/usr/bin/env node
// ⭐ primitif_ifade_check — MADDE 9'UN KAPISI (M3-primitif).
//
// Damla, madde 9: "sozlugu bust/kol/heartneck gibi seylerden yapmayalim, DIKIS
// TARZIYLA ilerleyelim, boyle olursa SINIRSIZ kalip cikar."
//
// Bu kapi o cumleyi dort ayri olcumle yargilar ve dordu de KIRILABILIR:
//
//  1. SOZLUK DONDU. engine/vocab.json'un sha256'si ve (eksen, deger) sayilari
//     sabit. Yeni bir menu ismi eklemek — madde 9'dan kacisin en ucuz yolu —
//     bu kapiyi kirmizi yakar.
//
//  2. HER PRIMITIFIN MOTORDA BIR KAPISI VAR YA DA "yok" YAZIYOR. contract/
//     primitives-v1.json'daki her Edge/Panel/Seam/op/bilesen kalemi ya kayitli
//     bir ctest adi tasir (o test engine/CMakeLists.txt'te add_test olarak
//     GERCEKTEN kayitli olmak zorunda) ya da acikca "yok" der ve yaninda kok
//     sebep + sonraki adim tasir. null = yargilanmamis = KIRMIZI. Ayrica
//     `motorda_fonksiyon` alanindaki dosya:sembol GERCEKTEN var olmak zorunda,
//     yani bu alana uydurma bir ad yazilamaz.
//
//  3. KOMPOZISYON SOZLUGUN DISINDA. Her kompozisyon giysisi icin taban spec'ten
//     TEK EKSEN oynatarak sozlugun 132 degerinin HEPSI cizdirilir; kompozisyonun
//     cizimi o 132'nin hicbiriyle ayni cikmamalidir. "Bunu bir menu ismi zaten
//     veriyordu" itirazinin cevabi bir cumle degil, bu taramadir. Ayrica
//     katkida bulunan HER eksen tek basina da cizimi oynatmak zorundadir —
//     oynatmayan eksen sus'tur ve adiyla yanar.
//
//  4. SOZLUK-DISI KELIME SESSIZCE DUSMEZ. contract/vision-tasima-v1.json'un
//     oovEsleme tablosu her kelimeye ya bir PRIMITIF DEMETI (contract/
//     vocab-resolution-v1.json uzerinden) ya da ADIYLA bir RET + en yakin
//     cizilebilir oneri verir. Ucuncu yol yok. Ve iki tuketici de (fotograf
//     hatti web/js/vision-bridge.js, prompt hatti web/js/prompt-parse.js) ayni
//     tabloyu KODA GOMMEDEN kullanmak zorunda.
//
// Kosum: node engine/tests/primitif_ifade_check.mjs
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, '..', '..');
const R = (...p) => path.join(REPO, ...p);

let fails = 0;
const fail = (m) => { console.log(`FAIL  ${m}`); fails++; };
const ok = (m) => console.log(`ok    ${m}`);
const J = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const sha = (s) => createHash('sha256').update(s).digest('hex');

const PRIM = J('contract/primitives-v1.json');
const RESO = J('contract/vocab-resolution-v1.json');
const TASIMA = J('contract/vision-tasima-v1.json');

// ---------------------------------------------------------------------------
// 1. SOZLUK DONDU — kompozisyon enum GENISLETMEDEN cikacak.
//
// ⚠ Bu pin bir "kaynaksiz sayi" DEGIL: sayilar dosyanin kendisinden turetildi
// ve pin'i tazelemenin tek mesru yolu sozluge bir deger EKLEMEK, ki bu da
// madde 9'un ihlali oldugu icin gerekcesiyle birlikte yapilir.
console.log('== 1. SOZLUK DONDU ==========================================');
const VOCAB_SHA = 'f1d8616d9e3c41a9dd8a374effe7ac512a82e5d3066a9022bd9e5a6a5d8341c1';
const vocabText = readFileSync(R('engine/vocab.json'), 'utf8');
const vocab = JSON.parse(vocabText);
const fields = Object.keys(vocab.fields);
const valueCount = fields.reduce((a, f) => a + vocab.fields[f].values.length, 0);
const vocabSha = sha(vocabText);
console.log(`      engine/vocab.json  ${fields.length} eksen  ${valueCount} deger  sha256 ${vocabSha}`);
if (fields.length === 37 && valueCount === 132) ok('sozluk boyu degismedi (37 eksen / 132 deger)');
else fail(`sozluk BUYUDU/KUCULDU: ${fields.length} eksen / ${valueCount} deger (beklenen 37 / 132)`);
if (vocabSha === VOCAB_SHA) ok('engine/vocab.json BAYT-AYNI');
else fail(`engine/vocab.json degisti — sha256 ${vocabSha}, pin ${VOCAB_SHA}. ` +
          'Sozluge deger eklendiyse madde 9 ihlal edildi; degismesi gerekiyorsa pin GEREKCEYLE tazelenir.');

// ---------------------------------------------------------------------------
// 2. HER PRIMITIFIN KAPISI
console.log('\n== 2. PRIMITIF -> MOTOR KAPISI ==============================');
const cmake = readFileSync(R('engine/CMakeLists.txt'), 'utf8');
const registered = new Set([...cmake.matchAll(/add_test\(\s*NAME\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]));
console.log(`      engine/CMakeLists.txt: ${registered.size} kayitli test adi`);

// Her kalem: {yol, kalem}. Toplama contract'in KENDI yapisindan cikar; bir
// kalem eklenip burada unutulamaz cunku tarama yapinin uzerinde yuruyor.
const kalemler = [];
const topla = (obj, yol) => {
  if (!obj || typeof obj !== 'object') return;
  if ('motorda_kapi' in obj) kalemler.push({ yol, kalem: obj });
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'motorda_kapi' || k === 'parametreler') continue;
    if (v && typeof v === 'object' && !Array.isArray(v)) topla(v, `${yol}.${k}`);
  }
};
for (const [k, v] of Object.entries(PRIM.primitifler)) topla(v, `primitifler.${k}`);
for (const [k, v] of Object.entries(PRIM.bilesenler)) { if (typeof v === 'object') topla(v, `bilesenler.${k}`); }
for (const [k, v] of Object.entries(PRIM._eksik_operatorler)) { if (typeof v === 'object') topla(v, `_eksik_operatorler.${k}`); }

let kapiVar = 0, kapiYok = 0;
for (const { yol, kalem } of kalemler) {
  const g = kalem.motorda_kapi;
  if (g === null || g === undefined) {
    // `_eksik_operatorler` altinda K35'in semantigi baglayicidir: alan null
    // OLMAK zorunda (null olmayan her deger "motorda var" iddiasi sayilir,
    // expressability_check). Acik ret oraya `motorda_yok_sebep` ile yazilir —
    // yani kalem yine de YARGILANMIS olur, sadece baska bir alanda.
    const sebep = kalem.motorda_yok_sebep;
    if (typeof sebep === 'string' && sebep.length >= 40) { kapiYok++; continue; }
    fail(`${yol}: motorda_kapi NULL ve motorda_yok_sebep yok — kalem yargilanmamis. ` +
         'Ya gerceklestir ya kok sebep + sonraki adimla acikca reddet.');
    continue;
  }
  if (g === 'yok') {
    kapiYok++;
    const sebep = kalem.motorda_yok_sebep;
    if (typeof sebep !== 'string' || sebep.length < 40) {
      fail(`${yol}: "yok" var ama motorda_yok_sebep yok/kisa — kok sebep + sonraki adim zorunlu.`);
    }
    continue;
  }
  if (!registered.has(g)) {
    fail(`${yol}: motorda_kapi "${g}" engine/CMakeLists.txt'te add_test olarak KAYITLI DEGIL.`);
    continue;
  }
  kapiVar++;
  const fn = kalem.motorda_fonksiyon;
  if (fn !== null && fn !== undefined) {
    const i = fn.lastIndexOf(':');
    const file = fn.slice(0, i), sym = fn.slice(i + 1);
    if (i < 0 || !existsSync(R(file))) fail(`${yol}: motorda_fonksiyon "${fn}" — dosya yok.`);
    else if (!readFileSync(R(file), 'utf8').includes(sym)) fail(`${yol}: motorda_fonksiyon "${fn}" — sembol dosyada gecmiyor.`);
  } else if (!yol.startsWith('_eksik')) {
    fail(`${yol}: kapisi var ama motorda_fonksiyon YOK — kapinin neyi olctugu adlandirilmamis.`);
  }
}
console.log(`      ${kalemler.length} kalem: ${kapiVar} kapili, ${kapiYok} acikca "yok", ${kalemler.length - kapiVar - kapiYok} yargilanmamis`);
if (kalemler.length - kapiVar - kapiYok === 0) ok('her primitif/operator/bilesen ya olculuyor ya adiyla YOK');

// ---------------------------------------------------------------------------
// 3. KOMPOZISYON — sozlugun disinda mi?
console.log('\n== 3. KOMPOZISYON: 132 DEGERIN HICBIRI BUNU VERMIYOR MU ======');
const require_ = createRequire(R('x.js'));
const engineFactory = require_(R('web/vendor/stitchu-engine.js'));
const engine = await engineFactory();
globalThis.document = { createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } } };
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
const { engineSpec, bodyForSize } = await import(R('web/js/engine.js'));
const { VOCAB, enumInt } = await import(R('web/js/vocab.gen.js'));
const { flatSVG } = await import(R('web/js/download.js'));

const BODY = { ...bodyForSize('EU38'), upperBust: 0 };
const draftText = (es) => engine.draftJSON(es, BODY);
const parcaSayisi = (t) => { const j = JSON.parse(t); return (j.pattern && j.pattern.pieces || []).length; };

const komp = Object.entries(PRIM.kompozisyonlar).filter(([k]) => !k.startsWith('_'));
if (komp.length < 5) fail(`kompozisyon sayisi ${komp.length} — kart EN AZ 5 istiyor`);
else ok(`${komp.length} kompozisyon giysisi tanimli`);

for (const [ad, k] of komp) {
  const taban = k.taban;
  const tabanText = draftText(engineSpec(taban));
  const tabanH = sha(tabanText);

  // (a) katkida bulunan her eksen TEK BASINA cizimi oynatiyor mu?
  for (const eksen of k.eksenler) {
    const h = sha(draftText(engineSpec({ ...taban, ...eksen })));
    if (h === tabanH) fail(`${ad}: eksen ${JSON.stringify(eksen)} TEK BASINA cizimi hic oynatmiyor — sus.`);
  }

  // (b) kompozisyonun kendisi
  const tam = Object.assign({}, taban, ...k.eksenler);
  const tamText = draftText(engineSpec(tam));
  const tamJ = JSON.parse(tamText);
  const tamH = sha(tamText);
  const n = parcaSayisi(tamText);
  if (tamJ.error) { fail(`${ad}: motor REDDETTI — ${tamJ.error}`); continue; }
  if (n < 3) { fail(`${ad}: kompozisyon ${n} parca cizdi — giysi degil.`); continue; }
  if (tamH === tabanH) { fail(`${ad}: kompozisyon tabandan farksiz.`); continue; }

  // (c) TARAMA — sozlugun 132 degerinin hicbiri bu cizimi vermiyor.
  const esTaban = engineSpec(taban);
  let carpisma = null, tarandi = 0;
  for (const f of Object.keys(VOCAB)) {
    if (!(f in esTaban)) continue;   // sozlukte olup motora giden telde OLMAYAN eksen
    for (const v of VOCAB[f].values) {
      const es = { ...esTaban };
      es[f] = (typeof esTaban[f] === 'number') ? enumInt(f, v) : v;
      tarandi++;
      let h;
      try { h = sha(draftText(es)); } catch { continue; }
      if (h === tamH) { carpisma = `${f}.${v}`; break; }
    }
    if (carpisma) break;
  }
  if (carpisma) fail(`${ad}: TEK menu degeri ${carpisma} ayni cizimi veriyor — kompozisyon degil.`);
  else ok(`${ad} — ${n} parca; taranan ${tarandi} tek-deger cizimi, carpisma YOK`);

  // (d) demet gercekten Katman 1'den kuruluyor mu?
  const oplar = new Set();
  for (const d of k.demet) {
    if (d.primitif) {
      if (!(d.primitif in PRIM.primitifler)) fail(`${ad}: demet bilinmeyen primitif "${d.primitif}"`);
      else oplar.add(d.primitif);
      continue;
    }
    const e = RESO.resolutions[d.cozum];
    if (!e) { fail(`${ad}: demet cozum anahtari "${d.cozum}" vocab-resolution-v1.json'da YOK`); continue; }
    if (e.status !== 'resolved' || !Array.isArray(e.bundle) || e.bundle.length === 0) {
      fail(`${ad}: "${d.cozum}" cozulmus bir demet tasimiyor (status ${e.status})`);
      continue;
    }
    for (const step of e.bundle) oplar.add(step.op);
  }
  if (oplar.size < 2) fail(`${ad}: demet ${oplar.size} primitif tasiyor — kompozisyon en az iki primitif ister`);
  else console.log(`      ${ad} demeti: ${[...oplar].sort().join(' + ')}`);

  // (e) FLAT: ya DEGISIR ya ADIYLA REDDEDILIR. Ucuncu hal — cizimin taban ile
  // BAYT-AYNI cikmasi — satilan seyin yalan soylemesidir: kalip kompozisyonu
  // tasir, alicinin gordugu resim tasimaz. (Bu kosuda uc gercek kusur bu
  // yoldan bulundu: roba bolmesinde elbise ETEK olarak, kup dikisinde bustiyer
  // yalniz SIRT olarak basiliyordu, bardot bedende cizim TypeError ile
  // patliyordu. Ilk ikisi artik adiyla ret, ucuncusu duzeltildi.)
  let flatTaban = null, flatTam = null, flatRet = null;
  try { flatTaban = sha((await flatSVG(taban, { size: 'EU38' })).svg); } catch (e) { flatTaban = `RED:${e.message}`; }
  try { flatTam = sha((await flatSVG(tam, { size: 'EU38' })).svg); } catch (e) { flatRet = e.message; }
  if (flatRet) {
    if (!/^flat:/.test(flatRet)) fail(`${ad}: flat cizimi ADIYLA degil, beklenmedik bir hatayla dustu — ${flatRet}`);
    else console.log(`      ${ad} flat: ADIYLA RET — ${flatRet.slice(0, 150)}`);
  } else if (flatTam === flatTaban) {
    fail(`${ad}: FLAT taban ile bayt-ayni — kompozisyon kalipta var, cizimde YOK (sessiz dusme).`);
  } else {
    console.log(`      ${ad} flat: cizildi ve tabandan farkli`);
  }
}

// ---------------------------------------------------------------------------
// 4. SOZLUK-DISI KELIME: eslendi (demetle) ya da reddedildi (adiyla + oneri)
console.log('\n== 4. SOZLUK-DISI (outOfVocab) ESLEME =======================');
const { resolveOutOfVocab } = await import(R('web/js/vision-bridge.js'));
const { parsePrompt } = await import(R('web/js/prompt-parse.js'));

// Kelimeler UYDURULMADI: yarisi contract'in kendi kural adlarinin kapsadigi
// terimler, yarisi tabloda hicbir kuralin yakalamadigi gercek moda terimleri.
const KELIMELER = [
  'surplice wrap front', 'shirred waist', 'cup seam', 'yoke', 'corset lace-up back',
  'high-low hem', 'asymmetric button placket', 'kick pleat', 'hem flounce', 'peter pan collar',
  'welt pocket', 'french cuff', 'notched lapel collar', 'handkerchief hem', 'knife pleat',
  'hood', 'separating zipper', 'moulded cup', 'godet insert', 'trapunto quilting',
];
const spec = { garment: 'dress', shaping: 'dart', fabric: 'woven' };
const kararlar = resolveOutOfVocab({ outOfVocab: KELIMELER }, spec);
if (kararlar.length !== KELIMELER.length) {
  fail(`vision-bridge: ${KELIMELER.length} kelime girdi, ${kararlar.length} karar cikti — sessiz dusme.`);
} else ok(`vision-bridge: ${KELIMELER.length} kelimenin ${KELIMELER.length}'i icin karar var, sessiz dusme YOK`);

let eslesen = 0, reddedilen = 0;
for (const k of kararlar) {
  if (k.durum === 'eslendi') {
    eslesen++;
    if (!k.demet || !Array.isArray(k.demet) || k.demet.length === 0) {
      fail(`oov "${k.term}" eslendi ama PRIMITIF DEMETI tasimiyor — eslesme bir eksen adinda kaliyor.`);
    }
  } else if (k.durum === 'reddedildi') {
    reddedilen++;
    const s = k.sebep, o = k.oneri;
    if (!s || !s.tr || !s.en) fail(`oov "${k.term}" reddedildi ama SEBEP eksik`);
    if (!o || !o.tr || !o.en) fail(`oov "${k.term}" reddedildi ama ONERI (en yakin yapilabilir) eksik`);
  } else {
    fail(`oov "${k.term}" ucuncu bir yola dustu: ${k.durum}`);
  }
}
console.log(`      ${eslesen} eslendi (demetli), ${reddedilen} adiyla reddedildi + oneri`);
if (eslesen === 0) fail('hicbir sozluk-disi kelime primitif demetine eslenmedi');

// PROMPT HATTI — ayni tablo, ayni yargi. Kod kopyasi degil.
const promptMetin = 'surplice wrap front dress with a shirred waist, welt pocket and a hood';
const p = parsePrompt(promptMetin);
if (!Array.isArray(p.oovKarar)) {
  fail('prompt-parse.js sozluk-disi kelimeler icin karar URETMIYOR (oovKarar yok)');
} else {
  const es2 = p.oovKarar.filter((x) => x.durum === 'eslendi');
  const rd = p.oovKarar.filter((x) => x.durum === 'reddedildi');
  if (p.oovKarar.length === 0) fail('prompt-parse.js: cumlede sozluk-disi terim var ama karar sayisi 0');
  else ok(`prompt-parse.js: ${p.oovKarar.length} karar (${es2.length} eslendi, ${rd.length} reddedildi)`);
  for (const k of p.oovKarar) {
    if (k.durum === 'eslendi' && (!k.demet || k.demet.length === 0)) fail(`prompt oov "${k.term}" eslendi ama demetsiz`);
    if (k.durum === 'reddedildi' && (!k.oneri || !k.oneri.tr)) fail(`prompt oov "${k.term}" reddedildi ama onerisiz`);
    console.log(`      "${k.term}" -> ${k.durum}${k.demet ? ' [' + k.demet.map((b) => b.op).join(' + ') + ']' : ''}`);
  }
  const bekleniyor = ['hood', 'welt pocket'];
  for (const b of bekleniyor) {
    if (!p.oovKarar.some((x) => x.term.includes(b.split(' ')[0]))) {
      fail(`prompt-parse.js: "${b}" cumlede geciyor ama hicbir karara girmedi — sessiz dusme`);
    }
  }
}

// ⛔ YARGI TEK YERDE, TABLO CONTRACT'TA.
//
// Olculen sey "bu dosyada su regex geciyor mu" DEGIL — bu yanlis bir kapi
// olurdu ve ilk kosumda yanlis yandi: vision-bridge.js'in KENDI eksen
// secicileri (pickBackOpening, pickStraps, pickBoxPleat) ayni moda kelimelerini
// kullanir cunku ayni giysiyi konusurlar; onlar oov YARGISI degil, EKSEN
// secimidir ve tablonun kopyasi degildir. Kapinin olctugu sey su:
//   (a) YARGI yeri TEK: iki tuketici de web/js/oov-resolve.js'in
//       oovKarariVer'ini cagirir, kendi verdict'ini KURMAZ;
//   (b) o tek yer TABLOYU TASIMAZ: oov-resolve.js'te hicbir kural adi, hicbir
//       kural regex'i ve hicbir sebep/oneri metni yazili degildir — hepsi
//       contract'tan uretilerek gelir.
// Bir gun biri tabloyu koda kopyalarsa (b) yanar; biri ikinci bir yargi yazarsa
// (a) yanar.
for (const dosya of ['web/js/vision-bridge.js', 'web/js/prompt-parse.js']) {
  const t = readFileSync(R(dosya), 'utf8');
  if (!/from '\.\/oov-resolve\.js/.test(t)) {
    fail(`${dosya}: sozluk-disi yargiyi web/js/oov-resolve.js'ten almiyor — ikinci bir yargi yeri dogmus.`);
  }
  if (/durum:\s*'reddedildi'/.test(t)) {
    fail(`${dosya}: kendi 'reddedildi' karari kuruyor — yargi tek yerde olmali.`);
  }
}
const yargiYeri = readFileSync(R('web/js/oov-resolve.js'), 'utf8');
const sizan = [];
for (const r of TASIMA.oovEsleme.kurallar) {
  // Yalniz AYIRT EDICI regex'ler sayilir. 'pocket' ya da 'button' gibi duz bir
  // kelime bir yorum cumlesinde kazara gecebilir ve gectiginde hicbir sey
  // kanitlamaz; metakarakter tasiyan bir desen ise kazara yazilamaz.
  if (/[\\|()\[\]?*+{}]/.test(r.ara) && yargiYeri.includes(r.ara)) sizan.push(`${r.ad} (regex)`);
  if (yargiYeri.includes(`'${r.ad}'`) || yargiYeri.includes(`"${r.ad}"`)) sizan.push(`${r.ad} (ad)`);
  if (r.sebep && yargiYeri.includes(r.sebep.en)) sizan.push(`${r.ad} (sebep)`);
}
if (sizan.length) fail(`web/js/oov-resolve.js tabloyu TASIYOR: ${sizan.join(', ')}`);
else ok(`oov tablosu (${TASIMA.oovEsleme.kurallar.length} kural) contract'ta veri, yargi yerinde tek satiri bile yazili degil`);

console.log(`\n${fails ? 'FAIL' : 'OK'} — ${fails} ihlal`);
process.exit(fails ? 1 : 0);
