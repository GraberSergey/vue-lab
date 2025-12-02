const API_URL = 'http://95.163.242.125/api'
const USERNAME = 'GraberSergey'

// Load comments ordered by creation time
export async function fetchComments() {
  const response = await fetch(`${API_URL}/comments`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load comments')
  }

  const payload = await response.json()
  return Array.isArray(payload) ? payload : []
}

// Subscribe to server-sent events with new comments
export function openCommentsStream({ onComment, onError }) {
  if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
    return null
  }

  const source = new EventSource(`${API_URL}/comments/stream`)

  source.onmessage = event => {
    try {
      const data = JSON.parse(event.data)
      onComment?.(data)
    } catch (error) {
      console.error('Failed to parse SSE payload', error)
    }
  }

  source.onerror = error => {
    console.error('SSE connection failed', error)
    onError?.(error)
  }

  return source
}

// Create comment with Username header required by API
export async function createComment(payload) {
  const response = await fetch(`${API_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Username: USERNAME,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to send comment')
  }

  return true
}
