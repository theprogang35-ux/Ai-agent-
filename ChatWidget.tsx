'use client'
import { useEffect, useRef, useState } from 'react'

type Msg = { role: 'bot' | 'user'; text: string }
type View = 'chat' | 'book' | 'email' | 'done'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('chat')
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: 'Hi 👋 Ask me about our products, book a call, or talk to a human.' }])
  const [input, setInput] = useState(''); const [name, setName] = useState(''); const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sid] = useState(() => (typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now())))
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, view, open])

  const call = (body: any) => fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sid, ...body }) }).then(r => r.json())

  async function send(text: string) {
    if (!text.trim() || busy) return
    const next = [...msgs, { role: 'user', text } as Msg]; setMsgs(next); setInput(''); setBusy(true)
    try { const { reply } = await call({ action: 'message', text, history: next }); setMsgs([...next, { role: 'bot', text: reply }]) }
    catch { setMsgs([...next, { role: 'bot', text: 'Something went wrong. Please try again.' }]) }
    setBusy(false)
  }
  async function submitHuman(e: React.FormEvent) {
    e.preventDefault(); setBusy(true)
    await call({ action: 'human', name, email, history: msgs }); setBusy(false); setView('done')
  }

  const btn = 'rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/10'
  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {open && (
        <div className="mb-3 flex h-[560px] max-h-[80vh] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14]/95 shadow-2xl shadow-violet-900/20 backdrop-blur-xl">
          <header className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 px-4 py-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold">N</div>
            <div className="flex-1"><p className="text-sm font-medium">Nova</p><p className="flex items-center gap-1.5 text-xs text-zinc-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Online</p></div>
            {view !== 'chat' && <button onClick={() => setView('chat')} className="text-xs text-zinc-400 hover:text-white">← Back</button>}
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white" aria-label="Close">✕</button>
          </header>

          {view === 'chat' && <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
                  <p className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white' : 'bg-white/5 text-zinc-200'}`}>{m.text}</p>
                </div>))}
              {busy && <p className="text-xs text-zinc-500">Nova is typing…</p>}
              <div ref={end} />
            </div>
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              <button className={btn} onClick={() => send('What are your plans and pricing?')}>💬 Pricing</button>
              <button className={btn} onClick={() => setView('book')}>📅 Book a call</button>
              <button className={btn} onClick={() => setView('email')}>🙋 Talk to a human</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); send(input) }} className="flex gap-2 border-t border-white/10 p-3">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about a product…" className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-violet-500" />
              <button className="rounded-xl bg-violet-600 px-4 text-sm font-medium hover:bg-violet-500">Send</button>
            </form>
          </>}

          {view === 'book' && <iframe className="flex-1 bg-[#0d0d14]" src={`https://cal.com/${process.env.NEXT_PUBLIC_CAL_LINK}?embed=true&theme=dark`} title="Book a meeting" />}

          {view === 'email' && (
            <form onSubmit={submitHuman} className="flex flex-1 flex-col justify-center gap-3 px-6">
              <h3 className="text-lg font-medium">Talk to a human</h3>
              <p className="text-sm text-zinc-400">Leave your email and a teammate will get back to you.</p>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Name (optional)" className="rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-violet-500" />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-violet-500" />
              <button disabled={busy} className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-medium disabled:opacity-60">{busy ? 'Sending…' : 'Continue'}</button>
            </form>)}

          {view === 'done' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">✓</div>
              <h3 className="text-lg font-medium">We will email you</h3>
              <p className="text-sm text-zinc-400">Expect a reply at {email} soon.</p>
            </div>)}
        </div>)}
      <button onClick={() => setOpen(o => !o)} aria-label="Open chat" className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl shadow-lg shadow-violet-900/40 transition hover:scale-105">{open ? '✕' : '💬'}</button>
    </div>
  )
}
