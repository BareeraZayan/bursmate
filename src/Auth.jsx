import { useState } from 'react'

function Auth({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const doLogin = async (email, password) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data.error)
      return false
    }
    localStorage.setItem('bursmate_user', JSON.stringify({ token: data.token, name: data.name, email: data.email }))
    onLoginSuccess({ name: data.name, email: data.email })
    onClose()
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      const passwordRules = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/
      if (!passwordRules.test(formData.password)) {
        setError('Password must be at least 8 characters, with at least 1 capital letter and 1 number.')
        return
      }
    }

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
          await doLogin(formData.email, formData.password)
        }
      } else {
        await doLogin(formData.email, formData.password)
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
            {mode === 'signup' && (
              <span className="hint">Must be 8+ characters, with at least 1 capital letter and 1 number.</span>
            )}
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