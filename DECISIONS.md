# stitchu kararlar (DECISIONS.md)
> icra belirsizliginde secilen yol / neden / geri alma maliyeti (CLAUDE.md router-olmama kurali 2026-07-19)

- 2026-07-19 askili babydoll: drawstring_babydoll straps:true ama repo motoru cizmiyordu (K2-minify budamis). KARAR: strapShape geri getirildi (Damla emri askili olsun) / NEDEN: veri-cizim tutarliligi + Damla onayi / GERI ALMA: ucuz (fonksiyon+blok cikarilir). STYLE-PIN askili render ile guncellendi.
- 2026-07-19 ilk pattern blog post (ruffled-strap-drawstring-babydoll): mevcut Pattern Blog sistemine 17. giris (meta.json + COPY + gen-pattern-pages sablonuna flat bolumu). Fashion flat STYLE-PIN + 8 parca kalip (preview-truth spec, birebir) + aski drafted 74x340mm + moat cumlesi. KARAR: yeni sayfa degil mevcut sisteme giris (Damla emri) / GERI ALMA: ucuz (meta+copy cikar). NOT: preview-truth.json drawstring_babydoll straps/ruffledStraps kaydi BAYAT (declared-but-not-drawn diyor ama motor bu spec-te askiyi CIZIYOR + ben flat-e strapShape ekledim; hem flat hem kalip cizyor) -> K3 mandali guncellenmeli, ayri is.
- 2026-07-19 review.waistNip/armholeHollow -> flat.style (Damla karari: STIL parametresi, kalip geometrisine etkisi yok). Sema reviewParams $def kaldirildi, flat.own dogrudan sayi; tables.json review blogu -> flat.style. KANIT: golden byte-identical (motor okumuyordu zaten), contract GREEN, ctest 47/47. GERI ALMA: ucuz (sema+tables). Golden dokunulmadi = normal sevk.
- 2026-07-19 uretim drape asimetri (taste-lexicon "yelpaze" duzeltmesi): sol/sag AYRI drapePlan (ayri seed) - onceden ayna simetrik yelpazeydi, simdi iki yon farkli dusuyor. KARAR: uretim renderer iyilestirmesi / GERI ALMA: ucuz. golden byte-identical + babydoll STYLE-PIN byte-identical (referans motordan gelir, etkilenmez), ctest pass. Pin gerektirmez.
- 2026-07-19 gode primitifi (F1 mihenk 3, izole worktree agent): SkirtStyle::Gore, 6 panel, hem flare 90mm/kenar. KARAR: opt-in (default degil) -> golden BYTE-IDENTICAL (kendi olctum: cmp PASS 23406 satir), re-pin GEREKMEDI (pin gerektiren is cikmadi). ctest 48/48 (gore_check bel yayi 714mm truing 0.000mm). GERI ALMA: ucuz (enum+skirt.cpp+test). WASM DEPLOY EKSIK (web/vendor eski, gode canli degil; build-wasm.sh gerek - ayri adim). Native motor cizyor.
- 2026-07-19 eval-150 KARARI (Damla): etiketleme 115/150-te DURDU, bilincli erteleme (tek kullanici, foto hacmi yok, ogretmen maliyeti dogrudan, kaskad satis-oncesi ihtiyac). 115 ILE KALIBRASYON YAPILMADI; gate 150-ye kadar KIRMIZI-durust (kod zaten >=150 istiyor, mekanik). v2 taksonomi kanitlari (keyhole/cut-out, off-shoulder, on-fiyonk, strapless/band-top) v1.2 aday listesine islendi. Konu satis hazirligina kadar KAPALI. Kayit: cascade-router.mjs yorumu + kapanis raporu bolum 4+8.
- 2026-07-19 MIHENK-05 v7 secildi (kalemim, lace v-neck babydoll kisa puff kol bagcikli). Etiket duzeltmesi: izgara "uzun kol" YANLISTI, cizim kisa puff dogru; styles.json label+own guncellendi (sleeveLen 9->14 cuffGather 1.2->1.6, referans kalem revizyonu Damla onayi). Ikinci STYLE-PIN. MERAK BULGUSU (gercek uzun-kol denendi reports/gate/mihenk05-longsleeve/): motor bu stilde uzun kolu TAM CIZEMIYOR - puffSleeve kisa puff icin tasarli, sleeveLen 22te bile kisa kaliyor; uzun kol ayri kol geometrisi (dirsek/bilek duz kol) gerektirir = v1.2 adayi. GERI ALMA: ucuz. style_check+golden PASS.

## 2026-07-20 emsal flat crop+measure (madde 5)
- Karar: design_patterns/ (168 ham Etsy/Pinterest ekran goruntusu) icindeki gomulu flat cizimleri
  icerik-tabanli (beyaz-zemin + dusuk-doygunluk + dusuk-ten skoru) otomatik kirp, ORAN-tabanli olc
  (bel/kalca oyuk orani, ic-cizgi sayisi, hem dalga sayisi -- olcekten bagimsiz), medyan+%25-75 band
  olarak contract/gusto-corpus-external.json'a yaz. Olculemeyen metrige "OLCULMEDI".
- Neden: emsaller tek/temiz/bilinen-olcekli flat degil (grid thumbnaili); mutlak mm olcum uydurma olur,
  oran-tabanli olcum olcekten bagimsiz oldugu icin savunulabilir. Damla: "modelimi egitmek icin, satis degil".
- Geri alma maliyeti: dusuk -- yeni dosya, donmus gusto-corpus v1'e dokunulmuyor, motor/golden degismedi.

## 2026-07-20 madde 3 flat kaldirma + style-lint mandali
- Karar: amator flat'i tamamen kaldir (Damla: "metinle kalsin"), style-lint (f) mandali marker-tabanli
  (class="sketch"/aria "Technical flat sketch"/data-flat-style) + STYLE-PIN defteri kontrol.
- Neden: elle-yazilmis L-komut sematik figursuz/robotikti, figcaption "same engine" yalani soyluyordu.
  Marker-tabanli cunku kalip parcalarini (grainline/Skirt Front) yanlislikla yakalamamali.
- Deploy preview-truth 3-FAIL (gore/wrap, onceki oturum madde 8) yesillenince; madde 3 kodu hazir.
- Geri alma: dusuk (generator + lint; motor/golden degismedi).

## 2026-07-20 tur1: 3 bare top referans kaleme (madde 8/9)
- Karar: buildHalf'a garment==='top' koşullu 3 dal (topLength düz gövde hem / crew-scoop yuvarlak yaka /
  kolsuz armhole sıkılaştırma) + styles.json 3 top kaydı + tryReferencePen spec->styleKey top eşlemesi.
  Fallback şematik yol KULLANILMADI (3 top da referans kalem 940x680 imzasından çiziliyor).
- Neden: hedef listesinin en basit 3'ü (kolsuz top) bile fallback'ten robotik çiziliyordu. buildHalf zaten
  figür kuralını içeriyor; eksik olan top-uzunluk davranışı + doğru yuvarlak yaka + kolsuz armhole idi.
- Pin disiplini: HER dokunuşta golden md5 + ctest style_check koştu; 7/7 pinli stil BYTE-IDENTICAL
  (garment alanı taşımadıkları için top dallarına hiç girmiyorlar). Sessiz geçti, kart gerekmedi.
- Geri alma: orta (buildHalf'a dokunuldu ama koşullu+pin-korumalı; geri almak 3 edit revert).
- Hakem (bağımsız, çift kanat) sonucu bekleniyor: tur1a 0/3 (FLAT frendi, V-yaka+armhole balon), düzeltildi, tur1b yargıda.
