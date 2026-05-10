'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Student = {
  id: string
  name: string
  class: string
  phone: string
  custom_fee: number | null
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

export default function FeesPage() {

  const router = useRouter()

  const [students, setStudents] =
    useState<Student[]>([])

  const [fees, setFees] =
    useState<Fee[]>([])

  const [classFees, setClassFees] =
    useState<ClassFee[]>([])

  const [selectedClass, setSelectedClass] =
    useState('')

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null)

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

  useEffect(() => {

    fetchData()

  }, [])

  async function fetchData(
    keepStudentId?: string
  ) {

    const {
      data: studentsData
    } = await supabase
      .from('students')
      .select('*')
      .order('class')

    const {
      data: feesData
    } = await supabase
      .from('fees')
      .select('*')

    const {
      data: classFeesData
    } = await supabase
      .from('class_fees')
      .select('*')

    setStudents(studentsData || [])
    setFees(feesData || [])
    setClassFees(classFeesData || [])

    if (studentsData?.length) {

      let activeStudent = null

      if (keepStudentId) {

        activeStudent =
          studentsData.find(
            s => s.id === keepStudentId
          )

      } else if (selectedStudent) {

        activeStudent =
          studentsData.find(
            s =>
              s.id ===
              selectedStudent.id
          )

      }

      if (activeStudent) {

        setSelectedStudent(activeStudent)
        setSelectedClass(activeStudent.class)

      } else {

        setSelectedStudent(studentsData[0])
        setSelectedClass(studentsData[0].class)

      }
    }
  }

  function getStudentFee(
    student: Student
  ) {

    if (
      student.custom_fee !== null &&
      student.custom_fee !== undefined
    ) {
      return Number(student.custom_fee)
    }

    const classFee =
      classFees.find(
        f =>
          f.class_name === student.class
      )

    return classFee?.monthly_fee || 1200
  }

  function getMonthFee(
    month: string,
    year: string
  ) {

    if (!selectedStudent)
      return null

    return fees.find(
      f =>
        f.student_id ===
          selectedStudent.id &&
        f.month === month &&
        f.year === year
    )
  }

  async function markPaid(
    month: string,
    year: string
  ) {

    if (!selectedStudent)
      return

    const existing =
      getMonthFee(month, year)

    if (existing) {

      await supabase
        .from('fees')
        .update({
          status: 'paid'
        })
        .eq('id', existing.id)

    } else {

      await supabase
        .from('fees')
        .insert([
          {
            student_id:
              selectedStudent.id,
            month,
            year,
            status: 'paid'
          }
        ])
    }

    const amount =
      getStudentFee(selectedStudent)

    const message =
`Hello ${selectedStudent.name},

Your fees for ${month} ${year} has been received successfully ✅

Amount: ₹${amount}

NAS FEES RECORDS`

    const cleanPhone =
      selectedStudent.phone.replace(
        /\s+/g,
        ''
      )

    window.open(
      `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`,
      '_blank'
    )

    await fetchData(selectedStudent.id)
  }

  async function markPending(
    month: string,
    year: string
  ) {

    if (!selectedStudent)
      return

    const existing =
      getMonthFee(month, year)

    if (existing) {

      await supabase
        .from('fees')
        .update({
          status: 'pending'
        })
        .eq('id', existing.id)

    } else {

      await supabase
        .from('fees')
        .insert([
          {
            student_id:
              selectedStudent.id,
            month,
            year,
            status: 'pending'
          }
        ])
    }

    await fetchData(selectedStudent.id)
  }

  function sendSingleMonth(
    month: string,
    year: string,
    amount: number
  ) {

    if (!selectedStudent)
      return

    const message =
`Hello ${selectedStudent.name},

Your ${month} ${year} coaching fee is pending.

Amount: ₹${amount}

Please clear your dues.

NAS FEES RECORDS`

    window.open(
      `https://wa.me/91${selectedStudent.phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    )
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0033] to-[#0f001a] flex flex-col md:flex-row text-white">

      <div className="w-full md:w-80 glass p-6 border-r border-white/10 min-h-screen">

        <button
          onClick={() =>
            router.push('/admin/dashboard')
          }
          className="mb-6 glass px-5 py-3 rounded-2xl hover:bg-white/10"
        >
          ← Back to Dashboard
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Select Class
        </h2>

        <select
          value={selectedClass}
          onChange={(e) => {

            setSelectedClass(
              e.target.value
            )

            const first =
              students.find(
                s =>
                  s.class ===
                  e.target.value
              )

            setSelectedStudent(
              first || null
            )
          }}
          className="w-full glass p-4 rounded-2xl outline-none text-white"
        >

          {[...new Set(
            students.map(
              s => s.class
            )
          )].map(cls => (

            <option
              key={cls}
              value={cls}
              className="text-black"
            >
              Class {cls}
            </option>

          ))}

        </select>

        <h2 className="text-2xl font-bold mt-10 mb-4">
          Students
        </h2>

        <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">

          {students
            .filter(
              s =>
                s.class === selectedClass
            )
            .map(student => (

              <div
                key={student.id}
                onClick={() =>
                  setSelectedStudent(student)
                }
                className={`glass p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedStudent?.id === student.id
                    ? 'border border-cyan-400 bg-white/10'
                    : 'hover:bg-white/5'
                }`}
              >

                <h3 className="font-semibold">
                  {student.name}
                </h3>

                <p className="text-sm text-white/60">
                  Class {student.class}
                </p>

              </div>

            ))}

        </div>

      </div>

      <div className="flex-1 p-8">

        {selectedStudent && (

          <>

            <div className="mb-10">

              <h1 className="text-5xl font-bold">
                {selectedStudent.name}
              </h1>

              <p className="text-2xl text-cyan-400 mt-2">
                Class {selectedStudent.class}
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {visibleMonths.map(
                ({ month, year }) => {

                  const fee =
                    getMonthFee(month, year)

                  const amount =
                    getStudentFee(selectedStudent)

                  const status =
                    fee?.status || 'pending'

                  return (

                    <div
                      key={`${month}-${year}`}
                      className="glass p-8 rounded-3xl"
                    >

                      <h2 className="text-4xl font-bold">

                        {month}

                        <span className="text-xl opacity-70">
                          {' '}
                          {year}
                        </span>

                      </h2>

                      <p className="text-5xl font-bold mt-6">
                        ₹{amount}
                      </p>

                      <p className={`text-xl mt-2 font-bold ${
                        status === 'paid'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>

                        {status.toUpperCase()}

                      </p>

                      <div className="flex flex-wrap gap-3 mt-8">

                        {status !== 'paid' ? (

                          <>

                            <button
                              onClick={() =>
                                markPaid(month, year)
                              }
                              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold transition"
                            >
                              Mark Paid
                            </button>

                            <button
                              onClick={() =>
                                markPending(month, year)
                              }
                              className="flex-1 py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-bold transition"
                            >
                              Mark Pending
                            </button>

                            <button
                              onClick={() =>
                                sendSingleMonth(
                                  month,
                                  year,
                                  amount
                                )
                              }
                              className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-2xl font-bold transition"
                            >
                              Send WhatsApp
                            </button>

                          </>

                        ) : (

                          <div className="w-full py-4 bg-emerald-500/20 border border-emerald-400 text-emerald-300 rounded-2xl text-center font-bold text-lg">

                            ✅ Fee Paid Successfully

                          </div>

                        )}

                      </div>

                    </div>

                  )
                }
              )}

            </div>

          </>

        )}

      </div>

    </div>
  )
}