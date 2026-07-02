import SwiftUI

/// Trend feed + fabric suggestions. v1 content is curated locally from the
/// knowledge base; live feed comes later with the suggestion engine phase.
struct InspireRoomView: View {
    private let knowledge = KnowledgeBase.shared

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 18) {
                DoodlePlaceholder(label: "hero banner illustration\n(seasonal trend)", height: 170)

                Text("sewing wisdom")
                    .font(Quicksand.bold(20))
                    .foregroundStyle(Palette.ink)

                ForEach(knowledge.tips) { tip in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(tip.title)
                            .font(Quicksand.semiBold(16))
                            .foregroundStyle(Palette.ink)
                        Text(tip.body)
                            .font(Quicksand.regular(14))
                            .foregroundStyle(Palette.inkSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(Palette.card, in: RoundedRectangle(cornerRadius: 18))
                    .stitchedBorder(cornerRadius: 18)
                }

                Text("what should I make with my fabric?")
                    .font(Quicksand.bold(20))
                    .foregroundStyle(Palette.ink)
                    .padding(.top, 4)

                DoodlePlaceholder(label: "fabric camera CTA\n(coming with suggestion engine)", height: 110)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
    }
}
