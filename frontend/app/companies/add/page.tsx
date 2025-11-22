'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { companiesApi } from '@/lib/api'

export default function AddCompanyPage() {
  const router = useRouter()
  const [method, setMethod] = useState<'business_id' | 'search'>('business_id')
  const [businessId, setBusinessId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [companyData, setCompanyData] = useState<any>(null)

  const handleBusinessIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessId.trim()) return
    
    // Redirect to form page with business ID
    router.push(`/companies/new?businessId=${businessId}`)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setError('')
    setSearching(true)
    setSearchResults([])

    try {
      const response = await companiesApi.searchByName(searchQuery)
      setSearchResults(response.results || [])
      if (response.results?.length === 0) {
        setError('No companies found matching your search')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectCompany = async (company: any) => {
    setLoading(true)
    setError('')

    try {
      const response = await companiesApi.fetchBySelection(company.business_id, company)
      setCompanyData(response.company)
      setSearchResults([])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add company')
    } finally {
      setLoading(false)
    }
  }

  const viewCompanyDetails = () => {
    if (companyData?.id) {
      router.push(`/companies/${companyData.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Company</h1>
          <p className="text-gray-600">Search for a Finnish company to add to your portfolio</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMethod('business_id')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                method === 'business_id'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search by Business ID
            </button>
            <button
              onClick={() => setMethod('search')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                method === 'search'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search by Company Name
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {method === 'business_id' && (
            <form onSubmit={handleBusinessIdSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finnish Business ID (Y-tunnus)
                </label>
                <input
                  type="text"
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  placeholder="e.g., 1234567-8"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter the Finnish Business ID (Y-tunnus) in format NNNNNNN-N
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Fetching...' : 'Fetch Company Data'}
              </button>
            </form>
          )}

          {method === 'search' && (
            <div>
              <form onSubmit={handleSearch} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., Nokia, Rovio"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={searching}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                    >
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 mb-3">Search Results ({searchResults.length})</h3>
                  {searchResults.map((company, index) => (
                    <div
                      key={index}
                      className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-8 hover:border-primary-300 hover:shadow-md transition"
                    >
                      {/* Company Header */}
                      <div className="mb-4">
                        <h4 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h4>
                        <p className="text-lg text-gray-500 font-medium">Y-tunnus: {company.business_id}</p>
                      </div>

                      {/* Industry Badge */}
                      {company.industry && (
                        <p className="text-gray-700 mb-4 text-sm">
                          <strong>Sector:</strong> {company.industry}
                        </p>
                      )}

                      {/* Info Row */}
                      <div className="flex flex-wrap gap-6 mb-4 text-sm text-gray-600">
                        {company.city && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span><strong>Location:</strong> {company.country || 'Finland'}{company.city && `, ${company.city}`}</span>
                          </div>
                        )}
                        {company.company_form && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span><strong>Type:</strong> {company.company_form}</span>
                          </div>
                        )}
                        {company.registration_date && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span><strong>Registered:</strong> {new Date(company.registration_date).getFullYear()}</span>
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 hover:underline">
                              {company.website}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => router.push(`/companies/new?businessId=${company.business_id}`)}
                        className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition flex items-center justify-center text-lg"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Company & Generate Full Profile
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {loading && !companyData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fetching Company Data...</h3>
            <p className="text-gray-600">Please wait while we retrieve company information and generate AI summary</p>
          </div>
        )}

        {companyData && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-primary-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Company Added Successfully!</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{companyData.name}</h3>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {companyData.business_id && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {companyData.business_id}
                      </span>
                    )}
                    {companyData.industry && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {companyData.industry}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  ✓ Added
                </span>
              </div>

              {companyData.description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI-Generated Summary
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {companyData.description}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={viewCompanyDetails}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  View Details & Fetch Funding Recommendations
                </button>
                <button
                  onClick={() => {
                    setCompanyData(null)
                    setBusinessId('')
                    setSearchQuery('')
                    setSearchResults([])
                    setError('')
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Add Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
