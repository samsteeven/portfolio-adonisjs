import { cn } from '@/utils'
import { Link, usePage } from '@inertiajs/react'
import { Home, BookOpen, NotebookPen } from 'lucide-react'
import React from 'react'

interface NavItem {
  name: string
  url: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Accueil',
    url: '/',
    icon: <Home className="w-4 h-4" />,
  },
  {
    name: 'Blog',
    url: '/blog',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    name: 'Guestbook',
    url: '/guestbook',
    icon: <NotebookPen className="w-4 h-4" />,
  },
]

interface BottomNavbarProps {
  hideOnPaths?: string[]
  className?: string
}

const BottomNavbar = ({ hideOnPaths = ['/auth'], className }: BottomNavbarProps) => {
  const { url } = usePage()

  const shouldShow = () => {
    const currentPath = url
    return !hideOnPaths.some((path) => currentPath.startsWith(path))
  }

  if (!shouldShow()) {
    return null
  }

  const isActive = (item: NavItem) => {
    if (item.url === '/') {
      return url === '/'
    }
    return url.startsWith(item.url)
  }

  return (
    <>
      {/* Spacer pour éviter que le contenu soit caché */}
      <div className="h-16 sm:hidden" />

      {/* Bottom Navigation */}
      <div
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
          'w-fit max-w-[90vw]',
          className
        )}
      >
        {/* Container principal avec glassmorphism */}
        <div
          className={cn(
            'relative overflow-hidden',
            'backdrop-blur-lg backdrop-saturate-150',
            'border border-gray-200/20',
            'rounded-xl shadow-lg shadow-black/5',
            'before:absolute before:inset-0',
            'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
            'before:pointer-events-none'
          )}
        >
          <nav className="flex items-center px-1 py-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item)

              return (
                <Link
                  key={item.name}
                  href={item.url}
                  className={cn(
                    'group relative flex flex-col items-center justify-center',
                    'px-3 py-1.5 mx-0.5 rounded-lg',
                    'transition-all duration-300 ease-out',
                    'hover:scale-105 active:scale-95',
                    'min-w-[2.5rem] sm:min-w-[3rem]',
                    'min-h-[2.5rem] sm:min-h-[3rem]',
                    {
                      'bg-gradient-to-b from-white/40 via-white/20 to-transparent': active,
                      'shadow-sm': active,
                    }
                  )}
                >
                  {/* Indicateur actif - point en haut */}
                  {active && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#22D3EE] animate-pulse" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center mb-0.5',
                      'transition-all duration-300 ease-out',
                      'group-hover:scale-110',
                      {
                        'scale-105 text-[#22D3EE]': active,
                        'text-white': !active,
                      }
                    )}
                  >
                    {item.icon}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      'text-xs font-medium leading-tight text-center',
                      'transition-all duration-300',
                      'hidden sm:block',
                      {
                        'text-[#22D3EE]': active,
                        'text-white': !active,
                      }
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Shadow */}
        <div
          className={cn(
            'absolute inset-0 -z-10 rounded-xl',
            'bg-gradient-to-t from-black/10 via-black/5 to-transparent',
            'blur-lg scale-95'
          )}
        />
      </div>
    </>
  )
}

export default BottomNavbar
