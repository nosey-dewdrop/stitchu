# 0509 KOŞU DURDU — 8.29 (3. durdurma)

> **9 Eyl, elle oturum (Damla kararı):** bu DURDU'nun A3 kusuru koşu dışında elle kapatıldı — motor taban + primitif emir listesini uygular ve çizer; 5 teslim yeniden üretildi (4 farklı flat, 5/5 grafdogrula 0 kırmızı, KABUL kırmızı=0), devirler geri alındı, `sinyal_tam` ilanı düzeltildi. Ayrıntı: `0509-kosu.md` §5.0c eki ve §5.5 (2026-09-09), `KOSU/ciktilar/giris/HUKUM.md`, `TAMLIK.md`. Taze hakem: `KOSU/ciktilar/hakem/A3/`. Koşucu bu oturumda çalıştırılmadı; sonraki adım A4 elle, koşucu A5'ten.


Tarih: 2026-09-09. Durum: **DURDU**. Bu dosya soru içermez, karar istemez.

## Hangi adım
**A3 — Fotoğraf (fotoğraf → okuma → graf).** Tag: `adim-A3-once`. Durum makinesinde
işçi turu bitmiş (`state.adimDurumlari.A3 = "ISI BITTI (hakem yargilar)"`),
**hakem hükmü YOK** — `KOSU/ciktilar/` altında A3'e ait hakem çıktısı bulunmuyor.
A1 GEÇTİ (A1a, A1b), A2 GEÇTİ (2026-09-08, koşu dışı tek oturum, taze hakem).

