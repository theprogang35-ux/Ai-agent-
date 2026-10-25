import './globals.css'
import ChatWidget from '@/components/ChatWidget'
export const metadata = { title: 'Nova AI — Your 24/7 sales agent' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<ChatWidget /></body></html>
}
