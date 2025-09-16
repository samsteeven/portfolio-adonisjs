import { Link } from '@inertiajs/react'
import { Calendar, ArrowRight, BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'

interface RecentPostsProps {
  posts: BlogPost[]
}

export default function RecentPosts({ posts }: RecentPostsProps) {
  const [isclient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString: string) => {
    if (!isclient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (posts.length === 0) return null

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header simple */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-pink-500" />
            <h2 className="text-3xl font-bold text-white">Mes posts recents</h2>
          </div>
          <p className="text-gray-400 text-lg">
            Explorations, idées et actualités du monde tech et du développement.
          </p>
        </div>

        {/* Articles list - Design minimaliste */}
        <div className="space-y-4 mb-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group p-6 rounded-xl border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:bg-gray-800/30"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="flex flex-col gap-4">
                  {/* Titre */}
                  <h3 className="text-xl font-semibold text-white group-hover:text-pink-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 leading-relaxed line-clamp-2">{post.excerpt}</p>

                  {/* Meta info */}
                  <div className="flex flex-col-reverse gap-y-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Publié le {formatDate(post.publishedAt)}</span>
                    </div>

                    {/* Tags seulement */}
                    <div className="flex items-center gap-1">
                      {post.tags &&
                        post.tags.map((tag) => (
                          <span
                            key={tag.slug}
                            className="px-3 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: tag.color ? `${tag.color}20` : '#ec489820',
                              color: tag.color || '#ec4899',
                            }}
                          >
                            #{tag.name}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Lien vers tous les articles */}
        <div className="text-center">
          <Link
            href={'/blog'}
            className="inline-flex items-center gap-2 px-6 py-3 text-pink-400 hover:text-pink-300 transition-colors font-medium"
          >
            Voir tous les articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
