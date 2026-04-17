import './globals.css'

export const metadata = {
  title: 'Café Aurora — Donde el día empieza',
  description: 'Un rincón de barrio para tu primera taza, tu mejor croissant y la tarde que no quería terminar.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
