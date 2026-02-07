import { describe, it, expect, vi, beforeEach } from "vitest"
import { z } from "zod"
import { safeParseWithLog, safeParseArrayWithLog } from "../validation"

vi.mock("loglevel", () => ({
  default: { warn: vi.fn() },
}))

import log from "loglevel"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("safeParseWithLog", () => {
  const schema = z.object({ id: z.string(), count: z.number() })

  it("returns parsed data when valid", () => {
    const data = { id: "abc", count: 42 }
    const result = safeParseWithLog(schema, data, "test")
    expect(result).toEqual(data)
    expect(log.warn).not.toHaveBeenCalled()
  })

  it("returns raw data and logs warning when invalid", () => {
    const data = { id: 123, count: "not-a-number" }
    const result = safeParseWithLog(schema, data, "test.invalid")
    expect(result).toEqual(data) // raw data returned as-is
    expect(log.warn).toHaveBeenCalledOnce()
    expect(log.warn).toHaveBeenCalledWith("[Validation] test.invalid:", expect.any(Array))
  })

  it("returns raw data when extra fields are present", () => {
    const data = { id: "abc", count: 1, extra: true }
    const result = safeParseWithLog(schema, data, "test.extra")
    expect(result).toEqual(data)
    // Zod strips extra fields in parse but safeParse still succeeds
    expect(log.warn).not.toHaveBeenCalled()
  })
})

describe("safeParseArrayWithLog", () => {
  const itemSchema = z.object({ name: z.string() })

  it("returns array when all items valid", () => {
    const data = [{ name: "a" }, { name: "b" }]
    const result = safeParseArrayWithLog(itemSchema, data, "test")
    expect(result).toEqual(data)
    expect(log.warn).not.toHaveBeenCalled()
  })

  it("logs per-item warnings but returns full array", () => {
    const data = [{ name: "valid" }, { name: 42 }, { name: "also-valid" }]
    const result = safeParseArrayWithLog(itemSchema, data, "test.array")
    expect(result).toHaveLength(3)
    expect(result).toEqual(data) // all items returned, even invalid
    expect(log.warn).toHaveBeenCalledOnce() // only item[1] warned
    expect(log.warn).toHaveBeenCalledWith("[Validation] test.array[1]:", expect.any(Array))
  })

  it("handles empty arrays", () => {
    const result = safeParseArrayWithLog(itemSchema, [], "test.empty")
    expect(result).toEqual([])
    expect(log.warn).not.toHaveBeenCalled()
  })
})
