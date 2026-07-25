self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'BursMate'
  const options = {
    body: data.body || 'A scholarship deadline update is available.',
    icon: '/icons.svg',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})