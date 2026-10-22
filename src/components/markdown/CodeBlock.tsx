import { isValidElement, useRef, useState, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'

function languageOf(children: ReactNode): string {
  if (!isValidElement<{ className?: string }>(children)) return ''
  const match = /language-([\w+#-]+)/.exec(children.props.className ?? '')
  return match ? match[1] : ''
}

export function CodeBlock({ children }: { children?: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const language = languageOf(children)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(preRef.current?.innerText ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Box
      sx={{
        my: 2,
        borderRadius: '12px',
        border: '1px solid var(--folio-border)',
        bgcolor: 'var(--folio-code-bg)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.75,
          py: 0.75,
          borderBottom: '1px solid var(--folio-border)',
          fontFamily: 'var(--folio-sans)',
          fontSize: 12,
          color: 'var(--folio-muted)',
        }}
      >
        <span>{language || 'código'}</span>
        <ButtonBase
          onClick={copy}
          sx={{
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            fontSize: 12,
            color: 'inherit',
            '&:hover': { bgcolor: 'var(--folio-hover)', color: 'var(--folio-text)' },
          }}
        >
          {copied ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
          {copied ? 'Copiado' : 'Copiar'}
        </ButtonBase>
      </Box>
      <Box
        component="pre"
        ref={preRef}
        sx={{
          m: 0,
          p: 2,
          overflowX: 'auto',
          fontFamily: 'var(--folio-mono)',
          fontSize: 13,
          lineHeight: 1.65,
          '& code': { fontFamily: 'inherit', background: 'none', p: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
