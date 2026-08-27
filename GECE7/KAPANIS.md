# KAPANIŞ — KOŞU v7 (GECE7). **KOŞU KAPANDI.**

Yazan: **F9 hakemi**, 2026-08-27. Bütün sayılar bu hakemin kendi koşusundan;
hiçbiri bir ajanın raporundan alınmadı.

---

# 🚨 0. EN ÜSTTE, DOĞRULANMADI: **GERÇEK BİR TARAYICIDA HİÇ TIKLANMADI**

**On yedi fazdır (borç 96) `web/al-dene.html` ve `web/create.html` GERÇEK BİR
TARAYICIDA AÇILMADI.** Bu makinede `chromium` **yok**, `google-chrome` **yok**,
Playwright/Puppeteer **yok** — kontrol edildi.

**Bu koşunun HİÇBİR yeşil kapısı şu cümleyi kanıtlamıyor:**
> *"Ürünü hiç görmemiş bir yabancı tarayıcıda tıklaya tıklaya dosyayı indirdi."*

Kanıtlanan şey **şudur ve yalnızca budur**: zincirin her halkası ayrı ayrı, kendi
kapısı altında, `node` içinde doğru davranıyor (`indir_check` EXIT 0, PDF 1:1,
kalibrasyon karesi 30.000 mm, dört ayrı DXF hash, `al_dene_check` EXIT 0,
H1 10/10 n=10). **Halkaların bir TARAYICIDA da birleştiği DOĞRULANMADI.**
§F9'un kapısı bunu **açıkça** istiyordu ve **karşılanmadı**.

---

# 🚨 1. DAMLA'YA GİDECEK KALEMLER — koşunun karar veremeyeceği dört şey

**Bunların hiçbiri bir hakem kararı değil. Dördü de bir İŞ kararı.**

## 1.1 🔴 REPO **PUBLIC** + `patterns_real/` **41 TAKİPLİ TELİFLİ BUĞRA DOSYASI**, ANONİM HTTP 200

**Ölçtüm, iddia etmiyorum:**
```
gh repo view --json isPrivate   ->  {"isPrivate": false}
git ls-files patterns_real | wc -l  ->  41   (8 PDF · 25 JPG · 5 mjs · 3 py, toplam 65 MB)
curl -L "https://raw.githubusercontent.com/nosey-dewdrop/stitchu/main/
         patterns_real/Buttoned%20Corset%20Bustier%20-%20FIXED/PDFs/A0.pdf"
   ->  HTTP 200,  651.104 bayt,  KİMLİK DOĞRULAMASI YOK
```
Satın alınmış Buğra kalıbının **A0 baskı PDF'i** bugün internetteki herkese
açık. `CLAUDE.md` hâlâ *"repo private"* ve *"`patterns_real/` ASLA push edilmez"*
diyor; **ikisi de bugün yanlış.** İhlal `87fc9d5`'ten, **bu koşudan çok önce**.

### SEÇENEKLER VE HER BİRİNİN **ÖLÇÜLMÜŞ** BEDELİ

| # | seçenek | ölçülmüş bedel | ölçülmüş kazanç |
|---|---|---|---|
| **A** | **Repoyu private yap** | 🔴 **CANLI SİTE ÖLÜR.** Ücretsiz GitHub hesabında private repo'da Pages kapanır. `pages.yml` **bu repodan** yayınlıyor ve `stitchu.noseydewdrop.com` **bugün 128 sayfayla ayakta** (`site-health` OK, 2622 iç bağlantı, 125 sitemap URL'i). Ayrıca **124 sayfa Google'a açık** (`CLAUDE.md`, 17 Ağu ölçümü) — indeks de gider. | Telifli 65 MB anında kapanır |
| **B** | **`git rm -r --cached patterns_real/` + `.gitignore`** | ⚠ **GEÇMİŞTE KALIR.** `raw.githubusercontent.com` HEAD'den 404 döner ama **eski commit SHA'sıyla hâlâ 200 döner** ve GitHub'ın API'si commit'leri listeliyor. Site **YAŞAR**. Kör kontrol (`bugra_parity_check`, `flat-tables.gen.js`'in croquis kaynağı) **diskteki** dosyayı okumaya devam eder. | HEAD temizlenir, arama motorları/`git clone --depth 1` görmez |
| **C** | **`git filter-repo` ile geçmişi kaz + force push** | 🔴 **`CLAUDE.md`'de MÜHÜRLÜ DAMLA KARARI**, tek taraflı yapılmadı. Bütün SHA'lar değişir → **30 GECE etiketinin hepsi** (`halka0-yesil` … `F9-yesil`) yeniden yazılmalı; üç hakemin gerekçesindeki commit atıfları ölür. | **Tek tam çözüm.** Geçmiş dahil temizlenir |
| **D** | **Hiçbir şey yapma** | 🔴 65 MB satın alınmış kalıp anonim erişimde kalır, **süresiz** | 0 |

