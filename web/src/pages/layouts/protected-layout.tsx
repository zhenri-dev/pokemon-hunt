import { useEffect, useLayoutEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { Outlet, useNavigate } from 'react-router-dom'
import { api } from '@/lib/axios'
import { isAxiosError } from 'axios'

export function ProtectedLayout() {
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [navigate, token])

  useLayoutEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isAxiosError(error)) {
          const status = error.response?.status

          if (status === 401) {
            localStorage.removeItem('token')
            navigate('/login', { replace: true })
          }
        }

        return Promise.reject(error)
      },
    )

    // Clean up the side effect when the component unmounts
    return () => {
      api.interceptors.response.eject(interceptorId)
    }
  }, [navigate])

  return <Outlet />
}
