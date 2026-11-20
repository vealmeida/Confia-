import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { AppProvider, initialState, reducer, storageKey } from './context/AppContext'
import { missions } from './data/mockData'
import type { MissionId } from './data/mockData'
import { missionQuizzes } from './data/missionQuizzes'
import { humanReply, respond, unknownReply } from './services/conciergeEngine'

function start() {
  return render(<AppProvider><App /></AppProvider>)
}

const button = (name: string | RegExp) => screen.getByRole('button', { name })

async function fillQuiz(user: ReturnType<typeof userEvent.setup>, mission: MissionId, answers: number[]) {
  for (const [index, question] of missionQuizzes[mission].entries()) {
    await user.click(within(screen.getByRole('dialog')).getByRole('radio', { name: question.options[answers[index]] }))
  }
  await user.click(button('Verificar respostas'))
}

function seedPassedMissions() {
  localStorage.setItem(storageKey, JSON.stringify({
    ...initialState(), passedMissions: missions.map(({ id }) => id),
  }))
}

describe('Jornada e estado local', () => {
  it('atribui 50 pontos uma única vez e recupera o progresso ao recarregar', async () => {
    const user = userEvent.setup()
    const app = start()
    await user.click(button('Entrar como candidato'))
    const progress = screen.getByRole('progressbar', { name: 'Progresso da jornada' })
    expect(progress).toHaveAttribute('value', '25')
    await user.click(button(/Exploradora da Cultura/))
    expect(button('Verificar respostas')).toBeDisabled()
    await fillQuiz(user, 'culture', [0, 1, 2])
    expect(screen.getByText(/Respostas certas na última tentativa: 1 de 3/)).toBeVisible()
    expect(screen.getByText(/^0$/)).toBeVisible()
    expect(progress).toHaveAttribute('value', '25')
    await fillQuiz(user, 'culture', [1, 0, 0])
    expect(screen.getByText(/^50$/)).toBeVisible()
    expect(screen.getByText('Cultura descoberta')).toBeVisible()
    expect(progress).toHaveAttribute('value', '50')
    await user.click(button(/Exploradora da Cultura/))
    expect(screen.queryByRole('button', { name: 'Verificar respostas' })).toBeNull()
    await user.click(button('Fechar'))
    app.unmount()
    start()
    expect(screen.getByRole('heading', { name: 'Olá, Ana!' })).toBeVisible()
    expect(screen.getByText(/^50$/)).toBeVisible()
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '50')
  })

  it('reinicia todos os dados após confirmação', async () => {
    seedPassedMissions()
    const user = userEvent.setup()
    start()
    await user.click(button('Entrar como candidato'))
    await user.click(button('Concierge'))
    await user.click(button('Quero falar com um recrutador.'))
    expect(screen.getByText(humanReply)).toBeVisible()
    await user.click(button('Agendamento'))
    await user.click(screen.getByRole('radio', { name: /10h00/ }))
    await user.click(button('Confirmar agendamento'))
    await user.click(button('Reiniciar demonstração'))
    await user.click(button('Voltar'))
    expect(screen.getByRole('heading', { name: 'Entrevista agendada com sucesso!' })).toBeVisible()
    await user.click(button('Reiniciar demonstração'))
    await user.click(button('Confirmar reinício'))
    expect(button('Entrar como candidato')).toBeVisible()
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual(initialState())
  })
})

