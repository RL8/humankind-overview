/**
 * Test script to verify test user creation and role assignment
 * Run this with: node scripts/test-user-fix.js
 */

const BASE_URL = 'http://localhost:3000'

async function testUserCreation() {
  console.log('🧪 Testing test user creation...')
  
  try {
    // Create a test user
    const createResponse = await fetch(`${BASE_URL}/api/test-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'client' }),
    })
    
    const createData = await createResponse.json()
    
    if (!createResponse.ok) {
      console.error('❌ Failed to create test user:', createData)
      return
    }
    
    console.log('✅ Test user created:', createData.user.email)
    
    // Test login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: createData.user.email,
        password: createData.user.password
      }),
    })
    
    const loginData = await loginResponse.json()
    
    if (!loginResponse.ok) {
      console.error('❌ Failed to login test user:', loginData)
      return
    }
    
    console.log('✅ Test user logged in successfully')
    
    // Debug the user
    const debugResponse = await fetch(`${BASE_URL}/api/debug-user?userId=${loginData.user.id}`)
    const debugData = await debugResponse.json()
    
    console.log('🔍 User debug info:', JSON.stringify(debugData, null, 2))
    
    if (debugData.dbUser && debugData.dbUser.role) {
      console.log('✅ User has role in database:', debugData.dbUser.role)
    } else {
      console.log('❌ User missing role in database')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testUserCreation()

