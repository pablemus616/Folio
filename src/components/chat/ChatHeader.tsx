import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import EditSquareIcon from '@mui/icons-material/EditSquare'
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined'
import { ThemeToggle } from '../common/ThemeToggle'

interface ChatHeaderProps {
  title: string | null
  conversationId?: string
  onOpenSidebar: () => void
  sidebarOpen: boolean
}

export function ChatHeader({ title, onOpenSidebar, sidebarOpen }: ChatHeaderProps) {
  const navigate = useNavigate()
  return (
    <Box
      component="header"
      sx={{
        height: 56,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: { xs: 1, md: 1.5 },
      }}
    >
      {!sidebarOpen && (
        <>
          <Tooltip title="Abrir barra lateral">
            <IconButton onClick={onOpenSidebar} aria-label="Abrir barra lateral">
              <ViewSidebarOutlinedIcon sx={{ fontSize: 20, transform: 'scaleX(-1)' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Nuevo chat">
            <IconButton onClick={() => navigate('/')} aria-label="Nuevo chat">
              <EditSquareIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>
        </>
      )}
      <Typography
        noWrap
        sx={{
          flex: 1,
          minWidth: 0,
          px: 1,
          fontSize: 14.5,
          fontWeight: 500,
          color: 'var(--folio-text)',
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        {title}
      </Typography>
      <ThemeToggle />
    </Box>
  )
}
