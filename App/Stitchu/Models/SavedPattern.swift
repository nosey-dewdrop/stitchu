import Foundation
import SwiftData

@Model
final class SavedPattern {
    var name: String
    var garment: String
    var createdAt: Date
    /// JSON-encoded DraftedPattern.
    var draftData: Data
    /// Original garment photo when the pattern came from the photo path.
    @Attribute(.externalStorage) var sourcePhoto: Data?

    init(name: String, garment: String, draft: DraftedPattern, sourcePhoto: Data? = nil) throws {
        self.name = name
        self.garment = garment
        self.createdAt = .now
        self.draftData = try JSONEncoder().encode(draft)
        self.sourcePhoto = sourcePhoto
    }

    var draft: DraftedPattern? {
        try? JSONDecoder().decode(DraftedPattern.self, from: draftData)
    }
}
