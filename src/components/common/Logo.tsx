import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { APP_NAME } from '../../config'

interface LogoMarkProps {
  size?: number
  pulsing?: boolean
}

export function LogoMark({ size = 28, pulsing = false }: LogoMarkProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'block',
        animation: pulsing ? 'folio-pulse 1.6s ease-in-out infinite' : 'none',
        '@keyframes folio-pulse': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
          '50%': { transform: 'scale(0.88) rotate(-8deg)', opacity: 0.75 },
        },
      }}
      aria-hidden
    >
      <rect width="64" height="64" rx="16" fill="var(--folio-accent)" />
      <path d="M20 15h17l9 9v25a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3V18a3 3 0 0 1 3-3z" fill="#FFF8F2" />
      <path d="M37 15v6a3 3 0 0 0 3 3h6" fill="#F2C9B4" />
      <path d="M32 29l2.2 5.3L39.5 36.5l-5.3 2.2L32 44l-2.2-5.3-5.3-2.2 5.3-2.2z" fill="var(--folio-accent)" />
    </Box>
  )
}

export function Logo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <LogoMark size={26} />
      <Typography sx={{ fontFamily: 'var(--folio-serif)', fontSize: 21, fontWeight: 500, letterSpacing: '-0.01em' }}>
        {APP_NAME}
      </Typography>
    </Box>
  )
}
