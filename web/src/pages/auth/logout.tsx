import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem('token')

    navigate('/login', { replace: true })
  }, [navigate])

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-5xl">Logging out...</h1>
    </div>
  )
}
