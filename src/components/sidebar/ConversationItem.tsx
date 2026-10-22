import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import type { Conversation } from '../../api/types'
import { useActiveStream } from '../../store/chatStreams'

interface ConversationItemProps {
  conversation: Conversation
  active: boolean
  onRename: (title: string) => void
  onDelete: () => void
  onNavigate: () => void
}

export function ConversationItem({ conversation, active, onRename, onDelete, onNavigate }: ConversationItemProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(conversation.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const stream = useActiveStream(conversation.id)
  const live = !!stream && !['stopped', 'error'].includes(stream.phase)

  useEffect(() => {
    if (!editing) setTitle(conversation.title)
  }, [conversation.title, editing])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = title.trim()
    if (trimmed && trimmed !== conversation.title) onRename(trimmed)
    else setTitle(conversation.title)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '10px',
        bgcolor: active ? 'var(--folio-hover)' : 'transparent',
        '&:hover': { bgcolor: 'var(--folio-hover)' },
        '&:hover .item-menu, & .item-menu.open': { opacity: 1 },
      }}
    >
      {editing ? (
        <InputBase
          inputRef={inputRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
            if (event.key === 'Escape') {
              setTitle(conversation.title)
              setEditing(false)
            }
          }}
          inputProps={{ maxLength: 200, 'aria-label': 'Nuevo título' }}
          sx={{
            width: '100%',
            px: 1.25,
            py: 0.6,
            fontSize: 13.5,
            borderRadius: '10px',
            outline: '2px solid var(--folio-accent)',
            bgcolor: 'var(--folio-surface)',
          }}
        />
      ) : (
        <Box
          component={Link}
          to={`/c/${conversation.id}`}
          onClick={onNavigate}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pl: 1.25,
            pr: 4.5,
            py: 0.9,
            color: active ? 'var(--folio-text)' : 'var(--folio-muted)',
            textDecoration: 'none',
            '&:hover': { color: 'var(--folio-text)' },
          }}
        >
          {live && (
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: 'var(--folio-accent)',
                flexShrink: 0,
                animation: 'folio-blink 1.2s ease-in-out infinite',
                '@keyframes folio-blink': { '50%': { opacity: 0.3 } },
              }}
            />
          )}
          <Typography noWrap sx={{ fontSize: 13.5, fontWeight: active ? 500 : 400 }}>
            {conversation.title}
          </Typography>
        </Box>
      )}

      {!editing && (
        <IconButton
          size="small"
          className={anchor ? 'item-menu open' : 'item-menu'}
          onClick={(event) => setAnchor(event.currentTarget)}
          aria-label="Opciones de la conversación"
          sx={{
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: { xs: 1, md: 0 },
            p: 0.5,
          }}
        >
          <MoreHorizRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}

      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { width: 190 } } }}>
        <MenuItem
          onClick={() => {
            setAnchor(null)
            setEditing(true)
          }}
        >
          <ListItemIcon>
            <DriveFileRenameOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          Renombrar
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null)
            onDelete()
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  )
}
