import { useState } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import type { ChatModel } from '../../api/types'

interface ModelPickerProps {
  models: ChatModel[]
  value: string
  onChange: (id: string) => void
}

export function ModelPicker({ models, value, onChange }: ModelPickerProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const current = models.find((model) => model.id === value) ?? models[0]
  if (!current) return null

  return (
    <>
      <ButtonBase
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{
          gap: 0.25,
          pl: 1.25,
          pr: 0.75,
          height: 34,
          borderRadius: '10px',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--folio-muted)',
          '&:hover': { bgcolor: 'var(--folio-hover)', color: 'var(--folio-text)' },
        }}
      >
        {current.name}
        <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
      </ButtonBase>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 290, mt: -1 } } }}
      >
        {models.map((model) => (
          <MenuItem
            key={model.id}
            selected={model.id === value}
            onClick={() => {
              onChange(model.id)
              setAnchor(null)
            }}
            sx={{ alignItems: 'flex-start', py: 1.1, gap: 1.5 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{model.name}</Typography>
              <Typography sx={{ fontSize: 12.5, color: 'var(--folio-muted)', whiteSpace: 'normal' }}>
                {model.description}
              </Typography>
            </Box>
            {model.id === value && <CheckRoundedIcon sx={{ fontSize: 18, color: 'var(--folio-accent)', mt: 0.25 }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
