import gsap from 'gsap'

let ready = false
let promise: Promise<boolean> | null = null

/**
 * Charge et enregistre @gsap/react + ScrollTrigger côté client une seule fois.
 * Retourne un boolean indiquant la disponibilité.
 */
export function ensureGsapScrollTrigger(): Promise<boolean> {
  if (ready) return Promise.resolve(true)
  if (promise) return promise

  promise = (async () => {
    if (typeof window === 'undefined') return false
    const [{ default: ScrollTrigger }, { useGSAP }] = await Promise.all([
      import('gsap/ScrollTrigger'),
      import('@gsap/react'),
    ])
    gsap.registerPlugin(useGSAP, ScrollTrigger)
    ready = true
    return true
  })()

  return promise
}
