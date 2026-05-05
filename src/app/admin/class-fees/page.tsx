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

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('class_fees').select('*')
      setData(data || [])
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-6 text-white">Loading...</div>

  async function addFee() {
    if (!className || !amount) {
      alert('Fill all fields')
      return
    }

    await supabase.from('class_fees').insert([
      { class_name: className, monthly_fee: Number(amount) }
    ])

    setClassName('')
    setAmount('')

    const { data } = await supabase.from('class_fees').select('*')
    setData(data || [])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">

      <button onClick={() => router.push('/admin/dashboard')} className="mb-4 bg-white/20 px-3 py-1 rounded">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Class Fees</h1>

      <div className="bg-white/10 p-4 rounded mb-6 backdrop-blur-lg flex gap-2">

        <input
          placeholder="Class"
          value={className}
          onChange={e => setClassName(e.target.value)}
          className="p-2 rounded text-black"
        />

        <input
          placeholder="Fee"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="p-2 rounded text-black"
        />

        <button onClick={addFee} className="bg-white text-black px-4 rounded">
          Add
        </button>
      </div>

      {data.map(f => (
        <div key={f.id} className="bg-white/10 p-4 rounded mb-2 backdrop-blur-lg">
          Class {f.class_name} → ₹{f.monthly_fee}
        </div>
      ))}
    </div>
  )
}