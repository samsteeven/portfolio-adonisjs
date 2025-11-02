import ArrowAnimation from '@/components/ArrowAnimation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { ensureGsapScrollTrigger } from '~/utils/gsap_client'
import { InertiaProps } from '~/types'
import { usePage } from '@inertiajs/react'
import HireMeButton from '~/components/HireMeButton'

const Banner = () => {
  const containerRef = useRef<HTMLDivElement>(null)
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
          trigger: containerRef.current,
          start: 'bottom 70%',
          end: 'bottom 10%',
          scrub: 1,
        },
      })
      tl.fromTo('.slide-up-and-fade', { y: 0 }, { y: -150, opacity: 0, stagger: 0.02 })

      // Animation de la photo de profil
      gsap.fromTo(
        '.profile-photo',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, delay: 0.3, ease: 'back.out(1.7)' }
      )
    },
    { scope: containerRef, dependencies: [ready] }
  )

  return (
    <section className="relative overflow-hidden" id="banner">
      <ArrowAnimation />
      <div
        className="container h-[100svh] min-h-[530px] max-md:pb-10 flex justify-between items-center max-md:flex-col relative"
        ref={containerRef}
      >
        {/* Contenu principal à gauche */}
        <div className="max-md:grow max-md:flex flex-col justify-center items-start max-w-[544px] z-10">
          <h1 className="banner-title slide-up-and-fade leading-[.95] text-6xl sm:text-[80px] font-anton">
            <span className="text-primary">FRONTEND</span>
            <br /> <span className="ml-4">DEVELOPER</span>
          </h1>
          <p className="banner-description slide-up-and-fade mt-6 text-lg text-muted-foreground">
            Hi! I&apos;m{' '}
            <span className="font-medium text-foreground">
              {portfolioOwner?.username || 'Samen'}
            </span>
            . A creative Frontend Developer with 3+ years of experience in building
            high-performance, scalable, and responsive web solutions.
          </p>
          <HireMeButton className="mt-9 banner-button slide-up-and-fade" />
        </div>

        {/* Photo de profil - Desktop uniquement */}
        {portfolioOwner?.subInfo?.photoPathPublicUrl && (
          <div className="hidden lg:block profile-photo absolute top-1/2 -translate-y-1/2 right-[20%] xl:right-[22%] 2xl:right-[25%]">
            <div className="relative">
              {/* Motif de points en arrière-plan */}
              <svg
                className="absolute -right-12 -top-12 w-30 h-30 xl:w-48 xl:h-48 opacity-70"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {Array.from({ length: 10 }).map((_, row) =>
                  Array.from({ length: 10 }).map((_, col) => (
                    <circle
                      key={`${row}-${col}`}
                      cx={col * 20 + 10}
                      cy={row * 20 + 10}
                      r="3"
                      className="fill-primary/60"
                    />
                  ))
                )}
              </svg>

              {/* Photo de profil circulaire */}
              <div className="relative">
                <div className="w-52 h-52 lg:w-60 lg:h-60 xl:w-64 xl:h-64 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                  <img
                    src={portfolioOwner.subInfo.photoPathPublicUrl}
                    alt={portfolioOwner.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
              </div>
            </div>
          </div>
        )}
        {/* Statistiques en bas à droite */}
        <div className="md:absolute bottom-[10%] right-[4%] flex md:flex-col gap-4 md:gap-8 text-center md:text-right z-10">
          <div className="slide-up-and-fade">
            <h5 className="text-3xl sm:text-4xl font-anton text-primary mb-1.5">
              {new Date().getFullYear() - 2022}+
            </h5>
            <p className="text-muted-foreground text-sm sm:text-base">Years of Experience</p>
          </div>
          <div className="slide-up-and-fade">
            <h5 className="text-3xl sm:text-4xl font-anton text-primary mb-1.5">7+</h5>
            <p className="text-muted-foreground text-sm sm:text-base">Completed Projects</p>
          </div>
          <div className="slide-up-and-fade">
            <h5 className="text-3xl sm:text-4xl font-anton text-primary mb-1.5">10K+</h5>
            <p className="text-muted-foreground text-sm sm:text-base">Hours Worked</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
