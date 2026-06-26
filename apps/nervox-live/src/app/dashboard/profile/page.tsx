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

type SaveStatus = 'idle' | 'loading' | 'success' | 'error'
type ActiveTab = 'personal' | 'password'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal')

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [profileStatus, setProfileStatus] = useState<SaveStatus>('idle')
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<SaveStatus>('idle')
  const [passwordMessage, setPasswordMessage] = useState('')

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
        setForm(prev => ({
          ...prev,
          name: data.user.name,
          email: data.user.email,
          mobile: data.user.mobile,
        }))
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMessage('')
    setProfileStatus('loading')

    const token = localStorage.getItem('nervox_token')
    const username = localStorage.getItem('nervox_username')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            mobile: form.mobile,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setProfileMessage(data.error || 'Error updating profile.')
        setProfileStatus('error')
        return
      }

      setUser(data.user)
      setProfileMessage('Profile updated successfully.')
      setProfileStatus('success')
    } catch {
      setProfileMessage('Unable to connect. Please try again.')
      setProfileStatus('error')
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')

    if (form.new_password !== form.confirm_password) {
      setPasswordMessage('New passwords do not match.')
      setPasswordStatus('error')
      return
    }

    if (form.new_password.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.')
      setPasswordStatus('error')
      return
    }

    setPasswordStatus('loading')

    const token = localStorage.getItem('nervox_token')
    const username = localStorage.getItem('nervox_username')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${username}/password`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: form.current_password,
            new_password: form.new_password,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setPasswordMessage(data.error || 'Error updating password.')
        setPasswordStatus('error')
        return
      }

      setPasswordMessage('Password updated successfully.')
      setPasswordStatus('success')
      setForm(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }))
    } catch {
      setPasswordMessage('Unable to connect. Please try again.')
      setPasswordStatus('error')
    }
  }

  const inputClass = 'w-full bg-white border border-[#CBD5E1] text-[#0A0F1E] placeholder-[#94A3B8] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0EA5E9] transition-colors duration-200 font-[Inter,sans-serif]'

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
      <Header name={user?.name} username={user?.username} />

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

          {/* Page heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-[Space_Grotesk,sans-serif]">
              My Profile
            </h1>
            <p className="text-[#64748B] text-sm mt-1 font-[Inter,sans-serif]">
              Manage your NerVox account details.
            </p>
          </div>

          {/* Profile card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden max-w-2xl mx-auto">

            {/* Avatar section */}
            <div className="px-6 py-6 border-b border-[#E2E8F0] flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-xl font-bold font-[Space_Grotesk,sans-serif] shrink-0">
                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="text-base font-semibold font-[Space_Grotesk,sans-serif]">{user?.name}</p>
                <p className="text-sm text-[#64748B] font-[Inter,sans-serif]">{user?.username}</p>
                <p className="text-xs text-[#94A3B8] font-[Inter,sans-serif] mt-0.5">
                  {user?.user_type === 'individual' ? 'Individual Account' : 'Organisation Account'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E2E8F0]">
              {(['personal', 'password'] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setProfileMessage('')
                    setPasswordMessage('')
                    setProfileStatus('idle')
                    setPasswordStatus('idle')
                  }}
                  className={`
                    flex-1 py-3 text-sm font-medium font-[Inter,sans-serif]
                    transition-colors duration-200 border-b-2
                    ${activeTab === tab
                      ? 'border-[#0EA5E9] text-[#0EA5E9]'
                      : 'border-transparent text-[#64748B] hover:text-[#0A0F1E]'
                    }
                  `}
                >
                  {tab === 'personal' ? 'Personal Info' : 'Password'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="px-6 py-8">

              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <form onSubmit={handleProfileSave} className="flex flex-col gap-4">

                  <div>
                    <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">Username</label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] text-[#94A3B8] rounded-lg px-4 py-3 text-sm font-[Inter,sans-serif] cursor-not-allowed"
                    />
                    <p className="text-xs text-[#94A3B8] mt-1 font-[Inter,sans-serif]">Username cannot be changed.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      value={form.mobile}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {profileMessage && (
                    <p className={`text-sm font-[Inter,sans-serif] ${profileStatus === 'success' ? 'text-green-500' : 'text-red-400'}`}>
                      {profileMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={profileStatus === 'loading'}
                    className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-[Inter,sans-serif] mt-2"
                  >
                    {profileStatus === 'loading' ? 'Saving...' : 'Save Changes'}
                  </button>

                </form>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">

                  <div>
                    <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">Current Password</label>
                    <input
                      type="password"
                      name="current_password"
                      required
                      placeholder="Enter current password"
                      value={form.current_password}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">New Password</label>
                    <input
                      type="password"
                      name="new_password"
                      required
                      placeholder="Enter new password"
                      value={form.new_password}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 font-[Inter,sans-serif]">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      required
                      placeholder="Repeat new password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {passwordMessage && (
                    <p className={`text-sm font-[Inter,sans-serif] ${passwordStatus === 'success' ? 'text-green-500' : 'text-red-400'}`}>
                      {passwordMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={passwordStatus === 'loading'}
                    className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-[Inter,sans-serif] mt-2"
                  >
                    {passwordStatus === 'loading' ? 'Updating...' : 'Update Password'}
                  </button>

                </form>
              )}

            </div>
          </div>

        </main>

        <Footer />
      </div>

    </div>
  )
}