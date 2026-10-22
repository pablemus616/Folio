import { useMemo, useState, type DragEvent } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import Zoom from '@mui/material/Zoom'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { ApiError } from '../../api/client'
import { api, queryKeys } from '../../api/endpoints'
import type { Conversation, ConversationDetail, DocumentItem, Message } from '../../api/types'
import { useStickToBottom } from '../../hooks/useStickToBottom'
import { startStream, stopStream, useActiveStream } from '../../store/chatStreams'
import { usePersistentState } from '../../store/preferences'
import type { ShellContext } from '../layout/AppShell'
import { ChatHeader } from './ChatHeader'
import { AssistantMessage } from './AssistantMessage'
import { Composer } from './Composer'
import type { PendingUpload } from './DocumentChip'
import { EmptyState } from './EmptyState'
import { UserMessage } from './UserMessage'

const CONTENT_WIDTH = 760

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : 'Algo salió mal. Inténtalo de nuevo.'
}

export function ChatView() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const shell = useOutletContext<ShellContext>()

  const modelsQuery = useQuery({ queryKey: queryKeys.models, queryFn: api.models, staleTime: Infinity })
  const [storedModel, setModel] = usePersistentState('folio.model', '')
  const [thinking, setThinking] = usePersistentState('folio.thinking', false)
  const models = modelsQuery.data?.models ?? []
  const model = models.some((item) => item.id === storedModel) ? storedModel : (modelsQuery.data?.default ?? '')

  const detailQuery = useQuery({
    queryKey: queryKeys.conversation(conversationId ?? ''),
    queryFn: () => api.getConversation(conversationId!),
    enabled: !!conversationId,
    refetchInterval: (query) =>
      query.state.data?.documents.some((document) => document.status === 'processing') ? 1500 : false,
  })
  const detail = detailQuery.data
  const stream = useActiveStream(conversationId)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ text: string; key: number }>()
  const [dragging, setDragging] = useState(false)

  const streaming = !!stream && !['stopped', 'error'].includes(stream.phase)

  const view = useMemo(() => {
    const serverMessages = detail?.messages ?? []
    if (!stream) return { messages: serverMessages, streamUser: false, streamAssistant: false }
    const userIndex = serverMessages.findIndex((message) => message.id === stream.userMessage.id)
    if (stream.regenerate) {
      return {
        messages: userIndex >= 0 ? serverMessages.slice(0, userIndex + 1) : serverMessages,
        streamUser: false,
        streamAssistant: true,
      }
    }
    if (userIndex >= 0 && userIndex < serverMessages.length - 1) {
      return { messages: serverMessages, streamUser: false, streamAssistant: false }
    }
    return { messages: serverMessages, streamUser: userIndex < 0, streamAssistant: true }
  }, [detail?.messages, stream])

  const { ref: scrollRef, atBottom, scrollToBottom } = useStickToBottom<HTMLDivElement>(
    `${conversationId}-${view.messages.length}-${view.streamAssistant}`,
  )

  const ensureConversation = async (): Promise<string> => {
    if (conversationId) return conversationId
    const created = await api.createConversation()
    queryClient.setQueryData<ConversationDetail>(queryKeys.conversation(created.id), {
      ...created,
      messages: [],
      documents: [],
    })
    queryClient.setQueryData<Conversation[]>(queryKeys.conversations, (list) => [created, ...(list ?? [])])
    navigate(`/c/${created.id}`)
    return created.id
  }

  const send = async (content: string) => {
    try {
      const id = await ensureConversation()
      void startStream({ conversationId: id, content, model, thinking, queryClient })
      requestAnimationFrame(() => scrollToBottom('auto'))
    } catch (error) {
      setNotice(errorText(error))
    }
  }

  const regenerate = () => {
    if (!conversationId) return
    const lastUser = [...(detail?.messages ?? [])].reverse().find((message) => message.role === 'user')
    if (!lastUser) return
    void startStream({ conversationId, lastUserMessage: lastUser, model, thinking, queryClient })
  }

  const uploadFiles = async (files: File[]) => {
    let id: string
    try {
      id = await ensureConversation()
    } catch (error) {
      setNotice(errorText(error))
      return
    }
    await Promise.all(
      files.map(async (file) => {
        const pending = { key: crypto.randomUUID(), filename: file.name }
        setPendingUploads((items) => [...items, pending])
        try {
          const uploaded = await api.uploadDocument(id, file)
          queryClient.setQueryData<ConversationDetail>(queryKeys.conversation(id), (current) =>
            current ? { ...current, documents: [...current.documents, uploaded] } : current,
          )
        } catch (error) {
          setNotice(`${file.name}: ${errorText(error)}`)
        } finally {
          setPendingUploads((items) => items.filter((item) => item.key !== pending.key))
          void queryClient.invalidateQueries({ queryKey: queryKeys.conversation(id) })
        }
      }),
    )
  }

  const removeDocument = async (document: DocumentItem) => {
    try {
      await api.deleteDocument(document.id)
      queryClient.setQueryData<ConversationDetail>(queryKeys.conversation(document.conversation_id), (current) =>
        current ? { ...current, documents: current.documents.filter((item) => item.id !== document.id) } : current,
      )
    } catch (error) {
      setNotice(errorText(error))
    }
  }

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    setDragging(true)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length) void uploadFiles(files)
  }

  const modelName = (id: string | null) => models.find((item) => item.id === id)?.name ?? id
  const notFound = detailQuery.error instanceof ApiError && detailQuery.error.status === 404
  const isNewChat = !conversationId
  const lastMessage: Message | undefined = view.messages[view.messages.length - 1]

  const composer = (
    <Composer
      onSend={send}
      onStop={() => conversationId && stopStream(conversationId)}
      onFiles={uploadFiles}
      onRemoveDocument={removeDocument}
      streaming={streaming}
      documents={detail?.documents ?? []}
      pendingUploads={pendingUploads}
      models={models}
      model={model}
      onModelChange={setModel}
      thinking={thinking}
      onThinkingChange={setThinking}
      draft={draft}
      autoFocus
      placeholder={
        detail?.documents.length ? 'Pregunta lo que quieras sobre tus documentos…' : '¿En qué puedo ayudarte hoy?'
      }
    />
  )

  return (
    <Box
      onDragOver={onDragOver}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
      }}
      onDrop={onDrop}
      sx={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <ChatHeader
        title={isNewChat ? null : (detail?.title ?? null)}
        conversationId={conversationId}
        onOpenSidebar={shell.openSidebar}
        sidebarOpen={shell.sidebarOpen}
      />

      {isNewChat ? (
        <EmptyState composer={composer} onSuggestion={(text) => setDraft({ text, key: Date.now() })} />
      ) : notFound ? (
        <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', px: 3 }}>
          <Box>
            <Typography sx={{ fontFamily: 'var(--folio-serif)', fontSize: 26, mb: 1 }}>
              No encontramos esta conversación
            </Typography>
            <Typography sx={{ color: 'var(--folio-muted)', mb: 3 }}>
              Puede que se haya eliminado o que pertenezca a otro navegador.
            </Typography>
            <Button variant="contained" disableElevation onClick={() => navigate('/')}>
              Empezar un chat nuevo
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <Box sx={{ maxWidth: CONTENT_WIDTH, mx: 'auto', px: { xs: 2, md: 3 }, pt: 3, pb: 4, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {!detail && detailQuery.isLoading && (
                <>
                  <Skeleton variant="rounded" height={44} width="55%" sx={{ alignSelf: 'flex-end', borderRadius: '18px' }} />
                  <Skeleton variant="text" height={28} />
                  <Skeleton variant="text" height={28} width="80%" />
                </>
              )}
              {view.messages.map((message) =>
                message.role === 'user' ? (
                  <UserMessage key={message.id} content={message.content} />
                ) : (
                  <AssistantMessage
                    key={message.id}
                    content={message.content}
                    thoughts={message.thoughts}
                    sources={message.sources}
                    stopped={message.stopped}
                    modelName={modelName(message.model)}
                    onRegenerate={!stream && message === lastMessage ? regenerate : undefined}
                  />
                ),
              )}
              {stream && view.streamUser && <UserMessage content={stream.userMessage.content} />}
              {stream && view.streamAssistant && (
                <AssistantMessage
                  content={stream.text}
                  thoughts={stream.thoughts}
                  sources={stream.sources}
                  phase={stream.phase}
                  error={stream.error}
                  stopped={stream.phase === 'stopped'}
                  thinkingSeconds={
                    stream.thinkingStartedAt && stream.thinkingEndedAt
                      ? Math.max(1, Math.round((stream.thinkingEndedAt - stream.thinkingStartedAt) / 1000))
                      : null
                  }
                  onRegenerate={stream.phase === 'error' ? regenerate : undefined}
                />
              )}
              {!stream && lastMessage?.role === 'user' && (
                <AssistantMessage content="" error="La respuesta no se completó." onRegenerate={regenerate} />
              )}
            </Box>
          </Box>

          <Box sx={{ position: 'relative', px: { xs: 1.5, md: 3 }, pb: { xs: 1.5, md: 2.5 }, pt: 0 }}>
            <Zoom in={!atBottom}>
              <Fab
                size="small"
                onClick={() => scrollToBottom()}
                sx={{
                  position: 'absolute',
                  top: -52,
                  left: '50%',
                  ml: '-20px',
                  bgcolor: 'var(--folio-surface)',
                  color: 'var(--folio-text)',
                  border: '1px solid var(--folio-border)',
                  boxShadow: 'var(--folio-shadow)',
                  '&:hover': { bgcolor: 'var(--folio-surface)' },
                }}
                aria-label="Ir al final"
              >
                <KeyboardArrowDownRoundedIcon />
              </Fab>
            </Zoom>
            <Box sx={{ maxWidth: CONTENT_WIDTH, mx: 'auto' }}>
              {composer}
              <Typography sx={{ textAlign: 'center', fontSize: 11.5, color: 'var(--folio-muted)', mt: 1 }}>
                Folio puede cometer errores. Verifica la información importante en las fuentes.
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {dragging && (
        <Box
          sx={{
            position: 'absolute',
            inset: 12,
            zIndex: 10,
            borderRadius: '24px',
            border: '2px dashed var(--folio-accent)',
            bgcolor: 'color-mix(in srgb, var(--folio-bg) 88%, transparent)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: 'var(--folio-accent)' }} />
            <Typography sx={{ fontFamily: 'var(--folio-serif)', fontSize: 22, mt: 1 }}>Suelta tus archivos aquí</Typography>
            <Typography sx={{ color: 'var(--folio-muted)', fontSize: 14 }}>PDF, DOCX, TXT, MD, CSV o JSON · hasta 15 MB</Typography>
          </Box>
        </Box>
      )}

      <Snackbar
        open={!!notice}
        autoHideDuration={5000}
        onClose={() => setNotice(null)}
        message={notice}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  )
}
