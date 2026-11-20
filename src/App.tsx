import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Compass, HeartHandshake, House, LayoutDashboard, MessageCircle, RotateCcw, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { Dialog, Logo } from './components/ui'
import { useApp } from './context/AppContext'
import type { View } from './context/AppContext'
import { HomePage } from './pages/HomePage'
import { CandidateJourney } from './pages/CandidateJourney'
import { ConciergePage } from './pages/ConciergePage'
import { SchedulingPage } from './pages/SchedulingPage'
import { RecruiterDashboard } from './pages/RecruiterDashboard'

const candidateNav = [
  { view: 'journey', label: 'Jornada', Icon: Compass },
  { view: 'concierge', label: 'Concierge', Icon: MessageCircle },
  { view: 'schedule', label: 'Agendamento', Icon: CalendarDays },
] as const
const pages = {
  home: HomePage, journey: CandidateJourney, concierge: ConciergePage,
  schedule: SchedulingPage, recruiter: RecruiterDashboard,
}

export function App() {
  const { state, send, saved } = useApp()
  const [modal, setModal] = useState<'reset' | 'privacy'>()
  const [notice, setNotice] = useState('')
  const main = useRef<HTMLElement>(null)
  const previousView = useRef(state.view)
  const Page = pages[state.view]
  const isHome = state.view === 'home'
  const isRecruiter = state.view === 'recruiter'
  const nav = isRecruiter ? [{ view: 'recruiter', label: 'Painel', Icon: LayoutDashboard }] as const : candidateNav

  useEffect(() => {
    if (state.view === previousView.current) return
    previousView.current = state.view
    main.current?.focus()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [state.view])

  function go(view: View) { send({ type: 'navigate', view }) }
  return <>
    <a className="skip-link" href="#main">Saltar para o conteúdo</a>
    <header className="site-header">
      <div className="wrap topbar">
        <button className="logo-button" onClick={() => go('home')} aria-label="Confia+, início"><Logo /></button>
        {isHome ? <span className="tagline">Human Recruitment Journey</span> :
          <nav className="main-nav" aria-label="Navegação principal">
            <button onClick={() => go('home')} aria-label="Início"><House size={17} /><span>Início</span></button>
            {nav.map(({ view, label, Icon }) => <button key={view} aria-current={state.view === view ? 'page' : undefined} onClick={() => go(view)}><Icon size={17} /><span>{label}</span></button>)}
          </nav>}
        <div className="top-actions">
          {isHome ? <button className="reset-button" onClick={() => setModal('reset')}><RotateCcw size={16} /> Reiniciar demonstração</button> :
            <button className="reset-button switch-button" onClick={() => go(isRecruiter ? 'journey' : 'recruiter')}>
              {isRecruiter ? <UserRound size={17} /> : <UsersRound size={17} />}
              {isRecruiter ? 'Mudar para candidato' : 'Mudar para recrutador'}
            </button>}
        </div>
      </div>
    </header>
    <main id="main" className={`wrap ${isHome ? 'homepage' : 'workspace'}`} ref={main} tabIndex={-1}>
      {!saved && <p role="alert" className="info-card">O navegador bloqueou o armazenamento local. As alterações ficam disponíveis nesta sessão.</p>}
      <Page />
    </main>
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p><HeartHandshake size={18} /> <span><strong>Confia+:</strong> automatizamos tarefas para humanizar relações.</span></p>
        <div>
          {(!isHome) && <button onClick={() => setModal('reset')}><RotateCcw size={15} /> Reiniciar demonstração</button>}
          <button onClick={() => setModal('privacy')}><ShieldCheck size={16} /> IA e privacidade</button>
        </div>
      </div>
    </footer>
    <p className="sr-only" role="status">{notice}</p>
    {modal === 'reset' && <Dialog title="Reiniciar demonstração?" onClose={() => setModal(undefined)}>
      <p>Esta ação apaga o progresso, a conversa, a entrevista e os pedidos guardados neste navegador. Os dados fictícios iniciais serão repostos.</p>
      <div className="actions">
        <button className="button secondary" onClick={() => setModal(undefined)}>Voltar</button>
        <button className="button primary" onClick={() => {
          send({ type: 'reset' })
          setModal(undefined)
          setNotice('Demonstração reiniciada.')
        }}>Confirmar reinício</button>
      </div>
    </Dialog>}
    {modal === 'privacy' && <Dialog title="IA e privacidade" onClose={() => setModal(undefined)}>
      <h3>Como utilizamos a IA</h3>
      <p>O Confia+ utiliza automação para apoiar tarefas administrativas e facilitar a comunicação. Este protótipo utiliza respostas simuladas e não toma decisões de seleção. As decisões de recrutamento permanecem sob responsabilidade humana.</p>
      <h3>Privacidade do protótipo</h3>
      <p>Esta demonstração utiliza dados fictícios guardados localmente no navegador. Não existe ligação a um sistema real de recrutamento.</p>
      <p>O LocalStorage pode manter estes dados mesmo depois de fechares a página. Usa «Reiniciar demonstração» para apagar o progresso e o conteúdo guardado e repor os dados fictícios iniciais.</p>
      <button className="button primary" onClick={() => setModal(undefined)}>Fechar informação</button>
    </Dialog>}
  </>
}
