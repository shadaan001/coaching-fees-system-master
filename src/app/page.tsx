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

  async function handleAdminLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/admin/dashboard')
  }

  async function handleStudentLogin() {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('phone', phone)

    if (!data || data.length === 0) {
      alert('Student not found')
      return
    }

    localStorage.setItem('student_phone', phone)

    router.push('/student/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-5">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-white">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">

          <img
            src="/logo.png"
            alt="logo"
            className="w-28 h-28 rounded-3xl shadow-2xl object-cover mb-4"
          />

          <h1 className="text-5xl font-bold text-center">
            Coaching System
          </h1>

          <p className="text-white/70 mt-2 text-center">
            Student & Admin Portal
          </p>

        </div>

        {/* ROLE SWITCH */}
        <div className="flex bg-white/10 rounded-2xl p-1 mb-6">

          <button
            onClick={() => setRole('admin')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
              role === 'admin'
                ? 'bg-white text-black'
                : 'text-white'
            }`}
          >
            Admin
          </button>

          <button
            onClick={() => setRole('student')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
              role === 'student'
                ? 'bg-white text-black'
                : 'text-white'
            }`}
          >
            Student
          </button>

        </div>

        {/* ADMIN */}
        {role === 'admin' && (
          <div className="space-y-4">

            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 outline-none"
            />

            <button
              onClick={handleAdminLogin}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 transition"
            >
              Login as Admin
            </button>

          </div>
        )}

        {/* STUDENT */}
        {role === 'student' && (
          <div className="space-y-4">

            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 outline-none"
            />

            <button
              onClick={handleStudentLogin}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 transition"
            >
              Login as Student
            </button>

          </div>
        )}

      </div>
    </div>
  )
}