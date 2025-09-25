import { NextApiRequest, NextApiResponse } from 'next'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, any>
    timestamp: string
    requestId: string
  }
}

/**
 * Error handler middleware for API routes
 */
export function errorHandler(
  error: ApiError,
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log the error
  console.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  })

  // Determine status code
  const statusCode = error.statusCode || 500

  // Create error response
  const errorResponse: ErrorResponse = {
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
    },
  }

  // Add details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      stack: error.stack,
      url: req.url,
      method: req.method,
    }
  }

  res.status(statusCode).json(errorResponse)
}

/**
 * Async error wrapper for API routes
 */
export function asyncHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      errorHandler(error as ApiError, req, res)
    }
  }
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  statusCode = 400
  code = 'VALIDATION_ERROR'
  
  constructor(message: string, public details?: Record<string, any>) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404
  code = 'NOT_FOUND'
  
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401
  code = 'UNAUTHORIZED'
  
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  statusCode = 403
  code = 'FORBIDDEN'
  
  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

