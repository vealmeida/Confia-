import { values } from '../data/mockData'

export const greeting = 'Olá, Ana! Sou o teu Candidate Concierge. Estou aqui para te acompanhar durante a candidatura, esclarecer dúvidas e ajudar com os próximos passos. Se precisares, também posso facilitar uma conversa com a nossa equipa de recrutamento.'
export const humanReply = 'Claro, Ana. Vou encaminhar o teu pedido para a Marta, da equipa de recrutamento. É importante que possas falar com uma pessoa sempre que precisares.'
export const unknownReply = 'Não tenho informação suficiente para responder com segurança. Queres que encaminhe esta questão para a Marta?'

export const suggestions = [
  'Em que fase está a minha candidatura?',
  'Como funciona a entrevista?',
  'Quais são os valores da empresa?',
  'Como posso agendar a entrevista?',
  'Quero falar com um recrutador.',
]

export function normalize(value: string) {
  return value.toLocaleLowerCase('pt-PT').normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ').trim()
}

const humanIntent = /\b(?:ajuda humana|contacto humano|apoio humano|atendimento humano)\b|\b(?:falar|conversar|esclarecer|contactar|contacto|encaminhar|ligar)\b.*\b(?:pessoa|recrutador(?:a)?|marta|humano|equipa de recrutamento)\b|\b(?:marta|recrutador(?:a)?)\b.*\b(?:contactar|ligar)\b/

const unavailable = /\b(salario|remuneracao|ordenado|subsidio|beneficios|morada|sede|contrato|ferias|resultado|email pessoal|nacionalidade)\b/

const answers = [
  { pattern: /\b(privacidade|rgpd|dados|localstorage)\b/, text: 'Os dados da demonstração ficam no teu navegador. Podes apagá-los ao reiniciar a demonstração. Escreve apenas exemplos fictícios.' },
  { pattern: /\b(alterar|remarcar|reagendar|cancelar|mudar|outro horario)\b.*\b(entrevista|hora|horario|marcacao)\b|\b(remarcar|reagendar|outro horario)\b/, text: 'Abre a área de agendamento para escolher outro horário ou cancelar a entrevista. O painel da Marta é atualizado de imediato.', schedule: true },
  { pattern: /\b(agendar|agendamento|marcar|horarios|disponibilidade|marcacao)\b/, text: 'Podes consultar os horários fictícios e confirmar a tua escolha na área de agendamento.', schedule: true },
  { pattern: /\b(fase|estado|situacao|progresso|ponto de situacao|como esta)\b/, text: 'A tua candidatura foi recebida.' , status: true },
  { pattern: /\b(etapas|fases|processo de recrutamento|proximos passos)\b/, text: 'A jornada começa com a receção da candidatura. Seguem-se a descoberta da Horizonte, os testes das missões, a entrevista com a Marta e o feedback da equipa.' },
  { pattern: /\b(funcao|responsabilidades|vaga|tarefas|cargo)\b/, text: 'A função de People Experience Specialist envolve melhorar a integração, recolher feedback das equipas e facilitar iniciativas de experiência das pessoas.' },
  { pattern: /\b(cultura|valores|horizonte|organizacao)\b/, text: `Os valores da Horizonte são ${values.join(', ')}. A empresa atua no setor de tecnologia e serviços.` },
  { pattern: /\b(entrevista|preparar|preparacao|dicas|conversa)\b/, text: 'A entrevista é online, dura 30 minutos e será conduzida pela Marta Silva. Terás espaço para partilhar exemplos do teu percurso, conhecer a função e colocar as tuas perguntas.', schedule: true, introduction: true },
]

export function respond(message: string, bookedDate?: string, eligible = false) {
  const nextStep = eligible
    ? 'Podes escolher um horário para conversar com a Marta.'
    : 'Passa nos testes das três missões para desbloquear o agendamento.'
  const input = normalize(message)
  if (humanIntent.test(input)) return { kind: 'human' as const, text: humanReply }
  if (unavailable.test(input)) return { kind: 'unknown' as const, text: unknownReply }
  const answer = answers.find(({ pattern }) => pattern.test(input))
  if (!answer) return { kind: 'unknown' as const, text: unknownReply }
  const text = answer.status
    ? bookedDate
      ? `A tua entrevista está agendada para ${bookedDate}.`
      : `A tua candidatura foi recebida. ${nextStep}`
    : answer.schedule && !eligible && !bookedDate
      ? answer.introduction
        ? `${answer.text} ${nextStep}`
        : nextStep
      : answer.text
  return { kind: 'answer' as const, text, schedule: answer.schedule }
}
