'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentLogin() {
  const [phone, setPhone] = useState('')
  const router = useRouter()

  function handleLogin() {
    if (!phone) {
      alert('Enter phone number')
      return
    }

    localStorage.setItem('studentPhone', phone)
    router.push('/student/dashboard')
  }

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-r from-green-500 to-teal-600">

      <div className="bg-white p-8 rounded-xl shadow-lg w-80">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Student Login
        </h2>

        <input
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-3 w-full mb-4 rounded"
        />

        <button
          onClick={handleLogin}
          className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
        >
          Login
        </button>

      </div>

    </div>
  )
}