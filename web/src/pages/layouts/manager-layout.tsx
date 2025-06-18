import { useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { Outlet, useNavigate } from 'react-router-dom'

export function ManagerLayout() {
  const { token, getTokenInfo } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      const { role } = getTokenInfo(token)

      if (role !== 'manager') {
        navigate('/login', { replace: true })
      }
    }
  }, [navigate, token, getTokenInfo])

  return <Outlet />
}
