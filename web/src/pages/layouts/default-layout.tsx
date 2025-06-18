import { Outlet } from 'react-router-dom'

export function DefaultLayout() {
  return (
    <div className="mx-auto h-screen max-w-[400px] px-4">
      <Outlet />
    </div>
  )
}
