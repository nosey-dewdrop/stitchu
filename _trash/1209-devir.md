# 1209 DEVİR — 12 Eylül sabahı okunacak

> Bu dosyayı önce oku. Ayrıntı: `KOSU/1209-kosu.md`. Otorite: `HEDEF.md`.

## Tek cümle
Kolevi ve okuma bozukluğunun KÖK NEDENLERİ bulundu ve düzeltildi (ikisi de koddaydı);
göz hakemi kuruldu ve ayırt ettiği kanıtlandı; altın kıyası 1/5 → 2/5 (iki fotoğraf
hâlâ eski prompt'la okunmuş, taze ölçüm sürüyordu).

## Bu gece ne kapandı (21 commit, hepsi kod+ölçüm; elle veri düzeltme YOK)

| iş | kanıt |
|---|---|
| tek flat hattı (G2) | eski çizici silindi, taşıma bayt-aynı, `kapi.sh G2` exit 0 |
| okuyucu koda döndü | `claude -p` alt süreci, şema doğrulamalı, `uretenScript` damgalı |
| **kolevi çizilmiyordu** | ÇÖZÜLDÜ: omuz taşması +55.4mm → −10.9mm, kolevi her çizimde var |
| etek ucu kavisi | tuttu (A-line'da ortada sarkma, yanlarda yükselme) |
| **göz hakemi** | kuruldu; iyi çizim 4/4, bozuk 1/4; yayılım 3 → 0 |
| **sözlük prompt'a sızmıştı** | bulundu ve atıldı (sabit taban kuralı) |
| çizici çökmesi | 1 noktalı öge artık `ERR_SEMA`, önbelleğe yazılmıyor |
| kapı E2 yanlış alarmı | düzeltildi; gerçek eşik düşürmeyi hâlâ yakalıyor (65→20 kırmızı, yanlışlandı) |

## İki kök neden — ikisi de koddaydı, 28 tur boyunca görülmemişti

**1. Kolevi.** `engine/src/body.cpp:174` croquis omzunu *ön izdüşüm* genişliğinden,
göğsü *kesit* yarı genişliğinden hesaplıyordu. İki farklı tanım yan yana → omuz göğsün
55.4mm dışında → aradaki bölge delik değil DOLU. Okuma ne kadar oyarsa oysun kolevi
çizilmez. Düzeltme iki bağımsız ölçümle (satıcı flat'leri 0.9179, satın alınmış Locket
Top kalıbı 0.9187 — 0.0008 içinde uyuştular) → omuz 188.8 → 122.5mm.

**2. Prompt uydurma kural koymuştu.** "bel HER ZAMAN waist", "kalca HER ZAMAN hip".
`contract/siluet-v1.json`'da `waist` kelimesi **0 kez** geçiyor. Altın kopyalar giysiye
göre taban SEÇİYOR (bol elbisede bel→`bustLine`, kısa üstte→`waist`). Tek başına 14/18
kontur skoruna mal oluyormuş. HEDEF md.9 ihlali: sözlük çiziciden atılmıştı ama
prompt'ta yaşıyormuş.

## Göz hakemi (`KOSU/goz.mjs`) — nasıl çalışıyor, neden böyle

İlan görselini (fotoğraf + satıcının kendi flat'i) SOLA, bizim çizimi SAĞA koyar ve
gören modele sorar: *müşteri soldakini görüp sağdakini alsa aynı giysiyi aldığını
düşünür mü?* Dört bölge: yaka/omuz · kolevi/kol · bel-gövde · etek biçimi-boyu.
Skor 0–4, üç koşu ORTANCASI.

**Ölçüt kaymaz:** internetten çekilmiyor, girdinin kendisi. (24 turu bitiren hastalık
buydu: her tur farklı satıcı seti ölçüt çekiliyordu.)

**Elenen dört yaklaşım (hepsi ölçümle):** bindirme+otomatik hizalama, kenar-enerjisi
hizalama, satıcı flat'ini otomatik bulma, piksel metriği (bozuk çizim 0.805/0.777/0.043
— altın 0.805/0.770/0.050; gözle biri giysi değil ama SAYILAR AYNI).

**İki ayar:** (a) yapı sayılır, süsleme sayılmaz (fisto/dantel/desen/renk kusur değil) —
varyansın kaynağı buydu; (b) üç koşu ortancası.

**Kör noktası:** kolevisi HİÇ olmayan çizime `kolevi/kol: EVET` dedi. Kolevi kapısı
göz hakemine BAĞLANMAZ, geometrik ölçüme bağlanır.

**Beklenmeyen:** altın kopyanın kendi eksiğini yakaladı (etsy-08'de peplum çizilmemiş,
ilan metni "etek ucunda pili" diyor, insan kaçırmış). Kapının tavanını altın değil
GERÇEK GİYSİ belirliyor.

## Nerede kaldık — ÖLÇÜLDÜ (5 fotoğrafın 5'i de taze prompt'la okundu)

```
etsy-01  kontur 18/18  oge 4/5  sapma 5.8%   GECTI
etsy-03  kontur 18/18  oge 6/8  sapma 2.8%   GECTI    <- 14/18, 5.4% idi
etsy-05  kontur 18/18  oge 3/6  sapma 4.6%   kaldi    <- sapma 8.6% idi
etsy-08  kontur 16/18  oge 2/4  sapma 5.7%   kaldi    <- 14/18, 9.1% idi
etsy-10  kontur 16/22  oge 6/6  sapma 4.8%   kaldi    <- sapma 10.1% idi
```
**Başlangıç 1/5 → şu an 2/5.** Kapı 4/5 istiyor. VARILMADI, iddia yok.

### Ama sayıların içi: SAPMA ÇÖZÜLDÜ
Geceye 8.6–10.1% ile başlandı, şimdi **beşi de 2.8–5.8%** (eşik 8%). Yani konum ve
oran doğruluğu artık sorun değil. Kontur da iyileşti (üçünde 18/18).

### Kalan üç kaybın TEK sebebi: `pens` kaçıyor
```
etsy-05  on: okuyucu=[roba, buzgu, dikis]        altin=[dikis, dikis, buzgu, PENS]
         arka: okuyucu=[fermuar]                 altin=[dikis, dikis, PENS, fermuar]
etsy-08  on: okuyucu=[pat, dugme, dikis, pili]   altin=[pat, dugme, PENS]
         arka: okuyucu=[dikis, pili]             altin=[PENS]
etsy-10  oge 6/6 TAM — yalnız kontur 16/22'den kaldı
```
Okuyucu pensi görüyor ama `dikis` diye etiketliyor.

### ⚠ PROMPT'A KURAL EKLEMEK ÇÖZÜM DEĞİL — ölçüldü
`KOSU/siluet-oku-prompt.mjs` pens'i zaten üç yerde anlatıyor: tanım (satır 317-331,
"UCLARIN BIRLESMESI pens yapar"), nerede aranacağı (6a-2), ve son kontrol listesinde
ÜÇ ayrı madde. Buna rağmen kaçıyor. N3 de 11 denemede aynı duvara çarptı ve prompt
24k'yı geçince sonucun 0/5'e çöktüğünü ölçtü (şu an 23.9k).
→ Sıradaki işçi prompt'a YAZMASIN. Farklı MEKANİZMA gerekiyor (öneriler aşağıda).

### etsy-08'de okuyucu insandan İYİ gördü (kıyasın sınırı)
Okuyucu `pili` yazdı, altın yazmadı. Ama ilan metninin kendisi "etek ucunda pili"
diyor — okuyucu haklı, İNSAN kaçırmış. Kıyas altını temel aldığı için bu DOĞRU gözlem
ceza sayılıyor. Göz hakemi aynı şeyi ters yönden gösterdi (altının peplum eksiğini
yakaladı). → Kıyasın tavanı altın, göz hakeminin tavanı gerçek giysi. İkisi BİRLİKTE.

## Sıradaki işin ilk üç maddesi

1. **`pens` kaçağını mekanizmayla çöz — prompt'a YAZMA.** Üç aday:
   (a) İKİ AŞAMALI OKUMA: birinci çağrı konturu+ögeleri versin; ikinci çağrı YALNIZ
       "bu giysi göğse/bele oturuyor mu, oturuyorsa onu sağlayan pens/dikiş nerede"
       sorusunu sorsun. Tek soruya odaklanan çağrı, 24k'lık listenin içindeki bir
       maddeden daha güvenilir.
   (b) ÜÇ KOŞU + UZLAŞMA: aynı fotoğraf 3 kez okunsun, ögelerde çoğunluk alınsın
       (`KOSU/goz.mjs` içindeki ortanca desenine bak — göz hakeminde yayılımı 3'ten
       0'a indirdi).
   (c) KOD KAPISI: `oturma.gogus||oturma.bel` true ve baştan başa dikiş yoksa, okuma
       `ERR_PENS_YOK` ile REDDEDİLSİN. Sessiz geçiş yerine adıyla ret — repo yasası.
2. **VARYANSI ÖLÇ.** Hiç ölçülmedi. Aynı fotoğraf 3 kez okunsun; `oge` 2/5↔4/5
   salınıyorsa bu gecenin düzeltmeleri tutmuş sayılmaz. Okuyucuya da 3-koşu-ortancası
   gerekebilir (`KOSU/goz.mjs` içindeki `GOZ_KOSU` desenine bak).
3. **Prenses dikişi X çaprazlaması.** Okuyucu üst ucu `neckFront*0` (ön orta) veriyor,
   `ayna:true` ile iki kopya merkezden çıkıp X yapıyor. Altında üst uç omuzda
   (`shoulderTip*0.75`) ve dikiş `bustApex`'ten geçen İKİ parça. Prenses dikişi tanımı
   gereği göğüs tepesinden geçer — prompt bunu bilmiyor.

## Bilinen açık kusurlar (ölçülmüş, uydurma değil)
- `siluet-yanlisla` kural 4: etsy-10 askı ucu omuzu 3mm aşıyor (125.5 > 122.5).
  Okuyucu 0.80 diyor, altın 0.72, fotoğraf ölçümü 0.732. **Croquis'i geri büyütme** —
  kolevini yeniden öldürür. Düzeltme okuyucunun askı oranında.
- `pens` vs `dikis`: etsy-08 `oge=2/4`, 8 koşunun 8'inde aynı. Pens gerekiyor, model
  3 noktalı `dikis` yazıyor. N3 tanımı biçimle verdi ("kapalı V, bacaklar uçta
  BULUŞUR"), etkisi ölçülmedi.
- Okuyucu çıktısında silüet hâlâ bozuk olabiliyor (etsy-08'de bel aşırı daralıp etek
  çan gibi patlıyordu). Altın aynı croquis'le düzgün veriyor → sorun OKUMADA.

## Değişmez kurallar (kapı yakalar)
- `KOSU/altin/**` okunmaz/referans edilmez — cevap anahtarı.
- `contract/*`, `engine/tests/*` eşik SAYILARI düşürülmez (alan EKLEMEK serbest).
- croquis'e dokunulmaz (12 Eyl'de ölçülerek düzeltildi).
- çiziciye yeni `case` eklenmez (20 sabit), `vocab.json` büyümez (132 sabit).
- `kapi.sh` / `altin-kiyas.mjs` / `goz.mjs` değiştirilmez — ölçeni değiştirmek
  ölçümü değiştirmektir.
- önbellek ELLE düzenlenmez; alt ajan doğurulmaz; branch açılmaz.

## Prompt tuzağı (ölçülmüş)
Prompt 24k karakteri geçince sonuç 0/5'e ÇÖKÜYOR — yeni kurallar eskileri bastırıyor.
Şu an 24.5k. Kural EKLEME; yer açmak için tekrarı sil. Varyansı kesmenin yolu daha çok
kural değil, daha NET TANIM.
