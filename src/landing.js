import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DAY = {
  bg: '#f5ede0',
  ambient: { color: 0xfff1e0, intensity: 0.6 },
  sun: { color: 0xffe8c4, intensity: 1.3 },
  hemi: { sky: 0xc8d9ff, ground: 0xd9b48e, intensity: 0.35 },
  exposure: 1.0,
}

const NIGHT = {
  bg: '#1a1f2e',
  ambient: { color: 0x6f7cb3, intensity: 0.25 },
  sun: { color: 0xffcf7a, intensity: 0.45 },
  hemi: { sky: 0x1f2a45, ground: 0x2a1b3a, intensity: 0.2 },
  exposure: 0.85,
}

// Camera keyframes — one per .panel section
const STEPS = [
  // 0 hero — wide overview
  { camPos: [10, 8, 10],  target: [0, 1.0, 0],     zoom: 1.3,  theme: DAY,   highlight: null },
  // 1 brew — zoom to coffee machine
  { camPos: [6, 5, 6],    target: [-1.6, 1.4, -3], zoom: 1.6,  theme: DAY,   highlight: 'coffee-machine' },
  // 2 pastries — pan to pastries on counter
  { camPos: [6, 4.5, 6],  target: [0.3, 1.2, -3],  zoom: 1.7,  theme: DAY,   highlight: 'croissant' },
  // 3 cozy — focus on dining table
  { camPos: [5, 6, 6],    target: [1.0, 0.9, 1.3], zoom: 1.5,  theme: DAY,   highlight: 'cake' },
  // 4 hours — wide, transition to night
  { camPos: [10, 8, 10],  target: [0, 1.0, 0],     zoom: 1.3,  theme: NIGHT, highlight: null },
  // 5 cta — slight different angle, night
  { camPos: [9, 7, 11],   target: [0, 1.0, 0],     zoom: 1.35, theme: NIGHT, highlight: null },
]

function lerpColor(a, b, t) {
  return new THREE.Color(a).lerp(new THREE.Color(b), t)
}

function applyTheme(theme, { ambient, sun, hemi, scene, renderer }) {
  scene.background = new THREE.Color(theme.bg)
  ambient.color.set(theme.ambient.color)
  ambient.intensity = theme.ambient.intensity
  sun.color.set(theme.sun.color)
  sun.intensity = theme.sun.intensity
  hemi.color.set(theme.hemi.sky)
  hemi.groundColor.set(theme.hemi.ground)
  hemi.intensity = theme.hemi.intensity
  renderer.toneMappingExposure = theme.exposure
}

function lerpTheme(from, to, t, ctx) {
  const mix = (a, b) => a + (b - a) * t
  applyTheme({
    bg: '#' + lerpColor(from.bg, to.bg, t).getHexString(),
    ambient: {
      color: lerpColor(from.ambient.color, to.ambient.color, t).getHex(),
      intensity: mix(from.ambient.intensity, to.ambient.intensity),
    },
    sun: {
      color: lerpColor(from.sun.color, to.sun.color, t).getHex(),
      intensity: mix(from.sun.intensity, to.sun.intensity),
    },
    hemi: {
      sky: lerpColor(from.hemi.sky, to.hemi.sky, t).getHex(),
      ground: lerpColor(from.hemi.ground, to.hemi.ground, t).getHex(),
      intensity: mix(from.hemi.intensity, to.hemi.intensity),
    },
    exposure: mix(from.exposure, to.exposure),
  }, ctx)
}

function findByName(scene, name) {
  let found = null
  scene.traverse((n) => { if (n.name === name) found = n })
  return found
}

