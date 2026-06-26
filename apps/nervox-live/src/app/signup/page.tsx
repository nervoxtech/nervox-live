'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken'
type FormStatus = 'idle' | 'loading' | 'error'

export default function Signup() {
  const router = useRouter()
  const lastCheckedUsername = useRef('')

  const [form, setForm] = useState({
    name: '',
    username: '',
    user_type: 'individual',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
  })

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'username' && value !== lastCheckedUsername.current) {
      setUsernameStatus('idle')
    }
  }

  const checkUsername = async () => {
    const username = form.username.trim()
    if (!username || username.length < 3) return
    if (username === lastCheckedUsername.current) return
    lastCheckedUsername.current = username
    setUsernameStatus('checking')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/username/check/${username}`
      )
      const data = await res.json()
      setUsernameStatus(data.available ? 'available' : 'taken')
    } catch {
      setUsernameStatus('idle')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (form.password !== form.confirm_password) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (usernameStatus === 'taken') {
      setErrorMessage('Username is already taken. Try another.')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            username: form.username,
            user_type: form.user_type,
            email: form.email,
            mobile: form.mobile,
            password: form.password,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }

      localStorage.setItem('nervox_token', data.token)
      localStorage.setItem('nervox_username', data.user.username)

      router.push('/dashboard')
    } catch {
      setErrorMessage('Unable to connect. Please try again.')
      setStatus('error')
    }
  }

  const inputClass = 'w-full bg-white border border-[#CBD5E1] text-[#0A0F1E] placeholder-[#94A3B8] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0EA5E9] transition-colors duration-200 font-[Inter,sans-serif]'

  return (
    <main className="min-h-screen bg-white text-[#0A0F1E] flex flex-col">

      {/* Background dot grid */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle, #E2E8F0 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.6,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 py-10 sm:px-8 md:px-16 lg:px-32">

        {/* Logo */}
        <header className="flex justify-center">
          <Link href="/">
            <Image
              src="/logo.jpg"
              alt="NerVox"
              width={160}
              height={160}
              className="h-16 w-auto"
              priority
            />
          </Link>
        </header>

        {/* Form */}
        <section className="flex-1 flex flex-col items-center justify-center py-10">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl px-6 py-10 sm:px-10 shadow-sm">

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-[Space_Grotesk,sans-serif]">
                Create your account
              </h1>
              <p className="text-[#64748B] text-sm mt-2 font-[Inter,sans-serif]">
                Join NerVox and connect your world.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your / Organisation Name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">
                  Username
                </label>
                <div className="flex border border-[#CBD5E1] rounded-lg overflow-hidden focus-within:border-[#0EA5E9] transition-colors duration-200">
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="username"
                    value={form.username}
                    onChange={handleChange}
                    onBlur={checkUsername}
                    className="flex-1 min-w-0 bg-white text-[#0A0F1E] placeholder-[#94A3B8] px-4 py-3 text-sm focus:outline-none font-[Inter,sans-serif]"
                  />
                  <span className="bg-[#F8FAFC] border-l border-[#CBD5E1] px-2 sm:px-3 flex items-center text-[#94A3B8] text-xs sm:text-sm font-[Inter,sans-serif] whitespace-nowrap shrink-0">
                    @nervox.live
                  </span>
                </div>
                {usernameStatus === 'checking' && (
                  <p className="text-[#64748B] text-xs mt-1 font-[Inter,sans-serif]">Checking availability...</p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-green-500 text-xs mt-1 font-[Inter,sans-serif]">Username is available.</p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-red-400 text-xs mt-1 font-[Inter,sans-serif]">Username already taken. Try another.</p>
                )}
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">
                  Account Type
                </label>
                <select
                  name="user_type"
                  value={form.user_type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="individual">Individual</option>
                  <option value="organisation">Organisation</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">
                  Mobile
                </label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  placeholder="10-digit mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  placeholder="Repeat your password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Error */}
              {errorMessage && (
                <p className="text-red-400 text-sm font-[Inter,sans-serif]">
                  {errorMessage}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-[Inter,sans-serif] mt-2"
              >
                {status === 'loading' ? 'Creating account...' : 'Create Account'}
              </button>

              {/* Login link */}
              <p className="text-center text-sm text-[#64748B] font-[Inter,sans-serif]">
                Already have an account?{' '}
                <Link href="/login" className="text-[#0EA5E9] hover:underline">
                  Log in
                </Link>
              </p>

            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#E2E8F0] pt-6">
          <p className="text-[#94A3B8] text-sm text-center font-[Inter,sans-serif]">
            © 2026 NerVox. All rights reserved.
          </p>
        </footer>

      </div>
    </main>
  )
}