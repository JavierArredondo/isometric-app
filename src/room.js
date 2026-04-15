import * as THREE from 'three'

const FURN = '/models/furniture'
const FOOD = '/models/food'

function loadGLB(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject)
  })
}

function prepareMesh(obj) {
  obj.traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true
      n.receiveShadow = true
      if (n.material) n.material.side = THREE.FrontSide
    }
  })
  return obj
}

function bboxOf(obj) { return new THREE.Box3().setFromObject(obj) }

function place(obj, opts = {}) {
  const {
    x = 0, y = null, z = 0, ry = 0, s = 1,
    name, label, interactive,
    snapToFloor = true,
    onTopOf = null,
    yOffset = 0,
  } = opts

  obj.position.set(x, 0, z)
  obj.rotation.y = ry
  obj.scale.setScalar(s)
  obj.updateMatrixWorld(true)

  let finalY = y
  if (finalY == null) {
    if (onTopOf) {
      const parentBox = bboxOf(onTopOf)
      const myBox = bboxOf(obj)
      finalY = parentBox.max.y - myBox.min.y
    } else if (snapToFloor) {
      const myBox = bboxOf(obj)
      finalY = -myBox.min.y
    } else {
      finalY = 0
    }
  }
  obj.position.y = finalY + yOffset

  if (name) obj.name = name
  if (label) obj.userData.label = label
  if (interactive) {
    obj.userData.interactive = true
    interactive.push(obj)
  }
  return obj
}

function makeWoodFloorTexture(size = 1024, planksX = 10) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const plankH = size / planksX
  const baseColors = ['#b6844f', '#a6723e', '#c69862', '#ae7a43', '#b88653', '#a87845']
  for (let i = 0; i < planksX; i++) {
    ctx.fillStyle = baseColors[i % baseColors.length]
    ctx.fillRect(0, i * plankH, size, plankH)
    ctx.globalAlpha = 0.09
    for (let g = 0; g < 70; g++) {
      ctx.fillStyle = Math.random() < 0.5 ? '#000' : '#fff'
      const gy = i * plankH + Math.random() * plankH
      ctx.fillRect(0, gy, size, 1 + Math.random() * 1.5)
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = 'rgba(30,20,10,0.45)'
    ctx.fillRect(0, i * plankH, size, 2)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function makeWallArt({ w, h, inner }) {
  const g = new THREE.Group()
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.04),
    new THREE.MeshStandardMaterial({ color: '#6b4a2a', roughness: 0.8 }),
  )
  g.add(frame)
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.86, h * 0.86),
    new THREE.MeshStandardMaterial({ color: inner, roughness: 0.9 }),
  )
  art.position.z = 0.025
  g.add(art)
  g.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true } })
  return g
}

function makeChalkboard(w, h) {
  const g = new THREE.Group()
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.05),
    new THREE.MeshStandardMaterial({ color: '#5a3a1c', roughness: 0.7 }),
  )
  g.add(frame)
  // board
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ color: '#1f2d1f', roughness: 0.85 }),
  )
  board.position.z = 0.028
  g.add(board)
  // chalk strokes (simple white rectangles)
  const mkLine = (lw, lh, lx, ly, col = 0xffffff) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(lw, lh),
      new THREE.MeshBasicMaterial({ color: col }),
    )
    m.position.set(lx, ly, 0.03)
    g.add(m)
  }
  // "MENU" big
  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.28, h * 0.15),
    new THREE.MeshBasicMaterial({ color: 0xfff2c4 }),
  )
  title.position.set(0, h * 0.32, 0.03)
  g.add(title)
  // row lines representing menu items
  for (let i = 0; i < 4; i++) {
    mkLine(w * 0.6, h * 0.04, -w * 0.1, h * 0.1 - i * h * 0.17)
    mkLine(w * 0.12, h * 0.04, w * 0.28, h * 0.1 - i * h * 0.17, 0xffd078)
  }
  g.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true } })
  return g
}

