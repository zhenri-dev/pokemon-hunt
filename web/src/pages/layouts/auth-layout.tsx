import { useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { Outlet, useNavigate } from 'react-router-dom'

export function AuthLayout() {
  const { token, getTokenInfo } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      const { redirectPath } = getTokenInfo(token)

      navigate(redirectPath, { replace: true })
    }
  }, [navigate, token, getTokenInfo])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[url('/src/assets/login-background.jpg')] bg-cover bg-center">
      <Outlet />
    </div>
  )
}
