import { useState } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Collapse from '@mui/material/Collapse'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded'
import { Markdown } from '../markdown/Markdown'

interface ThinkingBlockProps {
  thoughts: string
  active: boolean
  seconds?: number | null
}

export function ThinkingBlock({ thoughts, active, seconds }: ThinkingBlockProps) {
  const [open, setOpen] = useState(false)
  const label = active
    ? 'Pensando…'
    : seconds && seconds > 0
      ? `Razonó durante ${seconds} s`
      : 'Ver razonamiento'

  return (
    <Box sx={{ mb: 1.5 }}>
      <ButtonBase
        onClick={() => setOpen((value) => !value)}
        sx={{
          gap: 0.75,
          px: 1.25,
          py: 0.6,
          borderRadius: '10px',
          border: '1px solid var(--folio-border)',
          fontSize: 13,
          color: 'var(--folio-muted)',
          '&:hover': { bgcolor: 'var(--folio-hover)', color: 'var(--folio-text)' },
        }}
      >
        <PsychologyAltRoundedIcon sx={{ fontSize: 17 }} />
        <Box
          component="span"
          sx={
            active
              ? {
                  background:
                    'linear-gradient(90deg, var(--folio-muted) 0%, var(--folio-text) 50%, var(--folio-muted) 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  animation: 'folio-shimmer 1.8s linear infinite',
                  '@keyframes folio-shimmer': { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
                }
              : undefined
          }
        >
          {label}
        </Box>
        <ExpandMoreRoundedIcon
          sx={{ fontSize: 18, transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Box sx={{ mt: 1.25, pl: 1.75, borderLeft: '2px solid var(--folio-border)', maxHeight: 360, overflowY: 'auto' }}>
          <Markdown text={thoughts} variant="compact" />
        </Box>
      </Collapse>
    </Box>
  )
}