## Hangi kusur
**Bütçe aşıldı — protokol hatası sinyali (8.5).** Ölçüm (adım tag'inden bu yana):
**13 mantık commiti / 2.0 saat**; derleme commiti 0 (tavan 6). Hakem/karar ajanı
tarafından açılan yeni kusur listesi BOŞ. `gecitYesil=false`, `yerelMinimum=true`.

Kapı kırmızıları (ölçülen, `kapiExit=1`):
- `flat_ayni_insan_check` = 1 (eşik 0) — **İLANLI**, tavan 34, altında, kapanış adımı A4.
- `sinyal_tam` = 1 (eşik 0) — kırmızı alt testler `{bundle_fresh_check, vocab_reference_check}`;
  ilan edilmiş donmuş küme yalnız `{bundle_fresh_check}` olduğu için
  **ilan GEÇERSİZ** (`vocab_reference_check` kümede yok).

Yerel minimum ölçümü (son 3 commit): `anaSapmaMM` 0.693 / 0.693 / 0.693 (kapanma %0,
eşik 2.0 → DÜŞÜRÜLDÜ); `sanalDikisMM` 0 / 0 / 0 (DÜŞÜRÜLDÜ); `enum` 436 / 436 / 436.

## Hangi katman
**Koşu düzeni (orkestrasyon) + görü katmanı (`web/js`, `docs`, `engine/tests/0509-vision-*`).**
Bu turda ürün kodu yazıldı (18 commit, fotoğraf okuma hattı), ancak adım
hakemsiz kapanamadı ve bütçe tavanı aşıldı.

## Ne denendi
- Silüet koşucusu (kaynak b) tekrarlanabilir script; 5 fotoğraf ölçüldü (`fdb2f29c`).
- Görü şeması geçidi + ilk fotoğraf okuması geometride, adla değil; geçit 5 enjekte
  ihlalle yanlışlandı (`44fe8c79`), 5 okuma gerçek landmark adlarına düzeltildi (`25adc23f`).
- Üretici okuma→graf→flat/kalıp; gövde ve kol ayrı landmark zinciri (`79a41308`).
- Op'ların graf geometrisine uygulanması; `extendTo` yalnız y referansını taşır (`1f1f695d`).
- 5 fotoğrafın kontak sayfası + HÜKÜM dosyası: **5 çıktının 4'ü BAYT AYNI** (`dea039e6`).
- Önbellek-önce okuma köprüsü, eksik önbellek adıyla reddediyor (`6f1f7399`).
- Güvenli-taban ve arka-köken geçidi, türetilmiş-arka gerekçesi boşaltılarak yanlışlandı (`e715c95b`).
- Poz landmarker (kaynak a) self-hosted, headless Chrome'da fiilen koşturuldu; 5 fotoğrafın
  2'sinde tespit (`86ae91ed`), gerekçe ve kaynak-başına sonuç `docs/A3-FOTOGRAF-OKUMA.md` (`d99224cc`).
- Dört brief ölçütünü ölçen tek kabul komutu (`2e1afc43`); 9 edge-case satırı (`b6642924`).
- Karar ajanının beş hükmü uygulandı (`f8475f50`): applyOp CLI sahibi = A5;
  eksik op sözlüğü (`setNeckline, addPanel, addClosure, addPatch, mergeSeam`) → A6a;
  GİRDİ dosya adı değiştirilmez; kaynaksız belY oranı (0.55) contract'a A3'te GİRMEZ.
- Kabul komutları: **5/5 GEÇTİ** (kendi-check exit 0, emsal-ölçüm exit 0, regresyon exit 0,
  wasm-sanity exit 0, bileşik ivme komutu exit 0). Regresyon farkı: 0
  (adım=elle, girdi=9, koşan=6, koşmayan=3).
- Kilit: ihlal YOK. Dokunulan üç dosya (`engine/tests/0509-vision-guvenli-taban.sh`,
  `0509-vision-kabul.sh`, `0509-vision-sema.sh`) `A3IzinListesi`'ndeki
  `engine/tests/0509-vision-*.sh` kaleminin içinde.
- Banned (izin dışı dokunuş, tekrar denenmeyecek): `engine/tests/0509-kapi-kendi-check.sh`,
  `engine/tests/0509-kapi-sizinti.py`, `engine/tests/0509-kapi-tablo.mjs`,
  `engine/tests/0509-karar-kabul.sh`.

## Ne denenmedi
- **Hakem koşulmadı.** A3 için taze hakem (10.1: önce terzi/geometri merceği) hiç
  çağrılmadı; DEVAM/DUR hükmü yok, dolayısıyla adım GEÇTİ sayılmaz.
- İşçinin kendi ilan ettiği kusur ele alınmadı: **5 teslimin 4'ü bayt aynı flat/kalıp**
  (`KOSU/ciktilar/giris/HUKUM.md`). Bunun satış engeli olup olmadığı ölçülmedi (hakemin işi).
- Eksik op sözlüğü (`setNeckline, addPanel, addClosure, addPatch, mergeSeam`) yazılmadı —
  A6a'ya bağlandı; `applyOp` CLI'si açılmadı — A5'e bağlandı.
- `sinyal_tam` ilan kümesi düzeltilmedi (`vocab_reference_check` ilanda yok, ilan geçersiz).
- `flat_ayni_insan_check` (=1, tavan 34) kapatılmadı — A4'e devrediliyor.
- Bütçe içinde kalan derleme commiti hakkı (0/6) kullanılmadı.

## Devredilen (adım adıyla bağlı)
- `flat_ayni_insan_check` = 1 (tavan 34, altında) → **A4**
- `sinyal_tam` / `bundle_fresh_check` → **A9**
- Süpresyon kapısı tautolojik + `kPensPayi` C++'ta gömülü + ön/arka pens ağzı eşit +
  etek pensi kalça süpresyonunu emmiyor → **A4**
- Eksik op sözlüğü (5 op) → **A6a**; `applyOp` CLI → **A5**
- K2-prenses-roba → **A4**
- GİRDİ dosya adı yanlış (`biba-O1194418-dress-arka.jpg` içeriği ÖN); teslim geçerli,
  ad Damla'nın; A6'nın 10 fotoğraf seçimi bu dosyayı "arka" olarak KULLANMAZ.

## Kilit
**AÇIK** — `bash engine/tests/0509-kapi.sh --kilit-ac` koşuldu: 219 dosya yazılabilir.

## Resume
```
Workflow scriptPath=KOSU/0509-kosu.js args={"baslat":"A3"}
```
İşçi "kaldığın yerden, git log'a bak" ile başlar.
