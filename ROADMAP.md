# stitchu — YOL HARİTASI (ÖNERİ v2, 2026-07-29)

Durum: **AKTİF ÖNERİ — Damla "geliştir, her şeye varım" dedi; omurga kararı onunla teyit ediliyor.**
Onaylanınca tek plan kaynağı budur (CLAUDE.md buraya işaret eder; `flatten-research/FINDINGS.md` +
`reports/2026-07-29-endustri-arastirmasi.md` araştırma arşivi).

## HEDEF (değişmedi)
Prompt/fotoğraftan, Damla'nın onaylayacağı, DİKİLEBİLİR, endüstri-uyumlu couture kalıbı.
Valentina/Lectra ligi, Chanel/Dior zevki. Ürün Claude'dan, dünya Damla'dan.

## İKİ ARAŞTIRMA TURUNUN GETİRDİĞİ (kaynaklı, reports/2026-07-29)
1. **3B "flatten" DOĞRU sezgi ama tek başına çekirdek DEĞİL.** Harita analojisi geçerli: küre→düzlem
   imkânsız, kartograf projeksiyon seçer + haritayı KESER (interrupted projection). Pens/dikiş = o
   kesikler. Yani flatten ile dikiş-eşleme ZIT değil, AYNI kısıtlı problem.
2. **BUG yakalandı:** "dikişler eşit uzunlukta" YANLIŞ. Set-in kol kapağı, oyuktan KASITLI 3-4cm uzun,
   ease'le dikilir. Kural: **"eşit YA DA kurala göre kasıtlı-eased."**
3. **BATAKLIK yakalandı (aylar batırır):** 3B giysi YÜZEYİNİ sıfırdan üretmek. Dünya yüzeyi verili,
   giysi yüzeyi = gövde+ease+siluet+yerçekimi = TASARIM. En iyi laboratuvarlar bile geri çekiliyor
   (GarmentCode, ChatGarment: "kısıtsız, kendine geçen kumaş"). → yüzeyi ŞİMDİLİK GİRDİ al.
4. **PRE-DEFORMATION:** doğru 2B parça, giyilince hedefi ÜRETEN "dinlenme şekli"dir; yüzeyin düz
   açılımı değil (giysi yerçekimiyle dökülür). Geometri-only flatten yanlış haritayı tersler.
5. **ANİZOTROPİ:** kumaş warp/weft/bias'ta farklı esner; saf izometri yanlış fizik — pens miktarı
   kumaşa bağlı (KES/FAST). Kimse "bu kumaşa göre pens" ship'lemiyor.
6. **Kendi tuzağımız:** eski fit-defteri Buğra'yı motorun formül-sabitlerini tersine çevirerek "fit"
   etmiş = yasak "benziyor gibi". Yine de scye'de rms 15mm = **formül motorunun temsil tavanı.**
   Buğra curve-fit hedefi değil, BENCHMARK olur; benchmark açığı GİZLEMEZ, AÇIĞA ÇIKARIR.

## MOAT (wrapper testini geçen)
Deterministik **couture kalıp ÇÖZÜCÜSÜ**: kısıtlı bağlı düzleştirme + kumaş-anizotropili pens +
drape-inverse, hepsi satın alınan couture kalıbına karşı mm-benchmark'lı. LLM'i çıkar → benchmark'-
lanabilir geometri çözücüsü kalır. Neural rakipler dikilemez panel üretiyor; dikilebilirliği GARANTİ
eden tek deterministik motor = biz.

## MİMARİ
1. **VERİ MODELİ — parametrik yapım grafiği** (nokta=formül; Valentina `.val` mantığı). Pattern=çıktı.
2. **SEAM SOLVER (beyin/moat).** Paneller BİRLİKTE çözülür; paylaşılan kenarlar **eşit-YA-DA-eased**
   (cap-ease kural tablosu), pens-değeri korunur. **Sert kısıt** (herkes soft-penalty; sert = moat).
3. **DART ENGINE — anizotropili.** Pens = korunan şekillendirme; pivot/slash-spread; miktar kumaşa
   (warp/weft/bias, KES/FAST) bağlı. `flatten-research` kanıtı (pens=eğrilik, 41mm) teorik temel.
4. **DRAPE-INVERSE (fit oracle + rest-shape).** drape.cpp Verlet'i TERS koş: giyilince doğru dökülen
   dinlenme şeklini çöz; ileri koş = strain/tension haritası doğrulama.
