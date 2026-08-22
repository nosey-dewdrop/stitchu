# KART F0-B — SÖZLÜK ENVANTERİ (paralel set, işçi 2/4)

## NE
İki sözlüğün felsefe farkını ölç: hangisi malzeme diliyle (sürekli parametre),
hangisi yemek diliyle (kapalı enum) konuşuyor ve sevk edilen taraf hangisi.

## GİRDİ DOSYALARI (sadece bunlar)
- engine/vocab.json
- contract/spec-grammar.json
- contract/terms.json
- vision-student/ altındaki kelime listesi dosyası (Glob ile bul)
- engine/wasm/bindings.cpp (hangi sözlüğün sevk edildiğini görmek için)

## ÖNCE GREP
- `grep -n "enum" contract/spec-grammar.json | head -40`
- `grep -rn "vocab.json\|spec-grammar" engine/ web/ --include=*.cpp --include=*.mjs --include=*.js`

## YAPILACAK
1. Her iki dosya için: kaç kelime/terim, kaçı kapalı enum, kaçı sürekli
   parametre (sayısal aralık). Sayılarla.
2. Hangi dosyayı SEVK EDİLEN hat (garment / WASM bindings) gerçekten okuyor,
   hangisi ölü? Kanıt = grep sonucu satır numarasıyla.
3. İki sözlük ÇAKIŞIYOR mu: aynı kavram iki ayrı adla mı geçiyor? Çakışan
   terimleri adıyla listele.
4. vision-student'ın kelime listesi nereden kopyalanmış — kaynağını dosya
   karşılaştırmasıyla göster (aynı sıralama/aynı yazım hatası vb.). Kaynak
   bulunamazsa "DOĞRULANMADI" yaz, tahmin etme.

## ÇIKTI
`GECE/F0-B.md` — her hüküm için dosya yolu + satır numarası.

## YASAKLAR
- Hiçbir sözlüğü DÜZENLEME, birleştirme, terim ekleme. Bu kart ölçer.
- Commit ATMA.
- Kod yazma. Yeni dosya yalnız GECE/F0-B.md.
- Docs/reports/Logs/HEDEF.md okuma (§0.1).

## SÜRE TAVANI
maxTurns 40. Tur biterse ölçülen kısmı yaz, kalanı "KALAN İŞ" başlığına.
