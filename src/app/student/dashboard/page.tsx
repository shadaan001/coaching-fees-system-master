'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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

export default function StudentDashboard() {
  const router = useRouter()

  const [student, setStudent] = useState<Student | null>(null)
  const [fees, setFees] = useState<Fee[]>([])

  // 🔹 GET PHONE FROM LOCAL STORAGE
  useEffect(() => {
    const phone = localStorage.getItem('student_phone')

    if (!phone) {
      router.push('/')
      return
    }

    async function fetchData() {
      const { data: s } = await supabase
        .from('students')
        .select('*')
        .eq('phone', phone)
        .single()

      if (!s) {
        alert('Student not found')
        router.push('/')
        return
      }

      setStudent(s)

      const { data: f } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', s.id)

      setFees(f || [])
    }

    fetchData()
  }, [])

  if (!student) {
    return <div className="p-6 text-white">Loading...</div>
  }

  const pendingTotal = fees
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">

      {/* 🔹 HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {student.name}
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem('student_phone')
            router.push('/')
          }}
          className="bg-white text-black px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* 🔹 STUDENT INFO */}
      <div className="bg-white/20 p-4 rounded-xl mb-6 backdrop-blur-md">
        <p><strong>Class:</strong> {student.class}</p>
        <p><strong>Phone:</strong> {student.phone}</p>
      </div>

      {/* 🔹 FEES TABLE */}
      <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md">
        <h2 className="mb-4 font-semibold text-lg">Fees Status</h2>

        {fees.map(f => (
          <div key={f.id} className="flex justify-between border-b py-2">
            <span>{f.month} - ₹{f.amount}</span>

            <span className={
              f.status === 'paid'
                ? 'text-green-300'
                : 'text-red-300'
            }>
              {f.status}
            </span>
          </div>
        ))}

        {/* TOTAL */}
        <div className="mt-4 text-yellow-300 font-bold">
          Total Pending: ₹{pendingTotal}
        </div>
      </div>
    </div>
  )
}