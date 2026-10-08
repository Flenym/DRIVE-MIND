// Author: Flenym — Liquid Glass SwiftUI
import SwiftUI

extension Color {
    static let dmBg = Color(red: 0.02, green: 0.02, blue: 0.04)
    static let dmSurface = Color.white.opacity(0.08)
    static let dmBorder = Color.white.opacity(0.10)
    static let dmGreen = Color(red: 0.13, green: 0.77, blue: 0.37)
    static let dmCyan = Color(red: 0.02, green: 0.71, blue: 0.83)
    static let dmViolet = Color(red: 0.54, green: 0.36, blue: 0.96)
}

struct GlassBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(red:0.02,green:0.02,blue:0.03), Color(red:0.04,green:0.04,blue:0.08), Color(red:0.04,green:0.07,blue:0.12)], startPoint: .topLeading, endPoint: .bottomTrailing).ignoresSafeArea()
            Circle().fill(Color.dmViolet.opacity(0.22)).frame(width: 320, height: 320).offset(x:-120, y:-180).blur(radius: 40)
            Circle().fill(Color.dmCyan.opacity(0.18)).frame(width: 260, height: 260).offset(x:140, y:-60).blur(radius: 35)
            Circle().fill(Color.dmGreen.opacity(0.12)).frame(width: 220, height: 220).offset(x:20, y:260).blur(radius: 30)
        }
    }
}

struct GlassCardStyle: ViewModifier {
    var glow: Color? = nil
    func body(content: Content) -> some View {
        content
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.dmBorder, lineWidth: 1))
            .shadow(color: .black.opacity(0.35), radius: 16, y: 8)
            .overlay { if let g = glow { RoundedRectangle(cornerRadius: 20).fill(g.opacity(0.18)).blur(radius: 18).offset(x: 60, y: -40).allowsHitTesting(false) } }
    }
}
extension View { func glassCard(glow: Color? = nil) -> some View { modifier(GlassCardStyle(glow: glow)) } }

struct GradientTile: View {
    let icon: String; let title: String; let sub: String; let colors: [Color]
    var body: some View {
        ZStack {
            LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
            VStack(alignment: .leading, spacing: 6) {
                Text(icon).font(.title2)
                Text(title).font(.headline).bold().foregroundStyle(.white)
                Text(sub).font(.caption).foregroundStyle(.white.opacity(0.85))
            }.frame(maxWidth: .infinity, alignment: .leading).padding(14)
            .background(.black.opacity(0.12))
        }.clipShape(RoundedRectangle(cornerRadius: 20)).overlay(RoundedRectangle(cornerRadius: 20).stroke(.white.opacity(0.14), lineWidth: 1))
    }
}
