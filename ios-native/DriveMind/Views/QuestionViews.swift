// Author: Flenym — Liquid Glass Q&A
import SwiftUI

enum RunnerMode { case ticket(String), marathon, mistakes, smart(Int?), exam }

struct TicketsView: View {
    @EnvironmentObject var store: AppStore
    var tickets: [String] { Array(Set(store.questions.map{ $0.ticketId })).sorted() }
    var body: some View {
        ZStack { GlassBackground()
            List {
                ForEach(Array(tickets.enumerated()), id: \.element) { idx, t in
                    NavigationLink { QuestionRunnerView(mode:.ticket(t)) } label: {
                        HStack(spacing: 12) {
                            Text(String(format:"%02d", idx+1)).font(.headline).foregroundStyle(.white.opacity(0.35)).frame(width: 36)
                            VStack(alignment:.leading, spacing:2){ Text(t).bold().foregroundStyle(.white); Text("\(store.questions.filter{$0.ticketId==t}.count) вопросов").font(.caption).foregroundStyle(.white.opacity(0.6)) }
                            Spacer(); Image(systemName:"chevron.right").foregroundStyle(.white.opacity(0.35))
                        }.padding(14).glassCard()
                    }.listRowInsets(EdgeInsets(top:6, leading:16, bottom:6, trailing:16)).listRowBackground(Color.clear).listRowSeparator(.hidden)
                }
            }.listStyle(.plain).scrollContentBackground(.hidden)
        }.navigationTitle("Билеты").toolbarBackground(.ultraThinMaterial, for: .navigationBar)
    }
}

struct QuestionRunnerView: View {
    @EnvironmentObject var store: AppStore
    let mode: RunnerMode
    @State private var queue: [Question] = []
    @State private var idx = 0
    @State private var done = false
    @State private var correct = 0
    var body: some View {
        ZStack { GlassBackground()
            Group {
                if queue.isEmpty { ProgressView().task { build() } }
                else if done { VStack(spacing: 10){ Text("Готово — кайф! 🎉").font(.title2).bold().foregroundStyle(.white); Text("Правильно \(correct)/\(queue.count)").foregroundStyle(.white.opacity(0.7)) }.frame(maxWidth:.infinity,maxHeight:.infinity) }
                else { QuestionView(question: queue[idx], index: idx, total: queue.count) { selected in
                    let q = queue[idx]; let ok = isAnswerCorrect(correct: q.correctAnswerIds, selected: selected)
                    if ok { correct += 1 }; store.recordAnswer(questionId: q.id, selected: selected, isCorrect: ok)
                    if idx+1 >= queue.count { done = true } else { idx += 1 }
                }}
            }
        }.navigationTitle("Вопрос")
    }
    func build(){ switch mode {
    case .ticket(let t): queue = store.questions.filter{$0.ticketId==t}.sorted{$0.questionNumber < $1.questionNumber}
    case .marathon: queue = store.questions
    case .mistakes: let bad = Set(store.stats.filter{$0.value.lastAnswerCorrect==false || $0.value.incorrect>0}.map{$0.key}); queue = store.questions.filter{bad.contains($0.id)}
    case .smart(let m): let limit = m==5 ? 10 : m==10 ? 20 : m==15 ? 30 : 40; queue = pickQuestions(questions: store.questions, stats: store.stats, limit: limit)
    case .exam: queue = Array(store.questions.prefix(20))
    }}
}

struct QuestionView: View {
    let question: Question; let index: Int; let total: Int; var onAnswer: ([String])->Void
    @State private var selected: Set<String> = []
    @State private var revealed = false
    private var multi: Bool { question.correctAnswerIds.count > 1 }
    private var correct: Bool { Set(question.correctAnswerIds) == selected }
    var body: some View {
        ScrollView {
            VStack(alignment:.leading, spacing:12){
                HStack{ Text("\(question.ticketId) · вопрос \(question.questionNumber)").font(.caption.weight(.semibold)).foregroundStyle(.white.opacity(0.6)); Spacer(); Text("\(index+1)/\(total)").font(.caption.weight(.black)).foregroundStyle(.white) }
                ProgressView(value: Double(index+1)/Double(total)).tint(Color.dmGreen)
                VStack(alignment:.leading, spacing:10){
                    if let img = question.imagePath, let url = URL(string: img) { AsyncImage(url:url){$0.resizable().scaledToFit().clipShape(RoundedRectangle(cornerRadius:14))} placeholder:{ Color.white.opacity(0.06).frame(height:180).clipShape(RoundedRectangle(cornerRadius:14)) } }
                    Text(question.text).font(.title3.weight(.heavy)).foregroundStyle(.white)
                    Text(multi ? "Можно несколько ответов" : "Выбери один").font(.caption.weight(.semibold)).foregroundStyle(.white.opacity(0.55))
                }.padding(14).glassCard()
                ForEach(question.answers, id:\.id){ a in
                    let sel = selected.contains(a.id); let isCorrect = revealed && question.correctAnswerIds.contains(a.id); let isWrong = revealed && sel && !question.correctAnswerIds.contains(a.id)
                    Button{ guard !revealed else { return }; if multi { if sel {selected.remove(a.id)} else {selected.insert(a.id)} } else { selected=[a.id] } } label:{
                        HStack{ Text(a.text).foregroundStyle(.white).multilineTextAlignment(.leading).font(.subheadline.weight(.semibold)); Spacer()
                            if !revealed && sel { Image(systemName:"checkmark.circle.fill").foregroundStyle(Color.dmGreen) }
                            if revealed && isCorrect { Image(systemName:"checkmark.circle.fill").foregroundStyle(Color.dmGreen) }
                            if revealed && isWrong { Image(systemName:"xmark.circle.fill").foregroundStyle(.red) }
                        }.padding(14).background(isCorrect ? Color.dmGreen.opacity(0.18) : isWrong ? Color.red.opacity(0.16) : sel ? Color.white.opacity(0.1) : Color.clear, in: RoundedRectangle(cornerRadius: 16)).overlay(RoundedRectangle(cornerRadius:16).stroke(isCorrect ? Color.dmGreen : isWrong ? Color.red.opacity(0.7) : Color.white.opacity(0.12), lineWidth: 1))
                    }.buttonStyle(.plain)
                }
                if !revealed { Button{ revealed=true } label:{ Text("Ответить").bold().frame(maxWidth:.infinity).padding(.vertical,14).background(selected.isEmpty ? Color.white.opacity(0.12) : Color.dmGreen, in: Capsule()).foregroundStyle(.white) }.disabled(selected.isEmpty) }
                else {
                    VStack(spacing:10){
                        Text(correct ? "Верно — кайф! ✨" : "Неверно — запомним 💪").bold().foregroundStyle(correct ? Color.dmGreen : Color.red)
                        if let exp = question.explanation { Text(exp).font(.callout).foregroundStyle(.white.opacity(0.9)).padding(12).background(.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 12)) }
                        Button{ onAnswer(Array(selected)); selected=[]; revealed=false } label:{ Text(index+1>=total ? "Завершить" : "Далее →").bold().frame(maxWidth:.infinity).padding(.vertical,14).background(Color.dmGreen, in: Capsule()).foregroundStyle(.white) }
                    }.padding(14).glassCard(glow: correct ? Color.dmGreen : Color.red)
                }
            }.padding(16)
        }.background(Color.clear)
    }
}