**HAKEMİN NOTU (karar değil):** **B**, bedeli ölçülen tek "site yaşar + HEAD
temizlenir" seçeneği ve **C**'yi bloke etmiyor — B'yi bugün yapıp C'yi Damla'nın
seçtiği bir güne bırakmak mümkün. **Ama seçim Damla'nın.**
🚨 **Bu koşu görünürlüğü TEK TARAFLI DEĞİŞTİRMEDİ** (kartın emri).

## 1.2 🔴 `pages.yml:23 branches: [main]` — **§3.5 KODDA YOK**

§3.5'in kuralı: *"site son yeşil etiketten sevk edilir."*
**Kodda böyle bir şey yok.** `.github/workflows/pages.yml:23`:
```yaml
on:
  push:
    branches: [main]
    paths: ['web/**']
```
**`web/` dokunan her push, etikete bakılmaksızın, canlıya çıkıyor.**
Ve bugün canlıda olan sürüm **beş ilan edilmiş kırmızıyla** yayında
(`96% tests passed, 5 tests failed out of 132`). Workflow'un kendi künyesi
ctest'i **bilerek** dışarıda bıraktığını yazıyor (*"an -E exclusion list would
put a maintained lie in CI"*) — **gerekçe dürüst**, ama sonuç şu: **§3.5 bir
belge cümlesi, bir kapı değil.** Düzeltmek bir iş kararı: `branches: [main]`'i
`tags: ['F*-yesil']`'e çevirmek **her yeşil olmayan düzeltmeyi de canlıdan
keser**.

## 1.3 🔴 SEVK EDİLEN GİYSİ **STRAPLESS** = `CLAUDE.md`'YE GÖRE **LİSTELENEMEZ**

Damla'nın kendi cümlesi: *"Giysi hâlâ strapless; **balensiz durmaz,
listelenemez**."* **G5 (omuz / kol oyuğu / yaka) bu koşuda SEVK EDİLMEDİ** ve
bir kartta bile açılmadı. Ölçülen sonucu: `flat_pattern_agree_check`'in altı
ölçüsünden **üçü `UNMEASURED`** ve **tavanda (3/6)**, çünkü omuzda ölçülecek bir
şey yok.

**F9 bunu SAKLAMADI, İLAN ETTİ** — canlı landing, kelimesi kelimesine:
> *"the bodice the engine ships today has no shoulder, no armhole seam and no
> neckline drafted from a body; it ends at the top of the chest. Without boning,
> a garment cut from it will not stay up. … You are downloading a real draft
> with a named hole in it, and you are being told about the hole before you
> download rather than after."*

**Karar Damla'nın:** ürün bu hâliyle **listelenecek mi**, yoksa G5 sevk edilene
kadar **yalnız dosya (model A) mı** satılacak? F9 ikincisini vitrin etti.

## 1.4 ⚠ **rabadon ON YEDİ OTURUMDUR YANLIŞ ATEŞLİYOR** (borç 61)

