# KOŞU — 2026-08-22 (v3) — **KAPANDI, F11 tarafından**

## ŞU AN
faz: **F11 kapandı, koşu bitti** · durum: **ana dala tek satır KOD girmedi** ·
son yeşil commit: **YOK** · ağaç: `962407d` (koşu başındaki commit)

> **BU KOŞU KOD ÜRETMEDİ.** F0/F6/F9/F10 iş üretti; dördünün işi de `gece.sh`'in
> kendi temizleme mantığınca **git nesnesi bırakmadan silindi**. Kapanış raporu
> `GECE/F11.md`. Kök sebep §"HARNESS KUSURU" altında, ölçülmüş.
>
> ⚠ **gece.sh HÂLÂ DÖNÜYOR.** F11 `6208704` olarak push edildikten SONRA aynı
> `is_error` yanlış teşhisiyle F11'i `once=6208704` ile yeniden açtı. İkinci
> açılışta iş YAPILMADI (`GECE/F11.md` son bölüm). **Süreç durdurulmalı**,
> yoksa F11'i sonsuza kadar yeniden açar.

## ÜÇ SAYI (F11'in yeniden ölçtüğü)
1. **ctest 96 test · 7 kırmızı · yeni kırmızı ad 0 · kapanan kırmızı 0**
   (`GECE/log/F11.ctest.txt` · diff `GECE/log/F11.reddiff.txt` **0 bayt**)
   §0.6 sağlandı ama **bedelsiz**: hiçbir şey değişmediği için bozulamazdı.
2. **DAMAR-YETENEK = garment %95.2 · flat %81.0 · surfacepattern %11.9**
   (21 kalemlik ANAYASA paydası, F0-A §3.1 yöntemi, F11-C yeniden ölçtü —
   **sapma 0**, çünkü ana dala kod girmedi)
   **DAMAR-SEVKİYAT = garment %9.5 (2/21)** — aynı payda, VARSAYILAN
   `GarmentSpec`: 21 kalemin **19'u opt-in `None`**
   (`engine/src/measurements.hpp:248-320`)
3. **Vitrin önce == sonra, bayt bayt** (`git diff 962407d..HEAD -- docs web
   README.md` BOŞ). Landing'de **18 iddia · DOĞRU 0 · YALAN 1 · KANITSIZ 17**.