describe('Concierge e Momentos Humanos', () => {
  it.each([
    ['EM QUE FÁSE está a minha candidatura?', /recebida/],
    ['Quais são as etapas?', /receção da candidatura/],
    ['Quais são as responsabilidades do cargo?', /integração/],
    ['Que valores tem a Horizonte?', /Inclusão/],
    ['Como funciona a entrevista?', /30 minutos/],
    ['Posso agendar a entrevista?', /desbloquear o agendamento/],
    ['Quero remarcar', /desbloquear o agendamento/],
    ['Como usam os meus dados?', /navegador/],
  ])('reconhece %s', (question, reply) => {
    expect(respond(question)).toMatchObject({ kind: 'answer', text: expect.stringMatching(reply) })
  })

  it.each([
    'Quero falar com uma pessoa.',
    'Preciso de ajuda humana.',
    'Gostava de esclarecer uma questão com a Marta.',
    'Gostava de falar com a Marta para esclarecer algumas dúvidas.',
  ])('reconhece o pedido explícito «%s»', (text) => {
    expect(respond(text)).toEqual({ kind: 'human', text: humanReply })
  })

  it('reconhece a limitação e só encaminha uma dúvida desconhecida após confirmação', async () => {
    const user = userEvent.setup()
    start()
    await user.click(button('Entrar como candidato'))
    await user.click(button('Concierge'))
    const input = screen.getByRole('textbox', { name: 'A tua mensagem' })
    await user.type(input, 'Qual é o salário da vaga?{Enter}')
    expect(screen.getByText(unknownReply)).toBeVisible()
    await user.click(button('Mudar para recrutador'))
    expect(screen.getByText('Ainda não há pedidos de contacto.')).toBeVisible()
    await user.click(button('Mudar para candidato'))
    await user.click(button('Concierge'))
    await user.click(button('Sim, encaminhar'))
    await user.click(button('Mudar para recrutador'))
    expect(screen.getByText('Questão não resolvida', { exact: false })).toBeVisible()
    expect(screen.getByText('Qual é o salário da vaga?')).toBeVisible()
    expect(screen.getByText('1 pendente')).toBeVisible()
  })

  it('evita duplicações e permite à Marta acompanhar e concluir o pedido', async () => {
    const user = userEvent.setup()
    start()
    await user.click(button('Entrar como candidato'))
    await user.click(button('Concierge'))
    await user.click(button('Como funciona a entrevista?'))
    expect(screen.getByText(/a entrevista é online/i)).toBeVisible()
    expect(button('Ir para as missões')).toBeVisible()
    await user.click(button('Quero falar com um recrutador.'))
    await user.click(button('Quero falar com um recrutador.'))
    await user.click(button('Mudar para recrutador'))
    expect(screen.getAllByRole('button', { name: /Abrir pedido/ })).toHaveLength(1)
    expect(screen.getByText('1 pendente')).toBeVisible()
    await user.click(button(/Abrir pedido/))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Marcar como Em acompanhamento' }))
    expect(within(dialog).getByText('Em acompanhamento')).toBeVisible()
    await user.click(within(dialog).getByRole('button', { name: 'Marcar como Concluído' }))
    expect(within(dialog).getByText('Concluído')).toBeVisible()
    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }))
    expect(screen.getByText('0 pendentes')).toBeVisible()
    expect(screen.getByText('Marta concluiu o pedido de contacto da Ana.')).toBeVisible()
  })

  it('ignora alterações de estado de um pedido no perfil de candidato', () => {
    const created = reducer({ ...initialState(), view: 'concierge' }, {
      type: 'chat', id: 'one', at: '2026-11-20T15:00:00Z', text: 'Quero falar com uma pessoa',
    })
    const next = reducer(created, {
      type: 'moment', requestId: 'one', id: 'two', at: '2026-11-20T15:01:00Z', status: 'Concluído',
    })
    expect(next.moments[0].status).toBe('Pendente')
  })
})

