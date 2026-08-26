#!/usr/bin/env python3
"""Emit the pool's credit sheet and the referee's EMPTY label template.

KOSU-v7 §1F / GECE7 F2 İŞ 1. Two outputs, one source of truth:

  vision/eval/credits.json          (tracked, written by recover-credits.py, PROVEN by sha256)
      |
      +--> dataset/hedef-10/KAYNAK.md          the credit sheet the card asks for
      +--> vision/eval/labels-hakem-BOS.json   19 photos x 12 axes, ALL CELLS EMPTY

WHY THE TEMPLATE COMES OUT EMPTY. The phase agent does not write ground truth —
`vision/eval/labels.json` is a MACHINE label ("Ground truth labeled by eye (Fable,
2026-07-13)"), which is why H2 = %92.2 is a model's score against another model and
is marked provisional in `hedef_kosu.mjs`'s own output. A phase agent filling those
cells would only rename the same defect. The referee fills them (§1F md.3).

Capture condition is NOT an observation of ours either: it is quoted from the
Commons file page (ImageDescription / DateTimeOriginal). Where the page says
nothing, the sheet says KAYNAKTA YAZMIYOR rather than a guess.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PHOTOS = os.path.join(HERE, "photos")
CREDITS = os.path.join(HERE, "credits.json")
KAYNAK = os.path.join(ROOT, "dataset", "hedef-10", "KAYNAK.md")
TEMPLATE = os.path.join(HERE, "labels-hakem-BOS.json")
H10_AXES = os.path.join(HERE, "h10-eksenleri.json")

# The 12 axes the eye label carries today (labels.json), so the referee's sheet
# and the H2 scorer in engine/tests/hedef_kosu.mjs are the same 12 columns.
EYE_AXES = json.load(open(os.path.join(HERE, "labels.json")))
EYE_AXES = list(next(v for k, v in EYE_AXES.items() if not k.startswith("_")))


def short(s, n=180):
    s = re.sub(r"\s+", " ", s or "").strip()
    return (s[: n - 1] + "…") if len(s) > n else s


def main():
    credits = json.load(open(CREDITS))
    pool = sorted(f for f in os.listdir(PHOTOS) if f.lower().endswith(".jpg"))

    rows, orphans = [], []
    for f in pool:
        r = credits.get(f)
        if not r or r.get("status") != "PROVEN":
            orphans.append(f)
            continue
        rows.append((f, r))

    os.makedirs(os.path.dirname(KAYNAK), exist_ok=True)
    out = []
    out.append("# KAYNAK — ölçüm havuzunun künyesi (19 fotoğraf)\n")
    out.append(
        "Üretilmiştir: `python3 vision/eval/gen-kaynak.py`. Elle düzenlenmez.\n"
        "Kaynak veri: `vision/eval/credits.json` (takipli).\n")
    out.append(
        "\n**Künye nasıl kanıtlandı.** `vision/fetch-eval.sh` (silinmiş, `0af5f83`'ten\n"
        "kurtarıldı) yalnız 800px küçük resmin BAYTLARINI kaydetmiş; başlık, yazar,\n"
        "lisans, sayfa adresi tutulmamış. Künye tahminle değil KİMLİKLE geri alındı:\n"
        "`vision/eval/recover-credits.py` arama terimini dosya adından kurup Commons'a\n"
        "yeniden sorar, her adayın 800px küçük resmini indirir ve **sha256'sı diskteki\n"
        "dosyayla birebir aynı** olduğunda künyeyi yazar. Benzeyen aday kabul edilmez.\n"
        "Havuzun 19'unun 19'u bu testten **PROVEN** geçti.\n")
    out.append(
        "\n⚠ **DOSYA ADI İÇERİK DEĞİL, ARAMA TERİMİDİR.** Getiren betik dosyayı\n"
        "`NN-<sorgunun slug'ı>.jpg` diye yazıyor, Commons ne döndürdüyse. Bu yüzden\n"
        "`17-knit-sweater-mannequin.jpg` gerçekte bir II. Dünya Savaşı müzesi\n"
        "vitrinidir. Aşağıdaki *Commons başlığı* sütunu içeriğin kendisidir; dosya adı\n"
        "yalnızca bir etikettir ve bir alan okumasına dayanak yapılamaz.\n")
    out.append(
        "\n**Lisans yükümlülüğü.** Hepsi yeniden yayınlanabilir ama çoğu ATIF ister\n"
        "(CC BY / CC BY-SA), bazıları paylaş-aynı-lisansla. Landing'de örnek olarak\n"
        "yayınlanan her fotoğrafın yanında bu tablodaki yazar + lisans satırı görünmek\n"
        "zorundadır; görünmüyorsa fotoğraf landing'e çıkmaz, yalnız yerel ölçümde kalır.\n")

    out.append("\n---\n")
    for f, r in rows:
        out.append(f"\n## `{f}`\n")
        out.append(f"- **Commons başlığı:** {r['commons_title']}")
        out.append(f"- **Sayfa:** {r['commons_page']}")
        out.append(f"- **Yazar:** {short(r['author'], 120)}")
        out.append(f"- **Lisans:** {r['license']}"
                   + (f" — {r['license_url']}" if r.get("license_url") else ""))
        cond = short(r.get("description") or "")
        date = short(r.get("date") or "", 60)
        out.append("- **Çekim koşulu (Commons sayfasının kendi sözleri):** "
                   + (cond or "KAYNAKTA YAZMIYOR"))
        out.append("- **Tarih:** " + (date or "KAYNAKTA YAZMIYOR"))
        out.append(f"- **Kimlik kanıtı:** sha256 `{r['sha256'][:16]}…`, "
                   f"{r['bytes']} bayt, arama sırası #{r.get('match_rank', '?')}")

    if orphans:
        out.append("\n---\n\n## KÜNYESİ ÇIKMAYANLAR — havuzdan çıkar\n")
        for f in orphans:
            out.append(f"- `{f}` — YAYIN BULUNAMADI (bayt eşleşmesi yok)")
    else:
        out.append("\n---\n\n## KÜNYESİ ÇIKMAYAN YOK\n\n"
                   "Havuzdaki 19 dosyanın 19'u kimlikle kanıtlandı, "
                   "künyesizlik yüzünden düşen dosya olmadı.\n")

    open(KAYNAK, "w").write("\n".join(out) + "\n")

    h10 = json.load(open(H10_AXES))["eksenler"]
    template = {
        "_not": ("HAKEM DOLDURUR (§1F md.3, GECE7/F2 İŞ 1). Bütün hücreler BOŞ gelir; "
                 "faz ajanı doğru cevap yazmaz."),
        "_nasil_doldurulur": {
            "deger": ("H2'nin doğru cevabı. Alan fotoğrafta GÖRÜNÜYORSA değerini yaz; "
                      "GÖRÜNMÜYORSA null yaz. null 'bilmiyorum' değil, 'bu fotoğraf "
                      "bunu gösteremez' demektir."),
            "gorunurluk": (
                "H10a/H10b ayrımının doğru cevabı. Her eksen için: true = bu eksen bu "
                "fotoğrafta GÖRÜNÜYOR, false = GÖRÜNMESİ MÜMKÜN DEĞİL (arka, iç, "
                "örtülü, kadraj dışı). Boş bırakılan eksen H10x kovasında kalır ve "
                "İKİ SAYIYA DA yazılmaz."),
        },
        "_neden_iki_blok": (
            "ÖLÇÜLDÜ (F2, n=5): H10'un saydığı 24 eksenin 13'ünün göz etiketinde "
            "SÜTUNU BİLE YOK, ve çıkarılan 70 alanın 70'i tam olarak o sütunsuz "
            "eksenlerde. Yani yalnız 12 eksenlik `deger` bloğuyla H10 ayrıştırılamaz: "
            "ayrışma 0/0/70 çıkar. `gorunurluk` bloğu bu yüzden H10'un KENDİ eksen "
            "listesinden (vision/eval/h10-eksenleri.json) üretiliyor."),
        "_bos_hucre": "",
        "_deger_eksenleri": EYE_AXES,
        "_gorunurluk_eksenleri": h10,
        "_havuz": len(rows),
        "_kunye": "dataset/hedef-10/KAYNAK.md",
    }
    for f, _ in rows:
        template[f] = {
            "deger": {a: "" for a in EYE_AXES},
            "gorunurluk": {a: "" for a in h10},
        }
    json.dump(template, open(TEMPLATE, "w"), indent=1, ensure_ascii=False)

    filled = sum(1 for f, _ in rows for blok in template[f].values()
                 for v in blok.values() if v != "")
    print(f"KAYNAK.md   -> {KAYNAK}   ({len(rows)} künye, {len(orphans)} künyesiz)")
    print(f"BOŞ ŞABLON  -> {TEMPLATE}   ({len(rows)} foto x "
          f"({len(EYE_AXES)} değer + {len(h10)} görünürlük) eksen, dolu hücre {filled})")


if __name__ == "__main__":
    main()
