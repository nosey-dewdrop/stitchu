#!/usr/bin/env node
// src/read/read.mjs — FOTOGRAF/PROMPT -> SILUET OKUMASI. (11 Eyl 2026, G1)
//
// Zincirin cikan halkasi buydu: 10 Eyl'e kadar fotograf okumasi bir AJANIN
// eliyle yapiliyordu (onbellekteki dosyalarda "Read ile ekran goruntusune
// bakildi" yaziyor). Yani yeni bir fotografta hicbir sey olmuyordu. Bu dosya
// o adimi KOD yapar: girdi fotograf ya da metin, cikti sozlesmeye uyan JSON.
//
// KULLANIM
//   node src/read/read.mjs <fotograf.png>            fotografi okut
//   node src/read/read.mjs --prompt "<metin>"        metin tarifinden oku
//   node src/read/read.mjs --girdi <okuma.json>      okuyucu cagrisi YOK:
//        verilen JSON okuyucu yanitiymis gibi AYNI dogrulama hattindan gecer.
//        (denetim yolu: sema regexi + onbellek + damga tek basina sinanabilir)
//   ... [--no-cache]  onbellege yazma   [--yenile] onbellegi yoksay
//
// ARKA UC: 'claude-p' (Claude Code alt sureci). Ham API anahtari YOK ve
// aranmaz. Arka uc TEK YERDEN degisir: ARKA_UCLAR tablosu + okuAsync(girdi,
// {arkaUc}). G3'te canli urun ayni okuyucuya '/api/analyze' arka ucunu
// ekleyecek; bugun yazilmadi.
//
// CIKTI: stdout'a law/1309-silhouette.json semasina uyan JSON.
// HATA KODLARI (hepsi exit 1, stderr'e tek satir):
//   ERR_GIRDI             girdi yok/okunamiyor
//   ERR_OKUYUCU           alt surec basarisiz / cevap dosyasi yazilmadi
//   ERR_OKUYUCU_TIMEOUT   alt surec zaman tavanini asti
//   ERR_SEMA              donen JSON sozlesme regexlerinden gecmedi (onbellege YAZILMAZ)
//
// YASA: bu dosya cevap anahtari klasorune BAKMAZ ve onu isimlendirmez. O klasor
// bu okuyucunun OLCULDUGU seydir, kopya cekecegi yer degil.

