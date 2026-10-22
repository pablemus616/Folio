import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import type { MessageSource } from '../../api/types'
import { useOpenPreview } from '../documents/previewContext'
import { FileIcon } from '../documents/FileIcon'

export function citedSources(text: string, sources: MessageSource[]): MessageSource[] {
  const cited = new Set(Array.from(text.matchAll(/\[(\d{1,2})\]/g), (match) => Number(match[1])))
  return sources.filter((source) => cited.has(source.index))
}

export function SourcesList({ sources }: { sources: MessageSource[] }) {
  const openPreview = useOpenPreview()
  if (sources.length === 0) return null
  return (
    <Box sx={{ mt: 2 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--folio-muted)', mb: 1, letterSpacing: '0.04em' }}>
        FUENTES
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {sources.map((source) => (
          <ButtonBase
            key={source.index}
            onClick={() =>
              openPreview({
                documentId: source.document_id,
                filename: source.filename,
                page: source.page_number,
                highlight: source.snippet,
              })
            }
            sx={{
              gap: 1,
              pl: 0.75,
              pr: 1.5,
              py: 0.6,
              maxWidth: 300,
              borderRadius: '10px',
              border: '1px solid var(--folio-border)',
              bgcolor: 'var(--folio-surface)',
              textAlign: 'left',
              transition: 'border-color 120ms, transform 120ms',
              '&:hover': { borderColor: 'var(--folio-accent)', transform: 'translateY(-1px)' },
            }}
          >
            <FileIcon filename={source.filename} size={26} />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 600 }}>
                <Box component="span" sx={{ color: 'var(--folio-accent)', mr: 0.75 }}>
                  {source.index}
                </Box>
                {source.filename}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: 'var(--folio-muted)' }}>
                {source.page_number ? `Página ${source.page_number}` : 'Fragmento'} · {Math.round(source.score * 100)}% relevancia
              </Typography>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  )
}
