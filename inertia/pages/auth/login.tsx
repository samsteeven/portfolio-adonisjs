import { Form } from '@inertiajs/react'
import { useState } from 'react'
import { HeadLayout } from '~/layout/HeadLayout'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils'
import { Eye, EyeOff, Mail, ArrowRight, Terminal, Code, Coffee, AlertTriangle } from 'lucide-react'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)

  return (
    <>
      <HeadLayout title="Login - Portfolio" description="Connecter vous pour administrer." />

      <div className="min-h-screen bg-black flex">
        {/* Left Panel - Terminal Style */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-black p-8 flex-col justify-between relative overflow-hidden">
          {/* Terminal Header */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-400 text-sm ml-4">admin@portfolio:~$</span>
            </div>

            <div className="font-mono text-sm space-y-2">
              <div className="text-green-400">$ whoami</div>
              <div className="text-gray-300">Administrator | Visitor</div>
              <div className="text-green-400">$ cat welcome.txt</div>
              <div className="text-gray-300">Bienvenue dans l'espace d'administration</div>
              <div className="text-gray-300">Gérez le portfolio en toute sécurité</div>
              <div className="text-green-400 mt-4">
                $ auth --login <span className="animate-pulse">|</span>
              </div>
            </div>
          </div>

          {/* Code snippet decoration */}
          <div className="absolute bottom-20 left-8 right-8">
            <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-700/30">
              <div className="font-mono text-xs text-gray-400 space-y-1">
                <div>
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-blue-400">admin</span> ={' '}
                  <span className="text-yellow-400">'authenticated'</span>;
                </div>
                <div>
                  <span className="text-purple-400">if</span> (
                  <span className="text-blue-400">admin</span>) &#123;
                </div>
                <div className="ml-4">
                  <span className="text-green-400">console</span>.
                  <span className="text-blue-400">log</span>(
                  <span className="text-yellow-400">'Access granted'</span>);
                </div>
                <div>&#125;</div>
              </div>
            </div>
          </div>

          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-semibold text-lg">Portfolio Admin</span>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
              <p className="text-gray-600">Accédez à votre dashboard administrateur</p>

              {/* Warning for multiple failed attempts */}
              {attemptCount >= 3 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    Trop de tentatives de connexion échouées. Veuillez patienter avant de réessayer.
                  </p>
                </div>
              )}
            </div>

            {/* Form */}
            <Form
              method="post"
              action={'/auth/login'}
              disableWhileProcessing
              options={{
                replace: true,
                preserveScroll: true,
              }}
              onSuccess={() => {
                // Réinitialiser le compteur en cas de succès
                setAttemptCount(0)
              }}
              onError={() => {
                // Incrémenter le compteur en cas d'erreur
                setAttemptCount((prev) => prev + 1)
              }}
              className="space-y-6 inert:opacity-50 inert:pointer-events-none"
            >
              {({ errors }) => (
                <>
                  <input
                    type="text"
                    name="website"
                    style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  {/* Email field */}
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </Label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={cn(
                          'block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900',
                          'focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent',
                          'transition-all duration-200 placeholder-gray-400',
                          errors?.email ? 'border-red-500 focus:ring-red-500' : ''
                        )}
                        placeholder="admin@example.com"
                      />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {errors?.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Password field */}
                  <div>
                    <Label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className={cn(
                          'block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900',
                          'focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent',
                          'transition-all duration-200 placeholder-gray-400',
                          errors?.password ? 'border-red-500 focus:ring-red-500' : ''
                        )}
                        placeholder="••••••••••"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors?.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        name="rememberMe"
                        type="checkbox"
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                        Se souvenir de moi
                      </label>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={attemptCount >= 5}
                    className={cn(
                      'w-full flex justify-center items-center px-4 py-3 rounded-lg font-medium transition-all duration-200',
                      attemptCount >= 5
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 group hover:cursor-pointer'
                    )}
                  >
                    {attemptCount >= 5 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Trop de tentatives
                      </>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </>
              )}
            </Form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <Coffee className="w-4 h-4" />
                <span>Développé avec passion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
