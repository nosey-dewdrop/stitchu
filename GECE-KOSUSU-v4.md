# STITCHU GECE KOŞUSU v4 — PM/şef/işçi/hakem/kâtip protokolü (koşucu script YOK)

Repo kökü: `GECE-KOSUSU-v4.md`. Önceki protokol (`GECE-KOSUSU.md`, v3) bu dosyayla
YÜRÜRLÜKTEN KALKAR; §0 değişmezleri ve faz tanımları buraya taşındı, v3'ten alıntı
yapılmaz. `GECE/gece.sh` emeklidir, bir daha koşturulmaz (§H).

---

## §A BU GECE NEYİ DÜZELTİYORUZ — v3 koşusunun ölçülmüş otopsisi

v3 koşusu (22 Ağu) **ana dala tek satır kod sokmadı.** Üç kök sebep, üçü de repoda
kanıtlı; bu protokolün her yapısal kararı bu üçünün ilacıdır:

1. **Harness işi sildi.** `gece.sh` kapı kırmızısında reddedilen dalı hiç
   yaratamıyordu (`DUR()` if'i asla doğru olmuyordu) ve `git clean -fdq`'ya düşüyordu;
   işçiler hiç `git add` çağırmadığı için F0+F6+F9+F10'un işi git nesnesi bırakmadan
   gitti (`GECE/F11-B.md`, `GECE/KOSU.md` §HARNESS KUSURU).
   → **İlaç:** koşucu yok; her işçi kendi dalına COMMIT atmadan rapor veremez (§C).
2. **Kapı scripti yapısal olarak ölü.** `GECE/kapi.sh` K2, fazın eklediği yeni
   testi faz-öncesi worktree'de aradığı için hiçbir yeni kapı "faz öncesinde
   kırmızıydı" diyemez; K6 mevcut teste dokunmayı yasakladığından hiçbir faz yeni
   kapı kuramaz (`GECE/F6.md` §6, `GECE/STOP.md` F9/F10 K2 satırları). K4 yorum
   satırını koddan ayırmıyor (F9'u iki YORUM satırı düşürdü).
   → **İlaç:** §H harness fazı — tek kapı commit'i, mühür yenilenir, mutasyonla kanıt.
3. **Çekirdek hiç koşmadı.** `GECE/` altında F1–F5 tutanağı YOK; koşucu
   F0 → F6 → F9 → F10 → F11 diye atladı. Dünya taraması, tek-nesne, mutfak,
   konvansiyon, dikilebilirlik — hiçbiri açılmadı.
   → **İlaç:** §D faz sırası; F6/F9/F10 yeniden inşa tarifi mevcut (ucuz), çekirdek
   pahalı ve asıl iş.

Bu gece devralınan sayılar (`6208704`/`650de49`, ağaç kod olarak `962407d` ile aynı):
ctest **96 test · 7 kırmızı** (`GECE/log/F11.red.after`) · DAMAR-YETENEK %95.2 /
SEVKİYAT %9.5 / ÜYELİK %29 (`GECE/F11-C.md`) · landing **18 iddia · DOĞRU 0 · YALAN 1
· KANITSIZ 17** (`GECE/F10-A.md`) · docs **52 ihlal** (`GECE/log/F9A.gate.before.txt`).

---

## §0 DEĞİŞMEZLER (her şef/işçi/hakem/kâtip oturumunun başında okunur)

0.1 Otorite: HEDEF.md > ANAYASA.md > RULES.md > bu dosya > diğer her şey. Çelişki
tek karar commit'iyle kapanır, çelişen satır silinir.
0.2 Kanıt = dosya yolu + commit hash. "Baktım / çalışıyor / doğru görünüyor" yasak.
0.3 Sessiz ikame yasak. Sicilde shipped olmayan operatör → spec ADIYLA reddedilir.
0.4 Hata bulmak iş değil; her kırmızı yanında en az bir ÖLÇÜLMÜŞ çözüm adayı.
0.5 Kapsamı en iyi olan belirler, en itaatkâr olan değil. Damla'nın vetoları kalıcı.
0.6 Kırmızı test KÜMESİ (adlar) büyüyemez. Yeni kırmızı ad doğuran değişiklik geri
alınır; iki ctest logu (önce/sonra) commit'e girer.
0.7 Buğra referanstır, kural değil. Kapılar geometri/dikilebilirlik/konvansiyon üstüne.
0.8 Dünya ölçüsü tabandır, tavan değil.
0.9 fal.ai / bulut görsel servis YASAK. Model ağırlığı indirme, harici API anahtarı
→ kurulmaz, DAMLA-KUYRUK'a karar satırı.
0.10 `patterns_real/` dokunulmaz; ona bağlı kırmızılar (`bugra_bridge_check`,
`contract_check`) ilan edilmiş karardır, kapatılmaya çalışılmaz.
0.11 Telifli görsel repoya indirilmez; referans = link + özellik-dili tarifi.
0.12 Kapıyı gevşeterek geçmek yasak. Tolerans değişikliği ölçülür, gerekçesi
yazılır, DAMLA-KUYRUK'a bildirilir.
0.13 Rapor dili: "bu kalıp dikilir mi, bu flat Etsy'lik mi, bu sayfa ürünü anlatıyor mu".
0.14 Ürün hattı = `garment` (`bindings.cpp:238 draftJSON → buildSpec → GarmentDrafter`).
`surfacepattern` sevk edilmiyor; onun üstünde ölçülen hiçbir sayı ürün sayısı değildir.
0.15 **(YENİ) Damla'ya sorulmaz.** Karar gerektiren her şey DAMLA-KUYRUK.md'ye satır
olarak düşer, faz §B'deki VARSAYILAN ile devam eder. Damla'nın yokluğu bloke etmez;
Damla'nın "hayır"ı geri alınabilir olmalıdır (bu yüzden §C'deki dal disiplini).
0.16 **(YENİ) `git clean`, `git stash`, `git reset --hard`, `git checkout -- .`
hiçbir ajana yasaktır.** Silme yalnızca Damla'nın elinde. Reddedilen iş dalda kalır.
0.17 **(YENİ) Tekrarlanmış sayı yeni sayı değildir.** Bir ölçüm ancak bu gecenin
commit'inde koşmuş bir komutun çıktısıysa sayılır; `GECE/F*.md`'den kopyalanan
sayı "DEVRALINAN" etiketi taşır ve kapı girdisi olamaz.

---

## §B OTONOMİ — bu gecenin varsayılanları (Damla uyuyor, koşu akar)

Açık kararların her biri için VARSAYILAN seçilmiştir. Şef bunları uygular, uyguladığını
DAMLA-KUYRUK.md'de o maddenin altına "UYGULANAN VARSAYILAN: …" satırıyla yazar.
Damla sabah herhangi birine "hayır" derse ilgili dal/commit geri alınır.

| açık karar (DAMLA-KUYRUK.md) | varsayılan |
|---|---|
| `gece.sh` yaması uygulansın mı | **Hayır.** Script emekli, `GECE/arsiv/gece.sh.v3` olarak taşınır. Koşucu yok. |
| `/private/tmp/stitchu-gece/` 338M ikili | **Kurtarılmaz.** F6 kaynak tarifi `GECE/F6-C.md:103-120`'de yazılı; F6 yeniden yazılır, ikili yeniden derlenir. Şef ilk 5 dakikada `ls /private/tmp/stitchu-gece/` koşar; varsa `sleeve.cpp`'nin orada bir kopyası kaldı mı diye bakar (`find … -name sleeve.cpp`), bulursa diff'ini `GECE/kurtarma/`ya alır. O kadar. |
| Damar hangi adı taşır | **Manşet sayı = DAMAR-SEVKİYAT** (varsayılan nesnede ne var). YETENEK ve ÜYELİK yanında raporlanır, manşet olmaz. Gerekçe: satılan şey varsayılan nesnedir. |
| `web/index.html:212` "live engine output" yalanı | **Silinir** (F10'da). Cümle ya doğru ya yok; "live" olmayan bir hat için gelecek zaman kipiyle VİZYON'a taşınır. |
| `web/js/missing.js` ters yalan | **Ölçülür** (F8 ölçüm kartı; F8 açılmazsa F10-A'da koşturularak). |
| `kapi.sh` K4 yanlış pozitif | **§H'de düzeltilir** (yorum satırı ayıklanır). |
| `patterns_real/` · `stash@{0}` | Devrediyor, dokunulmaz. |
| F1 işçisinde WebSearch/WebFetch izni reddi (F6-A'da 5 denemede düştü) | §F-açılış ön koşulu: Damla oturumu açmadan izin verir. Yine de reddedilirse işçi yerel `knowledge/` ile sınırlı kalır ve tabloda "ERİŞİM YOK" yazar; uydurmaz. |

Yeni karar doğarsa kural aynı: şef mantıklı varsayılanı seçer, gerekçesini tek cümleyle
yazar, devam eder. "Damla'ya soralım" cümlesi bir fazı durduramaz.

---

## §C MİMARİ — dokuz rol, iki kat

Koşucu script yok. Ana oturum = **PM**. PM'in altında faz başına bir **ŞEF**, şefin
altında işçiler. Yatay roller (danışman, hakem, kâtip, mutasyoncu, orakçı) bağımsız
alt-ajan; hiçbiri diğerinin context'inde yaşamaz.

```
PM (ana oturum, koşu boyu tek)            <- yalnızca KOSU.md + faz özeti okur
 ├─ danisman    (karar; tartışmayı görmez)
 ├─ orakci      (süre/bütçe bekçisi; her 30 dk)
 ├─ mufettis    (her 3 fazda; sayıları sıfırdan ölçer, §M-3)
 └─ sef-F<n>    (faz başına 1 alt-ajan, fazla ölür)
     ├─ isci-*      2–6 (motor / flat / arastirma / terzi / vitrin / tasarim)
     ├─ mutasyoncu  (kapıyı kırmaya çalışır)
     ├─ hakem       (brief'i görmez)
     └─ katip       (docs; 5. alt kapı)
```

**PM — koşu yöneticisi (ana oturum).** Tek işi koşunun akması. Kod yazmaz, kart
yazmaz, tutanak okumaz. Döngüsü:
1. `GECE/KOSU.md` ŞU AN → sıradaki faz.
2. `Task(sef)` sal: girdi = faz adı + §F'deki o fazın bölümü + KOSU.md'nin "devralınan
   üç sayı" ve "açık kırmızılar" bölümleri. Başka hiçbir şey.
3. Şef ≤60 satırlık faz özeti + kapı sonucu + dal adıyla döner. PM commit/push'u
   `git log origin/main -1` ile doğrular; doğrulayamazsa şefi aynı girdiyle yeniden
   salar (ajan ölümü kırmızı değildir).
4. Faz kırmızıysa `Task(danisman)`: "F<n> kırmızı, sebep X; yeniden aç / dar kapsamla
   aç / atla-F9'a git?" — karar uygulanır, KOSU.md'ye yazılır.
5. `date` bas; 07:00 geçtiyse sıradaki faz ne olursa olsun F9.
6. KOSU.md ŞU AN'a "sonraki adım" yaz, 1'e dön. F11 kapanana kadar durmaz; durmaya
   kalkarsa bekçi hook'u (§L) geri çağırır.
PM'in context bütçesi: faz başına ≤3k token giriş. Aşıyorsa şefin özeti uzun demektir,
PM bunu bir sonraki şefin girdisine "özet ≤60 satır" diye tekrar yazar.

**ŞEF (faz başına 1, alt-ajan).** v4'teki gibi: kart yazar, SIRALI/PARALEL etiketler,
işçi salar, ≤40 satır rapor alır, commit'i `git log` ile doğrular, kapıyı sırayla
çağırır (makine → kanıt → mutasyoncu → hakem → yazma → kâtip), `gece/F<n>`'i main'e
merge + push eder ya da `gece/F<n>-red-HHMM` diye yeniden adlandırır, PM'e faz özeti
döndürür ve ölür. Şef soru soramaz: karar → `Task(danisman)`, faz başına en çok 5.
Şef KOSU.md'yi yazar (tek yazar odur); PM yalnızca ŞU AN satırını günceller.

**İŞÇİ tipleri (hepsi §I-isci tabanına ek):**
- `isci-motor` — `engine/src`, `engine/tests`, `contract/`. C++/CMake. Derlemeden
  rapor yok.
- `isci-flat` — `engine/flat-engine`, `engine/tools/render-*`. SVG çıktısı + PNG render
  yolu olmadan rapor yok.
- `isci-arastirma` — WebFetch ile erişim sınar, URL'siz satır yazmaz, görsel indirmez.
- `isci-terzi` — **yeni.** Terzilik/kalıpçılık bilgisi: ease, yedirme, cap ease,
  kumaş bandı, kapanma donanımı. Kod yazmaz; eşik/formül önerir, her biri kaynaklı
  (F1 tablosu veya kitap/URL). F5, F6, F7'nin eşikleri buradan gelir — "bu gecenin
  ölçümünden" değil (F6-A tuzağı).
- `isci-vitrin` — docs/ ve web/ iddia tablosu, ölü link, beden tutarlılığı. Sayar,
  hüküm vermez.
- `isci-tasarim` — **yeni.** Yalnızca F10-C. `web/index.html` + `web/css`. Mevcut
  kimliği korur; 375/768/1280 ekran görüntüsü basmadan rapor yok; `CAD` kelimesi 0.

**DANIŞMAN (karar ajanı).** Tartışmayı, kartları, soranın tercihini görmez. Girdi:
soru (≤10 satır) · seçenekler A/B/C, her biri ölçülmüş maliyetle · `HEDEF.md`'den
grep'le çekilmiş ≤3 satır · v4 §0 + §B · KOSU.md AÇIK KIRMIZILAR. Çıktı ≤15 satır:
KARAR · GEREKÇE (HEDEF/§0 atıflı) · GERİ ALMA KOŞULU · DAMLA-KUYRUK SATIRI. "Damla'ya
sorun" ve "ikisi de olur" yasak; §0.9/0.10/0.11 vetosuna dokunuyorsa bile bu gece için
varsayılan verir. İki soru sınıfı danışmana bile gitmez: eşik/tolerans → §0.12; "kırmızı
kapatayım mı" → §0.4+§0.6.

**MUTASYONCU (kapı başına 1, hakemden ÖNCE).** Fazın eklediği kapıyı kırmaya
çalışır: 3 mutasyon (vacuous test · kodda eşik gevşetme · yorumda eşik kelimesi) +
fazın iddiasına özel 1 mutasyon (ör. F2'de flat'e sabit çarpan ekle → kapı KIRMIZI
düşmeli). Dört sonucu `GECE/log/F<n>.mutasyon-kanit.txt`'ye yazar, dalı geri alır.
Kırılmayan kapı = boş kapı, faz kapanmaz.

**HAKEM (kapı başına 1).** v4 §C'deki gibi; ek olarak mutasyon kanıtını okur ve
"kapı gerçekten ölçüyor mu" sorusunu oradan doğrular.

**KÂTİP (faz kapanışı başına 1).** v4 §C'deki gibi; yazma alanı docs/ README.md
GECE/INDEX.md.

**ORAKÇI (PM'in her 30 dk saldığı bekçi).** Girdi: `git log --since=30.minutes
--all --oneline`, `GECE/KOSU.md` ŞU AN, `date`. Üç soru: son 30 dk'da commit var mı
· şef 60 dk'yı geçen işçi mi bekliyor · 07:00'e ne kaldı. Çıktı tek satır:
`DEVAM` / `KES: <işçi> commit at, kalan kart yaz` / `F9'A GEÇ`. PM uygular.

**§C-dal** v4'tekiyle aynı: işçi dalı → faz dalı → main; commit'siz rapor yok, hiçbir
dal silinmez, `git clean/stash/reset --hard` her ajana yasak (hook'la da kesilir, §L).

---

## §D FAZ SIRASI (bu gece)

```
F0' doğrulama (≤20 dk)  →  H  harness onarımı (45–60 dk)
→ F1 dünya taraması → F2 tek nesne → F3 mutfak → F4 konvansiyon → F5 dikilebilirlik
→ F6 kol (yeniden inşa, tarif var) → F7 kumaş → F8 giriş hattı
→ F9 docs (yeniden inşa) → F10 landing (yeniden inşa) → F11 kapanış
```
Çekirdek F1–F5 sıralı, biri kapanmadan sonraki açılmaz. F6–F8 kalan süreye göre.
**F9 → F10 → F11 her koşulda koşar** — çekirdek F3'te tıkansa bile sabaha docs ve
landing yenilenmiş olur; çünkü ikisi bugün bayat ve bu koşunun açık siparişi.
Zaman yönetimi: şef her faz başında `date` basar; sabah 07:00'de nerede olunursa
olunsun F9 açılır.

---

## §E KAPI PROTOKOLÜ — beş alt kapı, sırayla

Hiçbir faz kendini "geçti" ilan edemez. Şef `GECE/kapi.sh F<n> <faz-öncesi-hash>`
çağırır (§H'den sonra onarılmış, mühürlü hâli), sonra:

1. **Makine kapısı (K1–K9, `kapi.sh`)** — kırmızı ad kümesi büyümedi mi; fazın
   eklediği yeni test faz-öncesi commit'te KIRMIZI düşüyor mu (vacuous kapanı);
   eşik sabiti oynamadı mı; mühür sağlam mı.
2. **Kanıt kapısı** — rapordaki her yol `test -f`, her hash `git cat-file -e`.
3. **Hakem kapısı** — §C'deki temiz oturum.
4. **Yazma kapısı** — KOSU.md (≤150 satır HARD CAP) + KAPI.md güncellenir, commit.
5. **Kâtip kapısı** — kâtip koşar, docs commit'i atılır.
Beşi yeşil → `main`'e merge + push → faz kapandı. Kırmızı → §C-dal.
Ölçüm fazlarında (F0', F1, F11) K2 "yeni test yok" bilgi olarak geçer, kırmızı değil.
Ajan ölümü (API/kota) kırmızı DEĞİLDİR: kart yeniden salınır; ölen işçinin dalı
durduğu yerden devralınır (commit disiplini bunun için var).

---

## §H HARNESS ONARIMI (F0'dan hemen sonra, F1'den önce; kapı commit'i)

Amaç: kapı scriptini kullanılabilir yapmak. §0.12 gereği bu tek, gerekçeli commit'tir;
mühür (`GECE/kapi.sha`) yenilenir; `GECE/mutasyon.sh` ile **kapının hâlâ
kırılabildiği** kanıtlanır. İşçi sayısı 2 (SIRALI):

**İşçi H-A — kapi.sh onarımı.** Okur: `GECE/kapi.sh`, `GECE/STOP.md` (F9/F10 K2-K4
satırları), `GECE/F6.md` §6. Yapar:
- **K2:** yeni test dosyaları (`engine/tests/*` eklenen + untracked) faz-öncesi
  worktree'ye KOPYALANIR (dosya + `engine/CMakeLists.txt`'teki `add_test` satırı),
  worktree'de derlenip o test tek başına koşturulur; **orada kırmızı düşmüyorsa**
  vacuous. Yeni testi kopyalamadan "faz öncesinde yok" demek, K2'yi ölü bırakır.
- **K4:** diff satırlarından yorum satırları ayıklanır (`//`, `#`, `/* */`, `<!-- -->`
  ile başlayan + satır içi yorum); kalan satırlarda eşik kelimesi aranır.
- **K6:** "var olan test DEĞİŞTİRİLMEZ" kalır; "yeni test EKLENEBİLİR" açıkça serbest.
  `engine/CMakeLists.txt`'e yalnızca `add_test` satırı eklemek K6 ihlali sayılmaz.
- **K-ölçüm-fazı bayrağı:** `kapi.sh F<n> <hash> --olcum` → K2 bilgi, kırmızı değil.
- Çıktı: `GECE/kapi.sh` (diff'i `GECE/H.md`'ye), `GECE/kapi.sha` yenilenmiş.

**İşçi H-B — mutasyon kanıtı (H-A bittikten sonra).** Okur: `GECE/mutasyon.sh`,
`GECE/mutasyon.tsv`. Üç mutasyon koşar ve üçünün de kapıyı ÖLDÜRDÜĞÜNÜ kaydeder:
(1) vacuous test (her zaman geçen `add_test`) → K2 kırmızı olmalı;
(2) mevcut bir eşiği 0.5 gevşet, yorum satırına DEĞİL koda → K4 kırmızı olmalı;
(3) yorum satırına "tolerance" kelimesi yaz → K4 YEŞİL kalmalı (yanlış pozitif kapandı).
Çıktı: `GECE/log/H.mutasyon-kanit.txt`. Üçü de beklendiği gibi değilse H kapanmaz.

Ayrıca şef: `git mv GECE/gece.sh GECE/arsiv/gece.sh.v3` (emekli), `GECE/STOP.md`
→ `GECE/arsiv/STOP.v3.md`. Hakem bu fazda `kapi.sh` diff'ini okur, tek soru:
"kapı gevşedi mi?" K2'nin onarımı kapıyı SERTLEŞTİRİR (artık gerçekten ölçüyor);
K4 onarımı yanlış pozitifi kaldırır, gerçek pozitifi bırakır — hakem ikisini (2) ve
(3) mutasyonuyla doğrular.

---

## §F FAZLAR

### F0' — DOĞRULAMA (≤20 dk) · ölçüm, onarım yok
F0 (v3) zaten ölçtü ve ağaç kod olarak değişmedi (`git diff 962407d..HEAD --stat --
engine contract web docs` boş olmalı; şef bunu ilk komut olarak koşar). Bu yüzden F0
baştan yazılmaz; §0.17 gereği yalnızca **kapı girdisi olacak sayılar yeniden koşturulur**:
- İşçi 0'-A: `ctest` tam koşu → `GECE/log/F0v4.ctest.txt`, kırmızı adlar
  `GECE/log/F0v4.red.before` (beklenen 7; farklıysa KOSU.md'ye yazılır, araştırılmaz).
- İşçi 0'-B: damar üç ölçü, F0-A §3.1 / F11-C yöntemiyle, komut çıktısıyla
  (beklenen 95.2 / 9.5 / 29). Yöntem satırı tutanağa.
- Şef: `/private/tmp/stitchu-gece/` bakışı (§B). `GECE/KOSU.md` v4 ilk hâli.
Kapı: `--olcum` bayrağıyla. Çıktı `GECE/F0v4.md` (kısa, devralınan F0-A/B/C/D1/D2'ye
yol verir; onları kopyalamaz).

### F1 — DÜNYA TARAMASI: tech stack araştır, al ya da aş (1.5–2.5 s)
Amaç: F2–F10'un "dünyada bu nasıl çözülmüş" sorusunun TEK kaynak dosyası. Motor
koduna dokunmaz. 3 işçi PARALEL; her işçi **önce** `WebFetch` ile bir sayfa çekerek
erişimi sınar, erişim yoksa raporun ilk satırı "ERİŞİM YOK" olur (§B).

**R1 — akademik hat.** GarmentCode / PyGarment + GarmentCodeData (Edge/Panel/Stitch
üstünde bileşen DSL'i — F3 mutfağının kanıtlanmış şekli; lisansını ve
`pygarment` API'sinin Edge/EdgeSequence/Panel/Interface sınıflarını özellikle);
ChatGarment (VLM'e geometri değil JSON konfigürasyon ürettiriyor — F8'in emsali;
GarmentCode'u VLM için nasıl sadeleştirdiler); Design2GarmentCode; AIpparel;
Sewformer / SewFactory (foto→panel, in-the-wild zaafı dürüstçe); DressCode/SewingGPT;
GarmentDiffusion; NeuralTailor; GarmageNet; Dress-1-to-3. Ek olarak F2 için:
**giysi kabuğu → panel açılımı** literatürü (ARAP/LSCM/BFF yüzey düzleştirme, Wang
"design automation for customized apparel", Sensitive Couture, Pattern-from-3D);
F5 için: panel geçerliliği/dikilebilirlik ölçütleri (Sewformer'ın stitch-validity
metrikleri, GarmentCode'un sim-readiness kontrolü).
Satır şablonu: ne çözüyor · girdi/çıktı temsili · LİSANS · hüküm (adopt / port /
matematiğini-al / ret + tek cümle) · hangi fazı besliyor · kaynak URL.

**R2 — endüstri hat.** CLO3D, Browzwear VStitcher, Style3D, Optitex, Gerber AccuMark,
TUKAcad, Valentina/Seamly2D'nin ticari akrabaları: çıktı formatları (DXF-AAMA/ASTM,
graded DXF, tech-pack), "sim-ready pattern" tanımları, fiyat sınıfı. Hüküm: hangi
vaadi bizim hangi kapımız (F5/F7) ölçülebilir yapmalı.

**R3 — açık kaynak zanaat.** Seamly2D (parametrik nokta/çizgi dili, sözlüğü nasıl
adlandırıyor, formül motoru), FreeSewing (part/point/path/macro; `ease`/`stretch`
eksenleri — F7'nin emsali; `hem`/`armhole` makroları — F6), PyGarment. `knowledge/`
altındaki mevcut defter (`armscye-on-arka-*`, `cap-ease-isareti-*`,
`seam-line-offset-*`, `drafting-math-eu38.md`) ile çakıştırılır; doğrulanmış yokluk
yeniden aranmaz.

Çıktı: `knowledge/TEKNOLOJI-2026-08-23.md` — üç tablo + **F2…F10 her biri için
"bu faza düşenler"** (boşsa "dünyada emsal bulunamadı" açıkça). Alınan her kod/
matematik kaynağını başlıkta söyler; model ağırlığı/GPU/harici API → §0.9.
Kapı (`--olcum`): her hüküm bir URL'ye bağlı mı; her "adopt"un lisansı yazılı mı;
hakem 5 rastgele satırın URL'sini açıp iddiayı doğrular.

### F2 — TEK NESNE: flat ile kalıp aynı kabuktan türesin (3–5 s)
Yasa: flat ve kalıp tek matematiksel nesnenin iki izdüşümüdür. F0-D1 ölçtü: flat
kalıptan türemiyor, ortak birim yok (`contract/tables.json flat._layer`), ikinci flat
kalemi ayakta (`render-garment-flat.mjs` + `flat-engine/_engine-full.mjs:256`
stil-pinli kaçış). Bu faz ikisini tek kaynağa bağlar.
```
Gövde yüzeyi ─> giysi kabuğu (ease + siluet)
   ├─> ön/arka ORTOGRAFİK PROJEKSİYON -> flat silueti
   └─> AÇILIM (flatten, F1'in önerdiği yöntem) -> kalıp panelleri
```
Flat bitmiş giysi çizimidir: pensler kapalı, giysi vücutta; dış kontur ÇİZİLMEZ,
HESAPLANIR; iç çizgiler kalıbın dikiş hatlarının aynı projeksiyonu.
İşçiler: **2-A kabuk→projeksiyon çekirdeği (SIRALI, tek işçi, `engine/src/`)** ·
**2-B ölçüm aleti** (`engine/tools/`, aynı spec'ten flat ve kalıbın 6 ortak ölçüsünü
basar) ve **2-C test** (`engine/tests/flat_pattern_agree_check.cpp` + `add_test`)
PARALEL, üçü farklı dosyalarda.
Kapı `flat_pattern_agree_check`: 6 ölçü (etek ucu çevresi · göğüs · bel · gövde boyu
· yaka açıklığı genişliği · omuz genişliği) %1.5 toleransta eşit; faz-öncesi
commit'te KIRMIZI (§H onarımı sayesinde artık gerçekten ölçülür). Anti-hack: flat'e
çarpan eklemek YASAK — hakem sorusu tam olarak "iki hat aynı kaynaktan mı besleniyor,
yoksa sayılar mı eşitlendi?". Gece bitmezse: ön gövde tek bedende (EU38) çalışan hat,
tam çalışan sahte hattan iyidir; eski hat `_LEGACY` bayrağı arkasına, silinmez.
Yeni kaynak dosya tavanı 3.

### F3 — MUTFAK: sözlük reformu, menü değil malzeme (3–5 s)
F0-B ölçtü: üç katman üç etek sözlüğü konuşuyor (`vocab.json:12`'de `fullCircle` yok,
`garment-spec-v2.json topology.skirtShape`'te var); sicilde 5 absent
(`gatheredOverlayLayer sleeve collarFamily skirtFamily zipperPiece`); adıyla eksik
damar detayı: garment'ta dantel/fisto, flat'te mini-düğme sırası · lace-up · halter ·
kutu-pili. F1'in GarmentCode/Seamly2D/FreeSewing karşılaştırması işlenerek:
```
KATMAN 1 PRİMİTİF: Edge · Panel · Seam · Op(suppress/gather/flare/extend/split/overlay/attach)
KATMAN 2 BİLEŞEN : bodice · sleeve · skirt · collar · cuff · band · overlay (parametre kümesi açar)
KATMAN 3 TARİF   : isim + parametre demeti ("sweetheart" = necklineDraft(...))
```
Yasa: Katman 3'teki her isim 1/2'ye çözülür; çözülmeyen isim sözlüğe girmez; isim
silinince geometri kalır; iki tarif arası her ara değer geçerli giysidir.
İşçiler (SIRALI, çünkü sicil tek dosya): **3-A primitif tanımı** (`contract/primitives-v1.json`)
→ **3-B enum→primitif çözüm tablosu + preset tablosu** (kural tabanı buraya taşınır,
TEK kaynak; `vision-student` kelime listesi bundan ÜRETİLİR, elle yazılmaz) →
**3-C test** `preset_resolve_check`. F0'ın "adı yok" saydığı her damar detayı sicile
İSİM olarak girer, statüsü dürüstçe `absent` olsa bile.
Kapı `preset_resolve_check`: her preset primitiflere çözülüyor VE çözümü motorda
gerçekten panel üretiyor mu. Anti-hack: tabloya isim eklemek bedava — sözlüğe girişin
bedeli çizen bir panel zinciridir; hakem 3 rastgele preset'i motorda koşturur.

### F4 — FLAT KONVANSİYONU + ZEVK ÖN-TARAMASI (2–4 s)
Şart: bütün flat'ler aynı modelden çıkmış gibi — tek manken, tek konvansiyon, ölçülebilir.
Kapı `flat_convention_check`: tek croquis (iki farklı stilin flat'inde omuz genişliği /
göğüs hattı yüksekliği / bel hattı yüksekliği ±2 mm — F2 bittiyse neredeyse bedava) ·
ölçek beyanı (her SVG `data-scale`, 1:8, gerçek ölçüyle tutarlı; F0: bugün
`unitDeclared:false`) · çizgi hiyerarşisi (dış siluet + ana dikiş KALIN, iç dikiş/pens
İNCE, topstitch KESİKLİ, gizli hat NOKTALI; oranlar dosyada beyanlı) · sıfır gölge/
gradyan, tek kontur rengi, ön + arka zorunlu · artefakt (koni açılımı tırtık) kökten
düzeltilir, kırpmayla gizlenmez.
ZEVK ÖN-TARAMASI (ayrı işçi, PARALEL): Chanel HC, Bershka/Stradivarius, genz estetiği,
profesyonel Etsy flat listingleri → REFERANS PANOSU = link + özellik-dili tarifi
(`knowledge/ZEVK-PANO-2026-08-23.md`); görsel indirilmez (§0.11). Konvansiyonu geçen
adaylar ESKİ|YENİ yan yana `~/Desktop/gece-zevk-panosu/`ya basılır (PNG, repo dışı).
Flat'in testi SATILABİLİRLİK, hakemi Damla: DAMLA-KUYRUK'a satır, koşu bloke olmaz.

### F5 — DİKİLEBİLİRLİK KAPISI (3–5 s)
Ayrım: flat mankene göre → satılabilirlik; kalıp insana göre → dikilebilirlik. İkisi
birbirinin yerine geçmez.
`sewability_check` (F1'in R1/R2 ölçütleriyle beslenir, eşikler literatürden, "bu
gecenin ölçümünden" DEĞİL — F6-A'nın düştüğü tuzak): (1) dikiş çifti eşitliği
(beyan edilmiş yedirme oranı hariç; tolerans 1/32") (2) çentik eşleşmesi (3) kapalılık/
kendini kesmeme/sıfır alan (4) köşe açısı toplamı (5) GEÇİŞ: en dar halka baş/omuz
çevresinden geçmiyorsa kapanma zorunlu VE kapanma donanımı satılan bir boyda — ayrı
hata sınıfı (6) geri projeksiyon: paneller dikili varsayılıp gövde yüzeyine sarılır,
gerinim eşiği. `h10_gate_check` devralınan kırmızısı (EU34 armhole 312.86 mm, kapı
384.5–424.5; shoulder-seam 0 dikiş) bu fazın ilk müşterisidir: kök sebep + ölçülmüş
çözüm adayı (§0.4), kapatılması zorunlu değil.

### F6 — KOL (yeniden inşa, 2–4 s; v3'te 4–8 s'ti, tarif hazır)
v3'te yapılıp silinen iş: `engine/tests/sleeve_armhole_agree_check.cpp` 96 hücre
(EU34–48 × {pens, prenses} × {woven, knit} × {plain, gathered, puffed}); kök sebep
`sleeve.cpp:104-107` `capSpreadFrac` GENİŞLİK kesri uygulanıyor, oysa fazlalık YAY;
ÖNCE/SONRA kodu `GECE/F6-C.md:103-120`; düzeltme sonrası en kötü sapma 0.000000
(DEVRALINAN, yeniden ölçülecek). Mutasyon `kol-kapak-arti-5mm` kapıyı öldürmüştü.
İşçiler: **6-A literatür** (F1 tablosundan `cap ease` / kol kapağı yayı eşikleri —
`gatheredSpreadFrac 0.20` ve `puffedSpreadFrac 0.45` sabitleri ölçülmemiş,
kaynak bulunur ya da "KAYNAKSIZ" etiketlenir) · **6-B `sleeve.cpp` düzeltmesi**
(tarife göre, SIRALI) · **6-C test yeniden yazımı** (PARALEL, ayrı dosya).
Kapı: kol oyuğu yayı ↔ kol kapağı yayı beyan edilmiş yedirme oranıyla eşleşir;
F5'in 1. maddesi bunu zaten ölçebiliyor olmalı (ölçemiyorsa F5 eksik, not düşülür).

### F7 — KUMAŞ EKSENİ + REHBER (2–3 s)
Ürün = kalıp + flat + rehber. Kumaş spec'in ekseni olur; aynı spec + farklı kumaş =
FARKLI kalıp. Sektör bantları (F1 R3/FreeSewing `stretch` ile çapraz doğrulanır):
dokuma ~0 (pozitif ease zorunlu) · stable knit %0–25 · orta %26–50 (~%3) · esnek
%51–75 (~%5) · süper %76+ (~%10, pens kalkar); negatif ease ham formülle uygulanmaz
(recovery). Kapı `fabric_ease_check`: dokuma vs %50 örme aynı spec → göğüs çevresi
farkı beklenen yönde ve büyüklükte. Rehber (`recipes/` mevcut yarım bilgi
BAĞLANIR): kumaş önerisi + 10 cm esneme testi tarifi + tela/dikiş/iğne + kesim planı;
sayfaya basılmayan öneri yok hükmündedir.

### F8 — GİRİŞ HATTI: foto + prompt → spec, ve spec DIFF (uzatma)
Önce ÖLÇ: bugün kaç foto doğru spec'e iniyor (sayı; `vision/`, `vision-student/`
test seti), hata sınıfı (görme / kelime listesi / motor). F3 sonrası görü dili
mutfaktan üretildiği için kapalı-liste hataları yeniden ölçülür. `missing.js` ters
yalanı burada koşturularak ölçülür (§B). Düzenleme: model geometri değil **spec DIFF**
üretir → şema doğrulama → sicil kontrolü (shipped değilse ADIYLA red) → aynı seed/
beden ile yeniden üretim → ÖNCE/SONRA. Kapı `edit_locality_check`: "yakayı değiştir"
deyince dokunulmayan paneller byte-identical.

### F9 — DOCS BÜYÜK TURU (kapanış, zorunlu, 1–1.5 s)
v3 tarifi: `GECE/F9-A.md:22-44` (test dosyası adı, `add_test`, ilk kırmızı); kural A
duran iddia (EN+TR yasak ifadeler, 0 adet) · kural B her sayısal iddianın AYNI
SATIRINDA onu basan alet/test adı. Faz-öncesi beklenen: 16 + 36 ihlal
(`GECE/log/F9A.gate.before.txt`, DEVRALINAN — yeniden ölçülür).
İşçiler: **9-A `engine/tests/docs_truth_check.sh` + `add_test`** (mekanik, model
çağırmaz) · **9-B/9-C kâtipler** (docs/ ağacı ikiye bölünür, PARALEL): F0-C tablosu
girdi; her iddia kal/güncelle/sil UYGULANIR; bayat bölüm `docs/archive/`'e gerekçeyle;
`GECE/INDEX.md` son hâli (TEKNOLOJI, primitives, rehber, H.md yönlendirmeleri).
Kapı `docs_truth_check` faz-öncesi kırmızı, faz sonrası 0+0; mutasyon
`docs-duran-iddia` kapıyı öldürür.

### F10 — LANDING: ölç, sonra ürünü anlatan sayfaya çevir (2–3 s)
Sıra: ÖNCE ÖLÇÜM, SONRA TASARIM. v3'ün ölçümü DEVRALINAN: 18 iddia · DOĞRU 0 ·
YALAN 1 · KANITSIZ 17 (`GECE/F10-A.md`); ölü link 0; `web/index.html:212` "live"
yalanı; EU34–48 ↔ EU34–52 iç çelişkisi; `CAD` yasağı 8 satırda; üç koleksiyon
üreteci ENOENT (`gen-collections-page.mjs` vb., `af49514` silmiş). F10-C'nin
düzeltilmiş landing'i bayt olarak `GECE/kurtarma/F10.index.html.orig`'de —
**başlangıç noktası odur**, sıfırdan yazılmaz.
**10-A envanter (işçi 1):** tablo tazelenir, `landing-claims.json` şeması yazılır.
**10-B kapı (işçi 2, PARALEL):** `engine/tests/landing_truth_check.sh`: sayfadaki her
sayı/özellik iddiası repoda bir test/alet adıyla eşleşir ya sayfada durmaz; VİZYON
bölümleri şimdiki zamanla yazılmaz; ölü link 0; gösterilen beden = seçilen beden;
`CAD` kelimesi 0.
**10-C tasarım (işçi 3, 10-A bittikten sonra):** sayfa şunu anlatır — foto + prompt →
**kalıp + flat + rehber** (üç çıktı, üçü görünür) · mutfak anlatısı (F3 gerçekleştiyse
canlı örnek, değilse VİZYON etiketi + gelecek zaman) · düzenleme vizyonu (F8'e göre
demo/vizyon) · kumaş ekseni (F7 çıktıysa gerçek görsel) · üyelik/forum/iOS tek satır
vizyon. Şartlar: premium his, flop UI yasak (kalıcı veto); mevcut görsel kimlik
yeniden yazılmaz, düzen + içerik yenilenir; kimlik değişikliği gerekiyorsa iki yönlü
taslak DAMLA-KUYRUK'a; waitlist korunur; mobil kırılım ölçülür (375/768/1280 ekran
görüntüsü `GECE/log/F10.shots/`). Deploy YAPILMAZ — `ENV.md` deploy kuralı gereği
subtree/`wrangler` Damla'nın adımıdır; önce/sonra ekran görüntüleri DAMLA-KUYRUK'a.
Kapı `landing_truth_check` faz-öncesi kırmızı, sonra yeşil.

### F11 — KAPANIŞ (atlanmaz)
1. ctest: F0v4'ün kırmızı kümesinden kaçı kapandı (isim isim); yeni kırmızı ad 0 mı.
2. Damar üç ölçü, F0v4 yöntemiyle; SEVKİYAT manşet. Kımıldamadıysa açıkça yazılır.
3. KOSU.md son hâli; DAMLA-KUYRUK'a düşen kararlar + uygulanan varsayılanlar.
4. Push'tan SONRA rapor; "bitti/hazır" toptan cümlesi yasak; yapılan / yapılmayan ayrı.
5. Rapor Damla'ya üç sayıyla başlar: kaç kapı yeşile döndü · kaç yeni kırmızı (hedef 0)
· damar-sevkiyat nereden nereye. Dördüncü satır: docs ve landing önce/sonra ekran
görüntüsü yolları. Beşinci: hangi dallar kırmızı kaldı (adıyla) ve Damla'nın sabah
bakacağı 3 şey.

---

## §G CONTEXT HİJYENİ

```
GECE/
  KOSU.md        canlı durum, ≤150 satır HARD CAP (satır eklemek için satır sil)
  INDEX.md       "şu soruyu sorarsan şu dosyaya bak" (kâtip)
  KART/F<n>-<x>-<ad>.md   görev kartı ≤80 satır — işçinin TEK girdisi
  F<n>.md        faz tutanağı (uzun, serbest; canlı duruma girmez)
  KAPI.md        kapı sonuçları
  log/           ctest + kapı + ajan kütükleri
  kurtarma/      v3'ten kurtarılan sözleşmeler (okunur, düzenlenmez)
  arsiv/         v3 koşucu, STOP.md, v3'e ait olup bu koşuya girmeyen her şey
```
- Şef KOSU.md dışında hiçbir tutanağı tam okumaz; gerekirse işçiye "şu dosyanın
  şu satırlarını oku" der. HEDEF.md, DAMLA-KUYRUK.md, devlog.md, linkedin.md hiçbir
  oturuma tam girmez; grep ile satır çekilir.
- Kart şablonu: NE (tek cümle) · GİRDİ DOSYALARI (isim isim, satır aralığıyla) ·
  ÇIKTI (dosya yolu + dal adı + kapı adı) · YASAKLAR (karta özel) · SÜRE TAVANI ·
  RAPOR ŞABLONU (≤40 satır).
- KOSU.md şablonu: ŞU AN (faz · tek cümle · son yeşil commit · sonraki faz) ·
  KAPANMIŞ FAZLAR (faz başına tek satır + tutanak yolu) · KIRMIZI DALLAR (ad + sebep) ·
  AÇIK KIRMIZILAR (ne · nerede · sayı) · SONRAKİ FAZIN DEVRALDIĞI ÜÇ SAYI ·
  DAMLA'YA DÜŞEN (bloke etmez) · UYGULANAN VARSAYILANLAR.
- Faz başına en fazla 3 yeni kaynak dosya; fazlası gerekçeyle.
- `engine/tools/` altında yüzü aşkın alet var — işçi yazmadan önce `grep`.

---

## §M BİRİKME (COMPOUNDING ERROR) KARŞI ÖNLEMLERİ — yüz saatlik koşu için

Bir hata bir fazda doğar, sonraki faz onu "devralınan doğru" sanır, üstüne inşa eder.
Yüz saatte bu, kodu değil KOSU.md'yi çürütür. Beş kesici:

M-1 **Devralınan sayı kapı girdisi olamaz (§0.17).** Her faz kendi sayısını kendi
commit'inde yeniden koşturur. KOSU.md'deki sayı "iddia"dır, komut çıktısı "kanıt".
M-2 **Ratchet.** Bir fazın yeşile çevirdiği kapı (`flat_pattern_agree_check` vb.)
`engine/CMakeLists.txt`'e kalıcı girer; sonraki hiçbir faz onu kırmızıya düşüremez
(§0.6 kümesi). Geri gidiş mekanik olarak yakalanır, hafızaya güvenilmez.
M-3 **Müfettiş (her 3 fazda bir, PM salar).** Temiz ajan; KOSU.md'yi görür ama
tutanakları görmez. Üç manşet sayıyı ve KOSU.md'deki her "açık kırmızı" satırını
sıfırdan yeniden ölçer; KOSU.md ile farkı `GECE/log/mufettis-<n>.txt`'ye yazar.
Fark varsa KOSU.md düzeltilir, farkın doğduğu faz "ŞÜPHELİ" işaretlenir, o fazın kapı
testi yeniden koşturulur. Müfettiş kapı değil, sayaçtır; koşuyu durdurmaz.
M-4 **Context rotasyonu.** Şef faz başına ölür; işçi kart başına ölür; hakem/danışman
her çağrıda taze. PM tek kalıcı context'tir ve yalnızca KOSU.md + ≤60 satır özet
görür; otomatik compact olsa bile kaybedeceği bir şey yok, çünkü hafıza dosyada.
PM'in "hatırladığı" hiçbir şey kanıt değildir; her karar KOSU.md'den okunur.
M-5 **Tek yazar.** KOSU.md'yi şef yazar, PM sadece ŞU AN satırını günceller, işçi
dokunmaz. Dosya ≤150 satır; satır eklemek için satır silinir, silinen satır tutanağa
taşınır. Böylece "dört ajanın dört versiyonu" oluşmaz.
M-6 **Kırmızı taşınmaz.** Faz kırmızıysa dal kalır, main temiz; sonraki faz kırmızı
dalın üstüne değil main'in üstüne açılır. Hata yayılamaz çünkü main'e girmemiştir.

---

## §I AJAN DOSYALARI — `.claude/agents/` (gitignore'lu; bu metinleri oraya yaz)

Her dosya `---\nname: <ad>\ndescription: <tek cümle>\ntools: <liste>\n---` başlığıyla
başlar; gövde aşağıdaki metin. PM ana oturumdur, dosyası yok; §J açılış bloğu onun
talimatıdır.

**sef.md** — tools: Read, Write, Edit, Bash, Task, Grep, Glob
"Sen bir fazın şefisin. Girdin: faz adı, o fazın §F bölümü, devralınan üç sayı, açık
kırmızılar. Kod yazmazsın, test koşmazsın, tutanak okumazsın. Adımlar: `git switch -c
gece/F<n>` → kartları GECE/KART/F<n>-<x>-<ad>.md olarak yaz (≤80 satır; NE · GİRDİ
DOSYALARI · ÇIKTI+dal · YASAKLAR · SÜRE · RAPOR ŞABLONU) → SIRALI/PARALEL etiketle →
Task ile işçi sal → ≤40 satır rapor al → `git log <dal> -3` ile commit gör, yoksa
reddet → işçi dallarını gece/F<n>'e merge et → kapı: `bash GECE/kapi.sh F<n> <önce>`
→ Task(mutasyoncu) → Task(hakem) → KOSU.md + KAPI.md + GECE/F<n>.md yaz, commit →
Task(katip) → beşi yeşilse main'e merge + push, değilse dalı gece/F<n>-red-HHMM yap.
Soru sorma: karar gerekirse Task(danisman), faz başına en çok 5; 6.'da §B'ye göre
kendin seç ve 'BÜTÇE AŞIMI' yaz. Dönüşün ≤60 satır: faz · kapı sonucu · dal · üç sayı
· kırmızılar · DAMLA-KUYRUK'a düşenler. Bitince öl."

**isci.md** (taban; motor/flat/arastirma/terzi/vitrin/tasarim bunu miras alır, fark
tek paragraf) — tools: Read, Write, Edit, Bash, Grep, Glob (+ arastirma: WebFetch,
WebSearch)
"Sen bir işçisin. Girdin yalnızca kartın ve kartın adıyla saydığı dosyalar. Önce
`git switch -c <karttaki dal>`. Kartın dışına çıkma; bilgi kartta yoksa 'YAPAMADIM:
<ad>' yaz, uydurma. Her sayının yanına üreten komut + dosya yolu. Bitmeden `git add
<kendi dosyaların> && git commit`, hash'i rapora. git clean/stash/reset --hard/
checkout -- . YASAK. Rapor ≤40 satır: NE YAPTIM · DOSYALAR(yol+hash) · SAYILAR ·
KIRMIZI+ÇÖZÜM ADAYI · YAPAMADIĞIM. 60 dk'da bitmezse commit at, 'KALAN KART:' yaz."
- isci-terzi eki: "Kod yazmazsın. Her eşik/formül için kaynak: F1 tablosu satırı,
  kitap (ad+sayfa) veya URL. Kaynaksız sayıyı 'KAYNAKSIZ' etiketiyle ayrı listele."
- isci-tasarim eki: "Sadece web/. Mevcut renk/yazı kimliği değişmez. 'CAD' kelimesi 0.
  Her iddia cümlesi landing-claims.json'da bir test/alet adına bağlı, değilse yazma.
  Vizyon bölümleri gelecek zaman. 375/768/1280 PNG'siz rapor yok."

**danisman.md** — tools: Read, Grep (yazma yok)
"Sen tarafsız karar ajanısın. Tartışmayı görmedin; soranın tercihini bilmiyorsun.
Girdin: soru, A/B/C seçenekleri maliyetleriyle, HEDEF.md'den ≤3 satır, §0 ve §B, açık
kırmızılar. HEDEF.md'ye ve §0'a en yakın seçeneği SEÇ. 'Damla'ya sorun', 'ikisi de
olur', kararsızlık yasak; veto sınırındaysa bile bu gece için varsayılan ver. Çıktı
≤15 satır: KARAR · GEREKÇE (atıflı) · GERİ ALMA KOŞULU · DAMLA-KUYRUK SATIRI."

**mutasyoncu.md** — tools: Read, Edit, Bash
"Sen kapı kırıcısın. Girdin: fazın dalı, eklediği test adı, iddiası. Dört mutasyon
uygula, her birinde kapıyı koştur, sonucu yaz, mutasyonu `git checkout -- <dosya>`
ile DEĞİL, `git revert`/elle geri al (yasak komut listesi sana da geçerli): (1) testi
her zaman geçen hâle getir → kapı KIRMIZI olmalı (2) kodda bir eşiği gevşet → KIRMIZI
(3) yorum satırına 'tolerance' yaz → YEŞİL kalmalı (4) fazın iddiasını sahte yoldan
sağla (kartta yazılı anti-hack) → KIRMIZI. Çıktı: GECE/log/F<n>.mutasyon-kanit.txt +
≤10 satır özet. Beklenmeyen sonuç = 'KAPI BOŞ'."

**hakem.md** — tools: Read, Bash, Grep (yazma yok)
"Sen hakemsin. Brief'i ve kartları görmedin. Elinde: dal diff'i, eklenen test, RULES.md,
GECE/hakem-sorusu.md, mutasyon kanıtı. Tek soru: çıktı iddiasını gerçekten yapıyor mu,
yoksa testi geçmek için mi şekillendirilmiş? Her iddiayı koşturarak çürütmeye çalış.
Hüküm: iddia · DOĞRU/KISMEN/YANLIŞ · kanıt komutu. Sorulmamış bulgular ayrı başlık."

**katip.md** — tools: Read, Write, Edit, Bash(git:*), Grep
"Sen kâtipsin. Yazma alanın docs/, README.md, GECE/INDEX.md; başka yere dokunmazsın.
Girdin: faz tutanağı + diff + docs/ ağacı. Bayatlayan her cümle: güncelle ya da
gerekçeyle docs/archive/'e; sessiz silme yok. Duran-iddia yasak; her sayının yanında
onu basan test/alet adı. Commit at, hash döndür."

**mufettis.md** — tools: Read, Bash, Grep (yazma: yalnızca GECE/log/)
"Sen müfettişsin. KOSU.md'yi oku, tutanakları OKUMA. Manşet üç sayıyı ve her açık
kırmızıyı KOSU.md'deki yöntemle sıfırdan yeniden ölç (komut koştur). Her satır için:
KOSU iddiası · ölçülen · fark. Farkları GECE/log/mufettis-<n>.txt'ye yaz, ≤20 satır
özet döndür. Yorum yapma, düzeltme yapma."

**orakci.md** — tools: Bash(git:*), Bash(date), Read
"Sen orakçısın. `git log --all --since=30.minutes --oneline`, KOSU.md ŞU AN, `date`
oku. Tek satır döndür: DEVAM · KES: <dal> commit at, kalan kart yaz · F9'A GEÇ
(07:00 geçtiyse)."

---

## §K KARAR PROTOKOLÜ

K-1 Damla'ya soru sıfır. `AskUserQuestion` settings'te `deny`.
K-2 Şef/işçi sorusu → şef A/B/C + maliyet yazar → Task(danisman). İşçi danışmanı
doğrudan çağıramaz; "YAPAMADIM" yazar, şef sorar.
K-3 Danışman kararı KOSU.md `DANIŞMAN KARARLARI` bölümüne tek satır (soru · karar ·
hash); DAMLA-KUYRUK.md'ye danışmanın yazdığı satır.
K-4 Bütçe: faz başına 5. Aşımda şef §B usulü kendi seçer, "BÜTÇE AŞIMI" yazar.
K-5 Danışmana gitmeyen sınıflar: eşik/tolerans (§0.12) · kırmızı kapatma (§0.4/0.6) ·
dosya/dal adı (şef seçer) · "devam edeyim mi" (her zaman evet).
K-6 Faz kırmızısında PM danışmana sorar: yeniden aç / dar kapsam / F9'a atla.
Varsayılan: bir kez yeniden aç; ikinci kırmızıda atla, dal kalır.

---

## §L HOOK'LAR VE İZİNLER — `.claude/settings.json`

```json
{
  "permissions": {
    "allow": ["Bash(git:*)", "Bash(cmake:*)", "Bash(ctest:*)", "Bash(make:*)",
              "Bash(node:*)", "Bash(npm:*)", "Bash(python3:*)", "Bash(bash GECE/*)",
              "Bash(date)", "Bash(ls:*)", "Bash(find:*)", "Bash(grep:*)", "Bash(test:*)",
              "Read", "Edit", "Write", "Grep", "Glob", "Task", "WebSearch", "WebFetch"],
    "deny":  ["AskUserQuestion", "Bash(rm -rf:*)"]
  },
  "hooks": {
    "Stop":       [{ "hooks": [{ "type": "command", "command": "bash GECE/bekci.sh" }] }],
    "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": "bash GECE/yasak.sh" }] }]
  }
}
```
> ⚠ **KURULUMDA ÖLÇÜLDÜ (22 Ağu, kurulum commit'i):** yukarıdaki bekçi grep'i
> `faz: \*\*F11 kapandı` arıyordu; v3'ün `GECE/KOSU.md:4` satırı **zaten** bunu
> yazıyor (`faz: **F11 kapandı, koşu bitti**`). Yani nöbetçi koşu başlamadan
> exit 0 veriyordu — §A-2'nin aynı kusuru. İşaret **v4'e özel** yapıldı:
> `faz: **F11 kapandı (v4)**`. F11 şefi KOSU.md ŞU AN satırına birebir bunu yazar.
> Diskteki `GECE/bekci.sh` düzeltilmiş hâlidir; aşağıdaki blok özgün metindir.

```bash
# GECE/bekci.sh — Stop hook: F11 kapanmadıysa durmayı bloklar
grep -q 'faz: \*\*F11 kapandı (v4)' GECE/KOSU.md 2>/dev/null && exit 0
echo "KOŞU BİTMEDİ. GECE/KOSU.md ŞU AN → 'sonraki adım'ı yap. Soru sorma; karar gerekirse Task(danisman). 07:00 geçtiyse F9." >&2
exit 2
```
```bash
# GECE/yasak.sh — PreToolUse(Bash): §0.16 yıkıcı komutları keser
CMD=$(python3 -c 'import sys,json;print(json.load(sys.stdin).get("tool_input",{}).get("command",""))')
echo "$CMD" | grep -Eq 'git (clean|stash|reset --hard|checkout -- \.|branch -D|push --force|push -f)|rm -rf +(engine|contract|web|docs|GECE|\.)' \
  && { echo "§0.16 YASAK: $CMD" >&2; exit 2; }
exit 0
```
Bekçinin sonsuz döngüye girmemesi için KOSU.md ŞU AN'da "sonraki adım" satırı her
adımda güncel olmalı (şef yazar, PM doğrular). Hook'lar gitignore'lu `.claude/`
altında; repoya `GECE/bekci.sh` ve `GECE/yasak.sh` girer.

---

## §J AÇILIŞ

Damla (3 dk): `pgrep -fl gece.sh` → kill · `.claude/settings.json` + `.claude/agents/*`
yukarıdaki gibi · `GECE/bekci.sh`, `GECE/yasak.sh` yaz, `chmod +x` · bu dosyayı commit · `/clear` · aşağıyı yapıştır. Başka hiçbir şey; sabah F11 raporu + DAMLA-KUYRUK.

```
Sen STITCHU gece koşusunun PM'isin. Oku: GECE-KOSUSU-v4.md §0 §B §C §D §E §K §L §M, GECE/KOSU.md. Başka tutanak okuma, kod yazma, kart
yazma, bana soru sorma. Döngün: KOSU.md ŞU AN → Task(sef) sal (faz adı + §F'nin o
bölümü + devralınan üç sayı + açık kırmızılar) → ≤60 satır özet al → origin/main'de
commit doğrula → kırmızıysa Task(danisman) → her 30 dk Task(orakci) → KOSU.md ŞU AN
'sonraki adım' güncelle → devam. KOSU.md yoksa/v3 başlıklıysa F0' ile başla. Sıra:
F0' → H → F1…F5 → F6 F7 F8 → F9 F10 F11; 07:00'de nerede olursan ol F9. F11 kapanana
kadar durma; durmaya kalkarsan bekçi seni geri çağırır.
```
