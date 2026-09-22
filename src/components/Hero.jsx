import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from '../router.jsx'
import './Hero.css'

/* ------------------------------------------------------------------ *
 * Frame sequence
 * The video is pre-extracted to WebP frames (public/hero/{sm,lg,xl}) at
 * 15fps. Drawing frames on a canvas scrubs smoothly in every browser,
 * unlike seeking a <video>, which stutters badly in Safari/iOS.
 * ------------------------------------------------------------------ */
const FRAME_COUNT = 150
// Frame widths per set. Frames were AI-upscaled 2× from the 720p source.
const SET_WIDTH = { sm: 720, lg: 1280, xl: 1920 }
const frameSrc = (set, i) => `/hero/${set}/${String(i + 1).padStart(3, '0')}.webp`

// Portion of the scroll where the first / last frame just holds, so the
// story starts settled and the celebration lingers before the pin releases.
const HOLD_START = 0.03
const HOLD_END = 0.06
// How quickly the drawn frame catches up with the scroll position (0–1).
const EASE = 0.14

/* Elements in the following section marked data-fly start from these
   offsets and fly into place while that section slides over the pinned hero. */
const FLY_FROM = {
  art: { x: -16, y: 26, r: -12, s: 0.72 }, // x in vw, y in vh, r in deg
  trail: { x: -34, y: 18, r: -24, s: 0.8 },
}

/* Copy is keyed to the frame where each beat of the video begins. */
const STAGES = [
  {
    from: 0,
    title: ['Old gadgets,', 'hidden value'],
    body: 'That cracked phone in the drawer isn’t junk. It’s recoverable material, and money waiting for you.',
  },
  {
    from: 33,
    title: ['Don’t bin it,', 'recycle it'],
    body: 'Batteries and circuit boards leak toxic metals into soil and water when thrown away. We recycle every device the right way.',
  },
  {
    from: 58,
    title: ['Checked at', 'your door'],
    body: 'Book a pickup and a verified executive inspects it on the spot. Your data is wiped before it leaves your hands.',
  },
  {
    from: 99,
    title: ['Get paid', 'on the spot'],
    body: 'Accept the quote and the money reaches your UPI or bank account before we leave. No haggling, no waiting.',
  },
  {
    from: 118,
    title: ['Clear clutter,', 'go green'],
    body: 'Responsible recycling, certified data wiping and cash in your pocket, all in one visit.',
  },
]

/* Split a two-line title into words, numbering them for the stagger. */
const titleLines = (lines) => {
  let n = 0
  return lines.map((line) => line.split(' ').map((w) => ({ w, i: n++ })))
}

const stageFor = (frame) => {
  for (let s = STAGES.length - 1; s > 0; s--) if (frame >= STAGES[s].from) return s
  return 0
}

// 1, then every 32nd, 16th … frame, so the whole scroll range becomes
// scrubbable fast and fills in with detail as the rest arrives.
function loadOrder(n) {
  const seen = new Uint8Array(n)
  const order = []
  for (const step of [32, 16, 8, 4, 2, 1]) {
    for (let i = 0; i < n; i += step) {
      if (!seen[i]) {
        seen[i] = 1
        order.push(i)
      }
    }
  }
  if (!seen[n - 1]) order.splice(1, 0, n - 1)
  return order
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

// Glide to the next section (through the rest of the story) instead of jumping.
function goToNext(e) {
  const el = document.querySelector(e.currentTarget.getAttribute('href'))
  if (!el) return
  e.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: reduce ? 'auto' : 'smooth' })
}

