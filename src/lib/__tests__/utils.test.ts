import { describe, it, expect } from "vitest"
import {
  isUuid,
  matchesIdentitySearch,
  formatRelativeTime,
  truncateId,
  formatDate,
  cn,
} from "../utils"

describe("isUuid", () => {
  it("accepts valid v4 UUID", () => {
    expect(isUuid("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(true)
  })

  it("accepts UUID with uppercase", () => {
    expect(isUuid("A1B2C3D4-E5F6-7890-ABCD-EF1234567890")).toBe(true)
  })

  it("trims whitespace", () => {
    expect(isUuid("  a1b2c3d4-e5f6-7890-abcd-ef1234567890  ")).toBe(true)
  })

  it("rejects empty string", () => {
    expect(isUuid("")).toBe(false)
  })

  it("rejects non-UUID string", () => {
    expect(isUuid("not-a-uuid")).toBe(false)
  })

  it("rejects UUID missing a section", () => {
    expect(isUuid("a1b2c3d4-e5f6-7890-abcd")).toBe(false)
  })
})

describe("matchesIdentitySearch", () => {
  const identity = {
    id: "abc12345-0000-0000-0000-000000000000",
    traits: { email: "alice@example.com", username: "alice", name: "Alice Smith" },
  }

  it("matches on id (case-insensitive)", () => {
    expect(matchesIdentitySearch(identity, "ABC12")).toBe(true)
  })

  it("matches on email trait", () => {
    expect(matchesIdentitySearch(identity, "alice@")).toBe(true)
  })

  it("matches on username trait", () => {
    expect(matchesIdentitySearch(identity, "ALICE")).toBe(true)
  })

  it("matches on name trait", () => {
    expect(matchesIdentitySearch(identity, "smith")).toBe(true)
  })

  it("returns false for no match", () => {
    expect(matchesIdentitySearch(identity, "zzzzz")).toBe(false)
  })

  it("handles identity with empty traits", () => {
    expect(matchesIdentitySearch({ id: "test-id", traits: {} }, "test")).toBe(true)
  })
})

describe("formatRelativeTime", () => {
  it('returns "just now" for < 60s ago', () => {
    const now = new Date()
    expect(formatRelativeTime(now)).toBe("just now")
  })

  it('returns "Xm ago" for minutes', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago")
  })

  it('returns "Xh ago" for hours', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago")
  })

  it('returns "Xd ago" for days < 7', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago")
  })

  it("falls back to formatDate for > 7 days", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(twoWeeksAgo)
    // Should be a formatted date string, not "Xd ago"
    expect(result).not.toMatch(/d ago$/)
    expect(result).toMatch(/\d{4}/) // contains year
  })
})

describe("truncateId", () => {
  it("truncates long strings with ellipsis", () => {
    expect(truncateId("abcdefghijklmnop")).toBe("abcdefgh...")
  })

  it("returns short strings unchanged", () => {
    expect(truncateId("short")).toBe("short")
  })

  it("respects custom length", () => {
    expect(truncateId("abcdefghijklmnop", 4)).toBe("abcd...")
  })

  it("returns string at exact length without ellipsis", () => {
    expect(truncateId("12345678", 8)).toBe("12345678")
  })
})

describe("formatDate", () => {
  it("formats a date string to en-US locale", () => {
    const result = formatDate("2025-06-15T14:30:00Z")
    // Should contain month name, day, year, and time
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2025/)
  })

  it("accepts Date objects", () => {
    const result = formatDate(new Date("2025-01-01T00:00:00Z"))
    expect(result).toMatch(/2025/)
  })
})

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("p-4", "p-2")).toBe("p-2") // tailwind-merge deduplicates
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden")).toBe("base")
  })
})
