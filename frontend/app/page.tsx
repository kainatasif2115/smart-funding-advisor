'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Smart Funding Advisor</h1>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Find the Right Funding for Your Business
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered funding advisor that automatically matches Finnish companies with suitable 
            public funding programs and investors. Save time, discover opportunities, grow faster.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-lg"
            >
              Start Now
            </Link>
            <a
              href="#features"
              className="px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-50 font-medium text-lg border-2 border-primary-600"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Search Companies</h3>
              <p className="text-gray-600">
                Search by Finnish Business ID or company name to automatically fetch company information from the official registry.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes the company profile and matches it with hundreds of funding programs from ELY, Business Finland, EU, and more.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Recommendations</h3>
              <p className="text-gray-600">
                Receive ranked funding recommendations with detailed justifications, eligibility criteria, and application deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-primary-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Funding?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join Business Turku's smart funding advisor and discover opportunities for your company.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 font-medium text-lg"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2024 Smart Funding Advisor - Business Turku. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
