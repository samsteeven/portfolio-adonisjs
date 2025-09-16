import { Head, Link } from '@inertiajs/react'
import { Clock, User, Share2, Eye, Heart, ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import Newsletter_signup from '~/pages/components/newsletter_signup'

interface Blog extends BlogPost {
  _count?: {
    views?: number
    comments?: number
  }
}

interface BlogShowProps {
  post: Blog
  relatedPosts?: BlogPost[]
}

export default function BlogShow({ post, relatedPosts = [] }: BlogShowProps) {
  const [isClient, setIsclient] = useState(false)
  useEffect(() => {
    setIsclient(true)
  }, [])
  const formatDate = (dateString: string) => {
    if (!isClient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const readingTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(' ').length
    return Math.ceil(words / wordsPerMinute)
  }
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      })
    } else {
      // Fallback - copier l'URL
      await navigator.clipboard.writeText(window.location.href)
    }
  }
  return (
    <>
      <Head title={`${post.title} - Blog`} />

      <div className="min-h-screen bg-gray-900 text-white pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 rounded-2xl bg-gray-800 transition-colors">
                <ChevronLeft className="w-8 h-8" />
              </div>
            </Link>
          </div>
          {/* Article Header */}
          <header className="mb-8 sm:mb-12">
            <div className="text-sm text-gray-500">
              {formatDate(post.publishedAt || post.createdAt)}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 sm:mb-8 text-white">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-6 sm:mb-8">
              {post.excerpt}
            </p>

            {/* Meta information - Responsive stack */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 sm:gap-6 text-sm text-gray-400 mb-6 sm:mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>Par {post.author.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{readingTime(post.content)} min de lecture</span>
              </div>
              {post._count?.views && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span>{post._count.views} vues</span>
                </div>
              )}
            </div>

            {/* Tags - Responsive grid */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : '#ec489820',
                      color: tag.color || '#ec4899',
                      border: `1px solid ${tag.color || '#ec4899'}40`,
                    }}
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Featured Image - Responsive heights */}
            {post.photoPathPublicUrl && (
              <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden mb-8 sm:mb-12">
                <img
                  src={post.photoPathPublicUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            )}
          </header>

          {/* Article Content - Typography responsive */}
          <article className="prose prose-sm sm:prose-base lg:prose-lg prose-invert max-w-none">
            <div
              className="text-gray-300 leading-relaxed text-sm sm:text-base lg:text-lg"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
              }}
              dangerouslySetInnerHTML={{
                __html: post.content.replace(/\n/g, '<br />'),
              }}
            />
          </article>

          {/* Share Section - Responsive layout */}
          <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="text-gray-400 text-sm sm:text-base">Partager cet article :</span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleShare}
                    className="p-2 bg-gray-800 hover:bg-gray-700 hover:cursor-pointer rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Link
                href="/blog"
                className="text-pink-400 hover:text-pink-300 transition-colors font-medium text-sm sm:text-base"
              >
                Voir plus d'articles →
              </Link>
            </div>
          </div>

          {/* Related Posts - Responsive grid */}
          {relatedPosts.length > 0 && (
            <section className="mt-16 sm:mt-20">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Articles similaires</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost.id}
                    className="group bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                  >
                    {relatedPost.photoPathPublicUrl && (
                      <div className="relative h-32 sm:h-40 overflow-hidden">
                        <img
                          src={relatedPost.photoPathPublicUrl}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      <div className="text-xs text-gray-500 mb-2">
                        {formatDate(relatedPost.publishedAt)}
                      </div>

                      <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors text-sm sm:text-base">
                        <Link href={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link>
                      </h4>

                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-3">
                        {relatedPost.excerpt}
                      </p>

                      {relatedPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {relatedPost.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag.slug}
                              className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded"
                              style={{
                                backgroundColor: tag.color ? `${tag.color}20` : '#ec489820',
                                color: tag.color || '#ec4899',
                              }}
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
          {/* Newsletter Signup */}
          <div className="max-w-4xl mx-auto px-6 py-16">
            <Newsletter_signup />
          </div>
        </div>
      </div>
    </>
  )
}