`ctest-tail-hides-verdict` bu oturumda **iki kez** yanlış ateşledi. İkincisi
`du -ch … | tail -1` üzerindeydi — **komutta `ctest` kelimesi hiç geçmiyor**;
`patterns_real/`'ın bayt toplamını sayıyordum. Kuralın kendi künyesi sebebi
yazıyor: rabadon her kuralı **AYRIŞTIRILMIŞ BİR SEGMENT** yüzeyine karşı
eşliyor ve `|` segment sınırı olduğu için **boru hattının sol tarafı hiç
görünmüyor** — yani dosya işleneni olmayan **her** `tail -1` ctest şekli
sayılıyor. `rabadon wrong ctest-tail-hides-verdict "…"` ile deftere yazıldı.
🚨 **`.rabadon/guard.json`'a DOKUNULMADI** (kart yasağı) ve **kural rabadon'un
KENDİ kaynağında** — stitchu'dan düzeltilemez. **Damla'nın kararı.**

---

# 2. HALKA 0 → F9: **HER FAZIN HÜKMÜ VE ETİKETİ**

| # | faz | hüküm | etiket |
|---|---|---|---|
| 0 | **HALKA 0 — ISINMA** | ✅ şef koşturdu; disk 145→149 GB, hedef koşusu tabanı kuruldu (n=5) | `halka0-yesil` |
| 1 | **F-İNDİR** | ✅ GEÇTİ (**2. turda** koştu) | `F-INDIR-yesil` |
| 2a | **F0** (1. tur) | ⛔ **KALDI** — yedinci kırmızı | **etiket YOK** |
| 2b | **F0** (2. tur) | ✅ GEÇTİ | `F0-yesil` |
| 3a | **F2** (1. tur) | ⛔ **KALDI** — yedinci kırmızı | **etiket YOK** |
| 3b | **F2** (2. tur) | ✅ GEÇTİ — **Halka 1 KAPANDI** | `F2-yesil` |
| 4 | **F3** | ✅ GEÇTİ | `F3-yesil` |
| 5 | **F5-A** | ✅ GEÇTİ | `F5A-yesil` |
| 6 | **F5-B** | ✅ GEÇTİ | `F5B-yesil` |
| 7 | **F5-C** | ✅ GEÇTİ | `F5C-yesil` |
| 8 | **F5-D** | ✅ GEÇTİ | `F5D-yesil` |
| 9 | **F5-E** | ✅ GEÇTİ — ⛔ **F5 KAPANMADI, *DURDU*** (K54) | `F5E-yesil` |
| 10 | **F4** | ✅ GEÇTİ | `F4-yesil` |
| 11 | **F6** | ✅ GEÇTİ — kumaş ekseni 2 kelime → **7 alan**; hakem **bir atıf kesti** (K63) | `F6-yesil` |
| 12 | **F7** | ✅ GEÇTİ — edit hattı bağlandı, motorda operatör **3 → 5** | `F7-yesil` |
| 13 | **F8** | ✅ GEÇTİ — bustier parça eksiği **3 → 0**; ajan **kartın kendi teşhisini çürüttü** (K71) | `F8-yesil` |
| 14 | **F9** | ✅ **GEÇTİ — KOŞUNUN SON HÜKMÜ** | **`F9-yesil`** |

**On dört faz kartı, on dört yeşil etiket, SIFIR *GERİ AL*.**
⚠ Ama **on altı hüküm** verildi: **F0 ve F2 birer *KALDI* aldı** ve ikinci turda
geçti (`F-İNDİR` de iki tur koştu). *"On dört fazın hepsi ilk turda geçti"*
**yanlış olur** ve burada öyle yazılmıyor.

## 2.1 HEDEF KOŞUSUNUN SAYILARI: **AÇILIŞ → KAPANIŞ** (`n`'siyle)

🚨 **İKİ `n` HARMANLANMADI.** Açılış Halka 0'da **n=5**'ti; **n=10 seti F2'de
doğdu**, yani n=10 sütununun bir "açılışı" **yok** ve öyle yazılıyor.

