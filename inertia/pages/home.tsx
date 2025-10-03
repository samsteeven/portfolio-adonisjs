import Banner from '~/pages/components/Banner'
import AboutMe from '~/pages/components/AboutMe'
import Skills from '~/pages/components/Skills'
import Experiences from '~/pages/components/Experiences'
import ProjectList from '~/pages/components/ProjectList'
import { useEffect } from 'react'
import { HeadLayout } from '~/layout/HeadLayout'
import '~/css/app.css'
import Newsletter_signup from '~/pages/components/newsletter_signup'
import RecentPosts from '~/pages/components/articles_recents'
import { WhenVisible } from '@inertiajs/react'
import { Fallback } from '@/components/fallback'

// Ajouter l'interface pour typer les props
interface HomeProps {
  recentPosts?: BlogPost[]
}

export default function Home({ recentPosts = [] }: HomeProps) {
  useEffect(() => {
    const originalTitle = document.title
    function handleVisibilityChange() {
      if (document.hidden) {
        document.title = 'Come Back!!'
      } else {
        document.title = originalTitle
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <>
      <HeadLayout title="Samen-Portfolio" description="Portfolio du developpeur fullstack Samen" />
      <div className="main-layout page-">
        <Banner />
        <AboutMe />
        <Skills />
        <Experiences />
        <ProjectList />
        <WhenVisible data="recentPosts" fallback={<Fallback message="articles recents" />}>
          <RecentPosts posts={recentPosts} />
        </WhenVisible>
        <Newsletter_signup className="mb-20" />
      </div>
    </>
  )
}
