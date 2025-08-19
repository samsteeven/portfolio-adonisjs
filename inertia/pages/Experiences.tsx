'use client'
import SectionTitle from '@/components/SectionTitle'
import { MY_EXPERIENCE } from '@/data'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { ensureGsapScrollTrigger } from '~/utils/gsap_client'

const Experiences = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ensureGsapScrollTrigger().then((ok) => mounted && setReady(ok))
    return () => {
      mounted = false
    }
  }, [])

  useGSAP(
    () => {
      if (!ready) return
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
          end: 'bottom 50%',
          toggleActions: 'restart none none reverse',
          scrub: 1,
        },
      })
      tl.from('.experience-item', { y: 50, opacity: 0, stagger: 0.3 })
    },
    { scope: containerRef, dependencies: [ready] }
  )

  useGSAP(
    () => {
      if (!ready) return
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'bottom 50%',
          end: 'bottom 20%',
          scrub: 1,
        },
      })
      tl.to(containerRef.current, { y: -150, opacity: 0 })
    },
    { scope: containerRef, dependencies: [ready] }
  )

  return (
    <section className="py-section mb-72" id="my-experience">
      <div className="container" ref={containerRef}>
        <SectionTitle title="My Experience" />
        <div className="grid gap-14">
          {MY_EXPERIENCE.map((item) => (
            <div key={item.title} className="experience-item">
              <p className="text-xl text-muted-foreground">{item.company}</p>
              <p className="text-5xl font-anton leading-none mt-3.5 mb-2.5">{item.title}</p>
              <p className="text-lg text-muted-foreground">{item.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experiences
