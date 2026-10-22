import { useEffect, useRef, useState } from 'react'

const MIN_CHARS_PER_SECOND = 70
const CATCH_UP_FACTOR = 3.2

export function useSmoothText(target: string, animate: boolean): string {
  const [visible, setVisible] = useState(() => (animate ? '' : target))
  const targetRef = useRef(target)
  const lengthRef = useRef(animate ? 0 : target.length)

  targetRef.current = target

  useEffect(() => {
    if (!animate) {
      lengthRef.current = targetRef.current.length
      setVisible(targetRef.current)
      return
    }
    let frame = 0
    let last = performance.now()
    let carry = 0
    const tick = (now: number) => {
      const elapsed = Math.min(now - last, 100)
      last = now
      const goal = targetRef.current.length
      const remaining = goal - lengthRef.current
      if (remaining > 0) {
        const speed = Math.max(MIN_CHARS_PER_SECOND, remaining * CATCH_UP_FACTOR)
        carry += (speed * elapsed) / 1000
        const step = Math.floor(carry)
        if (step > 0) {
          carry -= step
          lengthRef.current = Math.min(goal, lengthRef.current + step)
          setVisible(targetRef.current.slice(0, lengthRef.current))
        }
      } else if (remaining < 0) {
        lengthRef.current = goal
        setVisible(targetRef.current)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animate])

  return animate ? visible : target
}
