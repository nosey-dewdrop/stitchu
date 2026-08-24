# KOSU.md — v6 gece koşusu (24 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. v5 koşusunun kayıtları GECE/arsiv/v5-kosusu/
altındadır ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V2 KAPANDI** (mutfak: sözlük reformu). Sıradaki V3 (tek nesne: flat ile
kalıp aynı kabuktan). Son yeşil commit: yok — HEAD'de 4 kırmızı var, dördü de
MİRAS ve dördü de sınıf (c) kaynak/karar eksiği. V2 üç yeni ad doğurdu, ÜÇÜNÜ DE
aynı gece kapattı; net yeni ad 0.
V2'nin ölçtüğü ağaç: `a6b473a..HEAD`. Açılış ağacı: `b197ccf`.

## KAPANMIŞ FAZLAR
- **V0** — 7 kart (0R/0A/0B/0C/0D/0E paralel + 0F sıralı), 6 alt kapı yeşil,
  4.7 önce KALDI sonra 0F ile GEÇTİ. Tutanak: `GECE/V0.md`
- **V1** — 5 kart (R sıralı → B/D/E paralel → A sıralı) + 1 düzeltme turu.
  Hakem önce **KALDI** verdi (mührü savunan tanık cümlesi UYDURMAYDI), `05156a1`
  düzeltince GEÇTİ. **Kırmızı 6→4, yeni ad 0.** Tutanak: `GECE/V1.md`
