'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminSidebar() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="w-[260px] h-screen bg-black/30 backdrop-blur-xl border-r border-white/10 p-6 fixed left-0 top-0 text-white">

      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Coaching ERP
        </h1>

        <p className="text-sm text-gray-300 mt-1">
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-4">

        <Link
          href="/admin/dashboard"
          className="bg-white/10 hover:bg-white/20 transition p-4 rounded-xl"
        >
          📊 Dashboard
        </Link>

        <Link
          href="/admin/students"
          className="bg-white/10 hover:bg-white/20 transition p-4 rounded-xl"
        >
          👨‍🎓 Students
        </Link>

        <Link
          href="/admin/class-fees"
          className="bg-white/10 hover:bg-white/20 transition p-4 rounded-xl"
        >
          💰 Class Fees
        </Link>

        <Link
          href="/admin/fees"
          className="bg-white/10 hover:bg-white/20 transition p-4 rounded-xl"
        >
          📅 Pending Fees
        </Link>

      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-6 right-6 bg-red-500 hover:bg-red-600 transition py-3 rounded-xl font-semibold"
      >
        Logout
      </button>

    </div>
  )
}