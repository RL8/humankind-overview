/**
 * Debug utilities for authentication and Supabase client issues
 * This file helps diagnose and test the fixes for multiple client instances and user role queries
 */

import { getClientInstanceInfo } from './supabase'
import { AuthService } from './auth'

export class AuthDebugger {
  /**
   * Check for multiple Supabase client instances
   */
  static checkClientInstances() {
    const info = getClientInstanceInfo()
    console.log('🔍 Supabase Client Instance Debug Info:')
    console.log(`- Client instances created: ${info.clientCreationCount}`)
    console.log(`- Admin client instances created: ${info.adminClientCreationCount}`)
    console.log(`- Has client instance: ${info.hasClient}`)
    console.log(`- Has admin client instance: ${info.hasAdminClient}`)
    
    if (info.clientCreationCount > 1) {
      console.warn('⚠️ Multiple client instances detected! This may cause authentication issues.')
    } else {
      console.log('✅ Single client instance - good!')
    }
    
    return info
  }

  /**
   * Test user role fetching with detailed logging
   */
  static async testUserRoleFetching(userId?: string) {
    console.log('🔍 Testing User Role Fetching:')
    console.log(`- User ID: ${userId || 'current user'}`)
    
    try {
      const role = await AuthService.getUserRole(userId)
      console.log(`- Role result: ${role}`)
      
      if (role) {
        console.log('✅ User role fetched successfully')
      } else {
        console.log('⚠️ No role found - this may be expected for new users')
      }
      
      return { success: true, role, error: null }
    } catch (error) {
      console.error('❌ Error fetching user role:', error)
      return { success: false, role: null, error }
    }
  }

  /**
   * Run comprehensive auth debugging
   */
  static async runFullDiagnostic() {
    console.log('🚀 Running Full Authentication Diagnostic...')
    console.log('=' .repeat(50))
    
    // Check client instances
    const clientInfo = this.checkClientInstances()
    console.log('')
    
    // Test user role fetching
    const roleTest = await this.testUserRoleFetching()
    console.log('')
    
    // Summary
    console.log('📊 Diagnostic Summary:')
    console.log(`- Client instances: ${clientInfo.clientCreationCount} (should be 1)`)
    console.log(`- Role fetching: ${roleTest.success ? 'SUCCESS' : 'FAILED'}`)
    
    if (clientInfo.clientCreationCount === 1 && roleTest.success) {
      console.log('🎉 All checks passed! Auth system is working correctly.')
    } else {
      console.log('⚠️ Some issues detected. Check the logs above for details.')
    }
    
    return {
      clientInfo,
      roleTest,
      allGood: clientInfo.clientCreationCount === 1 && roleTest.success
    }
  }
}

// Export for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).AuthDebugger = AuthDebugger
}
