import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'

interface MessageActionsProps {
  text: string
  onRegenerate?: () => void
}

export function MessageActions({ text, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
        <IconButton size="small" onClick={copy} aria-label="Copiar mensaje">
          {copied ? <CheckRoundedIcon sx={{ fontSize: 17 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Tooltip>
      {onRegenerate && (
        <Tooltip title="Regenerar respuesta">
          <IconButton size="small" onClick={onRegenerate} aria-label="Regenerar respuesta">
            <ReplayRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </>
  )
}