import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { extname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { promptKur } from './prompt.mjs';

const MODEL = 'claude-sonnet-5';
const ZAMAN_TAVANI_MS = 8 * 60 * 1000;
const KOK = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const ONBELLEK = `${KOK}/KOSU/onbellek`;
const DAMGA = 'src/read/read.mjs';

function ol(kod, detay) {
  process.stderr.write(`${kod}${detay ? ': ' + detay : ''}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------- sema dogrulama
const SILUET = JSON.parse(readFileSync(`${KOK}/law/1309-silhouette.json`, 'utf8'));
const X_RE = new RegExp(SILUET.koordinat.xIfade);
const Y_RE = new RegExp(SILUET.koordinat.yIfade);
const LANDMARKLAR = new Set(
  Object.keys(JSON.parse(readFileSync(`${KOK}/law/1309-body.json`, 'utf8')).bedenler.croquis36.landmarklar)
    .map((k) => k.replace(/^landmark\./, '')),
);

/** Bir noktayi dogrula; hata mesaji dizisine yazar. */
function noktaDogrula(p, nerede, hatalar) {
  if (!Array.isArray(p) || p.length !== 2) { hatalar.push(`${nerede}: nokta [xIfade,yIfade] degil`); return; }
  const [x, y] = p;
  const mx = X_RE.exec(String(x));
  if (!mx) { hatalar.push(`${nerede}.x "${x}" xIfade regexine uymuyor`); }
  else if (!LANDMARKLAR.has(mx[1])) { hatalar.push(`${nerede}.x bilinmeyen landmark "${mx[1]}"`); }
  const my = Y_RE.exec(String(y));
  if (!my) { hatalar.push(`${nerede}.y "${y}" yIfade regexine uymuyor`); }
  else {
    if (!LANDMARKLAR.has(my[1])) hatalar.push(`${nerede}.y bilinmeyen landmark "${my[1]}"`);
    if (my[2] && !LANDMARKLAR.has(my[2])) hatalar.push(`${nerede}.y bilinmeyen landmark "${my[2]}"`);
  }
}

// Sozlesmede nokta LISTESI tasimayan tipler.
const TEK_NOKTALI = new Set(['fiyonk', 'bag']);
const NOKTASIZ = new Set(['bebeYaka']);

// EN AZ kac nokta gerekir (cizici bu kadarini indisler; eksigi CIZERKEN cokerdi).
// 12 Eyl: okuyucu tek noktali 'cepKapagi' uretti, sema gecti, ciz() TypeError verdi.
// Sema burada durdurur: eksik noktali okuma onbellege YAZILMAZ.
const EN_AZ_NOKTA = {
  cepKapagi: 2, pili: 2, pat: 2, fermuar: 2, dikis: 2, kesikli: 2,
  roba: 2, buzgu: 2, firfir: 2, drape: 2, dugme: 2, pens: 3,
};

const ZORUNLU_KONTUR = ['yakaOrta', 'yakaOmuz', 'omuzUc', 'koltukalti', 'gogus', 'bel', 'etekYan', 'etekOrta'];

function semaDogrula(o) {
  const h = [];
  if (!o || typeof o !== 'object') return ['cikti bir JSON nesnesi degil'];
  if (!o.on || typeof o.on !== 'object') h.push('on yok');
  for (const gorunum of ['on', 'arka']) {
    const g = o[gorunum];
    if (!g || typeof g !== 'object') continue;
    if (gorunum === 'arka' && g.koken === 'turetildi' && !g.kontur) continue;
    const k = g.kontur;
    if (!k || typeof k !== 'object') { h.push(`${gorunum}.kontur yok`); continue; }
    for (const ad of ZORUNLU_KONTUR) {
      if (k[ad] == null) h.push(`${gorunum}.kontur.${ad} eksik`);
    }
    for (const [ad, p] of Object.entries(k)) {
      if (p == null) continue;
      noktaDogrula(p, `${gorunum}.kontur.${ad}`, h);
    }
    // YASA: etekOrta x=0
    const eo = k.etekOrta && X_RE.exec(String(k.etekOrta[0]));
    if (eo && parseFloat(eo[2]) !== 0) h.push(`${gorunum}.kontur.etekOrta x sifir degil (${k.etekOrta[0]})`);
    // YASA: askiUst.x <= shoulderTip.x
    if (k.askiUst) {
      const a = X_RE.exec(String(k.askiUst[0]));
      if (a && a[1] === 'shoulderTip' && parseFloat(a[2]) > 1) h.push(`${gorunum}.askiUst manken omuz noktasini asiyor (${k.askiUst[0]})`);
    }
    if (g.kol) {
      for (const alan of ['dis', 'ic']) {
        if (g.kol[alan]) noktaDogrula(g.kol[alan], `${gorunum}.kol.${alan}`, h);
      }
    }
    const ogeler = g.ogeler;
    if (ogeler != null) {
      if (!Array.isArray(ogeler)) h.push(`${gorunum}.ogeler dizi degil`);
      else ogeler.forEach((o2, i) => {
        if (!o2 || !o2.tip) { h.push(`${gorunum}.ogeler[${i}] tip yok`); return; }
        // SOZLESME: her tip nokta LISTESI tasimaz. fiyonk/bag tek 'nokta',
        // bebeYaka yalniz 'genislik' alir (siluet-v1.gorunum.ogeler).
        if (TEK_NOKTALI.has(o2.tip) && o2.noktalar == null && o2.nokta) {
          o2.noktalar = [o2.nokta];           // cizici pts[0] okur: tek yerde normalize et
          delete o2.nokta;
        }
        if (NOKTASIZ.has(o2.tip) && o2.noktalar == null) return;
        if (!Array.isArray(o2.noktalar)) { h.push(`${gorunum}.ogeler[${i}] (${o2.tip}) noktalar dizi degil`); return; }
        const enAz = EN_AZ_NOKTA[o2.tip];
        if (enAz && o2.noktalar.length < enAz) {
          h.push(`${gorunum}.ogeler[${i}] (${o2.tip}) ${enAz} nokta ister, ${o2.noktalar.length} geldi`);
          return;
        }
        o2.noktalar.forEach((p, j) => noktaDogrula(p, `${gorunum}.ogeler[${i}](${o2.tip}).noktalar[${j}]`, h));
      });
    }
  }
  if (o.oturma && typeof o.oturma === 'object') {
    for (const a of ['gogus', 'bel']) {
      if (o.oturma[a] != null && typeof o.oturma[a] !== 'boolean') h.push(`oturma.${a} bool degil`);
    }
  }
  return h;
}

// ------------------------------------------------------------ okuyucu arka uclari
// Arka uc TEK YERDEN degisir. Bugun yalniz 'claude-p' var; G3'te canli urun
// icin '/api/analyze' arka ucu buraya EKLENIR, cagiran taraf degismez.
const IZINLI_UZANTI = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

/**
 * ARKA UC: claude-p — Claude Code alt sureci.
 * Ozyineleme kapisi: --restricted (komut/kod calistiran tum arac yok),
 * --tools "Read,Write" (yalniz bu ikisi), --add-dir yalniz gecici dizin, yani
 * alt surec REPOYU YAZILABILIR GORMEZ ve yeni alt ajan DOGURAMAZ.
 * Cevap STDOUT'tan degil, alt surecin yazdigi DOSYADAN okunur: model yanina
 * serbest metin yazsa bile okuma bozulmaz.
 */
async function arkaUcClaudeP({ fotoYolu, metin, prompt }) {
  const kutu = mkdtempSync(`${tmpdir()}/siluet-oku-`);
  try {
    const cevapYolu = `${kutu}/cevap.json`;
    let girdiTarifi;
    if (fotoYolu) {
      const uzanti = extname(fotoYolu).toLowerCase();
      if (!IZINLI_UZANTI.has(uzanti)) ol('ERR_GIRDI', `desteklenmeyen gorsel bicimi: ${uzanti}`);
      copyFileSync(fotoYolu, `${kutu}/girdi${uzanti}`);
      girdiTarifi = `Girdi, bu dizindeki "girdi${uzanti}" dosyasidir. Onu Read araciyla AC ve bak.
Icinde bir giysi var (insan uzerinde, mankende ve/veya satici flat cizimi olarak).`;
    } else {
      girdiTarifi = `Girdi bir METIN TARIFIDIR. Tarif edilen giysiyi, sanki fotografini
goruyormus gibi noktalarla yaz:\n\n"${metin}"`;
    }

    const tamPrompt = `${prompt(girdiTarifi)}

=============================== 13. NASIL TESLIM =========================
Cevabini Write araciyla "cevap.json" adiyla bu dizine YAZ. Dosyanin icinde
YALNIZ JSON nesnesi olsun: aciklama, markdown citi, on-soz YOK. Sohbette ne
yazdigin onemsizdir; okunan sey yalnizca cevap.json dosyasidir.`;

    writeFileSync(`${kutu}/gorev.txt`, tamPrompt);

    const kod = await new Promise((coz) => {
      const p = spawn('claude', [
        '-p', tamPrompt,
        '--model', MODEL,
        '--restricted',            // komut/kod calistiran araclar YOK
        '--strict-mcp-config',     // disaridan MCP sunucusu gelmesin
        '--safe-mode',             // hook/skill/plugin/CLAUDE.md devrede degil
        '--tools', 'Read,Write',   // yalniz oku ve yaz; Agent/Task yok
        '--permission-mode', 'acceptEdits',
        '--output-format', 'json',
        '--no-session-persistence',
        '--add-dir', kutu,         // yazilabilir tek yer: gecici kutu
      ], { cwd: kutu, stdio: ['ignore', 'pipe', 'pipe'] });

      const zaman = setTimeout(() => { p.kill('SIGKILL'); coz('TIMEOUT'); }, ZAMAN_TAVANI_MS);
      let stderr = '';
      p.stderr.on('data', (d) => { stderr += d; });
      p.stdout.on('data', () => {});   // stdout okunur ama KULLANILMAZ (bilerek)
      p.on('error', (e) => { clearTimeout(zaman); coz('HATA:' + e.message); });
      p.on('close', (c) => { clearTimeout(zaman); coz(c === 0 ? 'OK' : `HATA:cikis ${c} ${stderr.slice(0, 200)}`); });
    });

    if (kod === 'TIMEOUT') ol('ERR_OKUYUCU_TIMEOUT', `alt surec ${ZAMAN_TAVANI_MS / 1000} sn icinde bitmedi`);
    if (kod !== 'OK') ol('ERR_OKUYUCU', kod.slice(5));
    if (!existsSync(cevapYolu)) ol('ERR_OKUYUCU', 'alt surec cevap.json yazmadi');
    return readFileSync(cevapYolu, 'utf8');
  } finally {
    rmSync(kutu, { recursive: true, force: true });
  }
}

export const ARKA_UCLAR = { 'claude-p': arkaUcClaudeP };
const VARSAYILAN_ARKA_UC = 'claude-p';

/** Model metninden JSON cikar (kod citi ya da on-soz gelirse). */
function jsonCikar(ham) {
  const citsiz = ham.replace(/^\s*```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { return JSON.parse(citsiz); } catch { /* devam */ }
  const bas = citsiz.indexOf('{'), son = citsiz.lastIndexOf('}');
  if (bas >= 0 && son > bas) {
    try { return JSON.parse(citsiz.slice(bas, son + 1)); } catch { /* devam */ }
  }
  return null;
}

// ------------------------------------------------------------ okuma hatti (tek yer)
/**
 * Bir girdiyi okur ve DOGRULANMIS okumayi dondurur.
 * girdi: { fotoYolu } | { metin } | { girdiJson }  (sonuncusu okuyucuyu cagirmaz)
 * secenek: { arkaUc, onbellege, yenile }
 */
export async function okuAsync(girdi, { arkaUc = VARSAYILAN_ARKA_UC, onbellege = true, yenile = false } = {}) {
  const { fotoYolu, metin, girdiJson } = girdi;
  let okuma, kaynak, sha, okuyan;
  const tarih = new Date().toISOString().slice(0, 10);

  if (girdiJson) {
    // DENETIM YOLU: okuyucu cagrisi YOK. Verilen JSON, okuyucu yanitiymis gibi
    // AYNI dogrulama + onbellek + damga hattindan gecer.
    if (!existsSync(girdiJson)) ol('ERR_GIRDI', `dosya yok: ${girdiJson}`);
    okuma = jsonCikar(readFileSync(girdiJson, 'utf8'));
    if (!okuma) ol('ERR_SEMA', 'girdi JSON olarak ayristirilamadi');
    kaynak = girdiJson;
    sha = createHash('sha256').update(readFileSync(girdiJson)).digest('hex');
    okuyan = `--girdi denetim yolu (okuyucu cagrisi yok), ${tarih}`;
  } else {
    if (fotoYolu && !existsSync(fotoYolu)) ol('ERR_GIRDI', `fotograf yok: ${fotoYolu}`);
    kaynak = fotoYolu || `prompt:${metin}`;
    sha = createHash('sha256').update(fotoYolu ? readFileSync(fotoYolu) : Buffer.from(metin, 'utf8')).digest('hex');

    // ONBELLEK: ayni fotograf ikinci kez OKUYUCUYA GITMEZ (maliyet gercek).
    const onbellekYolu = `${ONBELLEK}/siluet-${sha}.json`;
    if (!yenile && existsSync(onbellekYolu)) {
      const eski = JSON.parse(readFileSync(onbellekYolu, 'utf8'));
      if (eski.uretenScript === DAMGA) return eski;   // elle yazilmis eskiyi KULLANMA
    }

    const calis = ARKA_UCLAR[arkaUc];
    if (!calis) ol('ERR_GIRDI', `bilinmeyen arka uc: ${arkaUc}`);
    const ham = await calis({ fotoYolu, metin, prompt: (girdiTarifi) => promptKur({ kok: KOK, girdiTarifi }) });
    okuma = jsonCikar(ham);
    if (!okuma) ol('ERR_SEMA', `okuyucu JSON dondurmedi: ${String(ham).slice(0, 200)}`);
    okuyan = `${MODEL} via 'claude -p' alt sureci (arkaUc=${arkaUc}), ${tarih}`;
  }

  // SOZLESME: arka gorunmuyorsa "kontur onden KOPYALANIR" (siluet-v1.gorunum._tanim).
  // Bu kopyalamayi KOD yapar; daha once elle yazilan seydi.
  if (okuma.arka && okuma.arka.koken === 'turetildi' && !okuma.arka.kontur && okuma.on?.kontur) {
    okuma.arka.kontur = JSON.parse(JSON.stringify(okuma.on.kontur));
    okuma.arka.yakaBicim ??= okuma.on.yakaBicim;
    okuma.arka.ogeler ??= [];
    okuma.eksik = [...new Set([...(okuma.eksik || []), 'arka gorunmuyor'])];
  }

  // SOZLESME INVARYANTI: arka yaka cukuru ENSEDIR. Onden turetilen ya da
  // dalginlikla neckFront yazilan arka yakaOrta burada nape'e cevrilir.
  // (Bu bir kalite ayari degil, koordinat sisteminin tanimi: contract
  // siluet-v1.gorunum.kontur.yakaOrta + body-v1 landmark.nape.)
  const ayo = okuma.arka?.kontur?.yakaOrta;
  if (Array.isArray(ayo) && typeof ayo[0] === 'string' && !ayo[0].startsWith('nape')) {
    ayo[0] = ayo[0].replace(/^\w+/, 'nape');
  }

  const hatalar = semaDogrula(okuma);
  if (hatalar.length) ol('ERR_SEMA', hatalar.slice(0, 8).join(' | '));

  const cikti = {
    semaSurumu: 'siluet-v1',
    girdiYolu: kaynak,
    sha256: sha,
    okuyan,
    uretenScript: DAMGA,
    ...okuma,
  };

  if (onbellege) {
    if (!existsSync(ONBELLEK)) mkdirSync(ONBELLEK, { recursive: true });
    writeFileSync(`${ONBELLEK}/siluet-${sha}.json`, JSON.stringify(cikti, null, 1) + '\n');
  }
  return cikti;
}

// ---------------------------------------------------------------- CLI
async function ana() {
  const argv = process.argv.slice(2);
  let fotoYolu = null, metin = null, girdiJson = null, onbellege = true, yenile = false;
  let arkaUc = VARSAYILAN_ARKA_UC;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--prompt') metin = argv[++i];
    else if (a === '--girdi') girdiJson = argv[++i];
    else if (a === '--arka-uc') arkaUc = argv[++i];
    else if (a === '--no-cache') onbellege = false;
    else if (a === '--yenile') yenile = true;
    else if (!a.startsWith('--')) fotoYolu = a;
  }
  if (!fotoYolu && !metin && !girdiJson) {
    ol('ERR_GIRDI', 'kullanim: node src/read/read.mjs <foto> | --prompt "<metin>" | --girdi <json>');
  }
  const cikti = await okuAsync({ fotoYolu, metin, girdiJson }, { arkaUc, onbellege, yenile });
  process.stdout.write(JSON.stringify(cikti, null, 1) + '\n');
}

if (process.argv[1] && process.argv[1].endsWith('siluet-oku.mjs')) {
  ana().catch((e) => ol('ERR_OKUYUCU', String((e && e.stack) || e)));
}
