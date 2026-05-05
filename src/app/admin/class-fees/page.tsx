'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'

type ClassFee = {
  id: string
  class_name: string
  monthly_fee: number
}

export default function ClassFeesPage() {
  const { loading } = useAdminAuth()

  const [fees, setFees] = useState<ClassFee[]>([])
  const [className, setClassName] = useState('')
  const [amount, setAmount] = useState('')

  if (loading) {
    return <div className="p-6">Checking access...</div>
  }

  async function fetchFees() {
    const { data } = await supabase.from('class_fees').select('*')
    setFees(data || [])
  }

  useEffect(() => {
    fetchFees()
  }, [])

  async function addFee() {
    await supabase.from('class_fees').insert([
      {
        class_name: className,
        monthly_fee: Number(amount)
      }
    ])

    setClassName('')
    setAmount('')
    fetchFees()
  }

  async function deleteFee(id: string) {
    await supabase.from('class_fees').delete().eq('id', id)
    fetchFees()
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Class Fees</h1>

      {/* Add */}
      <div className="mb-6 flex gap-2">
        <input
          placeholder="Class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Fee"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2"
        />

        <button
          onClick={addFee}
          className="bg-blue-500 text-white px-4"
        >
          Add
        </button>
      </div>

      {/* List */}
      <ul>
        {fees.map(f => (
          <li key={f.id} className="border p-3 mb-2 flex justify-between">
            <span>
              Class {f.class_name} → ₹{f.monthly_fee}
            </span>

            <button
              onClick={() => deleteFee(f.id)}
              className="bg-red-500 text-white px-2"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

    </div>
  )
}