#!/usr/bin/env node
// docs_truth_check.mjs — DOKÜMAN DOĞRULUK KAPISI (kart V9-B, 2026-08-25).
// Node yerleşikleri dışında bağımlılığı YOKTUR.
//
// ═══ NE ÖLÇER ═══════════════════════════════════════════════════════════════
// Kapsam: `docs/**` (arşiv dâhil) prose dosyaları + `README.md`.
//   D1/D2 → `.md` + `.html`   ·   D3 → `.md` + `README.md` (V9-A §1 sayım kapsamı)
//   `docs/archive/tools/*.mjs|*.js` KAPSAM DIŞI (V9-A §3: backtick'leri JS
//   template literal, ilk koşuda 177 sahte "ölü link" ürettiler).
//
// D1 — DURAN İDDİA (RULES §6/§7). Docs bir sayıyı SABİT GERÇEK olarak ilan
//      edemez; onu BASAN aletin adını yazar. Yasaklı kalıp listesi ve hard-0
//      hedefi buradan gelir. Kaynaklı taban: Google developer documentation
//      style guide, "Excessive claims" — *"Makes a statement about performance
//      or cost that isn't easily verifiable"* ve *"If you make specific
//      performance claims … make sure that you reference the source of your
//      information"* (CC BY 4.0; künye `GECE/V9-R.md` §1 satır B4).
//
// D2 — ÖLÜ REPO YOLU. Dokümanın VAR gibi sunduğu her md-linki ve yol görünümlü
//      backtick dizesi diske vurulur. Çözücü `GECE/log/V9-A.links.py`'den
//      DEVRALINDI (yeniden yazılmadı): satır eki `:12` atılır, `{a,b}` açılır,
//      `*` glob çözülür, `/` içermeyen aday BASENAME olarak repoda aranır.
//      Emsal: lychee (Apache-2.0 VEYA MIT) — ölü link kapısı, ihlal ile kapının
//      kendi arızası AYRI exit kodu alır (`GECE/V9-R.md` §1 satır B3). Burada:
//      exit 0 yeşil · exit 1 İHLAL · exit 3 KAPININ KENDİ ARIZASI.
//
// D3 — SAYISAL İDDİANIN SAĞLAYICISI (RATCHET, hard 0 DEĞİL). Sayı+birim taşıyan
//      her prose satırı için: satırda ya da kapsayıcı paragrafta backtick içinde
//      bir alet/test adı ya da bir kanıt yolu var mı? Yoksa "sağlayıcısız".
//      ⚠ V9-A §1'in uyarısı uygulandı: iddia cümlesi SAYISI bir sağlık göstergesi
//      DEĞİLDİR (RULES §6 onarımı cümle sayısını YÜKSELTİR, 0C 28 → bugün 104).
//      Bu yüzden eşik cümle sayısına değil, SAĞLAYICISIZ cümle sayısına konur.
//
// ═══ İSTİSNA KURALI — NEDEN ZORUNLU (V9-A §2B'nin GEREKÇESİ) ════════════════
// V9-A ölçtü: bugünkü ağaçta 16 ham hit'in 13'ü YANLIŞ POZİTİF. İkisi
// (`docs/ARCHITECTURE.md:43`, `README.md:48`) emekli edilen cümlenin TA KENDİSİNİ
// tırnak içinde taşıyor: *"the standing 'worst pair is now 0.00 mm' wording was
// replaced on 24 Aug 2026 under RULES §6"*. Kalan 11'i ya tarihli bir ÖLÇÜM kaydı
// (ölçülen KUSUR: "byte-identical SVGs", kanıtı `GECE/V5-D.md`) ya da Türkçe bir
// TANIM cümlesi. Düz `grep` tabanlı bir kapı 13'ün hepsine ateş eder ve
// **RULES §6 ONARIMINI CEZALANDIRIR** — doğru davranışın maliyeti kırmızı olur.
// Bu yüzden hit DÜŞER eğer:
//   (a) hit backtick/tırnak içindeyse (kod-span ya da alıntı), VEYA
//   (b) aynı satırda EXCEPTION_CONTEXT kalıplarından biri + bir TARİH varsa.
// Fenced kod blokları (``` … ```) hiç taranmaz — GitLab'ın Vale `scope: raw`
// dersi (`GECE/V9-R.md` §4 md.6): kendi ürettiğimiz gerçek test çıktısını
// "yasaklı iddia" sanma.
//
// ═══ TABAN VE KAÇIŞ — YAYINLANMIŞ EMSAL ════════════════════════════════════
// V9-R §2 Soru 1'in cevabı: "kaçışsız bir yasaklı-kalıp kapısının yayınlanmış
// emsali YOK" — açılan HER alette (doctest `+SKIP`, markdownlint
// `disable-next-line`, Vale `<!-- vale off -->` + `accept.txt`, woke
// `wokeignore:rule=`, lychee `.lycheeignore`) bir kaçış vardı. Ve V9-R §2
// Soru 2: "N ihlale kadar tolerans" diye YAYINLANMIŞ bir sayı YOK; yayınlanan
// tek eşik SIFIR + açık muafiyet. Bu yüzden burada UYDURMA TOLERANS YOKTUR:
//   · D1/D2 eşiği = 0. Bugün açık olan ihlaller `docs-truth-baseline.json`
//     içinde TEK TEK, satır metniyle KAYITLI BORÇ olarak durur (Vale
//     `accept.txt` / woke `.wokeignore` emsali; Crossplane/Elastic/Grafana
//     pratiği, V9-R §1 satır D3: yanlış pozitif kapıyı GEVŞETMEZ, aynı
//     commit'te görünür ve versiyonlanmış bir listeye girer).
//   · Listede OLMAYAN her ihlal KIRMIZI. Liste yalnız KÜÇÜLEBİLİR: bir borç
//     kapanınca kapı yeşil kalır ama taban KENDİLİĞİNDEN güncellenmez —
//     düşüşü sabitlemek ayrı, bilinçli bir `--baseline` commit'idir
//     (`vocab_reference_check` emsali, aynı dizin).
//   · D3 tabanı SAYIdır ve yalnız DÜŞEBİLİR.
//   · `--no-baseline`: tabanı yok sayan HARD-0 kipi. §4.2 kırmızı kanıtı bu
//     kiple alınır (`GECE/log/V9-B.red-before.txt`).
//
// ═══ NE YAKALAMAZ ═══════════════════════════════════════════════════════════
// · Bir cümlenin DOĞRU olup olmadığını bilmez. Yalnız (a) yasaklı duran-iddia
//   biçimini, (b) hedefin diskte olup olmadığını, (c) sayının yanında bir alet
//   ADI olup olmadığını ölçer. "Alet adı var" ≠ "sayı o aletten çıktı".
// · Basename çözücü zaafı DEVRALINDI (V9-A §8): `print-info.pdf` gibi yalın bir
//   ad repoda HERHANGİ bir yerde bulunursa VAR sayılır; HANGİ paketin olduğu
//   doğrulanmaz. Bu, D2'nin VAR sayısını yukarı yanlı yapar.
// · Türkçe çekim ekleri: `bitti` kalıbı "bittiğinde"ye de ateş eder. Tırnak
//   içindeyse düşer, değilse borç listesine girer.
// · Cog `--check` sınıfı POZİTİF taraf (sayıyı elle yazma, aletle ÜRET) burada
//   YOK — V9-R §4 md.1 bunu birinci sıraya koyuyor, bu kapı yalnız ikinci
//   savunma hattı (yasaklı kalıp + ölü hedef + sağlayıcı) kuruyor.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const BASELINE = path.join(ROOT, 'engine', 'tests', 'docs-truth-baseline.json');

