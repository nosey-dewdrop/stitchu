# F-H — KUMAŞ EKSENİ + REHBER
`GECE/KART/ORTAK.md` oku. Sonra bu kart.

## NE — Damla'nın sözü (v5 §B-5, §B-6)
"artık proje ilerlediğinde **kumaşa göre farklı kalıplar** verilecek. artık prompt +
fotoğraf karşılığında insanlar kalıp ve flat alıp gitmeyecekler kanka. **rehber, püf
noktalar** vs alacak. bir terzilik hesabı bu."

Yani ürün = **kalıp + flat + REHBER**. Üçü de çıktıda görünür.

## İŞ 1 — KUMAŞ SPEC'İN EKSENİ OLUR
Aynı spec + farklı kumaş = **FARKLI kalıp**. Bugün `fabric: woven|knit` iki kelimeye
sıkışmış (`knowledge/TEKNOLOJI-2026-08-23.md` bunu "malzeme eksiği" diye saydı).

Sektör bandı — F-B taramasıyla çapraz doğrula, kaynaksızı KAYNAKSIZ etiketle:
dokuma ~0 (pozitif ease zorunlu) · stable knit %0–25 · orta %26–50 (~%3) ·
esnek %51–75 (~%5) · süper %76+ (~%10, pens kalkar).
**Negatif ease ham formülle uygulanmaz** (recovery).
FreeSewing'in `stretch` ekseni emsal — `knowledge/DIKIS-SOZLUGU-ISO-2026-08-23.md`.

⚠ `contract/garment-spec-v2.json:199-202` zaten `easeNeck/Bust/Waist/Hip` mm taşıyor
(kaynaklı, F-G ölçtü). Üstüne ikinci bir sistem KURMA — onu genişlet.
⚠ `sleeveEase`/`seatEase` mm alanı açmak beden tablosunun okunuşunu değiştirir →
**Damla kararı**, `DAMLA-KUYRUK.md`'ye satır, tek taraflı açma.

**KAPI `fabric_ease_check`:** aynı spec, dokuma vs %50 örme → göğüs çevresi farkı
beklenen YÖNDE ve BÜYÜKLÜKTE. Anti-hack: farkı sabit çarpanla üret → kırmızı düşmeli.

## İŞ 2 — REHBER, sayfaya basılmayan öneri YOK hükmünde
`recipes/` altında yarım bilgi var — BAĞLA, ikincisini doğurma. Önce GREP.
Rehber şunları taşır, hepsi kalıbın KENDİ geometrisinden çözülür (listeden kopyalanmaz):
- kumaş önerisi + **10 cm esneme testi** tarifi (alıcı evde ölçsün)
- tela / dikiş / iğne / iplik
- kesim planı + kumaş metrajı
- **püf noktalar**: bu kalıbın nerede zorlayacağı — F-G'nin çentikleri, F-K'nın
  yaka kavisi, büzgü oranları nereye
- ISO dikiş kodu: `knowledge/DIKIS-SOZLUGU-ISO-2026-08-23.md` — Coats kuralı
  *"Class 3 (bound): necklines of t-shirts"*, serging `6.01.01`. Her dikiş adımı
  yanında ISO 4916 sınıfı + ISO 4915 dikiş kodu yazılabilir. Bu bizi tech-pack
  diline bağlar.

⚠ `print-info.pdf` s.2 zaten "KUMAS SECIMI" basıyor (`knowledge/stitchu.db → fabrics`,
NMSU G-401 · SDSU · UNL kaynaklı). ÜSTÜNE YAZMA — genişlet.

**KAPI `guide_completeness_check`:** rehberdeki her öneri bir hesaba ya da kaynağa
bağlı mı; sayfaya basılmayan öneri var mı (varsa kırmızı).

## KAPI (ortak)
ctest: iki yeni kapı yeşil · yeni kırmızı ad SIFIR · mutasyon kanıtı loglu
`GECE/log/F-H.mutasyon.txt`

## ÇIKTI
Önce/sonra PNG + PDF sayfası: `GECE/log/F-H.shots/`
