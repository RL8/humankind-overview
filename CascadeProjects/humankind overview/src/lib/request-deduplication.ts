/**
 * Request deduplication utility to prevent race conditions
 * Ensures only one request per key is active at a time
 */

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest<any>>()
  private readonly REQUEST_TIMEOUT = 30000 // 30 seconds

  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if there's already a pending request for this key
    const existing = this.pendingRequests.get(key)
    
    if (existing) {
      // Check if the request is still fresh (not timed out)
      const age = Date.now() - existing.timestamp
      if (age < this.REQUEST_TIMEOUT) {
        console.log(`Deduplicating request for key: ${key}`)
        return existing.promise
      } else {
        // Remove stale request
        this.pendingRequests.delete(key)
      }
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up when request completes
      this.pendingRequests.delete(key)
    })

    // Store the pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    })

    return promise
  }

  // Clear all pending requests (useful for cleanup)
  clear() {
    this.pendingRequests.clear()
  }

  // Get current pending request count
  getPendingCount() {
    return this.pendingRequests.size
  }
}

// Export singleton instance
export const requestDeduplicator = new RequestDeduplicator()

// Helper function for user-related requests
export const deduplicateUserRequest = <T>(
  userId: string,
  operation: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  const key = `user:${userId}:${operation}`
  return requestDeduplicator.deduplicate(key, requestFn)
}
