import { type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/auth'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { isAxiosError } from 'axios'

export function Register() {
  const { getTokenInfo, authenticateUserLocally } = useAuth()
  const navigate = useNavigate()

  const { mutateAsync: registerRequest } = useMutation({
    mutationFn: async (data: {
      name: string
      phone: string
      password: string
    }) => {
      const response = await api.post('auth/register', {
        name: data.name,
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
      if (isAxiosError(error) && error.response?.data.message) {
        alert(`Erro: ${error.response?.data.message}`)
        return
      }

      alert(`Erro inesperado.`)
    },
  })

  async function handleRegister(event: FormEvent) {
    event.preventDefault()

    const name = (document.getElementById('name') as HTMLInputElement).value
    const phone = (document.getElementById('phone') as HTMLInputElement).value
    const password = (document.getElementById('password') as HTMLInputElement)
      .value

    if (!name || !phone || !password) {
      alert('Há campos faltando!')
      return
    }

    await registerRequest({ name, phone, password })
  }

  return (
    <main className="-mt-12 flex w-full flex-col items-center justify-center">
      <h1 className="font-bangers text-4xl uppercase">Realizar Cadastro</h1>

      <form
        onSubmit={handleRegister}
        className="mt-4 flex w-full flex-col gap-4"
      >
        <Input id="name" type="text" placeholder="Nome da patrulha" />
        <Input id="phone" type="text" placeholder="Telefone do monitor" />
        <Input id="password" type="password" placeholder="Senha" />
        <Button className="bg-red-500 hover:bg-red-600">Cadastrar</Button>
      </form>

      <p className="mt-3">
        Já tem uma conta?{' '}
        <a className="underline" href="/login">
          Fazer login
        </a>
      </p>
    </main>
  )
}
