"""§1F ÖLÇÜM HAVUZU KAPISI — künye var mı, kanıtlı mı, ve doğru cevabı kim yazdı?

GECE7 / F2 İŞ 1. Bu dosya `python3 -m pytest -q` altında koşan TEK gerçek python
süiti; kapsamı kök `conftest.py`'de gerekçesiyle yazılı.

NE ÖLÇÜYOR (dördü de ayrı bir kusur sınıfı):

  1. HAVUZ = KÜNYE. Havuzdaki her fotoğrafın `vision/eval/credits.json` içinde bir
     kaydı var, kaydı **PROVEN** (sha256 kimliği), ve yazar + lisans satırı boş
     değil. §1F: künyesi olmayan dosya havuzda kalamaz.
  2. `_dropped` GERÇEKTEN SİLİNDİ. Etiket dosyasının attığı 10 numaralı dosyadan
     hiçbiri diskte durmuyor. "Listede düşürüldü ama dosya duruyor" §1F'nin
     kapatmak istediği tam olarak bu haldi.
  3. HAVUZ ile ETİKET AYNI KÜMEDİR. Diskteki her fotoğrafın bir etiket kaydı var
     ve her etiket kaydının bir dosyası var. Sarkan taraf ölçümü sessizce
     küçültür ya da büyütür.
  4. ⭐ DOĞRU CEVABI FAZ AJANI YAZMADI. Hakemin şablonundaki her hücre BOŞ.
     H2 = %92.2'nin bugün geçici olmasının sebebi doğru cevapların bir MODEL
     tarafından konmuş olması; şablonu faz ajanının doldurması aynı kusuru yeni
     bir adla geri getirirdi. Dolu tek hücre bu kapıyı kırmızı yakar.
"""
import json
import os
import re

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__)))))
PHOTOS = os.path.join(ROOT, "vision", "eval", "photos")
CREDITS = os.path.join(ROOT, "vision", "eval", "credits.json")
LABELS = os.path.join(ROOT, "vision", "eval", "labels.json")
TEMPLATE = os.path.join(ROOT, "vision", "eval", "labels-hakem-BOS.json")


def pool():
    return sorted(f for f in os.listdir(PHOTOS) if f.lower().endswith(".jpg"))


def load(p):
    with open(p, encoding="utf-8") as fh:
        return json.load(fh)


def test_havuz_bos_degil():
    assert pool(), "ölçüm havuzu boş — yargılanacak şey olmaması bir GEÇME değildir"


@pytest.mark.parametrize("name", pool())
def test_her_fotografin_kanitli_kunyesi_var(name):
    rec = load(CREDITS).get(name)
    assert rec is not None, f"{name}: künye kaydı yok"
    assert rec["status"] == "PROVEN", (
        f"{name}: künye kimlikle kanıtlanmadı ({rec['status']}) — "
        "benzeyen aday künye değildir, dosya havuzdan çıkar")
    for field in ("commons_page", "author", "license"):
        val = (rec.get(field) or "").strip()
        assert val and val != "YAYIN BULUNAMADI", f"{name}: künyede {field} yok"


def test_dropped_dosyalar_diskte_yok():
    dropped = load(LABELS)["_dropped"]
    nums = {re.match(r"\s*(\d+)", d).group(1) for d in dropped}
    still_here = [f for f in pool() if f.split("-", 1)[0] in nums]
    assert not still_here, f"düşürülmüş dosyalar hâlâ diskte: {still_here}"


def test_havuz_ve_etiket_ayni_kume():
    labels = load(LABELS)
    labelled = {k for k in labels if not k.startswith("_")}
    on_disk = set(pool())
    assert labelled == on_disk, (
        f"etiketi olup dosyası olmayan: {sorted(labelled - on_disk)}; "
        f"dosyası olup etiketi olmayan: {sorted(on_disk - labelled)}")


def test_hakem_sablonu_bos_gelir():
    """Faz ajanı kendi işini kendi notlayamaz (§1F md.3)."""
    tpl = load(TEMPLATE)
    rows = {k: v for k, v in tpl.items() if not k.startswith("_")}
    assert rows, "şablon boş"
    assert set(rows) == set(pool()), "şablon havuzla aynı kümede değil"
    # Şablon iki bloklu (deger + gorunurluk) ve ileride büyüyebilir; kapı şekle
    # değil TEK KURALA bağlı: yaprak hücrelerin hepsi boş.
    def hucreler(node, yol=""):
        if isinstance(node, dict):
            for k, v in node.items():
                yield from hucreler(v, f"{yol}.{k}" if yol else k)
        else:
            yield yol, node

    filled = {f"{k}.{yol}": v for k, r in rows.items()
              for yol, v in hucreler(r) if v != ""}
    assert not filled, (
        "şablonda DOLU hücre var — doğru cevabı hakem yazar, faz ajanı değil: "
        f"{sorted(filled)[:8]}")
