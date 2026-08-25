# V5-I — KAPI DOSYASINDAKİ ÇÜRÜMÜŞ SAYI ŞERH DÜŞÜLDÜ

Commit `d6f95fe` — *v5-i: mark the refuted body-shift remedy in the ratchet baseline, numbers untouched*

## YAPILAN

- `engine/tests/v5-ratchet-baseline.json` — dört metin alanı düzeltildi, **hiçbir sayıya dokunulmadı**:
  - `bantDisiKayit.bust_ease.olculmusCozumAdayi` → eski iddia (`bust +1.5cm -> 65.80..98.80mm, HEPSİ bantta`) SİLİNMEDİ, "CURUTULDU (2026-08-25)" şerhiyle duruyor; yanına bugün ölçülen `50.80..83.80mm`, 15.00mm'lik farkın gövde girdisinin kendisi olduğu (`pay = halka − gövde·10`, net kazanç 1.65mm), duyarlılık `0.1100` ve bant için gereken `bust +13.5cm` yazıldı.
  - `bantDisiKayit.hip_ease.olculmusCozumAdayi` → eski iddia (`kalça +3.5..+5.0cm -> 8 bedende bantta`) şerhle duruyor; hakemin `hipCM +5cm` koşusu `18.2..24.2mm`, **8/8 hâlâ bant dışı**; payın çarpımsallığı (`ease = 0.02 × hipMM`), duyarlılık `0.0200`, gereken kaydırma `kalça +168.0cm`.
  - İkisinde de AYAKTA KALAN TEK ADAY adıyla yazıldı: `engine/src/` içinde payın **CİNSİNİ çarpımsaldan TOPLAMSALA çevirmek**; bedeli **DOĞRULANMADI** (8 bugün-yeşil kapı risk altında: `sewability_check` · `api_wire_check` · `recipe_wasm_parity(+_dress)` · `dxf_wasm_parity(+_dress)` · `wasm_spec_honesty_check` · `bugra_bridge_check`). Kaynak değişikliği DAMLA kararı (K-V5A).
  - `tavanKunyesi.bust_ease` ve `tavanKunyesi.hip_ease` içindeki aynı aritmetiği taşıyan tarihsel satırlar da ÇÜRÜDÜ şerhi aldı (eski cümle aynen duruyor).
  - `sewability_check.tavanKunyesi.notch_off_boundary` → `211 -> 0` adayının "Ölçülmüş" nitelemesi GERİ ÇEKİLDİ; artık **"UYGULANIP ÖLÇÜLMEDİ, yalnız akıl yürütme"** diye işaretli.
- `GECE/log/V5-D.remedy.txt` — başına uyarı bloğu eklendi: geçersiz olan satırlar ADIYLA ("--- ADAY" bloğunun tamamı), çürütme sayıları, ayakta kalan aday, düzeltmenin nerede olduğu. Dosyanın gerisi (kök teşhis tablosu, shoulder ölçümü) SİLİNMEDİ.

### EK TUR — SATIR İŞARETÇİLERİ (kart md.3'ün eksik kalan yarısı)

Uyarı bloğunun kendisi ölçülünce bir kusur çıktı: blok "GEÇERSİZ SATIRLAR: **15-22**" diyordu,
ama bu, blok eklenmeden ÖNCEKİ numaralamaydı. Blok 36 satır olduğu için bugünkü dosyada
15-22 aralığı **uyarı bloğunun kendisini** işaret ediyor; okuyucu geçersiz satırları bulamaz,
kendi uyarısını okur. Kart md.3 "hangi satırların geçersiz olduğu" yazılsın diyor — yazılıydı
ama YANLIŞ yeri gösteriyordu. Düzeltildi (yalnız metin):

- `GECE/log/V5-D.remedy.txt` baş bloğu → geçersiz aralık **51-58** (ölçülerek doğrulandı:
  `grep -n "ADAY:\|bust +1.5cm ->\|hip +5.0cm ->"` → 51 / 53 / 58), kayma **+36 satır** ve
  eski numaralama (15-22) da parantez içinde bırakıldı, silinmedi.
- `engine/tests/v5-ratchet-baseline.json` → `bust_ease.olculmusCozumAdayi` içindeki
  *"remedy.txt satir 17"* → **bugün satır 53**; `hip_ease.olculmusCozumAdayi` içindeki
  *"satir 19-22"* → **bugün satır 55-58**. Her ikisinde de eski numaralama parantezde duruyor.

## ÖLÇÜLEN

Çıktı: `GECE/log/V5-I.dogrulama.txt`