const EXIT_OK = 0, EXIT_VIOLATION = 1, EXIT_GATE_BROKEN = 3;

function die(msg) { console.error('GATE ERROR: ' + msg); process.exit(EXIT_GATE_BROKEN); }

// ───────────────────────── kapsam ──────────────────────────────────────────
const PRUNE = new Set(['.git', 'node_modules', 'build', 'build-wasm', '.venv',
  '__pycache__', 'third_party', 'emsdk', '.rabadon', '.wrangler']);

function walk(dir, out = []) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    if (PRUNE.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile()) out.push(p);
  }
  return out;
}

const docsFiles = fs.existsSync(path.join(ROOT, 'docs'))
  ? walk(path.join(ROOT, 'docs')).map(p => path.relative(ROOT, p)).sort()
  : [];
const ARCHIVE_TOOLS = /^docs\/archive\/tools\/.*\.(mjs|js)$/;
const proseFiles = [...docsFiles.filter(p => /\.(md|html)$/i.test(p) && !ARCHIVE_TOOLS.test(p)),
                    'README.md'].filter(p => fs.existsSync(path.join(ROOT, p)));
const mdFiles = proseFiles.filter(p => /\.md$/i.test(p));

// ───────────────────────── ortak metin araçları ────────────────────────────
// Fenced kod bloğu satırları taranmaz (V9-R §4 md.6, GitLab scope:raw dersi).
function fenceMask(lines, isMd) {
  const mask = new Array(lines.length).fill(false);
  if (!isMd) return mask;
  let open = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) { mask[i] = true; open = !open; continue; }
    mask[i] = open;
  }
  return mask;
}

// Türkçe çekim eki kesmesi (H1.0'ın) tırnak SAYILMAZ: kelime içi ' maskelenir.
function maskWordApostrophes(line) {
  return line.replace(/([\p{L}\p{N}])['’]([\p{L}\p{N}])/gu, '$1 $2');
}

// KAPSAYICI BLOK. "Boş satırla ayrılmış paragraf" markdown'da FAZLA GENİŞ:
// ölçüldü — `docs/ARCHITECTURE.md`'nin "Known limits" madde listesi tek blok ve
// bir maddedeki "YOK" bütün listeyi muaf kılıyordu (ARCH:249 `engine/SPECS-next-
// vocabulary.md` böyle kaçmıştı). Kapsayıcı = MADDE: satırın kendisi + yeni bir
// madde/başlık/tablo satırı başlamadan devam eden sarma satırları. Tablo satırı
// (`|` ile başlayan) tek başına bir kapsayıcıdır — kartın "tablo satırında" şartı.
const ITEM_START = /^\s*(?:[-*+] |\d+[.)] |#{1,6} |\||>|```|~~~)/;
function itemBlobs(lines) {
  const out = new Array(lines.length).fill('');
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim() === '') { i++; continue; }
    let j = i + 1;
    while (j < lines.length && lines[j].trim() !== '' && !ITEM_START.test(lines[j])) j++;
    const blob = lines.slice(i, j).join('\n');
    for (let k = i; k < j; k++) out[k] = blob;
    i = j;
  }
  return out;
}

// Bir satırdaki "alıntı/kod-span" aralıkları: `..` , ".." , '..' , “..” , ‘..’
function quotedRanges(line) {
  const src = maskWordApostrophes(line);
  const ranges = [];
  const pairSame = (ch) => {
    let open = -1;
    for (let i = 0; i < src.length; i++) {
      if (src[i] !== ch) continue;
      if (open < 0) open = i; else { ranges.push([open, i]); open = -1; }
    }
  };
  pairSame('`'); pairSame('"'); pairSame("'");
  const pairDiff = (o, c) => {
    let open = -1;
    for (let i = 0; i < src.length; i++) {
      if (src[i] === o && open < 0) open = i;
      else if (src[i] === c && open >= 0) { ranges.push([open, i]); open = -1; }
    }
  };
  pairDiff('“', '”'); pairDiff('‘', '’'); pairDiff('«', '»');
  return ranges;
}
const inRanges = (ranges, i) => ranges.some(([a, b]) => i >= a && i <= b);

