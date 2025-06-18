import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Capture, type CaptureData } from '@/components/capture'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { config } from '@/config'

import pokeballImage from '../../assets/pokeball.png'

export function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [element1, setElement1] = useState('')
  const [element2, setElement2] = useState('no-second')

  const [searchParams, setSearchParams] = useSearchParams()

  let page = Number(searchParams.get('page')) || 1
  let orderBy = searchParams.get('order_by') || 'desc'

  const {
    data: captures,
    isFetching,
    refetch: refetchCaptures,
  } = useQuery({
    queryKey: ['user-captures', page, orderBy],
    queryFn: async () => {
      const response = await api.get(
        `/captures?page=${page}&order_by=${orderBy}`,
      )

      return response.data.captures
    },
  })

  const { mutateAsync: createCaptureRequest } = useMutation({
    mutationFn: async (data: CaptureData) => {
      const response = await api.post('/captures', {
        pokemonName: data.pokemonName,
        location: data.location,
        description: data.description,
        element1: data.element1,
        element2: data.element2,
      })

      return response.data.id
    },
    onSuccess: () => {
      setImage(null)
      setElement1('')
      setElement2('no-second')
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.data.message) {
        alert(`Erro: ${error.response?.data.message}`)
      }

      alert(`Erro inesperado.`)
    },
  })

  const { mutateAsync: uploadImageRequest } = useMutation({
    mutationFn: async (data: { captureId: string; image: File }) => {
      const multipartForm = new FormData()

      multipartForm.append('uploadId', data.captureId)
      multipartForm.append('file', data.image)

      await api.post(`/upload`, multipartForm)
    },
    onSuccess: () => {
      refetchCaptures()
    },
    onError: () => {
      alert('Não foi possível realizar o upload da imagem.')
    },
  })

  function handleSelectImage(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return

    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        setImage(file)
      }

      reader.readAsDataURL(file)
    }
  }

  async function handleSaveCapture(event: FormEvent) {
    event.preventDefault()

    if (!image) return

    const imageFile = image

    const name = (document.getElementById('name') as HTMLInputElement).value
    const location = (document.getElementById('location') as HTMLInputElement)
      .value
    const description = (
      document.getElementById('description') as HTMLTextAreaElement
    ).value

    if (!name || !location || !element1) {
      alert('Há campos faltando!')
      return
    }

    const captureId = await createCaptureRequest({
      pokemonName: name,
      location,
      description,
      element1,
      element2: element2 !== 'no-second' ? element2 : undefined,
    })

    await uploadImageRequest({ captureId, image: imageFile })
  }

  function handleChangePage(value: number) {
    if (value <= 0) {
      return
    }

    page = value

    setSearchParams((state) => {
      state.set('page', value.toString())

      return state
    })
  }

  function handleOrderBy(value: string) {
    orderBy = value

    setSearchParams((state) => {
      state.set('order_by', value)

      return state
    })
  }

  return (
    <main className="flex flex-col items-center">
      {!image ? (
        <div className="flex flex-col items-center">
          <div
            className="flex cursor-pointer flex-col items-center rounded-b-2xl bg-white px-6 pt-5 pb-14 transition-all hover:-translate-y-1"
            onClick={() => document.getElementById('file-selector')?.click()}
          >
            <img src={pokeballImage} alt="" className="h-24 w-24" />
            <p className="text-primary mt-4 text-lg font-bold">
              Clique para Capturar ou Enviar
            </p>

            <input
              id="file-selector"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectImage}
            />
          </div>

          <Button
            className="mt-6 w-full bg-red-500 px-5 hover:bg-red-600"
            asChild
          >
            <a href="/logout">Sair</a>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSaveCapture}
          className="mt-6 flex w-full flex-col items-center gap-2 rounded-lg bg-white p-5"
        >
          <Input id="name" type="text" placeholder="Nome do Pokémon" required />

          <Select value={element1} onValueChange={setElement1}>
            <SelectTrigger>
              <SelectValue placeholder="Elemento Primário" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {config.ELEMENT_TYPES.map((type) => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            defaultValue="no-second"
            value={element2}
            onValueChange={setElement2}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="no-second">
                  Não possui segundo elemento
                </SelectItem>
                {config.ELEMENT_TYPES.map((type) => (
                  <SelectItem key={`${type.key}-2`} value={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Textarea id="description" placeholder="Descrição do Pokémon" />

          <Input
            id="location"
            type="text"
            placeholder="Local da Captura"
            required
          />

          <Button
            type="submit"
            className="h-12 w-full bg-red-500 hover:bg-red-600"
          >
            Salvar Captura
          </Button>
        </form>
      )}

      <div className="mt-12 flex flex-col items-center">
        <h1 className="font-bangers text-3xl">Capturas Registradas</h1>

        <div className="mt-2 flex justify-center gap-2">
          <Select value={orderBy} onValueChange={handleOrderBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="desc">Mais Recentes</SelectItem>
                <SelectItem value="asc">Mais Antigas</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Pagination>
            <PaginationContent className="rounded-md">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handleChangePage(page - 1)}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => handleChangePage(page + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          {!isFetching ? (
            <>
              {captures && captures.length > 0 ? (
                captures.map((item: any) => {
                  return (
                    <Capture
                      key={item.id}
                      id={item.id}
                      pokemonName={item.pokemonName}
                      location={item.location}
                      description={item.description}
                      element1={config.ELEMENT_TYPES.find(
                        (type) => type.key === item.element1,
                      )}
                      element2={config.ELEMENT_TYPES.find(
                        (type) => type.key === item.element2,
                      )}
                      status={item.status}
                      imageFileType={item.imageFileType}
                      createdAt={item.createdAt}
                    />
                  )
                })
              ) : (
                <p className="text-red-500">Não há registros nesta página.</p>
              )}
            </>
          ) : (
            <p>Carregando dados...</p>
          )}
        </div>
      </div>

      {captures && captures.length > 0 && (
        <Pagination className="mt-6">
          <PaginationContent className="rounded-md">
            <PaginationItem>
              <PaginationPrevious onClick={() => handleChangePage(page - 1)} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {page}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => handleChangePage(page + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="mt-6 mb-12 flex flex-col items-center">
        <strong>Desenvolvido por</strong>
        <a
          className="underline"
          href="https://www.instagram.com/henriquegasparotte/"
        >
          @henriquegasparotte
        </a>
        <a
          className="underline"
          href="https://www.instagram.com/victor.fogarolli/"
        >
          @victor.fogarolli
        </a>
      </div>
    </main>
  )
}
