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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
    router.push('/admin/dashboard')
  }

  async function handleStudentLogin() {
    const { data } = await supabase.from('students').select('*').eq('phone', phone)
    if (!data || data.length === 0) return alert('Student not found')
    localStorage.setItem('student_phone', phone)
    router.push('/student/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a0033] to-[#0f001a] p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="glass w-full max-w-md p-10 rounded-3xl relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-1 mb-6 shadow-2xl">
            <img src="/logo.png" alt="logo" className="rounded-2xl" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter neon-text">NAS FEES</h1>
          <p className="text-cyan-400 mt-2">Institute Management System</p>
        </div>

        <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
          <button onClick={() => setRole('admin')} className={`flex-1 py-4 rounded-xl font-semibold transition-all ${role === 'admin' ? 'bg-white text-black shadow-xl' : 'text-white/70'}`}>Admin</button>
          <button onClick={() => setRole('student')} className={`flex-1 py-4 rounded-xl font-semibold transition-all ${role === 'student' ? 'bg-white text-black shadow-xl' : 'text-white/70'}`}>Student</button>
        </div>

        {role === 'admin' && (
          <div className="space-y-5">
            <input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400 outline-none transition" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400 outline-none transition" />
            <button onClick={handleAdminLogin} className="neon-button w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-lg hover:scale-105 transition">Login as Admin</button>
          </div>
        )}

        {role === 'student' && (
          <div className="space-y-5">
            <input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400 outline-none transition" />
            <button onClick={handleStudentLogin} className="neon-button w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-lg hover:scale-105 transition">Login as Student</button>
          </div>
        )}
      </div>
    </div>
  )
}