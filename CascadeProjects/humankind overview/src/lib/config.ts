/**
 * Application configuration
 * Centralizes environment variable access and validation
 */

export const config = {
  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://placeholder',
  },
  
  // Authentication configuration
  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'placeholder-secret-for-build',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  
  // External API configuration
  apis: {
    googleTranslate: {
      apiKey: process.env.GOOGLE_TRANSLATE_API_KEY || 'placeholder-api-key',
    },
  },
  
  // Application configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
}

/**
 * Validates that all required environment variables are present
 */
export function validateConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXTAUTH_SECRET',
  ]
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }
}