| komut | exit |
|---|---|
| `node engine/tests/sewability_check.mjs` | **0** |
| `node engine/tests/draft_math_check.mjs` | **0** |
| `ctest --test-dir engine/build -R "draft_math_check\|sewability_check"` | **2/2 Passed** (sewability 0.12s, draft_math 0.11s) |

**Sayılar birebir aynı — ölçüldü, iddia değil.** JSON'un HEAD'deki hâli ile bugünkü hâli sayısal alan
bazında karşılaştırıldı: **57 sayısal alan, eski 57 / yeni 57, FARK ADEDİ 0.**

Ek tur da BAĞIMSIZ olarak yeniden ölçüldü (aynı loga eklendi):
`a40c888` (V5-I öncesi ağaç) → bugün **57 / 57, FARK 0**; `933a557` (ek tur öncesi) → bugün
**57 / 57, FARK 0**. İki kapı ek turdan sonra da `EXIT=0`, ctest **2/2 Passed** (0.12s / 0.12s).
Basan komutlar: `node -e` alan-bazlı JSON karşılaştırması (log içinde), `node engine/tests/*.mjs`,
`ctest --test-dir engine/build -R "draft_math_check|sewability_check" --output-on-failure`.
Kapının kendi bastığı satırlar da kımıldamadı: `scye_depth 11.4000` · `shoulder_width_front 8.2988` ·
`shoulder_width_back 18.1823` · `back_neck_drop 8.4000` · `bust_ease 4/8, en kötü 14.3500mm (EU34)` ·
`waist_ease 0/8, 0.0000mm` · `hip_ease 8/8, en kötü 33.6000mm (EU34)`.

## YAPILAMAYAN

- Ayakta kalan adayın (payın cinsini toplamsala çevirmek) BEDELİ ölçülmedi. Sebep: kart
  `engine/src/` altında kaynak değişikliğini açıkça YASAKLIYOR, karar K-V5A ile Damla'da.
  Dosyaya "DOĞRULANMADI" diye yazıldı, ölçülmüş gibi gösterilmedi.
- `notch_off_boundary` adayının `211 -> 0` sayısı da ölçülmedi (aynı yasak). Sayı silinmedi,
  "UYGULANIP ÖLÇÜLMEDİ" diye işaretlendi.

## KART DIŞI FARK EDİLEN

1. **Kapının KENDİ bastığı metin hâlâ çürütülmüş çareyi adlandırıyor.**
   `engine/tests/draft_math_check.mjs` son hüküm bloğunda şu cümle sabit gömülü:
   *"kapanması bir ÖLÇÜM değil bir DAMLA KARARI **(gövde girdisini kaydırmak)** — v6 §4 istisnası"*.
   Bugünkü ölçüm gövde girdisini kaydırmanın bu iki kalemi ÇÖZEMEYECEĞİNİ gösterdi, yani kapı
   her koşuda ekrana çürütülmüş bir çareyi K-V5A'nın içeriği diye basıyor. Kart o dosyayı
   SADECE OKU dediği için dokunulmadı. Doğrusu "payın cinsini toplamsala çevirmek" olmalı.
2. `bantDisiKayit.waist_ease`'de `olculmusCozumAdayi` alanı hiç YOK (bugün 0/8, ihlal yok) —
   eksiklik değil, kayıt için not.
3. `olculmusCozumAdayi` alanını okuyan tek bir satır bile yok (`draft_math_check.mjs` içinde
   grep 0 sonuç) — alan tamamen künye/belge, exit koduna girmiyor. Düzeltmenin kapıyı
   bozamayacağı bu yüzden önceden biliniyordu; yine de iki kapı da koşuldu.
4. **Şerh düşen blok kendi satır numaralarını bozuyor.** Bir dosyanın BAŞINA uyarı eklemek,
   o uyarının içindeki satır atıflarını ve dosyaya dışarıdan yapılan bütün atıfları kaydırıyor.
   Bu turda üç atıf birden bayatlamıştı (bloğun kendi "15-22"si + JSON'daki iki tanesi). Şerh
   düşerken kural: **satır numarası verilecekse ekleme SONRASI numaralamayla ver, eskisini
   parantezde bırak.** Aynı hata `GECE/log/` altındaki başka şerhlerde de olabilir — TARANMADI.
5. `GECE/log/V5-D.remedy.txt`'nin shoulder bloğu ayrı bir ölçüm taşıyor ve bu kartın
   konusu değil ama duruyor: `body.shoulder` (contract `shoulderCM`) 20..80cm arasında
   kalıp geometrisini BAYT BAYT değiştirmiyor → o hatta **ÖLÜ GİRDİ**. Uyarı bloğu bu bölümü
   bilinçli olarak geçerli saydı.
