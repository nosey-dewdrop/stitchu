// KOSU/goz.mjs — GOZ HAKEMI (Damla, 12 Eyl 2026)
//
// NEDEN VAR: 24 A4 turu bosa gitti cunku hakem her tur INTERNETTEN FARKLI satici
// setini olcut cekti (tur25 Tilly, tur26 Friday -> 0/11, tur27 Cashmerette -> 7/11).
// Olcut oynak olunca skor gurultu oldu, 24 turda yukselen egri cikmadi.
//
// BU HAKEM FARKLI: olcutu internetten CEKMEZ. Olcut, girdinin KENDISI —
// ilan gorselini (fotograf + saticinin kendi flat'i) SOLA, bizim cizimi SAGA koyar
// ve sorar: musteri soldakini gorup sagdakini alsa ayni giysiyi aldigini dusunur mu?
// Fotograf degismedigi surece olcut degismez.
//
// NEDEN BINDIRME DEGIL (12 Eyl, iki yanlislama ile elendi):
// Once flat gercek fotografin USTUNE kirmizi bindiriliyordu. Bozuk ciktiya dogru
// hukum verdi ("omuz ~20cm ice, etek ~15cm asagi"), AMA insan eliyle yazilmis ALTIN
// kopyaya da SATILMAZ dedi. Sebep hakem degil, hizalamaydi: etsy-10'da iki model var,
// flat yanlis olanin ustune oturdu; kenar-enerjisi hizalamasi denendi, bu kez ikisinin
// ARASINA dustu. Bindirmeyi otomatik hizalamak, cozmeye calistigimizdan daha zor bir
// goru problemi; hakemi o belirsizligin ustune kurmak olcumu yine gurultulu yapardi.
// Yan yana kurulunca ayni hakem AYIRT ETTI: ayni altin cizime 4 bolgenin 3'unde EVET,
// tek gercek farki buldu (kare yakadaki fisto seridi bizim cizimde yok).
//
// NEDEN SAYI DEGIL DE MODEL: piksel metrigi denendi ve ELENDI (12 Eyl olcumu).
// bizim bozuk cizim   -> kapsam 0.805, en genis 0.777, bel daralma 0.043
// insan eliyle altin  -> kapsam 0.805, en genis 0.770, bel daralma 0.050
// Gozle biri giysi digeri degil, ama sayilar AYNI. O metrik kapiya konsaydi
// 24 turun aynisi tekrar ederdi. Goren bir model gerekiyor.
//
// Kullanim:
//   node KOSU/goz.mjs <ilan-gorseli> <bizim-flat.png|svg> [--cikis yanyana.jpg] [--json]
// Cikti: dort bolgenin EVET/HAYIR'i + SATILIR/SATILMAZ. --json ile makine okunur.
// Cikis kodu: 0 = SATILIR, 1 = SATILMAZ, 2 = arac hatasi.

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';

const BOLGELER = ['yaka/omuz', 'kolevi/kol', 'bel ve govde oturusu', 'etek bicimi ve boyu'];
// Model Turkce aksanli ve degisken yazabiliyor ("omuz hattı:", "koltuk altı:", "kol oyugu:").
// Eslestirme ilk kelimeye degil ANAHTAR KUMESINE bakar (12 Eyl: koltukalti satiri kaciyordu).
const ANAHTAR = {
  'yaka/omuz':            [/yaka/i, /omuz/i, /neckline/i],
  'kolevi/kol':           [/kol\s*ev/i, /kolevi/i, /\bkol\b/i, /koltuk\s*alt/i, /armhole/i],
  'bel ve govde oturusu': [/\bbel\b/i, /govde/i, /gövde/i, /oturus/i],
  'etek bicimi ve boyu':  [/etek/i, /\bhem\b/i, /\bboy\b/i],
};
const ZAMAN_TAVANI_MS = 5 * 60 * 1000;

