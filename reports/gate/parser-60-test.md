# Parser 60-cümle testi

doğru-spec 40/40 · boşluk-doğru 11/10 · red-doğru 8/10 · **YANLIŞ 1**

regex-yeterli 22 · llm-gerekti 18 (regex kaçırdı 18)

| # | cümle | grup | beklenen | sonuç | OK | spec | eksik_primitif | çelişki |
|---|-------|------|----------|-------|----|----|---------------|--------|
| 1 | kolsuz bisiklet yaka pensli crop atlet | gercek | spec | spec | OK | `{"garment":"top","neckline":"crew","shaping":"dart","sleeve":"none","topLength":"cropped"}` | - | - |
| 2 | kolsuz prenses U yaka A kesim mini elbise | gercek | spec | spec | OK | `{"garment":"dress","neckline":"scoop","shaping":"princess","sleeve":"none","skirt":"aLine","length":"mini"}` | - | - |
| 3 | kayık yaka kolsuz A kesim arkadan bağlı mini elbise | gercek | spec | spec | OK | `{"garment":"dress","neckline":"boat","sleeve":"none","skirt":"aLine","length":"mini"}` | - | - |
| 4 | kolsuz kare yaka büzgülü peplum üst | gercek | spec | spec | OK | `{"garment":"top","neckline":"square","sleeve":"none","peplum":"full"}` | - | - |
| 5 | balon kollu kare yaka büzgülü peplum üst | gercek | spec | spec | OK | `{"garment":"top","neckline":"square","peplum":"full"}` | - | - |
| 6 | boxy kısa kollu bisiklet yaka üst | gercek | spec | spec | OK | `{"garment":"top","neckline":"crew","shaping":"boxy"}` | - | - |
| 7 | kolsuz V yaka pensli midi elbise | gercek | spec | spec | OK | `{"garment":"dress","neckline":"vNeck","shaping":"dart","sleeve":"none","length":"midi"}` | - | - |
| 8 | prenses dikişli kayık yaka mini elbise | gercek | spec | spec | OK | `{"garment":"dress","neckline":"boat","shaping":"princess","length":"mini"}` | - | - |
| 9 | düz kollu bisiklet yaka pensli hip boy üst | gercek | spec | spec | OK | `{"garment":"top","neckline":"crew","shaping":"dart"}` | - | - |
| 10 | kolsuz U yaka A kesim gode etek mini elbise | gercek | spec | spec | OK | `{"garment":"dress","neckline":"scoop","sleeve":"none","skirt":"aLine","length":"mini"}` | - | - |
| 11 | balon kollu bebe yaka mini elbise | gercek | spec | spec | OK | `{"garment":"dress","length":"mini","collar":"peterPan"}` | - | - |
| 12 | kolsuz kare yaka fermuarlı pensli midi elbise | gercek | spec | spec | OK | `{"garment":"dress","neckline":"square","shaping":"dart","sleeve":"none","length":"midi"}` | - | - |
| 13 | düğmeli bisiklet yaka düz kollu hip üst | gercek | spec | spec | OK | `{"garment":"top","neckline":"crew"}` | - | - |
| 14 | kolsuz fırfırlı askı kare yaka crop üst | gercek | spec | spec | OK | `{"garment":"top","neckline":"square","sleeve":"none","topLength":"cropped","straps":"ruffled"}` | - | - |
| 15 | prenses U yaka gode etek midi elbise | gercek | spec | spec | OK | `{"garment":"dress","neckline":"scoop","shaping":"princess","skirt":"gore","length":"midi"}` | - | - |
| 16 | kolsuz bisiklet yaka büzgülü peplum crop üst | gercek | spec | spec | OK | `{"garment":"top","neckline":"crew","sleeve":"none","topLength":"cropped","peplum":"full"}` | - | - |
| 17 | boxy bisiklet yaka crop atlet | gercek | spec | spec | OK | `{"garment":"top","neckline":"crew","shaping":"boxy","topLength":"cropped"}` | - | - |
| 18 | kolsuz V yaka A kesim arkadan bağlı midi elbise | gercek | spec | spec | OK | `{"garment":"dress","neckline":"vNeck","sleeve":"none","skirt":"aLine","length":"midi"}` | - | - |
| 19 | balon kollu U yaka pensli mini elbise | gercek | spec | spec | OK | `{"garment":"dress","neckline":"scoop","shaping":"dart","length":"mini"}` | - | - |
| 20 | düz kollu kayık yaka prenses hip boy üst | gercek | spec | spec | OK | `{"garment":"top","neckline":"boat","shaping":"princess"}` | - | - |
| 21 | yakası kare, kolsuz, bol bi şey | devrik | spec | spec | OK | `{"neckline":"square","sleeve":"none","shaping":"boxy","garment":"top"}` | - | - |
| 22 | kolları büzgülü eteği A kesim bi elbise olsun | devrik | spec | spec | OK | `{"sleeve":"balloon","skirt":"aLine","garment":"dress","neckline":"crew"}` | - | - |
| 23 | prensesli dikişli midi elbise istiyorum | devrik | spec | spec | OK | `{"shaping":"princess","length":"midi","garment":"dress","neckline":"crew"}` | - | - |
| 24 | peplumlu kare yakalı üst | devrik | spec | spec | OK | `{"peplum":"full","neckline":"square","garment":"top"}` | - | - |
| 25 | boyu mini olsun, kolsuz, U yakalı, prenses | devrik | spec | spec | OK | `{"length":"mini","sleeve":"none","neckline":"scoop","shaping":"princess","garment":"dress"}` | - | - |
| 26 | yakası bisiklet, kolu yok, penslimiş | devrik | spec | spec | OK | `{"neckline":"crew","sleeve":"none","shaping":"dart","garment":"top"}` | - | - |
| 27 | arkadan bağlamalı kayık yakalı mini elbise olur mu | devrik | spec | spec | OK | `{"closure":"tieBack","neckline":"boat","length":"mini","garment":"dress"}` | - | - |
| 28 | fermuarlı bi elbise, kare yaka, pensli | devrik | spec | spec | OK | `{"closure":"zipper","garment":"dress","neckline":"square","shaping":"dart"}` | - | - |
| 29 | üstü crop olsun bisiklet yakalı kolsuz | devrik | spec | spec | OK | `{"topLength":"cropped","garment":"top","neckline":"crew","sleeve":"none"}` | - | - |
| 30 | gode etekli U yakalı elbise | devrik | spec | spec | OK | `{"skirt":"gore","neckline":"scoop","garment":"dress"}` | - | - |
| 31 | düğmelisi olsun, bisiklet yakalı, kolları düz | devrik | spec | spec | OK | `{"closure":"buttons","neckline":"crew","sleeve":"straight","garment":"top"}` | - | - |
| 32 | bebe yakalı balon kollu mini elbise yapalım | devrik | spec | spec | OK | `{"collar":"peterPan","sleeve":"balloon","length":"mini","garment":"dress"}` | - | - |
| 33 | salaş kısa kollu bir üst, yaka bisiklet | devrik | spec | spec | OK | `{"shaping":"boxy","sleeveLength":"short","garment":"top","neckline":"crew","sleeve":"straight"}` | - | - |
| 34 | V yakalıymış, kolsuzmuş, A kesim eteği varmış | devrik | spec | spec | OK | `{"neckline":"vNeck","sleeve":"none","skirt":"aLine","garment":"dress"}` | - | - |
| 35 | fırfırlı askısı olan kare yakalı crop | devrik | spec | spec | OK | `{"straps":"ruffled","neckline":"square","topLength":"cropped","garment":"top"}` | - | - |
| 36 | büzgüsü olan peplumlu bir üst, kare yaka | devrik | spec | spec | OK | `{"shirred":"physics","peplum":"full","garment":"top","neckline":"square"}` | - | - |
| 37 | eteği gode, yakası U, boyu midi elbise | devrik | spec | spec | OK | `{"skirt":"gore","neckline":"scoop","length":"midi","garment":"dress"}` | - | - |
| 38 | kolsuzdu, kare yakalıydı, hip boyundaydı üst | devrik | spec | spec | OK | `{"sleeve":"none","neckline":"square","topLength":"hip","garment":"top"}` | - | - |
| 39 | prensesli, kayık yakalı, kolları uzun elbise | devrik | spec | spec | OK | `{"shaping":"princess","neckline":"boat","sleeve":"straight","sleeveLength":"long","garment":"dress"}` | - | - |
| 40 | pensli midi bir elbise, yakası derin yuvarlak | devrik | spec | spec | OK | `{"shaping":"dart","length":"midi","garment":"dress","neckline":"scoop"}` | - | - |
| 41 | halter yakalı maxi elbise | karsiliksiz | boşluk | boşluk | OK | `-` | halter,maxi | - |
| 42 | korse bağlı büstiyer | karsiliksiz | boşluk | boşluk | OK | `-` | lace-up | - |
| 43 | tam kloş çember etekli elbise | karsiliksiz | boşluk | boşluk | OK | `-` | full-circle | - |
| 44 | gömlek yakalı tunik | karsiliksiz | boşluk | boşluk | OK | `-` | shirt,tunic | - |
| 45 | kalp yaka spagetti askılı | karsiliksiz | boşluk | boşluk | OK | `-` | sweetheart,spaghetti | - |
| 46 | palazzo pantolon | karsiliksiz | boşluk | boşluk | OK | `-` | trousers | - |
| 47 | cap kollu elbise | karsiliksiz | boşluk | boşluk | OK | `-` | cap | - |
| 48 | cowl yaka üst | karsiliksiz | boşluk | boşluk | OK | `-` | cowl | - |
| 49 | pileli etekli elbise | karsiliksiz | boşluk | boşluk | OK | `-` | pleated | - |
| 50 | off-shoulder bluz | karsiliksiz | boşluk | boşluk | OK | `-` | offShoulder | - |
| 51 | kolsuz ama balon kollu elbise | celiski | red | red | OK | `-` | - | kolsuz + kollu (imkansız) |
| 52 | hem üst hem elbise | celiski | red | red | OK | `-` | - | üst + elbise (iki garment) |
| 53 | kolsuz uzun kollu bluz | celiski | red | red | OK | `-` | - | kolsuz + kollu (imkansız) |
| 54 | crop ama maxi boy elbise | celiski | boşluk | boşluk | OK | `-` | maxi | - |
| 55 | kolsuz düz kollu üst | celiski | red | red | OK | `-` | - | kolsuz + kollu (imkansız) |
| 56 | hem tişört hem elbise olsun | celiski | red | spec | YANLIŞ | `{"garment":"dress"}` | - | - |
| 57 | askılı ama uzun kollu elbise | celiski | red | red | OK | `-` | - | kolsuz + kollu (imkansız) |
| 58 | kolsuz kısa kollu atlet | celiski | red | red | OK | `-` | - | kolsuz + kollu (imkansız) |
| 59 | üst mü elbise mi, ikisi birden | celiski | red | red | OK | `-` | - | üst + elbise (iki garment) |
| 60 | balon kollu ama kolsuz mini elbise | celiski | red | red | OK | `-` | - | kolsuz + kollu (imkansız) |

