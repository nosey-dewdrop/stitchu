# KART V7-E — KOL GÖRÜNÜR: SEVK EDİLEN HATTAN PNG ARTEFAKTI

ETİKET: PARALEL (V7-C, V7-F ile aynı anda; dosya kesişimi YOK)
SÜRE TAVANI: 50 dk

## ÖLÇÜLMÜŞ ZEMİN (tekrar ölçme, üstüne inşa et)
- Sevk edilen hat: `web/js/engine.js:56` → `web/vendor/stitchu-engine.js` →
  `engine/wasm/bindings.cpp:339 draftJSON` → `engine/src/garment.cpp:303,:621`
  → `engine/src/sleeve.cpp SleeveBlock::draft`.
  `grep -c surfacepattern engine/build-wasm.sh` = **0** (yüzey motoru sevk
  EDİLMİYOR — ondan render alma).
- Sözlükte sekiz kol değeri var = **4 kanonik + 4 beyanlı eşanlam**
  (`engine/vocab.json:9-10`). Flat tarafında dört ayrı geometri ölçüldü:
  `{straight·fitted·set-in}` · `{balloon·bishop·puff}` · `{cap}` · `{none}`.

## NE
RULES invariant 3'ün istediği GÖRSEL ÇIKTIYI üret: sevk edilen hattan,
**kol içeren gerçek bir kalıp** ve **flat**, PNG olarak.

1. `engine/tools/` altında ÖNCE GREP — `render-pages.mjs`, `render-flat.mjs`,
   `render-garment-flat.mjs` zaten var. **YENİ ALET YAZMA**, olanı koş.
2. En az şu PNG'leri üret ve yollarını raporla:
   - Kol içeren kalıp parçaları (kol paneli GÖRÜNSÜN), EU38.
   - Dört ayrı kol geometrisinin flat'i (straight · balloon · cap · none),
     yan yana ya da ayrı dosyalar.
3. Her PNG için: hangi komut ürettiği + dosya boyutu + `test -f` kanıtı.
4. ★ **DÜRÜSTLÜK ŞARTI:** PNG'ye BAKIP hüküm verme. "güzel/doğru görünüyor"
   YASAK. Senin işin dosyayı ÜRETMEK ve yolunu vermek. Tek istisna: dosya
   BOŞ/bozuk çıkarsa (0 byte, render hatası) bunu ölçüyle bildir.
5. Kol panelinin gerçekten çizildiğini SAYIYLA da göster: üretilen artefaktta
   kol parçasının adı ve nokta/komut sayısı.

## ÇIKTI
- PNG'ler: `GECE/log/V7-E.png/` altına.
- `GECE/V7-E.md`: PNG yolları tablosu (yol · üreten komut · byte · parça sayısı).

Bittiğinde KENDİN commit et (push etme):
`git add GECE/V7-E.md GECE/log/V7-E.png && git commit -m "v7-e: render sleeve pattern and flat pngs from the shipped path"`
(PNG'ler `.gitignore`'a takılıyorsa commit'e ZORLA sokma — bunu raporla,
yolları yine ver.)

## YASAKLAR
- KAYNAK KOD DEĞİŞTİRME (`engine/src/`, `engine/wasm/`, `web/` — hiçbiri).
- Yeni alet/test yazma. `engine/tools/` altındakileri KOŞ.
- `GECE/KOSU.md`, `GECE-KOSUSU-v6.md`, başka kartlar: AÇMA.
- `patterns_real/` altındaki satın alınmış PDF'lere dokunma.
- Tam `ctest` koşusu BAŞLATMA (paralel işçi var).

## RAPOR FORMATI
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
