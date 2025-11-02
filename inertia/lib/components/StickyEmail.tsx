import { Link, usePage } from '@inertiajs/react'
import { InertiaProps } from '~/types'

const StickyEmail = () => {
  const { portfolioOwner } = usePage<InertiaProps>().props

  return (
    <div className="max-xl:hidden fixed bottom-32 left-0 block">
      <Link
        href={'/contact'}
        className="px-3 text-muted-foreground tracking-[1px] transition-all !bg-bottom hover:text-foreground hover:!bg-center"
        style={{
          textOrientation: 'mixed',
          writingMode: 'vertical-rl',
        }}
      >
        {portfolioOwner?.email}
      </Link>
    </div>
  )
}

export default StickyEmail
