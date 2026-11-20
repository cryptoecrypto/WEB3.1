import test from "node:test";
import assert from "node:assert/strict";
import { gradeAssessment, diplomaEligible } from "../src/assessment.js";

const bank = [
  { id: "q1", correct_option: "a" },
  { id: "q2", correct_option: "b" },
  { id: "q3", correct_option: "c" }
];

test("nota máxima exige todas as respostas corretas", () => {
  assert.deepEqual(gradeAssessment(bank, { q1: "a", q2: "b", q3: "c" }), {
    total: 3, correct: 3, score: 10, passed: true
  });
  assert.equal(gradeAssessment(bank, { q1: "a", q2: "b", q3: "x" }).score, 6.67);
});

test("diploma exige todas as unidades e nota exatamente 10", () => {
  assert.equal(diplomaEligible({ completedLessons: 5, totalLessons: 5, score: 10 }), true);
  assert.equal(diplomaEligible({ completedLessons: 4, totalLessons: 5, score: 10 }), false);
  assert.equal(diplomaEligible({ completedLessons: 5, totalLessons: 5, score: 9.99 }), false);
});
