import { getApiClient } from "./client"
import { safeParseArrayWithLog, safeParseWithLog } from "@/lib/validation"
import { messageSchema } from "@/types/api.schemas"
import type { Message, PaginationParams } from "@/types/api"

type MessageStatus = "queued" | "sent" | "processing" | "abandoned"

export const courierApi = {
  listMessages: async (
    params?: PaginationParams & { status?: MessageStatus; recipient?: string }
  ): Promise<Message[]> => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (params?.page_size) searchParams.set("page_size", String(params.page_size))
    if (params?.page_token) searchParams.set("page_token", params.page_token)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.recipient) searchParams.set("recipient", params.recipient)

    const raw = await client
      .get("admin/courier/messages", {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<Message[]>()
    return safeParseArrayWithLog(messageSchema, raw, "courierApi.listMessages")
  },

  getMessage: async (id: string): Promise<Message> => {
    const client = getApiClient()
    const raw = await client.get(`admin/courier/messages/${id}`).json<Message>()
    return safeParseWithLog(messageSchema, raw, "courierApi.getMessage")
  },
}
