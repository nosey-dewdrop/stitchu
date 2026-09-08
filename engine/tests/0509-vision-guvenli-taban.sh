#!/usr/bin/env bash
# 0509-vision-guvenli-taban.sh — A3 gecidi (brief: "GUVENLI TABAN (8.8)" + "Arka").
#
# UC SEY OLCER:
#  A. guvenli-taban: sema disi cevap iki yeniden istemede duzelmezse RET DEGIL,
#     ERR_FALLBACK_BASE + gorunur ilan gelmeli. Backend'in gercek fonksiyonu kosulur.
#  B. arka_koken_check: her okumada arka.koken 'fotograf' | 'turetildi';
#     'turetildi' ise NEDEN bos olamaz (onizlemede gorunur ilan).
#  C. onbelleksiz fotograf ADIYLA reddediliyor mu (sessiz "promptla devam" YOK).
#
# Cikis 0 = 0 kirmizi.
set -uo pipefail
cd "$(dirname "$0")/../.."
node --input-type=module 2>&1 <<'ENDJS' | grep -v 'MODULE_TYPELESS\|Reparsing\|To eliminate\|trace-warnings'

import { analyzePhotoToGraph, visionSemaEksikleri } from "./backend/analyze-core.js";
import { okumaGetirDosyadan } from "./web/js/vision-bridge.js";
import { readFileSync, readdirSync } from "node:fs";

let kirmizi = 0;
const ok = (a, n = "") => console.log(`OK   ${a}` + (n ? `  -- ${n}` : ""));
const fail = (a, n = "") => { kirmizi++; console.log(`FAIL ${a}` + (n ? `  -- ${n}` : "")); };

// ---- A. guvenli taban -------------------------------------------------------
let cagri = 0;
const r = await analyzePhotoToGraph({
  sha: "sentetik", onbellekGetir: async () => null,
  cagriYap: async () => { cagri++; return '{"paneller":[]}'; },   // hep sema disi
});
if (r.hataKodu !== "ERR_FALLBACK_BASE") fail("A1 guvenli-taban", `hataKodu ${r.hataKodu}, ERR_FALLBACK_BASE bekleniyordu`);
else ok("A1 guvenli-taban", "sema disi cevap RET degil, taban");
if (cagri !== 3) fail("A2 yeniden-isteme-tavani", `${cagri} cagri; en fazla 2 yeniden isteme (1+2=3) olmali`);
else ok("A2 yeniden-isteme-tavani", "1 ilk + 2 yeniden isteme");
if (!r.guvenliTaban?.ilan?.trim()) fail("A3 gorunur-ilan", "guvenliTaban.ilan bos: onizlemede gosterilecek cumle yok");
else ok("A3 gorunur-ilan", r.guvenliTaban.ilan);
// gecerli cevap ILK seferde kabul edilmeli (taban yanlis yere kacmasin)
const iyi = JSON.parse(readFileSync("KOSU/onbellek/" + readdirSync("KOSU/onbellek").find((f) => f.endsWith(".json") && JSON.parse(readFileSync("KOSU/onbellek/" + f, "utf8")).semaSurumu === "vision-graf-v1"), "utf8"));
let c2 = 0;
const r2 = await analyzePhotoToGraph({ sha: "x", onbellekGetir: async () => null, cagriYap: async () => { c2++; return iyi; } });
if (r2.hataKodu || c2 !== 1) fail("A4 gecerli-cevap-kabul", `hataKodu ${r2.hataKodu}, cagri ${c2}`);
else ok("A4 gecerli-cevap-kabul", "semaya uyan cevap ilk seferde kabul edildi (taban tetiklenmedi)");

// ---- B. arka_koken_check ----------------------------------------------------
let n = 0;
for (const f of readdirSync("KOSU/onbellek").filter((x) => x.endsWith(".json"))) {
  const d = JSON.parse(readFileSync("KOSU/onbellek/" + f, "utf8"));
  if (d.semaSurumu !== "vision-graf-v1") continue;
  n++;
  const e = f.slice(0, 8), a = d.arka;
  if (!a) { fail(`B ${e} arka`, "arka blogu yok"); continue; }
  if (!["fotograf", "turetildi"].includes(a.koken)) { fail(`B ${e} arka.koken`, `'${a.koken}' — fotograf|turetildi olmali`); continue; }
  if (!String(a.neden ?? "").trim()) { fail(`B ${e} arka.neden`, `koken '${a.koken}' ama neden bos (gorunur ilan yok)`); continue; }
  if (a.koken === "fotograf" && !a.sha256) { fail(`B ${e} arka.sha256`, "koken fotograf ama es fotografin sha256 i yok"); continue; }
  ok(`B ${e} arka_koken`, `${a.koken} — ${String(a.neden).slice(0, 70)}`);
}
if (!n) fail("B arka_koken_check", "vision-graf-v1 okumasi bulunamadi");

// ---- C. onbelleksiz fotograf ADIYLA reddediliyor mu -------------------------
const yok = await okumaGetirDosyadan("GIRDI/hedef-fotograflar/ossie-clark-O46229-dress.jpg");
if (yok.hataKodu !== "ERR_NO_CACHE") fail("C onbelleksiz-ret", `hataKodu ${yok.hataKodu}, ERR_NO_CACHE bekleniyordu`);
else ok("C onbelleksiz-ret", "onbellegi olmayan fotograf ADIYLA reddedildi (sessiz prompt hatti YOK)");

console.log(`OZET vision-graf-v1 okumasi=${n} kirmizi=${kirmizi}`);
process.exit(kirmizi ? 1 : 0);
ENDJS
exit ${PIPESTATUS[0]}
