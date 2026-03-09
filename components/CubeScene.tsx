'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  progress: number
  isRunning: boolean
  modeColor: string
  timeLabel: string
  mode: string
  onFaceChange?: (face: number) => void
}

/* ── Timer face texture ── */
function makeTimerTexture(time: string, mode: string, color: string): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0d0d11'
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = color
  ctx.lineWidth = 6
  ctx.globalAlpha = 0.35
  const pad = 18
  ctx.beginPath()
  ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, 36)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.fillStyle = color
  ctx.globalAlpha = 0.65
  ctx.font = 'bold 44px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(mode.toUpperCase(), size / 2, size / 2 - 82)

  ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 136px monospace'
  ctx.fillText(time, size / 2, size / 2 + 28)

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(size / 2, size / 2 + 126, 9, 0, Math.PI * 2)
  ctx.fill()

  return new THREE.CanvasTexture(canvas)
}

/* ── Animated face: Japanese rain (Matrix-style kanji) ── */
function createRainCanvas(color: string) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789'
  const cols = 24
  const charSize = Math.floor(size / cols)
  const drops: number[] = Array.from({ length: cols }, () => Math.random() * -60)

  const texture = new THREE.CanvasTexture(canvas)

  const draw = () => {
    ctx.fillStyle = 'rgba(13,13,17,0.18)'
    ctx.fillRect(0, 0, size, size)

    for (let i = 0; i < drops.length; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)]
      const x = i * charSize
      const y = drops[i] * charSize

      // bright head
      ctx.fillStyle = '#ffffff'
      ctx.globalAlpha = 0.95
      ctx.font = `bold ${charSize - 2}px monospace`
      ctx.fillText(ch, x, y)

      // colored trail
      ctx.fillStyle = color
      ctx.globalAlpha = 0.55
      ctx.font = `${charSize - 4}px monospace`
      const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)]
      ctx.fillText(trailChar, x, y - charSize)

      ctx.globalAlpha = 1

      if (drops[i] * charSize > size && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i] += 0.45
    }

    texture.needsUpdate = true
  }

  return { canvas, texture, draw }
}

/* ── Animated face: floating particles ── */
function createParticleCanvas(color: string) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const c = new THREE.Color(color)
  const hex = `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`

  const particles = Array.from({ length: 38 }, () => ({
    x: Math.random() * size,
    y: Math.random() * size,
    r: 2 + Math.random() * 5,
    vx: (Math.random() - 0.5) * 0.7,
    vy: -0.4 - Math.random() * 0.6,
    alpha: 0.3 + Math.random() * 0.5,
    life: Math.random(),
  }))

  const texture = new THREE.CanvasTexture(canvas)

  const draw = () => {
    ctx.fillStyle = 'rgba(13,13,17,0.25)'
    ctx.fillRect(0, 0, size, size)

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.life += 0.008
      p.alpha = Math.sin(p.life * Math.PI) * 0.7

      if (p.y < -10 || p.life >= 1) {
        p.x = Math.random() * size
        p.y = size + 10
        p.life = 0
        p.vx = (Math.random() - 0.5) * 0.7
        p.vy = -0.4 - Math.random() * 0.6
        p.r = 2 + Math.random() * 5
      }

      ctx.globalAlpha = p.alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = hex
      ctx.fill()

      // glow
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
      g.addColorStop(0, hex)
      g.addColorStop(1, 'transparent')
      ctx.globalAlpha = p.alpha * 0.3
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
    }
    ctx.globalAlpha = 1
    texture.needsUpdate = true
  }

  return { canvas, texture, draw }
}

/* ── Animated face: ripple waves ── */
function createRippleCanvas(color: string) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const c = new THREE.Color(color)
  const hex = `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`

  let t = 0
  const texture = new THREE.CanvasTexture(canvas)

  const draw = () => {
    ctx.fillStyle = '#0d0d11'
    ctx.fillRect(0, 0, size, size)

    for (let ring = 0; ring < 5; ring++) {
      const phase = (t * 0.018 + ring * 0.4) % 1
      const r = phase * size * 0.55
      const alpha = (1 - phase) * 0.5

      ctx.beginPath()
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
      ctx.strokeStyle = hex
      ctx.lineWidth = 2.5
      ctx.globalAlpha = alpha
      ctx.stroke()
    }

    // Center dot
    ctx.globalAlpha = 0.7
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, 7, 0, Math.PI * 2)
    ctx.fillStyle = hex
    ctx.fill()

    ctx.globalAlpha = 1
    t++
    texture.needsUpdate = true
  }

  return { canvas, texture, draw }
}

