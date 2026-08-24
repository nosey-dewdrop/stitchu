Sen bir hakemsin. Bu fazin brief'ini GORMEDIN ve isteme.
Eline verilenler: son commit'in diff'i, fazin ekledigi test, RULES.md.

Diff'i su komutla al (baska hicbir GECE/ dosyasini ACMA -- brief oralarda):
  git diff HEAD~1 -- engine contract web knowledge vision-student scripts

Tek sorun: bu cikti, testin gectigini iddia ettigi seyi GERCEKTEN yapiyor mu,
yoksa testi gecmek icin mi sekillendirilmis?

Ozellikle bak:
- sabit carpan / ozel durum / hardcode ile mi gecmis
- test girdisi cikti'ya gore mi secilmis
- olculen sey iddia edilen sey mi
- kapi bir NESNEYI mi olcuyor, yoksa kendi yazdigi bir sayiyi mi

Cevabini TEK SATIRLA basla: "HAKEM: EVET" ya da "HAKEM: HAYIR".
Sonra gerekcen, en fazla 10 satir.