function kullanim(m) { console.error(m); process.exit(2); }

// --- yan yana: solda ilan gorseli, sagda bizim cizim. Hizalama YOK, goz kendi kiyaslar.
function yanYanaYap(ilanYol, bizimPngYol, cikisYol) {
  const py = `
from PIL import Image
a = Image.open(${JSON.stringify(ilanYol)}).convert('RGB')
b = Image.open(${JSON.stringify(bizimPngYol)}).convert('RGB')
H = 1400
a = a.resize((max(1,int(a.width * H / a.height)), H), Image.LANCZOS)
b = b.resize((max(1,int(b.width * H / b.height)), H), Image.LANCZOS)
t = Image.new('RGB', (a.width + b.width + 24, H), (255, 255, 255))
t.paste(a, (0, 0)); t.paste(b, (a.width + 24, 0))
t.save(${JSON.stringify(cikisYol)}, quality=92)
`;
  const r = spawnSync3('python3', ['-c', py]);
  if (r.code !== 0) throw new Error('ERR_YANYANA: ' + (r.err || '').slice(0, 200));
}

function spawnSync3(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
}

const SORU = (dosya) => `Read araciyla ./${dosya} dosyasini ac ve GORSELE BAK.

SOLDA: bir Etsy kalip ilani — giysinin gercek fotografi ve cogu zaman saticinin
kendi teknik cizimi (flat). Ikisi de olcuttur.
SAGDA: bizim urettigimiz teknik cizim (on + arka).

ONCE KONTROL: soldaki gorselde giysi gercekten gorunuyor mu? Gorunmuyorsa tek satir
yaz ve DUR:  OLCULEMEZ: giysi gorunmuyor

SORU: sagdaki cizim soldaki giysiyi DOGRU anlatiyor mu? Bir musteri soldaki ilani
gorup sagdaki cizimi alsa, AYNI giysiyi aldigini dusunur mu?

Su dort bolge icin AYRI AYRI. Her satir tam su bicimde:
<bolge>: EVET
<bolge>: HAYIR — <ne farkli>

Bolgeler (bu sirayla, bu adlarla):
yaka/omuz
kolevi/kol
bel ve govde oturusu
etek bicimi ve boyu

Sonra bos satir, sonra TEK KELIME: SATILIR ya da SATILMAZ.

Kural: "guzel gorunuyor" cevap degildir. Her HAYIR somut bir fark tasir.
Suphedeysen SATILMAZ. Suslemeden yaz.`;

async function gozeSor(bindirmeYol) {
  const kutu = resolve(bindirmeYol, '..');
  const ad = bindirmeYol.split('/').pop();
  return new Promise((cozum, ret) => {
    const p = spawn('claude', [
      '-p',
      '--restricted',              // komut/kod calistiran araclar YOK
      '--tools', 'Read',           // yalniz oku; Agent/Task yok -> ozyineleme yok
      '--output-format', 'json',
      '--no-session-persistence',
      '--add-dir', kutu,
      '--model', 'claude-sonnet-5',
    ], { cwd: kutu, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '';
    const saat = setTimeout(() => { p.kill('SIGKILL'); ret(new Error('ERR_GOZ_TIMEOUT')); }, ZAMAN_TAVANI_MS);
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', () => {
      clearTimeout(saat);
      try { cozum(JSON.parse(out).result || ''); }
      catch { ret(new Error('ERR_GOZ_JSON: ' + (err || out).slice(0, 200))); }
    });
    p.stdin.write(SORU(ad)); p.stdin.end();
  });
}

