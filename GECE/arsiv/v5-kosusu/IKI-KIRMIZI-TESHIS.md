# preview_truth_check + figure_check — teşhis (23 Ağu, koşturularak)

İkisi de `CLAUDE.md`'nin 5 Ağu kaydındaki sınıfa **girmiyor**. O gün kök sebep tekti
(`43fd696` bustX çarpanı, payda değişmişti, 12 pin ölçülen çarpanla taşınmıştı).
Bugün iki ayrı sınıf var ve ikisi de "pin bayat" değil.

---

## figure_check — PİN YOK, pin bayat değil

23 test satırının 21'i `ok`. Düşen iki tanesi:

```
FAIL dress_square_princess_circle  waist/bust 0.637  tabansız — taban_v3'te pin yok
FAIL dress_boat_princess_circle    waist/bust 0.637  tabansız — taban_v3'te pin yok
```

Mesaj birebir "**tabansız … hükümsüz**": kapı bir sapma ölçmüyor, karşılaştıracak
bir taban bulamıyor. İki stil katalogda var, `contract/figure-bands.json`
`taban_v3` bloğunda yok.

### Pin ne olmalı — ölçülen çıktıya değil, kardeşine bakarak

Aynı koşuda `princess_dress` **0.637 ölçüyor** ve **0.643 pinli** (±0.02 ile geçiyor).
Düşen iki stil de **0.637** ölçüyor — üç hanede birebir aynı.

Yani doğru hamle "bugün ne çıktıysa onu pinle" (dairesel) değil:
**bu üç stil aynı oranı üretiyor, biri zaten 0.643'te pinli, diğer ikisi o pini
devralır.** Gevşetme yok — `drift_tolerans` 0.02'ye dokunulmuyor, taban da
uydurulmuyor, var olan bir pin paylaşılıyor.

Not: `dress_princess_scoop_aline` de prenses ama 0.662 pinli ve 0.662 ölçüyor.
Yani "bütün prensesler 0.643" DEĞİL. Devralma gerekçesi ortak beden değil,
**ölçülen oranın kardeşiyle birebir eşitliği**. Etek (circle vs a-line) bel okuma
noktasını kaydırıyor olabilir — `_not` satırı beli "en dar nokta, alt %18 hariç"
diye tanımlıyor. Bu **DOĞRULANMADI**, pin devri için gerekli de değil.

---

## preview_truth_check — pin sorunu DEĞİL, draft tarafı hiç sayı basmıyor

`princess_dress` için **on landmark'ın onu da** aynı cümleyle düşüyor:

```
FAIL [princess_dress] landmark 'bustHalf' ÖLÇÜLMEDİ: draft tarafında sayı yok
     ve stilin beyanında bunu açıklayan bir yapı yok — ratchet burada SESSİZ (T17/TUR 9)
```
Aynısı: `neckHalf` `neckDepth` `shoulderLen` `armholeDepth` `waistHalf`
`hemSweepHalf` `skirtLen` `sleeveLen` `sleeveWidth`.

On landmark'ın **hepsinin** birden boş olması, tek tek pin kaymasıyla açıklanamaz.
Draft tarafı bu stil için hiçbir şey yayınlamıyor. Üç ihtimal, sırayla elenecek:

1. Draft çağrısı bu stil için hata veriyor / erken dönüyor → çıktı boş.
2. Landmark yayınlama yolu (draft → preview) kopmuş; motor hesaplıyor ama dışarı vermiyor.
3. Stil beyanı (`styles.json` / spec) draft tarafında karşılıksız → sessiz ikame
   yerine hiç üretmiyor (§0.3'ün istediği davranış, ama o zaman kapı bunu
   "açıklanmış atlama" olarak görmeli, "gerekçesiz atlama" değil).

Kapı zaten kendi kör noktasını söylüyor: "**ratchet burada SESSİZ**". Yani bu
sessizlik bir kez fark edilmiş, yakalansın diye kapı yazılmış, ama kaynağı kapanmamış.

### Yasak
Bu kırmızıyı "landmark'ı beyanda açıklanmış say" diyerek kapatmak, kapının ölçtüğü
şeyi yok etmektir. Kapatılacaksa **draft tarafı sayıyı basacak**.

---

## Sonraki adımda yapılacak

1. `figure_check`: iki stil `taban_v3`'e 0.643 ile girer, gerekçe (kardeş eşitliği)
   `_taban_v3_repin` yanına ayrı bir `_not` satırı olarak yazılır. `drift_tolerans`
   ve mevcut pinler DEĞİŞMEZ.
2. `preview_truth_check`: önce üç ihtimal elenir (draft'ı `princess_dress` için elle
   koştur, çıktısını bas), kök bulunur, **draft tarafı sayıyı basar**. Kapı
   gevşetilmez.
3. İkisi kapandıktan sonra tam `ctest`: yeni kırmızı 0, kalan kırmızı kümesi
   yalnızca üç kasıtlı (`style_check`, `sizechart_source_check`, `contract_check`)
   artı taşınmakta olan `h10_gate_check`.
