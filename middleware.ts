import { NextRequest, NextResponse } from 'next/server'
export function middleware(r: NextRequest) {
  const h = r.headers.get('authorization') || ''
  const ok = h.startsWith('Basic ') && atob(h.slice(6)) === `admin:${process.env.ADMIN_PASSWORD}`
  return ok ? NextResponse.next() : new NextResponse('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="admin"' } })
}
export const config = { matcher: ['/admin/:path*'] }
