'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'

interface User {
  id: string
  name: string
  username: string
  user_type: string
  email: string
  mobile: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('nervox_token')
    const username = localStorage.getItem('nervox_username')

    if (!token || !username) {
      router.push('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (!res.ok) {
          router.push('/login')
          return
        }

        const data = await res.json()
        setUser(data.user)
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#0EA5E9] animate-pulse" />
          <p className="text-[#64748B] text-sm font-[Inter,sans-serif]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A0F1E] flex flex-col">

      {/* Background dot grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #E2E8F0 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.4,
        }}
      />

      {/* Coming Soon Toast */}
      {showComingSoon && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A0F1E] text-white text-sm px-6 py-3 rounded-xl shadow-lg font-[Inter,sans-serif] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
          Features will be available soon...
        </div>
      )}

      {/* Header */}
      <Header
        name={user?.name}
        username={user?.username}
      />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onComingSoon={() => {
          setShowComingSoon(true)
          setTimeout(() => setShowComingSoon(false), 3000)
        }}
      />

      {/* Main */}
      <div className="relative z-10 flex flex-col min-h-screen pt-16 lg:pl-64">

        {/* Mobile menu toggle */}
        <div className="lg:hidden px-4 pt-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 text-sm text-[#64748B] font-[Inter,sans-serif] hover:text-[#0A0F1E] transition-colors"
          >
            <span className="text-lg">☰</span>
            Menu
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-8 py-8">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-[Space_Grotesk,sans-serif]">
              Welcome, {user?.name.split(' ')[0]} 👋
            </h1>
            <p className="text-[#64748B] text-sm mt-1 font-[Inter,sans-serif]">
              {user?.username} · {user?.user_type === 'individual' ? 'Individual Account' : 'Organisation Account'}
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Devices', value: '0', icon: '⬡' },
              { label: 'Active Sites', value: '0', icon: '◎' },
              { label: 'Automations', value: '0', icon: '⟳' },
              { label: 'Active Alerts', value: '0', icon: '◈' },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-5 flex items-center gap-4 shadow-sm"
              >
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <p className="text-2xl font-bold font-[Space_Grotesk,sans-serif]">{card.value}</p>
                  <p className="text-xs text-[#64748B] font-[Inter,sans-serif]">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Getting started */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-8 shadow-sm">
            <h2 className="text-lg font-bold font-[Space_Grotesk,sans-serif] mb-2">
              Getting Started
            </h2>
            <p className="text-[#64748B] text-sm font-[Inter,sans-serif] mb-6">
              Your NerVox platform is ready. Here is what to do next.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: '01',
                  title: 'Add a Site',
                  description: 'Create your first site — a home, office, or any location.',
                },
                {
                  step: '02',
                  title: 'Register a Device',
                  description: 'Connect your ESP32 or any NerVox compatible hardware.',
                },
                {
                  step: '03',
                  title: 'Set up Automations',
                  description: 'Create rules to automate your devices without writing code.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="border border-[#E2E8F0] rounded-xl px-5 py-5"
                >
                  <p className="text-[#0EA5E9] text-xs font-semibold mb-2 font-[Inter,sans-serif]">
                    STEP {item.step}
                  </p>
                  <p className="text-sm font-semibold mb-1 font-[Space_Grotesk,sans-serif]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#64748B] font-[Inter,sans-serif]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </main>

        <Footer />
      </div>

    </div>
  )
}