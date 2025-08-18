import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"


export function formatTimeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
}