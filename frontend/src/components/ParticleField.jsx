import { useEffect, useRef } from 'react'

/**
 * ParticleField — canvas de constelación fija.
 * Portado del #pfield original (vanilla JS + requestAnimationFrame).
 * Limpia el listener de resize y cancela el frame al desmontar.
 */
const ParticleField = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let pts = []
    let w, h

    function size() {
      w = canvas.width  = window.innerWidth
      h = canvas.height = window.innerHeight
      init()
    }

    function init() {
      const n = Math.min(70, Math.floor(w * h / 22000))
      pts = []
      for (let i = 0; i < n; i++) {
        pts.push({
          x:  Math.random() * w,
          y:  Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r:  Math.random() * 1.4 + 0.4,
        })
      }
    }

    function loop() {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(22,184,154,.5)'
        ctx.fill()

        for (let j = i + 1; j < pts.length; j++) {
          const q  = pts[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const d  = Math.hypot(dx, dy)
          if (d < 130) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(22,184,154,${(0.10 * (1 - d / 130)).toFixed(3)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(loop)
    }

    window.addEventListener('resize', size)
    size()
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', size)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.55,
      }}
    />
  )
}

export default ParticleField
