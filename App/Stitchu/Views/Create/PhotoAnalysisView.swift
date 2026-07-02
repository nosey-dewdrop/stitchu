import SwiftUI
import SwiftData

/// Photo → analysis → confirm → draft. The user always confirms what we
/// detected before a pattern is generated — no blind trust in the AI read.
struct PhotoAnalysisView: View {
    let photoData: Data

    @Environment(\.modelContext) private var modelContext
    @Query(sort: \BodyMeasurements.createdAt) private var measurements: [BodyMeasurements]

    @State private var phase: Phase = .idle
    @State private var garment: String = "skirt"
    @State private var skirtStyle: SkirtStyle = .aLine
    @State private var skirtLength: SkirtLength = .midi
    @State private var analysisNote: String?
    @State private var errorMessage: String?
    @State private var draft: DraftedPattern?

    enum Phase { case idle, analyzing, confirm, done }

    var body: some View {
        ZStack {
            Palette.bg.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 18) {
                    photo
                    switch phase {
                    case .idle: startSection
                    case .analyzing: analyzing
                    case .confirm: confirmSection
                    case .done: EmptyView()
                    }
                    if let errorMessage {
                        Text(errorMessage)
                            .font(Quicksand.medium(14))
                            .foregroundStyle(Palette.pink)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle("from a photo")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(item: $draft) { drafted in
            PatternResultView(draft: drafted, sourcePhoto: photoData)
        }
        .task { startAnalysis() }
    }

    private var photo: some View {
        Group {
            if let image = UIImage(data: photoData) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(maxHeight: 300)
                    .clipShape(RoundedRectangle(cornerRadius: 22))
                    .stitchedBorder(cornerRadius: 22)
            }
        }
    }

    private var startSection: some View {
        ProgressView().tint(Palette.blue).padding(.top, 20)
    }

    private var analyzing: some View {
        VStack(spacing: 10) {
            ProgressView().tint(Palette.blue)
            Text("reading your garment…")
                .font(Quicksand.medium(16))
                .foregroundStyle(Palette.inkSecondary)
        }
        .padding(.top, 12)
    }

    private var confirmSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("here's what I see — fix anything I got wrong")
                .font(Quicksand.semiBold(17))
                .foregroundStyle(Palette.ink)

            if let analysisNote {
                Text(analysisNote)
                    .font(Quicksand.regular(14))
                    .foregroundStyle(Palette.inkSecondary)
            }

            VStack(alignment: .leading, spacing: 12) {
                Text("garment")
                    .font(Quicksand.medium(14))
                    .foregroundStyle(Palette.inkSecondary)
                Picker("garment", selection: $garment) {
                    Text("skirt").tag("skirt")
                    Text("dress (soon)").tag("dress")
                    Text("top (soon)").tag("top")
                    Text("trousers (soon)").tag("trousers")
                }
                .pickerStyle(.segmented)

                if garment == "skirt" {
                    Text("style")
                        .font(Quicksand.medium(14))
                        .foregroundStyle(Palette.inkSecondary)
                    Picker("style", selection: $skirtStyle) {
                        ForEach(SkirtStyle.allCases) { style in
                            Text(style.title).tag(style)
                        }
                    }
                    .pickerStyle(.segmented)

                    Text("length")
                        .font(Quicksand.medium(14))
                        .foregroundStyle(Palette.inkSecondary)
                    Picker("length", selection: $skirtLength) {
                        ForEach(SkirtLength.allCases) { length in
                            Text(length.rawValue).tag(length)
                        }
                    }
                    .pickerStyle(.segmented)
                } else {
                    Text("this garment type is coming in a future update — skirts are ready today")
                        .font(Quicksand.regular(14))
                        .foregroundStyle(Palette.inkSecondary)
                }
            }
            .padding(18)
            .background(Palette.card, in: RoundedRectangle(cornerRadius: 20))
            .stitchedBorder(cornerRadius: 20)

            Button {
                generate()
            } label: {
                Text("draft my pattern")
                    .font(Quicksand.semiBold(17))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(garment == "skirt" ? Palette.blue : Palette.line, in: Capsule())
            }
            .disabled(garment != "skirt")
        }
    }

    private func startAnalysis() {
        guard phase == .idle else { return }
        guard ClaudeService.hasKey else {
            phase = .confirm
            analysisNote = "no API key set, so tell me what this is — auto-detection turns on once you add a key in Profile"
            return
        }
        phase = .analyzing
        Task {
            do {
                let result = try await ClaudeService.analyzeGarment(imageData: photoData)
                garment = result.garment
                if let style = result.skirtStyle, let parsed = SkirtStyle(rawValue: style) { skirtStyle = parsed }
                if let length = result.length, let parsed = SkirtLength(rawValue: length) { skirtLength = parsed }
                analysisNote = result.details
            } catch {
                errorMessage = error.localizedDescription
            }
            phase = .confirm
        }
    }

    private func generate() {
        guard let m = measurements.last else {
            errorMessage = "no measurements found — complete onboarding first"
            return
        }
        draft = SkirtBlock.draft(
            measurements: BodyMeasurementsSnapshot(from: m),
            style: skirtStyle,
            length: skirtLength
        )
    }
}

extension DraftedPattern: Hashable {
    static func == (lhs: DraftedPattern, rhs: DraftedPattern) -> Bool {
        lhs.garment == rhs.garment && lhs.pieces.map(\.id) == rhs.pieces.map(\.id)
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(garment)
        for piece in pieces { hasher.combine(piece.id) }
    }
}