| sayı | **AÇILIŞ** (Halka 0, n=5) | **KAPANIŞ** (F9, n=5) | **KAPANIŞ** (F9, n=10) |
|---|---|---|---|
| **H1** tamamlanma | **5/5** | **5/5** | 🏆 **10/10** |
| **H2** görülen isabet | **%92.2** (47/51) ⚠ *makine anahtarı* | **%95.2** (40/42) ⚠ *insan anahtarı, K19* | **%93** (66/71) |
| **H3** uydurma alan | **4** | **2** | **2** |
| **H4** gereksiz dikiş | **ÖLÇEMEDİM** | **ÖLÇEMEDİM** | **ÖLÇEMEDİM** |
| **H5** dikilebilirlik | **0 / 5 çift** | **0 / 5** | **0 / 5** |
| **H6** konvansiyon | **ÖLÇEMEDİM** | **0 / 16** (**n=8 stil**) | **0 / 16** (**n=8 stil**) |
| **H8** sözlük | **31** | **31** | **61** |
| **H8-ifade** (ÇEVRİLEN) | *yoktu* | **4 / 5** (payda mühürlü) | — |
| **H9** çıkarım makullüğü | **ÖLÇEMEDİM** | **ÖLÇEMEDİM** | **ÖLÇEMEDİM** |
| **H10** çıkarıldı oranı | **%58.3** (70/120) | **%58.3** | **%64.4** (154/239) |
| **H10a** görünemez | *yoktu* | **%17.5** | **%29.7** |
| **H10b** görünen-alınamayan | *yoktu* | **%40.0** (48/120) | **%33.1** (79/239) |
| **H10e** etiket hatası | *yoktu* | **3** | **5** |
| **H10x** beyan yok | *yoktu* | **%0.8** | **%1.7** |
| **H11** süre | medyan **3.1 ms** | medyan **4.0 ms** | medyan **2.4 ms** (tavan 10 sn) |

⚠ **H2'NİN ARTIŞI BİR CIRCIR KAZANIMI DEĞİLDİR** ve betiğin kendisi bunu
basıyor: cevap anahtarı **makineden İNSANA** geçti (K19), payda **51 → 42**
düştü çünkü hakem, makinenin kendine sorduğu **9 yargıyı** fotoğraftan yapmayı
**reddetti**. %92.2 → %95.2 **anahtarın değişmesidir.**

⚠ **H3 4 → 2 GERÇEK BİR KAZANIMDIR** (aynı n, aynı anahtar sınıfı).
⚠ **H6 ÖLÇEMEDİM → 0/16 GERÇEK BİR KAZANIMDIR** — bir ölçüm aleti doğdu.
⚠ **H1 5/5 → 10/10 SETİN BÜYÜMESİDİR** (n iki katına çıktı ve tavan tuttu).

## 2.2 CTEST: **AÇILIŞ → KAPANIŞ**

| | **AÇILIŞ** (Halka 0) | **KAPANIŞ** (F9, hakem koştu) |
|---|---|---|
| kayıtlı | **117** | **133** (`+16`) |
| koşan | 117 | **132** |
| geçen | **111** | **127** |
| **kırmızı** | **6** | **5** |
| DISABLED | 0 | **1** (`h10_gate_check`, K18) |
| süre | — | **741.57 sn** |

**Silinen kapı: SIFIR.** Kırmızı 6 → 5: `flat_pattern_agree_check` **kapandı**.

---

# 3. 🚨 §0'IN HEDEFİ: *FOTOĞRAF + PROMPT → KALIP + FLAT.* **BUGÜN NEREDE DURUYOR?**

**Süslemeden, tek paragraf:**

