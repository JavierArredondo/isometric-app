'use client'

import dynamic from 'next/dynamic'

const SceneCanvas = dynamic(() => import('@/components/SceneCanvas'), {
  ssr: false,
  loading: () => <div id="loading" className="loading">Cargando…</div>,
})

export default function Home() {
  return (
    <>
      <SceneCanvas />
      <div id="tooltip" className="tooltip" />

      <header className="nav">
        <span className="logo">☕ Café Aurora</span>
        <nav>
          <a href="#brew">Café</a>
          <a href="#pastries">Pastelería</a>
          <a href="#cozy">Espacio</a>
          <a href="#hours">Horario</a>
          <a href="https://github.com/JavierArredondo/isometric-app" target="_blank" rel="noopener noreferrer" className="repo-link" aria-label="Ver repositorio en GitHub">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </nav>
      </header>

      <main id="story">
        <section className="panel hero" data-step="0">
          <div className="panel-inner">
            <p className="eyebrow">Café · Pastelería · Espacio</p>
            <h1>Donde el día<br />empieza despacio.</h1>
            <p className="lead">Un rincón de barrio para tu primera taza, tu mejor croissant y la tarde que no quería terminar.</p>
            <a className="cta" href="#brew">Pasa a conocer ↓</a>
          </div>
        </section>

        <section className="panel" id="brew" data-step="1">
          <div className="panel-inner">
            <p className="eyebrow">01 · El café</p>
            <h2>Tostado en casa,<br />servido a mano.</h2>
            <p>Granos de origen único traídos cada mes. Espresso doble por defecto, métodos manuales bajo pedido. Sin prisa.</p>
          </div>
        </section>

        <section className="panel" id="pastries" data-step="2">
          <div className="panel-inner">
            <p className="eyebrow">02 · Pastelería</p>
            <h2>Hojaldre fresco<br />desde las 6 am.</h2>
            <p>Croissants, muffins, pastel del día. Receta corta, mantequilla buena, el horno encendido antes que tú.</p>
          </div>
        </section>

        <section className="panel" id="cozy" data-step="3">
          <div className="panel-inner">
            <p className="eyebrow">03 · El espacio</p>
            <h2>Una mesa<br />siempre lista.</h2>
            <p>Sin reservas, sin minimums, wifi rápido. Para trabajar, para una primera cita, o para no hacer absolutamente nada.</p>
          </div>
        </section>

        <section className="panel" id="hours" data-step="4">
          <div className="panel-inner">
            <p className="eyebrow">04 · Horario</p>
            <h2>De la salida del sol<br />al final de la noche.</h2>
            <p>Lunes a sábado, 6 am — 11 pm. Domingo, hasta las 4 pm. Si la luz está encendida, está abierto.</p>
          </div>
        </section>

        <section className="panel cta-panel" data-step="5">
          <div className="panel-inner">
            <p className="eyebrow">Visítanos</p>
            <h2>Calle Aurora 12<br /><span className="muted">Colonia Roma · CDMX</span></h2>
            <a className="cta" href="#" onClick={(e) => e.preventDefault()}>Cómo llegar →</a>
          </div>
        </section>
      </main>

      <div className="scroll-hint" id="scroll-hint">
        <span>Scroll</span>
        <svg width="14" height="20" viewBox="0 0 14 20">
          <path d="M7 1v15M1 11l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  )
}
