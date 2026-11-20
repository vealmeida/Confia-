import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Plus, X } from 'lucide-react'

export function Logo() {
  return <span className="brand"><span className="brand-mark"><Plus size={19} strokeWidth={3} /></span><span>Next Level</span></span>
}

export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => { if (dialog?.open) dialog.close() }
  }, [])
  return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={(event) => { event.preventDefault(); onClose() }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="dialog-content">
      <div className="split"><h2 id="dialog-title">{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20} /></button></div>
      {children}
    </div>
  </dialog>
}

export function PageTitle({ eyebrow, title, description, children }: {
  eyebrow: string; title: string; description: string; children?: ReactNode
}) {
  return <header className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{children}</header>
}
