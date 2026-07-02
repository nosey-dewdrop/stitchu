import Foundation

struct GarmentAnalysis: Codable {
    var garment: String
    var neckline: String?
    var sleeveStyle: String?
    var sleeveLength: String?
    var skirtStyle: String?
    var length: String?
    var topLength: String?
    var details: String?
}

enum ClaudeServiceError: LocalizedError {
    case missingKey
    case badResponse(String)

    var errorDescription: String? {
        switch self {
        case .missingKey:
            "No API key set. Add your Anthropic API key in Profile → Settings."
        case .badResponse(let message):
            "The analysis didn't come back right: \(message)"
        }
    }
}

/// Garment photo analysis through the Claude API.
/// The key lives in the Keychain only — never bundled, never committed.
struct ClaudeService {
    static let keychainKey = "anthropic-api-key"

    static var hasKey: Bool {
        !(KeychainHelper.read(keychainKey) ?? "").isEmpty
    }

    static func analyzeGarment(imageData: Data) async throws -> GarmentAnalysis {
        guard let apiKey = KeychainHelper.read(keychainKey), !apiKey.isEmpty else {
            throw ClaudeServiceError.missingKey
        }

        let prompt = """
        Analyze the garment in this photo for sewing pattern drafting. Respond with ONLY a JSON object, no prose:
        {"garment": "skirt" | "dress" | "top" | "trousers" | "other",
         "neckline": "crew" | "scoop" | "vNeck" | "square" | "boat" | null,
         "sleeveStyle": "none" | "straight" | "balloon" | null (balloon covers puff/bishop/gathered sleeves),
         "sleeveLength": "short" | "elbow" | "long" | null,
         "skirtStyle": "aLine" | "straight" | "gathered" | "halfCircle" | null (halfCircle covers full/flared circle skirts),
         "length": "mini" | "midi" | "maxi" | null (skirt/dress hem length),
         "topLength": "cropped" | "hip" | "tunic" | null (only for tops),
         "details": "one sentence: notable construction details (zipper, darts, pleats, waistband, fabric guess)"}
        """

        let body: [String: Any] = [
            "model": "claude-sonnet-4-6",
            "max_tokens": 500,
            "messages": [[
                "role": "user",
                "content": [
                    ["type": "image", "source": [
                        "type": "base64", "media_type": "image/jpeg",
                        "data": imageData.base64EncodedString(),
                    ]],
                    ["type": "text", "text": prompt],
                ],
            ]],
        ]

        var request = URLRequest(url: URL(string: "https://api.anthropic.com/v1/messages")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        request.timeoutInterval = 60

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            let text = String(data: data, encoding: .utf8) ?? "unknown error"
            throw ClaudeServiceError.badResponse(text)
        }

        guard
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
            let content = json["content"] as? [[String: Any]],
            let text = content.first(where: { $0["type"] as? String == "text" })?["text"] as? String
        else {
            throw ClaudeServiceError.badResponse("unexpected response shape")
        }

        // The model may wrap JSON in code fences; extract the outermost object.
        guard
            let start = text.firstIndex(of: "{"),
            let end = text.lastIndex(of: "}")
        else {
            throw ClaudeServiceError.badResponse("no JSON in reply")
        }
        let jsonText = String(text[start...end])
        return try JSONDecoder().decode(GarmentAnalysis.self, from: Data(jsonText.utf8))
    }
}
