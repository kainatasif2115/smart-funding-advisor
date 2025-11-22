'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { companiesApi } from '@/lib/api'

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Companies</h1>
              <p className="text-gray-600">Find and filter your companies</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, ID, or industry..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Industries</option>
                {uniqueIndustries.map((industry, idx) => (
                  <option key={idx} value={industry as string}>{industry as string}</option>
                ))}
              </select>
            </div>

            {/* Growth Stage Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Growth Stage
              </label>
              <select
                value={growthStageFilter}
                onChange={(e) => setGrowthStageFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                value={companySizeFilter}
                onChange={(e) => setCompanySizeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Sizes</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredCompanies.length} of {allCompanies.length} companies
            </p>
            {(searchTerm || industryFilter || growthStageFilter || companySizeFilter) && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading companies...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No companies found</h3>
              <p className="mt-2 text-gray-600">
                {allCompanies.length === 0
                  ? 'Start by adding your first company.'
                  : 'Try adjusting your filters.'}
              </p>
              {allCompanies.length === 0 && (
                <Link
                  href="/companies/add"
                  className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Add Your First Company
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/companies/${company.id}`} className="group">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                          {company.name}
                        </h3>
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        {company.business_id && (
                          <span className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {company.business_id}
                          </span>
                        )}
                        {company.growth_stage && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {company.growth_stage}
                          </span>
                        )}
                        {company.company_size && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {company.company_size}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
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
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{company.description}</p>
                      )}
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Link
                        href={`/companies/${company.id}`}
                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
