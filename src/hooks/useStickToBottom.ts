import { useCallback, useEffect, useRef, useState } from 'react'

const THRESHOLD_PX = 120

export function useStickToBottom<T extends HTMLElement>(dependency: unknown) {
  const ref = useRef<T | null>(null)
  const stickRef = useRef(true)
  const [atBottom, setAtBottom] = useState(true)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const element = ref.current
    if (!element) return
    stickRef.current = true
    element.scrollTo({ top: element.scrollHeight, behavior })
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const onScroll = () => {
      const distance = element.scrollHeight - element.scrollTop - element.clientHeight
      const isNear = distance < THRESHOLD_PX
      stickRef.current = isNear
      setAtBottom(isNear)
    }
    element.addEventListener('scroll', onScroll, { passive: true })
    return () => element.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      if (stickRef.current) element.scrollTop = element.scrollHeight
    })
    Array.from(element.children).forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [dependency])

  return { ref, atBottom, scrollToBottom }
}
