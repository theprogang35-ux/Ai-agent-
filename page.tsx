import { db } from '@/lib/supabase'
export const dynamic = 'force-dynamic'

export default async function Admin() {
  const { data } = await db().from('leads').select('*').order('created_at', { ascending: false })
  const leads: any[] = data || []
  const fmt = (d?: string) => d ? new Date(d).toLocaleString() : '—'
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Leads</h1><p className="text-sm text-zinc-400">{leads.length} total · {leads.filter(l => l.meeting_time).length} meetings · {leads.filter(l => l.needs_human).length} want a human</p></div>
        <a href="/" className="text-sm text-zinc-400 hover:text-white">← Site</a>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
            <tr>{['Name', 'Email', 'Phone', 'Product Asked', 'Meeting Time', 'Chat History'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map(l => (
              <tr key={l.id} className="align-top hover:bg-white/[0.03]">
                <td className="px-4 py-3">{l.name || '—'}{l.needs_human && <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-400">human</span>}</td>
                <td className="px-4 py-3 text-zinc-300">{l.email || '—'}</td>
                <td className="px-4 py-3 text-zinc-300">{l.phone || '—'}</td>
                <td className="px-4 py-3">{l.product_asked ? <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs text-violet-300">{l.product_asked}</span> : '—'}</td>
                <td className="px-4 py-3 text-zinc-300">{fmt(l.meeting_time)}</td>
                <td className="px-4 py-3">
                  <details><summary className="cursor-pointer text-violet-400">{(l.chat_history || []).length} messages</summary>
                    <div className="mt-2 max-w-sm space-y-1 text-xs text-zinc-400">{(l.chat_history || []).map((m: any, i: number) => <p key={i}><b className="text-zinc-300">{m.role}:</b> {m.text}</p>)}</div>
                  </details>
                </td>
              </tr>))}
            {!leads.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">No leads yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  )
}
