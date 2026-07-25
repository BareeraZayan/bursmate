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
function Hero({ onOpenForm }) {
  return (
    <section className="hero" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <p className="hero-eyebrow">BursMate</p>
        <h1 className="hero-title">Your scholarship journey<br />starts here</h1>
        <p className="hero-subtitle">One profile. Every matching scholarship for Pakistani students, found for you.</p>
        <button className="hero-cta" onClick={onOpenForm}>Set Your Profile</button>
        <button className="hero-cta-secondary" onClick={enableNotifications}>Enable Deadline Alerts</button>
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