**Zincir uçtan uca AYAKTA ve on fotoğrafın onunda da tamamlanıyor** — bankalı
bir okumadan başlayıp, ölçülen oranlarla, tek bir C++ çekirdeğinden geçip
**kalıp + flat + rehber + 1:1 PDF + ASTM D6673 katmanlı DXF** olarak çıkıyor
(`H1 = 10/10, n=10`, hakemin kendi koşusu). **Ama üç şey bu cümlenin içinde
DEĞİL, ve üçü de ölçülü:** (1) *"prompt"* bacağı bugün **on bankalı fotoğraf**
demek — canlı sitede yabancı bir fotoğraf **yüklenebiliyor** ama o yol **ücretli
bir Worker'a** gidiyor ve bu koşuda **hiç doğrulanmadı**; (2) çıkan giysi
**strapless** ve `CLAUDE.md`'ye göre **listelenemez**, çünkü G5 sevk edilmedi;
(3) *"kalıp doğru mu"* sorusu **cevaplanmadı** — H1 bir **tamamlanma**
ölçüsüdür, bir doğruluk ölçüsü değil, ve bunu kendi mutasyonumla kanıtladım:
motorun BOAT yaka eğrisini bozdum, `golden_check` kırmızı yandı, **`hedef_kosu`
EXIT 0 verip `CIRCIR SAĞLAM` bastı.** **Yani bugün elde olan şey, bir yabancının
indirip bakabileceği GERÇEK bir taslak — dikilebilir, listelenebilir bir GİYSİ
değil.** Canlı sayfa da tam olarak bunu söylüyor, daha azını değil daha çoğunu
da değil.

---

# 4. **KAPANMAYAN HER ŞEY — TEK LİSTE**

## 4.1 MİRAS BEŞ KIRMIZI (bugün de kırmızı, hakem okudu)

| kapı | bugün ne diyor | sınıf |
|---|---|---|
| `contract_check` | `patterns_real/`'ın 41 takipli telifli dosyasını sayıyor | ✅ **İLAN EDİLMİŞ** (Damla, K58) |
| `flat_artifact_census` | 1° eşiği | ✅ **İLAN EDİLMİŞ** (hakem, K58) |
| **`style_check`** | *"pinlenmiş stil **0** — `engine/STYLE-PIN` yok/boş, **31 stilin hepsi korumasız**"* | 🔴 **KÖK SEBEP HİÇ ARANMADI.** Eksik bir **insan kararı** (pin bir ölçüm değil) |
| **`sizechart_source_check`** | 7 sütunun **3'ü** yayına bağlı; **4'ü DEĞİL** (`shoulderCM` · `backLengthCM` · `armLengthCM` · `neckCM`) = **40 sayı** bir alıcının vücuduna basılıyor | 🔴 **KÖK SEBEP HİÇ ARANMADI.** **ÜRÜN kusuru** — kaynak bulunarak kapanır |
| **`figure_check`** | 31 stilin **30'u** geçiyor; tek düşen `dress_bandeau_circle` (**tabansız — pin yok**) | 🔴 **KÖK SEBEP HİÇ ARANMADI.** `style_check` ile aynı sınıf |

**ÜÇÜNÜN KÖK SEBEBİ KOŞUNUN HİÇBİR FAZINDA ARANMADI** ve F9 bunu **saklamadı**:
üçü de `web/benchmark.html`'de **adıyla, EN ve TR**, *"NEVER TRACED"* diye
yayında.

## 4.2 ÖLÇÜLEMEYENLER

| | durum |
|---|---|
| **H4** (gereksiz dikiş) | 🔴 **ON YEDİ FAZDIR ÖLÇÜLEMEDİ.** F5 durdu (K54), dört sebep katmanı kodda yok |
| **H9** (çıkarımda makullük) | 🔴 **ON YEDİ FAZDIR ÖLÇÜLEMEDİ.** Görünmeyen alanda makullük hakemi yok |
| **H5 PAYDA TAVANI** | 🔴 **5'te sabit.** Kalıpta yalnız `armhole` + `sleeve_cap` rolleri ilan edili; **payda motordan büyütülemez** (K53/K64) |
| **H6** | ⚠ **0/16 ama `n=8 STİL`** — H1..H11'in `n`'i **DEĞİL**, harmanlanmaz |
| **H10a** | ⚠ **cırcıra BAĞLI DEĞİL** (K21) |

## 4.3 AÇIK BORÇLAR

