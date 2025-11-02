import SectionTitle from '@/components/SectionTitle'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { ensureGsapScrollTrigger } from '~/utils/gsap_client'
import type { SkillType } from '~/types/skills'
import SafeHTML from '~/components/safeHTML'

interface ExperiencesProps {
  skills?: SkillType[]
}

const Experiences = ({ skills = [] }: ExperiencesProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // Grouper les skills par catégorie
  const groupedSkills = skills.reduce(
    (acc, skill) => {
      const category = skill.category || 'Autres'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(skill)
      return acc
    },
    {} as Record<string, SkillType[]>
  )

  // Trier les catégories par ordre alphabétique
  const sortedCategories = Object.keys(groupedSkills).sort()

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
    { scope: containerRef, dependencies: [ready, skills.length] }
  )
  useGSAP(
    () => {
      if (!ready) return
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'bottom 20%',
          end: 'bottom -20%',
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

        {skills.length > 0 ? (
          <div className="space-y-20">
            {sortedCategories.map((category) => (
              <div key={category} className="experience-item">
                {/* Titre de la catégorie */}
                <div className="mb-8">
                  <h3 className="text-xl md:text-2xl font-anton text-primary uppercase">
                    {category}
                  </h3>
                  <div className="h-1 w-20 bg-primary mt-2" />
                </div>

                {/* Skills de cette catégorie */}
                <div className="grid gap-8 md:gap-10">
                  {groupedSkills[category].map((skill) => (
                    <div key={skill.id} className="group">
                      <div className="flex items-start gap-4">
                        {/* Image si disponible */}
                        {/*{skill.imagePathPublicUrl && (
                            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center">
                              <img
                                src={skill.imagePathPublicUrl}
                                alt={skill.name}
                                className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}*/}

                        {/* Contenu */}
                        <div className="flex-1">
                          <h4 className="text-4xl md:text-5xl font-anton leading-none mb-2 group-hover:text-primary transition-colors">
                            {skill.name}
                          </h4>
                          {skill.description && (
                            <SafeHTML
                              html={skill.description}
                              as="div"
                              className="text-base md:text-lg text-muted-foreground leading-relaxed line-clamp-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-lg">Aucune expérience disponible</p>
        )}
      </div>
    </section>
  )
}

export default Experiences
