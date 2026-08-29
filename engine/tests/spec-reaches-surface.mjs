#!/usr/bin/env node
// ⭐ H2 KAPISI — "SEÇTİĞİM YAKAYI ÇİZİYOR"
//
// Kullanıcı cümlesi: "Yakayı derinleştirdiğimde hem kalıbım hem flat'im
// değişiyor."
//
// ---------------------------------------------------------------------------
// NE ÖLÇÜLÜYORDU, NE ÖLÇÜLMÜYORDU (teşhis, iddia değil)
//
// Repoda iki motor var. `draftJSON(specObj, bodyObj)` spec'in TAMAMINI okuyup
// 2B formül hattını (GarmentDrafter::draft) sürüyor; create.html'in kalıbı o.
// `planJSON` ve `flatJSON` ise İKİ SKALER alıyordu — bir beden etiketi ve bir
// `neckDropMM`. Site o düşüşü her çağrıda 0 geçiyordu. Yani 3B yüzey hattı —
// araştırmanın omurgası olan parça — derleniyordu (build-wasm.sh ENGINE_SRCS),
// tarayıcıya iniyordu, ve spec ona HİÇ ULAŞMIYORDU. Bir alışverişçinin crew ile
// v yaka seçmesi arasında indirilen teknik çizim BAYT BAYT AYNIYDI.
//
// Bu kapı o teli ölçer, ve kolay yoldan ölçmez:
//
//   K1. ⭐ ASIL EŞİK. Aynı bedende (EU38) scoop ve vNeck ile `flatJSON` çağır;
//       iki çıktının sha256'sı FARKLI olmak zorunda. Aynı çıkarsa exit 1.
//       Hash TÜM flat çıktısı üzerinden alınır (siluet + iç üst sınır + düğüm),
//       yani "yalnız etiket değişti" diye geçilemez.
//
//   K2. Hash farkı bir ETİKET farkı değil, GEOMETRİ farkı mı? `dugum` (planın
//       tanımlayıcı geometrisinin parmak izi) ve ön üst sınırın kendi sayıları
//       da ayrışmak zorunda. K1'i `desteklenmeyen_eksenler` dizisindeki isim
//       farkı tek başına geçirebilirdi; K2 o kaçışı kapatır.
//
//   K3. AYNI DEĞİŞİKLİK KALIPTA DA GÖRÜNÜYOR. `planJSON` de aynı iki spec ile
//       çağrılır ve panel geometrisi ayrışmak zorunda. Kullanıcı cümlesi "hem
//       kalıbım hem flat'im" diyor; tek tarafı oynayan bir tel yarım teldir.
//
//   K4. SESSİZ SABİT YOK. Yüzey hattının taşıyamadığı her eksen
//       `desteklenmeyen_eksenler` içinde ADIYLA dönmeli, ve ekranda (create.js)
//       basılmalı. Kart bunu şart koşuyor: reddedilen eksen listesi kullanıcıya
//       yazılmazsa ret değildir.
//
//   K5. TEK KAYNAK. Yüzey hattının yaka derinlikleri, 2B hattın KENDİ çizim
//       tablosudur (engine/src/bodice.cpp `frontNeckDepth` / `neckWidthMultiplier`).
//       Bu kapı o switch'i bodice.cpp'den OKUR ve seamplan.cpp'deki tabloyla
//       karşılaştırır. İki yerde iki doğru = bu reponun tekrar eden hata sınıfı;
//       burada sayıların ayrışması KIRMIZIDIR.
//
//   K6. BEDEN UYDURULMUYOR. `body.size` yoksa cevap {error} olmalı, sessiz bir
//       EU38 değil (RULES değişmez 1).
//
// ---------------------------------------------------------------------------
// ⚠ MOTOR GERÇEKTEN ÇAĞRILIYOR. Bu kapı `engine/dist/stitchu-engine.js`'i —
// web/js/engine.js'in yüklediği BAYTIN kendisini — import eder ve `flatJSON`
// ile `planJSON`'u çağırır. Bir JSON fikstürü okumaz, bir yardımcı fonksiyonu
// taklit etmez: geçmesi için buildSeamPlan → bodysurface → garmentshell →
// flatten → shellprojection hattının gerçekten koşması gerekir.
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const BUNDLE = path.join(ROOT, "engine", "dist", "stitchu-engine.js");

