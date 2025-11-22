'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MorphingBackground } from '@/components/glass'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      <MorphingBackground />
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-emerald-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                <span className="text-white font-bold text-xl">💎</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Smart Funding Advisor</h1>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-200 hover:text-white font-medium transition"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-[#5cc9ad] text-[#0a2f23] rounded-lg hover:bg-[#4db89c] font-medium transition shadow-lg shadow-emerald-900/50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-200 mb-6"
          >
            Find the Right Funding for Your Business
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto"
          >
            AI-powered funding advisor that automatically matches Finnish companies with suitable 
            public funding programs and investors. Save time, discover opportunities, grow faster.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Link
              href="/login"
              className="px-8 py-3 bg-[#5cc9ad] text-[#0a2f23] rounded-lg hover:bg-[#4db89c] font-medium text-lg transition shadow-lg shadow-emerald-900/50"
            >
              Start Now
            </Link>
            <a
              href="#features"
              className="px-8 py-3 bg-white/10 text-gray-200 rounded-lg hover:bg-white/20 font-medium text-lg border-2 border-emerald-500/50 backdrop-blur transition"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          id="features"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <h2 className="text-3xl font-bold text-center text-gray-200 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-xl border border-emerald-900/30 hover:bg-white/10 transition"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/30">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-200">Search Companies</h3>
              <p className="text-gray-100">
                Search by Finnish Business ID or company name to automatically fetch company information from the official registry.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-xl border border-emerald-900/30 hover:bg-white/10 transition"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/30">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-200">AI Analysis</h3>
              <p className="text-gray-100">
                Our AI analyzes the company profile and matches it with hundreds of funding programs from ELY, Business Finland, EU, and more.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-xl border border-emerald-900/30 hover:bg-white/10 transition"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/30">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-200">Get Recommendations</h3>
              <p className="text-gray-100">
                Receive ranked funding recommendations with detailed justifications, eligibility criteria, and application deadlines.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-32 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl p-12 text-center border border-emerald-500/30"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-200">Ready to Find Your Funding?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Join Business Turku's smart funding advisor and discover opportunities for your company.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-[#5cc9ad] text-[#0a2f23] rounded-lg hover:bg-[#4db89c] font-medium text-lg transition shadow-lg shadow-emerald-900/50"
          >
            Get Started Free
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-xl border-t border-emerald-900/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-100">
            © 2025 Smart Funding Advisor - Business Turku. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
