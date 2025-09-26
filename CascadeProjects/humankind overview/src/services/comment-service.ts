import { Comment, CreateCommentInput } from '@/types'

export class CommentService {
  private static baseUrl = '/api'

  static async getComments(contentId: string, contentType: string, status?: string): Promise<Comment[]> {
    const searchParams = new URLSearchParams({
      content_id: contentId,
      content_type: contentType
    })
    if (status) searchParams.set('status', status)

    const response = await fetch(`${this.baseUrl}/comments?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }
    return response.json()
  }

  static async createComment(comment: CreateCommentInput, authorId: string): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...comment,
        author_id: authorId
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to create comment')
    }
    return response.json()
  }

  static async updateComment(commentId: string, updates: { status?: string; message?: string }): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      throw new Error('Failed to update comment')
    }
    return response.json()
  }

  static async deleteComment(commentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/comments/${commentId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete comment')
    }
  }
}
