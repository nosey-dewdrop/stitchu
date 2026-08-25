#!/usr/bin/env node
// sleeve_cap_ease_check.mjs — KOL OYUĞU YAYI ↔ KOL KAPAĞI YAYI, ADLANDIRILMIŞ
// KENARLARDAN (kart V7-D, 2026-08-25).
//
// ★ NEYİ YARGILAR — TARTIŞMA YOK.
//   Kullanıcı `web/` üzerinden kalıp indirdiğinde koşan artefakt:
//   `engine/wasm/bindings.cpp draftJSON` → `GarmentDrafter::draft`. Bu kapı O
//   ARTEFAKTI yargılar, motoru `web/vendor/stitchu-engine.js` üzerinden
//   yükleyerek (emsal: `engine/tests/sewability_check.mjs:107`, aynı usul).
//   Yani kapı SEVK EDİLEN hattı ölçer ve aynı anda WASM PARİTESİ kanıtıdır:
//   native yeşil + wasm patlak burada KIRMIZI düşer.
//
// ★ NEDEN VAR — KIRILAN TAUTOLOJİ.
//   V7-C'ye kadar (ve `validator.cpp:282-300`'de bu kart taşıyana kadar) oyuk↔
//   kapak uyumu ÜÇ TAHMİNLE ölçülüyordu: parça adında "Sleeve" alt-dizgisi,
//   sabit `commands[0..2]` indeksi, ve ÇİZİLEN kenar yerine skaler
//   `bodice.armholeLength` (yazan: `bodice.cpp:509`). Kapak o skalere göre
//   çözüldüğü için ölçülen "0.00mm uyum" AYNI SAYININ KENDİSİYLE UYUMUYDU.
//   Bu kapı iki büyüklüğü de ÇİZİLEN KENARDAN okur:
//     oyuk  = armhole_front + armhole_back  (prensesde parçalara BÖLÜNMÜŞ olabilir)
//     kapak = sleeve_cap
//   `edgeRoles` (V7-C, `geometry.hpp:40-71`) uzunluk TAŞIMAZ, kenarı ADRESLER;
//   yay uzunluğu burada, artefaktın kendi `commands[first..last]`'ından yeniden
//   hesaplanır. Motordan hiçbir uzunluk ödünç alınmaz.
//
// ═══ EŞİK KÜNYESİ — HER SAYININ KAYNAĞI (§7.6: kaynaksız eşik YASAK) ════════
//
// [S1] CAP_EASE_CEILING_MM = 38.1 mm (= 1½ in)  → İHLAL = FAIL
//   Linda Lee, *Setting in a Sleeve (and fitting, too)*, The Sewing Workshop,
//   slayt 6 "Check Sleeve Cap Ease", verbatim: *"If the sleeve is 1 1/2” more
//   than the armscye, then you will want to reduce the sleeve cap ease."*
//   Künye + verbatim alıntı: `GECE/V7-R.md` §1.1 satır A1 (YAYINLANMIŞ).
//   Bu, bu turda BİRİNCİL sayfasından doğrulanabilen TEK cap-ease sayısıdır;
//   A3'ün 50 mm'i ve A9'un 20–30 mm'i ikincil/DOĞRULANMADI, kapıya girmedi.
//
// [S2] İŞARET POZİTİF (kapak yayı ≥ oyuk yayı)  → İHLAL = FAIL
//   `knowledge/cap-ease-isareti-2026-08-17.md` §5: cap ease'in İŞARETİ hangi
//   çizgide ölçüldüğünün fonksiyonudur. Motorun `commands`'ı DİKİŞ çizgisidir
//   (`geometry.hpp:74`) ve motor kapağı oyuktan UZUN çözmeyi hedefler
//   (`fabricease.hpp:93 kCap` hiç negatife inmez: *"a short cap would pull the
//   armhole up"*). Kısa kapak dikilebilir bir kalıp değildir → işaret şart.
//
// [S3] BANDIN ALT UCU İÇİN YAYIN YOK → REPORTED, FAIL DEĞİL.
//   `GECE/V7-R.md` §3: bedene/oyuğa göre ölçekleyen YAYINLANMIŞ bir cap-ease
//   formülü BULUNAMADI; yayınlanmış 20–50 mm bandının altında kalan bizim 8/8
//   ölçümümüz (+6.61…+18.30 mm, Buğra kesim çizgisi) bir HÜKÜM değil KAYITTIR.
//   Kaynaksız alt eşik koymak §7.6 ihlali olurdu. Alt uç BASILIR, yargılanmaz.
//
// [S4] PUF / BÜZGÜLÜ BAŞ: [S1] TAVANI UYGULANMAZ — GEVŞETME DEĞİL, KAPSAM.
//   [S1]'in kaynağı bir CAP EASE cümlesidir: *"reduce the sleeve cap ease"* —
//   yani YEDİRİLEN fazlalık hakkında. Büzgülü/puf başta fazlalık yedirilmez,
//   BÜZÜLÜR (motorun kendi gerekçesi: `validator.cpp` "GATHERED / PUFF HEAD
//   (Loop 6)" bloğu). Ölçüldü (bu kapının ilk koşusu, 2026-08-25): gathered
//   +56.9…+80.2 mm, puffed +291.5…+393.5 mm — Linda Lee'nin tavanının 1.5×
//   ile 10× üstü. Bu sayıları o tavanla yargılamak, yayınlanmış bir kaynağı
//   KAPSAMI DIŞINDA kullanmak olurdu.
//   `GECE/V7-R.md` §1.3: "puf"/"balon"un NİCEL tanımı için yayınlanmış eşik
//   BULUNAMADI (bulunan her kaynak *"bu senin tasarım kararın"* diyor) → bu
//   kapı büzgülü başlar için BİR TAVAN KOYMAZ, fazlalığı ADIYLA BASAR (§7.6:
//   kaynaksız eşik yasak). [S2] işaret şartı büzgülü başa DA uygulanır: oyuktan
//   KISA bir baş büzülemez de, yedirilemez de.
//   ⚠ Bu, mevcut hiçbir toleransı oynatmaz: büzgülü başın bandını yargılayan
//   kapı `validator.cpp`'nin "gathered-head surplus" penceresidir ve o kapı
//   BU KARTTA DEĞİŞMEDİ.
//
// [S5] ANCHOR_TOL_MM = 1e-6 — YENİ EŞİK DEĞİL.
//   `engine/src/geometry.hpp:114` `edgePathOf(..., double tolMM = 1e-6)`
//   varsayılanının aynısı. Kapı motorun uç-nokta çapası kuralını birebir
//   tekrarlar, gevşetmez.
//
// [S6] BEYAN EDİLEN YEDİRME ORANI — motorun kendi tablosundan okunur.
//   `engine/src/fabricease.hpp` `kCap` satırı (dokuma çapası). Bu bir eşik
//   DEĞİL, karşılaştırma kalemidir: beyan (motorun hedefi) ile ÖLÇÜLEN (iki
//   çizilmiş kenar) arasındaki fark BASILIR. Satır okunamazsa kapı SUSMAZ,
//   kırmızı düşer (RULES invariant 1: reddet, uydurma).
//
// ═══ KAPI ═══════════════════════════════════════════════════════════════════
//   (a) Kol içeren her (spec × beden) için BEKLENEN ROL KÜMESİNİN tamamı
//       ÇÖZÜLMELİ. Boş yay (aralık taşmış ya da uç-nokta çapası tutmamış) =
//       FAIL. V7-C'nin açık bıraktığı delik budur: bir post-pass `commands`'ı
//       yeniden kursa rol SESSİZCE bayatlar ve JSON'da boş yay olarak görünür.
//       Beklenen küme veriden düşer, uydurulmaz: `sleeveCap='cap'` bir KANAT'tır
//       ve koltukaltı dikişi YOKTUR (`sleeve.cpp:126-133`), o sınıf üç rol
//       bekler; tam kol dört rol bekler (iki `sleeve_underarm` kenarı, çünkü
//       koltukaltı dikişi parçanın İKİ yan kenarının birbirine dikilmesidir).
//   (b) ease = capLen − (armholeFront + armholeBack), İŞARET POZİTİF [S2].
//   (c) |ease| ≤ 38.1 mm [S1] — YALNIZ yedirilen (düz/kanat) başlarda; büzgülü
//       başta fazlalık REPORTED [S4].
//   (d) beyan edilen oran ↔ ölçülen oran farkı BASILIR [S6].
//   Bandın ALT ucu: REPORTED [S3].
//
// ═══ ANTI-HACK / KANIT KANCALARI ════════════════════════════════════════════
//   Yalnız §4.2 (boş test) ve §4.5 (mutasyon) kanıtları için. Üretim koşusunda
//   hiçbiri set edilmez; set edilirse EKRANA BASILIR.
//     V7D_ENGINE   — başka bir stitchu-engine.js yükle
//     V7D_ARTIFACT — motoru hiç çağırma, ÇIKTI ARTEFAKTINI (JSON döküm) oku
//     V7D_DUMP     — ölçülen artefaktı bu yola yaz (boş testin girdisi buradan)
//     V7D_MUTATE   — kasıtlı bozma: cap-grow | cap-shrink | role-stale
//     V7D_SIZES    — virgüllü beden listesi (varsayılan: sevk edilen sekiz beden)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const CAP_EASE_CEILING_MM = 38.1;  // [S1] Linda Lee slayt 6 (1½ in)
const ANCHOR_TOL_MM = 1e-6;        // [S5] geometry.hpp:114 varsayılanı
const CUBIC_STEPS = 24;            // geometry.cpp:43 pathLength ile AYNI adım

