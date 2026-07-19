# Style pin declaration ledger (GOLDEN-PIN'in görsel kardeşi)

Damla "kalemim" onayı alan her flat render buraya pinlenir. Pinli görsel ancak
Damla'nın yeniden-onayıyla değişir. style_check ctest her build'de üretim flat
çıktısını REPO PİNİNE diff'ler (byte diff, deterministik SVG). FAIL = ya çizim
kodu bozuldu (düzelt) ya bilinçli kalem revizyonu (Damla yeniden onaylar +
scripts/repin-style.sh + ledger girdisi). Regen-vs-regen kanıt değildir (golden
dersi, DEVAM-KAPANIS-LOOP Z).

## Pin history

### 2026-07-19 — lace_vneck_70s.svg (v7, MIHENK-05 approved)
- Damla onayı (kart MIHENK-05, 9-varyant ızgarasından seçim): "v7 — kalemim".
- Ne pinlendi: 70s v-neck lace babydoll — V yaka + ön kordon fiyongu + dantel
  yaka biye + KISA PUFF kol + bağcıklı (gathered tie) dantel manşet + drape
  etek + taraklı dantel hem. Zengin stil (dantel ×3 + balon kol + büzgü hepsi
  bir arada).
- ETİKET DÜZELTMESİ (Damla): ızgara etiketi "uzun kol" YANLIŞTI; çizim kısa
  puff kol, çizim doğru. styles.json lace_vneck_70s label + _pin güncellendi,
  own sleeveLen 9->14 + cuffGather 1.2->1.6 (v7 parametreleri varsayılan yapıldı,
  referans+üretim tek hakikat). Gerçek uzun-kol varyantı ayrıca merak için
  denendi (reports/gate/mihenk05-longsleeve/).
- Üretim yolu: `renderGarmentFlatAsync([], {style:'lace_vneck_70s'})` (band-top
  köprüsü → referans kalem). İKİNCİ STYLE-PIN.

### 2026-07-19 — drawstring_babydoll.svg, md5 8b45e11b76d32772a924c934108c0502 (askılı, güncel)
- Damla onayı (kart MIHENK-04, gate approved): "kalemim — referans kalem üretim
  yolundan birebir geldi, ilk STYLE-PIN bu". Onay sonrası Damla "askısı var ama"
  dedi: stil verisi straps:true ama repo motoru askıyı çizmiyordu (K2-minify
  budamış). strapShape referans motora geri getirildi (Damla: askılı olsun),
  pin askılı render ile güncellendi — veri (fırfırlı askı) artık çizimle tutuyor.
- İlk md5 dc0993d8 (askısız) emekli; hiç commit'lenmedi, askı düzeltmesi
  commit'ten önce yakalandı.
- Ne pinlendi: strapless band-top babydoll flat, üretim renderer'ın band-top
  köprüsünden (renderGarmentFlatAsync → referans kalem renderStyle). Form birebir
  referans kalem (byte-identical), MIHENK-03 reddinin 4 maddesi kapalı (band-top
  form + kordon fiyongu + dalgalı taper shirr + asimetrik seed'li drape + taraklı
  hem).
- Üretim yolu: `renderGarmentFlatAsync([], {style:'drawstring_babydoll'})`.
- İLK STYLE-PIN — Damla'nın flat kaleminin ilk motor-onaylı çıktısı.
