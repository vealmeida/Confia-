import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarDays, Headphones, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { PageTitle } from '../components/ui'
import { useApp } from '../context/AppContext'
import { suggestions } from '../services/conciergeEngine'

export function ConciergePage() {
  const { state, send } = useApp()
  const [draft, setDraft] = useState('')
  const chat = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chat.current) chat.current.scrollTop = chat.current.scrollHeight
  }, [state.chat])
  function ask(text: string) {
    if (!text.trim()) return
    send({ type: 'chat', text })
    setDraft('')
  }
  return <>
    <PageTitle eyebrow="Área do candidato" title="Candidate Concierge" description="Esclarece dúvidas e encontra o teu próximo passo." />
    <div className="dashboard-grid">
      <section className="panel chat-panel" aria-label="Conversa com o assistente">
        <header className="chat-header"><span className="feature-icon lilac"><Sparkles size={22} /></span><div><h2>Concierge</h2><p>Assistente virtual demonstrativo</p></div></header>
        <div className="messages" ref={chat} role="log" aria-label="Histórico da conversa" tabIndex={0}>
          {state.chat.map((message) => <div key={message.id} className={`message ${message.from}`}>
            <span className="message-author">{message.from === 'bot' ? 'Concierge' : 'Ana'}</span>
            <p>{message.text}</p>
            {message.schedule && <button className="button secondary compact" onClick={() => send({ type: 'navigate', view: 'schedule' })}><CalendarDays size={15} /> Agendar entrevista <ArrowRight size={14} /></button>}
            {message.unresolved && (message.decision ? <span className="pill">{message.decision}</span> :
              <div className="actions">
                <button className="button primary compact" onClick={() => send({ type: 'resolve', messageId: message.id, accept: true })}>Sim, encaminhar</button>
                <button className="button secondary compact" onClick={() => send({ type: 'resolve', messageId: message.id, accept: false })}>Agora não</button>
              </div>)}
          </div>)}
        </div>
        <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); ask(draft) }}>
          <label className="sr-only" htmlFor="chat-input">A tua mensagem</label>
          <input id="chat-input" value={draft} maxLength={400} onChange={(event) => setDraft(event.target.value)} placeholder="Escreve a tua pergunta…" />
          <button aria-label="Enviar mensagem" className="button primary send-button" disabled={!draft.trim()}><Send size={18} /></button>
        </form>
        <p className="chat-note"><ShieldCheck size={15} /> Usa apenas informação fictícia nesta conversa.</p>
      </section>
      <aside className="stack">
        <section className="panel suggestions"><h2>Perguntas sugeridas</h2>{suggestions.map((question) => <button key={question} onClick={() => ask(question)}>{question}<ArrowRight size={15} /></button>)}</section>
        <section className="info-card"><Headphones size={21} /><div><strong>Contacto com a equipa</strong><p>Podes pedir para falar com a Marta em qualquer momento da candidatura.</p></div></section>
      </aside>
    </div>
  </>
}
