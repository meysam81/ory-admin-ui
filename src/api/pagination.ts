import type { PaginationMeta } from "@/types/api"

/**
 * Parse all pagination-related headers from Ory Kratos list responses.
 * Extracts `link` header (cursor tokens) and `x-total-count` (total items).
 */
export function parsePaginationHeaders(headers: Headers): PaginationMeta {
  const meta = parseLinkHeader(headers.get("link"))
  const totalCountRaw = headers.get("x-total-count")
  if (totalCountRaw !== null) {
    const parsed = Number(totalCountRaw)
    if (Number.isFinite(parsed)) meta.totalCount = parsed
  }
  return meta
}

/**
 * Parse RFC 5988 Link header from Ory Kratos responses.
 * Extracts page_token cursors for cursor-based pagination.
 *
 * Example header:
 *   <http://kratos/admin/identities?page_size=20&page_token=abc>; rel="next",
 *   <http://kratos/admin/identities?page_size=20&page_token=xyz>; rel="prev"
 */
export function parseLinkHeader(header: string | null): PaginationMeta {
  if (!header) return {}

  const meta: PaginationMeta = {}

  const parts = header.split(",")
  for (const part of parts) {
    const urlMatch = part.match(/<([^>]+)>/)
    const relMatch = part.match(/rel="([^"]+)"/)
    if (!urlMatch || !relMatch) continue

    const url = urlMatch[1]
    const rel = relMatch[1]

    try {
      const parsed = new URL(url)
      const token = parsed.searchParams.get("page_token")
      if (!token) continue

      if (rel === "next") meta.nextToken = token
      if (rel === "prev" || rel === "previous") meta.prevToken = token
    } catch {
      // URL may be relative — try extracting page_token from query string directly
      const tokenMatch = url.match(/[?&]page_token=([^&]+)/)
      if (!tokenMatch) continue

      const token = decodeURIComponent(tokenMatch[1])
      if (rel === "next") meta.nextToken = token
      if (rel === "prev" || rel === "previous") meta.prevToken = token
    }
  }

  return meta
}
