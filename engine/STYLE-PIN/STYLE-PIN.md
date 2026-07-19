# Style pin declaration ledger (GOLDEN-PIN'in görsel kardeşi)

Damla "kalemim" onayı alan her flat render buraya pinlenir. Pinli görsel ancak
Damla'nın yeniden-onayıyla değişir. style_check ctest her build'de üretim flat
çıktısını REPO PİNİNE diff'ler (byte diff, deterministik SVG). FAIL = ya çizim
kodu bozuldu (düzelt) ya bilinçli kalem revizyonu (Damla yeniden onaylar +
scripts/repin-style.sh + ledger girdisi). Regen-vs-regen kanıt değildir (golden
dersi, DEVAM-KAPANIS-LOOP Z).

## Pin history

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
