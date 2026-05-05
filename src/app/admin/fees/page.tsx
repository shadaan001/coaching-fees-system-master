'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useRouter } from 'next/navigation'

type Student = {
  id: string
  name: string
  class: string
  phone: string
}

type Fee = {
  id: string
  student_id: string
  month: string
  amount: number
  status: string
}

export default function FeesPage() {
  const { loading } = useAdminAuth()
  const router = useRouter()

  const [students, setStudents] = useState<Student[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: s } = await supabase.from('students').select('*')
    const { data: f } = await supabase.from('fees').select('*')

    setStudents(s || [])
    setFees(f || [])
  }

  if (loading) return <div className="p-6 text-white">Loading...</div>

  function getStudentFees(studentId: string) {
    return fees.filter(f => f.student_id === studentId)
  }

  function sendWhatsApp(student: Student) {
    const pending = getStudentFees(student.id).filter(f => f.status === 'pending')

    if (pending.length === 0) {
      alert('No pending fees')
      return
    }

    const message = `Hello ${student.name},

Your pending fees:

${pending.map(p => `${p.month}: ₹${p.amount}`).join('\n')}

Total: ₹${pending.reduce((sum, p) => sum + p.amount, 0)}

Please clear your dues.`

    const url = `https://wa.me/91${student.phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  async function markPaid(id: string) {
    await supabase.from('fees').update({ status: 'paid' }).eq('id', id)
    fetchData()
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">

      {/* SIDEBAR */}
      <div className="w-1/4 bg-white/10 p-4 backdrop-blur-lg">

        <button
          onClick={() => router.push('/admin/dashboard')}
          className="mb-4 bg-white/20 px-3 py-1 rounded"
        >
          ← Back
        </button>

        <h2 className="font-bold mb-4">Students</h2>

        {students.map(s => (
          <div
            key={s.id}
            onClick={() => setSelectedStudent(s)}
            className={`p-2 mb-2 rounded cursor-pointer ${
              selectedStudent?.id === s.id ? 'bg-white/30' : 'bg-white/10'
            }`}
          >
            {s.name}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 p-6">

        {!selectedStudent ? (
          <div>Select a student 👈</div>
        ) : (
          <div>

            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">
                {selectedStudent.name} (Class {selectedStudent.class})
              </h1>

              <button
                onClick={() => sendWhatsApp(selectedStudent)}
                className="bg-green-500 px-3 py-1 rounded"
              >
                WhatsApp
              </button>
            </div>

            {/* FEES LIST */}
            {getStudentFees(selectedStudent.id).map(f => (
              <div key={f.id} className="flex justify-between bg-white/10 p-3 rounded mb-2">

                <span>
                  {f.month} - ₹{f.amount} - {f.status}
                </span>

                {f.status === 'pending' && (
                  <button
                    onClick={() => markPaid(f.id)}
                    className="bg-blue-500 px-2 rounded"
                  >
                    Paid
                  </button>
                )}

              </div>
            ))}

            {/* TOTAL */}
            <div className="mt-4 text-red-300 font-semibold">
              Total Pending: ₹{
                getStudentFees(selectedStudent.id)
                  .filter(f => f.status === 'pending')
                  .reduce((sum, f) => sum + f.amount, 0)
              }
            </div>

          </div>
        )}

      </div>
    </div>
  )
}