import { memo, useMemo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import Box from '@mui/material/Box'
import type { MessageSource } from '../../api/types'
import { Citation } from '../chat/Citation'
import { CodeBlock } from './CodeBlock'

const CITATION_PATTERN = /\[(\d{1,2})\](?!\()/g
const CITE_PREFIX = '#cite-'

function linkCitations(text: string, sources: MessageSource[]): string {
  if (sources.length === 0) return text
  const known = new Set(sources.map((source) => source.index))
  return text.replace(CITATION_PATTERN, (match, value: string) =>
    known.has(Number(value)) ? `[${value}](${CITE_PREFIX}${value})` : match,
  )
}

interface MarkdownProps {
  text: string
  sources?: MessageSource[]
  variant?: 'prose' | 'compact'
}

export const Markdown = memo(function Markdown({ text, sources = [], variant = 'prose' }: MarkdownProps) {
  const components = useMemo<Components>(
    () => ({
      pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
      a: ({ href, children }) => {
        if (href?.startsWith(CITE_PREFIX)) {
          const source = sources.find((item) => item.index === Number(href.slice(CITE_PREFIX.length)))
          if (source) return <Citation source={source} />
        }
        return (
          <a href={href} target="_blank" rel="noreferrer noopener">
            {children}
          </a>
        )
      },
      table: ({ children }) => (
        <Box className="table-wrap">
          <table>{children}</table>
        </Box>
      ),
    }),
    [sources],
  )

  const content = useMemo(() => linkCitations(text, sources), [text, sources])

  return (
    <Box className={variant === 'prose' ? 'folio-prose' : 'folio-prose folio-prose-compact'}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, { detect: false }]]} components={components}>
        {content}
      </ReactMarkdown>
    </Box>
  )
})