describe('Agendamento', () => {
  it('bloqueia novas entrevistas até passar nos três testes e apresenta o progresso no painel', async () => {
    const user = userEvent.setup()
    start()
    expect(screen.getByRole('heading', { name: 'Conhece a Horizonte' })).toBeVisible()
    expect(screen.getByText('Inês Costa')).toBeVisible()
    await user.click(button('Entrar como candidato'))
    await user.click(button('Agendamento'))
    expect(screen.getByRole('heading', { name: 'Agendamento bloqueado' })).toBeVisible()
    expect(screen.queryByRole('radio')).toBeNull()
    await user.click(button('Ir para as missões'))
    for (const mission of missions.slice(0, 2)) {
      await user.click(button(new RegExp(mission.title)))
      await fillQuiz(user, mission.id, missionQuizzes[mission.id].map(({ correct }) => correct))
    }
    await user.click(button('Agendamento'))
    expect(screen.getByText(/Passaste em 2 de 3 testes/)).toBeVisible()
    expect(screen.queryByRole('radio')).toBeNull()
    await user.click(button('Ir para as missões'))
    await user.click(button(/Prepara a Conversa/))
    await fillQuiz(user, 'prepare', [1, 0, 1])
    expect(screen.getByText(/Já podes agendar a entrevista/)).toBeVisible()
    await user.click(button('Agendar entrevista'))
    expect(screen.getByRole('radio', { name: /10h00/ })).toBeVisible()
    await user.click(button('Mudar para recrutador'))
    expect(screen.getByText(/Triagem inicial da Ana · 3 de 3/)).toBeVisible()
  })

  it('impede o agendamento mesmo por ação direta enquanto faltarem testes', () => {
    const state = { ...initialState(), view: 'schedule' as const, passedMissions: ['culture', 'role'] as MissionId[] }
    expect(reducer(state, { type: 'book', slot: '24-am', id: 'test', at: '2026-11-20T15:00:00Z' })).toBe(state)
  })

  it('recupera entrevistas antigas sem dar os testes por concluídos', () => {
    const { passedMissions, ...legacy } = initialState()
    localStorage.setItem(storageKey, JSON.stringify({
      ...legacy, view: 'schedule', completed: ['culture', 'role', 'prepare'],
      interview: { id: 'legacy', slot: '24-am', status: 'Agendada', at: '2026-11-20T15:00:00Z' },
    }))
    start()
    expect(button('Alterar horário')).toBeVisible()
    expect(JSON.parse(localStorage.getItem(storageKey)!).passedMissions).toEqual(passedMissions)
  })

  it('confirma, altera o mesmo registo e cancela com confirmação, refletindo cada estado no painel', async () => {
    seedPassedMissions()
    const user = userEvent.setup()
    start()
    await user.click(button('Entrar como candidato'))
    await user.click(button('Agendamento'))
    expect(button('Confirmar agendamento')).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: /10h00/ }))
    await user.click(button('Confirmar agendamento'))
    expect(screen.getByRole('heading', { name: 'Entrevista agendada com sucesso!' })).toBeVisible()
    const initialId = JSON.parse(localStorage.getItem(storageKey)!).interview.id
    await user.click(button('Mudar para recrutador'))
    expect(screen.getByText('24 de novembro de 2026, às 10h00', { exact: true })).toBeVisible()
    await user.click(button('Mudar para candidato'))
    await user.click(button('Agendamento'))
    await user.click(button('Alterar horário'))
    await user.click(screen.getByRole('radio', { name: /11h00/ }))
    await user.click(button('Confirmar alteração'))
    expect(JSON.parse(localStorage.getItem(storageKey)!).interview.id).toBe(initialId)
    await user.click(button('Mudar para recrutador'))
    expect(screen.getByText('Alterada', { exact: true })).toBeVisible()
    expect(screen.getByText('25 de novembro de 2026, às 11h00', { exact: true })).toBeVisible()
    await user.click(button('Mudar para candidato'))
    await user.click(button('Agendamento'))
    await user.click(button('Cancelar entrevista'))
    await user.click(button('Confirmar cancelamento'))
    expect(screen.getByText('Entrevista anterior cancelada')).toBeVisible()
    await user.click(button('Mudar para recrutador'))
    expect(screen.getByText('Cancelada', { exact: true })).toBeVisible()
  })
})
