# 0509 — A1b SAĞLIK RAPORU (6 Eyl 2026)

> Ölçüldü, iddia edilmedi. Her satırın yanında onu üreten komut var.

## Anahtar var mı? — YOK, ve gerekmedi

| soru | cevap | kanıt |
|---|---|---|
| API anahtarı var mı? | **YOK** (Damla'nın 6 Eyl kararı) | — |
| canlı worker (`/api/analyze`) koştu mu? | **KOŞMADI** | koşu önbellekten beslendi |
| dış LLM çağrısı ödendi mi? | **HAYIR — llmCagri = 0** | `KOSU/onbellek/` içindeki iki tarifin `okuyan` alanı `isci-A1b` |
| fotoğrafı kim okudu? | **koşu işçisi (ben)**, Read aracıyla doğrudan | `KOSU/onbellek/README.md` |

Fotoğraf okuma hattı sağlık kontrolü (brief madde 5): 1 fotoğraf
(`biba-O1194418-dress.jpg`) okundu, tarifi `graf-v1` şemasında yazıldı,
`KOSU/onbellek/<sha256>.json` olarak kaydedildi ve regresyon setinde
kullanıldı — `F1-biba-on-arka` girdisi bu tariften türeyen spec ile koşuyor
ve çizim üretiyor (38443 B).

## İki ölçüm bulgusu (soru sorulmadı ama önemli)

**1. `-arka.jpg` dosyası aslında ÖN yüz.**
`GIRDI/hedef-fotograflar/biba-O1194418-dress-arka.jpg` dosya adı arka diyor;
fotoğrafta ön orta düğme sırası, sweetheart yaka ve önde sivri düşen peplum
var — üçü de ön yüz işaretçisi. Arka yüze ait tek işaretçi yok. Aynı giysinin
ÖN yüzünün ikinci çekimi.
Kontrol örneği: `mary-quant-O365926-dress-arka.jpg` aynı yöntemle okundu,
**gerçek arka yüz** (arka yaka, sırt orta dikişi, arka kemer). Yani `-arka`
konvansiyonu genel olarak doğru; sorun **bu çifte özgü**.
Sonuç: brief madde 3(a)'nın istediği "ön-arka çifti" bugün elimizde YOK.
Regresyon girdisi bunu sessizce ön-arka gibi kullanmıyor; arka yüz `absent`
adıyla işaretli (`KOSU/onbellek/4e446902....json` → `ADLANDIRMA_CELISKISI`).
**Kapsam: 16 ön-arka çiftinin 2'si açıldı. Kalan 14 çift OKUNMADI —
DOĞRULANMADI.** (16 çiftin hepsinde ön/arka dosyaları sha256 olarak farklı;
kopya-dosya hatası değil, bu ölçüldü.)

**2. `sleeveStyle: 'puff'` motorda YOK.**
İlk tarif puf kolu `sleeveStyle='puff'` diye yazdı; motor adıyla reddetti:
`invalid sleeveStyle 'puff' (valid: none, straight, balloon)`. Puf kol motorda
AYRI eksende yaşıyor: `sleeveCap='puffed'` (`web/js/create.js:78`), şartı
`sleeveStyle='straight'`. **Tarif değişmedi, EŞLEME düzeltildi** — fotoğrafta
kol gövdesi düz, kabarık olan omuz başı. Düzeltme önbellekteki iki tarifin
`_kayip[]` alanında ölçüm cümlesiyle duruyor.

## Geçitler — A1b'nin dört "henüz-yok"u

| geçit | önce | sonra | sayı / eşik | eşiğin kaynağı |
|---|---|---|---|---|
| `emsal_mm_olcum` | henüz-yok | **YEŞİL** | 0.693 / 2 mm | `contract/flat-convention-v1.json` `/croquis/toleranceMM` |
| `regresyon` | henüz-yok | **YEŞİL** | 0 fark (7 girdi koştu) | `KOSU/regresyon/girdiler.json` |
| `wasm_sanity` | henüz-yok | **YEŞİL** | 0 trap / 0 fark | `engine/tests/0509-wasm-sanity.mjs` |
| `olcek_check` | henüz-yok | **henüz-yok** (dürüst) | null | `contract/body-v1.json` `olcekAraligi` |

`olcek_check` bugün ölçülemez ve öyle basılıyor: aralık contract'a kaynaklı
eklendi (395–1335 mm, iki uç da `tables.json` tablolarından türetildi), ama
grafın gerçek36'da değerlenmiş mutlak sınır kutusu **A2'de** doğuyor. Sayı
uydurmak yerine `henuz-yok` kaldı.

## Devredilen iki kusur — İKİSİ DE KAPANDI

**Kusur 1 (eşik okuyucusu / birim karışıklığı).** Eski okuyucu contract içinde
adında `tolerans` geçen ilk sayısal anahtarı alıyordu:
`/sevkPoz/yakaParcasi/boyToleransOran = 0.05` — **birimsiz bir oran**. Gerçek mm
toleransı `/croquis/toleranceMM = 2.0`, ama İngilizce yazıldığı için taramaya
hiç girmiyordu. Hakemin dediği aynen oldu: geçit yanar yanmaz **yanlış kırmızı**
yandı (0.693 mm > 0.05). Açık yol okuyucusuyla eşik 2.0 → YEŞİL.
**Eşik gevşetilmedi**, contract'ta zaten yazılı olan mm toleransı doğru
anahtardan okundu.

**Kusur 2 (rapor yüzeyinde elle yazılmış sayı).** Etiket "13 hüküm" diyordu,
kabul komutunun kendi özeti "16 hüküm geçti" basıyordu. Sayı artık **elle
yazılmıyor**, `ok()/fail()` çağrılarındaki ayrık H-numaralarından üretiliyor.
İlk düzeltme H17'nin heredoc'undaki `}` satırında kesiliyordu (17 basıyordu,
gerçek 18) — bu da ölçülüp kapatıldı. Şimdi ikisi de **18**.

## Karar defterinden A1b'ye düşen iki madde

- **H17 — alt süreç sızıntı taraması.** `kapi.sh`'in kendi kaynağındaki her
  `ctest|node|python3|cmake` çağrısı ya yönlendirilmiş ya yakalanmış olmalı.
  **Tarayıcının kendi sağlığı önce ölçülüyor:** ilk yazımda awk deseni bozuktu
  (karakter sınıfı içinde kaçırılmamış `/`), awk ölüyor, çıktı boş geliyor ve
  boş çıktı "sızıntı yok" diye okunuyordu — geçit bozuk tarayıcıyla YEŞİL
  yanıyordu. Artık sentetik bir örnekte 3 bilinen çıplak çağrıyı bulamayan
  tarayıcı KIRMIZI (araç onarımı). İki yönde de kanıtlandı: çıplak
  `node --version` eklendi → FAIL (satır no ile), geri alındı → OK.
- **H18 — `add_test` hedef değişimi.** Satırı silmek ile hedefi `/bin/true`'ya
  çevirmek aynı sonucu verir. Artık aynı test adı hem silinip hem eklenmişse
  KILIT_IHLALI basılıyor. Üç halde de ölçüldü: hedef değişimi → ihlal,
  saf ekleme → temiz, saf silme → ihlal.

## Bugün KIRMIZI olan iki geçit — ikisi de İLANLI, A1b'nin değil

- `flat_ayni_insan_check` = 1 · kapanacak adım **A4** · tavan 34 (aşılmadı)
- `sinyal_tam` / `bundle_fresh_check` = 1 · kapanacak adım **A9**

## Regresyon seti — 8 girdi, 5 topoloji

7 girdi koşuyor, 1 düşüyor. Düşen `K2-prenses-roba`, kendi DÜŞEN notunda
(`KOSU/ciktilar/primitif-DUSEN-K2-prenses-roba.txt`) ilan edilen kök sebeple
düşüyor: roba dikişi kol oyuğunu kesiyor, `armhole_*` rolü taşınmıyor,
`flat-from-pattern.js` `decompose()` oyuğu bulamıyor. Sessizce atlanmıyor,
`kosmadi:` satırıyla motorun kendi hata cümlesi yazılıyor.

**Beklenmeyen bulgu:** `K5-kup-korse` DÜŞEN notunda K2 ile *aynı kök sebeple*
düşeceği yazılıydı; **bugün ÇİZİYOR** (25663 B, düğüm `9a41ce3feb71a4d0` —
`03-elbise-kolsuz` ile aynı değil, yani `cupSeam`+`laceUpBack` gerçekten etki
ediyor). İki notun "kök sebep tek ve aynı" cümlesi bugünkü ölçümle
**örtüşmüyor**: aynı kök sebebin iki bölücüsünden biri (cupseam) çiziliyor,
öteki (yoke) çizmiyor. Bu A2'nin işi; buraya kapanmasın diye yazıldı.

Determinizm: set iki kez koşuldu, 7 SVG'nin hepsi bayt bayt aynı.

## Değişen satırlar

Bu turda **8 commit**, hepsi dosya alanı içinde (`git log --oneline 27799724~1..HEAD`).

`bash engine/tests/0509-kapi.sh --kilit-diff adim-A1-once` çıktısı — kilitli
alanda dokunulan dosyalar:

```
contract/body-v1.json          <- izin listesi (YALNIZ olcekAraligi eklendi, ek-only)
engine/CMakeLists.txt          <- bu turda DOKUNULMADI (A1a'dan geliyor, 97559b95)
engine/tests/0509-emsal-olcum.mjs   <- izin listesi (yeni)
engine/tests/0509-kapi.sh           <- izin listesi
engine/tests/0509-wasm-sanity.mjs   <- izin listesi (yeni)
```

**İzin dışı dokunuş: yok.** Silinen `add_test(` / `add_executable(` satırı: yok
(`git diff adim-A1-once..HEAD -- engine/CMakeLists.txt` yalnız bir `+add_test`
satırı gösteriyor). `contract/body-v1.json` diff'i ek-only: silinen tek satır
dosyanın eski kapanış parantezi.

| commit | ne |
|---|---|
| `27799724` | emsal ölçüm scripti (eşik açık contract yolundan, kapsam `dress/`) |
| `ea1a4bc3` | fotoğraf tarifleri önbelleğe, `-arka` çelişkisi adıyla |
| `cf3a4510` | regresyon seti + taban (8 girdi, 5 topoloji) |
| `7a0fd68c` | wasm sanity (bellek sınırlı worker) |
| `b372118c` | devredilen iki kusur kapandı |
| `f50d3037` | H17 sızıntı taraması + H18 add_test hedef değişimi |
| `5839ffd5` | contract ölçek zarfı (kaynaklı) |
| `955f3f4a` | hüküm sayısı heredoc'tan etkilenmiyor, regresyon hükmü düzeltildi |
