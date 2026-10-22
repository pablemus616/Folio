import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Tooltip from '@mui/material/Tooltip'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import type { ChatModel, DocumentItem } from '../../api/types'
import { ACCEPTED_FILES } from '../../config'
import { DocumentChip, type PendingUpload } from './DocumentChip'
import { ModelPicker } from './ModelPicker'

interface ComposerProps {
  onSend: (content: string) => void
  onStop: () => void
  onFiles: (files: File[]) => void
  onRemoveDocument: (document: DocumentItem) => void
  streaming: boolean
  documents: DocumentItem[]
  pendingUploads: PendingUpload[]
  models: ChatModel[]
  model: string
  onModelChange: (id: string) => void
  thinking: boolean
  onThinkingChange: (value: boolean) => void
  draft?: { text: string; key: number }
  autoFocus?: boolean
  placeholder?: string
}

export function Composer({
  onSend,
  onStop,
  onFiles,
  onRemoveDocument,
  streaming,
  documents,
  pendingUploads,
  models,
  model,
  onModelChange,
  thinking,
  onThinkingChange,
  draft,
  autoFocus,
  placeholder = '¿En qué puedo ayudarte hoy?',
}: ComposerProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const canSend = value.trim().length > 0 && !streaming

  useEffect(() => {
    if (!draft) return
    setValue(draft.text)
    inputRef.current?.focus()
  }, [draft])

  const submit = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  const hasChips = documents.length > 0 || pendingUploads.length > 0

  return (
    <Box
      onClick={() => inputRef.current?.focus()}
      sx={{
        width: '100%',
        borderRadius: '22px',
        border: '1px solid var(--folio-border)',
        bgcolor: 'var(--folio-surface)',
        boxShadow: 'var(--folio-shadow)',
        transition: 'border-color 150ms, box-shadow 150ms',
        cursor: 'text',
        '&:focus-within': { borderColor: 'var(--folio-border-strong)' },
      }}
    >
      {hasChips && (
        <Box sx={{ display: 'flex', gap: 1, px: 1.5, pt: 1.5, overflowX: 'auto' }}>
          {documents.map((document) => (
            <DocumentChip key={document.id} document={document} onRemove={() => onRemoveDocument(document)} />
          ))}
          {pendingUploads.map((pending) => (
            <DocumentChip key={pending.key} pending={pending} />
          ))}
        </Box>
      )}

      <InputBase
        inputRef={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        multiline
        maxRows={10}
        fullWidth
        sx={{
          px: 2.25,
          pt: 2,
          pb: 1,
          fontSize: 16,
          lineHeight: 1.55,
          '& textarea::placeholder': { color: 'var(--folio-muted)', opacity: 1 },
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, pb: 1.25 }}>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_FILES}
          multiple
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            if (files.length) onFiles(files)
            event.target.value = ''
          }}
        />
        <Tooltip title="Adjuntar documentos (PDF, DOCX, TXT, MD)">
          <IconButton
            onClick={(event) => {
              event.stopPropagation()
              fileRef.current?.click()
            }}
            sx={{ border: '1px solid var(--folio-border)', width: 34, height: 34 }}
            aria-label="Adjuntar documentos"
          >
            <AttachFileRoundedIcon sx={{ fontSize: 18, transform: 'rotate(45deg)' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={thinking ? 'Razonamiento extendido activado' : 'Activar razonamiento extendido'}>
          <ButtonBase
            onClick={(event) => {
              event.stopPropagation()
              onThinkingChange(!thinking)
            }}
            aria-pressed={thinking}
            sx={{
              gap: 0.6,
              height: 34,
              px: 1.25,
              borderRadius: '10px',
              fontSize: 13,
              fontWeight: 500,
              border: '1px solid',
              borderColor: thinking ? 'transparent' : 'var(--folio-border)',
              color: thinking ? 'var(--folio-accent)' : 'var(--folio-muted)',
              bgcolor: thinking ? 'var(--folio-accent-soft)' : 'transparent',
              transition: 'all 150ms',
              '&:hover': { color: thinking ? 'var(--folio-accent)' : 'var(--folio-text)' },
            }}
          >
            <LightbulbOutlinedIcon sx={{ fontSize: 17 }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Razonar
            </Box>
          </ButtonBase>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        <Box onClick={(event) => event.stopPropagation()}>
          <ModelPicker models={models} value={model} onChange={onModelChange} />
        </Box>

        {streaming ? (
          <Tooltip title="Detener">
            <IconButton
              onClick={(event) => {
                event.stopPropagation()
                onStop()
              }}
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'var(--folio-text)',
                color: 'var(--folio-bg)',
                '&:hover': { bgcolor: 'var(--folio-text)', color: 'var(--folio-bg)', opacity: 0.85 },
              }}
              aria-label="Detener respuesta"
            >
              <StopRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        ) : (
          <IconButton
            onClick={(event) => {
              event.stopPropagation()
              submit()
            }}
            disabled={!canSend}
            sx={{
              width: 34,
              height: 34,
              bgcolor: 'var(--folio-accent)',
              color: '#fff',
              transition: 'opacity 150ms, transform 150ms',
              '&:hover': { bgcolor: 'var(--folio-accent)', color: '#fff', transform: 'scale(1.05)' },
              '&.Mui-disabled': { bgcolor: 'var(--folio-accent)', color: '#fff', opacity: 0.35 },
            }}
            aria-label="Enviar mensaje"
          >
            <ArrowUpwardRoundedIcon sx={{ fontSize: 19 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}
