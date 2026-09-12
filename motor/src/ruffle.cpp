#include "ruffle.hpp"

#include <algorithm>
#include <cmath>
#include <string>

namespace stitchu {
namespace RuffleBlock {

namespace {

constexpr double HEM = 10;      // rolled bottom hem allowance (mm)
constexpr double SA = constants::kSeamAllowanceRuffleJoinMM; // gathered/joined edge SA (constants.yaml)
constexpr double SEG_MAX = 1400; // one fabric-width segment (well under the 3000 mm print cap)

// One gathered strip. bottomIsHem: the bottom edge is finished with a rolled
// hem; otherwise it is a plain seam that receives the next tier's gathers.
PatternPiece strip(const std::string& name, const std::string& gatherTarget,
                   double totalLen, double depthMM, int notches, bool bottomIsHem) {
    const double bottomAllowance = bottomIsHem ? HEM : SA;
    // A strip this long is cut in fabric-width segments and joined end to end;
    // the pattern piece IS one segment (printable), the cut note gives the count.
    const int segments = std::max(1, static_cast<int>(std::ceil(totalLen / SEG_MAX)));
    const double stripLen = totalLen / segments; // even segment length
    const double stripH = depthMM + bottomAllowance + SA;

    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction =
        "cut " + std::to_string(segments) + " strip(s) " +
        std::to_string(static_cast<long>(std::lround(stripLen))) + " x " +
        std::to_string(static_cast<long>(std::lround(stripH))) +
        " mm, join end to end (total " + std::to_string(static_cast<long>(std::lround(totalLen))) +
        " mm), then gather to " + gatherTarget;

    // Outline: a rectangle strip.
    piece.commands = {
        PathCommand::move({0, 0}),
        PathCommand::line({stripLen, 0}),
        PathCommand::line({stripLen, stripH}),
        PathCommand::line({0, stripH}),
        PathCommand::close(),
    };

    // Markings: gather notches on the top edge, the gather (seam) line and the
    // bottom hemline/seamline. Gathering the top edge between the notches evenly
    // pulls the strip down to the edge it trims.
    for (int i = 1; i < notches; ++i) {
        const double x = (stripLen * i) / notches;
        piece.markings.push_back(PathCommand::move({x, 0}));
        piece.markings.push_back(PathCommand::line({x, 14}));
    }
    piece.markings.push_back(PathCommand::move({0, SA}));           // gather here
    piece.markings.push_back(PathCommand::line({stripLen, SA}));
    piece.markings.push_back(PathCommand::move({0, stripH - bottomAllowance}));
    piece.markings.push_back(PathCommand::line({stripLen, stripH - bottomAllowance}));

    piece.hasGrainline = true;
    piece.grainline = Grainline{{stripLen * 0.5, SA + 6}, {stripLen * 0.5, stripH - bottomAllowance - 6}};
    piece.seamAllowance = SA;
    return piece;
}

} // namespace

PatternPiece draft(double edgeMM, double fullness, double depthMM, int notches) {
    fullness = std::max(1.5, std::min(4.0, fullness));
    notches = std::max(2, std::min(12, notches));
    return strip("Ruffle strip (fırfır)", "the hem", edgeMM * fullness, depthMM, notches,
                 /*bottomIsHem=*/true);
}

std::vector<PatternPiece> draftTiers(
    double edgeMM, double fullness, double depthMM, int tiers, int notches) {
    tiers = std::max(1, std::min(5, tiers));
    if (tiers == 1) return {draft(edgeMM, fullness, depthMM, notches)};

    fullness = std::max(1.5, std::min(4.0, fullness));
    notches = std::max(2, std::min(12, notches));

    // ⭐ KATMANLI ETEK GİYİLEBİLİR BİR GİYSİ DEĞİLDİ — ORAN HER DİKİŞTE
    // YENİDEN ÇARPILIYORDU.
    //
    // ÖLÇÜLDÜ 2026-09-04, EU38 A-line midi, hem 958.8 mm, ruffleTiers=3:
    //   eski model (`edge *= fullness`) -> tier 3 kesim uzunluğu
    //   958.8 x 2.5^3 = 14981 mm. On beş metrelik etek ucu bir giysi değildir;
    //   flat çizimi de bu sayıya inanamadığı için katmanları hiç genişletmedi
    //   (dört katmanın DÖRDÜ de ±239.70 mm — hakem ölçümü, 2026-09-04).
    //
    // KÖK SEBEP BİR KATEGORİ HATASI: `fullness` constants.yaml'da
    // "hem ruffle default gather ratio, in the published 2.0-3.0 gathering
    // band" olarak tanımlıdır — BİR büzgülü kenarın tutunduğu BİTMİŞ kenara
    // oranı. Katmanlı etekte alıcının gördüğü bitmiş kenar SON katmanın alt
    // ucudur; dolgunluk o ucun etek hemine oranıdır. Eski kod tek bir kenar
    // için yayınlanmış oranı her dikişte yeniden uygulayarak bandın dışına
    // çıkıyordu (2.5^3 = 15.6, band 2.0-3.0).
    //
    // ⛔ YENİ SAYI SEÇİLMEDİ, constants.yaml'a satır EKLENMEDİ. Katman başına
    // oran var olan sabitin n'inci köküdür: r^tiers = fullness. SON katmanın
    // kesim uzunluğu tam olarak hem x fullness'tır — yayınlanmış bandın
    // kendisi — ara katmanlar o toplamı eşit paylaşır. tiers=1'de r = fullness,
    // yani tek fırfır BAYT BAYT aynı kalır.
    // EU38, 3 katman: r = 2.5^(1/3) = 1.3572 -> kesim 1301 / 1766 / 2397 mm.
    const double r = std::pow(fullness, 1.0 / tiers);

    std::vector<PatternPiece> pieces;
    pieces.reserve(tiers);
    double edge = edgeMM; // the edge tier i gathers onto: edgeMM x r^(i-1)
    for (int i = 1; i <= tiers; ++i) {
        const bool last = i == tiers;
        const std::string target = i == 1
            ? "the hem"
            : ("tier " + std::to_string(i - 1) + "'s bottom edge");
        pieces.push_back(strip("Ruffle tier " + std::to_string(i) + " (fırfır)",
                               target, edge * r, depthMM, notches, last));
        edge *= r;
    }
    return pieces;
}

double finishedBottomMM(double edgeMM, double fullness) {
    return edgeMM * std::max(1.5, std::min(4.0, fullness));
}

} // namespace RuffleBlock
} // namespace stitchu
