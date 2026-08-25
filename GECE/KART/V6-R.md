# KART V6-R — araştırma (kod YAZILMAZ)

ETİKET: **PARALEL** · SÜRE TAVANI: **50 dk**

## NE
VLM'e giysi JSON'u ürettiren yayınlanmış işlerin ŞEMA kararlarını çıkar; ayrıca
"konumlu edit" (çıpa/oran) için yayınlanmış yerleşim dili emsali ara. Çıktın bir
KAYNAK + LİSANS + HÜKÜM tablosudur; öneri değil, kaynaklı hüküm.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- `ENV.md` · `RULES.md`
- `contract/garment-spec-v2.json` · `contract/garment-spec-v2.schema.json`
- `contract/composition.json` · `contract/primitives-v1.json`
- `contract/edit-locality-v1.json`
- `backend/worker.js` SADECE 300-360 satır aralığı (VLM prompt şeması)

## ARANACAK SORULAR (her birine kaynak + hüküm)
1. **ChatGarment** (VLM → GarmentCode JSON): GarmentCode şemasını VLM için NASIL
   sadeleştirdiler? Kaç alan, hangi alanlar atıldı, enum mu sürekli mi, JSON
   şema doğrulaması nerede? Bildirilen isabet oranları ve PAYDASI.
2. **Design2GarmentCode** / **SewFormer/SewFactory** / **NeuralTailor**: aynı
   sorular + in-the-wild zaafları (dürüstçe, başarı reklamı değil).
3. VLM'e yapılandırılmış çıktı verdirirken yayınlanmış ŞEMA pratiği: enum
   sınırlama, "none/unknown" kaçış değeri, sınır-çifti karışması
   (square↔boat sınıfı) için yayınlanmış çözüm var mı?
4. **KONUMLU EDİT / yerleşim dili**: bir düzenlemenin YERİNİ model ağırlığı
   olmadan ifade eden yayınlanmış şema var mı (semantik çıpa + oran ofseti,
   parametrik U,V, "landmark + t")? CAD/giysi alanında emsali kim kurdu?
5. **Edit LOKALLİĞİ**: "sadece dokunulan bölge değişsin" garantisini ölçen
   yayınlanmış bir yöntem/metrik var mı (image editing tarafında bile)?

## ÇIKTI (tek dosya)
`GECE/V6-R.md` — tablo: SORU · KAYNAK (tam künye + URL) · LİSANS · HÜKÜM
(bizim şemamıza ne diyor) · GÜVEN (birincil/ikincil). Kaynak bulunamayan soruya
**"yayınlanmış kaynak YOK"** açıkça yazılır, boşluk doldurulmaz.
Sonunda **ŞEMA ADAYLARI** bölümü: ≤5 madde, her biri "hangi kaynağa dayanıyor".

## YASAKLAR
- Kod yazma, dosya değiştirme (yalnız `GECE/V6-R.md` yazarsın).
- Model ağırlığı indirme · GPU · API anahtarı · bulut görsel servis (kalıcı veto).
- PDF'i WebFetch'e ÖZETLETİP sayı çekme YASAK (yanlış sayı üretti, kanıtlı):
  sayıyı ancak metinde birebir görüyorsan yaz, yoksa "PDF'ten doğrulanamadı".
- "Başkası yapmış, biz yapamayız" cümlesi yasak.

## COMMIT
İşin bitince KENDİN commit'le: `git add GECE/V6-R.md && git commit -- GECE/V6-R.md`
Mesaj lowercase ingilizce, co-author YOK. Rapor formatın: yapılan (dosya yolu +
commit hash) · ölçülen · yapılamayan (sebep) · kart dışı fark edilen.
