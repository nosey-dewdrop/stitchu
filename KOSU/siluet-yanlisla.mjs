// KOSU/siluet-yanlisla.mjs — 0-K.10 YANLISLAMA (4 kural). Cikis 0 = hepsi gecti; JSON stdout.
//   node KOSU/siluet-yanlisla.mjs <set>
// 1 ayni fotograf iki kez -> ayni flat (ayni sha -> ciz() iki kez, svg bayt-ayni)
// 2 iki farkli fotograf -> farkli siluet (kontur imzalari ikili farkli)
// 3 fotografta bol duran giysi (oturma.bel=false) flat'te oturamaz (ciz() kirmizi)
// 4 aski ucu manken omuz noktasini asamaz (ciz() kirmizi)
import { readFileSync, readdirSync } from 'node:fs';
import { ciz } from './siluet-ciz.mjs';
const set = process.argv[2] || 'giris-3';
const kok = `KOSU/ciktilar/${set}`;
const nolar = readdirSync(kok).filter((d) => /^\d+$/.test(d)).map(Number).sort((a, b) => a - b);
const sonuc = { set, kural1: [], kural2: [], kural3: [], kural4: [], gecti: true };
const imzalar = {};
for (const no of nolar) {
  const sha = readFileSync(`${kok}/${no}/kaynak-yolu.txt`, 'utf8').split('\n')[1].split(' ')[1];
  const okuma = JSON.parse(readFileSync(`KOSU/onbellek/siluet-${sha}.json`, 'utf8'));
  const a = ciz(okuma), b = ciz(JSON.parse(JSON.stringify(okuma)));
  sonuc.kural1.push({ no, ayni: a.svg === b.svg });
  imzalar[no] = a.imza;
  for (const k of a.kirmizi) (/aski ucu/.test(k) ? sonuc.kural4 : sonuc.kural3).push({ no, kirmizi: k });
  // kural 3'un sentetik testi: bol okumayi zorla oturt -> kirmizi CIKMALI
  if (okuma.oturma && okuma.oturma.bel === false) {
    const z = JSON.parse(JSON.stringify(okuma)); z.on.kontur.bel = ['waist*1.0', 'waist'];
    const r = ciz(z); sonuc.kural3.push({ no, sentetikOturtma: r.kirmizi.length ? 'KIRMIZI (dogru)' : 'GECTI (YANLIS: yakalanmadi)' });
    if (!r.kirmizi.length) sonuc.gecti = false;
  }
}
// kural 4 sentetik: askiyi omzun disina it -> kirmizi CIKMALI
{
  const sha = readFileSync(`${kok}/${nolar[0]}/kaynak-yolu.txt`, 'utf8').split('\n')[1].split(' ')[1];
  const z = JSON.parse(readFileSync(`KOSU/onbellek/siluet-${sha}.json`, 'utf8'));
  z.on.aski = { genislik: 10 }; z.on.kontur.askiUst = ['shoulderTip*1.2', 'shoulderTip'];
  const r = ciz(z); sonuc.kural4.push({ sentetik: r.kirmizi.some((k) => /aski ucu/.test(k)) ? 'KIRMIZI (dogru)' : 'GECTI (YANLIS)' });
  if (!r.kirmizi.some((k) => /aski ucu/.test(k))) sonuc.gecti = false;
}
for (let i = 0; i < nolar.length; i++) for (let j = i + 1; j < nolar.length; j++) if (imzalar[nolar[i]] === imzalar[nolar[j]]) { sonuc.kural2.push({ ayni: [nolar[i], nolar[j]] }); sonuc.gecti = false; }
if (!sonuc.kural2.length) sonuc.kural2.push({ ikiliFarkli: nolar.length * (nolar.length - 1) / 2 });
if (sonuc.kural1.some((k) => !k.ayni)) sonuc.gecti = false;
if (sonuc.kural3.some((k) => k.kirmizi) || sonuc.kural4.some((k) => k.kirmizi)) sonuc.gecti = false;
console.log(JSON.stringify(sonuc, null, 1));
process.exit(sonuc.gecti ? 0 : 1);
