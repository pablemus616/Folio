import Box from '@mui/material/Box'

const KINDS: Record<string, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: '#D2553F' },
  docx: { label: 'DOC', color: '#3F6FD2' },
  txt: { label: 'TXT', color: '#6E6A62' },
  md: { label: 'MD', color: '#5C7F5E' },
  markdown: { label: 'MD', color: '#5C7F5E' },
  csv: { label: 'CSV', color: '#3E8E6E' },
  json: { label: 'JSON', color: '#A0702C' },
}

export function fileKind(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase() ?? ''
  return KINDS[extension] ?? { label: extension.toUpperCase().slice(0, 4) || 'FILE', color: '#6E6A62' }
}

export function FileIcon({ filename, size = 36 }: { filename: string; size?: number }) {
  const kind = fileKind(filename)
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '10px',
        bgcolor: kind.color,
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.27,
        fontWeight: 700,
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}
    >
      {kind.label}
    </Box>
  )
}
