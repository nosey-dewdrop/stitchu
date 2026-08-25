# KART V6-A — ÖNCE ÖLÇÜMÜ (foto→spec isabeti, bugün, yeniden)

ETİKET: **PARALEL** · SÜRE TAVANI: **60 dk**

## NE
Foto→spec hattının BUGÜNKÜ isabetini KENDİN yeniden ölç (devralma yok) ve hata
sınıfı tablosuna **KONUM HATASI**'nı ayrı sınıf olarak EKLE. Onarım YOK: prompt,
şema, sözlük DEĞİŞTİRİLMEZ. Bu kartın çıktısı "ÖNCE" sayısıdır.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md` · `RULES.md`
- `engine/tools/foto-spec-olcum.mjs` (ölçüm aleti)
- `vision/eval/labels.json` · `vision/eval/live-2026-08-22.json`
  · `vision/eval/opus-predictions.json` · `vision/eval/siglip-predictions.json`
  · `vision/eval/clip-predictions.json` · `vision/eval/live-baseline-oldprompt.json`
- `vision/eval.js` · `vision/live-eval-score.py`
- `contract/terms.json` · `dataset/vocab-canonical.json`
- `contract/garment-spec-v2.json`

## YAPILACAKLAR (sırayla, her sayının yanında KOMUT)
1. `node engine/tools/foto-spec-olcum.mjs --offline` koş. Banka tarih damgalıysa
   ve boş `FOTO 0` basıyorsa: alete **`--bank <yol>` bayrağı EKLE** (tek küçük
   değişiklik, ölçümü tekrar edilebilir kılar; sahte tarihli dosya bırakma).
   Sonra `--bank vision/eval/live-2026-08-22.json` ile koş.
2. TAM DOĞRU SPEC oranı + ALAN YARGISI oranı + paydayı bas. Payda 5'ten büyük
   yapılamıyorsa sebebini yaz (ücretli çağrı = §5.3 veto, tahmin etme).
3. Diğer üç tahmin dosyasını da `node vision/eval.js <dosya>` ile puanla; tablo.
4. **HATA SINIFLARI**: GORME · KELIME · MOTOR **+ KONUM**. KONUM sınıfı tanımı:
   göz etiketi bir yapı elemanının YERİNİ söylüyor ("at hip", "front neck",
   "empire waist", "back") ama üretilen spec o yeri hiçbir alanda taşımıyor.
   `outOfVocab` serbest kanalındaki 26 terimi bu tanımla tara ve KAÇININ konum
   ibaresi taşıdığını SAY. Aleti bu sınıfı basacak şekilde genişlet.
5. `contract/terms.json` ve `dataset/vocab-canonical.json` **iki ayrı sicil**:
   26 terimi İKİSİNE de sor; 26/26 sayısı hangi sicille değişiyor mu — ölç.
6. v2 ifade edilebilirliği: 68 fotoluk `live-baseline-oldprompt.json`'u
   `contract/garment-spec-v2.json` topolojisine vurup ifade edilebilir oranını
   ve `sleeve absent` yüzünden düşen sayıyı KENDİN yeniden bas (komut yaz).

## ÇIKTI
- `GECE/V6-A.md` — tablo(lar), her sayının yanında onu basan komut.
- `GECE/log/V6-A.olcum.txt` — ham komut çıktıları (kopyala-yapıştır).
- Değişen alet: `engine/tools/foto-spec-olcum.mjs` (SADECE bu dosya).

## YASAKLAR
- `backend/worker.js`, `web/js/*`, `vision-student/*`, `engine/src/*`,
  `contract/*` DEĞİŞTİRİLMEZ (okumak serbest).
- Ücretli/canlı `/api/analyze` çağrısı YASAK. Model ağırlığı indirme YASAK
  (`vision/node_modules` yok, CLIP/SigLIP yeniden koşturulmaz).
- `patterns_real/` altına dokunma.
- "Baktım / doğru görünüyor" yasak (RULES 3): komut çıktısı ya da dosya yolu.
- Sayı devralma yasak: 0B'nin %20 / %92.2 / 26/26 / %36.8 sayılarını KOPYALAMA,
  kendi koşundan çıkar. Aynı çıkarsa "aynı çıktı" diye yaz.

## COMMIT
`git commit -- GECE/V6-A.md GECE/log/V6-A.olcum.txt engine/tools/foto-spec-olcum.mjs`
Başkasının dosyasını EKLEME; `git add -A` KULLANMA (paralel işçi var).
