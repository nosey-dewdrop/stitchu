# YENİ OTURUMA YAPIŞTIRILACAK PROMPT

> Damla bunu kopyalayıp yeni bir oturuma yapıştırır. Altındaki her şey o promptun
> kendisidir — açıklama değil, talimat.

---

Selam. stitchu üzerinde çalışıyoruz. Önce şunları oku, sonra konuş:

1. `~/damla_projects_2026/stitchu/DEVIR.md` — reponun devir dosyası, en üst otorite.
2. `git -C ~/damla_projects_2026/stitchu log --oneline -30` — son oturumda ne yapıldı.
   Devir dosyası yazıldıktan SONRA atılan commitler var; onlar bir ajan
   döngüsünün ürünü, `DEVIR.md`'ye işlenmemiş olabilir.
3. `KOSU/ciktilar/kusur-listesi.md` — açık kusurlar.
4. `KOSU/ciktilar/platform-plani.md` — hesap, kota, cüzdan, gardırop, ödeme mimarisi.
5. `KOSU/ciktilar/seo-plani.md` — programatik SEO planı, dürüst sayfa sayısıyla.
6. `KOSU/ciktilar/site-elestiri.md` — varsa: canlı sitenin bağımsız eleştirisi.

**Hedef, tek cümle:** fotoğraf + prompt → dikilebilir kalıp + satılır flat, tüm
edge case'lere rağmen sınırsız ölçüde. Bitiş şartı ölçüm değil: bir yabancı
siteye girer, fotoğrafını/promptunu atar, kumaşını seçer, kalıbını + flat'ini +
rehberini indirir, diker, giyer.

**Nasıl çalışacaksın — pazarlıksız:**
- Bana soru sorma, router değilim. Karar gerekiyorsa **tarafsız ajana** sor,
  cevabı uygula, ilerle. Estetik kararlar dahil.
- Her faz **taze ajanla** yapılır, işi biten ölür. Tek context'te toplama, şişer.
- İşi yapan kendi işini övemez: her fazın çıktısını **tarafsız hakem** denetler,
  komutları kendi koşar, görselleri kendi açar.
- Her faz kendinden önceki fazların kabul komutlarını da koşar (compounding
  error). Biri kızarırsa ilerleme yok.
- Ajana taraf tutturma. "Şunu doğrula" diye kurma; durumu anlat, eleştirel ve
  iyileştirme isteyen cevap iste.
- Kapı yeşilliği geçer not değil. Her turun sonunda **benim gözümle göreceğim
  çıktı** olacak (çizim, sayfa, paket). Rapor ürün değildir.
- Bana ara rapor getirme. Bağımsız ajana "bu iş bitti mi, satılsa alır mıydım,
  ürün olarak güçlü mü" diye sor; "almazdım" dediği her şeyi düzelt, tekrar sor.
- Branch yok, `main`'e commit. Mesaj küçük harf İngilizce, `Co-Authored-By` asla.
- Bilmediğine "DOĞRULANMADI" de. Uydurma sayı koda girmez. Emin değilsen üretme.

**Tuzaklar** (hepsi yaşandı, `DEVIR.md` §5'te uzun hali): headless Chrome
asılır — `timeout` ile sar, `--user-data-dir` izole ver · açıklanamayan ctest
kırmızısında önce `cmake --build engine/build -j4` (bayat binary) · motor
değiştiyse `engine/wasm/build-wasm.sh` ile wasm'i de derle · `vocab_reference_check`
kızarırsa önce `git diff -- engine/vocab.json` bak · uzun koşu düşerse
`resumeFromRunId` ile devam ettir, düşen ajanın taahhütsüz işini silme.

**Bugünün işi** (sırayı sen kurma, önce durumu ölç, sonra tarafsız ajana sor):
İki cephe var, ikisi de `DEVIR.md` §7 ve §7.5'te yazılı —
(a) **ürünün kendisi**: açık kusurlar, Buğra kör kontrolü, henüz dikilmemiş toile;
(b) **platform katmanı**: hesap + kota (2 hak), kredi/abonelik, gardırop, ödeme,
programatik SEO, iOS.

Bunlardan hangisinin önce geldiğine karar vermeden önce şu üçünü ölç ve bana
tek paragrafta söyle: bugün canlı sitede bir yabancı ne yapabiliyor · açık
kusurların hangisi satışı engelliyor · platform planındaki ilk adım bugünkü
mimariyle kaç günlük iş. Sonra çalışmaya başla, beni bekletme.
