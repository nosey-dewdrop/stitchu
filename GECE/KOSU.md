# KOSU.md — v6 gece koşusu (24 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. v5 koşusunun kayıtları GECE/arsiv/v5-kosusu/
altındadır ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V4 KAPANDI** (flat konvansiyonu: kapı artık düzeltmeye çalıştığı kusuru
varsaymıyor; kalem farklı kol istendiğinde farklı kol çiziyor). Sıradaki V5
(dikilebilirlik). Son yeşil commit: yok — HEAD'de 6 kırmızı (4 MİRAS + V3'ün
kendi 2 kapısı). V4 bir yeni ad doğurdu ve AYNI GECE taban kesmeden kapattı.
Hakem önce **KALDI** (iki ölçülmüş gerekçe), V4-E düzeltince **GEÇTİ**.
V4'ün ölçtüğü ağaç: `b09c151..4110ca0`. Açılış ağacı: `b197ccf`.

## KAPANMIŞ FAZLAR
- **V0** — 7 kart, 6 alt kapı yeşil, 4.7 önce KALDI sonra 0F ile GEÇTİ. `GECE/V0.md`
- **V1** — 5 kart + 1 düzeltme turu. Hakem önce **KALDI** (tanık cümlesi
  UYDURMAYDI), `05156a1` düzeltince GEÇTİ. Kırmızı 6→4. `GECE/V1.md`
- **V2** — DEVRALINDI (§3.10). 6 kart. **3 yeni kapı**, test 105→108.
  4.3 önce 6 kırmızı buldu → V2-D → 4. Hakem GEÇTİ. `GECE/V2.md`
- **V3** — 6 kart. **Kabuk yayınlandı: flat dış konturu ÇİZİLMİYOR, kalıbın
  beslendiği AYNI `GarmentSurf`'ten HESAPLANIYOR.** 2 yeni kapı, test 108→110.
  Hakem GEÇTİ. `GECE/V3.md`
- **V4** — 7 kart (R‖K‖C paralel → A → B → D → E düzeltme turu). **Sessiz
  çökertme kapıya bağlandı** (`flat_expresses_spec_check`, test 110→111) ve
  croquis çıkarımı kökten düzeltildi. Hakem KALDI→GEÇTİ (iki AYRI oturum).
  Tutanak: `GECE/V4.md` · İşçiler: `V4-{R,K,C,A,B,D,E}.md`

## AÇIK KIRMIZILAR (6 — ad · nerede · sayı · 4.7 adayı)
1. `style_check` — `engine/STYLE-PIN` diskte YOK · kapsam **0/31** · aday
   `repin-style.sh`; darboğaz **31 kez GÖZ**
2. `sizechart_source_check` — `contract/tables.json` · 7 kolonun **4'ü
   UNSOURCED** · iki birincil tablo ölçüldü, **dördü de BAĞLANAMAZ**; aday: AT
3. `contract_check` — `git ls-files patterns_real` = **41** takipli telifli
   dosya · aday V0'da ölçüldü (untrack → `GREEN, exit=0`) ama Damla kararı
4. `figure_check` — `dress_bandeau_circle` 31 stilin tek `fittedBand`'i · iki
   ölçülmüş aday: 4. bant `[0.84,0.90]` ya da siluet düzeltmesi (oran 0.820)
   ⚠ V4'e kart olarak yazılmıştı, KESİLMEDİ (kartlar K-V3B'ye gitti)
5. `flat_pattern_agree_check` (V3) — `body_length` flat 757.5584 vs kalıp
   728.7870mm = **−%3.7979** (tolerans %1.5) + **UNMEASURED 3/6**.
   KÖK: sevk edilen kalıp **strapless**, kabuk omuz halkasından başlıyor = G5.
   V4 ÖLÇMEDİ, olduğu gibi devrediyor. Kalan iş V7'nin kartı.
6. `flat_artifact_census` (V3) — sınıf 3, 2 nokta, **20.5602° > 1°**, belde.
   KÖK: `surfacepattern.cpp:71-81`, `skimBaseH`'de teğet koşulsuz buluşuyor
   = V köşesi. ÖLÇÜLDÜ VE REDDEDİLDİ: kalça emsali kırığı 0.4582°'ye
   indiriyor ama bel **+36.12mm** bozuluyor, 4 kapı kırmızıya dönüyor
   (`GECE/log/V3-D.waistblend.rejected.txt`). İki aday ÖLÇÜLMEDİ.
   ⚠ V4: bu kapının C1 ölçüsü ÖRNEKLEME ADIMINA bağlı (4mm adımda R≈79mm
   meşru eğri 2.9°) — eşik/adım ilişkisi ölçülmeli.

