// Fabric advice from the verified knowledge base (web/data/fabrics.json,
// generated from knowledge/stitchu.db, only sourced claims ship).
// Port of KnowledgeBase.fabricAdvice(): match garment key against goodFor /
// badFor lists; badFor wins.
let fabricsPromise = null;

function loadFabrics() {
  if (!fabricsPromise) {
    fabricsPromise = fetch('data/fabrics.json')
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
  }
  return fabricsPromise;
}

export async function fabricAdvice(garmentKey) {
  const fabrics = await loadFabrics();
  const key = garmentKey.toLowerCase();
  const suggested = [];
  const avoid = [];
  for (const fabric of fabrics) {
    if (fabric.badFor.some((use) => use.toLowerCase().includes(key))) {
      avoid.push(fabric);
    } else if (fabric.goodFor.some((use) => use.toLowerCase().includes(key))) {
      suggested.push(fabric);
    }
  }
  return { suggested, avoid };
}
