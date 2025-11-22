'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { companiesApi } from '@/lib/api'

export default function NewCompanyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessId = searchParams.get('businessId')
  
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
    revenue: '',
    city: '',
    country: 'Finland',
    funding_purpose: '',
    funding_amount: '',
    keywords: [] as string[]
  })

  useEffect(() => {
    if (businessId) {
      fetchCompanyPreview(businessId)
    } else {
      setLoading(false)
    }
  }, [businessId])

  const fetchCompanyPreview = async (id: string) => {
    try {
      setLoading(true)
      const response = await companiesApi.previewByBusinessId(id)
      setFormData({
        business_id: response.company.business_id || '',
        name: response.company.name || '',
        description: response.company.description || '',
        industry: response.company.industry || '',
        company_size: response.company.company_size || 'small',
        growth_stage: response.company.growth_stage || 'growth',
        employees: response.company.employees || 10,
        revenue: response.company.revenue || '',
        city: response.company.city || '',
        country: response.company.country || 'Finland',
        funding_purpose: response.company.funding_purpose || '',
        funding_amount: response.company.funding_amount || '',
        keywords: response.company.keywords || []
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch company data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await companiesApi.add(formData)
      router.push(`/companies/${response.company.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add company')
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading company data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review & Add Company</h1>
          <p className="text-gray-600">Verify the AI-generated information and make any necessary edits</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business ID (Y-tunnus)
              </label>
              <input
                type="text"
                value={formData.business_id}
                onChange={(e) => setFormData({ ...formData, business_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Industry & Location */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Company Size & Stage */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Growth Stage
              </label>
              <select
                value={formData.growth_stage}
                onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="pre-seed">Pre-seed</option>
                <option value="seed">Seed</option>
                <option value="early-stage">Early-stage</option>
                <option value="growth">Growth</option>
                <option value="scale-up">Scale-up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue Class
              </label>
              <select
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select revenue range</option>
                <option value="Under 1M EUR">Under 1M EUR</option>
                <option value="1M - 5M EUR">1M - 5M EUR</option>
                <option value="5M - 20M EUR">5M - 20M EUR</option>
                <option value="20M+ EUR">20M+ EUR</option>
              </select>
            </div>
          </div>

          {/* Employees Row */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Employees
            </label>
            <input
              type="number"
              value={formData.employees}
              onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 25"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Funding Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding Purpose
            </label>
            <textarea
              value={formData.funding_purpose}
              onChange={(e) => setFormData({ ...formData, funding_purpose: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="What does this company need funding for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Funding Amount
            </label>
            <input
              type="text"
              value={formData.funding_amount}
              onChange={(e) => setFormData({ ...formData, funding_amount: e.target.value })}
              placeholder="e.g., €200,000 - €500,000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords / Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleKeywordRemove(keyword)}
                    className="ml-2 text-gray-500 hover:text-red-600"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
            >
              {saving ? 'Adding Company...' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