> **"%0" ARTIK KULLANILMIYOR.** O sayı sevk EDİLMEYEN `surfacepattern`
> hattında ölçülmüştü. Gevşetme değil (§0.12): payda aynı, kriter sertleşti
> (varsayılan yapılandırma), sayı ilan edilen hatta (`garment`, §0.14) taşındı.
> Üçüncü ölçü **DAMAR-ÜYELİK = flat 9/31 = %29** (6-primitifli üyelik testi,
> 21'lik paydadan DEĞİL). Hangisinin "damar yüzdesi" adını taşıyacağı Damla'da.

## HARNESS KUSURU — KOŞUYU ÖLDÜREN ŞEY (ölçüldü, `GECE/F11-B.md`)
`gece.sh:158` kapıyı, `:164-165` commit'i koşturuyor → kapı kırmızısında
`HEAD == $ONCE` her zaman doğru → `DUR()`'un `:82` if'i **hiç** doğru olmaz →
`:83`'teki `git branch -f gece/$F-reddedildi` **hiç çalışamaz** → akış
`:93-94`'e (`git clean -fdq`) düşer ve iş **geri dönüşsüz** silinir.
**§3.1'in "reddedilen iş dalına alınır" sözü TUTULMUYORDU.**
İkinci kusur: `:154` (`return 2`, ajan ölümü) `DUR()` çağırmıyor → iş fazlar
arası **birikiyor**. Sonuç: **17:08 F9'un kapı kırmızısı F0+F6+F9'un birikmiş
işini toptan sildi**; 18:09 F10'unkini. **F6 kendi kapısına hiç girmedi.**
Yama tasarlandı + klonda koşturularak ölçüldü, **UYGULANMADI** (Damla kararı).

## KURTARILAN (uçucu `/tmp`'den `GECE/kurtarma/`ya alındı, 328K)
Kaynak kodu **KURTARILAMAZ** (`.git/objects`'te 15:20 sonrası 0 dosya; işçiler
hiç `git add` çağırmadı). Sözleşmeler kurtarıldı: `F10.index.html.orig` (F10'un
düzenlediği landing, BAYT) · `F9.arch-backup.md` · `b-now-F9/F10.LastTest.log.gz`
(silinen üç kapının TAM çıktısı) · `*.silinen-add_test.txt` · kapı ctest'leri.
⚠ `/private/tmp/stitchu-gece/` (338M) repoya ALINMADI — içinde F6'nın
düzeltilmiş `sleeve.cpp`'siyle derlenmiş **çalışan ikili** var
(koşturuldu: `cells=96 · H3 0.000000`). **Makine yeniden başlarsa gider.**

## YENİDEN İNŞA TARİFİ (bir sonraki koşu sıfırdan başlamasın)
- **F6 — TAM yeniden yazılabilir.** Kök sebep tutanakta yazılı: `sleeve.cpp`
  `capSpreadFrac` **genişlik** kesri uygulanıyor, oysa fazlalık **yay**.
  ÖNCE/SONRA kodu `GECE/F6-C.md:103-120`. Eksik: 96-hücrelik döngü gövdesi.
- **F9** — `GECE/F9-A.md:22-44` (dosya adı, `add_test`, ilk kırmızı) + yeşil
  çıktının tam metni. Eksik: gömülü perl regex'i.
- **F10** — `GECE/F10-A.md` iddia tablosu + landing bayt olarak. Eksik:
  `landing_truth_check.sh` parse kodu, `landing-claims.json` şeması.
- **F0** — kayıp yok, kod üretmedi.

## AÇIK KIRMIZILAR (ne · nerede · ölçülen sayı)
- **ctest 7 devralınan kırmızı**, isimler `GECE/log/F11.red.after`:
  `style_check` (`engine/STYLE-PIN` yok) · `bugra_bridge_check` +
  `contract_check` (**§0.10, Damla kararı, kapatılmaya ÇALIŞILMIYOR**) ·
  `preview_truth_check` · `figure_check` · `h10_gate_check` (EU34 armhole
  312.86mm, kapı 384.50–424.50; shoulder-seam 0 dikiş, kapı ≥2) ·
  `sizechart_source_check` (70 sayının 40'ı kaynaksız)
- **docs: 52 ihlal BUGÜN de duruyor** — 16 duran-iddia + 36 tanıksız
  (`GECE/log/F9A.gate.before.txt`; `docs/` baytları `962407d` ile aynı olduğu
  için bu **bugünün** sayısıdır). Ölçen kapı ana dalda YOK.
- **landing YALAN, `web/index.html:212`:** *"Every drawing on this page is real
  engine output… and live."* Ölçüldü: `gen-landing.js`'in 7 SVG çıktısının
  **7'si de** sayfadaki baytlarla eşleşmiyor; dahası `gen-landing.js` hiçbir
  dosyaya **yazmıyor** — SVG'ler **elle yapıştırılmış**, "live" mimari olarak
  imkânsız. `web/index.html` §0.15'in 57 korunan yolunda DEĞİL (elle yazılır).
- **`web/index.html` kendi içinde çelişiyor:** `:8`/`:22` **EU34–48**,
  `:179`/`:316`/`:317` **EU34–52**. Ölçen test yok.
- **`CAD` yasağı 8 satırda ihlal:** `web/index.html:7,8,12,20,22,176,191,192`.
  F10-C kaldırmıştı, iş silindi; yedek `GECE/kurtarma/F10.index.html.orig`.
- **`web/js/missing.js` motorun GERİSİNDE olabilir** — alıcıya "lace-up /
  fiyonk / düğme patı çizili değil" diyor (`:30-56`), oysa beş kapı da yeşil.
  **Dürüstlük katmanının TERS yönde yalanı.** Koşturarak **DOĞRULANMADI**.
- **Üç üreteç KOŞMUYOR** (EXIT=1, ENOENT `web/patterns/*/meta.json`):
  `gen-collections-page.mjs` · `gen-vintage-page.mjs` ·
  `gen-taste-collections.mjs`. Sebep kodda: `gen-sitemap.mjs:15` *"af49514
  deleted that tree"*. Yayındaki koleksiyon sayfaları **öksüz**.
- **Üç katman üç etek sözlüğü konuşuyor:** `vocab.json:12`'de `fullCircle` YOK,
  `garment-spec-v2.json topology.skirtShape`'te VAR, flat'te 6 stil öyle etiketli.
- **Sicilde 5 `absent`** (KOSU'nun eski "4"ü yanlıştı, `zipperPiece` sayılmamış):
  `gatheredOverlayLayer sleeve collarFamily skirtFamily zipperPiece`.
- **ADIYLA EKSİK damar detayı** (§0.3): garment'ta **dantel/fisto** ·
  flat'te **mini-düğme sırası · lace-up · halter · kutu-pili**.
- **F9'un K4 kırmızısı muhtemelen YANLIŞ POZİTİF** — yakaladığı iki satır
  YORUM; `kapi.sh:195` grep'i yorumu koddan ayırmıyor. **DOĞRULANMADI**
  (`kapi.sh` mühürlü, açılmadı).
- Flat ↔ kalıp ortak birim yok (`contract/tables.json` `flat._layer` beyan
  ediyor) · flat SVG'de ölçek beyanı yok (`unitDeclared: false`)
- İkinci flat kalemi ayakta (`render-garment-flat.mjs` kendi 2 şablonu +
  `flat-engine/_engine-full.mjs`) · `_engine-full.mjs:256` **2 stil-pinli sert
  kodlanmış kaçış** · `shoulderSeam` geometriden kapalı (iç gerinim
  %24.07/%18.14, kapı %3.0)

## HAT VARSAYIMI — GEÇERLİ (F11-C uçtan uca izledi)
ürün hattı = `garment` · `surfacepattern` sevk edilmiyor.
`draftJSON` (`bindings.cpp:238`) → `buildSpec` → `GarmentDrafter::draft` →
`web/js/create.js:9` / `studio.js:11` → `print.js` 1:1 A4.
`grep -c surfacepattern engine/wasm/bindings.cpp` → **0**.

## DAMLA'YA DÜŞEN (bloke etmez — hepsi DAMLA-KUYRUK.md'de)
`gece.sh` yaması uygulansın mı · 338M `/tmp` ikili kurtarılsın mı ·
damar hangi ad · landing:212 yalanı · `missing.js` ölçülsün mü ·
(devreden) `patterns_real/` · `stash@{0}`

## KAPANMIŞ FAZLAR
**YOK.** F0/F6/F9/F10 iş üretti, hiçbiri kapanmadı. F11 kapandı (ölçüm fazı,
kod yazmaz). Tutanaklar: `GECE/F0.md F6.md F9.md F10.md F11.md` + alt kartlar.
