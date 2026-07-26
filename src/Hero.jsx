async function enableNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Notifications is not supported on this browser.')
    return
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      alert('Please allow notifications to get deadline alerts.')
      return
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    })

    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    })

    alert('Notifications enabled! You will be alerted about scholarship deadlines.')
  } catch (err) {
    console.error(err)
    alert('Something went wrong enabling notifications.')
  }
}

function Hero({ onOpenForm, onOpenProgress, onOpenAuth, user, onLogout }) {
  return (
    <section className="hero" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}>
      <div className="hero-overlay"></div>

      <nav className="hero-nav">
        <span className="hero-nav-logo">BursMate</span>
        {!user ? (
          <button className="hero-nav-btn" onClick={onOpenAuth}>Sign In</button>
        ) : (
          <div className="hero-nav-user">
            <span>Hi, {user.name}</span>
            <button className="hero-nav-btn" onClick={onLogout}>Sign out</button>
          </div>
        )}
      </nav>

      <div className="hero-content">
        <p className="hero-eyebrow">BursMate</p>
        <h1 className="hero-title">Your scholarship journey<br />starts here</h1>
        <p className="hero-subtitle">One profile. Every matching scholarship for Pakistani students, found for you.</p>

        {!user ? (
          <p className="hero-lock-note">Sign in above to unlock the matcher, deadline alerts, and your progress.</p>
        ) : (
          <>
            <button className="hero-cta" onClick={onOpenForm}>Set Your Profile</button>
            <button className="hero-cta-secondary" onClick={enableNotifications}>Enable Deadline Alerts</button>
            <button className="hero-cta-secondary" onClick={onOpenProgress}>My Progress</button>
          </>
        )}
      </div>

      <div className="hero-stats">
        <div className="stat"><span>Scholarships</span>CSC · DAAD · Turkiye · Chevening</div>
        <div className="stat"><span>Powered by</span>AI Matching</div>
        <div className="stat"><span>Cost</span>Free to use</div>
      </div>
      <div className="hero-fade"></div>
    </section>
  )
}

export default Hero