# KART V5-I — KAPI DOSYASI ÇÜRÜMÜŞ SAYI TAŞIYOR (hakemin ★ kalemi)

## NE
`engine/tests/v5-ratchet-baseline.json` hâlâ, ARİTMETİK OLARAK ÇÜRÜTÜLMÜŞ bir
"ölçülmüş çözüm adayı" taşıyor. Bir KAPI dosyasının içinde duran yanlış sayı,
docs'taki yanlış cümleden beterdir. Düzelt.

## ETİKET
SIRALI (tek başına, son iş). SÜRE TAVANI: 25 dk.

## ÇÜRÜTME — VERİ olarak al, yeniden tartışma
İki bağımsız koşu aynı sonuca vardı:
- iddia: `bust +1.5cm -> 65.80..98.80mm, HEPSİ bantta` · bugün ölçülen
  **`50.80..83.80mm`, TUTMUYOR**. Fark tam 15.00mm = gövde girdisinin kendisi;
  `pay = halka − gövde·10` olduğu için gerçek kazanç yalnız **1.65mm**.
- iddia: `kalça +3.5..+5.0cm -> 8 bedende bantta` · hakem `hipCM +5cm`
  koşturdu → hip_ease `17.2..23.2` yerine **`18.2..24.2mm`, 8/8 HÂLÂ BANT
  DIŞI**. Pay çarpımsal: `ease = 0.02 × hipMM`.
- Ölçülen duyarlılık: `d(büst payı)/d(gövde) = 0.1100`,
  `d(kalça payı)/d(gövde) = 0.0200`, 0–40cm aralığında SABİT.
- Bandın alt sınırına varmak için gereken kaydırma: büst **+13.5cm**,
  kalça **+168.0cm** → yani gövde girdisini kaydırmak bu kalemleri ÇÖZEMEZ.
- AYAKTA KALAN TEK ADAY: `engine/src/` içindeki payın CİNSİNİ çarpımsaldan
  TOPLAMSALA çevirmek. Bedeli **DOĞRULANMADI** (uygulanıp ctest koşulmadı):
  8 bugün-yeşil kapı risk altında — `sewability_check` · `api_wire_check` ·
  `recipe_wasm_parity(+_dress)` · `dxf_wasm_parity(+_dress)` ·
  `wasm_spec_honesty_check` · `bugra_bridge_check`.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- engine/tests/v5-ratchet-baseline.json
- engine/tests/draft_math_check.mjs (SADECE OKU — kayıt alanlarını nasıl
  okuduğunu görmek için)
- GECE/log/V5-D.remedy.txt

## YAPILACAK
1. `engine/tests/v5-ratchet-baseline.json` içindeki HER `olculmusCozumAdayi`
   alanını tara. Gövde girdisi kaydırmasına dayanan her aday (satır ~62
   `bust +1.5cm`, satır ~91 `kalca +3.5..+5.0cm`, satır ~105 `bust_ease`
   tarihsel notu ve varsa benzerleri) **ÇÜRÜTÜLDÜ diye işaretlenecek**:
   eski metin SİLİNMEZ, "CURUTULDU (2026-08-25): <ölçülen sayı>" şerhiyle
   kalır ve yanına AYAKTA KALAN aday + bedeli yazılır.
2. Ayrıca `notch_off_boundary`'nin adayı (`211 -> 0`) hakkında dürüst ol:
   o aday ÖLÇÜLMEDİ, yalnız akıl yürütmedir. Öyle işaretle
   ("**UYGULANIP ÖLÇÜLMEDİ**"), aksini iddia eden cümle varsa düzelt.
3. `GECE/log/V5-D.remedy.txt` dosyasının BAŞINA bir uyarı bloğu ekle:
   dosyanın "ADAY" bölümünün aritmetiği yanlış, düzeltmesi bu kartta,
   ve hangi satırların geçersiz olduğu. Dosyanın GERİSİNİ SİLME
   (ölçüm kaydı olarak durur).
4. Değişiklikten sonra `node engine/tests/draft_math_check.mjs` koş:
   **exit 0 ve sayılar BİREBİR AYNI kalmalı** (kayıt metinleri değişti,
   sayılar değişmedi). Çıktıyı `GECE/log/V5-I.dogrulama.txt`'ye yaz.
   Sayı kımıldadıysa GERİ AL ve raporda ADIYLA yaz.
5. `ctest --test-dir engine/build -R "draft_math_check|sewability_check"
   --output-on-failure` koş, aynı loga ekle. İkisi de Passed olmalı.

## YASAKLAR
- SAYI DEĞİŞTİRME. Tavanlara, bantlara, çizgilere DOKUNMA — bu kart yalnız
  KÜNYE/METİN düzeltir.
- Eski metni sessizce SİLME. Şerh düş, kaydı bırak.
- `engine/src/` altında kaynak DEĞİŞTİRME. Payın cinsini ÇEVİRME — o
  DAMLA kararı (K-V5A), bu kartın işi değil.
- Tam ctest koşturma gerekmiyor (yalnız iki kapı). `patterns_real/`'e dokunma.
- Uydurma: burada yazılı olmayan bir sayı ekleme.

## ÇIKTI
- `engine/tests/v5-ratchet-baseline.json` · `GECE/log/V5-D.remedy.txt`
  (baş uyarı bloğu) · `GECE/log/V5-I.dogrulama.txt`
- `GECE/V5-I.md` — yapılan (yol + hash) · ölçülen (sayı + komut) ·
  yapılamayan (sebep) · kart dışı fark edilen.
Bitince commit at (lowercase english), hash'i rapora yaz.
