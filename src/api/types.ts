export type MessageRole = 'user' | 'assistant'

export interface MessageSource {
  index: number
  document_id: string
  filename: string
  page_number: number | null
  snippet: string
  score: number
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  thoughts: string | null
  sources: MessageSource[] | null
  model: string | null
  stopped: boolean
  created_at: string
}

export type DocumentStatus = 'processing' | 'ready' | 'failed'

export interface DocumentItem {
  id: string
  conversation_id: string
  filename: string
  content_type: string
  size_bytes: number
  status: DocumentStatus
  error: string | null
  page_count: number | null
  chunk_count: number
  processed_chunks: number
  created_at: string
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ConversationDetail extends Conversation {
  messages: Message[]
  documents: DocumentItem[]
}

export interface ChatModel {
  id: string
  name: string
  description: string
}

export interface ChatModels {
  default: string
  models: ChatModel[]
}
