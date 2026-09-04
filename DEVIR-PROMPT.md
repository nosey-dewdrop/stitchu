# YENİ OTURUMA YAPIŞTIRILACAK PROMPT

> Damla bunu kopyalar, yeni bir oturuma yapıştırır. `---` altındaki her şey
> promptun kendisidir.

---

Selam. stitchu üzerinde çalışıyoruz. Konuşmadan önce şunları oku:

1. `~/damla_projects_2026/stitchu/DEVIR.md` — teknik devir, reponun en üst otoritesi.
2. `git -C ~/damla_projects_2026/stitchu log --oneline -40` — devir yazıldıktan
   sonra atılan commitler var; bir ajan döngüsünün ürünü, devire işlenmemiş olabilir.
3. `KOSU/ciktilar/kusur-listesi.md` — açık kusurlar.
4. `KOSU/ciktilar/platform-plani.md` — hesap, kota, gardırop, ödeme mimarisi (9 adım).
5. `KOSU/ciktilar/seo-plani.md` — programatik SEO, dürüst sayfa sayısıyla.
6. `KOSU/ciktilar/pazar-notlari.md` — pazar verisi. **Damla'nın alanı**, oradan
   iş çıkarma; fiyat ve pazarlama kararlarını o veriyor.

**HEDEF, tek cümle:** fotoğraf + prompt → dikilebilir kalıp + satılır flat, tüm
edge case'lere rağmen sınırsız ölçüde. Bitiş şartı ölçüm değil: bir yabancı
siteye girer, fotoğrafını/promptunu atar, kumaşını seçer, kalıbını + flat'ini +
rehberini indirir, diker, giyer.

## NASIL ÇALIŞACAKSIN — pazarlıksız

**Orkestrasyon zorunlu. Tek başına oturup kod yazma.**
- İş **fazlara** bölünür. Her fazı **taze bir ajan** yapar, işi bitince ölür.
  Tek context'te toplama — şişer, hesap bozulur, halüsinasyon gelir.
- Her fazın çıktısını **tarafsız hakem ajanı** denetler. Hakem, işi yapanın
  beyanını KANIT saymaz: komutları kendi koşar, görselleri kendi açar.
- Her faz, kendinden **önceki fazların kabul komutlarını da** koşar. Biri
  kızarırsa ilerleme yok (compounding error).
- **Bana soru sorma. Router değilim.** Karar gerekiyorsa tarafsız ajana sor,
  cevabı uygula, devam et. Estetik kararlar dahil.
- **Ek sorular da tarafsız ajana.** "Şunu doğrula" diye kurma; durumu anlat,
  eleştirel ve iyileştirme isteyen cevap iste. Taraf tutturma.
- **Bana ara rapor getirme.** Bağımsız ajana sor: *bu iş bitti mi · satılsa
  kendi paramla alır mıydım · ürün olarak güçlü mü.* "Almazdım" dediği her şeyi
  düzelt, tekrar sor. İki tur üst üste "bitti, alırdım" gelene kadar dönsün.

**Ajan disiplini (dördü de bu projede yaşandı):**
- Ajana **"alt-ajan DOĞURMA"** yaz. Bir "siteyi eleştir" ajanı 69 alt-ajan
  doğurup milyonlarca token yaktı; üstelik anayı öldürünce çocukları ölmedi.
- **Aynı hata iki kez tekrarlandıysa DUR ve hatayı OKU.** Çoğu darboğaz eksik
  bir araçtır: modül yok, build bayat, süreç asılı. Üçüncü kez denemek de yeni
  ajan doğurmak da kayıp. Aracı onar, devam et. Kuramıyorsan adımı ATLA ve
  adıyla raporla.
- Ajana **headless Chrome** işi verirsen: `timeout` ile sar, `--user-data-dir`
  izole ver, bitince süreçleri öldür. Bu projede bir workflow tam bundan
  6 denemede stall etti.
- Uzun koşu düşerse `resumeFromRunId` ile devam ettir; düşen ajanın
  taahhütsüz işini SİLME — önce kapıları koş, geçiyorsa committe.

