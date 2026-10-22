import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'

export function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme()
  const resolved = mode === 'system' ? systemMode : mode
  const isDark = resolved === 'dark'
  return (
    <Tooltip title={isDark ? 'Modo claro' : 'Modo oscuro'}>
      <IconButton onClick={() => setMode(isDark ? 'light' : 'dark')} aria-label="Cambiar tema">
        {isDark ? <LightModeOutlinedIcon sx={{ fontSize: 20 }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />}
      </IconButton>
    </Tooltip>
  )
}
