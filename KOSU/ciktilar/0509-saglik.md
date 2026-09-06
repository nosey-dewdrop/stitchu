# 0509 koşusu — sağlık raporu (A1a bölümü)

> Bu dosyanın A1a bölümü geçit altyapısını ölçer. Fotoğraf okuma hattı, önbellek
> ve worker durumu **A1b'nin** işidir (brief madde 5); o bölüm aşağıda açık
> bırakıldı, A1b işçisi doldurur. Boş bırakmak "kontrol ettim" demekten iyidir.

## A1a — geçit altyapısı

| ne | durum | kanıt |
|---|---|---|
| `engine/tests/0509-kapi.sh` | var, koşuyor | `bash engine/tests/0509-kapi.sh` → 15 geçitli JSON, exit 1 (2 kırmızı), 4 dk 21 sn |
| stdout yalnız JSON | ölçüldü | tam koşuda stderr **0 bayt**; çıktı `python3 -m json.tool`'dan geçti |
| alt süreç çıktısı loga | ölçüldü | `KOSU/0509-kapi.log`; sızıntı tarayıcısı (`0509-kapi-sizinti.py`) 0 yakalanmamış çağrı |
| CRASH sözleşmesi | ölçüldü | segfault eden alt süreç (`process.kill(pid,'SIGSEGV')`) → `durum:"CRASH", sayi:null, log:"KOSU/0509-kapi.log:339"`, JSON geçerli kaldı |
| boş değişken yasağı | ölçüldü | `--kisa` sahte (exit 1) python3 ile koşuldu → boş satır değil `{"hata":"KAPI_KISA_BOZUK",...}` + exit != 0 |
| ilkYeşil terfisi | ölçüldü | state.json'a `ilkYesil:{"wasm_sanity":"A3"}` yazıldı → o geçit HENÜZ-YOK'tan KIRMIZI'ya döndü, diğerleri HENÜZ-YOK kaldı |
| referans kilidi | ölçüldü | `--kilit` → 210 dosya salt-okunur; `contract/body-v1.json`'a yazma "permission denied"; `engine/tests/`'e yeni dosya açılabiliyor (dizinler yazılabilir) |
| `--kilit-diff` | ölçüldü | `adim-A1-once` ile boş çıktı (izin listesi dışına dokunulmadı) |
| `--kisa` (ucuz metrik) | ölçüldü | 9.7 sn (tavan 60 sn), tek satır JSON, `KOSU/0509-metrik.jsonl`'a ekleniyor |
| `--ivme` | 4 veri şekliyle ölçüldü | durgun seri → `yerelMinimum:true`; %37 kapanma → `false`; sayısal metrik yok → `false` + gerekçe; bozuk satır → çökmedi, NaN yok |
| kendi sözleşme kapısı | yeşil | `bash engine/tests/0509-kapi-kendi-check.sh` → 13 hüküm, `ctest -R kapi_sozlesme_check` 20.8 sn Passed |
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
