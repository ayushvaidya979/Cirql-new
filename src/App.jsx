import { lazy, Suspense } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import { Features, HowItWorks, Flow, Partners, Closing } from './components/Sections.jsx'
import Journey from './components/Journey.jsx'
import Rewards from './components/Rewards.jsx'
import { usePath } from './router.jsx'

// The valuation flow only loads when someone opens it.
const SellPage = lazy(() => import('./pages/SellPage.jsx'))
const PartnerPage = lazy(() => import('./pages/PartnerPage.jsx'))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))

function Home() {
  return (
    <>
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Journey />
        <Rewards />
        <Flow />
        <Partners />
      </main>
      <Closing />
    </>
  )
}

export default function App() {
  const path = usePath()
  return (
    <>
      <Header />
      <Suspense fallback={<main style={{ minHeight: '100vh' }} />}>
        {path.startsWith('/sell') ? (
          <SellPage />
        ) : path.startsWith('/partner') ? (
          <PartnerPage />
        ) : path.startsWith('/login') || path.startsWith('/signup') ? (
          <AuthPage mode={path.startsWith('/signup') ? 'signup' : 'login'} />
        ) : (
          <Home />
        )}
      </Suspense>
    </>
  )
}
