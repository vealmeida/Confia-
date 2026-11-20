import { useState } from 'react'
import { ArrowRight, Award, CalendarDays, Check, Compass, FileCheck2, Leaf, MessageCircle, ShieldCheck, Sparkles, Target } from 'lucide-react'
import { Dialog, PageTitle } from '../components/ui'
import { useApp } from '../context/AppContext'
import { company, missionPoints, missions, slotLabel, vacancy } from '../data/mockData'
import type { MissionId } from '../data/mockData'

const steps = [
  { title: 'Candidatura recebida', Icon: FileCheck2 },
  { title: 'Descobrir a empresa', Icon: Compass },
  { title: 'Entrevista', Icon: CalendarDays },
  { title: 'Feedback', Icon: MessageCircle },
]
const icons = [Leaf, Target, MessageCircle]

export function CandidateJourney() {
  const { state, send } = useApp()
  const [open, setOpen] = useState<MissionId>()
  const [notice, setNotice] = useState('')
  const mission = missions.find(({ id }) => id === open)
  const booked = state.interview && state.interview.status !== 'Cancelada' ? state.interview : null
  const done = [true, state.completed.includes('culture'), Boolean(booked), false]
  const progress = done.filter(Boolean).length * 25
  return <>
    <PageTitle eyebrow="Área do candidato" title="Olá, Ana!" description={`${vacancy} · ${company}`}>
      <span className="pill success">{booked ? 'Entrevista agendada' : 'Candidatura recebida'}</span>
    </PageTitle>
    <div className="dashboard-grid">
      <div className="stack">
        <section className="panel journey-panel">
          <div className="split"><div><h2>A tua jornada</h2><p>Acompanha as etapas da tua candidatura.</p></div><strong className="progress-number">{progress}%</strong></div>
          <progress aria-label="Progresso da jornada" value={progress} max={100} />
          <ol className="step-grid">
            {steps.map(({ title, Icon }, i) => <li key={title} className={done[i] ? 'step is-done' : 'step'}>
              <span className="step-icon">{done[i] ? <Check size={19} /> : <Icon size={19} />}</span>
              <span><strong>{title}</strong><small>{done[i] ? (i === 2 ? 'Agendada' : 'Concluída') : i === 2 ? 'Por agendar' : i === 3 ? 'Após a entrevista' : 'Por explorar'}</small></span>
            </li>)}
          </ol>
        </section>
        <section className="panel">
          <div className="split"><div><h2>Missões opcionais</h2><p>Explora o que te interessa, ao teu ritmo.</p></div><span className="pill">{state.completed.length} de 3 concluídas</span></div>
          <div className="mission-list">
            {missions.map((item, index) => {
              const Icon = icons[index]
              const completed = state.completed.includes(item.id)
              return <button className="mission-row" key={item.id} onClick={() => setOpen(item.id)}>
                <span className={`feature-icon ${index === 1 ? 'mint' : 'lilac'}`}><Icon size={20} /></span>
                <span className="row-copy"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
                <span className={`pill ${completed ? 'success' : ''}`}>{completed ? <><Check size={14} /> Concluída</> : `+${missionPoints} pts`}</span>
                <ArrowRight className="row-arrow" size={17} />
              </button>
            })}
          </div>
          <p className="notice" role="status">{notice}</p>
        </section>
      </div>
      <aside className="stack">
        <section className="points-panel">
          <span className="feature-icon"><Award size={24} /></span>
          <h2>Pontos e conquistas</h2>
          <p className="score">{state.completed.length * missionPoints} <small>pontos</small></p>
          {state.completed.length ? <ul className="achievement-list">{missions.filter(({ id }) => state.completed.includes(id)).map(({ id, achievement }) => <li key={id}><Sparkles size={16} /> {achievement}</li>)}</ul>
            : <p>Conclui uma missão para desbloquear a tua primeira conquista.</p>}
        </section>
        <section className="panel next-panel"><CalendarDays size={22} /><h2>A tua entrevista</h2><p>{booked ? slotLabel(booked.slot) : 'Escolhe um horário para conversar com a Marta.'}</p>
          <button className="button primary" onClick={() => send({ type: 'navigate', view: 'schedule' })}>{booked ? 'Gerir entrevista' : 'Agendar entrevista'}</button>
        </section>
        <div className="info-card"><ShieldCheck size={20} /><p>As missões são opcionais e podes usar todas as funcionalidades sem as concluir. Os pontos são simbólicos e nunca influenciam a avaliação ou a seleção.</p></div>
      </aside>
    </div>
    {mission && <Dialog title={mission.title} onClose={() => setOpen(undefined)}>
      <p>{mission.body}</p>
      {state.completed.includes(mission.id)
        ? <p className="pill success"><Check size={15} /> Missão concluída</p>
        : <button className="button primary" onClick={() => {
          send({ type: 'mission', mission: mission.id })
          setNotice(`Missão concluída! +${missionPoints} pontos e uma nova conquista.`)
          setOpen(undefined)
        }}>Concluir missão</button>}
    </Dialog>}
  </>
}
