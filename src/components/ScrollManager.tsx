import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Scrolls to top on route change; if the URL carries a hash,
 * drifts gently to that element instead.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120)
        return () => clearTimeout(t)
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}
