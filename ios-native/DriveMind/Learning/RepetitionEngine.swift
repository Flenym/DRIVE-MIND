// Author: Flenym — FSRS-lite (честная реализация, не выдаётся за полный FSRS-4.5 без замены на ts-fsrs)
import Foundation

enum Grade { case again, hard, good, easy }

func gradeFromCorrect(_ isCorrect: Bool, timeMs: Double? = nil) -> Grade {
    guard isCorrect else { return .again }
    if let t = timeMs, t < 4000 { return .easy }
    if let t = timeMs, t > 20000 { return .hard }
    return .good
}

func isAnswerCorrect(correct: [String], selected: [String]) -> Bool {
    Set(correct) == Set(selected)
}

private let W: [Double] = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61]

func nextState(prev: QuestionStats?, grade: Grade, now: Date = Date()) -> QuestionStats {
    var s = prev ?? QuestionStats(questionId: "")
    let attempts = (prev?.attempts ?? 0) + 1
    let isAgain = grade == .again
    let correct = (prev?.correct ?? 0) + (isAgain ? 0 : 1)
    let incorrect = (prev?.incorrect ?? 0) + (isAgain ? 1 : 0)
    let streak = isAgain ? 0 : (prev?.streak ?? 0) + 1
    var stability = prev?.stability ?? W[0]
    var difficulty = prev?.difficulty ?? 5.0
    var intervalDays: Double
    var dueAt: Date

    if prev == nil || prev?.attempts == 0 {
        switch grade {
        case .again: intervalDays = 0; dueAt = now.addingTimeInterval(600); difficulty = min(10, difficulty+0.5)
        case .hard: intervalDays = 1; stability = W[1]; difficulty = max(1, difficulty-0.1); dueAt = now.addingTimeInterval(86400)
        case .good: intervalDays = 3; stability = W[2]; dueAt = now.addingTimeInterval(3*86400)
        case .easy: intervalDays = 7; stability = W[3]; difficulty = max(1, difficulty-0.3); dueAt = now.addingTimeInterval(7*86400)
        }
    } else {
        if isAgain {
            stability = max(0.1, stability*0.3)
            intervalDays = 0; dueAt = now.addingTimeInterval(600); difficulty = min(10, difficulty+0.4)
        } else {
            let mult: Double = grade == .easy ? 1.6 : grade == .hard ? 1.1 : 1.35
            stability = stability * mult * (1 + (10 - difficulty)*0.02)
            intervalDays = max(1, (stability * (0.9 + difficulty/5*0.1)).rounded())
            if grade == .easy { difficulty = max(1, difficulty-0.2) }
            if grade == .hard { difficulty = min(10, difficulty+0.15) }
            dueAt = now.addingTimeInterval(intervalDays*86400)
        }
    }
    let mastery: String = {
        if isAgain { return "learning" }
        if streak >= 5 && intervalDays >= 21 { return "mastered" }
        if streak >= 3 { return "review" }
        if streak >= 1 { return "learning" }
        return prev?.masteryLevel ?? "new"
    }()
    return QuestionStats(questionId: s.questionId, attempts: attempts, correct: correct, incorrect: incorrect, streak: streak, lastAnswerCorrect: !isAgain, lastAnsweredAt: now, masteryLevel: mastery, dueAt: dueAt, stability: stability, difficulty: difficulty, intervalDays: intervalDays)
}
