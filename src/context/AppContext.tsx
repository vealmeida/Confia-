import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import type { Dispatch, ReactNode } from 'react'
import { candidate, missions, slotLabel, slots, vacancy } from '../data/mockData'
import type { MissionId, SlotId } from '../data/mockData'
import { greeting, humanReply, normalize, respond } from '../services/conciergeEngine'

export type View = 'home' | 'journey' | 'concierge' | 'schedule' | 'recruiter'
export type RequestStatus = 'Pendente' | 'Em acompanhamento' | 'Concluído'
type Origin = 'Pedido explícito' | 'Questão não resolvida'
type BookingStatus = 'Agendada' | 'Alterada' | 'Cancelada'

interface Moment {
  id: string
  candidate: string
  vacancy: string
  type: 'Contacto humano'
  reason: string
  at: string
  status: RequestStatus
  origin: Origin
}

interface Message {
  id: string
  from: 'bot' | 'ana'
  text: string
  schedule?: boolean
  unresolved?: string
  decision?: 'Encaminhada' | 'Dispensada'
}

interface Activity {
  id: string
  text: string
  at: string
  kind: 'mission' | 'answer' | 'booking' | 'human'
}

interface State {
  view: View
  completed: MissionId[]
  chat: Message[]
  interview: { id: string; slot: SlotId; status: BookingStatus; at: string; previousSlot?: SlotId } | null
  moments: Moment[]
  activities: Activity[]
}

type Event =
  | { type: 'navigate'; view: View }
  | { type: 'reset' }
  | { type: 'mission'; mission: MissionId }
  | { type: 'chat'; text: string }
  | { type: 'resolve'; messageId: string; accept: boolean }
  | { type: 'book'; slot: SlotId }
  | { type: 'cancel' }
  | { type: 'moment'; requestId: string; status: Exclude<RequestStatus, 'Pendente'> }

type Action = Event & { id: string; at: string }
export const storageKey = 'confia-plus-v1'
const views: View[] = ['home', 'journey', 'concierge', 'schedule', 'recruiter']
export const initialState = (): State => ({
  view: 'home', completed: [], chat: [{ id: 'greeting', from: 'bot', text: greeting }],
  interview: null, moments: [], activities: [],
})

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as State | null
    if (saved && views.includes(saved.view) && Array.isArray(saved.chat) && Array.isArray(saved.completed)
      && Array.isArray(saved.moments) && Array.isArray(saved.activities)
      && (saved.interview === null || slots.some(({ id }) => id === saved.interview?.slot))) return saved
  } catch {
    // An unavailable store or invalid demo snapshot starts a fresh session.
  }
  return initialState()
}

function log(state: State, event: Action, kind: Activity['kind'], text: string): State {
  return { ...state, activities: [{ id: event.id, kind, text, at: event.at }, ...state.activities] }
}

function request(state: State, event: Action, reason: string, origin: Origin): State {
  const duplicate = state.moments.some((item) =>
    item.status !== 'Concluído' && normalize(item.reason) === normalize(reason))
  if (duplicate) return state
  const moment: Moment = {
    id: event.id, candidate, vacancy, type: 'Contacto humano', reason,
    at: event.at, origin, status: 'Pendente',
  }
  return log({ ...state, moments: [moment, ...state.moments] }, event, 'human', 'Ana pediu contacto com a equipa de recrutamento.')
}

export function reducer(state: State, event: Action): State {
  switch (event.type) {
    case 'navigate': return { ...state, view: event.view }
    case 'reset': return initialState()
    case 'mission': {
      const mission = missions.find(({ id }) => id === event.mission)
      if (state.view !== 'journey' || !mission || state.completed.includes(mission.id)) return state
      return log({ ...state, completed: [...state.completed, mission.id] }, event, 'mission', `Ana concluiu a missão voluntária «${mission.title}».`)
    }
    case 'chat': {
      const text = event.text.trim().slice(0, 400)
      if (state.view !== 'concierge' || !text) return state
      const booked = state.interview && state.interview.status !== 'Cancelada' ? slotLabel(state.interview.slot) : undefined
      const reply = respond(text, booked)
      const response: Message = { id: event.id, from: 'bot', text: reply.text }
      if (reply.kind === 'answer') response.schedule = reply.schedule
      if (reply.kind === 'unknown') response.unresolved = text
      const next: State = { ...state, chat: [...state.chat, { id: event.id + '-ana', from: 'ana', text }, response] }
      if (reply.kind === 'human') return request(next, event, text, 'Pedido explícito')
      if (reply.kind === 'answer') return log(next, event, 'answer', 'O Concierge respondeu a uma pergunta da Ana.')
      return next
    }
    case 'resolve': {
      if (state.view !== 'concierge') return state
      const message = state.chat.find(({ id }) => id === event.messageId)
      if (!message?.unresolved || message.decision) return state
      const decision = event.accept ? 'Encaminhada' : 'Dispensada'
      const next: State = {
        ...state,
        chat: state.chat.map((item) => item.id === message.id ? { ...item, decision } : item),
      }
      if (!event.accept) return next
      next.chat.push({ id: event.id, from: 'bot', text: humanReply })
      return request(next, event, message.unresolved, 'Questão não resolvida')
    }
    case 'book': {
      if (state.view !== 'schedule' || !slots.some(({ id }) => id === event.slot)) return state
      const active = state.interview?.status !== 'Cancelada' ? state.interview : null
      if (active?.slot === event.slot) return state
      return log({
        ...state, interview: {
          id: active?.id ?? event.id, slot: event.slot, at: event.at,
          status: active ? 'Alterada' : 'Agendada', previousSlot: active?.slot,
        },
      }, event, 'booking', `Entrevista ${active ? 'alterada' : 'agendada'} para ${slotLabel(event.slot)}.`)
    }
    case 'cancel': {
      if (state.view !== 'schedule' || !state.interview || state.interview.status === 'Cancelada') return state
      return log({ ...state, interview: { ...state.interview, status: 'Cancelada', at: event.at } },
        event, 'booking', `Entrevista de ${slotLabel(state.interview.slot)} cancelada.`)
    }
    case 'moment': {
      if (state.view !== 'recruiter') return state
      const previous = state.moments.find(({ id }) => id === event.requestId)
      if (!previous || previous.status === 'Concluído' || previous.status === event.status) return state
      const next = { ...state, moments: state.moments.map((item) =>
        item.id === event.requestId ? { ...item, status: event.status } : item) }
      return log(next, event, 'human', event.status === 'Concluído'
        ? 'Marta concluiu o pedido de contacto da Ana.' : 'Marta iniciou o acompanhamento do pedido da Ana.')
    }
  }
}

const Context = createContext<{ state: State; send: Dispatch<Event>; saved: boolean } | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, restore)
  const [saved, setSaved] = useState(true)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [state])
  function send(event: Event) {
    const id = crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4))).join('-')
    dispatch({ ...event, id, at: new Date().toISOString() })
  }
  return <Context.Provider value={{ state, send, saved }}>{children}</Context.Provider>
}

export function useApp() {
  const context = useContext(Context)
  if (!context) throw new Error('AppProvider em falta')
  return context
}