## Ek kanıt — render-mappability (6 spec → mevcut styles.json stili)

Spec üreten cümlelerden 6'sı mevcut çizilebilir stile eşlendi (garment+neckline dolu, kombinasyon çizilir):

| cümle | eşlenen stil |
|---|---|
| kolsuz prenses U yaka A kesim mini elbise | dress_princess_scoop_aline |
| kolsuz kare yaka büzgülü peplum üst | top_sq_shirred_peplum |
| boxy bisiklet yaka crop atlet | top_crew_boxy_crop |
| kayık yaka kolsuz A kesim arkadan bağlı mini elbise | dress_boat_aline_tieback |
| prenses dikişli kayık yaka mini elbise | princess_dress / top_boat_princess |
| balon kollu kare yaka büzgülü peplum üst | top_sq_puff_shirred_peplum |

## Bulgular

- **PARSER DEFEKTİ (1):** "hem tişört hem elbise olsun" → çelişki YAKALANMADI, sessizce `{garment:"dress"}` üretti. Sebep: parse.mjs satır 148 çelişki regex'i `üst|top|bluz|atlet|tank` sayıyor ama `tişört|tshirt|tee|kaşkorse|cami|büstiyer|bustier|korse` YOK — oysa LEX (satır 21) bunları garment=top olarak tanıyor. Aynı terim listesi iki yerde ayrışmış. Düzeltme (parse.mjs sahibi yapar): satır 148 çelişki regex'ini LEX satır 21'deki top terim listesiyle eşitle. (Bu ajan parse.mjs'i değiştirmez — kısıt.)
- "crop ama maxi boy elbise" → maxi PARK olduğu için `boşluk` döndü (dürüst); çelişki değil boşluk doğru davranış.
