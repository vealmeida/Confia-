import { useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, LockKeyhole, Mail, UserRound, Video } from 'lucide-react'
import { Dialog, PageTitle } from '../components/ui'
import { useApp } from '../context/AppContext'
import { candidate, missions, passedAllMissions, recruiter, slotLabel, slots, vacancy } from '../data/mockData'
import type { SlotId } from '../data/mockData'

export function SchedulingPage() {
  const { state, send } = useApp()
  const active = state.interview && state.interview.status !== 'Cancelada' ? state.interview : null
  const eligible = passedAllMissions(state.passedMissions)
  const cancelled = state.interview?.status === 'Cancelada'
  const [slot, setSlot] = useState<SlotId>()
  const [editing, setEditing] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [notice, setNotice] = useState('')
  return <>
    <PageTitle eyebrow="Área do candidato" title="Agendamento de entrevista" description={active || eligible ? "Escolhe o horário que te dá mais jeito para conversar com a Marta." : "Passa nos testes das missões para poderes escolher um horário."} />
    <div className="dashboard-grid">
      <section className="panel">
        {!active && !eligible ? <div className="booking-result">
          <span className="feature-icon lilac"><LockKeyhole size={24} /></span>
          <h2>Agendamento bloqueado</h2>
          <p>Passaste em {state.passedMissions.length} de {missions.length} testes. Conclui as missões em falta para desbloquear os horários.</p>
          {cancelled && <p className="pill warning">Entrevista anterior cancelada</p>}
          <div className="actions">
            <button className="button primary" onClick={() => send({ type: 'navigate', view: 'journey' })}>Ir para as missões</button>
            <button className="button secondary" onClick={() => send({ type: 'navigate', view: 'concierge' })}>Pedir ajuda</button>
          </div>
        </div> : active && !editing ? <div className="booking-result">
          <span className="feature-icon mint"><CheckCircle2 size={26} /></span>
          <h2>{active.status === 'Alterada' ? 'Horário alterado com sucesso!' : 'Entrevista agendada com sucesso!'}</h2>
          <p className="booked-date"><CalendarDays size={19} /> {slotLabel(active.slot)}</p>
          <div className="info-card"><Mail size={20} /><div><strong>Notificação simulada</strong><p>O convite demonstrativo foi preparado. A confirmação fica disponível nesta página.</p></div></div>
          <div className="actions">
            <button className="button primary" onClick={() => { setEditing(true); setSlot(active.slot) }}>Alterar horário</button>
            <button className="button danger-outline" onClick={() => setConfirmCancel(true)}>Cancelar entrevista</button>
          </div>
        </div> : <form onSubmit={(event) => {
          event.preventDefault()
          if (!slot || active?.slot === slot) return
          send({ type: 'book', slot })
          setEditing(false)
          setNotice(active ? 'Horário alterado com sucesso!' : 'Entrevista agendada com sucesso!')
        }}>
          <h2>{editing ? 'Escolhe um novo horário' : 'Horários disponíveis'}</h2>
          <p>Horários fictícios em Lisboa (WET).</p>
          {cancelled && <p className="pill warning">Entrevista anterior cancelada</p>}
          <fieldset className="slot-list">
            <legend className="sr-only">Seleciona um horário</legend>
            {slots.map((item) => <label className="slot" key={item.id}>
              <input type="radio" name="slot" value={item.id} checked={slot === item.id} onChange={() => setSlot(item.id)} />
              <span className="slot-day"><strong>{item.day}</strong><small>NOV</small></span>
              <span className="row-copy"><strong>{item.weekday}, {item.day} de novembro de 2026</strong><small>{item.time}{active?.slot === item.id ? ' · Horário atual' : ''}</small></span>
            </label>)}
          </fieldset>
          <div className="actions">
            <button className="button primary" disabled={!slot || active?.slot === slot}>{editing ? 'Confirmar alteração' : 'Confirmar agendamento'}</button>
            {editing && <button type="button" className="button secondary" onClick={() => setEditing(false)}>Voltar à confirmação</button>}
          </div>
        </form>}
        <span className="sr-only" role="status">{notice}</span>
      </section>
      <aside className="panel interview-details">
        <h2>Detalhes da entrevista</h2><p>{vacancy} · Horizonte</p>
        <dl>
          <div><UserRound size={19} /><div><dt>Candidata</dt><dd>{candidate}</dd></div></div>
          <div><UserRound size={19} /><div><dt>Recrutadora</dt><dd>{recruiter}</dd></div></div>
          <div><Video size={19} /><div><dt>Formato</dt><dd>Entrevista online</dd></div></div>
          <div><Clock3 size={19} /><div><dt>Duração</dt><dd>30 minutos</dd></div></div>
        </dl>
        <small>O convite e os horários são simulados.</small>
      </aside>
    </div>
    {confirmCancel && <Dialog title="Cancelar entrevista?" onClose={() => setConfirmCancel(false)}>
      <p>A Marta verá o cancelamento no painel. {eligible ? "Podes voltar a escolher um horário." : "Para fazer uma nova marcação, passa nos testes das missões."}</p>
      <div className="actions">
        <button className="button secondary" onClick={() => setConfirmCancel(false)}>Manter entrevista</button>
        <button className="button danger" onClick={() => {
          send({ type: 'cancel' })
          setConfirmCancel(false)
          setSlot(undefined)
          setNotice('Entrevista cancelada.')
        }}>Confirmar cancelamento</button>
      </div>
    </Dialog>}
  </>
}
