'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'

type Student = {
  id: string
  name: string
  class: string
  phone: string
  custom_fee: number | null
}

type ClassFee = {
  class_name: string
  monthly_fee: number
}

type Fee = {
  id: string
  student_id: string
  month: string
  amount: number
  status: string
}

export default function FeesPage() {

  // ✅ CORRECT PLACE
  const { loading } = useAdminAuth()

  const [students, setStudents] = useState<Student[]>([])
  const [classFees, setClassFees] = useState<ClassFee[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [month, setMonth] = useState('')

  if (loading) {
    return <div className="p-6">Checking access...</div>
  }

  async function fetchData() {
    const { data: studentsData } = await supabase.from('students').select('*')
    const { data: classData } = await supabase.from('class_fees').select('*')
    const { data: feesData } = await supabase.from('fees').select('*')

    setStudents(studentsData || [])
    setClassFees(classData || [])
    setFees(feesData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  function getClassFee(className: string) {
    return classFees.find(f => f.class_name === className)?.monthly_fee || 0
  }

  function getFinalFee(student: Student) {
    return student.custom_fee ?? getClassFee(student.class)
  }

  async function generateFees() {
    if (!month) {
      alert('Enter month')
      return
    }

    const records = students.map(student => ({
      student_id: student.id,
      month,
      amount: getFinalFee(student),
      status: 'pending'
    }))

    await supabase.from('fees').insert(records)
    fetchData()
  }

  async function markPaid(id: string) {
    await supabase.from('fees').update({ status: 'paid' }).eq('id', id)
    fetchData()
  }

  function sendWhatsApp(student: Student, studentFees: Fee[]) {
    const pending = studentFees.filter(f => f.status === 'pending')

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fees System</h1>

      <div className="mb-6 flex gap-2">
        <input
          placeholder="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2"
        />

        <button
          onClick={generateFees}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Generate Fees
        </button>
      </div>

      <ul>
        {students.map(student => {
          const studentFees = fees.filter(f => f.student_id === student.id)
          const pendingFees = studentFees.filter(f => f.status === 'pending')

          return (
            <li key={student.id} className="border p-4 mb-4 rounded">
              <div className="flex justify-between">
                <span>{student.name}</span>

                <button
                  onClick={() => sendWhatsApp(student, studentFees)}
                  className="bg-green-500 text-white px-2"
                >
                  WhatsApp
                </button>
              </div>

              {studentFees.map(f => (
                <div key={f.id} className="flex justify-between mt-2">
                  <span>{f.month} - ₹{f.amount}</span>

                  {f.status === 'pending' && (
                    <button
                      onClick={() => markPaid(f.id)}
                      className="bg-blue-500 text-white px-2"
                    >
                      Paid
                    </button>
                  )}
                </div>
              ))}

              {pendingFees.length > 0 && (
                <div className="text-red-500 mt-2">
                  Total: ₹{pendingFees.reduce((s, p) => s + p.amount, 0)}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}