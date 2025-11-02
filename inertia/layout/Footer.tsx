import { GitFork, Star } from 'lucide-react'
import { Link, usePage } from '@inertiajs/react'
import { InertiaProps } from '~/types'

interface GithubStats {
  stars: number
  forks: number
}

interface FooterProps extends InertiaProps {
  githubStats?: GithubStats | null
}

export default function Footer() {
  const { portfolioOwner, githubStats } = usePage<FooterProps>().props

  const githubUrl = portfolioOwner?.subInfo?.profilGithub || 'https://github.com'

  return (
    <footer className="text-center pb-5" id="contact">
      <div className="container">
        <p className="text-lg">Have a project in mind?</p>
        <Link
          href={'/contact'}
          className="text-2xl sm:text-4xl font-anton inline-block mt-5 mb-10 hover:underline"
        >
          {portfolioOwner?.email || 'contact@example.com'}
        </Link>

        <div>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="leading-none text-muted-foreground hover:underline hover:text-white"
          >
            Design & built by {portfolioOwner?.username || 'Portfolio Owner'}
            {/* Afficher les stats si disponibles */}
            {githubStats && (
              <div className="flex items-center justify-center gap-5 pt-1">
                <span className="flex items-center gap-2">
                  <Star size={18} /> {githubStats.stars}
                </span>
                <span className="flex items-center gap-2">
                  <GitFork size={18} /> {githubStats.forks}
                </span>
              </div>
            )}
          </a>
        </div>
      </div>
    </footer>
  )
}
