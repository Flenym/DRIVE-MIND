// Author: Flenym
import XCTest
@testable import DriveMind

final class RepetitionTests: XCTestCase {
    func testCorrect() { XCTAssertTrue(isAnswerCorrect(correct: ["a"], selected: ["a"])) }
    func testWrong() { XCTAssertFalse(isAnswerCorrect(correct: ["a"], selected: ["b"])) }
    func testMulti() { XCTAssertTrue(isAnswerCorrect(correct: ["a","b"], selected: ["b","a"])) }
    func testAgainResets() {
        var s = QuestionStats(questionId: "q", attempts: 2, correct: 2, incorrect: 0, streak: 2, lastAnswerCorrect: true, masteryLevel: "review", stability: 3, difficulty: 5)
        let n = nextState(prev: s, grade: .again)
        XCTAssertEqual(n.streak, 0); XCTAssertEqual(n.masteryLevel, "learning")
    }
}
