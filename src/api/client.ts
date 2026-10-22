const CLIENT_ID_KEY = 'folio.client-id'

let memoryClientId: string | null = null

export function getClientId(): string {
  try {
    const stored = localStorage.getItem(CLIENT_ID_KEY)
    if (stored) return stored
    const created = crypto.randomUUID()
    localStorage.setItem(CLIENT_ID_KEY, created)
    return created
  } catch {
    memoryClientId ??= crypto.randomUUID()
    return memoryClientId
  }
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function describeDetail(detail: unknown, status: number): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string }
    if (first?.msg) return first.msg
  }
  if (status === 413) return 'El archivo es demasiado grande'
  if (status >= 500) return 'El servidor tuvo un problema. Inténtalo de nuevo en un momento.'
  return 'Algo salió mal con la solicitud'
}

export async function errorFromResponse(response: Response): Promise<ApiError> {
  let detail: unknown
  try {
    detail = (await response.json()).detail
  } catch {
    detail = undefined
  }
  return new ApiError(response.status, describeDetail(detail, response.status))
}

export function apiHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra)
  headers.set('X-Client-Id', getClientId())
  return headers
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = apiHeaders(init.headers)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  let response: Response
  try {
    response = await fetch(`/api${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor')
  }
  if (!response.ok) throw await errorFromResponse(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function apiBlob(path: string): Promise<Blob> {
  const response = await fetch(`/api${path}`, { headers: apiHeaders() })
  if (!response.ok) throw await errorFromResponse(response)
  return response.blob()
}
