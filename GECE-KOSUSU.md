# STITCHU GECE KOŞUSU v3 — şef/işçi/hakem/kâtip mimarisiyle fazlı koşu protokolü

Bu dosya bir oturum brief'i değil, bir koşu protokolüdür. Tek context'te baştan
sona okunmaz: her faz kendi context'inde açılır, kendi kapısından geçer, kapanır.
Koşu kendi sıfırını kendisi koyar — hiçbir eski beyan, rapor veya "kapandı"
cümlesi bu koşuda geçerli değildir; her sayı bu gece yeniden ölçülür.
**İstisna (v3):** `GECE/gece.sh` · `GECE/kapi.sh` · `GECE/mutasyon.sh` ve
`GECE/kapi.sha` mühürü ölçülerek kurulmuş harness'tır; sıfırlanmaz, genişletilir (§3.0).

> **Bu dosyayı okuyan ilk ajana:** §0, §1, §2, §3'ü oku. Sonra SADECE sana
> verilen fazın `<!--FAZ:F#-->` bloğunu oku. Diğer fazları AÇMA.

v3'te v2'ye göre değişen: §1 (işçi mekaniği Claude Code'a bağlandı), §2 (harness
arşivlenmez; FAZ işaretleri), §3.0 (K8 kâtip kapısı + kapı commit'i), F0 (test
envanteri + hat varsayımı), F2/F5/F6 (mevcut testler üstüne kurulur), F10
(landing üreteçten çıkar, elle HTML yok), §6 (açılış repo'nun 21 Ağu hâline göre).

---

# §0 DEĞİŞMEZLER (her şef ve her işçi oturumunun başında okunur, atlanmaz)

0.1 Otorite sırası: HEDEF.md > ANAYASA.md > RULES.md > bu dosya > diğer her şey.
Çelişki tek karar commit'iyle kapanır; çelişen satır silinir. İki doğru bırakılmaz.
Arşiv dosyaları (`reports/`, `Logs/`, `docs/archive/`, `GECE/arsiv/`,
`gece/*-reddedildi` dalları, HEDEF.md'nin TUR bölümleri, eski PDF/tutanaklar)
OTORİTE DEĞİLDİR ve GİRDİ DE DEĞİLDİR: hiçbir oturuma okunmaz, hiçbir
iddia oradan devralınmaz, hiçbir sayı "daha önce ölçülmüştü" diye alınmaz.
Bu koşuda geçerli tek kanıt, bu koşuda üretilen dosya yoludur. Bir cümleyi bir
otorite dosyasına atfetmeden önce `grep` ile doğrula.
0.2 Kanıt = dosya yolu. "Baktım / doğru görünüyor / çalışıyor" yasak. Bir adım
ancak ürettiği dosyanın yolu raporda geçiyorsa yapılmıştır.
0.3 Sessiz ikame yasak. İstenen operatör sicilde shipped değilse spec reddedilir
ve red cümlesi eksik operatörü ADIYLA söyler. Fallback = halüsinasyon.
0.4 Hata bulmak iş değil, çözümünü tasarlamak iştir. Her kırmızı rapor yanında
en az bir ÖLÇÜLMÜŞ çözüm adayı taşır; ölçülüp reddedilen hamle de kayda geçer.
0.5 Kapsamı en iyi olan belirler, en itaatkâr olan değil. Damla'nın açık vetoları
kalıcıdır; geri kalanda çelişki dürüstçe önüne konur, sonra en iyi yol seçilir.
0.6 Kırmızı test KÜMESİ (adlar, sayı değil) koşu boyunca büyüyemez. Taban:
`GECE/log/F0.red.before` (7 ad: bugra_bridge_check · contract_check · figure_check ·
h10_gate_check · preview_truth_check · sizechart_source_check · style_check).
Yeni kırmızı ad doğuran değişiklik geri alınır; iki ctest logu commit'e girer.
0.7 Buğra bir referanstır, kural değildir. Hiçbir kapı "Buğra'ya benziyor mu"
diye kurulmaz; kapılar geometri, dikilebilirlik ve konvansiyon üzerinden kurulur.
0.8 Dünya ölçüsü tabandır, tavan değil. "Başkası yapmış, biz yapamayız" cümlesi
yasaktır; başkası yaptıysa daha iyisi ve hızlısı hedeflenir (F1'in varlık sebebi).
0.9 fal.ai / bulut görsel servis çağrısı YASAK (Damla vetosu, kalıcı). Yeni model
ağırlığı indirme veya harici API anahtarı gerektiren her yol kendiliğinden
kurulmaz, DAMLA-KUYRUK'a karar satırı olarak yazılır.
0.10 patterns_real/ altındaki satın alınmış PDF'ler silinmez, taşınmaz, yeniden
yayınlanmaz. Onlara bağlı kırmızılar (`bugra_bridge_check`, `contract_check`)
"ilan edilmiş karar"dır, kapatılmaya çalışılmaz.
0.11 Telifli görsel (Chanel/Bershka/emsal flat vb.) repoya İNDİRİLMEZ. Referans
panoları link + özellik-dili tarifi olarak tutulur (bkz. F4).
0.12 Kapıyı gevşeterek geçmek yasak. Tolerans değişikliği bir hamledir: ölçülür,
gerekçesi yazılır, DAMLA-KUYRUK'a bildirilir. Sessizce yapılmaz.
0.13 Rapor dili: virtüöz raporu yok. Cevaplanan soru "kesim çizgisi kaç mm" değil,
"bu kalıp dikilir mi, bu flat Etsy'lik mi, bu sayfa ürünü anlatıyor mu".
0.14 HAT VARSAYIMI (KOSU.md'den devralındı): ürün hattı = `garment`
(`engine/wasm/bindings.cpp` → `garment.hpp`); `surfacepattern` sevk edilmiyor.
Her faz bu hat üzerinde ölçer; surfacepattern'e yazılan iş `[HAT-VARSAYIM]` etiketi taşır.
0.15 Üretilmiş dosya elle yazılmaz. `contract/generated-paths.sha256`'daki **57 yol**
ÜRETEÇ değiştirilerek yenilenir ve sha aynı commit'te güncellenir
(`generated_ratchet_check`, `--accept` ile). Etrafından dolaşan (`node /tmp/x.mjs`)
işçi kovulur, işi reddedilir.
**ÖLÇÜLDÜ 22 Ağu — v3 taslağının bu maddesi üç yerde yanlıştı, düzeltildi:**
manifest 58 değil **57** yol; **`web/index.html` manifestte YOK**; ve
`engine/tools/gen-landing.js` index.html ÜRETMİYOR (139 satır, stdout'a SVG
parçalarından ibaret bir JSON basıyor). rabadon guard `web/index.html`'i
`generated-web-html` kuralının **allow listesinde** tutuyor — kök sayfalar
(index/create/closet/studio) 28 Tem'de BİLEREK "hand-written" ilan edildi.
Yani `web/index.html` ELLE düzenlenir (Damla hükmü, 22 Ağu) ve bu §0.15'in
istisnası değil, kapsamı dışıdır. Korunan 57 yol için kural aynen yürür.

---

# §1 MİMARİ — dört rol, dört ayrı context

Koşu 10–16 saat sürecek; tek context'te yürümez. Dört rol vardır ve hiçbiri
diğerinin oturumunda yaşamaz.

**ŞEF (faz başına 1):** `gece.sh`'in açtığı `claude -p` süreci. Her faz için taze
bir oturum. Şef KOD YAZMAZ (Edit/Write yalnız `GECE/KART/` ve `GECE/F#.md` için;
`engine/ contract/ web/` için Edit/Write şefe VERİLMEZ — allowedTools ile). İşi:
görev kartlarına böler, işçileri `Agent` aracıyla salar, dönen tutanakları
KOSU.md'ye işler, kapıyı çağırır, fazı kapatır ve ÖLÜR. Şef sonraki faza taşınmaz.

**İŞÇİ (faz başına 2–6):** tek iş, tek context, tek görev kartı. Mekanik (v3):
- İşçiler `.claude/agents/` altında tanımlı alt-ajanlardır: `isci-motor.md`
  (Bash,Read,Edit,Write,Grep,Glob) · `isci-arastirma.md` (Read,Grep,Glob,WebSearch,
  WebFetch,Write — yazma alanı yalnız `knowledge/`) · `isci-vitrin.md` (Read,Grep,
  Glob,Bash(node engine/tools/site-health.mjs),Write — yalnız `GECE/`) ·
  `hakem.md` (Read,Grep,Glob,Bash(git diff*),Bash(ctest*)) · `katip.md`
  (Read,Grep,Glob,Edit,Write — yalnız `docs/ README.md GECE/INDEX.md`).
- Her tanımda `maxTurns` = ORAKÇI (varsayılan 40; F2 çekirdek işçisi 80).
  Tur bitti = kesildi: o ana kadarki iş commit'lenir, kalan iş yeni kart olur.
- `gece.sh` şefi `CLAUDE_CODE_FORK_SUBAGENT=0` ile ve `Agent` aracı allowedTools'ta
  olacak şekilde açar. Alt-ajanlar ÖN PLANDA çalıştırılır; arka plan alt-ajanın
  araç listesini sessizce kırpar ve işçi Bash'siz kalır (ölçülmüş davranış, v2.1.198+).
- İşçiye giren context SADECE: RULES.md + ENV.md + kendi kartı (≤80 satır) +
  kartın adıyla saydığı kaynak dosyalar. Alt-ajana tek kanal `Agent` prompt'udur:
  şef kartı ve dosya yollarını prompt'a yazar; "KOSU.md'ye bak" demez.
  KOSU.md, HEDEF.md ve bu dosyanın tamamı işçiye girmez.
- Aynı fazda aynı dosyaya TEK işçi yazar; çapraz kirlenme yasaktır.
- İşçi raporundaki her ölçülen sayının yanına commit hash yazılır; işçi commit
  ATMAZ, şef atar (tek el, tek mesaj dili: küçük harf İngilizce, co-author yok).
- Paralellik kuralı: birbirini görmesi gereken işler (karar, sicil, birleştirme)
  SIRALI; kapalı listeden dağıtılan işler PARALEL. Şef her kart setini önce
  "sıralı mı paralel mi" diye etiketler — kuyruk kapalı değilse iş paralelleşmez.
  Paralel işçi tavanı 4 (eşzamanlı alt-ajan limiti ve iki Max hesabı kotası).

**HAKEM (kapı başına 1):** `gece.sh`'in ayrı `claude -p` ile açtığı temiz oturum,
fazın brief'ini GÖRMEZ (`GECE/hakem-sorusu.md` zaten bunu yapıyor; korunur).
Eline sadece fazın diff'i + fazın eklediği test + RULES.md verilir. Tek sorusu:
"bu çıktı, geçtiğini iddia ettiği şeyi gerçekten yapıyor mu, yoksa testi geçmek
için mi şekillendirilmiş?" Hakem hayır derse faz kapanmaz.

**KÂTİP (faz kapanışı başına 1):** `gece.sh`'in açtığı üçüncü ayrı oturum. Eline
sadece fazın tutanağı (`GECE/F#.md`) + o fazın `git diff <once>..HEAD` + `docs/`
ağacı + README.md verilir. İşi: docs/, README.md ve GECE/INDEX.md'de o fazla
bayatlayan her cümleyi bulmak; güncellemek ya da gerekçesiyle silmek. Kâtibin
anayasası: docs'a "ALL PASS / 0.00mm / bitti / kapandı" gibi duran-iddia yazılmaz —
sayıyı basan testin/aletin ADI yazılır. Kâtip koda, contract/'a, engine/'e
DOKUNMAZ. Kâtibin commit'i faz kapısının K8'idir: o commit yoksa faz kapanmamıştır.

**ARAŞTIRMA KARTI (her faz, v3):** F2–F8'in her biri kapı kurmadan ÖNCE bir
`isci-arastirma` işçisi salar: fazın tek sorusu ("dünyada bu nasıl ölçülüyor /
sektör standardı ne / hangi kaynak") + URL'li cevap →
`knowledge/<konu>-<tarih>.md`. F1'in TEKNOLOJI dosyası bu kartın girdisidir,
yerine geçmez. Kural: o faza ait knowledge dosyası yoksa kapı tasarlanamaz —
araştırmasız tolerans, eşik veya sınıflandırma "gelişigüzel" sayılır ve K3'te
düşer. Her kapının eşiği yanında kaynağı yazar (ör. "1/32" — kaynak: X").
Araştırma işçisi kodu görmez, motor işçisi web görmez; ikisi aynı kartta olmaz.

---

# §2 CONTEXT HİJYENİ

```
GECE/
  KOSU.md      <= CANLI DURUM. ≤150 satır HARD CAP. Satır eklemek için satır sil.
  INDEX.md     <= "şu soruyu sorarsan şu dosyaya bak" tablosu (kâtip günceller)
  KART/        <= görev kartları (≤80 satır; işçinin tek girdisi)
  F0.md...     <= faz tutanakları (uzun, serbest; canlı duruma girmez)
  KAPI.md      <= kapı sonuçları
  DAMLA-KUYRUK  -> repo kökündeki DAMLA-KUYRUK.md (tek kuyruk, ikincisi açılmaz)
  log/         <= ajan, hakem, kâtip ve ctest kütükleri
  gece.sh kapi.sh mutasyon.sh mutasyon.tsv kapi.sha hakem-sorusu.md  <= HARNESS
  arsiv/       <= bu koşuya ait olmayan eski dosyalar
```
- Koşu başlarken GECE/ altında harness ve bu koşunun F0 çıktısı DIŞINDA kalan
  dosya varsa `GECE/arsiv/`e taşınır ve hiçbir faza OKUNMAZ. `F0.md · KOSU.md ·
  KAPI.md · INDEX.md · log/F0.*` bu koşunundur, kalır; içindeki sayılar F0'ın
  yeniden-ölçümüyle TEYİT edilmeden sonraki faza devredilmez.
- HEDEF.md'nin tamamı, DAMLA-KUYRUK.md'nin tamamı, devlog.md, linkedin.md,
  STRATEGY.md, reports/, Logs/ hiçbir oturuma girmez; HEDEF'ten gerekirse
  grep ile tek satır çekilir (TUR bölümlerinden asla).
- Görev kartı şablonu: NE (tek cümle) · GİRDİ DOSYALARI (isim isim) · ÇIKTI
  (dosya yolu + kapı adı) · ÖNCE GREP (hangi mevcut test/alet okunacak) ·
  YASAKLAR (o karta özel) · SÜRE TAVANI (maxTurns).
- KOSU.md şablonu: ŞU AN (faz + tek cümle durum + son yeşil commit) · HAT
  VARSAYIMI · KAPANMIŞ FAZLAR (faz başına tek satır + tutanak yolu) · AÇIK
  KIRMIZILAR (ne · nerede · ölçülen sayı) · SONRAKİ FAZIN DEVRALDIĞI ÜÇ SAYI ·
  DAMLA'YA DÜŞEN (bloke etmez).
- Faz brief'leri bu dosyada `<!--FAZ:F#-->` … `<!--FAZ-SON:F#-->` arasında durur;
  `gece.sh` yalnız o bloğu + §0–§3'ü şefe verir.

---

# §3 KAPI PROTOKOLÜ

## 3.0 Harness (v3 — sıfırlanmaz, genişletilir)
`GECE/kapi.sh` bugün K1–K7 koşturuyor (K1 ctest tabanı · K2 yeni test faz-öncesi
kırmızı mı · K3 kanıt yolları · K4 eşik sabiti oynadı mı · K5 harness dokunulmazlığı
+ mühür · K6 mevcut teste dokunuldu mu · K7 context hijyeni). v3'ün ilk hamlesi TEK
"kapı commit'i"dir: `kapi.sh`'a **K8 kâtip** (o fazda `docs/|README.md|GECE/INDEX.md`
dokunan ve mesajı `docs(F#):` ile başlayan bir commit var mı) ve **K9 üretilmiş-dosya
ratchet'i** (`generated_ratchet_check` yeşil mi) eklenir; `mutasyon.tsv`'ye K9'u kıran
satır yazılır; mühür yenilenir; gerekçe commit mesajına. Sessiz kapı değişikliği yasak.
`gece.sh`'e eklenen: `FAZLAR` dizisi v3 numaralarıyla; şef/hakem/kâtip için üç
ayrı `claude -p` çağrısı; `--allowedTools`'a `Agent` ve araştırma fazı için
`WebSearch,WebFetch`; `is_error:true` → "koşmadı", kırmızı değil (zaten var,
korunur); `--bare` KULLANILMAZ (`.claude/agents/` okunmalı).
`mutasyon.sh`'in ZORUNLU listesi v3 numaralarına kaydırılır (v2 F1..F7 = v3 F2..F8).

**ÖLÇÜLDÜ 22 Ağu — v3 taslağının iki mekaniği bu sürümde YOK, gece.sh'a yazılmadı:**
- `--max-turns` **yok** (kurulu sürüm 2.1.172; `claude --help`'te sadece
  `--max-budget-usd` var). Yazsaydım `claude` flag'i reddederdi ve HER FAZ
  "koşmadı" düşerdi. Şefin tur tavanı yok; işçilerin var (`maxTurns`, frontmatter).
- `CLAUDE_CODE_FORK_SUBAGENT` dokümanda bulunamadı (UNVERIFIED). Zararsız
  olduğu için set ediliyor, ama ona GÜVENİLMİYOR.
- Doğrulanan (uçtan uca koşturuldu): alt-ajan aracının adı **`Agent`** (`Task` değil);
  `.claude/agents/` `-p` modunda yükleniyor; alt-ajanın Bash'i çalışıyor;
  `maxTurns` frontmatter alanı geçerli.

## 3.1 Beş alt kapı — hiçbir faz kendini "geçti" ilan edemez
1. **Makine kapısı (K1+K2)** — ctest koşar: kırmızı ad kümesi büyüdü mü; fazın
   eklediği yeni test, faz-öncesi commit'te KIRMIZI düşüyor mu. Düşmüyorsa test
   boştur (vacuous) ve bu tek başına fazı çürütür. Mühür kırılırsa koşu durur.
2. **Kanıt kapısı (K3)** — rapordaki her sayı ve dosya yolu `test -f` ile doğrulanır.
3. **Hakem kapısı (K4)** — §1'deki temiz oturum.
4. **Yazma kapısı (K6+K7+K9)** — KOSU.md + KAPI.md güncellenir, commit atılır;
   üretilmiş dosya değiştiyse sha aynı commit'te.
5. **Kâtip kapısı (K8)** — kâtip oturumu koşar, docs commit'i atılır.
Kapı kırmızıysa faz kapanmaz ve sonraki faz açılmaz; reddedilen iş
`gece/F#-reddedildi` dalına alınır, ana dal temiz kalır. Tek istisna: kırmızı
Damla'ya bağlıysa DAMLA-KUYRUK'a satır düşer, koşu devam eder. Kırmızı "sonraki
faza" taşınmaz. Ajan ölümü (API hatası, kota) kırmızı DEĞİLDİR: koşmamış faz
koşmamıştır, bir kez yeniden başlatılır; ikinci ölümde koşu o fazda durur ve
`GECE/STOP.md`'ye yazar.

---

# §4 FAZLAR

Çekirdek: **F0 → F1 → F2 → F3 → F4 → F5.** Sırayla; biri kapanmadan sonraki
açılmaz. Uzatma: **F6 → F7 → F8** (kalan süreye göre). Kapanış: **F9 (docs) →
F10 (landing) → F11 (rapor)** — uzatmalardan BAĞIMSIZ zorunludur: çekirdek
nerede biterse bitsin sabaha bu üçü koşar. Bağımlılık istisnası: F3, F2'ye sert
bağlı DEĞİL (gece.sh F2 düşse de F3'ü açar); F4 ve F5 F2'ye bağlı; F6 F3+F5'e.

<!--FAZ:F0-->
## F0 — DÜRÜST ENVANTER (45–90 dk) · ÖLÇÜM, ONARIM YOK

Bu fazda hiçbir şey düzeltilmez. F0 bir kez koştu (21 Ağu); bu koşu onu
YENİDEN ÖLÇER, okumaz. Şef önce §3.0 kapı commit'ini bir işçiye yaptırır
(tek işçi, sıralı), sonra 3 işçiyi paralel salar:

**İşçi 0A — motor.** (1) ctest tam koşusu temiz worktree'de: kaç test, kaçı
kırmızı, İSİM İSİM — `Testing/Temporary/LastTestsFailed.log`'dan, dokümandan
değil; `GECE/log/F0.red.before` ile karşılaştır, fark varsa sebebi.
(2) Operatör sicili (contract/garment-spec-v2.json): shipped/flagged/absent
sayıları ve absent adları; ANAYASA damar detaylarından (fiyonk, büzgü/shirring,
mini-düğme, fırfır/volan/peplum, lace-up, dantel + kol/yaka/etek aileleri)
hangileri sicilde İSİM olarak bile yok. (3) DAMAR YÜZDESİ: damarın kaç yüzdesi
bugün SEVK EDİLEN (`garment`) hatta üretilebiliyor; hesap yöntemi tutanağa
yazılır ki F11 aynı yöntemle yeniden ölçebilsin. (4) Flat ↔ kalıp: flat
kalıptan türüyor mu (render hattının kaynağı okunarak); aynı spec'ten üretilen
flat ile kalıbın ortak ölçüleri yan yana. (5) Flat kalem envanteri: flat kaç ayrı
üreticiden çıkıyor (`render-garment-flat.mjs` · `flat-engine/_engine-full.mjs`
ve diğerleri). **(6) KAPI ÖN-ENVANTERİ (v3):** `engine/tests/` altındaki 96
testten hangileri F2/F5/F6/F7 kapılarının parçasını ZATEN ölçüyor — en az şu
adlar okunur: `closed_garment_check · notch_alignment_check · wearability_check ·
wearable_check · flatten_check · body_volume_check · garment_shell_check ·
drape_check · sewable_census · sleeve_check · cap_sleeve_check · gather_check`.
Her biri için: ne ölçüyor · hangi v3 kapısına denk · eksik ne. Bu tablo olmadan
F2/F5/F6 yeni test YAZAMAZ (§5 "önce grep").
**İşçi 0B — sözlük.** İki sözlüğün felsefe farkı: hangi dosya malzeme diliyle
(sürekli parametre), hangisi yemek diliyle (kapalı enum) konuşuyor; sevk edilen
taraf hangisi. `vision-student`'ın kelime listesi nereden kopyalanmış.
`engine/vocab.json` · `contract/spec-grammar.json` · `contract/terms.json` okunur.
**İşçi 0C — vitrin.** `docs/` ve `web/`deki her iddia cümlesi tablolanır: iddia ·
hâlâ doğru mu · kanıtlayan test/alet · hüküm adayı (kal/güncelle/sil). Hangi
sayfa hangi üreteçten çıkıyor (`gen-landing.js`, `gen-style-pages.mjs`,
`gen-guide.mjs`, `gen-collections-page.mjs` …) ve üreteç bugün koşuyor mu
(K16 ENOENT durumu). `node engine/tools/site-health.mjs` çıktısı. Atölyenin
gösterdiği beden = seçilen beden mi. Bu işçi hüküm vermez, sayar; tablosu
F9 ve F10'un girdisidir.

Çıktı: `GECE/F0.md` (yeniden) + KOSU.md. Kapı: her maddenin en az bir dosya
yolu / komut çıktısı var mı; damar yüzdesinin hesap yöntemi yazılı mı; (6)
tablosu var mı.
<!--FAZ-SON:F0-->

<!--FAZ:F1-->
## F1 — DÜNYA TARAMASI: tech stack araştır, al ya da aş (1.5–2.5 s)

Amaç: sonraki her fazın "dünyada bu nasıl çözülmüş" sorusuna gidebileceği TEK
kaynak dosya. Bu faz onarmaz, motor koduna dokunmaz. Şef `isci-arastirma`
tipinde 3 işçiyi PARALEL salar; bu işçilerin WebSearch/WebFetch'i VARDIR ve
her satırın yanına erişilen URL yazılır — URL'siz satır K3'te düşer.

**İşçi R1 — akademik hat.** GarmentCode/PyGarment + GarmentCodeData; ChatGarment
(VLM'e geometri değil JSON ürettiriyor — "LLM spec yazar, kod yazmaz" emsali;
GarmentCode'u VLM için nasıl sadeleştirdiklerini özellikle incele);
Design2GarmentCode; AIpparel; Sewformer/SewFactory (in-the-wild zaafları dahil);
DressCode/SewingGPT; GarmentDiffusion; NeuralTailor; GarmageNet/GarmageSet;
Dress-1-to-3 — ve 2025–26'da çıkan, bu listede olmayan en az 3 yeni iş (arama
zorunlu, liste donuk değil). Beş kolon: ne çözüyor · girdi/çıktı temsili ·
LİSANS · hüküm (adopt / port / matematiğini-al / ret + tek cümle) · hangi fazı besliyor.
**İşçi R2 — endüstri hat.** CLO3D, Browzwear VStitcher, Style3D, Optitex,
Gerber AccuMark, TUKAcad: vaat, çıktı formatları (DXF-AAMA, tech-pack, graded
DXF — parite listesi), fiyat sınıfı. Hüküm: hangi vaadi bizim hangi kapımız
ölçebilir hale getirmeli. Mevcut `dxf_check.sh` / `tech_pack_check.sh` ile çakıştır.
**İşçi R3 — açık kaynak zanaat.** Seamly2D (parametrik nokta/çizgi "malzeme"
dili, sözlük adlandırması) ve FreeSewing (part/point/path/macro mimarisi);
ayrıca düzlemleştirme/kumaş için kullanılabilir serbest lisanslı kütüphaneler
(libigl/ARAP-flatten, CGAL, Clipper2 vb.). `knowledge/` altındaki mevcut
defterlerle çakıştır; doğrulanmış yokluklar YENİDEN ARANMAZ.

Çıktı: `knowledge/TEKNOLOJI-<tarih>.md` — üç tablo + F2–F10'un her biri için
"bu faza düşenler" (boşsa "dünyada emsal bulunamadı" AÇIKÇA). Serbest lisanslı
kod/matematik almak serbesttir, alınan her parça kaynağını başlıkta söyler;
model ağırlığı / GPU / harici API = §0.9. Kapı: her hüküm bir URL'ye bağlı mı;
her "adopt"un lisansı yazılı mı.
<!--FAZ-SON:F1-->

<!--FAZ:F2-->
## F2 — TEK NESNE: flat ile kalıp aynı kabuktan türesin (3–5 s)

Damla'nın yasası: flat ile kalıp tek matematiksel nesnenin iki izdüşümüdür.
Birbirini denetlemeyen iki üretim hattı varsa ikisi de güvenilmezdir. F0 hangi
hattın nereden beslendiğini ölçtü (hem/bel oranı: kalıp 1.787 · flat 1.214 —
yeniden ölçülür); bu faz ikisini tek kaynağa bağlar.

```
Gövde yüzeyi ─> giysi kabuğu (ease + siluet uygulanmış)
      ├─> ÖN/ARKA ORTOGRAFİK PROJEKSİYON -> flat siluetleri
      └─> AÇILIM (flatten)               -> kalıp panelleri
```
Flat bitmiş giysi çizimidir: pensler kapalı, dikişler kapanmış, giysi vücut
üstünde. Dış kontur ÇİZİLMEZ, HESAPLANIR; iç çizgiler kalıbın gerçek dikiş
hatlarının aynı projeksiyona düşürülmüş hâli.

ÖNCE GREP (v3): `garment_shell_check.cpp · body_volume_check.cpp · flatten_check.cpp
· engine/src/shoulder.cpp` ve `flatten-research/` okunur; kabuk zaten kısmen
varsa üstüne yazılmaz, genişletilir. F1'in F2 bölümündeki matematik işlenir.

Kapı `flat_pattern_agree_check` (yeni test): aynı spec'ten üretilen flat ve kalıp
için 6 ölçü %1.5 toleransta eşit — etek ucu çevresi · göğüs çevresi · bel
çevresi · gövde boyu · yaka açıklığı genişliği · omuz genişliği. Test faz-öncesi
commit'te KIRMIZI düşmeli. Anti-hack: flat'e sabit çarpan YASAK — kapı iki
hattın aynı kaynaktan beslendiğini kanıtlar, sayıları eşitlemeyi değil.
Gece bitmezse: ön gövde tek bedende çalışan hat, tam çalışan sahte hattan
iyidir. Eski çizim hattı silinmez, `_LEGACY` bayrağı arkasına alınır;
`_engine-full.mjs:256`'daki 2 stil-pinli kaçış bu fazda ölçülüp kaldırılır ya da
gerekçesiyle DAMLA-KUYRUK'a.
İşçi bölümü: kabuk→projeksiyon çekirdeği SIRALI tek işçide (maxTurns 80, gerekirse
iki kartta); ölçüm aleti ve test yazımı PARALEL ayrı işçilerde, aynı dosyaya
iki el değmeden.
<!--FAZ-SON:F2-->

<!--FAZ:F3-->
## F3 — MUTFAK: sözlük reformu, menü değil malzeme (3–5 s)

Damla'nın teşhisi: doğru dağarcık yemek değil MALZEMEDİR. Kapalı isim listesi
menüdür; Valentina/Gerber sınıfının tuttuğu şey mutfak sözlüğüdür. Sözlük hep
DİKİŞ ve malzeme diliyle kurulur. F0-0B hangi dosyanın hangi dilde olduğunu
ölçtü; bu faz mutfağı sevk edilen hat yapar.

```
KATMAN 1 — PRİMİTİF (sürekli, kapalı liste değil):
   Edge  : parametrik kenar (düz/yay/spline), uzunluk + eğrilik + gerginlik
   Panel : kapalı kenar zinciri + grainline + katlama ekseni
   Seam  : iki kenarı eşleştiren bağ (uzunluk eşitliği + yedirme oranı + çentik)
   Op    : suppress(pens/prenses) · gather(oran) · flare(koni açısı) ·
           extend(mm) · split(oran) · overlay · attach
KATMAN 2 — BİLEŞEN: bodice · sleeve · skirt · collar · cuff · band · overlay
KATMAN 3 — TARİF: sadece isim + parametre demeti
   "sweetheart" = necklineDraft(...) · "puf kol" = sleeve(capHeight=...,...)
```
Yasa: Katman 3'teki her isim Katman 1/2'ye çözülür; çözülmeyen isim sözlüğe
girmez. İsim silinince geometri kalır. İki tarif arasındaki her ara değer geçerli
bir giysidir. İş: primitif tanım dosyası `contract/`a; mevcut enum'ları
primitiflere çözen tablo; kural tabanı Katman 3 preset tablosuna taşınır ve TEK
kaynak olur; `vision-student` kelime listesi Katman 3'ten ÜRETİLİR (`gen-vocab.mjs`
üzerinden, elle değil). F0'ın "sicilde adı yok" saydığı her damar detayı sicile
İSİM olarak girer (statüsü absent olsa bile). Kapı `preset_resolve_check`: her
preset primitiflere çözülüyor ve çözümü motorda gerçekten panel üretiyor mu.
Anti-hack: tabloya isim eklemek bedava — sözlüğe girişin bedeli çizen bir panel zinciridir.
<!--FAZ-SON:F3-->

<!--FAZ:F4-->
## F4 — FLAT KONVANSİYONU + ZEVK ÖN-TARAMASI (2–4 s)

Damla'nın şartı: bütün flat'ler aynı modelden çıkmış gibi — tek manken, tek
konvansiyon. Ölçülebilir. Figür yasası (memory'den, anayasa hükmünde): gerçek
36–38 beden kadın, bel oyuk, kalça dolgun; etek doğal kalçadan düşer; prenses
dikişi anatomik.

Kapı `flat_convention_check`:
- Tek croquis: iki farklı stilin flat'inde omuz genişliği / göğüs hattı
  yüksekliği / bel hattı yüksekliği ±2mm (F2 biterse bedava).
- Ölçek beyanı: her SVG `data-scale` taşır, gerçek ölçüyle tutarlı (1:8).
- Çizgi hiyerarşisi: dış siluet + ana dikiş KALIN · iç dikiş/pens İNCE ·
  topstitch KESİKLİ · gizli hat NOKTALI; oranlar dosyada beyanlı.
- Sıfır gölge/gradyan, tek kontur rengi. Ön + arka zorunlu. Karmaşık bölgeye callout.
- Çizim artefaktları (koni açılımından tırtıklı etek ucu sınıfı) kökten
  düzeltilir; kırpmayla GİZLENMEZ. `render-lint.mjs` varsa ona bağlanır.

ZEVK ÖN-TARAMASI (isci-arastirma, paralel): Chanel haute couture, Bershka/
Stradivarius, gen-z estetiği ve profesyonel Etsy flat listinglerinden REFERANS
PANOSU — link + özellik-dili tarifi; görsel indirilmez (§0.11). Konvansiyon
kapısını geçen adaylar ESKİ|YENİ yan yana `~/Desktop/gece-zevk-panosu/`na
basılır. Flat'in testi SATILABİLİRLİKTİR ve hakemi Damla'dır: pano hazır
olunca DAMLA-KUYRUK'a satır, koşu BLOKE OLMAZ. Ölçülmüş bantlardan geçmeyen
render panoya KONMAZ (Damla "beğendin mi" turu istemiyor).
<!--FAZ-SON:F4-->

<!--FAZ:F5-->
## F5 — DİKİLEBİLİRLİK KAPISI: kalıp gerçekten dikilir mi (3–5 s)

Ayrım: flat gerçek mankene göredir ve SATILABİLİRLİK testine tabidir; kalıp
insana göredir ve DİKİLEBİLİRLİK testine tabidir. Asla yer değiştirmezler.

ÖNCE GREP (v3): F0-0A(6) tablosu girdidir. `sewability_check` YENİ BİR DOSYA
DEĞİL, mevcut testleri bağlayan bir ÇATI testidir; olmayan parça yazılır:
1. Dikiş çifti eşitliği (1/32" tolerans, beyan edilmiş yedirme) — `notch_alignment_check`
   ve `sewable_census` ne ölçüyor, eksik ne.
2. Çentik eşleşmesi — aynı sıra, aynı yay uzunluğu.
3. Kapalılık — `closed_garment_check`: kendini kesmiyor, sıfır alanlı üçgen yok.
4. Köşe açısı — dikiş birleşim noktalarında açı toplamı (kırışık kökü).
5. GEÇİŞ ve dünya arayüzü — `wearability_check`/`wearable_check`: en dar halka
   baş/omuz çevresinden geçmiyorsa kapanma zorunlu VE kapanma donanımı dükkânda
   satılan boyda. Kapanma dili TEK KARAR DEĞİL (Damla hükmü): lace-up / fermuar /
   gizli fermuar / düğme / kapanmasız, giysinin fonksiyonudur — yaka açıklığı,
   kumaş esnemesi, oturma payı ve stil belirler. F5'in araştırma kartı terzilik
   kaynaklarından kapanma SEÇİM TABLOSUNU çıkarır (hangi açıklık + hangi esneme
   → hangi kapanma, hangi boy); motor bu tabloyla spec'ten kapanmayı HESAPLAR
   ve sicile operatör olarak yazar; kapı "hesaplanan kapanma ile giysi vücuttan
   geçiyor mu" diye ölçer. Tablo `knowledge/kapanma-<tarih>.md`.
6. Geri projeksiyon — `drape_check`/`body_volume_check` üstüne: paneller dikili
   varsayılır, 3B'ye geri sarılır; gerinim eşiği aşıyorsa kalıp yanlıştır
   (`shoulderSeam` iç gerinimi %24/%18, kapı %3 — F0 sayısı yeniden ölçülür).
Kural 0.4 burada tam yürür: kırmızı = "hata şu, kökü şu, çözüm adayları şunlar,
ölçülen sonuçları şunlar".
<!--FAZ-SON:F5-->

<!--FAZ:F6-->
## F6 — KOL (uzatma, 4–8 s)

Damar setinin ezici çoğunluğu puf/balon/kap kollu. Kol mutfağın ürünüdür: bir
Panel + iki Seam (kol oyuğu arayüzü + kol içi) + kapak eğrisi. "Puf kol" =
kapak yüksekliği; "balon kol" = kapak + kol ağzı büzgüsü — Katman 3 tarifi.
ÖNCE GREP: `sleeve_check.cpp · cap_sleeve_check.cpp · gather_check.cpp ·
knowledge/cap-ease-isareti-2026-08-17.md · knowledge/armscye-on-arka-2026-08-17.md`.
Kapı: kol oyuğu yayı ile kapak yayı beyan edilmiş yedirme oranıyla eşleşiyor
mu (F5 madde 1 bunu ölçebiliyor olmalı). Kaynaklar çelişirse motor ölçüyü
basar, yargılamaz; hüküm DAMLA-KUYRUK'a.
<!--FAZ-SON:F6-->

<!--FAZ:F7-->
## F7 — KUMAŞ EKSENİ + REHBER (uzatma, 2–3 s)

Ürün **kalıp + flat + rehber**. Kumaş spec'in bir ekseni olur. Sektör hesabı:
dokuma ~0 esneme (pozitif ease zorunlu) · stable knit %0–25 · orta %26–50
(~%3) · esnek %51–75 (~%5) · süper %76+ (~%10, pens kalkar). Negatif ease ham
formülle uygulanmaz (recovery). Yasa: aynı spec + farklı kumaş = FARKLI kalıp.
ÖNCE GREP: `knowledge/seed_fabrics.sql · guide_check.cpp · web/guide/
choosing-fabric.html (üreteç: gen-guide.mjs)`. Kapı `fabric_ease_check`: dokuma
ve %50 örme için aynı spec'in göğüs çevresi farkı beklenen yön ve büyüklükte mi.
Rehber (satılan pakete girer): kumaş önerisi + esneme testi tarifi + kumaşa özel
püf noktalar + kesim planı (`cutplan_check.sh` var). Sayfaya basılmayan öneri
yok hükmündedir — ve sayfa üreteçten çıkar (§0.15).
<!--FAZ-SON:F7-->

<!--FAZ:F8-->
## F8 — GİRİŞ HATTI: foto + prompt → spec, ve "şuraya fiyonk ekle" (uzatma)

Önce ÖLÇ: bugün kaç foto doğru spec'e iniyor (sayı), hatalar hangi sınıfta
(görme / kelime listesi / motor). `photo_ratio_wire_check.mjs` ve
`vision-student/` okunur. F3 sonrası görü dili mutfakla hizalı olduğundan
kapalı-liste kaynaklı hatalar yeniden ölçülür. F1 bulgusu işlenir: emsal VLM'e
JSON ürettiriyor — bizim yasamız bu; iyileştirme spec şemasında aranır. Yeni
model ağırlığı = §0.9.

Düzenleme: model geometri üretmez, spec DIFF üretir:
```
mevcut spec + talimat -> spec DIFF -> şema doğrulaması
  -> operatör sicili (shipped mı; değilse ADIYLA red, §0.3)
  -> yeniden üretim (aynı seed, aynı beden) -> ÖNCE/SONRA farkı
```
Kapı `edit_locality_check`: "yakayı değiştir" deyince etek ucu DEĞİŞMEMELİ —
dokunulmayan panellerde çıktı byte-identical. Bu kapı yoksa düzenleme değil
yeniden üretimdir.
<!--FAZ-SON:F8-->

<!--FAZ:F9-->
## F9 — DOCS BÜYÜK TURU (kapanış, zorunlu, 1–1.5 s)

Kâtip her fazda artımlı çalıştı; bu faz tam taramadır. Ayrı kâtip oturumu
`docs/` (ARCHITECTURE.md · KATMAN-HARITASI.md · SATIS-SARTNAMESI.md ·
loop-engineering.md · reference/) + README.md'yi bugünkü koda karşı okur,
F0-0C tablosunu girdi alır: her iddia için kal/güncelle/sil UYGULANIR. Bayat
bölüm güncellenir ya da `docs/archive/`e gerekçeyle taşınır; sessiz silme yok.
`GECE/INDEX.md` son hâline getirilir: koşunun her kalıcı dosyası (TEKNOLOJI,
primitif tanımları, rehber) yönlendirme tablosuna girer.
Kapı `docs_truth_check` (yeni, mekanik, `engine/tests/docs_truth_check.sh`):
docs içinde duran-iddia kalıpları — İngilizce ("ALL PASS", "0.00mm",
"byte-identical", "zero issues", "done", "complete") VE Türkçe ("bitti",
"kapandı", "tamam", "hazır", "sıfır hata") — `docs/archive/` hariç 0 adet;
docs'taki her sayısal iddianın aynı satırında bir test/alet adı. Faz-öncesi
commit'te kırmızı düşmeli — düşmüyorsa ya docs zaten temizdir (ölç, kanıtla)
ya test boştur.
<!--FAZ-SON:F9-->

<!--FAZ:F10-->
## F10 — LANDING: incele, sonra ürünü anlatan sayfaya çevir (2–3 s)

Sıra kesindir: ÖNCE ÖLÇÜM, SONRA TASARIM.
**YÖNTEM (Damla hükmü, 22 Ağu — v3 taslağı burada yanlıştı, §0.15'e bak):**
`web/index.html` **ELLE düzenlenir**. Reponun 28 Tem kararı bu: kök sayfalar
hand-written, rabadon guard onları açıkça allow ediyor, ratchet manifesti
(57 yol) index.html'i içermiyor ve `gen-landing.js` onu üretmiyor.
Tasarım işçisinin yazma alanı: `web/index.html` + `web/css/` + `web/assets/`.
`gen-landing.js`'i index.html üreteci hâline getirmek BU GECENİN İŞİ DEĞİL
(408 satırlık el yazısı sayfayı üretece çevirmek tek başına bir gece).
Korunan 57 yoldan birine dokunulursa §0.15 aynen yürür: üreteci değiştir,
`generated_ratchet_check.sh --accept`, sha aynı commit'te.
Bitişte `node engine/tools/site-health.mjs` yeşil olmak zorunda.

**10a — Envanter (isci-vitrin):** F0-0C tablosu tazelenir: `web/` altındaki her
sayfada her iddia · hâlâ doğru mu · kanıtlayan test/alet · hüküm. Ölü link
taraması (`site-health.mjs`). UI'ın söylediği ile motorun yaptığı arasındaki
her fark YALAN olarak listelenir. Bugünkü başlık "a fixed-size pattern CAD …
DXF-AAMA a factory reads": fabrika-B2B dili; ürün bu değil — tabloya girer.
**10b — Tasarım (isci-motor, 10a bitmeden başlamaz):** sayfa şu ürünü anlatır:
- foto + prompt → **kalıp + flat + rehber** (üç çıktı, üçü de sayfada görünür);
- mutfak anlatısı: sınırlı malzeme → sınırsız ürün (F3 gerçekleştiyse canlı
  örnekle; gerçekleşmediyse VİZYON etiketi + gelecek zaman — asla karıştırılmaz);
- düzenleme vizyonu ("şuraya fiyonk ekle") — F8 durumuna göre demo ya da vizyon;
- kumaş ekseni: aynı elbise, iki kumaş, iki kalıp (F7 çıktıysa gerçek görselle);
- ileriye dönük katman (üyelik, forum, iOS) vizyon bölümünde tek satır.
Tasarım şartları: premium his, flop UI yasak (kalıcı veto); mevcut görsel kimlik
(renk `#1f3a5f`, tipografi, og-card) YENİDEN YAZILMAZ — düzen ve içerik
yenilenir; kimlik değişikliği gerekiyorsa iki yönlü taslak DAMLA-KUYRUK'a;
waitlist korunur; mobil kırılım kontrol edilir (ekran görüntüsü: headless
chromium/playwright varsa, yoksa `npx` ile kurulmaz — DAMLA-KUYRUK'a).
Kapı `landing_truth_check` (yeni, mekanik): sayfadaki her sayı ve özellik
iddiası repoda bir test/alet adıyla eşleşir ya da sayfada durmaz; VİZYON
bölümleri şimdiki zamanla yazılmaz; ölü link 0; gösterilen beden = seçilen
beden; `generated_ratchet_check` yeşil. Deploy YAPILMAZ (ENV: Damla'nın adımı);
yayın öncesi ekran görüntüleri DAMLA-KUYRUK'a, koşu bloke olmaz.
<!--FAZ-SON:F10-->

<!--FAZ:F11-->
## F11 — KAPANIŞ (her koşunun sonunda, atlanmaz)

1. ctest: F0'ın saydığı kırmızı kümesinden kaçı kapandı, isim isim; yeni
   kırmızı ad 0 mı. İki log commit'e girer.
2. DAMAR YÜZDESİ, F0'ın AYNI yöntemiyle yeniden ölçülür. Kımıldamadıysa açıkça yazılır.
3. KOSU.md son hâli + DAMLA-KUYRUK'a düşen yeni kararlar (tek kuyruk).
4. Yalnızca `git push origin main` sonrası rapor (force yok, guard zaten yasaklar).
   "Bitti/hazır" toptan cümlesi yasak; yapılan ve yapılmayan ayrı ayrı.
5. Rapor Damla'ya üç sayıyla başlar: kaç kapı yeşile döndü · kaç yeni kırmızı
   doğdu (hedef 0) · damar yüzdesi neden nereye geldi. Dördüncü satır: docs ve
   landing'in önce/sonra ekran görüntüsü yolları. Beşinci: reddedilip yan dalda
   kalan işlerin dal adları.
<!--FAZ-SON:F11-->

---

# §5 KOŞU BOYUNCA YASAK OLANLAR
- Kapıyı gevşeterek geçmek · kırmızıyı sonraki faza taşımak · boş (vacuous) test.
- Yeni dosya enflasyonu: faz başına en fazla 3 yeni kaynak dosya; fazlası gerekçeyle.
- Araştırma kartı olmadan kapı/eşik/tolerans yazmak (§1 ARAŞTIRMA KARTI).
- Var olan aleti/testi okumadan ikincisini yazmak: `engine/tools/` 99 alet,
  `engine/tests/` 94 dosya (ctest 96 test) — önce grep, sonra yaz (her kartta ÖNCE GREP satırı).
- Damla'nın onaylamadığı çıktıyı "geçti" saymak.
- Şefin kod yazması · işçinin KOSU.md'ye dokunması · kâtibin koda dokunması ·
  işçinin commit atması.
- Üretilmiş dosyayı elle yazmak (§0.15) · telifli görsel (§0.11) ·
  patterns_real (§0.10) · bulut görsel servis (§0.9) · deploy (ENV).
- `--bare` ile şef açmak (işçi tanımları yüklenmez) · alt-ajanı arka planda salmak.

# §6 AÇILIŞ (ilk oturuma yapıştırılacak — repo'nun 21 Ağu hâline göre)
```
0) `stash@{0}` ve `gece/F1-reddedildi` koşunun konusu değil: dokunulmaz,
   okunmaz, kuyruğa yazılmaz. patterns_real kırmızıları (contract_check,
   bugra_bridge_check) ilan edilmiş karardır (Damla, 22 Ağu): kapatılmaz.
1) Bu dosyayı repo köküne GECE-KOSUSU.md olarak commit et (eskisi
   GECE/arsiv/GECE-KOSUSU-v2.md'ye). GECE/ altında harness + F0 çıktısı dışında
   kalan dosya varsa GECE/arsiv/'e taşı (§2).
2) .claude/agents/ (gitignore'lu, yerelde VAR) önce OKUNUR; mevcut tanımlar
   §1'deki beş rolle çakıştırılır, eksik olan eklenir, olan ezilmez. CLAUDE.md
   ve CLAUDE.context.md'deki kurallar §0 ile çelişiyorsa §0.1 uygulanır.
3) KAPI COMMIT'İ (§3.0): kapi.sh'a K8+K9, mutasyon.tsv'ye K9'u kıran satır,
   mutasyon.sh'in ZORUNLU listesi v3 numaralarına, gece.sh'a
   FAZLAR=(F0 F1 F2 F3 F4 F5) + uzatma/kapanış dizileri, üç ayrı claude -p
   (şef/hakem/kâtip), Agent+WebSearch+WebFetch allowedTools,
   CLAUDE_CODE_FORK_SUBAGENT=0, --max-turns. mutasyon.sh'ı KOŞTUR (mühür
   yenilenmeden önce K8'in gerçekten kırılabildiğini kanıtla). sha256 mühürü
   yenile, gerekçe commit mesajına. Ağaç temiz.
4) F0'ı koş: ölçüm, onarım yok. Kapıdan geçir, commit at.
5) Sırayla F1→F5. Çekirdek biterse F6→F8 uzatması. Süre ne kalırsa kalsın
   sabah F9→F11 kapanışı KOŞULUR.
6) Damla'ya tek bloke olmayan kuyruk: DAMLA-KUYRUK.md (beden cevabı, zevk
   panosu, model-ağırlığı, landing kimlik yönü, yayın onayı).
7) Başlat: bash GECE/gece.sh > GECE/log/gece.txt 2>&1 &
```
