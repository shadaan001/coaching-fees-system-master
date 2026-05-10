'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Student = {
  id: string
  name: string
  phone: string
  class: string
  custom_fee?: number | null
}

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cls, setCls] = useState('')
  const [customFee, setCustomFee] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => { fetchStudents() }, [])

  async function fetchStudents() {
    const { data } = await supabase.from('students').select('*').order('name')
    setStudents(data || [])
  }

  async function addStudent() {
    if (!name || !phone || !cls) return alert('Fill all fields')
    const { data: studentData } = await supabase.from('students').insert([{ name, phone, class: cls, custom_fee: customFee ? Number(customFee) : null }]).select().single()

    if (studentData) {
      // Auto generate fees (same logic as before)
      const monthlyFee = customFee ? Number(customFee) : 1200
      const months = ["April","May","June","July","August","September","October","November","December","January","February","March"].map((m,i) => ({
        student_id: studentData.id,
        month: m,
        year: i < 9 ? "2026" : "2027",
        amount: monthlyFee,
        status: 'pending'
      }))

      await supabase.from('fees').insert(months)
      alert('Student Added Successfully')
    }

    resetForm()
    fetchStudents()
  }

  function startEdit(student: Student) {
    setEditingId(student.id)
    setName(student.name)
    setPhone(student.phone)
    setCls(student.class)
    setCustomFee(student.custom_fee ? String(student.custom_fee) : '')
  }

  async function updateStudent() {
    if (!editingId) return
    await supabase.from('students').update({ name, phone, class: cls, custom_fee: customFee ? Number(customFee) : null }).eq('id', editingId)
    alert('Student Updated')
    resetForm()
    fetchStudents()
  }

  function resetForm() {
    setEditingId(null)
    setName(''); setPhone(''); setCls(''); setCustomFee('')
  }

  async function deleteStudent(id: string) {
    if (!confirm('Delete student?')) return
    await supabase.from('fees').delete().eq('student_id', id)
    await supabase.from('students').delete().eq('id', id)
    fetchStudents()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0033] to-[#0f001a] p-6 text-white">
      <button onClick={() => router.push('/admin/dashboard')} className="mb-8 glass px-6 py-3 rounded-2xl hover:bg-white/10">← Back to Dashboard</button>

      <h1 className="text-5xl font-bold mb-10 neon-text">Students Management</h1>

      {/* Add/Edit Form */}
      <div className="glass p-8 rounded-3xl mb-12 grid md:grid-cols-5 gap-4">
        <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="bg-white/10 p-4 rounded-2xl outline-none border border-white/10 focus:border-cyan-400" />
        <input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="bg-white/10 p-4 rounded-2xl outline-none border border-white/10 focus:border-cyan-400" />
        <input placeholder="Class" value={cls} onChange={e => setCls(e.target.value)} className="bg-white/10 p-4 rounded-2xl outline-none border border-white/10 focus:border-cyan-400" />
        <input placeholder="Custom Fee (Optional)" value={customFee} onChange={e => setCustomFee(e.target.value)} className="bg-white/10 p-4 rounded-2xl outline-none border border-white/10 focus:border-cyan-400" />

        {editingId ? (
          <div className="flex gap-3">
            <button onClick={updateStudent} className="neon-button flex-1 bg-yellow-500 text-black py-4 rounded-2xl font-bold">Save Changes</button>
            <button onClick={resetForm} className="glass flex-1 py-4 rounded-2xl">Cancel</button>
          </div>
        ) : (
          <button onClick={addStudent} className="neon-button bg-gradient-to-r from-green-500 to-emerald-600 py-4 rounded-2xl font-bold">Add Student</button>
        )}
      </div>

      {/* Students Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(student => (
          <div key={student.id} className="glass p-8 rounded-3xl card-hover">
            <h2 className="text-3xl font-bold mb-4">{student.name}</h2>
            <p className="text-xl text-cyan-400">Class {student.class}</p>
            <p className="text-lg mt-2 opacity-90">📱 {student.phone}</p>
            <p className="text-lg mt-1">💰 ₹{student.custom_fee || 'Default'}</p>

            <div className="flex gap-4 mt-8">
              <button onClick={() => startEdit(student)} className="flex-1 glass py-3 rounded-2xl hover:bg-blue-500/20">Edit</button>
              <button onClick={() => deleteStudent(student.id)} className="flex-1 glass py-3 rounded-2xl hover:bg-red-500/20 text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}