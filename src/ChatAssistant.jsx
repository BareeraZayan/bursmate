import { useState, useRef, useEffect } from 'react'

function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I can help you write your Statement of Purpose, draft a recommendation letter, or answer questions about scholarship documents. What do you need help with?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('bursmate_chat_history')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.length > 0) setMessages(parsed)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const systemPrompt = {
      role: 'system',
      content: 'You are a helpful assistant inside BursMate, a scholarship platform for Pakistani students. You help students in three main ways: (1) Drafting or improving a Statement of Purpose (SOP) — ask what scholarship and field of study it is for if not given, then produce a strong, personalized draft. (2) Drafting recommendation letter templates that the student can give to their referee. (3) Explaining what documents a specific scholarship typically requires and how to prepare each one. Always ask a clarifying question first if the student has not given enough detail to write something useful. Keep answers practical, structured, and specific. Respond in English.'
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [systemPrompt, ...newMessages],
        }),
      })
      const data = await response.json()
      let finalMessages
      if (data.error) {
        finalMessages = [...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]
      } else {
        finalMessages = [...newMessages, { role: 'assistant', content: data.choices[0].message.content }]
      }
      setMessages(finalMessages)
      localStorage.setItem('bursmate_chat_history', JSON.stringify(finalMessages))
    } catch (err) {
      const finalMessages = [...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]
      setMessages(finalMessages)
      localStorage.setItem('bursmate_chat_history', JSON.stringify(finalMessages))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className={`chat-panel ${expanded ? 'chat-panel-expanded' : ''}`}>
          <div className="chat-header">
            <span>BursMate Assistant</span>
            <div className="chat-header-actions">
              <button onClick={() => setExpanded(!expanded)} title={expanded ? 'Shrink' : 'Expand'}>
                {expanded ? '⤡' : '⤢'}
              </button>
              <button onClick={() => setOpen(false)}>×</button>
            </div>
          </div>
          <div className="chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="chat-bubble assistant">Typing...</div>}
          </div>
          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your SOP, documents..."
            />
            <button type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      )}
      {!open && (
        <button className="chat-toggle-labeled" onClick={() => setOpen(true)}>
          <span className="chat-toggle-icon">💬</span>
          <span className="chat-toggle-label">Need help? Ask BursMate</span>
        </button>
      )}
      {open && (
        <button className="chat-toggle" onClick={() => setOpen(false)}>×</button>
      )}
    </div>
  )
}

export default ChatAssistant