- **V2** — DEVRALINDI (§3.10: önceki şef V2-B ortasında kesilmiş, tutanak yoktu,
  yarım iş `6fac6cb`'de çivilendi). 6 kart: R → A ‖ B → B2 → C → D, hepsi sıralı
  koştu. **3 yeni kapı** (`vocab_source_check` · `vocab_reference_check` ·
  `wasm_spec_honesty_check`), test 105→108. 4.3 kanıt kapısı önce **6 kırmızı**
  buldu → V2-D → 4. Hakem GEÇTİ. Tutanak: `GECE/V2.md`
  · İşçiler: `V2-R.md` `V2-A.md` `V2-B.md` `V2-C.md` `V2-D.md` · Kapı: `GECE/KAPI.md`

## AÇIK KIRMIZILAR (4 — ad · nerede · sayı · 4.7 adayı)
1. `style_check` — `engine/STYLE-PIN` diskte YOK · kapsam **0/31** ·
   kapı `513b175`'te GERÇEK KAPI oldu (mutasyon M8 kanıtlı).
   Aday koşulabilir: `repin-style.sh`; darboğaz **31 kez GÖZ**
2. `sizechart_source_check` — `contract/tables.json` · 7 kolonun **4'ü UNSOURCED**
   · R-kartı iki birincil tabloyu ölçtü, **dördü de BAĞLANAMAZ**; aday: kolonları AT
3. `contract_check` — `git ls-files patterns_real` = **41** takipli telifli dosya
   · aday V0'da ölçüldü (untrack → `GREEN, exit=0`) ama Damla kararı
4. `figure_check` — `dress_bandeau_circle` 31 stilin tek `fittedBand`'i ·
   kardeş YOK, tabloyla kanıtlandı · iki ölçülmüş aday: 4. bant `[0.84,0.90]`
   ya da siluet düzeltmesi (oran 0.820, pin bile gerekmez)

KAPANAN (V1): `golden_check` · `recipe_dress_check`. KAPANAN (V0): `bundle_fresh_check`.
V2'DE AÇILIP AYNI GECE KAPATILAN: `bundle_fresh_check` (kaynak özeti damgası) ·
`vocab_reference_check` (taban bilinçli yeniden kesildi, `e2f7aba`) ·
`generated_ratchet_check` (`?v` bump'ı RULES 9 gereği geri alındı, `f0c1398`).
**NET AÇILAN YENİ AD: 0.**

## DEVİR ÜÇ SAYI (V3'e)
1. **KIRMIZI = 4** — `style_check` · `sizechart_source_check` · `contract_check` ·
   `figure_check`; dördü de MİRAS, dördü de sınıf (c). Test sayısı **105 → 108**.
   Log: `GECE/log/V2.ctest.before.txt` → `GECE/log/V2-SEF.ctest.final.txt`
2. **SÖZLÜK TABANI = 10418 referans @ `9487091` · 37 eksen / 132 değer · RATCHET
   KİLİTLİ.** Sayı bundan sonra yalnız DÜŞEBİLİR; artıran commit
   `vocab_reference_check`'te kırmızı düşer. Tabanı yeniden kesmek bilinçli bir
   hamledir, deltanın satır satır kaynağı commit mesajına yazılır (emsal `e2f7aba`)
3. **SEVK EDİLEN SINIR DÜRÜST: 27 alan + 7 gövde ölçüsü ADIYLA reddediyor;
   sürekli eksen HÂLÂ 2/37.** Sessiz ikame (`bindings.cpp:94` `v.as<int>()`)
   ÖLDÜ; NaN artık basılmıyor, JSON.parse edilebilir `{"error":…}`'e dönüyor.
   Üç sevk artefaktı kaynak özeti taşıyor (`ecdb56421eadd2a2`)

## TABAN BANTLARI (§4.1 — sessizce aşılamaz)
`draftJSON` medyan **1.030 ms** (p95 1.107) · `gradeJSON` EU34→48 **8.198 ms** ·
5000 soak SURVIVED, external delta 0.00 MB · native↔wasm en kötü **1e-4 mm** ·
çağrı yolu **main thread**, Worker yok → Worker refaktörü KUYRUK KARTI, kapı değil.
Alet: `engine/tools/wasm-baseline.mjs`. ⚠ Alet bugün sayı ne olursa olsun **exit 0**
dönüyor, yani bant hüküm basmıyor; V2-D'nin ölçülmüş adayı: 5 koşunun EN DÜŞÜK
MEDYANI + tavan aşılınca exit 1 + ctest'e bağla.

## SONRAKİ FAZLARIN HAZIR GİRDİSİ
- V3 ← V2'nin kapattığı sınır: motor artık kesirli/eksik girdiyi ADIYLA reddediyor,
  yani flat↔kalıp hattı "0 geldi" diye sessizce başka giysi çizemez
  **+ `GECE/V2-A.md` §1** (34 dosya → 37 eksen bijeksiyonu, hangi dosya hangi ekseni
  taşıyor — iki hattın ortak kaynağını ararken tablo hazır)
- V4 ← `figure_check`'in iki adayı (K-V1B); `figure-bands.json`'un kendi
  gerekçesindeki "%27 dar" cümlesi ÇÜRÜDÜ, gerçek fark **%5.9** (yanlış landmark)
- V5 ← `GECE/V1-R.md` (dört kolon BAĞLANAMAZ + 5 erişilemeyen yayının künyesi;
  ★ kapının KENDİ zayıflığı ölçüldü)
- V6 ← `GECE/V0-0B.md` (foto→spec: 5 fotoda 1 tam doğru; hata sınıfı GÖRME %100)
  **+ V2'den:** kelime listesi artık ELLE YAZILMIYOR, `engine/tools/gen-vision-vocab.mjs`
  üretiyor ve `vocab_source_check` mühürlüyor. ⚠ `NECKLINE_CLASSES` 7→9,
  `SKIRT_STYLE_CLASSES` 5→6: indeksler kaymadı ama eğitilmiş kafa sınıf sayısıyla
  uyuşmuyor — yeniden eğitim KARARA BAĞLANMADI
- V7 ← `52ae85c`'nin ilan ettiği tavan: *"tek kübik gerçek scye'nin S kavisini
  çizemiyor"*, sonraki aday "oyuğu çentikten iki kübiğe ayır"
  **+ V2'den:** `sleeve` operatörü sicilde hâlâ **absent**, ama `sleeveCap` ekseni
  artık ara değeri sessizce yutmuyor
- V9/V10 ← `GECE/V0-0C.md` (1248 iddia) **+ V2'den:** `?v` cache damgası **136'da
  donmuş** ve `web/vendor` baytı iki kez değişti — bump 54 ÜRETİLMİŞ dosyayı elle
  düzenlediği için `generated_ratchet_check`'i kırıyor; kök çözüm o 54'ü
  üreteçlerinden geçirip manifest'i AYNI commit'e koymak (`GECE/V2.md` §5.1).
  Ayrıca `docs/ARCHITECTURE.md:54` deploy'u `gh-pages` diye anlatıyor, CLAUDE.md
  `scripts/deploy.sh` (Vercel) diyor — çelişki, karar işi

## V2'DEN ÇIKAN KART TASLAKLARI (kuyrukta, faz sahibi belli değil)
- Sürekli eksen açmak: bugün 2/37. "Sınırlı malzemeden sınırsız ürün" ancak
  eksen başına bir kaçış kapısıyla gerçek olur (emsal desen `FabricAxis`,
  `measurements.hpp:90-107` — enum + sürekli yüzde + `declared()`)
- `bundle_fresh_check` damgası bir İDDİA: artefaktı elle düzenleyip damgayı
  bırakmak kapıyı yeşil bırakır; kapı artefaktın kendi özetini yeniden hesaplamalı
- `wasm_spec_honesty_check` varsayılanda `engine/dist/`'i (gitignore'lu) yargılıyor;
  temiz klonda dosya yok. Hakem commit'li `web/vendor` baytına karşı da koşturdu: 310/0
- `vocab_reference_check` başlık yorumu bir yeniden-kesme geride (10416 yazıyor,
  taban 10418)

## DAMLA'YA DÜŞEN (bloke etmez — hepsi varsayılanıyla yürüyor)
- **K-FN1** kol oyuğu bandı: taban beden mi, sekiz beden mi · varsayılan (A) · V7
- **K-V0A** `patterns_real/` 41 takipli telifli dosya · varsayılan (A) dokunma
- **K-V0B** `style_check` yeniden pinleme · varsayılan (A) kırmızı kalsın
- **K-V1A** golden mührü yenilendi — onaylıyor musun? 9651 satır taşındı; geri alma
  tek `git revert`. Varsayılan (A) YÜRÜDÜ. ★ Gözüne düşen sayı değil, yeni oyuk eğrisi
- **K-V1B** `figure_check`: bandeau'ya 4. sınıf mı, siluet düzeltmesi mi ·
  varsayılan (C) kırmızı kalsın · V4
- **K-V1C** kaynaksız 4 kolon: aranacak mı, atılacak mı · varsayılan (C) · V5
- **K-V2A** (yeni) **görü kafası yeniden eğitilecek mi?** `vision-student`
  sınıf sayısı büyüdü (neckline 7→9, skirtStyle 5→6); indeksler kaymadı, eski
  ağırlık dosyası sınıf sayısıyla uyuşmuyor. Varsayılan (A) yeniden eğitme,
  V6 ölçsün · V6
- **K-V2B** (yeni) **site `?v=136`'da donmuş, tarayıcı bayat motor servis
  edebilir.** Kök: bump 54 üretilmiş dosyayı elle düzenliyor ve bir kapıyı kırıyor.
  Varsayılan (A) deploy edilene kadar dokunma, kök çözüm V10'un kartı · V9/V10
