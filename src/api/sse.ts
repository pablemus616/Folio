import { apiHeaders, errorFromResponse } from './client'

export interface ServerEvent {
  event: string
  data: unknown
}

export async function streamServerEvents(
  path: string,
  body: unknown,
  signal: AbortSignal,
  onEvent: (event: ServerEvent) => void,
): Promise<void> {
  const response = await fetch(`/api${path}`, {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json', Accept: 'text/event-stream' }),
    body: JSON.stringify(body),
    signal,
  })
  if (!response.ok || !response.body) throw await errorFromResponse(response)

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value.replace(/\r\n/g, '\n')
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      const parsed = parseBlock(block)
      if (parsed) onEvent(parsed)
      boundary = buffer.indexOf('\n\n')
    }
  }
}

function parseBlock(block: string): ServerEvent | null {
  let event = 'message'
  const data: string[] = []
  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) continue
    const separator = line.indexOf(':')
    const field = separator === -1 ? line : line.slice(0, separator)
    const value = separator === -1 ? '' : line.slice(separator + 1).replace(/^ /, '')
    if (field === 'event') event = value
    if (field === 'data') data.push(value)
  }
  if (data.length === 0) return null
  try {
    return { event, data: JSON.parse(data.join('\n')) }
  } catch {
    return { event, data: data.join('\n') }
  }
}
