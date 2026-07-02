import SwiftUI
import SwiftData

struct PatternResultView: View {
    let draft: DraftedPattern
    var sourcePhoto: Data? = nil
    var existing: SavedPattern? = nil

    @Environment(\.modelContext) private var modelContext
    @State private var saved = false
    @State private var pdfURL: URL?
    @State private var pdfError: String?

    var body: some View {
        ZStack {
            Palette.bg.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    piecesPreview
                    fabricCard
                    guideCard
                    actions
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle(draft.garment)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { saved = existing != nil }
    }

    private var piecesPreview: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("your pattern pieces")
                .font(Quicksand.bold(20))
                .foregroundStyle(Palette.ink)
            ForEach(draft.pieces) { piece in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(piece.name)
                            .font(Quicksand.semiBold(16))
                            .foregroundStyle(Palette.ink)
                        Spacer()
                        Text(piece.cutInstruction)
                            .font(Quicksand.medium(13))
                            .foregroundStyle(Palette.blueDark)
                            .padding(.vertical, 4)
                            .padding(.horizontal, 10)
                            .background(Palette.blueLight, in: Capsule())
                    }
                    PatternPieceCanvas(piece: piece)
                        .frame(height: pieceHeight(piece))
                    let box = piece.boundingBox
                    Text(String(format: "%.0f × %.0f cm · seam allowance %.1f cm (add when cutting)", box.width / 10, box.height / 10, piece.seamAllowance / 10))
                        .font(Quicksand.regular(13))
                        .foregroundStyle(Palette.inkSecondary)
                }
                .padding(16)
                .background(Palette.card, in: RoundedRectangle(cornerRadius: 20))
                .stitchedBorder(cornerRadius: 20)
            }
        }
    }

    private func pieceHeight(_ piece: PatternPiece) -> CGFloat {
        let box = piece.boundingBox
        guard box.width > 0 else { return 120 }
        let aspect = box.height / box.width
        return min(max(120, 300 * aspect), 340)
    }

    private var fabricCard: some View {
        let advice = KnowledgeBase.shared.fabricAdvice(for: draft.fabricAdviceKey)
        return VStack(alignment: .leading, spacing: 10) {
            Text("fabric")
                .font(Quicksand.bold(20))
                .foregroundStyle(Palette.ink)
            Text(String(format: "you'll need about %.1f m of 140 cm wide fabric", draft.fabricMeters140))
                .font(Quicksand.medium(16))
                .foregroundStyle(Palette.ink)

            if !advice.suggested.isEmpty {
                Text("works beautifully")
                    .font(Quicksand.semiBold(14))
                    .foregroundStyle(Palette.blueDark)
                ForEach(advice.suggested) { fabric in
                    fabricRow(fabric, warn: false)
                }
            }
            if !advice.avoid.isEmpty {
                Text("think twice")
                    .font(Quicksand.semiBold(14))
                    .foregroundStyle(Palette.pink)
                    .padding(.top, 4)
                ForEach(advice.avoid) { fabric in
                    fabricRow(fabric, warn: true)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(Palette.card, in: RoundedRectangle(cornerRadius: 20))
        .stitchedBorder(cornerRadius: 20)
    }

    private func fabricRow(_ fabric: FabricInfo, warn: Bool) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(fabric.name)
                .font(Quicksand.semiBold(15))
                .foregroundStyle(Palette.ink)
            Text(warn
                 ? (fabric.badFor.first.map { "not ideal here: \($0)" } ?? "")
                 : "\(fabric.drape) · \(fabric.beginnerDifficulty)")
                .font(Quicksand.regular(13))
                .foregroundStyle(Palette.inkSecondary)
            if warn, let mistake = fabric.commonMistakes.first {
                Text(mistake)
                    .font(Quicksand.regular(12))
                    .foregroundStyle(Palette.inkSecondary)
            }
        }
        .padding(.vertical, 2)
    }

    private var guideCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("how to sew it")
                .font(Quicksand.bold(20))
                .foregroundStyle(Palette.ink)
            ForEach(Array(draft.guideSteps.enumerated()), id: \.offset) { index, step in
                HStack(alignment: .top, spacing: 12) {
                    Text("\(index + 1)")
                        .font(Quicksand.bold(15))
                        .foregroundStyle(.white)
                        .frame(width: 28, height: 28)
                        .background(Palette.blue, in: Circle())
                    Text(step)
                        .font(Quicksand.regular(15))
                        .foregroundStyle(Palette.ink)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(Palette.card, in: RoundedRectangle(cornerRadius: 20))
        .stitchedBorder(cornerRadius: 20)
    }

    private var actions: some View {
        VStack(spacing: 12) {
            Button {
                exportPDF()
            } label: {
                Label("download A4 PDF", systemImage: "arrow.down.doc")
                    .font(Quicksand.semiBold(17))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(Palette.blue, in: Capsule())
            }
            if let pdfURL {
                ShareLink(item: pdfURL) {
                    Label("share PDF", systemImage: "square.and.arrow.up")
                        .font(Quicksand.semiBold(17))
                        .foregroundStyle(Palette.blueDark)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background(Palette.blueLight, in: Capsule())
                }
            }
            if let pdfError {
                Text(pdfError)
                    .font(Quicksand.medium(14))
                    .foregroundStyle(Palette.pink)
            }
            if !saved {
                Button {
                    save()
                } label: {
                    Label("save to closet", systemImage: "heart")
                        .font(Quicksand.semiBold(17))
                        .foregroundStyle(Palette.blueDark)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background(Palette.card, in: Capsule())
                        .overlay(Capsule().strokeBorder(Palette.blue, style: StrokeStyle(lineWidth: 2, dash: [6, 4])))
                }
            } else {
                Label("in your closet", systemImage: "heart.fill")
                    .font(Quicksand.semiBold(16))
                    .foregroundStyle(Palette.blueDark)
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private func exportPDF() {
        do {
            pdfURL = try PatternPDFExporter.export(draft: draft)
            pdfError = nil
        } catch {
            pdfError = "PDF export failed: \(error.localizedDescription)"
        }
    }

    private func save() {
        do {
            let pattern = try SavedPattern(
                name: draft.garment,
                garment: draft.garment,
                draft: draft,
                sourcePhoto: sourcePhoto
            )
            modelContext.insert(pattern)
            saved = true
        } catch {
            pdfError = "couldn't save: \(error.localizedDescription)"
        }
    }
}

/// Scaled on-screen preview of a single piece with markings and grainline.
struct PatternPieceCanvas: View {
    let piece: PatternPiece

    var body: some View {
        Canvas { context, size in
            let box = piece.boundingBox
            guard box.width > 0, box.height > 0 else { return }
            let margin: CGFloat = 12
            let scale = min((size.width - margin * 2) / box.width, (size.height - margin * 2) / box.height)
            var transform = CGAffineTransform(translationX: margin - box.minX * scale, y: margin - box.minY * scale)
                .scaledBy(x: scale, y: scale)

            if let outline = piece.cgPath.copy(using: &transform) {
                context.fill(Path(outline), with: .color(Palette.blueLight.opacity(0.4)))
                context.stroke(Path(outline), with: .color(Palette.blueDark), lineWidth: 2)
            }

            if !piece.markings.isEmpty {
                let markingPiece = PatternPiece(name: "", cutInstruction: "", commands: piece.markings, seamAllowance: 0)
                if let markings = markingPiece.cgPath.copy(using: &transform) {
                    context.stroke(Path(markings), with: .color(Palette.blue), style: StrokeStyle(lineWidth: 1.5, dash: [5, 3]))
                }
            }

            if let grainline = piece.grainline {
                var p = Path()
                p.move(to: grainline.from.applying(transform))
                p.addLine(to: grainline.to.applying(transform))
                context.stroke(p, with: .color(Palette.inkSecondary), style: StrokeStyle(lineWidth: 1.5))
            }
        }
    }
}
