# KART V10-J — TÜRKÇE YALAN + BOZUK CÜMLE + KIRMIZI ÜRETEÇ (etiket: SIRALI, 1/2)

## NE
`landing_truth_check`'in Türkçe kalıp listesini hakemin ADIYLA yazdığı iki eksik
kalıpla tamamla, çıkan ihlalleri `web/` içinde süpür, mekanik değiştirmenin
bozduğu İngilizce cümleleri onar, ve el düzenlemesiyle KIRMIZIYA düşen
`generated_ratchet_check`'i üreteci koşturarak yeşile döndür.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `engine/tests/landing_truth_check.mjs` (L2 `BANNED` listesi, satır 265-287)
- `engine/tests/generated_ratchet_check.sh`, `contract/generated-paths.sha256`
- `engine/tools/gen-collection-pattern.mjs` (satır 371 ZATEN DOĞRU: `data-tr="Bunu sabit bir bedende çiz, ücretsiz."`)
- `web/collections/*.html` (16 dosya), `web/patches.html`, `web/patches/2-10.html`,
  `web/patches/3-20.html`, `web/styles/open-back.html`
- `web/js/shared-header.js` (satır 20 — `data-tr` neden CANLI metin)

## ÖLÇÜLMÜŞ ZEMİN (şef ölçtü, doğrula, güvenme)
1. `grep -roc "ölçülerine göre" web/` → **16 dosya, 16 hit**, hepsi
   `web/collections/*.html` içinde ve hepsi AYNI satır:
   `data-en="Draft this in a fixed size, free." data-tr="Bunu ölçülerine göre çiz, ücretsiz."`
   → EN "sabit beden" derken TR "ölçülerine göre" diyor. **İki dil çelişiyor,
   Türkçesi MTM YALANI ve YAYINDA.**
2. Üreteç `gen-collection-pattern.mjs:371` ZATEN onarılmış; **16 sayfa yeniden
   üretilmemiş.** Bu yüzden `bash engine/tests/generated_ratchet_check.sh`
   bugün **EXIT 1 · FAIL bytes 16** — miras kırmızı AD kümesine YENİ AD
   ekleniyor (RULES §9 ihlali, `GECE/log/V10.ctest.final.txt` bu adı taşımıyor).
3. `grep -roc "unchanged under golden_check to" web/` → **12 hit / 4 dosya**:
   `patches.html` 4 · `patches/2-10.html` 2 · `patches/3-20.html` 2 ·
   `styles/open-back.html` 4. Bunlar mekanik `byte-identical` → `unchanged under
   golden_check` değiştirmesinin bozduğu cümleler; İngilizcesi GRAMER OLARAK
   BOZUK ("unchanged under golden_check **to** the live web build").
4. `grep -roc "kişiye özel" web/` → **0**. Kalıp yine de EKLENİR (hakem adıyla istedi).

## YAPILACAK
### 1) KAPI — sadece EKLEME
`BANNED` listesine iki kalıp EKLE (mevcut hiçbir kalıbı SİLME/GEVŞETME):
- `['ölçülerine göre (TR)', /ölçüler(?:in|iniz)e göre/gi]` — mevcut
  `ölçüleriniz[a-zçğıöşü]* göre` kalıbı 3. tekil `ölçülerine göre`yi KAÇIRIYOR,
  ölç ve doğrula.
- `['kişiye özel (TR)', /kişiye özel/gi]`
Kalıbın ÜSTÜNE tek satırlık yorum: neden eklendiği + hakemin ölçtüğü sayı.

### 2) SÜPÜRGE — 16 sayfa, ÜRETEÇTEN
16 `web/collections/*.html`'i ELLE DÜZENLEME. Üreteci koştur:
`node engine/tools/gen-collection-pattern.mjs` (yardım/argüman gerekiyorsa
dosyanın başındaki kullanım satırını oku). Üretim sonrası:
- `grep -rc "ölçülerine göre" web/collections/` → 0 olmalı,
- `bash engine/tests/generated_ratchet_check.sh --accept` ile manifesto
  güncellenir ve AYNI commit'e girer,