/* ── Animated face: flowing lines ── */
function createFlowCanvas(color: string) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const c = new THREE.Color(color)
  const hex = `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`

  let t = 0
  const texture = new THREE.CanvasTexture(canvas)

  const draw = () => {
    ctx.fillStyle = 'rgba(13,13,17,0.12)'
    ctx.fillRect(0, 0, size, size)

    const lines = 10
    for (let i = 0; i < lines; i++) {
      const yBase = (size / lines) * i + size / lines / 2
      ctx.beginPath()
      ctx.moveTo(0, yBase)
      for (let x = 0; x <= size; x += 8) {
        const wave = Math.sin((x * 0.012) + (t * 0.04) + (i * 0.7)) * 22
             + Math.sin((x * 0.006) + (t * 0.025) + (i * 1.1)) * 12
        ctx.lineTo(x, yBase + wave)
      }
      const alpha = 0.15 + (Math.sin(t * 0.03 + i) * 0.5 + 0.5) * 0.3
      ctx.strokeStyle = hex
      ctx.lineWidth = 1.5
      ctx.globalAlpha = alpha
      ctx.stroke()
    }

    ctx.globalAlpha = 1
    t++
    texture.needsUpdate = true
  }

  return { canvas, texture, draw }
}

/* ── Animated face: starfield ── */
function createStarsCanvas(color: string) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const c = new THREE.Color(color)
  const hex = `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`

  const stars = Array.from({ length: 90 }, () => ({
    x: Math.random() * size,
    y: Math.random() * size,
    r: 0.5 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
    speed: 0.02 + Math.random() * 0.04,
  }))
  let t = 0
  const texture = new THREE.CanvasTexture(canvas)

  const draw = () => {
    ctx.fillStyle = '#0d0d11'
    ctx.fillRect(0, 0, size, size)

    for (const s of stars) {
      const alpha = 0.2 + (Math.sin(t * s.speed + s.phase) * 0.5 + 0.5) * 0.7
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = alpha > 0.7 ? '#ffffff' : hex
      ctx.fill()
    }
    ctx.globalAlpha = 1
    t++
    texture.needsUpdate = true
  }

  return { canvas, texture, draw }
}

