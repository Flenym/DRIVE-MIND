// Author: Flenym — Liquid Glass
import SwiftUI

struct RootView: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        Group {
            if !store.isReady { ProgressView().tint(.green) }
            else {
                TabView {
                    HomeView().tabItem { Label("Главная", systemImage: "sparkles") }
                    TicketsView().tabItem { Label("Билеты", systemImage: "rectangle.stack") }
                    StatsView().tabItem { Label("Статистика", systemImage: "chart.bar.fill") }
                    SettingsView().tabItem { Label("Настройки", systemImage: "gearshape.fill") }
                }
                .tint(Color.dmGreen)
                .toolbarBackground(.ultraThinMaterial, for: .tabBar)
            }
        }
    }
}

struct HomeView: View {
    @EnvironmentObject var store: AppStore
    var mastered: Int { store.stats.values.filter{ $0.masteryLevel=="mastered" }.count }
    var total: Int { store.questions.count }
    var pct: Int { total==0 ? 0 : Int(Double(mastered)/Double(total)*100) }
    var body: some View {
        NavigationStack {
            ZStack { GlassBackground()
                ScrollView {
                    VStack(spacing: 14) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("DRIVE MIND").font(.system(size: 34, weight: .black, design: .rounded)).foregroundStyle(.white)
                            Text("Тренажёр ПДД · категория B · офлайн").foregroundStyle(.white.opacity(0.68)).font(.subheadline.weight(.semibold))
                            Text("by Flenym").font(.caption2).foregroundStyle(.white.opacity(0.45)).tracking(1)
                        }.frame(maxWidth: .infinity, alignment: .leading)

                        HStack(spacing: 14) {
                            ZStack {
                                Circle().fill(.ultraThinMaterial).frame(width: 118, height: 118).overlay(Circle().stroke(Color.dmGreen.opacity(0.9), lineWidth: 4))
                                VStack(spacing: 2) { Text("\(pct)%").font(.title2).bold().foregroundStyle(.white); Text("\(mastered)/\(total)").font(.caption).foregroundStyle(.white.opacity(0.8)); Text("освоено").font(.caption2).foregroundStyle(.white.opacity(0.55)) }
                            }
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Прогресс").bold().foregroundStyle(.white)
                                Label("Освоено \(mastered) · \(pct)%", systemImage: "checkmark.circle.fill").foregroundStyle(Color.dmGreen).font(.caption.weight(.semibold))
                                Label("На повторении \(store.stats.values.filter{ $0.masteryLevel != "mastered" && $0.attempts>0 }.count)", systemImage: "clock.fill").foregroundStyle(.orange).font(.caption.weight(.semibold))
                                Label("Новые \(max(0, total - store.stats.count))", systemImage: "sparkle").foregroundStyle(.white.opacity(0.55)).font(.caption.weight(.semibold))
                                ProgressView(value: Double(pct)/100).tint(Color.dmGreen).scaleEffect(x:1, y:1.4, anchor: .center)
                            }.frame(maxWidth: .infinity, alignment: .leading)
                        }.padding(14).glassCard(glow: Color.dmGreen)

                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                            NavigationLink { SmartTrainingView() } label: { GradientTile(icon:"⚡", title:"Умная", sub:"FSRS подбор", colors:[Color.dmViolet, Color.dmCyan]) }
                            NavigationLink { TicketsView() } label: { GradientTile(icon:"🎯", title:"Билеты", sub:"\(total) вопросов", colors:[Color.dmCyan, Color.dmGreen]) }
                            NavigationLink { QuestionRunnerView(mode:.marathon) } label: { GradientTile(icon:"🏁", title:"Марафон \(total)", sub:"Весь пул", colors:[Color.dmGreen, Color(red:0.52,green:0.8,blue:0.08)]) }
                            NavigationLink { QuestionRunnerView(mode:.exam) } label: { GradientTile(icon:"🧪", title:"Экзамен", sub:"20 вопросов", colors:[.orange, .red]) }
                            NavigationLink { MistakesView() } label: { GradientTile(icon:"🔁", title:"Ошибки", sub:"Над ошибками", colors:[.red, Color.dmViolet]) }
                            NavigationLink { TheoryView() } label: { GradientTile(icon:"📚", title:"Теория", sub:"ПДД по темам", colors:[Color(red:0.05,green:0.65,blue:0.91), Color(red:0.39,green:0.4,blue:0.95)]) }
                        }
                        NavigationLink { StatsView() } label: { Text("Статистика →").font(.subheadline.weight(.bold)).foregroundStyle(.white.opacity(0.62)) }.padding(.top, 4)
                    }.padding(16).padding(.bottom, 8)
                }
            }.navigationTitle("DRIVE MIND").navigationBarTitleDisplayMode(.inline).toolbarBackground(.ultraThinMaterial, for: .navigationBar)
        }
    }
}