let fails = 0;
const fail = (m, why = "") => { console.log(`FAIL  ${m}${why ? "  — " + why : ""}`); fails++; };
const ok = (m, why = "") => console.log(`ok    ${m}${why ? "  — " + why : ""}`);
const check = (m, cond, why = "") => (cond ? ok(m, why) : fail(m, why));

if (!existsSync(BUNDLE)) {
  console.log(`FAIL  the shipped wasm bundle is missing (${BUNDLE}) — run engine/build-wasm.sh`);
  process.exit(1);
}
const createEngine = (await import(BUNDLE)).default;
const engine = await createEngine();

const sha = (s) => createHash("sha256").update(s).digest("hex");

// ONE body, ONE size, ONE axis moved. Everything else is the shipped default,
// so anything that differs between the two runs came from the neckline word.
const BODY = { size: "EU38" };
const BASE = { garment: "top", shaping: "dart", fabric: "woven", skirtStyle: "aLine" };
const specWith = (neckline) => ({ ...BASE, neckline });

const flat = (neckline) => engine.flatJSON(specWith(neckline), BODY);
const plan = (neckline) => engine.planJSON(specWith(neckline), BODY);

// --------------------------------------------------------------------- K1
const scoopFlat = flat("scoop");
const vneckFlat = flat("vNeck");
for (const [name, raw] of [["scoop", scoopFlat], ["vNeck", vneckFlat]]) {
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { /* reported below */ }
  if (!parsed || parsed.error) {
    fail(`flatJSON answers for ${name}`, parsed ? parsed.error : raw.slice(0, 200));
  }
}
const scoopSha = sha(scoopFlat);
const vneckSha = sha(vneckFlat);
check("EU38 scoop and EU38 vNeck are TWO different flats",
  scoopSha !== vneckSha,
  `scoop ${scoopSha.slice(0, 16)} · vNeck ${vneckSha.slice(0, 16)}`);

// --------------------------------------------------------------------- K2
const S = JSON.parse(scoopFlat);
const V = JSON.parse(vneckFlat);
check("the difference is GEOMETRY, not a label (dugum moved)",
  typeof S.dugum === "string" && S.dugum.length > 0 && S.dugum !== V.dugum,
  `${S.dugum} vs ${V.dugum}`);
// ⚠ THE WITNESS IS THE CENTRE-FRONT POINT, NOT `on_derinlik_mm`. Measured
// first, then written down: the published front depth is zHi - zLo over the
// whole front half, and its zHi is the SHOULDER CREST, not the neck point. So
// deepening the neckline moves it by 0.07 mm and it would have passed a
// "something moved" gate while proving nothing. The centre-front column (x = 0)
// IS the neck point, and it carries the whole drop exactly.
const cfZ = (f) => {
  const pts = f.ust_sinir && f.ust_sinir.on;
  if (!Array.isArray(pts) || !pts.length) return null;
  let best = pts[0];
  for (const p of pts) if (Math.abs(p[0]) < Math.abs(best[0])) best = p;
  return Math.abs(best[0]) < 1e-9 ? best[1] : null;
};
const C = JSON.parse(flat("crew"));
check("the flat publishes a centre-front point on its top boundary",
  cfZ(C) !== null && cfZ(S) !== null && cfZ(V) !== null,
  `${cfZ(C)} / ${cfZ(S)} / ${cfZ(V)}`);
// bodice.cpp: crew = neckW + 15, scoop = neckW + 50, vNeck = neckW + 75. The
// difference from crew is 35 mm and 60 mm of drop, and the surface has to show
// exactly that — not "about that". A rounded or damped number would mean the
// spec reached a filter, not the dial.
for (const [word, f, want] of [["scoop", S, 35.0], ["vNeck", V, 60.0]]) {
  const got = cfZ(C) - cfZ(f);
  check(`${word} drops the centre front by exactly ${want} mm below crew`,
    Math.abs(got - want) < 1e-3, `${got.toFixed(4)} mm`);
}
check("and the front boundary got LONGER, as a deeper neckline must",
  V.ust_sinir.on_yay_mm > S.ust_sinir.on_yay_mm &&
    S.ust_sinir.on_yay_mm > C.ust_sinir.on_yay_mm,
  `crew ${C.ust_sinir.on_yay_mm} · scoop ${S.ust_sinir.on_yay_mm} · vNeck ${V.ust_sinir.on_yay_mm} mm`);

