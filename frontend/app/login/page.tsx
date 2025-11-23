'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '@/lib/api'
import { GlassCard, LiquidButton, MorphingBackground, GlassInput } from '@/components/glass'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check for signup parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('signup') === 'true') {
      setIsLogin(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = isLogin
        ? await authApi.login(email, password)
        : await authApi.register(email, password)

      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <MorphingBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full z-10"
      >
        {/* Logo/Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-3xl">💎</span>
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-200 mb-2">
              Smart Funding Advisor
            </h1>
          </Link>
          <AnimatePresence mode="wait">
            <motion.p
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl text-gray-100"
            >
              {isLogin ? 'Welcome back!' : 'Join us today'}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Form Card */}
        <GlassCard className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login-form' : 'signup-form'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl font-medium"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-100 mb-2">
                    Email Address
                  </label>
                  <GlassInput
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="text-white"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-100 mb-2">
                    Password
                  </label>
                  <GlassInput
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-white"
                  />
                </div>

                {/* Submit Button */}
                <LiquidButton
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      {isLogin ? '🚀 Sign In' : '✨ Create Account'}
                    </>
                  )}
                </LiquidButton>

                {/* Toggle Login/Signup */}
                <div className="text-center pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError('')
                      setEmail('')
                      setPassword('')
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-sm text-gray-100 hover:text-white transition-colors font-medium"
                  >
                    {isLogin ? (
                      <>
                        Don't have an account?{' '}
                        <span className="text-emerald-400 font-semibold">Sign up</span>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <span className="text-emerald-400 font-semibold">Sign in</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </GlassCard>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          {[
            { icon: '🤖', text: 'AI-Powered' },
            { icon: '⚡', text: 'All Programs' },
            { icon: '🎯', text: 'Smart Match' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10"
            >
              <div className="text-2xl mb-1">{feature.icon}</div>
              <div className="text-xs text-gray-100 font-semibold">{feature.text}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
