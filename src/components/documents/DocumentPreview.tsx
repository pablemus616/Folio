import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { api } from '../../api/endpoints'
import { FileIcon } from './FileIcon'
import type { PreviewTarget } from './previewContext'

interface DocumentPreviewProps {
  target: PreviewTarget | null
  onClose: () => void
}

type LoadedFile = { url: string; type: string; text: string | null }

export function DocumentPreview({ target, onClose }: DocumentPreviewProps) {
  const isMobile = useMediaQuery('(max-width:900px)')
  const [file, setFile] = useState<LoadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const documentId = target?.documentId

  useEffect(() => {
    if (!documentId) return
    let url: string | null = null
    let cancelled = false
    setFile(null)
    setError(null)
    api
      .documentFile(documentId)
      .then(async (blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        const isText = blob.type.startsWith('text/') || blob.type === 'application/json'
        setFile({ url, type: blob.type, text: isText ? await blob.text() : null })
      })
      .catch((reason: Error) => !cancelled && setError(reason.message))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [documentId])

  const isPdf = file?.type === 'application/pdf'
  const pdfUrl = file && isPdf ? `${file.url}#page=${target?.page ?? 1}&view=FitH` : null

  return (
    <Drawer
      anchor="right"
      open={!!target}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: isMobile ? '100vw' : 'min(52vw, 820px)',
            bgcolor: 'var(--folio-bg)',
            borderLeft: '1px solid var(--folio-border)',
          },
        },
      }}
    >
      {target && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.5,
              borderBottom: '1px solid var(--folio-border)',
            }}
          >
            <FileIcon filename={target.filename} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography noWrap sx={{ fontWeight: 600, fontSize: 14 }}>
                {target.filename}
              </Typography>
              {target.page && (
                <Typography sx={{ fontSize: 12, color: 'var(--folio-muted)' }}>Página {target.page}</Typography>
              )}
            </Box>
            {file && (
              <Tooltip title="Descargar">
                <IconButton component="a" href={file.url} download={target.filename}>
                  <DownloadRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Cerrar">
              <IconButton onClick={onClose}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
            {!file && !error && (
              <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
                <CircularProgress size={28} />
              </Box>
            )}
            {error && (
              <Typography sx={{ p: 3, color: 'error.main' }}>{error}</Typography>
            )}
            {pdfUrl && (
              <Box component="iframe" key={pdfUrl} src={pdfUrl} title={target.filename} sx={{ border: 0, width: '100%', height: '100%' }} />
            )}
            {file && file.text !== null && (
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 3,
                  height: '100%',
                  overflow: 'auto',
                  fontFamily: 'var(--folio-mono)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {file.text}
              </Box>
            )}
            {file && !isPdf && file.text === null && (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                <Typography sx={{ color: 'var(--folio-muted)' }}>
                  La vista previa no está disponible para este formato. Este es el fragmento citado:
                </Typography>
                {target.highlight && (
                  <Typography
                    sx={{
                      fontFamily: 'var(--folio-serif)',
                      fontSize: 16,
                      lineHeight: 1.7,
                      borderLeft: '3px solid var(--folio-accent)',
                      pl: 2,
                    }}
                  >
                    {target.highlight}
                  </Typography>
                )}
                <Button variant="outlined" component="a" href={file.url} download={target.filename} startIcon={<DownloadRoundedIcon />}>
                  Descargar archivo
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  )
}
