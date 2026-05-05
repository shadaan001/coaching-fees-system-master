'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useRouter } from 'next/navigation'

type Student = {
  id: string
  name: string
  phone: string
  class: string
  custom_fee: number | null
}

export default function StudentsPage() {
  const { loading } = useAdminAuth()
  const router = useRouter()

  const [students, setStudents] = useState<Student[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cls, setCls] = useState('')
  const [customFee, setCustomFee] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    const { data } = await supabase.from('students').select('*')
    setStudents(data || [])
  }

  if (loading) return <div className="p-6 text-white">Loading...</div>

  // ➕ ADD STUDENT
  async function addStudent() {
    if (!name || !phone || !cls) {
      alert('Fill all fields')
      return
    }

    await supabase.from('students').insert([
      {
        name,
        phone,
        class: cls,
        custom_fee: customFee ? Number(customFee) : null
      }
    ])

    setName('')
    setPhone('')
    setCls('')
    setCustomFee('')

    fetchStudents()
  }

  // ❌ DELETE
  async function deleteStudent(id: string) {
    if (!confirm('Delete this student?')) return

    await supabase.from('students').delete().eq('id', id)
    fetchStudents()
  }

  // ✏️ START EDIT
  function startEdit(student: Student) {
    setEditingId(student.id)
    setName(student.name)
    setPhone(student.phone)
    setCls(student.class)
    setCustomFee(student.custom_fee?.toString() || '')
  }

  // 💾 SAVE EDIT
  async function saveEdit(id: string) {
    await supabase
      .from('students')
      .update({
        name,
        phone,
        class: cls,
        custom_fee: customFee ? Number(customFee) : null
      })
      .eq('id', id)

    setEditingId(null)
    setName('')
    setPhone('')
    setCls('')
    setCustomFee('')

    fetchStudents()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">

      {/* BACK */}
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="mb-4 bg-white/20 px-3 py-1 rounded"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Students</h1>

      {/* ADD FORM */}
      <div className="bg-white/10 p-4 rounded mb-6 backdrop-blur-lg flex gap-2 flex-wrap">

        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="p-2 rounded text-black"
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="p-2 rounded text-black"
        />

        <input
          placeholder="Class"
          value={cls}
          onChange={e => setCls(e.target.value)}
          className="p-2 rounded text-black"
        />

        <input
          placeholder="Custom Fee"
          value={customFee}
          onChange={e => setCustomFee(e.target.value)}
          className="p-2 rounded text-black"
        />

        <button
          onClick={addStudent}
          className="bg-white text-black px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* STUDENTS LIST */}
      {students.map(s => (
        <div key={s.id} className="bg-white/10 p-4 rounded mb-4 backdrop-blur-lg">

          {editingId === s.id ? (
            <>
              <div className="flex gap-2 flex-wrap mb-2">

                <input value={name} onChange={e => setName(e.target.value)} className="p-2 rounded text-black" />
                <input value={phone} onChange={e => setPhone(e.target.value)} className="p-2 rounded text-black" />
                <input value={cls} onChange={e => setCls(e.target.value)} className="p-2 rounded text-black" />
                <input value={customFee} onChange={e => setCustomFee(e.target.value)} className="p-2 rounded text-black" />

              </div>

              <button
                onClick={() => saveEdit(s.id)}
                className="bg-green-500 px-3 py-1 rounded mr-2"
              >
                Save
              </button>

              <button
                onClick={() => setEditingId(null)}
                className="bg-gray-400 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="font-bold">{s.name} ({s.class})</div>
              <div>{s.phone}</div>
              <div>Fee: {s.custom_fee ? `₹${s.custom_fee}` : 'Default'}</div>

              <div className="mt-2 flex gap-2">

                <button
                  onClick={() => startEdit(s)}
                  className="bg-yellow-400 text-black px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteStudent(s.id)}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Delete
                </button>

              </div>
            </>
          )}

        </div>
      ))}

    </div>
  )
}