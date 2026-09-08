# A3 — fotograf okuma: uc kaynak, hangisi ne kadar tuttu?

Bu belge A3'un iki karar gerekcesini tasir: (1) poz landmark'i icin neden
MediaPipe secildi, (2) uc kaynagin her biri bu fotograf setinde NE KADAR calisti.
Sayilar olculdu, tahmin degil.

## Kaynak (a) — poz landmark'i: neden MediaPipe Tasks Vision?

Secilen: `pose_landmarker_lite` (float16), self-host `web/vendor/pose/`.

| olcut | gerekce |
|---|---|
| anahtar gerektirmiyor | Damla'nin 6 Eyl karari: fotograf okumasi icin dis servise para/veri gitmez. MediaPipe tarayicida WASM ile kosar. |
| self-host edilebilir | model + wasm + bundle `web/vendor/pose/` altinda (15 MB). CDN'e canli bagimlilik YOK; headless Chrome'da da yuklenir (olculdu). |
| lite surumu | makine 8 GB. lite 5.8 MB; full surum bellek yiyor. |
| 33 nokta yeterli | bize omuz/dirsek/bilek/kalca lazim; el ve yuz noktalari gereksiz. |

Elenenler: bulut poz API'leri (anahtar + veri disari cikar), OpenPose (kurulum
agir, tarayicida kosmuyor), yalniz-siluet (asagida olculdu: yetmiyor).

### Tarayicida gercekten kostu mu? EVET, olculdu

`node KOSU/0509-a3-poz.mjs <foto>` headless Chrome acar, modulu yukler, olcer.
Iki arac onarimi gerekti ve ikisi de ADIYLA yazildi:
1. `file://` uzerinden ES modul import'u CORS ile engelleniyordu (DOM 774 bayt,
   script hic kosmadi) -> gecici yerel HTTP sunucusu (127.0.0.1, disariya cikmaz).
2. Headless Chrome'da WebGL yoktu (`Cannot read properties of undefined
   (reading 'activeTexture')`) -> `--use-gl=swiftshader --enable-unsafe-swiftshader`.

## Uc kaynak, bes fotograf: olculen sonuc

| fotograf | (a) poz | (b) siluet | (c) isci okumasi |
|---|---|---|---|
| biba-O1194418-dress | ERR_NO_POSE (manken govdesi, bas yok) | OLCULDU / GUVENILIR | tam |
| biba-O1194418-dress-arka | ERR_NO_POSE | OLCULDU / GUVENILIR | tam |
| biba-O120579-dress | **OLCULDU, guven 0.759** | OLCULDU ama genislik oranlari BOZUK | tam |
| mary-quant-O365926-dress | poz bulundu, guven **0.180** -> esik alti, KULLANILMADI | OLCULDU / ZAYIF | tam |
| mary-quant-O365926-dress-arka | ERR_NO_POSE (arka yuz) | OLCULDU / ZAYIF | tam |

**Kaynak (a) 5 fotografin 1'inde kullanilabilir sonuc verdi.** Sebep tahmin
degil, olculdu: model INSAN pozu icin egitildi, girdiler muze manken/aski
cekimleri. Tek isabet (biba-O120579) tam da BASI VE KOLLARI olan cekim.

### Ama o tek isabet, (b)'nin bilinen hatasini cozdu

biba-O120579'da siluet sacma bir sayi veriyordu: `enGenis/omuz = 2.1558`
(omuzun iki kati genislik). Poz landmark'i ayni fotografta:

| kalem | siluet (b) | poz (a) |
|---|---|---|
| bel konumu | 0.4894 (YANLIS — kollarin govdeye yaklastigi yer) | **0.405** |
| genislik aciklamasi | "en genis nokta" = 2.16 x omuz | `kolBoyu/omuzGen = 1.2083` -> kollar acik ve omuzdan uzun |

Yani (a), (b)'nin neden yanildigini ADIYLA soyledi. Bu, uc kaynakli tasarimin
kagit uzerinde degil olcumle dogrulanmasidir.

## Yasa 5 uygulandi mi? (celiskide olcum kazanir)

14 celiski satiri var (`KOSU/onbellek/*.json` celiskiTablosu), hepsinde
`kazanan = "olcum"`. Gecit bunu zorluyor: `engine/tests/0509-vision-sema.sh`
`kazanan != 'olcum'` gorurse KIRMIZI basar (enjekte edilerek yanlislandi).

Onemli olan sonuclardan uc tanesi:
- **Dosya adi curutuldu.** `biba-O1194418-dress-arka.jpg` ARKA diyor; olcum
  ikisinin ayni yuz oldugunu gosterdi (boy/omuz 2.3459 vs 2.3199, belKonum
  0.3570 vs 0.3552). Dosya adi degistirilmedi (GIRDI/ salt okunur), okuma
  `gorunum: "on"` yazdi ve celiski tabloya girdi.
- **Kadraj hatasi olculdu.** Ayni giysinin onu ve arkasi ayni boyda olmak
  ZORUNDA; siluet %15 fark verdi -> fark giysiden degil kadrajdan.
- **Olcum kendini curuttu.** biba-O120579'da 2.16 degeri "bu fotografta benim
  genislik oranlarim kullanilamaz" demek oldu; op'a SUPHELI etiketiyle girdi.
