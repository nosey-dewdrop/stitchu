// KOSU/0509-a3-uret.mjs — A3 URETICI: onbellek okumasi -> graf.json -> flat.svg/png + kalip-36.svg
//
// HAT: KOSU/onbellek/<sha>.json (vision-graf-v1, isci okumasi)
//        -> okuma opDemeti'ni MOTORUN op sozlugune cevir (haritala)
//        -> taban graf uzerine uygula (engine/build/grafciz okur)
//        -> gercek36 kalip + croquis36 flat
//
// NEDEN CEVIRI KATMANI VAR. Okuma katmani "setHemLength / addPanel / addPatch" gibi
// FOTOGRAFIN dilinde konusur; motorun op sozlugu (contract/graf-v1.json oplar)
// "extendTo / attach / overlay / gather / closure" der. Ikisi ayni sey DEGIL ve
// birbirine karistirilirsa okuma da motor da yalan soyler. Bu dosya cevirinin
// KENDISIDIR ve cevrilemeyen her op ADIYLA reddedilir (cevrilemeyen[] listesi),
// sessizce atlanmaz (madde 4).
//
// UYDURMA SABIT YOK: her sayi okumadan (oran) ya da contract'tan gelir.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';

const KOK = process.cwd();
const TABAN = 'KOSU/ciktilar/graf-ilk/graf.json';

// ---------------------------------------------------------------- op cevirisi
// okumaOp -> motorOp. Karsiligi OLMAYAN op burada YOKTUR ve cevrilemeyen'e duser.
function cevir(o, graf) {
  const a = o.args || {};
  switch (o.op) {
    case 'setHemLength': {
      // Kenari bir landmark'a baglar. Okuma "bel..ayakbilegi araliginda 0.42" der;
      // motorun extendTo'su bir LANDMARK ister, oran degil. En yakin landmark secilir
      // ve kalan fark yOffsetMM olarak DEGIL, secilen landmark ADIYLA yazilir:
      // ara oranin mm karsiligi bedene gore degisir, sabit yazmak yasa 2 ihlali olurdu.
      const t = a.target || {};
      const yl = landmarkSec(t.landmarkUst, t.landmarkAlt, t.ratio);
      if (!yl) return red(o, `oran ${t.ratio} icin landmark secilemedi: ${t.landmarkUst}..${t.landmarkAlt} ayni zincirde degil (govde/kol ayri eksen)`);
      const panel = a.panel, edge = a.edge;
      const p = graf.panels.find((x) => x.id === panel);
      if (!p) return red(o, `panel yok: ${panel}`);
      const e = p.edges.find((x) => x.id === edge) || p.edges.find((x) => x.id.startsWith(edge));
      if (!e) return red(o, `kenar yok: ${panel}/${edge}`);
      return { op: 'extendTo', args: { panel, edge: e.id, yLandmark: yl.ad, yOffsetMM: 0 },
               _neden: o.neden, _kayip: yl.kayip };
    }
    case 'setEase': {
      // Buzgu: aralik verilmis, cozucu icinden secer. Tek sayi gerektiginde
      // araligin ORTASI alinir ve bu ADIYLA yazilir (uydurma degil, ilan edilmis secim).
      const r = a.ratioRange;
      if (!Array.isArray(r) || r.length !== 2) return red(o, 'ratioRange [alt,ust] degil');
      const orta = (r[0] + r[1]) / 2;
      const s = graf.seams.find((x) => x.id === a.seam);
      if (!s) return red(o, `dikis yok: ${a.seam}`);
      const yan = (s.a || []).find((x) => x.panel === a.side) || (s.a || [])[0];
      if (!yan) return red(o, `dikis ${a.seam} icin ${a.side} tarafi bulunamadi`);
      return { op: 'gather', args: { panel: yan.panel, edge: yan.edge, ratio: Number(orta.toFixed(4)) },
               _neden: o.neden, _kayip: `aralik [${r[0]}, ${r[1]}] -> orta ${orta.toFixed(4)} (cozucu tek sayi ister)` };
    }
    case 'addClosure': {
      const tur = { 'dugme': 'button', 'fermuar': 'zip' }[a.tur];
      if (!tur) return red(o, `kapanma turu motorda yok: ${a.tur}`);
      const s = a.yer === 'on_orta' ? 'on_orta' : a.yer === 'arka_orta' ? 'arka_orta_beden' : null;
      if (!s) return red(o, `kapanma yeri motorda dikis olarak yok: ${a.yer}`);
      if (!graf.seams.find((x) => x.id === s)) return red(o, `dikis yok: ${s} (taban grafta on orta dikis bulunmuyor)`);
      return { op: 'closure', args: { seam: s, type: tur, fromFraction: a.oranBas ?? 0, toFraction: a.oranSon ?? 1 }, _neden: o.neden };
    }
    case 'setWidthTarget':
      // Bu bir op DEGIL, cozucuye HEDEF (contract yasa 3). Grafa YAZILMAZ.
      return { _hedef: true, ...a, _neden: o.neden };
    default:
      return red(o, 'motorun op sozlugunde karsiligi yok (contract/graf-v1.json oplar)');
  }
}
function red(o, neden) { return { _red: true, op: o.op, neden, _neden: o.neden }; }

