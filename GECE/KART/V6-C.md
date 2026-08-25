# KART V6-C — ÇIPA KAYNAĞI: Katman 2 topolojisi ÜRETİYOR mu? (teşhis)

ETİKET: **PARALEL** · SÜRE TAVANI: **60 dk**

## NE
Konumlu edit ("fiyonk ekle ŞURAYA") için gereken semantik ÇIPA sözlüğünün
bugün repoda hangi hâlde olduğunu ölç ve **bileşen topolojisinden ÜRETİLEBİLİR
mi** sorusunu kanıtla. Elle yazılmış çıpa listesi menüdür ve yasaktır; bu kart
üretecin GİRDİSİNİN var olup olmadığını ölçer. ÜRETEÇ YAZILMAZ (o ayrı kart).

## GİRDİ DOSYALARI (isim isim)
- `ENV.md` · `RULES.md`
- `contract/composition.json` · `contract/primitives-v1.json`
- `contract/garment-spec-v2.json` · `contract/vocab-resolution-v1.json`
- `contract/spec-grammar.json` · `contract/terms.json`
- `engine/tools/spec-diff.mjs` · `engine/tools/specv2.mjs`
- `contract/edit-locality-v1.json`

## YAPILACAKLAR
1. **Katman 2 bileşen topolojisi nerede yaşıyor?** `composition.json` /
   `primitives-v1.json` / `garment-spec-v2.json` içinden hangisi bileşen →
   panel → kenar zincirini taşıyor; İSİM İSİM say (kaç bileşen, kaç panel,
   kaç adlandırılmış kenar). Taşımıyorsa bunu ADIYLA yaz — çıpa üretilemez.
2. Bugün motorun ürettiği kalıp artefaktı **adlandırılmış kenar** taşıyor mu?
   Bir kalıp üret ve panel/kenar adlarını dök (komut + çıktı). V5 bulgusu
   "artefakt dikiş grafiği taşımıyor (0/112)" — bunu KENDİN doğrula ya da çürüt.
3. Repoda çıpa/landmark sınıfı ne var: `contract/figure-landmarks.json` neyi
   taşıyor, kim üretiyor, elle mi yazılmış (GENERATED başlığı / üreteç grep'i).
4. **ÜRETİLEBİLİRLİK HÜKMÜ**: bileşen topolojisinden türetilebilecek çıpa
   adaylarını SAY ve listele (ör. `frontNeck`, `backWaist`, `sideSeamHem`,
   `armholeFront`) — ama listeyi ELLE UYDURMA: her çıpa adayının yanında onu
   doğuran KAYNAK ALANI (dosya + anahtar) olacak. Kaynağı olmayan aday yazılmaz.
5. Kaç çıpa üretilebiliyor / kaç tanesi 0B'nin serbest kanalındaki 26 terimin
   konum ibaresini karşılıyor — kesişimi SAY.

## ÇIKTI
- `GECE/V6-C.md` — bulgular + ÇIPA ADAYI tablosu (ad · kaynak dosya:anahtar ·
  hangi bileşenden doğuyor) + ÜRETİLEBİLİR Mİ hükmü (evet/hayır + sebep).
- `GECE/log/V6-C.topoloji.txt` — ham komut çıktıları.

## YASAKLAR
- Kod/şema/kontrat DEĞİŞTİRME. Yalnız kendi iki çıktı dosyanı yazarsın.
- Çıpa listesini elle uydurma (kaynaksız ad = menü = V2 ihlali).
- `patterns_real/` altına dokunma. Model ağırlığı/API/bulut = kalıcı veto.
- "Muhtemelen üretilebilir" yasak — dosya:anahtar göster ya da "YOK" yaz.

## COMMIT
`git commit -- GECE/V6-C.md GECE/log/V6-C.topoloji.txt`
`git add -A` KULLANMA (paralel işçi var).
