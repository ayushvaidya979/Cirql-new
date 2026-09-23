import { lazy, Suspense } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import { Features, HowItWorks, Flow, Partners, Closing } from './components/Sections.jsx'
import Journey from './components/Journey.jsx'
import Rewards from './components/Rewards.jsx'
import Footer from './components/Footer.jsx'
import { useSession } from './lib/auth.js'
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
      <Footer />
    </>
  )
}

export default function App() {
  const path = usePath()
  const session = useSession()

  const protectedRoute = path.startsWith('/sell') || path.startsWith('/partner')
  const authRoute = path.startsWith('/login') || path.startsWith('/signup')

  return (
    <>
      <Header />
      <Suspense fallback={<main style={{ minHeight: '100vh' }} />}>
        {protectedRoute && !session ? (
          <AuthPage mode="login" />
        ) : path.startsWith('/sell') ? (
          <SellPage />
        ) : path.startsWith('/partner') ? (
          <PartnerPage />
        ) : authRoute ? (
          <AuthPage mode={path.startsWith('/signup') ? 'signup' : 'login'} />
        ) : (
          <Home />
        )}
      </Suspense>
    </>
  )
}
