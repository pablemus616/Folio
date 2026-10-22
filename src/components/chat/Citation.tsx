import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { MessageSource } from '../../api/types'
import { useOpenPreview } from '../documents/previewContext'

export function Citation({ source }: { source: MessageSource }) {
  const openPreview = useOpenPreview()
  return (
    <Tooltip
      enterDelay={150}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'var(--folio-surface)',
            color: 'var(--folio-text)',
            border: '1px solid var(--folio-border)',
            boxShadow: 'var(--folio-shadow)',
            maxWidth: 360,
            p: 1.5,
          },
        },
      }}
      title={
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }} noWrap>
            {source.filename}
            {source.page_number ? ` · pág. ${source.page_number}` : ''}
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              lineHeight: 1.5,
              color: 'var(--folio-muted)',
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {source.snippet}
          </Typography>
        </Box>
      }
    >
      <ButtonBase
        onClick={() =>
          openPreview({
            documentId: source.document_id,
            filename: source.filename,
            page: source.page_number,
            highlight: source.snippet,
          })
        }
        sx={{
          mx: 0.25,
          minWidth: 20,
          height: 20,
          px: 0.6,
          borderRadius: '6px',
          verticalAlign: 'text-top',
          fontFamily: 'var(--folio-sans)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--folio-accent)',
          bgcolor: 'var(--folio-accent-soft)',
          transition: 'background-color 120ms, color 120ms',
          '&:hover': { bgcolor: 'var(--folio-accent)', color: '#fff' },
        }}
      >
        {source.index}
      </ButtonBase>
    </Tooltip>
  )
}
