import Banner from '~/pages/Banner'
import AboutMe from '~/pages/AboutMe'
import Skills from '~/pages/Skills'
import Experiences from '~/pages/Experiences'
import ProjectList from '~/pages/ProjectList'
import { useEffect } from 'react'
import { HeadLayout } from '~/layout/HeadLayout'
import '~/css/app.css'
export default function Home() {
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
      <div className="page-">
        <Banner />
        <AboutMe />
        <Skills />
        <Experiences />
        <ProjectList />
      </div>
    </>
  )
}
