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
