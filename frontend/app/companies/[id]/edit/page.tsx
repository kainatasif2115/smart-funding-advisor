'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { companiesApi } from '@/lib/api'
import { GlassCard, LiquidButton, MorphingBackground } from '@/components/glass'

export default function EditCompanyPage() {
  const router = useRouter()
  const params = useParams()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    business_id: '',
    name: '',
    description: '',
    industry: '',
    company_size: 'small',
    growth_stage: 'growth',
    employees: 10,
    city: '',
    country: 'Finland',
    funding_purpose: '',
    funding_amount: '',
    keywords: [] as string[]
  })

  useEffect(() => {
    loadCompanyData()
  }, [params.id])

  const loadCompanyData = async () => {
    try {
      setLoading(true)
      const response = await companiesApi.getById(Number(params.id))
      setFormData({
        business_id: response.business_id || '',
        name: response.name || '',
        description: response.description || '',
        industry: response.industry || '',
        company_size: response.company_size || 'small',
        growth_stage: response.growth_stage || 'growth',
        employees: response.employees || 10,
        city: response.city || '',
        country: response.country || 'Finland',
        funding_purpose: response.funding_purpose || '',
        funding_amount: response.funding_amount || '',
        keywords: response.keywords || []
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await companiesApi.update(Number(params.id), formData)
      router.push(`/companies/${params.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update company')
      setSaving(false)
    }
  }

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keyword.trim()]
      })
    }
  }

  const handleKeywordRemove = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <MorphingBackground />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
          />
        </div>
      </div>
    )
  }

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
            <Link href={`/companies/${params.id}`}>
              <LiquidButton variant="ghost" size="sm">
                ← Back to Company
              </LiquidButton>
            </Link>
          </div>
        </div>
      </motion.nav>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-200 mb-2">Edit Company</h1>
          <p className="text-gray-100">Update company information and details</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <GlassCard className="p-4 bg-red-500/10 border-red-400/30">
              <p className="text-red-300">{error}</p>
            </GlassCard>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Business ID (Y-tunnus)
                  </label>
                  <input
                    type="text"
                    value={formData.business_id}
                    onChange={(e) => setFormData({ ...formData, business_id: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white opacity-50"
                    disabled
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Company Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                />
              </div>

              {/* Industry & Location */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  />
                </div>
              </div>

              {/* Company Size & Stage */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Company Size
                  </label>
                  <select
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Growth Stage
                  </label>
                  <select
                    value={formData.growth_stage}
                    onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  >
                    <option value="pre-seed">Pre-seed</option>
                    <option value="seed">Seed</option>
                    <option value="early-stage">Early-stage</option>
                    <option value="growth">Growth</option>
                    <option value="scale-up">Scale-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Employees
                  </label>
                  <input
                    type="number"
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  />
                </div>
              </div>

              {/* Funding Info */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Funding Purpose
                </label>
                <textarea
                  value={formData.funding_purpose}
                  onChange={(e) => setFormData({ ...formData, funding_purpose: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
                  placeholder="What does this company need funding for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Estimated Funding Amount
                </label>
                <input
                  type="text"
                  value={formData.funding_amount}
                  onChange={(e) => setFormData({ ...formData, funding_amount: e.target.value })}
                  placeholder="e.g., €200,000 - €500,000"
                  className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Keywords / Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm border border-emerald-500/30"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleKeywordRemove(keyword)}
                        className="ml-2 text-emerald-300 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Press Enter to add keyword"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleKeywordAdd(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                  className="w-full px-4 py-2 bg-white/10 border border-emerald-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-emerald-900/30">
                <LiquidButton
                  type="button"
                  onClick={() => router.push(`/companies/${params.id}`)}
                  variant="ghost"
                >
                  Cancel
                </LiquidButton>
                <LiquidButton
                  type="submit"
                  disabled={saving}
                  variant="primary"
                  className="flex-1"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </LiquidButton>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
