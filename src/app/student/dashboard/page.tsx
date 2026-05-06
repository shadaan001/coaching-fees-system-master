'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

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

  useEffect(() => {
    async function fetchData() {
      const phone =
        localStorage.getItem('student_phone')

      if (!phone) {
        router.push('/')
        return
      }

      const { data: familyData } = await supabase
        .from('students')
        .select('*')
        .eq('phone', phone)

      setFamilyStudents(familyData || [])

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

      const { data: feesData } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentData.id)

      setFees(feesData || [])

      setLoading(false)
    }

    fetchData()
  }, [router, selectedStudentId])

  function getFee(month: string, year: string) {
    return fees.find(
      (f) =>
        f.month === month &&
        f.year === year
    )
  }

  const totalPending = fees
    .filter((f) => f.status === 'pending')
    .reduce(
      (sum, fee) => sum + fee.amount,
      0
    )

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 md:p-8 text-white">

      <div className="max-w-7xl mx-auto">

        {/* TOP SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

          {/* LEFT */}
          <div className="flex items-center gap-5">

            <Image
              src="/logo.png"
              alt="logo"
              width={90}
              height={90}
              className="rounded-3xl shadow-2xl"
            />

            <div>

              {/* SELECT STUDENT */}
              <select
                value={selectedStudentId}
                onChange={(e) =>
                  setSelectedStudentId(
                    e.target.value
                  )
                }
                className="bg-white/20 text-white px-4 py-3 rounded-2xl mb-4 backdrop-blur-xl border border-white/20 outline-none"
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

              <h1 className="text-4xl md:text-6xl font-bold">
                Welcome, {student?.name}
              </h1>

              <p className="text-white/70 text-lg mt-2">
                Student Dashboard
              </p>

            </div>

          </div>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="bg-white text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition shadow-2xl"
          >
            Logout
          </button>

        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <p className="text-white/70 mb-2">
              Class
            </p>

            <h2 className="text-4xl font-bold">
              {student?.class}
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <p className="text-white/70 mb-2">
              Phone
            </p>

            <h2 className="text-3xl font-bold">
              {student?.phone}
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <p className="text-white/70 mb-2">
              Total Pending
            </p>

            <h2 className="text-4xl font-bold text-yellow-300">
              ₹{totalPending}
            </h2>
          </div>

        </div>

        {/* FEES SECTION */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-4xl font-bold mb-8">
            Fees Status
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {months.map(({ month, year }) => {
              const fee = getFee(month, year)

              const status =
                fee?.status || 'pending'

              const amount =
                fee?.amount || 0

              return (
                <div
                  key={`${month}-${year}`}
                  className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:scale-[1.02] transition duration-300"
                >

                  <div className="flex justify-between items-center mb-5">

                    <div>

                      <h3 className="text-3xl font-bold">
                        {month}
                      </h3>

                      <p className="text-white/70 text-lg">
                        {year}
                      </p>

                    </div>

                    <div
                      className={`px-5 py-3 rounded-2xl font-bold text-sm shadow-xl ${
                        status === 'paid'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    >
                      {status.toUpperCase()}
                    </div>

                  </div>

                  <p className="text-4xl font-bold">
                    ₹{amount}
                  </p>

                </div>
              )
            })}

          </div>
        </div>

      </div>
    </div>
  )
}