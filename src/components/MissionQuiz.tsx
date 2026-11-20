import { useState } from 'react'
import { gradeMission, missionQuizzes, requiredCorrectAnswers } from '../data/missionQuizzes'
import type { MissionId } from '../data/mockData'

export function MissionQuiz({ mission, onPass }: { mission: MissionId; onPass: (answers: number[]) => void }) {
  const questions = missionQuizzes[mission]
  const [answers, setAnswers] = useState<Array<number | undefined>>(() => questions.map(() => undefined))
  const [score, setScore] = useState<number>()

  return <form className="mission-quiz" onSubmit={(event) => {
    event.preventDefault()
    const result = gradeMission(mission, answers)
    if (result === undefined) return
    if (result >= requiredCorrectAnswers) {
      onPass(answers.filter((answer): answer is number => answer !== undefined))
    } else {
      setScore(result)
    }
  }}>
    <h3>Teste de conhecimentos</h3>
    <p>Acerta em pelo menos {requiredCorrectAnswers} de {questions.length} perguntas para concluir esta missão.</p>
    {questions.map(({ prompt, options }, questionIndex) => <fieldset className="quiz-question" key={prompt}>
      <legend>{prompt}</legend>
      {options.map((option, optionIndex) => <label key={option}>
        <input type="radio" name={`quiz-${mission}-${questionIndex}`} required
          checked={answers[questionIndex] === optionIndex} onChange={() => {
            setAnswers(answers.map((answer, index) => index === questionIndex ? optionIndex : answer))
          }} />
        {option}
      </label>)}
    </fieldset>)}
    <p className="quiz-result" role="status">
      {score !== undefined && `Respostas certas na última tentativa: ${score} de ${questions.length}. Revê o conteúdo e tenta novamente.`}
    </p>
    <button className="button primary" disabled={answers.includes(undefined)}>Verificar respostas</button>
  </form>
}
