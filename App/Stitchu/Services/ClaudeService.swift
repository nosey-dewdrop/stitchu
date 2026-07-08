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
    case notConfigured
    case rateLimited
    case network
    case badResponse(String)

    /// User-facing copy — never leaks a raw API error body to the screen.
    /// Every case ends with the manual fallback so the user is never stuck.
    var errorDescription: String? {
        switch self {
        case .notConfigured:
            "Auto-detection isn't set up in this build — just pick the garment below."
        case .rateLimited:
            "The analysis service is busy right now — try again in a moment, or pick the garment below by hand."
        case .network:
            "Couldn't reach the analysis service — check your connection, or pick the garment below by hand."
        case .badResponse:
            "Auto-detection hiccuped — no worries, just pick the garment below by hand."
        }
    }

    /// Detail kept for logs only, never shown to the user.
    var debugDetail: String {
        switch self {
        case .badResponse(let message): message
        default: String(describing: self)
        }
    }
}

/// Garment photo analysis through our managed backend proxy (a Cloudflare
/// Worker holding the Anthropic key). The app only knows the Worker URL and a
/// shared app token — never an Anthropic key. Works out of the box for users.
struct ClaudeService {
    /// True when the app is pointed at a real deployed Worker.
    static var isConfigured: Bool {
        !Secrets.backendURL.isEmpty
            && !Secrets.appToken.isEmpty
            && !Secrets.appToken.contains("REPLACE")
            && !Secrets.backendURL.contains("REPLACE")
    }

    static func analyzeGarment(imageData: Data) async throws -> GarmentAnalysis {
        guard isConfigured, let url = URL(string: Secrets.backendURL) else {
            throw ClaudeServiceError.notConfigured
        }

        let body: [String: Any] = [
            "image": imageData.base64EncodedString(),
            "mediaType": "image/jpeg",
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.setValue(Secrets.appToken, forHTTPHeaderField: "x-app-token")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        request.timeoutInterval = 60

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw ClaudeServiceError.network
        }
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            let status = (response as? HTTPURLResponse)?.statusCode ?? -1
            let text = String(data: data, encoding: .utf8) ?? "unknown error"
            #if DEBUG
            print("ClaudeService HTTP \(status): \(text)")
            #endif
            switch status {
            case 429, 529: throw ClaudeServiceError.rateLimited
            default: throw ClaudeServiceError.badResponse(text)
            }
        }

        // The Worker returns the raw Anthropic /v1/messages body unchanged.
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
