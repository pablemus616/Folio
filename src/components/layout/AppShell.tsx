import { useState } from 'react'
import { Outlet } from 'react-router'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DocumentPreview } from '../documents/DocumentPreview'
import { PreviewContext, type PreviewTarget } from '../documents/previewContext'
import { Sidebar } from '../sidebar/Sidebar'
import { usePersistentState } from '../../store/preferences'

const SIDEBAR_WIDTH = 272

export interface ShellContext {
  openSidebar: () => void
  sidebarOpen: boolean
}

export function AppShell() {
  const isDesktop = useMediaQuery('(min-width:900px)', { noSsr: true })
  const [desktopOpen, setDesktopOpen] = usePersistentState('folio.sidebar-open', true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [preview, setPreview] = useState<PreviewTarget | null>(null)

  const sidebarOpen = isDesktop ? desktopOpen : mobileOpen
  const context: ShellContext = {
    openSidebar: () => (isDesktop ? setDesktopOpen(true) : setMobileOpen(true)),
    sidebarOpen,
  }

  const sidebar = (
    <Sidebar
      onClose={() => (isDesktop ? setDesktopOpen(false) : setMobileOpen(false))}
      onNavigate={() => !isDesktop && setMobileOpen(false)}
    />
  )

  return (
    <PreviewContext.Provider value={setPreview}>
      <Box sx={{ display: 'flex', height: '100dvh', bgcolor: 'var(--folio-bg)', overflow: 'hidden' }}>
        {isDesktop ? (
          <Box
            component="aside"
            sx={{
              width: desktopOpen ? SIDEBAR_WIDTH : 0,
              flexShrink: 0,
              overflow: 'hidden',
              transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
              borderRight: desktopOpen ? '1px solid var(--folio-border)' : 'none',
            }}
          >
            <Box sx={{ width: SIDEBAR_WIDTH, height: '100%' }}>{sidebar}</Box>
          </Box>
        ) : (
          <Drawer
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            slotProps={{ paper: { sx: { width: 'min(86vw, 320px)', border: 'none' } } }}
          >
            {sidebar}
          </Drawer>
        )}
        <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Outlet context={context} />
        </Box>
      </Box>
      <DocumentPreview target={preview} onClose={() => setPreview(null)} />
    </PreviewContext.Provider>
  )
}