function makeWallShelf(w, color = '#6b4a2a') {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.06, 0.35),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
  )
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function makeBarCounter({ w, d = 0.9, h = 1.15, baseColor = '#8a6540', topColor = '#5a3a1c', accent = '#b08860' }) {
  const g = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(w, h - 0.1, d),
    new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.85 }),
  )
  base.position.y = (h - 0.1) / 2
  g.add(base)
  // vertical front plank accents
  const planks = 5
  const pw = (w - 0.2) / planks
  for (let i = 0; i < planks; i++) {
    const pm = new THREE.Mesh(
      new THREE.BoxGeometry(pw * 0.88, (h - 0.1) * 0.7, 0.04),
      new THREE.MeshStandardMaterial({ color: accent, roughness: 0.8 }),
    )
    const startX = -w / 2 + 0.1 + pw / 2 + i * pw
    pm.position.set(startX, (h - 0.1) / 2 - 0.04, d / 2 + 0.02)
    g.add(pm)
  }
  // thin bottom kick
  const kick = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.08, d + 0.02),
    new THREE.MeshStandardMaterial({ color: '#2a1a0e', roughness: 0.9 }),
  )
  kick.position.y = 0.04
  g.add(kick)
  // top slab (wider for cafe bar overhang)
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.25, 0.1, d + 0.2),
    new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.45, metalness: 0.1 }),
  )
  top.position.y = h - 0.05
  g.add(top)
  // bullnose trim
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.28, 0.04, 0.03),
    new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.5 }),
  )
  trim.position.set(0, h - 0.11, d / 2 + 0.11)
  g.add(trim)
  g.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true } })
  return g
}

function makeTextSign(text, { w = 2.0, h = 0.6, bg = '#d9b77a', fg = '#3e2a18' }) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = Math.round(1024 * h / w)
  const ctx = c.getContext('2d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, c.width, c.height)
  // subtle wood grain
  ctx.globalAlpha = 0.07
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? '#000' : '#fff'
    ctx.fillRect(0, Math.random() * c.height, c.width, 1 + Math.random() * 2)
  }
  ctx.globalAlpha = 1
  // inner border
  ctx.strokeStyle = fg
  ctx.lineWidth = 6
  ctx.strokeRect(30, 30, c.width - 60, c.height - 60)
  // text — auto-fit to inner area
  ctx.fillStyle = fg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const maxW = c.width - 120
  const maxH = c.height - 90
  let fontSize = Math.floor(maxH * 0.75)
  ctx.font = `bold ${fontSize}px Georgia, serif`
  while (ctx.measureText(text).width > maxW && fontSize > 20) {
    fontSize -= 4
    ctx.font = `bold ${fontSize}px Georgia, serif`
  }
  ctx.fillText(text, c.width / 2, c.height / 2 + fontSize * 0.05)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const plank = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.08),
    [
      new THREE.MeshStandardMaterial({ color: '#8b6a46', roughness: 0.75 }),
      new THREE.MeshStandardMaterial({ color: '#8b6a46', roughness: 0.75 }),
      new THREE.MeshStandardMaterial({ color: '#8b6a46', roughness: 0.75 }),
      new THREE.MeshStandardMaterial({ color: '#8b6a46', roughness: 0.75 }),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: '#8b6a46', roughness: 0.75 }),
    ],
  )
  plank.castShadow = true
  plank.receiveShadow = true
  return plank
}

