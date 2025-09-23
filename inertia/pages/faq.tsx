import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Code,
  Sparkles,
  Database,
  Globe,
  Palette,
  Zap,
  Shield,
  Cloud,
  Cpu,
  Monitor,
  ArrowRight,
} from 'lucide-react'

interface FaqItem {
  id: number
  question: string
  answer: string
}

interface FaqPageProps {
  faqs: FaqItem[]
}

const techStack = [
  {
    category: 'Frontend',
    icon: <Monitor className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    tools: [
      {
        name: 'React',
        description: 'Bibliothèque JavaScript pour interfaces utilisateur',
        icon: '⚛️',
        level: 'Expert',
      },
      {
        name: 'TypeScript',
        description: 'JavaScript typé pour plus de robustesse',
        icon: '🔷',
        level: 'Avancé',
      },
      {
        name: 'Tailwind CSS',
        description: 'Framework CSS utilitaire pour un design rapide',
        icon: '💨',
        level: 'Expert',
      },
      {
        name: 'Inertia.js',
        description: 'Pont moderne entre backend et frontend',
        icon: '🌉',
        level: 'Intermédiaire',
      },
    ],
  },
  {
    category: 'Backend',
    icon: <Database className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    tools: [
      {
        name: 'AdonisJS',
        description: 'Framework Node.js inspiré de Laravel',
        icon: '🏛️',
        level: 'Avancé',
      },
      {
        name: 'Lucid ORM',
        description: 'ORM élégant pour base de données',
        icon: '🗃️',
        level: 'Intermédiaire',
      },
      {
        name: 'MySql',
        description: 'Base de données relationnelle robuste',
        icon: '🐬',
        level: 'Avancé',
      },
      {
        name: 'Node.js',
        description: 'Runtime JavaScript côté serveur',
        icon: '🟢',
        level: 'Expert',
      },
    ],
  },
  {
    category: 'Design & UX',
    icon: <Palette className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    tools: [
      {
        name: 'Figma',
        description: "Design d'interfaces et prototypage",
        icon: '🎨',
        level: 'Avancé',
      },
      {
        name: 'Lucide Icons',
        description: 'Icônes SVG modernes et cohérentes',
        icon: '✨',
        level: 'Expert',
      },
      {
        name: 'Glassmorphism',
        description: 'Tendance design avec effets de verre',
        icon: '🔮',
        level: 'Avancé',
      },
      {
        name: 'Animations CSS',
        description: 'Micro-interactions et transitions fluides',
        icon: '🎭',
        level: 'Expert',
      },
    ],
  },
  {
    category: 'DevOps & Outils',
    icon: <Cloud className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    tools: [
      {
        name: 'Git',
        description: 'Contrôle de version distribué',
        icon: '📚',
        level: 'Expert',
      },
      {
        name: 'VS Code',
        description: 'Éditeur de code extensible',
        icon: '💻',
        level: 'Expert',
      },
      {
        name: 'npm/pnpm',
        description: 'Gestionnaires de paquets Node.js',
        icon: '📦',
        level: 'Avancé',
      },
      {
        name: 'ESLint',
        description: 'Linter pour JavaScript/TypeScript',
        icon: '🔍',
        level: 'Avancé',
      },
    ],
  },
]

// Données FAQ simulées pour l'exemple
const mockFaqs: FaqItem[] = [
  {
    id: 1,
    question: 'Quelles technologies avez-vous utilisées pour ce portfolio ?',
    answer:
      "Ce portfolio a été développé avec React, TypeScript et Tailwind CSS pour le frontend, AdonisJS avec PostgreSQL pour le backend. L'architecture utilise Inertia.js pour créer une expérience SPA fluide.",
  },
  {
    id: 2,
    question: 'Combien de temps avez-vous passé sur ce projet ?',
    answer:
      "Le développement de ce portfolio a pris environ 2 mois, incluant la conception UI/UX sur Figma, le développement frontend/backend, l'optimisation des performances et les tests sur différents appareils.",
  },
  {
    id: 3,
    question: 'Le site est-il responsive ?',
    answer:
      "Absolument ! Le portfolio est entièrement responsive et optimisé pour tous les appareils : desktop, tablettes et mobiles. J'ai utilisé une approche mobile-first avec Tailwind CSS pour garantir une expérience optimale sur tous les écrans.",
  },
  {
    id: 4,
    question: 'Peut-on voir le code source ?',
    answer:
      "Le code source de ce portfolio est disponible sur GitHub. Vous pouvez consulter l'architecture, les bonnes pratiques utilisées et même contribuer si vous le souhaitez.",
  },
]

