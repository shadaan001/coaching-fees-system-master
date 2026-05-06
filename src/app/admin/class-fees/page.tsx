'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useRouter } from 'next/navigation'

type ClassFee = {
  id: string
  class_name: string
  monthly_fee: number
}

export default function ClassFeesPage() {
  const { loading } = useAdminAuth()
  const router = useRouter()

  const [data, setData] = useState<ClassFee[]>([])
  const [className, setClassName] = useState('')
  const [amount, setAmount] = useState('')

  // ✏️ edit states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data } = await supabase
      .from('class_fees')
      .select('*')

    setData(data || [])
  }

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  // ➕ Add fee
  async function addFee() {
    if (!className || !amount) {
      alert('Fill all fields')
      return
    }

    await supabase.from('class_fees').insert([
      {
        class_name: className,
        monthly_fee: Number(amount)
      }
    ])

    setClassName('')
    setAmount('')

    fetchData()
  }

  // ✏️ Update fee
  async function updateFee(id: string) {
    await supabase
      .from('class_fees')
      .update({
        monthly_fee: Number(editAmount)
      })
      .eq('id', id)

    setEditingId(null)
    setEditAmount('')

    fetchData()
  }

  // ❌ Delete fee
  async function deleteFee(id: string) {
    const confirmDelete = confirm('Delete this class fee?')

    if (!confirmDelete) return

    await supabase
      .from('class_fees')
      .delete()
      .eq('id', id)

    fetchData()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">

      {/* 🔙 Back */}
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="mb-6 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl backdrop-blur-md transition"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-8">
        Class Fees
      </h1>

      {/* ➕ Add Form */}
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl mb-8 flex flex-wrap gap-4">

        <input
          placeholder="Class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="bg-white/20 p-3 rounded-xl outline-none placeholder-white"
        />

        <input
          placeholder="Fee"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-white/20 p-3 rounded-xl outline-none placeholder-white"
        />

        <button
          onClick={addFee}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition"
        >
          Add
        </button>

      </div>

      {/* 📋 Fee Cards */}
      <div className="grid gap-4">

        {data.map((f) => (
          <div
            key={f.id}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl flex items-center justify-between"
          >

            {/* LEFT */}
            <div>

              <h2 className="text-2xl font-bold">
                Class {f.class_name}
              </h2>

              {editingId === f.id ? (
                <div className="flex gap-2 mt-3">

                  <input
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="bg-white/20 p-2 rounded-lg outline-none"
                  />

                  <button
                    onClick={() => updateFee(f.id)}
                    className="bg-green-500 px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>

                </div>
              ) : (
                <p className="text-xl mt-2">
                  ₹{f.monthly_fee}
                </p>
              )}

            </div>

            {/* RIGHT BUTTONS */}
            <div className="flex gap-3">

              <button
                onClick={() => {
                  setEditingId(f.id)
                  setEditAmount(String(f.monthly_fee))
                }}
                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-xl font-semibold transition"
              >
                Edit
              </button>

              <button
                onClick={() => deleteFee(f.id)}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-semibold transition"
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