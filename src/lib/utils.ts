import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
}

export function truncateId(id: string, length = 8): string {
  if (id.length <= length) return id
  return `${id.substring(0, length)}...`
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim())
}

export function matchesIdentitySearch(
  identity: { id: string; traits: Record<string, unknown> },
  query: string
): boolean {
  const q = query.toLowerCase()
  if (identity.id.toLowerCase().includes(q)) return true
  const traits = identity.traits ?? {}
  for (const key of ["email", "username", "name"] as const) {
    const val = traits[key]
    if (typeof val === "string" && val.toLowerCase().includes(q)) return true
  }
  return false
}