| borç | ne | not |
|---|---|---|
| **72** | 🔴 **ON YEDİ FAZDIR HİÇ SINANMADI** | |
| 57 / K44 | açık | |
| 65 · 67 · 74 · 78 | açık | |
| **73** | ⚠ **GÖRÜNÜR YARISI F9'DA KAPANDI** — kör nokta artık **basılıyor** (`ön 214.97 / arka 196.03 mm`). **KÖK AÇIK:** `sleeve_cap` motorda tek ve bölünmemiş bir yay | bkz. §6 |
| **79** | 🔴 **`hedef_kosu --taban` YIKICI** — holdout + K19 mührü + üç hakemin gerekçesini siler | koşulmadı |
| **80** | C++ mutasyonu `build-wasm.sh` koşmadan cırcıra ulaşmaz | F9'da **uyuldu** |
| 81 · 82 · 90 · 91 · 95 | açık | |
| **96** | 🔴 **GERÇEK TARAYICI — ON YEDİ FAZDIR AÇILMADI** | **§0** |
| 97 | açık | |
| **61** | 🔴 rabadon **on yedinci** yanlış ateşleme | **DAMLA** (§1.4) |
| **101** 🆕 | `dxf.hpp:54-55` katman tablosunu **`§3.1.4`/`§3.1.5`** diye anıyor; birincil metinde **§4.3** | F9 hakemi açtı |
| **102** 🆕 | K42 yalnız vitrine uygulandı: *"princess seam"* **22 dosyada 98 kez** (landing'de **0**) | F9 hakemi açtı |
| **103** 🆕 | **`web/vendor/stitchu-engine.js` yeniden üretilebilir DEĞİL** — bir **YORUM** değişikliği hash'i `5e1958dc → a0bb1844` oynattı; `engine/dist` `762e7286`'da **sabit kaldı** | F9 hakemi açtı |

## 4.4 🔴 **§4A'NIN ŞART KOŞTUĞU İKİ OPERATÖR MOTORDA YOK** (K45)

§4A *"sınırsız"* kelimesini **üç operatöre** bağlıyor: `rotate` + **`slash-spread`**
+ **`merge`**. Motorda bugün **5** operatör var — `suppress` · `rotate` · `split`
· `extend` · `attach` — ve **`slash-spread` ile `merge` YOK.**
Kuyrukta **3 ad**: `derive` · `gather` · `overlay`.
**Bu yüzden kelime hak edilmedi ve F9'da canlıdan KALDIRILDI** (ölçtüm:
`F9-oncesi`'nde `web/index.html`'de **1** geçiş, bugün `web/` altında **0**).
🚨 ***"F5'i bitirdim" DENMİYOR*** (K54) — **F5 durdu, kapanmadı.**

---

# 5. BİR SONRAKİ KOŞUYA **İLK ÜÇ İŞ** — üçünün de gerekçesi ölçülen bir sayı

## İŞ 1 — 🔴 **GERÇEK BİR TARAYICIDA YÜRÜ. TEK BİR SATIR KOD YAZMADAN ÖNCE.**
**Ölçülen gerekçe:** **on yedi faz**, **on dört yeşil etiket**, **133 kayıtlı
kapı**, **741.57 saniyelik** bir süit — ve *"bir yabancı tarayıcıda dosyayı
indirdi"* cümlesi **hâlâ DOĞRULANMADI**. Koşunun sapma sorusunun tam ortasındaki
tek cümle bu, ve on yedi fazın hiçbiri ona dokunmadı. **En pahalı bilinmeyen bu,
çünkü en ucuz doğrulanabilir olan da bu.**

