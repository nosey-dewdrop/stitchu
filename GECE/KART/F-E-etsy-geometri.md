F-E ETSY KAPISI / GEOMETRI YARISI — OLCUM KARTI (2026-08-23)

⚠ BU GECE IKI F-E VARDIYASI AYNI AGACTA KOSTU.
  obur vardiya = LISTELEME GORUNTUSU (oran, kucuk-resim kirpmasi, raster, beden
  tablosu) -> knowledge/ETSY-KAPISI-2026-08-23.md · engine/tests/flat_sellable_check.mjs
  bu vardiya = GIYSININ GEOMETRISI -> knowledge/ETSY-KAPISI-GEOMETRI-2026-08-23.md
               · engine/tests/flat_geometry_sellable_check.mjs
  Cakisma yok. Obur vardiya §3.2'de "bu gece uygulanmadi" dedigi kol oyugu /
  koltukalti / puff manseti kalemlerinin CIZIM tarafini bu vardiya kapatti;
  render-garment-flat.mjs'ye obur vardiya hic dokunmadi.

== BES KUSUR — DURUM
  1 kollar kopuk .................. KAPANDI  oyuk tasmasi 13.79 mm -> 0.00 mm
  2 puff duz kesik, mansetsiz ..... KAPANDI  et/enGenis 1.0000 -> 0.8670 + manset bandi
  3 bel yok ....................... KAPANDI  \ tek kok: etek genisligi boydan bagimsizdi
  4 etek kavisi abartili .......... KAPANDI  / etek/gogus 1.0477 -> 0.8590 (crop)
  5 boyun genis / omuz dar ........ OLCULDU, KAPATILMADI (asagida, K-FE-1)

== OLCUT NEREDEN (motorun kendi ciktisindan TURETILEN esik YOK)
  SATIN ALINMIS Bugra Locket EU38, Arka Beden, ring 38 — yan dikis profili:
    omuz 196.13 · gogus 204.94 · bel 157.46 · etek 179.22 mm
    gogse normalize: 0.9570 / 1.0000 / 0.7683 / 0.8745
  Arka secildi: arka-orta kenari tam dikey (90.00 deg, 413.97 mm duz kosu),
  pens/placket dis konturu kirletmiyor. Dokum: GECE/log/F-E.bugra-olcum.txt
  YAN BULGU: Bugra'nin KENDI cizelgesi EU38 = 920/720/980 mm; burda EU38 =
  880/700/940. Bugra'nin 38'i burda'nin 40'i -> MUTLAK mm esik yapilmadi, sadece
  parcanin KENDI ICINDEKI oranlari kullanildi.

== ONCE / SONRA (uretici: GECE/f-e-shot.mjs, F-D cekimini BAYT BAYT ureti̇yor)
  olcut                          ONCE       SONRA
  kol oyugu tasmasi           13.79 mm    0.00 mm     (10/10 panel)
  kol ucu bosluğu (omuz)      olculmedi    0.06 mm     (yazi cozunurlugu 0.30 mm)
  kol ucu bosluğu (koltukalti) olculmedi   0.10 mm
  puff et / en genis           1.0000     0.8670      (tavan 0.9327, Bugra Alt Kol)
  etek/gogus  crop             1.0477     0.8590
  etek/gogus  hip              1.0477     0.9400
  etek/gogus  tunic            1.0477     1.0477      (kalca tavani)
  etek merdiveni               DUZ        MONOTON ARTAN
  omuz/gogus                   1.0636     1.0636      <- DEGISMEDI, K-FE-1
  gorseller: GECE/log/F-E.shots/01-once.png · 02-sonra.png

== YENI KAPI — engine/tests/flat_geometry_sellable_check.mjs (5 stil x 2 panel)
  S1  omuz ucu bustun icinde ....... ACIK KALEM, KAPI DEGIL (K-FE-1), ihlal EKRANA BASILIYOR
  S2a etek <= kalca/bust ........... 1.0682  burda EU38 verified
  S2b etek merdiveni monoton ....... esitsizlik, sayi yok
  S2c crop/waist etek < bust ....... esitsizlik, sayi yok
  S3  bel <= bel/bust .............. 0.7955  burda EU38 verified
  S4  kol oyugu icbukey ............ esitsizlik, sayi yok
  S5  kol iki ucu paylasiyor ....... ozdeslik; tol 0.15 mm = kalemin YARIM YAZI ADIMI
  S6  puff eti <= 0.9327 x enGenis . Bugra Alt Kol olcumu + manset bandi + >=3 tirtik
  7 sartin 4'u saf esitsizlik/ozdeslik — gevsetilecek sayilari yok.
  ANTI-HACK: kapi kalemden sabit import etmez; BASILAN SVG'yi parse eder, path'leri
  40 adim/segment orner. Kollu/puff panel sayisi 0 olursa kapi kendini FAIL eder.

== MUTASYON KANITI (GECE/log/F-E.mutasyon.txt) — kapi gercekten isiriyor
  A  F-D'nin eski kalemi geri ................. FAIL 25 ihlal (S2b S2c S4 S5)
  B  eski shoulderTipX 78.0u geri ............. FAIL 10 ihlal (S1)
  C  puff eti duz boruya geri (0.72 -> 1.0) ... FAIL  2 ihlal (S6, 0.9889 > 0.9327)

