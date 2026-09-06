# 0509 KOŞU DURDU — 8.29 (bütçe aşımı)

Tarih: 2026-09-06. Durum: **DURDU**. Bu dosya soru içermez, karar istemez.

## Hangi adım
**A2 — İlk geçiş (graf → çizim).** Alt adımlar: A2a GEÇTİ, A2b DEVAM, A2c koştu.
A1 (A1a, A1b) daha önce GEÇTİ.

## Neden durdu (ölçüm)
8.5 protokol hatası sinyali: tek adımın bütçesi aşıldı.

| ölçü | değer | tavan |
|---|---|---|
| mantık commiti (`adim-A2a-once` tag'inden beri) | 13 | 12 |
| derleme commiti (`fix(build):`) | 0 | 6 |
| saat | 3.05 | 5 |
| yerelMinimum | true (anaSapmaMM 0.693 -> 0.693 -> 0.693, %0 kapanma; enum 436 -> 436 -> 436) | — |
| kilit ihlali | `engine/src/grafdogrula.cpp` | 0 |
| geçitYeşil | false | true |
| kırmızı | `flat_ayni_insan_check`=1 (eşik 0; İLANLI, tavan 34, kapanacak adım A4) | — |

Bütçe protokol hatası sinyalidir, adım hatası değil (8.5). Ürün bu adımda İLERLEDİ:
`olcek_check` HENÜZ-YOK'tan çıktı (990.00 mm, aralık [395,1335], YEŞİL),
`sanalDikisMM` null'dan ölçülür hale geçti (0.00 mm, eşik 2.0, 8 beden),
`sinyal_tam / bundle_fresh_check` YEŞİL.

## Hangi katman
Çizim hattı + geçit altyapısı: `engine/src/grafciz`, `engine/src/grafdogrula.*`,
`contract/graf-v1.json`, `engine/tests/0509-kapi.sh`. Çözücü (`solver_utils`)
karar gereği kilitli tutuldu, değiştirilmedi.

## Ne denendi
- **A2a:** çözücü iskeleti + `solver_utils` birim testi (32 hüküm, yeşil). İki gerçek
  kusur çıktı ve kapandı/adıyla ilan edildi (yön-fallback düzeltildi; uzun sert
  zincirde yakınsamama `ERR_UNSOLVABLE` olarak ilan edildi, gizlenmedi).
  `cpp.dallanma` 439'dan 436'ya kök nedenden döndürüldü.
- **A2b:** graf → değerlenmiş geometri → `flat.svg/png` + `kalip-36.svg` uçtan uca
  hattı ayağa kalktı (`engine/build/grafciz`, `grafdogrula`; commit `780d51a9`).
  wasm bağlamaları (`flatSVG/kalipSVG/grafDraft`) native ile bayt bayt aynı.
  `sanalDikisMM` ilk kez ölçüldü. Flat, dikiş-ağacı yerleşimi değil giysi görünümü
  olarak yeniden yazıldı. Ölçek geçidi `ERR_SCALE_MISMATCH` ile ölçülür oldu.
  Referans kilidi `grafdogrula` üzerinde açılmıştı, geri kuruldu (`3d2d5507`).
- **A2c:** Q1+Q2 geçit onarımı (ölçek geçidi HENÜZ-YOK yerine `grafciz` çıkışını
  ölçüyor; `sanalDikisMM` `--kisa` satırına girdi, +37/-2 satır). E2: `kIcProjeksiyon`
  `solver_utils.cpp` constexpr'ından `contract/graf-v1.json` `cozucu.gevsetme`'ye
  taşındı, değer 4 değişmedi. E1: topolojik mantık geçidi
  (`ERR_IMPOSSIBLE_TOPOLOGY`, dört kural, hangi kural + hangi kenar adıyla) yazıldı,
  taban graf yeşil, dört ihlal adıyla reddedildi.
- **BANNED (izin dışı dokunuş, A1a tur 1):** `engine/tests/0509-kapi-kendi-check.sh`,
  `engine/tests/0509-kapi-sizinti.py`, `engine/tests/0509-kapi-tablo.mjs`,
  `engine/tests/0509-karar-kabul.sh`.
- **BANNED (8.4, A2):** devredilen kırmızı kök sebep → ivme; sapma 3 commit'te %20
  kapanmadı (anaSapmaMM 0.693/0.693/0.693, enum 436/436/436, satır=3, muafiyet
  geçerli:false).
- **Karar defterinden uygulananlar:** A2a yeniden AÇILMAZ (çözücü/maxIter/
  `kIcProjeksiyon` değeri/eşik/test değişmez); enum tabanı 436'da tavan, kesilmez;
  A2b/A2c'nin ivme metriği `sanalDikisMM`'dir (anaSapmaMM ve enum bu adımlarda
  ivmeye girmez, muafiyet yok); A2b'nin ikinci turu açılmadı, iş A2c'ye adıyla bağlandı.

## Ne denenmedi
- A2b kabul şartı (c) **teslim sırası** tam doğrulanmadı: `flat.png` + `kalip-36.png`
  ilk saatte commit'te olmalıydı; bu bütçe raporunda ölçülmedi.
- `flat_ayni_insan_check` (=1, tavan 34) kapatılmadı — kapanacak adım **A4**.
- `sinyal_tam / bundle_fresh_check` paket + tarayıcı wasm hattının yeniden üretimi —
  kapanacak adım **A9**.
- `K2-prenses-roba` (armhole rolü taşınmıyor) regresyon setinde hâlâ koşmuyor —
  A2/A4.
- F0 hakeminden devredilen 5 kusur (ön-arka bel farkı, arka görünümde kapanma yok,
  pens hizası, croquis kol pozu, silüette göğüs zikzağı) — A4.
- Puf kol hacmi + 2 çizilemeyen kompozisyon — A6.
- `engine/src/grafdogrula.cpp` kilit ihlali bu turda ölçüldü ama kök nedeni
  (izin listesi ile fiili dokunuş uyuşmazlığı) kapatılmadı.
- A2'nin kalan maddeleri (katmanlar/köprü/seri sonrası işler) ve A3-A12 başlamadı.

## Resume
```
Workflow scriptPath=KOSU/0509-kosu.js args={"baslat":"A2"}
```
İşçi "kaldığın yerden, git log'a bak" ile başlar. Kilit açık bırakıldı
(`bash engine/tests/0509-kapi.sh --kilit-ac` koşuldu, 217 dosya yazılabilir).
