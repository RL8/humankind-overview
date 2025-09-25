'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalContent: 0,
    recentUploads: 0,
    programmes: 0,
    users: 0
  })

  useEffect(() => {
    // In a real implementation, you'd fetch these stats from APIs
    // For now, we'll show placeholder data
    setStats({
      totalContent: 0,
      recentUploads: 0,
      programmes: 0,
      users: 0
    })
  }, [])

  const getRoleDisplayName = (role?: UserRole) => {
    switch (role) {
      case UserRole.COMPOSER:
        return 'Content Composer'
      case UserRole.PRINCIPAL:
        return 'Training Principal'
      case UserRole.CLIENT:
        return 'Training Client'
      case UserRole.ADMIN:
        return 'System Administrator'
      default:
        return 'User'
    }
  }

  const getWelcomeMessage = (role?: UserRole) => {
    switch (role) {
      case UserRole.COMPOSER:
        return 'Ready to create amazing training content?'
      case UserRole.PRINCIPAL:
        return 'Manage your training programs and team.'
      case UserRole.CLIENT:
        return 'Continue your learning journey.'
      case UserRole.ADMIN:
        return 'System overview and administration.'
      default:
        return 'Welcome to Course Tracker!'
    }
  }

  const getQuickActions = (role?: UserRole) => {
    switch (role) {
      case UserRole.COMPOSER:
        return [
          {
            title: 'Upload Content',
            description: 'Add new training materials',
            href: '/content',
            icon: '📁',
            color: 'blue'
          },
          {
            title: 'Create Programme',
            description: 'Start a new training programme',
            href: '/programmes/new',
            icon: '📚',
            color: 'green'
          },
          {
            title: 'View Analytics',
            description: 'Check content performance',
            href: '/analytics',
            icon: '📊',
            color: 'purple'
          }
        ]
      case UserRole.PRINCIPAL:
        return [
          {
            title: 'Review Content',
            description: 'Approve pending materials',
            href: '/content?status=review',
            icon: '✅',
            color: 'green'
          },
          {
            title: 'Manage Users',
            description: 'Oversee team members',
            href: '/users',
            icon: '👥',
            color: 'blue'
          },
          {
            title: 'View Reports',
            description: 'Training progress reports',
            href: '/reports',
            icon: '📈',
            color: 'purple'
          }
        ]
      case UserRole.CLIENT:
        return [
          {
            title: 'My Training',
            description: 'Continue your courses',
            href: '/training',
            icon: '🎓',
            color: 'blue'
          },
          {
            title: 'View Progress',
            description: 'Track your achievements',
            href: '/progress',
            icon: '📊',
            color: 'green'
          },
          {
            title: 'Certificates',
            description: 'Download certificates',
            href: '/certificates',
            icon: '🏆',
            color: 'yellow'
          }
        ]
      case UserRole.ADMIN:
        return [
          {
            title: 'System Settings',
            description: 'Configure the platform',
            href: '/settings',
            icon: '⚙️',
            color: 'gray'
          },
          {
            title: 'All Users',
            description: 'Manage all accounts',
            href: '/users',
            icon: '👥',
            color: 'blue'
          },
          {
            title: 'System Reports',
            description: 'Platform analytics',
            href: '/admin/reports',
            icon: '📊',
            color: 'purple'
          }
        ]
      default:
        return []
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      case 'green':
        return 'bg-green-50 text-green-700 hover:bg-green-100'
      case 'purple':
        return 'bg-purple-50 text-purple-700 hover:bg-purple-100'
      case 'yellow':
        return 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
      case 'gray':
        return 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      default:
        return 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    }
  }

  const quickActions = getQuickActions(user?.role)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Welcome back, {user?.name || user?.email?.split('@')[0]}!
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {getRoleDisplayName(user?.role)} • {getWelcomeMessage(user?.role)}
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📁</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Content
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalContent}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📚</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Programmes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.programmes}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⬆️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Recent Uploads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.recentUploads}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {user?.role === UserRole.CLIENT ? 'My Courses' : 'Active Users'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.users}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (action.href.startsWith('/')) {
                          window.location.href = action.href
                        } else {
                          alert('Feature coming soon!')
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${getColorClasses(action.color)}`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{action.icon}</span>
                        <div>
                          <div className="font-medium">{action.title}</div>
                          <div className="text-sm opacity-75">{action.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No recent activity</p>
                    <p className="text-sm mt-1">Start using the platform to see your activity here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 sm:px-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-4xl">🚀</div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-semibold text-white">
                      Ready to Get Started?
                    </h3>
                    <p className="mt-1 text-blue-100">
                      Course Tracker is ready with authentication, content management, and navigation. 
                      Start exploring the features available for your role.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => window.location.href = '/content'}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Explore Content Management
                        <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
