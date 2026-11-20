import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { AppProvider, initialState, reducer, storageKey } from './context/AppContext'
import { humanReply, respond, unknownReply } from './services/conciergeEngine'

function start() {
  return render(<AppProvider><App /></AppProvider>)
}

const button = (name: string | RegExp) => screen.getByRole('button', { name })

describe('Jornada e estado local', () => {
  it('atribui 50 pontos uma única vez e recupera o progresso ao recarregar', async () => {
    const user = userEvent.setup()
    const app = start()
    await user.click(button('Entrar como candidato'))
    const progress = screen.getByRole('progressbar', { name: 'Progresso da jornada' })
    expect(progress).toHaveAttribute('value', '25')
    await user.click(button(/Exploradora da Cultura/))
    await user.click(button('Concluir missão'))
    expect(screen.getByText(/^50$/)).toBeVisible()
    expect(screen.getByText('Cultura descoberta')).toBeVisible()
    expect(progress).toHaveAttribute('value', '50')
    await user.click(button(/Exploradora da Cultura/))
    expect(screen.queryByRole('button', { name: 'Concluir missão' })).toBeNull()
    await user.click(button('Fechar'))
    app.unmount()
    start()
    expect(screen.getByRole('heading', { name: 'Olá, Ana!' })).toBeVisible()
    expect(screen.getByText(/^50$/)).toBeVisible()
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '50')
  })

  it('mantém as missões opcionais e reinicia todos os dados após confirmação', async () => {
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
    ['Posso agendar a entrevista?', /horários fictícios/],
    ['Quero remarcar', /outro horário/],
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
    expect(button('Agendar entrevista')).toBeVisible()
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
  it('confirma, altera o mesmo registo e cancela com confirmação, refletindo cada estado no painel', async () => {
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