function makeCoffeePoster({ w = 0.9, h = 1.2 }) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = Math.round(512 * h / w)
  const ctx = c.getContext('2d')
  // cream bg
  ctx.fillStyle = '#f2e7cd'
  ctx.fillRect(0, 0, c.width, c.height)
  // decorative double border
  ctx.strokeStyle = '#5a3a1c'
  ctx.lineWidth = 8
  ctx.strokeRect(18, 18, c.width - 36, c.height - 36)
  ctx.lineWidth = 2
  ctx.strokeRect(30, 30, c.width - 60, c.height - 60)
  // saucer
  ctx.fillStyle = '#7a4d1a'
  ctx.beginPath()
  ctx.ellipse(c.width / 2, c.height * 0.45, c.width * 0.28, c.width * 0.07, 0, 0, Math.PI * 2)
  ctx.fill()
  // cup
  ctx.fillStyle = '#f6edd4'
  ctx.beginPath()
  ctx.ellipse(c.width / 2, c.height * 0.38, c.width * 0.2, c.width * 0.2, 0, Math.PI, 2 * Math.PI)
  ctx.fill()
  // coffee liquid
  ctx.fillStyle = '#4a2a12'
  ctx.beginPath()
  ctx.ellipse(c.width / 2, c.height * 0.36, c.width * 0.16, c.width * 0.05, 0, 0, Math.PI * 2)
  ctx.fill()
  // foam heart
  ctx.fillStyle = '#e7cfa3'
  ctx.beginPath()
  ctx.ellipse(c.width / 2, c.height * 0.36, c.width * 0.08, c.width * 0.025, 0, 0, Math.PI * 2)
  ctx.fill()
  // steam squiggles
  ctx.strokeStyle = 'rgba(100,80,60,0.45)'
  ctx.lineWidth = 4
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    const baseX = c.width / 2 + i * 36
    ctx.moveTo(baseX, c.height * 0.18)
    ctx.bezierCurveTo(baseX - 12, c.height * 0.12, baseX + 12, c.height * 0.08, baseX, c.height * 0.02)
    ctx.stroke()
  }
  // text
  ctx.fillStyle = '#3a2410'
  ctx.textAlign = 'center'
  ctx.font = `bold ${c.width * 0.11}px Georgia, serif`
  ctx.fillText('FRESHLY', c.width / 2, c.height * 0.68)
  ctx.font = `bold ${c.width * 0.15}px Georgia, serif`
  ctx.fillText('BREWED', c.width / 2, c.height * 0.80)
  ctx.font = `italic ${c.width * 0.055}px Georgia, serif`
  ctx.fillText('— daily since 2019 —', c.width / 2, c.height * 0.90)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const g = new THREE.Group()
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.05),
    new THREE.MeshStandardMaterial({ color: '#4a2e18', roughness: 0.75 }),
  )
  g.add(frame)
  const inner = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }),
  )
  inner.position.z = 0.028
  g.add(inner)
  g.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true } })
  return g
}

function makePendantLight({ cableLen = 0.8 }) {
  const g = new THREE.Group()
  const cable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, cableLen, 8),
    new THREE.MeshStandardMaterial({ color: '#1a1a1a' }),
  )
  cable.position.y = -cableLen / 2
  g.add(cable)
  // brass cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.06, 16),
    new THREE.MeshStandardMaterial({ color: '#3a2a1a', roughness: 0.4, metalness: 0.6 }),
  )
  cap.position.y = -cableLen - 0.02
  g.add(cap)
  // cone shade
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.28, 20, 1, true),
    new THREE.MeshStandardMaterial({ color: '#2f1d10', roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide }),
  )
  shade.position.y = -cableLen - 0.17
  g.add(shade)
  // bulb (emissive)
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshStandardMaterial({
      color: '#fff1c8',
      emissive: '#ffc878',
      emissiveIntensity: 1.2,
      roughness: 0.2,
    }),
  )
  bulb.position.y = -cableLen - 0.25
  g.add(bulb)
  // warm point light
  const pl = new THREE.PointLight('#ffca7a', 1.2, 4, 2)
  pl.position.y = -cableLen - 0.3
  g.add(pl)
  g.traverse(n => { if (n.isMesh) n.castShadow = false })
  return g
}

function makeJar(colorInner = '#3a2410') {
  const g = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.3, 20),
    new THREE.MeshStandardMaterial({ color: '#e3ddce', roughness: 0.25, transparent: true, opacity: 0.8 }),
  )
  body.position.y = 0.15
  g.add(body)
  const beans = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.22, 20),
    new THREE.MeshStandardMaterial({ color: colorInner, roughness: 0.8 }),
  )
  beans.position.y = 0.13
  g.add(beans)
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.04, 20),
    new THREE.MeshStandardMaterial({ color: '#5a3a1c', roughness: 0.7 }),
  )
  lid.position.y = 0.32
  g.add(lid)
  g.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true } })
  return g
}

