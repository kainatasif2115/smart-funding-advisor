'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { companiesApi } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await companiesApi.getAll()
      setCompanies(response.companies || [])
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
    } catch (err: any) {
      alert('Failed to delete company')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your companies and funding recommendations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Companies</p>
                <p className="text-3xl font-bold text-gray-900">{companies.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Analyses Today</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quick Actions</p>
                <Link
                  href="/companies/add"
                  className="inline-block mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
                >
                  Add Company
                </Link>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Companies List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Companies</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading companies...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No companies yet</h3>
              <p className="mt-2 text-gray-600">Get started by adding your first company.</p>
              <Link
                href="/companies/add"
                className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                Add Your First Company
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {companies.map((company) => (
                <div key={company.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/companies/${company.id}`} className="group">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                          {company.name}
                        </h3>
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                        {company.business_id && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {company.business_id}
                          </span>
                        )}
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
