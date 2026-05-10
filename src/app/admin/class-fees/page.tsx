'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type ClassFee = { id: string; class_name: string; monthly_fee: number }

export default function ClassFeesPage() {
  const router = useRouter()
  const [data, setData] = useState<ClassFee[]>([])
  const [className, setClassName] = useState('')
  const [amount, setAmount] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data } = await supabase.from('class_fees').select('*')
    setData(data || [])
  }

  async function addFee() {
    if (!className || !amount) return alert('Fill all fields')
    await supabase.from('class_fees').insert([{ class_name: className, monthly_fee: Number(amount) }])
    setClassName(''); setAmount(''); fetchData()
  }

  async function updateFee(id: string) {
    await supabase.from('class_fees').update({ monthly_fee: Number(editAmount) }).eq('id', id)
    setEditingId(null); setEditAmount(''); fetchData()
  }

  async function deleteFee(id: string) {
    if (!confirm('Delete this fee?')) return
    await supabase.from('class_fees').delete().eq('id', id)
    fetchData()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0033] to-[#0f001a] p-6 text-white">
      <button onClick={() => router.push('/admin/dashboard')} className="mb-8 glass px-6 py-3 rounded-2xl hover:bg-white/10">← Back to Dashboard</button>

      <h1 className="text-5xl font-bold mb-10 neon-text">Class Fees Management</h1>

      {/* Add Form */}
      <div className="glass p-8 rounded-3xl mb-10 flex flex-wrap gap-4">
        <input placeholder="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} className="flex-1 bg-white/10 p-4 rounded-2xl outline-none border border-white/10 focus:border-cyan-400" />
        <input placeholder="Monthly Fee" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 bg-white/10 p-4 rounded-2xl outline-none border border-white/10 focus:border-cyan-400" />
        <button onClick={addFee} className="neon-button px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-bold">Add Fee</button>
      </div>

      {/* List */}
      <div className="grid gap-6">
        {data.map((f) => (
          <div key={f.id} className="glass p-8 rounded-3xl flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Class {f.class_name}</h2>
              {editingId === f.id ? (
                <div className="flex gap-4 mt-4">
                  <input value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="bg-white/10 p-3 rounded-xl w-40" />
                  <button onClick={() => updateFee(f.id)} className="bg-green-600 px-6 py-3 rounded-xl">Save</button>
                </div>
              ) : (
                <p className="text-4xl font-bold text-cyan-400 mt-2">₹{f.monthly_fee}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setEditingId(f.id); setEditAmount(String(f.monthly_fee)) }} className="glass px-6 py-3 hover:bg-yellow-500/20">Edit</button>
              <button onClick={() => deleteFee(f.id)} className="glass px-6 py-3 hover:bg-red-500/20 text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}