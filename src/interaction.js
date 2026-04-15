import * as THREE from 'three'

export function setupInteraction({ camera, scene, canvas, interactive }) {
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const tooltip = document.getElementById('tooltip')
  let hoveredRoot = null

  function rootOf(obj) {
    let cur = obj
    while (cur && !cur.userData?.interactive) cur = cur.parent
    return cur
  }

  function setHoverScale(root, target) {
    if (!root._baseScale) root._baseScale = root.scale.clone()
    root._hoverTarget = target
  }

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(interactive, true)
    const hit = hits.length > 0 ? rootOf(hits[0].object) : null

    if (hit !== hoveredRoot) {
      if (hoveredRoot) setHoverScale(hoveredRoot, 1.0)
      hoveredRoot = hit
      if (hit) setHoverScale(hit, 1.08)
    }

    if (hit && hit.userData.label) {
      tooltip.textContent = hit.userData.label
      tooltip.style.left = `${e.clientX}px`
      tooltip.style.top = `${e.clientY}px`
      tooltip.classList.add('visible')
      canvas.classList.add('hovering')
    } else {
      tooltip.classList.remove('visible')
      canvas.classList.remove('hovering')
    }
  }

  function onClick() {
    if (!hoveredRoot) return
    hoveredRoot._bounceT = 0
  }

  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('click', onClick)

  function tick() {
    for (const obj of interactive) {
      if (obj._baseScale && obj._hoverTarget != null) {
        const current = obj.scale.x / obj._baseScale.x
        const next = current + (obj._hoverTarget - current) * 0.18
        obj.scale.copy(obj._baseScale).multiplyScalar(next)
      }
      if (obj._bounceT != null) {
        obj._bounceT += 0.08
        const bounce = Math.sin(obj._bounceT * Math.PI) * 0.3
        obj.position.y += bounce * (obj._bounceT < 1 ? 1 : 0) * 0.02
        if (obj._bounceT >= 1) obj._bounceT = null
      }
    }
    requestAnimationFrame(tick)
  }
  tick()
}
