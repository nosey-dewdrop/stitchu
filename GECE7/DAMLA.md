# GECE7 — DAMLA KUYRUĞU

Koşu beklemiyor (§3.4). Her kalem en kısıtlayıcı varsayımla ilerletildi;
cevap gelince şef **yalnız o kalemi** yeniden koşturur.

| # | Soru | Şefin varsayımı (yürürlükte) |
|---|------|------------------------------|
| 1 | `new_flats/` (92 MB) satın alınmış telifli malzeme ve git'te değil — silinsin mi? `volume_1`/`volume_2` hâlâ `goldens-v2.json`, `boxpleat.hpp`, `yoke.hpp` tarafından çağrılıyor. `rasters/` (21 MB) kodda hiç çağrılmıyor. | **Hiçbiri silinmedi.** Geri alınamaz ve şefin tek taraflı kararı değil. Disk hedefi zaten tutturuldu (4.1 GB). |
| 2 | Hedef koşusu bugün **n=5** koşuyor; §3.6 on fotoğraf istiyor. 10'a çıkarmak yeni VLM çağrısı = para. Fixture yenilensin mi, ne zaman? | **n=5 ile taban basıldı**, her sayının yanına `n` yazıldı. Genişletme F2'nin kartına bırakıldı, maliyetiyle. |
| 3 | H2'nin "doğru cevabı" **insan etiketi değil** — `labels.json` gözle Fable tarafından konuldu (§1F). %92.2 model↔model uyuşması demek. 19 fotoğrafı sen mi etiketleyeceksin? | Sayı **"geçici"** damgasıyla basıldı ve karta uyarı olarak yazıldı. Cırcır yine de bu tabandan çalışıyor. |
| 4 | `figure_check` tek stilde kırmızı: `dress_bandeau_circle`, "figure-bands mandal.taban_v3'te pin yok". Pin konsun mu, yoksa stil düşsün mü? | **Dokunulmadı.** Halka 0 saf temizlik; kapı gevşetmek faz ajanının yetkisi bile değil (§3.8 md.4). |
| 5 | **H10a/H10b ayrıştırması F-İNDİR'de YAPILMADI.** Ayrıştırmak `hedef_kosu.mjs`'in H10 tanımını değiştirmek demek (hangi alan "fotoğrafta görünmesi imkânsız", hangisi "görünüyor ama alınamadı" — 24 alanlık bir hüküm tablosu). Kapı tanımını değiştirmek faz ajanının yetkisi değil (§3.8 md.4). | **H10 ayrışmamış olarak, %58.3 · n=5 basıldı.** Tablo hakemin ya da F2'nin işi; F2 zaten fotoğraf havuzunu ve etiketleri devralıyor. |
| 6 | `web/collections/pdf/` altındaki **48 yayınlanmış PDF bayatladı**: `pdf-core.js` kesim listesini artık satır kaydırıyor (uzun bir kesim talimatı sayfanın sağından taşıyordu, 26 Ağu kapak render'ında görüldü), yayınlanmış dosyalar hâlâ eski hâli taşıyor. Yeniden üretilsinler mi? | **Üretilmedi.** 48 ikili dosya + koleksiyon HTML'i tek faz push'una girmez ve site içeriği sevkiyata bağlı (§3.5: site son yeşil etiketten sevk edilir). Kalem hakeme bırakıldı. |

| 7 | **Havuz 19'a indi ama ÖLÇÜM SETİ hâlâ n=5.** `hedef_kosu.mjs`'in mühürlü fixture'ı `vision/eval/live-2026-08-22.json` ve içinde **5 fotoğraf** var. 19'a çıkarmak = 14 yeni VLM turu = **para**, ve §3.8 md.2 fotoğraf setini **hakemin** seçmesini emrediyor. | **Fixture'a DOKUNULMADI, n=5 kaldı.** Kart sayıları `n`'siyle basıldı. Bu, H1'in 5/5 tavanından kımıldayamamasının tek sebebidir ve F2'nin mazereti değil, ölçülen engelidir. ▸ Aday: `vision/eval/opus-predictions.json` diskte **9 fotoğraflık** bankalı bir tur taşıyor ama başka bir prompt/tarih hattından ve **mühürlü fixture değil** — hakem seçmeden kullanılmadı. |
| 8 | **`rabadon` bu fazı iki kez durdurdu.** `red-base` kuralı `python3 -m pytest -q`'yu projenin kendi kontrolü sayıyordu; o komut kökte **4 collection ERROR** veriyordu (`svgpathtools`, `onnx` yok) ve diskteki 4 `test_*.py` dosyasının **hiçbiri pytest testi değil**. Yani bütün Bash bloke oldu, ve red'i yeşile çevirebilecek hiçbir ürün kodu yoktu. | **`disabled[]` KULLANILMADI** (guard-weaken zaten mühürlü). Kök sebebe inildi: kök `conftest.py` pytest'in kapsamını **adıyla ve gerekçesiyle** ilan ediyor (4 dosyanın dördü de silinmedi/zayıflatılmadı, kendi belgelenmiş koşucularıyla koşmaya devam ediyor), ve `engine/tests/py/test_kaynak_kunye.py` süite **gerçek bir konu** verdi (§1F künye kapısı, 23 test, 3 mutasyonla kırmızı yandı). `rabadon wrong red-suite-test-write` **iki kez** kullanıldı ve ikisi de sicile yazıldı. |

---

## Bilgi — sorulmuyor, ama bilmen gereken (§5.5)

- **`contract_check` kırmızı ve bu bir kaza değil.** Senin 17 Ağu kararın
  (`patterns_real` bilerek takipli, "pdfleri silmicem, satın aldım") kapıyı
  bilerek kırmızı tutuyor ki bedel görünür kalsın. Yeşile dönmesi ölçümün değil,
  senin kararının değişmesinin işi. Halka 0 buna dokunmadı.
- **En sert sayı H10 = %58.3:** motora giden spec'in yarısından fazlası
  fotoğraftan değil, default'tan geliyor. "Fotoğrafını yükle, kalıbını al"
  cümlesini dışarı kurmadan önce bunu bil — bugün ürün gördüğünün iki katını
  **çıkarıyor**. Suç çıkarım değil, sessiz çıkarım (§0B); ilan kanalı henüz kodda yok.
- **`Logs/` 4.0 GB → 593 MB, `design_patterns/` 787 → 490 MB, boş disk 145 → 149 GB.**
  Silinen hiçbir şey git'te değildi ama hepsi makine çıktısıydı; `Arşiv.zip`'in
  73 PNG'sinin diskteki kopyalarla **CRC'si birebir aynıydı** (73/73 doğrulandı).

### F-İNDİR'in eklediği bilgi (26 Ağu)

- **Kullanıcı artık eve dosya götürüyor.** 26 Ağu sabahı `create.js`'te
  `download`/`dxf` geçen satır sayısı **0**'dı: fotoğraf yükleyen biri kalıbı
  ekranda görüp elinde hiçbir şey olmadan çıkıyordu. Sonuç ekranında artık
  **PDF (A4) · SVG · DXF** var, artı matbaa için **A0**.
- **Motorda yeni bir kapı açıldı:** `dxfSpecJSON`. Öncesinde DXF yalnız
  `studio.html`'in tarif diline bağlıydı; fotoğraf yolunda tarif metni hiç
  yok, yani o buton teknik olarak **kurulamıyordu**. Bu bir eksik buton değil,
  eksik bir motor kapısıydı.
- **Yayınlanmış PDF'lerde gerçek bir kusur görüldü ve düzeltildi:** biye
  şeridinin kesim talimatı (`1177 x 25 mm ON THE BIAS...`) sayfanın sağ
  kenarından taşıyordu, yani diken kişinin ihtiyacı olan sayı sayfa dışına
  basılıyordu. PDF'te metin kutusu yoktur; yazıcı kaydırmazsa kimse kaydırmaz.
