import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import type { DocumentItem } from '../../api/types'
import { FileIcon } from '../documents/FileIcon'
import { useOpenPreview } from '../documents/previewContext'

export interface PendingUpload {
  key: string
  filename: string
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function describe(document: DocumentItem) {
  if (document.status === 'processing') {
    if (document.chunk_count === 0) return 'Leyendo…'
    return `Indexando ${Math.round((document.processed_chunks / document.chunk_count) * 100)}%`
  }
  if (document.status === 'failed') return 'No se pudo procesar'
  const pages = document.page_count ? `${document.page_count} ${document.page_count === 1 ? 'pág.' : 'págs.'} · ` : ''
  return `${pages}${formatSize(document.size_bytes)}`
}

interface DocumentChipProps {
  document?: DocumentItem
  pending?: PendingUpload
  onRemove?: () => void
}

export function DocumentChip({ document, pending, onRemove }: DocumentChipProps) {
  const openPreview = useOpenPreview()
  const filename = document?.filename ?? pending?.filename ?? ''
  const processing = !document || document.status === 'processing'
  const failed = document?.status === 'failed'
  const progress =
    document && document.chunk_count > 0 ? (document.processed_chunks / document.chunk_count) * 100 : undefined

  const chip = (
    <Box
      onClick={() => document?.status === 'ready' && openPreview({ documentId: document.id, filename })}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pl: 0.75,
        pr: onRemove ? 0.5 : 1.5,
        py: 0.75,
        width: 224,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: failed ? 'error.main' : 'var(--folio-border)',
        bgcolor: 'var(--folio-bg)',
        cursor: document?.status === 'ready' ? 'pointer' : 'default',
        animation: 'folio-rise 200ms ease-out',
        '&:hover': document?.status === 'ready' ? { borderColor: 'var(--folio-border-strong)' } : undefined,
      }}
    >
      <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
        <FileIcon filename={filename} size={32} />
        {processing && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '10px',
              bgcolor: 'rgba(0,0,0,0.35)',
            }}
          >
            <CircularProgress
              size={20}
              thickness={5}
              variant={progress === undefined ? 'indeterminate' : 'determinate'}
              value={progress}
              sx={{ color: '#fff' }}
            />
          </Box>
        )}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: 13, fontWeight: 600 }}>
          {filename}
        </Typography>
        <Typography
          noWrap
          sx={{ fontSize: 11.5, color: failed ? 'error.main' : 'var(--folio-muted)', display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          {failed && <ErrorOutlineRoundedIcon sx={{ fontSize: 13 }} />}
          {document ? describe(document) : 'Subiendo…'}
        </Typography>
      </Box>
      {onRemove && (
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          aria-label={`Quitar ${filename}`}
          sx={{ p: 0.5 }}
        >
          <CloseRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  )

  return failed && document?.error ? <Tooltip title={document.error}>{chip}</Tooltip> : chip
}
