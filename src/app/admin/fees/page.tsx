'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'

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
  amount: number
  status: string
}

type ClassFee = {
  class_name: string
  monthly_fee: number
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

export default function FeesPage() {
  const { loading } = useAdminAuth()
  const router = useRouter()

  const [students, setStudents] = useState<Student[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [classFees, setClassFees] = useState<ClassFee[]>([])

  const [selectedClass, setSelectedClass] =
    useState('')

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null)

  async function fetchData() {
    const { data: studentsData } = await supabase
      .from('students')
      .select('*')
      .order('class', { ascending: true })

    const { data: feesData } = await supabase
      .from('fees')
      .select('*')

    const { data: classFeesData } = await supabase
      .from('class_fees')
      .select('*')

    setStudents(studentsData || [])
    setFees(feesData || [])
    setClassFees(classFeesData || [])

    if (studentsData && studentsData.length > 0) {
      const firstClass = studentsData[0].class

      setSelectedClass(firstClass)

      const firstStudent = studentsData.find(
        (s) => s.class === firstClass
      )

      setSelectedStudent(firstStudent || null)
    }
  }

  useEffect(() => {
    async function loadData() {
      await fetchData()
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-white">
        Loading...
      </div>
    )
  }

  const uniqueClasses = [
    ...new Set(students.map((s) => s.class))
  ]

  const filteredStudents = students.filter(
    (s) => s.class === selectedClass
  )

  function getStudentFee(student: Student) {
    if (student.custom_fee) {
      return student.custom_fee
    }

    const classFee = classFees.find(
      (f) => f.class_name === student.class
    )

    return classFee?.monthly_fee || 0
  }

  function getMonthFee(month: string, year: string) {
    if (!selectedStudent) return null

    return fees.find(
      (f) =>
        f.student_id === selectedStudent.id &&
        f.month === month &&
        f.year === year
    )
  }

  async function markPaid(month: string, year: string) {
    if (!selectedStudent) return

    const existingFee = getMonthFee(month, year)

    if (existingFee) {
      await supabase
        .from('fees')
        .update({
          status: 'paid',
          amount: getStudentFee(selectedStudent)
        })
        .eq('id', existingFee.id)
    } else {
      await supabase.from('fees').insert([
        {
          student_id: selectedStudent.id,
          month,
          year,
          amount: getStudentFee(selectedStudent),
          status: 'paid'
        }
      ])
    }

    fetchData()
  }

  async function markPending(
    month: string,
    year: string
  ) {
    if (!selectedStudent) return

    const existingFee = getMonthFee(month, year)

    if (existingFee) {
      await supabase
        .from('fees')
        .update({
          status: 'pending',
          amount: getStudentFee(selectedStudent)
        })
        .eq('id', existingFee.id)
    } else {
      await supabase.from('fees').insert([
        {
          student_id: selectedStudent.id,
          month,
          year,
          amount: getStudentFee(selectedStudent),
          status: 'pending'
        }
      ])
    }

    fetchData()
  }

  function sendSingleMonth(
    month: string,
    year: string,
    amount: number
  ) {
    if (!selectedStudent) return

    const message =
      `Hello ${selectedStudent.name},\n\n` +
      `Your ${month} ${year} coaching fee is pending.\n\n` +
      `Amount: ₹${amount}\n\n` +
      `Please clear your dues.`

    const url =
      `https://wa.me/91${selectedStudent.phone}?text=${encodeURIComponent(message)}`

    window.open(url, '_blank')
  }

  const totalPending = selectedStudent
    ? months.reduce(
        (sum, { month, year }) => {
          const fee = getMonthFee(month, year)

          const amount =
            fee?.amount ||
            getStudentFee(selectedStudent)

          if (!fee || fee.status === 'pending') {
            return sum + amount
          }

          return sum
        },
        0
      )
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex flex-col md:flex-row">

      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-[300px] bg-black/10 backdrop-blur-lg border-r border-white/10 p-4">

        <button
          onClick={() =>
            router.push('/admin/dashboard')
          }
          className="mb-5 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm"
        >
          ← Back
        </button>

        {/* CLASS DROPDOWN */}
        <div className="mb-6">

          <label className="block text-sm mb-2 text-white/70">
            Select Class
          </label>

          <select
            value={selectedClass}
            onChange={(e) => {
              const cls = e.target.value

              setSelectedClass(cls)

              const firstStudent =
                students.find(
                  (s) => s.class === cls
                )

              setSelectedStudent(
                firstStudent || null
              )
            }}
            className="w-full bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl p-3 text-white outline-none"
          >
            {uniqueClasses.map((cls) => (
              <option
                key={cls}
                value={cls}
                className="text-black"
              >
                Class {cls}
              </option>
            ))}
          </select>
        </div>

        {/* STUDENTS */}
        <h1 className="text-xl font-bold mb-3">
          Students
        </h1>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">

          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() =>
                setSelectedStudent(student)
              }
              className={`p-3 rounded-xl cursor-pointer transition ${
                selectedStudent?.id === student.id
                  ? 'bg-white/25'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <h2 className="text-lg font-semibold">
                {student.name}
              </h2>

              <p className="text-sm text-white/70">
                Class {student.class}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 p-4 md:p-8">

        {selectedStudent && (
          <>
            <div className="mb-8">

              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                {selectedStudent.name}
              </h1>

              <p className="text-lg text-white/80 mb-3">
                Class {selectedStudent.class}
              </p>

              <div className="text-2xl font-bold text-yellow-300">
                Total Pending: ₹{totalPending}
              </div>
            </div>

            {/* MONTH CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {months.map(({ month, year }) => {
                const fee = getMonthFee(
                  month,
                  year
                )

                const status =
                  fee?.status || 'pending'

                const amount =
                  fee?.amount ||
                  getStudentFee(selectedStudent)

                return (
                  <div
                    key={`${month}-${year}`}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10"
                  >

                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      {month}
                    </h2>

                    <p className="text-sm text-white/60 mb-2">
                      {year}
                    </p>

                    <p className="text-2xl font-bold mb-2">
                      ₹{amount}
                    </p>

                    <p
                      className={`font-bold mb-4 ${
                        status === 'paid'
                          ? 'text-green-300'
                          : 'text-red-300'
                      }`}
                    >
                      {status.toUpperCase()}
                    </p>

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          markPaid(month, year)
                        }
                        className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg text-sm font-bold"
                      >
                        Paid
                      </button>

                      <button
                        onClick={() =>
                          markPending(month, year)
                        }
                        className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-bold"
                      >
                        Pending
                      </button>

                      <button
                        onClick={() =>
                          sendSingleMonth(
                            month,
                            year,
                            amount
                          )
                        }
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg text-sm font-bold"
                      >
                        WhatsApp
                      </button>

                    </div>
                  </div>
                )
              })}

            </div>
          </>
        )}
      </div>
    </div>
  )
}