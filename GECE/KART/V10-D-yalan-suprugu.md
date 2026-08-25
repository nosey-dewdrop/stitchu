# KART V10-D — YALAN SÜPÜRGESİ (etiket: SIRALI, V10-C'den sonra)

## NE
`web/` genelinde KALAN yalanı sil ve `landing_truth_check` TABANINI DÜŞÜR.
V10-C index/api/studio'yu kapattı; kalan 44+ sayfa hâlâ **MTM satıyor**.
★ V9 DERSİ: borç kaydeden taban kapıyı süse çevirir. Bu kartın işi tabanı kesmek.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `engine/tests/landing_truth_check.mjs` — kapı (KOŞTUR, DEĞİŞTİRME)
- `engine/tests/landing-truth-baseline.json` — taban (yalnız `--baseline` ile yeniden kes)
- `GECE/V10-A.md` §1, §8 · `GECE/V10-B.md` · `GECE/V10-C.md` §9 (kalan dosyaların ADLI listesi)
- `contract/layers/shape-ratios.json` — motorun GERÇEK beden kümesi (8, EU34–48)
- `web/**` (yazılacak alan)

## SIRA (öncelik kesindir; süre biterse alttakiler kalır)
1. **L2 — MTM YALANI.** `made to measure` 2 · `your own measurements` 69 ·
   `your measurements` 153 · `no fixed sizes` 23. Motor **8 SABİT BEDEN**
   (EU34–48). Bu cümleler sayfada DURAMAZ. Yerine dürüst karşılığı yaz
   (ör. "eight fixed sizes, EU34–48, drafted from `contract/layers/shape-ratios.json`").
   Bir sayfa gerçekten ölçü alıyorsa (worker API) o AYRI bir cümledir ve
   sayfada hangi hattın ne yaptığı ADIYLA ayrılır.
2. **L2 — DURAN İDDİA.** `byte-identical` 213 · `zero issues` 36 · `always` 21 ·
   `0.000000 mm` 23. RULES 6: duran-iddia yazılmaz, **sayıyı basan aletin ADI**
   yazılır. ⚠ `0.000000 mm` uydurma hassasiyettir: `engine/tools/precision-report.js`
   `toFixed(2)` ile **iki basamak** basıyor. Ya aletin bastığı basamağa in ya cümleyi sil.
3. **L3.** `web/js/i18n.js:14` iki ihlal — işaretsiz blokta "coming soon /
   yakında". Ya `data-vision="1"` işaretli bloğa taşı ya sil.
4. **L5.** `web/api.html:151` EU50/EU52 → motorun kümesine indir.
   ⚠ `web/js/contract.gen.js` **ÜRETİLMİŞ** dosyadır (`engine/tools/gen-contract.mjs`);
   ELLE DÜZENLEME. Onun 4 kaçağını kapının bilinen istisnası olarak
   `GECE/V10-D.md`'ye ADIYLA yaz ve `DAMLA-KUYRUK.md`'ye 3.8.d satırı düşür.
5. **L1 — sağlayıcısız sayı 1063.** Süre kalırsa: en yoğun 3 dosyada
   (kapı çıktısı adlarını basıyor) sayıların yanına onu basan test/alet ADINI
   koy ya da sayıyı sil. Hepsini bitirmek ŞART DEĞİL — **düşür ve tabanı kes.**

## TABANI KESME (zorunlu son adım)
`node engine/tests/landing_truth_check.mjs --baseline --note="V10-D: L2 MTM ve duran-iddia süpürüldü"`
Sonra `node engine/tests/landing_truth_check.mjs` → **EXIT 0** olmalı.
Her L için ÖNCE/SONRA sayısını yaz. **Hiçbir L sayısı YÜKSELEMEZ.**

## ÇIKTI
- Değişen `web/**`
- `engine/tests/landing-truth-baseline.json` (kesilmiş taban)
- `GECE/V10-D.md` — L1..L5 ÖNCE/SONRA tablosu + dokunulan her dosya +
  düzeltilemeyen her kalem SEBEBİYLE
- `GECE/log/V10-D.kapi.txt` — kapının son tam çıktısı
- `GECE/log/V10-D.site-health.txt` — `node engine/tools/site-health.mjs` (exit 0, ölü link 0)

## YASAKLAR
- Kapının kodunu (`landing_truth_check.mjs`) DEĞİŞTİRME — gevşetme fazı düşürür (§7.1).
- `engine/` altında başka hiçbir şeye dokunma. `docs/`, `README.md`,
  `GECE/KOSU.md`, `web/js/contract.gen.js` yasak.
- **DEPLOY YAPMA**, "canlı/yayında" deme. `?v` damgasını elle değiştirme.
- Görsel kimliği yeniden yazma; bu kart METİN kartıdır, CSS'e girme.
- Sahte sayı koyma. Sayı gidiyorsa cümle de gider.

## SÜRE TAVANI
60 dk. Tavanda: o ana kadarki iş + KESİLMİŞ taban commit'lenir; kalan kalemler
`GECE/V10-D.md`'de "YAPILMADI" başlığı altında ADIYLA yazılır.

## COMMIT
`git add` SADECE kendi dosyaların (`web/`, `engine/tests/landing-truth-baseline.json`,
`GECE/V10-D.md`, `GECE/log/V10-D.*`, `DAMLA-KUYRUK.md`).
`git commit -m "v10-d: sweep the remaining mtm and standing claims out of web/, cut the landing truth baseline"`
