import { useState, useEffect } from 'react'

function MyProgress({ onClose }) {
  const [data, setData] = useState(null)
  const [statuses, setStatuses] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('bursmate_last_search')
    if (saved) setData(JSON.parse(saved))
    const savedStatuses = localStorage.getItem('bursmate_tracker')
    if (savedStatuses) setStatuses(JSON.parse(savedStatuses))
  }, [])

  const updateStatus = (name, status) => {
    const updated = { ...statuses, [name]: status }
    setStatuses(updated)
    localStorage.setItem('bursmate_tracker', JSON.stringify(updated))
  }

  return (
    <div className="progress-overlay">
      <div className="progress-panel">
        <div className="progress-header">
          <p className="eyebrow">My Progress</p>
          <button className="progress-close" onClick={onClose}>×</button>
        </div>

        {!data ? (
          <p className="progress-empty">No saved profile yet. Fill out the matcher form first to see your progress here.</p>
        ) : (
          <>
            <div className="progress-profile">
              <h3>Your profile</h3>
              <p><strong>Academic record:</strong> {data.formData.gradeType === 'CGPA' ? `CGPA ${data.formData.gradeValue}/4.0` : `${data.formData.gradeValue}% (Intermediate)`}</p>
              <p><strong>Degree level:</strong> {data.formData.degreeLevel}</p>
              <p><strong>Field of study:</strong> {data.formData.fieldOfStudy}</p>
              <p><strong>Country preference:</strong> {data.formData.countryPreference || 'No preference'}</p>
            </div>

            <div className="progress-list">
              <h3>Your matches</h3>
              {data.matches.map((m) => (
                <div className="progress-item" key={m.name}>
                  <span>{m.name}</span>
                  <select
                    value={statuses[m.name] || 'Not started'}
                    onChange={(e) => updateStatus(m.name, e.target.value)}
                  >
                    <option value="Not started">Not started</option>
                    <option value="In progress">In progress</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyProgress