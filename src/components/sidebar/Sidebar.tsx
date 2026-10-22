import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined'
import { api, queryKeys } from '../../api/endpoints'
import type { Conversation } from '../../api/types'
import { dismissStream, stopStream } from '../../store/chatStreams'
import { Logo } from '../common/Logo'
import { ConversationItem } from './ConversationItem'
import { groupConversations } from './groupConversations'

interface SidebarProps {
  onClose: () => void
  onNavigate: () => void
}

export function Sidebar({ onClose, onNavigate }: SidebarProps) {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [toDelete, setToDelete] = useState<Conversation | null>(null)

  const conversations = useQuery({ queryKey: queryKeys.conversations, queryFn: api.listConversations })
  const groups = useMemo(() => groupConversations(conversations.data ?? []), [conversations.data])

  const rename = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => api.renameConversation(id, title),
    onMutate: ({ id, title }) => {
      queryClient.setQueryData<Conversation[]>(queryKeys.conversations, (list) =>
        list?.map((item) => (item.id === id ? { ...item, title } : item)),
      )
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversation(id) })
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.deleteConversation(id),
    onMutate: (id) => {
      stopStream(id)
      dismissStream(id)
      queryClient.setQueryData<Conversation[]>(queryKeys.conversations, (list) => list?.filter((item) => item.id !== id))
      if (id === conversationId) navigate('/')
    },
    onSettled: (_data, _error, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.conversation(id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
    },
  })

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'var(--folio-sidebar)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, height: 56, flexShrink: 0 }}>
        <ButtonBase onClick={() => navigate('/')} sx={{ borderRadius: '8px', px: 0.5 }} aria-label="Ir al inicio">
          <Logo />
        </ButtonBase>
        <Tooltip title="Cerrar barra lateral">
          <IconButton onClick={onClose} aria-label="Cerrar barra lateral">
            <ViewSidebarOutlinedIcon sx={{ fontSize: 20, transform: 'scaleX(-1)' }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 1.5, pb: 1 }}>
        <Button
          fullWidth
          onClick={() => {
            navigate('/')
            onNavigate()
          }}
          startIcon={
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'var(--folio-accent)',
                color: '#fff',
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
          }
          sx={{
            justifyContent: 'flex-start',
            px: 1,
            py: 0.9,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--folio-accent)',
            '&:hover': { bgcolor: 'var(--folio-hover)' },
          }}
        >
          Nuevo chat
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, pb: 2 }}>
        {conversations.isLoading &&
          Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={30} sx={{ my: 0.75, borderRadius: '8px' }} />
          ))}
        {conversations.data?.length === 0 && (
          <Typography sx={{ px: 1.25, py: 2, fontSize: 13, color: 'var(--folio-muted)' }}>
            Tus conversaciones aparecerán aquí.
          </Typography>
        )}
        {groups.map((group) => (
          <Box key={group.label} sx={{ mt: 2 }}>
            <Typography sx={{ px: 1.25, mb: 0.5, fontSize: 12, fontWeight: 500, color: 'var(--folio-muted)' }}>
              {group.label}
            </Typography>
            {group.items.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === conversationId}
                onNavigate={onNavigate}
                onRename={(title) => rename.mutate({ id: conversation.id, title })}
                onDelete={() => setToDelete(conversation)}
              />
            ))}
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 2.5, py: 1.75, borderTop: '1px solid var(--folio-border)' }}>
        <Typography sx={{ fontSize: 12, color: 'var(--folio-muted)', lineHeight: 1.5 }}>
          RAG con Gemini, FastAPI y pgvector.
          <br />
          Tus chats se guardan solo para este navegador.
        </Typography>
      </Box>

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: 'var(--folio-serif)', fontSize: 21 }}>¿Eliminar conversación?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'var(--folio-muted)', fontSize: 14.5 }}>
            Se eliminará «{toDelete?.title}» junto con sus documentos. Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setToDelete(null)} sx={{ color: 'var(--folio-text)' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disableElevation
            onClick={() => {
              if (toDelete) remove.mutate(toDelete.id)
              setToDelete(null)
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
