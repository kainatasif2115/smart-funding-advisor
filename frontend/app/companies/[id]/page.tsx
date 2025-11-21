'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { companiesApi, investorsApi } from '@/lib/api'

export default function CompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [funding, setFunding] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingFunding, setFetchingFunding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCompanyData()
  }, [params.id])

  const loadCompanyData = async () => {
    try {
      setLoading(true)
      const response = await companiesApi.getById(Number(params.id))
      setCompany(response)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load company')
    } finally {
      setLoading(false)
    }
  }

  const handleFetchFunding = async () => {
    setFetchingFunding(true)
    setError('')

    try {
      const response = await investorsApi.fetch(Number(params.id))
      setFunding(response.matches || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch funding recommendations')
    } finally {
      setFetchingFunding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    )
  }

  if (error && !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company?.name}</h1>
              <div className="flex flex-wrap gap-3">
                {company?.business_id && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {company.business_id}
                  </span>
                )}
                {company?.industry && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {company.industry}
                  </span>
                )}
                {company?.employees && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {company.employees} employees
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>

          {company?.description && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI-Generated Company Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">{company.description}</p>
            </div>
          )}
        </div>

        {/* Fetch Funding Button */}
        {funding.length === 0 && !fetchingFunding && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-center text-white mb-6">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Ready to Find Funding?</h2>
            <p className="text-lg opacity-90 mb-6">
              Let our AI analyze this company and discover the best funding opportunities
            </p>
            <button
              onClick={handleFetchFunding}
              className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-50 font-semibold text-lg shadow-lg transition"
            >
              🚀 Fetch Funding Recommendations
            </button>
          </div>
        )}

        {/* Loading State */}
        {fetchingFunding && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600 mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Analyzing Company Profile...</h3>
            <div className="space-y-2 max-w-md mx-auto text-gray-600">
              <p className="flex items-center justify-center">
                <span className="animate-pulse">⚡</span>
                <span className="ml-2">Scanning 8+ funding sources</span>
              </p>
              <p className="flex items-center justify-center">
                <span className="animate-pulse">🤖</span>
                <span className="ml-2">AI matching company profile with programs</span>
              </p>
              <p className="flex items-center justify-center">
                <span className="animate-pulse">📊</span>
                <span className="ml-2">Generating relevance scores and justifications</span>
              </p>
            </div>
            <p className="mt-6 text-sm text-gray-500">This may take 15-30 seconds...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Funding Recommendations */}
        {funding.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Funding Recommendations ({funding.length})
              </h2>
              <button
                onClick={handleFetchFunding}
                className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
              >
                🔄 Refresh Recommendations
              </button>
            </div>

            {funding.map((program, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {/* Program Header */}
                <div className={`px-6 py-4 ${
                  program.relevance_score >= 80
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200'
                    : program.relevance_score >= 60
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200'
                    : 'bg-gray-50 border-b border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{program.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          program.relevance_score >= 80
                            ? 'bg-green-100 text-green-700'
                            : program.relevance_score >= 60
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {program.relevance_score}% Match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{program.provider}</p>
                    </div>
                    {program.recommended && (
                      <span className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold">
                        ⭐ Highly Recommended
                      </span>
                    )}
                  </div>
                </div>

                {/* Program Details */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{program.description}</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Funding Amount</h4>
                        <p className="text-gray-700">{program.funding_amount}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Application Deadline</h4>
                        <p className="text-gray-700">{program.deadline}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Justification */}
                  <div className="bg-primary-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI Analysis: Why This Program Fits
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{program.justification}</p>
                  </div>

                  {/* Eligibility */}
                  <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Eligibility Requirements
                    </h4>
                    <p className="text-gray-700">{program.eligibility}</p>
                    {program.eligibility_notes && (
                      <p className="text-gray-600 text-sm mt-2 italic">{program.eligibility_notes}</p>
                    )}
                  </div>

                  {/* Focus Areas */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.focus_areas?.map((area: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <a
                    href={program.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Learn More & Apply
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
