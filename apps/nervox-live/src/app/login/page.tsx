'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type FormStatus = 'idle' | 'loading' | 'error'

export default function Login() {
  const router = useRouter()

  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setStatus('loading')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid username or password.')
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
                Welcome back
              </h1>
              <p className="text-[#64748B] text-sm mt-2 font-[Inter,sans-serif]">
                Log in to your NerVox account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

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
                    className="flex-1 min-w-0 bg-white text-[#0A0F1E] placeholder-[#94A3B8] px-4 py-3 text-sm focus:outline-none font-[Inter,sans-serif]"
                  />
                  <span className="bg-[#F8FAFC] border-l border-[#CBD5E1] px-2 sm:px-3 flex items-center text-[#94A3B8] text-xs sm:text-sm font-[Inter,sans-serif] whitespace-nowrap shrink-0">
                    @nervox.live
                  </span>
                </div>
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
                  placeholder="Your password"
                  value={form.password}
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
                {status === 'loading' ? 'Logging in...' : 'Log In'}
              </button>

              {/* Signup link */}
              <p className="text-center text-sm text-[#64748B] font-[Inter,sans-serif]">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#0EA5E9] hover:underline">
                  Sign up
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