/* ──────────────────────────────────────────────
   Main component
────────────────────────────────────────────── */
export default function CubeScene({ progress, isRunning, modeColor, timeLabel, mode }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  const stateRef = useRef({
    renderer:    null as THREE.WebGLRenderer | null,
    cube:        null as THREE.Mesh | null,
    animId:      0,
    isDragging:  false,
    prevMouse:   { x: 0, y: 0 },
    autoRotate:  true,
    isRunning:   false,
    modeColor,
    timeLabel,
    mode,
    materials:   [] as THREE.MeshStandardMaterial[],
    drawFns:     [] as (() => void)[],
    frameCount:  0,
  })

  useEffect(() => {
    const mount = mountRef.current!
    const s = stateRef.current
    const w = mount.clientWidth
    const h = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(0, 0, 5.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)
    s.renderer = renderer

    scene.add(new THREE.AmbientLight(0xffffff, 0.75))
    const dir = new THREE.DirectionalLight(0xffffff, 1.4)
    dir.position.set(5, 8, 6)
    scene.add(dir)
    const fill = new THREE.DirectionalLight(0xffffff, 0.25)
    fill.position.set(-5, -3, -5)
    scene.add(fill)

    // Build animated faces
    const rain    = createRainCanvas(modeColor)
    const ptcl    = createParticleCanvas(modeColor)
    const ripple  = createRippleCanvas(modeColor)
    const flow    = createFlowCanvas(modeColor)
    const stars   = createStarsCanvas(modeColor)
    const timerTx = makeTimerTexture(timeLabel, mode, modeColor)

    // face order: +x, -x, +y, -y, +z(front=timer), -z
    const materials: THREE.MeshStandardMaterial[] = [
      new THREE.MeshStandardMaterial({ map: rain.texture,   roughness: 0.25, metalness: 0.35 }),
      new THREE.MeshStandardMaterial({ map: ptcl.texture,   roughness: 0.25, metalness: 0.35 }),
      new THREE.MeshStandardMaterial({ map: ripple.texture, roughness: 0.25, metalness: 0.35 }),
      new THREE.MeshStandardMaterial({ map: flow.texture,   roughness: 0.25, metalness: 0.35 }),
      new THREE.MeshStandardMaterial({ map: timerTx,        roughness: 0.20, metalness: 0.30 }),
      new THREE.MeshStandardMaterial({ map: stars.texture,  roughness: 0.25, metalness: 0.35 }),
    ]
    s.materials = materials
    s.drawFns   = [rain.draw, ptcl.draw, ripple.draw, flow.draw, () => {}, stars.draw]

    const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2, 4, 4, 4)
    const pos = geometry.attributes.position
    const radius = 0.18
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      const half = 1.1 - radius
      const cx = Math.max(-half, Math.min(half, x))
      const cy = Math.max(-half, Math.min(half, y))
      const cz = Math.max(-half, Math.min(half, z))
      const dx = x - cx, dy = y - cy, dz = z - cz
      const dlen = Math.sqrt(dx*dx + dy*dy + dz*dz)
      if (dlen > 0) pos.setXYZ(i, cx+(dx/dlen)*radius, cy+(dy/dlen)*radius, cz+(dz/dlen)*radius)
    }
    geometry.computeVertexNormals()

    const cube = new THREE.Mesh(geometry, materials)
    scene.add(cube)
    s.cube = cube

    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.22, 2.22, 2.22))
    scene.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 })))

    const animate = () => {
      s.animId = requestAnimationFrame(animate)
      s.frameCount++

      // update animated textures every other frame for perf
      if (s.frameCount % 2 === 0) {
        s.drawFns.forEach(fn => fn())
      }

      if (!s.isDragging && s.autoRotate) {
        cube.rotation.y += s.isRunning ? 0.006 : 0.0015
      }
      renderer.render(scene, camera)
    }
    animate()

    // Mouse
    const onMouseDown = (e: MouseEvent) => { s.isDragging = true; s.autoRotate = false; s.prevMouse = { x: e.clientX, y: e.clientY } }
    const onMouseMove = (e: MouseEvent) => {
      if (!s.isDragging) return
      cube.rotation.y += (e.clientX - s.prevMouse.x) * 0.012
      cube.rotation.x += (e.clientY - s.prevMouse.y) * 0.012
      s.prevMouse = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = () => { s.isDragging = false; setTimeout(() => { s.autoRotate = true }, 2000) }

    // Touch
    const onTouchStart = (e: TouchEvent) => { s.isDragging = true; s.autoRotate = false; s.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const onTouchMove  = (e: TouchEvent) => {
      if (!s.isDragging) return
      cube.rotation.y += (e.touches[0].clientX - s.prevMouse.x) * 0.012
      cube.rotation.x += (e.touches[0].clientY - s.prevMouse.y) * 0.012
      s.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd = () => { s.isDragging = false; setTimeout(() => { s.autoRotate = true }, 2000) }

    const handleResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    mount.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    mount.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(s.animId)
      mount.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      mount.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', handleResize)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  // Update timer face
  useEffect(() => {
    const s = stateRef.current
    if (!s.materials.length) return
    const tex = makeTimerTexture(timeLabel, mode, modeColor)
    s.materials[4].map?.dispose()
    s.materials[4].map = tex
    s.materials[4].needsUpdate = true
    s.timeLabel = timeLabel
    s.mode = mode
  }, [timeLabel, mode])

  // Update accent color on all non-timer faces
  useEffect(() => {
    const s = stateRef.current
    if (!s.materials.length) return
    // Rebuild animated canvases with new color
    const rain   = createRainCanvas(modeColor)
    const ptcl   = createParticleCanvas(modeColor)
    const ripple = createRippleCanvas(modeColor)
    const flow   = createFlowCanvas(modeColor)
    const stars  = createStarsCanvas(modeColor)

    const newTextures = [rain.texture, ptcl.texture, ripple.texture, flow.texture, null, stars.texture]
    const newDrawFns  = [rain.draw, ptcl.draw, ripple.draw, flow.draw, () => {}, stars.draw]

    newTextures.forEach((tex, i) => {
      if (i === 4 || tex === null) return
      s.materials[i].map?.dispose()
      s.materials[i].map = tex
      s.materials[i].needsUpdate = true
    })
    s.drawFns = newDrawFns

    // Also refresh timer face color
    const timerTex = makeTimerTexture(s.timeLabel, s.mode, modeColor)
    s.materials[4].map?.dispose()
    s.materials[4].map = timerTex
    s.materials[4].needsUpdate = true
    s.modeColor = modeColor
  }, [modeColor])

  useEffect(() => {
    stateRef.current.isRunning = isRunning
  }, [isRunning])

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
}