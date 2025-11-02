import SafeHTML from '~/components/safeHTML'
import ArrowAnimation from '@/components/ArrowAnimation'
import TransitionLink from '@/components/TransitionLink'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import { ArrowLeft, ExternalLink, Github } from 'lucide-react'
import { useRef } from 'react'
import { ProjectType } from '~/types/projets'

interface Props {
  project: ProjectType
}

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function ProjectDetails({ project }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (!project) return null

  useGSAP(
    () => {
      if (!containerRef.current) return

      gsap.set('.fade-in-later', {
        autoAlpha: 0,
        y: 30,
      })
      const tl = gsap.timeline({
        delay: 0.5,
      })

      tl.to('.fade-in-later', {
        autoAlpha: 1,
        y: 0,
        stagger: 0.1,
      })
    },
    { scope: containerRef }
  )

  // blur info div and make it smaller on scroll
  useGSAP(
    () => {
      if (window.innerWidth < 992) return

      gsap.to('#info', {
        filter: 'blur(3px)',
        autoAlpha: 0,
        scale: 0.9,
        scrollTrigger: {
          trigger: '#info',
          start: 'bottom bottom',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
          scrub: 0.5,
        },
      })
    },
    { scope: containerRef }
  )

  // parallax effect on images
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLDivElement>('#images > div').forEach((imageDiv, i) => {
        gsap.to(imageDiv, {
          backgroundPosition: `center 0%`,
          ease: 'none',
          scrollTrigger: {
            trigger: imageDiv,
            start: () => (i ? 'top bottom' : 'top 50%'),
            end: 'bottom top',
            scrub: true,
          },
        })
      })
    },
    { scope: containerRef }
  )

  // Trier les images par ordre et prioriser les images primaires
  const sortedImages = [...project.images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.order - b.order
  })

  // Extraire les noms des technologies
  const techStackNames = project.technologies.map((tech) => tech.name)

  return (
    <section className="pt-5 pb-14">
      <div className="container" ref={containerRef}>
        <TransitionLink back href="/" className="mb-16 inline-flex gap-2 items-center group h-12">
          <ArrowLeft className="group-hover:-translate-x-1 group-hover:text-primary transition-all duration-300" />
          Back
        </TransitionLink>

        <div className="top-0 min-h-[calc(100svh-100px)] flex" id="info">
          <div className="relative w-full">
            <div className="flex items-start gap-6 mx-auto mb-10 max-w-[635px]">
              <h1 className="fade-in-later opacity-0 text-4xl md:text-[60px] leading-none font-anton overflow-hidden">
                <span className="inline-block">{project.title}</span>
              </h1>

              <div className="fade-in-later opacity-0 flex gap-2">
                {project.githubPath && (
                  <a
                    href={project.githubPath}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-primary"
                    aria-label="View source code on GitHub"
                  >
                    <Github size={30} />
                  </a>
                )}
                {project.demoPath && (
                  <a
                    href={project.demoPath}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-primary"
                    aria-label="View live demo"
                  >
                    <ExternalLink size={30} />
                  </a>
                )}
              </div>
            </div>

            <div className="max-w-[635px] space-y-7 pb-20 mx-auto">
              <div className="fade-in-later">
                <p className="text-muted-foreground font-anton mb-3">Year</p>
                <div className="text-lg">{project.year}</div>
              </div>

              {techStackNames.length > 0 && (
                <div className="fade-in-later">
                  <p className="text-muted-foreground font-anton mb-3">Tech & Technique</p>
                  <div className="text-lg">{techStackNames.join(', ')}</div>
                </div>
              )}

              {project.description && (
                <div className="fade-in-later">
                  <p className="text-muted-foreground font-anton mb-3">Description</p>
                  <div className="text-lg prose-xl markdown-text">
                    <SafeHTML html={project.description} />
                  </div>
                </div>
              )}

              {project.role && (
                <div className="fade-in-later">
                  <p className="text-muted-foreground font-anton mb-3">My Role</p>
                  <div className="text-lg">
                    <SafeHTML html={project.role} />
                  </div>
                </div>
              )}
            </div>

            <ArrowAnimation />
          </div>
        </div>

        {sortedImages.length > 0 && (
          <div
            className="fade-in-later relative flex flex-col gap-2 max-w-[800px] mx-auto"
            id="images"
          >
            {sortedImages.map((image) => (
              <div
                key={image.id}
                className="group relative w-full aspect-[750/400] bg-background-light"
                style={{
                  backgroundImage: `url(${image.imagePublicUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 50%',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <a
                  href={image.imagePublicUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="absolute top-4 right-4 bg-background/70 text-foreground size-12 inline-flex justify-center items-center transition-all opacity-0 hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
                  aria-label="View full size image"
                >
                  <ExternalLink />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
