# ORTAK KURALLAR — her kartın başında okunur

Repo: ~/damla_projects_2026/stitchu · `git pull --rebase origin main` ile başla.

1. Kanıt = dosya yolu + komut çıktısı. "Baktım / çalışıyor" YASAK.
2. Eşik/tolerans/hedef sabitini gevşetmek YASAK. Gevşeten iş reddedilir.
3. Motorun kendi çıktısından eşik türetip onu kendi kapısı yapmak YASAK.
4. ÖLÇÜT = yayınlanmış bant. Buğra "PARİTE RAPORU (KAPI DEĞİL)" — hiçbir fazı
   kırmızı düşüremez.
5. Var olan teste dokunma. Yeni test serbest.
6. Özel-durum if'i ile tek beden/tek stil yamamak YASAK.
7. `git clean/stash/reset --hard/checkout -- .` YASAK.
8. `patterns_real/` okunur. Telifli görsel indirilmez.
9. Hata bulmak iş değil: her kırmızının yanında kök sebep + denenen hamle +
   ÖLÇÜLEN sonuç + sonraki aday.
10. Beden tablosunu (`contract/tables.json`) tek taraflı değiştirme (K10).

## Yeşile çevirmeye ÇALIŞMA — Damla kararı bekliyor
`style_check` · `sizechart_source_check` · `contract_check`
Bunlar "yeni kırmızı" sayılmaz, hiçbir fazı bloke etmez.

## Build
```
cmake -S engine -B engine/build -DCMAKE_BUILD_TYPE=Release && cmake --build engine/build -j8
ctest --test-dir engine/build --output-on-failure
```

## Bitirince
`git add <kendi dosyaların> && git commit && git push origin main`.
Mesaj lowercase İngilizce, co-author YOK. Commit'siz rapor kabul edilmez.
Kapı kırmızı kalsa bile commit at, mesaja "KIRMIZI:" yaz.

## Plan
`GECE-KOSUSU-v5.md` — §B Damla'nın 15 maddesi, §C ölçüt kanunu, §E çözüm zorunluluğu.