// ───────────────────────── D1 — duran iddia ────────────────────────────────
const STANDING = [
  ['ALL PASS',              /ALL PASS/g],
  ['0.00mm',                /0\.00 ?mm/g],
  ['0.0000mm',              /0\.0000 ?mm/g],
  ['byte-identical',        /byte-identical/g],
  ['bayt bayt',             /bayt bayt/g],
  ['zero issues',           /zero issues/g],
  ['zero failures',         /zero failures/g],
  ['zero validation issues',/zero validation issues/g],
  ['hatasız',               /hatasız/g],
  ['bitti',                 /bitti/g],
  ['hazır',                 /hazır/g],
  ['none known',            /none known/g],
  ['validator-clean',       /validator[- ]clean/g],
  ['bugs: none',            /bugs: *none/gi],
];
// (b) şıkkı: ÖLÇÜM/EMEKLİ bağlamı + bir TARİH aynı satırda ise hit düşer.
const EXCEPTION_CONTEXT =
  /replaced|was measured|ölçüldü|bayatladı|emekli|GECE\/|ctest |node engine\/tools\//;
const DATE = /\d{4}|\d{1,2} (Ağu|Aug|Tem|Jul)/;

function scanD1() {
  const hits = [];   // gerçek ihlal
  let raw = 0, droppedQuote = 0, droppedCtx = 0, droppedFence = 0;
  for (const rel of proseFiles) {
    const isMd = /\.md$/i.test(rel);
    let text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    if (!isMd) text = text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,
      m => m.replace(/[^\n]/g, ' '));
    const lines = text.split('\n');
    const fence = fenceMask(lines, isMd);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const q = quotedRanges(line);
      const ctxDrop = EXCEPTION_CONTEXT.test(line) && DATE.test(line);
      for (const [name, re] of STANDING) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line)) !== null) {
          raw++;
          if (fence[i]) { droppedFence++; continue; }
          if (inRanges(q, m.index)) { droppedQuote++; continue; }
          if (ctxDrop) { droppedCtx++; continue; }
          hits.push({ dosya: rel, satirNo: i + 1, kalip: name,
                      satir: line.trim().slice(0, 160) });
        }
      }
    }
  }
  return { hits, raw, droppedQuote, droppedCtx, droppedFence };
}

