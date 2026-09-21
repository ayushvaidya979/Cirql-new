import { useEffect, useRef, useState } from 'react'
import { Link } from '../router.jsx'
import { Icons, Leaf } from '../components/Doodles.jsx'
import { hasSupabase } from '../lib/supabase.js'
import { IntroScene, VerifyScene, RequestsScene, RouteScene, PayoutScene, GrowScene } from './PartnerScenes.jsx'
import './PartnerPage.css'

const CHAPTERS = [
  { Scene: VerifyScene, kicker: 'Chapter 1', title: 'Get verified', text: 'Share your CPCB / SPCB authorisation. Our team checks it and your facility goes live as a verified EcoBin partner.' },
  { Scene: RequestsScene, kicker: 'Chapter 2', title: 'Requests flow in', text: 'Households and offices near you list their old phones and laptops. Each request arrives identified by our AI and pre-valued.' },
  { Scene: RouteScene, kicker: 'Chapter 3', title: 'Pickups come to you', text: 'We match requests to your service area and plan the pickup route, so your team collects more devices in fewer trips.' },
  { Scene: PayoutScene, kicker: 'Chapter 4', title: 'Process & pay out', text: 'Log each device as you process it. Customers are paid instantly through the platform, with every transaction on record.' },
  { Scene: GrowScene, kicker: 'Chapter 5', title: 'Grow your impact', text: 'Track volumes, earnings and recovered materials, and download compliance-ready reports whenever you need them.' },
]

const BENEFITS = [
  ['inbox', 'Steady supply', 'A reliable stream of sorted e-waste from your area.'],
  ['value', 'Pre-valued devices', 'Every device arrives identified and priced by AI.'],
  ['truck', 'Smarter pickups', 'Route planning that cuts empty trips.'],
  ['receipt', 'Compliance made easy', 'Records and reports ready for audits.'],
]

const FACILITY_TYPES = ['Recycler', 'Refurbisher', 'Dismantler', 'Collection centre', 'Other']
const EMPTY = { company: '', contact_name: '', phone: '', email: '', city: '', state: 'Maharashtra', facility_type: 'Recycler', authorization_number: '', capacity_mt_per_month: '', message: '' }

function validate(f) {
  const e = {}
  if (f.company.trim().length < 2) e.company = 'Please enter your company name'
  if (f.contact_name.trim().length < 2) e.contact_name = 'Please enter a contact name'
  if (!/^[0-9 +()-]{7,20}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) e.email = 'Enter a valid email address'
  if (f.city.trim().length < 2) e.city = 'Please enter your city'
  if (f.capacity_mt_per_month !== '' && !(Number(f.capacity_mt_per_month) >= 0)) e.capacity_mt_per_month = 'Enter a number'
  return e
}

async function sendEnquiry(f) {
  const URL_ = import.meta.env.VITE_SUPABASE_URL
  const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  const body = {
    ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])),
    capacity_mt_per_month: f.capacity_mt_per_month === '' ? null : Number(f.capacity_mt_per_month),
  }
  for (const k of ['state', 'authorization_number', 'message']) if (!body[k]) body[k] = null
  const headers = { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }
  if (!KEY.startsWith('sb_')) headers.Authorization = `Bearer ${KEY}`
  const res = await fetch(`${URL_}/rest/v1/partner_enquiries`, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`enquiry failed (${res.status}) ${await res.text().catch(() => '')}`)
}

