'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">Smart Funding Advisor</h1>
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                Dashboard
              </Link>
              <Link href="/companies/add" className="text-gray-700 hover:text-primary-600 font-medium">
                Add Company
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600">{user.email}</span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