5. **KESİK YERLEŞİMİ.** Eğrilik-güdümlü pens/dikiş = interrupted-projection kesikleri.
6. **3B ÖN-YÜZ (Damla'nın sezgisi — SIRALANMIŞ).** Gövde mesh + ease/siluet alanı → giysi yüzeyi →
   çözücü flatten eder. Omurga kanıtlanınca üstüne eklenir; şimdilik yüzey/blok GİRDİ.
7. **ENDÜSTRİ + GENERATİF.** DXF-AAMA + grade-rule; prompt/foto → grafik parametreleri (asla ölçmez).

## MEVCUT MOTORDAN NE KALIR (~%40, doğrulandı)
KAL: geometry.hpp (flattenCubic, pathLength, offsetOutline), dxf.cpp, nest.cpp, tech-pack, drape.cpp
Verlet (→ drape-inverse), cupseam.cpp. AT: formül-çizim beyni tek karar mercii olarak (seam solver'a tabi).
NOT: commit'siz set-in armscye işi = eski-yön yama; solver gelince gereksiz — Damla: revert (078fa47).

## GROUND TRUTH (elimizde, doğrulandı)
Satın alınmış Buğra: **Locket Top** (front-38 ring-trace + fit defteri var), Buttoned Corset Bustier,
Special Size XXS, bustier dress PDF'leri. Karşılaştırma aracı `patterns_real/tools/motor-vs-bugra.mjs`
+ `motor-locket-iou.mjs` var. EKSİK: set-in KOLLU satın alınmış kalıp (cap-ease testi için gerekli).

## MİLESTONE MERDİVENİ (her biri SERT kapılı; hakem = mm-metrik + son sözde Damla)
- **M0 — DÜRÜST BENCHMARK (açığı çıkaran).** Motorun DOĞAL çıktısı (sabit-fit ETMEDEN) vs Buğra
  ground-truth; artık BÖLGE-BÖLGE ayrışır (armscye / göğüs pensi / yan dikiş / yaka / cap-ease).
  Metrikler: seam-walk artığı mm (eased kural dahil), pens-intake mm, toplam ease mm, grade-nest.
  **Kapı:** Locket-38 için bölge-bazlı residual raporu üretilir; "kapanmayan bölge" = hedef katman.
  En küçük dilim: tek-pensli bodice ön+arka (+ sleeve verisi gelince set-in kol).
- **M1 — SEAM SOLVER (moat).** Kısıtlı bağlı çözüm; kenarlar eşit-ya-da-eased. **Kapı:** iki komşu
  parça (armscye ↔ kol kapağı) kurala göre yürür (<0.5mm eşit dikiş, kap ease'i kural-doğru), gerçek
  kalıba karşı, bayt-deterministik.
- **M2 — DART ENGINE (anizotropili koruma).** Pens=korunan miktar, kumaşa bağlı. **Kapı:** göğüs
  pensini taşı — apeks+toplam korunur; farklı kumaş → farklı intake; seam-walk hâlâ geçer.
- **M3 — DRAPE-INVERSE + EASE.** Rest-shape çöz; tasarım vs giyim ease bağımsız. **Kapı:** çözülen
  parça giyilince strain<eşik sarılır; bilerek bozuk dikiş yüksek strain görünür.
- **M4 — PARAMETRİK GRAFİK + INTERCHANGE.** Nokta=formül; DXF-AAMA + grade-rule. **Kapı:** bir grafik
  → 2 gövde → 2 doğru kalıp; grade nest EU34-52; Valentina/Seamly2D'de açılır.
- **M5 — 3B ÖN-YÜZ (yüzey authoring, sıralanmış).** Gövde mesh + ease alanı → giysi yüzeyi → çözücü.
  **Kapı:** ölçüden üretilen yüzey, çözücüden geçince gerçek kalıba mm-yakın.
- **M6 — STYLE + GENERATİF.** Prompt/foto → grafik parametreleri; hepsi solver+validator geçer.
  **Kapı:** Damla'nın tek prompt'u → 3 dikilebilir tasarım, zevk kapısı.
- **M7 — COUTURE ÇITASI + TAM GİYSİ.** Bodice+etek+kol paylaşılan çözülmüş dikişten; Lectra round-trip.
  **Kapı:** 2 Buğra kalıbı couture toleransında yeniden üretilir; Damla evet.

## LOOP
yap → ölç (kapı metriği) → reports/'e kanıt → geçemezse TEK değişken tekrar. 3 tur iyileşme yoksa DUR,
Damla'ya çık. Ucuz Python'da kanıtla → C++'a taşı. Kapı geçince commit+push+kanıt.

## AÇIK KARAR (Damla)
Omurga = deterministik çözücü; 3B-yüzey authoring SIRALANDI (kanıtlanmış omurga üstüne), küre hayali
ölmüyor. Onay → M0 dürüst benchmark'ı kuruyorum. Blokör: cap-ease testi için set-in kollu bir Buğra
kalıbı — sende var mı, yoksa ben mi bulayım?
