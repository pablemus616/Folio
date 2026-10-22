import type { Conversation } from '../../api/types'

const DAY_MS = 24 * 60 * 60 * 1000

export interface ConversationGroup {
  label: string
  items: Conversation[]
}

export function groupConversations(conversations: Conversation[], now = new Date()): ConversationGroup[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const buckets: ConversationGroup[] = [
    { label: 'Hoy', items: [] },
    { label: 'Ayer', items: [] },
    { label: 'Últimos 7 días', items: [] },
    { label: 'Últimos 30 días', items: [] },
    { label: 'Anteriores', items: [] },
  ]
  for (const conversation of conversations) {
    const time = new Date(conversation.updated_at).getTime()
    const index =
      time >= startOfToday
        ? 0
        : time >= startOfToday - DAY_MS
          ? 1
          : time >= startOfToday - 7 * DAY_MS
            ? 2
            : time >= startOfToday - 30 * DAY_MS
              ? 3
              : 4
    buckets[index].items.push(conversation)
  }
  return buckets.filter((bucket) => bucket.items.length > 0)
}
