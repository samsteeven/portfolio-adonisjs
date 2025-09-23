import { Head, Link } from '@inertiajs/react'
import {
  Calendar,
  Clock,
  Tag,
  ArrowRight,
  Search,
  X,
  Sparkles,
  User,
  BookOpen,
  TrendingUp,
} from 'lucide-react'
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

  // const truncateText = (text: string, maxLength: number = 120) => {
  //   if (text.length <= maxLength) return text
  //   return text.substr(0, maxLength) + '...'
  // }

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

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm text-pink-300 rounded-full text-sm font-medium mb-8 border border-pink-500/20">
              <Sparkles className="h-4 w-4 animate-pulse" />
              {posts.meta.total} articles publiés
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Pensées{' '}
              </span>
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                partagées
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                créativité{' '}
              </span>
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                enflammée
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Embarquez pour un voyage à travers mes réflexions, où se rencontrent articles
              perspicaces, tutoriels techniques et inspirations créatives.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-12">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 text-sm">Articles techniques</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-green-300 text-sm">Veille technologique</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 text-sm">Inspiration créative</span>
              </div>
            </div>

            {/* Current Tag */}
            {currentTag && (
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl">
                  <Tag className="w-5 h-5 text-pink-400" />
                  <span className="text-pink-300 font-medium">Filtré par: {currentTag}</span>
                </div>
                <Link
                  href="/blog"
                  className="ml-4 text-gray-400 hover:text-pink-300 transition-colors text-sm underline decoration-gray-600 hover:decoration-pink-300"
                >
                  Voir tous les articles
                </Link>
              </div>
            )}

            {/* Search Bar */}
            <div className="max-w-lg mx-auto">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-pink-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher dans les articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 border border-gray-600 hover:border-gray-500 rounded-2xl bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-3 text-sm text-gray-400 text-center">
                  <span className="font-medium text-pink-400">{filteredPosts.length}</span> article
                  {filteredPosts.length !== 1 ? 's' : ''} trouvé
                  {filteredPosts.length !== 1 ? 's' : ''} pour "{searchTerm}"
                </p>
              )}
            </div>
          </div>

          {/* Articles List */}
          {filteredPosts.length > 0 ? (
            <div className="space-y-8 mb-16">
              {filteredPosts.map((post) => (
                <article key={post.id} className="group">
                  <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-500/10">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                    <div className="relative p-6 sm:p-8">
                      {/* Article Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          {/* Timeline dot */}
                          <div className="flex-shrink-0">
                            <div className="w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse opacity-75"></div>
                            </div>
                          </div>

                          {/* Date and reading time */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <time dateTime={post.publishedAt}>
                                {formatDateShort(post.publishedAt)}
                              </time>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{readingTime(post.excerpt)} min de lecture</span>
                            </div>
                          </div>
                        </div>

                        {/* Author info */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-600/30">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">
                            {highlightSearchTerm(post.author.username, searchTerm)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Content */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Title */}
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300 leading-tight">
                            <Link href={`/blog/${post.slug}`} className="block">
                              {highlightSearchTerm(post.title, searchTerm)}
                            </Link>
                          </h2>

                          {/* Excerpt */}
                          <p className="text-gray-300 text-lg leading-relaxed">
                            {highlightSearchTerm(post.excerpt, searchTerm)}
                          </p>

                          {/* Tags */}
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {post.tags.map((tag) => (
                                <Link
                                  key={tag.slug}
                                  href={`/blog?tag=${tag.slug}`}
                                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                  style={{
                                    backgroundColor: tag.color ? `${tag.color}15` : '#ec489815',
                                    color: tag.color || '#ec4899',
                                    border: `1px solid ${tag.color || '#ec4899'}30`,
                                  }}
                                >
                                  #{highlightSearchTerm(tag.name, searchTerm)}
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* CTA Button */}
                          <div className="pt-4">
                            <Link
                              href={`/blog/${post.slug}`}
                              className="group/btn inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25"
                            >
                              <span>Lire l'article</span>
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>

                        {/* Featured Image */}
                        {post.photoPathPublicUrl && (
                          <div className="lg:col-span-1">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-700/30">
                              <img
                                src={post.photoPathPublicUrl || ''}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 mb-8">
                {searchTerm ? (
                  <Search className="w-12 h-12 text-gray-500" />
                ) : (
                  <BookOpen className="w-12 h-12 text-gray-500" />
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-4">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucun article pour le moment'}
              </h3>

              <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
                {searchTerm
                  ? `Aucun article ne correspond à votre recherche "${searchTerm}"`
                  : currentTag
                    ? `Aucun article trouvé pour le tag "${currentTag}"`
                    : 'Les premiers articles arrivent bientôt ! Restez connecté pour découvrir du contenu exclusif.'}
              </p>

              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-xl font-medium transition-all duration-200 border border-pink-500/30"
                >
                  <X className="w-4 h-4" />
                  Effacer la recherche
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!searchTerm && posts.meta.lastPage > 1 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent h-px"></div>

              <div className="relative flex justify-center items-center gap-6 pt-12">
                {posts.meta.currentPage > 1 && (
                  <Link
                    href={`/blog?page=${posts.meta.currentPage - 1}${currentTag ? `&tag=${currentTag}` : ''}`}
                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-2xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="font-medium">Précédent</span>
                  </Link>
                )}

                <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl">
                  <span className="text-gray-400">Page</span>
                  <span className="font-bold text-pink-400 text-lg">{posts.meta.currentPage}</span>
                  <span className="text-gray-600">/</span>
                  <span className="font-bold text-white text-lg">{posts.meta.lastPage}</span>
                </div>

                {posts.meta.currentPage < posts.meta.lastPage && (
                  <Link
                    href={`/blog?page=${posts.meta.currentPage + 1}${currentTag ? `&tag=${currentTag}` : ''}`}
                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-2xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm"
                  >
                    <span className="font-medium">Suivant</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
