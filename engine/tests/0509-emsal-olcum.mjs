#!/usr/bin/env node
// engine/tests/0509-emsal-olcum.mjs — A1b, 2026-09-06.
//
// NE OLCER. Bizim URETTIGIMIZ flat SVG'nin govde oranini, SATILAN referans
// cizimlerin (K5, deer-and-doe) ayni oraniyla karsilastirir ve farki MILIMETRE
// olarak basar. Kosunun ana metrigi (anaSapmaMM) budur.
//
// NEDEN ORAN, NEDEN MUTLAK DEGIL. Referans cizimler PIKSEL uzerinde olculdu
// (KOSU/flat-olcum.py); piksel/mm olcegi cizimden cizime farkli, o yuzden mutlak
// mm karsilastirmasi anlamsiz. Olcek-bagimsiz olan sey ORANDIR: bel yari-genisligi
// / gogus yari-genisligi. Referans oran KOSU/ciktilar/flat-olcum.json'da
// (oranlar.ortalama = iki kolsuz referanstan; kollu ucunde gogus olculemedi).
// Bu oran contract/mannequin-chart-v1.json v2.oran.belGogus'un da kaynagidir.
//
// ORANDAN MM'YE. Fark mm'ye contract capasi uzerinden cevrilir:
//   sapmaMM = |bizimOran - emsalOran| x croquis.landmarks.chestX.mm
// Yani "gogus yari-genisligi kadar bir mesafede, bel cizgisi emsalden kac mm
// kayik duruyor". Boylece sayi croquis.toleranceMM (2.0 mm) ile AYNI BIRIMDE
// olur. Bu, hakemin A1a'da yakaladigi birim karisikliginin (birimsiz orani mm
// esigine vurmak) dogru yonde cozumudur: esik mm kalir, OLCUM mm'ye cevrilir.
//
// NEREDEN OLCER. Bizim flatin govde genisligi SVG'de ILAN EDILEN nitelikten
// (data-manken-bel-yarim-mm) DEGIL, cizilen siluet YOLUNDAN okunur — ilan ile
// cizim ayrilabilir (flat_ayni_insan_check'in belYarimMutabakat hukmu tam bunu
// olcer). Yol duz cizgi + kubik Bezier segmentlerine ayrilir, verilen y'de
// x-kesisimleri bulunur, yari-genislik = (max x - min x) / 2.
//
// KULLANIM
//   node engine/tests/0509-emsal-olcum.mjs            insan okur (tablo)
//   node engine/tests/0509-emsal-olcum.mjs --json     kapi okur (JSON)
//
// CIKTI (JSON): { anaSapmaMM, esikMM, emsalOran, flatler:[...], olculemeyenler:[...] }
// anaSapmaMM = olculebilen flatlerin MEDYAN sapmasi (tek aykiri cizim metrigi
// zipla­tmasin diye medyan; hepsi listede ayri ayri duruyor).
// Hicbir flat olculemezse anaSapmaMM null olur ve exit 8 ("henuz-yok") doner —
// sessizce 0 basmaz (madde 4: bilinmeyen adiyla ret).

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const CONTRACT = join(ROOT, 'contract', 'flat-convention-v1.json');
const EMSAL_OLCUM = join(ROOT, 'KOSU', 'ciktilar', 'flat-olcum.json');
const CIZIM_DIZIN = join(ROOT, 'KOSU', 'ciktilar');

const JSON_MOD = process.argv.includes('--json');

function oku(p) { return JSON.parse(readFileSync(p, 'utf8')); }

// ---------------------------------------------------------------- esik + emsal
// ESIK: contract'tan ACIK YOL ile okunur. Alt dize taramasi (a la "icinde
// 'tolerans' gecen ilk anahtar") YASAK — A1a'da tam o tarama /sevkPoz/
// yakaParcasi/boyToleransOran = 0.05 (BIRIMSIZ ORAN) dondurup mm esigi yerine
// gecmisti. Yol yoksa ya da sayi degilse: adiyla hata, sessiz default yok.
function esikOku(c) {
  const v = c?.croquis?.toleranceMM;
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error('ESIK_YOK: contract/flat-convention-v1.json /croquis/toleranceMM sayisal degil: ' + JSON.stringify(v));
  }
  return { esikMM: v, esikYol: '/croquis/toleranceMM' };
}

function capaOku(c) {
  const v = c?.croquis?.landmarks?.chestX?.mm;
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error('CAPA_YOK: /croquis/landmarks/chestX/mm sayisal degil: ' + JSON.stringify(v));
  }
  return { capaMM: v, capaYol: '/croquis/landmarks/chestX/mm' };
}

