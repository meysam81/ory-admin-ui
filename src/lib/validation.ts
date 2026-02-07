import type { z } from "zod"
import log from "loglevel"

/**
 * Validate data against a Zod schema. On failure, log a warning and return
 * the raw data as-is (trust-but-verify pattern).
 */
export function safeParseWithLog<T extends z.ZodType>(
  schema: T,
  data: unknown,
  context: string
): z.infer<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    log.warn(`[Validation] ${context}:`, result.error.issues)
  }
  return data as z.infer<T>
}

/**
 * Validate each element of an array individually so one bad item doesn't
 * mask others. Logs per-item warnings. Always returns the raw array.
 */
export function safeParseArrayWithLog<T extends z.ZodType>(
  itemSchema: T,
  data: unknown[],
  context: string
): z.infer<T>[] {
  data.forEach((item, index) => {
    const result = itemSchema.safeParse(item)
    if (!result.success) {
      log.warn(`[Validation] ${context}[${index}]:`, result.error.issues)
    }
  })
  return data as z.infer<T>[]
}