// --------------------------------------------------------------------- K3
const scoopPlan = plan("scoop");
const vneckPlan = plan("vNeck");
check("the SAME spec change also moves the KALIP", sha(scoopPlan) !== sha(vneckPlan),
  `${sha(scoopPlan).slice(0, 16)} vs ${sha(vneckPlan).slice(0, 16)}`);
const P = JSON.parse(scoopPlan);
const Q = JSON.parse(vneckPlan);
const panelSig = (p) => (p.paneller || []).map((x) => `${x.ad}:${x.cevre_mm}`).join("|");
check("the pattern's own panel geometry moved, not just its header",
  panelSig(P).length > 0 && panelSig(P) !== panelSig(Q),
  `${(P.paneller || []).length} panels`);
check("both readings still come out of ONE object (same dugum per run)",
  P.dugum === S.dugum && Q.dugum === V.dugum,
  `${P.dugum} / ${S.dugum}`);

// --------------------------------------------------------------------- K4
check("flatJSON publishes desteklenmeyen_eksenler", Array.isArray(S.desteklenmeyen_eksenler),
  JSON.stringify(S.desteklenmeyen_eksenler));
check("planJSON publishes it too", Array.isArray(P.desteklenmeyen_eksenler));
// A shipped-default spec asks for nothing the surface cannot carry, so its list
// is empty. That is not "the list never fills": the runs below prove it does,
// by name, for axes the shopper actually moved.
check("a shipped-default spec refuses nothing", S.desteklenmeyen_eksenler.length === 0,
  JSON.stringify(S.desteklenmeyen_eksenler));
const loud = JSON.parse(engine.flatJSON(
  { ...BASE, garment: "dress", neckline: "boat", sleeveStyle: "straight",
    skirtStyle: "gathered", collarType: 4, fabric: "knit" }, BODY));
const named = (frag) => loud.desteklenmeyen_eksenler.some((s) => s.startsWith(frag));
for (const axis of ["garment", "fabric", "sleeveStyle", "skirtStyle", "collarType",
                    "neckline.derinlik", "neckline.genislik", "neckline.sekil"]) {
  check(`a moved axis the surface cannot carry is named: ${axis}`, named(axis),
    JSON.stringify(loud.desteklenmeyen_eksenler));
}
check("the refused axis carries the VALUE that was asked for",
  loud.desteklenmeyen_eksenler.some((s) => s.includes("gathered")),
  JSON.stringify(loud.desteklenmeyen_eksenler));
// ON SCREEN, or it is not a refusal. The card is explicit: every element of the
// array has to be visible on create.html.
const createSrc = readFileSync(path.join(ROOT, "web", "js", "create.js"), "utf8");
const dlSrc = readFileSync(path.join(ROOT, "web", "js", "download.js"), "utf8");
const i18nSrc = readFileSync(path.join(ROOT, "web", "js", "i18n.js"), "utf8");
check("download.js hands the refused axes to its caller",
  /desteklenmeyen_eksenler/.test(dlSrc), "the list must leave the engine wrapper");
