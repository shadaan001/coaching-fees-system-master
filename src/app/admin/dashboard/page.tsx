'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/') // go back to landing page
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">

      {/* 🔹 TOP BAR */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
        >
          Logout
        </button>
      </div>

      {/* 🔹 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

        <Link href="/admin/students">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Students</h2>
            <p className="text-sm opacity-80">Manage students</p>
          </div>
        </Link>

        <Link href="/admin/class-fees">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Class Fees</h2>
            <p className="text-sm opacity-80">Set pricing</p>
          </div>
        </Link>

        <Link href="/admin/fees">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Pending Fees</h2>
            <p className="text-sm opacity-80">Track & remind</p>
          </div>
        </Link>

      </div>
    </div>
  )
}