struct SmartTrainingView: View {
    var body: some View {
        ZStack{ GlassBackground()
            ScrollView{ VStack(spacing:12){
                ForEach([(5,"5 минут","~10 вопросов"),(10,"10 минут","~20"),(15,"15 минут","~30"),(20,"20 минут","~40")], id:\.0){ o in NavigationLink{ QuestionRunnerView(mode:.smart(o.0)) } label:{ HStack{ VStack(alignment:.leading){ Text(o.1).bold().foregroundStyle(.white); Text(o.2).font(.caption).foregroundStyle(.white.opacity(0.6))}; Spacer(); Image(systemName:"chevron.right").foregroundStyle(.white.opacity(0.4))}.padding(16).glassCard()}}
                NavigationLink{ QuestionRunnerView(mode:.smart(nil)) } label:{ HStack{ Text("Без ограничения ♾️").bold().foregroundStyle(Color.dmGreen); Spacer(); Image(systemName:"infinity").foregroundStyle(Color.dmGreen)}.padding(16).glassCard(glow: Color.dmGreen)}
            }.padding(16)}
        }.navigationTitle("Умная тренировка")
    }
}
struct MistakesView: View {
    @EnvironmentObject var store: AppStore
    var bad: [Question]{ let ids = Set(store.stats.filter{$0.value.lastAnswerCorrect==false || $0.value.incorrect>0}.map{$0.key}); return store.questions.filter{ids.contains($0.id)} }
    var body: some View{ ZStack{ GlassBackground()
        List{ ForEach(bad){ q in VStack(alignment:.leading, spacing:4){ Text(String(q.text.prefix(90))).foregroundStyle(.white).font(.subheadline.weight(.semibold)); Text("\(q.ticketId) #\(q.questionNumber)").font(.caption).foregroundStyle(.white.opacity(0.5)) }.padding(12).glassCard().listRowInsets(EdgeInsets(top:6,leading:16,bottom:6,trailing:16)).listRowBackground(Color.clear).listRowSeparator(.hidden) } }.listStyle(.plain).scrollContentBackground(.hidden)
    }.navigationTitle("Ошибки — \(bad.count)").toolbar{ if !bad.isEmpty { NavigationLink("Повторить"){ QuestionRunnerView(mode:.mistakes) } } } }
}
struct StatsView: View { @EnvironmentObject var store: AppStore
    var body: some View{ ZStack{ GlassBackground()
        List{ Section{ Text("Всего: \(store.questions.count)").foregroundStyle(.white); Text("Освоено: \(store.stats.values.filter{$0.masteryLevel=="mastered"}.count)").foregroundStyle(Color.dmGreen) } header:{ Text("Прогресс").foregroundStyle(.white.opacity(0.6)) } }.scrollContentBackground(.hidden)
    }.navigationTitle("Статистика") }
}
struct TheoryView: View {
    var body: some View{ ZStack{ GlassBackground()
        List{ ForEach(["Дорожные знаки","Разметка","Светофор","Перекрёстки","Скорость"], id:\.self){ t in Text(t).foregroundStyle(.white).padding(12).glassCard().listRowBackground(Color.clear).listRowSeparator(.hidden).listRowInsets(EdgeInsets(top:6,leading:16,bottom:6,trailing:16)) } }.listStyle(.plain).scrollContentBackground(.hidden)
    }.navigationTitle("Теория") }
}
struct SettingsView: View {
    var body: some View{ ZStack{ GlassBackground()
        List{ Section{ Text("DRIVE MIND v1.0.0").foregroundStyle(.white); Text("Автор и владелец: Flenym").foregroundStyle(.white.opacity(0.6)) } header:{ Text("О приложении").foregroundStyle(.white.opacity(0.6)) }
            Section{ Text("Демо-набор 12 вопросов. Импорт — manifest.json").foregroundStyle(.white.opacity(0.7)) } header:{ Text("База").foregroundStyle(.white.opacity(0.6)) }
        }.scrollContentBackground(.hidden)
    }.navigationTitle("Настройки") }
}
