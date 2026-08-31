export function getAuthToken(): string {
  if (typeof window === 'undefined') return ''

  try {
    // 1. Try localStorage
    const localToken = localStorage.getItem('admin_token') || localStorage.getItem('token')
    if (localToken && localToken !== 'undefined' && localToken !== 'null') {
      return localToken
    }
  } catch (e) {
    // Ignore localStorage read errors if restricted
  }

  try {
    // 2. Fallback to cookies (campusGPT is non-httpOnly)
    if (typeof document !== 'undefined') {
      const match =
        document.cookie.match(/(?:^|; )campusGPT=([^;]*)/) ||
        document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
      if (match && match[1] && match[1] !== 'undefined' && match[1] !== 'null') {
        return match[1]
      }
    }
  } catch (e) {
    // Ignore cookie read errors
  }

  return ''
}
