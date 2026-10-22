import { apiBlob, apiFetch } from './client'
import type { ChatModels, Conversation, ConversationDetail, DocumentItem } from './types'

export const queryKeys = {
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  models: ['models'] as const,
}

export const api = {
  listConversations: () => apiFetch<Conversation[]>('/conversations'),
  getConversation: (id: string) => apiFetch<ConversationDetail>(`/conversations/${id}`),
  createConversation: () => apiFetch<Conversation>('/conversations', { method: 'POST', body: JSON.stringify({}) }),
  renameConversation: (id: string, title: string) =>
    apiFetch<Conversation>(`/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }),
  deleteConversation: (id: string) => apiFetch<void>(`/conversations/${id}`, { method: 'DELETE' }),
  uploadDocument: (conversationId: string, file: File) => {
    const body = new FormData()
    body.append('file', file)
    return apiFetch<DocumentItem>(`/conversations/${conversationId}/documents`, { method: 'POST', body })
  },
  deleteDocument: (id: string) => apiFetch<void>(`/documents/${id}`, { method: 'DELETE' }),
  documentFile: (id: string) => apiBlob(`/documents/${id}/file`),
  models: () => apiFetch<ChatModels>('/models'),
}
