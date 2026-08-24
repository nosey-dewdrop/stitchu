# KOSU.md — v6 gece koşusu (24 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. v5 koşusunun kayıtları GECE/arsiv/v5-kosusu/
altındadır ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V1 KAPANDI** (pin ve kaynak temizliği). Sıradaki V2 (mutfak: sözlük reformu).
Son yeşil commit: yok — HEAD'de 4 kırmızı var, dördü de MİRAS ve dördü de sınıf
(c) kaynak/karar eksiği. V1 hiçbir yeni kırmızı ad doğurmadı.
V1'in ölçtüğü ağaç: `cc6d86a..HEAD`. Açılış ağacı: `b197ccf`.

## KAPANMIŞ FAZLAR
- **V0** — 7 kart (0R/0A/0B/0C/0D/0E paralel + 0F sıralı), 6 alt kapı yeşil,
  4.7 önce KALDI sonra 0F ile GEÇTİ. Tutanak: `GECE/V0.md`
- **V1** — 5 kart (R sıralı → B/D/E paralel → A sıralı) + 1 düzeltme turu.
  Hakem önce **KALDI** verdi (mührü savunan tanık cümlesi UYDURMAYDI), `05156a1`
  düzeltince GEÇTİ. **Kırmızı 6→4, yeni ad 0.** Tutanak: `GECE/V1.md`
  · Sınıf hükmü: `GECE/V1-SINIF.md` · Araştırma: `GECE/V1-R.md` · Kapı: `GECE/KAPI.md`

## AÇIK KIRMIZILAR (4 — ad · nerede · sayı · 4.7 adayı)
1. `style_check` — `engine/STYLE-PIN` diskte YOK · kapsam **0/31** ·
   kapı `513b175`'te GERÇEK KAPI oldu (kısmi pinleme artık yeşil sayılmıyor,
   mutasyon M8 kanıtlı). Aday koşulabilir: `repin-style.sh`; darboğaz **31 kez GÖZ**
2. `sizechart_source_check` — `contract/tables.json` · 7 kolonun **4'ü UNSOURCED**
   · R-kartı iki birincil tabloyu ölçtü, **dördü de BAĞLANAMAZ**; aday: kolonları AT
3. `contract_check` — `git ls-files patterns_real` = **41** takipli telifli dosya
   · aday V0'da ölçüldü (untrack → `GREEN, exit=0`) ama Damla kararı
4. `figure_check` — `dress_bandeau_circle` 31 stilin tek `fittedBand`'i ·
   kardeş YOK, **tabloyla kanıtlandı** (kesişim boş) · iki ölçülmüş aday: 4. bant
   `[0.84,0.90]` ya da siluet düzeltmesi (oran 0.820, pin bile gerekmez)

KAPANAN (V1): `golden_check` · `recipe_dress_check` — tek kök `52ae85c`, ikisi de
düştü. KAPANAN (V0): `bundle_fresh_check`. **AÇILAN YENİ AD: 0.**

## DEVİR ÜÇ SAYI (V2'ye)
1. **KIRMIZI = 4** — dördü de sınıf (c) kaynak/karar eksiği, **sıfır gerileme**,
   sıfır mühendislik kusuru. Dördü de DAMLA-KUYRUK'ta varsayılanıyla yürüyor.
   Log: `GECE/log/V1.ctest.before.txt` → `GECE/log/V1-A.ctest.after.txt`
2. **GOLDEN MÜHRÜ TAŞINDI = 9651 satır / %41.23 / max 62.7764 mm** — gövde+kol
   hattında, etek 0.0001 mm (kımıldamadı). Bundan sonraki her faz bu YENİ mühre
   karşı ölçülür. md5 `d5b5f28b2ef41a776b14699e9220982a`. Onay K-V1A'da bekliyor.
