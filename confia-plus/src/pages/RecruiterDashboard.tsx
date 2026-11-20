import { useState } from 'react'
import { Activity, ArrowRight, CalendarDays, Clock3, HeartHandshake, Inbox, MessageCircle, Sparkles, Zap } from 'lucide-react'
import { Dialog, PageTitle } from '../components/ui'
import { useApp } from '../context/AppContext'
import type { RequestStatus } from '../context/AppContext'
import { candidate, dateLabel, estimatedMinutes, slotLabel, vacancy } from '../data/mockData'

const statusClass: Record<RequestStatus, string> = {
  Pendente: 'warning',
  'Em acompanhamento': '',
  Concluído: 'success',
}

export function RecruiterDashboard() {
  const { state, send } = useApp()
  const [open, setOpen] = useState<string>()
  const [notice, setNotice] = useState('')
  const selected = state.moments.find(({ id }) => id === open)
  const pending = state.moments.filter(({ status }) => status === 'Pendente').length
  const answers = state.activities.filter(({ kind }) => kind === 'answer').length
  const bookings = state.activities.filter(({ kind }) => kind === 'booking').length
  const interview = state.interview
  const stats = [
    { Icon: Zap, title: 'Tarefas administrativas automatizadas', value: answers + bookings, color: 'lilac' },
    { Icon: Clock3, title: 'Tempo administrativo potencialmente poupado', value: `${answers * estimatedMinutes.answer + bookings * estimatedMinutes.booking} min`, color: 'mint' },
    { Icon: CalendarDays, title: 'Entrevistas agendadas', value: Number(Boolean(interview && interview.status !== 'Cancelada')), color: 'lilac' },
    { Icon: HeartHandshake, title: 'Momentos Humanos pendentes', value: pending, color: 'mint' },
  ]
  const activityIcons = { mission: Sparkles, answer: MessageCircle, booking: CalendarDays, human: HeartHandshake }

  return <>
    <PageTitle eyebrow="Área do recrutador" title="Bom dia, Marta!" description="Talent Acquisition Specialist · Horizonte">
      <span className="pill">Indicadores simulados para demonstração</span>
    </PageTitle>
    <section className="metrics" aria-label="Resumo operacional">
      {stats.map(({ Icon, title, value, color }) => <article className="panel metric" key={title}>
        <span className={`feature-icon ${color}`}><Icon size={21} /></span><strong>{value}</strong><h2>{title}</h2>
      </article>)}
    </section>
    <div className="dashboard-grid recruiter-grid">
      <div className="stack">
        <section className="panel">
          <div className="split"><div><h2>Momentos Humanos</h2><p>Pedidos de contacto com a equipa de recrutamento.</p></div><span className="pill warning">{pending} {pending === 1 ? 'pendente' : 'pendentes'}</span></div>
          {state.moments.length ? <ul className="moment-list">
            {state.moments.map((item) => <li key={item.id} className="moment">
              <div className="split"><div className="identity"><span className="avatar">AM</span><div><strong>{item.candidate}</strong><p>{item.vacancy}</p></div></div><span className={`pill ${statusClass[item.status]}`}>{item.status}</span></div>
              <p className="reason">{item.reason}</p>
              <div className="split moment-meta"><small>{item.origin} · <time dateTime={item.at}>{dateLabel(item.at)}</time></small>
                <button className="button secondary compact" onClick={() => setOpen(item.id)}>Abrir pedido <ArrowRight size={15} /></button></div>
            </li>)}
          </ul> : <div className="empty"><Inbox size={25} /><p>Ainda não há pedidos de contacto.</p></div>}
          <p role="status" className="notice">{notice}</p>
          <div className="info-card"><HeartHandshake size={21} /><p>Os Momentos Humanos ajudam a equipa a concentrar a sua atenção em situações que beneficiam de contacto pessoal, sem substituir o julgamento profissional.</p></div>
        </section>
        <section className="panel">
          <h2>Entrevistas</h2>
          {interview ? <div className="moment interview-record">
            <div className="split"><div className="identity"><span className="avatar">AM</span><div><strong>{candidate}</strong><p>{vacancy}</p></div></div><span className={`pill ${interview.status === 'Cancelada' ? 'warning' : 'success'}`}>{interview.status}</span></div>
            <p className="booked-date"><CalendarDays size={18} /> {slotLabel(interview.slot)}</p>
            {interview.previousSlot && <p>Horário anterior: {slotLabel(interview.previousSlot)}</p>}
            {interview.status === 'Cancelada' && <p>Cancelada em {dateLabel(interview.at)}.</p>}
          </div> : <div className="empty"><CalendarDays size={25} /><p>Ainda não há entrevistas agendadas.</p></div>}
        </section>
      </div>
      <section className="panel activity-panel">
        <div className="identity"><span className="feature-icon lilac"><Activity size={21} /></span><h2>Atividade recente</h2></div>
        {state.activities.length ? <ol>{state.activities.map((item) => {
          const Icon = activityIcons[item.kind]
          return <li key={item.id}><span className="activity-icon"><Icon size={17} /></span><div><p>{item.text}</p><time dateTime={item.at}>{dateLabel(item.at)}</time></div></li>
        })}</ol> : <div className="empty"><Activity size={24} /><p>As ações da demonstração vão surgir aqui.</p></div>}
      </section>
    </div>
    {selected && <Dialog title={`Pedido de ${selected.candidate}`} onClose={() => setOpen(undefined)}>
      <p>{selected.vacancy} · {selected.type}</p>
      <p><strong>Motivo do contacto</strong></p><blockquote>{selected.reason}</blockquote>
      <p>{selected.origin} · <time dateTime={selected.at}>{dateLabel(selected.at)}</time></p>
      <p className={`pill ${statusClass[selected.status]}`} role="status">{selected.status}</p>
      {selected.status !== 'Concluído' && <div className="actions">
        {selected.status === 'Pendente' && <button className="button secondary" onClick={() => {
          send({ type: 'moment', requestId: selected.id, status: 'Em acompanhamento' })
          setNotice('Pedido em acompanhamento.')
        }}>Marcar como Em acompanhamento</button>}
        <button className="button primary" onClick={() => {
          send({ type: 'moment', requestId: selected.id, status: 'Concluído' })
          setNotice('Pedido concluído.')
        }}>Marcar como Concluído</button>
      </div>}
    </Dialog>}
  </>
}
