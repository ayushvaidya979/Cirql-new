import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, AGES, CONDITIONS, estimate } from '../data/pricing.js'
import { DeviceArt, Stage, PickupStage } from '../components/DeviceDoodles.jsx'
import Pickup from './Pickup.jsx'
import PhotoStep from './PhotoStep.jsx'
import { SCAN_HANDOFF_KEY } from '../lib/scanHandoff.js'
import { Icons, Leaf } from '../components/Doodles.jsx'
import { Link } from '../router.jsx'
import './SellPage.css'

const STEPS = ['Device', 'Brand', 'Age', 'Condition', 'Photo', 'Your price']
const PHOTO = 4
const RESULT = 5

const AUTO_ADVANCE_MS = 380

function useCountUp(value, active) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!active) return setShown(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setShown(value)
    let raf = 0
    const start = performance.now()
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 1400)
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const safety = setTimeout(() => setShown(value), 1700) // e.g. background tab
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(safety)
    }
  }, [value, active])
  return shown
}

const rupees = (n) => '₹' + n.toLocaleString('en-IN')

export default function SellPage() {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const EMPTY = { category: null, brand: null, age: null, condition: null, model: null, basePrice: null, scanned: null }
  const [pick, setPick] = useState(EMPTY)
  const timer = useRef(0)
  const [pickup, setPickup] = useState(null) // null | { phase, match }

  useEffect(() => {
    document.title = 'Check your device value · Cirql'
    return () => {
      document.title = 'Cirql · Sell & Recycle Your Old Electronics'
      clearTimeout(timer.current)
    }
  }, [])

  const cat = CATEGORIES.find((c) => c.id === pick.category)
  const brand = cat?.brands.find((b) => b.id === pick.brand)
  const age = AGES.find((a) => a.id === pick.age)
  const cond = CONDITIONS.find((c) => c.id === pick.condition)
  const price = estimate(pick.category, pick.brand, pick.age, pick.condition, pick.basePrice)
  const deviceName = pick.model || (brand && cat ? `${brand.name === 'Other' ? '' : brand.name + ' '}${cat.name}` : '')
  const done = step === RESULT
  const shownPrice = useCountUp(price, done)

  const go = (to) => {
    clearTimeout(timer.current)
    setPickup(null)
    setDir(to > step ? 1 : -1)
    setStep(to)
  }

  const choose = (key, value) => {
    setPick((p) => {
      const next = { ...p, [key]: value }
      // A different device type means its brand list changes too.
      if (key === 'category' && value !== p.category) next.brand = null
      // Picking device or brand by hand drops any model found by a photo scan.
      if (key === 'category' || key === 'brand') Object.assign(next, { model: null, basePrice: null, scanned: null })
      return next
    })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => go(step + 1), AUTO_ADVANCE_MS)
  }

  const restart = () => {
    setPick(EMPTY)
    go(0)
  }

  const fromScan = (m) => ({ category: m.category, brand: m.brand_id, model: m.model, basePrice: m.base_price ?? null, scanned: m })

  // Arrived from "Scan device" on the home page: device + brand are known, start at the age question.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SCAN_HANDOFF_KEY)
      if (!raw) return
      sessionStorage.removeItem(SCAN_HANDOFF_KEY)
      setPick({ ...EMPTY, ...fromScan(JSON.parse(raw)) })
      setDir(1)
      setStep(2)
    } catch {
      /* storage unavailable: start normally */
    }
  }, [])

  // Photo step finished. A match either confirms the choice or replaces it.
  const photoDone = (m, { switchTo } = {}) => {
    if (m) {
      const same = m.category === pick.category && m.brand_id === pick.brand
      if (same || switchTo) setPick((p) => ({ ...p, ...fromScan(m) }))
    }
    go(RESULT)
  }

  const pickupCaption = pickup && {
    locating: 'Looking for authorised recyclers around you…',
    spinning: 'Shuffling through our recycling partners…',
    matched: `${pickup.match?.name} will collect your ${cat?.name.toLowerCase()}. See you tomorrow!`,
  }[pickup.phase]

  const caption = pickupCaption || [
    'Every old device has a story. Let’s find out what yours is worth.',
    `A ${cat?.name.toLowerCase()}! Who made it?`,
    pick.model ? `A ${pick.model}. How long has it been with you?` : `A ${brand?.name === 'Other' ? 'trusty' : brand?.name} ${cat?.name.toLowerCase()}. How long has it been with you?`,
    `${age?.label}. How is it holding up?`,
    `Snap a quick photo of your ${deviceName} so we can verify it.`,
    `Your ${deviceName} gets a second life, and you get paid.`,
  ][step]

  return (
    <main className="sell">
      <Leaf className="sell__leaf sell__leaf--1" size={70} rotate={-30} />
      <Leaf className="sell__leaf sell__leaf--2" size={46} rotate={50} color="#c6ebb2" />

      <div className="sell__inner">
        <div className="sell__intro">
          <Link to="/" className="sell__back"><Icons.arrow width="16" height="16" /> Back to home</Link>
          <h1><span>Check your</span> <span>device value</span></h1>
        </div>

        <div className="sell__grid">
          {/* ---------- wizard ---------- */}
          <section className="wizard" aria-live="polite">
            <ol className="stepper" style={{ '--p': step / (STEPS.length - 1) }}>
              {STEPS.map((s, i) => (
                <li key={s} className={i < step ? 'is-done' : i === step ? 'is-now' : ''}>
                  <button type="button" disabled={i > step || (done && i === RESULT)} onClick={() => go(i)}>
                    <span className="stepper__dot">{i < step ? <Icons.check width="14" height="14" /> : i + 1}</span>
                    <span className="stepper__label">{s}</span>
                  </button>
                </li>
              ))}
            </ol>

            <div key={step} className="panel" style={{ '--dir': dir }}>
              {step === 0 && (
                <>
                  <h2>Select your device</h2>
                  <p className="panel__hint">What would you like to recycle today?</p>
                  <div className="opts opts--category">
                    {CATEGORIES.map((c, i) => (
                      <button key={c.id} type="button" style={{ '--i': i }}
                        className={`opt opt--big ${pick.category === c.id ? 'is-picked' : ''}`}
                        onClick={() => choose('category', c.id)}>
                        <DeviceArt category={c.id} className="opt__art" />
                        <strong>{c.name}</strong>
                        <em>{c.blurb}</em>
                        <span className="opt__check"><Icons.check width="14" height="14" /></span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 1 && cat && (
                <>
                  <h2>Choose the brand</h2>
                  <p className="panel__hint">Which company made your {cat.name.toLowerCase()}?</p>
                  <div className="opts opts--brand">
                    {cat.brands.map((b, i) => (
                      <button key={b.id} type="button" style={{ '--i': i }}
                        className={`opt opt--brand ${pick.brand === b.id ? 'is-picked' : ''}`}
                        onClick={() => choose('brand', b.id)}>
                        <span className="opt__initial">{b.id === 'other' ? '…' : b.name[0]}</span>
                        <strong>{b.name}</strong>
                        <span className="opt__check"><Icons.check width="14" height="14" /></span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2>How old is it?</h2>
                  <p className="panel__hint">Roughly how long ago was it bought?</p>
                  <div className="opts opts--age">
                    {AGES.map((a, i) => (
                      <button key={a.id} type="button" style={{ '--i': i }}
                        className={`opt opt--row ${pick.age === a.id ? 'is-picked' : ''}`}
                        onClick={() => choose('age', a.id)}>
                        <span className="opt__cal"><b>{a.badge}</b><small>{a.unit}</small></span>
                        <strong>{a.label}</strong>
                        <span className="opt__meter" aria-hidden="true">
                          {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= a.level ? 'on' : ''} />)}
                        </span>
                        <span className="opt__check"><Icons.check width="14" height="14" /></span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && cat && (
                <>
                  <h2>What condition is it in?</h2>
                  <p className="panel__hint">Be honest. We check it at pickup anyway.</p>
                  <div className="opts opts--condition">
                    {CONDITIONS.map((c, i) => (
                      <button key={c.id} type="button" style={{ '--i': i }}
                        className={`opt opt--cond ${pick.condition === c.id ? 'is-picked' : ''}`}
                        onClick={() => choose('condition', c.id)}>
                        <DeviceArt category={cat.id} condition={c.id} className="opt__art opt__art--sm" />
                        <strong>{c.name}</strong>
                        <em>{c.text}</em>
                        <span className="opt__check"><Icons.check width="14" height="14" /></span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === PHOTO && cat && (
                <>
                  <h2>Scan your device</h2>
                  <p className="panel__hint">A quick photo lets our AI verify the exact model.</p>
                  <PhotoStep
                    chosen={{ category: pick.category, brand_id: pick.brand, brandName: brand?.name, categoryName: cat.name }}
                    scanned={pick.scanned}
                    onDone={photoDone}
                  />
                </>
              )}

              {step === RESULT && pickup && (
                <Pickup
                  summary={`${deviceName} · ${cond?.name}`}
                  payout={rupees(price)}
                  onPhase={(phase, match) => setPickup({ phase, match })}
                  onBack={() => setPickup(null)}
                />
              )}

              {step === RESULT && !pickup && (
                <div className="result">
                  <p className="result__eyebrow">You’ll receive</p>
                  <p className="result__price">
                    {rupees(shownPrice)}
                    <span className="burst" aria-hidden="true">
                      {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
                    </span>
                  </p>
                  <p className="result__note">Estimated payout after recycling. The final amount is confirmed when we inspect your device at pickup.</p>

                  <ul className="result__summary">
                    {[
                      ['Device', pick.model || cat?.name, 0],
                      ['Brand', brand?.name, 1],
                      ['Age', age?.label, 2],
                      ['Condition', cond?.name, 3],
                    ].map(([k, v, s], i) => (
                      <li key={k} style={{ '--i': i }}>
                        <span>{k}</span>
                        <strong>{v}</strong>
                        <button type="button" onClick={() => go(s)}>Edit</button>
                      </li>
                    ))}
                  </ul>

                  <div className="result__actions">
                    <button type="button" className="btn btn--primary" onClick={() => setPickup({ phase: 'locating' })}>
                      Book free pickup
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={restart}>Check another device</button>
                  </div>
                </div>
              )}
            </div>

            {step > 0 && step < RESULT && (
              <button type="button" className="wizard__back" onClick={() => go(step - 1)}>
                <Icons.arrow width="16" height="16" /> Back
              </button>
            )}
          </section>

          {/* ---------- story ---------- */}
          <aside className="story">
            {pickup ? (
              <PickupStage phase={pickup.phase} name={pickup.match?.name} />
            ) : (
              <Stage category={pick.category} brand={brand} age={age} condition={pick.condition} done={done} />
            )}
            <p key={`${step}-${pickup?.phase ?? ''}`} className="story__caption">{caption}</p>
          </aside>
        </div>
      </div>
    </main>
  )
}
