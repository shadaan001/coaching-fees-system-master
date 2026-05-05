'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // 🔒 Protect route
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/admin/login')
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // ⏳ Prevent UI flash before auth check
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg">Checking authentication...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* 🔝 Top Bar */}
      <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/admin/login')
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* 📊 Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

        <Link href="/admin/students">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
            <h2 className="text-xl font-semibold mb-2">Students</h2>
            <p className="text-gray-500">Add / Edit Students</p>
          </div>
        </Link>

        <Link href="/admin/class-fees">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
            <h2 className="text-xl font-semibold mb-2">Class Fees</h2>
            <p className="text-gray-500">Manage Class Pricing</p>
          </div>
        </Link>

        <Link href="/admin/fees">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
            <h2 className="text-xl font-semibold mb-2">Monthly Fees</h2>
            <p className="text-gray-500">Generate & Track Fees</p>
          </div>
        </Link>

      </div>

    </div>
  )
}