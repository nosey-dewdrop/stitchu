# FLAT SECIMI — 15 adaydan 5 (F6-konvansiyon, IS 1)

Bu bir hakem karari: estetik zemin burada belgelenir, Damla sonradan degistirebilir.
Degistirirse `KOSU/flat-olcum.py` yeniden kosulur ve `contract/mannequin-chart-v1.json`
v2 blogu o olcumden yeniden turetilir — elle duzeltilecek sayi yok.

## Secilen 5

| dosya | urun / satici | neden |
|---|---|---|
| **13-yuksek-bel-a-line.png** | Mica Dress, deer-and-doe | Kolsuz fitted beden + bel dikisi + A etek: bizim `elbise_kolsuz` sinifinin birebir karsiligi. KOLSUZ oldugu icin gogus hatti dogrudan gorunur — bel/gogus oraninin iki olcum capasindan biri. Cizgi kalitesi bes satici icinde en yuksek cozunurluk (2188 px), on+arka, ic dikisler (prenses, pens) net. |
| **14-uzun-kol-maxi.png** | Pauline Dress, deer-and-doe | Gorunum A askili fitted mini: gogus, bel VE bel alti govde tek siluette gorunur (oteki 13 adayin hicbirinde yok). Ikinci olcum capasi. 60/70's shift ailesi, GIRDI/hedef-fotograflar'daki Biba elbiselerinin kesim dili. |
| **06-a-line-puff-kol-varyant.png** | Eleanor Dress, deer-and-doe | Puf kisa kol + dart beden + bel dikisi + A etek: `uret.mjs` 01/04/09 orneklerinin tam ailesi. 70's gunluk elbise orani. Bel olculebilir (kol bele inmiyor); gogus kolun altinda — orana girmez, girmedigi dosyada yazili. |
| **07-uzun-kol-akiskan-etek.png** | Celia Dress, deer-and-doe | Bes aday icinde 70's ailesine en yakin duran cizim: V yaka, buzgulu puf kol, akiskan maxi etek — hedef-fotograflardaki Biba aksam elbisesi dili. Oran tutarliligi: ayni studyonun kalemi (asagida). |
| **09-a-line-puff-kol-midi.png** | Lilas Dress, deer-and-doe | Balon kollu kare yaka midi: bizim `balloon` kol eksenimizin referans cizimi. Bel olculebilir. |

## Neden besi de deer-and-doe?

"Butun flatler ayni ideal bedenden cikmis gibi" (Damla, 5. madde) tam olarak tek
studyonun yaptigi seydir: bes cizim ayni croquis'ten ciziliyor, oran tutarliligi
secimle degil kaynakla geliyor. Folkwear adaylari (01, 02, 03) ya taramadan
gecirilmis eski cizimler (02'de cizgi kalitesi dusuk) ya da govdeyi tamamen orten
kaftan/empire kesimler; Helen's Closet adaylarindan 05 croquis govde uzerine
cizilmis (giysi disi murekkep olcumu bozar), 04 dusuk cozunurluklu ve coklu-figur.

## Elenenlerin tek satirlik gerekceleri

- 01 kaftan: govde hicbir hatta gorunmuyor (kaftan), olculecek oran yok.
- 02 robe: tarama kalitesi dusuk, kesikli cizgi/dikis ayrimi belirsiz.
- 03 empire: empire kesim dogal beli gostermez; ayrica cok kucuk figurler.
- 04 Holmes: ayni ailede 06 daha temiz; dusuk cozunurluk, ust uste 6 figur.
- 05 March: gri croquis govdeler giysi silueti olcumune karisir.
- 08 Mistral: kimono kol — kol/govde siniri yok, gogus ve kol oyugu okunamaz.
- 10 Alice: buzgulu empire; dogal bel cizimde yok.
- 11 Azure: kutu kesim tiered; govde hatti hic gorunmuyor.
- 12 Quartz: kimono kol, 08 ile ayni sebep.
- 15 Sallie: gorunum B fitted ama bel EMPIRE hizasinda; dogal bel olcumu yaniltir.

## Olcumun sinirlari (flat-olcum.json'da da yazili)

- Gogus yalnizca kolsuz iki capada (13, 14) dogrudan olculdu; kollu uc flatte kol
  govdeyi orter, "kol altindaki ilk gorunur satir" gercek gogus hatti degildir —
  yanlis olcmektense olcmemek secildi.
- Kalca BES flatte de olculmedi: bel alti her adayda etek klosu tasiyor; olculecek
  sey mankenin kalcasi degil etegin klosu olurdu. En kisitlayici deger: fark 0
  (gogus ve kalca insan cizelgesinde kalir, yalniz bel donusur).
