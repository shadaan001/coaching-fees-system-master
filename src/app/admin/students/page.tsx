'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Student = {
  id: string
  name: string
  phone: string
  class: string
  custom_fee?: number
}

export default function StudentsPage() {
  const router = useRouter()

  const [students, setStudents] = useState<Student[]>([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cls, setCls] = useState('')
  const [customFee, setCustomFee] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  // ✅ FETCH STUDENTS
  async function fetchStudents() {
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('name')

    setStudents(data || [])
  }

  // ✅ ADD STUDENT
  async function addStudent() {
    if (!name || !phone || !cls) {
      alert('Fill all fields')
      return
    }

    const { data: studentData, error } = await supabase
      .from('students')
      .insert([
        {
          name,
          phone,
          class: cls,
          custom_fee: customFee
            ? Number(customFee)
            : null
        }
      ])
      .select()
      .single()

    if (error || !studentData) {
      alert('Error adding student')
      return
    }

    // ✅ GET MONTHLY FEE
    let monthlyFee = 0

    if (customFee) {
      monthlyFee = Number(customFee)
    } else {
      const { data: classFee } = await supabase
        .from('class_fees')
        .select('*')
        .eq('class_name', cls)
        .single()

      monthlyFee = classFee?.monthly_fee || 0
    }

    // ✅ SESSION MONTHS
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

    // ✅ AUTO GENERATE FEES
    const feeRows = months.map((m) => ({
      student_id: studentData.id,
      month: m.month,
      year: m.year,
      amount: monthlyFee,
      status: 'pending'
    }))

    await supabase
      .from('fees')
      .insert(feeRows)

    alert('Student Added Successfully')

    resetForm()

    fetchStudents()
  }

  // ✅ START EDIT
  function startEdit(student: Student) {
    setEditingId(student.id)

    setName(student.name)
    setPhone(student.phone)
    setCls(student.class)

    setCustomFee(
      student.custom_fee
        ? String(student.custom_fee)
        : ''
    )
  }

  // ✅ UPDATE STUDENT + UPDATE FEES
  async function updateStudent() {
    if (!editingId) return

    // ✅ Update Student Table
    await supabase
      .from('students')
      .update({
        name,
        phone,
        class: cls,
        custom_fee: customFee
          ? Number(customFee)
          : null
      })
      .eq('id', editingId)

    // ✅ GET UPDATED FEE
    let updatedFee = 0

    if (customFee) {
      updatedFee = Number(customFee)
    } else {
      const { data: classFee } = await supabase
        .from('class_fees')
        .select('*')
        .eq('class_name', cls)
        .single()

      updatedFee = classFee?.monthly_fee || 0
    }

    // ✅ UPDATE ALL PENDING FEES
    await supabase
      .from('fees')
      .update({
        amount: updatedFee
      })
      .eq('student_id', editingId)
      .eq('status', 'pending')

    alert('Student Updated Successfully')

    resetForm()

    fetchStudents()
  }

  // ✅ RESET FORM
  function resetForm() {
    setEditingId(null)

    setName('')
    setPhone('')
    setCls('')
    setCustomFee('')
  }

  // ✅ DELETE STUDENT
  async function deleteStudent(id: string) {
    const confirmDelete = confirm(
      'Delete this student?'
    )

    if (!confirmDelete) return

    await supabase
      .from('fees')
      .delete()
      .eq('student_id', id)

    await supabase
      .from('students')
      .delete()
      .eq('id', id)

    fetchStudents()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">

      {/* BACK BUTTON */}
      <button
        onClick={() =>
          router.push('/admin/dashboard')
        }
        className="mb-6 bg-white/20 hover:bg-white/30 px-5 py-2 rounded-xl"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-8">
        Students
      </h1>

      {/* FORM */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-8 grid md:grid-cols-5 gap-4">

        <input
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="bg-white/20 p-3 rounded-xl outline-none"
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          className="bg-white/20 p-3 rounded-xl outline-none"
        />

        <input
          placeholder="Class"
          value={cls}
          onChange={(e) =>
            setCls(e.target.value)
          }
          className="bg-white/20 p-3 rounded-xl outline-none"
        />

        <input
          placeholder="Custom Fee (optional)"
          value={customFee}
          onChange={(e) =>
            setCustomFee(e.target.value)
          }
          className="bg-white/20 p-3 rounded-xl outline-none"
        />

        {editingId ? (
          <div className="flex gap-2">

            <button
              onClick={updateStudent}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-bold"
            >
              Save
            </button>

            <button
              onClick={resetForm}
              className="flex-1 bg-gray-500 hover:bg-gray-600 rounded-xl font-bold"
            >
              Cancel
            </button>

          </div>
        ) : (
          <button
            onClick={addStudent}
            className="bg-green-500 hover:bg-green-600 rounded-xl font-bold"
          >
            Add Student
          </button>
        )}

      </div>

      {/* STUDENT CARDS */}
      <div className="grid md:grid-cols-2 gap-6">

        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
          >
            <h2 className="text-4xl font-bold mb-4">
              {student.name}
            </h2>

            <p className="text-2xl opacity-90">
              📚 Class: {student.class}
            </p>

            <p className="text-2xl opacity-90 mt-2">
              📱 {student.phone}
            </p>

            <p className="text-2xl opacity-90 mt-2">
              💰 Fee:{' '}
              {student.custom_fee
                ? `₹${student.custom_fee}`
                : 'Default'}
            </p>

            <div className="flex gap-4 mt-6">

              <button
                onClick={() =>
                  startEdit(student)
                }
                className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-xl"
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteStudent(student.id)
                }
                className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl"
              >
                Delete
              </button>

            </div>
          </div>
        ))}

      </div>
    </div>
  )
}