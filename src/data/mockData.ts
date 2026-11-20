export const candidate = 'Ana Martins'
export const recruiter = 'Marta Silva'
export const company = 'Horizonte'
export const vacancy = 'People Experience Specialist'
export const values = ['Confiança', 'Inclusão', 'Transparência', 'Colaboração', 'Aprendizagem contínua']

export const missions = [
  {
    id: 'culture', title: 'Exploradora da Cultura', subtitle: 'Conhece os valores da Horizonte.',
    body: 'Na Horizonte, trabalhamos em tecnologia e serviços. Praticamos a confiança ao partilhar contexto, a inclusão ao ouvir perspetivas diferentes e a transparência ao explicar as nossas decisões. Colaboramos entre equipas e reservamos tempo para aprender continuamente.',
    achievement: 'Cultura descoberta',
  },
  {
    id: 'role', title: 'Conhece a Função', subtitle: 'Descobre as responsabilidades da vaga.',
    body: 'Como People Experience Specialist, vais acompanhar a integração de novos colegas, recolher feedback sobre a experiência das equipas e ajudar a melhorar processos como a comunicação interna e o desenvolvimento profissional.',
    achievement: 'Função explorada',
  },
  {
    id: 'prepare', title: 'Prepara a Conversa', subtitle: 'Consulta sugestões para a entrevista.',
    body: 'Escolhe um exemplo de um projeto em que melhoraste a experiência de uma equipa. Prepara o contexto, a tua contribuição e o resultado. Reserva também duas perguntas que gostarias de fazer à Marta.',
    achievement: 'Conversa preparada',
  },
] as const

export type MissionId = (typeof missions)[number]['id']
export const missionPoints = 50

export const slots = [
  { id: '24-am', day: '24', weekday: 'Terça-feira', time: '10h00' },
  { id: '24-pm', day: '24', weekday: 'Terça-feira', time: '15h00' },
  { id: '25-am', day: '25', weekday: 'Quarta-feira', time: '11h00' },
] as const
export type SlotId = (typeof slots)[number]['id']

export function slotLabel(id: SlotId) {
  const slot = slots.find((item) => item.id === id)!
  return `${slot.day} de novembro de 2026, às ${slot.time}`
}

export function dateLabel(date: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Lisbon',
  }).format(new Date(date))
}

// Minutos ilustrativos por resposta e por operação administrativa, respetivamente.
export const estimatedMinutes = { answer: 2, booking: 5 }

export const companyIntroduction = 'A Horizonte é uma empresa fictícia de tecnologia e serviços. As equipas colaboram em projetos digitais e procuram melhorar continuamente a forma como trabalham. A área de People Experience apoia a integração, a comunicação interna e o desenvolvimento das pessoas.'

export const recruitmentTeam = [
  { name: recruiter, initials: 'MS', role: 'Talent Acquisition Specialist', description: 'Acompanha a candidatura e conduz a entrevista online.' },
  { name: 'Inês Costa', initials: 'IC', role: 'People Experience Lead', description: 'Representa a equipa da vaga e ajuda a esclarecer dúvidas sobre a função.' },
]

export function passedAllMissions(passed: readonly MissionId[]) {
  return missions.every(({ id }) => passed.includes(id))
}
