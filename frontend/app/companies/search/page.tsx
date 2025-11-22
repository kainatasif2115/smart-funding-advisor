'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { companiesApi } from '@/lib/api'
import { GlassCard, LiquidButton, MorphingBackground } from '@/components/glass'

export default function SearchCompaniesPage() {
  const router = useRouter()
  const [allCompanies, setAllCompanies] = useState<any[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [growthStageFilter, setGrowthStageFilter] = useState('')
  const [companySizeFilter, setCompanySizeFilter] = useState('')

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
    }
    
    loadCompanies()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, industryFilter, growthStageFilter, companySizeFilter, allCompanies])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await companiesApi.getAll()
      setAllCompanies(response.companies || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allCompanies]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.business_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Industry filter
    if (industryFilter) {
      filtered = filtered.filter(company =>
        company.industry?.toLowerCase().includes(industryFilter.toLowerCase())
      )
    }

    // Growth stage filter
    if (growthStageFilter) {
      filtered = filtered.filter(company =>
        company.growth_stage?.toLowerCase() === growthStageFilter.toLowerCase()
      )
    }

    // Company size filter
    if (companySizeFilter) {
      filtered = filtered.filter(company =>
        company.company_size?.toLowerCase() === companySizeFilter.toLowerCase()
      )
    }

    setFilteredCompanies(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setIndustryFilter('')
    setGrowthStageFilter('')
    setCompanySizeFilter('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return
    
    try {
      await companiesApi.delete(id)
      setAllCompanies(allCompanies.filter(c => c.id !== id))
    } catch (err: any) {
      alert('Failed to delete company')
    }
  }

  // Get unique industries for filter dropdown
  const uniqueIndustries = Array.from(new Set(allCompanies.map(c => c.industry).filter(Boolean)))

  return (
    <div className="min-h-screen relative">
      <MorphingBackground />
      
      {/* Glass Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
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
            <Link href="/dashboard">
              <LiquidButton variant="ghost" size="sm">
                ← Back to Dashboard
              </LiquidButton>
            </Link>
          </div>
        </div>
      </motion.nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-200 mb-2">Search Companies</h1>
          <p className="text-gray-100">Find and filter your companies</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, ID, or industry..."
                className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Industry
              </label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              >
                <option value="">All Industries</option>
                {uniqueIndustries.map((industry, idx) => (
                  <option key={idx} value={industry as string}>{industry as string}</option>
                ))}
              </select>
            </div>

            {/* Growth Stage Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Growth Stage
              </label>
              <select
                value={growthStageFilter}
                onChange={(e) => setGrowthStageFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              >
                <option value="">All Stages</option>
                <option value="pre-seed">Pre-seed</option>
                <option value="seed">Seed</option>
                <option value="early-stage">Early-stage</option>
                <option value="growth">Growth</option>
                <option value="scale-up">Scale-up</option>
              </select>
            </div>

            {/* Company Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Company Size
              </label>
              <select
                value={companySizeFilter}
                onChange={(e) => setCompanySizeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              >
                <option value="">All Sizes</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-emerald-900/30">
            <p className="text-sm text-gray-100">
              Showing {filteredCompanies.length} of {allCompanies.length} companies
            </p>
            {(searchTerm || industryFilter || growthStageFilter || companySizeFilter) && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-[#5cc9ad] hover:text-[#4db89c]"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </GlassCard>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
          {loading ? (
            <div className="p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
              />
              <p className="mt-4 text-gray-100">Loading companies...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-200">No companies found</h3>
              <p className="mt-2 text-gray-100">
                {allCompanies.length === 0
                  ? 'Start by adding your first company.'
                  : 'Try adjusting your filters.'}
              </p>
              {allCompanies.length === 0 && (
                <div className="mt-6">
                  <Link href="/companies/add">
                    <LiquidButton variant="primary" size="lg">
                      Add Your First Company
                    </LiquidButton>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-emerald-900/20">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="p-6 hover:bg-white/5 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/companies/${company.id}`} className="group">
                        <h3 className="text-lg font-semibold text-gray-200 group-hover:text-emerald-400">
                          {company.name}
                        </h3>
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        {company.business_id && (
                          <span className="flex items-center text-gray-100">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {company.business_id}
                          </span>
                        )}
                        {company.growth_stage && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30">
                            {company.growth_stage}
                          </span>
                        )}
                        {company.company_size && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30">
                            {company.company_size}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-100">
                        {company.industry && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {company.industry}
                          </span>
                        )}
                        {company.employees && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {company.employees} employees
                          </span>
                        )}
                        {company.city && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {company.city}
                          </span>
                        )}
                      </div>
                      {company.description && (
                        <p className="mt-2 text-sm text-gray-100 line-clamp-2">{company.description}</p>
                      )}
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Link href={`/companies/${company.id}`}>
                        <LiquidButton variant="ghost" size="sm">
                          View Details
                        </LiquidButton>
                      </Link>
                      <LiquidButton
                        onClick={() => handleDelete(company.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </LiquidButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