// Okumadaki [ust..alt] oranini motorun tanidigi TEK landmark'a indirger.
//
// OLCULEN ARIZA (2026-09-08, ilk kosum): tek bir dogrusal siralama KOL ile GOVDEyi
// ayni eksene koyuyordu; kol hem'i oran 0.47 (shoulderTip..wrist) icin en yakin
// landmark diye "landmark.waist" secildi. Kol agzi bele baglanamaz. Kok neden:
// insan govdesi tek eksen DEGIL — govde ekseni (nape..ankle) ve kol ekseni
// (shoulderTip..wrist) ayri zincirler, ikisi yalnizca omuzda birlesir.
//
// DUZELTME: iki AYRI zincir. Bir oran hangi zincirin iki ucuyla verildiyse
// yalniz O zincirin landmark'lari arasindan secilir. Zincir disi eslesme
// artik imkansiz; karisik uc verilirse (biri govde biri kol) ADIYLA reddedilir.
//
// Sayilar contract/body-v1.json landmarklar blogundaki SIRA'dan (landmarkSirasi)
// turetildi, uydurulmadi: her landmark'in kendi zincirindeki normalize konumu.
const ZINCIR = {
  govde: {
    'landmark.nape': 0.00, 'landmark.neckFront': 0.02, 'landmark.shoulderTip': 0.05,
    'landmark.underarm': 0.16, 'landmark.bustLine': 0.20, 'landmark.underbust': 0.26,
    'landmark.waist': 0.34, 'landmark.highHip': 0.40, 'landmark.hip': 0.47,
    'landmark.crotch': 0.50, 'landmark.knee': 0.72, 'landmark.ankle': 1.00,
  },
  kol: {
    'landmark.shoulderTip': 0.00, 'landmark.elbow': 0.55, 'landmark.wrist': 1.00,
  },
};
function zincirBul(ust, alt) {
  for (const [ad, z] of Object.entries(ZINCIR))
    if (z[ust] !== undefined && z[alt] !== undefined) return { ad, z };
  return null;
}
function landmarkSec(ust, alt, oran) {
  if (typeof oran !== 'number') return null;
  const zc = zincirBul(ust, alt);
  if (!zc) return null;  // karisik uc (govde + kol) -> ADIYLA reddedilir
  const { ad: zad, z } = zc;
  const hedef = z[ust] + oran * (z[alt] - z[ust]);
  let en = null, enFark = Infinity;
  for (const [ad, v] of Object.entries(z)) {
    const f = Math.abs(v - hedef);
    if (f < enFark) { enFark = f; en = ad; }
  }
  return { ad: en, zincir: zad, kayip: enFark < 0.005 ? null
    : `istenen oran ${oran} (${ust}..${alt}, ${zad} zinciri) = ${hedef.toFixed(3)}; en yakin landmark ${en} (${z[en]}), fark ${enFark.toFixed(3)} — motor ARA NOKTAYA baglayamiyor (extendTo landmark ister)` };
}

