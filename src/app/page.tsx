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

  // 🔵 Admin Login
  async function handleAdminLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/admin/dashboard')
  }

  // 🟢 Student Login (FIXED)
  async function handleStudentLogin() {
    const cleanPhone = phone.trim()

    if (!cleanPhone) {
      alert('Enter phone number')
      return
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle() // ✅ safer

    if (error || !data) {
      alert('Student not found')
      return
    }

    // ✅ IMPORTANT: SAME KEY AS DASHBOARD
    localStorage.setItem('student_phone', cleanPhone)

    router.push('/student/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">

      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-[350px] text-white">

        <h1 className="text-2xl font-bold text-center mb-6">
          Coaching System
        </h1>

        {/* 🔘 Role Switch */}
        <div className="flex mb-6 bg-white/20 rounded-lg p-1">
          <button
            onClick={() => setRole('admin')}
            className={`flex-1 py-2 rounded ${
              role === 'admin' ? 'bg-white text-black' : ''
            }`}
          >
            Admin
          </button>

          <button
            onClick={() => setRole('student')}
            className={`flex-1 py-2 rounded ${
              role === 'student' ? 'bg-white text-black' : ''
            }`}
          >
            Student
          </button>
        </div>

        {/* 🔵 ADMIN FORM */}
        {role === 'admin' && (
          <>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-2 rounded bg-white/20 placeholder-white outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 p-2 rounded bg-white/20 placeholder-white outline-none"
            />

            <button
              onClick={handleAdminLogin}
              className="w-full bg-white text-black py-2 rounded font-semibold hover:scale-105 transition"
            >
              Login as Admin
            </button>
          </>
        )}

        {/* 🟢 STUDENT FORM */}
        {role === 'student' && (
          <>
            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mb-4 p-2 rounded bg-white/20 placeholder-white outline-none"
            />

            <button
              onClick={handleStudentLogin}
              className="w-full bg-white text-black py-2 rounded font-semibold hover:scale-105 transition"
            >
              Login as Student
            </button>
          </>
        )}

      </div>
    </div>
  )
}