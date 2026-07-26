import { useState, useEffect } from 'react'
import Reveal from './Reveal'

function DocumentChecklist() {
  const documents = [
    { id: 'transcript', label: 'Academic transcripts (attested)' },
    { id: 'ielts', label: 'IELTS / language proficiency certificate' },
    { id: 'sop', label: 'Statement of Purpose (SOP)' },
    { id: 'recommendation', label: '2-3 Recommendation letters' },
    { id: 'cv', label: 'Updated CV / Resume' },
    { id: 'passport', label: 'Valid passport copy' },
    { id: 'photos', label: 'Passport-size photographs' },
    { id: 'medical', label: 'Medical certificate (if required)' },
  ]

  const [checked, setChecked] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('bursmate_checklist')
    if (saved) setChecked(JSON.parse(saved))
  }, [])

  const toggle = (id) => {
    const updated = { ...checked, [id]: !checked[id] }
    setChecked(updated)
    localStorage.setItem('bursmate_checklist', JSON.stringify(updated))
  }

  const doneCount = documents.filter((d) => checked[d.id]).length

  return (
    <section className="checklist-section">
      <Reveal>
        <p className="eyebrow center">Get Ready</p>
        <h2 className="section-title">Document checklist</h2>
        <p className="checklist-subtitle">Most scholarships ask for these. Check them off as you prepare each one.</p>

        <div className="checklist-card">
          <div className="checklist-progress">
            <span>{doneCount} of {documents.length} ready</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(doneCount / documents.length) * 100}%` }}></div>
            </div>
          </div>

          {documents.map((doc) => (
            <label className="checklist-item" key={doc.id}>
              <input
                type="checkbox"
                checked={!!checked[doc.id]}
                onChange={() => toggle(doc.id)}
              />
              <span className={checked[doc.id] ? 'checked-text' : ''}>{doc.label}</span>
            </label>
          ))}

          <p className="checklist-note">Requirements vary by scholarship — always confirm the exact list on the official website.</p>
        </div>
      </Reveal>
    </section>
  )
}

export default DocumentChecklist