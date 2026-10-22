import { useSyncExternalStore } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { queryKeys } from '../api/endpoints'
import { streamServerEvents } from '../api/sse'
import type { Conversation, ConversationDetail, Message, MessageSource } from '../api/types'

export type StreamPhase = 'connecting' | 'searching' | 'thinking' | 'writing' | 'finishing' | 'stopped' | 'error'

export interface ActiveStream {
  conversationId: string
  userMessage: Message
  text: string
  thoughts: string
  sources: MessageSource[]
  phase: StreamPhase
  error: string | null
  model: string
  regenerate: boolean
  thinkingStartedAt: number | null
  thinkingEndedAt: number | null
  controller: AbortController
}

interface StartOptions {
  conversationId: string
  content?: string
  lastUserMessage?: Message
  model: string
  thinking: boolean
  queryClient: QueryClient
}

const streams = new Map<string, ActiveStream>()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function patch(conversationId: string, changes: Partial<ActiveStream>) {
  const current = streams.get(conversationId)
  if (!current) return
  streams.set(conversationId, { ...current, ...changes })
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useActiveStream(conversationId: string | undefined): ActiveStream | undefined {
  return useSyncExternalStore(subscribe, () => (conversationId ? streams.get(conversationId) : undefined))
}

export function isStreaming(conversationId: string): boolean {
  const stream = streams.get(conversationId)
  return !!stream && !['stopped', 'error'].includes(stream.phase)
}

export function stopStream(conversationId: string) {
  const stream = streams.get(conversationId)
  if (!stream) return
  stream.controller.abort()
}

export function dismissStream(conversationId: string) {
  if (streams.delete(conversationId)) emit()
}

function optimisticUserMessage(content: string): Message {
  return {
    id: `pending-${crypto.randomUUID()}`,
    role: 'user',
    content,
    thoughts: null,
    sources: null,
    model: null,
    stopped: false,
    created_at: new Date().toISOString(),
  }
}

export async function startStream({ conversationId, content, lastUserMessage, model, thinking, queryClient }: StartOptions) {
  if (isStreaming(conversationId)) return
  const regenerate = content === undefined
  const controller = new AbortController()
  streams.set(conversationId, {
    conversationId,
    userMessage: lastUserMessage ?? optimisticUserMessage(content ?? ''),
    text: '',
    thoughts: '',
    sources: [],
    phase: 'connecting',
    error: null,
    model,
    regenerate,
    thinkingStartedAt: null,
    thinkingEndedAt: null,
    controller,
  })
  emit()

  const refresh = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.conversation(conversationId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations }),
    ])
  }

  let failed = false
  try {
    await streamServerEvents(
      regenerate ? `/conversations/${conversationId}/regenerate` : `/conversations/${conversationId}/messages`,
      regenerate ? { model, thinking } : { content, model, thinking },
      controller.signal,
      ({ event, data }) => {
        const current = streams.get(conversationId)
        if (!current) return
        const payload = data as Record<string, unknown>
        switch (event) {
          case 'start':
            patch(conversationId, {
              userMessage: payload.user_message as Message,
              phase: 'connecting',
            })
            break
          case 'sources':
            patch(conversationId, { sources: data as MessageSource[], phase: 'searching' })
            break
          case 'thought':
            patch(conversationId, {
              thoughts: current.thoughts + String(payload.text ?? ''),
              phase: 'thinking',
              thinkingStartedAt: current.thinkingStartedAt ?? Date.now(),
            })
            break
          case 'delta':
            patch(conversationId, {
              text: current.text + String(payload.text ?? ''),
              phase: 'writing',
              thinkingEndedAt: current.thinkingStartedAt && !current.thinkingEndedAt ? Date.now() : current.thinkingEndedAt,
            })
            break
          case 'title':
            updateTitle(queryClient, conversationId, String(payload.title ?? ''))
            break
          case 'error':
            failed = true
            patch(conversationId, { phase: 'error', error: String(payload.message ?? 'Ocurrió un error') })
            break
          case 'done':
            if (!failed) patch(conversationId, { phase: 'finishing' })
            break
        }
      },
    )
    await refresh()
    if (failed) return
    dismissStream(conversationId)
  } catch (error) {
    if (controller.signal.aborted) {
      patch(conversationId, { phase: 'stopped' })
      await new Promise((resolve) => setTimeout(resolve, 700))
      await refresh()
      dismissStream(conversationId)
      return
    }
    const message = error instanceof ApiError ? error.message : 'Se perdió la conexión con el servidor'
    patch(conversationId, { phase: 'error', error: message })
    await refresh().catch(() => undefined)
  }
}

function updateTitle(queryClient: QueryClient, conversationId: string, title: string) {
  if (!title) return
  queryClient.setQueryData<Conversation[]>(queryKeys.conversations, (list) =>
    list?.map((item) => (item.id === conversationId ? { ...item, title } : item)),
  )
  queryClient.setQueryData<ConversationDetail>(queryKeys.conversation(conversationId), (detail) =>
    detail ? { ...detail, title } : detail,
  )
}
