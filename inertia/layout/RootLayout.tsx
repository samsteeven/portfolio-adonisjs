import React, { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner' // Import toast from sonner
import { Toaster as Sonner } from '@/components/ui/sonner' // Import Sonner component
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import Navbar from '~/layout/Navbar'
import Footer from '~/layout/Footer'
import ScrollProgressIndicator from '@/components/ScrollProgressIndicator'
import ParticleBackground from '@/components/ParticleBackground'
import Preloader from '@/components/Preloader'
import StickyEmail from '@/components/StickyEmail'
import PageTransition from '@/components/PageTransition'
import { AuthSync } from '@/components/AuthSync'
import { InertiaProps } from '~/types'
import '~/css/app.css'
import BottomNavbar from '~/layout/bottom_navbar'
interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { props } = usePage<InertiaProps>()
  useEffect(() => {
    const { error, success } = props || {}

    if (success) toast.success(success)

    if (error) toast.error(error)
  }, [props.error, props.success])

  return (
    <div className="main-layout invisible-scrollbar">
      <ReactLenis root options={{ lerp: 0.1, duration: 1.4 }}>
        <Sonner className="text-black" position="top-center" />
        <AuthSync />
        <Navbar />
        <PageTransition>
          <main className="main-layout">{children}</main>
        </PageTransition>
        <Footer />
        <BottomNavbar />
        <Preloader />
        <ScrollProgressIndicator />
        <ParticleBackground />
        <StickyEmail />
      </ReactLenis>
    </div>
  )
}
