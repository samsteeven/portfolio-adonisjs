import { useEffect, useRef, useState } from 'react'
import { GENERAL_INFO } from '@/data'
import { GitFork, Star } from 'lucide-react'

interface RepoStats {
  stargazers_count: number
  forks_count: number
}

export default function Footer() {
  const [stars, setStars] = useState(0)
  const [forks, setForks] = useState(0)
  const fetchedOnce = useRef(false)

  useEffect(() => {
    if (fetchedOnce.current) return
    fetchedOnce.current = true

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    ;(async () => {
      try {
        const res = await fetch('https://api.github.com/repos/tajmirul/portfolio-2.0', {
          signal: controller.signal,
          headers: {
            // Aide à éviter certains rejets (GitHub aime avoir un User-Agent)
            'User-Agent': 'portfolio-app',
            'Accept': 'application/vnd.github+json',
          },
        })

        if (!res.ok) {
          // 429/403 rate limit => on garde les valeurs par défaut
          return
        }

        const data = (await res.json()) as Partial<RepoStats>
        setStars(typeof data.stargazers_count === 'number' ? data.stargazers_count : 0)
        setForks(typeof data.forks_count === 'number' ? data.forks_count : 0)
      } catch {
        // Silence les erreurs réseau; on garde 0
      } finally {
        clearTimeout(timeout)
      }
    })()

    return () => controller.abort()
  }, [])

  return (
    <footer className="text-center pb-5" id="contact">
      <div className="container">
        <p className="text-lg">Have a project in mind?</p>
        <a
          href={`mailto:${GENERAL_INFO.email}`}
          className="text-2xl sm:text-4xl font-anton inline-block mt-5 mb-10 hover:underline"
        >
          {GENERAL_INFO.email}
        </a>

        <div>
          <a
            href="https://github.com/Tajmirul/portfolio-2.0"
            target="_blank"
            rel="noreferrer"
            className="leading-none text-muted-foreground hover:underline hover:text-white"
          >
            Design & built by Tajmirul Islam
            <div className="flex items-center justify-center gap-5 pt-1">
              <span className="flex items-center gap-2">
                <Star size={18} /> {stars}
              </span>
              <span className="flex items-center gap-2">
                <GitFork size={18} /> {forks}
              </span>
            </div>
          </a>
        </div>
      </div>
    </footer>
  )
}
