import { Building2, UsersRound } from 'lucide-react'
import { company, companyIntroduction, recruitmentTeam, values } from '../data/mockData'

export function CompanyIntroduction() {
  return <section className="company-intro panel" aria-labelledby="company-title">
    <div>
      <div className="identity">
        <span className="feature-icon lilac"><Building2 size={22} /></span>
        <h2 id="company-title">Conhece a {company}</h2>
      </div>
      <p>{companyIntroduction}</p>
      <ul className="value-list" aria-label="Valores da Horizonte">
        {values.map((value) => <li className="pill" key={value}>{value}</li>)}
      </ul>
    </div>
    <div>
      <div className="identity">
        <span className="feature-icon mint"><UsersRound size={22} /></span>
        <h2>Equipa de recrutamento</h2>
      </div>
      <ul className="team-list">
        {recruitmentTeam.map((member) => <li className="identity" key={member.name}>
          <span className="avatar" aria-hidden="true">{member.initials}</span>
          <div><strong>{member.name}</strong> <span className="team-role">{member.role}</span><p>{member.description}</p></div>
        </li>)}
      </ul>
    </div>
  </section>
}
