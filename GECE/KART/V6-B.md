# KART V6-B — `edit_locality_check` SÜS MÜ? (teşhis + mutasyon, onarım YOK)

ETİKET: **PARALEL** · SÜRE TAVANI: **60 dk**

## NE
ctest'te `edit_locality_check` adıyla PASS geçen bir test var. Bu testin NE
ölçtüğünü ÖLÇ ve kırılabilirliğini KANITLA. Hüküm iki taneden biri olacak:
"gerçek kapı, şu mutasyonlarla kırılıyor" ya da "süs, şu yüzden kırılmıyor".
Bu kartta ONARIM YAPILMAZ — teşhis + mutasyon logu üretilir.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md` · `RULES.md`
- `engine/tests/edit_locality_check.mjs`
- `engine/tools/spec-diff.mjs`
- `contract/edit-locality-v1.json` · `contract/composition.json`
- `engine/CMakeLists.txt` SADECE 830-860 satır aralığı

## YAPILACAKLAR
1. `spec-diff.mjs`'in `draft()`'ünün hangi motoru koştuğunu KAYNAK OKUYARAK
   söyle: wasm mı, native mi, `web/js/_engine-full.mjs` sınıfı 2B çizici mi,
   `engine/src/surfacepattern.cpp` yüzey hattı mı. Dosya + satır ver.
   ★ Bu kritik: kapı, kullanıcının GERÇEKTEN kullandığı hattı yargılamıyorsa süs.
2. Testi koş, çıktıyı sakla: `node engine/tests/edit_locality_check.mjs`.
   12 vakanın kaçı "bölge dışı yargılanan panel" sayısı KAÇ ile geçiyor —
   vaka vaka `r.locality.checked` sayısını bas.
3. `contract/edit-locality-v1.json`'daki bölge listesinin ELLE mi yazıldığını
   yoksa bir üreteçten mi doğduğunu KANITLA (grep: üreteç/`--check`/GENERATED
   başlığı). Elle yazılmışsa bunu ADIYLA yaz.
4. **MUTASYON KANITI (§4.5)** — en az 4 kasıtlı bozma, her biri ayrı ve GERİ
   ALINARAK. Her mutasyon için ÖNCE/SONRA exit kodu + çıktı satırı logla:
   M1: `spec-diff.mjs`'te lokallik karşılaştırmasını gevşet (ör. bayt yerine
       panel SAYISI karşılaştır) → kapı KIRILMALI.
   M2: dokunulmayan bir panelin bir koordinatına +5mm ekle (üretim sonrası
       enjeksiyon) → kapı KIRILMALI.
   M3: `edit-locality-v1.json`'da bir vakanın bölgesini "tüm gövde" yap
       (bölge şişerse bölge-dışı panel 0'a düşer) → A2 mandalı KIRMALI.
   M4: bir vakayı SESSİZ NO-OP yap (motorun tanımadığı alan) → A3 mandalı
       KIRMALI. Kırılmayan mutasyon = kapının o yönde dişi YOK, adıyla yaz.
5. Her mutasyondan sonra dosyayı GERİ AL ve testin YEŞİLE döndüğünü göster
   (`git diff --stat` boş + test exit 0).

## ÇIKTI
- `GECE/V6-B.md` — HÜKÜM (gerçek kapı / süs) + hangi mutasyon kırdı kırmadı
  tablosu + `draft()`'ün koştuğu hattın dosya:satır kanıtı.
- `GECE/log/V6-B.mutasyon.txt` — 4 mutasyonun ham ÖNCE/SONRA çıktısı.

## YASAKLAR
- KALICI kod değişikliği YASAK: mutasyonlar geçici, hepsi geri alınır; commit'ine
  yalnız `GECE/V6-B.md` + `GECE/log/V6-B.mutasyon.txt` girer.
- `engine/src/`, `backend/`, `web/`, `contract/` DEĞİŞTİRİLMEZ.
- Mevcut testleri kalıcı değiştirme yasak.
- "Kapı çalışıyor görünüyor" yasak — exit kodu + çıktı satırı.

## COMMIT
`git commit -- GECE/V6-B.md GECE/log/V6-B.mutasyon.txt`
`git add -A` KULLANMA (paralel işçi var). Commit öncesi `git status --short`
ile kendi dosyalarından başkası kirli kalmadığından emin ol.