## İŞ 2 — 🔴 **`sizechart_source_check`'İN DÖRT KAYNAKSIZ SÜTUNUNA KAYNAK BUL.**
**Ölçülen gerekçe:** **7 sütunun 4'ü** yayına bağlı değil ve bunlar **8 bedende
40 sayı** ediyor — `shoulderCM` · `backLengthCM` · `armLengthCM` · `neckCM` —
ve **bir alıcının vücuduna basılıyorlar**. Miras beşin **tek ÜRÜN kusuru** bu
(diğer ikisi eksik pin, ikisi ilan edilmiş). Kapının kendi metni tabloyu
düzenlemeyi **yasaklıyor**: kaynak bulunacak. Ve F6'nın emsali var — hakem
D3107'yi **açtı**, K63'ü kesti; **yayın aranınca bulunuyor.**

## İŞ 3 — 🔴 **G5: OMUZ / KOL OYUĞU / YAKA.**
**Ölçülen gerekçe:** `flat_pattern_agree_check`'in altı ölçüsünden **üçü
`UNMEASURED` ve TAVANDA (3/6)**, tek sebebi G5'in sevk edilmemesi. Ve borç
73'ün F9'da ilk kez basılan sayısı aynı yeri gösteriyor: **ön oyuk 214.97 mm,
arka oyuk 196.03 mm, fark 18.94 mm** — omuz/oyuk işi hem `UNMEASURED` üçlüsünü
hem H5'in kör noktasını **aynı anda** açar. Üstelik `CLAUDE.md`'nin
*"listelenemez"* cümlesini kaldıran **tek** iş bu.

⚠ **İLK ÜÇTE OLMAYAN VE NEDEN:** `style_check`/`figure_check` (eksik **pin** =
Damla'nın kararı, mühendislik değil) · H4/H9 (F5 durdu, K54) · H5'in paydası
(motor işi, İŞ 3'ün içinde) · `patterns_real` (**iş kararı**, §1.1).

---

# 6. F9'UN KENDİ HANESİ — ne kapandı

| kalem | önce | sonra |
|---|---|---|
| **borç 99** — canlı sayfa kendi hakkında **yalan söylüyordu** | künye **düz metin**, `create.html`'e giden `<a>`'nın **içinde**; **altı** fotoğrafın lisans şartı **karşılanmıyor**, üçü ShareAlike | künye kartın **DIŞINDA**, yazar → Commons dosya sayfası, lisans → deed, **üç BY-SA ShareAlike'ı adıyla** yazıyor; **#37 artık CC sayılmıyor** (9 CC + 1 hak beyanı) |
| **borç 98** — kör kontrolün ayar vidası **kapısız** | `topLength` `'tunic'` yapılınca kapı **YEŞİL** kalıyordu | **EXIT 1** — hakemin HM-2'si doğruladı |
| **borç 100** — künyede **iki** yanlış cümle | *"AAMA-250"* (yok böyle bir belge) · *"L11 tanımsız"* | **ANSI/AAMA-292**, **"WITHDRAWN 2019, not replaced"**, **L11 = internal cutout(s)**; **L15/L1 sapması KAYDEDİLDİ** — birincil ASTM metniyle doğrulandı |
| **K45** — *"sınırsız"* **canlıdaydı** | `F9-oncesi:web/index.html` → **1** | `HEAD:web/` → **0** |
| **landing** | 18 iddia, **0 doğrulanmış**, 1 yanlış, 17 kanıtsız | her sayı **üreteçten** (`gen-vitrin` → `hedef_kosu`), her sayının yanında **`n`**, `vitrin_check` bayat sayıyı **kırmızı yakıyor** |
| **borç 73** (F9 hakemi) | kör nokta hesaplanıp **düşürülüyordu** — `grep korNokta` **tek satır**, atamanın kendisi; yanındaki *"sayıyla basılıyor"* yorumu **yanlıştı** | **basılıyor**: `ön 214.97 mm · arka 196.03 mm · fark 18.94 mm`, beş kalıbın beşinde |
| kapı sayısı | 132 kayıtlı | **133** — `vitrin_check` **eklendi**, **sıfır silindi** |

---

**KOŞU v7 KAPANDI. F9 GEÇTİ. On dört faz, on dört yeşil, sıfır geri alma —
ve kapanışın en üstünde duran cümle bir başarı değil, bir DOĞRULANMADI'dır.**