export function setupLanding({ camera, controls, scene, ambient, sun, hemi, renderer }) {
  controls.enabled = false

  const state = {
    camPos: new THREE.Vector3(...STEPS[0].camPos),
    target: new THREE.Vector3(...STEPS[0].target),
    zoom: STEPS[0].zoom,
  }

  // Apply initial state
  camera.position.copy(state.camPos)
  camera.zoom = state.zoom
  camera.updateProjectionMatrix()
  controls.target.copy(state.target)
  applyTheme(STEPS[0].theme, { ambient, sun, hemi, scene, renderer })

  // Track current night state for body class
  let currentNight = STEPS[0].theme === NIGHT
  document.body.classList.toggle('night', currentNight)

  const panels = Array.from(document.querySelectorAll('#story .panel'))

  // Hide scroll hint after first scroll
  const hint = document.getElementById('scroll-hint')
  ScrollTrigger.create({
    trigger: panels[0],
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      hint?.classList.toggle('hidden', self.progress > 0.05)
    },
  })

  // Build per-section ScrollTriggers; each transitions FROM panel[i-1] TO panel[i]
  panels.forEach((panel, i) => {
    if (i === 0) return // first is just initial state
    const from = STEPS[i - 1]
    const to = STEPS[i]

    ScrollTrigger.create({
      trigger: panel,
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
      onUpdate: (self) => {
        const t = self.progress

        const fromPos = new THREE.Vector3(...from.camPos)
        const toPos = new THREE.Vector3(...to.camPos)
        camera.position.lerpVectors(fromPos, toPos, t)

        const fromTgt = new THREE.Vector3(...from.target)
        const toTgt = new THREE.Vector3(...to.target)
        controls.target.lerpVectors(fromTgt, toTgt, t)

        camera.zoom = from.zoom + (to.zoom - from.zoom) * t
        camera.updateProjectionMatrix()
        camera.lookAt(controls.target)

        if (from.theme !== to.theme) {
          lerpTheme(from.theme, to.theme, t, { ambient, sun, hemi, scene, renderer })
          const isNight = t > 0.5 ? to.theme === NIGHT : from.theme === NIGHT
          if (isNight !== currentNight) {
            currentNight = isNight
            document.body.classList.toggle('night', isNight)
          }
        } else {
          applyTheme(to.theme, { ambient, sun, hemi, scene, renderer })
        }
      },
    })
  })

  // Highlight active object per section (separate triggers, simpler logic)
  const highlightState = new Map()
  panels.forEach((panel, i) => {
    const step = STEPS[i]
    if (!step.highlight) return
    ScrollTrigger.create({
      trigger: panel,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => activateHighlight(scene, step.highlight, highlightState),
      onEnterBack: () => activateHighlight(scene, step.highlight, highlightState),
      onLeave: () => deactivateHighlight(scene, step.highlight, highlightState),
      onLeaveBack: () => deactivateHighlight(scene, step.highlight, highlightState),
    })
  })
}

function activateHighlight(scene, name, state) {
  const obj = findByName(scene, name)
  if (!obj) return
  if (!state.has(name)) state.set(name, { baseScale: obj.scale.clone(), baseY: obj.position.y })
  const ref = state.get(name)
  gsap.to(obj.scale, {
    x: ref.baseScale.x * 1.15,
    y: ref.baseScale.y * 1.15,
    z: ref.baseScale.z * 1.15,
    duration: 0.6,
    ease: 'power2.out',
  })
  gsap.to(obj.position, {
    y: ref.baseY + 0.15,
    duration: 0.8,
    ease: 'power2.out',
    yoyo: true,
    repeat: -1,
    repeatDelay: 0.8,
  })
}

function deactivateHighlight(scene, name, state) {
  const obj = findByName(scene, name)
  if (!obj) return
  const ref = state.get(name)
  if (!ref) return
  gsap.killTweensOf(obj.scale)
  gsap.killTweensOf(obj.position)
  gsap.to(obj.scale, {
    x: ref.baseScale.x,
    y: ref.baseScale.y,
    z: ref.baseScale.z,
    duration: 0.4,
    ease: 'power2.inOut',
  })
  gsap.to(obj.position, { y: ref.baseY, duration: 0.4, ease: 'power2.inOut' })
}
