import { createContext, useContext } from 'react'

export interface PreviewTarget {
  documentId: string
  filename: string
  page?: number | null
  highlight?: string
}

export const PreviewContext = createContext<(target: PreviewTarget) => void>(() => undefined)

export function useOpenPreview() {
  return useContext(PreviewContext)
}
