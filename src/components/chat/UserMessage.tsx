import Box from '@mui/material/Box'
import { MessageActions } from './MessageActions'

export function UserMessage({ content }: { content: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        '&:hover .message-actions': { opacity: 1 },
      }}
    >
      <Box
        sx={{
          maxWidth: 'min(85%, 620px)',
          px: 2,
          py: 1.25,
          borderRadius: '18px',
          bgcolor: 'var(--folio-bubble)',
          fontSize: 15,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          animation: 'folio-rise 220ms ease-out',
          '@keyframes folio-rise': {
            from: { opacity: 0, transform: 'translateY(6px)' },
            to: { opacity: 1, transform: 'none' },
          },
        }}
      >
        {content}
      </Box>
      <Box className="message-actions" sx={{ mt: 0.5, opacity: 0, transition: 'opacity 150ms' }}>
        <MessageActions text={content} />
      </Box>
    </Box>
  )
}