KAPANAN (V1): `golden_check` · `recipe_dress_check`. (V0): `bundle_fresh_check`.
AÇILIP AYNI GECE KAPATILAN — V2: `bundle_fresh_check` · `vocab_reference_check`
· `generated_ratchet_check`. V3: aynı ilk ikisi. **V4: `vocab_reference_check`**
(+6, altısı da yeni `flat-board.mjs`'ten; referans KALDIRILDI, taban KESİLMEDİ).

## DEVİR ÜÇ SAYI (V5'e)
1. **KIRMIZI = 6 · TEST = 111.** V4 kendi ölçtü: öncesi 110/6, sonrası 111/6,
   **AD kümesi birebir aynı** (`GECE/log/V4-E.reddiff.txt` BOŞ). RULES 9 ihlali
   yok. Log: `GECE/log/V4.ctest.before.txt` → `GECE/log/V4-E.ctest.after.txt`
2. **SÖZLÜK TABANI = 10438 referans @ `495d58a` · RATCHET KİLİTLİ, YEŞİL.**
   V4 tabanı KESMEDİ; bugünkü ağaç tabanın ALTINDA (kol 351→347, yaka 81→80).
   Sayı yalnız DÜŞEBİLİR. ⚠ Kapı DÜZ METİN sayıyor: bir ekseni yorumda anmak
   ile ona referans vermek ayırt edilemiyor, bu gece iki kez kapıyı kırdı.
3. **İFADE RATCHET = 5 UNEXPRESSED · TAVAN KİLİTLİ** — kol **0/8** ·
   yaka **4/7** [shirt·mock·flat·crescent] · omuz **1/3** [dropped].
   Kapı `engine/tests/flat_expresses_spec_check.mjs`; değer alanı ELLE
   YAZILMIYOR, beş kaynaktan türetiliyor ve türetme faz-öncesi ağaçta AYNI
   alanı veriyor (hakem doğruladı). Sayı yalnız DÜŞEBİLİR.
   ⚠ (a) Ratchet SAYIYI tavanlıyor, ALANI değil: değeri sözlükten silmek
   sayıyı düşürüyor ve kapı yeşil kalıyor — kapatılmalı. (b) Tanınmayan değer
   hâlâ ÇİZİLİYOR (`kimono`·`dolman`·`flutter`·`bell`·`batwing` = `straight`
   ile özdeş, 2705.08u), yalnız `:unknown` damgası var = etiketli çökertme;
   RULES inv. 1'in AÇIK REDDİ kurulmadı. (c) V3'ün 3. sayısı (tek nesne)
   V4'te ÖLÇÜLMEDİ; V2'nin 3. sayısı (sürekli eksen 2/37) V3'te de V4'te de.

## ★ V4'ÜN DÜRÜST SINIRI (bir sonraki flat fazının 1. KARTI)
**Bu gecenin düzeltmeleri SEVK EDİLEN yüzeye ULAŞMIYOR.** ESKİ|YENİ panosunun
10 stil hücresinin **10'u da bayt bayt AYNI** (`cmp`, iki hakem doğruladı):
9 stilin 9'u SALT-OKUNUR referans kaleme düşüyor (`_engine-full.mjs
renderStyle`, `renderGarmentFlatAsync:1120 tryReferencePen`) ve
`web/atolye.html` o kalemi gömülü taşıyor. Kanunun bağladığı ÜRETİM kalemi
canlı hiçbir sayfayı basmıyor; referans kalem 31 stilin **0'ında** ölçek
beyan ediyor. → KART: kanunu SEVK EDİLEN kaleme bağla.

## TABAN BANTLARI (§4.1 — sessizce aşılamaz)
`draftJSON` medyan **1.030 ms** (p95 1.107) · `gradeJSON` EU34→48 **8.198 ms** ·
5000 soak SURVIVED · native↔wasm en kötü **1e-4 mm** · çağrı yolu **main thread**
→ Worker refaktörü KUYRUK KARTI. Alet `engine/tools/wasm-baseline.mjs`.
⚠ Alet sayı ne olursa olsun **exit 0** dönüyor; V2-D'nin ölçülmüş adayı:
5 koşunun EN DÜŞÜK MEDYANI + tavan aşılınca exit 1 + ctest'e bağla.
EŞİKLER: C1 **1.0°** = McNeel Rhino (V3) · uyum **%1.5 KARARDAN**, yayın YOK ·
çizgi kalınlığı sapması **±0,1d = %22.22** = ISO 128-2:2020 md.5.2 (V4).
V4 wasm paritesi BOŞ geçti: `git diff c396fb4..HEAD -- engine/src web/` = boş.

## SONRAKİ FAZLARIN HAZIR GİRDİSİ
- V5 ← `GECE/V1-R.md` (dört kolon BAĞLANAMAZ) **+ V3:** `pattern-measure.mjs`
  0.05mm adımla ölçüyor **+ V4:** `GECE/V4-R.md`'nin 8 eşiğinden yalnız 2'si
  kapıya bağlandı; ISO 128-3 md.4.12 callout'un MEKANİK tanımı hazır (bugün 0)
- V6 ← `GECE/V0-0B.md` **+ V4:** `raglan` dört sözleşmede OMUZ ekseninde
  (kalem kol sanıyordu); `cap` iki sözleşmede çelişiyor;
  `mandarin`/`notched`/`sailor` sayısal karşılığı YOK
- V7 ← `52ae85c`'nin tavanı **+ V3: G5 SAYIYLA KİLİTLİ** **+ V4:** kol
  ratchet 0/8, ama `straight`≡`set` ve 5 değer etiketli çökertme
- V9/V10 ← `GECE/V0-0C.md` (1248 iddia) **+ V2:** `?v` **136'da donmuş**
  **+ V4:** kâtip 8 bayat cümle düzeltti (`a3e5145`), docs/ARCHITECTURE §12

## KUYRUKTAKİ KART TASLAKLARI (tamamı + gerekçe: `GECE/V4.md` §5-§6)
- ★ Kanunu SEVK EDİLEN kaleme bağla (yukarıdaki dürüst sınır) — EN ÖNCELİKLİ
- İfade ratchet'i ALANA da bağla (değer silerek sayı düşürmek kapatılmalı) ·
  tanınmayan değer için AÇIK RED (engel ölçülü: `flat_geometry_sellable_check`
  kollu stilin kolu ÇİZMESİNİ şart koşuyor) · detay callout ÜRETİMİ (bugün 0)
- `vocab_reference_check` yorum ile referansı ayırt etsin · `flat-board.mjs`
  `FARK VAR` basıyor ama exit koduna bağlı DEĞİL (bedava regresyon kapısı)
- Sürekli eksen açmak: 2/37 · `bundle_fresh_check` damgası bir İDDİA ·
  `buildGarmentSurf`/`buildSheathPattern` `levelHeight`'ı ayrı ayrı okuyor
- ★ V4 ölçtü: `shell-flat` ön paneli = arka paneli **0.000000000 mm** —
  arkada olay YOK, ayna kopyası
- `h3b-rings.py` temiz makinede koşmuyor · 8 bedenin 7'sinde artefakt sayımı
  YAPILMADI (V3 de V4 de yalnız EU38) · `waistY`·`chestY`·`shoulderSlope 0.32`
  hâlâ `source: ACIK` · `peterpan_puff` adı ÜST, çıktı ETEKLİ
- Stil kümesi dört ayrı sayı (pano 9 · konvansiyon 8 · geometri 5 · referans
  31); hangi stilin hangi kapıya girdiğini söyleyen tek liste YOK
- ~~`flat_geometry_sellable_check` 10 panelde ihlal basıyor~~ V4-A'dan sonra
  `PASS — 0 ihlal` (yan kazanç, S1 açık kalemi kapandı)

## DAMLA'YA DÜŞEN (bloke etmez — hepsi varsayılanıyla yürüyor)
- **K-FN1** kol oyuğu bandı (A) · V7 — **K-V0A** `patterns_real/` 41 takipli
  telifli dosya (A) dokunma — **K-V0B** `style_check` pinleme (A) kırmızı kalsın
- **K-V1A** golden mührü yenilendi, onaylıyor musun? geri alma tek `git revert`
- **K-V1B** `figure_check`: 4. sınıf mı, siluet düzeltmesi mi (C)
  ⚠ V4'e yazılmıştı, KESİLMEDİ · V5/V7 — **K-V1C** kaynaksız 4 kolon (C) · V5
- **K-V2A** görü kafası yeniden eğitilsin mi? (A) · V6 — **K-V2B** site
  `?v=136`'da donmuş (A) · V9/V10
- **K-V3A** beldeki 20.56° teğet kırığı kapatılsın mı? **(A)** kırık kalsın,
  iki ölçülmemiş aday denensin · V5
- ~~**K-V3B** flat'in kaynağı hangisi?~~ **V4'TE ÖLÇÜLDÜ VE KAPANDI:** kapı
  HAT-2'yi (çizim kalemi) yargılar, HAT-1 rapor satırı (bel 25.0mm ·
  göğüs 9.66mm). Bedeli sayıyla `GECE/V4.md` §1.3.
- **K-V4A** (yeni) **ZEVK HÜKMÜ SENİN**: ESKİ|YENİ panosu
  `GECE/log/V4-D.pano/board-eski-yeni-{1,2,3}.png`. ⚠ 10 stil hücresi ESKİ ile
  bayt bayt AYNI (sebep yukarıda); tek görünen fark **3. sayfadaki kol ailesi**.
  (A) devam · (B) kalem revizyonu iste · **(A)** · bloke etmez
- **K-V4B** (yeni) **`data-scale="1:3"` ISO 5455 izinli dizisinde YOK** (yalnız
  1:2/1:5/1:10). Meşru dayanak md.5.1 NOTU "intermediate scales". (A) 1:3
  kalsın + contract'a "ISO ara ölçeği" beyanı eklensin · (B) ISO dizisine geç
  (croquis yeniden ölçeklenir) · **(A)** · V5
- **K-V4C** (yeni) **tanınmayan kol/yaka değeri ÇİZİLSİN Mİ, REDDEDİLSİN Mİ?**
  Bugün etiketli çökertme (`:unknown` damgası + `straight` çizimi). Açık red
  RULES inv. 1'in tam karşılığı ama `flat_geometry_sellable_check`'i kırıyor
  (ölçüldü). (A) damga kalsın, ratchet düşsün · (B) açık red · **(A)** · V5