export async function buildRoom({ scene, loader }) {
  const interactive = []
  const roomSize = 7
  const half = roomSize / 2
  const wallHeight = 3.6

  // ================== FLOOR ==================
  const floorTex = makeWoodFloorTexture()
  floorTex.repeat.set(2, 2)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomSize, roomSize),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // ================== WALLS ==================
  const wallThick = 0.12
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(roomSize, wallHeight, wallThick),
    new THREE.MeshStandardMaterial({ color: '#586e4e', roughness: 0.95 }),
  )
  backWall.position.set(0, wallHeight / 2, -half)
  backWall.receiveShadow = true
  scene.add(backWall)

  const sideWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThick, wallHeight, roomSize),
    new THREE.MeshStandardMaterial({ color: '#ede2c9', roughness: 0.95 }),
  )
  sideWall.position.set(-half, wallHeight / 2, 0)
  sideWall.receiveShadow = true
  scene.add(sideWall)

  // baseboards
  const bbMat = new THREE.MeshStandardMaterial({ color: '#5a3a1c', roughness: 0.8 })
  const bb1 = new THREE.Mesh(new THREE.BoxGeometry(roomSize, 0.18, 0.2), bbMat)
  bb1.position.set(0, 0.09, -half + 0.1)
  scene.add(bb1)
  const bb2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, roomSize), bbMat)
  bb2.position.set(-half + 0.1, 0.09, 0)
  scene.add(bb2)

  // thin dado rail on back wall
  const dado = new THREE.Mesh(
    new THREE.BoxGeometry(roomSize, 0.06, 0.13),
    new THREE.MeshStandardMaterial({ color: '#dbc99a', roughness: 0.9 }),
  )
  dado.position.set(0, 1.0, -half + wallThick / 2 + 0.06)
  scene.add(dado)

  // ================== WALL ART ==================
  // CAFÉ AURORA sign on left side of back wall, above cabinet area
  const sign = makeTextSign('CAFÉ · AURORA', { w: 2.2, h: 0.55 })
  sign.position.set(-1.2, 2.65, -half + wallThick / 2 + 0.05)
  scene.add(sign)

  // Chalkboard (right side of back wall)
  const chalk = makeChalkboard(1.6, 1.0)
  chalk.position.set(2.0, 1.85, -half + wallThick / 2 + 0.04)
  scene.add(chalk)

  // Side wall: coffee poster (big, anchor piece) + 2 small frames
  const poster = makeCoffeePoster({ w: 0.95, h: 1.3 })
  poster.position.set(-half + wallThick / 2 + 0.04, 2.1, -1.6)
  poster.rotation.y = Math.PI / 2
  scene.add(poster)

  const art2 = makeWallArt({ w: 0.42, h: 0.5, inner: '#8ca871' })
  art2.position.set(-half + wallThick / 2 + 0.04, 2.45, -0.3)
  art2.rotation.y = Math.PI / 2
  scene.add(art2)
  const art3 = makeWallArt({ w: 0.4, h: 0.5, inner: '#d8a860' })
  art3.position.set(-half + wallThick / 2 + 0.04, 2.45, 2.2)
  art3.rotation.y = Math.PI / 2
  scene.add(art3)

  // Wall shelf on beige wall with items
  const shelf = makeWallShelf(1.6, '#6b4a2a')
  shelf.position.set(-half + wallThick / 2 + 0.2, 1.55, 0.8)
  shelf.rotation.y = Math.PI / 2
  scene.add(shelf)
  const shelf2 = makeWallShelf(1.6, '#6b4a2a')
  shelf2.position.set(-half + wallThick / 2 + 0.2, 1.0, 0.8)
  shelf2.rotation.y = Math.PI / 2
  scene.add(shelf2)

  // ================== LOAD GLBs ==================
  const [
    kitchenBar, kitchenBarEnd, coffeeMachine, bookcaseLow, cabinetUpper,
    tableRound, sideTable,
    chairRounded1, chairRounded2,
    stoolBar1, stoolBar2,
    loungeSofa, loungeChair,
    plantPotted, plantSmall1, plantSmall2, plantSmall3,
    books, pillow, pillowBlue,
    rugRound, rugRect,
    cupCoffee, cupSaucer, cupTea, cupCoffee2,
    cake, muffin, croissant, donutChoc, cookie, cookieChoc, plate, bowl, frappe, steamer,
    wallWindow,
  ] = await Promise.all([
    loadGLB(loader, `${FURN}/kitchenBar.glb`),
    loadGLB(loader, `${FURN}/kitchenBarEnd.glb`),
    loadGLB(loader, `${FURN}/kitchenCoffeeMachine.glb`),
    loadGLB(loader, `${FURN}/bookcaseOpenLow.glb`),
    loadGLB(loader, `${FURN}/kitchenCabinetUpper.glb`),
    loadGLB(loader, `${FURN}/tableRound.glb`),
    loadGLB(loader, `${FURN}/sideTable.glb`),
    loadGLB(loader, `${FURN}/chairRounded.glb`),
    loadGLB(loader, `${FURN}/chairRounded.glb`),
    loadGLB(loader, `${FURN}/stoolBar.glb`),
    loadGLB(loader, `${FURN}/stoolBar.glb`),
    loadGLB(loader, `${FURN}/loungeSofa.glb`),
    loadGLB(loader, `${FURN}/loungeChair.glb`),
    loadGLB(loader, `${FURN}/pottedPlant.glb`),
    loadGLB(loader, `${FURN}/plantSmall1.glb`),
    loadGLB(loader, `${FURN}/plantSmall2.glb`),
    loadGLB(loader, `${FURN}/plantSmall3.glb`),
    loadGLB(loader, `${FURN}/books.glb`),
    loadGLB(loader, `${FURN}/pillow.glb`),
    loadGLB(loader, `${FURN}/pillowBlue.glb`),
    loadGLB(loader, `${FURN}/rugRound.glb`),
    loadGLB(loader, `${FURN}/rugRectangle.glb`),
    loadGLB(loader, `${FOOD}/cup-coffee.glb`),
    loadGLB(loader, `${FOOD}/cup-saucer.glb`),
    loadGLB(loader, `${FOOD}/cup-tea.glb`),
    loadGLB(loader, `${FOOD}/cup-coffee.glb`),
    loadGLB(loader, `${FOOD}/cake.glb`),
    loadGLB(loader, `${FOOD}/muffin.glb`),
    loadGLB(loader, `${FOOD}/croissant.glb`),
    loadGLB(loader, `${FOOD}/donut-chocolate.glb`),
    loadGLB(loader, `${FOOD}/cookie.glb`),
    loadGLB(loader, `${FOOD}/cookie-chocolate.glb`),
    loadGLB(loader, `${FOOD}/plate-rectangle.glb`),
    loadGLB(loader, `${FOOD}/bowl.glb`),
    loadGLB(loader, `${FOOD}/frappe.glb`),
    loadGLB(loader, `${FOOD}/steamer.glb`),
    loadGLB(loader, `${FURN}/wallWindowSlide.glb`),
  ])

  const S = 1.9
  const SF = 1.2  // pequeños utensilios
  const SC = 1.6  // tazas / platos
  const SP = 0.9  // pastries (modelos Kenney muy grandes)

  // ================== BAR COUNTER (custom, runs along back wall) ==================
  const counterZ = -half + 0.55
  const barCounter = makeBarCounter({ w: 4.2, d: 0.95, h: 1.15 })
  barCounter.position.set(-0.2, 0, counterZ)
  barCounter.name = 'bar'
  barCounter.userData.label = 'Barra'
  barCounter.userData.interactive = true
  interactive.push(barCounter)
  scene.add(barCounter)

  // Coffee machine on bar, left side
  const coffee = place(prepareMesh(coffeeMachine), {
    x: -1.5, z: counterZ - 0.05, s: S, onTopOf: barCounter,
    name: 'coffee-machine', label: 'Cafetera ☕', interactive,
  })
  scene.add(coffee)

  // Two coffee bean jars left of machine
  const jar1 = makeJar('#3a2410')
  const jar1Box = bboxOf(barCounter)
  jar1.position.set(-2.0, jar1Box.max.y, counterZ - 0.1)
  scene.add(jar1)
  const jar2 = makeJar('#6a4520')
  jar2.position.set(-2.25, jar1Box.max.y, counterZ - 0.1)
  scene.add(jar2)

  // stacked cup display
  const dispCup = place(prepareMesh(cupCoffee.clone()), {
    x: -1.8, z: counterZ + 0.2, s: SC, onTopOf: barCounter,
  })
  scene.add(dispCup)

  // Pastries on display plate (center of bar)
  const pastryPlate = place(prepareMesh(plate), { x: 0.4, z: counterZ, s: SC, onTopOf: barCounter })
  scene.add(pastryPlate)
  scene.add(place(prepareMesh(croissant), {
    x: 0.05, z: counterZ - 0.05, s: SP, onTopOf: pastryPlate,
    name: 'croissant', label: 'Croissant 🥐', interactive,
  }))
  scene.add(place(prepareMesh(muffin), {
    x: 0.45, z: counterZ + 0.05, s: SP, onTopOf: pastryPlate,
    name: 'muffin', label: 'Muffin', interactive,
  }))
  scene.add(place(prepareMesh(donutChoc), {
    x: 0.7, z: counterZ - 0.05, s: SP, onTopOf: pastryPlate,
    name: 'donut', label: 'Donut 🍩', interactive,
  }))
  // cookies in bowl
  const bowlOnCounter = place(prepareMesh(bowl), { x: 1.4, z: counterZ, s: SC, onTopOf: barCounter })
  scene.add(bowlOnCounter)
  scene.add(place(prepareMesh(cookie), { x: 1.4, z: counterZ, s: SP, onTopOf: bowlOnCounter }))
  scene.add(place(prepareMesh(cookieChoc), { x: 1.37, z: counterZ - 0.04, s: SP, onTopOf: bowlOnCounter }))

  // plantita right end of bar
  scene.add(place(prepareMesh(plantSmall2), {
    x: 1.8, z: counterZ - 0.1, s: SF, onTopOf: barCounter,
  }))

  // removed cabinetUpper — conflicts with CAFÉ sign and adds visual noise

  // ================== BAR STOOLS facing counter ==================
  scene.add(place(prepareMesh(stoolBar1), {
    x: -1.0, z: counterZ + 1.15, ry: Math.PI, s: S,
    name: 'stool-1', label: 'Banco', interactive,
  }))
  scene.add(place(prepareMesh(stoolBar2), {
    x: 0.5, z: counterZ + 1.15, ry: Math.PI, s: S,
    name: 'stool-2', label: 'Banco', interactive,
  }))
  scene.add(place(prepareMesh(stoolBar1.clone()), {
    x: 2.0, z: counterZ + 1.15, ry: Math.PI, s: S,
    name: 'stool-3', label: 'Banco', interactive,
  }))

  // ================== SIDE BOOKCASE (left of counter) ==================
  const bc = place(prepareMesh(bookcaseLow), {
    x: 2.7, z: -half + 0.45, s: S,
    name: 'bookcase', label: 'Estantería', interactive,
  })
  scene.add(bc)
  scene.add(place(prepareMesh(books), { x: 2.7, z: -half + 0.45, s: SC, onTopOf: bc }))
  scene.add(place(prepareMesh(plantSmall1), { x: 2.9, z: -half + 0.45, s: SF, onTopOf: bc }))
  scene.add(place(prepareMesh(cupCoffee2), { x: 2.5, z: -half + 0.4, s: SC, onTopOf: bc }))

  // ================== DINING — center ==================
  const tableX = 1.4
  const tableZ = 1.6

  // rug under table (tinted warmer cream instead of pink)
  const diningRug = place(prepareMesh(rugRound), {
    x: tableX, z: tableZ, s: S * 1.5, yOffset: 0.001,
  })
  diningRug.traverse(n => {
    if (n.isMesh && n.material) {
      n.material = n.material.clone()
      n.material.color = new THREE.Color('#d4a87a')
    }
  })
  scene.add(diningRug)

  const table = place(prepareMesh(tableRound), {
    x: tableX, z: tableZ, s: S,
    name: 'table', label: 'Mesa', interactive,
  })
  scene.add(table)

  scene.add(place(prepareMesh(chairRounded1), {
    x: tableX, z: tableZ + 1.1, ry: Math.PI, s: S,
    name: 'chair-1', label: 'Silla', interactive,
  }))
  scene.add(place(prepareMesh(chairRounded2), {
    x: tableX, z: tableZ - 1.1, ry: 0, s: S,
    name: 'chair-2', label: 'Silla', interactive,
  }))

  // Table items
  scene.add(place(prepareMesh(cupSaucer), { x: tableX - 0.3, z: tableZ - 0.25, s: SC, onTopOf: table }))
  scene.add(place(prepareMesh(cupCoffee), {
    x: tableX - 0.3, z: tableZ - 0.25, s: SC, onTopOf: table,
    name: 'cup', label: 'Café ☕', interactive,
  }))
  scene.add(place(prepareMesh(cupTea), {
    x: tableX + 0.3, z: tableZ + 0.2, s: SC, onTopOf: table,
    name: 'tea', label: 'Té', interactive,
  }))
  // Use muffin instead of cake (cake.glb is oversized fantasy cake)
  scene.add(place(prepareMesh(muffin.clone()), {
    x: tableX + 0.1, z: tableZ + 0.3, s: SP, onTopOf: table,
    name: 'cake', label: 'Panqué 🧁', interactive,
  }))

  // ================== LOUNGE (front-left corner) ==================
  // rectangular rug (tinted cream)
  const loungeRug = place(prepareMesh(rugRect), {
    x: -1.9, z: 2.3, ry: Math.PI / 2, s: S * 1.2, yOffset: 0.001,
  })
  loungeRug.traverse(n => {
    if (n.isMesh && n.material) {
      n.material = n.material.clone()
      n.material.color = new THREE.Color('#c8996b')
    }
  })
  scene.add(loungeRug)

  const sofa = place(prepareMesh(loungeSofa), {
    x: -2.4, z: 2.3, ry: Math.PI / 2, s: S,
    name: 'sofa', label: 'Sofá', interactive,
  })
  scene.add(sofa)
  scene.add(place(prepareMesh(pillow), { x: -2.4, z: 1.7, s: SC, onTopOf: sofa }))
  scene.add(place(prepareMesh(pillowBlue), { x: -2.4, z: 2.9, s: SC, onTopOf: sofa }))

  // small coffee side-table next to sofa
  const sTable = place(prepareMesh(sideTable), {
    x: -1.0, z: 2.3, s: S * 0.9,
  })
  scene.add(sTable)
  scene.add(place(prepareMesh(frappe), {
    x: -1.0, z: 2.3, s: SC, onTopOf: sTable,
    name: 'frappe', label: 'Frappé', interactive,
  }))
  scene.add(place(prepareMesh(books.clone()), {
    x: -1.0, z: 2.55, s: SC, onTopOf: sTable,
  }))

  // ================== CORNER PLANTS ==================
  // Front-right corner: big potted plant (anchors the dining area)
  scene.add(place(prepareMesh(plantPotted), {
    x: half - 0.6, z: half - 0.6, s: S * 1.0,
    name: 'plant-corner', label: 'Planta', interactive,
  }))
  // Side next to sofa (but behind it, tight against window wall)
  scene.add(place(prepareMesh(plantSmall3), {
    x: -half + 0.4, z: -0.2, s: S * 0.9,
    name: 'plant-medium', label: 'Plantita', interactive,
  }))

  // ================== WINDOW on side wall ==================
  scene.add(place(prepareMesh(wallWindow), {
    x: -half + wallThick / 2 + 0.05, y: 1.3, z: 1.2, ry: Math.PI / 2,
    s: S * 0.7, snapToFloor: false,
  }))

  // ================== PENDANT LIGHTS ==================
  // Two warm pendant lights above bar, one above dining
  const p1 = makePendantLight({ cableLen: 0.9 })
  p1.position.set(-0.8, wallHeight, counterZ + 0.6)
  scene.add(p1)
  const p2 = makePendantLight({ cableLen: 0.9 })
  p2.position.set(1.2, wallHeight, counterZ + 0.6)
  scene.add(p2)
  const p3 = makePendantLight({ cableLen: 1.1 })
  p3.position.set(tableX, wallHeight, tableZ)
  scene.add(p3)

  // Items on wall shelf
  const shelfCup1 = place(prepareMesh(cupCoffee.clone()), {
    x: -half + wallThick / 2 + 0.25, y: 1.6, z: 1.3, s: SF * 0.9, snapToFloor: false,
  })
  scene.add(shelfCup1)
  const shelfCup2 = place(prepareMesh(cupTea.clone()), {
    x: -half + wallThick / 2 + 0.25, y: 1.6, z: 0.7, s: SF * 0.9, snapToFloor: false,
  })
  scene.add(shelfCup2)
  const shelfBooks = place(prepareMesh(books.clone()), {
    x: -half + wallThick / 2 + 0.25, y: 1.05, z: 1.2, s: SF * 0.9, snapToFloor: false,
  })
  scene.add(shelfBooks)
  const shelfBowl = place(prepareMesh(bowl.clone()), {
    x: -half + wallThick / 2 + 0.25, y: 1.05, z: 0.5, s: SF, snapToFloor: false,
  })
  scene.add(shelfBowl)

  return { interactive }
}
