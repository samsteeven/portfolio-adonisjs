import Banner from '~/pages/components/Banner'
import AboutMe from '~/pages/components/AboutMe'
import Skills, { TechnologiesByCategory } from '~/pages/components/Skills'
import Experiences from '~/pages/components/Experiences'
import ProjectList from '~/pages/components/ProjectList'
import { useEffect } from 'react'
import { HeadLayout } from '~/layout/HeadLayout'
import '~/css/app.css'
import Newsletter_signup from '~/pages/components/newsletter_signup'
import RecentPosts from '~/pages/components/articles_recents'
import { SkillType } from '~/types/skills'
import { ProjectType } from '~/types/projets'

interface HomeProps {
  technologies?: TechnologiesByCategory
  skills?: SkillType[]
  projects?: ProjectType[]
  recentPosts?: BlogPost[]
}

export default function Home({
  recentPosts = [],
  skills = [],
  projects = [],
  technologies,
}: HomeProps) {
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
        {/* Banner utilise portfolioOwner depuis les props globales partagées */}
        <Banner />
        <AboutMe />

        <Skills technologies={technologies} />
        <Experiences skills={skills} />
        <ProjectList projects={projects} />
        <RecentPosts posts={recentPosts} />
        <Newsletter_signup className="mb-20" />
      </div>
    </>
  )
}
