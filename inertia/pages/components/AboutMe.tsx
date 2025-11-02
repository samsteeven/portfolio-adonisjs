import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { ensureGsapScrollTrigger } from '~/utils/gsap_client'
import { usePage } from '@inertiajs/react'
import { InertiaProps } from '~/types'
import SafeHTML from '~/components/safeHTML'

const AboutMe = () => {
  const container = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const { portfolioOwner } = usePage<InertiaProps>().props

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
          id: 'about-me-in',
          trigger: container.current,
          start: 'top 70%',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      })
      tl.from('.slide-up-and-fade', { y: 150, opacity: 0, stagger: 0.05 })
    },
    { scope: container, dependencies: [ready] }
  )

  useGSAP(
    () => {
      if (!ready) return
      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'about-me-out',
          trigger: container.current,
          start: 'bottom 50%',
          end: 'bottom 10%',
          scrub: 0.5,
        },
      })
      tl.to('.slide-up-and-fade', { y: -150, opacity: 0, stagger: 0.02 })
    },
    { scope: container, dependencies: [ready] }
  )

  return (
    <section className="pb-section mb-72" id="about-me">
      <div className="container" ref={container}>
        <h2 className="text-4xl md:text-6xl font-thin mb-20 slide-up-and-fade">
          {portfolioOwner?.subInfo?.bio ||
            'I believe in a user centered design approach, ensuring that every project I work on is tailored to meet the specific needs of its users.'}
        </h2>

        <p className="pb-3 border-b text-muted-foreground slide-up-and-fade">This is me.</p>

        <div className="grid md:grid-cols-12 mt-9">
          <div className="md:col-span-5">
            <p className="text-5xl slide-up-and-fade">
              Hi, I&apos;m {portfolioOwner?.username || 'Developer'}.
            </p>
          </div>
          <div className="md:col-span-7">
            <div className="text-lg text-muted-foreground max-w-[450px]">
              <SafeHTML html={portfolioOwner?.subInfo?.bio2 || ''} className={'line-clamp-12'} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutMe
