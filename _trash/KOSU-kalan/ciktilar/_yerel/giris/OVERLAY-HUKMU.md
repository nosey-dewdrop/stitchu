# Siluet olcumu — overlay ile GORULEN hukum (A3, 2026-09-08)

Bu dosya `web/js/vision-siluet.js`'in ciktisini fotograf ustune bindirilmis
overlay'lere BAKARAK yargilar. Otomatik olcutler (doluluk / kenar puruzu /
orta kaymasi) tek basina yetmedi ve bunu ADIYLA yaziyorum: vinyet esigi
denendi, overlay ile karsilastirilinca TERS calistigi olculdu (dogru izleyen
fotografi reddediyor, yanlis izleyeni geciriyordu), o yuzden esik hukumden
CIKARILDI, sayi bilgi olarak kaldi.

Overlay'ler telifli fotograf tasidigi icin `_yerel/` altinda ve COMMIT EDILMEZ.

| fotograf | siluet giysiyi izliyor mu | omuz | bel | etek ucu | KULLANILABILIR ORAN |
|---|---|---|---|---|---|
| biba-O1194418-dress | EVET — dis hat elbiseyi birebir izliyor, tripod etek ucunda kesildi | dogru (500px, omuz basi) | DOGRU (251px, dogal belde) | dogru | boy/omuz, bel/omuz, bel/enGenis, belKonum, etekUcu/omuz |
| biba-O120579-dress | EVET — dis hat elbiseyi ve KOLLARI izliyor | YANLIS: manken basi kesilince "ust" satir omuz degil yaka ustu | YANLIS: 313px cizgisi ACIK KOLLARIN uzerine dustu, bel degil | dogru | YALNIZ boy orani; genislik oranlari kollar yuzunden KULLANILMAZ |
| mary-quant-O1454732-dress | HAYIR — dis hat elbisenin cok disinda buyuk bir oval: VINYET izleniyor | yanlis | yanlis | yanlis | HICBIRI |
| mary-quant-O365926-dress | KISMEN — ust kenar ve etek ucu dogru, YAN kenarlar giysinin icine kayiyor (soluk cizgili kumas duvar rengine yakin) | kismi | supheli | dogru | yalniz boy orani, ZAYIF etiketiyle |
| mary-quant-O365926-dress-arka | KISMEN — on yuzle ayni davranis | kismi | supheli | dogru | yalniz boy orani, ZAYIF etiketiyle |
| ossie-clark-O138369-dress | OLCULEMEDI — zemin testinde reddedildi (askida cekim, krem duvar, sol-sag farki 41.2 > 40) | - | - | - | HICBIRI |

## Ne ogrenildi (dogrudan olcum)

1. **Siluet olcumu bu fotograf setinde GENEL DEGIL.** 6 fotografin 1'inde tam,
   1'inde kismi-kullanilir, 4'unde kullanilamaz. Muze cekimleri duz zeminli
   degil; beyaz manken + acik zemin ayrimi kaldiriyor.
2. **Kol pozisyonu olcumu bozuyor.** Acik kollu cekimde (biba-O120579,
   mary-quant-O1454732) "en dar nokta" bel degil kol arasi olabiliyor.
   Bel yerini bulmak icin siluet TEK BASINA yetmez — poz landmark'i gerekir.
3. **Poz landmark'i (kaynak a) kurulmadi.** Gerekce ve etkisi: acikSorular.
