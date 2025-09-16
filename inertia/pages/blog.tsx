import { Head, Link } from '@inertiajs/react'
import { Calendar, Clock, Tag, ArrowRight, ChevronRight, Search, X } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'

interface BlogIndexProps {
  posts: {
    data: BlogPost[]
    meta: {
      currentPage: number
      lastPage: number
      total: number
    }
  }
  currentTag?: string
}

export default function BlogIndex({ posts, currentTag }: BlogIndexProps) {
  const [isclient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fonction de recherche locale
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) {
      return posts.data
    }

    const searchLower = searchTerm.toLowerCase().trim()

    return posts.data.filter((post) => {
      // Recherche dans le titre
      const titleMatch = post.title.toLowerCase().includes(searchLower)

      // Recherche dans l'extrait
      const excerptMatch = post.excerpt.toLowerCase().includes(searchLower)

      // Recherche dans les tags
      const tagsMatch = post.tags.some((tag) => tag.name.toLowerCase().includes(searchLower))

      // Recherche dans l'auteur
      const authorMatch = post.author.username.toLowerCase().includes(searchLower)

      return titleMatch || excerptMatch || tagsMatch || authorMatch
    })
  }, [posts.data, searchTerm])

  const formatDateShort = (dateString: string) => {
    if (!isclient) return '...'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const readingTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(' ').length
    return Math.ceil(words / wordsPerMinute)
  }

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-pink-500/30 text-pink-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <>
      <Head title="Blog - Mon Portfolio" />

      <div className="min-h-screen bg-gray-900 text-white pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          {/* Header */}
          <div className="mb-8 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Des pensées <span className="text-pink-500">partagées</span>, une
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              créativité <span className="text-pink-500">enflammée !</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl">
              Embarquez pour un voyage à travers notre blog, où se rencontrent des articles
              perspicaces et des réflexions créatives.
            </p>

            {currentTag && (
              <div className="mt-6 sm:mt-8">
                <span className="inline-flex items-center px-3 py-2 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                  <Tag className="w-4 h-4 mr-2" />
                  {currentTag}
                </span>
                <Link
                  href="/blog"
                  className="ml-4 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Voir tous les articles
                </Link>
              </div>
            )}

            {/* Barre de recherche */}
            <div className="mt-6 sm:mt-8">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher dans les articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-700/50 rounded-xl bg-gray-800/30 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-400">
                  {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} trouvé
                  {filteredPosts.length !== 1 ? 's' : ''} pour "{searchTerm}"
                </p>
              )}
            </div>
          </div>

          {/* Articles Timeline */}
          {filteredPosts.length > 0 ? (
            <div className="space-y-6 sm:space-y-12 mb-8 sm:mb-16">
              {filteredPosts.map((post, index) => (
                <article key={post.id} className="group relative">
                  {/* Timeline line - Hidden on mobile and sm screens */}
                  {index !== filteredPosts.length - 1 && (
                    <div className="absolute left-12 md:left-16 top-16 md:top-20 w-px h-full bg-gradient-to-b from-gray-700 via-gray-800 to-transparent hidden md:block" />
                  )}

                  <div className="flex gap-3 sm:gap-8">
                    {/* Date sidebar - Simplified on mobile */}
                    <div className="flex-shrink-0 w-10 md:w-32">
                      <div className="sticky top-24">
                        <div className="text-right">
                          <div className="text-xs md:text-sm text-gray-500 mb-1 hidden md:block">
                            {formatDateShort(post.publishedAt)}
                          </div>
                          <div className="w-2 h-2 md:w-3 md:h-3 bg-pink-500 rounded-full ml-auto relative">
                            <div className="absolute inset-0 bg-pink-500 rounded-full animate-pulse opacity-75" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group-hover:bg-gray-800/50 hover:shadow-pink-500/10 hover:-translate-y-1">
                        {/* Featured Image - Taille réduite avec proportions conservées */}
                        {post.photoPathPublicUrl && (
                          <div className="mb-4 sm:mb-6">
                            {/* Mobile/Tablet: Small image on the left - Taille réduite */}
                            <div className="flex gap-3 md:hidden">
                              <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden">
                                <img
                                  src={post.photoPathPublicUrl || ''}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-400 transition-colors leading-tight">
                                  <Link href={`/blog/${post.slug}`} className="block">
                                    {highlightSearchTerm(post.title, searchTerm)}
                                  </Link>
                                </h3>
                              </div>
                            </div>

                            {/* Desktop: Reduced width image - Taille réduite */}
                            <div className="hidden md:block">
                              <div className="relative h-32 mb-6 rounded-xl overflow-hidden">
                                <img
                                  src={post.photoPathPublicUrl || ''}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                              </div>

                              {/* Title for desktop */}
                              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors leading-tight">
                                <Link href={`/blog/${post.slug}`} className="block">
                                  {highlightSearchTerm(post.title, searchTerm)}
                                </Link>
                              </h3>
                            </div>
                          </div>
                        )}

                        {/* Title for posts without image on mobile */}
                        {!post.photoPathPublicUrl && (
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 group-hover:text-pink-400 transition-colors leading-tight">
                            <Link href={`/blog/${post.slug}`} className="block">
                              {highlightSearchTerm(post.title, searchTerm)}
                            </Link>
                          </h3>
                        )}

                        {/* Excerpt - Truncated on mobile avec surlignage */}
                        <p className="text-gray-300 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6">
                          <span className="block sm:hidden">
                            {highlightSearchTerm(truncateText(post.excerpt, 80), searchTerm)}
                          </span>
                          <span className="hidden sm:block line-clamp-3">
                            {highlightSearchTerm(post.excerpt, searchTerm)}
                          </span>
                        </p>

                        {/* Meta info - Simplified on mobile */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{readingTime(post.excerpt)} min</span>
                          </div>
                          {/* Date visible only on mobile, hidden on larger screens since it's in sidebar */}
                          <div className="flex items-center gap-1.5 md:hidden">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDateShort(post.publishedAt)}</span>
                          </div>
                          {/* Author */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">par</span>
                            <span className="text-gray-300">
                              {highlightSearchTerm(post.author.username, searchTerm)}
                            </span>
                          </div>
                        </div>

                        {/* Tags avec surlignage */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags.map((tag) => (
                              <Link
                                key={tag.slug}
                                href={`/blog?tag=${tag.slug}`}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                                style={{
                                  backgroundColor: tag.color ? `${tag.color}20` : '#ec489820',
                                  color: tag.color || '#ec4899',
                                  border: `1px solid ${tag.color || '#ec4899'}40`,
                                }}
                              >
                                #{highlightSearchTerm(tag.name, searchTerm)}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Read more - Nouveau design du bouton */}
                        <div className="flex justify-between items-center pt-4 sm:pt-6 border-t border-gray-700/50">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="group/btn inline-flex items-center gap-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25 text-sm sm:text-base"
                          >
                            <span className="hidden sm:inline">Lire l'article</span>
                            <span className="sm:hidden">Lire</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>

                          <div className="flex items-center text-gray-500 text-sm">
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-gray-700/50">
                {searchTerm ? (
                  <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" />
                ) : (
                  <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" />
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-300 mb-4">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucun article pour le moment'}
              </h3>
              <p className="text-gray-500 text-base sm:text-lg px-4">
                {searchTerm
                  ? `Aucun article ne correspond à votre recherche "${searchTerm}"`
                  : currentTag
                    ? `Aucun article trouvé pour le tag "${currentTag}"`
                    : 'Les premiers articles arrivent bientôt !'}
              </p>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="mt-4 px-6 py-2 bg-pink-500/20 text-pink-300 rounded-lg hover:bg-pink-500/30 transition-colors"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          )}

          {/* Pagination - Masquée pendant la recherche */}
          {!searchTerm && posts.meta.lastPage > 1 && (
            <div className="flex justify-center items-center gap-3 sm:gap-6 pt-8 sm:pt-12 border-t border-gray-800">
              {posts.meta.currentPage > 1 && (
                <Link
                  href={`/blog?page=${posts.meta.currentPage - 1}${currentTag ? `&tag=${currentTag}` : ''}`}
                  className="px-4 sm:px-8 py-3 sm:py-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg sm:rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">← Précédent</span>
                  <span className="sm:hidden">←</span>
                </Link>
              )}

              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 bg-gray-800/30 rounded-lg sm:rounded-xl border border-gray-700/50 text-sm sm:text-base">
                <span className="text-gray-400 hidden sm:inline">Page</span>
                <span className="font-bold text-pink-400">{posts.meta.currentPage}</span>
                <span className="text-gray-600">/</span>
                <span className="font-bold text-gray-300">{posts.meta.lastPage}</span>
              </div>

              {posts.meta.currentPage < posts.meta.lastPage && (
                <Link
                  href={`/blog?page=${posts.meta.currentPage + 1}${currentTag ? `&tag=${currentTag}` : ''}`}
                  className="px-4 sm:px-8 py-3 sm:py-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg sm:rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Suivant →</span>
                  <span className="sm:hidden">→</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
