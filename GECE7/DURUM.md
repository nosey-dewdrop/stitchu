# GECE7 — DURUM (şef tutanağı)

Koşu: KOSU-v7. Şef kod yazmaz (Halka 0 hariç); kart yazar, ajan salar, hakem salar.
Hedef sabit: **fotoğraf + prompt → kalıp + flat.**

## Sıra — §4 HALKA YAPISI (26 Ağu düzeltmesi)

| Halka | Fazlar | Durum |
|---|---|---|
| **0 — ISINMA** | disk + hedef koşusu tabanı | ✅ **BİTTİ** (şef koşturdu) |
| **1 — AL DENE** | **F-İNDİR** → F0 → F2 | ← şimdi buradayız |
| **2 — MOTOR** | F3 ⇄ F5 (operatör başına alt-kart) | bekliyor |
| **3 — DERİNLİK** | F4 → F6 → F7 → F8 → F9 | bekliyor |

**F1 Halka 0'a soğuruldu.** **F3B bu koşudan ÇIKARILDI**, H7 hedef koşusunda yok.

## Tablo

| Faz | Etiket | Ajan | Hakem | Durum |
|-----|--------|------|-------|-------|
| Halka 0 | `halka0-yesil` | şef (ajan yok) | — | ✅ BİTTİ, kart `GECE7/HALKA0.md` |
| F-İNDİR | — | — | — | SIRADAKİ — **BAŞLAMADI** |

> ⛔ **KOŞU DAMLA TARAFINDAN DURDURULDU** (26 Ağu, Halka 0 biter bitmez):
> *"halka 1 başlama dur bitirince."* Halka 1'i **kendiliğinden açma.** Yeni şef
> bu satırı görürse §3.2 döngüsüne girmez; Damla "devam" diyene kadar bekler.

## Son kapı sayıları — taban, n=5

`ctest --test-dir engine/build -R hedef_kosu` · taban `contract/hedef-kosu-taban.json`

| H1 | H2 | H3 | H4 | H5 | H6 | H8 | H9 | H10 | H11 |
|----|----|----|----|----|----|----|----|-----|-----|
| 5/5 | %92.2 | 4 | ÖLÇEMEDİM | 0 / 5 çift | ÖLÇEMEDİM | 31 | ÖLÇEMEDİM | %58.3 | 3.1 ms |

- H2'nin doğru cevabı **makine etiketi** (§1F) → sayı geçici.
- H5 yalnız `armhole↔sleeve_cap` çiftinde ölçülebiliyor; kalıpta başka kenar rolü ilan edili değil.
- H11 cırcıra değil **tavana** bağlı (<10 sn) ve **VLM turu hariç**.

## ctest

**119 test** (Halka 0 bir tane ekledi). 111 yeşil, **6 kırmızı — altısı da Halka 0'dan önce kırmızıydı.**
`flat_pattern_agree_check` · `flat_artifact_census` · `style_check` · `sizechart_source_check`
· `contract_check` (ilan edilmiş karar, bilerek kırmızı) · `figure_check` (`dress_bandeau_circle` pinsiz).

## Hakemin son hükmü

Yok — Halka 0 bir faz değil, ön şarttır; hakem salınmadı. **İlk hüküm F-İNDİR sonunda.**

## Açık kuyruk

`GECE7/DAMLA.md` — 4 soru, hepsi en kısıtlayıcı varsayımla ilerletildi, koşu durmadı.

## Notlar

- GECE7/ 2026-08-26'da açıldı; önceki koşu klasörü `GECE/`.
- Damla'ya soru sorulmaz; `GECE7/DAMLA.md`'ye yazılır, varsayım karta işlenir.
- §3.8 md.1: **faz ajanı `contract/hedef-kosu-taban.json`'a dokunamaz.** Değiştiren hakemdir.
