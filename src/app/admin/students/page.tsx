'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'

type Student = {
  id: string
  name: string
  phone: string
  class: string
  custom_fee: number | null
}

export default function StudentsPage() {
  const { loading } = useAdminAuth()

  const [students, setStudents] = useState<Student[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [customFee, setCustomFee] = useState('')

  if (loading) {
    return <div className="p-6">Checking access...</div>
  }

  async function fetchStudents() {
    const { data } = await supabase.from('students').select('*')
    setStudents(data || [])
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  async function addStudent() {
    await supabase.from('students').insert([
      {
        name,
        phone,
        class: studentClass,
        custom_fee: customFee ? Number(customFee) : null
      }
    ])

    setName('')
    setPhone('')
    setStudentClass('')
    setCustomFee('')
    fetchStudents()
  }

  async function deleteStudent(id: string) {
    await supabase.from('students').delete().eq('id', id)
    fetchStudents()
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Students</h1>

      {/* Add Student */}
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Class"
          value={studentClass}
          onChange={(e) => setStudentClass(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Custom Fee (optional)"
          value={customFee}
          onChange={(e) => setCustomFee(e.target.value)}
          className="border p-2"
        />

        <button
          onClick={addStudent}
          className="bg-blue-500 text-white px-4"
        >
          Add
        </button>
      </div>

      {/* List */}
      <ul>
        {students.map(s => (
          <li key={s.id} className="border p-3 mb-2 flex justify-between">
            <span>
              {s.name} - {s.class} - {s.phone}
              <br />
              Fee: {s.custom_fee ? `₹${s.custom_fee}` : 'Default'}
            </span>

            <button
              onClick={() => deleteStudent(s.id)}
              className="bg-red-500 text-white px-2"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

    </div>
  )
}