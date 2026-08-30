import './globals.css'

export const metadata = {
  title: 'DatalytIQs Analytics Lab',
  description: 'Learn. Analyse. Interpret. Decide.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
