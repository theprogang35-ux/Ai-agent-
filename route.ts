import { db } from '@/lib/supabase'
import { answer, n8n } from '@/lib/agent'

// WhatsApp verification handshake
export async function GET(req: Request) {
  const u = new URL(req.url)
  return u.searchParams.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN
    ? new Response(u.searchParams.get('hub.challenge')) : new Response('forbidden', { status: 403 })
}

export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  const b = await req.json()
  await n8n(`webhook_${provider}`, { body: b })

  if (provider === 'cal') { // Cal.com -> Webhooks -> BOOKING_CREATED
    const p = b.payload, a = p?.attendees?.[0] || {}
    const { data } = await db().from('leads').update({ meeting_time: p.startTime, name: a.name }).eq('email', a.email).select()
    if (!data?.length) await db().from('leads').insert({ session_id: `cal-${p.uid}`, name: a.name, email: a.email, meeting_time: p.startTime, source: 'cal' })
  }

  if (provider === 'telegram') {
    const m = b.message; if (!m?.text) return Response.json({ ok: true })
    const r = answer(m.text)
    await db().from('leads').upsert({ session_id: `tg-${m.chat.id}`, name: m.from?.first_name, product_asked: r.product || undefined, source: 'telegram' }, { onConflict: 'session_id' })
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: m.chat.id, text: r.reply }) })
  }

  if (provider === 'whatsapp') {
    const m = b.entry?.[0]?.changes?.[0]?.value?.messages?.[0]; if (!m?.text) return Response.json({ ok: true })
    const r = answer(m.text.body)
    await db().from('leads').upsert({ session_id: `wa-${m.from}`, phone: m.from, product_asked: r.product || undefined, source: 'whatsapp' }, { onConflict: 'session_id' })
    await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }, body: JSON.stringify({ messaging_product: 'whatsapp', to: m.from, text: { body: r.reply } }) })
  }
  return Response.json({ ok: true })
}
