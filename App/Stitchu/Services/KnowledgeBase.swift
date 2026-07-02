import Foundation

struct SewingTip: Codable, Identifiable {
    var id: String { title }
    var title: String
    var body: String
    var source: String
}

struct ZipperRule: Codable, Identifiable {
    var id: String { type }
    var type: String
    var descriptionText: String
    var garmentUse: String
    var constructionNotes: String
    var source: String
}

struct FabricInfo: Codable, Identifiable {
    var id: String { name }
    var name: String
    var drape: String
    var weight: String
    var stretch: String
    var goodFor: [String]
    var badFor: [String]
    var beginnerDifficulty: String
    var commonMistakes: [String]
    var source: String
}

/// Verified sewing knowledge bundled with the app. Content is generated from
/// knowledge/stitchu.db in the repo — only adversarially verified claims ship.
final class KnowledgeBase {
    static let shared = KnowledgeBase()

    let tips: [SewingTip]
    let zipperRules: [ZipperRule]
    let fabrics: [FabricInfo]

    private init() {
        tips = Self.load("tips", as: [SewingTip].self) ?? []
        zipperRules = Self.load("zippers", as: [ZipperRule].self) ?? []
        fabrics = Self.load("fabrics", as: [FabricInfo].self) ?? []
    }

    private static func load<T: Decodable>(_ name: String, as type: T.Type) -> T? {
        guard let url = Bundle.main.url(forResource: name, withExtension: "json"),
              let data = try? Data(contentsOf: url)
        else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }

    /// Fabrics recommended and warned-against for a garment key ("skirt", "dress", "top").
    func fabricAdvice(for garmentKey: String) -> (suggested: [FabricInfo], avoid: [FabricInfo]) {
        let key = garmentKey.lowercased()
        var suggested: [FabricInfo] = []
        var avoid: [FabricInfo] = []
        for fabric in fabrics {
            if fabric.badFor.contains(where: { $0.lowercased().contains(key) }) {
                avoid.append(fabric)
            } else if fabric.goodFor.contains(where: { $0.lowercased().contains(key) }) {
                suggested.append(fabric)
            }
        }
        return (suggested, avoid)
    }
}
