import { Button } from './ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { CircleNotchIcon } from '@phosphor-icons/react'
import { config } from '@/config'
import dayjs from 'dayjs'

export interface CaptureData {
  pokemonName: string
  location?: string
  description?: string
  element1: string
  element2?: string
}

interface Element {
  key: string
  label: string
  iconUrl: string
}

export interface CaptureProps {
  id: string
  patrolId?: string
  pokemonName: string
  location: string
  description?: string
  element1?: Element
  element2?: Element
  status: 'pending' | 'approved' | 'denied'
  imageFileType: string
  processedById?: string
  processedByName?: string
  createdAt: Date
  variant?: 'patrol' | 'manager'
}

export function Capture({
  id,
  patrolId,
  pokemonName,
  location,
  description,
  element1,
  element2,
  status,
  imageFileType,
  processedById,
  processedByName,
  createdAt,
  variant = 'patrol',
}: CaptureProps) {
  const statusInfo = config.STATUS.find((item) => item.key === status)

  const queryClient = useQueryClient()

  const {
    mutateAsync: updateCaptureStatusRequest,
    isPending,
    variables,
  } = useMutation({
    mutationFn: async (data: { status: string }) => {
      await api.patch(`/captures/${id}/status`, {
        status: data.status,
      })
    },
    onSuccess: async (_, variables) => {
      const cachedQueries = queryClient.getQueriesData<CaptureProps[]>({
        queryKey: ['all-captures'],
      })

      cachedQueries.forEach(([key, cached]) => {
        if (!cached) {
          return
        }

        queryClient.setQueryData(
          key,
          cached.map((item) => {
            if (item.id !== id) {
              return item
            }

            return {
              ...item,
              status: variables.status,
            }
          }),
        )
      })
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.data.message) {
        alert(`Erro: ${error.response?.data.message}`)
        return
      }

      alert(`Ocorreu um erro ao atualizar o status da captura.`)
    },
  })

  async function handleChangeCaptureStatus(status: string) {
    await updateCaptureStatusRequest({ status })
  }

  return (
    <div className="flex flex-col items-center rounded-md bg-white p-5 text-black">
      <img
        src={`${import.meta.env.VITE_API_URL}/uploads/${id.concat(imageFileType)}`}
        alt="Não foi possível carregar a imagem"
        className="h-56 w-56 rounded-md object-cover text-center text-red-500"
      />

      <p className="mt-2 text-3xl">{pokemonName}</p>

      {(element1 || element2) && (
        <div className="flex justify-center gap-4 text-xl">
          {element1 && (
            <div className="flex items-center justify-center gap-1">
              <img src={element1.iconUrl} alt="" className="h-5 w-5" />{' '}
              <span>{element1.label}</span>
            </div>
          )}
          {element2 && (
            <div className="flex items-center justify-center gap-1">
              <img src={element2.iconUrl} alt="" className="h-5 w-5" />{' '}
              <span>{element2.label}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-1 flex flex-col items-center text-base">
        <span>
          <strong>Local:</strong> {location}
        </span>
        {description && (
          <span>
            <strong>Descrição:</strong> {description}
          </span>
        )}
        <span>
          <strong>Data:</strong> {dayjs(createdAt).format('lll')}
        </span>
        <span>
          <strong>Status:</strong> {statusInfo?.emoji} {statusInfo?.label}
        </span>
        <span>
          <strong>ID da captura:</strong> {id}
        </span>
        {variant === 'manager' && (
          <>
            <span>
              <strong>ID da patrulha:</strong> {patrolId}
            </span>

            {processedById && (
              <div className="flex flex-col items-center">
                {status === 'approved' && <strong>Aprovada por:</strong>}
                {status === 'denied' && <strong>Negada por:</strong>}

                <span>
                  {processedByName} ({processedById})
                </span>
              </div>
            )}

            {status === 'pending' && (
              <div className="mt-2 flex justify-center gap-2">
                <Button
                  className="w-24 bg-emerald-500 hover:bg-emerald-600 disabled:cursor-not-allowed"
                  onClick={() => handleChangeCaptureStatus('approved')}
                  disabled={isPending && variables.status === 'approved'}
                >
                  {!(isPending && variables.status === 'approved') ? (
                    'Aprovar'
                  ) : (
                    <CircleNotchIcon className="animate-spin" />
                  )}
                </Button>
                <Button
                  className="w-24 bg-red-500 hover:bg-red-600 disabled:cursor-not-allowed"
                  onClick={() => handleChangeCaptureStatus('denied')}
                  disabled={isPending && variables.status === 'denied'}
                >
                  {!(isPending && variables.status === 'denied') ? (
                    'Negar'
                  ) : (
                    <CircleNotchIcon className="animate-spin" />
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