const LevelBadge = ({ level }: { level: string }) => {
  const colors = {
    Expert: 'bg-green-500/20 text-green-400 border-green-500/30',
    Avancé: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Intermédiaire: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[level as keyof typeof colors] || colors.Intermédiaire}`}
    >
      {level}
    </span>
  )
}

export default function FaqPage({ faqs = mockFaqs }: FaqPageProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'website'>('faq')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (faqId: number) => {
    setOpenFaq(openFaq === faqId ? null : faqId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm text-pink-300 rounded-full text-sm font-medium mb-6 border border-pink-500/20">
            <Sparkles className="h-3 w-3" />
            Questions & Informations
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Tout savoir sur{' '}
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              ce portfolio
            </span>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Découvrez les réponses aux questions fréquentes et explorez les technologies utilisées
            pour créer cette expérience digitale.
          </p>
        </div>

        {/* Toggle Tabs - Plus compact */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full p-1">
            <button
              onClick={() => setActiveTab('faq')}
              className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                activeTab === 'faq'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('website')}
              className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                activeTab === 'website'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
              Technologies
            </button>
          </div>
        </div>

        {/* FAQ Content - Design plus épuré */}
        {activeTab === 'faq' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="group"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                  }}
                >
                  <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden hover:border-gray-600/50 transition-all duration-300">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left p-6 focus:outline-none group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-white group-hover:text-pink-300 transition-colors duration-300">
                          {faq.question}
                        </h3>
                        <div className="flex-shrink-0 p-1.5 bg-gray-700/50 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                          {openFaq === faq.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-pink-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-pink-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {openFaq === faq.id && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-gray-700/30 pt-4">
                          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {faqs.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-2xl border border-gray-700/50 mb-6">
                    <HelpCircle className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">
                    Aucune FAQ pour le moment
                  </h3>
                  <p className="text-gray-500">
                    Les questions fréquentes seront ajoutées prochainement.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Technologies Content - Design en grille */}
        {activeTab === 'website' && (
          <div className="space-y-8">
            {/* Introduction */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-4">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Stack Technologique</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Technologies modernes pour une expérience utilisateur optimale
              </p>
            </div>

            {/* Tech Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {techStack.map((category, categoryIndex) => (
                <div
                  key={category.category}
                  className="group"
                  style={{
                    animationDelay: `${categoryIndex * 150}ms`,
                    animation: 'fadeInUp 0.8s ease-out forwards',
                  }}
                >
                  <div
                    className={`relative ${category.bgColor} backdrop-blur-sm border ${category.borderColor} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300`}
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2 bg-gradient-to-r ${category.color} rounded-xl`}>
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white">{category.category}</h3>
                    </div>

                    {/* Tools List */}
                    <div className="space-y-4">
                      {category.tools.map((tool) => (
                        <div
                          key={tool.name}
                          className="group/tool flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
                        >
                          <span className="text-xl flex-shrink-0">{tool.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white group-hover/tool:text-pink-300 transition-colors">
                                {tool.name}
                              </h4>
                              <LevelBadge level={tool.level} />
                            </div>
                            <p className="text-gray-400 text-sm">{tool.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-600 group-hover/tool:text-pink-400 group-hover/tool:translate-x-1 transition-all duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Features */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Performance & Fonctionnalités</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Globe className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">SEO Optimisé</p>
                    <p className="text-xs text-gray-400">Référencement naturel</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Zap className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Chargement rapide</p>
                    <p className="text-xs text-gray-400">Performance optimisée</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Shield className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Sécurisé</p>
                    <p className="text-xs text-gray-400">Protection avancée</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
