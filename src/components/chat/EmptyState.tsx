import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { SUGGESTIONS } from '../../config'
import { LogoMark } from '../common/Logo'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

interface EmptyStateProps {
  composer: ReactNode
  onSuggestion: (prompt: string) => void
}

export function EmptyState({ composer, onSuggestion }: EmptyStateProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        pb: { xs: 4, md: 10 },
        overflowY: 'auto',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 720 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.75,
            mb: 4,
            animation: 'folio-rise 400ms ease-out',
          }}
        >
          <LogoMark size={40} />
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--folio-serif)',
              fontWeight: 400,
              fontSize: { xs: 30, md: 40 },
              letterSpacing: '-0.02em',
              color: 'var(--folio-text)',
            }}
          >
            {greeting()}
          </Typography>
        </Box>

        {composer}

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
            mt: 2.5,
          }}
        >
          {SUGGESTIONS.map((suggestion) => (
            <ButtonBase
              key={suggestion.title}
              onClick={() => onSuggestion(suggestion.prompt)}
              sx={{
                px: 1.75,
                py: 0.9,
                borderRadius: '12px',
                border: '1px solid var(--folio-border)',
                fontSize: 13.5,
                color: 'var(--folio-muted)',
                transition: 'all 150ms',
                '&:hover': { bgcolor: 'var(--folio-hover)', color: 'var(--folio-text)', borderColor: 'var(--folio-border-strong)' },
              }}
            >
              {suggestion.title}
            </ButtonBase>
          ))}
        </Box>

        <Typography sx={{ textAlign: 'center', mt: 4, fontSize: 12.5, color: 'var(--folio-muted)' }}>
          Adjunta un PDF, Word o texto y pregúntale lo que quieras. Las respuestas citan las páginas de donde salen.
        </Typography>
      </Box>
    </Box>
  )
}
