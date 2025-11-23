'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { companiesApi, investorsApi } from '@/lib/api'
import { GlassCard, LiquidButton, MorphingBackground } from '@/components/glass'

export default function CompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [funding, setFunding] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingFunding, setFetchingFunding] = useState(false)
  const [error, setError] = useState('')
  const [displayCount, setDisplayCount] = useState(10)

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
      setDisplayCount(10)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch funding recommendations')
    } finally {
      setFetchingFunding(false)
    }
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

  if (error && !company) {
    return (
      <div className="min-h-screen relative">
        <MorphingBackground />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <GlassCard className="p-8">
            <p className="text-red-400 text-center">{error}</p>
          </GlassCard>
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
            <Link href="/dashboard">
              <LiquidButton variant="ghost" size="sm">
                ← Back to Dashboard
              </LiquidButton>
            </Link>
          </div>
        </div>
      </motion.nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold text-gray-200">{company?.name}</h1>
                  {company?.business_id && (
                    <span className="px-4 py-2 bg-emerald-500/20 rounded-lg text-emerald-300 font-medium border border-emerald-700/30">
                      Y-tunnus: {company.business_id}
                    </span>
                  )}
                </div>
                
                {company?.description && (
                  <p className="text-gray-100 text-lg leading-relaxed mb-6 max-w-4xl">
                    {company.description}
                  </p>
                )}
                
                {/* Badges */}
                <div className="flex gap-3 mb-6">
                  {company?.growth_stage && (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-200 font-semibold flex items-center gap-2"
                    >
                      <span className="text-lg">📈</span>
                      {company.growth_stage}
                    </motion.span>
                  )}
                  {company?.company_size && (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-400/30 text-teal-200 font-semibold flex items-center gap-2"
                    >
                      <span className="text-lg">🏢</span>
                      {company.company_size}
                    </motion.span>
                  )}
                </div>
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {company?.industry && (
                    <div className="bg-white/5 rounded-lg p-4 backdrop-blur">
                      <p className="text-gray-200 text-sm mb-1 font-medium">Industry</p>
                      <p className="text-gray-200 font-semibold">{company.industry}</p>
                    </div>
                  )}
                  {company?.city && (
                    <div className="bg-white/5 rounded-lg p-4 backdrop-blur">
                      <p className="text-gray-200 text-sm mb-1 font-medium">Location</p>
                      <p className="text-gray-200 font-semibold">{company.city != 'None' ? `${company.city},` : ''} {company.country || 'Finland'}</p>
                    </div>
                  )}
                  {company?.employees && (
                    <div className="bg-white/5 rounded-lg p-4 backdrop-blur">
                      <p className="text-gray-200 text-sm mb-1 font-medium">Employees</p>
                      <p className="text-gray-200 font-semibold">~{company.employees}</p>
                    </div>
                  )}
                  {company?.revenue && (
                    <div className="bg-white/5 rounded-lg p-4 backdrop-blur">
                      <p className="text-gray-200 text-sm mb-1 font-medium">Revenue</p>
                      <p className="text-gray-200 font-semibold">{company.revenue}</p>
                    </div>
                  )}
                </div>
                
                {/* Funding Need */}
                {(company?.funding_purpose || company?.funding_amount) && (
                  <div className="bg-gradient-to-r from-emerald-500/[0.05] to-teal-500/[0.05] rounded-xl p-6 border border-emerald-400/30">
                    <h3 className="text-gray-200 font-bold mb-3 flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      Funding Need
                    </h3>
                    {company?.funding_purpose && (
                      <p className="text-gray-100 mb-3">{company.funding_purpose}</p>
                    )}
                    {company?.funding_amount && (
                      <p className="text-gray-200 font-semibold">Amount: {company.funding_amount}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Link href={`/companies/${params.id}/edit`}>
                  <LiquidButton variant="ghost" size="sm">
                    ✏️ Edit
                  </LiquidButton>
                </Link>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Fetch Funding CTA */}
        {funding.length === 0 && !fetchingFunding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-12 text-center mb-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-900/30">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl mb-6"
              >
                🚀
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-200 mb-4">Ready to Find Funding?</h2>
              <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
                Let our AI analyze {company?.name} and discover the best funding opportunities from all funding programs
              </p>
              <LiquidButton onClick={handleFetchFunding} size="lg" variant="primary">
                ✨ Fetch Funding Recommendations
              </LiquidButton>
            </GlassCard>
          </motion.div>
        )}

        {/* Loading State */}
        {fetchingFunding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <GlassCard className="p-16 text-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full mb-8"
              />
              <h3 className="text-2xl font-bold text-gray-200 mb-4">Analyzing Company Profile...</h3>
              <div className="space-y-3 max-w-md mx-auto">
                {['Analyzing all funding programs', 'AI matching company profile', 'Generating relevance scores'].map((text, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="text-gray-100 flex items-center justify-center gap-2 font-medium"
                  >
                    <span className="text-xl">⚡</span>
                    {text}
                  </motion.p>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Error */}
        {error && funding.length === 0 && (
          <GlassCard className="p-6 mb-8 bg-red-500/10 border-red-400/30">
            <p className="text-red-300 text-center font-medium">{error}</p>
          </GlassCard>
        )}

        {/* Funding Results */}
        {funding.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-200">
                Top {Math.min(displayCount, funding.length)} of {funding.length} Matches
              </h2>
              <LiquidButton onClick={handleFetchFunding} variant="ghost" size="sm">
                🔄 Refresh
              </LiquidButton>
            </div>

            <div className="space-y-6">
              {funding.slice(0, displayCount).map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#020f12] rounded-2xl border border-teal-900/30 shadow-2xl shadow-black/50 overflow-hidden"
                >
                  {/* Header Row */}
                  <div className="p-6 border-b border-teal-900/20">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-2xl font-bold text-white">{program.name}</h3>
                        <span className={`px-4 py-1.5 rounded-full font-semibold text-sm ${
                          program.relevance_score >= 80 ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50' :
                          program.relevance_score >= 60 ? 'bg-teal-950/50 text-teal-400 border border-teal-800/50' :
                          'bg-slate-900/50 text-slate-400 border border-slate-700/50'
                        }`}>
                          {program.relevance_score}% Match
                        </span>
                      </div>
                      {program.recommended && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-950/30 border border-amber-800/40">
                          <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          <span className="text-amber-400 font-semibold text-sm">Top Pick</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Info Row */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-semibold mb-2 text-sm">Description</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{program.description}</p>
                      </div>
                      <div>
                        {program?.funding_details?.typical_amount || program?.funding_details?.amount ? 
                          <>
                            <h4 className="text-white font-semibold mb-2 text-sm">Funding Amount</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">{program?.funding_details?.typical_amount || program?.funding_details?.amount}</p>
                          </>
                        :
                          <></>
                        }
                        <h4 className="text-white font-semibold mb-2 text-sm mt-4">Deadline</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{program.deadline}</p>
                      </div>
                    </div>

                    {/* AI Analysis Tile */}
                    <div className="rounded-xl p-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-yellow-400">
                      <div className="rounded-xl bg-[#020f12] p-5">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-teal-900/40 flex items-center justify-center border border-teal-700/30">
                              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400">
                                <path d="M16.334 7.49967L17.3757 5.20801L19.6673 4.16634L17.3757 3.12467L16.334 0.833008L15.2923 3.12467L13.0007 4.16634L15.2923 5.20801L16.334 7.49967ZM10.084 7.91634L8.00065 3.33301L5.91732 7.91634L1.33398 9.99967L5.91732 12.083L8.00065 16.6663L10.084 12.083L14.6673 9.99967L10.084 7.91634ZM16.334 12.4997L15.2923 14.7913L13.0007 15.833L15.2923 16.8747L16.334 19.1663L17.3757 16.8747L19.6673 15.833L17.3757 14.7913L16.334 12.4997Z" fill="currentColor"/>
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold mb-1">AI Analysis</h4>
                            <p className="text-teal-400/70 text-xs mb-3">Automated matching based on industry and focus areas</p>
                            <p className="text-slate-300 text-sm leading-relaxed">{program.justification}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                        {/* Eligibility Tile */}
                        <div className="bg-[#022020]/60 rounded-xl p-5 border border-emerald-900/30">
                          <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-emerald-900/40 flex items-center justify-center border border-emerald-700/30">
                            <svg className="w-6 h-6 text-emerald-400 fill-current" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-1">Eligibility</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{program.eligibility_notes || 'Please review program details for eligibility requirements.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex flex-wrap gap-2">
                        {program.focus_areas?.map((area: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-full bg-slate-900/50 text-slate-400 text-xs font-medium border border-slate-800/50"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                      <a href={program.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <button className="px-6 py-2.5 rounded-lg bg-[#5cc9ad] hover:bg-[#4db89c] text-[#0a2f23] font-semibold text-sm transition-colors shadow-lg shadow-teal-900/50">
                          Learn More & Apply →
                        </button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Load More */}
              {displayCount < funding.length && (
                <div className="text-center pt-6">
                  <LiquidButton
                    onClick={() => setDisplayCount(prev => Math.min(prev + 10, funding.length))}
                    variant="primary"
                    size="lg"
                  >
                    Load More ({funding.length - displayCount} remaining)
                  </LiquidButton>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
