import SectionTitle from '@/components/SectionTitle'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { ensureGsapScrollTrigger } from '~/utils/gsap_client'
import { Technology } from '~/types/technology'
import { WhenVisible } from '@inertiajs/react'
import { Fallback } from '@/components/fallback'
export interface TechnologiesByCategory {
  [category: string]: Technology[]
}
interface SkillsProps {
  technologies?: TechnologiesByCategory
}

const Skills = ({ technologies }: SkillsProps) => {
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
      const els = containerRef.current?.querySelectorAll('.slide-up')
      if (!els?.length) return

      gsap.set(els, { willChange: 'transform, opacity' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'bottom 80%',
          scrub: 0.5,
        },
      })

      tl.from('.slide-up', { opacity: 0, y: 40, ease: 'none', stagger: 0.4 })
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
          end: 'bottom 10%',
          scrub: 1,
        },
      })
      tl.to(containerRef.current, { y: -150, opacity: 0 })
    },
    { scope: containerRef, dependencies: [ready] }
  )

  return (
    <section id="my-stack" className="mb-72" ref={containerRef}>
      <div className="container">
        <SectionTitle title="My Stack" />
        <WhenVisible data="technologies" fallback={<Fallback message="technologies" />}>
          {technologies && Object.keys(technologies).length > 0 ? (
            <div className="space-y-20">
              {Object.entries(technologies).map(([category, techs]) => (
                <div className="grid sm:grid-cols-12" key={category}>
                  <div className="sm:col-span-5">
                    <p className="slide-up text-5xl font-anton leading-none text-muted-foreground uppercase">
                      {category}
                    </p>
                  </div>
                  <div className="sm:col-span-7 flex gap-x-11 gap-y-9 flex-wrap">
                    {techs.map((tech) => (
                      <div
                        className="slide-up flex gap-3.5 items-center leading-none"
                        key={tech.id}
                      >
                        <div>
                          <img
                            src={tech.imgPathPublicUrl || tech.imgPath}
                            alt={tech.name}
                            width="40"
                            height="40"
                            className="max-h-10 object-contain"
                            title={tech.description || tech.name}
                          />
                        </div>
                        <span className="text-2xl capitalize">{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Aucune technologie disponible</p>
          )}
        </WhenVisible>
      </div>
    </section>
  )
}

export default Skills
