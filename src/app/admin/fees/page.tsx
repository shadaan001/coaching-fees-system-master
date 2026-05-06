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
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null)

  // ✅ Fetch Data
  async function fetchData() {
    const { data: studentsData } = await supabase
      .from('students')
      .select('*')

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
      setSelectedStudent(studentsData[0])
    }
  }

  useEffect(() => {
    async function load() {
      await fetchData()
    }

    load()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-white">
        Loading...
      </div>
    )
  }

  // ✅ Get Student Fee
  function getStudentFee(student: Student) {
    if (student.custom_fee) {
      return student.custom_fee
    }

    const classFee = classFees.find(
      (f) => f.class_name === student.class
    )

    return classFee?.monthly_fee || 0
  }

  // ✅ Get Month Fee
  function getMonthFee(month: string, year: string) {
    if (!selectedStudent) return null

    return fees.find(
      (f) =>
        f.student_id === selectedStudent.id &&
        f.month === month &&
        f.year === year
    )
  }

  // ✅ Mark Paid
  async function markPaid(month: string, year: string) {
    if (!selectedStudent) return

    const existingFee = getMonthFee(month, year)

    if (existingFee) {
      await supabase
        .from('fees')
        .update({
          status: 'paid'
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

  // ✅ Mark Pending
  async function markPending(month: string, year: string) {
    if (!selectedStudent) return

    const existingFee = getMonthFee(month, year)

    if (existingFee) {
      await supabase
        .from('fees')
        .update({
          status: 'pending'
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

  // ✅ Send ALL Pending Fees
  function sendWhatsAppAllPending() {
    if (!selectedStudent) return

    const pendingFees = months
      .map(({ month, year }) => {
        const fee = getMonthFee(month, year)

        const status = fee?.status || 'pending'

        const amount =
          fee?.amount || getStudentFee(selectedStudent)

        return {
          month,
          year,
          amount,
          status
        }
      })
      .filter((f) => f.status === 'pending')

    if (pendingFees.length === 0) {
      alert('No pending fees')
      return
    }

    const total = pendingFees.reduce(
      (sum, fee) => sum + fee.amount,
      0
    )

    const feeLines = pendingFees
      .map(
        (f) =>
          `${f.month} ${f.year} - ₹${f.amount}`
      )
      .join('\n')

    const message =
      `Hello ${selectedStudent.name},\n\n` +
      `Your pending coaching fees are:\n\n` +
      `${feeLines}\n\n` +
      `Total Pending: ₹${total}\n\n` +
      `Please clear your dues.\n\n` +
      `Thank you.`

    const url =
      `https://wa.me/91${selectedStudent.phone}?text=${encodeURIComponent(message)}`

    window.open(url, '_blank')
  }

  // ✅ Send Single Month
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
      `Please clear your dues.\n\n` +
      `Thank you.`

    const url =
      `https://wa.me/91${selectedStudent.phone}?text=${encodeURIComponent(message)}`

    window.open(url, '_blank')
  }

  // ✅ Total Pending
  const totalPending = months.reduce(
    (sum, { month, year }) => {
      const fee = getMonthFee(month, year)

      if (!fee || fee.status === 'pending') {
        return (
          sum +
          (selectedStudent
            ? getStudentFee(selectedStudent)
            : 0)
        )
      }

      return sum
    },
    0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex flex-col md:flex-row">

      {/* Sidebar */}
      <div className="w-full md:w-[340px] bg-black/10 backdrop-blur-lg p-5 border-r border-white/10 overflow-x-auto md:overflow-y-auto">

        <button
          onClick={() =>
            router.push('/admin/dashboard')
          }
          className="mb-6 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>

        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Students
        </h1>

        <div className="flex md:block gap-3 md:space-y-4 overflow-x-auto">

          {students.map((student) => (
            <div
              key={student.id}
              onClick={() =>
                setSelectedStudent(student)
              }
              className={`min-w-[220px] md:min-w-0 p-5 rounded-2xl cursor-pointer transition ${
                selectedStudent?.id === student.id
                  ? 'bg-white/25'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <h2 className="text-xl md:text-2xl font-semibold">
                {student.name}
              </h2>

              <p className="text-white/80">
                Class {student.class}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 p-5 md:p-10 overflow-y-auto">

        {selectedStudent && (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-8">

              <div>
                <h1 className="text-3xl md:text-6xl font-bold mb-2">
                  {selectedStudent.name}
                </h1>

                <p className="text-xl md:text-2xl text-white/80 mb-4">
                  Class {selectedStudent.class}
                </p>

                <div className="text-2xl md:text-3xl font-bold text-yellow-300">
                  Total Pending: ₹{totalPending}
                </div>
              </div>

              <button
                onClick={sendWhatsAppAllPending}
                className="w-full lg:w-auto bg-green-500 hover:bg-green-600 px-6 py-4 rounded-2xl font-bold text-lg md:text-xl transition"
              >
                Send All Pending
              </button>
            </div>

            {/* Month Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {months.map(({ month, year }) => {
                const fee = getMonthFee(month, year)

                const status =
                  fee?.status || 'pending'

                const amount =
                  fee?.amount ||
                  getStudentFee(selectedStudent)

                return (
                  <div
                    key={`${month}-${year}`}
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10"
                  >

                    <h2 className="text-2xl md:text-4xl font-bold mb-3">
                      {month} {year}
                    </h2>

                    <p className="text-xl md:text-2xl mb-2">
                      ₹{amount}
                    </p>

                    <p
                      className={`font-bold text-lg md:text-xl mb-5 ${
                        status === 'paid'
                          ? 'text-green-300'
                          : 'text-red-300'
                      }`}
                    >
                      {status.toUpperCase()}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">

                      <button
                        onClick={() =>
                          markPaid(month, year)
                        }
                        className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl font-bold transition"
                      >
                        Paid
                      </button>

                      <button
                        onClick={() =>
                          markPending(month, year)
                        }
                        className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl font-bold transition"
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
                        className="bg-blue-500 hover:bg-blue-600 px-5 py-3 rounded-xl font-bold transition"
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