**Değişmezler:**
- Branch yok, `main`'e commit. Mesaj küçük harf İngilizce, `Co-Authored-By` asla.
- **Kapı yeşilliği geçer not değil.** Her turun sonunda benim gözümle göreceğim
  çıktı olacak: çizim, sayfa, paket. Rapor ürün değildir.
- **Eşik gevşetme, testi kendine göre yazma, ölü hattı ölçme yasak.** Kapı
  kızarırsa kaynağı düzelt. (4 Eyl'de deploy üç kez reddetti; üçü de kaynağından
  çözüldü, hiçbir eşik gevşetilmedi — doğru davranış budur.)
- Uydurma sayı koda girmez; kaynak yoksa en kısıtlayıcı değer + açık etiket.
  Bilmediğine **DOĞRULANMADI** de. Sessiz default yok, çıkmaz sokak yok:
  motor bilmediğini adıyla reddeder ve yanında yapılabilir bir adım verir.
- Görsel/estetik bir eksen üreteceksen **önce endüstri konvansiyonunu araştır**,
  sayıyla contract'a yaz, sonra çiz. (Flat'ler aylarca çirkindi çünkü bu
  yapılmamıştı.)

## TUZAKLAR — hepsi yaşandı, uzun hali `DEVIR.md` §5

- Açıklanamayan ctest kırmızısında (SEGFAULT dahil) **önce**
  `cmake --build engine/build -j4` — bayat binary 6 kapıyı birden kızartmıştı.
- Motor (`engine/src|wasm`) değiştiyse `engine/wasm/build-wasm.sh` ile wasm'i
  **de** derle, yoksa web eski motoru kullanır ve "düzelttim" yalan olur.
- `vocab_reference_check` kızarırsa önce `git diff -- engine/vocab.json`:
  bayt-aynıysa artış yorum satırlarındandır, tabanı
  `bash engine/tests/vocab_reference_check.sh --baseline <sha>` ile yeniden kes
  ve gerekçeyi commit mesajına yaz. Sözlük gerçekten büyüdüyse KESME.
- `scripts/deploy.sh` sessizce **`git fetch` üzerinde asılabilir** (4 Eyl'de
  43 dakika). Uzun sürüyorsa:
  `pgrep -P $(pgrep -f 'bash scripts/deploy.sh')` ile hangi alt-süreçte
  olduğuna bak; `git fetch`'teyse öldür, script `|| true` ile devam eder.

## BUGÜN NEREDE DURUYORUZ

Canlı: https://stitchu.noseydewdrop.com — `?v=152`, landing'in her sayısı
motordan, bayat cümle sıfır. Backend `/api/draft` ve `/api/analyze` açık
(Turnstile + IP limiti + günlük tavan arkasında). ctest 156 kapıda 4 kırmızı,
dördü de benchmark sayfasında adıyla ilan edilmiş — deploy bunlara izin verir,
beşinciye vermez.

Çalışan zincir: yazıdan giysi · fotoğraf oranlarının motora inmesi · arka yüzü
uydurup **ilan etmesi** · aynı elbisenin iki kumaşta iki kalıp vermesi ·
görseldeki kadar parça + koşullu fermuar · flat ideal bedenden / kalıp gerçek
bedenden · bölgesel edit ("yakayı 2cm derinleştir") · büzgülü üst katman
(puf/balon kol) · primitif kompozisyon · edge case süpürme · kaynaklı rehber +
beden serisi · iOS token zemini.

## İLK İŞİN

Sırayı sen kurma. Önce ölç, sonra tarafsız ajana sor, sonra fazları aç.
Bana **tek paragrafta** şunu söyle, sonra beklemeden çalışmaya başla:

1. Bugün canlı sitede bir yabancı gerçekten ne yapabiliyor (dene, ekrana bak).
2. Açık kusurlardan hangisi satışı engelliyor.
3. Platform planındaki ilk adım (hesap + sunucu tarafı kota) bugünkü mimariyle
   kaç günlük iş.

İki cephe var, ikisi de `DEVIR.md` §7 ve §7.5'te yazılı: **(a)** ürünün kendisi
— açık kusurlar, Buğra kör kontrolü, henüz dikilmemiş toile; **(b)** platform
katmanı — hesap + kota (hesap başına 2 hak), kredi/abonelik, gardırop, ödeme,
programatik SEO, iOS.
