import { useMemo } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import type { MessageSource } from '../../api/types'
import type { StreamPhase } from '../../store/chatStreams'
import { useSmoothText } from '../../hooks/useSmoothText'
import { LogoMark } from '../common/Logo'
import { Markdown } from '../markdown/Markdown'
import { MessageActions } from './MessageActions'
import { SourcesList, citedSources } from './SourcesList'
import { ThinkingBlock } from './ThinkingBlock'

interface AssistantMessageProps {
  content: string
  thoughts?: string | null
  sources?: MessageSource[] | null
  stopped?: boolean
  modelName?: string | null
  phase?: StreamPhase
  thinkingSeconds?: number | null
  error?: string | null
  onRegenerate?: () => void
}

const STATUS_LABELS: Partial<Record<StreamPhase, string>> = {
  connecting: 'Pensando…',
  searching: 'Leyendo tus documentos…',
  thinking: 'Razonando…',
}

export function AssistantMessage({
  content,
  thoughts,
  sources,
  stopped,
  modelName,
  phase,
  thinkingSeconds,
  error,
  onRegenerate,
}: AssistantMessageProps) {
  const live = phase !== undefined && !['stopped', 'error'].includes(phase)
  const text = useSmoothText(content, phase !== undefined)
  const allSources = sources ?? []
  const cited = useMemo(() => citedSources(content, allSources), [content, allSources])
  const showStatus = live && !text && phase !== 'thinking'
  const finished = phase === undefined

  return (
    <Box
      sx={{
        position: 'relative',
        '&:hover .message-actions, &:focus-within .message-actions': { opacity: 1 },
      }}
    >
      {thoughts && (
        <ThinkingBlock thoughts={thoughts} active={phase === 'thinking'} seconds={thinkingSeconds} />
      )}

      {showStatus && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.5 }}>
          <LogoMark size={22} pulsing />
          <Typography sx={{ fontSize: 14, color: 'var(--folio-muted)' }}>
            {STATUS_LABELS[phase ?? 'connecting'] ?? 'Pensando…'}
          </Typography>
        </Box>
      )}

      {text && <Markdown text={text} sources={allSources} />}

      {live && text && (
        <Box sx={{ mt: 1.5 }}>
          <LogoMark size={20} pulsing />
        </Box>
      )}

      {stopped && (
        <Typography sx={{ mt: 1, fontSize: 12.5, color: 'var(--folio-muted)', fontStyle: 'italic' }}>
          Respuesta detenida
        </Typography>
      )}

      {error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mt: text ? 2 : 0, borderRadius: '12px', alignItems: 'center' }}
          action={
            onRegenerate && (
              <Button color="inherit" size="small" onClick={onRegenerate}>
                Reintentar
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      {finished && <SourcesList sources={cited} />}

      {finished && (
        <Fade in>
          <Box
            className="message-actions"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              mt: 1,
              ml: -0.75,
              opacity: onRegenerate ? 1 : 0,
              transition: 'opacity 150ms',
            }}
          >
            <MessageActions text={content} onRegenerate={onRegenerate} />
            {modelName && (
              <Typography sx={{ fontSize: 12, color: 'var(--folio-muted)', ml: 1 }}>{modelName}</Typography>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  )
}
