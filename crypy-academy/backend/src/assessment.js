export function gradeAssessment(questions, answers) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("PROVA_NAO_CONFIGURADA");
  }
  let correct = 0;
  for (const question of questions) {
    if (answers && answers[question.id] === question.correct_option) correct += 1;
  }
  const score = Number(((correct / questions.length) * 10).toFixed(2));
  return { total: questions.length, correct, score, passed: correct === questions.length && score === 10 };
}

export function diplomaEligible({ completedLessons, totalLessons, score }) {
  return Number.isInteger(completedLessons) &&
    Number.isInteger(totalLessons) &&
    totalLessons > 0 &&
    completedLessons === totalLessons &&
    Number(score) === 10;
}
