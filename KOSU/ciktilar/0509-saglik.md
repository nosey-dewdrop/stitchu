# 0509 koşusu — sağlık raporu (A1a bölümü)

> Bu dosyanın A1a bölümü geçit altyapısını ölçer. Fotoğraf okuma hattı, önbellek
> ve worker durumu **A1b'nin** işidir (brief madde 5); o bölüm aşağıda açık
> bırakıldı, A1b işçisi doldurur. Boş bırakmak "kontrol ettim" demekten iyidir.

## A1a — geçit altyapısı

| ne | durum | kanıt |
|---|---|---|
| `engine/tests/0509-kapi.sh` | var, koşuyor | `bash engine/tests/0509-kapi.sh` → 15 geçitli JSON, exit 1 (2 kırmızı), 4 dk 21 sn |
| stdout yalnız JSON | ölçüldü | tam koşuda stderr **0 bayt**; çıktı `python3 -m json.tool`'dan geçti |
| alt süreç çıktısı loga | ölçüldü | tam koşuda **stderr 0 bayt**, stdout tek geçerli JSON; alt süreç çıktısı `KOSU/0509-kapi.log`'da. (Ayrı sızıntı tarayıcısı referans kilidini kırdığı için geri alındı; ölçüm artık doğrudan stderr baytı üzerinden.) |
| CRASH sözleşmesi | ölçüldü | segfault eden alt süreç (`process.kill(pid,'SIGSEGV')`) → `durum:"CRASH", sayi:null, log:"KOSU/0509-kapi.log:339"`, JSON geçerli kaldı |
| boş değişken yasağı | ölçüldü | `--kisa` sahte (exit 1) python3 ile koşuldu → boş satır değil `{"hata":"KAPI_KISA_BOZUK",...}` + exit != 0 |
| ilkYeşil terfisi | ölçüldü | state.json'a `ilkYesil:{"wasm_sanity":"A3"}` yazıldı → o geçit HENÜZ-YOK'tan KIRMIZI'ya döndü, diğerleri HENÜZ-YOK kaldı |
| referans kilidi | ölçüldü | `--kilit` → 210 dosya salt-okunur; `contract/body-v1.json`'a yazma "permission denied"; `engine/tests/`'e yeni dosya açılabiliyor (dizinler yazılabilir) |
| `--kilit-diff` | ölçüldü | `adim-A1-once` ile boş çıktı (izin listesi dışına dokunulmadı) |
| `--kisa` (ucuz metrik) | ölçüldü | 9.7 sn (tavan 60 sn), tek satır JSON, `KOSU/0509-metrik.jsonl`'a ekleniyor |
| `--ivme` | 4 veri şekliyle ölçüldü | durgun seri → `yerelMinimum:true`; %37 kapanma → `false`; sayısal metrik yok → `false` + gerekçe; bozuk satır → çökmedi, NaN yok |
| kendi sözleşme kapısı | yeşil | `bash engine/tests/0509-kapi.sh --kendi-check` → **16 hüküm geçti, 0 kırmızı**, exit 0; `ctest -R kapi_sozlesme_check` 22.12 sn Passed |
| kabul komutu tek ve ayakta | ölçüldü | H16 hükmü `state.json`'daki her kabul komutunun işaret ettiği dosyanın VAR olduğunu doğruluyor; silinmiş dosyaya işaret eden komut kırmızı verir (tur 2'de tam olarak bunu yakaladı) |
| görsel | var | `KOSU/ciktilar/0509-kapi/gecit-tablosu.png` (+ .svg) |

### Bugünkü 2 kırmızı — ikisi de A1a'dan ÖNCE vardı, A1a'nın işi değil

