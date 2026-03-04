'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  progress: number
  isRunning: boolean
  modeColor: string
  timeLabel: string  // ex: "25:00"
  mode: string       // ex: "Pomodoro"
  onFaceChange?: (face: number) => void
}

// RoundedBox geometry manual (sem lib externa)
function createRoundedBox(width: number, height: number, depth: number, radius: number, segments: number) {
  const shape = new THREE.Shape()
  const eps = 0.00001
  const r = radius - eps

  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true)
  shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true)
  shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true)
  shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - radius * 2,
    bevelEnabled: true,
    bevelSegments: segments,
    steps: 1,
    bevelSize: r,
    bevelThickness: radius,
    curveSegments: segments,
  })

  geometry.center()
  return geometry
}

// Cria textura canvas com o tempo
function makeTimerTexture(time: string, mode: string, color: string): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Fundo
  ctx.fillStyle = '#111116'
  ctx.fillRect(0, 0, size, size)

  // Borda arredondada sutil
  ctx.strokeStyle = color
  ctx.lineWidth = 8
  ctx.globalAlpha = 0.4
  const pad = 20
  ctx.beginPath()
  ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, 40)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Mode label
  ctx.fillStyle = color
  ctx.globalAlpha = 0.7
  ctx.font = 'bold 48px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(mode.toUpperCase(), size / 2, size / 2 - 80)

  // Timer
  ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 140px monospace'
  ctx.fillText(time, size / 2, size / 2 + 30)

  // Pulse dot
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(size / 2, size / 2 + 130, 10, 0, Math.PI * 2)
  ctx.fill()

  return new THREE.CanvasTexture(canvas)
}

export default function CubeScene({ progress, isRunning, modeColor, timeLabel, mode, onFaceChange }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({
    renderer: null as THREE.WebGLRenderer | null,
    cube: null as THREE.Mesh | null,
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    animId: 0,
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    autoRotate: true,
    isRunning: false,
    modeColor,
    timeLabel,
    mode,
    materials: [] as THREE.MeshStandardMaterial[],
    timerFaceIndex: 4,
  })

  useEffect(() => {
    const mount = mountRef.current!
    const s = stateRef.current
    const w = mount.clientWidth
    const h = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    s.scene = scene

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(0, 0, 5.5)
    camera.lookAt(0, 0, 0)
    s.camera = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)
    s.renderer = renderer

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 1.5)
    dir.position.set(5, 8, 6)
    scene.add(dir)
    const fill = new THREE.DirectionalLight(0xffffff, 0.3)
    fill.position.set(-5, -3, -5)
    scene.add(fill)

    // Materials — 6 faces
    const timerTex = makeTimerTexture(timeLabel, mode, modeColor)
    const materials = [
      new THREE.MeshStandardMaterial({ color: new THREE.Color(modeColor), roughness: 0.35, metalness: 0.5 }), // +x
      new THREE.MeshStandardMaterial({ color: new THREE.Color(modeColor), roughness: 0.35, metalness: 0.5 }), // -x
      new THREE.MeshStandardMaterial({ color: new THREE.Color(modeColor), roughness: 0.35, metalness: 0.5 }), // +y
      new THREE.MeshStandardMaterial({ color: new THREE.Color(modeColor), roughness: 0.35, metalness: 0.5 }), // -y
      new THREE.MeshStandardMaterial({ map: timerTex, roughness: 0.2, metalness: 0.3 }),                      // +z (frente — timer)
      new THREE.MeshStandardMaterial({ color: new THREE.Color(modeColor), roughness: 0.35, metalness: 0.5 }), // -z
    ]
    s.materials = materials

    // Rounded cube via BoxGeometry com subdivisões + escala para simular arredondamento
    // Usamos BoxGeometry normal + ShapeGeometry arredondado como overlay
    const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2, 4, 4, 4)

    // Arredondar vértices manualmente
    const pos = geometry.attributes.position
    const radius = 0.18
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const len = Math.sqrt(x * x + y * y + z * z)
      const half = 1.1 - radius
      const cx = Math.max(-half, Math.min(half, x))
      const cy = Math.max(-half, Math.min(half, y))
      const cz = Math.max(-half, Math.min(half, z))
      const dx = x - cx, dy = y - cy, dz = z - cz
      const dlen = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dlen > 0) {
        pos.setXYZ(i, cx + (dx / dlen) * radius, cy + (dy / dlen) * radius, cz + (dz / dlen) * radius)
      }
    }
    geometry.computeVertexNormals()

    const cube = new THREE.Mesh(geometry, materials)
    scene.add(cube)
    s.cube = cube

    // Wireframe sutil
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.22, 2.22, 2.22))
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })
    scene.add(new THREE.LineSegments(edges, lineMat))

    // Animate loop
    const animate = () => {
      s.animId = requestAnimationFrame(animate)
      if (!s.isDragging && s.autoRotate) {
        cube.rotation.y += s.isRunning ? 0.006 : 0.0015
      }
      renderer.render(scene, camera)
    }
    animate()

    // Mouse drag
    const onMouseDown = (e: MouseEvent) => {
      s.isDragging = true
      s.autoRotate = false
      s.prevMouse = { x: e.clientX, y: e.clientY }
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!s.isDragging) return
      const dx = e.clientX - s.prevMouse.x
      const dy = e.clientY - s.prevMouse.y
      cube.rotation.y += dx * 0.012
      cube.rotation.x += dy * 0.012
      s.prevMouse = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = () => {
      s.isDragging = false
      setTimeout(() => { s.autoRotate = true }, 2000)
    }

    // Touch drag
    const onTouchStart = (e: TouchEvent) => {
      s.isDragging = true
      s.autoRotate = false
      s.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!s.isDragging) return
      const dx = e.touches[0].clientX - s.prevMouse.x
      const dy = e.touches[0].clientY - s.prevMouse.y
      cube.rotation.y += dx * 0.012
      cube.rotation.x += dy * 0.012
      s.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd = () => {
      s.isDragging = false
      setTimeout(() => { s.autoRotate = true }, 2000)
    }

    const handleResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
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
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  // Atualiza timer texture em tempo real
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

  // Atualiza cor
  useEffect(() => {
    const s = stateRef.current
    if (!s.materials.length) return
    const color = new THREE.Color(modeColor)
    ;[0, 1, 2, 3, 5].forEach(i => s.materials[i].color.set(color))
    s.modeColor = modeColor
    // Atualiza face do timer também
    if (s.materials[4].map) {
      const tex = makeTimerTexture(s.timeLabel, s.mode, modeColor)
      s.materials[4].map.dispose()
      s.materials[4].map = tex
      s.materials[4].needsUpdate = true
    }
  }, [modeColor])

  // Atualiza velocidade de rotação
  useEffect(() => {
    stateRef.current.isRunning = isRunning
  }, [isRunning])

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  )
}