function emsalOranOku(d) {
  const o = d?.oranlar?.ortalama;
  if (typeof o !== 'number' || !Number.isFinite(o)) {
    throw new Error('EMSAL_YOK: KOSU/ciktilar/flat-olcum.json /oranlar/ortalama sayisal degil: ' + JSON.stringify(o));
  }
  return { emsalOran: o, emsalN: d.oranlar.n ?? null,
           emsalKaynak: 'KOSU/ciktilar/flat-olcum.json /oranlar/ortalama (' + Object.keys(d.oranlar.kaynakFlatler || {}).join(', ') + ')' };
}

// ---------------------------------------------------------------- SVG yol ayristirici
// Yalniz M/C/L/Z (mutlak) — uret.mjs hattinin bastigi bicim. Baska bir komut
// harfi gorulurse ADIYLA reddedilir (sessizce atlanmaz).
function yolAyristir(d) {
  const jetonlar = d.match(/[MCLZmclz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
  const segmentler = [];
  let i = 0, komut = null, cx = 0, cy = 0, bx = 0, by = 0;
  const say = () => {
    const v = parseFloat(jetonlar[i++]);
    if (!Number.isFinite(v)) throw new Error('YOL_BOZUK: sayi bekleniyordu, "' + jetonlar[i - 1] + '"');
    return v;
  };
  while (i < jetonlar.length) {
    const j = jetonlar[i];
    if (/^[MCLZmclz]$/.test(j)) { komut = j; i++; }
    else if (komut === null) throw new Error('YOL_BOZUK: komut harfsiz sayi');
    if (komut === 'Z' || komut === 'z') {
      if (cx !== bx || cy !== by) segmentler.push({ t: 'L', p: [cx, cy, bx, by] });
      cx = bx; cy = by;
      if (jetonlar[i] === undefined) break;
      continue;
    }
    if (komut === 'M' || komut === 'm') {
      let x = say(), y = say();
      if (komut === 'm') { x += cx; y += cy; }
      cx = x; cy = y; bx = x; by = y;
      komut = (komut === 'M') ? 'L' : 'l';   // SVG kurali: M'den sonraki ciftler L
      continue;
    }
    if (komut === 'L' || komut === 'l') {
      let x = say(), y = say();
      if (komut === 'l') { x += cx; y += cy; }
      segmentler.push({ t: 'L', p: [cx, cy, x, y] });
      cx = x; cy = y;
      continue;
    }
    if (komut === 'C' || komut === 'c') {
      let x1 = say(), y1 = say(), x2 = say(), y2 = say(), x = say(), y = say();
      if (komut === 'c') { x1 += cx; y1 += cy; x2 += cx; y2 += cy; x += cx; y += cy; }
      segmentler.push({ t: 'C', p: [cx, cy, x1, y1, x2, y2, x, y] });
      cx = x; cy = y;
      continue;
    }
    throw new Error('YOL_KOMUTU_DESTEKLENMIYOR: "' + komut + '" (yalniz M/L/C/Z)');
  }
  return segmentler;
}

function kubik(t, a, b, c, d) {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

// Verilen y'de segmentin x kesisimleri. Bezier icin koklerin yerine ORNEKLEME
// (256 adim + ikili arama) kullanilir: kubik kok cozucu sayisal olarak kirilgan,
// ornekleme deterministik ve buradaki mm hassasiyeti icin fazlasiyla yeterli
// (256 adimda bir segmentin y araligi tipik <1 mm; ikili arama 40 tur, 1e-9).
function kesisimler(seg, y) {
  const out = [];
  if (seg.t === 'L') {
    const [x0, y0, x1, y1] = seg.p;
    if (y0 === y1) { if (y0 === y) { out.push(x0, x1); } return out; }
    const t = (y - y0) / (y1 - y0);
    if (t >= 0 && t <= 1) out.push(x0 + t * (x1 - x0));
    return out;
  }
  const [x0, y0, x1, y1, x2, y2, x3, y3] = seg.p;
  const N = 256;
  let onceT = 0, onceY = y0;
  for (let k = 1; k <= N; k++) {
    const t = k / N;
    const yy = kubik(t, y0, y1, y2, y3);
    if ((onceY - y) === 0) out.push(kubik(onceT, x0, x1, x2, x3));
    else if ((onceY - y) * (yy - y) < 0) {
      let lo = onceT, hi = t;
      for (let it = 0; it < 40; it++) {
        const mid = (lo + hi) / 2;
        const ym = kubik(mid, y0, y1, y2, y3);
        if ((kubik(lo, y0, y1, y2, y3) - y) * (ym - y) <= 0) hi = mid; else lo = mid;
      }
      out.push(kubik((lo + hi) / 2, x0, x1, x2, x3));
    }
    onceT = t; onceY = yy;
  }
  return out;
}

function yariGenislik(segmentler, y) {
  const xs = [];
  for (const s of segmentler) for (const x of kesisimler(s, y)) xs.push(x);
  if (xs.length < 2) return null;
  return (Math.max(...xs) - Math.min(...xs)) / 2;
}

// ---------------------------------------------------------------- flat okuma
function nitelik(etiket, ad) {
  const m = etiket.match(new RegExp(ad + '="([^"]*)"'));
  return m ? m[1] : null;
}

// KAPSAM. Emsal oran (0.85814) BES ELBISE cizimden olculdu (flat-secim.md K5,
// hepsi deer-and-doe elbise). Bir ETEGIN "gogus" hatti ya da bir USTUN "bel"
// hatti (etek ucuna dusuyor) bu orana vurulamaz: ayni isimli iki farkli sey
// olculmus olur — hakemin A1a'da yakaladigi birim/anlam karisikliginin ayni
// turu. O yuzden gecit yalniz data-sinif'i "dress/" ile baslayan flatleri
// OLCER; oteki siniflar KAPSAM DISI adiyla listelenir, sessizce atlanmaz ve
// kirmizi da sayilmaz. Emsal seti elbise disi bir sinifa genisletilirse
// (flat-olcum.json yeniden kosulursa) bu filtre de o sinifi kapsar.
const KAPSAM_ONEKI = 'dress/';

function flatOku(yol) {
  const s = readFileSync(yol, 'utf8');
  const ad = basename(yol);
  const sinif = nitelik(s.slice(0, 600), 'data-sinif');
  if (!sinif) return { ad, kapsamDisi: 'kokte data-sinif yok; sinifi bilinmeyen cizim olculmez' };
  if (!sinif.startsWith(KAPSAM_ONEKI)) {
    return { ad, kapsamDisi: 'sinif "' + sinif + '" — emsal oran ' + KAPSAM_ONEKI + ' cizimlerinden olculdu (flat-secim.md K5)' };
  }
  // on gorunum siluet yolu: data-rol="siluet" + data-view="front"
  const yollar = s.match(/<path[^>]*>/g) || [];
  const hedef = yollar.find(p => /data-rol="siluet"/.test(p) && /data-view="front"/.test(p));
  if (!hedef) return { ad, olculemedi: 'on gorunum siluet yolu yok (data-rol="siluet" + data-view="front")' };

  const birim = parseFloat(nitelik(s.slice(0, 600), 'data-unit-mm') || 'NaN');
  if (!Number.isFinite(birim)) return { ad, olculemedi: 'kokte data-unit-mm yok/sayisal degil' };

  const bustY = parseFloat(nitelik(hedef, 'data-manken-bust-y') || 'NaN');
  const belY = parseFloat(nitelik(hedef, 'data-manken-bel-y') || 'NaN');
  if (!Number.isFinite(bustY) || !Number.isFinite(belY)) {
    return { ad, olculemedi: 'data-manken-bust-y / data-manken-bel-y nitelikleri yok' };
  }
  const dNit = hedef.match(/\sd="([^"]*)"/);
  if (!dNit) return { ad, olculemedi: 'siluet yolunda d= yok' };

  let segmentler;
  try { segmentler = yolAyristir(dNit[1]); }
  catch (e) { return { ad, olculemedi: String(e.message) }; }

  const gogusYari = yariGenislik(segmentler, bustY);
  const belYari = yariGenislik(segmentler, belY);
  if (gogusYari === null) return { ad, olculemedi: 'bust-y=' + bustY + ' hattinda siluet kesisimi yok' };
  if (belYari === null) return { ad, olculemedi: 'bel-y=' + belY + ' hattinda siluet kesisimi yok' };
  if (gogusYari <= 0) return { ad, olculemedi: 'gogus yari-genisligi sifir/negatif: ' + gogusYari };

  return {
    ad,
    bustY, belY,
    gogusYariMM: +(gogusYari * birim).toFixed(4),
    belYariMM: +(belYari * birim).toFixed(4),
    oran: +(belYari / gogusYari).toFixed(6),
    ilanBelYarimMM: (() => { const v = parseFloat(nitelik(hedef, 'data-manken-bel-yarim-mm') || 'NaN'); return Number.isFinite(v) ? v : null; })(),
  };
}

function medyan(a) {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  if (!n) return null;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

// ---------------------------------------------------------------- ana
function ana() {
  if (!existsSync(CONTRACT)) throw new Error('CONTRACT_YOK: ' + CONTRACT);
  if (!existsSync(EMSAL_OLCUM)) throw new Error('EMSAL_YOK: ' + EMSAL_OLCUM);
  const c = oku(CONTRACT);
  const { esikMM, esikYol } = esikOku(c);
  const { capaMM, capaYol } = capaOku(c);
  const { emsalOran, emsalN, emsalKaynak } = emsalOranOku(oku(EMSAL_OLCUM));

  // olculecek cizimler: kosunun kendi urettigi flat SVG'ler (KOSU/ciktilar/NN-*.svg)
  let dosyalar = [];
  if (existsSync(CIZIM_DIZIN)) {
    dosyalar = readdirSync(CIZIM_DIZIN)
      .filter(f => /^\d{2}-.*\.svg$/.test(f))
      .sort()
      .map(f => join(CIZIM_DIZIN, f));
  }
  if (!dosyalar.length) {
    return { anaSapmaMM: null, esikMM, esikYol, capaMM, capaYol, emsalOran, emsalN, emsalKaynak,
             flatler: [], olculemeyenler: [], kapsamDisi: [], neden: 'KOSU/ciktilar altinda NN-*.svg yok (node KOSU/uret.mjs kosulmadi)' };
  }

  const flatler = [], olculemeyenler = [], kapsamDisi = [];
  for (const y of dosyalar) {
    const r = flatOku(y);
    if (r.kapsamDisi) { kapsamDisi.push({ ad: r.ad, neden: r.kapsamDisi }); continue; }
    if (r.olculemedi) { olculemeyenler.push({ ad: r.ad, neden: r.olculemedi }); continue; }
    r.sapmaMM = +(Math.abs(r.oran - emsalOran) * capaMM).toFixed(4);
    r.hukum = r.sapmaMM <= esikMM ? 'YESIL' : 'KIRMIZI';
    flatler.push(r);
  }

  const anaSapmaMM = flatler.length ? +medyan(flatler.map(f => f.sapmaMM)).toFixed(4) : null;
  return {
    anaSapmaMM, esikMM, esikYol, capaMM, capaYol, emsalOran, emsalN, emsalKaynak,
    olculen: flatler.length, kirmizi: flatler.filter(f => f.hukum === 'KIRMIZI').length,
    kapsam: KAPSAM_ONEKI,
    flatler, olculemeyenler, kapsamDisi,
    yontem: 'sapmaMM = |bizimOran - emsalOran| x chestX.mm; oran = siluet yolundan olculen belYari/gogusYari',
  };
}

let cikti, hataMetni = null;
try { cikti = ana(); }
catch (e) { hataMetni = String(e.message || e); cikti = { anaSapmaMM: null, hata: hataMetni }; }

if (JSON_MOD) {
  process.stdout.write(JSON.stringify(cikti, null, 2) + '\n');
} else {
  if (hataMetni) console.log('HATA ' + hataMetni);
  else {
    console.log('emsal oran      : ' + cikti.emsalOran + '  (n=' + cikti.emsalN + ')  ' + cikti.emsalKaynak);
    console.log('esik            : ' + cikti.esikMM + ' mm  <- ' + cikti.esikYol);
    console.log('mm capasi       : ' + cikti.capaMM + ' mm  <- ' + cikti.capaYol);
    console.log('');
    for (const f of cikti.flatler || []) {
      console.log([f.hukum.padEnd(8), f.ad.padEnd(42), 'oran=' + f.oran.toFixed(4),
                   'gogus=' + f.gogusYariMM.toFixed(1) + 'mm', 'bel=' + f.belYariMM.toFixed(1) + 'mm',
                   'sapma=' + f.sapmaMM.toFixed(2) + 'mm'].join(' '));
    }
    for (const o of cikti.olculemeyenler || []) console.log('OLCULEMEDI ' + o.ad + ': ' + o.neden);
    for (const o of cikti.kapsamDisi || []) console.log('KAPSAM-DISI ' + o.ad + ': ' + o.neden);
    console.log('');
    console.log('ANA SAPMA (medyan): ' + (cikti.anaSapmaMM === null ? 'null' : cikti.anaSapmaMM + ' mm')
                + '   esik ' + (cikti.esikMM ?? 'null') + ' mm');
  }
}

// exit: 0 yesil, 1 kirmizi, 8 olculemiyor (henuz-yok), 2 arac hatasi
if (hataMetni) process.exit(2);
if (cikti.anaSapmaMM === null) process.exit(8);
process.exit(cikti.anaSapmaMM <= cikti.esikMM ? 0 : 1);
