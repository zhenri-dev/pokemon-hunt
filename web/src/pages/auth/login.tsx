import { type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/auth'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { isAxiosError } from 'axios'

export function Login() {
  const { getTokenInfo, authenticateUserLocally } = useAuth()
  const navigate = useNavigate()

  const { mutateAsync: authenticateRequest } = useMutation({
    mutationFn: async (data: { phone: string; password: string }) => {
      const response = await api.post('auth/login', {
        phone: data.phone,
        password: data.password,
      })

      return response.data.token
    },
    onSuccess: async (token) => {
      authenticateUserLocally(token)

      const { redirectPath } = getTokenInfo(token)

      navigate(redirectPath)
    },
    onError: async (error) => {
      if (isAxiosError(error)) {
        if (error.status === 401) {
          alert('Credenciais inválidas.')
          return
        }

        if (error.response?.data.message) {
          alert(`Erro: ${error.response?.data.message}`)
          return
        }
      }

      alert(`Erro inesperado.`)
    },
  })

  async function handleLogin(event: FormEvent) {
    event.preventDefault()

    const phone = (document.getElementById('phone') as HTMLInputElement).value
    const password = (document.getElementById('password') as HTMLInputElement)
      .value

    if (!phone || !password) {
      alert('Há campos faltando!')
      return
    }

    await authenticateRequest({ phone, password })
  }

  return (
    <main className="-mt-12 flex w-full flex-col items-center justify-center">
      <h1 className="font-bangers text-4xl uppercase">Fazer Login</h1>

      <form onSubmit={handleLogin} className="mt-4 flex w-full flex-col gap-4">
        <Input id="phone" type="text" placeholder="Telefone do monitor" />
        <Input id="password" type="password" placeholder="Senha" />
        <Button type="submit" className="bg-red-500 hover:bg-red-600">
          Entrar
        </Button>
      </form>

      <p className="mt-3">
        Ainda não tem conta?{' '}
        <a className="underline" href="/register">
          Cadastre-se
        </a>
      </p>
    </main>
  )
}
