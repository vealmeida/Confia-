import { ArrowRight, CalendarDays, HeartHandshake, MessageCircle, ShieldCheck, Sparkles, UserRound, UsersRound } from 'lucide-react'
import { useApp } from '../context/AppContext'

const features = [
  { icon: Sparkles, color: 'lilac', title: 'Jornada gamificada', description: 'Descobre a empresa, explora a função e prepara a conversa com missões opcionais.' },
  { icon: MessageCircle, color: 'mint', title: 'Candidate Concierge', description: 'Esclarece dúvidas sobre a candidatura e pede ajuda à equipa quando precisares.' },
  { icon: CalendarDays, color: 'lilac', title: 'Agendamento inteligente', description: 'Escolhe, altera ou cancela o horário da entrevista em poucos cliques.' },
  { icon: HeartHandshake, color: 'mint', title: 'Momentos Humanos', description: 'A equipa de recrutamento acompanha os pedidos que beneficiam de uma conversa.' },
]

export function HomePage() {
  const { send } = useApp()
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="prototype"><span /> Protótipo de demonstração</p>
        <h1>Automatizamos tarefas para <em>humanizar relações.</em></h1>
        <p className="hero-description">Uma experiência de recrutamento mais clara para quem se candidata e com mais tempo para conversar para quem recruta.</p>
        <div className="hero-actions">
          <button className="button primary" onClick={() => send({ type: 'navigate', view: 'journey' })}><UserRound size={17} /> Entrar como candidato <ArrowRight size={16} /></button>
          <button className="button secondary" onClick={() => send({ type: 'navigate', view: 'recruiter' })}><UsersRound size={17} /> Entrar como recrutador</button>
        </div>
        <p className="hero-note"><ShieldCheck size={16} /> Acesso imediato, sem registo</p>
      </div>
      <div className="hero-visual">
        <img src={import.meta.env.BASE_URL + 'entrevista.webp'} alt="Duas profissionais a conversar durante uma entrevista" width="960" height="770" />
        <div className="visual-caption">
          <span className="caption-icon"><HeartHandshake size={24} /></span>
          <div><strong>Pessoas no centro</strong><p>A tecnologia apoia. As pessoas decidem.</p></div>
        </div>
      </div>
    </section>
    <section className="features" aria-labelledby="features-title">
      <p className="eyebrow">A experiência Confia+</p>
      <h2 id="features-title">Uma jornada, dois pontos de vista.</h2>
      <div className="feature-grid">
        {features.map(({ icon: Icon, color, title, description }) => <article className="feature-card" key={title}>
          <span className={`feature-icon ${color}`}><Icon size={22} /></span>
          <h3>{title}</h3><p>{description}</p>
        </article>)}
      </div>
    </section>
  </>
}
