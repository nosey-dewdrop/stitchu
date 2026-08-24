# KART V0-0R — araştırma (R-kartı, §5.1)

ETİKET: PARALEL · SÜRE TAVANI: 40 dk

## NE
V0'ın ölçeceği iki performans bandı için YAYINLANMIŞ pratik ara: (a) tarayıcıda
wasm ile tek kalıp üretiminin kabul edilen gecikme bandı / ana-iplik bloklama
eşiği, (b) tekrarlı wasm çağrısında heap büyümesinin "sızıntı" sayıldığı ölçüm
yöntemi. Bulamazsan "yayınlanmış formül YOK" yaz — uydurma.

## GİRDİ DOSYALARI
- ENV.md
- RULES.md
- (web araması serbest)

## ÇIKTI
- `GECE/V0-0R.md` — tablo: iddia · kaynak (URL + yayıncı + tarih) · lisans/statü ·
  bizim hangi kapımıza bağlanabilir. Kaynak bulunamayan satır açıkça
  "yayınlanmış kaynak YOK" der.
  Kanıt olduğu kapı: V0 kapısı (eşik kaynaklandı mı) + 4.1 bant tabanı.

## YASAKLAR
- Kod yazma, dosya değiştirme, ölçüm yapma. Sadece kaynak + hüküm tablosu.
- Model ağırlığı / GPU / API anahtarı öneren yol yazma (§5.3 kalıcı veto).
- Sabit eşik uydurma (50ms vb.) — §4.1 bunu açıkça yasaklıyor.
- En fazla 6 kaynak; fazlası zaman yakar.

## RAPOR FORMATI (zorunlu)
yapılan (dosya yolu) · ölçülen (yok, bu kart ölçmez) · yapılamayan (sebep) ·
kart dışı fark edilen (dokunma, yaz).
