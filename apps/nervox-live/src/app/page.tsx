'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ComingSoon() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('https://formspree.io/f/mreweogp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0F1E] flex flex-col">

      {/* Background grid */}
      <div className="fixed inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle, #E2E8F0 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.6,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen
                      px-6 py-12
                      sm:px-12 md:px-20 lg:px-32 xl:px-48 2xl:px-64">

        {/* Logo */}
        <header className="flex justify-center">
          <Image
            src="/logo.jpg"
            alt="NerVox"
            width={160}
            height={160}
            className="h-20 w-auto"
            priority
          />
        </header>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center
                             text-center max-w-4xl mx-auto w-full
                             py-20 sm:py-28 md:py-36">

          {/* Status label */}
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
            <span className="text-[#64748B] text-sm tracking-widest uppercase
                             font-[Inter,sans-serif]">
              Calibrating
            </span>
            <span className="inline-flex gap-1 ml-1 items-center">
              <span className="w-1 h-1 rounded-full bg-[#64748B] animate-bounce"
                    style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-[#64748B] animate-bounce"
                    style={{ animationDelay: '200ms' }} />
              <span className="w-1 h-1 rounded-full bg-[#64748B] animate-bounce"
                    style={{ animationDelay: '400ms' }} />
            </span>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl
                         font-bold leading-tight tracking-tight mb-6
                         font-[Space_Grotesk,sans-serif]">
            Where devices
            <br />
            <span className="text-[#0EA5E9]">think together.</span>
          </h1>

          {/* Description */}
          <p className="text-[#64748B] text-base sm:text-lg md:text-xl
                        max-w-2xl mb-12 leading-relaxed
                        font-[Inter,sans-serif]">
            Built for the era of connected hardware —
            where every device communicates,
            collaborates, and evolves together.
          </p>

          {/* Email form */}
          <form onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border border-[#CBD5E1]
                         text-[#0A0F1E] placeholder-[#94A3B8]
                         rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:border-[#0EA5E9]
                         transition-colors duration-200
                         font-[Inter,sans-serif]"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#0EA5E9] hover:bg-[#0284C7]
                         text-white font-semibold
                         rounded-lg px-6 py-3 text-sm
                         transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         font-[Inter,sans-serif] whitespace-nowrap">
              {status === 'loading' ? 'Sending...' : 'Notify Me'}
            </button>
          </form>

          {/* Form feedback */}
          {status === 'success' && (
            <p className="mt-4 text-[#0EA5E9] text-sm font-[Inter,sans-serif]">
              You are on the list. We will reach out when NerVox launches.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-red-400 text-sm font-[Inter,sans-serif]">
              Something went wrong. Please try again.
            </p>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-[#E2E8F0] pt-6">
          <p className="text-[#94A3B8] text-sm text-center
                        font-[Inter,sans-serif]">
            © 2026 NerVox. All rights reserved.
          </p>
        </footer>

      </div>
    </main>
  )
}