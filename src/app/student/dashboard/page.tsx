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
  custom_fee?: number | null
}

type Fee = {
  id: string
  student_id: string
  month: string
  year: string
  status: string
}

type ClassFee = {
  class_name: string
  monthly_fee: number
}

const allMonths = [
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

  const [fees, setFees] =
    useState<Fee[]>([])

  const [classFees, setClassFees] =
    useState<ClassFee[]>([])

  const [loading, setLoading] =
    useState(true)

  // 🔥 CURRENT MONTH SYSTEM
  const currentDate = new Date()

  const currentMonthIndex =
    currentDate.getMonth()

  const academicMonthIndex =
    currentMonthIndex >= 3
      ? currentMonthIndex - 3
      : currentMonthIndex + 9

  const visibleMonths =
    allMonths.slice(
      0,
      academicMonthIndex + 1
    )

  // 🔥 FETCH DATA
  async function fetchData(
    currentId?: string
  ) {

    const phone =
      localStorage.getItem(
        'student_phone'
      )

    if (!phone) {

      router.push('/')

      return
    }

    // 🔥 GET FAMILY STUDENTS
    const {
      data: familyData
    } = await supabase
      .from('students')
      .select('*')
      .eq('phone', phone)

    setFamilyStudents(
      familyData || []
    )

    let activeId =
      currentId || ''

    // 🔥 AUTO SELECT FIRST STUDENT
    if (
      !activeId &&
      familyData &&
      familyData.length > 0
    ) {

      activeId =
        familyData[0].id

      setSelectedStudentId(
        activeId
      )
    }

    if (!activeId) {

      setLoading(false)

      return
    }

    // 🔥 STUDENT DATA
    const {
      data: studentData
    } = await supabase
      .from('students')
      .select('*')
      .eq('id', activeId)
      .single()

    setStudent(studentData)

    // 🔥 FEES DATA
    const {
      data: feesData
    } = await supabase
      .from('fees')
      .select('*')
      .eq(
        'student_id',
        activeId
      )

    setFees(feesData || [])

    // 🔥 CLASS FEES
    const {
      data: classFeesData
    } = await supabase
      .from('class_fees')
      .select('*')

    setClassFees(
      classFeesData || []
    )

    setLoading(false)
  }

  // 🔥 FIRST LOAD FIXED
  useEffect(() => {

    async function loadData() {

      await fetchData()

    }

    loadData()

  }, [])

  // 🔥 STUDENT SWITCH FIXED
  useEffect(() => {

    if (!selectedStudentId)
      return

    async function loadStudent() {

      await fetchData(
        selectedStudentId
      )

    }

    loadStudent()

  }, [selectedStudentId])

  // 🔥 GET MONTH FEE
  function getFee(
    month: string,
    year: string
  ) {

    return fees.find(
      (f) =>
        f.month === month &&
        f.year === year
    )
  }

  // 🔥 ALWAYS LIVE FEE
  function getAmount() {

    if (!student)
      return 1200

    if (
      student.custom_fee !== null &&
      student.custom_fee !== undefined
    ) {

      return Number(
        student.custom_fee
      )
    }

    const classFee =
      classFees.find(
        (c) =>
          c.class_name ===
          student.class
      )

    return (
      classFee?.monthly_fee ||
      1200
    )
  }

  // 🔥 TOTAL PENDING
  const totalPending =
    student
      ? visibleMonths.reduce(
          (
            sum,
            {
              month,
              year
            }
          ) => {

            const fee =
              getFee(
                month,
                year
              )

            const amount =
              getAmount()

            if (
              !fee ||
              fee.status ===
                'pending'
            ) {

              return (
                sum +
                amount
              )
            }

            return sum

          },
          0
        )
      : 0

  function logout() {

    localStorage.removeItem(
      'student_phone'
    )

    router.push('/')
  }

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-cyan-400 bg-black">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0033] to-[#0f001a] p-6 md:p-8 text-white">

      <div className="max-w-7xl mx-auto">

        {/* TOP */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">

          <div className="flex items-center gap-6">

            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-600 p-1 shadow-xl">

              <Image
                src="/logo.png"
                alt="logo"
                width={100}
                height={100}
                className="rounded-2xl"
              />

            </div>

            <div>

              {/* 🔥 FAMILY STUDENT SWITCH */}
              <select
                value={
                  selectedStudentId
                }
                onChange={(e) =>
                  setSelectedStudentId(
                    e.target.value
                  )
                }
                className="glass px-6 py-3 rounded-2xl text-xl outline-none text-black font-medium bg-white"
              >

                {familyStudents.map(
                  (s) => (
                    <option
                      key={s.id}
                      value={s.id}
                    >
                      {s.name} — Class {s.class}
                    </option>
                  )
                )}

              </select>

              <h1 className="text-5xl md:text-6xl font-bold mt-4 neon-text tracking-tight">

                Welcome{' '}

                <span className="text-cyan-400">
                  {student?.name}
                </span>

              </h1>

            </div>

          </div>

          <button
            onClick={logout}
            className="glass px-8 py-4 rounded-2xl text-lg hover:bg-red-500/20 transition"
          >
            Logout
          </button>

        </div>

        {/* INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          <div className="glass p-8 rounded-3xl">

            <p className="text-white/60 text-lg">
              Class
            </p>

            <p className="text-5xl font-bold mt-3">
              {student?.class}
            </p>

          </div>

          <div className="glass p-8 rounded-3xl">

            <p className="text-white/60 text-lg">
              Phone
            </p>

            <p className="text-4xl font-bold mt-3">
              {student?.phone}
            </p>

          </div>

          <div className="glass p-8 rounded-3xl">

            <p className="text-white/60 text-lg">
              Total Pending
            </p>

            <p className="text-5xl font-bold text-yellow-300 mt-3">
              ₹{totalPending}
            </p>

          </div>

        </div>

        {/* FEES */}
        <div className="glass p-10 rounded-3xl">

          <h2 className="text-4xl font-bold mb-10">
            Fee Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {visibleMonths.map(
              ({
                month,
                year
              }) => {

                const fee =
                  getFee(
                    month,
                    year
                  )

                const status =
                  fee?.status ||
                  'pending'

                const amount =
                  getAmount()

                return (

                  <div
                    key={`${month}-${year}`}
                    className="glass p-8 rounded-3xl border border-white/10"
                  >

                    <div className="flex justify-between items-start">

                      <div>

                        <h3 className="text-3xl font-bold">
                          {month}
                        </h3>

                        <p className="text-lg opacity-70">
                          {year}
                        </p>

                      </div>

                      <div
                        className={`px-5 py-2 rounded-full text-sm font-bold ${
                          status === 'paid'
                            ? 'bg-emerald-500'
                            : 'bg-red-500'
                        }`}
                      >
                        {status.toUpperCase()}
                      </div>

                    </div>

                    <p className="text-5xl font-bold mt-8">
                      ₹{amount}
                    </p>

                  </div>

                )
              }
            )}

          </div>

        </div>

      </div>

    </div>
  )
}