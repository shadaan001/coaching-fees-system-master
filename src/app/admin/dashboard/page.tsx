'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminDashboard() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0033] to-[#0f001a] p-6 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-600 p-1">
              <Image src="/logo.png" alt="logo" width={80} height={80} className="rounded-2xl" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tighter neon-text">ADMIN DASHBOARD</h1>
              <p className="text-cyan-400 text-xl">NAS Coaching Management</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="neon-button px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-semibold text-lg transition-all hover:scale-105"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "System Status", value: "Online", color: "text-emerald-400" },
            { label: "Portal", value: "Admin", color: "text-cyan-400" },
            { label: "Session", value: "2026-27", color: "text-purple-400" }
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-3xl">
              <p className="text-white/60 text-lg">{stat.label}</p>
              <p className={`text-5xl font-bold mt-3 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/admin/students" className="group">
            <div className="glass p-10 rounded-3xl card-hover h-full flex flex-col">
              <div className="text-6xl mb-6">👨‍🎓</div>
              <h2 className="text-3xl font-bold mb-3">Students</h2>
              <p className="text-white/70 flex-1">Manage students and their records</p>
              <div className="text-cyan-400 group-hover:translate-x-2 transition">Access →</div>
            </div>
          </Link>

          <Link href="/admin/class-fees" className="group">
            <div className="glass p-10 rounded-3xl card-hover h-full flex flex-col">
              <div className="text-6xl mb-6">💰</div>
              <h2 className="text-3xl font-bold mb-3">Class Fees</h2>
              <p className="text-white/70 flex-1">Set and manage class-wise fees</p>
              <div className="text-cyan-400 group-hover:translate-x-2 transition">Access →</div>
            </div>
          </Link>

          <Link href="/admin/fees" className="group">
            <div className="glass p-10 rounded-3xl card-hover h-full flex flex-col">
              <div className="text-6xl mb-6">📊</div>
              <h2 className="text-3xl font-bold mb-3">Pending Fees</h2>
              <p className="text-white/70 flex-1">Track dues and send reminders</p>
              <div className="text-cyan-400 group-hover:translate-x-2 transition">Access →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}