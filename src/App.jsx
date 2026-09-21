import { lazy, Suspense } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import { Features, HowItWorks, Dashboard, Flow, Partners, Closing } from './components/Sections.jsx'
import Journey from './components/Journey.jsx'
import { usePath } from './router.jsx'

// The valuation flow only loads when someone opens it.
const SellPage = lazy(() => import('./pages/SellPage.jsx'))

function Home() {
  return (
    <>
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Journey />
        <Dashboard />
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
      {path.startsWith('/sell') ? (
        <Suspense fallback={<main className="sell" />}>
          <SellPage />
        </Suspense>
      ) : (
        <Home />
      )}
    </>
  )
}
