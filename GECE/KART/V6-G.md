# KART V6-G — EDİTLEME ZİNCİRİNE SİCİL REDDİ + ÇIPA + **SONRA ÖLÇÜMÜ**

ETİKET: **PARALEL** (V6-F ile) · SÜRE TAVANI: **60 dk**

## NE
Spec DIFF zincirinin iki eksik halkasını kur ve iyileştirmenin ÖNCE/SONRA
sayısını bas:
(1) **OPERATÖR SİCİL KONTROLÜ** — diff shipped olmayan bir operatör istiyorsa
    red cümlesi o operatörün ADINI söylemek ZORUNDA (sessiz düşürme = RULES 1).
(2) **ÇIPA + ORAN** — diff'te konumlu edit `çıpa adı + opsiyonel oran ofseti`
    ile ifade edilir; çıpa üretilmiş sözlükte yoksa ADIYLA reddedilir.
    ★ VLM'e piksel koordinatı ya da vertex seçtirmek MİMARİ İHLALDİR — şemaya
    koordinat alanı EKLEME.
(3) **SONRA ölçümü**: KONUM kapasitesi önce/sonra.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md` · `RULES.md`
- `GECE/V6-A.md` ← ÖNCE sayıları (GİRDİ; devralma, kendi komutunla yeniden bas)
- `engine/tools/spec-diff.mjs` · `engine/tools/foto-spec-olcum.mjs`
- `contract/anchors-v1.json` ← ★ BAŞKA İŞÇİ BU DOSYAYI ŞU AN YENİDEN YAZIYOR.
  OKU ama **COMMIT'İNE EKLEME** ve **DEĞİŞTİRME**. Çıpaya bağlı her sayıyı
  commit'ten HEMEN ÖNCE yeniden koş.
- `contract/garment-spec-v2.json` (operatör sicili) · `contract/composition.json`
- `vision/eval/live-2026-08-22.json`

## YAPILACAKLAR
1. **SİCİL REDDİ**: `spec-diff.mjs` zincirine bir aşama ekle — diff uygulandıktan
   sonra gereken operatörler `garment-spec-v2.json:operators` siciline sorulur;
   `absent`/`flagged` olan varsa `r.stage = 'sicil'` ve `r.rejected` içinde
   **operatörün ADI + statüsü** geçer. Sessiz geçiş YASAK.
   ⚠ ÖLÇÜLMÜŞ ÇELİŞKİ: sicil `sleeve`/`collarFamily`/`skirtFamily` = absent
   diyor ama motor `Puff Sleeve` / `Peter Pan Collar` panellerini BASIYOR.
   Bu çelişkiyi ÇÖZME — reddi **uyarı kanalına** (`r.sicil` raporu) yaz, mevcut
   yeşil vakaları KIRMA, ve çelişkiyi tutanağına ADIYLA geçir.
2. **ÇIPA + ORAN**: diff şemasına `anchor` (ad) + `t` (0..1 oran ofseti)
   alanları gir; `anchor` üretilmiş sözlükte yoksa ADIYLA red, `t` aralık dışıysa
   ADIYLA red. Koordinat/vertex alanı EKLEME.
3. **YENİ DENETİM** (mevcut `edit_locality_check` içine EK vaka olarak, ayrı
   test dosyası açma — §7.5 kaynak dosya tavanı): en az 3 vaka —
   (a) geçerli çıpa + oran → kabul, lokallik korunuyor;
   (b) sözlükte olmayan çıpa → red, red cümlesi ÇIPA ADINI içeriyor;
   (c) absent operatör isteyen diff → sicil raporu operatör ADINI basıyor.
   ★ §4.2: bu denetim faz-öncesi kodda KIRMIZI düşmeli. KANITI ÜRET:
   `git stash` / ayrı worktree ile faz-öncesi `spec-diff.mjs`'e karşı yeni
   vakaları koştur, exit kodunu logla. Düşmüyorsa test boştur, yaz.
4. **MUTASYON (§4.5)**, geri alınarak: sicil reddini sessizleştir → KIRMALI ·
   çıpa doğrulamasını atla → KIRMALI. Exit kodlarıyla logla.
5. **SONRA ÖLÇÜMÜ** (asıl devir sayısı):
   - `node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json`
     yeniden koş: TAM DOĞRU SPEC · ALAN YARGISI · GORME/KELIME/MOTOR/KONUM.
   - **KONUM KAPASİTESİ önce/sonra**: 26 serbest terimin konum ibaresi
     taşıyanlarından kaçı ARTIK spec'te bir çıpayla ifade edilebilir. ÖNCE
     sayısını da kendi komutunla bas.
   - ⚠ **DÜRÜSTLÜK**: prompt/model değişmediği için ALAN İSABETİNİN değişmesi
     BEKLENMEZ. Değişmediyse "değişmedi, çünkü X" diye yaz; ücretli canlı çağrı
     gerekiyorsa **"ölçülemedi, sebep: ücretli çağrı (§5.3 veto)"** yaz, TAHMİN ETME.

## YASAKLAR
- `contract/` altına YAZMA (anchors-v1.json dahil — okumak serbest).
- `engine/tools/gen-anchors.mjs` · `engine/tests/anchor_source_check.mjs` ·
  `engine/CMakeLists.txt` DOKUNMA (V6-F'nin).
- `engine/src/`, `backend/`, `web/`, `patterns_real/` dokunma.
- Model ağırlığı / GPU / API anahtarı / bulut servis / ücretli çağrı = kalıcı veto.
- Yeni kaynak dosya AÇMA (tavan doldu) — mevcut dosyalara yaz.
- Kapıyı gevşetme: mevcut 12 lokallik vakasını silme/skip etme.

## ÇIKTI
`engine/tools/spec-diff.mjs` · `engine/tests/edit_locality_check.mjs` ·
`engine/tools/foto-spec-olcum.mjs` · `GECE/V6-G.md` · `GECE/log/V6-G.olcum.txt`

## COMMIT
`git commit -- <yukarıdaki yollar>` · `git add -A` KULLANMA.
