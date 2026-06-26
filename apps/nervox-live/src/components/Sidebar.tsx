'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

interface MenuItem {
  label: string
  icon: string
  href: string
  children?: { label: string; href: string }[]
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: '⊞',
    href: '/dashboard',
  },
  {
    label: 'My Devices',
    icon: '⬡',
    href: '/dashboard/devices',
    children: [
      { label: 'All Devices', href: '/dashboard/devices' },
      { label: 'Register Device', href: '/dashboard/devices/register' },
    ],
  },
  {
    label: 'Sites',
    icon: '◎',
    href: '/dashboard/sites',
    children: [
      { label: 'All Sites', href: '/dashboard/sites' },
      { label: 'Add Site', href: '/dashboard/sites/add' },
    ],
  },
  {
    label: 'Automations',
    icon: '⟳',
    href: '/dashboard/automations',
    children: [
      { label: 'All Automations', href: '/dashboard/automations' },
      { label: 'Create Automation', href: '/dashboard/automations/create' },
    ],
  },
  {
    label: 'Alerts',
    icon: '◈',
    href: '/dashboard/alerts',
    children: [
      { label: 'Active Alerts', href: '/dashboard/alerts' },
      { label: 'Alert Settings', href: '/dashboard/alerts/settings' },
    ],
  },
  {
    label: 'Settings',
    icon: '◉',
    href: '/dashboard/settings',
  },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
  onComingSoon: () => void
}

export default function Sidebar({ mobileOpen, onClose, onComingSoon }: SidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(['My Devices'])

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string) => pathname === href
  const isDashboard = (href: string) => href === '/dashboard'

  const handleClick = (href: string) => {
    if (!isDashboard(href)) {
      onComingSoon()
    }
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-[#E2E8F0]
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          overflow-y-auto
        `}
      >
        <nav className="px-3 py-4">
          {menuItems.map((item) => (
            <div key={item.label} className="mb-1">

              {/* Parent item */}
              {item.children ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm
                    font-[Inter,sans-serif] transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-[#EFF6FF] text-[#0EA5E9] font-semibold'
                      : 'text-[#0A0F1E] hover:bg-[#F8FAFC]'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </span>
                  <span className={`text-xs transition-transform duration-200 ${openMenus.includes(item.label) ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => handleClick(item.href)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    font-[Inter,sans-serif] transition-colors duration-200 text-left
                    ${isActive(item.href)
                      ? 'bg-[#EFF6FF] text-[#0EA5E9] font-semibold'
                      : 'text-[#0A0F1E] hover:bg-[#F8FAFC]'
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              )}

              {/* Children */}
              {item.children && openMenus.includes(item.label) && (
                <div className="ml-6 mt-1 flex flex-col gap-0.5">
                  {item.children.map((child) => (
                    <button
                      key={child.href}
                      onClick={() => handleClick(child.href)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm font-[Inter,sans-serif]
                        transition-colors duration-200
                        ${isActive(child.href)
                          ? 'text-[#0EA5E9] font-semibold bg-[#EFF6FF]'
                          : 'text-[#64748B] hover:text-[#0A0F1E] hover:bg-[#F8FAFC]'
                        }
                      `}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}

            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}