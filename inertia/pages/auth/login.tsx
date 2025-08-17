import { useForm } from '@inertiajs/react'
import React, { useState } from 'react'
import { HeadLayout } from '~/layout/HeadLayout'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils'
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    rememberMe: false as boolean,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/auth/login', {
      replace: true,
    })
  }

  return (
    <>
      <HeadLayout title="Login - Portfolio" description="Connecter vous pour administrer." />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-md w-full space-y-8 z-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Connexion Admin</h1>
              <p className="mt-2 text-gray-600">Accédez à votre espace d'administration</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Adresse email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={cn(
                      'block w-full pl-10 pr-3 py-3 border border-gray-200 hover:bg-white rounded-xl text-gray-900 transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent',
                      'bg-white autofill:bg-white',
                      errors?.email ? 'border-red-300 focus:ring-red-500' : ''
                    )}
                    placeholder="votre@email.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                  />
                </div>
                {errors?.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className={cn(
                      'block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      'hover:border-gray-300',
                      'bg-white autofill:bg-white autofill:shadow-[0_0_0_1000px_white_inset]',
                      errors?.password ? 'border-red-300 focus:ring-red-500' : ''
                    )}
                    placeholder="Votre mot de passe"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors?.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={data.rememberMe}
                  onChange={(e) => setData('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500  border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember" className="ml-3 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={processing}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:cursor-pointer hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
