# 0509 KOŞU DURDU — 8.29 (bütçe aşımı)

Tarih: 2026-09-06. Durum: **DURDU**. Bu dosya soru içermez, karar istemez.

## Hangi adım
**A1 — Geçit.** Alt adımlar: A1a GEÇTİ, A1b GEÇTİ. A2 açık ama başlatılmadı.

## Neden durdu (ölçüm)
8.5 protokol hatası sinyali: tek adımın bütçesi aşıldı.

| ölçü | değer | tavan |
|---|---|---|
| mantık commiti (adım-A1-once tag'inden beri) | 26 | 12 |
| derleme commiti (`fix(build):`) | 0 | 6 |
| saat | 9.27 | 5 |
| yerelMinimum | true (anaSapmaMM 0.693 -> 0.693, %0 kapanma) | — |

Kusur ürün kusuru DEĞİL: A1'in işi geçit kurmaktı ve geçit kuruldu. Aşan şey
**geçit kurma maliyeti** — tek adımda 26 commit / 9.27 saat.

## Hangi katman
Koşu mekaniği / geçit altyapısı (`engine/tests/0509-kapi.sh` + `KOSU/`). Motor
(`engine/src`) ve contract ürün olarak bu adımda değiştirilmedi; ürün kodu
kasten sabit tutuldu (brief: "ÜRÜN DEĞİŞMEZ").

## Ne denendi
- A1a: geçit kuruldu, 15 geçit, kabul komutu `--kendi-check` moduna indirildi.
- A1a tur 1 DÜŞTÜ: referans kilidi ihlali — izin listesi dışında 4 dosya açıldı.
  **banned:** `engine/tests/0509-kapi-kendi-check.sh`, `engine/tests/0509-kapi-sizinti.py`,
  `engine/tests/0509-kapi-tablo.mjs`, `engine/tests/0509-karar-kabul.sh`.
- A1a tur 2: kök nedenden kapandı (ayrı dosya yerine `0509-kapi.sh --kendi-check` modu);
  karar ajanı DEVAM dedi.
- A1b: 4 "henüz-yok" geçidin 3'ü ölçmeye başladı — emsal_mm_ölçüm (0.693 / 2 mm eşik),
  regresyon (7 SVG, 0 fark, determinizm iki koşuda bayt bayt aynı), wasm_sanity (0 trap).
- A1b'de hakemden devredilen iki kusur kök nedenden kapandı: eşik artık
  `/croquis/toleranceMM` açık yolundan okunuyor (eski alt-dize taraması birimsiz
  0.05 oranı döndürüyordu = yanlış kırmızı); hüküm sayısı `ok()/fail()` çağrılarından
  üretiliyor, elle yazılmıyor.
- Karar ajanından 5 hüküm uygulandı (H17 sızıntı taraması, H18 add_test hedef değişimi
  ilanı, gerçek ön-arka çifti regresyon setine girdi, K5 "DÜŞER" beklentisi ölçümle
  "ÇİZER"e döndü, wasm geçidi `nativeKiyas: yok` ilanı).

## Açık kırmızılar (ilanlı, kapanacak adım adıyla bağlı)
- `flat_ayni_insan_check` = 34 (tavan 34, aşılmadı) → **A4**
- `sinyal_tam` / `bundle_fresh_check` = 1 → **A9**
- `olcek_check` = henüz-yok (mutlak bbox A2'de doğar) → **A2**
- `K2-prenses-roba` regresyonda düşüyor (armhole rolü taşınmıyor) → A2/A4

## Ne denenmedi
- **A2 ve sonrası hiç başlamadı** (A2 graftan çizim, A3 fotoğraf okuma, A4 croquis
  konvansiyonu, A5-A12).
- `olcek_check` ölçülmedi — sayı uydurulmadı, dürüstçe henüz-yok bırakıldı.
- native/wasm çıktı karşılaştırması yapılmadı: bu hatta native flat üretici YOK
  (ölçüldü). İkinci operand A2'de doğarsa karşılaştırma A2'nin kabul şartı.
- 16 fotoğraf çiftinin 14'ü DOĞRULANMADI (`-arka` dosyasının gerçekten arka olup
  olmadığı okunmadı); A2'nin her yeni çiftte doğrulaması şart olarak yazılı.
- `--ivme` muafiyeti A1b'ye verildi ve A2'den itibaren YOK; A2 sapmayı kapatmakla
  yükümlü, muafiyeti işçi `gecerli:false` yapmak zorunda.

## Resume
```
Workflow scriptPath=KOSU/0509-kosu.js args={"baslat":"A1"}
```
İşçi "kaldığın yerden, git log'a bak" ile başlar. Kilit AÇIK bırakıldı
(`bash engine/tests/0509-kapi.sh --kilit-ac`, 212 dosya yazılabilir).
