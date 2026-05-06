'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()

  const [role, setRole] = useState<'admin' | 'student'>('admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')

  // 🔵 ADMIN LOGIN
  async function handleAdminLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/admin/dashboard')
  }

  // 🟢 STUDENT LOGIN
  async function handleStudentLogin() {
    if (!phone) {
      alert('Enter phone number')
      return
    }

    // ✅ FIND ALL STUDENTS WITH SAME PHONE
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('phone', phone.trim())

    if (error || !data || data.length === 0) {
      alert('Student not found')
      return
    }

    // ✅ SAVE PHONE
    localStorage.setItem('student_phone', phone.trim())

    // ✅ GO TO STUDENT DASHBOARD
    router.push('/student/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-white">

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Coaching System
          </h1>

          <p className="text-white/70">
            Student & Admin Portal
          </p>
        </div>

        {/* ROLE SWITCH */}
        <div className="flex bg-white/10 p-1 rounded-2xl mb-6">

          <button
            onClick={() => setRole('admin')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
              role === 'admin'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            Admin
          </button>

          <button
            onClick={() => setRole('student')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
              role === 'student'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            Student
          </button>

        </div>

        {/* ADMIN LOGIN */}
        {role === 'admin' && (
          <div className="space-y-4">

            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 placeholder-white/50 outline-none focus:border-white transition"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 placeholder-white/50 outline-none focus:border-white transition"
            />

            <button
              onClick={handleAdminLogin}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 transition duration-300 shadow-xl"
            >
              Login as Admin
            </button>

          </div>
        )}

        {/* STUDENT LOGIN */}
        {role === 'student' && (
          <div className="space-y-4">

            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 placeholder-white/50 outline-none focus:border-white transition"
            />

            <button
              onClick={handleStudentLogin}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 transition duration-300 shadow-xl"
            >
              Login as Student
            </button>

          </div>
        )}

      </div>
    </div>
  )
}