'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">

      <h1 className="text-4xl font-bold mb-6">
        Coaching Fees Management
      </h1>

      <p className="mb-10 text-gray-600">
        Manage student fees, track payments, and send reminders
      </p>

      <div className="flex gap-6">
        <Link href="/admin/login">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Admin Login
          </button>
        </Link>

        <Link href="/student/login">
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg">
            Student Login
          </button>
        </Link>
      </div>

    </div>
  )
}