3. **STYLE PİN KAPSAMI = 0/31** — kapı artık kısmi pinlemeyi yeşil saymıyor;
   kapatan tek yol Damla'nın gözü (render 0.05 sn × 31, darboğaz GÖZ)

## TABAN BANTLARI (§4.1 — sessizce aşılamaz)
`draftJSON` medyan **1.031 ms** (p95 1.338) · `gradeJSON` EU34→48 **8.800 ms** ·
5000 soak SURVIVED, external delta 0.00 MB · native↔wasm en kötü **1e-4 mm** ·
çağrı yolu **main thread**, Worker yok → Worker refaktörü KUYRUK KARTI, kapı değil.
Alet: `engine/tools/wasm-baseline.mjs`. V1 bunlara dokunmadı; wasm yeniden
derlendi (`build-wasm.sh` exit 0) ve iki parite testi de yeşil.

## SONRAKİ FAZLARIN HAZIR GİRDİSİ
- V2 ← `GECE/V0-0D.md` (37 eksen / 132 değer / 7524 referans tabanı; sevk
  edilen taraf MENÜ; `bindings.cpp:94` sessiz int ikamesi)
  **+ V1'den yeni kart:** `scye` opunun 8 JSON katsayısı `recipe_dress_check.cpp:124-154`
  K0 sabit-parite mandalında YOK; dosyanın `:3` başlığındaki "every recipe const ==
  its motor counterpart" bugün YANLIŞ, 6 sabit de ölü latch (hakem bulgusu)
- V4 ← `figure_check`'in iki adayı (K-V1B); `figure-bands.json`'un kendi
  gerekçesindeki "%27 dar" cümlesi ÇÜRÜDÜ, gerçek fark **%5.9** (yanlış landmark)
- V5 ← `GECE/V1-R.md` (dört kolon BAĞLANAMAZ + 5 erişilemeyen yayının künyesi;
  ★ kapının KENDİ zayıflığı ölçüldü: "yayın var mı"yı değil "`_sources` kendi
  kendisiyle tutarlı mı"yı ölçüyor)
- V6 ← `GECE/V0-0B.md` (foto→spec: 5 fotoda 1 tam doğru; hata sınıfı GÖRME %100;
  kelime listesi ELLE yazılmış `vision-student/vocab.py:17`)
- V7 ← `52ae85c`'nin ilan ettiği tavan: *"tek kübik gerçek scye'nin S kavisini
  çizemiyor"*, sonraki aday "oyuğu çentikten iki kübiğe ayır"
- V9/V10 ← `GECE/V0-0C.md` (1248 iddia: doğru 14 / YALAN 12 / kanıtsız 15)
  **+ V1'den:** `docs/ARCHITECTURE.md:39-41`, `README.md:15,17,18,42` hâlâ
  duran-iddia taşıyor ("8 ctest suites", "worst pair 0.00 mm", "0 failures")

## DAMLA'YA DÜŞEN (bloke etmez — hepsi varsayılanıyla yürüyor)
- **K-FN1** kol oyuğu bandı: taban beden mi, sekiz beden mi · varsayılan (A) · V7
- **K-V0A** `patterns_real/` 41 takipli telifli dosya · varsayılan (A) dokunma
- **K-V0B** `style_check` yeniden pinleme · varsayılan (A) kırmızı kalsın ·
  V1 notu: kapı artık gerçek kapı, kapsam 0/31
- **K-V1A** (yeni) **golden mührü yenilendi — onaylıyor musun?** 9651 satır
  taşındı; geri alma tek `git revert`, tek dosya. Varsayılan (A) YÜRÜDÜ.
  ★ Gözüne düşen sayı değil, **yeni oyuk eğrisi**.
- **K-V1B** (yeni) `figure_check`: bandeau'ya 4. sınıf mı, siluet düzeltmesi mi ·
  varsayılan (C) kırmızı kalsın · V4
- **K-V1C** (yeni) kaynaksız 4 kolon: aranacak mı, atılacak mı · varsayılan (C) · V5
