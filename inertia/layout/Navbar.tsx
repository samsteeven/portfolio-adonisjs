import { cn } from '@/utils'
import { useState } from 'react'
import { MoveUpLeft, MoveUpRight } from 'lucide-react'
import { Link, router, usePage } from '@inertiajs/react'
import { RoughAnnotate } from '@/components/RoughAnnotate'
import { InertiaProps } from '~/types'

const COLORS = [
  'bg-yellow-500 text-black',
  'bg-blue-500 text-white',
  'bg-teal-500 text-black',
  'bg-indigo-500 text-white',
  'bg-indigo-500 text-white',
  'bg-pink-500 text-white',
]

const MENU_LINKS = [
  {
    name: 'Home',
    url: '/',
  },
  {
    name: 'About Me',
    url: '/#about-me',
  },
  {
    name: 'Experience',
    url: '/#my-experience',
  },
  {
    name: 'Projects',
    url: '/#selected-projects',
  },
  {
    name: 'Newsletter',
    url: '/#newsletter',
  },
  {
    name: 'FAQs',
    url: '/misc/faq',
  },
]

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { auth } = usePage<InertiaProps>().props
  const { portfolioOwner } = usePage<InertiaProps>().props

  const SOCIAL_LINKS = [
    { name: 'github', url: portfolioOwner?.subInfo?.profilGithub || 'https://github.com/' },
    { name: 'linkedin', url: portfolioOwner?.subInfo?.profilLinkedin || 'https://linkedin.com/' },
    { name: 'discord', url: portfolioOwner?.subInfo?.profilDiscord || 'https://discord.com/' },
    { name: 'twitter', url: portfolioOwner?.subInfo?.profilTwitter || 'https://twitter.com/' },
  ]

  return (
    <>
      <div className="sticky top-0 z-[4]">
        <button
          className={cn('group size-12 absolute top-5 right-5 md:right-10 z-[2]')}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span
            className={cn(
              'inline-block w-3/5 h-0.5 bg-foreground rounded-full absolute left-1/2 -translate-x-1/2 top-1/2 duration-300 -translate-y-[5px] ',
              {
                'rotate-45 -translate-y-1/2': isMenuOpen,
                'md:group-hover:rotate-12': !isMenuOpen,
              }
            )}
          ></span>
          <span
            className={cn(
              'inline-block w-3/5 h-0.5 bg-foreground rounded-full absolute left-1/2 -translate-x-1/2 top-1/2 duration-300 translate-y-[5px] ',
              {
                '-rotate-45 -translate-y-1/2': isMenuOpen,
                'md:group-hover:-rotate-12': !isMenuOpen,
              }
            )}
          ></span>
        </button>
      </div>

      <div
        className={cn('overlay fixed inset-0 z-[2] bg-black/70 transition-all duration-150', {
          'opacity-0 invisible pointer-events-none': !isMenuOpen,
        })}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <div
        className={cn(
          'fixed top-0 right-0 h-[100dvh] w-[500px] max-w-[calc(100vw-3rem)] transform translate-x-full transition-transform duration-700 z-[3]',
          'flex flex-col',
          { 'translate-x-0': isMenuOpen }
        )}
      >
        <div
          className={cn(
            'fixed inset-0 scale-150 translate-x-1/2 rounded-[50%] bg-background-light duration-700 delay-150 z-[-1]',
            {
              'translate-x-0': isMenuOpen,
            }
          )}
        ></div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-8 px-6 sm:px-8">
          <div className="min-h-full flex flex-col justify-center max-w-[300px] mx-auto space-y-10 sm:space-y-14">
            {/* Section Social & Menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-8">
              {/* Social Links */}
              <div>
                <p className="text-muted-foreground text-sm mb-4">SOCIAL</p>
                <ul className="space-y-2.5">
                  {SOCIAL_LINKS.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-base sm:text-lg capitalize hover:underline inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Menu Links */}
              <div>
                <p className="text-muted-foreground text-sm mb-4">MENU</p>
                <ul className="space-y-2.5">
                  {MENU_LINKS.map((link, idx) => (
                    <li key={link.name}>
                      <button
                        onClick={() => {
                          router.visit(link.url, { replace: false })
                          setIsMenuOpen(false)
                        }}
                        className="group text-base sm:text-lg flex items-center gap-2.5"
                      >
                        <span
                          className={cn(
                            'size-3 sm:size-3.5 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-[200%] transition-all flex-shrink-0',
                            COLORS[idx]
                          )}
                        >
                          {link.url.startsWith('/#') ? (
                            <MoveUpLeft
                              size={7}
                              className="scale-0 rotate-[-80deg] group-hover:scale-100 transition-all"
                            />
                          ) : (
                            <MoveUpRight
                              size={7}
                              className="scale-0 group-hover:scale-100 transition-all"
                            />
                          )}
                        </span>
                        <span className="truncate">{link.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bouton Connexion */}
            <div className="pt-4 sm:pt-6">
              <button className="inline-block">
                <RoughAnnotate strokeWidth={4} color="#22d3ee">
                  <Link href={auth?.user ? '/admin/dashboard' : '/auth/login'}>
                    {auth?.user ? 'Mon Compte' : 'Se connecter'}
                  </Link>
                </RoughAnnotate>
              </button>
            </div>

            {/* Contact */}
            <div className="pt-4 border-t border-foreground/10">
              <p className="text-muted-foreground text-sm mb-3">GET IN TOUCH</p>
              <Link href={'/contact'} className="text-base sm:text-lg hover:underline break-all">
                {portfolioOwner?.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