== KUSUR 5 NEDEN KAPATILMADI (mazeret degil, cikar catismasi)
  shoulderTipX = 78.0u = 234 mm yari-omuz -> omuzdan omuza 46.8 cm; ayni croquis'in
  gogus yari-genisligi 220 mm. Omuz ucu BUSTUN DISINDA (1.0636). Set-in kollu hicbir
  giyside olamaz. Bugra orani 0.9570 -> dogru deger 70.1799u = 210.54 mm.
  DUZELTME DENENDI VE ISE YARADI (S1 yesile dondu), ama flat_convention_check.mjs
  KIRILDI: measureCroquis() omuz ucunu "x'in ILK YEREL MAKSIMUMU" diye buluyor; bu
  sezgi SADECE omuz gogusten genisse dogru — yani kapi DUZELTMEYE CALISTIGIMIZ
  KUSURUN KENDISINI VARSAYIYOR. Omuz iceri alininca cikarim koltukaltini omuz sanip
  27.00 / 153.00 / 750.00 mm sapma basiyor.
  Duzeltmek VAR OLAN BIR TESTIN cikarimini degistirmeyi gerektiriyor; ORTAK.md md.5
  yasakliyor. Esik gevsetilmedi, kapi susturulmadi, sayi gizlenmedi.
  KARAR DAMLA'DA -> DAMLA-KUYRUK.md K-FE-1. Sonraki aday tek satir: measureCroquis()
  omuz ucunu "omuz dikisi ile kol oyugu arasindaki EN KESKIN KOSE" diye bulsun.

== YAPILAMAYAN (gizlenmedi — detay knowledge/ETSY-KAPISI-GEOMETRI-2026-08-23.md §3)
  - kartin md.1/md.2 (Etsy listing taramasi + ozellik dili) bu vardiyada YAPILMADI;
    web ajani gece bitmeden donmedi. OBUR VARDIYA YAPTI, tekrar edilmedi.
  - Ust/Alt Kol'un kendi ekseni cikarilamadi (nest'te donuk + hilal); S6 tavani
    muhafazakar Alt Kol'dan, puff'in GERCEK buzgu orani DEGIL.
  - On Beden profili kullanilamadi (pens dis konturu kesiyor).
  - Etek ucu SARKMASI (dip 4u = 12 mm) HIC yargilanmadi — kapatilan sey ACILMAYDI.
  - Kisa puff kolun dogru boyu olculmedi (bugun 288 mm).
  - hemRisePerU 0.1881 TEK kaliptan TEK bedenden; grade'i bilinmiyor.
  - ELBISE yolu HIC degismedi; flare carpanlari (1.58/1.12/1.9/2.6) hala KAYNAKSIZ,
    S2 ailesi elbisede kosmuyor.

== CTEST
  ⚠ IZOLE DEGIL: bu gece UC vardiya ayni agacta kostu, HEAD iki kez ilerledi
  (8373176 F-I, 764adf3). photo_ratio_wire_check kirmizisi web/js/create.js'ten
  geliyor; bu vardiya o dosyaya HIC dokunmadi.
  once/sonra: GECE/log/F-E.ctest.before.txt · F-E.ctest.after.txt
  kirmizi kumeler: GECE/log/F-E.red.before · F-E.red.after

== CTEST SONUCU (kosuldu, atfedildi)
  102 testin 89'u yesil, 13 kirmizi.  GECE/log/F-E.ctest.after.txt
  YENI KAPI:  flat_geometry_sellable_check ... Passed  (0.10 sn)
  KORUNDU:    flat_convention_check .......... Passed  (4.14 sn)   <- kartin sarti

  F-D taban kirmizisi (6): style_check sizechart_source_check contract_check
    preview_truth_check figure_check h10_gate_check
    (h10_gate_check bu gece F-F tarafindan LEGACY yapildi, listeden dustu)

  BU GECE EKLENEN 8 KIRMIZI — HEPSI MOTOR TARAFI, HICBIRI BU VARDIYANIN DEGIL:
    engine_check · golden_check · bundle_fresh_check · sewable_census
    recipe_dress_check · dxf_wasm_parity · dxf_wasm_parity_dress · garment_armhole_check
  ATIF KANITI:
    - `git show --stat 700188c` : bu vardiyanin commit'inde SIFIR .cpp/.hpp dosyasi.
    - golden_check farki `piece0:Bodice Front` geometrisinde; `git log d3e1fdf..HEAD
      -- engine/src/bodice.cpp` tek commit veriyor: a571407 (F-G).
    - dxf_wasm_parity.mjs'de `render-garment-flat` / `flat-convention-v1` gecen
      SIFIR satir var.
    - bundle_fresh_check tek basina yeniden kosuldu: PASSED (ctest anlik goruntusu
      uc vardiya ayni anda derlerken alinmisti).
  YANI: bu vardiyanin actigi YENI KIRMIZI = 0. Ama ctest IZOLE DEGIL ve bu
  gizlenmiyor: HEAD bu vardiya calisirken BES kez ilerledi, calisma agacinda
  surekli baska vardiyalarin yarim isi vardi, ve engine/CMakeLists.txt'ye
  eklenen kayit satiri bir kez baska bir vardiyanin commit'iyle EZILDI (fark
  edildi, yeniden eklendi, commit'te var).
