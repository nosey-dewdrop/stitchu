# KART V7-F — SİCİL↔ARTEFAKT ÇELİŞKİSİ: `sleeve` ABSENT AMA MOTOR KOL BASIYOR

ETİKET: PARALEL (V7-C, V7-E ile aynı anda; dosya kesişimi YOK — sen yalnız
`contract/` ve `GECE/V7-F.md` yazarsın)
SÜRE TAVANI: 50 dk

## ÖLÇÜLMÜŞ ZEMİN (tekrar ölçme, üstüne inşa et)
- `contract/garment-spec-v2.json:96` → `sleeve` **status=absent**, `binds=null`,
  `blockedBy=shoulderSeam`.
- AMA sevk edilen motor kol ÇİZİYOR: `engine/src/sleeve.cpp SleeveBlock::draft`,
  `engine/src/garment.cpp:303,:621` üzerinden; `engine/vocab.json:9-10`'da
  sekiz kol değeri (4 kanonik + 4 beyanlı eşanlam) tanımlı ve takipli 169
  JSON'da kullanım: `straight 237 · none 140 · balloon 35 · cap 29`.
- Foto damarının **%50'si SIRF `sleeve` absent olduğu için** v2 sözleşmesinde
  ifade edilemiyor (`GECE/V0-0B.md`); `sleeve` tek engel olarak 68 alanın
  19'unu (%27.9) düşürüyor.
- Yani sicil bir motoru, artefakt başka bir motoru anlatıyor. **KARARA
  BAĞLANMAMIŞ** (V6'dan devir).

## NE
Çelişkiyi ÖLÇEREK karara bağla. Sırayla:

**1. ÖLÇ.** `sleeve` operatörünün `absent` olma gerekçesi (`blockedBy=shoulderSeam`)
BUGÜN geçerli mi? `shoulderSeam` operatörünün sicildeki durumu ne? Sevk edilen
motor kolu omuz dikişi olmadan mı çiziyor? Komut çıktısıyla göster.

**2. KARAR VER, KANITLA.** İki yoldan birini ÖLÇÜMLE seç:
 - **(A) sicil düzeltilir:** `sleeve` gerçekten çiziliyorsa status `absent`
   değil, çizilen alanlara BAĞLI (`binds`) hâle getirilir. Bunu yaparken
   `binds` alanları UYDURULMAZ — sevk edilen motorun GERÇEKTEN okuduğu spec
   alanlarından (kod okuyarak, dosya:satır ile) türetilir.
 - **(B) sicil doğrudur, artefakt yanıltıyor:** motorun bastığı kol sicilin
   tanımladığı operatör DEĞİLDİR; bunu kanıtla ve çelişkiyi sicile bir
   ŞERH olarak yaz.
Hangisini seçtiysen gerekçe dosya:satır + komut çıktısıyla olacak.

**3. SİCİLİN BEKÇİSİ.** Sicili doğrulayan bir kapı var mı (`contract_check`,
`vocab_source_check`, `vocab_reference_check`)? Değişikliğin bu kapılardan
GEÇTİĞİNİ göster — ilgili testleri TEK TEK koş (tam ctest BAŞLATMA):
`ctest --test-dir engine/build -R 'contract_check|vocab_source_check|vocab_reference_check' --output-on-failure`
Çıktıyı `GECE/log/V7-F.gate.txt`'ye yaz.
⚠ `contract_check` ZATEN KIRMIZI (miras, 41 takipli telifli dosya yüzünden) —
onu YEŞİLE ÇEVİRMEK senin işin DEĞİL, ama **daha da kötüleştirmeyeceksin**.

**4. İFADE ETKİSİNİ ÖLÇ.** Değişiklikten sonra v2 ifade edilebilirliği
kımıldadı mı? `GECE/V0-0B.md`'nin kullandığı ölçüm aletini bul (`engine/tools/`
ya da `vision/` altında — ÖNCE GREP) ve ÖNCE/SONRA sayısını bas. Alet yoksa
"alet YOK, ölçülemedi" yaz — uydurma sayı YASAK.

## ÇIKTI
- `contract/` altında değişen dosya(lar) — ya da (B) seçildiyse şerh.
- `GECE/V7-F.md`: 1..4 başlıklarıyla, her cevap dosya:satır + komut + çıktı.
- `GECE/log/V7-F.gate.txt`

Bittiğinde KENDİN commit et (push etme):
`git add contract/ GECE/V7-F.md GECE/log/V7-F.gate.txt && git commit -m "v7-f: resolve the registry-vs-artifact contradiction for the sleeve operator"`

## YASAKLAR
- `engine/src/`, `engine/wasm/`, `engine/tests/`, `web/` — HİÇBİRİNE dokunma.
- Mevcut testleri gevşetme, tolerans oynatma, baseline kesme.
- `GECE/KOSU.md`, `GECE-KOSUSU-v6.md`, başka kartlar: AÇMA.
- Tam `ctest` koşusu BAŞLATMA (paralel işçi var).
- Ölçmediğin hiçbir alanı `binds`'a yazma.

## RAPOR FORMATI
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
