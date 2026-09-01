import { useState, useEffect } from 'react'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import './App.css'
import ChatAssistant from './ChatAssistant'
import MyProgress from './MyProgress'
import Auth from './Auth'

function App() {
  const [formData, setFormData] = useState({
    gradeType: 'CGPA', gradeValue: '', degreeLevel: '', fieldOfStudy: '', countryPreference: '',
    ieltsScore: '', financialNeed: '', age: '', gender: '',
  })
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [hasSaved, setHasSaved] = useState(false)
  const [statuses, setStatuses] = useState({})
  const [docChecks, setDocChecks] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('bursmate_last_search')
    if (saved) setHasSaved(true)
    const savedStatuses = localStorage.getItem('bursmate_tracker')
    if (savedStatuses) setStatuses(JSON.parse(savedStatuses))
    const savedUser = localStorage.getItem('bursmate_user')
    if (savedUser) setUser(JSON.parse(savedUser))
    const savedDocs = localStorage.getItem('bursmate_doc_checks')
    if (savedDocs) setDocChecks(JSON.parse(savedDocs))
  }, [])

  useEffect(() => {
    if (formData.gradeType === 'Percentage') {
      setFormData((prev) => ({ ...prev, degreeLevel: 'Bachelors' }))
    } else if (formData.gradeType === 'CGPA' && formData.degreeLevel === 'Bachelors') {
      setFormData((prev) => ({ ...prev, degreeLevel: '' }))
    }
  }, [formData.gradeType])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogout = () => {
    localStorage.removeItem('bursmate_user')
    setUser(null)
    setShowForm(false)
    setMatches([])
  }

  const openForm = () => {
    setShowForm(true)
    setTimeout(() => {
      document.getElementById('matcher-form')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const loadSavedMatches = () => {
    const saved = localStorage.getItem('bursmate_last_search')
    if (saved) {
      const parsed = JSON.parse(saved)
      setFormData(parsed.formData)
      setMatches(parsed.matches)
      setShowForm(true)
      setTimeout(() => document.getElementById('matcher-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  const updateStatus = (name, status) => {
    const updated = { ...statuses, [name]: status }
    setStatuses(updated)
    localStorage.setItem('bursmate_tracker', JSON.stringify(updated))
  }

  const toggleDoc = (scholarshipName, docIndex) => {
    const key = `${scholarshipName}::${docIndex}`
    const updated = { ...docChecks, [key]: !docChecks[key] }
    setDocChecks(updated)
    localStorage.setItem('bursmate_doc_checks', JSON.stringify(updated))
  }

  const handlePrint = (formData, matches, docChecks) => {
    const profileHtml = `
      <p><strong>Academic record:</strong> ${formData.gradeType === 'CGPA' ? `CGPA ${formData.gradeValue}/4.0` : `${formData.gradeValue}% (Intermediate)`}</p>
      <p><strong>Degree level:</strong> ${formData.degreeLevel}</p>
      <p><strong>Field of study:</strong> ${formData.fieldOfStudy}</p>
      <p><strong>Country preference:</strong> ${formData.countryPreference || 'No preference'}</p>
    `

    const scholarshipsHtml = matches.map((m) => `
      <div style="margin-top:20px;padding-top:14px;border-top:1px solid #ccc;">
        <h3 style="font-family:Georgia,serif;font-size:16px;color:#16233B;margin-bottom:6px;">${m.name} (${m.country})</h3>
        <p style="font-size:13px;margin:4px 0;"><strong>Opens:</strong> ${m.opens}</p>
        <p style="font-size:13px;margin:4px 0;"><strong>Closes:</strong> ${m.closes}</p>
        <p style="font-size:13px;margin:4px 0;"><strong>Why it matches:</strong> ${m.why}</p>
        <p style="font-size:13px;margin:4px 0;"><strong>Tip:</strong> ${m.tip}</p>
        ${m.documents && m.documents.length > 0 ? `
          <p style="font-size:13px;margin:8px 0 4px;"><strong>Documents needed:</strong></p>
          <ul style="font-size:13px;padding-left:20px;margin:0;list-style:none;">
            ${m.documents.map((doc, idx) => {
              const key = `${m.name}::${idx}`
              const checked = docChecks[key]
              return `<li>${checked ? '☑' : '☐'} ${doc}</li>`
            }).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')

    const fullHtml = `
      <html>
        <head>
          <title>BursMate — My Scholarship Matches</title>
        </head>
        <body style="font-family: system-ui, sans-serif; padding: 30px; color: #16233B;">
          <h1 style="font-family:Georgia,serif;font-size:22px;">BursMate — My Scholarship Matches</h1>
          ${profileHtml}
          ${scholarshipsHtml}
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(fullHtml)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 300)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMatches([])

    const academicRecord = formData.gradeType === 'CGPA'
      ? `CGPA: ${formData.gradeValue}/4.0`
      : `Intermediate percentage: ${formData.gradeValue}% (has not yet completed a Bachelor's degree)`

    const prompt = `You are a scholarship advisor helping Pakistani students. Respond only in English, and respond with ONLY valid JSON, no markdown, no code fences, no extra text before or after.

Student profile:
- Academic record: ${academicRecord}
- Degree level applying for: ${formData.degreeLevel}
- Field of study: ${formData.fieldOfStudy}
- Country preference: ${formData.countryPreference || 'No preference'}
- IELTS score: ${formData.ieltsScore ? formData.ieltsScore : 'Not taken / not applicable'}
- Financial need: ${formData.financialNeed}
- Age: ${formData.age}
- Gender: ${formData.gender}

Suggest 5 real, currently active scholarships available to Pakistani students (e.g. CSC, Turkiye Burslari, Chevening, DAAD, Erasmus Mundus) that match the profile above. Return a JSON array with exactly this shape:

[
  {
    "name": "Scholarship name",
    "country": "Country offering this scholarship",
    "opens": "typical opening period based on past cycles, e.g. 'Typically opens around March'",
    "closes": "typical closing period based on past cycles, e.g. 'Typically closes around October'",
    "why": "one or two sentences on why it matches this specific student",
    "tip": "one practical tip",
    "documents": ["array of 4-6 specific documents this scholarship typically requires"]
  }
]

Return ONLY the JSON array, nothing else.`

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error.message)
      } else {
        let raw = data.choices[0].message.content.trim()
        raw = raw.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim()
        const parsed = JSON.parse(raw)
        setMatches(parsed)
        localStorage.setItem('bursmate_last_search', JSON.stringify({ formData, matches: parsed }))
        setHasSaved(true)
      }
    } catch (err) {
      setError('Something went wrong reading the results. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Hero
        onOpenForm={openForm}
        onOpenProgress={() => setShowProgress(true)}
        onOpenAuth={() => setShowAuth(true)}
        user={user}
        onLogout={handleLogout}
      />

      {hasSaved && !showForm && user && (
        <div className="saved-banner">
          <p>You have saved matches from your last search.</p>
          <button onClick={loadSavedMatches}>View saved matches</button>
        </div>
      )}

      <HowItWorks />

      {showForm && user && (
        <div className="page">
          <div className="card" id="matcher-form">
            <p className="eyebrow">Scholarship Matcher</p>
            <h1>Find scholarships built for your profile</h1>
            <p className="subtitle">Fill in your details once. We match you against active scholarships for Pakistani students.</p>

            <form onSubmit={handleSubmit} className="matcher-form">
              <div className="row">
                <div className="form-group">
                  <label>Grading system</label>
                  <select name="gradeType" value={formData.gradeType} onChange={handleChange}>
                    <option value="CGPA">CGPA (university)</option>
                    <option value="Percentage">Percentage (Intermediate/FSc)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{formData.gradeType === 'CGPA' ? 'CGPA (out of 4.0)' : 'Percentage (out of 100)'}</label>
                  <input
                    type="number"
                    step={formData.gradeType === 'CGPA' ? '0.01' : '0.1'}
                    min="0"
                    max={formData.gradeType === 'CGPA' ? '4' : '100'}
                    name="gradeValue"
                    value={formData.gradeValue}
                    onChange={handleChange}
                    placeholder={formData.gradeType === 'CGPA' ? 'Enter your GPA here' : 'Enter your percentage'}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Degree level</label>
                <select name="degreeLevel" value={formData.degreeLevel} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Bachelors" disabled={formData.gradeType === 'CGPA'}>Bachelors</option>
                  <option value="Masters" disabled={formData.gradeType === 'Percentage'}>Masters</option>
                  <option value="PhD" disabled={formData.gradeType === 'Percentage'}>PhD</option>
                </select>
                {formData.gradeType === 'Percentage' && (
                  <span className="hint">Masters and PhD need a completed Bachelor's first, so they're locked for Intermediate results.</span>
                )}
                {formData.gradeType === 'CGPA' && (
                  <span className="hint">Bachelors is locked because CGPA means you're already at university level — select Masters or PhD.</span>
                )}
              </div>

              <div className="form-group">
                <label>Field of study</label>
                <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} placeholder="Enter your field of study" required />
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Country preference</label>
                  <input type="text" name="countryPreference" value={formData.countryPreference} onChange={handleChange} placeholder="Country name" />
                </div>
                <div className="form-group">
                  <label>IELTS score (optional)</label>
                  <input type="number" step="0.5" min="0" max="9" name="ieltsScore" value={formData.ieltsScore} onChange={handleChange} placeholder="Enter your IELTS score" />
                </div>
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Financial need</label>
                  <select name="financialNeed" value={formData.financialNeed} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Full funding needed">Full funding needed</option>
                    <option value="Partial funding needed">Partial funding needed</option>
                    <option value="Not needed">Not needed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" min="15" max="65" name="age" value={formData.age} onChange={handleChange} placeholder="Enter your age" required />
                </div>
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Finding matches...' : 'Find my matches'}
              </button>
            </form>

            {error && <div className="error-box">{error}</div>}

            {matches.length > 0 && (
              <div className="results-box">
                <div className="results-header">
                  <p className="eyebrow">Your matches</p>
                  <button type="button" className="print-btn" onClick={() => handlePrint(formData, matches, docChecks)}>Save as PDF</button>
                </div>

                {matches.map((m) => (
                  <div className="match-card" key={m.name}>
                    <div className="match-top">
                      <h3>{m.name}</h3>
                      <select
                        className="status-select"
                        value={statuses[m.name] || 'Not started'}
                        onChange={(e) => updateStatus(m.name, e.target.value)}
                      >
                        <option value="Not started">Not started</option>
                        <option value="In progress">In progress</option>
                        <option value="Submitted">Submitted</option>
                      </select>
                    </div>
                    <div className="match-dates">
                      <span><strong>Opens:</strong> {m.opens}</span>
                      <span><strong>Closes:</strong> {m.closes}</span>
                    </div>
                    <p className="match-why">{m.why}</p>
                    <p className="match-tip"><strong>Tip:</strong> {m.tip}</p>

                    {m.documents && m.documents.length > 0 && (
                      <div className="match-documents">
                        <strong>Documents needed:</strong>
                        <ul className="doc-checklist">
                          {m.documents.map((doc, idx) => {
                            const key = `${m.name}::${idx}`
                            return (
                              <li key={idx}>
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={!!docChecks[key]}
                                    onChange={() => toggleDoc(m.name, idx)}
                                  />
                                  <span className={docChecks[key] ? 'doc-checked' : ''}>{doc}</span>
                                </label>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(m.name + ' official website apply')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apply-btn"
                    >
                      Search Official Website →
                    </a>
                  </div>
                ))}

                <p className="disclaimer">Dates are based on typical past cycles where exact figures aren't public. Always confirm the current deadline on the scholarship's official website before applying.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ChatAssistant />

      {showProgress && <MyProgress onClose={() => setShowProgress(false)} />}
      {showAuth && <Auth onClose={() => setShowAuth(false)} onLoginSuccess={setUser} />}
    </>
  )
}

export default App