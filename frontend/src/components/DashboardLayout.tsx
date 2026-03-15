'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useMantineColorScheme } from '@mantine/core'
import { 
  LayoutDashboard, School, UserPlus, Users, Settings, FileText, BarChart3,
  GraduationCap, BookOpen, ClipboardList, DollarSign, Package,
  Calendar, Edit3, Eye, Library, Stethoscope, Pill, Menu as MenuIcon,
  LogOut, User, Moon, Sun, Bell, Search, ChevronDown, X
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        await fetch('http://localhost:8080/api/v1/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.clear()
      router.push('/login')
    }
  }

  const getMenuItems = () => {
    switch (user?.role) {
      case 'system_admin':
        return [
          { href: '/dashboard/system-admin', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/system/schools', label: 'Schools', icon: School },
          { href: '/system/schools/create', label: 'Create School', icon: UserPlus },
          { href: '/system/users', label: 'Users', icon: Users },
          { href: '/system/settings', label: 'Settings', icon: Settings },
          { href: '/system/audit-logs', label: 'Audit Logs', icon: FileText },
          { href: '/system/reports', label: 'Reports', icon: BarChart3 },
        ]
      case 'school_admin':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/students', label: 'Students', icon: GraduationCap },
          { href: '/staff', label: 'Staff', icon: Users },
          { href: '/classes', label: 'Classes', icon: BookOpen },
          { href: '/users', label: 'Users', icon: Users },
          { href: '/results', label: 'Results', icon: ClipboardList },
          { href: '/report-cards', label: 'Report Cards', icon: FileText },
          { href: '/attendance', label: 'Attendance', icon: Calendar },
          { href: '/lessons', label: 'Lesson Monitoring', icon: BookOpen },
          { href: '/inventory', label: 'Inventory', icon: Package },
          { href: '/reports', label: 'Reports', icon: BarChart3 },
          { href: '/analytics', label: 'Performance Analytics', icon: BarChart3 },
          { href: '/payroll', label: 'Payroll', icon: DollarSign },
          { href: '/finance', label: 'Finance', icon: DollarSign },
          { href: '/finance/budget', label: 'Budget', icon: DollarSign },
          { href: '/finance/requisitions', label: 'Requisitions', icon: ClipboardList },
          { href: '/settings', label: 'Settings', icon: Settings },
        ]
      case 'teacher':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/marks/enter', label: 'Enter Marks', icon: Edit3 },
          { href: '/view-marks', label: 'View Marks', icon: Eye },
          { href: '/attendance', label: 'Attendance', icon: Calendar },
          { href: '/finance/requisitions', label: 'Requisitions', icon: ClipboardList },
        ]
      case 'bursar':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/fees', label: 'Fee Management', icon: DollarSign },
          { href: '/finance', label: 'Finance', icon: DollarSign },
          { href: '/finance/budget', label: 'Budget', icon: DollarSign },
          { href: '/finance/requisitions', label: 'Requisitions', icon: ClipboardList },
          { href: '/reports/financial', label: 'Financial Reports', icon: BarChart3 },
        ]
      case 'librarian':
        return [
          { href: '/library', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/library/books', label: 'Books', icon: BookOpen },
          { href: '/library/issues', label: 'Book Issues', icon: ClipboardList },
          { href: '/library/reports', label: 'Reports', icon: BarChart3 },
          { href: '/finance/requisitions', label: 'Requisitions', icon: ClipboardList },
        ]
      case 'nurse':
        return [
          { href: '/clinic', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/clinic/visits', label: 'Patient Visits', icon: ClipboardList },
          { href: '/clinic/health-profiles', label: 'Health Profiles', icon: FileText },
          { href: '/clinic/medicines', label: 'Medicine Inventory', icon: Pill },
          { href: '/clinic/emergencies', label: 'Emergency Incidents', icon: Stethoscope },
          { href: '/clinic/reports', label: 'Health Reports', icon: BarChart3 },
          { href: '/finance/requisitions', label: 'Requisitions', icon: ClipboardList },
        ]
      case 'storekeeper':
        return [
          { href: '/storekeeper', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/storekeeper/inventory', label: 'Inventory', icon: Package },
        ]
      case 'parent':
        return [
          { href: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/parent/attendance', label: 'Attendance', icon: Calendar },
          { href: '/parent/results', label: 'Results', icon: ClipboardList },
          { href: '/parent/fees', label: 'Fees', icon: DollarSign },
          { href: '/parent/health', label: 'Health', icon: Stethoscope },
          { href: '/parent/settings', label: 'Settings', icon: Settings },
        ]
      default:
        return [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = getMenuItems()

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between gap-3 px-6 py-6 border-b border-slate-700/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 animate-float">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Acadistra</h1>
                <p className="text-xs text-slate-400">School Management</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-72 min-h-screen">
        {/* Modern Navbar */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex-shrink-0 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>
                
                {/* Search Bar */}
                <div className="hidden md:flex items-center flex-1 max-w-xl">
                  <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search students, staff, classes..."
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                  onClick={() => toggleColorScheme()}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-300 hover:scale-105"
                  title={colorScheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {colorScheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-300 hover:scale-105 group">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </button>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2" />

                {/* User Profile */}
                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900">{user.full_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role?.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 group"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}