- üreteç koşturulamıyorsa SEBEBİYLE yaz ve elle düzelt + `--accept`.

### 3) BOZUK İNGİLİZCE — 12 hit
Her birini GRAMER OLARAK onar. Kural: **YENİ SAĞLAYICI JETONU EKLEME** (bu
kartın varlık sebebi jeton aklamasıdır). `golden_check` cümlede zaten varsa
kalır, yoksa EKLENMEZ. Örnek dönüşüm (birebir kopyalama, cümleye göre uyarla):
- "it was rebuilt and is now unchanged under golden_check to the live web build"
  → "it was rebuilt and now matches the live web build" (jeton yok, iddia aynı)
- "The header markup is still unchanged under golden_check to the previous patch"
  → "The header markup still matches the previous patch"
- "The marked stitch line on the facing is unchanged under golden_check to the
  opening drawn on the back" → "…matches the opening drawn on the back"
`styles/open-back.html`'in JSON-LD bloğu (satır 26) da düzeltilir; sayfa
üretilmişse §2'deki üreteç usulü (üretici + `--accept`) aynen uygulanır.
Her onarılan cümlenin `data-tr`'si İngilizcesiyle ÇELİŞMEYECEK — ikisini de oku.

### 4) MUTASYON (§4.5) — YALNIZ yeni iki kalıp için
`GECE/log/V10-I.mutasyon.txt` emsalini izle: `web/` DIŞINDA bir fikstür
dizininde (`--dir=`) her yeni kalıp için kır → EXIT 1 + kalıp ADIYLA sayılsın →
geri al → EXIT 0. Çıktı `GECE/log/V10-J.mutasyon.txt`.
**`web/` altına mutasyon yazma.** Bitince `git status --porcelain` BOŞ olmalı.

## ÇIKTI
- `engine/tests/landing_truth_check.mjs` (+2 kalıp), `web/**`, `contract/generated-paths.sha256`
- `GECE/log/V10-J.mutasyon.txt` · `GECE/log/V10-J.kapi.txt` (kapının tam çıktısı)
- `GECE/V10-J.md` — ÖNCE/SONRA sayısı + onu basan komut; onarılan 12 cümlenin
  dosya:satır listesi; yapılamayan her kalem SEBEBİYLE

## KAPANIŞ DOĞRULAMASI (hepsi geçmeden commit yok)
1. `node engine/tests/landing_truth_check.mjs` → EXIT 0 (`--baseline` KOŞTURMA, o V10-L'in işi)
2. `bash engine/tests/generated_ratchet_check.sh` → EXIT 0
3. `node engine/tools/site-health.mjs` → EXIT 0, ölü link 0
4. `grep -rc "ölçülerine göre\|kişiye özel\|unchanged under golden_check to" web/` → hepsi 0

## YASAKLAR
- Kapıyı GEVŞETME: kalıp SİLME, muafiyet GÖMME, **TABANA DOKUNMA**
  (`engine/tests/landing-truth-baseline.json` bu kartta OKUNUR, YAZILMAZ),
  testi DISABLED yapma.
- Sahte sağlayıcı jetonu (`golden_check`, `engine_check`, `site-health`) EKLEME.
- `docs/`, `README.md`, `GECE/KOSU.md`, `GECE/KAPI.md`, `engine/src/`,
  `contract/layers/` yasak. **DEPLOY YOK.** `?v` elle değişmez. `git add -A` yok.

## SÜRE TAVANI
50 dk. Tavanda: o ana kadarki iş commit'lenir, kalan kalemler `GECE/V10-J.md`
altında "AÇIK KALDI" başlığında ADIYLA yazılır.

## COMMIT
`git commit -m "v10-j: the turkish half of the landing gate — measurements lie swept from the collection pages, broken english repaired, ratchet green again"`