check("create.js writes the refused axes into the screen message",
  /create\.dl\.flataxes/.test(createSrc) && /msg\.textContent\s*=\s*t\(\s*'create\.dl\.flataxes'/.test(createSrc),
  "a list that is fetched and never printed is the silence H2 was opened to end");
check("the sentence exists in both languages", /'create\.dl\.flataxes'/.test(i18nSrc) &&
  /Teknik çizim dikiş planından çizildi/.test(i18nSrc));
check("web/js/engine.js passes the SPEC, not two scalars",
  /engine\.flatJSON\(spec, body\)/.test(readFileSync(path.join(ROOT, "web", "js", "engine.js"), "utf8")),
  "the whole defect was that this call took a size label and a zero");

// --------------------------------------------------------------------- K5
// ONE SOURCE. seamplan.cpp's neckline table is bodice.cpp's frontNeckDepth /
// neckWidthMultiplier, and this reads BOTH files rather than trusting a comment.
const bodiceSrc = readFileSync(path.join(ROOT, "engine", "src", "bodice.cpp"), "utf8");
const seamSrc = readFileSync(path.join(ROOT, "engine", "src", "seamplan.cpp"), "utf8");
const bodiceDepth = {};
for (const m of bodiceSrc.matchAll(/case Neckline::(\w+):\s*return\s+(?:neckW \+ )?(-?[\d.]+);/g)) {
  bodiceDepth[m[1]] = Number(m[2]);
}
const seamDepth = {};
for (const m of seamSrc.matchAll(/case Neckline::(\w+):\s*return \{\s*(-?[\d.]+),\s*(true|false),\s*(-?[\d.]+),/g)) {
  seamDepth[m[1]] = { depth: Number(m[2]), abs: m[3] === "true", width: Number(m[4]) };
}
const NECKLINES = ["Crew", "Scoop", "VNeck", "Square", "Boat", "Sweetheart", "Halter",
                   "Cowl", "PussyBow"];
check("bodice.cpp's frontNeckDepth switch was readable",
  NECKLINES.every((n) => typeof bodiceDepth[n] === "number"),
  JSON.stringify(bodiceDepth));
check("seamplan.cpp's neckline table was readable",
  NECKLINES.every((n) => seamDepth[n]), JSON.stringify(Object.keys(seamDepth)));
for (const n of NECKLINES) {
  const a = bodiceDepth[n], b = seamDepth[n];
  check(`the two lines agree on ${n}'s neckline depth`,
    typeof a === "number" && b && a === b.depth, `bodice ${a} · seamplan ${b && b.depth}`);
}
// The width multipliers, same rule.
const bodiceWidth = { Boat: 1.85, Sweetheart: 1.2, Cowl: 1.4 };
for (const [n, want] of Object.entries(bodiceWidth)) {
  const re = new RegExp(`Neckline::${n}\\) return (-?[\\d.]+);`);
  const m = re.exec(bodiceSrc);
  check(`bodice.cpp still declares ${n}'s width multiplier`, !!m && Number(m[1]) === want,
    m ? m[1] : "not found");
  check(`seamplan.cpp carries the same ${n} multiplier`,
    seamDepth[n] && Math.abs(seamDepth[n].width - want) < 1e-9,
    seamDepth[n] ? String(seamDepth[n].width) : "missing");
}
check("Boat is the one depth written as a bare mm number, and it is refused",
  seamDepth.Boat && seamDepth.Boat.abs === true &&
    NECKLINES.filter((n) => seamDepth[n] && seamDepth[n].abs).length === 1,
  "an absolute depth has no crew-relative difference to put on the drop dial");

// --------------------------------------------------------------------- K6
const noSize = JSON.parse(engine.flatJSON(specWith("scoop"), {}));
check("a missing size is REFUSED by name, not silently EU38",
  typeof noSize.error === "string" && noSize.error.includes("size"), noSize.error);
const badSize = JSON.parse(engine.flatJSON(specWith("scoop"), { size: "EU99" }));
check("an unknown size is refused too",
  typeof badSize.error === "string" && badSize.error.includes("EU99"), badSize.error);
// A body measurement handed to this line is NOT read (the surface is valued on
// the published EU chart). Silently ignoring it is the same class of defect, so
// it is named as well.
const withBody = JSON.parse(engine.flatJSON(specWith("scoop"), { size: "EU38", bust: 88 }));
check("a body measurement this line does not read is named, not ignored",
  (withBody.desteklenmeyen_eksenler || []).some((s) => s.startsWith("body.bust")),
  JSON.stringify(withBody.desteklenmeyen_eksenler));

console.log(fails === 0 ? "\nspec-reaches-surface: PASS" : `\nspec-reaches-surface: ${fails} FAIL`);
process.exit(fails === 0 ? 0 : 1);