// ───────────────────────── D2 — ölü repo yolu ──────────────────────────────
// Çözücü GECE/log/V9-A.links.py'den devralındı (aynı normalizasyon adımları).
const MD_LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const TICK = /`([^`\n]+)`/g;
const LINEREF = /:\d+(?:[-,]\d+)*$/;
const BRACE = /^(.*)\{([^}]*)\}(.*)$/;
const SUFFIX = ['.md', '.json', '.cpp', '.hpp', '.py', '.mjs', '.js', '.html', '.svg',
  '.png', '.csv', '.sh', '.txt', '.yaml', '.yml', '.sql', '.pdf', '.xml'];
const SKIPPRE = ['http://', 'https://', 'mailto:', '#', '-', '$', '/tmp/', '~', '/'];

// ═══ İZLENEN AĞAÇ — D2'nin VARLIK SORUSU DİSKE DEĞİL GİT'E SORULUR ═══════════
// V9-B3'ün onardığı KÖK KUSUR: D2 hedefi `fs.existsSync` ile YOKLUYORDU, yani
// "var mı" sorusu TEK BİR ÇALIŞMA DİZİNİNİN özelliğiydi. ÖLÇÜLDÜ (bağımsız
// hakem + V9-B3 yeniden üretimi, `GECE/log/V9-B3.clean-checkout.txt`):
// `git worktree add /tmp/v9head HEAD` ile TEMİZ bir checkout'ta aynı commit
// EXIT 1 · D2 YENİ 42 veriyordu. 19 tekil hedefin 17'si gitignore'lı ÜRETİLEN
// artefakt (`engine/dist/`, `engine/build/`, `Logs/`, `CLAUDE.md`), 2'si gerçek
// ölü. Yani mühürlenen "D2 0" dokümanın değil bir DİZİNİN özelliğiydi; temiz
// klonda / CI'da kapı YENİ BİR KIRMIZI AD olurdu = RULES md.9 ihlali.
// Onarım: hedef `git ls-files` + `git ls-tree -r HEAD` BİRLEŞİMİNE yoklanır.
// Disk hiç okunmaz → verdict çalışma dizininden BAĞIMSIZ.
function gitZ(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'] }).split('\0').filter(Boolean);
  } catch { return null; }
}
const lsFiles = gitZ('git ls-files -z');
if (lsFiles === null)
  die('git ls-files koşmadı — D2 izlenen ağaca soramaz. EKSİK YASA ASLA GEÇİŞ DEĞİLDİR.');
const lsTree = gitZ('git ls-tree -r HEAD --name-only -z') ?? [];
const TRACKED = new Set([...lsFiles, ...lsTree]);
const TRACKED_DIRS = new Set();
const DIRENTS = new Map();                 // dizin ('' = kök) -> Set(ad)
const addEnt = (dir, name) => {
  if (!DIRENTS.has(dir)) DIRENTS.set(dir, new Set());
  DIRENTS.get(dir).add(name);
};
for (const f of TRACKED) {
  let child = f;
  let d = path.posix.dirname(f);
  while (true) {
    const dir = (d === '.' || d === '/') ? '' : d;
    addEnt(dir, path.posix.basename(child));
    if (dir === '') break;
    TRACKED_DIRS.add(dir);
    child = dir;
    d = path.posix.dirname(dir);
  }
}
const TRACKED_BASENAME = new Map();
for (const f of TRACKED) {
  const b = path.posix.basename(f);
  if (!TRACKED_BASENAME.has(b)) TRACKED_BASENAME.set(b, f);
}
// ROOT-göreli posix yol; ROOT dışına çıkan hedef null döner (izlenen ağaçta olamaz).
function relOf(abs) {
  const r = path.relative(ROOT, abs);
  if (!r || r === '' || r.startsWith('..')) return null;
  return r.split(path.sep).join('/');
}
const inTree = (rel) => rel !== null && (TRACKED.has(rel) || TRACKED_DIRS.has(rel));

// ── gitignore sınıfı: ÜRETİLEN ARTEFAKT (ölü DEĞİL, ama SAYISI BASILIR) ─────
// `git check-ignore` indeksi de dener: izlenen bir yol ASLA ignored dönmez, yani
// bu sınıf izlenen ağacı gölgeleyemez. Yol diskte olmasa da cevap verir — temiz
// checkout'ta da aynı hükmü üretir (portatiflik şartı).
function checkIgnoreBatch(cands) {
  const uniq = [...new Set(cands)];
  if (!uniq.length) return new Set();
  let out = '';
  try {
    out = execSync('git check-ignore --stdin -z', { cwd: ROOT, encoding: 'utf8',
      input: uniq.join('\0'), maxBuffer: 64 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'ignore'] });
  } catch (e) {
    // eşleşme yoksa exit 1 — arıza değil.
    if (e && e.status === 1) out = e.stdout ?? '';
    else if (e && typeof e.stdout === 'string') out = e.stdout;
    else out = '';
  }
  return new Set(out.split('\0').filter(Boolean));
}

let BRANCHES = new Set();
try {
  BRANCHES = new Set(execSync('git for-each-ref --format="%(refname:short)"',
    { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    .split('\n').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
    .flatMap(r => [r, r.replace(/^origin\//, '')]));
} catch { /* git yoksa dal sınıfı boş kalır; ihlal sayısını yalnız ARTIRIR */ }

function pathlike(s) {
  if (!s || s.includes(' ') || SKIPPRE.some(p => s.startsWith(p))) return false;
  if (/[<>="'|()]/.test(s)) return false;
  const core = s.replace(LINEREF, '');
  return core.includes('/') || SUFFIX.some(x => core.endsWith(x)) || BRACE.test(core);
}
function expand(t) {
  const m = BRACE.exec(t);
  if (!m) return [t];
  const [, pre, body, post] = m;
  return body.split(',').flatMap(part => expand(pre + part.trim() + post));
}
// glob de İZLENEN AĞAÇTA çözülür (eski hâli fs.readdirSync ile diske bakıyordu).
function globOne(pattern, anchor) {
  const rel = relOf(path.resolve(anchor, pattern));
  if (rel === null) return null;
  const d = path.posix.dirname(rel);
  const dir = (d === '.' || d === '/') ? '' : d;
  const base = path.posix.basename(rel);
  const ents = DIRENTS.get(dir);
  if (!ents) return null;
  const re = new RegExp('^' + base.split('*').map(s =>
    s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
  const hit = [...ents].find(f => re.test(f));
  return hit ? (dir === '' ? hit : dir + '/' + hit) : null;
}
// V9-A §3C(i): "engine/-göreli çözüm" yanlış pozitif SINIFI — `src/dxf`,
// `tools/tech-pack.cpp`, `tests/engine_check.cpp` hepsi engine/ altında VAR.
const ANCHORS = (baseDir) => [ROOT, baseDir, path.join(ROOT, 'engine')];

function resolveTarget(target, baseDir) {
  let t = target.split('#')[0].split('?')[0];
  // V9-A §3C(i): JSON pointer — `a.json:x.y.z` → dosya kısmı yoklanır.
  const ptr = /^([^:]+\.(json|yaml|yml)):[^\d].*$/.exec(t);
  if (ptr) t = ptr[1];
  t = t.replace(LINEREF, '');
  if (!t) return null;
  const evidence = [];
  for (const member of expand(t)) {
    let got = null;
    if (member.includes('*')) {
      for (const a of ANCHORS(baseDir)) { got = globOne(member, a); if (got) break; }
    } else if (member.includes('/')) {
      for (const a of ANCHORS(baseDir)) {
        const rel = relOf(path.resolve(a, member));
        if (inTree(rel)) { got = rel; break; }
      }
      // uzantısız gövde: `src/dxf` → engine/src/dxf.cpp
      if (!got) for (const a of ANCHORS(baseDir)) {
        got = globOne(member + '.*', a); if (got) break;
      }
    } else {
      got = TRACKED_BASENAME.get(member) ?? null;
    }
    if (!got) return null;
    evidence.push(got);
  }
  return evidence[0];
}

// V9-A §3C: DÜŞÜRÜLEN yanlış pozitif sınıfları
const FORMAT_ID = /^[a-z][a-z0-9.]*\/\d+$/;          // stitchu.techpack/1
const EXT_TOKEN = /^\.[A-Za-z0-9]+$/;                // .cpp
// "üstü çizili / YOK ilan edilmiş hedef" sınıfı iki kademelidir, çünkü ÖLÇÜLDÜ:
// dokümanın kendi yokluk ilanı SATIRA SIĞMIYOR. `docs/SATIS-SARTNAMESI.md:88`
// "`engine/STYLE-PIN/` **hâlâ dizin / olarak YOK**" diye SATIR SONUNDA bölünüyor,
// `:277` de öyle. Kartın "aynı satırda" şartı bu üç ilanı kaçırır ve DÜRÜST
// YOKLUK KAYDINI cezalandırır — D1'in istisna kuralıyla aynı hata (V9-A §2B).
// Bu yüzden GÜÇLÜ ilan kalıpları KAPSAYICI PARAGRAFTA aranır; yalın Türkçe
// `yok` çok geniş olduğu için YALNIZ AYNI SATIRDA sayılır.
// ⚠ KELİME SINIRI ZORUNLU, ölçüldü: sınırsız `YOK` "YOKTUR" gibi her kelimenin
// içine düşer ve mutasyon testinin kendi enjekte ettiği ihlali sessizce yutar
// (§4.5'in ilk koşusunda tam bunu yaptı, GECE/log/V9-B.mutasyon.txt).
const DECLARED_MISSING_STRONG =
  /\bYOK\b|does not exist|was moved out|üretilmiyor|\bdiskte yok\b|\bDOSYA YOK\b|left the repo/;
// ⚠ SIKILAŞTIRILDI (V9-B2, 2026-08-25). V9-B'nin BİLİNEN ZAAF md.2'si: yalın Türkçe
// `yok` SATIRIN HERHANGİ BİR YERİNDE arandığı için `docs/H1.0-KAPI.md:189`'daki
// *"Armhole ÇEVRESİ Aldrich'te yok"* ifadesi, aynı satırda ANDIĞI BAŞKA bir yolu
// (`reports/2026-07-29-endustri-arastirmasi.md`) da muaf kılıyordu — "yok" o yol için
// değildi. Artık `yok` YALNIZ hedefin SAĞINDA aranır: Türkçe yokluk ilanı hedefi
// ÖNCE söyler, sonra "yok" der (`\`engine/STYLE-PIN/\` … diskte yok`).
// ÖLÇÜLDÜ: bütün ağaçta bu sınıfın 2 düşüşü var; 1'i (SATIS-SARTNAMESI:348) sağda,
// 1'i (H1.0:189) solda. Sıkılaştırma yalnız ikincisini kapatır, yeni yanlış pozitif 0.
const DECLARED_MISSING_LOOSE = /\byok\b/;
// GEÇMİŞ ALINTISI: bir yolun HEMEN SAĞINDA git commit hash'i varsa (`(git \`0e67777\`)`),
// doküman o yolun DİSKTE değil GEÇMİŞTE olduğunu açıkça ilan etmiştir — D2'nin zaten
// tanıdığı "dürüst yokluk kaydı" sınıfının aynısı, sadece kelimeyle değil hash'le.
// Hash hedefin SAĞINDA aranır ki tek alıntı bütün satırı muaf kılmasın.
// ÖLÇÜLDÜ (V9-B2): bugünkü ağaçta bu sınıfa giren tek aday H1.0-KAPI.md:189.
const GIT_HISTORY_CITE = /^[`'"\s)(\]]{0,6}\(?\s*git\s+`?[0-9a-f]{7,40}`?/;

// Bir hedefin gitignore'a sorulacak ADAY yolları: üç çapaya göre çözülmüş,
// ROOT içinde kalan hâlleri. `dist/` gibi çıplak dizin engine/ çapasında yakalanır.
function ignoreCandidates(target, baseDir) {
  const t = target.split('#')[0].split('?')[0].replace(LINEREF, '');
  const out = [];
  for (const member of expand(t)) {
    if (!member || member.includes('*')) continue;
    for (const a of ANCHORS(baseDir)) {
      const rel = relOf(path.resolve(a, member));
      if (rel === null) continue;
      out.push(rel);
      // ⚠ ÖLÇÜLDÜ (V9-B3): `dist/` gibi DİZİN kuralları yalnız GERÇEK dizinlere
      // uyar; `git check-ignore` dizin olup olmadığını DİSKTEN öğrenir. Çalışma
      // dizininde `engine/dist/` var olduğu için eşleşiyor, temiz checkout'ta
      // yok olduğu için eşleşmiyordu → aynı commit iki farklı hüküm (24 vs 21
      // artefakt, 1 vs 4 ölü). Diskten bağımsız çözüm: hedefin ALTINDAKİ
      // varsayımsal bir yolu da sor — bir dizin ignore'luysa içindeki her yol
      // ignore'ludur ve bu sorunun cevabı dosya sisteminden bağımsızdır.
      out.push(rel.replace(/\/+$/, '') + '/.stitchu-ignore-probe');
    }
  }
  return out;
}

function scanD2() {
  const dead = [];
  const pending = [];      // izlenen ağaçta çözülemeyenler; sınıfı toplu sorulur
  let checked = 0, alive = 0, droppedClass = 0;
  const seen = new Set();
  for (const rel of proseFiles) {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const baseDir = path.dirname(path.join(ROOT, rel));
    const lines = text.split('\n');
    const para = itemBlobs(lines);   // yokluk ilanı satır sonunda sarabilir
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const cands = [];
      MD_LINK.lastIndex = 0; TICK.lastIndex = 0;
      let m;
      while ((m = MD_LINK.exec(line)) !== null) cands.push([m[1], 'MDLINK']);
      while ((m = TICK.exec(line)) !== null) if (pathlike(m[1])) cands.push([m[1], 'TICK']);
      for (const [tgt, kind] of cands) {
        if (SKIPPRE.slice(0, 4).some(p => tgt.startsWith(p))) continue;
        if (kind === 'MDLINK' && !pathlike(tgt) && !tgt.includes('/')) continue;
        const key = `${rel}|${i + 1}|${tgt}`;
        if (seen.has(key)) continue;
        seen.add(key);
        checked++;
        const ev = resolveTarget(tgt, baseDir);
        if (ev) { alive++; continue; }
        // düşürülen sınıflar
        // hedefin SAĞINDAKİ metin: yalın `yok` ve git-hash alıntısı burada aranır.
        const tIdx = line.indexOf(tgt);
        const rightOf = tIdx < 0 ? '' : line.slice(tIdx + tgt.length);
        if (BRANCHES.has(tgt) || FORMAT_ID.test(tgt) || EXT_TOKEN.test(tgt)
            || DECLARED_MISSING_STRONG.test(para[i])
            || DECLARED_MISSING_LOOSE.test(rightOf)
            || GIT_HISTORY_CITE.test(rightOf)) { droppedClass++; continue; }
        pending.push({ dosya: rel, satirNo: i + 1, hedef: tgt, tur: kind,
                       satir: line.trim().slice(0, 160),
                       adaylar: ignoreCandidates(tgt, baseDir) });
      }
    }
  }
  // ── SINIFLANDIRMA (tek toplu `git check-ignore` çağrısı) ──────────────────
  const ignored = checkIgnoreBatch(pending.flatMap(p => p.adaylar));
  const artefakt = [], dizinsiz = [];
  for (const p of pending) {
    if (p.adaylar.some(c => ignored.has(c))) { artefakt.push(p); continue; }
    // ÇIPASIZ AD: `/` içermeyen jeton bir REPO YOLU İDDİASI DEĞİLDİR — doküman
    // üretilen bir paketin dosya adını anıyor (`print-info.pdf`, `body.yaml`).
    // Eski kapı bunu BÜTÜN DİSKTE arıyordu (V9-A §8'in kabul ettiği zaaf: VAR
    // sayısını yukarı yanlı yapar). Disk kalktı; bu jetonlar artık kapsam dışı
    // ama SAYISI ve LİSTESİ basılır — saklanmaz.
    if (!p.hedef.replace(LINEREF, '').includes('/')) { dizinsiz.push(p); continue; }
    dead.push({ dosya: p.dosya, satirNo: p.satirNo, hedef: p.hedef, tur: p.tur,
                satir: p.satir });
  }
  return { dead, checked, alive, droppedClass, artefakt, dizinsiz };
}

// ───────────────────────── D3 — sayısal iddianın sağlayıcısı ───────────────
const NUM_UNIT = /(?:^|[^\w.])\d[\d.,]*\s*(?:mm|cm|%|KB|MB|bytes?|bayt|sayfa|pages?|pieces?|drafts?|sizes?|parça)\b/i;
const PROVIDER = [
  /`[a-z0-9_.-]+_check`/i,          // kapı adı
  /`[^`]*\.(mjs|py|js|sh)[^`]*`/i,  // alet dosyası
  /`[^`]*\bctest\b[^`]*`/i,
  /`[^`]*\bgrep\b[^`]*`/i,
  /`[^`]*\bls -l\b[^`]*`/i,
  /`?(GECE|Logs|reports)\/[^\s`]+/,  // kanıt yolu
];
const hasProvider = (s) => PROVIDER.some(re => re.test(s));

function scanD3() {
  const missing = [];
  let numeric = 0;
  for (const rel of mdFiles) {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const lines = text.split('\n');
    const fence = fenceMask(lines, true);
    const para = itemBlobs(lines);   // madde / tablo satırı = kapsayıcı
    for (let i = 0; i < lines.length; i++) {
      if (fence[i]) continue;
      const line = lines[i];
      if (!NUM_UNIT.test(line)) continue;
      numeric++;
      if (hasProvider(line) || hasProvider(para[i])) continue;
      missing.push({ dosya: rel, satirNo: i + 1, satir: line.trim().slice(0, 160) });
    }
  }
  return { missing, numeric };
}

// ───────────────────────── taban / rapor ───────────────────────────────────
const fpD1 = (h) => `${h.dosya}|${h.kalip}|${h.satir}`;
const fpD2 = (h) => `${h.dosya}|${h.hedef}`;

const argv = process.argv.slice(2);
const WRITE = argv.includes('--baseline');
// `--note=...` — kesim gerekçesi. RULES §4.6: taban yeniden kesilirken ESKİ değer,
// YENİ değer ve GEREKÇE hem commit mesajına hem taban dosyasının içine yazılır.
const NOTE = (argv.find(a => a.startsWith('--note=')) ?? '').slice('--note='.length);
const NO_BASELINE = argv.includes('--no-baseline');

const d1 = scanD1(), d2 = scanD2(), d3 = scanD3();

let commit = 'UNKNOWN';
try {
  commit = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'] }).trim();
} catch { /* boş */ }

if (WRITE) {
  const out = {
    _baslik: 'docs_truth_check TABANI — doküman doğruluk kapısı. Kapı: engine/tests/docs_truth_check.mjs (ctest: docs_truth_check). Yeniden kes: node engine/tests/docs_truth_check.mjs --baseline',
    _yasa: [
      'D1/D2 EŞİĞİ SIFIRDIR. Yayınlanmış hiçbir kaynak "N ihlale kadar tolerans" vermiyor (GECE/V9-R.md §2 Soru 2); yayınlanan tek eşik sıfır + AÇIK muafiyet. Bu yüzden burada tolerans SAYISI yok, KAYITLI BORÇ listesi var.',
      'bilinenAcik listeleri BORÇTUR, taban DEĞİL. Listede olmayan her ihlal kapıyı KIRMIZI düşürür. Emsal: Vale accept.txt / woke .wokeignore / Crossplane-Elastic-Grafana pratiği (V9-R §1 D3): yanlış pozitif kapıyı gevşetmez, aynı commit içinde GÖRÜNÜR ve versiyonlanmış bir listeye girer.',
      'Liste yalnız KÜÇÜLEBİLİR. Bir borç kapanınca kapı yeşil kalır ama bu dosya KENDİLİĞİNDEN güncellenmez — düşüşü sabitlemek ayrı, bilinçli bir --baseline commit\'idir (vocab_reference_check emsali).',
      'D3 bir RATCHET\'tir: sağlayıcısız sayısal satır sayısı tabanı AŞARSA kırmızı. İDDİA CÜMLESİ SAYISI değil, SAĞLAYICISIZ cümle sayısı ölçülür — V9-A §1: RULES §6 onarımı cümle sayısını YÜKSELTİR (0C 28 → bugün 104), o yüzden cümle sayısına eşik koymak yanlış yöne bastırır.',
      'İSTİSNA KURALI ZORUNLUDUR (V9-A §2B): bugünkü ağaçta 16 ham hit\'in 13\'ü yanlış pozitif; 2\'si emekli edilen cümleyi tırnak içinde taşıyor. İstisnasız kapı RULES §6 ONARIMINI cezalandırır.',
      'Kapının kendi arızası (taban yok, git yok vb.) exit 3 alır; ihlal exit 1 alır. Ayrık exit kodu lychee emsali (V9-R §1 B3). EKSİK YASA ASLA GEÇİŞ DEĞİLDİR: taban dosyası yoksa kapı FAIL verir.',
    ],
    _note: NOTE || 'GEREKÇE YAZILMADI — RULES §4.6 ihlali. Yeniden kes: --note="eski X -> yeni Y, sebep"',
    olcumCommit: commit,
    olcumTarihi: new Date().toISOString().slice(0, 10),
    kapsam: {
      D1_D2: 'docs/**/*.{md,html} + README.md, docs/archive/tools/*.{mjs,js} HARİÇ',
      D3: 'docs/**/*.md + README.md (V9-A §1 sayım kapsamı)',
      taranan_D1_D2: proseFiles.length,
      taranan_D3: mdFiles.length,
    },
    D1: {
      esik: 0,
      hamHit: d1.raw,
      dusen: { tirnak_kod_span: d1.droppedQuote, olcum_baglami_tarihli: d1.droppedCtx,
               fenced_blok: d1.droppedFence },
      acikBorc: d1.hits.length,
      bilinenAcik: d1.hits.map(h => ({ dosya: h.dosya, kalip: h.kalip, satir: h.satir })),
    },
    D2: {
      esik: 0,
      kaynak: 'VARLIK SORUSU GİT\'E SORULUR (git ls-files + git ls-tree -r HEAD); disk okunmaz — verdict çalışma dizininden bağımsızdır (V9-B3)',
      yoklananHedef: d2.checked, var: d2.alive, dusenSinif: d2.droppedClass,
      uretilenArtefakt: d2.artefakt.length,
      cipasizAd: d2.dizinsiz.length,
      acikBorc: d2.dead.length,
      bilinenAcik: d2.dead.map(h => ({ dosya: h.dosya, hedef: h.hedef, tur: h.tur })),
    },
    D3: {
      taban: d3.missing.length,
      sayisalSatir: d3.numeric,
      yontem: 'sayı+birim taşıyan prose satırı; satırda ya da kapsayıcı paragrafta backtick içinde alet/test adı (*_check, *.mjs/.py/.js/.sh, ctest, grep, ls -l) ya da kanıt yolu (GECE/, Logs/, reports/) YOKSA sağlayıcısız sayılır',
    },
  };
  fs.writeFileSync(BASELINE, JSON.stringify(out, null, 2) + '\n');
  console.log('baseline written:', path.relative(ROOT, BASELINE));
  console.log('  D1 açık borç :', d1.hits.length, '(ham', d1.raw + ')');
  console.log('  D2 açık borç :', d2.dead.length, '(yoklanan', d2.checked + ')');
  console.log('  D3 taban     :', d3.missing.length, '/', d3.numeric, 'sayısal satır');
  process.exit(EXIT_OK);
}

let base = null;
if (!NO_BASELINE) {
  if (!fs.existsSync(BASELINE)) {
    console.error('FAIL: taban yok — ' + path.relative(ROOT, BASELINE));
    die('EKSİK YASA ASLA GEÇİŞ DEĞİLDİR. Bir kez kes: node engine/tests/docs_truth_check.mjs --baseline');
  }
  try { base = JSON.parse(fs.readFileSync(BASELINE, 'utf8')); }
  catch (e) { die('taban okunamadı: ' + e.message); }
}

const knownD1 = new Set(base ? base.D1.bilinenAcik.map(fpD1) : []);
const knownD2 = new Set(base ? base.D2.bilinenAcik.map(fpD2) : []);

const newD1 = d1.hits.filter(h => !knownD1.has(fpD1(h)));
const newD2 = d2.dead.filter(h => !knownD2.has(fpD2(h)));
const closedD1 = base ? base.D1.bilinenAcik.filter(b => !d1.hits.some(h => fpD1(h) === fpD1(b))) : [];
const closedD2 = base ? base.D2.bilinenAcik.filter(b => !d2.dead.some(h => fpD2(h) === fpD2(b))) : [];
const d3Base = base ? base.D3.taban : 0;

console.log('docs_truth_check — doküman doğruluk kapısı (kart V9-B)');
console.log('kip           :', NO_BASELINE ? 'HARD-0 (--no-baseline, §4.2 kırmızı kanıtı)' : 'taban kipi');
console.log('commit        :', commit.slice(0, 12));
console.log('kapsam        :', proseFiles.length, 'prose dosya (D1/D2) ·', mdFiles.length, 'md (D3)');
console.log();

console.log('── D1 DURAN İDDİA (RULES §6/§7) ──────────────────────────────');
console.log(`  ham hit ${d1.raw} · düşen: tırnak/kod-span ${d1.droppedQuote}, tarihli ölçüm bağlamı ${d1.droppedCtx}, fenced blok ${d1.droppedFence}`);
console.log(`  GERÇEK ihlal ${d1.hits.length} · kayıtlı borç ${knownD1.size} · YENİ ${newD1.length}`);
for (const h of (NO_BASELINE ? d1.hits : newD1))
  console.log(`  ${NO_BASELINE ? 'IHLAL' : 'FAIL YENI'}  ${h.dosya}:${h.satirNo}  [${h.kalip}]  ${h.satir}`);
for (const b of closedD1) console.log(`  KAPANDI   ${b.dosya}  [${b.kalip}]  ${b.satir}`);
console.log();

console.log('── D2 ÖLÜ REPO YOLU ──────────────────────────────────────────');
console.log(`  varlık kaynağı: İZLENEN AĞAÇ (git ls-files + ls-tree HEAD, ${TRACKED.size} yol) — disk okunmaz`);
console.log(`  yoklanan hedef ${d2.checked} · VAR ${d2.alive} · düşen yanlış-pozitif sınıfı ${d2.droppedClass}`);
console.log(`  ÜRETİLEN ARTEFAKT ${d2.artefakt.length} (gitignore'lı; temiz checkout'ta yok, ÖLÜ DEĞİL — kapıyı kırmaz)`);
for (const h of d2.artefakt)
  console.log(`  artefakt  ${h.dosya}:${h.satirNo}  -> ${h.hedef}`);
console.log(`  ÇIPASIZ AD ${d2.dizinsiz.length} (dizinsiz jeton = repo yolu iddiası değil, kapsam dışı)`);
for (const h of d2.dizinsiz)
  console.log(`  cipasiz   ${h.dosya}:${h.satirNo}  -> ${h.hedef}`);
console.log(`  GERÇEK ölü ${d2.dead.length} · kayıtlı borç ${knownD2.size} · YENİ ${newD2.length}`);
for (const h of (NO_BASELINE ? d2.dead : newD2))
  console.log(`  ${NO_BASELINE ? 'IHLAL' : 'FAIL YENI'}  ${h.dosya}:${h.satirNo}  -> ${h.hedef}  [${h.tur}]`);
for (const b of closedD2) console.log(`  KAPANDI   ${b.dosya}  -> ${b.hedef}`);
console.log();

console.log('── D3 SAYISAL İDDİANIN SAĞLAYICISI (ratchet) ─────────────────');
console.log(`  sayı+birim taşıyan satır ${d3.numeric} · SAĞLAYICISIZ ${d3.missing.length}`);
if (NO_BASELINE) {
  console.log('  (hard-0 kipi: taban yok sayıldı, sağlayıcısız satırların hepsi ihlal)');
  for (const h of d3.missing.slice(0, 40))
    console.log(`  IHLAL  ${h.dosya}:${h.satirNo}  ${h.satir}`);
  if (d3.missing.length > 40) console.log(`  … +${d3.missing.length - 40} satır daha`);
} else {
  console.log(`  taban ${d3Base} · delta ${d3.missing.length - d3Base >= 0 ? '+' : ''}${d3.missing.length - d3Base}`);
  if (d3.missing.length > d3Base) {
    for (const h of d3.missing) console.log(`  FAIL  ${h.dosya}:${h.satirNo}  ${h.satir}`);
  } else if (d3.missing.length < d3Base) {
    console.log('  DÜŞTÜ — kapı yeşil kalır, taban KENDİLİĞİNDEN güncellenmez.');
    console.log('  (sabitlemek için: node engine/tests/docs_truth_check.mjs --baseline)');
  }
}
console.log();

let fail = false;
if (NO_BASELINE) {
  fail = d1.hits.length > 0 || d2.dead.length > 0 || d3.missing.length > 0;
  console.log(`HÜKÜM: ${fail ? 'FAIL' : 'YEŞİL'} — HARD-0 kipi · D1 ${d1.hits.length} · D2 ${d2.dead.length} · D3 ${d3.missing.length}`);
  if (fail) console.log('Bu, kapının faz-öncesi ONARIMSIZ docs ağacına karşı KIRMIZI düştüğünün kanıtıdır (kart §4.2).');
} else {
  const d3Fail = d3.missing.length > d3Base;
  fail = newD1.length > 0 || newD2.length > 0 || d3Fail;
  if (fail) {
    console.log(`HÜKÜM: FAIL — D1 yeni ${newD1.length} · D2 yeni ${newD2.length} · D3 ${d3Fail ? `taban aşıldı (${d3Base} -> ${d3.missing.length})` : 'tamam'}`);
    console.log('Docs bir sayıyı sabit gerçek olarak ilan etti, olmayan bir yola atıf yaptı ya da');
    console.log('sağlayıcısız sayı ekledi. RULES §6: sayı TEST ÇIKTISINDA yaşar, dokümanda değil.');
    console.log('Yanlış pozitifse: kalıbı gevşetme — aynı commit\'te tabana GÖRÜNÜR biçimde ekle');
    console.log('(node engine/tests/docs_truth_check.mjs --baseline) ve gerekçesini commit mesajına yaz.');
  } else {
    console.log(`HÜKÜM: YEŞİL — yeni duran-iddia 0, yeni ölü hedef 0, D3 ${d3.missing.length} <= taban ${d3Base}`);
    console.log(`AÇIK BORÇ (kapıyı kırmaz, kayıtlıdır): D1 ${d1.hits.length} · D2 ${d2.dead.length} — onarım V9-C/D/E'nin işi.`);
  }
}
process.exit(fail ? EXIT_VIOLATION : EXIT_OK);