1. **`flat_ayni_insan_check`** — 34 hüküm kırmızı. Bugün flat'ler `flat-from-pattern.js`
   yolundan çiziliyor: `data-size="EU38"` (croquis36 olmalı), ön/arka aynı bedende değil
   (dBel 100.3 mm'ye kadar), ilan-çizim farkı 12.7 mm. Graftan çizim gelince kapanacak faz
   işidir; A1a bunu ölçer, düzeltmez.
2. **`sinyal_tam`** — `bash KOSU/sinyal.sh tam` exit 1, `bundle_fresh_check` kırmızı
   (27 ctest zincirinde 3/27). sinyal.sh mühürlü, dokunulmadı.

### 4 henüz-yok — hepsi A1b'nin kurduğu şeyi bekliyor

| geçit | neyi bekliyor |
|---|---|
| `emsal_mm_olcum` | `engine/tests/0509-emsal-olcum.mjs` (A1b madde 2) |
| `olcek_check` | `contract/body-v1.json` içinde `olcekAraligi` (A1b madde 7) **ve** graftan çizim |
| `wasm_sanity` | `engine/tests/0509-wasm-sanity.mjs` (A1b madde 8) |
| `regresyon` | `KOSU/regresyon/girdiler.json` + `kos.mjs` (A1b madde 3) |

Bu dördü kırmızı SAYILMIYOR. İlk yeşil oldukları adım `KOSU/0509-state.json`'daki
`ilkYesil` alanına yazıldığı andan sonra yoklukları kırmızıdır — mekanizma yukarıda ölçüldü.

## A1b — fotoğraf okuma hattı (BU BÖLÜM AÇIK)

| ne | durum |
|---|---|
| anahtar var/yok | — (A1b doldurur; Damla'nın 6 Eyl kararı: anahtar YOK, işçi fotoğrafı kendi okur) |
| worker koştu/koşmadı | — (A1b doldurur; canlı worker denemesi A10'da, yalnız Damla kredi verirse) |
| `KOSU/onbellek/` | — (A1b kurar; commit edilir, `.gitignore`'a girmez) |
| `biba-O1194418-dress.jpg` okuması | — (A1b doldurur) |
| hata | — |

## A1a — tur 2 (referans kilidi ihlalinin kapanışı)

Hakem hükmü: önceki işçi izin listesi dışında 4 dosya açtı (`0509-kapi-kendi-check.sh`,
`0509-kapi-sizinti.py`, `0509-kapi-tablo.mjs`, `0509-karar-kabul.sh`); hepsi geri alındı
(`fac99c69`). Geri alma iki şeyi kırdı, ikisi de kapatıldı — **o dosyalara dokunulmadan**:

| engel | kanıt (önce) | kapanış | kanıt (sonra) |
|---|---|---|---|
| `ctest kapi_sozlesme_check` silinmiş scripte bakıyordu → **yeni kırmızı** | `ctest -R '^kapi_sozlesme_check$'` → `0509-kapi-kendi-check.sh: No such file or directory`, 0% passed | kabul komutu ayrı dosya değil, `0509-kapi.sh`'ın **modu**: `--kendi-check`. `add_test` SİLİNMEDİ, hedefi değiştirildi (satır 1543) | `ctest -R '^kapi_sozlesme_check$'` → **Passed 22.12 sn** |
| `state.json.kabulKomutlari` silinmiş 2 dosyayı adlandırıyordu | `bash engine/tests/0509-kapi-kendi-check.sh` → No such file | tek komuta indirildi | `bash engine/tests/0509-kapi.sh --kendi-check` → OZET **16 hüküm geçti, 0 kırmızı**, exit 0 |

Karar 3 (CMakeLists izleme) da burada uygulandı — hakem A1b'ye yazmıştı, ama denetim
kapının kendi kodunda yaşıyor ve kabul komutu onu ölçüyor:

- `izlenen_yollar()` = kilitli alan **+** `engine/CMakeLists.txt` (chmod ile kilitlenmez,
  yazılabilir kalır; H14 bunu doğruluyor).
- `cmake_satir_yonu()` diff'te silinen `-add_test(` / `-add_executable(` satırı görürse
  `KILIT_IHLALI` basar; ekleme (`+`) temiz sayılır. H15 sentetik diff'le ölçüyor.
- `--kilit-diff adim-A1-once "engine/tests/0509-* engine/CMakeLists.txt contract/body-v1.json"`
  → **boş çıktı** (izin listesi dışına dokunulmadı).

Tam koşu (`97559b95` sonrası): 15 geçit, **2 kırmızı** — `flat_ayni_insan_check` (34, ilanlı,
A4'te kapanır) ve `sinyal_tam`/`bundle_fresh_check` (ilanlı, A9'da kapanır). Yeni kırmızı yok,
CRASH yok, stderr 0 bayt. 4 HENÜZ-YOK geçidin dördü de A1b'nin teslimi.

**A1a tur 2'de eklenen hüküm sayısı: 13 → 16** (H14 cmake yazılabilir, H15 satır yönü,
H16 kabul komutu ayakta).
