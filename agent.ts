// Edit this catalog with the client's real products. Swap answer() for an LLM/n8n call later.
export const PRODUCTS = [
  { name: 'Starter', k: ['starter', 'basic', 'small'], a: 'Starter is $49/mo: 1 workspace, 1 channel, email support.' },
  { name: 'Growth', k: ['growth', 'pro', 'team'], a: 'Growth is $149/mo: 5 channels, automations, priority support.' },
  { name: 'Enterprise', k: ['enterprise', 'custom', 'sso'], a: 'Enterprise is custom: SSO, SLA, dedicated manager. Book a call to scope it.' },
]
export function answer(q: string) {
  const t = q.toLowerCase()
  const p = PRODUCTS.find(p => p.k.some(k => t.includes(k)))
  if (p) return { reply: p.a, product: p.name }
  if (/price|cost|pricing|plan/.test(t)) return { reply: 'We have Starter ($49), Growth ($149) and Enterprise (custom). Which one fits you?', product: null }
  return { reply: "I can help with products and pricing, or you can book a call or talk to a human.", product: null }
}
export const n8n = (event: string, data: any) =>
  process.env.N8N_WEBHOOK_URL ? fetch(process.env.N8N_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event, ...data }) }).catch(() => {}) : undefined