export default function PartnerPage() {
  const [active, setActive] = useState(0)
  const chaptersRef = useRef(null)
  const formRef = useRef(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  useEffect(() => {
    document.title = 'Become a partner · EcoBin'
    return () => {
      document.title = 'EcoBin · Sell & Recycle Your Old Electronics'
    }
  }, [])

  // The chapter crossing the middle of the screen drives the sticky scene.
  useEffect(() => {
    const els = [...chaptersRef.current.querySelectorAll('.chapter')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number(e.target.dataset.i))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      formRef.current?.querySelector(`[name="${Object.keys(errs)[0]}"]`)?.focus()
      return
    }
    setStatus('sending')
    try {
      await sendEnquiry(form)
      setStatus('sent')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const toForm = () => document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const field = (k, label, props = {}) => (
    <label className={`pf-field ${errors[k] ? 'has-error' : ''} ${props.wide ? 'pf-field--wide' : ''}`}>
      <span>{label}{props.required && <b aria-hidden="true"> *</b>}</span>
      {props.as === 'textarea' ? (
        <textarea name={k} value={form[k]} onChange={set(k)} rows={4} maxLength={2000} placeholder={props.placeholder} />
      ) : props.as === 'select' ? (
        <select name={k} value={form[k]} onChange={set(k)}>
          {props.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input name={k} value={form[k]} onChange={set(k)} type={props.type || 'text'} inputMode={props.inputMode}
          autoComplete={props.autoComplete} placeholder={props.placeholder} maxLength={props.maxLength || 160}
          aria-invalid={Boolean(errors[k])} />
      )}
      {errors[k] && <em>{errors[k]}</em>}
    </label>
  )

  return (
    <main className="partner-page">
      {/* ---------- intro ---------- */}
      <section className="pp-hero">
        <Leaf className="pp-leaf pp-leaf--1" size={64} rotate={-20} />
        <div className="pp-wrap pp-hero__grid">
          <div>
            <Link to="/" className="pp-back"><Icons.arrow width="16" height="16" /> Back to home</Link>
            <p className="pp-kicker">EcoBin partner programme</p>
            <h1><span>Grow your recycling</span> <span>business with us</span></h1>
            <p className="pp-lead">
              Becoming an EcoBin partner means a steady stream of verified, pre-valued e-waste from your city, with pickups,
              payments and paperwork handled on one platform. Here’s the journey.
            </p>
            <div className="pp-actions">
              <button type="button" className="btn btn--primary" onClick={() => chaptersRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                Start the journey
              </button>
              <button type="button" className="btn btn--ghost" onClick={toForm}>Skip to enquiry</button>
            </div>
          </div>
          <div className="pp-hero__art"><IntroScene /></div>
        </div>
      </section>

      {/* ---------- the story ---------- */}
      <section className="pp-story">
        <div className="pp-wrap pp-story__grid">
          <div className="pp-stage" aria-hidden="true">
            <div className="pp-stage__frame">
              {CHAPTERS.map(({ Scene }, i) => (
                <div key={i} className={`pp-scene ${i === active ? 'is-active' : ''}`}><Scene /></div>
              ))}
            </div>
            <ol className="pp-dots">
              {CHAPTERS.map((c, i) => <li key={i} className={i <= active ? 'is-on' : ''}><span>{i + 1}</span></li>)}
            </ol>
          </div>
          <div ref={chaptersRef} className="pp-chapters">
            {CHAPTERS.map(({ Scene, kicker, title, text }, i) => (
              <article key={i} className={`chapter ${i === active ? 'is-active' : ''}`} data-i={i}>
                <div className="chapter__art" aria-hidden="true"><Scene /></div>
                <p className="chapter__kicker">{kicker}</p>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- benefits ---------- */}
      <section className="pp-benefits">
        <div className="pp-wrap">
          <h2 className="pp-h2"><span>Why partners</span> <span>choose EcoBin</span></h2>
          <div className="pp-benefits__grid">
            {BENEFITS.map(([icon, t, d], i) => {
              const Icon = Icons[icon]
              return (
                <div key={t} className="benefit" style={{ '--i': i }}>
                  <span className="benefit__icon"><Icon /></span>
                  <strong>{t}</strong>
                  <p>{d}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------- enquiry ---------- */}
      <section className="pp-enquiry" id="enquiry">
        <div className="pp-wrap pp-enquiry__grid">
          <div className="pp-enquiry__intro">
            <p className="pp-kicker">Partner enquiry</p>
            <h2 className="pp-h2"><span>Let’s start</span> <span>the conversation</span></h2>
            <p className="pp-lead">Tell us about your facility. Our partnerships team will get in touch to walk you through onboarding.</p>
            <svg className="pp-mail" viewBox="0 0 240 180" aria-hidden="true">
              <path d="M20 150c30-10 60 10 90-6s50-40 110-30" fill="none" stroke="#5cbf45" strokeWidth="3" strokeDasharray="6 9" className="pp-mail__trail" />
              <g className="pp-mail__plane">
                <path d="M150 40 206 60 150 80l12-20Z" fill="#1e9e57" />
                <path d="M162 60h44" stroke="#fff" strokeWidth="2" />
              </g>
              <g transform="translate(24 70)">
                <rect width="96" height="66" rx="10" fill="#fff" stroke="#1e9e57" strokeWidth="3" />
                <path d="m6 8 42 30 42-30" fill="none" stroke="#1e9e57" strokeWidth="3" strokeLinejoin="round" />
              </g>
            </svg>
          </div>

          <div className="pp-form-card">
            {status === 'sent' ? (
              <div className="pp-sent">
                <span className="pp-sent__icon"><Icons.check width="40" height="40" /></span>
                <h3>Enquiry received!</h3>
                <p>Thank you, {form.contact_name.split(' ')[0]}. Our partnerships team will contact you at {form.email} shortly.</p>
                <Link className="btn btn--ghost" to="/">Back to home</Link>
              </div>
            ) : (
              <form ref={formRef} className="pp-form" onSubmit={submit} noValidate>
                {field('company', 'Company name', { required: true, autoComplete: 'organization', wide: true })}
                {field('contact_name', 'Contact person', { required: true, autoComplete: 'name' })}
                {field('phone', 'Phone', { required: true, type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 20, placeholder: '+91' })}
                {field('email', 'Work email', { required: true, type: 'email', autoComplete: 'email', maxLength: 200, wide: true })}
                {field('city', 'City', { required: true, autoComplete: 'address-level2', maxLength: 80 })}
                {field('state', 'State', { autoComplete: 'address-level1', maxLength: 80 })}
                {field('facility_type', 'Facility type', { as: 'select', options: FACILITY_TYPES })}
                {field('capacity_mt_per_month', 'Capacity (tonnes / month)', { inputMode: 'decimal', maxLength: 10 })}
                {field('authorization_number', 'CPCB / SPCB authorisation no.', { maxLength: 120, wide: true, placeholder: 'Optional' })}
                {field('message', 'Anything else we should know?', { as: 'textarea', wide: true, placeholder: 'Service area, devices you handle, questions…' })}
                {status === 'error' && <p className="pp-form__error">We couldn’t send your enquiry. Please try again in a moment.</p>}
                <button type="submit" className="btn btn--primary pp-form__submit" disabled={status === 'sending' || !hasSupabase}>
                  {status === 'sending' ? 'Sending…' : <>Send enquiry <Icons.send width="18" height="18" /></>}
                </button>
                <p className="pp-form__fine">We only use these details to contact you about the partner programme.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