function hukmuCoz(metin) {
  // Fotografsiz ilan (or. etsy-01: yalniz satici flat'i) olculemez.
  // 12 Eyl yanlislamasi bunu yakaladi: hakem "karsilastiracak fotograf yok" dedi,
  // arac ise bunu SATILMAZ sayiyordu. Yanlis hukum; ayri durum olarak isaretlenir.
  if (/OLCULEMEZ|olculemez|giysi gorunmuyor|fotograf yok/i.test(metin)) {
    return { bolge: {}, satilir: null, olculemez: true, sebep: 'giysi gorunmuyor' };
  }
  const satirlar = metin.split('\n').map((s) => s.trim()).filter(Boolean);
  const bolge = {};
  for (const b of BOLGELER) {
    const s = satirlar.find((x) => {
      const t = x.replace(/\*/g, '');
      return ANAHTAR[b].some((re) => re.test(t)) && /(EVET|HAYIR)/i.test(t);
    });
    if (!s) { bolge[b] = { oturdu: null, not: 'cevapta yok' }; continue; }
    const evet = /\bEVET\b/i.test(s) && !/\bHAYIR\b/i.test(s);
    bolge[b] = { oturdu: evet, not: s.replace(/\*/g, '') };
  }
  const sonSatir = /\bSATILIR\b/i.test(metin) && !/\bSATILMAZ\b/i.test(metin);
  // Sert kural: bir bolge bile oturmuyorsa ya da cevapsizsa SATILMAZ.
  // Model "SATILIR" dese bile bolge hukmu kazanir; sessiz gecis yok.
  const hepsiOturdu = BOLGELER.every((b) => bolge[b]?.oturdu === true);
  const satilir = sonSatir && hepsiOturdu;
  const eksik = BOLGELER.filter((b) => bolge[b]?.oturdu === null);
  return { bolge, satilir, eksikBolgeler: eksik, modelSonSatiri: sonSatir };
}

// --- ana
const argv = process.argv.slice(2);
if (argv.length < 2) kullanim('kullanim: node KOSU/goz.mjs <fotograf> <flat.png|svg> [--cikis x.jpg] [--json]');
const [fotoArg, flatArg] = argv;
const jsonMu = argv.includes('--json');
const ci = argv.indexOf('--cikis');
const kutu = mkdtempSync(join(tmpdir(), 'goz-'));
const cikis = ci >= 0 ? resolve(argv[ci + 1]) : join(kutu, 'bindirme.jpg');

if (!existsSync(fotoArg)) kullanim('fotograf yok: ' + fotoArg);
if (!existsSync(flatArg)) kullanim('flat yok: ' + flatArg);

try {
  // svg geldiyse once png'ye cevir (repo aracini kullan)
  let flatPng = resolve(flatArg);
  if (extname(flatArg).toLowerCase() === '.svg') {
    flatPng = join(kutu, 'flat.png');
    const r = spawnSync3('node', ['KOSU/0509-a3-png.mjs', resolve(flatArg), flatPng]);
    if (!existsSync(flatPng)) throw new Error('ERR_PNG: svg png yapilamadi ' + (r.err || '').slice(0, 150));
  }
  yanYanaYap(resolve(fotoArg), flatPng, cikis);
  const metin = await gozeSor(cikis);
  const h = hukmuCoz(metin);
  if (h.olculemez) {
    if (jsonMu) console.log(JSON.stringify({ yanyana: cikis, olculemez: true, sebep: h.sebep, ham: metin }, null, 1));
    else console.log('yanyana: ' + cikis + '\n\nHUKUM: OLCULEMEZ (' + h.sebep + ')');
    process.exit(3);   // 3 = olculemez; ne gecti ne kaldi
  }
  if (jsonMu) {
    console.log(JSON.stringify({ yanyana: cikis, ...h, ham: metin }, null, 1));
  } else {
    console.log('yanyana: ' + cikis);
    for (const b of BOLGELER) console.log('  ' + (h.bolge[b]?.not || b + ': ?'));
    console.log('\nHUKUM: ' + (h.satilir ? 'SATILIR' : 'SATILMAZ'));
  }
  process.exit(h.satilir ? 0 : 1);
} catch (e) {
  console.error(String(e.message || e));
  process.exit(2);
}
