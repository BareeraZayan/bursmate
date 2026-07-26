import { useState } from 'react'

function Auth({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (!response.ok) {
          setError(data.error)
        } else {
          setMode('login')
          setError('Account created! Please log in.')
        }
      } else {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        })
        const data = await response.json()
        if (!response.ok) {
          setError(data.error)
        } else {
          localStorage.setItem('bursmate_user', JSON.stringify({ token: data.token, name: data.name, email: data.email }))
          onLoginSuccess({ name: data.name, email: data.email })
          onClose()
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="progress-overlay">
      <div className="progress-panel">
        <div className="progress-header">
          <p className="eyebrow">{mode === 'login' ? 'Sign In' : 'Sign Up'}</p>
          <button className="progress-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="matcher-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" required minLength={6} />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {error && <div className="error-box">{error}</div>}

        <p className="progress-empty" style={{ marginTop: '16px', cursor: 'pointer' }} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </p>
      </div>
    </div>
  )
}

export default Auth