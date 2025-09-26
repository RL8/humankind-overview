# Authentication Debug Utilities

This directory contains utilities to help debug authentication and Supabase client issues.

## Debug Tools

### AuthDebugger

A comprehensive debugging utility for authentication issues.

#### Usage

```typescript
import { AuthDebugger } from '@/lib/debug-auth'

// Check for multiple client instances
AuthDebugger.checkClientInstances()

// Test user role fetching
await AuthDebugger.testUserRoleFetching()

// Run full diagnostic
await AuthDebugger.runFullDiagnostic()
```

#### Browser Console Usage

You can also use these utilities directly in the browser console:

```javascript
// Check client instances
AuthDebugger.checkClientInstances()

// Test role fetching
await AuthDebugger.testUserRoleFetching()

// Run full diagnostic
await AuthDebugger.runFullDiagnostic()
```

## Common Issues Fixed

### 1. Multiple GoTrueClient Instances

**Problem**: Multiple Supabase client instances being created, causing authentication conflicts.

**Solution**: 
- Implemented robust singleton pattern in `supabase.ts`
- Added client creation tracking and warnings
- Added debugging utilities to detect multiple instances

### 2. User Role Query Errors (PGRST116)

**Problem**: Database queries expecting single results but receiving zero rows.

**Solution**:
- Added specific handling for PGRST116 error code
- Improved fallback behavior when user records don't exist
- Enhanced error logging and user feedback
- Added automatic user record creation when missing

## Monitoring

The debug utilities will help you monitor:

- Number of Supabase client instances created
- User role fetching success/failure
- Authentication flow health
- Database query errors

## Best Practices

1. **Always use the singleton exports** from `@/lib/supabase`
2. **Don't create new Supabase clients** in components or pages
3. **Use the debug utilities** when troubleshooting auth issues
4. **Check console logs** for client instance warnings
5. **Test user role fetching** after authentication changes
