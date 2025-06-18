import { api } from '@/lib/axios'

function authenticateUserLocally(token: string) {
  localStorage.setItem('token', token)
  api.defaults.headers.Authorization = `Bearer ${token}`
}

function getTokenInfo(token: string) {
  let role = 'patrol'
  let redirectPath = '/'

  if (token) {
    const decoded = decodeJwtPayload(token)

    if (decoded) {
      role = decoded.role
    }

    if (role === 'manager') {
      redirectPath = '/gestor'
    }
  }

  return { role, redirectPath }
}

export function useAuth() {
  const token = localStorage.getItem('token')

  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`
  }

  return { token, getTokenInfo, authenticateUserLocally }
}

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.')

    if (parts.length !== 3) {
      return null
    }

    const encodedPayload = parts[1]
    const decodedPayload = atob(
      encodedPayload.replace(/-/g, '+').replace(/_/g, '/'),
    )

    return JSON.parse(decodedPayload)
  } catch (error) {
    return null
  }
}
