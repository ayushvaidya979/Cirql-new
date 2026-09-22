import { useSyncExternalStore } from 'react'

/* Prevent the browser from auto-restoring a mid-hero scroll position
   when the user presses the back button. We always want to start at the top. */
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual'
}

/* A tiny history-API router: the site only has a couple of pages. */
const subscribe = (cb) => {
  // Store the wrapper so removeEventListener can reference the exact same function.
  const handler = () => {
    window.scrollTo(0, 0)
    cb()
  }
  window.addEventListener('popstate', handler)
  return () => window.removeEventListener('popstate', handler)
}

export const usePath = () => useSyncExternalStore(subscribe, () => window.location.pathname)

export function navigate(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

export function Link({ to, onClick, ...props }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(to)
      }}
      {...props}
    />
  )
}
