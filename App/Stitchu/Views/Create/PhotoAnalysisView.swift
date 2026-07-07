import SwiftUI
import SwiftData

/// Photo → analysis → confirm → draft. The user always confirms what we
/// detected before a pattern is generated — no blind trust in the AI read.
struct PhotoAnalysisView: View {
    let photoData: Data

    @Environment(\.modelContext) private var modelContext
    @Query(sort: \BodyMeasurements.createdAt) private var measurements: [BodyMeasurements]

    @State private var phase: Phase = .idle
    @State private var spec = GarmentSpec()
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
                    case .idle: ProgressView().tint(Palette.blue).padding(.top, 20)
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
                pickerLabel("garment")
                Picker("garment", selection: $spec.garment) {
                    ForEach(GarmentType.allCases) { type in
                        Text(type.title).tag(type)
                    }
                }
                .pickerStyle(.segmented)

                if spec.garment != .skirt {
                    pickerLabel("neckline")
                    Picker("neckline", selection: $spec.neckline) {
                        ForEach(Neckline.allCases) { neckline in
                            Text(neckline.title).tag(neckline)
                        }
                    }
                    .pickerStyle(.segmented)

                    pickerLabel("sleeves")
                    Picker("sleeves", selection: $spec.sleeveStyle) {
                        ForEach(SleeveStyle.allCases) { style in
                            Text(style.title).tag(style)
                        }
                    }
                    .pickerStyle(.segmented)

                    if spec.sleeveStyle != .none {
                        pickerLabel("sleeve length")
                        Picker("sleeve length", selection: $spec.sleeveLength) {
                            ForEach(SleeveLength.allCases) { length in
                                Text(length.rawValue).tag(length)
                            }
                        }
                        .pickerStyle(.segmented)
                    }
                }

                if spec.garment == .skirt || spec.garment == .dress {
                    pickerLabel("skirt style")
                    Picker("style", selection: $spec.skirtStyle) {
                        ForEach(SkirtStyle.allCases) { style in
                            Text(style.title).tag(style)
                        }
                    }
                    .pickerStyle(.segmented)

                    pickerLabel("length")
                    Picker("length", selection: $spec.skirtLength) {
                        ForEach(SkirtLength.allCases) { length in
                            Text(length.rawValue).tag(length)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                if spec.garment == .top {
                    pickerLabel("length")
                    Picker("length", selection: $spec.topLength) {
                        ForEach(TopLength.allCases) { length in
                            Text(length.rawValue).tag(length)
                        }
                    }
                    .pickerStyle(.segmented)
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
                    .background(Palette.blue, in: Capsule())
            }
        }
    }

    private func pickerLabel(_ text: String) -> some View {
        Text(text)
            .font(Quicksand.medium(14))
            .foregroundStyle(Palette.inkSecondary)
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
                if let parsed = GarmentType(rawValue: result.garment) { spec.garment = parsed }
                if let neckline = result.neckline, let parsed = Neckline(rawValue: neckline) { spec.neckline = parsed }
                if let sleeve = result.sleeveStyle, let parsed = SleeveStyle(rawValue: sleeve) { spec.sleeveStyle = parsed }
                if let sleeveLen = result.sleeveLength, let parsed = SleeveLength(rawValue: sleeveLen) { spec.sleeveLength = parsed }
                if let style = result.skirtStyle, let parsed = SkirtStyle(rawValue: style) { spec.skirtStyle = parsed }
                if let length = result.length, let parsed = SkirtLength(rawValue: length) { spec.skirtLength = parsed }
                if let top = result.topLength, let parsed = TopLength(rawValue: top) { spec.topLength = parsed }
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
        let snapshot = BodyMeasurementsSnapshot(from: m)
        let drafted = GarmentDrafter.draft(spec: spec, measurements: snapshot)
        // Safety net: never hand the user a geometrically broken pattern.
        let issues = PatternValidator.issues(spec: spec, measurements: snapshot, draft: drafted)
        guard issues.isEmpty else {
            #if DEBUG
            for issue in issues { print("pattern validation: \(issue)") }
            #endif
            errorMessage = "hmm, this combination didn't draft cleanly for your measurements — try a different style, or double-check your measurements in Profile"
            return
        }
        errorMessage = nil
        draft = drafted
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
