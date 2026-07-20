# KALEM DİLİ GENELLEMESİ — PLAN (MIHENK-06/07/08 üç-ret sonrası)
> Damla emri 2026-07-20: kalem dilini TÜM siluetlere taşı, figür 38-beden kadın, wrap
> asimetrik surplice, üçü yeni dille yeniden. v1.1 tag'inin ÖNÜNDE, acele yok DOĞRU olsun.

## KÖK NEDEN (üç rette ortak)
Referans kalemin dili (_engine-full.mjs) band-top köprüsüyle SADECE babydoll'a taşınmış.
Prenses/wrap/gode üretim renderer'ın (render-garment-flat.mjs) KENDİ halfOutline yolundan
çiziliyor → (1) figür üçgen/huni (2) cetvel hem + geometri-değil-kumaş (3) wrap sahte surplice.

## ÖLÇÜLEN GAP (measured — kör tahmin değil)
Üretim units (U): shoulder 78, chest 74, waist 60, hip 76.
- waist/shoulder = **0.77** (bel nip VAR), hip/waist = **1.27** (kalça swell VAR).
- Ratio'lar aslında makul → sorun ORANLARDA değil, ÇİZİMİN nip'i VURGULAMAMASINDA:
  side-seam kontrol noktaları fazla yumuşak ("never a hard hourglass corner" yorumu) →
  nip çizilirken siliniyor, tube okuyor. Referans kalem nip'e daha sert commit ediyor.
- HEM: üretim düz Q-arc; referans hemPoints (dalgalı, drape-driven). Bu en görünür fark.
- DRAPE: üretim drapePlan var ama etek ink'i referanstan seyrek.

Referans EU38: shp 12.6 / bust 15.5 / emp(waist) 14.2 / ad 20.6; eX=emp·(1-waistNip),
hX=emp·((1-waistNip)+(skirtFull-1)) → nip + swell referansta parametrik ve daha belirgin.

## PLAN — 3 FAZ (risk sırasına göre, her faz golden+pin byte-identical kanıtı)

### G1 — FİGÜR S-EĞRİSİ VURGUSU (halfOutline side-seam)
Üretim halfOutline'ın side-seam + skirt segmentlerini referans figür grameriyle hizala:
- Bel nip'i daha belirgin çiz (kontrol noktalarını waistX'e daha sıkı çek, "soft taper"
  yorumunu kaldır) — omuz→bust→BEL(oyuk)→kalça(dolgun)→hem S'i net.
- `fitted` olmayan shift için bile hafif figür (tube değil, gövdeyi takip eden hafif nip).
- RİSK: bu outline TÜM siluetleri etkiler → golden CSV motor C++'tan gelir, flat golden'da
  DEĞİL (F2 dersi) → golden byte-identical KALIR; ama style_check pinleri (babydoll/lace)
  band-top yolundan gider, halfOutline'a girmez → pinler de byte-identical. DOĞRULA.

### G2 — DALGALI HEM + DRAPE PORTU (referans hemPoints/drapePlan üretime)
- Üretim etek hem'ini düz Q yerine hemPoints dalgasıyla çiz (referans dili).
- Drape ink yoğunluğunu referans regime'e çek (etek dökümü).
- RİSK: orta (hem geometrisi değişir ama opt-in değil — tüm dresslerin hem'i). golden
  etkilenmez (flat), pin band-top yolundan → etkilenmez. DOĞRULA + gusto hem_liveliness.

### G3 — WRAP ASİMETRİK SURPLICE (F3 hakkı)
- halfOutline'a wrap için asimetrik dal: bir yaka yarısı gerçek surplice V ile kesilir
  (sahte simetrik notch YOK), overlap gerçek sarma akışı (kesik dikiş izi değil).
- Mevcut spec.wrap interior treatment'i bu outline'la değişir (overlap artık outline'ın
  parçası, ayrı çizgi değil).
- RİSK: yüksek (mirror mantığı asimetriye açılır) → izole, sadece spec.wrap dalında.

### YENİDEN ÜRETİM
Üç mihenk (prenses/wrap/gode) yeni dille yeniden render → aynı ızgara formatı →
MIHENK-09/10/11 kuyruğa (yeni kartlar, eski reject'ler kapalı). gusto-lint + figure_ratio
(yeni ölçü adayı, taste-lexicon'da) ile ölçülür.

## MANDAL / DOĞRULAMA (her faz)
ctest 48/48 · golden byte-identical (flat golden'da değil, motor C++ dokunulmaz) ·
style_check pinler byte-identical (band-top yolu değişmez) · flat_render_lint (yeni outline
üretilebilir) · gusto-lint (figure/hem ölçüleri). Her faz ayrı commit, ayrı doğrulama.

## AÇIK SORU (Damla'ya — G1 başlamadan)
G1 halfOutline TÜM siluetlerin gövde konturunu değiştirir. İki yol:
(a) Üretim halfOutline'ı referans oranlarına ELDE çek (cerrahi, kontrollü, mevcut yapı korunur).
(b) Referans buildHalf'i band-top köprüsü gibi TÜM siluetlere köprüle (tek hakikat, ama
    referans band-top'a göre kurulu, kollu/prenses/gode formları referansta YOK → köprü
    büyük genişleme ister).
ÖNERİ: (a) — cerrahi, düşük risk, referans DİLİNİ oran oran taşır (Damla'nın F2 port
kararının aynısı: "parametre parametre port", kopya değil). (b) referansı baştan yazmak olur.
