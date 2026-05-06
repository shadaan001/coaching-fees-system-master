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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 md:p-8 text-white">

      {/* 🔥 TOP SECTION */}
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">

          {/* LEFT */}
          <div className="flex items-center gap-4">

            <Image
              src="/logo.png"
              alt="logo"
              width={80}
              height={80}
              className="rounded-3xl shadow-2xl"
            />

            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Admin Dashboard
              </h1>

              <p className="text-white/70 text-lg mt-1">
                Coaching Management System
              </p>
            </div>

          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="bg-white text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition duration-300 shadow-xl"
          >
            Logout
          </button>

        </div>

        {/* 🔥 QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg text-white/70">System Status</h2>
            <p className="text-3xl font-bold mt-2">Online ✅</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg text-white/70">Portal Type</h2>
            <p className="text-3xl font-bold mt-2">Admin</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg text-white/70">Session</h2>
            <p className="text-3xl font-bold mt-2">2026-27</p>
          </div>

        </div>

        {/* 🔥 MAIN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* STUDENTS */}
          <Link href="/admin/students">

            <div className="group bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl hover:scale-105 transition duration-300 cursor-pointer">

              <div className="text-5xl mb-4">👨‍🎓</div>

              <h2 className="text-2xl font-bold mb-2">
                Students
              </h2>

              <p className="text-white/70">
                Add, edit & manage students
              </p>

              <div className="mt-6 text-sm text-white/50 group-hover:text-white transition">
                Open →
              </div>

            </div>

          </Link>

          {/* CLASS FEES */}
          <Link href="/admin/class-fees">

            <div className="group bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl hover:scale-105 transition duration-300 cursor-pointer">

              <div className="text-5xl mb-4">💰</div>

              <h2 className="text-2xl font-bold mb-2">
                Class Fees
              </h2>

              <p className="text-white/70">
                Set class-wise fee pricing
              </p>

              <div className="mt-6 text-sm text-white/50 group-hover:text-white transition">
                Open →
              </div>

            </div>

          </Link>

          {/* FEES */}
          <Link href="/admin/fees">

            <div className="group bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl hover:scale-105 transition duration-300 cursor-pointer">

              <div className="text-5xl mb-4">📲</div>

              <h2 className="text-2xl font-bold mb-2">
                Pending Fees
              </h2>

              <p className="text-white/70">
                Track dues & send reminders
              </p>

              <div className="mt-6 text-sm text-white/50 group-hover:text-white transition">
                Open →
              </div>

            </div>

          </Link>

        </div>

      </div>
    </div>
  )
}