export default function Hero() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const leavesRef = useRef(null)
  const stickyRef = useRef(null)
  const [stage, setStage] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    // Pick the smallest frame set that is still sharp at this canvas size.
    const need = canvas.clientWidth * dpr
    const set = need > 1400 ? 'xl' : need > 760 ? 'lg' : 'sm'
    const frames = new Array(FRAME_COUNT)

    const sticky = stickyRef.current
    const flyEls = [...(section.nextElementSibling?.querySelectorAll('[data-fly]') ?? [])]

    let sectionTop = 0
    let scrollDist = 1 // scroll length of the video story
    let lastCover = -1
    let target = 0
    let current = 0
    let drawnImg = null
    let lastStage = 0
    let lastBar = -1
    let lastScrolled = false
    let raf = 0
    let lastT = 0
    let disposed = false

    /* ---------- canvas ---------- */
    const sizeCanvas = () => {
      const w = Math.min(Math.round(canvas.clientWidth * dpr), SET_WIDTH[set])
      const h = Math.round((w * 9) / 16)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        ctx.imageSmoothingQuality = 'high'
        ctx.fillStyle = '#f4f3ed'
        ctx.fillRect(0, 0, w, h)
        drawnImg = null
      }
    }

    const nearestLoaded = (i) => {
      if (frames[i]) return frames[i]
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (frames[i - d]) return frames[i - d]
        if (frames[i + d]) return frames[i + d]
      }
      return null
    }

    const draw = (i) => {
      const img = nearestLoaded(i)
      if (!img || img === drawnImg) return
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      drawnImg = img
    }

    /* ---------- scroll → frame ---------- */
    const measure = () => {
      sectionTop = section.getBoundingClientRect().top + window.scrollY
      // The last screen of the section is reserved for the next section
      // sliding up over the still-pinned hero.
      scrollDist = Math.max(1, section.offsetHeight - sticky.offsetHeight - window.innerHeight)
    }

    // 0 → 1 while the next section slides over the (still) pinned hero.
    const coverProgress = () =>
      clamp01((window.scrollY - sectionTop - scrollDist) / window.innerHeight)

    const renderCover = (c) => {
      const v = Math.round(c * 1000) / 1000
      if (v === lastCover) return
      lastCover = v
      if (reduceMotion) return
      // Gentle ease so the fly-in lasts the whole slide-up, not just its start.
      const k = Math.pow(1 - v, 1.5)
      const e = 1 - k
      for (const el of flyEls) {
        const f = FLY_FROM[el.dataset.fly] ?? FLY_FROM.art
        el.style.transform = k
          ? `translate3d(${(f.x * k).toFixed(2)}vw, ${(f.y * k).toFixed(2)}vh, 0) rotate(${(f.r * k).toFixed(2)}deg) scale(${(1 - (1 - f.s) * k).toFixed(4)})`
          : ''
        el.style.opacity = (0.15 + 0.85 * Math.min(1, e * 1.6)).toFixed(3)
      }
    }

    const progress = () => clamp01((window.scrollY - sectionTop) / scrollDist)

    const frameFor = (p) =>
      clamp01((p - HOLD_START) / (1 - HOLD_START - HOLD_END)) * (FRAME_COUNT - 1)

    const render = (p) => {
      const idx = Math.round(current)
      draw(idx)

      const s = stageFor(idx)
      if (s !== lastStage) {
        lastStage = s
        setStage(s)
      }

      const bar = Math.round(p * 1000) / 1000
      if (bar !== lastBar) {
        lastBar = bar
        leavesRef.current.style.transform = `translate3d(0, ${(-bar * 90).toFixed(1)}px, 0)`
      }

      const sc = p > 0.015
      if (sc !== lastScrolled) {
        lastScrolled = sc
        setScrolled(sc)
      }
    }

    const tick = (t) => {
      raf = 0
      const dt = lastT ? Math.min(t - lastT, 64) : 16.7
      lastT = t

      const p = progress()
      target = frameFor(p)
      if (reduceMotion) {
        current = target
      } else {
        current += (target - current) * (1 - Math.pow(1 - EASE, dt / 16.7))
        if (Math.abs(target - current) < 0.05) current = target
      }
      render(p)
      renderCover(coverProgress())

      if (current !== target) raf = requestAnimationFrame(tick)
      else lastT = 0
    }

    const requestTick = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(tick)
    }

    /* ---------- loading ---------- */
    const queue = loadOrder(FRAME_COUNT)
    const loadNext = async () => {
      while (queue.length && !disposed) {
        const i = queue.shift()
        const img = new Image()
        img.decoding = 'async'
        // Wait for the download only: browsers defer decode() in background
        // tabs, which would stall the whole queue until the tab is shown.
        const ok = await new Promise((resolve) => {
          img.onload = () => resolve(true)
          img.onerror = () => resolve(false)
          img.src = frameSrc(set, i)
        })
        if (disposed) return
        if (!ok) continue
        img.decode().catch(() => { }) // warm the decode off the main thread
        frames[i] = img
        // Repaint if this frame is a closer match than what's on screen.
        if (Math.abs(i - Math.round(current)) <= 32) {
          drawnImg = null
          requestTick()
        }
      }
    }

    /* ---------- wiring ---------- */
    sizeCanvas()
    measure()
    current = target = frameFor(progress())
    for (let k = 0; k < 6; k++) loadNext()

    const onResize = () => {
      sizeCanvas()
      measure()
      drawnImg = null
      requestTick()
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(canvas)
    ro.observe(document.documentElement)

    window.addEventListener('scroll', requestTick, { passive: true })
    requestTick()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', requestTick)
    }
  }, [])

  return (
    <section ref={sectionRef} className="hero" aria-label="How it works">
      <div ref={stickyRef} className="hero__sticky">
        <h1 className="sr-only">EcoBin: sell and recycle your old electronics with free doorstep pickup</h1>

        <div className="hero__media" aria-hidden="true">
          <canvas ref={canvasRef} className="hero__canvas" />
        </div>

        <svg ref={leavesRef} className="hero__leaves" viewBox="0 0 420 260" aria-hidden="true">
          <path d="M40 260C30 170 70 90 170 60c-20 90-60 160-130 200Z" fill="#bfe6b3" />
          <path d="M40 260C80 190 120 130 170 60" stroke="#8fd07a" strokeWidth="3" fill="none" />
          <path d="M150 260c10-70 60-120 140-130-20 70-70 115-140 130Z" fill="#d3efc9" />
          <path d="M150 260c35-50 80-95 140-130" stroke="#a6dc95" strokeWidth="3" fill="none" />
          <ellipse cx="330" cy="40" rx="9" ry="16" transform="rotate(35 330 40)" fill="#6fcf4e" />
          <ellipse cx="250" cy="10" rx="6" ry="11" transform="rotate(-25 250 10)" fill="#9ad889" />
        </svg>

        <div className="hero__content">
          <div className="hero__stages">
            {STAGES.map((st, i) => (
              <div
                key={i}
                className={`stage ${i === stage ? 'is-active' : i < stage ? 'is-after' : 'is-before'}`}
                aria-hidden={i !== stage}
              >
                <p className="stage__title">
                  {titleLines(st.title).map((line, l) => (
                    <span className={`stage__line stage__line--${l + 1}`} key={l}>
                      {line.map(({ w, i: k }) => (
                        <Fragment key={k}>
                          <span className="w">
                            <span style={{ '--i': k }}>{w}</span>
                          </span>{' '}
                        </Fragment>
                      ))}
                    </span>
                  ))}
                </p>
                <p className="stage__body">{st.body}</p>
              </div>
            ))}
          </div>

          <div className="hero__ctas">
            <a className="btn btn--primary" href="#how-it-works" onClick={goToNext}>
              Check device value
            </a>
            <Link className="btn btn--ghost" to="/partner">Become a partner</Link>
          </div>
        </div>

        <div className={`hero__cue ${scrolled ? 'is-hidden' : ''}`} aria-hidden="true">
          <span className="hero__mouse" />
          Scroll to explore
        </div>
      </div>
    </section>
  )
}
