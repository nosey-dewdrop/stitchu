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

## 2026-07-23 GÜZELLİK TURU — KÖK 1c: göğüs apex konumu (sarkık/kocaman fix)
- KARAR: buildHalf figürel (dress + non-boxy figürel top) dalında göğüs apex Y'sini
  template ORANINA (apex_dusus_torso_frac=0.441, Zoe Hong piksel-kalibre) çek. Mevcut
  ölçüm: apexFrac 0.73 (torso omuz→bel'in %73'ü = bel çizgisine çok yakın = Damla'nın
  "sarkık/bele-yakın/aşağıda" şikâyetinin TAM sayısal karşılığı). Hedef 0.441.
- YÖNTEM (taslak seçimi): apex/bombe Y'sini SHOULDER-relative kur (stY + frac*torso),
  underarm/armhole (uaY) DEĞİL. Neden: apex'i uaY-relative bustHeight ile %44'e çekmek
  matematiksel imkânsız (uaY=161 zaten hedef bustY=132'nin altında); ayrıca uaY'ye
  dokunmak kol oyuntusunu kaydırır (geniş yüzey). Shoulder-relative apex = cerrahi:
  sadece göğüs bombesi yukarı çıkar, armhole byte-identical.
- KAPSAM: band-top (drawstring_babydoll) dalı DEĞİŞMEZ (ayrı if-dalı) → o pinli stil
  byte-identical. lace_vneck_70s de band/babydoll ailesi → pin korunur. figürel dress'ler
  + non-boxy figürel top'lar etkilenir (kasıtlı — güzellik turu hedefi bunlar).
- GERİ ALMA: orta (buildHalf tek blok, koşullu; revert 1 edit). Golden C++ etkilenmez
  (flat golden CSV'de değil). style_check 2 pinli stil byte-identical kalmalı — koşmadan
  önce ve sonra doğrulanacak.
- PIN: re-pin YAZILMAZ (güzellik turu kuralı: görsel + hakem şartlı, Damla ön-onaylı ama
  mühür Damla'da). Eski/yeni görsel + hakem PASS sonra re-pin kartı kuyruğa.

## 2026-07-23 KÖK 1 SONUÇ (2 iterasyon, 1 mühürlendi 1 geri alındı)
- İTER1 (apex Y shoulder-relative, template 0.441): MÜHÜRLENDİ. apexFrac 0.73→0.441 (id13
  wrap-surplice + id101 sweetheart-princess + 8 princess/wrap stili). ÇİFT-KANAT HAKEM
  bağımsız İKİSİ DE PASS: "diş macunu/sarkık çözüldü, apex emsale yaklaştı, regresyon yok".
- İTER2 (yan-hat büst-bel taper yumuşatma): GERİ ALINDI. Sebep: yan-hat bombe zaten ~3px,
  taper değişikliği id53/id24'te GÖRÜNMEDİ (kazanç yok); ayrıca lace_vneck_70s pinini kırdı
  (guard eklendi ama kazançsız risk mantıksız). ESKİ taper byte-identical restore.
- DÜRÜST SINIR: id53 ("kocaman aşağıda") + id24 ("sarkık bele yakın") apex ÇİZMİYOR (dart/
  gathered), göğüsleri yan-hat/empire-seam ile temsil → apex-fix onları GÖRSEL değiştirmedi.
  id53 gerçek sorun = empire/yoke seam konumu (ayrı tanı); id24 = büzgü(KÖK3)+etek(KÖK4).
- PIN: iki pinli stil (drawstring_babydoll, lace_vneck_70s) BYTE-IDENTICAL. re-pin YAZILMADI
  (bu stiller değişmedi; değişen 10 stil pinli değil). Determinizm md5 eşit. suite 50/50.

## 2026-07-23 KÖK 2 — giysi-figür kopukluğu (askı/kol tutunma)
- TARAMA: 17 tutunma noktası (band-strap→yTop, sleeve→armhole by-construction, spaghetti→
  omuz outline). GERÇEK kopuk: SADECE id101 spaghetti askı (5.4px). Diğerleri zaten bağlı
  (ilk aracın 5-9px'i YANLIŞ POZİTİF: band üst-kenar segmenti b.g nokta setinde değil).
- FIX: spaghetti askı tabanı k.stY (sabit omuz-ucu Y) → shoulderYAt(_ssX,k) (omuz outline
  cubic'inin askı X'indeki GERÇEK Y'si). Askı artık gövdeye tam oturur (havada kalmaz).
  Yeni yardımcı shoulderYAt (cubic sample). SERBEST Y kaldırıldı, landmark'a bağlandı.
- KAPI: kopuk parça 0 (tümü ≤3px, tarama /tmp/attach-scan2.mjs kanıtlı).
- PIN: iki pinli stil BYTE-IDENTICAL (spaghetti sadece dress_sweetheart_spag_circle'da,
  pinli değil). Determinizm md5 eşit. suite 50/50.

## 2026-07-23 KÖK 3 — büzgü ink dili ("püskül" → kısa emsal tik)
- TANI: fizik DOĞRU (fold konum/dağılım cloth-solver, emsalle uyumlu) ama ink YANLIŞ —
  fold band boyu (62-85px, band=67px) UZUN ince saç-teli = "püskül" (id24 dirndl beli,
  cami shirred bust). Emsal (literatür + gathered-skirt fotoğraf): büzgü KISA, düzensiz,
  kalın-uç, band-üstünde. Ink-tik boyu gusto-corpus'ta ÖLÇÜLMEDİ → literatür (%25-42) referans.
- FIX: yeni gatherTick(foldPts,idx) — fizik fold VERİSİ değişmez, fold'un band-üst %25-42'si
  (idx faz farkıyla düzensiz, seed'siz determinist) kısa tik olarak taper (bias 0.85 kalın uç).
  İKİNCİ KIVRIM YOLU YOK (aynı fold verisi, sadece render dilimi). gatheredSkirt + physicsShirr
  yollarına bağlandı.
- KAPI: id24 before/after + emsal → HAKEM PASS ("püskül NET gitti, emsal diline yaklaştı,
  fizik dokunulmadı"). Tek kalan nüans: uç-dolgunluğu (bias 1.5 denendi, belirgin kazanç yok,
  0.85 korundu) → v1.1 kozmetik adayı, shipping bloklamaz.
- PIN: drawstring_babydoll (physicsShirr=False, elle-shirr yolu) + lace_vneck_70s BYTE-IDENTICAL.
  Determinizm md5 eşit. suite 50/50.