const ENGINE_PATH = process.env.V7D_ENGINE || join(root, 'web/vendor/stitchu-engine.js');
const ARTIFACT = process.env.V7D_ARTIFACT || '';
const DUMP = process.env.V7D_DUMP || '';
const MUTATE = process.env.V7D_MUTATE || '';

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);
const REPORTED = (m) => console.log(`RPT   ${m}`);

console.log('=== sleeve_cap_ease_check — oyuk yayı ↔ kapak yayı, ADLANDIRILMIŞ kenarlardan (kart V7-D)');
for (const k of ['V7D_ENGINE', 'V7D_ARTIFACT', 'V7D_DUMP', 'V7D_MUTATE', 'V7D_SIZES']) {
  if (process.env[k]) console.log(`    ⚠ KANIT KANCASI AKTİF: ${k}=${process.env[k]}`);
}

// ─── [S6] beyan edilen yedirme oranı: motorun KENDİ ease tablosundan ───────
// Tek kaynak `engine/src/fabricease.hpp`; burada ikinci bir kopya TUTULMAZ.
function declaredCapEase() {
  const p = join(root, 'engine/src/fabricease.hpp');
  if (!existsSync(p)) return { ok: false, why: `beyan kaynağı diskte YOK: ${p}` };
  const src = readFileSync(p, 'utf8');
  const m = src.match(/AnchorRow\s+kCap\s*=\s*\{\s*Anchor\{\s*0\.0\s*,\s*([-0-9.]+)\s*\}/);
  if (!m) return { ok: false, why: 'fabricease.hpp içinde kCap dokuma çapası OKUNAMADI' };
  return { ok: true, woven: Number(m[1]), where: 'engine/src/fabricease.hpp kCap[0]' };
}

// ─── geometri: artefaktın komutlarından yay uzunluğu (motordan ödünç YOK) ──
function cubicLen(p0, c) {
  let L = 0, px = p0.x, py = p0.y;
  for (let i = 1; i <= CUBIC_STEPS; i++) {
    const t = i / CUBIC_STEPS, mt = 1 - t;
    const x = mt * mt * mt * p0.x + 3 * mt * mt * t * c.cp1x + 3 * mt * t * t * c.cp2x + t * t * t * c.x;
    const y = mt * mt * mt * p0.y + 3 * mt * mt * t * c.cp1y + 3 * mt * t * t * c.cp2y + t * t * t * c.y;
    L += Math.hypot(x - px, y - py); px = x; py = y;
  }
  return L;
}
function arcLen(cmds) {
  let L = 0, cur = null;
  for (const c of cmds) {
    if (c.type === 'move') { cur = { x: c.x, y: c.y }; continue; }
    if (!cur) return NaN;
    if (c.type === 'line') { L += Math.hypot(c.x - cur.x, c.y - cur.y); cur = { x: c.x, y: c.y }; }
    else if (c.type === 'curve') { L += cubicLen(cur, c); cur = { x: c.x, y: c.y }; }
  }
  return L;
}
// `engine/src/geometry.cpp:199-224 edgePathOf` birebir aynası: aralık taşarsa
// YA DA uç-nokta çapası tutmazsa BOŞ döner (yanlış kenarı geri vermez).
function edgePathOf(piece, role, tol = ANCHOR_TOL_MM) {
  const cmds = piece.commands || [];
  const n = cmds.length;
  if (role.first < 0 || role.last < role.first || role.last >= n) return null;
  const drawnEnd = cmds[role.last];
  if (Math.abs(drawnEnd.x - role.endX) > tol || Math.abs(drawnEnd.y - role.endY) > tol) return null;
  const ds = role.first === 0 ? cmds[0] : cmds[role.first - 1];
  if (Math.abs(ds.x - role.startX) > tol || Math.abs(ds.y - role.startY) > tol) return null;
  const out = [{ type: 'move', x: role.startX, y: role.startY }];
  for (let i = role.first; i <= role.last; i++) { if (i === 0) continue; out.push(cmds[i]); }
  return out.length < 2 ? null : out;
}
// Adı geçen her rolün yay uzunluğu, HANGİ PARÇADA olduğuna bakmadan (prenses
// oyuğu İKİ panele bölünmüştür — tüketici parçaları TOPLAR, sahibini tahmin etmez).
function rolesNamed(pattern, name) {
  const hits = [];
  for (const pc of pattern.pieces || []) {
    for (const r of pc.edgeRoles || []) {
      if (r.role !== name) continue;
      const path = edgePathOf(pc, r);
      hits.push({ piece: pc.name, role: r, len: path ? arcLen(path) : 0, resolved: !!path });
    }
  }
  return hits;
}

// ─── spec matrisi: SEVK EDİLEN kol taşıyan sınıflar ───────────────────────
const BASE = { waistline: 'natural', fabric: 'woven', skirtStyle: 'aLine', skirtLength: 'midi',
  topLength: 'hip', frontPlacket: false, tieClosure: 0, sleeveCap: 0, collarType: 0,
  collarEdge: 0, gatherType: 0, gatherZone: 0, backOpening: 0, backSlit: 0, ruffledStraps: 0,
  peplum: 0, placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0, hemShape: 0,
  shoulderStyle: 0, buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0 };
// `sleeveCap` artefakt sınırında SAYI ile konuşulur (bindings.cpp:193
// enumIntField); adları burada tek yerde tutuyoruz ki matris okunur kalsın.
const CAP = { plain: 0, gathered: 1, puffed: 2, cap: 3 };  // measurements.hpp:119 sırası
const SPECS = [
  { id: 'dart_top_plain_short',      spec: { garment: 'top',   shaping: 'dart',     neckline: 'crew',  sleeveStyle: 'straight', sleeveLength: 'short' } },
  { id: 'dart_top_plain_long',       spec: { garment: 'top',   shaping: 'dart',     neckline: 'crew',  sleeveStyle: 'straight', sleeveLength: 'long' } },
  { id: 'princess_dress_plain',      spec: { garment: 'dress', shaping: 'princess', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short' } },
  { id: 'dart_top_gathered_head',    spec: { garment: 'top',   shaping: 'dart',     neckline: 'crew',  sleeveStyle: 'straight', sleeveLength: 'short', sleeveCap: CAP.gathered } },
  { id: 'dart_top_puffed_head',      spec: { garment: 'top',   shaping: 'dart',     neckline: 'crew',  sleeveStyle: 'straight', sleeveLength: 'short', sleeveCap: CAP.puffed } },
  { id: 'dart_top_cap_wing',         spec: { garment: 'top',   shaping: 'dart',     neckline: 'crew',  sleeveStyle: 'straight', sleeveLength: 'short', sleeveCap: CAP.cap } },
];
// Beklenen rol kümesi VERİDEN düşer, uydurulmaz:
//  · kanat kolun (sleeveCap='cap') koltukaltı dikişi YOKTUR (`sleeve.cpp:126-133`)
//    → o sınıf üç rol adı bekler, tam kol dört.
//  · `armhole_front`/`armhole_back` bir ADET DEĞİL bir KENARDIR: prenses kesimde
//    aynı oyuk İKİ panele bölünür ve iki panel de aynı adı taşır
//    (`bodice.cpp:709-715` üst parça, `:743-748` alt parça). Bu yüzden ASGARİ
//    sayı şart koşulur ve bulunan parçalar TOPLANIR — sahibi tahmin edilmez.
//    Koltukaltı ise bir ÇİFTTİR (parçanın iki yan kenarı birbirine dikilir), o
//    yüzden tam sayı 2 şart.
const expectedRoles = (spec) => (spec.sleeveCap === CAP.cap)
  ? { armhole_front: { min: 1 }, armhole_back: { min: 1 }, sleeve_cap: { exact: 1 } }
  : { armhole_front: { min: 1 }, armhole_back: { min: 1 }, sleeve_cap: { exact: 1 },
      sleeve_underarm: { exact: 2 } };

const CHART = JSON.parse(readFileSync(join(root, 'contract/tables.json'), 'utf8')).draft.euSizeChart;
const SHIPPED_SIZES = JSON.parse(readFileSync(join(root, 'contract/layers/size-table.json'), 'utf8')).sizes;
const SIZES = (process.env.V7D_SIZES ? process.env.V7D_SIZES.split(',') : SHIPPED_SIZES).map((s) => s.trim());
const bodyOf = (size) => {
  const r = CHART[size];
  if (!r) throw new Error(`beden tabloda yok: ${size}`);
  return { bust: r[0], waist: r[1], hip: r[2], shoulder: r[3], backLength: r[4], armLength: r[5], neck: r[6] };
};

// ─── mutasyon (yalnız §4.5 kanıtı) ────────────────────────────────────────
// Kapağın İÇ noktalarını (crown + kontrol noktaları) kirişine dik yönde
// ölçekler; uç noktalara DOKUNMAZ, yani `role-stale` dışında çapa bozulmaz —
// bozulan sadece yayın UZUNLUĞUDUR.
function scaleCap(pattern, targetDeltaMM) {
  const pc = (pattern.pieces || []).find((p) => (p.edgeRoles || []).some((r) => r.role === 'sleeve_cap'));
  if (!pc) return 'cap mutasyonu: sleeve_cap taşıyan parça YOK';
  const role = pc.edgeRoles.find((r) => r.role === 'sleeve_cap');
  const base = JSON.parse(JSON.stringify(pc.commands.slice(role.first, role.last + 1)));
  const chordY = (role.startY + role.endY) / 2;
  const apply = (k) => {
    for (let i = 0; i < base.length; i++) {
      const src = base[i], dst = pc.commands[role.first + i];
      const isLast = (role.first + i) === role.last;
      if (src.type === 'curve') {
        dst.cp1y = chordY + (src.cp1y - chordY) * k;
        dst.cp2y = chordY + (src.cp2y - chordY) * k;
      }
      if (!isLast) dst.y = chordY + (src.y - chordY) * k;   // uç çapasına DOKUNMA
    }
    return arcLen(edgePathOf(pc, role) || []);
  };
  const before = apply(1);
  const want = before + targetDeltaMM;
  let lo = 0.05, hi = 6.0;
  for (let it = 0; it < 80; it++) {
    const mid = (lo + hi) / 2;
    if (apply(mid) < want) lo = mid; else hi = mid;
  }
  const after = apply((lo + hi) / 2);
  return `'${pc.name}' sleeve_cap yayı ${before.toFixed(4)} → ${after.toFixed(4)}mm (${(after - before >= 0 ? '+' : '')}${(after - before).toFixed(4)}mm)`;
}
function mutate(pattern) {
  if (MUTATE === 'cap-grow') return scaleCap(pattern, +40);     // [S1] tavanını AŞ
  if (MUTATE === 'cap-shrink') return scaleCap(pattern, -40);   // [S2] işaretini ÇEVİR
  if (MUTATE === 'role-stale') {
    // Bir post-pass'in `commands`'ı yeniden kurmasını taklit et: rol aralığı
    // artık başka bir kenarı gösteriyor, çapa tutmuyor → kenar SESSİZCE bayat.
    const pc = (pattern.pieces || []).find((p) => (p.edgeRoles || []).some((r) => r.role === 'sleeve_cap'));
    if (!pc) return 'role-stale: sleeve_cap taşıyan parça YOK';
    const role = pc.edgeRoles.find((r) => r.role === 'sleeve_cap');
    pc.commands[role.last].y += 5;   // çizilen kenar kaydı, ROL kaydı kalmadı
    return `'${pc.name}' sleeve_cap son komutunun ucu +5mm kaydırıldı (çapa artık tutmuyor)`;
  }
  if (MUTATE) return `BİLİNMEYEN MUTASYON: ${MUTATE}`;
  return null;
}

// ─── artefaktı topla: ya motordan, ya diskteki JSON dökümünden ────────────
const drafts = [];
if (ARTIFACT) {
  if (!existsSync(ARTIFACT)) {
    FAIL(`artefakt diskte YOK: ${ARTIFACT} — eksik girdi = eksik kanıt, SKIP değil KIRMIZI`);
    console.log(`\nFAIL sleeve_cap_ease_check — ${fails} ihlal`);
    process.exit(1);
  }
  const doc = JSON.parse(readFileSync(ARTIFACT, 'utf8'));
  console.log(`    girdi: ARTEFAKT ${ARTIFACT} (üreten: ${doc.engine || 'BEYAN YOK'})`);
  for (const d of doc.drafts || []) drafts.push(d);
} else {
  if (!existsSync(ENGINE_PATH)) {
    FAIL(`motor diskte YOK: ${ENGINE_PATH} — eksik alet = eksik kanıt, SKIP değil KIRMIZI`);
    console.log(`\nFAIL sleeve_cap_ease_check — ${fails} ihlal`);
    process.exit(1);
  }
  console.log(`    girdi: WASM ${ENGINE_PATH.replace(root + '/', '')}  (sevk edilen hat)`);
  const createEngine = createRequire(import.meta.url)(ENGINE_PATH);
  const engine = await createEngine();
  for (const { id, spec } of SPECS) {
    for (const size of SIZES) {
      const out = JSON.parse(engine.draftJSON({ ...BASE, ...spec }, bodyOf(size)));
      drafts.push({ id, size, sleeveCap: spec.sleeveCap ?? CAP.plain, out });
    }
  }
}
console.log(`    bedenler: ${SIZES.join(' ')}  (kaynak: contract/layers/size-table.json)`);
console.log(`    eşikler: tavan ${CAP_EASE_CEILING_MM}mm [S1 Linda Lee slayt 6] · işaret POZİTİF [S2] · alt uç REPORTED [S3 yayın YOK]`);

if (drafts.length === 0) FAIL('yargılanacak taslak YOK — boş girdi sessizce geçmez');

// ─── [S6] beyan ───────────────────────────────────────────────────────────
const decl = declaredCapEase();
if (!decl.ok) FAIL(`[d] beyan edilen yedirme oranı OKUNAMADI: ${decl.why}`);
else console.log(`    beyan: dokuma cap ease = ${(decl.woven * 100).toFixed(2)}%  (kaynak: ${decl.where})`);

// ─── ÖLÇÜM ────────────────────────────────────────────────────────────────
let mutatedOnce = false;
const rows = [];
for (const d of drafts) {
  const tag = `${d.id}/${d.size}`;
  if (d.out && d.out.error) { FAIL(`[draft] ${tag}: motor hata: ${d.out.error}`); continue; }
  const pattern = d.out && d.out.pattern;
  if (!pattern) { FAIL(`[draft] ${tag}: artefaktta pattern YOK`); continue; }
  if (MUTATE) {
    const msg = mutate(pattern);
    if (!mutatedOnce) { console.log(`    ⚠ MUTASYON UYGULANDI → ${msg}`); mutatedOnce = true; }
  }

  // (a) beklenen rol kümesinin tamamı ÇÖZÜLMELİ
  const want = expectedRoles({ sleeveCap: d.sleeveCap ?? CAP.plain });
  let roleOK = true;
  const lens = {};
  for (const [name, need] of Object.entries(want)) {
    const hits = rolesNamed(pattern, name);
    if (need.exact !== undefined ? hits.length !== need.exact : hits.length < need.min) {
      FAIL(`[a] ${tag}: '${name}' rolü ${hits.length} kez var, ` +
           `${need.exact !== undefined ? `tam ${need.exact}` : `en az ${need.min}`} bekleniyor`);
      roleOK = false; continue;
    }
    for (const h of hits) {
      if (!h.resolved || !(h.len > 0)) {
        FAIL(`[a] ${tag}: '${name}' ('${h.piece}' cmds[${h.role.first}..${h.role.last}]) BOŞ yay — ` +
             `aralık taştı ya da uç-nokta çapası tutmuyor (BAYAT ROL)`);
        roleOK = false;
      }
    }
    lens[name] = hits.reduce((a, h) => a + h.len, 0);
  }
  if (!roleOK) continue;

  // (b)(c) ease = kapak − (ön oyuk + arka oyuk), İKİSİ DE ÇİZİLEN KENARDAN
  const armhole = lens.armhole_front + lens.armhole_back;
  const cap = lens.sleeve_cap;
  const ease = cap - armhole;
  const easePct = (cap / armhole - 1) * 100;
  // Yedirilen mi, büzülen mi? [S4] — kaynak yalnız YEDİRİLEN fazlalık hakkında.
  const gatheredHead = (d.sleeveCap ?? CAP.plain) === CAP.gathered ||
                       (d.sleeveCap ?? CAP.plain) === CAP.puffed;
  rows.push({ tag, id: d.id, size: d.size, armhole, cap, ease, easePct, gatheredHead });
  if (ease <= 0) {
    FAIL(`[b] ${tag}: cap ease ${ease.toFixed(4)}mm — İŞARET POZİTİF DEĞİL ` +
         `(kapak ${cap.toFixed(4)} < oyuk ${armhole.toFixed(4)}) [S2]`);
  }
  if (gatheredHead) {
    REPORTED(`[S4] ${tag}: büzgülü baş fazlalığı ${ease.toFixed(4)}mm (${easePct.toFixed(4)}%) — ` +
             `[S1] tavanı UYGULANMADI (yedirme değil büzgü; yayınlanmış nicel eşik YOK)`);
  } else if (Math.abs(ease) > CAP_EASE_CEILING_MM) {
    FAIL(`[c] ${tag}: |cap ease| ${Math.abs(ease).toFixed(4)}mm > tavan ${CAP_EASE_CEILING_MM}mm [S1]`);
  }
}

// ─── DÖKÜM: her satır BASILIR (ölçüm docs'ta değil TEST ÇIKTISINDA, RULES 6) ─
console.log('\n--- ÖLÇÜM (hepsi ÇİZİLEN kenardan; oyuk = armhole_front + armhole_back)');
console.log('spec/beden'.padEnd(34) + 'oyuk(mm)'.padStart(12) + 'kapak(mm)'.padStart(12) +
            'ease(mm)'.padStart(11) + 'ease(%)'.padStart(10) + '  beyan farkı(pp)  sınıf');
for (const r of rows) {
  const diff = decl.ok ? (r.easePct - decl.woven * 100) : NaN;
  console.log(r.tag.padEnd(34) + r.armhole.toFixed(4).padStart(12) + r.cap.toFixed(4).padStart(12) +
              r.ease.toFixed(4).padStart(11) + r.easePct.toFixed(4).padStart(10) + '  ' +
              (decl.ok ? ((diff >= 0 ? '+' : '') + diff.toFixed(4)).padStart(16) : 'BEYAN YOK'.padStart(16)) +
              '  ' + (r.gatheredHead ? 'BÜZGÜLÜ (tavan uygulanmaz)' : 'yedirilen'));
}
if (rows.length) {
  const eased = rows.filter((r) => !r.gatheredHead);
  if (eased.length) {
    const e = eased.map((r) => r.ease);
    REPORTED(`[S3] YEDİRİLEN başlarda ölçülen cap ease bandı: ${Math.min(...e).toFixed(4)} … ` +
             `${Math.max(...e).toFixed(4)}mm (${eased.length} satır). Tavan [S1] YARGILANDI; bandın ` +
             `ALT ucu için YAYIN YOK → yargılanmadı, kayda geçti.`);
    if (decl.ok) {
      const diffs = eased.map((r) => Math.abs(r.easePct - decl.woven * 100));
      REPORTED(`[d] beyan ${(decl.woven * 100).toFixed(2)}% ↔ ölçülen (yedirilen başlar): |fark| ` +
               `en çok ${Math.max(...diffs).toFixed(4)} puan, en az ${Math.min(...diffs).toFixed(4)} puan. ` +
               `Eşik YOK (kaynaksız eşik yasak §7.6) — fark BASILIR.`);
    }
  }
  const gath = rows.filter((r) => r.gatheredHead);
  if (gath.length && decl.ok) {
    const g = gath.map((r) => r.ease);
    REPORTED(`[d] BÜZGÜLÜ başlar (${gath.length} satır): fazlalık ${Math.min(...g).toFixed(4)} … ` +
             `${Math.max(...g).toFixed(4)}mm. Motorun BEYAN ettiği yedirme oranı ${(decl.woven * 100).toFixed(2)}% ` +
             `bu sınıfa AİT DEĞİL (fazlalık büzgüden gelir) — fark hükme çevrilmedi.`);
  }
  REPORTED(`[S4] puf/balon için NİCEL kapı KURULMADI (GECE/V7-R.md §1.3: yayınlanmış eşik yok). ` +
           `Büzgülü başlarda yalnız [S2] işareti yargılandı, fazlalık BASILDI.`);
}

// ─── ADSIZ OYUK SAYIMI (V7-D) — borç GÖRÜNÜR olsun diye ────────────────────
// `validator.cpp` bir kol taşıyan taslakta oyuk ADSIZSA eski skalere düşüyor
// (gerekçe orada yazılı). O düşüş SESSİZ OLMASIN diye borcu burada SAYIYORUZ:
// bir bodice konturunu yeniden yazan ve oyuğun KENDİSİNİ yeniden şekillendiren
// pas'lar (bardot/off-shoulder, yoke, cup seam, box pleat) kenarı yeniden
// ADLANDIRMIYOR. Bu bölüm YARGILAMAZ (FAIL üretmez) — sayar ve adıyla basar.
if (!ARTIFACT && !MUTATE) {
  const DEBT = [
    { id: 'bardot_off_shoulder', spec: { garment: 'dress', shaping: 'dart', neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short', bardotStyle: 1 } },
    { id: 'yoke_top',            spec: { garment: 'top',   shaping: 'dart', neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short', yoke: 1 } },
    { id: 'cupseam_bustier',     spec: { garment: 'dress', shaping: 'princess', neckline: 'square', sleeveStyle: 'straight', sleeveLength: 'short', sleeveCap: CAP.cap, cupSeam: 1 } },
    { id: 'boxpleat_swing',      spec: { garment: 'top',   shaping: 'dart', neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short', boxPleat: 1 } },
  ];
  console.log('\n--- ADSIZ OYUK SAYIMI (yargı DEĞİL, borç kaydı; EU38)');
  const createEngine2 = createRequire(import.meta.url)(ENGINE_PATH);
  const eng2 = await createEngine2();
  for (const { id, spec } of DEBT) {
    let out;
    try { out = JSON.parse(eng2.draftJSON({ ...BASE, ...spec }, bodyOf('EU38'))); }
    catch (e) { console.log(`      ${id.padEnd(22)} motor reddetti: ${e.message}`); continue; }
    if (out.error) { console.log(`      ${id.padEnd(22)} motor reddetti: ${out.error}`); continue; }
    const f = rolesNamed(out.pattern, 'armhole_front').filter((h) => h.resolved).length;
    const b = rolesNamed(out.pattern, 'armhole_back').filter((h) => h.resolved).length;
    const c = rolesNamed(out.pattern, 'sleeve_cap').filter((h) => h.resolved).length;
    console.log(`      ${id.padEnd(22)} armhole_front=${f} armhole_back=${b} sleeve_cap=${c}` +
      `  → ${(f > 0 && b > 0) ? 'ADLI (çizilen kenardan yargılanıyor)' : 'ADSIZ → validator SKALERE düşüyor (borç)'}`);
  }
}

if (DUMP) {
  writeFileSync(DUMP, JSON.stringify({
    engine: ARTIFACT ? `(artefakttan)` : ENGINE_PATH, sizes: SIZES,
    generatedBy: 'engine/tests/sleeve_cap_ease_check.mjs', drafts,
  }));
  console.log(`\n    artefakt döküldü: ${DUMP}`);
}

if (fails === 0) OK(`sleeve_cap_ease_check — ${rows.length} (spec × beden) satırı, 0 ihlal`);
console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} sleeve_cap_ease_check — ${fails} ihlal`);
process.exit(fails === 0 ? 0 : 1);
