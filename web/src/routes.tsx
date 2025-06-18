import { createBrowserRouter } from 'react-router-dom'
import { DefaultLayout } from './pages/layouts/default-layout'
import { AuthLayout } from './pages/layouts/auth-layout'
import { ProtectedLayout } from './pages/layouts/protected-layout'
import { ManagerLayout } from './pages/layouts/manager-layout'
import { NotFound } from './pages/404'
import { Login } from './pages/auth/login'
import { Register } from './pages/auth/register'
import { Logout } from './pages/auth/logout'
import { Home } from './pages/app/home'
import { Manager } from './pages/app/manager'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/logout',
        element: <Logout />,
      },
      {
        path: '/',
        element: <ProtectedLayout />,
        children: [
          {
            path: '/',
            element: <Home />,
          },
          {
            path: '/',
            element: <ManagerLayout />,
            children: [
              {
                path: '/gestor',
                element: <Manager />,
              },
            ],
          },
        ],
      },
      {
        path: '/',
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <Login />,
          },
          {
            path: '/register',
            element: <Register />,
          },
        ],
      },
    ],
  },
])