// ---------------------------------------------------------------- uretim
export function uret(sha, cikisDizin) {
  const okuma = JSON.parse(readFileSync(`KOSU/onbellek/${sha}.json`, 'utf8'));
  const graf = JSON.parse(readFileSync(TABAN, 'utf8'));

  const uygulanan = [], cevrilemeyen = [], hedefler = [], kayiplar = [];
  for (const o of okuma.opDemeti || []) {
    const c = cevir(o, graf);
    if (c._red) { cevrilemeyen.push({ okumaOp: c.op, neden: c.neden, dogduran: c._neden }); continue; }
    if (c._hedef) { hedefler.push(c); continue; }
    if (c._kayip) kayiplar.push({ op: c.op, kayip: c._kayip });
    const { _neden, _kayip, ...temiz } = c;
    uygulanan.push(temiz);
  }

  // ---------------------------------------------------------------- OP'LARI UYGULA
  //
  // OLCULEN ARIZA (2026-09-08, ilk 5 teslim): bes farkli elbise BAYT AYNI flat/kalip
  // uretti. Kok neden ARANDI ve bulundu: `ops[]` bir PROGRAM DEGIL, bir KAYIT.
  // contract/graf-v1.json: "Uygulanan op kayitlari, sirayla" — yani op'lar zaten
  // uygulanmis varsayilir ve geometri panels/seams'te durur. engine/src/grafciz-cli.cpp
  // icinde 'ops' kelimesi HIC GECMIYOR (rg ile olculdu): cizici op'lari calistirmaz.
  // Motorda applyOp() VAR (engine/src/grafop.cpp) ama onu disari veren bir CLI YOK.
  //
  // O CLI'yi yazmak engine/src/ + engine/CMakeLists.txt demek; A3'un izin listesi
  // disi (madde 3) -> acikSorular'a yazildi, KENDI BASIMA ACMADIM.
  //
  // BURADA YAPILAN: op'un geometrik etkisi grafin KENDI diline (landmark referansi)
  // yazilir. Bu bir kestirme degil, grafin tasarlandigi bicim: kenar zaten
  // "landmark.knee"ye bagli, extendTo o bagi degistirir. Uygulanamayan op ADIYLA
  // uygulanamayan[] listesine duser ve raporda gorunur.
  const uygulanamayan = [];
  for (const o of uygulanan) {
    const a = o.args;
    if (o.op === 'extendTo') {
      const pn = graf.panels.find((x) => x.id === a.panel);
      const e = pn && pn.edges.find((x) => x.id === a.edge);
      if (!e) { uygulanamayan.push({ op: o.op, neden: `kenar yok ${a.panel}/${a.edge}` }); continue; }

      // OLCULEN ARIZA (2026-09-08, ikinci kosum): ilk uygulama `from.landmark`i
      // yeniden yaziyordu ve KOL PANELINI YIRTTI (grafdogrula: "panel_kapali kol:
      // underarm_front.to != hem.from", "halka KOPUK kol_agzi"). Kok neden:
      // bir uc noktasinda `landmark` X CAPASI, y ise AYRI bir alandan
      // (`yLandmark`) geliyor. Kol hem'inde landmark='landmark.underarm'
      // (bicepsin x'i) ama yLandmark='landmark.elbow'. landmark'i degistirmek
      // kenari yatayda baska bir halkaya tasidi, komsu uclarla bulusmaz oldu.
      //
      // DOGRUSU: yalniz Y REFERANSI tasinir. Kenarin kendi uclari + AYNI y'ye
      // bakan butun komsu uclar birlikte, yoksa panel acilir.
      const yEski = new Set();
      for (const uc of [e.from, e.to]) {
        if (!uc) continue;
        if (uc.yLandmark) yEski.add(uc.yLandmark);
        else if (uc.landmark) yEski.add(uc.landmark);
      }
      if (!yEski.size) { uygulanamayan.push({ op: o.op, neden: `kenar ${a.edge} bir landmark'a bagli degil` }); continue; }

      let dokunulan = 0;
      for (const k of pn.edges) {
        for (const uc of [k.from, k.to]) {
          if (!uc) continue;
          if (uc.yLandmark && yEski.has(uc.yLandmark)) { uc.yLandmark = a.yLandmark; dokunulan++; }
          else if (!uc.yLandmark && uc.landmark && yEski.has(uc.landmark)) { uc.landmark = a.yLandmark; dokunulan++; }
        }
      }
      if (!dokunulan) uygulanamayan.push({ op: o.op, neden: `${a.panel}/${a.edge}: tasinacak y ucu bulunamadi` });
    } else if (o.op === 'gather') {
      // gather kenari kendi dogrultusunda ratio kat uzatir. Kenar bir dikise
      // baglıysa dikisin orani guncellenir (contract: "a = buzulen taraf").
      const s = graf.seams.find((x) => (x.a || []).some((r) => r.panel === a.panel && r.edge === a.edge)
                                    || (x.b || []).some((r) => r.panel === a.panel && r.edge === a.edge));
      if (!s) { uygulanamayan.push({ op: o.op, neden: `kenar ${a.panel}/${a.edge} bir dikiste degil` }); continue; }
      s.ratio = a.ratio;   // dikisin iki tarafi arasindaki oran; cozucu bunu gorur
    } else if (o.op === 'closure') {
      const s = graf.seams.find((x) => x.id === a.seam);
      if (!s) { uygulanamayan.push({ op: o.op, neden: `dikis yok ${a.seam}` }); continue; }
      s.closure = { type: a.type, fromFraction: a.fromFraction, toFraction: a.toFraction };
    } else {
      uygulanamayan.push({ op: o.op, neden: 'uretici bu op\'un geometrik etkisini yazmiyor' });
    }
  }

  graf.id = `foto-${sha.slice(0, 8)}`;
  graf.notes = `A3 URETIM. Kaynak fotograf: ${okuma.girdiYolu} (sha ${sha.slice(0,12)}).\n`
    + `Bu graf TABAN GRAF (${TABAN}) uzerine, fotograf okumasindan cevrilen op'lar uygulanarak uretildi.\n`
    + `Uygulanan op: ${uygulanan.length}. Cevrilemeyen okuma op'u: ${cevrilemeyen.length} (adlari graf disinda, uretim raporunda).\n`
    + `Cozucu HEDEFI (grafa yazilmaz, contract yasa 3): ${hedefler.length}.\n`
    + (okuma.arka?.koken === 'turetildi' ? `ARKA TURETILDI: ${okuma.arka.neden}\n` : '')
    + `UYDURULAN SAYI YOK: her deger okumadan (oran) ya da contract'tan.`;
  graf.ops = [...(graf.ops || []), ...uygulanan];

  mkdirSync(cikisDizin, { recursive: true });
  const grafYol = `${cikisDizin}/graf.json`;
  writeFileSync(grafYol, JSON.stringify(graf, null, 1));
  writeFileSync(`${cikisDizin}/kaynak-yolu.txt`,
    `${okuma.girdiYolu}\nsha256 ${sha}\ngorunum ${okuma.gorunum}\n`
    + `okuyan ${okuma.okuyan} (llmCagri 0)\narka.koken ${okuma.arka?.koken}\n`);

  return { okuma, grafYol, uygulanan, cevrilemeyen, hedefler, kayiplar, uygulanamayan };
}

