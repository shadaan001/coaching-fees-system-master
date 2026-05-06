'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
  year: string
  amount: number
  status: string
}

const months = [
  { month: 'April', year: '2026' },
  { month: 'May', year: '2026' },
  { month: 'June', year: '2026' },
  { month: 'July', year: '2026' },
  { month: 'August', year: '2026' },
  { month: 'September', year: '2026' },
  { month: 'October', year: '2026' },
  { month: 'November', year: '2026' },
  { month: 'December', year: '2026' },
  { month: 'January', year: '2027' },
  { month: 'February', year: '2027' },
  { month: 'March', year: '2027' }
]

export default function StudentDashboard() {
  const router = useRouter()

  const [familyStudents, setFamilyStudents] =
    useState<Student[]>([])

  const [selectedStudentId, setSelectedStudentId] =
    useState('')

  const [student, setStudent] =
    useState<Student | null>(null)

  const [fees, setFees] = useState<Fee[]>([])

  const [loading, setLoading] = useState(true)

  // ✅ LOAD FAMILY + STUDENT
  useEffect(() => {
    async function fetchData() {
      const phone =
        localStorage.getItem('student_phone')

      if (!phone) {
        router.push('/')
        return
      }

      // ✅ ALL FAMILY STUDENTS
      const { data: familyData } = await supabase
        .from('students')
        .select('*')
        .eq('phone', phone)

      setFamilyStudents(familyData || [])

      // ✅ FIRST SELECT
      let currentStudentId = selectedStudentId

      if (
        !currentStudentId &&
        familyData &&
        familyData.length > 0
      ) {
        currentStudentId = familyData[0].id

        setSelectedStudentId(currentStudentId)
      }

      if (!currentStudentId) {
        setLoading(false)
        return
      }

      // ✅ SELECTED STUDENT
      const { data: studentData, error } =
        await supabase
          .from('students')
          .select('*')
          .eq('id', currentStudentId)
          .maybeSingle()

      if (error || !studentData) {
        alert('Student not found')

        router.push('/')

        return
      }

      setStudent(studentData)

      // ✅ FEES
      const { data: feesData } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentData.id)

      setFees(feesData || [])

      setLoading(false)
    }

    fetchData()
  }, [router, selectedStudentId])

  // ✅ GET FEE
  function getFee(month: string, year: string) {
    return fees.find(
      (f) =>
        f.month === month &&
        f.year === year
    )
  }

  // ✅ TOTAL PENDING
  const totalPending = fees
    .filter((f) => f.status === 'pending')
    .reduce(
      (sum, fee) => sum + fee.amount,
      0
    )

  // ✅ LOGOUT
  function logout() {
    localStorage.removeItem('student_phone')

    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-3xl font-bold">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-6 text-white">

      {/* TOP */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

        <div>

          {/* ✅ STUDENT SELECTOR */}
          <select
            value={selectedStudentId}
            onChange={(e) =>
              setSelectedStudentId(
                e.target.value
              )
            }
            className="bg-white/20 text-white p-3 rounded-xl mb-4"
          >
            {familyStudents.map((s) => (
              <option
                key={s.id}
                value={s.id}
                className="text-black"
              >
                {s.name} - Class {s.class}
              </option>
            ))}
          </select>

          <h1 className="text-3xl md:text-5xl font-bold">
            Welcome, {student?.name}
          </h1>

          <p className="text-white/80 mt-2 text-lg">
            Student Dashboard
          </p>

        </div>

        <button
          onClick={logout}
          className="bg-white text-black px-5 py-3 rounded-2xl font-bold hover:scale-105 transition"
        >
          Logout
        </button>

      </div>

      {/* INFO */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-white/10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div>
            <p className="text-white/70 mb-1">
              Class
            </p>

            <h2 className="text-2xl font-bold">
              {student?.class}
            </h2>
          </div>

          <div>
            <p className="text-white/70 mb-1">
              Phone
            </p>

            <h2 className="text-2xl font-bold">
              {student?.phone}
            </h2>
          </div>

          <div>
            <p className="text-white/70 mb-1">
              Total Pending
            </p>

            <h2 className="text-3xl font-bold text-yellow-300">
              ₹{totalPending}
            </h2>
          </div>

        </div>
      </div>

      {/* FEES */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10">

        <h2 className="text-3xl font-bold mb-6">
          Fees Status
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {months.map(({ month, year }) => {
            const fee = getFee(month, year)

            const status =
              fee?.status || 'pending'

            const amount =
              fee?.amount || 0

            return (
              <div
                key={`${month}-${year}`}
                className="bg-white/10 rounded-2xl p-5 border border-white/10"
              >

                <div className="flex justify-between items-center mb-4">

                  <div>
                    <h3 className="text-2xl font-bold">
                      {month}
                    </h3>

                    <p className="text-white/70">
                      {year}
                    </p>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-xl font-bold ${
                      status === 'paid'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {status.toUpperCase()}
                  </div>

                </div>

                <p className="text-3xl font-bold">
                  ₹{amount}
                </p>

              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}