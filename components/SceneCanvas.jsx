'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { buildRoom } from '@/lib/room'
import { setupLanding } from '@/lib/landing'
import { setupInteraction } from '@/lib/interaction'

export default function SceneCanvas() {
  const canvasRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !canvasRef.current) return
    initialized.current = true

    const canvas = canvasRef.current
    const loadingEl = document.getElementById('loading')

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f5ede0')

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0

    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 10
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100,
    )
    camera.position.set(10, 8, 10)
    camera.lookAt(0, 0.8, 0)

    const controls = new OrbitControls(camera, canvas)
    controls.enablePan = false
    controls.enableDamping = false
    controls.target.set(0, 0.8, 0)
    controls.enabled = false

    const ambient = new THREE.AmbientLight(0xfff1e0, 0.6)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffe8c4, 1.3)
    sun.position.set(8, 14, 6)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -8
    sun.shadow.camera.right = 8
    sun.shadow.camera.top = 8
    sun.shadow.camera.bottom = -8
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 40
    sun.shadow.bias = -0.0005
    scene.add(sun)

    const hemi = new THREE.HemisphereLight(0xc8d9ff, 0xd9b48e, 0.35)
    scene.add(hemi)

    const loader = new GLTFLoader()

    buildRoom({ scene, loader }).then(({ interactive }) => {
      setupInteraction({ camera, scene, canvas, interactive })
      setupLanding({ camera, controls, scene, ambient, sun, hemi, renderer })
      if (loadingEl) loadingEl.classList.add('hidden')
    }).catch((err) => {
      console.error('Room build failed:', err)
      if (loadingEl) loadingEl.textContent = 'Error cargando la escena'
    })

    const onResize = () => {
      const a = window.innerWidth / window.innerHeight
      camera.left = -frustumSize * a / 2
      camera.right = frustumSize * a / 2
      camera.top = frustumSize / 2
      camera.bottom = -frustumSize / 2
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let frameId
    function animate() {
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frameId)
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} id="scene" />
}
