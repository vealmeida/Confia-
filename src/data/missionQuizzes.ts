import type { MissionId } from './mockData'

type Question = {
  prompt: string
  options: readonly [string, string, string]
  correct: number
}

export const requiredCorrectAnswers = 2

export const missionQuizzes: Record<MissionId, readonly [Question, Question, Question]> = {
  culture: [
    { prompt: 'Em que setor atua a Horizonte?', options: ['Saúde e investigação', 'Tecnologia e serviços', 'Turismo e hotelaria'], correct: 1 },
    { prompt: 'Como é que a Horizonte põe a inclusão em prática?', options: ['Ouvindo perspetivas diferentes', 'Reservando decisões a uma só equipa', 'Pedindo que todos pensem da mesma forma'], correct: 0 },
    { prompt: 'Que prática exemplifica a transparência na Horizonte?', options: ['Partilhar só os resultados positivos', 'Limitar a informação às chefias', 'Explicar as decisões'], correct: 2 },
  ],
  role: [
    { prompt: 'Que tarefa faz parte desta função?', options: ['Gerir contratos com fornecedores', 'Planear campanhas de publicidade', 'Acompanhar a integração de novos colegas'], correct: 2 },
    { prompt: 'Que tipo de feedback vais recolher?', options: ['Feedback sobre a experiência das equipas', 'Avaliações de produtos por clientes', 'Opiniões sobre preços de concorrentes'], correct: 0 },
    { prompt: 'Que processo podes ajudar a melhorar?', options: ['A manutenção de equipamentos', 'A comunicação interna', 'A distribuição de encomendas'], correct: 1 },
  ],
  prepare: [
    { prompt: 'Que exemplo é sugerido para a entrevista?', options: ['Uma lista das ferramentas que usas', 'Um projeto em que melhoraste a experiência de uma equipa', 'Um resumo da história da Horizonte'], correct: 1 },
    { prompt: 'Que estrutura podes usar para contar esse exemplo?', options: ['Contexto, contribuição e resultado', 'Objetivo, orçamento e cronograma', 'Data, local e lista de participantes'], correct: 0 },
    { prompt: 'Quantas perguntas sugere a missão que prepares para a Marta?', options: ['Cinco perguntas', 'Uma pergunta', 'Duas perguntas'], correct: 2 },
  ],
}

export function gradeMission(mission: MissionId, answers: ReadonlyArray<number | undefined>) {
  const questions = missionQuizzes[mission]
  if (answers.length !== questions.length || !questions.every(({ options }, i) => {
    const answer = answers[i]
    return answer !== undefined && Number.isInteger(answer) && answer >= 0 && answer < options.length
  })) return undefined

  return questions.filter(({ correct }, index) => answers[index] === correct).length
}
