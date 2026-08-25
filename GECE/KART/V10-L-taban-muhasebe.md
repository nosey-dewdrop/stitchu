# KART V10-L — TABANI HEAD'DE YENİDEN KES + MUHASEBEYİ DÜRÜSTLEŞTİR (SIRALI, 2/2)

V10-J bitmeden BAŞLAMA. Girdi ağacın SON hâli.

## NE
`engine/tests/landing-truth-baseline.json` tabanını HEAD'de yeniden kes ve
`_note` + `_neden0Degil` metinlerine hakemin ölçtüğü GERÇEK muhasebeyi yaz.
Tek bir L sayısı YÜKSELEMEZ.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `engine/tests/landing_truth_check.mjs` (satır 53-54: L1 sağlayıcı eşleşmesinin
  SUBSTRING olduğunu yazan yer — OKU, cümleni oradan kur)
- `engine/tests/landing-truth-baseline.json` (yazılacak tek dosya)
- `GECE/log/V10-J.kapi.txt` (V10-J'nin bıraktığı son kapı çıktısı)

## ÖLÇÜLMÜŞ ZEMİN (hakem ölçtü — güvenme, YENİDEN ÖLÇ ve sayını yaz)
- Taban `c72f650`'de kesilmiş, HEAD çok ilerde → L1 bugün TAM TAVANDA
  (937/937), sıfır pay. Bu şans eseri.
- Faz öncesi (`9b306f9`) sayısal blok **1116**, sağlayıcılı **42**;
  HEAD'de **1106 / 169**. Yani siteden ÇIKAN sayısal iddia **10**,
  "sağlayıcılı" sayılan blok **+127**.
- `git diff 9b306f9..HEAD -- web/` içinde `golden_check` **+224** ekleme,
  `engine_check` **+60** ekleme. HEAD'de sayı+birim taşıyıp YALNIZ bu iki
  jetonla aklanan blok **81** (ör. `web/patches/1-5.html` "14/54" — bu sayıyı
  `golden_check` BASMAZ).
- Hakemin sondası: `"The seam allowance is 12.5 mm on every piece."` → L1 938/937
  KIRMIZI; aynı cümle + `(site-health)` → 937/937 YEŞİL.
- `L4` faz öncesinde de **0**'dı: bu fazda hiçbir borç taşımadı, hiçbir şey
  yakalamadı — beş denetimden biri fiilen ÖLÜ.
- `_neden0Degil.L3` bugün kendi dosyasıyla ÇELİŞİYOR: "Bugün sitede
  data-vision=1 taşıyan blok SIFIR" derken aynı JSON `isaretliBlok: 1` diyor.

## YAPILACAK
1. Yukarıdaki her sayıyı **KENDİN yeniden ölç** ve onu basan komutu
   `GECE/log/V10-L.muhasebe.txt`'ye yaz (`git diff 9b306f9..HEAD -- web/ | grep -c`,
   faz öncesi ağaç için `git worktree add /tmp/v10-pre 9b306f9` +
   `node engine/tests/landing_truth_check.mjs --no-baseline --dir=/tmp/v10-pre/web`).
   Hakemin sayısı seninkiyle tutmuyorsa **SENİN sayın geçerlidir**, ikisini de yaz.
2. Tabanı HEAD'de yeniden kes:
   `node engine/tests/landing_truth_check.mjs --baseline --note="..."`
   `_note` şu ÜÇ cümleyi TAŞIYACAK (süsleme yok, sayılar seninkiler):
   - L1'in faz içindeki düşüşünün muhasebesi: **N silindi / M jetonla aklandı**
     (jeton = `golden_check`/`engine_check` substring'i).
   - L1 sağlayıcı eşleşmesi **SUBSTRING**'dir: "blokta alet adı duruyor" ≠
     "sayı o aletten çıktı". Kapı sayının DOĞRULUĞUNU ölçmez.
   - L2 artık **iki dilli** (İngilizce 18 + Türkçe kalıplar); L4 bu fazda hiçbir
     borç taşımadı, faz öncesinde de 0'dı.
3. `_neden0Degil` metinlerini TAZELE: her L için bugünkü sayı + neden 0
   olmadığı + onaracak kart. L3 cümlesi `isaretliBlok` ile ÇELİŞMEYECEK.
   L4 maddesi "bu denetim bu fazda hiçbir şey yakalamadı" cümlesini taşıyacak.
4. Kesme sonrası doğrula: hiçbir L tabanı bir önceki tabanın ÜSTÜNDE değil.
   Önceki taban: L1 937 · L2 0 · L3 0 · L4 0 · L5 4. Yükselen varsa
   **TABANI YÜKSELTME** — durdur, `GECE/V10-L.md`'ye sebebiyle yaz.

## ÇIKTI
- `engine/tests/landing-truth-baseline.json`
- `GECE/log/V10-L.muhasebe.txt` (her sayının yanında onu basan komut)
- `GECE/log/V10-L.kapi.txt` (yeni tabanla kapının tam çıktısı)
- `GECE/V10-L.md` — önceki taban / yeni taban tablosu; muhasebe sayıları;
  yapılamayan her kalem SEBEBİYLE

## KAPANIŞ DOĞRULAMASI
1. `node engine/tests/landing_truth_check.mjs` → EXIT 0
2. `bash engine/tests/generated_ratchet_check.sh` → EXIT 0
3. `git worktree remove /tmp/v10-pre` (fikstür temizlenir), `git status --porcelain`
   yalnız kartın ÇIKTI dosyalarını göstersin

## YASAKLAR
- **TABAN YÜKSELTİLEMEZ.** Kalıp silme, muafiyet gömme, DISABLED yok.
- `web/**`, `engine/tests/landing_truth_check.mjs`, `docs/`, `README.md`,
  `GECE/KOSU.md`, `GECE/KAPI.md`, `engine/src/`, `contract/` yasak — bu kart
  YALNIZ tabanı ve kendi log/tutanağını yazar.
- Süs cümlesi yok: `_note`'un her cümlesi bir sayı ya da bir dosya yolu taşır.

## SÜRE TAVANI
35 dk.

## COMMIT
`git commit -m "v10-l: recut the landing baseline at head and write what the l1 drop actually was — deletions counted apart from provider tokens"`