export function ciz(grafYol, cikisDizin) {
  const c = {};
  for (const [ad, body, mod] of [['flat', 'croquis36', 'flat'], ['kalip-36', 'gercek36', 'kalip']]) {
    try {
      const svg = execFileSync('engine/build/grafciz', [grafYol, body, mod], { encoding: 'utf8', maxBuffer: 64e6 });
      writeFileSync(`${cikisDizin}/${ad}.svg`, svg);
      c[ad] = { durum: 'OK', bayt: svg.length };
    } catch (err) {
      c[ad] = { durum: 'HATA', stderr: String(err.stderr || err.message).trim().split('\n').slice(-3).join(' | ') };
    }
  }
  return c;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [sha, dizin] = process.argv.slice(2);
  if (!sha || !dizin) { console.error('kullanim: node KOSU/0509-a3-uret.mjs <sha256> <cikisDizin>'); process.exit(2); }
  const r = uret(sha, dizin);
  const c = ciz(r.grafYol, dizin);
  console.log(JSON.stringify({
    sha: sha.slice(0, 12), girdi: r.okuma.girdiYolu, cikis: dizin,
    uygulananOp: r.uygulanan.map((o) => o.op),
    cevrilemeyen: r.cevrilemeyen, cozucuHedefi: r.hedefler.length,
    landmarkKaybi: r.kayiplar, uygulanamayan: r.uygulanamayan, cizim: c,
  }, null, 1));
}
