import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cn, formatDate, formatRelativeTime, truncateId, copyToClipboard } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
  })

  it('deduplicates Tailwind classes', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles objects with boolean values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })
})

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const date = '2024-01-15T10:30:00Z'
    const formatted = formatDate(date)

    expect(formatted).toContain('2024')
    expect(formatted).toContain('Jan')
    expect(formatted).toContain('15')
  })

  it('formats Date object', () => {
    const date = new Date('2024-06-20T14:00:00Z')
    const formatted = formatDate(date)

    expect(formatted).toContain('2024')
    expect(formatted).toContain('Jun')
    expect(formatted).toContain('20')
  })

  it('includes time in output', () => {
    const date = '2024-01-15T10:30:00Z'
    const formatted = formatDate(date)

    // Should contain hour and minute (format depends on locale)
    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for recent times', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const date = new Date('2024-01-15T10:29:30Z') // 30 seconds ago
    expect(formatRelativeTime(date)).toBe('just now')
  })

  it('returns minutes ago', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const date = new Date('2024-01-15T10:25:00Z') // 5 minutes ago
    expect(formatRelativeTime(date)).toBe('5m ago')
  })

  it('returns hours ago', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const date = new Date('2024-01-15T07:30:00Z') // 3 hours ago
    expect(formatRelativeTime(date)).toBe('3h ago')
  })

  it('returns days ago', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const date = new Date('2024-01-12T10:30:00Z') // 3 days ago
    expect(formatRelativeTime(date)).toBe('3d ago')
  })

  it('returns formatted date for older times', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    const date = new Date('2024-01-01T10:30:00Z') // 14 days ago
    const formatted = formatRelativeTime(date)

    // Should fall back to formatDate
    expect(formatted).toContain('2024')
    expect(formatted).toContain('Jan')
  })

  it('handles string dates', () => {
    const now = new Date('2024-01-15T10:30:00Z')
    vi.setSystemTime(now)

    expect(formatRelativeTime('2024-01-15T10:25:00Z')).toBe('5m ago')
  })
})

describe('truncateId', () => {
  it('truncates UUID to default length', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    expect(truncateId(uuid)).toBe('550e8400...')
  })

  it('truncates to specified length', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    expect(truncateId(uuid, 12)).toBe('550e8400-e29...')
  })

  it('returns full string if shorter than limit', () => {
    expect(truncateId('short', 10)).toBe('short')
  })

  it('returns full string if equal to limit', () => {
    expect(truncateId('12345678', 8)).toBe('12345678')
  })

  it('handles empty string', () => {
    expect(truncateId('')).toBe('')
  })
})

describe('copyToClipboard', () => {
  it('copies text to clipboard', async () => {
    await copyToClipboard('test-value')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-value')
  })

  it('returns a promise', () => {
    const result = copyToClipboard('test')
    expect(result).toBeInstanceOf(Promise)
  })
})
