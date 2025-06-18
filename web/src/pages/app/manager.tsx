import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Capture } from '@/components/capture'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { CircleNotchIcon } from '@phosphor-icons/react'
import { config } from '@/config'

export function Manager() {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()

  let page = Number(searchParams.get('page')) || 1
  let orderBy = searchParams.get('order_by') || 'asc'
  let status = searchParams.get('status') || 'pending'
  const [filteringPatrolId, setFilteringPatrolId] = useState(
    searchParams.get('patrol_id') || '',
  )

  const { data: captures, isFetching } = useQuery({
    queryKey: ['all-captures', page, orderBy, status, filteringPatrolId],
    queryFn: async () => {
      const response = await api.get(
        `/captures/all?page=${page}&order_by=${orderBy}&status=${status}&patrol_id=${filteringPatrolId}`,
      )

      return response.data.captures
    },
  })

  const { data: leaderboard, refetch: refetchLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await api.get(`/patrols/leaderboard`)

      console.log(response)

      return response.data
    },
  })

  const {
    mutateAsync: comparePatrolsRequest,
    data: comparePatrolsData,
    isPending,
  } = useMutation({
    mutationFn: async (data: { patrolId1: string; patrolId2: string }) => {
      const response = await api.post(`/patrols/compare`, {
        patrolId1: data.patrolId1,
        patrolId2: data.patrolId2,
      })

      return response.data
    },
    onError: () => {
      alert(`Ocorreu um erro ao comparar as patrulhas.`)
    },
  })

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

  function handleChangeStatus(value: string) {
    status = value

    setSearchParams((state) => {
      state.set('status', value)

      return state
    })
  }

  function handleFilterPatrolId(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value

    setFilteringPatrolId(value)

    setSearchParams((state) => {
      if (value) {
        state.set('patrol_id', value)
      } else {
        state.delete('patrol_id')
      }

      return state
    })
  }

  async function handleComparePatrols(event: FormEvent) {
    event.preventDefault()

    const patrolId1 = (
      document.getElementById('patrol-id-1') as HTMLInputElement
    ).value
    const patrolId2 = (
      document.getElementById('patrol-id-2') as HTMLInputElement
    ).value

    if (!patrolId1 || !patrolId2) {
      alert('Há campos faltando!')
      return
    }

    if (patrolId1 === patrolId2) {
      alert('Os IDs precisam ser diferentes.')
      return
    }

    await comparePatrolsRequest({ patrolId1, patrolId2 })
  }

  async function handleToggleLeaderboard() {
    setIsLeaderboardOpen(!isLeaderboardOpen)

    if (!isLeaderboardOpen) {
      refetchLeaderboard()
    }
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="font-bangers mt-12 text-5xl uppercase">
        Painel do Gestor
      </h1>

      <Button className="mt-3 w-64 bg-red-500 px-5 hover:bg-red-600" asChild>
        <a href="/logout">Sair</a>
      </Button>

      <div className="mt-8 flex flex-col items-center">
        <h3 className="font-bangers text-3xl uppercase">Comparar Patrulhas</h3>

        <form
          onSubmit={handleComparePatrols}
          className="mt-2 flex w-72 flex-col gap-2 rounded-md bg-white p-4 text-black"
        >
          <Input id="patrol-id-1" type="text" placeholder="ID Patrulha 1" />
          <Input id="patrol-id-2" type="text" placeholder="ID Patrulha 2" />

          <Button
            className="h-12 w-full bg-emerald-500 hover:bg-emerald-600 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {!isPending ? (
              'Comparar'
            ) : (
              <CircleNotchIcon className="animate-spin" />
            )}
          </Button>

          {comparePatrolsData && (
            <div className="flex w-full flex-col rounded-md border px-3 py-2 shadow-xs">
              {comparePatrolsData.result}

              {comparePatrolsData.statistics && (
                <span className="mt-2 flex flex-col gap-1">
                  <strong>Estatísticas:</strong>
                  <div className="flex flex-col">
                    <strong>Patrulha 1:</strong>
                    <span>
                      Nome: {comparePatrolsData.statistics.patrol1.name}
                    </span>
                    <span>
                      Capturas aprovadas:{' '}
                      {comparePatrolsData.statistics.patrol1.captures}
                    </span>
                    <span>
                      Pontos: {comparePatrolsData.statistics.patrol1.points}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <strong>Patrulha 2:</strong>
                    <span>
                      Nome: {comparePatrolsData.statistics.patrol2.name}
                    </span>
                    <span>
                      Capturas aprovadas:{' '}
                      {comparePatrolsData.statistics.patrol2.captures}
                    </span>
                    <span>
                      Pontos: {comparePatrolsData.statistics.patrol2.points}
                    </span>
                  </div>

                  <div>
                    <strong>Diferença de pontos:</strong> <span>1</span>
                  </div>
                </span>
              )}
            </div>
          )}
        </form>
      </div>

      <div className="w-72">
        {!isLeaderboardOpen ? (
          <Button
            className="mt-6 h-10 w-full bg-amber-500 hover:bg-amber-600"
            onClick={handleToggleLeaderboard}
          >
            Abrir Leaderboard
          </Button>
        ) : (
          <Button
            className="mt-6 h-10 w-full bg-red-500 hover:bg-red-600"
            onClick={handleToggleLeaderboard}
          >
            Fechar Leaderboard
          </Button>
        )}

        {isLeaderboardOpen && (
          <div className="mt-2 flex w-full flex-col rounded-md bg-white p-4 text-black">
            {Object.keys(leaderboard).map((key) => {
              const value = leaderboard[key]

              if (!value) {
                return <></>
              }

              return (
                <span key={`leaderboard-${key}`} className="flex flex-col">
                  <span>
                    <strong>{key}º</strong> {value.patrol.name} (
                    {value.patrol.id})
                  </span>
                  <span>- {value.count} capturas</span>
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <h1 className="font-bangers text-3xl">Capturas Registradas</h1>

        <div className="mt-2 flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-2">
            <div className="flex justify-center gap-2">
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

              <Select value={status} onValueChange={handleChangeStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {config.STATUS.map((status) => (
                      <SelectItem key={status.key} value={status.key}>
                        {status.emoji} {status.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Input
              id="filter"
              type="text"
              placeholder="Filtrar por ID da Patrulha"
              className="w-56"
              value={filteringPatrolId}
              onChange={handleFilterPatrolId}
            />
          </div>

          <Pagination className="mt-2">
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
                      patrolId={item.patrolId}
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
                      processedById={item.processedById}
                      processedByName={item.processedByName}
                      createdAt={item.createdAt}
                      variant="manager"
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

        <Pagination className="mt-6 mb-12">
          {captures && captures.length > 0 && (
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
          )}
        </Pagination>
      </div>
    </main>
  )
}
