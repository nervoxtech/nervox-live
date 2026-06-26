'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  name?: string
  username?: string
}

export default function Header({ name, username }: HeaderProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('nervox_token')
    localStorage.removeItem('nervox_username')
    router.push('/login')
  }

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'NV'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E2E8F0] px-4 sm:px-8 py-3 flex items-center justify-between">

      {/* Logo */}
      <Link href="/dashboard">
        <Image
          src="/logo.jpg"
          alt="NerVox"
          width={120}
          height={120}
          className="h-10 w-auto"
          priority
        />
      </Link>

      {/* Right — Avatar */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-9 h-9 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-sm font-semibold font-[Inter,sans-serif] hover:bg-[#0284C7] transition-colors duration-200"
        >
          {initials}
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-md py-1 z-50">

            {/* User info */}
            <div className="px-4 py-3 border-b border-[#E2E8F0]">
              <p className="text-sm font-semibold text-[#0A0F1E] font-[Inter,sans-serif] truncate">
                {name || 'NerVox User'}
              </p>
              <p className="text-xs text-[#94A3B8] font-[Inter,sans-serif] truncate">
                {username || ''}
              </p>
            </div>

            {/* Menu items */}
            <Link
              href="/dashboard/profile"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2 text-sm text-[#0A0F1E] hover:bg-[#F8FAFC] font-[Inter,sans-serif] transition-colors duration-200"
            >
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#FFF5F5] font-[Inter,sans-serif] transition-colors duration-200"
            >
              Logout
            </button>

          </div>
        )}
      </div>

    </header>
  )
}