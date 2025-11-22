'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { companiesApi } from '@/lib/api'
import { GlassCard, LiquidButton, MorphingBackground } from '@/components/glass'

export default function DashboardPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
    }
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await companiesApi.getAll()
      const allCompanies = response.companies || []
      setTotalCount(allCompanies.length)
      const recentCompanies = allCompanies.slice(0, 5)
      setCompanies(recentCompanies)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return
    try {
      await companiesApi.delete(id)
      setCompanies(companies.filter(c => c.id !== id))
      setTotalCount(prev => prev - 1)
    } catch (err: any) {
      alert('Failed to delete company')
    }
  }

  // Stagger animation for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen relative">
      <MorphingBackground />
      
      {/* Glass Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-emerald-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                <span className="text-white font-bold text-xl">💎</span>
              </div>
              <span className="text-xl font-bold text-white">Smart Funding Advisor</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <LiquidButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('token')
                  router.push('/login')
                }}
              >
                Logout
              </LiquidButton>
            </div>
          </div>
        </div>
      </motion.nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-gray-200 mb-4">
            Welcome to Your
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent"> Dashboard</span>
          </h1>
          <p className="text-xl text-gray-100">Manage companies and discover funding opportunities</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 hover:scale-105 transition-transform h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-sm text-gray-100 mb-2 font-medium">Total Companies</p>
                    <p className="text-4xl font-bold text-gray-200">{totalCount}</p>
                  </div>
                  <p className="text-xs text-emerald-200 font-medium">↗ Active portfolio</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 hover:scale-105 transition-transform h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex flex-col justify-between h-full">
                  <p className="text-sm text-gray-100 mb-2 font-medium">Browse & Filter</p>
                  <Link href="/companies/search">
                    <LiquidButton variant="secondary" size="sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Companies
                    </LiquidButton>
                  </Link>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/30 to-cyan-500/30 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 hover:scale-105 transition-transform h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex flex-col justify-between h-full">
                  <p className="text-sm text-gray-100 mb-2 font-medium">Quick Actions</p>
                  <Link href="/companies/add">
                    <LiquidButton variant="primary" size="sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Company
                    </LiquidButton>
                  </Link>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-green-500/30 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Companies List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GlassCard enableTilt={false}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-200">Recent Companies</h2>
              <Link href="/companies/search">
                <LiquidButton variant="ghost" size="sm">
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </LiquidButton>
              </Link>
            </div>

            {loading ? (
              <div className="p-16 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
                />
                <p className="mt-6 text-gray-100 font-medium">Loading companies...</p>
              </div>
            ) : error ? (
              <div className="p-16 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="p-16 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  <svg className="mx-auto h-20 w-20 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-200 mb-3">No companies yet</h3>
                  <p className="text-gray-100 mb-8 font-medium">Start your funding journey by adding your first company</p>
                  <Link href="/companies/add">
                    <LiquidButton variant="primary" size="lg">
                      🚀 Add Your First Company
                    </LiquidButton>
                  </Link>
                </motion.div>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {companies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/companies/${company.id}`}>
                          <h3 className="text-xl font-bold text-gray-200 hover:text-emerald-300 transition-colors mb-2">
                            {company.name}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap gap-3 mb-3">
                          {company.business_id && (
                            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-100 font-medium">
                              🏷️ {company.business_id}
                            </span>
                          )}
                          {company.industry && (
                            <span className="px-3 py-1 bg-emerald-500/20 rounded-full text-sm text-emerald-200 font-medium border border-emerald-700/30">
                              💼 {company.industry}
                            </span>
                          )}
                          {company.employees && (
                            <span className="px-3 py-1 bg-teal-500/20 rounded-full text-sm text-teal-200 font-medium border border-teal-700/30">
                              👥 {company.employees} employees
                            </span>
                          )}
                        </div>
                        {company.description && (
                          <p className="text-gray-100 text-sm line-clamp-2">{company.description}</p>
                        )}
                      </div>
                      <div className="ml-6 flex gap-2">
                        <Link href={`/companies/${company.id}`}>
                          <LiquidButton variant="ghost" size="sm">
                            View Details →
                          </LiquidButton>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(company.id)}
                          className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
